-- GR Synergy Ventures · shared workspace with users, roles and change tracking.
-- Run after workspace-sync.sql (Supabase → SQL Editor). Additive only: nothing is dropped or renamed.
-- workspace_docs.owner_id now means "workspace id"; the existing workspace keeps the founder's user id,
-- so every record stays in place, and the founder becomes its Admin.

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'GR Synergy Ventures',
  created_at timestamptz not null default now()
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null check (role in ('admin','manager','staff','viewer')),
  modules text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,
  primary key (workspace_id, user_id)
);
create unique index if not exists workspace_members_one_workspace on public.workspace_members (user_id);
alter table public.workspace_docs add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- Existing workspace(s): id = the founder's user id; the founder becomes Admin.
insert into public.workspaces (id) select distinct owner_id from public.workspace_docs on conflict do nothing;
insert into public.workspace_members (workspace_id, user_id, email, role)
  select w.id, u.id, coalesce(u.email, ''), 'admin' from public.workspaces w join auth.users u on u.id = w.id
  on conflict do nothing;

-- Tables are read-only from the browser: row-level security with select policies only.
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create or replace function public.current_workspace() returns uuid
language sql stable security definer set search_path = public as $$
  select workspace_id from public.workspace_members where user_id = (select auth.uid()) and active limit 1
$$;
create or replace function public.current_role_in_workspace() returns text
language sql stable security definer set search_path = public as $$
  select role from public.workspace_members where user_id = (select auth.uid()) and active limit 1
$$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'workspace_docs' and policyname = 'Members read their workspace') then
    create policy "Members read their workspace" on public.workspace_docs for select to authenticated using (owner_id = (select public.current_workspace()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'Members see their workspace') then
    create policy "Members see their workspace" on public.workspaces for select to authenticated using (id = (select public.current_workspace()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'workspace_members' and policyname = 'Members see colleagues') then
    create policy "Members see colleagues" on public.workspace_members for select to authenticated using (workspace_id = (select public.current_workspace()));
  end if;
end $$;

-- Who am I? Marks the user as seen. The very first user of an empty project becomes Admin of a new workspace.
create or replace function public.workspace_me() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); m public.workspace_members;
begin
  if me is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select * into m from public.workspace_members where user_id = me;
  if not found then
    if exists (select 1 from public.workspaces) then return null; end if;
    insert into public.workspaces (id) values (me);
    insert into public.workspace_members (workspace_id, user_id, email, role)
      values (me, me, coalesce((select email from auth.users where id = me), ''), 'admin') returning * into m;
  end if;
  if not m.active then return jsonb_build_object('active', false); end if;
  update public.workspace_members set last_seen_at = now() where user_id = me;
  return jsonb_build_object('active', true, 'workspace_id', m.workspace_id, 'user_id', m.user_id, 'email', m.email, 'name', m.name, 'role', m.role, 'modules', to_jsonb(m.modules),
    'workspace_name', (select name from public.workspaces where id = m.workspace_id));
end $$;

-- Recent activity per member (Admins and Managers): last change and number of changes in 30 days.
create or replace function public.workspace_activity() returns table (user_id uuid, last_change timestamptz, changes_30d bigint)
language sql stable security definer set search_path = public as $$
  select d.updated_by, max(d.updated_at), count(*) filter (where d.updated_at > now() - interval '30 days')
  from public.workspace_docs d
  where d.owner_id = public.current_workspace() and public.current_role_in_workspace() in ('admin','manager')
    and d.updated_by is not null and d.collection not like '\_%'
  group by d.updated_by
$$;

-- Batch save with a version check per record. Viewers cannot save; company settings need Admin or Manager.
create or replace function public.workspace_push(p_changes jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid(); ws uuid; my_role text;
  c jsonb; applied jsonb := '[]'::jsonb; conflicts jsonb := '[]'::jsonb;
  v bigint; ts timestamptz; col text; doc text; base bigint; del boolean; body jsonb;
begin
  if me is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select workspace_id, role into ws, my_role from public.workspace_members where user_id = me and active;
  if ws is null then raise exception 'Your account does not have access to this workspace' using errcode = '42501'; end if;
  if my_role = 'viewer' then raise exception 'View-only accounts cannot save changes' using errcode = '42501'; end if;
  if jsonb_typeof(p_changes) <> 'array' then raise exception 'Changes must be a list'; end if;
  if jsonb_array_length(p_changes) > 1000 then raise exception 'Send at most 1000 changes at a time'; end if;
  for c in select value from jsonb_array_elements(p_changes) loop
    col := c->>'collection'; doc := c->>'id';
    base := nullif(c->>'base_version', '')::bigint;
    del := coalesce((c->>'deleted')::boolean, false);
    body := coalesce(c->'data', '{}'::jsonb);
    if col is null or col !~ '^_?[A-Za-z]{1,40}$' or doc is null or length(doc) not between 1 and 200 or jsonb_typeof(body) <> 'object' then
      raise exception 'Invalid change for %/%', col, doc;
    end if;
    if col = '_settings' and my_role not in ('admin','manager') then
      conflicts := conflicts || jsonb_build_object('collection', col, 'id', doc, 'reason', 'permission'); continue;
    end if;
    v := null;
    if base is null then
      insert into public.workspace_docs (owner_id, collection, id, data, deleted, updated_by)
      values (ws, col, doc, body, del, me)
      on conflict (owner_id, collection, id) do nothing
      returning version, updated_at into v, ts;
    else
      update public.workspace_docs
         set data = body, deleted = del, version = version + 1, updated_at = clock_timestamp(), updated_by = me
       where owner_id = ws and collection = col and id = doc and version = base
      returning version, updated_at into v, ts;
    end if;
    if v is null then conflicts := conflicts || jsonb_build_object('collection', col, 'id', doc);
    else applied := applied || jsonb_build_object('collection', col, 'id', doc, 'version', v, 'updated_at', ts); end if;
  end loop;
  return jsonb_build_object('applied', applied, 'conflicts', conflicts);
end $$;

grant select on public.workspaces, public.workspace_members to authenticated;
grant execute on function public.current_workspace(), public.current_role_in_workspace(), public.workspace_me(), public.workspace_activity(), public.workspace_push(jsonb) to authenticated;

revoke execute on function public.current_workspace(), public.current_role_in_workspace(), public.workspace_me(), public.workspace_activity() from public, anon;
grant execute on function public.current_workspace(), public.current_role_in_workspace(), public.workspace_me(), public.workspace_activity() to authenticated;

-- The manage-users Edge Function uses the secret (service_role) key; some projects do not grant it table access by default.
grant select, insert, update, delete on public.workspaces, public.workspace_members to service_role;
grant select on public.workspace_docs to service_role;

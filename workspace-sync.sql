-- GR Synergy Ventures · cloud workspace sync
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to run again: it only creates what is missing and replaces the function.
--
-- Every record the app keeps (quotes, jobs, stock, staff, …) is stored as one JSON document per row,
-- private to the signed-in user through row-level security. Writes go through workspace_push(), which
-- applies a batch of changes with a version check so two browsers cannot silently overwrite each other.

create table if not exists public.workspace_docs (
  owner_id   uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  collection text        not null check (collection ~ '^_?[A-Za-z]{1,40}$'),
  id         text        not null check (length(id) between 1 and 200),
  data       jsonb       not null check (jsonb_typeof(data) = 'object'),
  deleted    boolean     not null default false,
  version    bigint      not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, collection, id)
);
create index if not exists workspace_docs_changes on public.workspace_docs (owner_id, updated_at);

alter table public.workspace_docs enable row level security;
drop policy if exists "Owners read their workspace" on public.workspace_docs;
create policy "Owners read their workspace" on public.workspace_docs
  for select to authenticated using (owner_id = (select auth.uid()));

-- Reads only from the client; all writes go through workspace_push().
revoke all on public.workspace_docs from anon, authenticated;
grant select on public.workspace_docs to authenticated;

-- p_changes: [{collection, id, data, deleted, base_version}] (base_version null = new document).
-- Returns {applied:[{collection,id,version,updated_at}], conflicts:[{collection,id}]}.
create or replace function public.workspace_push(p_changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  c jsonb;
  applied jsonb := '[]'::jsonb;
  conflicts jsonb := '[]'::jsonb;
  v bigint;
  ts timestamptz;
  col text; doc text; base bigint; del boolean; body jsonb;
begin
  if me is null then raise exception 'Sign in first' using errcode = '28000'; end if;
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
    v := null;
    if base is null then
      insert into workspace_docs (owner_id, collection, id, data, deleted)
      values (me, col, doc, body, del)
      on conflict (owner_id, collection, id) do nothing
      returning version, updated_at into v, ts;
    else
      update workspace_docs
         set data = body, deleted = del, version = version + 1, updated_at = clock_timestamp()
       where owner_id = me and collection = col and id = doc and version = base
      returning version, updated_at into v, ts;
    end if;
    if v is null then
      conflicts := conflicts || jsonb_build_object('collection', col, 'id', doc);
    else
      applied := applied || jsonb_build_object('collection', col, 'id', doc, 'version', v, 'updated_at', ts);
    end if;
  end loop;
  return jsonb_build_object('applied', applied, 'conflicts', conflicts);
end;
$$;

revoke all on function public.workspace_push(jsonb) from public, anon;
grant execute on function public.workspace_push(jsonb) to authenticated;

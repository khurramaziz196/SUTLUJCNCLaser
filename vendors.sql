-- Apply once to an existing Sutluj database. Fresh setups include this in schema.sql.
create table public.vendors (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 name text not null check(length(trim(name)) between 1 and 150),
 contact text not null default '' check(length(contact)<=150),
 phone text not null default '' check(length(phone)<=60),
 email text not null default '' check(length(email)<=254),
 address text not null default '' check(length(address)<=1000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index vendors_owner_name on public.vendors(owner_id,lower(trim(name)));
alter table public.vendors enable row level security;
revoke all on public.vendors from anon;
grant select,insert,update,delete on public.vendors to authenticated;
create policy "Owners manage their vendors" on public.vendors for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create function public.touch_vendor() returns trigger language plpgsql set search_path=public as $$
begin
 if new.owner_id<>old.owner_id then raise exception 'Vendor owner cannot change'; end if;
 new.created_at=old.created_at;
 new.updated_at=clock_timestamp(); return new;
end $$;
create trigger touch_vendor before update on public.vendors for each row execute function public.touch_vendor();
-- Names in business_records are historical snapshots, not cascading references.

-- Apply once to an existing Sutluj database. Fresh setups include this in schema.sql.
create table public.customers (
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
create unique index customers_owner_name on public.customers(owner_id,lower(trim(name)));
alter table public.customers enable row level security;
revoke all on public.customers from anon;
grant select,insert,update,delete on public.customers to authenticated;
create policy "Owners manage their customers" on public.customers for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create function public.touch_customer() returns trigger language plpgsql set search_path=public as $$
begin
 if new.owner_id<>old.owner_id then raise exception 'Customer owner cannot change'; end if;
 new.created_at=old.created_at;
 new.updated_at=clock_timestamp(); return new;
end $$;
create trigger touch_customer before update on public.customers for each row execute function public.touch_customer();
-- Names in business_records are historical snapshots, not cascading references.

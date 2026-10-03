-- Apply after invoices.sql; existing invoices remain accessible.
create table public.work_orders (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 quote_id uuid not null, quote_reference text not null, reference text not null,
 party text not null, quote_snapshot jsonb not null,
 design_status text not null default 'Pending' check(design_status in ('Pending','In progress','Ready','Not required')),
 material_status text not null default 'Pending' check(material_status in ('Pending','Ready')),
 cutting_status text not null default 'Pending' check(cutting_status in ('Pending','In progress','Done')),
 status text not null default 'Open' check(status in ('Open','In progress','Completed')),
 design_reference text not null default '' check(length(design_reference)<=500),
 material_owner text not null default 'Business' check(material_owner in ('Business','Customer')),
 material_used text not null default '' check(length(material_used)<=4000),
 cutting_minutes numeric(12,2) not null default 0 check(cutting_minutes between 0 and 1000000),
 notes text not null default '' check(length(notes)<=4000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(owner_id,quote_id),unique(owner_id,reference),
 check(status<>'Completed' or (design_status in ('Ready','Not required') and material_status='Ready' and cutting_status='Done' and length(trim(material_used))>0))
);
alter table public.work_orders enable row level security;
create policy work_orders_read on public.work_orders for select to authenticated using(owner_id=auth.uid());
create policy work_orders_update on public.work_orders for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
revoke all on public.work_orders from anon,authenticated;
grant select on public.work_orders to authenticated;
grant update(design_status,material_status,cutting_status,status,design_reference,material_owner,material_used,cutting_minutes,notes) on public.work_orders to authenticated;
create function public.validate_work_order() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if old.status='Completed' then raise exception 'Completed jobs cannot be changed'; end if;
 new.updated_at=clock_timestamp(); return new;
end $$;
create trigger validate_work_order before update on public.work_orders for each row execute function public.validate_work_order();
create function public.start_work_order(p_quote uuid,p_version timestamptz) returns public.work_orders language plpgsql security definer set search_path=public,pg_temp as $$
declare q public.business_records; job public.work_orders;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into q from public.business_records where id=p_quote and owner_id=auth.uid() and kind='quote' for update;
 if not found then raise exception 'Quote not found'; end if;
 select * into job from public.work_orders where quote_id=p_quote and owner_id=auth.uid();
 if found then return job; end if;
 if q.status<>'Accepted' or p_version is null or q.updated_at<>p_version then raise exception 'Save an accepted quote and refresh before starting a job'; end if;
 insert into public.work_orders(owner_id,quote_id,quote_reference,reference,party,quote_snapshot)
 values(auth.uid(),q.id,q.reference,'JOB-'||extract(year from current_date)::text||'-'||upper(gen_random_uuid()::text),q.party,to_jsonb(q)) returning * into job;
 return job;
end $$;
revoke all on function public.start_work_order(uuid,timestamptz) from public,anon;
grant execute on function public.start_work_order(uuid,timestamptz) to authenticated;
-- Replace direct quote billing with completed-job billing; snapshot survives quote edits/deletion.
create or replace function public.issue_quote_invoice(p_quote uuid,p_version timestamptz,p_date date,p_due date)
returns public.invoices language plpgsql security definer set search_path=public,pg_temp as $$
declare job public.work_orders; q jsonb; result public.invoices;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into job from public.work_orders where quote_id=p_quote and owner_id=auth.uid() for update;
 if not found or job.status<>'Completed' then raise exception 'Complete the work order before invoicing'; end if;
 select * into result from public.invoices where owner_id=auth.uid() and quote_id=p_quote;
 if found then return result; end if;
 q=job.quote_snapshot;
 if p_date is null or p_due is null or p_due<p_date or (q->>'amount')::numeric<=0 then raise exception 'Check invoice dates and total'; end if;
 insert into public.invoices(owner_id,quote_id,quote_reference,reference,party,description,date,due_date,amount,tax,lines,notes)
 values(auth.uid(),job.quote_id,job.quote_reference,'INV-'||upper(gen_random_uuid()::text),job.party,q->>'description',p_date,p_due,(q->>'amount')::numeric,(q->>'tax')::numeric,q->'lines',q->>'notes') returning * into result;
 return result;
end $$;

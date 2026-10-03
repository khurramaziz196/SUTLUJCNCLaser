-- Run after the existing workspace schema. Invoice snapshots and receipts are immutable.
create table public.invoices (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 quote_id uuid not null, -- snapshot survives removal of the original quote
 quote_reference text not null,
 reference text not null,
 party text not null,
 description text not null,
 date date not null,
 due_date date not null check(due_date>=date),
 amount numeric(14,2) not null check(amount>0 and amount<=1000000000),
 tax numeric(5,2) not null,
 lines jsonb not null,
 notes text not null default '',
 created_at timestamptz not null default now(),
 unique(owner_id,quote_id), unique(owner_id,reference)
);
create table public.invoice_payments (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 invoice_id uuid not null references public.invoices(id),
 amount numeric(14,2) not null check(amount>0),
 date date not null,
 method text not null check(method in ('Business Bank Account','Cash on Hand','Petty Cash')),
 reference text not null default '' check(length(reference)<=150),
 created_at timestamptz not null default now()
);
create index invoice_payments_invoice on public.invoice_payments(invoice_id);
alter table public.invoices enable row level security;
alter table public.invoice_payments enable row level security;
create policy invoices_owner_read on public.invoices for select to authenticated using(owner_id=auth.uid());
create policy invoice_payments_owner_read on public.invoice_payments for select to authenticated using(owner_id=auth.uid());
revoke all on public.invoices,public.invoice_payments from anon,authenticated;
grant select on public.invoices,public.invoice_payments to authenticated;

create function public.issue_quote_invoice(p_quote uuid,p_version timestamptz,p_date date,p_due date)
returns public.invoices language plpgsql security definer set search_path=public,pg_temp as $$
declare q public.business_records; result public.invoices;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into q from public.business_records where id=p_quote and owner_id=auth.uid() and kind='quote' for update;
 if not found then raise exception 'Quote not found'; end if;
 select * into result from public.invoices where owner_id=auth.uid() and quote_id=p_quote;
 if found then return result; end if;
 if p_version is null or q.updated_at<>p_version then raise exception 'Quote changed. Refresh before issuing an invoice.'; end if;
 if p_date is null or p_due is null or p_due<p_date or q.amount<=0 then raise exception 'Check invoice dates and total'; end if;
 insert into public.invoices(owner_id,quote_id,quote_reference,reference,party,description,date,due_date,amount,tax,lines,notes)
 values(auth.uid(),q.id,q.reference,'INV-'||upper(gen_random_uuid()::text),q.party,q.description,p_date,p_due,q.amount,q.tax,q.lines,q.notes)
 returning * into result;
 return result;
end $$;

create function public.record_invoice_payment(p_id uuid,p_invoice uuid,p_amount numeric,p_date date,p_method text,p_reference text)
returns public.invoice_payments language plpgsql security definer set search_path=public,pg_temp as $$
declare inv public.invoices; receipt public.invoice_payments; paid numeric;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into inv from public.invoices where id=p_invoice and owner_id=auth.uid() for update;
 if not found then raise exception 'Invoice not found'; end if;
 select * into receipt from public.invoice_payments where id=p_id and owner_id=auth.uid();
 if found then
  if receipt.invoice_id<>p_invoice or receipt.amount is distinct from p_amount or receipt.date is distinct from p_date or receipt.method is distinct from p_method or receipt.reference is distinct from p_reference then raise exception 'This receipt request was already used. Reopen the invoice.'; end if;
  return receipt;
 end if;
 if p_amount is null or p_amount<=0 or p_amount<>round(p_amount,2) or p_amount>1000000000 then raise exception 'Enter a valid positive payment'; end if;
 if p_date is null or p_date<inv.date or p_date>current_date then raise exception 'Check payment date'; end if;
 select coalesce(sum(amount),0) into paid from public.invoice_payments where invoice_id=inv.id;
 if p_amount>inv.amount-paid then raise exception 'Payment exceeds the current outstanding balance. Refresh the invoice.'; end if;
 insert into public.invoice_payments(id,owner_id,invoice_id,amount,date,method,reference)
 values(p_id,auth.uid(),inv.id,p_amount,p_date,p_method,p_reference) returning * into receipt;
 return receipt;
end $$;
revoke all on function public.issue_quote_invoice(uuid,timestamptz,date,date) from public,anon;
revoke all on function public.record_invoice_payment(uuid,uuid,numeric,date,text,text) from public,anon;
grant execute on function public.issue_quote_invoice(uuid,timestamptz,date,date) to authenticated;
grant execute on function public.record_invoice_payment(uuid,uuid,numeric,date,text,text) to authenticated;

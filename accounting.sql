-- Apply after work-orders.sql. Posted journals are immutable; corrections use reversal/adjustment.
create table public.journal_entries (
 id uuid primary key, owner_id uuid not null references auth.users(id), date date not null,
 description text not null check(length(trim(description)) between 1 and 520),
 source_kind text not null check(source_kind in ('manual','invoice','payment','expense','reversal')),
 source_id uuid, reversal_of uuid references public.journal_entries(id),
 lines jsonb not null check(jsonb_typeof(lines)='array'),created_at timestamptz not null default now(),
 unique(owner_id,source_kind,source_id),unique(reversal_of)
);
alter table public.journal_entries enable row level security;
create policy journal_owner_read on public.journal_entries for select to authenticated using(owner_id=auth.uid());
revoke all on public.journal_entries from anon,authenticated;
grant select on public.journal_entries to authenticated;
create function public.post_journal(p_id uuid,p_date date,p_description text,p_lines jsonb,p_kind text,p_source uuid,p_account text,p_offset text)
returns public.journal_entries language plpgsql security definer set search_path=public,pg_temp as $$
declare result public.journal_entries; original public.journal_entries; inv public.invoices; receipt public.invoice_payments; expense public.business_records;
 entries jsonb; ln jsonb; dr numeric; cr numeric; debit_total numeric=0; credit_total numeric=0; net numeric; tax_amount numeric; cash_code text; posting_date date; memo text;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 -- Serialize requests for an owner so retries, source posting and reversals cannot race.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into result from public.journal_entries where id=p_id and owner_id=auth.uid();
 if found then return result; end if;
 if p_kind<>'manual' then
  select * into result from public.journal_entries where owner_id=auth.uid() and source_kind=p_kind and source_id=p_source;
  if found then return result; end if;
 end if;
 posting_date=p_date;memo=trim(p_description);
 if p_kind='manual' then
  if p_source is not null then raise exception 'Manual journals cannot link source records'; end if;
  entries=p_lines;
 elsif p_kind='invoice' then
  select * into inv from public.invoices where id=p_source and owner_id=auth.uid();
  if not found then raise exception 'Invoice not found'; end if;
  if not exists(select 1 from public.chart_of_accounts where code=p_account and account_type='Revenue' and is_posting) then raise exception 'Choose a revenue account'; end if;
  select sum(round((value->>'quantity')::numeric*(value->>'rate')::numeric,2)) into net from jsonb_array_elements(inv.lines);
  tax_amount=inv.amount-net;
  if tax_amount<0 then raise exception 'Invoice amount inconsistent'; end if;
  entries=jsonb_build_array(jsonb_build_object('account','1101','debit',inv.amount,'credit',0),jsonb_build_object('account',p_account,'debit',0,'credit',net));
  if tax_amount>0 then entries=entries||jsonb_build_array(jsonb_build_object('account','2202','debit',0,'credit',tax_amount)); end if;
  posting_date=inv.date;memo=inv.reference;
 elsif p_kind='payment' then
  select * into receipt from public.invoice_payments where id=p_source and owner_id=auth.uid();
  if not found then raise exception 'Receipt not found'; end if;
  cash_code=case receipt.method when 'Business Bank Account' then '1002' when 'Cash on Hand' then '1001' when 'Petty Cash' then '1003' end;
  entries=jsonb_build_array(jsonb_build_object('account',cash_code,'debit',receipt.amount,'credit',0),jsonb_build_object('account','1101','debit',0,'credit',receipt.amount));
  posting_date=receipt.date;memo='Receipt: '||coalesce(nullif(receipt.reference,''),receipt.id::text);
 elsif p_kind='expense' then
  select * into expense from public.business_records where id=p_source and owner_id=auth.uid() and kind='expense' for update;
  if not found or expense.account_code is null then raise exception 'Classify the expense before posting'; end if;
  -- Check the reviewed source has not changed since the user saw it.
  entries=jsonb_build_array(jsonb_build_object('account',expense.account_code,'debit',expense.amount,'credit',0),jsonb_build_object('account',p_offset,'debit',0,'credit',expense.amount));
  if p_lines is distinct from entries or p_date<>expense.date then raise exception 'Expense changed. Refresh and review the posting again'; end if;
  if p_offset is null or (expense.status='Paid' and p_offset not in ('1001','1002','1003')) or (expense.status='Pending' and p_offset<>'2004') then raise exception 'Choose an appropriate cash or payable account'; end if;
  posting_date=expense.date;memo=expense.reference;
 elsif p_kind='reversal' then
  select * into original from public.journal_entries where id=p_source and owner_id=auth.uid();
  if not found or original.source_kind='reversal' then raise exception 'Original journal not found or already a reversal'; end if;
  if p_date<original.date then raise exception 'Reversal cannot predate the original journal'; end if;
  select jsonb_agg(jsonb_build_object('account',value->>'account','debit',(value->>'credit')::numeric,'credit',(value->>'debit')::numeric)) into entries from jsonb_array_elements(original.lines);
  memo='Reversal: '||original.description;
 else raise exception 'Unsupported journal source'; end if;
 if posting_date is null or memo is null or length(trim(memo))=0 then raise exception 'Date and description are required'; end if;
 if entries is null or jsonb_typeof(entries)<>'array' or jsonb_array_length(entries)<2 or jsonb_array_length(entries)>100 then raise exception 'Use 2 to 100 journal lines'; end if;
 for ln in select value from jsonb_array_elements(entries) loop
  if not exists(select 1 from public.chart_of_accounts where code=ln->>'account' and is_posting) then raise exception 'Invalid posting account'; end if;
  if jsonb_typeof(ln->'debit') is distinct from 'number' or jsonb_typeof(ln->'credit') is distinct from 'number' then raise exception 'Debit and credit must be numeric'; end if;
  dr=(ln->>'debit')::numeric;cr=(ln->>'credit')::numeric;
  if dr<0 or cr<0 or dr>1000000000 or cr>1000000000 or dr<>round(dr,2) or cr<>round(cr,2) or ((dr>0)=(cr>0)) then raise exception 'Each line requires either a positive debit or a positive credit'; end if;
  debit_total=debit_total+dr;credit_total=credit_total+cr;
 end loop;
 if debit_total<>credit_total then raise exception 'Debits and credits must balance'; end if;
 insert into public.journal_entries(id,owner_id,date,description,source_kind,source_id,reversal_of,lines)
 values(p_id,auth.uid(),posting_date,memo,p_kind,p_source,case when p_kind='reversal' then p_source else null end,entries) returning * into result;
 return result;
end $$;
revoke all on function public.post_journal(uuid,date,text,jsonb,text,uuid,text,text) from public,anon;
grant execute on function public.post_journal(uuid,date,text,jsonb,text,uuid,text,text) to authenticated;
-- Stop operational edits from making posted expense entries inconsistent.
create function public.protect_posted_expense() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.journal_entries where source_kind='expense' and source_id=old.id and owner_id=old.owner_id) then raise exception 'This expense is posted. Use journal reversal/adjustment to correct it.'; end if;
 return new;
end $$;
create trigger protect_posted_expense before update on public.business_records for each row when (old.kind='expense') execute function public.protect_posted_expense();

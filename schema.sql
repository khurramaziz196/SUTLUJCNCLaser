-- Sutluj CNC Laser: run once in your new Supabase project's SQL Editor.
-- Every record is private to its authenticated owner. Do not disable RLS.
create table public.business_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 kind text not null check (kind in ('enquiry','quote','purchase','expense','cash')),
 reference text not null,
 party text not null check (length(trim(party)) between 1 and 150),
 description text not null check (length(trim(description)) between 1 and 500),
 date date not null default current_date,
 status text not null,
 category text not null default '',
 amount numeric(14,2) not null default 0 check(amount between 0 and 1000000000),
 tax numeric(5,2) not null default 0 check(tax between 0 and 100),
 lines jsonb not null default '[]'::jsonb check(jsonb_typeof(lines)='array'),
 notes text not null default '' check(length(notes)<=4000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_id,reference),
 check ((kind='enquiry' and status in ('New','Quoted','Closed')) or
 (kind='quote' and status in ('Draft','Sent','Accepted','Declined')) or
 (kind='purchase' and status in ('Draft','Ordered','Received','Cancelled')) or
 (kind='expense' and status in ('Pending','Paid')) or (kind='cash' and status='Posted')),
 check ((kind='expense' and category in ('Capital expense','Operating expense','General expense')) or
 (kind='cash' and category in ('Cash in','Cash out')) or
 (kind in ('enquiry','quote','purchase') and category=''))
);
create index business_records_owner_created on public.business_records(owner_id,created_at desc);
alter table public.business_records enable row level security;
revoke all on public.business_records from anon;
grant select,insert,update on public.business_records to authenticated;
create policy "Owners read their records" on public.business_records for select to authenticated using ((select auth.uid())=owner_id);
create policy "Owners insert their records" on public.business_records for insert to authenticated with check ((select auth.uid())=owner_id);
create policy "Owners edit their records" on public.business_records for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create function public.validate_business_record() returns trigger language plpgsql set search_path=public as $$
declare item jsonb; subtotal numeric := 0; quantity numeric; rate numeric;
begin
 if tg_op='UPDATE' then
  if new.owner_id<>old.owner_id or new.kind<>old.kind or new.reference<>old.reference then raise exception 'Record identity cannot be changed'; end if;
  new.created_at=old.created_at;
 end if;
 if new.kind in ('quote','purchase') then
  if jsonb_array_length(new.lines)<1 then raise exception 'At least one line item is required'; end if;
  for item in select * from jsonb_array_elements(new.lines) loop
   if item->>'description' is null or length(trim(item->>'description'))=0 then raise exception 'Item description required'; end if;
   quantity=(item->>'quantity')::numeric; rate=(item->>'rate')::numeric;
   if quantity is null or rate is null or quantity<=0 or quantity>1000000 or rate<0 or rate>1000000000 then raise exception 'Invalid quantity or rate'; end if;
   subtotal=subtotal+round(quantity*rate,2);
  end loop;
  new.amount=subtotal+round(subtotal*new.tax/100,2);
 elsif new.kind='enquiry' then new.amount=0;
 elsif new.amount<=0 then raise exception 'Amount must be positive';
 end if;
 new.updated_at=clock_timestamp(); return new;
end $$;
create trigger validate_business_record before insert or update on public.business_records for each row execute function public.validate_business_record();
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
-- Run once for an existing project; included in schema.sql for fresh projects.
-- Only the authenticated owner can delete sales and procurement records.
grant delete on public.business_records to authenticated;
create policy "Owners delete sales and procurement records"
 on public.business_records for delete to authenticated
 using ((select auth.uid())=owner_id and kind in ('enquiry','quote','purchase'));

-- Apply once to existing projects. Included in schema.sql for new projects.
create table public.chart_of_accounts (
 code text primary key,
 name text not null,
 account_type text not null,
 parent_code text references public.chart_of_accounts(code),
 is_posting boolean not null
);
alter table public.chart_of_accounts enable row level security;
revoke all on public.chart_of_accounts from anon, authenticated;
grant select on public.chart_of_accounts to authenticated;
create policy "Authenticated users read account definitions" on public.chart_of_accounts for select to authenticated using (true);
insert into public.chart_of_accounts(code,name,account_type,parent_code,is_posting) values
('1000','Cash & Bank','Asset',null,false),
('1001','Cash on Hand','Asset','1000',true),
('1002','Business Bank Account','Asset','1000',true),
('1003','Petty Cash','Asset','1000',true),
('1100','Accounts Receivable','Asset',null,false),
('1101','Customer Receivables','Asset','1100',true),
('1200','Inventory / Materials','Asset',null,false),
('1201','Raw Material - Mild Steel','Asset','1200',true),
('1202','Raw Material - Stainless Steel','Asset','1200',true),
('1203','Raw Material - Aluminium','Asset','1200',true),
('1204','Work in Progress','Asset','1200',true),
('1205','Finished Goods','Asset','1200',true),
('1300','Fixed Assets','Asset',null,false),
('1301','CNC Laser Machine','Asset','1300',true),
('1302','Air Compressor','Asset','1300',true),
('1303','Chiller','Asset','1300',true),
('1304','Gas System','Asset','1300',true),
('1305','Material Handling Equipment','Asset','1300',true),
('1306','Computers / CAD Workstations','Asset','1300',true),
('1307','Workshop Tools','Asset','1300',true),
('1308','Furniture','Asset','1300',true),
('1400','Accumulated Depreciation','Contra asset',null,false),
('1401','Laser Machine Depreciation','Contra asset','1400',true),
('1402','Equipment Depreciation','Contra asset','1400',true),
('1403','Vehicle Depreciation','Contra asset','1400',true),
('1404','Computer Depreciation','Contra asset','1400',true),
('2000','Accounts Payable','Liability',null,false),
('2001','Steel Suppliers','Liability','2000',true),
('2002','Gas Suppliers','Liability','2000',true),
('2003','Consumable Suppliers','Liability','2000',true),
('2004','Service Contractors','Liability','2000',true),
('2100','Customer Advances','Liability',null,false),
('2101','Customer Advances / Deposits','Liability','2100',true),
('2200','VAT / Tax Control','Tax control',null,false),
('2201','VAT Input','Tax control','2200',true),
('2202','VAT Output','Tax control','2200',true),
('2203','VAT Payable / Receivable','Tax control','2200',true),
('3000','Owner Capital','Equity',null,false),
('3001','Owner Capital Contributions','Equity','3000',true),
('3002','Owner Drawings','Equity','3000',true),
('3003','Retained Earnings','Equity','3000',true),
('4000','Laser Cutting Sales','Revenue',null,false),
('4001','Laser Cutting Revenue','Revenue','4000',true),
('4100','Design & Fabrication Sales','Revenue',null,false),
('4101','Design / CAD Charges','Revenue','4100',true),
('4102','Fabrication / Bending Charges','Revenue','4100',true),
('4200','Material Sales','Revenue',null,false),
('4201','Material Supply Revenue','Revenue','4200',true),
('4300','Other Income','Revenue',null,false),
('4301','Delivery Revenue','Revenue','4300',true),
('4302','Scrap Sales','Revenue','4300',true),
('4303','Gain on Asset Sale','Revenue','4300',true),
('4304','Other Income','Revenue','4300',true),
('5000','Material Cost','Direct cost',null,false),
('5001','Material Consumed on Jobs','Direct cost','5000',true),
('5100','Job Consumables','Direct cost',null,false),
('5101','Assist Gas - Oxygen','Direct cost','5100',true),
('5102','Assist Gas - Nitrogen','Direct cost','5100',true),
('5103','Nozzles / Lenses','Direct cost','5100',true),
('5104','Other Direct Consumables','Direct cost','5100',true),
('5200','Direct Job Costs','Direct cost',null,false),
('5201','Direct Labour','Direct cost','5200',true),
('5202','Outsourced Bending / Fabrication','Direct cost','5200',true),
('5203','Job-Specific Transport','Direct cost','5200',true),
('6000','Workshop Expenses','Expense',null,false),
('6001','Workshop Rent','Expense','6000',true),
('6002','Electricity','Expense','6000',true),
('6003','Machine Maintenance','Expense','6000',true),
('6004','Spare Parts','Expense','6000',true),
('6005','PPE & Safety Equipment','Expense','6000',true),
('6006','Cleaning','Expense','6000',true),
('6007','Insurance','Expense','6000',true),
('6100','Salaries & Staff Costs','Expense',null,false),
('6101','Administration Salaries','Expense','6100',true),
('6102','Overtime','Expense','6100',true),
('6103','Other Staff Costs','Expense','6100',true),
('6200','Office & Admin Expenses','Expense',null,false),
('6201','Internet / Telephone','Expense','6200',true),
('6202','Software / CAD Subscription','Expense','6200',true),
('6203','Printing / Stationery','Expense','6200',true),
('6204','Accounting / Professional Fees','Expense','6200',true),
('6205','Advertising / Marketing','Expense','6200',true),
('6206','Sales Commission','Expense','6200',true),
('6207','Customer Entertainment','Expense','6200',true),
('6208','Other Government Fees','Expense','6200',true),
('6209','Other Administration','Expense','6200',true),
('6300','Vehicle & Delivery Expenses','Expense',null,false),
('6301','Fuel','Expense','6300',true),
('6302','Vehicle Repairs','Expense','6300',true),
('6303','Courier / Delivery','Expense','6300',true),
('6400','Bank & Finance Charges','Expense',null,false),
('6401','Bank Charges','Expense','6400',true),
('6402','Finance Charges','Expense','6400',true),
('6500','Depreciation','Expense',null,false),
('6501','Laser Machine Depreciation Expense','Expense','6500',true),
('6502','Equipment Depreciation Expense','Expense','6500',true),
('6503','Vehicle Depreciation Expense','Expense','6500',true),
('6504','Computer Depreciation Expense','Expense','6500',true),
('6600','Other Expenses','Expense',null,false),
('6601','Loss on Asset Sale','Expense','6600',true);
alter table public.business_records add column account_code text references public.chart_of_accounts(code);
create function public.validate_expense_account() returns trigger language plpgsql set search_path=public as $$
declare selected public.chart_of_accounts;
begin
 if new.account_code is null then return new; end if;
 if new.kind <> 'expense' then raise exception 'Account classification is currently supported for expenses only'; end if;
 select * into selected from public.chart_of_accounts where code=new.account_code;
 if not found or not selected.is_posting then raise exception 'Select a posting sub-account'; end if;
 if new.category='Capital expense' and selected.parent_code<>'1300' then raise exception 'Select a fixed asset sub-account for capital expenses'; end if;
 if new.category<>'Capital expense' and selected.account_type not in ('Expense','Direct cost') then raise exception 'Select an expense or direct cost sub-account'; end if;
 return new;
end $$;
create trigger validate_expense_account before insert or update on public.business_records for each row execute function public.validate_expense_account();

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

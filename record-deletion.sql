-- Run once for an existing project; included in schema.sql for fresh projects.
-- Only the authenticated owner can delete sales and procurement records.
grant delete on public.business_records to authenticated;
create policy "Owners delete sales and procurement records"
 on public.business_records for delete to authenticated
 using ((select auth.uid())=owner_id and kind in ('enquiry','quote','purchase'));

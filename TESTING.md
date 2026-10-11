# Manual test checklist — GR Synergy Ventures

Open **http://127.0.0.1:4173** (if it doesn't load, double-click `start.command` first).

> **Before you start:** test records are saved in your browser just like real ones.
> If you already keep real records in this browser, either use a **private/incognito window**
> (its storage is thrown away when closed) or go to **Settings → Export backup** first.
> Name every test record with `TEST` so it's easy to find and delete afterwards.

Tick each box as you go. If a result doesn't match, note what you saw next to it.

---

## 1. Quote
- [ ] Sales → **＋ New quote**. Customer: type `Atlas`, pick **Atlas Engineering** with ↓ and Enter.
- [ ] Description `TEST quote`, Status **Accepted**.
- [ ] Line: `MS brackets`, Qty **10**, Price **2000**, Material **Mild steel**, Gauge **16**.
  - Expect thickness to fill in as **1.519 mm**.
- [ ] Discount **10**, Tax **16**.
  - Expect **Total PKR 20,880 · includes PKR 2,000 discount**.
- [ ] Set **Valid until** to a date *before* the quote date → Save.
  - Expect it to refuse. Fix the date and save.
- [ ] **Download PDF** → open it. Check the logo, "Less 10% discount", gauge and total.

## 2. Work order
- [ ] Open the quote → **Work order** → **Mark completed** straight away.
  - Expect a red message saying design, material and cutting must be done first.
- [ ] Design **Ready**, drawing ref `TEST.dxf`, Material **Ready**, material used `1 sheet`,
      Cutting **Done**, minutes **45** → **Mark completed**.
  - Expect the fields to lock and a **Create invoice** button to appear.

## 3. Invoice and payments
- [ ] **Create invoice** → set Invoice date **01/08/2026**, Due date **31/08/2026** → Issue.
  - Expect status **Overdue**, total **PKR 20,880**.
- [ ] Record a payment of **25000**.
  - Expect it to be blocked (more than the amount owed).
- [ ] Record **10000** to Business Bank Account.
  - Expect Received 10,000 · Outstanding **10,880**.
- [ ] **Download PDF** on the invoice. Check the received and outstanding figures.

## 4. Ageing and statement
- [ ] Sales → Invoices → scroll to **Receivables ageing**.
  - Expect Atlas Engineering **PKR 10,880 in 31–60 days**.
- [ ] **Statement ↗** → expect the invoice line (20,880), then the payment line (balance 10,880).
- [ ] Download the statement PDF and the ageing CSV.

## 5. Accounting
- [ ] Accounts → Journal → **Review posting** on the invoice → revenue **4001 Laser Cutting** → Post.
- [ ] Review posting on the receipt → Post.
- [ ] Accounts → Reports. Expect:
  - Revenue **18,000**, VAT output **2,880**, Bank **10,000**
  - Trial balance debits = credits = **20,880**
- [ ] Open the posted invoice entry → **Post reversal**.
  - Expect an opposite entry, and revenue back to 0 in Reports.

## 6. Areas not yet tested
- [ ] **Purchase order:** Procurement → new PO with a vendor, two lines, Download PDF.
- [ ] **Expense:** Accounts → Expenses → add one with a sub-account, mark Paid, then post it in Journal.
- [ ] **Petty cash:** add cash in 5,000 and cash out 1,200. Expect balance to rise by 3,800.
- [ ] **Customers:** add `TEST Customer`, find them in the quote dropdown, then delete them.
- [ ] **Delete:** delete a TEST quote → Cancel (should stay) → Delete again → Confirm (gone).
- [ ] **Search and filters** on each list, and **Export CSV**.

## 6b. Inventory
- [ ] Inventory → **＋ Stock item**: Sheet, Business, Mild steel, grade `A36`, Gauge **16**, size 1220 × 2440, reorder level **5**.
  - Expect thickness **1.519 mm** and "Nominal weight **35.496 kg** per piece".
- [ ] **Receive** on that row: 10 sheets, Price basis **Per kg**, rate **250**, purchase order **PO-1006**.
  - Expect **PKR 8,874 per sheet · total PKR 88,740**, and PO-1006 now shows **Received**.
- [ ] Open an accepted TEST quote → Work order → **Issue from stock**: try **11** sheets.
  - Expect "Only 10 sheets on hand".
- [ ] Issue **3** sheets with offcut **610 × 1220** and scrap **20** kg.
  - Expect job material cost **PKR 24,403.50**, remnant **REM-0001**, and "Material used" filled in.
- [ ] Add a **Customer** item for Metro Fabricators and receive 2 sheets.
  - Expect no price fields; issuing it to another customer's job is refused.
- [ ] **Count** the mild steel as 6 (Damaged).
  - Expect −1 sheet · −PKR 8,874.
- [ ] Scrap tab → **Sell / dispose** 20 kg for PKR 2,400.
- [ ] Accounts → Journal: post the stock movements, then check Reports.
  - Expect Raw Material (1201) to equal the Inventory **Stock value**.

## 6c. HR
- [ ] HR → **＋ Employee**: `TEST Operator`, production, monthly **45000**, overtime **375**, joined 2025-01-01.
  - Expect the hint "ordinary hourly rate ≈ PKR 187.5".
- [ ] Try CNIC `35202123`. Expect it to be refused. Use `35202-1234567-1`.
- [ ] Add `TEST Helper` (daily wage **1800**) and `TEST Clerk` (office, monthly **30000**, joined **16 Sep 2026**).
- [ ] Attendance, 1 Sep: Operator **Absent** with 3 h overtime.
  - Expect "overtime needs Present or Half day". Remove the overtime and save; Helper Present.
- [ ] 2 Sep: Operator Present + **4** h overtime, Helper **Half day**. 3 Sep: **Mark unmarked as present**.
- [ ] Advances → **＋ Advance**: Operator, 10 Sep, **8000**, Cash on Hand.
- [ ] Payroll → month **September 2026** → Prepare. Expect:
  - Operator earned 43,500 + overtime 1,500 = **45,000**
  - Helper **4,500**
  - Clerk **15,000**
- [ ] Operator advance **9000** is refused. Enter **5000** and other deduction **500** (`EOBI`).
  - Expect net **39,500** and total net **59,000**.
- [ ] Finalise (click twice) → **Payslip** PDF → Record payment (bank).
- [ ] Try editing attendance for any September date. Expect it to be locked.
- [ ] Accounts → Journal: post the advance, payroll and salary payment.
  - Expect Staff Advances (1102) **PKR 3,000** in the trial balance.

## 6d. Quotations
- [ ] Settings → **Company details**: fill in your address, phone, NTN/STRN and bank details, then Save.
- [ ] Sales → **＋ New quote**: expect Valid until = today + 15 days, and payment terms, lead time and terms filled in.
- [ ] Save it for Crescent Industries. Expect a number like **Q-CRE-00001** (the running number continues across customers) and "15 days left".
- [ ] **Delete** a TEST quote from its row, then create another. Expect the deleted number not to be reused.
- [ ] **PDF** from the list. Expect:
  - one page with your letterhead
  - amount in words
  - commercial terms with bank details beside them
  - terms & conditions and signature lines
  - no "SAMPLE" footer
- [ ] **Duplicate**, then set Valid until to a past date. Expect **Expired** and the Expired chip count to rise.
- [ ] Download an invoice PDF and a PO PDF. Both should show the same letterhead.

- [ ] Work orders → **Delete** on a job that has been invoiced. Expect "cannot be deleted".
- [ ] Delete a job with no invoice. Expect it to be gone, and its quote's status dropdown to be usable again.

## 6e. Work orders & job cards
- [ ] Settings → Company details → machine cost per cutting hour **3000**.
- [ ] Mark a TEST quote **Accepted**. Expect it under "Accepted quotes ready for production" → **Create job card**.
- [ ] Enter part sizes for each line, plus material consumed (kg) and cost if not issued from stock.
  - Expect net weight, scrap kg and scrap %.
- [ ] Try **Mark completed** before material is ready and QC passed. Expect it to be refused.
- [ ] **＋ Add labour**: pick an employee. Expect the hourly rate filled from HR.
- [ ] **＋ Book expense**: outsourced bending 5,000. Expect EX-… in Accounts → Journal.
- [ ] Complete the job. Check the costing (machine = minutes × rate ÷ 60) and the margin %.
- [ ] **Job card PDF**: check the parts, material and sign-off table.

## 6f. Invoices
- [ ] Complete a TEST job. Expect it under **Invoices → Completed jobs ready to invoice**.
- [ ] **Create invoice**. Expect the items and total listed, and the due date following the payment terms (e.g. 30 days credit → +30 days).
- [ ] Issue it. Expect **INV-2026-…**, and the job gone from the waiting list.
- [ ] **Payment** on the row: record part of the total. Expect **Part paid** and the reduced balance.
- [ ] **PDF**: check that Job No. and Your ref. appear in the header.

## 6g. Receiving purchase orders
- [ ] Mark a TEST PO **Ordered** or **Received**. Expect it under **Inventory → Purchase orders to receive**.
- [ ] **Receive into stock**. Expect a sheet line to be matched to its stock item (or offered as "＋ New item").
- [ ] Receive part of a line with "Fully received" unticked. Expect the PO to stay listed ("1 of 2").
- [ ] Receive the rest. Expect the PO to leave the list and its status to become **Received**.
- [ ] Accounts → Journal: post the receipts.

## 6h. Scope of work
- [ ] Open a job card. Expect a **Scope of work** card with 1. Design, 2. Material, 3. Cutting, 4. Quality check.
- [ ] Click **N/A** on Design and **Done** on Material. Expect the top tracker to fade Design and tick Material.
- [ ] **＋ Add task** → Bending, then a custom task. Move it up with ↑.
- [ ] Try **Mark completed** with tasks still open. Expect a message naming them.
- [ ] Finish every task (Done or N/A), then complete the job. Expect the controls to lock.
- [ ] **Job card PDF**: expect the sign-off table to list the job's own tasks.
- [ ] Set a task to **In progress** and drag its slider to 50%. Expect the tracker and list to show "50%", and the heading's overall % to change.
- [ ] Drag the slider to **100%**. Expect the task to turn **Done** (green, with today's date).

## 7. General
- [ ] Refresh the page. All test records should still be there.
- [ ] Open the app in a second tab, edit the same quote in both, and save both.
  - Expect a conflict warning rather than one tab silently overwriting the other.
- [ ] Narrow the browser window to phone width (the server only runs on this Mac, so a real
      phone can't reach it). Menus should wrap and there should be no sideways scrolling.
- [ ] Settings → **Export backup** → check a `.json` file downloads.

## Known issue
- Records created before 2 Oct 2026 keep their old random references (e.g. `QT-MUJOJL42-FE0D`).
  New quotations are numbered `Q-CRE-00001`.

## Notes / problems found
-

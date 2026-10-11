> **Local saving update:** The app now saves all seven business record collections in browser local storage. Saved data survives refresh/restart on the same browser and origin. Older preview/reset descriptions below describe previous versions and no longer apply. Settings → Export backup saves all loaded business records as JSON, without connection keys or authentication tokens. Local records remain separate from cloud records. No data from earlier, already-refreshed memory-only sessions can be restored by this change. Storage errors/corruption and conflicting writes from other tabs are surfaced without overwriting the stored workspace. Unsaved forms are not saved.

# GR Synergy Ventures

Local browser application for a laser sheet-cutting business, denominated in PKR.

## Run locally

**Easiest: double-click `GR Synergy Ventures.app`** (in this folder; it has the company logo). It starts a small local web server quietly in the background (no Terminal window) and opens the app in your browser at http://127.0.0.1:4173 — the same address as before, so your saved data is all there. Opening it again just opens the browser. The server stops when the Mac restarts, or with `Stop GR Synergy Ventures.app`. Tip: drag the app to the Dock to keep it one click away. The apps are built from `launcher/open.applescript` and `launcher/stop.applescript`.

Serve the `dist` directory with any static HTTP server. No installation or build is needed. Open the server URL in your browser.

The sample workspace supports enquiry, quote, purchase, expense and petty cash workflows. Sample edits are deliberately temporary and reset when the page reloads. Sample records are never uploaded to Supabase.

## Connect Supabase later
1. Create a Supabase project.
2. Run `supabase/schema.sql` once in its SQL Editor.
3. Create an owner user under Authentication → Users.
4. Open this app's Settings and enter the project URL and public publishable key (or legacy anon key).
5. Sign in with your owner account. The live workspace starts empty.
6. Use that same owner account on other browsers to access the same records.

The application accesses Supabase through HTTPS Auth and REST endpoints. Row-level security restricts records to their owner. Secret and service-role keys are never accepted. Only the public connection settings are stored in the browser; authenticated sessions remain in memory, so reloading requires signing in again. Connected browsers refresh every 30 seconds, and records save immediately. Updates include an optimistic concurrency check to avoid overwriting a newer change.

## Included
- Enquiries with requirements and contact notes; create a quote from an enquiry.
- Quotes and purchase orders with editable line items, quantities, rates, tax percentage and calculated totals.
- Quote and purchase status tracking.
- Capital, operating and general expenses, paid/pending status.
- Petty cash top-ups, spending and balance.
- Search, status filters and CSV exports.
- Responsive desktop and mobile browser layouts.

## Overview dashboard
The landing page shows what no single module shows on its own:
- **Month-to-date figures**: sales (invoices + scrap sales), cash collected, money owed by customers (with overdue) and expenses, each compared with last month. Click a figure to open the module behind it.
- **Needs attention**: overdue invoices, late jobs, completed jobs to invoice, accepted quotes without a job card, quotes expiring or expired, POs to receive, stock at reorder level, scrap in the yard, unpaid expenses and unposted entries, each with a button straight to the work.
- **Sales vs expenses** for the last six months, **On the shop floor** (active jobs by urgency and due date, with progress) and **Quote performance** (90-day win rate, pipeline and top customers this year).

## Scope
This version is an operational register, not a statutory accounting package. Accepted quote values are not booked revenue. It does not yet include invoicing, customer receipts, supplier payments, double-entry ledgers, bank reconciliation, stock consumption, machine scheduling or staff roles. A purchase marked Received does not automatically create an expense; record its payment separately and avoid duplicate expense entries. Petty cash is shown separately from other expense totals. Tax is user-entered with no assumed rate.

The supplied schema has not been applied to a live project; live authentication, permissions and synchronisation must be verified after configuration. The migration is intended for a fresh project and is not an idempotent upgrade script.

## Local preview and verification
Open http://127.0.0.1:4173 while the local server is running. On this Mac, double-click `start.command` to restart it after stopping the current server.

Verified in the browser: quote creation and a 2 × PKR 1,500 plus 10% calculation yielding PKR 3,300; dashboard update after saving; pending-expense filtering; PKR 10,000 cash in minus PKR 1,800 cash out yielding PKR 8,200; mobile layout at 390px with no page overflow; navigation tool valid and invalid inputs. No browser console errors were observed. Supabase checks remain pending until a project is provided.

## Quote PDF output
Open any quote and choose **Download PDF**. The PDF uses the current form values, including unsaved edits; downloading does not save or change a record. It includes the supplied company logo, quote reference/date/status, customer, job description, line items, subtotal, tax, total and notes. New unsaved quotes use `UNSAVED DRAFT`; preview workspace exports carry a sample footer. The PDF is generated locally in the browser using the vendored pdf-lib library, with no external service or CDN required.

PDF checks cover single-page output, 45-item pagination with long notes, tax totals, and invalid quantities. English and Latin text are supported; unsupported characters produce a visible error rather than a damaged PDF.

## Help & tutorials
Open **Help & tutorials** from the bottom of the sidebar, or press **?** in the top bar for the guide to the page you are on.
- **Getting started**: a checklist that ticks itself as you set up company details, bank account, stamp, customers, vendors, stock items, your first quote and a weekly backup.
- **How the work flows**: clickable steps for the sales flow (enquiry → payment → posting), buying material and the month-end routine; each step opens the right page.
- **Module guides**: what each module does, how to use it and tips, all searchable. Also a glossary and FAQ.
- **Guided tour**: walks through every module with a coach card and the menu item highlighted.
Wording lives in `dist/help.mjs`, so it can be edited without touching the app code.

## Look and feel
The interface uses the GR Synergy brand colours: deep navy (from the logo) as the primary colour, laser orange as the accent, and slate neutrals. The design layer at the end of `styles.css` sets the tokens (`--brand`, `--accent`, `--ink`, `--muted`, `--line`…), the navy sidebar with an orange marker on the active page, a frosted sticky top bar, soft-shadow cards with icon badges, the navy headline card, refined buttons, inputs, tables, pills, chips and dialogs, and Inter as the typeface (loaded from Google Fonts; the system font is used offline). The previous stylesheet is kept as `backup-2026-10-02/styles-before-theme.css`.

## Delivery notes
Sidebar → **Delivery notes** (also **＋ Delivery note** on a job card). A job can be delivered in one or several partial deliveries: each delivery note (DN-2026-0001…) lists every quote line with ordered, delivered earlier, this delivery and balance (defaulting to the remaining pieces; "Deliver all remaining" / "Clear"), plus date, customer PO, contact, address, vehicle, driver, dispatched by, packages, received by and remarks, with total pieces and approximate weight. It is marked **Partial** or **Final** automatically.
- **Versions**: editing a note saves the current version as a revision (Rev 1, Rev 2…) with the reason; the number stays the same and every version can be opened and printed from the note's Versions list.
- **Cancel, never delete**: a cancelled note stays on record (and prints CANCELLED); its pieces go back to the balance.
- The PDF has the letterhead, DN details and revision, deliver-to and dispatch details, the quantities table, pieces and weight, and signature lines for dispatched by (with the company stamp), driver and received by.
- **Ready to deliver** lists jobs with pieces still to send (completed jobs first); the job card shows its deliveries and status; the Overview flags completed jobs not yet delivered. A scope task named "Delivery / dispatch" follows the pieces delivered on each line automatically.
- Delivery notes are kept in this browser and included in backups.

## Chart of accounts
124 accounts in 26 groups for a Pakistani sheet-metal / laser-cutting business, each group classed for the statements (current / non-current assets and liabilities, equity, revenue, cost of sales, operating expenses, finance costs, other expenses, taxation). Existing codes never change; the 2026-10 update added second bank and cheques in hand; advance income tax (WHT deducted by customers), advances to suppliers, prepayments, security deposits, sales tax refundable; galvanized steel stock (1206, used for GI receipts); vehicles, generator / electrical, leasehold improvements, capital work in progress and matching accumulated depreciation; accrued expenses; sales tax input/output/settlement (renamed from VAT), WHT payable on suppliers and salaries, provincial sales tax on services (PRA/SRB), income tax payable; EOBI and PESSI/SESSI payable; loans & borrowings (bank / running finance, machine financing, director's loan); engraving, welding/finishing and bank profit income; sales discounts and returns (contra revenue); material wastage and purchase freight; generator fuel, water, staff welfare, bonus, EOBI employer share, travel, vehicle running, office rent; depreciation; finance costs (bank charges, markup, exchange loss); bad debts, asset disposal losses, donations, penalties; income tax expense. Most accounts carry a short description.

**Maintaining the chart** (Accounts → Chart of Accounts): **＋ Add account** (choose a group; the next free code is suggested), **Edit** to rename, describe or mark inactive (inactive accounts are hidden from pickers; accounts with a balance must be cleared first; accounts the app posts to cannot be deactivated). Your changes are stored with company settings and included in backups. The P&L shows cost of sales, operating expenses, finance costs and other expenses, **profit before tax**, taxation and net profit after tax; the balance sheet shows non-current and current sections. For Supabase, run the new block at the end of `chart-of-accounts.sql` once.

## Accounts
Tabs: **Dashboard · Chart of Accounts · Journal · Ledger · Reports · Expenses · Petty cash**.
- **Dashboard**: cash & bank (by account), receivables, payables and net profit this month / year to date from posted entries; what is awaiting posting by type with **Post all…**; this month's P&L at a glance; 6-month revenue vs costs; **period lock**.
- **Post all**: posts every queued transaction in one go using its normal posting, with a reviewable plan: invoices to the chosen revenue account (default 4001), paid expenses from the chosen cash/bank account, pending expenses to 2004, stock receipts to each item's suggested supplier payable. Unclassified expenses and entries dated in a locked period are skipped and listed.
- **Chart of Accounts** shows each account's balance today and group totals; **Ledger ↗** opens the account.
- **Ledger**: any account and period — opening balance, every posted entry (what it was against), running balance, closing balance on the account's normal side; CSV and print. Click an entry to open the journal.
- **Reports** (quick periods: this month, last month, this year): **Profit & loss** (by account, gross and net margin, optional comparison with the previous period of the same length), **Balance sheet** as at a date (current earnings shown in equity, with a balance check), **Trial balance**, **Cash flow** (cash in/out of cash, bank and petty cash grouped by the other side of each entry: operating, investing, financing; opening and closing cash), **Sales tax** summary (output − input = payable). Every account line opens its ledger; CSV and print for each. A note shows how many transactions are not yet posted.
- **Period lock**: lock the books up to a date; posting or reversing anything dated on or before it is refused until unlocked.

## Inventory control: adjust, stock take, valuation
- **± Adjust stock** (header, or Adjust on any row): increase or decrease an item with a reason (damaged, lost / missing, found, measurement correction, write-off, opening balance correction, other). Valued at average cost; post in Accounts → Journal.
- **☑ Stock take**: choose what to count (all stock, sheets, remnants, consumables or customer material) and optionally a location, the date and who counted. The stock take (ST-0001…) lists every item with its system quantity; **Print count sheet** gives a blind sheet (no system figures) with signature lines. Enter counts as you go (saved automatically), **Fill uncounted = system** for items that match, add notes, and review counted items, variances, gain, loss and net variance in PKR. **Post** creates one adjustment per variance, noted with the stock-take reference. Drafts can be deleted; posted stock takes stay as a record. If stock moves while a count is open, the variance uses the current figure and the line says so.
- **Valuation** tab: every item in stock with quantity, average cost, value, share of total value, last receipt and last movement (flagged slow-moving after 90 days without movement), totals by category, CSV export.
- **Stock takes** tab lists all counts; the headline figures show the last stock take and its net variance.

## Issuing sheets with planned offcuts
**Issue from stock** on a job card with a sheet plan selects the planned stock item and the planned number of sheets. It lists the offcuts the plan leaves on those sheets (size in inches and mm, which line they come from, pieces and weight) — on full sheets and on the part-filled last sheet — each with **Remnant / Scrap** (pieces at least 6" wide and 1 ft² start as Remnant). The scrap weight is worked out as sheets issued − parts − remnants and can be corrected after weighing. On issue, each remnant becomes a stock item (REM-…) with its pieces and its share of the sheet cost by area, marked "Left over from JOB-… · customer · line · quote"; the job is credited that value, and scrap goes to the scrap bin. Remnants can be searched by job or customer. Other usable offcuts not in the plan can still be entered by size.

## Standard sheet sizes (stock and purchase orders)
New sheet stock items choose from the standard sizes sold in Pakistan — 3'×6', 4'×8', 4'×10', 5'×10', 6'×12' (shown in feet, inches and mm) — or Custom size / offcut in mm. Ticking **Create all 5 standard sizes** creates one stock item per size for that material and gauge (existing sizes are skipped). Purchase-order lines pick from the same list (or Custom in feet, or no size for non-sheet items); choosing a size fills the description (e.g. "Mild steel sheet 4 ga 4' × 8'") and the weight. When the PO is received, each line is matched to the stock item of the same material, thickness and size (within 3 mm, so earlier 1220 × 2440 items still match); a size not yet in stock is pre-selected as "＋ New stock item" and created on receipt (several lines of the same new size go into one item). Stock labels show whole-foot sizes as 4' × 8' (1219 × 2438 mm).

## Scope of work per line item
The job card's Scope of work is a matrix: one row per quote line (with qty, size and material) and one column per task (Design, Material, Cutting, Quality check and any added tasks). Each cell is a status chip — grey Pending, blue In progress with its %, green ✓ Done, striped N/A — and clicking it opens a small panel to set the status or drag the progress. With several lines an **All lines** row sets a task on every line at once; the bottom row assigns each task to an employee. **Edit tasks** shows move/remove controls on the task columns; new tasks are added to every line. Each line shows its own progress bar. **Piece counts**: on a line with more than one piece, Cutting, Quality check and the later tasks are counted in pieces (e.g. 2/4, 37/60) — click the cell for a − / + counter (or type the number, Enter), **All N done** or N/A; 0 is Pending, part is In progress, all is Done (✓ 4/4), and the % follows the count. Design and Material stay a simple status. A cell shows an amber ! when more pieces are recorded than have passed the step before (e.g. QC 3/4 with only 2/4 cut). The job-level task status is derived from its lines (N/A when all lines are N/A, Done when every applicable line is done, otherwise the average), so the stage track, completion check, overview and job card PDF use it as before. Jobs created earlier start with every line at the job's existing task status.

## Sheet calculator
Open it from a quotation (**Sheet plan & layout → Open sheet calculator**) or on its own from **Sales → Sheet calculator**. It opens in a floating window (drag by the title bar, resize from the corner, minimise, maximise) or **Pop out** into its own browser window (allow pop-ups).
- **Items**: description, qty, material, gauge, W × L (inches) and sheet (Auto = best, or a fixed size); add or remove items freely. Each row shows sheets × size, pieces per sheet, use % and weight.
- **Options**: gap between parts, edge margin, allow turning parts 90° (switch off for grain/brushed sheet), "best" = least offcut or fewest sheets, which sheet sizes to compare and custom sizes in feet.
- **Drawing**: one large to-scale drawing for the selected item (step through items), first or last sheet, offcut sizes and dimension lines, plus the ranked sheet list with Use.
- **Sheets needed**: per material/gauge/sheet size — sheets, weight, stock and material cost.
- **Pricing help**: material rate PKR/kg (filled from average stock cost where a matching sheet is in stock), markup % and cutting & labour PKR/ft² give material cost, cost per piece and a **suggested rate per ft²** for each item.
- **Apply to quote** (when opened from a quote, also from the pop-out window): writes description, qty, material, gauge, W × L and sheet into the quote lines (adding lines for new items) and, if ticked, the suggested rates. Save the quote to keep it. Export CSV saves the plan.

The quote itself shows a compact summary (sheets per line, Auto/fixed, best-sheet hint and material at stock cost); the sheet per line and gap/margin are saved with the quote and become the job card defaults.

## Sheet calculator: combining items on shared sheets
The calculator has two options at the top:
- **Option 1 · Each item on its own sheets**: every item is planned on its own sheet size (the original behaviour).
- **Option 2 · Combine items on shared sheets**: the ticked items of the same material and gauge are nested together (rectangle packing with the gap, edge margin and 90° turning settings). Several packing rules are tried for every selected sheet size and the result with the fewest sheets / least offcut is used (or pick a size with **Use**).
  - Each shared sheet is drawn to scale with parts coloured per item, and the biggest leftover is marked as a remnant.
  - The summary compares combined against separate planning and shows the sheets and ft² saved.
  - The last sheet can drop to a smaller standard size when everything left fits on it.
  - Material cost is shared between the items by part area, so suggested rates stay fair.

## Sheet calculator: parts bigger than the sheet
When a part is longer or wider than the usable sheet (sheet size less the edge margin), the calculator cuts it in pieces that fit, for example a 15" × 169" strip becomes 15" × 84.5" + 15" × 84.5".
- **Oversize parts** setting: *Auto (best of both)* (default) tries both methods on every sheet size and keeps the one with fewer sheets, then less offcut, then the bigger remnant, and the joint plan says what the other method would have needed; or fix it to *cut in equal pieces* or *full lengths + remainder* (e.g. 120" + 49" on a 10' sheet). With the same number of sheets both methods waste the same area; only the leftover shape differs.
- A **joint plan** draws the whole job to scale with the cut lines and piece labels (1a, 1b…), and the pieces are then nested on sheets like any other part, in Option 1 and in Option 2 (shared with other items).
- Each sheet size is compared with its own split, so the suggestions show how many pieces each size needs.

## Sheet plan (job card)
For each quote line the job card shows the part size **W × L in inches** (taken from the quote, editable) and the sheet it is cut from: standard Pakistani sizes 3'×6', 4'×8', 4'×10', 5'×10' and 6'×12' (shown in feet and inches), any other size held in stock, or a custom size in feet. Next to each drawing, **Best sheet** ranks every size by least offcut for the full quantity (sheet area bought minus part area, then fewer sheets), shows sheets, pieces per sheet, use %, offcut ft² and stock, and a **Use** button switches the line to that sheet (save the job to keep it). Jobs saved with the earlier mm sheet ids are read as the matching inch sizes. It calculates **pieces per sheet**, **sheets needed** (with pieces on the last sheet) and **sheet use %**, and totals sheets per material/gauge/sheet size with the approximate weight and how many matching sheets are in stock. Gap between parts (default 5 mm) and edge margin (default 0 mm) are set per job. The estimate lays rectangular blanks in rows, tries both directions and fills the leftover strip with turned parts; nesting software may fit more for irregular shapes. Below the plan, a to-scale drawing of sheet 1 for each part shows the sheet, edge margin, gaps, parts with number and size (turned parts in green), spare places and the offcut strips with their W × L in inches (listed under each drawing), redrawn live as sizes, sheet, gap or margin change. The job card PDF prints the sheet plan. Scrap is not shown for now (part sizes are still saved in mm for when it returns).

## Customer and vendor accounts
Click a name (or **Account ↗**) in Customers or Vendors to open its account page:
- **Figures**: balance due / payable (with overdue), invoiced or purchased this year, received or paid this year (average days to pay for customers), open quotes with win rate or open purchase orders.
- **Overview**: ageing (not yet due, 1–30, 31–60, 61–90, over 90 days past due), credit-limit use, last 12 months chart, recent activity and key details.
- **Account ledger**: any date range with opening balance, each invoice/bill and payment, running balance and closing balance; export CSV or download a statement PDF.
- **Monthly**: month-by-month invoiced/billed, received/paid, net and closing balance for a chosen year; export CSV.
- Customer tabs: Invoices, Payments, Quotes, Jobs, Details. Vendor tabs: Bills, Payments, Purchase orders, Details.

**Statement of account PDF** (Statement PDF on the account page, the ledger tab, or the Statement dialog): company letterhead; statement date, period, account no., currency and terms; account holder with contact, address and NTN/STRN; account summary (opening, invoiced/billed, received/paid, overdue, credit limit, balance due); ageing; every transaction with due date and running balance, with totals carried forward; open invoices / unpaid bills with days overdue; monthly summary; balance in words; remit-to bank details (our default account for customers, the supplier's bank for vendors); notes; stamp and a balance-confirmation signature. Ageing and open items appear when the statement runs to today.

**Who to pay / who owes you**: the Vendors page shows Payable to vendors (total and number of vendors), Overdue payables and Open POs, a **To pay** filter (largest first) and a Payable column with the overdue part; Customers has a matching **To collect** filter. The Overview's Needs attention lists "N vendors to pay" with a link to that filter. A vendor's bills fall due by its payment terms (e.g. "30 days credit"); without terms they are due on receipt.

**Vendor payables**: a purchase order becomes a bill when its status is **Received** (dated by its first goods receipt). **＋ Record payment** saves a vendor payment (VP-0001…) from bank, cash or petty cash, against a chosen bill or the oldest bills first. Post it in Accounts → Journal: Dr supplier payable (2001 steel, 2002 gas, 2003 consumables, 2004 services; suggested from the vendor's supply category), Cr cash/bank. Unposted payments can be deleted. Vendor payments are kept in this browser and included in backups.

## Line item size and area
Each quote / PO line has an **Item description** with **W × L in inches**, then **Qty**, Material, Gauge and **Area ft²** (W × L ÷ 144 per piece × Qty; hover for the per-piece area).

**Pricing:** a line with W × L is priced by area: **Amount = Area ft² × Rate** (rate per ft², less any line discount). A line without a size (bending, transport, setup) is priced as Qty × Rate. Each saved line records `pricing` (`area` or `qty`) and `area_sqft`, so invoices, job costing and the ledger use the same amount. PDFs add an AREA FT² column, show "per ft²" under area-priced rates, and print the size under the item, e.g. `18" x 96" · 12 sq ft/pc · 48 sq ft total`.

**Purchase orders** use the same table with sheet sizes in **feet** (W × L ft) and a **Weight kg** column instead of area: W × L (ft → mm) × gauge thickness × nominal density (steel / galvanized 7.85, stainless 7.93, aluminium 2.70 g/cm³) × Qty. PO amounts are always **Qty × Rate**. Lines store `width_ft`, `length_ft` and `weight_kg`; the PO PDF prints a WEIGHT (KG) column and the size as `4' x 8'`.

The gauge list shows gauges only (e.g. `5 ga`); the matching thickness in mm is still stored and printed on PDFs as `5 ga` (mm is not printed). The separate mm column was removed; a line saved with a custom thickness shows it as an `x mm` option in the gauge list.

## Material thickness and US gauge
Quote and purchase line items now store material, thickness in mm, gauge and gauge standard in the existing line-item JSON. No Supabase schema change is required. Select a material before choosing a gauge. Gauge selection fills nominal mm; entering mm selects a gauge only when it exactly matches a listed value at 0.001 mm precision. Other values remain custom thicknesses. Changing material preserves the mm value and recalculates the match. Existing descriptions ending in mm prefill the thickness field; they are retained for compatibility. PDFs show the material and thickness, plus gauge for exact nominal matches.

Tables use US sheet-metal gauge, not SWG. Mild steel, stainless and aluminium inch values are from https://unipunch.com/support/charts/metal-gauges/ ; galvanized values are from https://www.metalsupermarkets.com/sheet-metal-gauge-chart/ . Values are converted using 25.4 mm per inch and rounded to 0.001 mm. The available ranges follow those published tables; galvanized covers only their listed gauges. Gauge dimensions are nominal and do not imply manufacturing tolerance.

Verified material-specific 16 gauge conversions, reverse exact matching, custom 4 mm preservation, browser gauge selection, and PDF rendering with both mm and gauge.

## Customer directory
Customers in the sidebar supports adding, editing, searching and deleting customers, including optional contact person, phone, email and address. Quotes and enquiries use a searchable dropdown with keyboard navigation (arrow keys, Enter and Escape). Search also matches phone, email and contact person. New customer names must be added in Customers. Existing records keep their historical name even if their customer is renamed or removed.

The preview directory is temporary, like the other sample records. Supabase mode uses the owner-protected `customers` table with duplicate-name prevention and optimistic concurrency checks. Fresh projects should use the updated `supabase/schema.sql`. Projects that already ran the earlier schema should run only `supabase/customers.sql` once. Live persistence and permissions remain unverified until Supabase is connected.

Browser-checked customer creation, renaming, search, keyboard selection in the quote dropdown and confirmed deletion of the test customer. Syntax validation passed.


## Vendors and contact navigation
Customers and Vendors are now independent sidebar sections, outside Settings. Both support adding, editing, deleting, and searching names and contact details. Procurement purchase orders use the searchable vendor dropdown; new vendor names are added in Vendors. Existing purchase orders retain their original supplier name after vendor edits or deletion.

The vendor directory is temporary in preview mode. Supabase mode uses its own owner-protected `vendors` table. Fresh projects run the updated `supabase/schema.sql`; projects with the customer schema already installed run `supabase/vendors.sql` once. Live database verification remains pending until Supabase is configured.

## Delete sales and procurement records
Enquiries, quotes and purchase orders have Delete actions in their lists and edit windows. A confirmation identifies the reference and customer/vendor; cancelling leaves the record and unsaved form intact. Confirming removes only that record and refreshes lists, counts and totals. Customer/vendor directories are unaffected. Preview deletions reset on reload; connected deletions are permanent.

Fresh Supabase projects use the updated schema.sql. Existing projects must apply supabase/record-deletion.sql once, granting deletion only for the signed-in owner's enquiry, quote and purchase records. The client checks updated_at to avoid deleting records changed by another browser. Browser checks passed for cancelling a quote deletion, confirmed quote/enquiry deletions, and deleting a PO from its edit window. Live Supabase verification remains pending.

## Chart of Accounts — stage one
Accounts opens a searchable, expandable chart using the proposed main codes, with separate posting sub-accounts for the five core revenue streams. Added groups 1400 (accumulated depreciation) and 6600 (other expenses) accommodate the supplied depreciation and asset-sale categories. Definitions are fixed in this release; account maintenance is not implemented yet. No opening balances, journals, invoices, payment allocations, job-cost register or profit reports are generated by this stage.

New expense entries require a sub-account. Existing entries can stay unclassified until reviewed. Capital expense choices are limited to fixed assets; other expense categories offer direct cost and expense sub-accounts. Classification appears beside the entry reference and in CSV exports. Petty cash remains its existing operational register and is not double-posted to these accounts.

Fresh Supabase projects use schema.sql; already configured projects apply supabase/chart-of-accounts.sql once. The migration creates read-only account definitions, adds the optional account reference and validates posting eligibility against expense category. Live migration checks remain pending until Supabase is configured.

Verified unique codes, category restrictions, browser account search and saving Electricity (6002) to an existing sample expense. Sample classifications reset on reload.


### Customer invoices and payments
Sales → open a saved quote → Create invoice → review dates → Issue invoice. One invoice per quote; billing details are copied and fixed at issue time. Unsaved quote edits are not included. Sales → Invoices provides search, billed/received/outstanding totals, due dates, payment history, and Unpaid/Part paid/Overdue/Paid status. Record partial or full receipts into a named cash/bank account; overpayments are rejected. No money is actually collected. Receipt recording does not post journals or duplicate entries into the petty cash register. Credit notes, reversals, invoice editing, and profit reports are not included yet. Preview invoices/payments reset on reload.

Fresh Supabase installations use schema.sql; existing installations must also run invoices.sql. Invoice and payment reads use owner RLS. Writes are restricted to owner-checking functions, with locked rows, quote version checks, one-invoice-per-quote uniqueness and idempotent payment request IDs. Invoice snapshots survive quote deletion. Cloud execution requires validation against your future Supabase project.


### Work order workflow
Accepted saved quote → Work order → Design/DXF, Material used, Cutting → Completed → Invoice → Payment. Work orders have job numbers, a fixed accepted-quote snapshot, drawing reference (text only, no file upload yet), material ownership/usage notes, and actual cutting minutes. Customer-owned material remains operational data. Completed jobs are immutable. Dashboard shows active jobs and completed jobs awaiting invoices. Existing invoices remain available in Sales.

This supersedes direct quote-to-invoice creation: use the completed work order's invoice action. Existing Supabase projects need work-orders.sql after invoices.sql; fresh setup uses schema.sql. Work orders do not yet calculate job costs or automatically move stock or post journals. P&L, cash/VAT reports and full accounting remain future stages. Cloud migrations have not been run against a real Supabase project.


### Accounting and reports
Accounts → Journal has a review queue for invoices, receipts and classified expenses. Invoice posting requires a revenue-account selection (one account per invoice; mixed revenue can be split by adjustment). Receipt postings use the recorded cash/bank method. Paid expenses require a cash/bank offset; pending expenses use service-contractor payables. Amounts are posted gross; input tax is never inferred. Quotes, purchase orders and operational petty cash entries are not automatically posted.

Manual balanced journals support opening balances, transfers, payable settlement, revenue splits, tax adjustments and other corrections. Posted entries are immutable; reversal creates an equal opposite entry on the chosen date and retains the audit trail. Reversed sources stay posted to avoid duplicate source posting. Posted expenses cannot be edited. There is no period closing or approval workflow yet.

Reports include period P&L, cumulative trial balance, cash/bank balances, tax account movements and operational invoice receivables as at a date. All ledger reports depend on posting all applicable sources, opening balances, material consumption and adjustments. Receivables use invoices/receipts and may differ from ledger AR where journals or unposted items exist. Tax movements are not a tax return or eligibility assessment. Customer-owned material is not automatically valued or posted. Trial balance CSV export is available.

Apply accounting.sql after work-orders.sql for existing Supabase installations. Fresh setup uses schema.sql. Owner-scoped RPC posting validates accounts/balance, generates source lines server-side, serializes source posts/reversals, prevents duplicate source posting, and prohibits direct client writes. Cloud SQL is prepared but has not been executed in a real Supabase project. Preview journals reset on reload.


Invoice PDF: open any invoice and choose Download PDF. The printable A4 document includes the company logo, saved invoice and quote references, issue/due dates, customer, items, tax and totals, saved notes, received amount and outstanding balance. Payment form values are excluded until recorded. Sample exports are labelled SAMPLE. English/Latin font support matches quote exports.


### Sales extras (2 Oct 2026)
- **Line discounts.** Each quote and purchase-order line has an optional Discount (%) field (0–100). The discount reduces the line before tax; the editor total shows the discount amount, and PDFs show "Less N% discount" on the line plus Gross amount / Discount rows above the subtotal. Invoices issued from a discounted quote carry the discount, and journal posting credits revenue net of discount. Lines without a discount calculate exactly as before.
- **Quote validity.** Quotes have an optional "Valid until" date, shown in the quote list and on the PDF. Draft and Sent quotes past that date are marked Expired in the list (the status itself is not changed). The date cannot be before the quote date. It is included in the quotes CSV export.
- **Purchase order PDF.** Open any purchase order and choose Download PDF. Same layout as quotes, titled PURCHASE ORDER with a SUPPLIER block.
- **Receivables ageing.** Sales → Invoices now ends with an ageing table per customer: Not yet due, 1–30, 31–60 and 61+ days past the due date, as at today, with totals and a CSV export. Like the invoice list, it uses invoices and recorded payments, not ledger balances.
- **Customer statements.** Choose Statement in the ageing table or beside a customer in Customers. Pick a period to see the opening balance, each invoice and payment with a running balance, and the balance due; export as CSV or download as PDF. Statements match invoices by the customer name recorded on the invoice, so a customer renamed after invoicing will show under the old name.
- **Fix.** A description ending in a sheet size such as "1220 × 2440 mm" is no longer read as a thickness of 2440 mm, which previously blocked saving and PDF export for that line (including sample PO-1006). The thickness earlier in the description is used instead when present.

Discounts and Valid until are available in the local workspace only. They are hidden while signed in to Supabase, because the current database functions total lines as quantity × rate and the records table has no valid-until column; a migration is needed before enabling them there.

Checks: `node --test tests/*.mjs` (16 passing, including new discount, ageing, statement and thickness tests). Browser-checked discounted quote → work order → invoice → part payment → ageing → statement → journal posting, all four PDFs, reload persistence, and the 390px mobile layout with no console errors.


### Inventory (2 Oct 2026)
Inventory tracks sheet stock, usable remnants, consumables, customer-owned material and scrap, with every movement numbered in sequence (SM-0001, SM-0002…). Business rules:
- **Sheets** are stock items defined by material, grade, thickness (mm or US gauge) and sheet size, and are counted in whole sheets. Weight is calculated from the dimensions and a nominal density (mild/galvanized steel 7.85, stainless 7.93, aluminium 2.70 g/cm³). Purchases can be priced per sheet or per kg. Stock is valued at weighted average cost.
- **Receiving:** Inventory → Receive stock, or open a purchase order → Receive into stock. You can mark the PO as Received at the same time.
- **Issuing to jobs:** open a work order → Issue from stock. Each issue costs the job at average cost. Material can't be issued beyond what's on hand or to a completed job. Issuing also adds the material to the job's "Material used" field, and the job shows its material cost.
- **Offcuts and scrap:** while issuing, enter the size of a usable offcut to return it as a remnant (REM-0001…). It takes its share of the sheet cost by area, which is credited back to the job. Skeleton scrap is weighed in kg into a scrap bin per material. Scrap has no stock value; a scrap sale posts to Scrap Sales (4302).
- **Consumables** (gas, nozzles, lenses) are counted for reordering only. Their cost is expensed to the chosen 5101–5104 account when the receipt is posted.
- **Customer-owned material** is counted, never valued or posted, and can only be issued to that customer's jobs or returned to them.
- **Reorder levels** raise alerts on the Inventory page and the Overview.
- **Corrections:** movements cannot be edited. A stock count records the difference as an adjustment, valued at average cost.
- **Accounting:** Accounts → Journal lists stock movements that have a value:
  - receipts: Dr 1201/1202/1203 (or the consumable account), Cr supplier payable, cash/bank, or Owner Capital for opening stock
  - issues: Dr 5001, Cr inventory
  - offcuts: Dr inventory, Cr 5001
  - count adjustments, and scrap sales (Dr cash/bank, Cr 4302).
  
  Galvanized steel uses 1201. Do not also record a received purchase as an expense. Settle suppliers with a journal (Dr 2001, Cr bank).

Inventory works in the local workspace only. While signed in to Supabase it shows a notice instead, because no stock tables exist yet. Workspaces saved before this release load with an empty inventory. Opening stock is entered as a receipt and posted against Owner Capital (3001).

Checks: `node --test tests/*.mjs` (25 tests: the 16 existing plus 9 inventory tests). In this session they were run through a browser harness because Node.js isn't installed on this Mac. Browser-checked:
- PO receipt at a per-kg rate (10 × 35.496 kg × PKR 250 = PKR 88,740)
- issuing 3 sheets with a quarter-sheet offcut (job cost PKR 24,403.50) and scrap
- over-issue, other-customer and fractional-cylinder rejections
- count write-off, consumable receipt, scrap sale
- journal postings, with the trial balance's Raw Material equal to the Inventory stock value
- reload persistence, 375px layout, no console errors


### HR (2 Oct 2026)
HR covers employees, daily attendance, salary advances and monthly payroll with payslips.
- **Employees** (EMP-0001…): role, production or office staff, monthly salary or daily wage, overtime rate per hour, joining and leaving dates, paid leave days per year, and optional CNIC (12345-1234567-1, unique), phone, bank account and emergency contact. Employees with any history can't be deleted; mark them Left instead.
- **Attendance:** a daily register per employee: Present, Half day, Absent, Paid leave, Unpaid leave, or Weekly off / holiday, plus overtime hours. Overtime is only allowed on present or half days, up to 16 hours. The register only lists staff employed on that date. "Mark unmarked as present" speeds up daily entry. A monthly summary and CSV export are included. Paid leave taken this year is shown against each employee's allowance.
- **Advances** (ADV-0001…): cash given ahead of payday, recovered in payroll. Recovery can't exceed the outstanding balance. Unposted advances can be deleted.
- **Payroll** (PAY-YYYY-MM), Draft → Finalised → Paid:
  - Monthly staff lose salary ÷ 30 for each absent or unpaid-leave day (half for a half day), and for days before joining or after leaving. Unmarked days count as worked.
  - Daily-wage staff are paid for present days, half days and paid leave only.
  - Overtime is hours × the employee's overtime rate.
  - Bonus, advance recovery and other deductions (e.g. income tax, EOBI) are entered per employee. No statutory rates are assumed.
  - Finalising fixes the figures and locks that month's attendance. Payslip PDFs can then be downloaded, with signature lines.
- **Accounting** (Accounts → Journal):
  - finalised payroll: Dr Direct Labour 5201 (production) or Administration Salaries 6101 / Overtime 6102 (office); Cr Salaries Payable 2301, Staff Advances 1102 (recoveries), Payroll Deductions Payable 2302
  - salary payment: Dr 2301, Cr cash/bank
  - advance: Dr 1102, Cr cash/bank
  
  New accounts: 1102 Staff Advances, 2300 Payroll Liabilities (2301, 2302). Pay over withheld tax/EOBI with a journal (Dr 2302, Cr bank).

HR works in the local workspace only. While signed in to Supabase it shows a notice, and the new accounts are not yet in `supabase/chart-of-accounts.sql`. Staff details, including CNIC and bank account, are stored in this browser and included in backup exports, so keep backups private.

Checks: 34 tests (9 new HR tests), run in this session through a browser harness. Browser-checked:
- adding employees, with malformed and duplicate CNIC rejected
- attendance with overtime-on-absence rejected
- a mid-month joiner
- an 8,000 advance with 5,000 recovered
- September payroll: gross 64,500, net 59,000, matching hand calculation
- finalise confirmation, payslip PDF, attendance lock, salary payment
- all three postings, with Staff Advances 3,000 in the trial balance
- reload persistence, 375px layout, no console errors


### Professional quotations (2 Oct 2026)
- **Sequential numbers.** New quotations are numbered Q-<first three letters of the customer>-<running number>, e.g. Q-CRE-00001 then Q-ATL-00002. The running number is shared by all customers and is never reused, even after a quotation is deleted; the last number issued is remembered in this browser. Other new records are numbered per year: PO-2026-0001, EN-, EX-, PC-, INV-2026-0001 and JOB-2026-0001. Earlier references (QT-1024, QT-MUJOJL42-FE0D and so on) keep their numbers. Numbering continues from the highest existing number for the year.
- **Company details & quotation defaults** (Settings → General) supply the letterhead on every quotation, invoice and purchase order:
  - business name, tagline, address, phone, email, website, NTN and STRN
  - bank name, account title and IBAN
  - default "prepared by", quotation validity (15 days), payment terms, lead time and terms & conditions
  
  They're stored in this browser and included in backup exports.
- **Quote form** (local workspace): valid until (defaults to today + validity), customer reference / RFQ number, attention, payment terms (with common options), lead time, prepared by, and editable terms & conditions. Existing quotes are unchanged until edited.
- **Quotes list**:
  - summary: open quotations, won this year, win rate, expiring within 7 days
  - status chips with counts, including a derived **Expired** status for draft or sent quotes past their validity (the saved status is unchanged)
  - days left until expiry
  - a progress column (start work order / in production / invoiced and paid status)
  - one-click PDF and Duplicate (a copy gets a new number, today's date and fresh validity)
  - status can be changed from the list with a colour-coded dropdown (Draft / Sent / Accepted / Declined), which saves immediately; once a work order exists the quote is locked at Accepted
  - Copy (duplicate as a new draft) and Delete in each row; deleting a quote that has a work order or invoice warns that they keep their own copy of the quote
- **PDF layout** (quotations, invoices and purchase orders):
  - letterhead and reference box
  - customer or supplier block with contact, phone, email and address from the directory
  - numbered items, with a material and thickness line that no longer says "custom thickness"
  - amount in words using lakh and crore
  - commercial terms with bank details beside them, numbered terms & conditions
  - signature lines for the authorised signatory and the customer
  - footer with company contact details; quotations note "This is a quotation, not a tax invoice".
- **Fixes:**
  - PDFs from the local workspace no longer carry the "SAMPLE - preview workspace" footer.
  - Notes or terms written on several lines no longer stop the PDF with an "unsupported characters" error.

The new quote fields are hidden while signed in to Supabase, because the records table has no columns for them yet. The letterhead and numbering work in both modes.

Checks: 37 tests (3 new: amount in words, sequential numbering, validity dates). Browser-checked:
- defaults in a new quote; QT-2026-0001 saved with PKR 254,880
- Duplicate to QT-2026-0002, Expired chip and filter
- one-page quotation, invoice and PO PDFs rendered and reviewed
- list fits at 1366px with no page overflow at 375px; no console errors

**Deleting work orders** (local workspace only; the cloud tables do not grant deletion). Use Delete in the work order list or in the job window. Rules:
- An invoiced job can't be deleted, so the invoice stays traceable.
- If stock was issued to the job, the confirmation lists the movements. They stay recorded against the job number, with their material cost, in Inventory and the accounts. Record a stock count if sheets came back unused.
- The quote is kept, its status unlocks, and it can start a new work order.


### Work orders & job cards (2 Oct 2026)
- **Work orders page:**
  - stats: waiting for a job card, in production (urgent), overdue, ready to invoice
  - **Accepted quotes ready for production**: every accepted quote without a job, each with **Create job card**
  - job list with filters (All, Active, Overdue, Ready to invoice, Invoiced), due date, stage, priority, operator, and cost / margin
- **Job card page** (replaces the old pop-up):
  - stage tracker: Design → Material → Cutting → Quality check → Completed → Invoiced
  - details: due date (defaults to 7 days), priority, operator (from HR), machine, drawing / DXF, material owner, estimated and actual cutting time, workshop instructions, material used
  - completion now also requires the quality check to be Passed or Not required
- **Parts & scrap:** each quote line with its part size (L × W):
  - net part weight = size × thickness × density × quantity
  - material consumed comes from stock issued (sheets less offcuts), or is entered in kg with its cost when material isn't issued from stock
  - scrap kg, scrap % and material utilisation; nothing is shown until both part sizes and consumption are known
  - weights use the part's overall size, so holes and cut-outs count as part
- **Labour:** person, task, hours and hourly rate. The rate defaults from HR (monthly salary ÷ 30 ÷ 8, or daily wage ÷ 8).
- **Job expenses:** booked as real expense records (EX-…) linked to the job. Types map to accounts: oxygen 5101, nitrogen 5102, nozzles/lenses 5103, other consumables 5104, outsourced bending 5202, transport 5203. Post them from Accounts → Journal as paid (cash/bank) or pending (payables).
- **Job costing:** quote value before tax, less material (stock or entered), machine time (actual minutes × machine cost per hour from Settings → Company details), labour and booked expenses, giving margin and margin %. Estimated vs actual cutting time is shown. Machine time and labour are costing allocations only; wages post through payroll.
- **Job card PDF** for the workshop: job facts, urgent flag, parts with material and part sizes, material issued (or the material note), instructions, stage sign-off table and blanks for actual time, sheets and scrap.
- Sales: the quote window's button is now **Job card** and opens the job card page.

Job card details, parts, labour, expenses and costing work in the local workspace. While signed in to Supabase, the job card shows only the original work order fields.

Checks: 43 tests (5 new: stages, completion rule, part weight and scrap, labour rates, costing). Browser-checked:
- creating a job card from an accepted quote, with part weights 508.7 + 212 kg and scrap 129.4 kg (15.2%)
- completion blocked until material is recorded and QC passed
- labour 2,025, expenses booked to 5202 and 5102 and queued for posting, machine 5,500, margin 47,475 (22%)
- issuing stock from a job card (35.5 kg, PKR 8,874)
- job card PDF reviewed; no console errors


### Invoices module (2 Oct 2026)
**Invoices** is now its own sidebar module after Work orders. The Invoices tab in Sales links to it.
- **Summary cards:** ready to invoice (incl. tax), outstanding, overdue, and received this month.
- **Completed jobs ready to invoice:** every completed work order without an invoice, showing its quote, payment terms, completion date and total, with **Create invoice**.
- **Creating an invoice:**
  - the window lists the quoted items and the total including tax
  - the due date is set from the quote's payment terms ("15 days credit" → 15 days, "30 days credit" → 30 days; advance or cash-on-delivery terms → the invoice date); you can still edit it
  - the invoice records its job number, which is printed on the PDF with the customer's reference
- **Invoice register:**
  - status filters (Unpaid, Part paid, Overdue, Paid)
  - due date with "x days overdue" / "due in x days"
  - total and balance
  - Open, PDF and Payment (opens the invoice at the payment form)
- Receivables ageing and customer statements stay at the bottom.
- Jobs now record their completion date when marked completed (jobs completed earlier show "—").

Browser-checked:
- a completed job listed and invoiced as INV-2026-0001 with its job and quote references
- the job removed from the waiting list
- a 50% advance payment giving Part paid with PKR 127,440 due
- the PDF header showing Job No. and Your ref.
- the Sales tab link; no console errors


### Receiving purchase orders into stock (2 Oct 2026)
**Inventory → Purchase orders to receive** lists every Ordered or Received purchase order that isn't fully in stock yet. Delivered-but-not-in-stock POs come first. Each row shows how many lines are in stock and has **Receive into stock**; the same button is in the purchase order window.
- **Goods received note (GRN):** one row per PO line, plus a receipt date and the delivery challan / bill number.
  - **Stock item:** chosen automatically when the line's material, thickness and sheet size (e.g. "1220 × 2440 mm") match a business sheet item. If the line can be read but no item exists, **＋ New item** creates it. Consumables and anything not recognised are chosen from the list. "Not received now" skips a line.
  - **Quantity and cost:** quantity is in the item's unit (sheets). The cost defaults to the line value, so a PO priced as one lot is spread over the sheets received.
  - **Fully received:** untick it for a part delivery; the line stays open, with the quantity received so far shown.
- Each line becomes a stock receipt (SM-…) linked to the PO and line, valued at weighted average cost as before. When every line is fully received, the PO is set to **Received** automatically.
- Receipts made against a PO before this change count as receiving the whole order.
- Post the receipts in Accounts → Journal (Dr inventory, Cr supplier). Do not also record the purchase as an expense.

Checks: 45 tests (2 new: PO line reading and matching, pending until all lines are in). Browser-checked:
- PO-1005 received into a newly created SS 2 mm item (10 sheets at PKR 14,500)
- a two-line PO received in two deliveries (12 then 8 sheets, plus oxygen), staying on the list until complete and then set to Received
- average cost PKR 8,974.80 over 25 sheets; no console errors


### Scope of work (2 Oct 2026)
Each job card has a **Scope of work** card: the job's own ordered task list. New jobs start with 1. Design, 2. Material, 3. Cutting, 4. Quality check.
- **Status:** one click on **Pending · In progress · Done · N/A**, saved immediately. Unsaved entries in the job form are kept. Done tasks record their date. Each task can be assigned to an employee.
- **Changing the scope:**
  - **＋ Add task** from presets (Bending, Welding / fabrication, Deburring / finishing, Powder coating / painting, Packing, Delivery / dispatch) or as a custom task
  - reorder with ↑ ↓, remove with ×
  - mark N/A for work not needed, e.g. Design when the customer supplies the DXF
- **The top tracker follows the scope:** numbered tasks, N/A faded, then Completed and Invoiced. The work order list's stage follows it too ("Cutting", "Awaiting Bending", "Ready to complete").
- **Completion rule:** at least one task done and every task Done or N/A. If Material is Done, "Material used" must also be filled in.
- **Job card PDF:** the sign-off table lists the job's tasks, plus "Dispatched / collected" when there is no delivery task.
- **Older jobs and cloud records:** the four standard tasks keep the original design / material / cutting / QC status fields in step. Older jobs without a scope get one from those fields. While signed in to Supabase, the original status dropdowns are shown instead.

Checks: 47 tests (job tests updated for scope stages, the completion rule and keeping the original fields in step). Browser-checked:
- Design marked N/A, Material Done, Cutting In progress with an operator
- Bending and a custom "Laser marking" task added and reordered
- tracker and list stage updated, with completion blocked until every task was settled, then the job completed and locked
- no console errors

**Task progress slider.** An In progress task shows a slider (0–100% in steps of 5%) after its status buttons:
- Dragging shows the value; letting go saves it.
- At **100%** the task is marked **Done** (green, dated). Clicking Done sets 100%, Pending sets 0%, and In progress starts at 10% or keeps the earlier value.
- Done tasks show a full green bar.
- The Scope of work heading shows **overall progress**: the average over the tasks that apply (Done = 100%, N/A left out), with a bar.
- The current step in the top tracker and the stage in the work order list include the percentage, e.g. "Cutting 50%".

Checks: 48 tests (new: task and overall progress, stage with percentage). Browser-checked: 10% start, 50% saved (63% overall), 100% turning Cutting Done, labels not clipped at 1366px.

**Overall progress in the work order list.** An Overall progress column after Stage shows each job as a bar with its percentage: the same average shown on the job card (Done tasks count 100%, N/A tasks are left out). Completed and invoiced jobs show a full green 100% bar. The table fits a 1366px screen.


### Material used comes from stock (3 Oct 2026)
- On the job card, **Material used** is now a read-only list of the stock issued to the job: quantity × item, description, weight, cost, movement number and date. It can't drift from inventory.
- The text box is now **Material notes**, optional, for anything not issued from stock. Issues are no longer copied into it.
- **Completion rule** when the Material task is Done:
  - business-owned material must have been issued from stock
  - customer-owned material can be issued from customer stock, or described in the notes
  - cloud jobs keep the earlier rule (material used text required)
- Business material is always costed from stock: the manual "material cost" field is removed and job costing uses stock issues only. Customer-owned jobs keep a "customer material consumed (kg)" field for the scrap calculation when nothing was issued.
- The job card PDF prints the issued material, plus any notes.

Checks: 49 tests (new: business material must come from stock, customer material may be noted). Browser-checked:
- "MS Steel" typed in the notes, with completion refused
- 2 sheets issued from stock, then listed with 94.4 kg and PKR 29,000
- the job then completed with that cost


### Bank details (3 Oct 2026)
- **Settings → Company details → Bank details:**
  - **Bank name** is a dropdown of banks operating in Pakistan (commercial, Islamic, foreign and microfinance), plus **Other (type the name)** for any bank not listed or renamed. Names saved earlier, e.g. "Meezan Bank", select their listed bank.
  - Also: Branch name / address, Beneficiary name (account title), Beneficiary address (defaults to the business address), Account number, IBAN, SWIFT / BIC code, and Currency (PKR, USD, EUR, GBP, AED, SAR, CNY).
- **IBAN check:**
  - IBANs are stored without spaces and shown in groups of four.
  - Saving checks the ISO 13616 check digits; a Pakistani IBAN must be PK + 2 digits + 4-letter bank code + 16 digits (24 characters).
  - A live message under the field says whether the check digits are valid.
  - SWIFT codes must be 8 or 11 characters.
- **Invoices and quotations** print "Bank details for payment" as a bordered two-column table:
  - left: Beneficiary Name, Beneficiary Address, Bank Name, Branch Address
  - right: Account Number, IBAN Code, Swift Code, Currency
  
  Long values wrap onto a second line. Spacing was tightened so a typical quotation with commercial terms, bank table, six terms and signatures still fits on one page.

Checks: 50 tests (new: IBAN and SWIFT validation, IBAN formatting). Browser-checked:
- "Meezan Bank" mapped to "Meezan Bank Limited"
- the short IBAN "PK123456789" refused, then a valid IBAN accepted
- invoice and quotation PDFs rendered and reviewed, one page each

**Multiple bank accounts.**
- **Settings → Bank accounts** lists any number of accounts (nickname, bank, branch, beneficiary, account number, IBAN, SWIFT, currency) with Edit, Make default and Delete. One account is the default.
- Bank details saved before this change became the first, default account automatically.
- Each quotation (commercial terms) and invoice (when issuing, and later in the invoice window) has a **Bank account to print**: the default, a specific account, or "Don't print bank details". The PDF follows that choice.
- Deleting an account that documents chose makes them print the default.
- Purchase orders never print bank details.
- Accounts are stored in this browser with the company details and included in backups.

Checks: 51 tests (new: moving older details into the first account, default and per-document choice, account labels, required fields). Browser-checked:
- the old single account moved to the list
- a USD account added (an invalid IBAN refused first)
- company save keeps the accounts
- the quote form lists the accounts
- an invoice switched to the USD account, with its PDF printing HBL / USD


### Quotation terms lists (3 Oct 2026)
- **Settings → Quotation terms** keeps two lists, saved immediately:
  - **Payment terms:** add any wording, remove, or make one the default. The five earlier options are included, and duplicates are refused.
  - **Quotation validity:** periods in days (7, 15, 30 to start). Add, remove, or make one the default.
- The validity, payment terms and lead time fields were removed from Company details. The **default lead time is removed**: lead time is written on each quotation.
- **Quote form:**
  - **Quotation validity** dropdown (the default is marked) fills **Valid until** from the quote date and updates when the date changes. Typing a Valid until date selects the matching period, or "Custom date".
  - **Payment terms** dropdown of the list (default preselected) plus **Custom…** for one-off wording on that quotation.
  - **Delivery / lead time (this project)** starts empty.
- Existing quotations keep their own wording; terms removed from the list still show as custom on those quotations.

Checks: 52 tests (new: term and validity lists include the defaults, day counting). Browser-checked:
- adding terms and a 45-day period, refusing a duplicate, changing the default to 30 days
- a new quote defaulting to 30 days; switching to 7 days; changing the date; a typed date matching 15 days
- custom payment terms saved and shown again on reopening


### Line-item table (3 Oct 2026)
Quotations and purchase orders use a compact line-item table in a wider window. Each item is one row (about 47px instead of about 300px):

\# · Description · Material · Gauge · mm · Qty · Unit · Rate (PKR) · Disc % · Amount · ↑ ⧉ ×

- **Amount** shows each line's total after its discount, live.
- **↑** moves a line up, **⧉** duplicates it, **×** removes it (at least one line stays).
- **＋ Add line** starts a new line with the previous line's material, thickness and unit, and focuses its description.
- **Unit:** pcs, sheets, sets, kg, m, m², hrs or lot. It is saved on the line, and the PDF quantity column prints it ("240 sets"). Lines saved earlier have no unit and print just the number.
- **Gauge:** shows "—" when no gauge matches. The gauge explanation is a tooltip on the gauge and mm fields.
- **Totals block:** Subtotal, Discount (shown only when there is one), Sales tax with the % field inside it, and Total.
- **On a phone** the rows wrap into a compact card.

Browser-checked:
- gauge 16 filling 1.519 mm
- line amount 135,000 after a 10% discount
- duplicate, move and remove
- totals 216,000 − 15,000 + 18% tax = 237,180
- seven lines visible at 1366px with no sideways scroll
- the purchase order editor, units saved and printed, no page overflow at 375px
- 52 tests passing


### Customers and vendors (3 Oct 2026)
- **Sidebar:** Customers and Vendors are their own items under HR; Settings is a single page (General).
- **Lists:**
  - summary cards: active count, cities; receivable for customers, open purchase orders for vendors; how many have NTN/STRN or bank details
  - filters: Active / Inactive / All, plus search and CSV export
  - columns: code, name, contact, city, tax, terms (customers) or supplies (vendors), and balance due (red when over the credit limit) or open POs
  - customers keep their Statement button
- **Record fields** (the editor has sections):
  - **General:** code (CUS-0001 / VEN-0001, given automatically; existing records were numbered once by name), type (Company / Individual), contact person, designation, phone, mobile / WhatsApp, email, website, status (Active / Inactive)
  - **Address:** street, city (common cities suggested), province / territory, country
  - **Tax registration:** NTN, STRN, CNIC for individuals (format checked), active taxpayer (ATL) status
  - **Commercial:** customers get default payment terms (from Settings → Quotation terms) and a credit limit; vendors get what they supply and their payment terms
  - **Bank details:** Pakistani bank dropdown (or Other), account title, account number, IBAN (check digits verified), branch
  - **Notes**
- **Where the details are used:**
  - Inactive customers and vendors are hidden from the quote, enquiry and purchase order pickers.
  - Choosing a customer on a quotation fills its default payment terms.
  - Invoices and purchase orders print the party's mobile or phone, city and province, and NTN / STRN (or CNIC) in Bill To / Supplier. Quotations show the city.
- **Deleting** a customer or vendor used on documents offers **Mark inactive** instead; documents keep the name they were issued with.
- The cloud tables store only name, contact, phone, email and address; the other fields are kept in this browser.

Browser-checked:
- sidebar order and existing records numbered
- a full customer record saved, with a bad CNIC refused first
- balance shown over the credit limit
- a new quotation picking up "30 days credit"
- the invoice PDF Bill To showing city and NTN / STRN
- both tables fit at 1366px
- 52 tests passing


### Scrap sales (3 Oct 2026)
**Inventory → Scrap** is now the scrap yard.
- **Summary:** kg in the yard (≈ value at last rates), sold this month (PKR and kg), average realised rate per kg, and scrap generated this month.
- **Collecting scrap:**
  - Skeleton scrap recorded on jobs goes into one bin per material, as before.
  - **＋ Record scrap** adds weighed scrap from other sources (workshop collection, remnant scrapped, rejected parts, job skeleton), optionally linked to a job.
  - Scrap carries no stock value.
- **Scrap yard table:** kg per bin, last rate, estimated value, and Sell / Dispose / History. Dispose is now only for scrap thrown or given away, with no sale.
- **Sell scrap** (SS-YYYY-NNNN):
  - buyer (any name, with customers suggested), buyer phone, date, vehicle no., weighbridge slip no.
  - kg × rate per material, with the rate pre-filled from the last sale of that material and an "All" button for the full bin; kg can't exceed what is in the yard
  - optional sales tax %
  - payment into cash, bank or petty cash, or **On credit** with **Mark received** later
  - each line reduces its bin through a movement linked to the sale
- **Register:** buyer, vehicle/slip, material lines, kg, amount, payment status, posting status, and a scrap sale **PDF** (letterhead, Sale No., vehicle, weighbridge slip, kg × rate, amount in words, received / balance due).
- **Accounting** (Accounts → Journal):
  - sale: Dr cash/bank (or Customer Receivables if on credit), Cr Scrap Sales 4302, Cr VAT Output 2202 for any tax
  - receipt of a credit sale: Dr cash/bank, Cr Customer Receivables
  - scrap revenue appears in the P&L under Scrap Sales
  - credit scrap sales are not in the invoice ageing or customer statements
- **Job card:** shows scrap recovered from the job and its approximate value at the latest rates. This is for information; scrap revenue is booked as income, not against the job.
- Earlier scrap disposals that recorded a sale amount still post as before.

Checks: 56 tests (4 new: totals with tax, can't sell more than the yard, average and latest rates, postings for cash, credit and receipt). Browser-checked:
- 300 kg recorded, 250.5 kg sold on credit at PKR 120 = PKR 30,060, overselling blocked
- marked received into the bank
- both postings, and Scrap Sales in the P&L
- the scrap sale PDF reviewed; no console errors

**Manual scrap weighing.** The yard holds what has been recorded: skeleton weights typed on jobs and Record scrap entries. The job card's scrap % is a costing estimate and is not added to the yard. To work from real weights:
- **⚖ Weigh yard:** enter the actual kg of each material, leaving a row blank to keep it. Each difference becomes a dated movement ("Yard weighed"): more adds scrap, less writes the recorded excess off.
- **Sell by weighbridge weight:** the sale window lists every material, including ones with nothing recorded.
  - If the kg sold is more than recorded, the difference is added first as "weighed at sale".
  - Ticking **This load empties the yard** writes off any recorded scrap left over, so those bins return to zero.
  - The window shows these notes per line before saving.
- These movements carry no value; only the sale itself posts to Scrap Sales.

Checks: 57 tests (new: selling by weight past the recorded kg, weighing differences). Browser-checked:
- weighing 49.5 → 120 kg mild steel and 0 → 35 kg aluminium
- a 150 kg + 30 kg sale for PKR 27,000 adding 30 kg weighed at sale and writing off 5 kg, leaving both bins at 0


### Start fresh (3 Oct 2026)
**Settings → Start fresh** clears the local workspace for new entries.
- **Deleted:** every transaction (enquiries, quotes, purchase orders, expenses, petty cash, work orders, invoices, payments, journals, stock movements, attendance, advances, payroll, scrap sales), and the quote numbering counter.
- **Optionally kept, all ticked by default:** customers and vendors, employees, and the stock item list (sheet and consumable definitions, all at zero; remnants and scrap bins are removed).
- **Always kept:** company details, bank accounts and quotation terms.
- **Safety:** typing DELETE confirms, and a full backup JSON downloads first.
- Not shown while signed in to Supabase.
- Sample records do not come back after a reset.


### Company stamp (3 Oct 2026)
- **The stamp:** a round digital company stamp, drawn as vectors (sharp at any zoom), on **quotations and invoices**, including scrap sale invoices. Purchase orders are not stamped.
  - double outer ring
  - business name around the top arc and the tagline around the bottom
  - stars at the sides
  - two centre lines separated by a rule, defaulting to NTN and STRN
  - a slight tilt and translucent ink, like a pressed rubber stamp
- **Placement:** it sits over the end of the "For GR Synergy Ventures / Authorised signatory" line, about 28 mm across. A little extra room is reserved there, and typical documents still fit on one page.
- **Settings → Company stamp:** live preview, on/off, centre line 1 and 2, bottom text, and ink colour (blue, black or red).
- Stored with the company details in this browser.

**Logo in the stamp.** The centre of the stamp shows the company logo by default (Settings → Company stamp → Centre: Company logo / Text lines). The colour logo is converted in the browser into a single-ink image: dark and coloured parts become the stamp's ink, white becomes transparent. It is drawn rotated with the stamp, so it reads as part of the same impression. Choosing "Text lines" brings back the two centre lines (NTN / STRN by default). The preview in Settings shows the logo.


### Restore from backup (3 Oct 2026)
**Settings → Local saving & backup → Restore from backup…** loads a file saved with Export backup.
- The file is checked first; a damaged or file that is not an app backup is refused and nothing changes.
- A summary (save date, counts, whether company settings are included) is shown before confirming.
- On confirm, the current workspace is exported as a safety backup, then every collection and the company settings (details, bank accounts, terms, stamp) are replaced. Numbering continues from the restored quotes.
- Use it to move the workspace to another computer or web address, since browser storage belongs to one address. Not shown while signed in to Supabase.

### Deployment
The app is static files in `dist/` and needs no build step. Recommended:
1. Keep the GitHub repository private.
2. Deploy with Cloudflare Pages: framework preset None, no build command, output directory `dist`.
3. Protect the site with Cloudflare Zero Trust Access, allowing only the owner's (and staff) emails, because the business name, logo and stamp are part of the app.

`.gitignore` leaves out local backups (`backup-*/`), test output (`output/`, `tmp/`) and editor/hosting files.

## Purchase orders: price per kg and actual weight
- Each PO line has a rate basis next to the rate: **/kg** (Amount = Weight kg × Rate) or **/unit** (Amount = Qty × Rate). New lines start per kg; lines without a weight (gas, nozzles) work per unit.
- The **Weight kg** box is calculated from sheet size × gauge × material density × quantity. Type the supplier's actual weight to override it for the whole line; the box turns orange and **↺** returns to the calculated weight.
- POs saved before this change keep their per-unit pricing, so their totals do not change; switch a line to /kg to reprice it.
- The PO PDF shows "per kg" under the rate, and receiving the PO into stock uses the same line amount.

## Quotations: rounding the area
- **Area rounding** (next to *Line items* in a quotation): *Exact (0.01 ft²)*, *Nearest whole ft²*, *Round up to whole ft²* or *Round up to 0.5 ft²*. It applies to every line priced by area and is saved with the quote. Rounded areas show in blue.
- Any line's **Area ft²** can be typed (e.g. 21.88 → 22). A typed area shows in orange and **↺** returns to the calculated area.
- Amount = area × rate uses the rounded or typed area, and the quotation PDF prints it.

## Work order sheet plan: shared sheets and oversize parts
The job card uses the same planning engine as the sheet calculator (`sheetplan.mjs`, on top of `nesting.mjs`).
- **Option 1 · Each line on its own sheets** (default) or **Option 2 · Combine lines on shared sheets**: the ticked lines (Combine column) of the same material and gauge are nested together. Each group compares every sheet size; pick one with **Use** (or Back to Auto). The last shared sheet can drop to a smaller size.
- **Oversize parts** (Auto / equal pieces / full lengths + remainder): parts bigger than the sheet are cut in pieces in both options, with a joint plan.
- Drawings show every sheet to scale with the parts coloured per line, the cut list for each sheet and the biggest leftover. The plan (mode, split method, combine ticks, chosen shared sheets) is saved with the job.
- **Job card PDF** prints the sheet plan, the joint plans and each sheet layout with its cut list for the operator.
- **Issue from stock** pre-selects the sheets from the plan and offers each sheet's leftover (including shared and split sheets) as remnant or scrap; remnants record the job and "Shared sheet A" / "Line 1 (split)".

### One-click line completion (11 Oct 2026)
Work orders → Scope of work: each line item has a **✓ Complete line** button under its progress bar. One click marks every step on that line Done (with all pieces counted for piece-tracked steps) instead of clicking each cell. Steps marked N/A stay N/A, and steps already done keep their original completion date. Jobs with several lines also get **✓ Complete all lines** on the All lines row. The button disappears once a line is at 100%, and any cell can still be clicked to change it back. Completing every line does not complete the job itself: use Mark completed as before, which still checks that business material was issued from stock. Originals are in `backup-2026-10-11`.

### Cloud workspace with Supabase (11 Oct 2026)
The app now syncs the **whole** workspace (every module: sales, jobs, inventory, HR, accounts, plus company settings, bank accounts, terms and stamp) with the Supabase project **GR_Ventures** (`https://uxjctefrkkscwwctkmqq.supabase.co`). The connection settings are pre-filled.

**First time**
1. In Supabase → **Authentication → Users → Add user → Create new user**, enter your email and a password and tick **Auto Confirm User**.
2. In the app: **Settings → Sign in to the cloud**, enter that email and password.
3. The cloud is empty the first time, so the app offers **Back up and upload** (downloads a backup file, then uploads this browser's workspace) or **Start empty**.
4. On any other computer or phone, open the app and sign in with the same account; the workspace loads from the cloud.

**How it works**
- Each record is one row in `workspace_docs`, private to the signed-in user by row-level security. The browser can only read; all writes go through the `workspace_push` function, which checks a version number per record.
- Changes are sent about a second after you make them; changes from other browsers arrive every 15 seconds (or press **Sync now**). The top bar shows *Cloud synced*, *Cloud · saving…* or *Cloud sync paused*.
- If the same record is changed in two browsers at once, the cloud copy is kept and the app tells you, so nothing is overwritten silently.
- If the connection drops, changes stay in the open tab and are sent when it returns; closing the tab with unsent changes asks for confirmation.
- "Keep me signed in" keeps the sign-in after a reload. Signing out brings back this browser's local workspace, which is never changed while signed in.
- Restore from backup and Start fresh work in the cloud too and affect every signed-in browser.

**Setup files**: `supabase/workspace-sync.sql` (already applied to GR_Ventures; safe to re-run on another project). The older per-table `schema.sql` setup is no longer used by the app.

**Limits**: one account = one workspace (staff accounts sharing a workspace are not supported yet). Quote numbers are worked out from the records, so two browsers creating a quote in the same few seconds could pick the same number; check before sending. Checks: `node --test tests/*.mjs`; the SQL was tested on Postgres and on the live project (signed-out access refused, other users see nothing); two-browser sync, conflict handling, reload and sign-out were tested against a stand-in server.

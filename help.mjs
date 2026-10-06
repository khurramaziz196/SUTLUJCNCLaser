// Help centre content: workflows, module guides, glossary / FAQ and the guided tour. Plain data so the
// wording can be edited without touching the app.

// Each step can open a page (and tab) of the app.
export const workflows = [
  {id: 'sell', title: 'From enquiry to payment', sub: 'The everyday sales and production flow.', steps: [
    {label: 'Enquiry', page: 'sales', tab: 'enquiry', text: 'Record what the customer asked for. Convert it to a quote with one click.'},
    {label: 'Quotation', page: 'sales', tab: 'quote', text: 'Price each line by area (W × L in inches) or by quantity. Use the Sheet calculator to plan sheets (combine items on shared sheets to save offcut) and get a suggested rate. Send the PDF with your stamp.'},
    {label: 'Accepted', page: 'sales', tab: 'quote', text: 'Set the status to Accepted. The quote appears in Work orders, ready to start.'},
    {label: 'Job card', page: 'workorders', text: 'Create the job card. Check the sheet plan, set the due date and operator, and track every line in the scope of work.'},
    {label: 'Issue sheets', page: 'workorders', text: 'Issue from stock on the job card: the planned sheets are pre-selected; choose which offcuts are remnants and which are scrap.'},
    {label: 'Cut & QC', page: 'workorders', text: 'Count pieces cut and checked (e.g. 2/4) in the scope matrix. Record labour, machine time and job expenses.'},
    {label: 'Delivery note', page: 'deliveries', text: 'Deliver in full or in parts. Each delivery note keeps its revisions; the PDF has received-by and stamp.'},
    {label: 'Invoice', page: 'invoices', text: 'Completed jobs wait here. Create the invoice; the PDF shows your bank account and stamp.'},
    {label: 'Payment', page: 'invoices', text: 'Record what the customer paid (full or part). Overdue invoices appear on the Overview.'},
    {label: 'Post to accounts', page: 'accounts', tab: 'dash', text: 'Accounts → Dashboard → Post all. Reports (P&L, balance sheet, cash flow) then include everything.'}
  ]},
  {id: 'buy', title: 'Buying material', sub: 'From purchase order to paying the supplier.', steps: [
    {label: 'Purchase order', page: 'procurement', text: 'Choose the vendor, material, gauge and standard sheet size on each line. Download the PO with your stamp.'},
    {label: 'Receive (GRN)', page: 'inventory', text: 'Inventory → Purchase orders to receive. Each line is matched to its stock item, or a new item is created for a new size.'},
    {label: 'Vendor bill', page: 'vendors', text: 'A received PO becomes a bill on the vendor account. Payment terms set the due date.'},
    {label: 'Pay vendor', page: 'vendors', text: 'Vendors → To pay → Account → Record payment, against a bill or the oldest bills first.'},
    {label: 'Post', page: 'accounts', tab: 'dash', text: 'Post the receipt and the payment so stock, payables and bank are right in the books.'}
  ]},
  {id: 'month', title: 'Month-end routine', sub: 'Fifteen minutes that keep the books and stock honest.', steps: [
    {label: 'Post all', page: 'accounts', tab: 'dash', text: 'Clear the posting queue. Classify any expenses still without an account.'},
    {label: 'Stock take', page: 'inventory', text: 'Count sheets, remnants and consumables. Post the variances in one go.'},
    {label: 'Statements', page: 'customers', text: 'Send statements of account to customers who owe you; check vendor balances.'},
    {label: 'Reports', page: 'accounts', tab: 'reports', text: 'Review the P&L against last month, the balance sheet and the cash flow.'},
    {label: 'Lock & back up', page: 'settings', text: 'Lock the month in Accounts → Dashboard, then Settings → Export backup and keep the file safe.'}
  ]}
];

// Guides per area of the app. page = where the "Open" button goes; topics = which pages show this guide from the ? button.
export const guides = [
  {id: 'overview', title: 'Overview', page: 'overview', topics: ['overview'], what: 'Your daily dashboard: this month\'s sales, cash collected, money owed and expenses, everything that needs action, the shop floor and quote performance.', steps: ['Start the day here: work through Needs attention from the top (red first).', 'Click any headline figure or attention item to jump to the right page.', 'On the shop floor, click a job to open its card.'], tips: ['Figures compare with last month (▲ / ▼).', 'Needs attention covers overdue invoices, late jobs, jobs to invoice or deliver, expiring quotes, POs to receive, low stock, scrap, vendors to pay and unposted entries.']},
  {id: 'sales', title: 'Quotations & enquiries', page: 'sales', topics: ['sales'], what: 'Professional quotations numbered Q-ABC-00001, with status, validity, payment terms, bank details and your stamp.', steps: ['＋ New quote → choose the customer (or add one).', 'Add lines: description, W × L in inches, quantity, material and gauge. Area ft² is calculated; amount = area × rate when a size is given, otherwise qty × rate.', 'Open the Sheet calculator to plan sheets, see the layout and get a suggested rate per ft²; Apply to quote.', 'Pick payment terms, validity and lead time, then Download PDF.', 'Change the status in the list (Draft → Sent → Accepted / Declined).'], tips: ['Copy duplicates a quote for a similar job.', 'Expired quotes are flagged so you can follow up.', 'Enquiries can be converted to quotes.']},
  {id: 'calculator', title: 'Sheet calculator', page: 'sales', topics: [], what: 'Plan sheets for any list of parts, compare standard sheet sizes, see the cutting layout to scale and price the job.', steps: ['Sales → Sheet calculator, or Open sheet calculator inside a quote.', 'Enter items with qty, material, gauge and W × L (in). Sheet = Auto picks the size with least offcut.', 'Adjust gap, edge margin, rotation and which sizes to compare.', 'Enter material rate per kg, markup and cutting rate to get a suggested rate per ft².', 'Apply to quote (tick “Also set suggested rates” to fill rates).'], tips: ['Option 2 · Combine items on shared sheets nests different items of the same material and gauge together, shows each shared sheet in colour per item and how much it saves against Option 1.', 'In Option 2 untick an item to keep it on its own sheets; the last sheet can drop to a smaller size when everything left fits.', 'Pop out opens it in its own window, e.g. on a second screen.', 'Edge margin is the unused border; 0 mm suits full-length strips.']},
  {id: 'workorders', title: 'Work orders & job cards', page: 'workorders', topics: ['workorders'], what: 'Turn accepted quotes into job cards and run production: sheet plan, scope of work per line, material, labour and costs.', steps: ['Accepted quotes appear at the top: Create job card.', 'Sheet plan: check sizes, sheet, pieces per sheet and the layout; Best sheet suggests the least offcut.', 'Issue from stock: planned sheets are pre-selected; mark offcuts as remnant or scrap.', 'Scope of work: click a cell to set status or count pieces (2/4). All lines sets a task everywhere.', 'Record labour and job expenses; Mark completed when every task is done or N/A.'], tips: ['The stage track shows where the job is; overdue jobs show in red.', 'Job card PDF is for the workshop floor.', 'Job cost and margin use material issued, machine time, labour and expenses.']},
  {id: 'deliveries', title: 'Delivery notes', page: 'deliveries', topics: ['deliveries'], what: 'Deliver jobs in one go or in parts, with a numbered delivery note for each trip and every revision kept.', steps: ['Delivery notes → Ready to deliver, or ＋ Delivery note on a job card.', 'Enter pieces in this delivery (default = remaining), vehicle, driver and address.', 'Download the PDF for signature; fill Received by when it comes back.', 'Edit to make a revision (Rev 1, Rev 2…) with a reason; Cancel instead of delete.'], tips: ['Partial / Final is set automatically.', 'A scope task called “Delivery / dispatch” follows the pieces delivered.']},
  {id: 'invoices', title: 'Invoices & payments', page: 'invoices', topics: ['invoices'], what: 'Invoice completed jobs, record payments and follow up overdue balances.', steps: ['Completed work orders wait under Ready to invoice: Create invoice.', 'Check the due date (from payment terms) and download the PDF with bank details.', 'Record payment: full or part, into bank, cash or petty cash.'], tips: ['Filters: Unpaid, Part paid, Overdue, Paid.', 'Customer statements live on the customer account page.']},
  {id: 'procurement', title: 'Purchase orders', page: 'procurement', topics: ['procurement'], what: 'Order material and consumables with standard sheet sizes and send professional POs.', steps: ['＋ New purchase order → vendor and lines.', 'For sheets choose material, gauge and Sheet size (or Custom ft); weight is calculated. Amount = qty × rate.', 'Download PDF, set status Ordered, then Received when it arrives.', 'Receive into stock from Inventory.'], tips: ['Choosing a size fills the description (e.g. “Mild steel sheet 4 ga 4′ × 8′”).', '— Size — is for gas, nozzles and other items without a size.']},
  {id: 'inventory', title: 'Inventory & stock take', page: 'inventory', topics: ['inventory'], what: 'Sheets, remnants, consumables, customer material and scrap, valued at weighted average cost.', steps: ['Receive POs from Purchase orders to receive (new sizes become stock items automatically).', 'Issue to jobs from the job card.', '± Adjust stock for damage, loss or corrections (with a reason).', '☑ Stock take: print the blind count sheet, enter counts, post all variances.', 'Valuation tab: value by item, slow-moving stock.'], tips: ['＋ Stock item → “Create all 5 standard sizes” sets up a material in one go.', 'Remnants show which job they came from; use them before cutting a new sheet.', 'Scrap tab: weigh and sell scrap by the kilo.']},
  {id: 'accounts', title: 'Accounts', page: 'accounts', topics: ['accounts'], what: 'Double-entry books from your day-to-day records, with professional reports.', steps: ['Dashboard: cash, receivables, payables, profit and what is awaiting posting.', 'Post all… posts the queue with reviewable default accounts.', 'Ledger: any account, any period, running balance.', 'Reports: P&L (compare periods), balance sheet, trial balance, cash flow, sales tax.', 'Lock the books after month-end.'], tips: ['Only posted entries appear in reports; operational pages work without posting.', 'Chart of Accounts: add your own accounts, rename or deactivate.', 'Corrections use a reversal or a journal, never deletion.']},
  {id: 'hr', title: 'HR & payroll', page: 'hr', topics: ['hr'], what: 'Employees, attendance, advances and monthly payroll with payslips.', steps: ['Add employees with pay type (monthly / daily) and rate.', 'Mark attendance for the month.', 'Give advances; they are recovered through payroll.', 'Prepare payroll, finalise, then mark salaries paid; download payslips.'], tips: ['Payroll posts to accounts when finalised and when paid.']},
  {id: 'parties', title: 'Customers & vendors', page: 'customers', topics: ['customers', 'vendors'], what: 'Full contact, tax and bank details, plus a complete account for each customer and vendor.', steps: ['Add customers and vendors with NTN / STRN, terms and bank details.', 'Click a name for the account: ledger, monthly summary, ageing, documents and payments.', 'Statement PDF gives a professional statement of account with remit-to details.', 'Vendors → To pay lists who you owe; Record payment from the vendor account.'], tips: ['Set payment terms (e.g. “30 days credit”) so due dates and overdue figures are right.', 'Customers → To collect lists who owes you.']},
  {id: 'settings', title: 'Settings & backup', page: 'settings', topics: ['settings'], what: 'Company details, bank accounts, stamp, quotation defaults, backup and restore.', steps: ['Company details: name, address, NTN / STRN, tagline (printed on every document).', 'Bank accounts: add one or more; choose which prints on each document.', 'Stamp: colour, centre logo or text.', 'Export backup regularly; Restore from backup moves data to another browser or computer.'], tips: ['Data is saved in this browser. Back up before clearing browser data or changing computer.', 'Start fresh clears entries for testing (a backup is made first).']}
];

export const glossary = [
  ['Posting', 'Writing a transaction into the accounting books as debits and credits. Only posted entries appear in financial reports.'],
  ['Post all', 'Posts every waiting transaction in one go, after showing you exactly what each entry will be.'],
  ['Period lock', 'Closes the books up to a date so nothing can be posted into a finished month by mistake.'],
  ['GRN (goods received)', 'Receiving a purchase order into stock. It creates the stock receipt and the supplier bill.'],
  ['Weighted average cost', 'Stock is valued at the average price paid; each issue takes that average out.'],
  ['Remnant', 'A usable offcut returned to stock with its share of the sheet cost and a note of the job it came from.'],
  ['Scrap / skeleton', 'Unusable leftover after cutting, weighed into the scrap yard and sold by the kilo.'],
  ['Sheet plan', 'How many parts fit on a sheet and how many sheets a line needs, with the cutting layout.'],
  ['Edge margin / gap', 'Margin: unused border round the sheet. Gap: space between parts for the laser kerf.'],
  ['Area pricing', 'A quote line with W × L is priced on its total area in ft² (area × rate).'],
  ['Revision', 'A new version of a delivery note; the old version is kept and can still be printed.'],
  ['Ageing', 'Money owed split by how late it is: not yet due, 1–30, 31–60, 61–90, over 90 days.'],
  ['WHT (withholding tax)', 'Income tax deducted at payment. Deducted from you by customers = advance tax (1103); deducted by you from suppliers or salaries = payable to FBR (2204 / 2205).'],
  ['Sales tax (GST)', 'Output tax on your invoices less input tax on purchases = net payable to FBR.'],
  ['Stock take', 'A physical count of many items at once; differences are posted as adjustments.'],
  ['Backup', 'A file with all your records and settings. Keep a recent one somewhere safe.']
];

export const faq = [
  ['Where is my data stored?', 'In this browser on this device. Use Settings → Export backup regularly, and Restore from backup to move it to another computer or phone.'],
  ['Why don’t my reports show an invoice?', 'Reports use posted entries only. Go to Accounts → Dashboard → Post all.'],
  ['How do I correct a posted entry?', 'Open it in the Journal and reverse it, then post the correct entry. Posted entries are never edited, so the history stays complete.'],
  ['Can I deliver part of an order?', 'Yes. Create a delivery note with the pieces sent now; the balance stays on Ready to deliver for the next one.'],
  ['The app looks old after an update', 'Press Cmd + Shift + R (Ctrl + Shift + R on Windows) to load the latest version.'],
  ['Can I use it on my phone?', 'Yes. Open the same address; lists become cards. On iPhone use Share → Add to Home Screen. Data on the phone is separate unless you restore a backup or connect Supabase.']
];

// Guided tour: each step opens a page and explains it.
export const tourSteps = [
  {page: 'overview', title: 'Welcome to GR Synergy Ventures', text: 'This tour shows where everything lives. The Overview is your daily dashboard: money this month, what needs attention and what is on the shop floor.'},
  {page: 'sales', title: 'Sales', text: 'Enquiries and quotations. Price lines by area or quantity, plan sheets with the Sheet calculator and send stamped PDFs.'},
  {page: 'workorders', title: 'Work orders', text: 'Accepted quotes become job cards: sheet plan, scope of work per line (count pieces), material issued, labour and job cost.'},
  {page: 'deliveries', title: 'Delivery notes', text: 'Deliver in full or in parts. Every delivery note keeps its revisions.'},
  {page: 'invoices', title: 'Invoices', text: 'Invoice completed jobs and record payments. Overdue invoices show on the Overview.'},
  {page: 'procurement', title: 'Procurement', text: 'Purchase orders with standard sheet sizes. When the material arrives, receive it in Inventory.'},
  {page: 'inventory', title: 'Inventory', text: 'Sheets, remnants, consumables and scrap. Adjust stock, run stock takes and see the valuation.'},
  {page: 'accounts', title: 'Accounts', text: 'Post your transactions, then read the P&L, balance sheet and cash flow. Lock each finished month.'},
  {page: 'customers', title: 'Customers & vendors', text: 'Click any name for a full account: ledger, ageing, statements and payments.'},
  {page: 'settings', title: 'Settings', text: 'Company details, bank accounts, stamp and backups. Export a backup regularly.'},
  {page: 'help', title: 'Help is always here', text: 'Open Help from the sidebar or the ? in the top bar — it opens the guide for the page you are on.'}
];

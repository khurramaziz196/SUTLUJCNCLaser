// Statement of account (customer or vendor): letterhead, account details, account summary, ageing,
// every transaction with running balance, open items, monthly summary, balance in words, where to pay,
// signatures and stamp. Optional options (company, party, open, age, monthly, bankAccount, stampLogo)
// add sections; without them it still prints the transactions and totals.
import {amountInWords,formatIBAN} from './documents.mjs?v=gr-1';
import {drawStamp} from './stamp.mjs?v=logo-2';

export async function createStatementPDF(statement, logoBytes, PDFLib, options = {}) {
  const {PDFDocument, StandardFonts, rgb} = PDFLib;
  if (!statement?.party?.trim()) throw Error('Choose a customer for the statement.');
  const vendor = options.kind === 'vendor';
  const L = {ref: 'REFERENCE', charges: vendor ? 'BILLED' : 'INVOICED', received: vendor ? 'PAID' : 'RECEIVED', forLabel: vendor ? 'SUPPLIER' : 'ACCOUNT HOLDER', chargedLine: vendor ? 'Billed in period' : 'Invoiced in period', receivedLine: vendor ? 'Paid in period' : 'Received in period', due: vendor ? 'BALANCE PAYABLE' : 'BALANCE DUE', empty: 'No transactions in this period.', ...(options.labels || {})};
  const company = {name: options.companyName || 'GR Synergy Ventures', ...(options.company || {})}, party = options.party || {};
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.10, .17, .21), blue = rgb(.06, .26, .45), muted = rgb(.40, .46, .49), line = rgb(.86, .89, .91), white = rgb(1, 1, 1), tint = rgb(.95, .97, .98), zebra = rgb(.98, .985, .99), warn = rgb(.63, .27, .11);
  const logo = await pdf.embedJpg(logoBytes);
  const clean = v => String(v ?? '').replace(/\r?\n/g, ' ').replace(/[‐-―]/g, '-').replace(/[–—]/g, '-').replace(/\t/g, ' ');
  const amount = v => Number(v || 0).toLocaleString('en-PK', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const dash = v => Number(v) ? amount(v) : '-';
  try { [statement.party, company.name, company.address, party.address, party.contact, ...statement.entries.flatMap(e => [e.reference, e.details])].forEach(v => regular.encodeText(clean(v))); }
  catch { throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this account\'s records.'); }
  const fit = (value, width, size, font) => { let s = clean(value); if (font.widthOfTextAtSize(s, size) <= width) return s; while (s.length > 1 && font.widthOfTextAtSize(s + '...', size) > width) s = s.slice(0, -1); return s + '...'; };
  const wrap = (value, width, size, font = regular) => { const out = []; let cur = ''; for (const w of clean(value).split(/ +/)) { if (!w) continue; const t = cur ? cur + ' ' + w : w; if (font.widthOfTextAtSize(t, size) <= width) cur = t; else { if (cur) out.push(cur); cur = w; } } if (cur) out.push(cur); return out; };
  let page, y;
  const text = (value, x, yy, size = 9, font = regular, color = ink) => page.drawText(clean(value), {x, y: yy, size, font, color});
  const right = (value, x, yy, size = 9, font = regular, color = ink) => text(value, x - font.widthOfTextAtSize(clean(value), size), yy, size, font, color);
  const rule = (yy, t = .5) => page.drawLine({start: {x: 42, y: yy}, end: {x: 553, y: yy}, thickness: t, color: line});
  const label = (v, x, yy) => text(v, x, yy, 8, bold, muted);
  const newPage = () => { page = pdf.addPage([595.28, 841.89]); y = 790; text(company.name.toUpperCase(), 42, y, 10, bold, blue); right(`Statement of account - ${fit(statement.party, 260, 9, regular)}`, 553, y, 9, regular, muted); rule(776, 1); y = 752; };
  const ensure = h => { if (y - h < 70) { newPage(); return true; } return false; };
  const section = (title, need) => { ensure(need + 24); label(title, 42, y); y -= 6; rule(y); y -= 16; };

  // Letterhead: logo, company details; document title and statement details on the right.
  page = pdf.addPage([595.28, 841.89]);
  page.drawImage(logo, {x: 38, y: 716, width: 92, height: 92});
  let cy = 792;
  text(company.name, 140, cy, 15, bold, blue); cy -= 14;
  if (company.tagline) { text(company.tagline, 140, cy, 8.5, regular, muted); cy -= 14; }
  for (const row of [...wrap(company.address, 200, 8.5), [company.phone, company.email].filter(Boolean).join('  |  '), company.website, [company.ntn && `NTN ${company.ntn}`, company.strn && `STRN ${company.strn}`].filter(Boolean).join('  |  ')].filter(Boolean)) { text(row, 140, cy, 8.5); cy -= 12; }
  right('STATEMENT OF ACCOUNT', 553, 794, 15, bold, blue);
  const meta = [['Statement date', options.preparedOn || statement.to], ['Period from', statement.from], ['Period to', statement.to], ...(party.code ? [['Account No.', party.code]] : []), ['Currency', 'PKR'], ...(party.payment_terms ? [['Payment terms', party.payment_terms]] : [])];
  const boxTop = 774, rowH = 15, boxH = meta.length * rowH + 10;
  page.drawRectangle({x: 358, y: boxTop - boxH, width: 195, height: boxH, color: tint});
  meta.forEach(([k, v], i) => { const yy = boxTop - 14 - i * rowH; text(k, 366, yy, 8.5, regular, muted); right(fit(v, 105, 9, bold), 545, yy, 9, bold); });
  y = Math.min(cy, boxTop - boxH, 716) - 12; rule(y, 1); y -= 20;

  // Account holder on the left, account summary on the right.
  const top = y;
  label(L.forLabel, 42, y); y -= 17;
  for (const r of wrap(statement.party, 250, 12, bold)) { text(r, 42, y, 12, bold); y -= 16; }
  const contact = party.contact ? `Attn: ${party.contact}${party.designation ? `, ${party.designation}` : ''}` : '';
  for (const [v, f, c] of [[contact, regular, ink], [[party.phone || party.mobile, party.email].filter(Boolean).join('  |  '), regular, ink], [[party.address, [party.city, party.province].filter(Boolean).join(', ')].filter(Boolean).join(', '), regular, muted], [[party.ntn && `NTN ${party.ntn}`, party.strn && `STRN ${party.strn}`, !party.ntn && party.cnic && `CNIC ${party.cnic}`].filter(Boolean).join('  |  '), bold, ink]]) if (v) for (const r of wrap(v, 250, 9, f)) { text(r, 42, y, 9, f, c); y -= 13; }
  const leftEnd = y;
  const sum = [[`Opening balance (${statement.from})`, amount(statement.opening)], [L.chargedLine, amount(statement.charged)], [L.receivedLine, amount(statement.received)], ...(options.age?.overdue ? [['of which overdue', amount(options.age.overdue)]] : []), ...(Number(party.credit_limit) && !vendor ? [['Credit limit', amount(party.credit_limit)]] : [])];
  const sx = 320, sw = 233, sTop = top + 4, sH = sum.length * 17 + 14 + 34;
  page.drawRectangle({x: sx, y: sTop - sH, width: sw, height: sH, borderColor: line, borderWidth: .8});
  text('ACCOUNT SUMMARY (PKR)', sx + 10, sTop - 14, 8, bold, muted);
  sum.forEach(([k, v], i) => { const yy = sTop - 32 - i * 17; text(k, sx + 10, yy, 9, regular, k === 'of which overdue' ? warn : ink); right(v, sx + sw - 10, yy, 9, k === 'of which overdue' ? bold : regular, k === 'of which overdue' ? warn : ink); });
  page.drawRectangle({x: sx, y: sTop - sH, width: sw, height: 30, color: blue});
  text(L.due, sx + 10, sTop - sH + 11, 9.5, bold, white); right(amount(statement.closing), sx + sw - 10, sTop - sH + 10, 13, bold, white);
  y = Math.min(leftEnd, sTop - sH) - 22;

  // Ageing of the closing balance.
  if (options.age?.buckets) {
    section(vendor ? 'AGEING OF AMOUNT PAYABLE' : 'AGEING OF AMOUNT DUE', 46);
    const cells = [...options.age.buckets.map(b => [b.label.replace('–', '-'), b.amount]), ['Total', options.age.total]], cw = 511 / cells.length;
    page.drawRectangle({x: 42, y: y - 26, width: 511, height: 40, color: tint});
    cells.forEach(([k, v], i) => { const x = 42 + i * cw; if (i) page.drawLine({start: {x, y: y + 14}, end: {x, y: y - 26}, thickness: .5, color: white}); const late = i > 0 && i < cells.length - 1 && Number(v) > 0; text(k, x + 8, y, 7.5, bold, i === cells.length - 1 ? blue : muted); text(dash(v), x + 8, y - 16, 10, bold, late ? warn : i === cells.length - 1 ? blue : ink); });
    y -= 50;
  }

  // Transactions with running balance.
  const cols = {date: 50, type: 104, ref: 146, det: 222, due: 298, dr: 412, cr: 480, bal: 546};
  const header = () => { page.drawRectangle({x: 42, y: y - 9, width: 511, height: 24, color: blue}); text('DATE', cols.date, y, 7.5, bold, white); text('TYPE', cols.type, y, 7.5, bold, white); text(L.ref, cols.ref, y, 7.5, bold, white); text('DETAILS', cols.det, y, 7.5, bold, white); text('DUE DATE', cols.due, y, 7.5, bold, white); right(L.charges, cols.dr, y, 7.5, bold, white); right(L.received, cols.cr, y, 7.5, bold, white); right('BALANCE', cols.bal, y, 7.5, bold, white); y -= 26; };
  section('TRANSACTIONS', 80); header();
  const row = (cells, {font = regular, shade = false, color = ink} = {}) => {
    if (ensure(22)) header();
    if (shade) page.drawRectangle({x: 42, y: y - 6, width: 511, height: 19, color: shade === true ? zebra : shade});
    text(cells[0], cols.date, y, 8.5, font, color); text(cells[1], cols.type, y, 8.5, font, color); text(fit(cells[2], 74, 8.5, font), cols.ref, y, 8.5, font, color); text(fit(cells[3], 72, 8.5, font), cols.det, y, 8.5, font, font === bold ? color : muted); text(cells[4], cols.due, y, 8.5, font, muted);
    right(cells[5], cols.dr, y, 8.5, font, color); right(cells[6], cols.cr, y, 8.5, font, color); right(cells[7], cols.bal, y, 8.5, bold, color); y -= 19;
  };
  row([statement.from, '', 'Opening balance', 'Brought forward', '', '', '', amount(statement.opening)], {font: bold, shade: tint});
  statement.entries.forEach((e, i) => row([e.date, e.type, e.reference, e.details, e.due_date || '', e.charge ? amount(e.charge) : '', e.credit ? amount(e.credit) : '', amount(e.balance)], {shade: i % 2 === 1}));
  if (!statement.entries.length) { text(L.empty, cols.date, y, 8.5, regular, muted); y -= 19; }
  rule(y + 12);
  row([statement.to, '', 'Totals / closing', 'Carried forward', '', amount(statement.charged), amount(statement.received), amount(statement.closing)], {font: bold, shade: tint, color: blue});
  y -= 8;

  // Open items.
  const open = (options.open || []).filter(o => Number(o.due) > 0);
  if (open.length) {
    section(vendor ? 'UNPAID BILLS' : 'OPEN INVOICES', 60);
    const oc = {ref: 50, date: 150, due: 220, late: 330, amt: 410, paid: 478, bal: 546};
    const oh = () => { page.drawRectangle({x: 42, y: y - 8, width: 511, height: 22, color: tint}); for (const [k, x, r] of [[vendor ? 'BILL / PO' : 'INVOICE', oc.ref], ['DATE', oc.date], ['DUE DATE', oc.due], ['DAYS OVERDUE', oc.late, 1], ['AMOUNT', oc.amt, 1], ['PAID', oc.paid, 1], ['BALANCE', oc.bal, 1]]) (r ? right : text)(k, x, y, 7.5, bold, muted); y -= 24; };
    oh();
    const asAt = options.preparedOn || statement.to;
    for (const o of open) { if (ensure(20)) oh(); const late = Math.round((Date.parse(asAt + 'T00:00:00Z') - Date.parse((o.due_date || o.date) + 'T00:00:00Z')) / 86400000); text(fit(o.reference, 95, 8.5, bold), oc.ref, y, 8.5, bold); text(o.date, oc.date, y, 8.5); text(o.due_date || o.date, oc.due, y, 8.5); right(late > 0 ? `${late} days` : 'Not due', oc.late, y, 8.5, late > 0 ? bold : regular, late > 0 ? warn : muted); right(amount(o.amount), oc.amt, y, 8.5); right(dash(o.paid), oc.paid, y, 8.5); right(amount(o.due), oc.bal, y, 8.5, bold); y -= 13; rule(y + 4); y -= 6; }
    y -= 6;
  }

  // Monthly summary for the period.
  const lastMonth = [statement.to, options.preparedOn || statement.to].sort()[0].slice(0, 7);
  let months = (options.monthly || []).filter(m => m.month >= statement.from.slice(0, 7) && m.month <= lastMonth);
  const first = months.findIndex(m => m.count || m.closing); months = first < 0 ? [] : months.slice(first); // start at the first month with a balance or activity
  if (months.length > 1) {
    section('MONTHLY SUMMARY', 40);
    const mc = {m: 50, a: 250, b: 340, n: 440, c: 546};
    const mh = () => { page.drawRectangle({x: 42, y: y - 8, width: 511, height: 22, color: tint}); text('MONTH', mc.m, y, 7.5, bold, muted); right(L.charges, mc.a, y, 7.5, bold, muted); right(L.received, mc.b, y, 7.5, bold, muted); right('NET', mc.n, y, 7.5, bold, muted); right('CLOSING BALANCE', mc.c, y, 7.5, bold, muted); y -= 22; };
    mh();
    for (const m of months) { if (ensure(16)) mh(); const name = new Date(m.month + '-01T00:00:00Z').toLocaleDateString('en-GB', {month: 'long', year: 'numeric', timeZone: 'UTC'}); text(name, mc.m, y, 8.5, regular, m.count ? ink : muted); right(dash(m.charged), mc.a, y, 8.5); right(dash(m.credited), mc.b, y, 8.5); right(m.net ? amount(m.net) : '-', mc.n, y, 8.5); right(amount(m.closing), mc.c, y, 8.5, bold); y -= 15; }
    rule(y + 9); y -= 8;
  }

  // Balance in words.
  ensure(40); label(vendor ? 'BALANCE PAYABLE IN WORDS' : 'BALANCE DUE IN WORDS', 42, y); y -= 14;
  for (const r of wrap(statement.closing < 0 ? `${amountInWords(-statement.closing)} (in credit)` : amountInWords(statement.closing), 511, 9.5, bold)) { text(r, 42, y, 9.5, bold); y -= 13; }
  y -= 10;

  // Where to pay: our bank account for customers, the supplier's bank for vendors.
  const bank = vendor ? (party.iban || party.account_number ? {bank_name: party.bank_name, account_title: party.account_title || statement.party, account_number: party.account_number, iban: party.iban, bank_branch: party.bank_branch} : null) : options.bankAccount;
  if (bank && statement.closing > 0) {
    section(vendor ? 'SUPPLIER BANK DETAILS' : 'PLEASE REMIT PAYMENT TO', 60);
    const pairs = [['Account title', bank.account_title || company.name], ['Bank', bank.bank_name], ['Account number', bank.account_number], ['IBAN', formatIBAN(bank.iban)], ['Branch', bank.bank_branch], ...(!vendor && bank.swift ? [['Swift', bank.swift]] : [])].filter(([, v]) => v);
    const half = Math.ceil(pairs.length / 2), h = half * 15 + 8, t = y + 10;
    page.drawRectangle({x: 42, y: t - h, width: 511, height: h, borderColor: line, borderWidth: .8});
    page.drawLine({start: {x: 300, y: t}, end: {x: 300, y: t - h}, thickness: .8, color: line});
    pairs.forEach(([k, v], i) => { const col = i < half ? 0 : 1, yy = t - 14 - (i % half) * 15, x = col ? 308 : 50; text(k, x, yy, 8.5, regular, muted); text(fit(v, col ? 160 : 150, 8.5, bold), x + 85, yy, 8.5, bold); });
    y = t - h - 18;
  }

  // Notes.
  const notes = vendor ? ['Please confirm this balance or send your own statement if it differs.', `Bills are purchase orders received; payments are those recorded up to ${options.preparedOn || statement.to}.`] : [`Please check this statement and report any difference within 15 days of ${options.preparedOn || statement.to}; otherwise it will be taken as correct.`, 'Payments made after the statement date are not shown. Kindly quote the invoice number with your payment.'];
  ensure(40); label('NOTES', 42, y); y -= 13;
  for (const n of notes) for (const r of wrap('- ' + n, 511, 8.5)) { text(r, 42, y, 8.5, regular, muted); y -= 11; }

  // Signatures and company stamp.
  const stamped = company.stamp_enabled !== false && options.stampLogo !== undefined;
  if (y - (stamped ? 120 : 80) < 60) newPage();
  y = Math.min(y - 70, 150);
  if (stamped) { const ink2 = await options.stampLogo; const logoImg = ink2?.bytes ? await pdf.embedPng(ink2.bytes) : null; drawStamp(page, PDFLib, {bold, regular}, company, {cx: 262, cy: y - 2, r: 40, logo: logoImg}); }
  page.drawLine({start: {x: 42, y}, end: {x: 230, y}, thickness: .6, color: ink}); page.drawLine({start: {x: 365, y}, end: {x: 553, y}, thickness: .6, color: ink});
  text(`For ${company.name}`, 42, y - 14, 9, bold); text('Authorised signatory', 42, y - 27, 8.5, regular, muted);
  text(vendor ? 'Balance confirmed by supplier' : 'Balance confirmed by customer', 365, y - 14, 9, bold); text('Name, signature, stamp & date', 365, y - 27, 8.5, regular, muted);

  const footer = [company.name, company.phone, company.email, company.website].filter(Boolean).join('  |  ');
  const pages = pdf.getPages();
  pages.forEach((p, i) => { page = p; page.drawLine({start: {x: 42, y: 48}, end: {x: 553, y: 48}, thickness: .5, color: line}); text(options.preview ? 'SAMPLE - preview workspace' : `${footer}  |  All amounts in PKR`, 42, 34, 7.5, regular, muted); right(`Page ${i + 1} of ${pages.length}`, 553, 34, 8); });
  pdf.setTitle(`${company.name} - Statement of account ${clean(statement.party)}`); pdf.setAuthor(company.name);
  return pdf.save();
}

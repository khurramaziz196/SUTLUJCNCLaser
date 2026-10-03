// Customer statement PDF: opening balance, invoices, receipts and running balance.
export async function createStatementPDF(statement, logoBytes, PDFLib, options = {}) {
  const {PDFDocument, StandardFonts, rgb} = PDFLib;
  if (!statement?.party?.trim()) throw Error('Choose a customer for the statement.');
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.10, .17, .21), blue = rgb(.06, .26, .45), muted = rgb(.40, .46, .49), line = rgb(.86, .89, .91), white = rgb(1, 1, 1);
  const logo = await pdf.embedJpg(logoBytes);
  const clean = v => String(v ?? '').replace(/\r?\n/g, ' ').replace(/[‐-―]/g, '-').replace(/\t/g, ' ');
  const amount = v => Number(v).toLocaleString('en-PK', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  try { [statement.party, ...statement.entries.flatMap(e => [e.reference, e.details])].forEach(v => regular.encodeText(clean(v))); }
  catch { throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this customer\'s records.'); }
  const fit = (value, width, size, font) => { let s = clean(value); if (font.widthOfTextAtSize(s, size) <= width) return s; while (s.length > 1 && font.widthOfTextAtSize(s + '...', size) > width) s = s.slice(0, -1); return s + '...'; };
  let page, y;
  const text = (value, x, yy, size = 9, font = regular, color = ink) => page.drawText(clean(value), {x, y: yy, size, font, color});
  const right = (value, x, yy, size = 9, font = regular, color = ink) => text(value, x - font.widthOfTextAtSize(clean(value), size), yy, size, font, color);
  const header = () => { page.drawRectangle({x: 42, y: y - 10, width: 511, height: 26, color: blue}); text('DATE', 50, y, 8, bold, white); text('TYPE', 112, y, 8, bold, white); text('INVOICE', 165, y, 8, bold, white); text('DETAILS', 262, y, 8, bold, white); right('CHARGES', 410, y, 8, bold, white); right('RECEIVED', 478, y, 8, bold, white); right('BALANCE', 546, y, 8, bold, white); y -= 30; };
  const newPage = () => { page = pdf.addPage([595.28, 841.89]); y = 785; text('SUTLUJ CNC LASER', 42, y, 11, bold, blue); right('Statement - ' + fit(statement.party, 300, 9, regular), 553, y, 9); page.drawLine({start: {x: 42, y: 771}, end: {x: 553, y: 771}, thickness: 1, color: line}); y = 745; header(); };
  const row = (cells, font = regular) => { if (y < 80) newPage(); text(cells[0], 50, y, 9, font); text(cells[1], 112, y, 9, font); text(fit(cells[2], 92, 9, font), 165, y, 9, font); text(fit(cells[3], 88, 9, font), 262, y, 9, font, font === bold ? ink : muted); right(cells[4], 410, y, 9, font); right(cells[5], 478, y, 9, font); right(cells[6], 546, y, 9, font); y -= 12; page.drawLine({start: {x: 42, y}, end: {x: 553, y}, thickness: .5, color: line}); y -= 14; };
  page = pdf.addPage([595.28, 841.89]);
  page.drawImage(logo, {x: 29, y: 670, width: 180, height: 180});
  text('STATEMENT', 359, 795, 24, bold, blue);
  text(`Period: ${statement.from} to ${statement.to}`, 359, 770, 10);
  text(`Prepared: ${options.preparedOn || statement.to}`, 359, 755, 10, regular, muted);
  page.drawLine({start: {x: 42, y: 692}, end: {x: 553, y: 692}, thickness: 1, color: line});
  y = 668; text('STATEMENT FOR', 42, y, 9, bold, muted); y -= 22; text(fit(statement.party, 511, 14, bold), 42, y, 14, bold); y -= 34;
  header();
  row(['', '', 'Opening balance', '', '', '', amount(statement.opening)], bold);
  for (const e of statement.entries) row([e.date, e.type, e.reference, e.details, e.charge ? amount(e.charge) : '', e.credit ? amount(e.credit) : '', amount(e.balance)]);
  if (!statement.entries.length) { text('No invoices or payments in this period.', 50, y, 9, regular, muted); y -= 26; }
  if (y < 150) newPage();
  y -= 8; text('Invoiced in period', 332, y, 10); right(amount(statement.charged), 544, y, 10); y -= 20;
  text('Received in period', 332, y, 10); right(amount(statement.received), 544, y, 10); y -= 32;
  page.drawRectangle({x: 320, y: y - 14, width: 233, height: 39, color: rgb(.93, .96, .98)});
  text('BALANCE DUE PKR', 332, y, 11, bold, blue); right(amount(statement.closing), 544, y, 14, bold);
  const pages = pdf.getPages();
  pages.forEach((p, i) => { page = p; page.drawLine({start: {x: 42, y: 48}, end: {x: 553, y: 48}, thickness: .5, color: line}); text(options.preview ? 'SAMPLE - preview workspace' : 'Sutluj CNC Laser | All amounts in PKR', 42, 32, 8, regular, muted); right(`Page ${i + 1} of ${pages.length}`, 553, 32, 8); });
  pdf.setTitle(`Sutluj CNC Laser - Statement ${clean(statement.party)}`); pdf.setAuthor('Sutluj CNC Laser');
  return pdf.save();
}

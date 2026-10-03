// Payslip PDF for one employee's line in a finalised payroll run.
export async function createPayslipPDF(run, line, employee, logoBytes, PDFLib, options = {}) {
  const {PDFDocument, StandardFonts, rgb} = PDFLib;
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.10, .17, .21), blue = rgb(.06, .26, .45), muted = rgb(.40, .46, .49), rule = rgb(.86, .89, .91), white = rgb(1, 1, 1);
  const logo = await pdf.embedJpg(logoBytes);
  const clean = v => String(v ?? '').replace(/\r?\n/g, ' ').replace(/[‐-―]/g, '-').replace(/\t/g, ' ');
  const amount = v => Number(v).toLocaleString('en-PK', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  try { [line.name, line.role, line.deduction_note, employee?.cnic, employee?.bank_account].forEach(v => regular.encodeText(clean(v))); }
  catch { throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this employee\'s details.'); }
  const page = pdf.addPage([595.28, 841.89]);
  const text = (value, x, y, size = 10, font = regular, color = ink) => page.drawText(clean(value), {x, y, size, font, color});
  const right = (value, x, y, size = 10, font = regular, color = ink) => text(value, x - font.widthOfTextAtSize(clean(value), size), y, size, font, color);
  const month = new Date(run.month + '-01T00:00:00Z').toLocaleDateString('en-GB', {month: 'long', year: 'numeric', timeZone: 'UTC'});
  page.drawImage(logo, {x: 29, y: 670, width: 180, height: 180});
  text('PAYSLIP', 359, 795, 24, bold, blue);
  text(month, 359, 770, 12, bold);
  text(`Payroll ${run.reference}`, 359, 754, 10, regular, muted);
  if (run.paid_date) text(`Paid ${run.paid_date} - ${run.paid_method}`, 359, 740, 10, regular, muted);
  page.drawLine({start: {x: 42, y: 692}, end: {x: 553, y: 692}, thickness: 1, color: rule});
  let y = 668;
  text('EMPLOYEE', 42, y, 9, bold, muted); y -= 20;
  text(line.name, 42, y, 14, bold); right(line.code, 553, y, 11, bold, blue); y -= 18;
  text([line.role, line.cost_type === 'production' ? 'Production' : 'Office', line.pay_type === 'Daily' ? `Daily wage PKR ${amount(line.rate)}` : `Monthly salary PKR ${amount(line.rate)}`].filter(Boolean).join('  |  '), 42, y, 10, regular, muted); y -= 15;
  const ids = [employee?.cnic && `CNIC ${employee.cnic}`, employee?.bank_account && `Account ${employee.bank_account}`].filter(Boolean).join('  |  ');
  if (ids) { text(ids, 42, y, 10, regular, muted); y -= 15; }
  y -= 14;
  const d = line.days;
  page.drawRectangle({x: 42, y: y - 34, width: 511, height: 48, color: rgb(.95, .97, .96)});
  [['Paid days', line.paid_days], ['Present', d.P], ['Half days', d.H], ['Absent', d.A], ['Paid leave', d.L], ['Unpaid leave', d.U], ['Off', d.O], ['OT hours', line.ot_hours]]
    .forEach(([k, v], i) => { const x = 54 + i * 62; text(k, x, y, 8, regular, muted); text(String(v), x, y - 20, 12, bold); });
  y -= 70;
  const head = (label, yy) => { page.drawRectangle({x: 42, y: yy - 9, width: 511, height: 24, color: blue}); text(label, 52, yy, 9, bold, white); right('PKR', 543, yy, 9, bold, white); };
  const row = (label, value, font = regular) => { text(label, 52, y, 10, font); right(amount(value), 543, y, 10, font); y -= 10; page.drawLine({start: {x: 42, y}, end: {x: 553, y}, thickness: .5, color: rule}); y -= 16; };
  head('EARNINGS', y); y -= 30;
  row(line.pay_type === 'Daily' ? `Wages (${line.paid_days} days)` : 'Basic salary', line.basic);
  if (line.absence) row('Less unpaid days (salary / 30 per day)', -line.absence);
  if (line.ot_pay) row(`Overtime (${line.ot_hours} h x ${amount(line.ot_rate)})`, line.ot_pay);
  if (line.bonus) row('Bonus / allowance', line.bonus);
  row('Gross pay', line.gross, bold);
  y -= 10; head('DEDUCTIONS', y); y -= 30;
  row('Advance recovered', line.advance);
  row(line.deduction_note ? `Other deductions (${line.deduction_note})` : 'Other deductions', line.deductions);
  y -= 16;
  page.drawRectangle({x: 320, y: y - 14, width: 233, height: 39, color: rgb(.93, .96, .98)});
  text('NET PAY PKR', 332, y, 11, bold, blue); right(amount(line.net), 544, y, 14, bold);
  if (options.advanceBalance) { y -= 40; text(`Advance balance after this payslip: PKR ${amount(options.advanceBalance)}`, 42, y, 9, regular, muted); }
  page.drawLine({start: {x: 42, y: 110}, end: {x: 230, y: 110}, thickness: .5, color: ink}); text('Employee signature', 42, 96, 8, regular, muted);
  page.drawLine({start: {x: 365, y: 110}, end: {x: 553, y: 110}, thickness: .5, color: ink}); text('Authorised by', 365, 96, 8, regular, muted);
  page.drawLine({start: {x: 42, y: 48}, end: {x: 553, y: 48}, thickness: .5, color: rule});
  text(options.preview ? 'SAMPLE - preview workspace' : 'Sutluj CNC Laser | All amounts in PKR | Confidential', 42, 32, 8, regular, muted);
  pdf.setTitle(`Sutluj CNC Laser - Payslip ${clean(line.code)} ${run.month}`); pdf.setAuthor('Sutluj CNC Laser');
  return pdf.save();
}

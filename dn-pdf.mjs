// Delivery note PDF: letterhead, delivery details, quantities (ordered, delivered earlier, this delivery, balance),
// pieces and weight, remarks and the receiving signature with the company stamp. Prints any revision.
import {drawStamp} from './stamp.mjs?v=logo-2';
export async function createDeliveryNotePDF(dn, logoBytes, PDFLib, context = {}) {
  const {PDFDocument, StandardFonts, rgb} = PDFLib;
  const company = context.company || {name: 'GR Synergy Ventures'}, party = context.party || {};
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.10, .17, .21), blue = rgb(.06, .26, .45), muted = rgb(.40, .46, .49), line = rgb(.86, .89, .91), white = rgb(1, 1, 1), tint = rgb(.95, .97, .98), green = rgb(.26, .44, .25), amber = rgb(.63, .40, .08);
  const logo = await pdf.embedJpg(logoBytes);
  const clean = v => String(v ?? '').replace(/\r?\n/g, ' ').replace(/[‐-―–—]/g, '-').replace(/\t/g, ' ');
  try { [dn.party, dn.address, dn.notes, dn.vehicle, dn.driver, dn.received_by, ...dn.lines.map(l => l.description)].forEach(v => regular.encodeText(clean(v))); }
  catch { throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this delivery note.'); }
  const wrap = (value, width, size, font = regular) => { const out = []; let cur = ''; for (const w of clean(value).split(/ +/)) { if (!w) continue; const t = cur ? cur + ' ' + w : w; if (font.widthOfTextAtSize(t, size) <= width) cur = t; else { if (cur) out.push(cur); cur = w; } } if (cur) out.push(cur); return out.length ? out : ['']; };
  const fit = (v, w, size, font = regular) => { let s = clean(v); while (s.length > 1 && font.widthOfTextAtSize(s, size) > w) s = s.slice(0, -2) + '…'; return s; };
  let page, y;
  const text = (v, x, yy, size = 9.5, font = regular, color = ink) => page.drawText(clean(v), {x, y: yy, size, font, color});
  const right = (v, x, yy, size = 9.5, font = regular, color = ink) => text(v, x - font.widthOfTextAtSize(clean(v), size), yy, size, font, color);
  const center = (v, x, yy, size = 9.5, font = regular, color = ink) => text(v, x - font.widthOfTextAtSize(clean(v), size) / 2, yy, size, font, color);
  const rule = (yy, t = .6) => page.drawLine({start: {x: 42, y: yy}, end: {x: 553, y: yy}, thickness: t, color: line});
  const label = (v, x, yy) => text(v, x, yy, 8, bold, muted);
  const newPage = () => { page = pdf.addPage([595.28, 841.89]); y = 790; text(company.name.toUpperCase(), 42, y, 10, bold, blue); right(`Delivery note ${dn.reference}`, 553, y, 9, regular, muted); rule(776, 1); y = 752; };

  page = pdf.addPage([595.28, 841.89]);
  page.drawImage(logo, {x: 38, y: 716, width: 92, height: 92});
  let cy = 792;
  text(company.name, 140, cy, 15, bold, blue); cy -= 14;
  if (company.tagline) { text(company.tagline, 140, cy, 8.5, regular, muted); cy -= 14; }
  for (const r of [...wrap(company.address, 200, 8.5), [company.phone, company.email].filter(Boolean).join('  |  '), [company.ntn && `NTN ${company.ntn}`, company.strn && `STRN ${company.strn}`].filter(Boolean).join('  |  ')].filter(Boolean)) { text(r, 140, cy, 8.5); cy -= 12; }
  right('DELIVERY NOTE', 553, 794, 18, bold, blue);
  const meta = [['DN No.', dn.reference], ['Date', dn.date], ...(dn.revision ? [['Revision', `Rev ${dn.revision}`]] : []), ['Job', dn.job_reference], ['Quotation', dn.quote_reference], ...(dn.customer_po ? [['Your PO / ref.', dn.customer_po]] : [])];
  const boxTop = 774, boxH = meta.length * 15 + 10;
  page.drawRectangle({x: 358, y: boxTop - boxH, width: 195, height: boxH, color: tint});
  meta.forEach(([k, v], i) => { const yy = boxTop - 14 - i * 15; text(k, 366, yy, 8.5, regular, muted); right(fit(v || '-', 105, 9, bold), 545, yy, 9, bold); });
  y = Math.min(cy, boxTop - boxH, 716) - 12; rule(y, 1); y -= 20;

  const top = y;
  label('DELIVER TO', 42, y); y -= 17;
  text(fit(dn.party, 250, 12, bold), 42, y, 12, bold); y -= 15;
  for (const [v, c] of [[[dn.contact || party.contact, dn.phone || party.phone || party.mobile].filter(Boolean).join('  |  '), ink], [dn.address, muted]]) if (v) for (const r of wrap(v, 250, 9)) { text(r, 42, y, 9, regular, c); y -= 12; }
  const left = y; y = top;
  label('DISPATCH', 320, y); y -= 17;
  for (const [k, v] of [['Vehicle', dn.vehicle], ['Driver', [dn.driver, dn.driver_phone].filter(Boolean).join(' · ')], ['Dispatched by', dn.dispatched_by], ['Packages', dn.packages]]) if (v) { text(k, 320, y, 9, regular, muted); text(fit(v, 160, 9, bold), 393, y, 9, bold); y -= 13; }
  const kind = dn.final ? 'FINAL DELIVERY' : 'PARTIAL DELIVERY', kw = bold.widthOfTextAtSize(kind, 8.5) + 14;
  page.drawRectangle({x: 320, y: y - 6, width: kw, height: 17, color: dn.final ? green : amber}); text(kind, 327, y - 1, 8.5, bold, white); y -= 20;
  y = Math.min(left, y) - 12;

  const cols = {n: 50, d: 70, ord: 382, prev: 438, now: 494, bal: 546};
  const header = () => { page.drawRectangle({x: 42, y: y - 9, width: 511, height: 26, color: blue}); text('#', cols.n, y, 8, bold, white); text('ITEM / SIZE & MATERIAL', cols.d, y, 8, bold, white); right('ORDERED', cols.ord, y, 8, bold, white); right('EARLIER', cols.prev, y, 8, bold, white); right('THIS DN', cols.now, y, 8, bold, white); right('BALANCE', cols.bal, y, 8, bold, white); y -= 29; };
  header();
  dn.lines.forEach((l, i) => {
    const desc = wrap(l.description, 290, 10), detail = [l.size, l.material].filter(Boolean).join(' · '), h = desc.length * 13 + (detail ? 12 : 0) + 8;
    if (y - h < 200) { newPage(); header(); }
    if (i % 2) page.drawRectangle({x: 42, y: y - h + 10, width: 511, height: h, color: rgb(.98, .985, .99)});
    text(String(i + 1), cols.n, y, 10, regular, muted); desc.forEach((r, k) => text(r, cols.d, y - k * 13, 10));
    if (detail) text(fit(detail, 290, 8.5), cols.d, y - desc.length * 13, 8.5, regular, muted);
    right(`${l.ordered} ${l.unit || 'pcs'}`, cols.ord, y, 9.5); right(String(l.previous), cols.prev, y, 9.5, regular, muted); right(String(l.qty), cols.now, y, 11, bold); right(String(l.balance), cols.bal, y, 9.5, l.balance ? bold : regular, l.balance ? amber : green);
    y -= h;
  });
  rule(y + 10);
  y -= 10;
  const pcs = dn.lines.reduce((n, l) => n + Number(l.qty || 0), 0);
  text('Total pieces in this delivery', 300, y, 10, bold); right(String(pcs), cols.now, y, 12, bold); y -= 16;
  if (Number(dn.weight_kg) > 0) { text('Approximate weight', 300, y, 9.5, regular, muted); right(`${Number(dn.weight_kg).toLocaleString('en-PK', {maximumFractionDigits: 1})} kg`, cols.now, y, 9.5); y -= 16; }
  y -= 8;
  if (String(dn.notes || '').trim()) { label('REMARKS', 42, y); y -= 13; for (const r of wrap(dn.notes, 511, 9)) { text(r, 42, y, 9); y -= 12; } y -= 6; }
  if (dn.revision && dn.revision_reason) { text(`Revision ${dn.revision}: ${clean(dn.revision_reason)}`, 42, y, 8.5, regular, muted); y -= 14; }
  text('Goods received in good condition and as per quantities above, unless noted on this delivery note.', 42, y, 8.5, regular, muted); y -= 12;

  if (y < 190) newPage();
  y = Math.min(y - 90, 150);
  if (company.stamp_enabled !== false && context.stampLogo !== undefined) { const ink2 = await context.stampLogo; const img = ink2?.bytes ? await pdf.embedPng(ink2.bytes) : null; drawStamp(page, PDFLib, {bold, regular}, company, {cx: 110, cy: y + 40, r: 34, logo: img}); }
  for (const [x, w, t, s] of [[42, 130, 'Dispatched by', `For ${company.name}`], [215, 120, 'Driver', dn.driver || 'Name & signature'], [365, 188, 'Received by', dn.received_by || 'Name, signature, stamp & date']]) { page.drawLine({start: {x, y}, end: {x: x + w, y}, thickness: .6, color: ink}); text(t, x, y - 14, 9, bold); text(fit(s, w, 8.5), x, y - 27, 8.5, regular, muted); }

  const footer = [company.name, company.phone, company.email].filter(Boolean).join('  |  ');
  const pages = pdf.getPages();
  pages.forEach((p, i) => { page = p; rule(52); text(footer, 42, 38, 8, regular, muted); right(`Page ${i + 1} of ${pages.length}`, 553, 38, 8, regular, muted); if (dn.status === 'Cancelled') { center('CANCELLED', 297, 420, 70, bold, rgb(.85, .3, .25)); } });
  pdf.setTitle(`${company.name} - Delivery note ${dn.reference}${dn.revision ? ' rev ' + dn.revision : ''}`); pdf.setAuthor(company.name);
  return pdf.save();
}

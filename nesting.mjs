// Sheet planning for a job: how many rectangular parts fit on one sheet and how many sheets the order needs.
// Parts are laid out in rows with a gap between them and a margin at the sheet edge. Both orientations are
// tried, and the strip left over after the rows is filled with turned parts, so the estimate is close to a
// simple guillotine nest. Irregular shapes nested in CAD can fit more; treat the result as a planning figure.
export const IN = 25.4, FT = 304.8;
// Standard sheet and plate sizes sold in Pakistan (MS/HR/CR, SS, GI and aluminium), in inches. Ids are "WxL" in inches.
const sheet = (w, l) => ({id: `${w}x${l}`, label: `${w / 12}' × ${l / 12}' (${w}" × ${l}")`, w: w * IN, l: l * IN});
export const sheetPresets = [sheet(36, 72), sheet(48, 96), sheet(48, 120), sheet(60, 120), sheet(72, 144)];
// Sheet ids saved before inch sizes ("1220x2440" in mm) become inch ids ("48x96").
export function normalizeSheetId(id) {
  const m = String(id || '').match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/); if (!m) return id || '';
  const [a, b] = [Number(m[1]), Number(m[2])]; if (a <= 200 && b <= 200) return id;
  const r = v => Math.round(v / IN * 2) / 2; return `${r(a)}x${r(b)}`;
}
export function sheetFromId(id) { const m = String(normalizeSheetId(id)).match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/); return m ? {w: Number(m[1]) * IN, l: Number(m[2]) * IN} : null; }
const fit = (space, part, gap) => part > 0 && space >= part ? Math.floor((space + gap) / (part + gap)) : 0;

// Best count of parts (pw x pl mm) on a sheet (sw x sl mm). Returns {count, layout} or {count:0} if it does not fit.
// rotate = false keeps every part in its drawn direction (grain, brushed or patterned sheet).
export function piecesPerSheet(sw, sl, pw, pl, gap = 5, margin = 10, rotate = true) {
  sw = Number(sw); sl = Number(sl); pw = Number(pw); pl = Number(pl); gap = Math.max(0, Number(gap) || 0); margin = Math.max(0, Number(margin) || 0);
  if (!(sw > 0 && sl > 0 && pw > 0 && pl > 0)) return {count: 0, layout: ''};
  const W = sw - 2 * margin, L = sl - 2 * margin;
  let best = {count: 0, layout: ''};
  for (const [a, b, turned] of rotate ? [[pw, pl, false], [pl, pw, true]] : [[pw, pl, false]]) {          // a across the sheet width, b along its length
    const across = fit(W, a, gap), rowsMax = fit(L, b, gap);
    for (let rows = rowsMax; rows >= 0; rows--) {
      const rest = L - rows * (b + gap), extraAcross = rotate ? fit(W, b, gap) : 0, extraRows = rotate && rest > 0 ? fit(rest, a, gap) : 0;
      const count = across * rows + extraAcross * extraRows;
      if (count > best.count) best = {count, layout: `${across} across × ${rows} down${turned ? ' (turned)' : ''}${extraAcross * extraRows ? ` + ${extraAcross * extraRows} turned in the end strip` : ''}`, plan: {a, b, across, rows, extraAcross, extraRows, turned}};
      if (rows === 0) break;
    }
  }
  return best;
}

// Plan for one line: part size in inches, sheet in mm, quantity. Returns pieces per sheet, sheets needed,
// pieces on the last sheet, and how much of the sheet area the parts use.
export function planLine({w_in, l_in, qty, sheet_w, sheet_l, gap = 5, margin = 10, rotate = true}) {
  const pw = Number(w_in) * IN, pl = Number(l_in) * IN, q = Math.ceil(Number(qty) || 0);
  if (!(pw > 0 && pl > 0) || !(Number(sheet_w) > 0 && Number(sheet_l) > 0)) return null;
  const per = piecesPerSheet(sheet_w, sheet_l, pw, pl, gap, margin, rotate);
  if (!per.count) return {perSheet: 0, sheets: null, problem: 'Part is larger than the sheet'};
  const sheets = q > 0 ? Math.ceil(q / per.count) : 0, last = q > 0 ? q - (sheets - 1) * per.count : 0;
  const usage = sheets ? Math.round(q * pw * pl / (sheets * Number(sheet_w) * Number(sheet_l)) * 1000) / 10 : 0;
  return {perSheet: per.count, layout: per.layout, sheets, lastSheet: last, usage};
}
const inch = mm => { const v = mm / IN; return Math.abs(v - Math.round(v)) < 0.15 ? Math.round(v) : Math.round(v * 10) / 10; };
export const sheetLabel = (w, l) => { const p = sheetPresets.find(s => Math.abs(s.w - w) < 3 && Math.abs(s.l - l) < 3); return p ? p.label.split(' (')[0] : `${inch(w)}" × ${inch(l)}"`; };

// Positions of the parts on one sheet for the best layout, for drawing. Coordinates in mm with x along the
// sheet length and y across its width. Each rect: {x, y, w, h, turned}.
export function layoutRects(sw, sl, pw, pl, gap = 5, margin = 10, rotate = true) {
  const best = piecesPerSheet(sw, sl, pw, pl, gap, margin, rotate);
  if (!best.count) return {...best, rects: []};
  gap = Math.max(0, Number(gap) || 0); margin = Math.max(0, Number(margin) || 0);
  const {a, b, across, rows, extraAcross, extraRows, turned} = best.plan, rects = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < across; c++) rects.push({x: margin + r * (b + gap), y: margin + c * (a + gap), w: b, h: a, turned});
  const start = margin + rows * (b + gap);
  for (let r = 0; r < extraRows; r++) for (let c = 0; c < extraAcross; c++) rects.push({x: start + r * (a + gap), y: margin + c * (b + gap), w: a, h: b, turned: !turned});
  return {...best, rects};
}

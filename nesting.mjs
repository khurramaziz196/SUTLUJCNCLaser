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

// ---- Mixed nesting: different parts cut from the same sheets ----
// Rectangle packing (MaxRects) of several part types onto sheets of one size, with a gap between parts and an edge
// margin. Each heuristic is a placement rule; the best result (fewest sheets, then the biggest usable leftover on the
// last sheet) is kept. types: [{key, w, l, qty}] in mm, w across the sheet and l along it. Coordinates as layoutRects.
const EPS = 1e-6;
function prune(free, minSide) {
  const keep = free.filter(f => f.w + EPS >= minSide && f.h + EPS >= minSide);
  return keep.filter((a, i) => !keep.some((b, j) => j !== i && a.x + EPS >= b.x && a.y + EPS >= b.y && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS && (j < i || a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h)));
}
function place(free, r) {
  const out = [];
  for (const f of free) {
    if (r.x >= f.x + f.w - EPS || r.x + r.w <= f.x + EPS || r.y >= f.y + f.h - EPS || r.y + r.h <= f.y + EPS) { out.push(f); continue; }
    if (r.x > f.x + EPS) out.push({x: f.x, y: f.y, w: r.x - f.x, h: f.h});
    if (r.x + r.w < f.x + f.w - EPS) out.push({x: r.x + r.w, y: f.y, w: f.x + f.w - r.x - r.w, h: f.h});
    if (r.y > f.y + EPS) out.push({x: f.x, y: f.y, w: f.w, h: r.y - f.y});
    if (r.y + r.h < f.y + f.h - EPS) out.push({x: f.x, y: r.y + r.h, w: f.w, h: f.y + f.h - r.y - r.h});
  }
  return out;
}
const scorers = {
  bl: (f, w, h) => [f.x + w, f.y],                                                   // pack towards one end: leftover stays in one piece
  bssf: (f, w, h) => [Math.min(f.w - w, f.h - h), Math.max(f.w - w, f.h - h)],         // tightest fit on the short side
  baf: (f, w, h) => [f.w * f.h - w * h, Math.min(f.w - w, f.h - h)]                    // tightest fit by area
};
const less = (a, b) => a[0] < b[0] - EPS || (Math.abs(a[0] - b[0]) <= EPS && a[1] < b[1] - EPS);
// order: 'global' picks the best (type, place) each time; otherwise types are tried biggest first.
function packRun(types, sw, sl, gap, margin, rotate, scorer, order) {
  const BW = sl - 2 * margin + gap, BH = sw - 2 * margin + gap, left = types.map(t => Math.ceil(t.qty)), score = scorers[scorer];
  const idx = types.map((t, i) => i);
  if (order === 'area') idx.sort((a, b) => types[b].w * types[b].l - types[a].w * types[a].l);
  if (order === 'side') idx.sort((a, b) => Math.max(types[b].w, types[b].l) - Math.max(types[a].w, types[a].l));
  const sheets = [];
  while (left.some(n => n > 0)) {
    let free = [{x: 0, y: 0, w: BW, h: BH}]; const rects = [];
    for (;;) {
      const minSide = Math.min(...idx.filter(i => left[i] > 0).map(i => Math.min(types[i].w, types[i].l) + gap));
      let best = null;
      for (const i of idx) {
        if (!left[i]) continue; const t = types[i];
        const ors = rotate && Math.abs(t.w - t.l) > EPS ? [[t.l + gap, t.w + gap, false], [t.w + gap, t.l + gap, true]] : [[t.l + gap, t.w + gap, false]];
        for (const [w, h, turned] of ors) for (const f of free) if (w <= f.w + EPS && h <= f.h + EPS) { const s = score(f, w, h); if (!best || less(s, best.s)) best = {s, i, x: f.x, y: f.y, w, h, turned}; }
        if (best && order !== 'global') break;
      }
      if (!best) break;
      left[best.i]--; rects.push({x: margin + best.x, y: margin + best.y, w: best.w - gap, h: best.h - gap, key: types[best.i].key, turned: best.turned});
      free = prune(place(free, best), left.some(n => n > 0) ? Math.min(minSide, ...idx.filter(i => left[i] > 0).map(i => Math.min(types[i].w, types[i].l) + gap)) : 0);
    }
    if (!rects.length) return {problem: 'A part is larger than the sheet', sheets};
    // Largest leftover piece on this sheet (real size, without the gap).
    let rest = [{x: 0, y: 0, w: BW, h: BH}];
    for (const r of rects) rest = prune(place(rest, {x: r.x - margin, y: r.y - margin, w: r.w + gap, h: r.h + gap}), 0);
    const big = rest.map(f => ({x: margin + f.x, y: margin + f.y, w: f.w - gap, h: f.h - gap})).filter(f => f.w >= IN && f.h >= IN).sort((a, b) => b.w * b.h - a.w * a.h)[0] || null;
    sheets.push({rects, remnant: big});
  }
  return {sheets};
}
const runs = [['bl', 'area'], ['bl', 'side'], ['bssf', 'global'], ['baf', 'global'], ['bssf', 'area']];
export function packMixed(types, sw, sl, gap = 5, margin = 10, rotate = true) {
  types = types.filter(t => t.w > 0 && t.l > 0 && t.qty > 0); gap = Math.max(0, Number(gap) || 0); margin = Math.max(0, Number(margin) || 0);
  if (!types.length) return null;
  const pieces = types.reduce((n, t) => n + Math.ceil(t.qty), 0), use = pieces > 600 ? runs.slice(0, 1) : pieces > 250 ? runs.slice(0, 2) : runs;
  let best = null;
  for (const [s, o] of use) {
    const r = packRun(types, sw, sl, gap, margin, rotate, s, o); if (r.problem) return r;
    const last = r.sheets[r.sheets.length - 1], key = [r.sheets.length, -(last.remnant ? last.remnant.w * last.remnant.h : 0)];
    if (!best || less(key, best.key)) best = {...r, key};
  }
  const partArea = types.reduce((n, t) => n + t.w * t.l * Math.ceil(t.qty), 0), n = best.sheets.length;
  return {sheets: best.sheets, count: n, usage: Math.round(partArea / (n * sw * sl) * 1000) / 10, offcutSqFt: Math.round((n * sw * sl - partArea) / (FT * FT) * 10) / 10, partArea};
}

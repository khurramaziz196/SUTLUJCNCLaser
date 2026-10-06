// Sheet planning for a job, shared by the job card, issuing material and the job card PDF. The same engine as the
// sheet calculator: parts bigger than the sheet are cut in pieces (equal, full lengths + remainder, or the better
// of the two), and in combine mode the lines of the same material and gauge are nested together on shared sheets.
// Sizes are in mm (sheets) and inches (parts). Every packed sheet comes back with its parts and the biggest leftover.
import {IN, FT, packMixed, splitPart} from './nesting.mjs?v=7';

const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const r1 = v => Math.round(v * 10) / 10;
export const splitModeName = md => md === 'max' ? 'full lengths + remainder' : 'equal pieces';
const modesFor = split => split === 'auto' ? ['equal', 'max'] : [split === 'max' ? 'max' : 'equal'];
const bigRemnant = p => Math.max(0, ...p.sheets.map(s => s.remnant ? s.remnant.w * s.remnant.h : 0));
// Fewer sheets, then less offcut, then the bigger usable leftover.
const better = (a, b) => a.p.count - b.p.count || a.p.offcutSqFt - b.p.offcutSqFt || bigRemnant(b.p) - bigRemnant(a.p);
function compareNote(split, best, alt) {
  if (split !== 'auto') return `Cut as ${splitModeName(best.md)}.`;
  if (!alt) return `Auto: ${splitModeName(best.md)}.`;
  const same = alt.p.count === best.p.count && Math.abs(alt.p.offcutSqFt - best.p.offcutSqFt) < 0.05;
  return same ? `Auto: ${splitModeName(best.md)} — ${splitModeName(alt.md)} uses the same material.` : `Auto chose ${splitModeName(best.md)} — ${splitModeName(alt.md)} would need ${alt.p.count} sheet${alt.p.count === 1 ? '' : 's'} · ${alt.p.offcutSqFt} ft² offcut.`;
}
const cache = new Map();
function pack(types, o, opts) {
  const k = JSON.stringify([types, o.w, o.l, opts.gap, opts.margin, opts.rotate !== false]);
  if (!cache.has(k)) { if (cache.size > 300) cache.clear(); cache.set(k, packMixed(types, o.w, o.l, opts.gap, opts.margin, opts.rotate !== false)); }
  return cache.get(k);
}
export const splitOf = (row, o, opts, md) => splitPart(row.w_in, row.l_in, o.w, o.l, {margin: opts.margin, rotate: opts.rotate !== false, mode: md || modesFor(opts.split)[0]});
// The pieces of one line for one sheet size: the whole part, or the pieces it is cut in.
export function pieceTypes(row, o, opts, md) {
  const q = Math.ceil(num(row.qty)), sp = splitOf(row, o, opts, md);
  if (!sp) return [{key: String(row.i), w: num(row.w_in) * IN, l: num(row.l_in) * IN, qty: q, w_in: row.w_in, l_in: row.l_in, label: String(row.i + 1), row: row.i}];
  return sp.pieces.map((p, k) => ({key: `${row.i}.${k}`, w: p.w_in * IN, l: p.l_in * IN, qty: q, w_in: p.w_in, l_in: p.l_in, label: `${row.i + 1}${p.tag}`, row: row.i}));
}
const sized = row => num(row.w_in) > 0 && num(row.l_in) > 0 && Math.ceil(num(row.qty)) > 0;

// One line on its own sheets when it is bigger than the sheet: null when the part fits whole (use the rows layout).
export function planSplitRow(row, o, opts) {
  if (!sized(row) || !o?.w || !splitOf(row, o, opts)) return null;
  const tries = modesFor(opts.split).map(md => { const types = pieceTypes(row, o, opts, md), p = pack(types, o, opts); return p && !p.problem ? {md, types, p} : null; }).filter(Boolean).sort(better);
  if (!tries.length) return {problem: 'Does not fit even when split'};
  const b = tries[0];
  return {count: b.p.count, usage: b.p.usage, offcutSqFt: b.p.offcutSqFt, types: b.types, md: b.md, split: splitOf(row, o, opts, b.md), note: compareNote(opts.split, b, tries[1]), sheets: b.p.sheets.map(s => ({...s, size: o}))};
}

// Combine mode: the ticked lines of the same material and gauge share sheets. Each group tries every sheet size
// (and both split methods when a part is too big), keeps the best or the size picked for it, and can cut the last
// sheet from a smaller size when everything left fits.
export function planGroups(rows, opts) {
  const groups = [];
  rows.filter(r => r.combine !== false && sized(r)).forEach(r => { const key = `${r.material}|${num(r.thickness_mm)}`; let g = groups.find(g => g.key === key); if (!g) groups.push(g = {key, material: r.material, thickness_mm: r.thickness_mm, rows: []}); g.rows.push(r); });
  groups.forEach((g, n) => {
    g.letter = String.fromCharCode(65 + n); g.idx = g.rows.map(r => r.i);
    g.partArea = g.rows.reduce((a, r) => a + num(r.w_in) * IN * num(r.l_in) * IN * Math.ceil(num(r.qty)), 0);
    const packFor = o => { const split = g.rows.some(r => splitOf(r, o, opts)), tries = (split ? modesFor(opts.split) : [modesFor(opts.split)[0]]).map(md => { const types = g.rows.flatMap(r => pieceTypes(r, o, opts, md)), p = pack(types, o, opts); return p && !p.problem ? {md, types, p} : null; }).filter(Boolean).sort(better); return tries.length ? {o, ...tries[0], note: split ? compareNote(opts.split, tries[0], tries[1]) : ''} : null; };
    g.ranking = opts.sizes.map(packFor).filter(Boolean).sort((a, b) => opts.goal === 'sheets' ? a.p.count - b.p.count || a.p.offcutSqFt - b.p.offcutSqFt : a.p.offcutSqFt - b.p.offcutSqFt || a.p.count - b.p.count);
    const pick = opts.groupSheet?.[g.key];
    let chosen = pick && pick !== 'auto' ? g.ranking.find(x => x.o.id === pick) : g.ranking[0];
    if (!chosen && pick && pick !== 'auto' && opts.sizeById) { const o = opts.sizeById(pick); if (o) chosen = packFor(o); }
    g.auto = !pick || pick === 'auto'; g.chosen = chosen; g.ok = !!chosen; if (!chosen) return;
    const sheets = chosen.p.sheets.map(s => ({...s, size: chosen.o}));
    if (opts.smallLast !== false && sheets.length) {
      const last = sheets[sheets.length - 1], cnt = {}; for (const r of last.rects) cnt[r.key] = (cnt[r.key] || 0) + 1;
      const lt = chosen.types.filter(t => cnt[t.key]).map(t => ({...t, qty: cnt[t.key]}));
      const alt = opts.sizes.filter(o => o.w * o.l < chosen.o.w * chosen.o.l - 1).map(o => ({o, p: pack(lt, o, opts)})).filter(c => c.p && !c.p.problem && c.p.count === 1).sort((a, b) => a.o.w * a.o.l - b.o.w * b.o.l)[0];
      if (alt) sheets[sheets.length - 1] = {...alt.p.sheets[0], size: alt.o, smaller: true};
    }
    g.sheets = sheets; g.types = chosen.types; g.md = chosen.md; g.splitNote = chosen.note || '';
    g.splits = g.rows.map(r => ({i: r.i, sp: splitOf(r, chosen.o, opts, chosen.md)})).filter(x => x.sp);
    g.bySize = []; for (const s of sheets) { let e = g.bySize.find(e => e.o.id === s.size.id); if (!e) g.bySize.push(e = {o: s.size, count: 0}); e.count++; }
    const area = sheets.reduce((a, s) => a + s.size.w * s.size.l, 0);
    g.waste = r1((area - g.partArea) / (FT * FT)); g.usage = r1(g.partArea / area * 100);
  });
  return groups;
}
// What each shared sheet carries, e.g. [{label:'1a', w_in, l_in, count}], for the operator's cut list.
export function sheetCutList(sheet, types) {
  const cnt = {}; for (const r of sheet.rects) cnt[r.key] = (cnt[r.key] || 0) + 1;
  return Object.entries(cnt).map(([k, n]) => { const t = types.find(t => t.key === k) || {}; return {key: k, label: t.label || k, row: t.row, w_in: t.w_in, l_in: t.l_in, count: n}; });
}

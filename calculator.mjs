// Sheet calculator: plan the sheets for a list of parts, compare sheet sizes, see the layout to scale and work out
// material cost and a suggested rate per ft². Runs in the app's floating window and in the pop-out window
// (calculator.html) from the same code. Everything it needs comes in `init`, including a stock snapshot, so the
// pop-out works on its own.
import {IN, FT, sheetPresets, planLine, sheetLabel, layoutRects, normalizeSheetId, sheetFromId} from './nesting.mjs?v=4';
import {materials, gauges, matchGauge} from './gauge.mjs';
import {densities} from './inventory.mjs?v=grn-1';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const pkr = n => `PKR ${Number(n || 0).toLocaleString('en-PK', {maximumFractionDigits: 0})}`;
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const r1 = v => Math.round(v * 10) / 10;
const inch = mm => { const v = mm / IN; return Math.abs(v - Math.round(v)) < 0.15 ? Math.round(v) : Math.round(v * 10) / 10; };
export const inchText = mm => { const v = inch(mm), ft = v / 12; return `${v}" (${Number.isInteger(ft) ? ft : r1(ft)} ft)`; };
export function sheetWeightKg(material, t, w, l) { const d = densities[material]; return d && t > 0 && w > 0 && l > 0 ? Math.round(w * l * t * d / 1e3) / 1e3 : null; }
const gaugeText = (m, t) => { if (!t) return ''; const g = matchGauge(m, t); return g ? `${g.gauge} ga` : `${Number(t)} mm`; };

// ---- Drawing of one sheet: parts (numbered, sized), spare places, offcuts with sizes, dimension lines. ----
export function drawSheet(p, {gap = 5, margin = 0, rotate = true, which = 'first', title = ''} = {}) {
  const sw = p.sheet.w, sl = p.sheet.l, lay = layoutRects(sw, sl, num(p.w_in) * IN, num(p.l_in) * IN, gap, margin, rotate), q = Math.ceil(num(p.qty));
  const sheets = lay.count ? Math.max(1, Math.ceil(q / lay.count)) : 0, last = lay.count ? q - (sheets - 1) * lay.count : 0;
  const filled = which === 'last' && sheets > 1 ? last : Math.min(q || lay.count, lay.count);
  const pad = Math.max(sl, sw) * 0.06, vbW = sl + pad * 2.9, vbH = sw + pad * 2.6, fs = Math.max(sl, sw) * 0.036, T = pad * 1.2, hid = `sc${Math.random().toString(36).slice(2, 8)}`;
  const size = `${p.w_in}" × ${p.l_in}"`, show = lay.rects.slice(0, 1500), numFs = Math.min(fs * 0.95, Math.min(...show.map(r => Math.min(r.w, r.h)), 1e9) * 0.45);
  const label = (k, r, cx, cy) => { const sf = Math.min(fs * 0.8, r.w / (size.length * 0.62), r.h * 0.28), both = sf > fs * 0.3 && r.h > numFs * 2.4; if (numFs <= fs * 0.35 && !both) return ''; return both ? `<text class="pf-num" x="${cx}" y="${cy - sf * 0.25}" text-anchor="middle" font-size="${Math.min(numFs, r.h * 0.32)}">${k + 1}</text><text class="pf-plabel" x="${cx}" y="${cy + sf * 1.15}" text-anchor="middle" font-size="${sf}">${esc(size)}</text>` : `<text class="pf-num" x="${cx}" y="${cy + numFs * 0.35}" text-anchor="middle" font-size="${numFs}">${k + 1}</text>`; };
  const parts = show.map((r, k) => { const used = k < filled, cx = pad + r.x + r.w / 2, cy = T + r.y + r.h / 2; return `<g><title>Part ${k + 1}${used ? '' : ' (spare place)'} · ${inch(r.h)}" × ${inch(r.w)}"${r.turned ? ' · turned' : ''}</title><rect class="${used ? 'pf-part' : 'pf-spare'}${r.turned ? ' turned' : ''}" x="${pad + r.x}" y="${T + r.y}" width="${r.w}" height="${r.h}"/>${used ? label(k, r, cx, cy) : ''}</g>`; }).join('');
  const maxX = Math.max(0, ...lay.rects.map(r => r.x + r.w)), maxY = Math.max(0, ...lay.rects.map(r => r.y + r.h)), offcuts = [];
  if (lay.count && sl - maxX >= IN) offcuts.push({x: maxX, y: 0, w: sl - maxX, h: sw});
  if (lay.count && sw - maxY >= IN) offcuts.push({x: 0, y: maxY, w: maxX, h: sw - maxY});
  const offText = o => `${inch(o.h)}" × ${inch(o.w)}"`;
  const offBoxes = offcuts.map(o => `<rect class="pf-offbox" x="${pad + o.x}" y="${T + o.y}" width="${o.w}" height="${o.h}"/>`).join('');
  const offLabels = offcuts.map(o => { const t = offText(o), flat = Math.min(fs * 0.85, o.h * 0.42, o.w / (t.length * 0.62)), up = Math.min(fs * 0.85, o.w * 0.42, o.h / (t.length * 0.62)), turn = flat < fs * 0.3 && up >= fs * 0.3, f = turn ? up : flat; if (f < fs * 0.3) return ''; const cx = pad + o.x + o.w / 2, cy = T + o.y + o.h / 2, bw = t.length * f * 0.6 + f; return `<g class="pf-offlabel"${turn ? ` transform="rotate(-90 ${cx} ${cy})"` : ''}><title>Offcut ${t}</title><rect x="${cx - bw / 2}" y="${cy - f * 0.85}" width="${bw}" height="${f * 1.5}" rx="${f * 0.3}"/><text x="${cx}" y="${cy + f * 0.3}" text-anchor="middle" font-size="${f}">${esc(t)}</text></g>`; }).join('');
  const chain = (spans, along) => spans.filter(sp => sp.b - sp.a >= IN * 0.5).map(sp => { const len = sp.b - sp.a, tf = Math.min(fs * 0.78, len / (sp.label.length * 0.62)), tick = fs * 0.45, cls = sp.off ? 'pf-dimline off' : 'pf-dimline';
    if (along) { const y = T + sw + pad * 0.55, x1 = pad + sp.a, x2 = pad + sp.b; return `<g class="${cls}"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y - tick}" x2="${x1}" y2="${y + tick}"/><line x1="${x2}" y1="${y - tick}" x2="${x2}" y2="${y + tick}"/>${tf > fs * 0.32 ? `<text x="${(x1 + x2) / 2}" y="${y + tf * 1.35}" text-anchor="middle" font-size="${tf}">${esc(sp.label)}</text>` : ''}</g>`; }
    const x = pad + sl + pad * 0.45, y1 = T + sp.a, y2 = T + sp.b; return `<g class="${cls}"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x - tick}" y1="${y1}" x2="${x + tick}" y2="${y1}"/><line x1="${x - tick}" y1="${y2}" x2="${x + tick}" y2="${y2}"/>${tf > fs * 0.32 ? `<text x="${x + tf * 0.5}" y="${(y1 + y2) / 2 + tf * 0.35}" font-size="${tf}">${esc(sp.label)}</text>` : ''}</g>`; }).join('');
  const spans = (pos, sz, limit, total) => { const minC = Math.min(...lay.rects.map(r => pos === 'x' ? r.y : r.x)), line = lay.rects.filter(r => Math.abs((pos === 'x' ? r.y : r.x) - minC) < 1).sort((a, b) => a[pos] - b[pos]), sp = [];
    if (line.length > 6) { const a = line[0][pos], b = Math.max(...line.map(r => r[pos] + r[sz])); sp.push({a, b, label: line.every(r => Math.abs(r[sz] - line[0][sz]) < 1) ? `${line.length} × ${inch(line[0][sz])}"` : `${inch(b - a)}"`}); }
    else for (const r of line) sp.push({a: r[pos], b: r[pos] + r[sz], label: `${inch(r[sz])}"`});
    if (lay.count && total - limit >= IN) sp.push({a: limit, b: total, label: `${inch(total - limit)}"`, off: true}); return sp; };
  const dims = lay.count ? chain(spans('x', 'w', maxX, sl), true) + chain(spans('y', 'h', maxY, sw), false) : '';
  const svg = `<svg viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="Sheet layout">
  <defs><pattern id="${hid}" patternUnits="userSpaceOnUse" width="${fs * 0.9}" height="${fs * 0.9}" patternTransform="rotate(45)"><rect width="${fs * 0.9}" height="${fs * 0.9}" fill="#fde7d3"/><line x1="0" y1="0" x2="0" y2="${fs * 0.9}" stroke="#ef9a5a" stroke-width="${fs * 0.25}"/></pattern></defs>
  <text class="pf-dim" x="${pad + sl / 2}" y="${pad * 0.8}" text-anchor="middle" font-size="${fs}">${inchText(sl)}</text>
  <text class="pf-dim" x="${pad * 0.55}" y="${T + sw / 2}" text-anchor="middle" font-size="${fs}" transform="rotate(-90 ${pad * 0.55} ${T + sw / 2})">${inchText(sw)}</text>
  <rect class="pf-sheet${margin > 0 ? ' has-margin' : ''}" x="${pad}" y="${T}" width="${sl}" height="${sw}" ${margin > 0 ? '' : `style="fill:url(#${hid})"`}/>
  ${margin > 0 ? `<rect class="pf-usable" x="${pad + margin}" y="${T + margin}" width="${sl - 2 * margin}" height="${sw - 2 * margin}" style="fill:url(#${hid})"/>` : ''}
  ${parts}${offBoxes}${offLabels}${dims}<rect class="pf-outline" x="${pad}" y="${T}" width="${sl}" height="${sw}"/></svg>`;
  const status = !lay.count ? `<span class="late">Part does not fit this sheet${margin ? ` with a ${margin} mm margin` : ''}${rotate ? '' : ' without turning it'}.</span>` : `<span>${lay.count} per sheet · ${sheets} sheet${sheets === 1 ? '' : 's'}${which === 'last' && sheets > 1 ? ` · showing last sheet (${last} pcs)` : ''}</span>`;
  return {html: `<figure class="plan-fig">${svg}<figcaption>${title ? `<b>${esc(title)}</b>` : ''}${status}<small>${lay.count ? esc(lay.layout) : ''}</small>${offcuts.length ? `<small class="pf-offnote">Offcut${offcuts.length > 1 ? 's' : ''}${which === 'last' && sheets > 1 ? ' (full sheet)' : ''}: ${offcuts.map(offText).join(' and ')} (W × L)</small>` : ''}</figcaption></figure>`, count: lay.count, sheets, last};
}
export const legendHTML = '<div class="plan-legend"><span><i class="pf-part"></i>Part (numbered)</span><span><i class="pf-part turned"></i>Turned part</span><span><i class="pf-spare"></i>Spare place</span><span><i class="pf-offcut"></i>Unused / offcut</span><span><i class="pf-margin"></i>Edge margin</span></div>';

// ---- Calculator ----
const blankRow = () => ({description: '', qty: 1, material: 'steel', thickness_mm: null, w_in: '', l_in: '', sheet: 'auto'});
export function mountCalculator(root, init = {}) {
  const stock = init.stock || [];   // [{material, thickness_mm, w, l, count, cost}] cost = average cost per sheet
  const stockFor = (m, t, w, l) => { const near = (a, b) => Math.abs(a - b) < 6; const hits = stock.filter(s => s.material === m && Math.abs(num(s.thickness_mm) - num(t)) < 0.01 && ((near(s.w, w) && near(s.l, l)) || (near(s.w, l) && near(s.l, w)))); return {count: hits.reduce((n, s) => n + num(s.count), 0), cost: (hits.find(s => s.cost > 0) || {}).cost || 0}; };
  const allSizes = [...sheetPresets, ...(init.extraSheets || []).filter(e => !sheetPresets.some(p => p.id === e.id))];
  const st = {rows: (init.rows?.length ? init.rows : [blankRow()]).map(r => ({...blankRow(), ...r, sheet: r.sheet && r.sheet !== 'auto' ? normalizeSheetId(r.sheet) : 'auto'})), gap: num(init.gap, 5), margin: num(init.margin, 0), rotate: init.rotate !== false, goal: init.goal || 'offcut',
    sizes: init.sizes || allSizes.map(s => s.id), custom: init.custom || [], rates: init.rates || {}, markup: num(init.markup, 20), cutRate: num(init.cutRate, 0), selected: 0, view: 'first', applyRates: false};
  const sizes = () => [...allSizes, ...st.custom].filter(s => st.sizes.includes(s.id));
  const sizeById = id => [...allSizes, ...st.custom].find(s => s.id === id) || (sheetFromId(id) ? {id, label: sheetLabel(sheetFromId(id).w, sheetFromId(id).l), ...sheetFromId(id)} : null);
  const settings = () => ({gap: st.gap, margin: st.margin, rotate: st.rotate});
  const rank = row => { const q = Math.ceil(num(row.qty)), pa = num(row.w_in) * num(row.l_in); if (!(pa > 0) || !q) return [];
    return sizes().map(o => { const r = planLine({w_in: row.w_in, l_in: row.l_in, qty: q, sheet_w: o.w, sheet_l: o.l, ...settings()}); if (!r?.sheets) return null; const waste = r1((r.sheets * o.w * o.l / (IN * IN) - q * pa) / 144); return {o, r, waste, stock: stockFor(row.material, row.thickness_mm, o.w, o.l).count}; })
      .filter(Boolean).sort((a, b) => st.goal === 'sheets' ? a.r.sheets - b.r.sheets || a.waste - b.waste : a.waste - b.waste || a.r.sheets - b.r.sheets); };
  // Result for a row: the sheet used (auto = best ranked), the plan, weight and material cost.
  const result = row => { const list = rank(row); const chosen = row.sheet === 'auto' ? list[0]?.o : sizeById(row.sheet); if (!chosen) return {list, ok: false};
    const r = planLine({w_in: row.w_in, l_in: row.l_in, qty: row.qty, sheet_w: chosen.w, sheet_l: chosen.l, ...settings()}); if (!r) return {list, ok: false, sheet: chosen};
    const kgSheet = sheetWeightKg(row.material, num(row.thickness_mm), chosen.w, chosen.l), kg = kgSheet && r.sheets ? kgSheet * r.sheets : 0;
    const s = stockFor(row.material, row.thickness_mm, chosen.w, chosen.l), rate = num(st.rates[row.material] ?? (s.cost && kgSheet ? s.cost / kgSheet : 0));
    const cost = kg * rate, area = num(row.qty) * num(row.w_in) * num(row.l_in) / 144, perFt = area ? cost / area : 0, suggested = area ? Math.ceil(perFt * (1 + st.markup / 100) + st.cutRate) : 0;
    return {list, ok: !!r.sheets, sheet: chosen, r, kg, cost, area, suggested, perPc: num(row.qty) ? cost / num(row.qty) : 0, stock: s.count, rate};
  };
  const defaultRate = m => { for (const s of stock) if (s.material === m && s.cost > 0) { const kg = sheetWeightKg(m, num(s.thickness_mm), s.w, s.l); if (kg) return Math.round(s.cost / kg); } return 0; };
  for (const r of st.rows) if (st.rates[r.material] == null) { const d = defaultRate(r.material); if (d) st.rates[r.material] = d; }

  const gaugeOpts = row => { const g = gauges[row.material] || {}, match = matchGauge(row.material, row.thickness_mm), custom = num(row.thickness_mm) > 0 && !match; return `<option value="">—</option>${custom ? `<option value="mm:${row.thickness_mm}" selected>${Number(row.thickness_mm)} mm</option>` : ''}${Object.entries(g).map(([k, n]) => `<option value="${k}" ${match?.gauge === k ? 'selected' : ''}>${k} ga</option>`).join('')}`; };
  const sheetOpts = row => `<option value="auto" ${row.sheet === 'auto' ? 'selected' : ''}>Auto (best)</option>${[...allSizes, ...st.custom].map(o => `<option value="${o.id}" ${row.sheet === o.id ? 'selected' : ''}>${esc(sheetLabel(o.w, o.l))}</option>`).join('')}`;
  const resCell = (row, x) => { if (!(num(row.w_in) > 0 && num(row.l_in) > 0)) return '<span class="fine">Enter W × L</span>'; if (!x.ok) return '<span class="late">Does not fit</span>'; return `<b>${x.r.sheets} × ${esc(sheetLabel(x.sheet.w, x.sheet.l))}</b><small>${x.r.perSheet}/sheet · ${x.r.usage}%${x.kg ? ` · ${Math.round(x.kg)} kg` : ''}</small>`; };
  const rowHTML = (row, i) => { const x = result(row); return `<tr data-row="${i}" class="${st.selected === i ? 'sel' : ''}"><td class="n"><button type="button" class="sc-pick" data-pick="${i}" title="Show this item">${i + 1}</button></td>
    <td><input data-f="description" value="${esc(row.description)}" placeholder="Item"></td><td><input data-f="qty" type="number" min="1" step="1" value="${esc(row.qty)}"></td>
    <td><select data-f="material">${Object.entries(materials).map(([k, v]) => `<option value="${k}" ${row.material === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></td><td><select data-f="gauge">${gaugeOpts(row)}</select></td>
    <td><span class="sc-wl"><input data-f="w_in" type="number" min="0" step="any" value="${esc(row.w_in)}" placeholder="W"> × <input data-f="l_in" type="number" min="0" step="any" value="${esc(row.l_in)}" placeholder="L"></span></td>
    <td><select data-f="sheet">${sheetOpts(row)}</select></td><td class="res" data-res="${i}">${resCell(row, x)}</td><td><button type="button" class="sc-del" data-del="${i}" aria-label="Remove item ${i + 1}" ${st.rows.length === 1 ? 'disabled' : ''}>×</button></td></tr>`; };

  const summaryHTML = () => { const groups = []; let total = 0, area = 0; st.rows.forEach(row => { const x = result(row); if (!x.ok) return; const key = `${row.material}|${row.thickness_mm}|${x.sheet.id}`; let g = groups.find(g => g.key === key); if (!g) { g = {key, row, sheet: x.sheet, sheets: 0, kg: 0, cost: 0, stock: x.stock}; groups.push(g); } g.sheets += x.r.sheets; g.kg += x.kg; g.cost += x.cost; total += x.cost; area += x.area; });
    if (!groups.length) return '<p class="fine">Add items with W × L to see the sheets needed.</p>';
    return `<table class="sc-sum"><thead><tr><th>MATERIAL</th><th>SHEET</th><th class="money">SHEETS</th><th class="money">WEIGHT</th><th class="money">STOCK</th><th class="money">MATERIAL COST</th></tr></thead><tbody>${groups.map(g => `<tr><td>${esc(materials[g.row.material] || '')} ${esc(gaugeText(g.row.material, g.row.thickness_mm))}</td><td>${esc(sheetLabel(g.sheet.w, g.sheet.l))}</td><td class="money"><b>${g.sheets}</b></td><td class="money">${g.kg ? Math.round(g.kg).toLocaleString('en-PK') + ' kg' : '—'}</td><td class="money ${g.stock >= g.sheets ? 'ok' : 'short'}">${g.stock || 'None'}${g.stock && g.stock < g.sheets ? ` (short ${g.sheets - g.stock})` : ''}</td><td class="money">${g.cost ? pkr(g.cost) : '—'}</td></tr>`).join('')}<tr class="total"><td colspan="2">Total · ${r1(area).toLocaleString('en-PK')} ft² of parts</td><td class="money">${groups.reduce((n, g) => n + g.sheets, 0)}</td><td class="money">${Math.round(groups.reduce((n, g) => n + g.kg, 0)).toLocaleString('en-PK')} kg</td><td></td><td class="money">${total ? pkr(total) : '—'}</td></tr></tbody></table>`; };

  const pricingHTML = () => { const used = [...new Set(st.rows.map(r => r.material))];
    const rows = st.rows.map((row, i) => { const x = result(row); return x.ok ? `<tr><td>${i + 1}. ${esc(row.description || 'Item')}</td><td class="money">${r1(x.area)} ft²</td><td class="money">${x.cost ? pkr(x.cost) : '—'}</td><td class="money">${x.cost ? pkr(x.perPc) : '—'}</td><td class="money"><b>${x.suggested ? `PKR ${x.suggested.toLocaleString('en-PK')}` : '—'}</b></td></tr>` : ''; }).join('');
    return `<div class="sc-rates">${used.map(m => `<label>${esc(materials[m] || m)} <input type="number" min="0" step="1" data-rate="${m}" value="${esc(st.rates[m] ?? '')}" placeholder="0"> PKR/kg</label>`).join('')}<label>Markup <input type="number" min="0" max="500" step="1" data-set="markup" value="${st.markup}"> %</label><label>Cutting &amp; labour <input type="number" min="0" step="1" data-set="cutRate" value="${st.cutRate}"> PKR/ft²</label></div>
      ${rows ? `<table class="sc-sum"><thead><tr><th>ITEM</th><th class="money">PART AREA</th><th class="money">MATERIAL</th><th class="money">PER PIECE</th><th class="money">SUGGESTED RATE / FT²</th></tr></thead><tbody>${rows}</tbody></table><p class="fine">Suggested rate = material cost per ft² of parts × (1 + markup) + cutting &amp; labour. Material rate is filled from your stock cost when a matching sheet is in stock.</p>` : ''}`; };

  const viewHTML = () => { const i = Math.min(st.selected, st.rows.length - 1), row = st.rows[i], x = result(row);
    const nav = `<div class="sc-nav"><button type="button" data-nav="-1" ${i === 0 ? 'disabled' : ''}>‹</button><select data-pickselect>${st.rows.map((r, k) => `<option value="${k}" ${k === i ? 'selected' : ''}>${k + 1}. ${esc(r.description || 'Item')}${num(r.w_in) && num(r.l_in) ? ` · ${r.w_in}" × ${r.l_in}"` : ''}</option>`).join('')}</select><button type="button" data-nav="1" ${i === st.rows.length - 1 ? 'disabled' : ''}>›</button><span class="seg sc-view"><button type="button" data-view="first" class="${st.view === 'first' ? 'on' : ''}">First sheet</button><button type="button" data-view="last" class="${st.view === 'last' ? 'on' : ''}">Last sheet</button></span></div>`;
    if (!(num(row.w_in) > 0 && num(row.l_in) > 0)) return nav + '<p class="fine">Enter the part size (W × L in inches) for this item.</p>';
    const fig = x.sheet ? drawSheet({w_in: row.w_in, l_in: row.l_in, qty: row.qty, sheet: x.sheet}, {...settings(), which: st.view, title: `${i + 1}. ${row.description || 'Item'} · ${row.qty} pcs`}).html : '';
    const list = x.list, cur = x.sheet?.id, best = list[0], mine = list.find(s => s.o.id === cur), save = mine && best && best.o.id !== cur ? r1(mine.waste - best.waste) : 0;
    const panel = list.length ? `<aside class="pf-suggest"><h4>${st.goal === 'sheets' ? 'Fewest sheets' : 'Least offcut'} for ${esc(String(Math.ceil(num(row.qty))))} pcs</h4><ol>${list.slice(0, 6).map((s, k) => `<li class="${k === 0 ? 'best' : ''} ${s.o.id === cur ? 'current' : ''}"><div><b>${esc(sheetLabel(s.o.w, s.o.l))}</b>${k === 0 ? ' <span class="tag best">Best</span>' : ''}${s.o.id === cur ? ` <span class="tag cur">${row.sheet === 'auto' ? 'Auto' : 'In use'}</span>` : ''}<small>${s.r.sheets} sheet${s.r.sheets === 1 ? '' : 's'} · ${s.r.perSheet}/sheet · ${s.r.usage}% used</small><small class="${s.waste > 0 ? 'waste' : ''}">${s.waste.toLocaleString('en-PK')} ft² offcut${s.stock ? ` · ${s.stock} in stock` : ''}</small></div>${s.o.id === cur && row.sheet !== 'auto' ? '' : `<button type="button" class="textbutton" data-use="${esc(s.o.id)}">Use</button>`}</li>`).join('')}</ol>${save > 0 ? `<p class="pf-save">Switching to ${esc(sheetLabel(best.o.w, best.o.l))} saves about <b>${save.toLocaleString('en-PK')} ft²</b>.</p>` : ''}</aside>` : '<aside class="pf-suggest"><p class="fine">This part does not fit any selected sheet size. Add a custom size or allow rotation.</p></aside>';
    return `${nav}<div class="plan-row">${fig}${panel}</div>`; };

  const sizeChips = () => `${[...allSizes, ...st.custom].map(o => `<label class="sc-chip"><input type="checkbox" data-size="${o.id}" ${st.sizes.includes(o.id) ? 'checked' : ''}> ${esc(sheetLabel(o.w, o.l))}${o.label?.includes('stock') ? ' <small>stock</small>' : ''}</label>`).join('')}<span class="sc-addsize"><input type="number" min="1" step="0.5" data-cw placeholder="W ft"> × <input type="number" min="1" step="0.5" data-cl placeholder="L ft"> <button type="button" data-addsize>＋ Size</button></span>`;

  function render() {
    root.innerHTML = `<div class="sc">
      <div class="sc-settings"><label>Gap between parts <input type="number" min="0" max="100" step="0.5" data-set="gap" value="${st.gap}"> mm</label><label>Edge margin <input type="number" min="0" max="100" step="0.5" data-set="margin" value="${st.margin}"> mm</label><label class="sc-check"><input type="checkbox" data-set="rotate" ${st.rotate ? 'checked' : ''}> Allow turning parts 90°</label><label>Best means <select data-set="goal"><option value="offcut" ${st.goal === 'offcut' ? 'selected' : ''}>least offcut</option><option value="sheets" ${st.goal === 'sheets' ? 'selected' : ''}>fewest sheets</option></select></label></div>
      <details class="sc-sizes"><summary>Sheet sizes to compare (${st.sizes.length})</summary><div>${sizeChips()}</div></details>
      <section class="sc-items"><div class="sc-head">ITEMS</div><div class="tablewrap"><table class="sc-rows"><thead><tr><th>#</th><th>ITEM</th><th>QTY</th><th>MATERIAL</th><th>GAUGE</th><th>W × L (IN)</th><th>SHEET</th><th>RESULT</th><th></th></tr></thead><tbody>${st.rows.map(rowHTML).join('')}</tbody></table></div><button type="button" class="sc-add" data-addrow>＋ Add item</button></section>
      <div class="sc-cols"><section class="sc-left"><div class="sc-head">SHEETS NEEDED</div><div data-summary>${summaryHTML()}</div>
        <div class="sc-head">PRICING HELP</div><div data-pricing>${pricingHTML()}</div></section>
      <section class="sc-right">${legendHTML}<div data-view>${viewHTML()}</div></section></div>
      <div class="sc-foot"><button type="button" data-csv>Export CSV</button>${init.onApply ? `<label class="sc-check"><input type="checkbox" data-applyrates ${st.applyRates ? 'checked' : ''}> Also set suggested rates</label><button type="button" class="primary" data-apply>Apply to quote</button>` : ''}</div></div>`;
  }
  const refresh = () => { st.rows.forEach((row, i) => { const c = root.querySelector(`[data-res="${i}"]`); if (c) c.innerHTML = resCell(row, result(row)); }); root.querySelector('[data-summary]').innerHTML = summaryHTML(); const pr = root.querySelector('[data-pricing]'); if (!pr.contains(document.activeElement)) pr.innerHTML = pricingHTML(); root.querySelector('[data-view]').innerHTML = viewHTML(); root.querySelectorAll('.sc-rows tr[data-row]').forEach(tr => tr.classList.toggle('sel', Number(tr.dataset.row) === st.selected)); };

  root.addEventListener('input', e => { const t = e.target, tr = t.closest('tr[data-row]');
    if (tr && t.dataset.f && !['material', 'gauge', 'sheet'].includes(t.dataset.f)) { const row = st.rows[Number(tr.dataset.row)]; row[t.dataset.f] = t.dataset.f === 'description' ? t.value : t.value === '' ? '' : Number(t.value); st.selected = Number(tr.dataset.row); refresh(); return; }
    if (t.dataset.rate) { st.rates[t.dataset.rate] = t.value === '' ? undefined : Number(t.value); refreshKeep(); return; }
    if (t.dataset.set && ['gap', 'margin', 'markup', 'cutRate'].includes(t.dataset.set)) { st[t.dataset.set] = Math.max(0, Number(t.value) || 0); t.closest('[data-pricing]') ? refreshKeep() : refresh(); } });
  const refreshKeep = () => { st.rows.forEach((row, i) => { const c = root.querySelector(`[data-res="${i}"]`); if (c) c.innerHTML = resCell(row, result(row)); }); root.querySelector('[data-summary]').innerHTML = summaryHTML(); const tbl = root.querySelector('[data-pricing] table'); if (tbl) { const tmp = document.createElement('div'); tmp.innerHTML = pricingHTML(); tbl.replaceWith(tmp.querySelector('table')); } };
  root.addEventListener('change', e => { const t = e.target, tr = t.closest('tr[data-row]');
    if (tr && t.dataset.f === 'material') { const row = st.rows[Number(tr.dataset.row)]; row.material = t.value; if (!matchGauge(row.material, row.thickness_mm)) row.thickness_mm = null; if (st.rates[row.material] == null) { const d = defaultRate(row.material); if (d) st.rates[row.material] = d; } render(); return; }
    if (tr && t.dataset.f === 'gauge') { const row = st.rows[Number(tr.dataset.row)]; row.thickness_mm = t.value.startsWith('mm:') ? Number(t.value.slice(3)) : t.value ? gauges[row.material][t.value] : null; refresh(); return; }
    if (tr && t.dataset.f === 'sheet') { st.rows[Number(tr.dataset.row)].sheet = t.value; st.selected = Number(tr.dataset.row); refresh(); return; }
    if (t.dataset.set === 'rotate') { st.rotate = t.checked; refresh(); return; }
    if (t.dataset.set === 'goal') { st.goal = t.value; refresh(); return; }
    if (t.dataset.size) { st.sizes = t.checked ? [...new Set([...st.sizes, t.dataset.size])] : st.sizes.filter(s => s !== t.dataset.size); render(); return; }
    if (t.dataset.pickselect !== undefined) { st.selected = Number(t.value); refresh(); return; }
    if (t.dataset.applyrates !== undefined) st.applyRates = t.checked; });
  root.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pick) { st.selected = Number(b.dataset.pick); refresh(); }
    else if (b.dataset.nav) { st.selected = Math.max(0, Math.min(st.rows.length - 1, st.selected + Number(b.dataset.nav))); refresh(); }
    else if (b.dataset.view) { st.view = b.dataset.view; refresh(); }
    else if (b.dataset.use) { st.rows[st.selected].sheet = b.dataset.use; render(); }
    else if (b.dataset.del) { st.rows.splice(Number(b.dataset.del), 1); st.selected = Math.min(st.selected, st.rows.length - 1); render(); }
    else if (b.hasAttribute('data-addrow')) { const prev = st.rows[st.rows.length - 1] || {}; st.rows.push({...blankRow(), material: prev.material || 'steel', thickness_mm: prev.thickness_mm ?? null}); st.selected = st.rows.length - 1; render(); root.querySelector(`tr[data-row="${st.selected}"] [data-f="description"]`)?.focus(); }
    else if (b.hasAttribute('data-addsize')) { const w = num(root.querySelector('[data-cw]').value) * 12, l = num(root.querySelector('[data-cl]').value) * 12; if (!(w > 0 && l > 0)) return; const [a, c] = [Math.min(w, l), Math.max(w, l)], id = `${a}x${c}`; if (![...allSizes, ...st.custom].some(s => s.id === id)) st.custom.push({id, label: `${a / 12}' × ${c / 12}' (custom)`, w: a * IN, l: c * IN}); st.sizes = [...new Set([...st.sizes, id])]; render(); }
    else if (b.hasAttribute('data-csv')) exportCSV();
    else if (b.hasAttribute('data-apply')) init.onApply?.(state()); });

  function state() { return {rows: st.rows.map(row => { const x = result(row); return {...row, resolved_sheet: x.sheet?.id || '', sheets: x.r?.sheets || 0, suggested_rate: x.suggested || 0}; }), gap: st.gap, margin: st.margin, rotate: st.rotate, goal: st.goal, sizes: st.sizes, custom: st.custom, rates: st.rates, markup: st.markup, cutRate: st.cutRate, applyRates: st.applyRates}; }
  function exportCSV() { const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`; const lines = [['#', 'Item', 'Qty', 'Material', 'Gauge', 'W (in)', 'L (in)', 'Sheet', 'Pcs/sheet', 'Sheets', 'Use %', 'Weight kg', 'Material cost PKR', 'Suggested rate PKR/ft2']];
    st.rows.forEach((row, i) => { const x = result(row); lines.push([i + 1, row.description, row.qty, materials[row.material] || '', gaugeText(row.material, row.thickness_mm), row.w_in, row.l_in, x.sheet ? sheetLabel(x.sheet.w, x.sheet.l) : '', x.r?.perSheet || '', x.r?.sheets || '', x.r?.usage || '', x.kg ? Math.round(x.kg) : '', x.cost ? Math.round(x.cost) : '', x.suggested || '']); });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.map(r => r.map(cell).join(',')).join('\r\n')], {type: 'text/csv'})); a.download = `sheet-plan-${new Date().toLocaleDateString('en-CA')}.csv`; document.body.appendChild(a); a.click(); a.remove(); }
  render();
  return {state, render};
}

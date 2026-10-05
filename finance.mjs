// Financial statements from posted journals: balances, account ledger, profit & loss, balance sheet, trial balance
// and a direct cash-flow summary. Amounts are worked in paisa (integer cents) and returned in rupees.
import {accountGroups, accountList} from './accounts.mjs?v=coa-2';

const cents = v => Math.round(Number(v || 0) * 100);
const rs = c => c / 100;
const typeOf = code => accountList.find(a => a.code === code)?.type || '';
// Debit-normal accounts show a debit balance as positive; credit-normal accounts show a credit balance as positive.
export const debitNormal = type => ['Asset', 'Direct cost', 'Expense'].includes(type);
export const natural = (code, debitMinusCredit) => debitNormal(typeOf(code)) ? debitMinusCredit : -debitMinusCredit;

// Debit − credit per account (paisa) for journals dated between from and to (inclusive; omit from for "to date").
export function movements(journals, from, to) {
  const out = {};
  for (const j of journals) { if (j.date > to || (from && j.date < from)) continue; for (const l of j.lines) out[l.account] = (out[l.account] || 0) + cents(l.debit) - cents(l.credit); }
  return out;
}
export const balancesAsAt = (journals, asAt) => movements(journals, '', asAt);

// Ledger for one account: opening balance, entries with running balance, closing balance (natural sign, rupees).
export function accountLedger(journals, code, from, to) {
  let bal = 0; const entries = [];
  const sorted = [...journals].sort((a, b) => a.date.localeCompare(b.date) || String(a.created_at || '').localeCompare(String(b.created_at || '')));
  for (const j of sorted) {
    if (j.date > to) continue;
    const d = j.lines.filter(l => l.account === code).reduce((n, l) => n + cents(l.debit) - cents(l.credit), 0); if (!d) continue;
    if (j.date < from) { bal += d; continue; }
    if (!entries.length) entries.opening = bal;
    bal += d;
    const others = [...new Set(j.lines.filter(l => l.account !== code).map(l => l.account))];
    entries.push({id: j.id, date: j.date, description: j.description, kind: j.source_kind, against: others, debit: rs(Math.max(d, 0)), credit: rs(Math.max(-d, 0)), balance: rs(natural(code, bal))});
  }
  const opening = entries.opening ?? bal;
  return {code, from, to, opening: rs(natural(code, opening)), entries: [...entries], debits: entries.reduce((n, e) => n + e.debit, 0), credits: entries.reduce((n, e) => n + e.credit, 0), closing: rs(natural(code, bal))};
}

// Profit & loss for a period, with account lines per section.
export function profitLoss(journals, from, to) {
  const m = movements(journals, from, to), sec = type => accountList.filter(a => a.type === type && m[a.code]).map(a => ({code: a.code, name: a.name, parent: a.parent, amount: rs(type === 'Revenue' ? -m[a.code] : m[a.code]), cls: a.class || ''}));
  const revenue = sec('Revenue'), direct = sec('Direct cost'), expenses = sec('Expense'), sum = rows => rows.reduce((n, r) => n + cents(r.amount), 0);
  const R = sum(revenue), D = sum(direct), E = sum(expenses), T = sum(expenses.filter(r => r.cls === 'Taxation'));
  return {from, to, revenue, direct, expenses, beforeTax: rs(R - D - E + T), totalTax: rs(T), totalRevenue: rs(R), totalDirect: rs(D), gross: rs(R - D), totalExpenses: rs(E), net: rs(R - D - E), grossMargin: R ? Math.round((R - D) / R * 1000) / 10 : null, netMargin: R ? Math.round((R - D - E) / R * 1000) / 10 : null};
}
// The period of the same length just before [from, to].
export function previousPeriod(from, to) {
  const day = 86400000, f = Date.parse(from + 'T00:00:00Z'), t = Date.parse(to + 'T00:00:00Z'), len = Math.round((t - f) / day) + 1;
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  return {from: iso(f - len * day), to: iso(f - day)};
}

// Balance sheet as at a date. Profit not yet moved to retained earnings shows as "Current earnings".
export function balanceSheet(journals, asAt) {
  const b = balancesAsAt(journals, asAt), group = g => g.children.filter(a => b[a.code]).map(a => ({code: a.code, name: a.name, amount: rs(g.type === 'Asset' || g.type === 'Contra asset' ? b[a.code] : -b[a.code])}));
  const section = types => accountGroups.filter(g => types.includes(g.type)).map(g => ({code: g.code, name: g.name, type: g.type, cls: g.class || '', lines: group(g)})).filter(g => g.lines.length).map(g => ({...g, total: rs(g.lines.reduce((n, l) => n + cents(l.amount), 0))}));
  const assets = section(['Asset', 'Contra asset']), liabilities = section(['Liability', 'Tax control']), equity = section(['Equity']);
  const earnings = -accountList.filter(a => ['Revenue', 'Direct cost', 'Expense'].includes(a.type)).reduce((n, a) => n + (b[a.code] || 0), 0);
  const tot = s => s.reduce((n, g) => n + cents(g.total), 0), A = tot(assets), L = tot(liabilities), Q = tot(equity) + earnings;
  return {asAt, assets, liabilities, equity, earnings: rs(earnings), totalAssets: rs(A), totalLiabilities: rs(L), totalEquity: rs(Q), balanced: A === L + Q, difference: rs(A - L - Q)};
}

// Trial balance as at a date: every account with a balance, debit or credit column.
export function trialBalance(journals, asAt) {
  const b = balancesAsAt(journals, asAt), rows = accountList.filter(a => b[a.code]).map(a => ({code: a.code, name: a.name, type: a.type, debit: rs(Math.max(b[a.code], 0)), credit: rs(Math.max(-b[a.code], 0))}));
  return {asAt, rows, debit: rows.reduce((n, r) => n + r.debit, 0), credit: rows.reduce((n, r) => n + r.credit, 0)};
}

// Direct cash flow for a period: money into and out of the cash & bank accounts, grouped by what was on the other
// side of each entry (customer receipts, supplier payments, salaries, assets, owner…). Transfers between cash
// accounts are left out.
export const cashAccounts = ['1001', '1002', '1003'];
export function cashFlow(journals, from, to) {
  const groups = {}, activity = code => code.startsWith('13') || code.startsWith('14') ? 'Investing' : code.startsWith('3') ? 'Financing' : 'Operating';
  let opening = 0, closing = 0;
  for (const j of journals) {
    const cash = j.lines.filter(l => cashAccounts.includes(l.account)).reduce((n, l) => n + cents(l.debit) - cents(l.credit), 0);
    if (j.date <= to) closing += cash; if (j.date < from) opening += cash;
    if (!cash || j.date < from || j.date > to) continue;
    const others = j.lines.filter(l => !cashAccounts.includes(l.account)), weight = others.reduce((n, l) => n + Math.abs(cents(l.debit) - cents(l.credit)), 0);
    if (!others.length || !weight) continue;
    for (const l of others) {
      const share = Math.round(cash * Math.abs(cents(l.debit) - cents(l.credit)) / weight), g = accountGroups.find(x => x.children.some(a => a.code === l.account)), key = g?.code || l.account;
      const row = groups[key] ||= {code: key, name: g?.name || l.account, activity: activity(key), cashIn: 0, cashOut: 0};
      if (share > 0) row.cashIn += share; else row.cashOut -= share;
    }
  }
  const rows = Object.values(groups).map(r => ({...r, cashIn: rs(r.cashIn), cashOut: rs(r.cashOut), net: rs(r.cashIn - r.cashOut)})).sort((a, b) => ['Operating', 'Investing', 'Financing'].indexOf(a.activity) - ['Operating', 'Investing', 'Financing'].indexOf(b.activity) || b.cashIn + b.cashOut - a.cashIn - a.cashOut);
  const by = act => rs(rows.filter(r => r.activity === act).reduce((n, r) => n + cents(r.net), 0));
  return {from, to, rows, opening: rs(opening), closing: rs(closing), operating: by('Operating'), investing: by('Investing'), financing: by('Financing'), totalIn: rs(rows.reduce((n, r) => n + cents(r.cashIn), 0)), totalOut: rs(rows.reduce((n, r) => n + cents(r.cashOut), 0))};
}

export const cents = value => Math.round(Number(value) * 100);
export function invoiceBalance(invoice, payments) {
 const paid = payments.filter(p => p.invoice_id === invoice.id).reduce((sum,p) => sum + cents(p.amount),0);
 return {paid:paid/100, due:(cents(invoice.amount)-paid)/100};
}
export function invoiceStatus(invoice,payments,today) {
 const {paid,due}=invoiceBalance(invoice,payments);
 return due===0?'Paid':invoice.due_date<today?'Overdue':paid>0?'Part paid':'Unpaid';
}
export function validatePayment(amount,due) {
 if(!Number.isFinite(Number(amount)) || cents(amount)<=0 || Math.abs(Number(amount)*100-cents(amount))>0.00001)throw Error('Enter a positive payment with up to two decimal places.');
 if(cents(amount)>cents(due))throw Error('Payment cannot exceed the outstanding balance.');
}
// Line totals in paise. A line may carry an optional percentage discount (0-100).
export const lineDiscount = line => { const d = Number(line?.discount); return Number.isFinite(d) && d > 0 ? d : 0; };
export const lineCents = line => Math.round(Number(line.quantity) * Number(line.rate) * (100 - lineDiscount(line)));
export function documentTotals(lines, tax) {
 let gross = 0, net = 0;
 for (const l of lines) { gross += Math.round(Number(l.quantity) * Number(l.rate) * 100); net += lineCents(l); }
 const taxCents = Math.round(net * Number(tax || 0) / 100);
 return {gross: gross / 100, discount: (gross - net) / 100, net: net / 100, tax: taxCents / 100, total: (net + taxCents) / 100};
}
export function validateDiscount(value) {
 const d = value == null ? 0 : Number(value);
 if (!Number.isFinite(d) || d < 0 || d > 100) throw Error('Enter a line discount between 0 and 100%.');
 return d;
}
// Receivables ageing by days past the due date, as at a given ISO date.
export const ageingBuckets = ['Not yet due', '1-30 days', '31-60 days', '61+ days'];
const daysBetween = (from, to) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000);
export function receivablesAgeing(invoices, payments, asAt) {
 const upTo = payments.filter(p => p.date <= asAt), byParty = new Map(), totals = [0, 0, 0, 0];
 for (const inv of invoices) {
  if (inv.date > asAt) continue;
  const due = cents(invoiceBalance(inv, upTo).due);
  if (due <= 0) continue;
  const late = daysBetween(inv.due_date, asAt), bucket = late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : 3;
  const row = byParty.get(inv.party) || {party: inv.party, buckets: [0, 0, 0, 0], total: 0, invoices: 0};
  row.buckets[bucket] += due; row.total += due; row.invoices += 1; totals[bucket] += due; byParty.set(inv.party, row);
 }
 const rows = [...byParty.values()].sort((a, b) => b.total - a.total || a.party.localeCompare(b.party))
  .map(r => ({...r, buckets: r.buckets.map(c => c / 100), total: r.total / 100}));
 return {rows, totals: totals.map(c => c / 100), total: totals.reduce((n, c) => n + c, 0) / 100};
}
// Customer statement: invoices (charges) and receipts (credits) with a running balance.
export function customerStatement(party, invoices, payments, from, to) {
 const mine = invoices.filter(i => i.party === party), ids = new Map(mine.map(i => [i.id, i]));
 const all = [
  ...mine.map(i => ({date: i.date, type: 'Invoice', reference: i.reference, details: i.description || '', charge: cents(i.amount), credit: 0, order: 0})),
  ...payments.filter(p => ids.has(p.invoice_id)).map(p => ({date: p.date, type: 'Payment', reference: ids.get(p.invoice_id).reference, details: [p.method, p.reference].filter(Boolean).join(' - '), charge: 0, credit: cents(p.amount), order: 1}))
 ].sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order || a.reference.localeCompare(b.reference));
 let balance = all.filter(e => e.date < from).reduce((n, e) => n + e.charge - e.credit, 0);
 const opening = balance, entries = [];
 let charged = 0, received = 0;
 for (const e of all) {
  if (e.date < from || e.date > to) continue;
  balance += e.charge - e.credit; charged += e.charge; received += e.credit;
  entries.push({date: e.date, type: e.type, reference: e.reference, details: e.details, charge: e.charge / 100, credit: e.credit / 100, balance: balance / 100});
 }
 return {party, from, to, opening: opening / 100, entries, charged: charged / 100, received: received / 100, closing: balance / 100};
}

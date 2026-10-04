// Customer and vendor accounts: running-balance ledgers, monthly summaries, ageing and vendor payments.
// Amounts are handled in paisa (integer cents) and returned in rupees.
// A ledger entry is {date, type, reference, details, charge, credit}: for a customer, charge = invoiced and
// credit = received; for a vendor, charge = billed (received purchase orders) and credit = paid.
const cents=v=>Math.round(Number(v||0)*100);

export const vendorPayMethods={'Business Bank Account':'1002','Cash on Hand':'1001','Petty Cash':'1003'};
export const payableAccounts=['2001','2002','2003','2004'];
export const partyKinds=['vendorpay'];
// Default payable account from the vendor's supply category.
export function payableFor(vendor){const c=String(vendor?.supply_category||'').toLowerCase();return c.includes('gas')?'2002':c.includes('consumable')?'2003':c.includes('service')||c.includes('transport')||c.includes('contract')?'2004':'2001'}

export function validateVendorPayment(p){
 if(!String(p.vendor||'').trim())throw Error('Choose the vendor.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date||''))throw Error('Enter the payment date.');
 const a=Number(p.amount);if(!Number.isFinite(a)||a<=0||a>1e9||Math.abs(a*100-Math.round(a*100))>1e-6)throw Error('Enter an amount above zero with up to two decimals.');
 if(!vendorPayMethods[p.method])throw Error('Choose where the money was paid from.');
 if(!payableAccounts.includes(p.payable_account))throw Error('Choose the payable account.');
 return {...p,amount:Math.round(a*100)/100,vendor:String(p.vendor).trim()};
}
// Vendor payment journal: Dr supplier payable, Cr cash/bank.
export function partyLines(kind,p){
 if(kind!=='vendorpay')throw Error('Unsupported posting source.');
 const bank=vendorPayMethods[p.method];if(!bank)throw Error('Unknown cash/bank account.');
 const acct=payableAccounts.includes(p.payable_account)?p.payable_account:'2001';
 return [{account:acct,debit:Number(p.amount),credit:0},{account:bank,debit:0,credit:Number(p.amount)}];
}

const byDate=(a,b)=>a.date.localeCompare(b.date)||(a.order||0)-(b.order||0)||String(a.reference).localeCompare(String(b.reference));
// Statement for a period: opening balance, entries with running balance, totals and closing balance.
export function partyLedger(all,from,to){
 const sorted=[...all].sort(byDate);let bal=0,charged=0,received=0;const entries=[];
 for(const e of sorted)if(e.date<from)bal+=cents(e.charge)-cents(e.credit);
 const opening=bal;
 for(const e of sorted){if(e.date<from||e.date>to)continue;bal+=cents(e.charge)-cents(e.credit);charged+=cents(e.charge);received+=cents(e.credit);entries.push({...e,charge:cents(e.charge)/100,credit:cents(e.credit)/100,balance:bal/100})}
 return {from,to,opening:opening/100,entries,charged:charged/100,received:received/100,closing:bal/100};
}
// Month-by-month totals for a year: charged, credited and closing balance at month end.
export function monthlySummary(all,year){
 const y=String(year);let bal=all.filter(e=>e.date<`${y}-01-01`).reduce((n,e)=>n+cents(e.charge)-cents(e.credit),0);const opening=bal;
 const months=Array.from({length:12},(_,i)=>{const m=`${y}-${String(i+1).padStart(2,'0')}`,inM=all.filter(e=>e.date.slice(0,7)===m),c=inM.reduce((n,e)=>n+cents(e.charge),0),r=inM.reduce((n,e)=>n+cents(e.credit),0);bal+=c-r;return {month:m,charged:c/100,credited:r/100,net:(c-r)/100,closing:bal/100,count:inM.length}});
 return {opening:opening/100,months,charged:months.reduce((n,m)=>n+cents(m.charged),0)/100,credited:months.reduce((n,m)=>n+cents(m.credited),0)/100,closing:bal/100};
}
const days=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
export const ageBuckets=['Not yet due','1–30 days','31–60 days','61–90 days','Over 90 days'];
// docs: [{date, due_date, due}] open amounts. Days overdue count from the due date (or the document date).
export function ageing(docs,asAt){
 const totals=[0,0,0,0,0];
 for(const d of docs){const due=cents(d.due);if(due<=0)continue;const late=days(d.due_date||d.date,asAt);totals[late<=0?0:late<=30?1:late<=60?2:late<=90?3:4]+=due}
 return {buckets:ageBuckets.map((label,i)=>({label,amount:totals[i]/100})),total:totals.reduce((a,b)=>a+b,0)/100,overdue:totals.slice(1).reduce((a,b)=>a+b,0)/100};
}
// Average days from invoice date to the payment that settled it (fully paid invoices only).
export function averageDaysToPay(invoices,payments){
 const spans=[];for(const i of invoices){const ps=payments.filter(p=>p.invoice_id===i.id);if(!ps.length)continue;const paid=ps.reduce((n,p)=>n+cents(p.amount),0);if(paid<cents(i.amount))continue;const last=ps.map(p=>p.date).sort().pop();spans.push(Math.max(0,days(i.date,last)))}
 return spans.length?Math.round(spans.reduce((a,b)=>a+b,0)/spans.length):null;
}
// Vendor bills settled oldest first: payments marked against a purchase order go to that bill, the rest
// are applied to the oldest open bills. Returns each bill with paid and due amounts.
export function settleBills(bills,payments){
 const open=[...bills].sort(byDate).map(b=>({...b,paidC:0}));
 const pool=[];for(const p of payments){const amt=cents(p.amount),own=p.po_id&&open.find(b=>b.id===p.po_id);if(own){const take=Math.min(amt,cents(own.amount)-own.paidC);own.paidC+=take;if(amt>take)pool.push(amt-take)}else pool.push(amt)}
 let spare=pool.reduce((a,b)=>a+b,0);
 for(const b of open){if(!spare)break;const take=Math.min(spare,cents(b.amount)-b.paidC);b.paidC+=take;spare-=take}
 return {bills:open.map(({paidC,...b})=>({...b,paid:paidC/100,due:(cents(b.amount)-paidC)/100})),unapplied:spare/100};
}

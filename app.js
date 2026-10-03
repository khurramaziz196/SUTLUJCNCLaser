import {createLocalStore,validateWorkspace} from './local-store.mjs?v=scrap-1';
import {createInvoicePDF} from './invoice-pdf.mjs?v=logo-2';
import {validateJournal,sourceLines,reverseLines,ledgerReport} from './ledger.mjs?v=scrap-1';
import {invoiceBalance,invoiceStatus,validatePayment,documentTotals,validateDiscount,lineDiscount,lineCents,receivablesAgeing,ageingBuckets,customerStatement} from './invoice-math.mjs';
import {createStatementPDF} from './statement-pdf.mjs';
import {accountGroups,accountList,expenseAccounts} from './accounts.mjs?v=hr-1';
import {attendanceCodes,roles,costTypes,payAccounts,monthDays,monthDates,employedOn,employedIn,validateEmployee,attendanceSummary,leaveTaken,advanceBalance,payrollLine,payrollTotals} from './hr.mjs?v=hr-1';
import {createPayslipPDF} from './payslip-pdf.mjs?v=hr-1';
import {priorities,labourTasks,jobExpenseTypes,jobStage,completionProblem,partWeightKg,scrapSummary,hourlyRate,validateLabour,labourCost,jobCosting,taskStatuses,standardTasks,extraTasks,defaultScope,scopeOf,legacyFromScope,taskProgress,scopeProgress} from './jobs.mjs?v=material-1';
import {createJobCardPDF} from './jobcard-pdf.mjs?v=material-1';
import {stampSVG,stampText,inkLogo} from './stamp.mjs?v=logo-2';
import {scrapPayAccounts,scrapSaleTotals,validateScrapSale,averageRate,lastRate,weighAdjustment} from './scrap.mjs?v=scrap-2';
import {materials,gauges,matchGauge,thicknessText,inferThickness,dimensionTail} from './gauge.mjs';
import { createQuotePDF } from './quote-pdf.mjs?v=po-stamp';
import {defaultCompany,nextDocumentNumber,addDays,quoteNumber,pakistanBanks,bankCurrencies,compactIBAN,formatIBAN,ibanProblem,swiftProblem,bankAccountsOf,defaultBankAccount,findBankAccount,bankAccountLabel,bankAccountProblem,paymentTermsOf,validityOptionsOf,daysBetweenDates} from './documents.mjs?v=terms-2';
import {materialCodes,sheetSizes,categoryLabels,consumableUnits,consumableAccounts,moveLabels,receiptOffsets,qty3,isWhole,unitOf,sheetWeightKg,itemLabel,nextReference,itemCode,validateItem,balances,balanceOf,outValue,validateQuantity,unitCost,offcutValue,suggestedOffset,isPostable,needsReorder,jobMaterialCost,poReceiptStatus,itemFromPOLine,matchStockItem} from './inventory.mjs?v=grn-1';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={invoices:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',inventory:'<path d="M3 21V7l9-4 9 4v14M3 21h18M7 21v-7h10v7M7 10h10M12 14v7"/>',hr:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',workorders:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 3h8v4H8zM8 12h8M8 16h6"/>',overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',sales:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5"/>',procurement:'<path d="m3 7 9-4 9 4-9 5zM3 7v10l9 4 9-4V7M12 12v9"/>',accounts:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M15 13h6M7 3v3"/>',customers:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',vendors:'<path d="M3 21V7l9-4 9 4v14M7 21v-6h10v6M7 9h2M15 9h2M7 12h2M15 12h2"/>',settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>'};
const icon=k=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[k]||icons.sales}</svg>`;
const today=()=>new Date().toLocaleDateString('en-CA');
const currency='PKR';
const money=n=>`${currency} ${Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:2})}`;
const short=n=>Number(n||0).toLocaleString('en-PK',{notation:'compact',maximumFractionDigits:1});
const statuses={enquiry:['New','Quoted','Closed'],quote:['Draft','Sent','Accepted','Declined'],purchase:['Draft','Ordered','Received','Cancelled'],expense:['Pending','Paid'],cash:['Posted']};
const categories=['Capital expense','Operating expense','General expense'];
const labels={enquiry:'enquiry',quote:'quote',purchase:'purchase order',expense:'expense',cash:'petty cash entry'};
let page='overview',tab='quote',query='',filter='All',session=null,connected=false,lastSync=null,loading=false;
let config;try{config=JSON.parse(localStorage.getItem('sutluj-connection')||'{}')}catch{config={}}
let company;try{company={...defaultCompany,...JSON.parse(localStorage.getItem('sutluj-company')||'{}')}}catch{company={...defaultCompany}}
// bank details saved before multiple accounts existed become the first account
if(!company.bank_accounts?.length&&bankAccountsOf(company).length){company={...company,bank_accounts:bankAccountsOf(company)};for(const k of ['bank_name','bank_branch','account_title','beneficiary_address','account_number','iban','swift','currency'])delete company[k];try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}}
const samples=[
 ['quote','QT-1024','Atlas Engineering','MS mounting plates · 4 mm',48500,'Sent'],['quote','QT-1023','Metro Fabricators','SS decorative panels · 2 mm',126000,'Accepted'],['quote','QT-1022','Precision Works','Aluminium brackets · 3 mm',32750,'Draft'],['quote','QT-1021','Crescent Industries','MS base plates · 8 mm',84200,'Accepted'],
 ['enquiry','EN-1008','Nova Interiors','Decorative screens · SS 2 mm',0,'New'],['enquiry','EN-1007','Atlas Engineering','Machine guards · MS 3 mm',0,'New'],
 ['purchase','PO-1006','Pakistan Steel Supply','Mild steel sheets · 4 mm · 1220 × 2440 mm',98000,'Ordered'],['purchase','PO-1005','United Metals','Stainless steel 304 · 2 mm · 1220 × 2440 mm',145000,'Received'],
 ['expense','EX-1004','Power utility','Workshop electricity',18500,'Paid','Operating expense'],['expense','EX-1003','Machine Services','Laser lens replacement',12000,'Pending','Operating expense'],['expense','EX-1002','Workshop Supply','Tools and equipment',26500,'Paid','Capital expense'],['expense','EX-1001','Office Supplies','Stationery and supplies',2500,'Paid','General expense'],['cash','PC-1002','Owner','Petty cash top-up',10000,'Posted','Cash in'],['cash','PC-1001','Workshop','Local delivery',1800,'Posted','Cash out']
];
let records=samples.map((r,i)=>({id:`demo-${i}`,kind:r[0],reference:r[1],party:r[2],description:r[3],amount:r[4],status:r[5],category:r[6]||'',date:today(),notes:'',lines:[{description:r[3],quantity:1,rate:r[4]}],tax:0,created_at:new Date(Date.now()-i*3600000).toISOString()}));
function sampleCustomers(){return [...new Set(samples.filter(r=>['quote','enquiry'].includes(r[0])).map(r=>r[2]))].map((name,i)=>({id:`customer-demo-${i}`,name,contact:'',email:'',phone:'',address:''}));}
let customers=sampleCustomers();
function sampleVendors(){return [...new Set(samples.filter(r=>r[0]==='purchase').map(r=>r[2]))].map((name,i)=>({id:`vendor-demo-${i}`,name,contact:'',email:'',phone:'',address:''}));}
let vendors=sampleVendors();
let invoices=[],payments=[],workOrders=[],journals=[],stockItems=[],stockMoves=[],stockTab='sheet',employees=[],attendance=[],advances=[],payrolls=[],scrapSales=[],jobView=null,jobFilter='All',invFilter='All';
let localStore,localSaveError='';
try{localStore=createLocalStore(localStorage)}catch{localSaveError='Browser storage is unavailable. Export a backup before closing.'}
let reportFrom=today().slice(0,4)+'-01-01',reportTo=today();
let statementFrom=today().slice(0,4)+'-01-01',statementTo=today();
function toast(s){$('#toast').textContent=localSaveError&&!session?localSaveError:s;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',4500)}
function navigate(p){page=p;jobView=null;query='';filter='All';tab=p==='procurement'?'purchase':p==='accounts'?'chart':'quote';render()}
const badge=s=>`<span class="pill ${esc(s.toLowerCase())}">${esc(s)}</span>`;
function render(){saveLocalWorkspace();document.title='Sutluj CNC Laser · Business workspace';$('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand company-brand"><img class="company-logo" src="sutluj-logo.jpg" alt="Sutluj CNC Laser"></div><div class="navlabel">WORKSPACE</div><nav class="nav" aria-label="Main navigation">${sidebarNavigation()}</nav><div class="sidefoot"><div class="row"><div class="avatar">SC</div><div>Sutluj CNC Laser<br><span class="fine">Business workspace · PKR</span></div></div></div></aside><div><header class="topbar"><div class="crumb">Workspace &nbsp; / &nbsp; <b>${page==='workorders'?'Work orders':page==='hr'?'HR':page[0].toUpperCase()+page.slice(1)}</b></div><div class="right"><button class="connection" data-nav="settings">${connected?'Supabase connected':session?'Sync unavailable':'Local workspace'}</button><span class="fine">${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span><div class="avatar">SC</div></div></header><main class="content">${!session&&localSaveError?`<div class="notice" role="alert"><span>${esc(localSaveError)}</span><button data-backup>Export backup</button></div>`:''}${page==='settings'?settings():page==='customers'||page==='vendors'?partyPage(page):page==='overview'?overview():listing()}<div class="footer"><span>Sutluj CNC Laser · Business management</span><span>${connected?`Last synced ${lastSync?.toLocaleTimeString()||''} · refreshes every 30 seconds`:(localSaveError?'Local saving needs attention':'Saved locally in this browser')}</span></div></main></div></div>`;
$$('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$$('[data-new]').forEach(b=>b.onclick=()=>editor(b.dataset.new));$$('[data-edit]').forEach(b=>b.onclick=()=>editor(records.find(r=>r.id===b.dataset.edit)?.kind,b.dataset.edit));$$('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;query='';filter='All';render()});if($('#search'))$('#search').oninput=e=>{query=e.target.value;updateTable()};if($('#filter'))$('#filter').onchange=e=>{filter=e.target.value;updateTable()};if($('#export'))$('#export').onclick=exportCSV;if($('#refresh'))$('#refresh').onclick=()=>sync(true);bindRecordDeletes();bindQuoteRows();bindInvoices();bindWorkOrders();bindAccounting();if(page==='overview')bindOverview();if(page==='inventory')bindInventory();if(page==='hr')bindHR();$$('[data-backup]').forEach(b=>b.onclick=exportWorkspaceBackup);if(page==='settings')bindSettings();if(page==='accounts'&&tab==='chart')bindChart();if(page==='customers'||page==='vendors')bindParties(page);}
const $$=s=>Array.from(document.querySelectorAll(s));
function notice(){return session?'':`<div class="notice"><span><b>Local workspace</b> &nbsp; Saved records stay in this browser after refresh. Back up regularly from Settings.</span><button data-nav="settings">Connect Supabase ↗</button></div>`}
function stat(title,value,foot,i){return `<div class="stat"><div class="label">${title}${icon(i)}</div><strong>${value}</strong><small>${foot}</small></div>`}
// Overview: a decision dashboard. It shows money for the month, what needs action today, the trend,
// the jobs on the floor and how quotes are converting, and leaves the detailed lists to each module.
function overview(){
 const d=today(),ym=d.slice(0,7),prevYm=monthShift(ym,-1),inMonth=(date,m)=>String(date||'').slice(0,7)===m,sum=a=>a.reduce((n,v)=>n+Number(v||0),0);
 const sales=m=>sum(invoices.filter(i=>inMonth(i.date,m)).map(i=>i.amount))+sum(scrapSales.filter(s=>inMonth(s.date,m)).map(s=>s.amount));
 const collected=m=>sum(payments.filter(p=>inMonth(p.date,m)).map(p=>p.amount))+sum(scrapSales.filter(s=>s.method!=='Credit'&&inMonth(s.date,m)).map(s=>s.amount))+sum(scrapSales.filter(s=>s.method==='Credit'&&s.received_date&&inMonth(s.received_date,m)).map(s=>s.amount));
 const expenses=records.filter(r=>r.kind==='expense'),spent=m=>sum(expenses.filter(r=>inMonth(r.date,m)).map(r=>r.amount));
 const open=invoices.map(i=>({i,...invoiceBalance(i,payments),status:invoiceStatus(i,payments,d)})).filter(r=>r.due>0),overdue=open.filter(r=>r.status==='Overdue');
 const unpaidExp=expenses.filter(r=>r.status==='Pending');
 const kpis=[
  ['Sales this month',money(sales(ym)),trend(sales(ym),sales(prevYm),prevYm),'invoices',{page:'invoices'}],
  ['Cash collected',money(collected(ym)),trend(collected(ym),collected(prevYm),prevYm),'accounts',{page:'invoices'}],
  ['Owed by customers',money(sum(open.map(r=>r.due))),overdue.length?`<span class="kpi-warn">${overdue.length} overdue · ${money(sum(overdue.map(r=>r.due)))}</span>`:`${open.length} open invoice${open.length===1?'':'s'} · none overdue`,'invoices',{page:'invoices',inv:overdue.length?'Overdue':'All'}],
  ['Expenses this month',money(spent(ym)),unpaidExp.length?`${unpaidExp.length} unpaid · ${money(sum(unpaidExp.map(r=>r.amount)))}`:trend(spent(ym),spent(prevYm),prevYm,true),'accounts',{page:'accounts',tab:'expense'}]];
 const hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
 const longDate=new Date(d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 return `<div class="heading"><div><div class="eyebrow">${esc(String(company.name||'').toUpperCase())} · ${esc(monthLabel(ym,true).toUpperCase())}</div><h1>${greeting}</h1><p class="sub">${longDate} · Here is where the business stands today.</p></div><div class="heading-actions"><button data-new="purchase">＋ Purchase order</button><button class="primary" data-new="quote">＋ New quote</button></div></div>${notice()}
 <div class="kpis">${kpis.map(([t,v,foot,i,go],n)=>`<button class="kpi ${n===0?'lead':''}" data-go='${JSON.stringify(go)}'><span class="label">${t}${icon(i)}</span><strong>${v}</strong><small>${foot}</small></button>`).join('')}</div>
 <div class="ov-grid"><div class="ov-col"><section class="card"><div class="cardhead"><div><h2>Needs attention</h2><p class="sub">Work waiting on you, most urgent first.</p></div></div>${attentionList(open,overdue,unpaidExp)}</section>
 <section class="card"><div class="cardhead"><div><h2>On the shop floor</h2><p class="sub">${floorSummary()}</p></div><button data-go='{"page":"workorders"}'>All work orders ↗</button></div>${floorList()}</section></div>
 <div class="ov-col"><section class="card"><div class="cardhead"><div><h2>Sales vs expenses</h2><p class="sub">Last 6 months · invoices and scrap sales against recorded expenses.</p></div></div><div class="cardbody">${trendChart(Array.from({length:6},(_,k)=>monthShift(ym,k-5)).map(m=>({m,sales:sales(m),spent:spent(m)})))}</div></section>
 <section class="card"><div class="cardhead"><div><h2>Quote performance</h2><p class="sub">Quotations dated in the last 90 days.</p></div><button data-go='{"page":"sales"}'>Quotes ↗</button></div>${quotePerformance()}</section></div></div>`;
}
function monthShift(ym,n){const [y,m]=ym.split('-').map(Number),t=y*12+m-1+n;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,'0')}`}
function monthLabel(ym,long){return new Date(ym+'-01T00:00:00').toLocaleDateString('en-GB',long?{month:'long',year:'numeric'}:{month:'short'})}
// change against the previous month; for costs a rise is shown as bad
function trend(now,before,prevYm,cost){
 if(!before)return now?`First entries since ${monthLabel(prevYm)}`:'Nothing recorded yet this month';
 const pct=Math.round((now-before)/before*100),up=pct>=0,good=cost?!up:up;
 return `<span class="kpi-trend ${pct===0?'':good?'good':'bad'}">${up?'▲':'▼'} ${Math.abs(pct)}%</span> vs ${monthLabel(prevYm)} (${currency} ${short(before)})`;
}
function attentionList(open,overdue,unpaidExp){
 const d=today(),items=[],sum=a=>a.reduce((n,v)=>n+Number(v||0),0),plural=(n,w,many=w+'s')=>`${n} ${n===1?w:many}`;
 const add=(tone,title,detail,label,go)=>items.push({tone,title,detail,label,go});
 if(overdue.length)add('red',`${plural(overdue.length,'invoice')} overdue`,`${money(sum(overdue.map(r=>r.due)))} past due · oldest ${esc(overdue.map(r=>r.i).sort((a,b)=>a.due_date.localeCompare(b.due_date))[0].reference)}`,'Chase payment',{page:'invoices',inv:'Overdue'});
 const active=workOrders.filter(j=>j.status!=='Completed'),late=active.filter(j=>j.due_date&&j.due_date<d);
 if(late.length)add('red',`${plural(late.length,'job')} past due date`,late.slice(0,3).map(j=>esc(`${j.reference} · ${j.party}`)).join(', '),'Open jobs',{page:'workorders',job:'Overdue'});
 const toInvoice=workOrders.filter(j=>j.status==='Completed'&&!isInvoiced(j));
 if(toInvoice.length)add('amber',`${plural(toInvoice.length,'completed job')} to invoice`,`${money(sum(toInvoice.map(j=>jobFigures(j).revenue)))} before tax is waiting to be billed`,'Create invoices',{page:'invoices'});
 const ready=records.filter(r=>r.kind==='quote'&&r.status==='Accepted'&&!workOrders.some(j=>j.quote_id===r.id));
 if(ready.length)add('amber',`${plural(ready.length,'accepted quote')} without a job card`,`${money(sum(ready.map(r=>r.amount)))} · ${ready.slice(0,3).map(r=>esc(r.party)).join(', ')}`,'Start jobs',{page:'workorders'});
 const quotes=records.filter(r=>r.kind==='quote'&&['Draft','Sent'].includes(r.status)&&r.valid_until);
 const expiring=quotes.filter(r=>r.valid_until>=d&&daysUntil(r.valid_until)<=3),expired=quotes.filter(r=>r.valid_until<d);
 if(expiring.length)add('amber',`${plural(expiring.length,'quote')} expiring within 3 days`,expiring.slice(0,3).map(r=>esc(`${r.reference} · ${r.party}`)).join(', '),'Follow up',{page:'sales'});
 if(expired.length)add('grey',`${plural(expired.length,'quote')} expired without a decision`,'Follow up, re-issue, or mark them declined to keep the pipeline honest.','Review',{page:'sales'});
 if(!session){
  const pos=posToReceive();if(pos.length)add('blue',`${plural(pos.length,'purchase order')} to receive`,pos.slice(0,3).map(p=>esc(`${p.reference} · ${p.party}`)).join(', '),'Receive stock',{page:'inventory',stock:'sheet'});
  const low=stockItems.filter(i=>needsReorder(i,balanceOf(i.id,stockMoves)));if(low.length)add('amber',`${plural(low.length,'stock item')} at reorder level`,low.slice(0,4).map(i=>esc(i.code)).join(', '),'View stock',{page:'inventory',stock:low[0].category==='consumable'?'consumable':'sheet'});
  const yard=scrapBins().reduce((n,b)=>n+Math.max(0,balanceOf(b.id,stockMoves).qty),0),rate=averageRate(scrapSales);
  if(yard>=1)add('green',`${Math.round(yard).toLocaleString('en-PK')} kg of scrap in the yard`,rate?`About ${money(Math.round(yard*rate))} at your average rate of ${currency} ${rate}/kg`:'Weigh it and sell it to turn it back into cash.','Sell scrap',{page:'inventory',stock:'scrap'});
 }
 if(unpaidExp.length)add('grey',`${plural(unpaidExp.length,'expense')} not yet paid`,`${money(sum(unpaidExp.map(r=>r.amount)))} · ${unpaidExp.slice(0,3).map(r=>esc(r.party)).join(', ')}`,'Review',{page:'accounts',tab:'expense'});
 const unposted=sourceQueue().length;if(unposted)add('grey',`${plural(unposted,'entry','entries')} waiting to be posted`,'Post them in the journal to keep the reports up to date.','Post entries',{page:'accounts',tab:'journal'});
 if(!items.length)return `<div class="all-clear"><b>All clear</b><span>Nothing is overdue or waiting. A good time to send a few quotes.</span></div>`;
 return `<ul class="attention">${items.map(x=>`<li class="${x.tone}"><i aria-hidden="true"></i><div><b>${x.title}</b><small>${x.detail}</small></div><button class="textbutton" data-go='${JSON.stringify(x.go)}'>${x.label} ↗</button></li>`).join('')}</ul>`;
}
function trendChart(months){
 if(!months.some(m=>m.sales||m.spent))return `<div class="all-clear"><b>No figures yet</b><span>Invoices, scrap sales and expenses will chart here month by month.</span></div>`;
 const max=Math.max(1,...months.flatMap(m=>[m.sales,m.spent])),H=150,W=520,band=W/months.length,bw=Math.min(26,band/3.2);
 const bars=months.map((m,k)=>{const x=k*band+band/2,hs=m.sales/max*H,he=m.spent/max*H;return `<g><title>${monthLabel(m.m,true)}: sales ${money(m.sales)}, expenses ${money(m.spent)}</title><rect class="b-sales" x="${x-bw-2}" y="${H-hs}" width="${bw}" height="${Math.max(hs,m.sales?2:0)}" rx="3"/><rect class="b-spent" x="${x+2}" y="${H-he}" width="${bw}" height="${Math.max(he,m.spent?2:0)}" rx="3"/><text x="${x}" y="${H+18}" text-anchor="middle">${monthLabel(m.m)}</text></g>`}).join('');
 const grid=[0.5,1].map(f=>`<line x1="0" x2="${W}" y1="${H-f*H}" y2="${H-f*H}"/><text class="axis" x="${W}" y="${H-f*H-4}" text-anchor="end">${short(max*f)}</text>`).join('');
 const tS=months.reduce((n,m)=>n+m.sales,0),tE=months.reduce((n,m)=>n+m.spent,0);
 return `<svg class="trend-chart" viewBox="0 0 ${W} ${H+26}" role="img" aria-label="Sales and expenses for the last six months">${grid}<line x1="0" x2="${W}" y1="${H}" y2="${H}" class="base"/>${bars}</svg>
 <div class="chart-legend"><span><i class="b-sales"></i>Sales <b>${money(tS)}</b></span><span><i class="b-spent"></i>Expenses <b>${money(tE)}</b></span><span>Difference <b class="${tS-tE<0?'neg':''}">${money(tS-tE)}</b></span></div>`;
}
function floorSummary(){
 const active=workOrders.filter(j=>j.status!=='Completed'),late=active.filter(j=>j.due_date&&j.due_date<today()).length,urgent=active.filter(j=>j.priority==='Urgent').length;
 return active.length?`${active.length} active job${active.length===1?'':'s'}${urgent?` · ${urgent} urgent`:''}${late?` · <span class="kpi-warn">${late} late</span>`:''}`:'No jobs in production.';
}
function floorList(){
 const jobs=workOrders.filter(j=>j.status!=='Completed').sort((a,b)=>(b.priority==='Urgent')-(a.priority==='Urgent')||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999'))).slice(0,5);
 if(!jobs.length)return `<div class="all-clear"><b>The floor is clear</b><span>Accepted quotes become jobs in Work orders.</span></div>`;
 return `<ul class="floor">${jobs.map(j=>{const p=scopeProgress(scopeOf(j)),days=j.due_date?daysUntil(j.due_date):null,due=days===null?'No due date':days<0?`${-days}d late`:days===0?'Due today':`Due in ${days}d`;
  return `<li><button data-job-open="${esc(j.id)}"><div class="floor-main"><b>${esc(j.reference)}${j.priority==='Urgent'?' <span class="pill overdue">Urgent</span>':''}</b><small>${esc(j.party)} · ${esc(jobStage(j,false))}</small></div><div class="floor-bar"><i style="width:${p}%" class="${p===100?'full':''}"></i></div><span class="floor-pct">${p}%</span><span class="floor-due ${days!==null&&days<0?'late':days!==null&&days<=2?'soon':''}">${due}</span></button></li>`}).join('')}</ul>`;
}
function quotePerformance(){
 const from=addDays(today(),-90),q=records.filter(r=>r.kind==='quote'&&r.date>=from),won=q.filter(r=>r.status==='Accepted'),lost=q.filter(r=>r.status==='Declined'),decided=won.length+lost.length;
 const sum=a=>a.reduce((n,r)=>n+Number(r.amount||0),0),rate=decided?Math.round(won.length/decided*100):null,pipeline=records.filter(r=>r.kind==='quote'&&quoteState(r)==='Sent'||r.kind==='quote'&&quoteState(r)==='Draft');
 const C=2*Math.PI*34,arc=rate===null?0:C*rate/100;
 const top=Object.entries(invoices.filter(i=>i.date.slice(0,4)===today().slice(0,4)).reduce((m,i)=>(m[i.party]=(m[i.party]||0)+Number(i.amount),m),{})).sort((a,b)=>b[1]-a[1]).slice(0,4),best=top[0]?.[1]||1;
 return `<div class="cardbody qp"><div class="qp-head"><svg viewBox="0 0 84 84" class="ring" aria-label="Win rate"><circle cx="42" cy="42" r="34"/><circle cx="42" cy="42" r="34" class="arc" stroke-dasharray="${arc} ${C}"/><text x="42" y="47" text-anchor="middle">${rate===null?'–':rate+'%'}</text></svg>
 <dl><div><dt>Win rate</dt><dd>${rate===null?'No decisions yet':`${won.length} won of ${decided} decided`}</dd></div><div><dt>Quoted</dt><dd>${q.length} · ${money(sum(q))}</dd></div><div><dt>Won value</dt><dd>${money(sum(won))}</dd></div><div><dt>Open pipeline</dt><dd>${pipeline.length} · ${money(sum(pipeline))}</dd></div></dl></div>
 <h3 class="qp-sub">Top customers · ${today().slice(0,4)} invoiced</h3>${top.length?`<ul class="top-customers">${top.map(([name,v])=>`<li><span>${esc(name)}</span><div><i style="width:${Math.max(4,v/best*100)}%"></i></div><b>${currency} ${short(v)}</b></li>`).join('')}</ul>`:'<p class="fine">No invoices yet this year.</p>'}</div>`;
}
function bindOverview(){
 $$('[data-go]').forEach(b=>b.onclick=()=>{const g=JSON.parse(b.dataset.go);page=g.page;jobView=null;query='';filter='All';tab=g.tab||(g.page==='accounts'?'chart':'quote');if(g.inv)invFilter=g.inv;if(g.job)jobFilter=g.job;if(g.stock)stockTab=g.stock;render();window.scrollTo(0,0)});
 $$('[data-job-open]').forEach(b=>b.onclick=()=>{page='workorders';jobView=b.dataset.jobOpen;render();window.scrollTo(0,0)});
}
function listing(){if(page==='inventory')return inventoryPage();if(page==='hr')return hrPage();if(page==='accounts'&&['journal','reports'].includes(tab))return accountingPage();if(page==='workorders')return workOrderPage();if(page==='invoices'||page==='sales'&&tab==='invoice')return invoicePage();if(page==='accounts'&&tab==='chart')return chartPage();let title=page==='sales'?'Sales':page==='procurement'?'Procurement':'Accounts';let subtitle=page==='sales'?'Manage customer enquiries and laser-cutting quotes.':page==='procurement'?'Track raw-material purchases from order to receipt.':'Keep expenses and petty cash organised.';return `<div class="heading"><div><div class="eyebrow">${page==='sales'?'CUSTOMERS & QUOTES':page==='procurement'?'MATERIALS & SUPPLIERS':'BUSINESS FINANCES'}</div><h1>${title}</h1><p class="sub">${subtitle}</p></div><button class="primary" data-new="${tab}">＋ New ${labels[tab]}</button></div>${notice()}${page!=='procurement'?`<div class="sectionlinks">${(page==='sales'?['quote','enquiry','invoice']:['chart','expense','cash','journal','reports']).map(t=>t==='invoice'?`<button data-nav="invoices">Invoices <span class="fine">&nbsp;${invoices.length}</span></button>`:`<button data-tab="${t}" class="${tab===t?'selected':''}">${t==='journal'?'Journal':t==='reports'?'Reports':t==='chart'?'Chart of Accounts':t==='cash'?'Petty cash':t==='enquiry'?'Enquiries':t[0].toUpperCase()+t.slice(1)+'s'} <span class="fine">&nbsp;${t==='chart'?accountGroups.length:t==='invoice'?invoices.length:records.filter(r=>r.kind===t).length}</span></button>`).join('')}</div>`:''}${tab==='cash'?`<div class="notice"><span>Petty cash balance: <b>${money(records.filter(r=>r.kind==='cash').reduce((s,r)=>s+(r.category==='Cash in'?1:-1)*r.amount,0))}</b></span><span>Record top-ups as cash in and spending as cash out.</span></div>`:''}${page==='sales'&&tab==='quote'?quoteSummary():''}<section class="card"><div class="toolbar"><input id="search" class="search" type="search" placeholder="Search name, reference or description…" aria-label="Search records"><div class="row">${tab==='quote'?'':`<select id="filter" aria-label="Filter by status"><option>All</option>${statuses[tab].map(s=>`<option>${s}</option>`).join('')}</select>`}<button id="export">Export CSV</button>${session?'<button id="refresh">Refresh</button>':''}</div></div><div id="results">${table(filtered(),tab)}</div></section>`}
function filtered(){return records.filter(r=>r.kind===tab&&(filter==='All'||(tab==='quote'?quoteState(r):r.status)===filter)&&`${r.reference} ${r.party} ${r.description} ${r.category}`.toLowerCase().includes(query.toLowerCase()))}
function updateTable(){$('#results').innerHTML=table(filtered(),tab);$$('[data-edit]').forEach(b=>b.onclick=()=>editor(tab,b.dataset.edit));bindRecordDeletes();bindQuoteRows()}
function table(rows,kind){if(!rows.length)return '<div class="empty">No records found. Create an entry or change your search.</div>';if(kind==='quote')return quoteTable(rows);return `<div class="tablewrap"><table><thead><tr><th>REFERENCE</th><th>${kind==='purchase'?'SUPPLIER':kind==='expense'||kind==='cash'?'PAYEE / SOURCE':'CUSTOMER'} & DETAILS</th><th>DATE</th><th>STATUS</th><th class="money">AMOUNT</th><th><span aria-label="Actions"></span></th></tr></thead><tbody>${rows.map(r=>`<tr><td class="ref">${esc(r.reference)}${r.account_code?`<small>${esc(r.account_code)} · ${esc(accountList.find(a=>a.code===r.account_code)?.name||'Account')}</small>`:''}${r.category?`<small>${esc(r.category)}</small>`:''}${r.kind==='quote'&&r.valid_until?`<small class="${['Draft','Sent'].includes(r.status)&&r.valid_until<today()?'expired':''}">${['Draft','Sent'].includes(r.status)&&r.valid_until<today()?'Expired':'Valid until'} ${esc(r.valid_until)}</small>`:''}</td><td>${esc(r.party)}<small>${esc(r.description)}</small></td><td>${esc(r.date)}</td><td>${badge(r.status)}</td><td class="money">${r.kind==='enquiry'?'—':money(r.amount)}</td><td class="row-actions"><button class="textbutton" data-edit="${esc(r.id)}">Open ↗</button>${r.kind==='purchase'?`<button class="textbutton row-pdf" data-quote-pdf="${esc(r.id)}" aria-label="Download ${esc(r.reference)} PDF">PDF</button>`:''}${['enquiry','quote','purchase'].includes(r.kind)?`<button class="textbutton danger" data-record-delete="${esc(r.id)}" aria-label="Delete ${esc(r.reference)}">Delete</button>`:''}</td></tr>`).join('')}</tbody></table></div>`}
function field(label,name,value='',type='text',extra=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`}
function select(label,name,opts,value){return `<label class="field">${label}<select name="${name}">${opts.map(s=>`<option ${s===value?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`}
function editor(kind,id,copy){if(!kind)return;const existing=records.find(r=>r.id===id);const fresh={kind,date:today(),status:statuses[kind][0],tax:0,lines:[{description:'',quantity:1,rate:0}],...(kind==='quote'?{valid_until:addDays(today(),company.validity_days),payment_terms:company.payment_terms,lead_time:'',prepared_by:company.prepared_by,terms:company.terms}:{})};const r=existing||(copy?{...fresh,...structuredClone(copy),id:undefined,reference:undefined,date:today(),status:'Draft',valid_until:fresh.valid_until,created_at:undefined}:fresh);const priced=['quote','purchase'].includes(kind);$('#modal').innerHTML=`<div class="modalhead"><h2>${id?`${esc(r.reference)}`:copy?`Copy of ${esc(copy.reference)}`:`New ${labels[kind]}`}</h2><button class="close" aria-label="Close">×</button></div><form id="recordform" data-kind="${kind}" class="${priced?'priced':''}"><div class="formgrid">${['quote','enquiry'].includes(kind)?customerPicker(r.party):kind==='purchase'?vendorPicker(r.party):field('Payee / source','party',r.party,'text','required maxlength="150"')}${field('Date','date',r.date,'date','required')}${field(kind==='enquiry'?'Job requirements':'Description','description',r.description,'text','required maxlength="500"')}${select('Status','status',statuses[kind],r.status)}${kind==='quote'&&!session?validityPicker(r)+field('Valid until','valid_until',r.valid_until||'','date'):''}${kind==='quote'&&!session?field('Customer reference / RFQ no. (optional)','customer_ref',r.customer_ref||'','text','maxlength="100"')+field('Attention (optional)','attention',r.attention||'','text','maxlength="150" placeholder="Defaults to the customer’s contact person"'):''}${kind==='expense'?select('Category','category',categories,r.category):kind==='cash'?select('Entry type','category',['Cash in','Cash out'],r.category):''}${kind==='expense'?expenseAccountField(r):''}${!priced&&kind!=='enquiry'?field('Amount (PKR)','amount',r.amount||'','number','min="0.01" max="1000000000" step="0.01" required'):''}${kind==='enquiry'?`<label class="field full">Material, thickness, quantity and contact details<textarea name="notes" maxlength="4000">${esc(r.notes)}</textarea></label>`:''}</div>${priced?`<div class="linehead" style="margin-top:22px">LINE ITEMS</div><div class="line-table" role="table" aria-label="Line items"><div id="lines">${lineHeader()}${(r.lines?.length?r.lines:[{description:r.description||'',quantity:1,rate:r.amount||0}]).map(lineHTML).join('')}</div></div><div class="lines-foot"><button type="button" id="addline">＋ Add line</button><div class="doc-totals"><div><span>Subtotal</span><b id="t-gross"></b></div><div id="t-disc-row" hidden><span>Discount</span><b id="t-disc"></b></div><div><span>Sales tax <input name="tax" type="number" value="${esc(r.tax||0)}" min="0" max="100" step="0.01" required aria-label="Sales tax percent"> %</span><b id="t-tax"></b></div><div class="grand"><span>Total</span><b id="total"></b></div></div></div>`:''}${kind==='quote'&&!session?quoteTermsFields(r):''}${kind!=='enquiry'?`<label class="field" style="margin-top:18px">${kind==='quote'||kind==='purchase'?'Notes (printed on the PDF)':'Notes / payment reference'}<textarea name="notes" maxlength="4000">${esc(r.notes)}</textarea></label>`:''}<p class="help">${session?'Saved securely to your Supabase account.':'Save your changes to keep them in this browser after refresh.'}</p><div id="formerror" class="error" role="alert"></div><div class="actions">${id&&['enquiry','quote','purchase'].includes(kind)?'<button type="button" class="danger" id="delete-record">Delete</button>':''}${id&&kind==='enquiry'&&r.status!=='Quoted'?'<button type="button" id="convert">Create quote</button>':''}${id&&kind==='purchase'&&!session?'<button type="button" id="receivestock">Receive into stock</button>':''}${priced?'<button type="button" id="downloadquote">Download PDF</button>':''}<button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save ${labels[kind]}</button></div></form>`;
$('#modal').showModal();if(['quote','enquiry'].includes(kind))bindCustomerPicker(r.party);if(kind==='quote'&&!session)bindQuoteTermsPickers();if(kind==='purchase')bindVendorPicker(r.party);$('.close').onclick=()=>$('#modal').close();$('.cancel').onclick=()=>$('#modal').close();if(priced){$('#addline').onclick=()=>{const prev=readLines().pop()||{};$('#lines').insertAdjacentHTML('beforeend',lineHTML({description:'',quantity:1,rate:0,material:prev.material||'',thickness_mm:prev.thickness_mm??null,unit:prev.unit||'pcs'}));wireLines();$$('.linedesc').pop().focus()};wireLines();$('[name=tax]').oninput=updateTotal}if($('#convert'))$('#convert').onclick=()=>{const f=new FormData($('#recordform'));$('#modal').close();editor('quote');$('[name=party]').value=f.get('party');$('[name=party]').dispatchEvent(new Event('change'));$('[name=description]').value=f.get('description');$('[name=notes]').value=`From enquiry ${r.reference}\n${f.get('notes')}`;$('.linedesc').value=f.get('description')};
if(kind==='expense')$('[name=category]').onchange=()=>{const current=$('[name=account_code]').value;$('#expense-account-field').outerHTML=expenseAccountField({category:$('[name=category]').value,account_code:current,id:r.id})};
if($('#delete-record'))$('#delete-record').onclick=()=>confirmRecordDelete(id);
if($('#downloadquote'))$('#downloadquote').onclick=()=>downloadQuotePDF(r);
if($('#receivestock'))$('#receivestock').onclick=()=>poReceiveEditor(id);
$('#recordform').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const btn=form.querySelector('[type=submit]');const data=Object.fromEntries(new FormData(form));const lines=priced?readLines():[];try{lines.forEach(l=>validateDiscount(l.discount))}catch(err){$('#formerror').textContent=err.message;return}if(data.valid_until&&data.valid_until<data.date){$('#formerror').textContent='Valid until cannot be before the quote date.';return}const amount=priced?calculate(lines,Number(data.tax)):kind==='enquiry'?0:Number(data.amount);if(!Number.isFinite(amount)||amount<0||amount>1e9){$('#formerror').textContent='Enter a valid amount below PKR 1 billion.';return}const record={...(kind==='expense'?{account_code:data.account_code||null}:{}),...(kind==='quote'&&!session?{valid_until:data.valid_until||null,customer_ref:(data.customer_ref||'').trim(),attention:(data.attention||'').trim(),payment_terms:(data.payment_terms==='__custom'?data.payment_terms_custom:data.payment_terms||'').trim(),lead_time:(data.lead_time||'').trim(),prepared_by:(data.prepared_by||'').trim(),terms:(data.terms||'').trim(),bank_account_id:data.bank_account_id||''}:{}),kind,party:data.party.trim(),description:data.description.trim(),date:data.date,status:data.status,category:data.category||'',notes:data.notes||'',lines,tax:priced?Number(data.tax):0,amount};if(!record.party||!record.description){$('#formerror').textContent='Enter a name and description.';return}btn.disabled=true;try{await saveRecord(record,id);$('#modal').close();render();toast(session?'Record saved to Supabase.':'Record saved locally in this browser.')}catch(err){$('#formerror').textContent=err.message}finally{btn.disabled=false}};
}
function gaugeOptions(material,mm,blank='Custom mm / not set'){const match=matchGauge(material,mm);return `<option value="">${blank}</option>`+Object.entries(gauges[material]||{}).map(([g,n])=>`<option value="${g}" ${match?.gauge===g?'selected':''}>${g} ga - ${n} mm</option>`).join('')}
const lineUnits=['pcs','sheets','sets','kg','m','m²','hrs','lot'];
// One compact row per item: description, material, gauge, thickness, quantity, unit, rate, discount and amount.
function lineHTML(input){const l=inferThickness(input);return `<div class="lineitem${session?' no-discount':''}" role="row">
 <span class="lineno" aria-hidden="true"></span>
 <input class="linedesc" aria-label="Item description" value="${esc(l.description)}" placeholder="Part / description, e.g. MS mounting plate 300 × 300" required maxlength="300">
 <select class="linematerial" aria-label="Material"><option value="">Material</option>${Object.entries(materials).map(([k,v])=>`<option value="${k}" ${k===l.material?'selected':''}>${v}</option>`).join('')}</select>
 <select class="linegauge" aria-label="Gauge (US)" ${l.material?'':'disabled'}>${gaugeOptions(l.material,l.thickness_mm,'—')}</select>
 <input class="linemm" type="number" aria-label="Thickness in mm" min="0.001" max="500" step="0.001" value="${l.thickness_mm??''}" placeholder="mm">
 <input class="lineqty" type="number" aria-label="Quantity" value="${l.quantity}" min="0.001" max="1000000" step="any" required>
 <select class="lineunit" aria-label="Unit">${lineUnits.map(u=>`<option ${u===(l.unit||'pcs')?'selected':''}>${u}</option>`).join('')}</select>
 <input class="linerate" type="number" aria-label="Unit price in PKR" value="${l.rate}" min="0" max="1000000000" step="any" required>
 ${session?'':`<input class="linediscount" type="number" aria-label="Discount percent" min="0" max="100" step="any" value="${lineDiscount(l)||''}" placeholder="0">`}
 <output class="lineamount" aria-label="Line amount"></output>
 <span class="lineactions"><button type="button" class="moveline" title="Move up" aria-label="Move line up">↑</button><button type="button" class="copyline" title="Duplicate line" aria-label="Duplicate line">⧉</button><button type="button" class="removeline" title="Remove line" aria-label="Remove line">×</button></span>
 <small class="gauge-note visually-hidden"></small></div>`}
function lineHeader(){return `<div class="lineitem linehead-row${session?' no-discount':''}" aria-hidden="true"><span>#</span><span>Description</span><span>Material</span><span>Gauge</span><span>mm</span><span class="num">Qty</span><span>Unit</span><span class="num">Rate (PKR)</span>${session?'':'<span class="num">Disc %</span>'}<span class="num">Amount</span><span></span></div>`}
function readLines(){return $$('.lineitem:not(.linehead-row)').map(el=>({description:el.querySelector('.linedesc').value,quantity:Number(el.querySelector('.lineqty').value),rate:Number(el.querySelector('.linerate').value),material:el.querySelector('.linematerial').value,unit:el.querySelector('.lineunit')?.value||'pcs',thickness_mm:el.querySelector('.linemm').value===''?null:Number(el.querySelector('.linemm').value),gauge:el.querySelector('.linegauge').value||null,gauge_standard:'US sheet-metal',...(Number(el.querySelector('.linediscount')?.value)?{discount:Number(el.querySelector('.linediscount').value)}:{})}))}
function updateGauge(el,origin){const material=el.querySelector('.linematerial'),gauge=el.querySelector('.linegauge'),mm=el.querySelector('.linemm'),desc=el.querySelector('.linedesc');
 if(origin==='gauge'&&gauge.value){mm.value=gauges[material.value][gauge.value];}
 if(origin==='mm'||origin==='material'||origin==='init'){gauge.innerHTML=gaugeOptions(material.value,mm.value,'—');}
 gauge.disabled=!material.value;
 const match=matchGauge(material.value,mm.value);
 const note=!material.value?'Select a material to convert US gauge.':!mm.value?'Choose a gauge or enter mm.':match?`${match.gauge} ga (US) = ${match.mm} mm nominal. Actual sheet thickness may vary.`:'Custom mm thickness - no exact match in this material’s listed gauges.';
 el.querySelector('.gauge-note').textContent=note;gauge.title=note;mm.title=note;
 // Keep a legacy thickness suffix consistent when the explicit mm field changes.
 if(['gauge','mm'].includes(origin)&&mm.value&&mm.validity.valid&&!dimensionTail.test(desc.value)){const previous=desc.value;desc.value=desc.value.replace(/(\d+(?:\.\d+)?)\s*mm\s*$/i,`${mm.value} mm`);const summary=$('[name=description]');if($$('.lineitem:not(.linehead-row)').length===1&&summary?.value===previous)summary.value=desc.value;}
 updateTotal();
}
function calculate(lines,tax){return documentTotals(lines,tax).total}
function updateTotal(){
 const lines=readLines(),t=documentTotals(lines,Number($('[name=tax]').value));
 $$('.lineitem:not(.linehead-row)').forEach((el,i)=>{el.querySelector('.lineno').textContent=i+1;const l=lines[i];el.querySelector('.lineamount').textContent=Number.isFinite(l.quantity*l.rate)?money(lineCents(l)/100).replace('PKR ',''):'—'});
 $('#t-gross').textContent=money(t.gross);$('#t-disc').textContent=t.discount>0?'− '+money(t.discount):money(0);$('#t-disc-row').hidden=!(t.discount>0);$('#t-tax').textContent=money(t.tax);
 $('#total').textContent=money(t.total);
}
function wireLines(){$$('.lineitem:not(.linehead-row)').forEach(el=>{
 el.querySelectorAll('input,select').forEach(e=>e.oninput=updateTotal);
 const desc=el.querySelector('.linedesc');desc.title=desc.value;desc.addEventListener('input',()=>{desc.title=desc.value});
 el.querySelector('.linemm').oninput=()=>updateGauge(el,'mm');el.querySelector('.linegauge').onchange=()=>updateGauge(el,'gauge');el.querySelector('.linematerial').onchange=()=>updateGauge(el,'material');
 el.querySelector('.removeline').onclick=()=>{if($$('.lineitem:not(.linehead-row)').length>1){el.remove();updateTotal()}else toast('Keep at least one line item.')};
 el.querySelector('.moveline').onclick=()=>{const prev=el.previousElementSibling;if(prev&&!prev.classList.contains('linehead-row')){prev.before(el);updateTotal()}};
 el.querySelector('.copyline').onclick=()=>{const [line]=readLinesFrom([el]);el.insertAdjacentHTML('afterend',lineHTML(line));wireLines();el.nextElementSibling.querySelector('.linedesc').focus()};
 updateGauge(el,'init')});updateTotal()}
function readLinesFrom(rows){const all=$$('.lineitem:not(.linehead-row)');const lines=readLines();return rows.map(r=>lines[all.indexOf(r)])}
async function saveRecord(r,id){if(id&&journals.some(j=>j.source_kind==='expense'&&j.source_id===id))throw Error('This expense is posted. Use a journal reversal or adjustment to correct it.');const existing=records.find(v=>v.id===id);if(!session){if(existing)Object.assign(existing,r);else records.unshift({...r,id:crypto.randomUUID(),reference:ref(r.kind,r.date,r.party),created_at:new Date().toISOString()});return}const payload={...r};if(!id){payload.reference=ref(r.kind,r.date,r.party);payload.owner_id=session.user.id}const saved=await api(`/rest/v1/business_records${id?`?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(existing.updated_at)}`:''}`,{method:id?'PATCH':'POST',body:JSON.stringify(payload),headers:{Prefer:'return=representation'}});if(!saved?.length)throw new Error('This record changed in another browser. Close this form, refresh, then reopen it.');if(id)records=records.map(v=>v.id===id?saved[0]:v);else records.unshift(saved[0]);connected=true;lastSync=new Date()}
function ref(k,date=today(),party=''){if(k==='quote'){let last=0;try{last=Number(localStorage.getItem('sutluj-last-quote-number'))||0}catch{}const next=quoteNumber(party,records.filter(r=>r.kind==='quote'),last);try{localStorage.setItem('sutluj-last-quote-number',next.slice(-5))}catch{}return next}return nextDocumentNumber(({quote:'QT',enquiry:'EN',purchase:'PO',expense:'EX',cash:'PC'})[k],records.filter(r=>r.kind===k),date.slice(0,4))}
function settings(){return `<div class="heading"><div><div class="eyebrow">WORKSPACE SETTINGS</div><h1>Your business, connected</h1><p class="sub">Sutluj CNC Laser · Pakistani rupee (PKR)</p></div></div><div class="settings">${companyCard()}${stampCard()}${quoteTermsCard()}${bankAccountsCard()}${localBackupCard()}${session?'':resetCard()}<section class="card"><div class="cardhead"><h2>Supabase connection</h2>${badge(connected?'Connected':'Not connected')}</div><div class="cardbody"><p class="help">Your local workspace saves in this browser now. When your Supabase project is ready, run the supplied database setup, create your owner account, then connect here. Export a local backup before switching.</p><form id="connectionform"><div class="formgrid">${field('Project URL','url',config.url||'','url','placeholder="https://your-project.supabase.co" required')}${field('Public publishable key','key',config.key||'','password','placeholder="sb_publishable_…" required autocomplete="off"')}</div><p class="help">Use only a publishable or legacy anon key. Never enter a secret or service-role key. Connection settings stay in this browser. While signed in, records are stored in Supabase; otherwise they are saved locally.</p><div class="actions"><button class="primary" ${session?'disabled':''}>Save connection settings</button></div><div id="configerror" class="error" role="alert"></div></form></div></section><section class="card"><div class="cardhead"><h2>${session?'Signed in':'Owner sign-in'}</h2></div><div class="cardbody">${session?`<p>${esc(session.user.email)}</p><p class="help">Records are private to this account. Use the same owner account on your other browsers. Sign in again after closing or reloading this page.</p><button id="signout">Sign out</button><button id="syncsettings" style="margin-left:10px">Refresh records</button>`:`<form id="loginform"><div class="formgrid">${field('Email','email','','email','required autocomplete="username"')}${field('Password','password','','password','required autocomplete="current-password"')}</div><p class="help">Create this user in Supabase → Authentication → Users first. You do not need to sign in to use local saving.</p><div id="loginerror" class="error" role="alert"></div><div class="actions"><button class="primary">Sign in and load records</button></div></form>`}</div></section><section class="card"><div class="cardhead"><h2>Set up Supabase when you’re ready</h2></div><div class="cardbody"><ol class="help"><li>Create a project in Supabase and choose a region near your business.</li><li>Run <a href="schema.sql" download>the database setup</a> in its SQL Editor.</li><li>Create your owner user in Authentication → Users.</li><li>Copy your project URL and public key from Project Settings → API.</li><li>Save the connection above and sign in. Your live workspace starts empty.</li></ol><p class="help">The initial setup supports one owner account, protects its records with row-level security, and refreshes connected browsers every 30 seconds. Local data is kept separate and is not automatically uploaded.</p></div></section></div>`}
function validateConfig(url,key){const u=new URL(url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.pathname!=='/'||u.search||u.hash||u.username)throw new Error('Use your HTTPS Supabase project URL, without a path.');if(key.startsWith('sb_secret_'))throw new Error('Secret keys must never be used in the browser.');if(!key.startsWith('sb_publishable_')){try{const p=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(p.role!=='anon')throw Error()}catch{throw new Error('Enter a public publishable key or legacy anon key.')}}return {url:u.origin,key}}
function bindSettings(){bindCompany();if($('#restore-file'))$('#restore-file').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)restoreBackup(file)};bindStamp();bindQuoteTerms();bindBankAccounts();if($('#reset-form'))bindReset();$('#connectionform').onsubmit=e=>{e.preventDefault();try{const f=new FormData(e.target);config=validateConfig(f.get('url').trim(),f.get('key').trim());localStorage.setItem('sutluj-connection',JSON.stringify(config));toast('Connection settings saved. Sign in below.')}catch(err){$('#configerror').textContent=err.message}};if($('#loginform'))$('#loginform').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button');const localBeforeLogin=structuredClone(workspaceData());btn.disabled=true;try{validateConfig(config.url,config.key);const f=new FormData(e.target);const result=await fetchJSON(config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});saveLocalWorkspace();if(localSaveError)throw Error(localSaveError);session={...result,expires_at:Date.now()+result.expires_in*1000};records=[];customers=[];vendors=[];invoices=[];payments=[];workOrders=[];journals=[];stockItems=[];stockMoves=[];employees=[];attendance=[];advances=[];payrolls=[];scrapSales=[];await sync(false);navigate('overview');toast('Connected. Your live business records are ready.')}catch(err){session=null;connected=false;({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=localBeforeLogin);$('#loginerror').textContent=err.message||'Could not connect. Check your settings.'}finally{btn.disabled=false}};if($('#signout'))$('#signout').onclick=async()=>{try{await api('/auth/v1/logout',{method:'POST'})}catch{}session=null;connected=false;restoreLocalWorkspace();render();toast('Signed out. Local workspace restored.')};if($('#syncsettings'))$('#syncsettings').onclick=()=>sync(true)}
function samplesToRecords(){return samples.map((r,i)=>({id:`demo-${i}`,kind:r[0],reference:r[1],party:r[2],description:r[3],amount:r[4],status:r[5],category:r[6]||'',date:today(),notes:'',lines:[{description:r[3],quantity:1,rate:r[4]}],tax:0}))}
async function fetchJSON(url,opts){const response=await fetch(url,{...opts,signal:AbortSignal.timeout(15000)});const text=await response.text();let data;try{data=text?JSON.parse(text):null}catch{throw new Error('The service returned an unreadable response. Please retry.')}if(!response.ok)throw new Error(data?.msg||data?.message||data?.error_description||'The request failed. Please check your connection.');return data}
let refreshing;
async function api(path,opts={}){if(!session)throw new Error('Please sign in first.');if(Date.now()>session.expires_at-60000){if(!refreshing)refreshing=fetchJSON(config.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})}).then(r=>{session={...r,expires_at:Date.now()+r.expires_in*1000}}).finally(()=>refreshing=null);await refreshing}return fetchJSON(config.url+path,{...opts,headers:{apikey:config.key,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json',...opts.headers}})}
async function sync(notify=false){if(!session||loading)return;loading=true;try{let all=[],offset=0;for(;;){const batch=await api(`/rest/v1/business_records?select=*&order=created_at.desc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)break;offset+=batch.length}const [directory,vendorDirectory,billing,receipts,jobs,ledger]=await Promise.all([loadCustomers(),loadVendors(),loadBilling('invoices'),loadBilling('invoice_payments'),loadBilling('work_orders'),loadBilling('journal_entries')]);journals=ledger;workOrders=jobs;invoices=billing;payments=receipts;records=all;customers=directory;vendors=vendorDirectory;connected=true;lastSync=new Date();if(!$('#modal').open&&!$('#delete-modal').open){const active=document.activeElement?.id;if(!['search','customersearch','vendorsearch','accountsearch','accounttype','invoice-search','job-search','report-from','report-to'].includes(active)){render();if($('#search'))$('#search').value=query;if($('#filter'))$('#filter').value=filter}}if(notify)toast('Records refreshed.')}catch(err){connected=false;if(notify)toast(err.message);else throw err}finally{loading=false}}
const csvCell=v=>{let s=String(v??'');if(typeof v!=='number'&&/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
function downloadCSV(name,rows){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportCSV(){const rows=filtered();const clean=csvCell;const fields=['reference','kind','party','description','date','status','category','account_code','amount','valid_until','notes'];const csv='\uFEFF'+[fields,...rows.map(r=>fields.map(f=>r[f]))].map(r=>r.map(clean).join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`sutluj-${tab}-${today()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`Exported ${rows.length} records.`)}
setInterval(()=>{if(session&&!$('#modal').open&&!$('#delete-modal').open&&document.visibilityState==='visible')sync(false).catch(()=>{const b=$('.connection');if(b)b.textContent='Sync unavailable';toast('Unable to refresh records. Check your connection, then refresh.');})},30000);
restoreLocalWorkspace();
render();
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'navigate_business_module',description:'Open the overview, sales, procurement, accounts, customers, vendors or settings module. Does not create or change records.',inputSchema:{type:'object',properties:{module:{type:'string',enum:Object.keys(icons)}},required:['module'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||!Object.keys(icons).includes(input.module))throw new Error('Unknown module');navigate(input.module);return {module:page,mode:session?'connected':'preview'}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

async function downloadQuotePDF(record){
 const form=$('#recordform');if(!form.reportValidity())return;
 const button=$('#downloadquote');button.disabled=true;button.textContent='Preparing PDF…';$('#formerror').textContent='';
 try{
  const data=Object.fromEntries(new FormData(form));
  const purchase=form.dataset.kind==='purchase';const quote={...record,...data,lines:readLines(),tax:Number(data.tax),...(purchase?{documentType:'purchase'}:{})};
  const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createQuotePDF(quote,new Uint8Array(await response.arrayBuffer()),window.PDFLib,pdfContext(quote));
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');
  link.href=url;link.download=pdfFileName(quote);
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  toast('PDF downloaded with the values shown. Save separately to keep your edits.');
 }catch(error){$('#formerror').textContent=error.message||'Could not create PDF. Please retry.'}
 finally{button.disabled=false;button.textContent='Download PDF'}
}

async function loadCustomers(){let all=[];for(let offset=0;;offset+=500){const batch=await api(`/rest/v1/customers?select=*&order=name.asc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)return all}}
function customerPicker(value=''){return `<div class="field customer-picker"><label for="party-picker">Customer</label><div class="customer-input"><input id="party-picker" name="party" role="combobox" aria-autocomplete="list" aria-controls="customer-options" aria-expanded="false" autocomplete="off" required maxlength="150" value="${esc(value)}" placeholder="Search or select a customer"><button type="button" id="customer-toggle" aria-label="Show customer list">⌄</button></div><div id="customer-options" role="listbox" aria-label="Customers" hidden></div><small class="fine">Manage your customer list in Customers.</small></div>`}
function bindCustomerPicker(original=''){const input=$('#party-picker'),list=$('#customer-options');let matches=[],active=-1;
 const validate=()=>input.setCustomValidity(customers.some(c=>c.name===input.value)||input.value===original&&!!original?'':'Select a customer from the list. Add new customers in Customers.');
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 const choose=c=>{input.value=c.name;validate();close();input.focus();input.dispatchEvent(new CustomEvent('party-chosen',{detail:c,bubbles:true}))};
 const show=(all=false)=>{matches=customers.filter(c=>c.status!=='Inactive').filter(c=>all||`${c.name} ${c.contact} ${c.phone} ${c.email}`.toLowerCase().includes(input.value.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));active=-1;input.removeAttribute('aria-activedescendant');list.innerHTML=matches.length?matches.map((c,i)=>`<div role="option" id="customer-option-${i}" aria-selected="false" data-choice="${i}">${esc(c.name)}<small>${esc([c.phone,c.email].filter(Boolean).join(' · '))}</small></div>`).join(''):'<div class="picker-empty">No matches. Add customers in Customers.</div>';list.hidden=false;input.setAttribute('aria-expanded','true');list.querySelectorAll('[data-choice]').forEach(el=>el.onmousedown=e=>{e.preventDefault();choose(matches[Number(el.dataset.choice)])})};
 input.oninput=()=>{validate();show()};input.onchange=validate;input.onfocus=()=>show();input.onblur=()=>{validate();close()};$('#customer-toggle').onclick=()=>{if(list.hidden){input.focus();show(true)}else close()};$('#customer-toggle').onmousedown=e=>e.preventDefault();
 input.onkeydown=e=>{if(e.key==='Escape'&&!list.hidden){e.preventDefault();e.stopPropagation();close();return}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show(true);if(!matches.length)return;active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;list.querySelectorAll('[role=option]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant',`customer-option-${active}`);$(`#customer-option-${active}`).scrollIntoView({block:'nearest'})}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)choose(matches[active]);else if(matches.length===1)choose(matches[0])}};validate();
}

async function loadVendors(){let all=[];for(let offset=0;;offset+=500){const batch=await api(`/rest/v1/vendors?select=*&order=name.asc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)return all}}
function vendorPicker(value=''){return `<div class="field vendor-picker"><label for="party-picker">Vendor</label><div class="vendor-input"><input id="party-picker" name="party" role="combobox" aria-autocomplete="list" aria-controls="vendor-options" aria-expanded="false" autocomplete="off" required maxlength="150" value="${esc(value)}" placeholder="Search or select a vendor"><button type="button" id="vendor-toggle" aria-label="Show vendor list">⌄</button></div><div id="vendor-options" role="listbox" aria-label="Vendors" hidden></div><small class="fine">Manage your vendor list in Vendors.</small></div>`}
function bindVendorPicker(original=''){const input=$('#party-picker'),list=$('#vendor-options');let matches=[],active=-1;
 const validate=()=>input.setCustomValidity(vendors.some(c=>c.name===input.value)||input.value===original&&!!original?'':'Select a vendor from the list. Add new vendors in Vendors.');
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 const choose=c=>{input.value=c.name;validate();close();input.focus()};
 const show=(all=false)=>{matches=vendors.filter(c=>c.status!=='Inactive').filter(c=>all||`${c.name} ${c.contact} ${c.phone} ${c.email}`.toLowerCase().includes(input.value.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));active=-1;input.removeAttribute('aria-activedescendant');list.innerHTML=matches.length?matches.map((c,i)=>`<div role="option" id="vendor-option-${i}" aria-selected="false" data-choice="${i}">${esc(c.name)}<small>${esc([c.phone,c.email].filter(Boolean).join(' · '))}</small></div>`).join(''):'<div class="picker-empty">No matches. Add vendors in Vendors.</div>';list.hidden=false;input.setAttribute('aria-expanded','true');list.querySelectorAll('[data-choice]').forEach(el=>el.onmousedown=e=>{e.preventDefault();choose(matches[Number(el.dataset.choice)])})};
 input.oninput=()=>{validate();show()};input.onchange=validate;input.onfocus=()=>show();input.onblur=()=>{validate();close()};$('#vendor-toggle').onclick=()=>{if(list.hidden){input.focus();show(true)}else close()};$('#vendor-toggle').onmousedown=e=>e.preventDefault();
 input.onkeydown=e=>{if(e.key==='Escape'&&!list.hidden){e.preventDefault();e.stopPropagation();close();return}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show(true);if(!matches.length)return;active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;list.querySelectorAll('[role=option]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant',`vendor-option-${active}`);$(`#vendor-option-${active}`).scrollIntoView({block:'nearest'})}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)choose(matches[active]);else if(matches.length===1)choose(matches[0])}};validate();
}


function bindRecordDeletes(){$$('[data-record-delete]').forEach(button=>button.onclick=()=>confirmRecordDelete(button.dataset.recordDelete));$$('[data-quote-pdf]').forEach(b=>b.onclick=()=>downloadSavedPDF(records.find(r=>r.id===b.dataset.quotePdf),b))}
function confirmRecordDelete(id){
 const record=records.find(r=>r.id===id);if(!record||!['enquiry','quote','purchase'].includes(record.kind))return;
 const dialog=$('#delete-modal');
 dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">Delete ${labels[record.kind]}?</h2></div><form id="delete-record-form"><p>Delete <b>${esc(record.reference)}</b> for <b>${esc(record.party)}</b>?</p>${record.kind==='quote'&&(workOrders.some(j=>j.quote_id===id)||invoices.some(i=>i.quote_id===id))?`<p class="notice">${(linked=>`This quote has ${linked.join(' and ')}. ${linked.length>1?'They keep their':'It keeps its'} own copy of the quote and ${linked.length>1?'are':'is'} not deleted.`)([workOrders.find(j=>j.quote_id===id)?.reference,invoices.find(i=>i.quote_id===id)?.reference].filter(Boolean))}</p>`:''}<p class="help">${session?'This permanently removes this record from Supabase and cannot be undone.':'This deletes the saved local record. Export a backup first if you may need it later.'} Customer and vendor details, and other records, will remain unchanged.</p><div class="error" id="delete-record-error" role="alert"></div><div class="actions"><button type="button" id="cancel-record-delete" autofocus>Cancel</button><button type="submit" class="delete-confirm">Delete ${labels[record.kind]}</button></div></form>`;
 dialog.showModal();$('#cancel-record-delete').onclick=()=>dialog.close();
 $('#delete-record-form').onsubmit=async event=>{
  event.preventDefault();const button=event.currentTarget.querySelector('[type=submit]');button.disabled=true;$('#delete-record-error').textContent='';
  try{
   if(session){const deleted=await api(`/rest/v1/business_records?id=eq.${encodeURIComponent(id)}&kind=eq.${record.kind}&updated_at=eq.${encodeURIComponent(record.updated_at)}`,{method:'DELETE',headers:{Prefer:'return=representation'}});if(!deleted?.length)throw Error('This record changed or was deleted in another browser. Cancel and refresh before trying again.');}
   records=records.filter(r=>r.id!==id);dialog.close();if($('#modal').open)$('#modal').close();render();if($('#search'))$('#search').value=query;if($('#filter'))$('#filter').value=filter;toast(`${record.reference} deleted.`);
  }catch(error){$('#delete-record-error').textContent=error.message||'Could not delete the record. Please retry.';}finally{button.disabled=false}
 };
}

function sidebarNavigation(){
 const link=(key,label)=>`<button data-nav="${key}" class="${page===key?'active':''}" ${page===key?'aria-current="page"':''}>${icon(key)}${label}</button>`;
 const label=k=>({workorders:'Work orders',hr:'HR'})[k]||k[0].toUpperCase()+k.slice(1);
 return ['overview','sales','workorders','invoices','procurement','inventory','accounts','hr','customers','vendors','settings'].map(k=>link(k,label(k))).join('');
}

function expenseAccountField(record){const options=expenseAccounts(record.category||'Capital expense');return `<label class="field full" id="expense-account-field">Account<select name="account_code" ${record.id?'':'required'}><option value="">${record.id?'Unclassified - select an account':'Select an account'}</option>${options.map(a=>`<option value="${a.code}" ${a.code===record.account_code?'selected':''}>${a.code} - ${esc(a.name)}</option>`).join('')}</select><small class="fine">Classify here, then review and post this expense in Accounts → Journal.</small></label>`}
function chartPage(){return `<div class="heading"><div><div class="eyebrow">BUSINESS FINANCES</div><h1>Chart of Accounts</h1><p class="sub">Account codes for Sutluj CNC Laser · PKR</p></div></div>${notice()}<div class="sectionlinks"><button data-tab="chart" class="selected">Chart of Accounts</button><button data-tab="expense">Expenses</button><button data-tab="cash">Petty cash</button><button data-tab="journal">Journal</button><button data-tab="reports">Reports</button></div><div class="notice"><span>Post invoices, payments and classified expenses in Journal. Reports use posted entries only; invoice balances are also available in Sales.</span></div><section class="card"><div class="toolbar"><input id="accountsearch" type="search" class="search" aria-label="Search accounts" placeholder="Search account code or name…"><select id="accounttype" aria-label="Account type"><option value="">All account types</option>${[...new Set(accountGroups.map(g=>g.type))].map(t=>`<option>${t}</option>`).join('')}</select></div><div id="accountgroups">${chartGroups('','')}</div></section><p class="help">Customer-owned material is excluded from these inventory accounts; its usage is recorded in Work orders. Customer advances have their own liability group. Customers, vendors and job numbers will remain separate from account codes.</p>`}
function chartGroups(search,type){const term=search.trim().toLowerCase();const groups=accountGroups.filter(g=>!type||g.type===type).map(g=>({...g,children:!term||`${g.code} ${g.name}`.toLowerCase().includes(term)?g.children:g.children.filter(a=>`${a.code} ${a.name}`.toLowerCase().includes(term))})).filter(g=>g.children.length);return groups.length?groups.map(g=>`<details class="account-group" ${term?'open':''}><summary><span class="account-code">${g.code}</span><b>${esc(g.name)}</b><span class="pill">${g.type}</span><span class="fine">${g.children.length} sub-accounts</span></summary><div class="tablewrap"><table><thead><tr><th>CODE</th><th>SUB-ACCOUNT</th><th>TYPE</th></tr></thead><tbody>${g.children.map(a=>`<tr><td class="ref">${a.code}</td><td>${esc(a.name)}</td><td>${g.type}</td></tr>`).join('')}</tbody></table></div></details>`).join(''):'<div class="empty">No matching accounts.</div>'}
function bindChart(){const update=()=>{$('#accountgroups').innerHTML=chartGroups($('#accountsearch').value,$('#accounttype').value)};$('#accountsearch').oninput=update;$('#accounttype').onchange=update}

async function loadBilling(table){let all=[];for(let offset=0;;offset+=500){const batch=await api(`/rest/v1/${table}?select=*&order=created_at.desc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)return all}}
function invoiceFromQuote(q){const job=workOrders.find(j=>j.quote_id===q.id);if(!job||job.status!=='Completed'){toast('Complete the work order before issuing an invoice.');return;}const prior=invoices.find(i=>i.quote_id===q.id);if(prior){openInvoice(prior.id);return}$('#modal').innerHTML=`<div class="modalhead"><h2>Create invoice</h2><button class="close" aria-label="Close">×</button></div><form id="issue-invoice"><p>Invoice <b>${esc(q.party)}</b> for completed job <b>${esc(job.reference)}</b> (quotation ${esc(q.reference)}).</p><div class="tablewrap"><table><thead><tr><th>ITEM</th><th class="money">QTY</th><th class="money">AMOUNT</th></tr></thead><tbody>${(q.lines||[]).map(l=>`<tr><td>${esc(l.description)}</td><td class="money">${esc(l.quantity)}</td><td class="money">${money(Math.round(Number(l.quantity)*Number(l.rate)*(100-lineDiscount(l)))/100)}</td></tr>`).join('')}</tbody></table></div><div class="summary"><span>Total including ${esc(q.tax||0)}% sales tax</span><b>${money(q.amount)}</b></div><div class="formgrid" style="margin-top:18px">${field('Invoice date','date',today(),'date',`required max="${today()}"`)}${field('Due date','due_date',dueFromTerms(q.payment_terms,today()),'date','required')}${session?'':`<label class="field full">Bank account to print<select name="bank_account_id">${bankAccountOptions(q.bank_account_id)}</select></label>`}</div><p class="help">${q.payment_terms?`Due date set from the payment terms “${esc(q.payment_terms)}”. `:''}Issuing fixes the invoice details; only payments can be added afterwards.</p><div id="billing-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button class="primary" type="submit">Issue invoice</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();$('.cancel').onclick=()=>$('#modal').close();$('#issue-invoice').onchange=e=>{if(e.target.name==='date'&&q.payment_terms)e.currentTarget.elements.due_date.value=dueFromTerms(q.payment_terms,e.target.value)};$('#issue-invoice').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]'),f=Object.fromEntries(new FormData(e.target));b.disabled=true;try{if(f.due_date<f.date)throw Error('Due date cannot be before invoice date.');if(q.amount<=0)throw Error('Save a quote with a positive total first.');let i;if(session){i=await api('/rest/v1/rpc/issue_quote_invoice',{method:'POST',body:JSON.stringify({p_quote:q.id,p_version:q.updated_at,p_date:f.date,p_due:f.due_date})})}else{i={...structuredClone(q),id:crypto.randomUUID(),quote_id:q.id,quote_reference:q.reference,reference:nextDocumentNumber('INV',invoices,f.date.slice(0,4)),bank_account_id:f.bank_account_id||'',job_id:job.id,job_reference:job.reference,date:f.date,due_date:f.due_date};}if(!invoices.some(x=>x.id===i.id))invoices.unshift(i);page='invoices';jobView=null;render();openInvoice(i.id);toast(`${i.reference} issued for ${q.party}.`)}catch(err){$('#billing-error').textContent=err.message}finally{b.disabled=false}}}
function openInvoice(id){const i=invoices.find(i=>i.id===id);if(!i)return;const {paid,due}=invoiceBalance(i,payments);const history=payments.filter(p=>p.invoice_id===id);const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>${esc(i.reference)}</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody" id="invoice-detail"><div class="actions" style="margin:0 0 20px"><button type="button" id="downloadinvoice">Download PDF</button></div><div id="invoice-pdf-error" class="error" role="alert"></div><p><b>${esc(i.party)}</b> · ${badge(invoiceStatus(i,payments,today()))}</p><p>${esc(i.description)}</p><p class="help">Quote ${esc(i.quote_reference)} · Issued ${esc(i.date)} · Due ${esc(i.due_date)}</p><div class="tablewrap"><table><thead><tr><th>ITEM</th><th>QUANTITY</th><th>RATE</th></tr></thead><tbody>${i.lines.map(l=>`<tr><td>${esc(l.description)}<small>${esc(thicknessText(l))}</small>${lineDiscount(l)?`<small>Less ${lineDiscount(l)}% discount</small>`:''}</td><td>${esc(l.quantity)}</td><td>${money(l.rate)}</td></tr>`).join('')}</tbody></table></div><div class="summary">Total (including ${esc(i.tax)}% tax): <b>${money(i.amount)}</b></div>${session?'':`<label class="field" style="margin-top:14px;max-width:420px">Bank account on the PDF<select id="invoice-bank">${bankAccountOptions(i.bank_account_id)}</select></label>`}<p>Received: <b>${money(paid)}</b> · Outstanding: <b>${money(due)}</b></p><h3>Payment history</h3>${history.length?`<ul>${history.map(p=>`<li>${esc(p.date)} · ${money(p.amount)} · ${esc(p.method)}${p.reference?' · '+esc(p.reference):''}</li>`).join('')}</ul>`:'<p class="help">No payments recorded.</p>'}${due>0?`<form id="invoice-payment"><h3>Record payment</h3><div class="formgrid">${field('Amount received (PKR)','amount','','number',`required min="0.01" max="${due}" step="0.01"`)}${field('Payment date','date',today(),'date',`required min="${i.date}" max="${today()}"`)}${select('Received into','method',['Business Bank Account','Cash on Hand','Petty Cash'],'Business Bank Account')}${field('Payment reference / receipt number','reference','','text','maxlength="150"')}</div><p class="help">Record money already received. This does not collect money. Post the receipt in Accounts → Journal to update the accounting cash/bank balance.</p><div id="billing-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="primary">Record payment</button></div></form>`:''}</div>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();$('#downloadinvoice').onclick=()=>downloadInvoicePDF(i);if($('#invoice-bank'))$('#invoice-bank').onchange=e=>{i.bank_account_id=e.target.value;saveLocalWorkspace();toast('Bank account for this invoice updated.')};if($('#invoice-payment'))$('#invoice-payment').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]'),f=Object.fromEntries(new FormData(e.target));b.disabled=true;try{validatePayment(f.amount,invoiceBalance(i,payments).due);if(f.date<i.date||f.date>today())throw Error('Payment date must be between invoice date and today.');let p;if(session){p=await api('/rest/v1/rpc/record_invoice_payment',{method:'POST',body:JSON.stringify({p_id:requestId,p_invoice:id,p_amount:Number(f.amount),p_date:f.date,p_method:f.method,p_reference:f.reference.trim()})})}else p={...f,amount:Number(f.amount),id:requestId,invoice_id:id};if(!payments.some(x=>x.id===p.id))payments.unshift(p);render();openInvoice(id);toast('Payment recorded.')}catch(err){$('#billing-error').textContent=err.message}finally{b.disabled=false}}}

function accountingTabs(){return `<div class="sectionlinks">${[['chart','Chart of Accounts'],['expense','Expenses'],['cash','Petty cash'],['journal','Journal'],['reports','Reports']].map(([key,label])=>`<button data-tab="${key}" class="${tab===key?'selected':''}">${label}</button>`).join('')}</div>`}
function sourceQueue(){return [...invoices.map(r=>({...r,source_kind:'invoice',label:r.reference})),...payments.map(r=>({...r,source_kind:'payment',label:'Receipt · '+(invoices.find(i=>i.id===r.invoice_id)?.reference||r.invoice_id)})),...records.filter(r=>r.kind==='expense').map(r=>({...r,source_kind:'expense',label:r.reference})),...stockQueue(),...hrQueue(),...scrapQueue()].filter(r=>!journals.some(j=>j.source_kind===r.source_kind&&j.source_id===r.id))}
function accountingPage(){return `<div class="heading"><div><div class="eyebrow">BUSINESS FINANCES</div><h1>${tab==='journal'?'Journal & posting':'Accounting reports'}</h1><p class="sub">PKR · ${tab==='journal'?'Review and post transactions to the accounts.':'Based only on posted journal entries.'}</p></div>${tab==='journal'?'<button class="primary" id="new-journal">＋ Journal entry</button>':''}</div>${notice()}${accountingTabs()}${tab==='journal'?journalPage():reportsPage()}`}
function journalPage(){const pending=sourceQueue();return `<section class="card"><div class="cardhead"><h2>Awaiting posting (${pending.length})</h2></div><p class="help" style="padding:0 24px">Quotes and purchase orders are not posted. Classify expenses first. Review the revenue account for each invoice; an invoice with mixed revenue can be split with a later journal adjustment. Petty cash register entries are separate and need manual journal entries. Stock movements post at the value recorded in Inventory. Payroll posts when finalised and again when salaries are paid.</p>${pending.length?`<div class="tablewrap"><table><thead><tr><th>SOURCE</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>${pending.map(r=>`<tr><td>${esc(r.label)}<small>${esc(r.party||r.method||'')} · ${r.source_kind}</small></td><td>${esc(r.date)}</td><td>${money(r.amount)}</td><td><button data-post-kind="${r.source_kind}" data-post-id="${esc(r.id)}" ${r.source_kind==='expense'&&!r.account_code?'disabled':''}>${r.source_kind==='expense'&&!r.account_code?'Classify expense first':'Review posting'}</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">All available transactions have been posted.</div>'}</section><section class="card" style="margin-top:24px"><div class="cardhead"><h2>Posted journal (${journals.length})</h2></div>${journals.length?`<div class="tablewrap"><table><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>DEBITS = CREDITS</th><th></th></tr></thead><tbody>${journals.map(j=>`<tr><td>${esc(j.date)}</td><td>${esc(j.description)}<small>${j.source_kind==='reversal'?'Reversal':esc(j.source_kind)}${journals.some(r=>r.reversal_of===j.id)?' · Reversed':''}</small></td><td>${money(j.lines.reduce((n,l)=>n+Number(l.debit),0))}</td><td><button data-journal="${esc(j.id)}">View</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No posted entries yet. Reports will show zero until transactions are posted.</div>'}</section>`}
function journalLinesTable(lines){return `<div class="tablewrap"><table><thead><tr><th>ACCOUNT</th><th>DEBIT</th><th>CREDIT</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${esc(l.account)} · ${esc(accountList.find(a=>a.code===l.account)?.name||'')}</td><td>${money(l.debit)}</td><td>${money(l.credit)}</td></tr>`).join('')}</tbody></table></div>`}
async function persistJournal(payload){let saved;if(session)saved=await api('/rest/v1/rpc/post_journal',{method:'POST',body:JSON.stringify({p_id:payload.id,p_date:payload.date,p_description:payload.description,p_lines:payload.lines,p_kind:payload.source_kind,p_source:payload.source_id||null,p_account:payload.account||null,p_offset:payload.offset||null})});else{validateJournal(payload.lines);saved={...payload,created_at:new Date().toISOString()};if(saved.source_kind==='reversal')saved.reversal_of=saved.source_id;}if(!journals.some(j=>j.id===saved.id))journals.unshift(saved);$('#modal').close();render();toast('Journal posted. Reports updated.')}
function postingEditor(kind,id){const r=sourceQueue().find(r=>r.source_kind===kind&&r.id===id);if(!r)return;const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>Review posting</h2><button class="close" aria-label="Close">×</button></div><form id="post-source"><p><b>${esc(r.label)}</b> · ${money(r.amount)} · ${esc(r.date)}</p>${kind==='invoice'?`<label class="field">Revenue account<select id="post-account" required><option value="">Select revenue account</option>${accountList.filter(a=>a.type==='Revenue').map(a=>`<option value="${a.code}">${a.code} · ${esc(a.name)}</option>`).join('')}</select></label>`:''}${kind==='stock'&&r.type==='receipt'?`<label class="field">Credit account<select id="post-offset">${receiptOffsets.map(code=>`<option value="${code}" ${code===suggestedOffset(r.item)?'selected':''}>${code} · ${esc(accountList.find(a=>a.code===code).name)}</option>`).join('')}</select></label><p class="help">Use the supplier payable for a purchase on credit, cash/bank if already paid, or Owner Capital for opening stock. Do not also record this purchase as an expense.</p>`:''}${kind==='expense'?`<label class="field">${r.status==='Paid'?'Paid from':'Offset account'}<select id="post-offset">${(r.status==='Paid'?['1001','1002','1003']:['2004']).map(code=>`<option value="${code}">${code} · ${esc(accountList.find(a=>a.code===code).name)}</option>`).join('')}</select></label><p class="help">The recorded expense amount is posted in full. Input tax is not inferred.</p>`:''}<div id="posting-preview"></div><p class="help">Posting fixes this accounting entry. Corrections use a reversal or adjustment.</p><div id="journal-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="primary">Post to accounts</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const build=()=>sourceLines(kind,r,$('#post-account')?.value,$('#post-offset')?.value);const preview=()=>{try{$('#posting-preview').innerHTML=journalLinesTable(build())}catch{$('#posting-preview').innerHTML=''}};if($('#post-account'))$('#post-account').onchange=preview;if($('#post-offset'))$('#post-offset').onchange=preview;preview();$('#post-source').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]');b.disabled=true;try{await persistJournal({id:requestId,date:r.date,description:r.label,source_kind:kind,source_id:id,account:$('#post-account')?.value,offset:$('#post-offset')?.value,lines:build()})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}
function journalRow(){return `<div class="journal-line"><select aria-label="Journal account" required><option value="">Choose account</option>${accountList.map(a=>`<option value="${a.code}">${a.code} · ${esc(a.name)}</option>`).join('')}</select><input aria-label="Debit" type="number" value="0" min="0" step="0.01" required><input aria-label="Credit" type="number" value="0" min="0" step="0.01" required><button type="button" class="remove-journal" aria-label="Remove journal line">×</button></div>`}
function manualJournal(){const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>New journal entry</h2><button class="close" aria-label="Close">×</button></div><form id="manual-journal"><div class="formgrid">${field('Date','date',today(),'date','required')}${field('Description / reference','description','','text','required maxlength="500"')}</div><p class="help">Use for opening balances and adjustments. Debit and credit totals must match. Avoid entering transactions already in the posting queue.</p><div class="linehead">ACCOUNT · DEBIT (PKR) · CREDIT (PKR)</div><div id="journal-lines">${journalRow()}${journalRow()}</div><button id="add-journal-line" type="button">＋ Add line</button><div id="journal-error" class="error" role="alert"></div><div class="actions"><button class="primary" type="submit">Post journal</button></div></form>`;$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const wire=()=>$$('.remove-journal').forEach(b=>b.onclick=()=>{if($$('.journal-line').length>2)b.closest('.journal-line').remove()});wire();$('#add-journal-line').onclick=()=>{if($$('.journal-line').length<100){$('#journal-lines').insertAdjacentHTML('beforeend',journalRow());wire()}};$('#manual-journal').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]');b.disabled=true;try{const f=Object.fromEntries(new FormData(e.target)),lines=$$('.journal-line').map(el=>({account:el.querySelector('select').value,debit:Number(el.querySelectorAll('input')[0].value),credit:Number(el.querySelectorAll('input')[1].value)}));validateJournal(lines);if(!f.description.trim())throw Error('Enter a description.');await persistJournal({id:requestId,...f,description:f.description.trim(),lines,source_kind:'manual'})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}
function viewJournal(id){const j=journals.find(j=>j.id===id),reversed=journals.some(r=>r.reversal_of===id);$('#modal').innerHTML=`<div class="modalhead"><h2>Posted journal</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody"><p>${esc(j.date)} · ${esc(j.description)}</p>${journalLinesTable(j.lines)}${!reversed&&j.source_kind!=='reversal'?`<form id="reverse-journal"><p class="help">A reversal posts equal and opposite amounts and keeps the original audit record. Source transactions stay marked as posted; use an adjustment for the correction.</p>${field('Reversal date','date',today(),'date',`required min="${j.date}"`)}<div id="journal-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="danger">Post reversal</button></div></form>`:`<p class="help">${reversed?'This entry has been reversed.':'This is a reversal entry.'}</p>`}</div>`;$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();if($('#reverse-journal')){const requestId=crypto.randomUUID();$('#reverse-journal').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await persistJournal({id:requestId,date:new FormData(e.target).get('date'),description:'Reversal: '+j.description,source_kind:'reversal',source_id:id,lines:reverseLines(j.lines)})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}}
function reportsPage(){return `<section class="card"><form id="report-period" class="toolbar">${field('From','from',reportFrom,'date','required id="report-from"')}${field('To / as at','to',reportTo,'date','required id="report-to"')}<button type="submit">Apply dates</button><button id="report-csv" type="button">Export trial balance CSV</button></form><div id="report-error" class="error" role="alert"></div></section><div id="report-output">${reportOutput()}</div>`}
function reportOutput(){const r=ledgerReport(journals,reportFrom,reportTo),rows=accountList.filter(a=>r.closing[a.code]);const cash=accountList.filter(a=>a.parent==='1000');const outstanding=invoices.filter(i=>i.date<=reportTo).map(i=>({...i,...invoiceBalance(i,payments.filter(p=>p.date<=reportTo))})).filter(i=>i.due>0);const unposted=sourceQueue().filter(s=>s.date<=reportTo).length;return `<p class="help">${unposted} source transactions through ${esc(reportTo)} await posting. Costs and opening balances not posted are excluded. P&L covers ${esc(reportFrom)} to ${esc(reportTo)}. Trial balance and cash are cumulative through the end date, including only recorded opening balances. VAT/tax figures are ledger movements, not a tax return.</p><div class="stats">${stat('Revenue',money(r.revenue),'Posted revenue · period','sales')}${stat('Gross profit',money(r.gross),'Revenue less direct costs','accounts')}${stat('Net profit / loss',money(r.net),'After posted expenses','accounts')}</div><section class="card"><div class="cardhead"><h2>Profit & loss</h2></div><div class="cardbody">${[['Revenue',r.revenue],['Direct costs',r.direct],['Gross profit',r.gross],['Operating & other expenses',r.expenses],['Net profit / loss',r.net]].map(([k,v])=>`<div class="summary"><span>${k}</span><b>${money(v)}</b></div>`).join('')}</div>${profitAccountRows(r)}</section><div class="panels" style="margin-top:24px"><section class="card"><div class="cardhead"><h2>Cash & bank · as at ${esc(reportTo)}</h2></div><div class="cardbody">${cash.map(a=>`<p>${esc(a.name)}: <b>${money((r.closing[a.code]||0)/100)}</b></p>`).join('')}<p class="help">Posted ledger balances; reconcile against bank statements and the separate petty cash register.</p></div></section><section class="card"><div class="cardhead"><h2>VAT / tax · period movements</h2></div><div class="cardbody"><p>Input tax (debit net): <b>${money((r.period['2201']||0)/100)}</b></p><p>Output tax (credit net): <b>${money(-(r.period['2202']||0)/100)}</b></p><p>Tax control (credit net): <b>${money(-(r.period['2203']||0)/100)}</b></p><p class="help">Uses entered tax amounts. No automatic tax rates, input-tax eligibility or filing calculations.</p></div></section></div><section class="card"><div class="cardhead"><h2>Trial balance · as at ${esc(reportTo)}</h2></div>${journalLinesTable(rows.map(a=>({account:a.code,debit:Math.max(r.closing[a.code],0)/100,credit:Math.max(-r.closing[a.code],0)/100})))}<div class="cardbody">Total debit: <b>${money(rows.reduce((n,a)=>n+Math.max(r.closing[a.code],0),0)/100)}</b> · Total credit: <b>${money(rows.reduce((n,a)=>n+Math.max(-r.closing[a.code],0),0)/100)}</b></div></section><section class="card" style="margin-top:24px"><div class="cardhead"><h2>Invoice receivables · as at ${esc(reportTo)}</h2></div><p class="help" style="padding:0 24px">Invoice totals less recorded receipts through the end date, including unposted transactions. Manual journals and reversals do not change this operational list.</p>${outstanding.length?`<div class="tablewrap"><table><thead><tr><th>CUSTOMER / INVOICE</th><th>DUE</th><th>OUTSTANDING</th><th>ACTIONS</th></tr></thead><tbody>${outstanding.map(i=>`<tr><td>${esc(i.party)}<small>${esc(i.reference)}</small></td><td>${esc(i.due_date)}</td><td>${money(i.due)}</td><td><button data-invoice="${esc(i.id)}" aria-label="View invoice ${esc(i.reference)}">View invoice</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No outstanding invoices at this date.</div>'}</section>`}
function bindAccounting(){if($('#new-journal'))$('#new-journal').onclick=manualJournal;$$('[data-post-kind]').forEach(b=>b.onclick=()=>postingEditor(b.dataset.postKind,b.dataset.postId));$$('[data-journal]').forEach(b=>b.onclick=()=>viewJournal(b.dataset.journal));if($('#report-period')){$('#report-period').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);if(f.get('from')>f.get('to')){$('#report-error').textContent='From date must be on or before the end date.';return}reportFrom=f.get('from');reportTo=f.get('to');$('#report-error').textContent='';$('#report-output').innerHTML=reportOutput();bindInvoices()};$('#report-csv').onclick=()=>{const r=ledgerReport(journals,reportFrom,reportTo),csv=[['As at','Code','Account','Debit PKR','Credit PKR'],...accountList.filter(a=>r.closing[a.code]).map(a=>[reportTo,a.code,a.name,Math.max(r.closing[a.code],0)/100,Math.max(-r.closing[a.code],0)/100])].map(row=>row.map(v=>JSON.stringify(String(v))).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='Sutluj-Trial-Balance-'+reportTo+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}}

function profitAccountRows(report){const rows=accountList.filter(a=>['Revenue','Direct cost','Expense'].includes(a.type)&&report.period[a.code]);return rows.length?`<div class="tablewrap"><table><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th>PERIOD AMOUNT</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${a.code}</td><td>${esc(a.name)}</td><td>${a.type}</td><td>${money((a.type==='Revenue'?-1:1)*report.period[a.code]/100)}</td></tr>`).join('')}</tbody></table></div>`:''}

async function downloadInvoicePDF(invoice,button=$('#downloadinvoice')){
 const label=button.textContent,error=$('#invoice-pdf-error');button.disabled=true;button.textContent='Preparing…';if(error)error.textContent='';
 try{
  const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createInvoicePDF(invoice,payments,new Uint8Array(await response.arrayBuffer()),window.PDFLib,today(),pdfContext(invoice));
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');
  link.href=url;link.download=`Sutluj-Invoice-${invoice.reference.replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  toast('Invoice PDF prepared. Open the downloaded PDF to print.');
 }catch(err){if($('#invoice-pdf-error'))$('#invoice-pdf-error').textContent=err.message||'Could not create PDF. Please retry.';else toast(err.message||'Could not create PDF. Please retry.')}
 finally{button.disabled=false;button.textContent=label}
}

function workspaceData(){return {records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}}
function restoreLocalWorkspace(){try{const data=localStore?.load();if(data)for(const [k,prefix] of [['customers','CUS'],['vendors','VEN']])for(const c of [...(data[k]||[])].sort((a,b)=>String(a.name).localeCompare(String(b.name))))if(!c.code)c.code=nextReference(prefix,data[k],'code');if(data){({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=data)}else{records=samplesToRecords();customers=sampleCustomers();vendors=sampleVendors();invoices=[];payments=[];workOrders=[];journals=[];stockItems=[];stockMoves=[];employees=[];attendance=[];advances=[];payrolls=[];scrapSales=[];}}catch(error){localSaveError=error.message}}
function saveLocalWorkspace(){if(session||!localStore)return;try{localStore.save(workspaceData());localSaveError=''}catch(error){localSaveError=error.message.includes('tab')||error.message.includes('read')?error.message:'Could not save locally. Browser storage may be full or disabled. Export a backup before closing.'}}
function localBackupCard(){return `<section class="card"><div class="cardhead"><h2>${session?'Workspace backup':'Local saving & backup'}</h2></div><div class="cardbody"><p>${session?'Export the currently loaded cloud records as a backup.':'Saved records are stored in this browser on this computer and survive refreshes and restarts.'}</p><p class="help">Keep using the same browser and app address. Clearing browser/site data or using a private window can remove local records. Unsaved form changes are not included. Export backups regularly; Supabase will provide shared storage when connected.</p><div class="row backup-actions"><button data-backup class="primary">Export backup</button>${session?'':'<label class="button-like" for="restore-file">Restore from backup…</label><input id="restore-file" type="file" accept="application/json,.json" hidden>'}</div>${session?'':'<p class="help">Restoring replaces everything in this browser with the backup file, including company details, bank accounts and the stamp. Use it to move your workspace to another computer or web address.</p>'}</div></section>`}
function exportWorkspaceBackup(){const data={version:1,revision:crypto.randomUUID(),savedAt:new Date().toISOString(),company,data:workspaceData()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='Sutluj-Backup-'+today()+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
window.addEventListener('beforeunload',event=>{if(!session&&localSaveError){event.preventDefault();event.returnValue=''}});


// Receivables ageing and customer statements (operational invoice balances, not ledger balances).
function ageingCard(){const a=receivablesAgeing(invoices,payments,today());return `<section class="card" style="margin-top:24px"><div class="cardhead"><div><h2>Receivables ageing</h2><p class="sub" style="margin-top:6px">Outstanding invoice balances by days past the due date, as at today.</p></div>${a.rows.length?'<button id="ageing-csv">Export ageing CSV</button>':''}</div>${a.rows.length?`<div class="tablewrap"><table class="ageing"><thead><tr><th>CUSTOMER</th>${ageingBuckets.map(b=>`<th class="money">${b.toUpperCase()}</th>`).join('')}<th class="money">TOTAL DUE</th><th></th></tr></thead><tbody>${a.rows.map(r=>`<tr><td>${esc(r.party)}<small>${r.invoices} open invoice${r.invoices===1?'':'s'}</small></td>${r.buckets.map((v,i)=>`<td class="money ${i>1&&v?'late':''}">${v?money(v):'—'}</td>`).join('')}<td class="money"><b>${money(r.total)}</b></td><td><button class="textbutton" data-statement="${esc(r.party)}">Statement ↗</button></td></tr>`).join('')}</tbody><tfoot><tr><td><b>Total</b></td>${a.totals.map(v=>`<td class="money"><b>${money(v)}</b></td>`).join('')}<td class="money"><b>${money(a.total)}</b></td><td></td></tr></tfoot></table></div>`:'<div class="empty">No outstanding invoices. Nothing to chase today.</div>'}</section>`}
function exportAgeingCSV(){const a=receivablesAgeing(invoices,payments,today());downloadCSV(`sutluj-receivables-ageing-${today()}.csv`,[['As at','Customer','Open invoices',...ageingBuckets.map(b=>b+' (PKR)'),'Total due (PKR)'],...a.rows.map(r=>[today(),r.party,r.invoices,...r.buckets,r.total]),[today(),'TOTAL','',...a.totals,a.total]]);toast(`Exported ageing for ${a.rows.length} customers.`)}
function bindStatements(){$$('[data-statement]').forEach(b=>b.onclick=()=>openStatement(b.dataset.statement))}
function statementBody(st){return `<div class="stats statement-stats">${stat('Opening balance',money(st.opening),'Before '+esc(st.from),'accounts')}${stat('Invoiced',money(st.charged),'In this period','sales')}${stat('Received',money(st.received),'In this period','accounts')}${stat('Balance due',money(st.closing),'As at '+esc(st.to),'accounts')}</div>${st.entries.length?`<div class="tablewrap"><table><thead><tr><th>DATE</th><th>TYPE / INVOICE</th><th class="money">CHARGES</th><th class="money">RECEIVED</th><th class="money">BALANCE</th></tr></thead><tbody>${st.entries.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.type)} · ${esc(e.reference)}<small>${esc(e.details)}</small></td><td class="money">${e.charge?money(e.charge):'—'}</td><td class="money">${e.credit?money(e.credit):'—'}</td><td class="money">${money(e.balance)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No invoices or payments for this customer in the selected period.</div>'}`}
function openStatement(party){if(!party)return;const build=()=>customerStatement(party,invoices,payments,statementFrom,statementTo);$('#modal').innerHTML=`<div class="modalhead"><h2>Statement · ${esc(party)}</h2><button class="close" aria-label="Close">×</button></div><form id="statement-form"><div class="formgrid">${field('From','from',statementFrom,'date','required')}${field('To','to',statementTo,'date','required')}</div><div id="statement-error" class="error" role="alert"></div><div id="statement-output">${statementBody(build())}</div><p class="help">Built from issued invoices and recorded payments for this customer name. It does not include quotes, unissued work or manual journal entries.</p><div class="actions"><button type="button" id="statement-csv">Export CSV</button><button type="button" id="statement-pdf" class="primary">Download PDF</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const form=$('#statement-form');form.onsubmit=e=>e.preventDefault();const update=()=>{const from=form.elements.from.value,to=form.elements.to.value;if(!from||!to||from>to){$('#statement-error').textContent='From date must be on or before the end date.';return false}statementFrom=from;statementTo=to;$('#statement-error').textContent='';$('#statement-output').innerHTML=statementBody(build());return true};form.elements.from.onchange=update;form.elements.to.onchange=update;
 $('#statement-csv').onclick=()=>{if(!update())return;const st=build();downloadCSV(`Sutluj-Statement-${party.replace(/[^a-zA-Z0-9_-]/g,'-')}-${st.to}.csv`,[['Customer','Date','Type','Invoice','Details','Charges (PKR)','Received (PKR)','Balance (PKR)'],[party,st.from,'Opening balance','','','','',st.opening],...st.entries.map(e=>[party,e.date,e.type,e.reference,e.details,e.charge||'',e.credit||'',e.balance]),[party,st.to,'Balance due','','',st.charged,st.received,st.closing]]);toast('Statement exported.')};
 $('#statement-pdf').onclick=async()=>{if(!update())return;const button=$('#statement-pdf');button.disabled=true;button.textContent='Preparing PDF…';try{const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');const st=build(),bytes=await createStatementPDF(st,new Uint8Array(await response.arrayBuffer()),window.PDFLib,{preparedOn:today()});const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`Sutluj-Statement-${party.replace(/[^a-zA-Z0-9_-]/g,'-')}-${st.to}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Statement PDF downloaded.')}catch(error){$('#statement-error').textContent=error.message||'Could not create PDF. Please retry.'}finally{button.disabled=false;button.textContent='Download PDF'}};
}

// Inventory: sheet stock, remnants, consumables, customer-owned material and scrap.
// Local workspace only until cloud tables exist. Movements are append-only; corrections use a stock count.
const stockById=id=>stockItems.find(i=>i.id===id);
const byCode=(a,b)=>String(a.code).localeCompare(String(b.code));
const plural=(u,q)=>Math.abs(q)===1||['pcs','kg'].includes(u)?u:u==='box'?'boxes':u+'s';
const fmtQty=(q,item)=>item?`${Number(q).toLocaleString('en-PK',{maximumFractionDigits:3})} ${plural(unitOf(item),q)}`:String(q);
const kgText=(item,q)=>{const kg=sheetWeightKg(item);return kg?`${(kg*q).toLocaleString('en-PK',{maximumFractionDigits:1})} kg`:''};
const stockTabFor=item=>item.owner==='Customer'?'customer':item.category;
const stockPosted=m=>journals.some(j=>j.source_kind==='stock'&&j.source_id===m.id);
function addStockMove(move){const m={id:crypto.randomUUID(),reference:nextReference('SM',stockMoves),value:0,amount:0,notes:'',created_at:new Date().toISOString(),...move};stockMoves.push(m);return m}
function stockQueue(){return stockMoves.map(m=>({...m,item:stockById(m.item_id)})).filter(m=>isPostable(m,m.item)).map(m=>({...m,source_kind:'stock',label:`${m.reference} · ${moveLabels[m.type]} · ${m.item.code}`,amount:m.type==='dispose'||m.item.category==='consumable'?m.amount:Math.abs(m.value),party:m.job_reference||m.party||''}))}
function lowStockNotice(){if(session)return '';const low=stockItems.filter(i=>needsReorder(i,balanceOf(i.id,stockMoves)));return low.length?`<div class="notice"><span><b>Reorder:</b> ${low.length} stock item${low.length===1?' is':'s are'} at or below the reorder level · ${low.slice(0,4).map(i=>esc(i.code)).join(', ')}${low.length>4?'…':''}</span><button data-nav="inventory">View inventory ↗</button></div>`:''}

function inventoryPage(){
 const head=`<div class="heading"><div><div class="eyebrow">MATERIALS & STOCK</div><h1>Inventory</h1><p class="sub">Sheets, remnants, consumables, customer-owned material and scrap.</p></div>${session?'':'<div class="row"><button id="stock-new">＋ Stock item</button><button class="primary" id="stock-receive">＋ Receive stock</button></div>'}</div>`;
 if(session)return head+'<section class="card"><div class="cardbody"><p>Inventory is available in the local workspace only for now.</p><p class="help">Cloud tables for stock have not been set up yet. Sign out to use inventory with your local records.</p></div></section>';
 const map=balances(stockMoves),b=i=>map.get(i.id)||{qty:0,value:0},own=stockItems.filter(i=>i.owner==='Business');
 const sheets=own.filter(i=>i.category==='sheet'),rems=own.filter(i=>i.category==='remnant'&&b(i).qty>0),low=stockItems.filter(i=>needsReorder(i,balanceOf(i.id,stockMoves)));
 const kg=list=>list.reduce((n,i)=>n+(sheetWeightKg(i)||0)*b(i).qty,0).toLocaleString('en-PK',{maximumFractionDigits:0});
 const count=t=>t==='moves'?stockMoves.length:t==='sheet'?sheets.length:t==='scrap'||t==='consumable'?own.filter(i=>i.category===t).length:stockList('',t).length;
 return `${head}${notice()}<div class="stats">${stat('Stock value',money(own.reduce((n,i)=>n+b(i).value,0)/100),'Business sheets and remnants at average cost','accounts')}${stat('Sheets on hand',sheets.reduce((n,i)=>n+b(i).qty,0).toLocaleString('en-PK'),`${kg(sheets)} kg across ${sheets.length} size${sheets.length===1?'':'s'}`,'inventory')}${stat('Reorder alerts',String(low.length),'Items at or below reorder level','procurement')}${stat('Usable remnants',String(rems.length),`${kg(rems)} kg of offcuts to nest first`,'inventory')}</div>${lowStockNotice()}${poReceivingCard()}
 <div class="sectionlinks">${[['sheet','Sheets'],['remnant','Remnants'],['consumable','Consumables'],['customer','Customer material'],['scrap','Scrap'],['moves','Movements']].map(([k,l])=>`<button data-stock-tab="${k}" class="${stockTab===k?'selected':''}">${l} <span class="fine">&nbsp;${count(k)}</span></button>`).join('')}</div>
 <section class="card"><div class="toolbar"><input id="stock-search" class="search" type="search" placeholder="Search code, material, size, job or location…" aria-label="Search stock"><div class="row"><button id="stock-csv">Export CSV</button></div></div><div id="stock-rows">${stockTable('')}</div></section><p class="help">${{sheet:'Full sheets are counted in whole pieces and valued at weighted average cost. Issue them to jobs from the work order.',remnant:'Usable offcuts returned from jobs. Each carries its share of the sheet cost by area. Use these before cutting a new sheet.',consumable:'Gas, nozzles and lenses are counted for reordering. Their cost is expensed to the chosen account when the receipt is posted, so they carry no stock value.',customer:'Material supplied by customers. Counted only; never valued or posted, and only usable on that customer’s jobs.',scrap:'Scrap comes in from job skeletons and recorded collections, and goes out through scrap sales. Sales post to Scrap Sales (4302) from Accounts → Journal; disposals without a sale have no accounting value.',moves:'Every receipt, issue, offcut, scrap and adjustment. Movements cannot be edited; use a stock count to correct quantities.'}[stockTab]}</p>`;
}
function stockList(term,tab=stockTab){
 const map=balances(stockMoves),q=i=>(map.get(i.id)||{qty:0}).qty,t=term.trim().toLowerCase();
 const live=i=>q(i)>0||!stockMoves.some(m=>m.item_id===i.id); // hide used-up remnants and customer lots, not new items
 const list=stockItems.filter(i=>tab==='customer'?i.owner==='Customer'&&live(i):i.owner==='Business'&&i.category===tab&&(tab!=='remnant'||live(i)));
 return list.filter(i=>`${i.code} ${itemLabel(i)} ${i.location||''} ${i.customer||''}`.toLowerCase().includes(t)).sort(byCode);
}
function stockTable(term){
 if(stockTab==='moves')return moveTable(term);
 if(stockTab==='scrap')return scrapYard(term);
 const rows=stockList(term);
 if(!rows.length)return `<div class="empty">${term?'No matching stock.':{sheet:'No sheet stock yet. Add a stock item such as “Mild steel 1.5 mm 1220 × 2440”, then receive stock into it.',remnant:'No usable remnants. Return an offcut when issuing a sheet to a job.',consumable:'No consumables yet. Add items such as oxygen and nitrogen cylinders, nozzles and lenses.',customer:'No customer material in stock.',scrap:'No scrap recorded. Record skeleton weight when issuing sheets to a job.'}[stockTab]}</div>`;
 const valued=['sheet','remnant'].includes(stockTab);
 return `<div class="tablewrap"><table><thead><tr><th>ITEM</th><th class="money">ON HAND</th>${valued?'<th class="money">AVG COST</th><th class="money">VALUE</th>':stockTab==='consumable'?'<th class="money">LAST PRICE</th>':''}<th>STATUS</th><th></th></tr></thead><tbody>${rows.map(i=>{const b=balanceOf(i.id,stockMoves),last=[...stockMoves].reverse().find(m=>m.item_id===i.id&&m.type==='receipt');return `<tr><td class="ref">${esc(i.code)}<small>${esc(itemLabel(i))}${i.owner==='Customer'?' · '+esc(i.customer):''}${i.location?' · '+esc(i.location):''}</small></td><td class="money">${fmtQty(b.qty,i)}<small>${kgText(i,b.qty)}</small></td>${valued?`<td class="money">${money(b.avg)}</td><td class="money">${money(b.value)}</td>`:stockTab==='consumable'?`<td class="money">${last?money(last.unit_cost):'—'}</td>`:''}<td>${needsReorder(i,b)?badge('Reorder'):b.qty>0?badge('In stock'):badge('Out of stock')}${Number(i.reorder_level)>0&&i.owner==='Business'?`<small>Reorder at ${fmtQty(i.reorder_level,i)}</small>`:''}</td><td class="stock-actions">${!['remnant','scrap'].includes(i.category)?`<button class="textbutton" data-stock-receive="${esc(i.id)}">Receive</button>`:''}${i.category!=='scrap'&&b.qty>0?`<button class="textbutton" data-stock-issue="${esc(i.id)}">Issue</button>`:''}${(i.category==='scrap'||i.owner==='Customer')&&b.qty>0?`<button class="textbutton" data-stock-dispose="${esc(i.id)}">${i.category==='scrap'?'Sell / dispose':'Return'}</button>`:''}<button class="textbutton" data-stock-count="${esc(i.id)}">Count</button><button class="textbutton" data-stock-history="${esc(i.id)}">History</button>${i.category!=='scrap'?`<button class="textbutton" data-stock-edit="${esc(i.id)}">Edit</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`;
}
function moveRows(term){const t=term.trim().toLowerCase();return [...stockMoves].sort((a,b)=>b.date.localeCompare(a.date)||b.created_at.localeCompare(a.created_at)||b.reference.localeCompare(a.reference)).map(m=>({m,i:stockById(m.item_id)})).filter(({m,i})=>`${m.reference} ${moveLabels[m.type]} ${i?.code} ${i?itemLabel(i):''} ${m.job_reference||''} ${m.po_reference||''} ${m.party||''} ${m.doc_reference||''}`.toLowerCase().includes(t))}
function moveTable(term){const rows=moveRows(term);return rows.length?`<div class="tablewrap"><table><thead><tr><th>REFERENCE</th><th>ITEM</th><th>MOVEMENT</th><th class="money">QTY</th><th class="money">VALUE</th><th>ACCOUNTS</th></tr></thead><tbody>${rows.map(({m,i})=>`<tr><td class="ref">${esc(m.reference)}<small>${esc(m.date)}</small></td><td>${esc(i?.code)}<small>${esc(i?itemLabel(i):'')}</small></td><td>${moveLabels[m.type]}<small>${esc([m.job_reference,m.po_reference,m.party,m.doc_reference,m.notes].filter(Boolean).join(' · '))}</small></td><td class="money">${Number(m.quantity)>0?'+':''}${fmtQty(m.quantity,i)}</td><td class="money">${m.value?money(m.value):m.amount?money(m.amount)+'<small>'+(m.type==='dispose'?'sale':'expensed')+'</small>':'—'}</td><td>${!isPostable(m,i)?'<span class="fine">Not posted</span>':stockPosted(m)?badge('Posted'):badge('Pending')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No stock movements yet.</div>'}
function bindInventory(){
 if(session)return;
 $('#stock-new').onclick=()=>stockItemEditor();$('#stock-receive').onclick=()=>receiveEditor();
 $$('[data-po-receive]').forEach(b=>b.onclick=()=>poReceiveEditor(b.dataset.poReceive));
 $$('[data-stock-tab]').forEach(b=>b.onclick=()=>{stockTab=b.dataset.stockTab;render()});
 $('#stock-search').oninput=e=>{$('#stock-rows').innerHTML=stockTable(e.target.value);bindStockRows()};
 $('#stock-csv').onclick=exportStockCSV;bindStockRows();
}
function bindStockRows(){
 const on=(attr,fn)=>$$(`[data-stock-${attr}]`).forEach(b=>b.onclick=()=>fn(b.dataset['stock'+attr[0].toUpperCase()+attr.slice(1)]));
 on('receive',id=>receiveEditor({itemId:id}));on('issue',id=>issueEditor({itemId:id}));on('count',countEditor);on('history',stockHistory);on('edit',stockItemEditor);on('dispose',disposeEditor);bindScrapYard();
}
function exportStockCSV(){
 const term=$('#stock-search')?.value||'';
 if(stockTab==='moves'){const rows=moveRows(term);downloadCSV(`sutluj-stock-movements-${today()}.csv`,[['Reference','Date','Movement','Item code','Item','Quantity','Unit','Value (PKR)','Amount (PKR)','Job','Purchase order','Party','Document','Notes','Accounts'],...rows.map(({m,i})=>[m.reference,m.date,moveLabels[m.type],i?.code,i?itemLabel(i):'',m.quantity,i?unitOf(i):'',m.value,m.amount,m.job_reference||'',m.po_reference||'',m.party||'',m.doc_reference||'',m.notes||'',!isPostable(m,i)?'Not posted':stockPosted(m)?'Posted':'Pending'])]);toast(`Exported ${rows.length} movements.`);return}
 const rows=stockList(term);downloadCSV(`sutluj-stock-${stockTab}-${today()}.csv`,[['As at','Code','Item','Owner','Customer','Location','On hand','Unit','Weight (kg)','Average cost (PKR)','Value (PKR)','Reorder level'],...rows.map(i=>{const b=balanceOf(i.id,stockMoves),kg=sheetWeightKg(i);return [today(),i.code,itemLabel(i),i.owner,i.customer||'',i.location||'',b.qty,unitOf(i),kg?Math.round(kg*b.qty*10)/10:'',b.avg,b.value,i.reorder_level||0]})]);toast(`Exported ${rows.length} items.`);
}

function stockItemEditor(id){
 const it=stockById(id)||{category:stockTab==='consumable'?'consumable':stockTab==='remnant'?'remnant':'sheet',owner:stockTab==='customer'?'Customer':'Business',material:'steel',width_mm:1220,length_mm:2440,unit:'cylinder',account:'5101',reorder_level:0};
 const used=!!id&&stockMoves.some(m=>m.item_id===id),lock=used?'disabled':'';
 const preset=sheetSizes.find(([w,l])=>w===Number(it.width_mm)&&l===Number(it.length_mm));
 const accountName=c=>accountList.find(a=>a.code===c)?.name||'';
 $('#modal').innerHTML=`<div class="modalhead"><h2>${id?'Edit':'New'} stock item${id?' · '+esc(it.code):''}</h2><button class="close" aria-label="Close">×</button></div><form id="stock-item-form"><div class="formgrid">
 <label class="field">Category<select name="category" ${lock}>${['sheet','remnant','consumable'].map(c=>`<option value="${c}" ${c===it.category?'selected':''}>${categoryLabels[c]}</option>`).join('')}</select></label>
 <label class="field">Owned by<select name="owner" ${lock}>${['Business','Customer'].map(o=>`<option ${o===it.owner?'selected':''}>${o}</option>`).join('')}</select></label>
 <label class="field full" id="stock-customer">Customer<select name="customer" ${lock}><option value="">Select customer</option>${customers.map(c=>c.name).sort().map(n=>`<option ${n===it.customer?'selected':''}>${esc(n)}</option>`).join('')}</select></label></div>
 <fieldset id="stock-sheet" class="plainset"><div class="formgrid">
 <label class="field">Material<select name="material" ${lock}>${Object.entries(materials).map(([k,v])=>`<option value="${k}" ${k===it.material?'selected':''}>${v}</option>`).join('')}</select></label>
 ${field('Grade (optional)','grade',it.grade||'','text','maxlength="40" placeholder="e.g. A36, 304, 5052"')}
 <label class="field">Gauge (US)<select name="gauge" ${lock}>${gaugeOptions(it.material,it.thickness_mm)}</select></label>
 ${field('Thickness (mm)','thickness_mm',it.thickness_mm??'','number',`min="0.001" max="100" step="0.001" required ${lock}`)}
 <label class="field full">Sheet size<select name="size" ${lock}>${sheetSizes.map(([w,l,ft])=>`<option value="${w}x${l}" ${preset===sheetSizes.find(s=>s[0]===w&&s[1]===l)?'selected':''}>${w} × ${l} mm${ft?' ('+ft+')':''}</option>`).join('')}<option value="custom" ${preset?'':'selected'}>Custom size / offcut</option></select></label>
 ${field('Width (mm)','width_mm',it.width_mm??'','number',`min="1" max="20000" step="1" required ${lock}`)}
 ${field('Length (mm)','length_mm',it.length_mm??'','number',`min="1" max="20000" step="1" required ${lock}`)}
 </div><p class="help" id="stock-weight"></p></fieldset>
 <fieldset id="stock-consumable" class="plainset"><div class="formgrid">
 ${field('Name','name',it.name||'','text','maxlength="150" required placeholder="e.g. Oxygen cylinder 50 L"')}
 <label class="field">Unit<select name="unit" ${lock}>${consumableUnits.map(u=>`<option ${u===it.unit?'selected':''}>${u}</option>`).join('')}</select></label>
 <label class="field full">Cost account<select name="account">${consumableAccounts.map(c=>`<option value="${c}" ${c===it.account?'selected':''}>${c} · ${esc(accountName(c))}</option>`).join('')}</select><small class="fine">Expensed to this account when a receipt is posted.</small></label></div></fieldset>
 <div class="formgrid plainset">${field('Reorder level','reorder_level',it.reorder_level||0,'number','min="0" max="1000000" step="0.001"')}${field('Location / rack','location',it.location||'','text','maxlength="100" placeholder="e.g. Rack A2"')}</div>
 ${used?'<p class="help">Category, ownership, material and size are fixed once stock has moved. Create a new item for a different size.</p>':''}
 <div id="stock-error" class="error" role="alert"></div><div class="actions">${id&&!used?'<button type="button" class="danger" id="stock-delete">Delete</button>':''}<button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save item</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#stock-item-form'),f=form.elements;
 const weight=()=>{const kg=sheetWeightKg({category:'sheet',material:f.material.value,thickness_mm:f.thickness_mm.value,length_mm:f.length_mm.value,width_mm:f.width_mm.value});$('#stock-weight').textContent=kg?`Nominal weight ${kg} kg per piece.`:''};
 const toggle=()=>{const consumable=f.category.value==='consumable';$('#stock-sheet').hidden=$('#stock-sheet').disabled=consumable;$('#stock-consumable').hidden=$('#stock-consumable').disabled=!consumable;$('#stock-customer').hidden=f.owner.value!=='Customer';f.customer.required=f.owner.value==='Customer'};
 f.category.onchange=f.owner.onchange=toggle;
 f.material.onchange=()=>{f.gauge.innerHTML=gaugeOptions(f.material.value,f.thickness_mm.value);weight()};
 f.gauge.onchange=()=>{if(f.gauge.value)f.thickness_mm.value=gauges[f.material.value][f.gauge.value];weight()};
 f.thickness_mm.oninput=()=>{f.gauge.innerHTML=gaugeOptions(f.material.value,f.thickness_mm.value);weight()};
 f.size.onchange=()=>{if(f.size.value!=='custom'){const [w,l]=f.size.value.split('x');f.width_mm.value=w;f.length_mm.value=l}weight()};
 f.width_mm.oninput=f.length_mm.oninput=()=>{const s=`${f.width_mm.value}x${f.length_mm.value}`;f.size.value=[...f.size.options].some(o=>o.value===s)?s:'custom';weight()};
 toggle();weight();
 if($('#stock-delete'))$('#stock-delete').onclick=()=>{stockItems=stockItems.filter(x=>x.id!==id);$('#modal').close();render();toast(`${it.code} deleted.`)};
 form.onsubmit=e=>{e.preventDefault();try{
  const sheet=f.category.value!=='consumable';
  const next={...it,id:it.id||crypto.randomUUID(),category:f.category.value,owner:f.owner.value,customer:f.owner.value==='Customer'?f.customer.value:'',reorder_level:Number(f.reorder_level.value||0),location:f.location.value.trim(),created_at:it.created_at||new Date().toISOString(),
   ...(sheet?{material:f.material.value,grade:f.grade.value.trim(),thickness_mm:Number(f.thickness_mm.value),width_mm:Number(f.width_mm.value),length_mm:Number(f.length_mm.value),name:'',unit:'sheet',account:''}:{name:f.name.value.trim(),unit:f.unit.value,account:f.account.value,material:'',grade:'',thickness_mm:null,width_mm:null,length_mm:null})};
  if(used)Object.assign(next,{category:it.category,owner:it.owner,customer:it.customer,material:it.material,thickness_mm:it.thickness_mm,width_mm:it.width_mm,length_mm:it.length_mm,unit:it.unit});
  validateItem(next,stockItems);
  const others=stockItems.filter(x=>x.id!==next.id);
  if(!used&&(!it.code||next.category==='sheet'||it.category!==next.category||it.owner!==next.owner)){let code=itemCode(next,others),n=1;while(others.some(x=>x.code===code))code=`${itemCode(next,others)}-${++n}`;next.code=code}
  stockItems=id?stockItems.map(x=>x.id===id?next:x):[...stockItems,next];
  stockTab=stockTabFor(next);$('#modal').close();render();toast(id?`${next.code} updated.`:`${next.code} added. Receive stock into it next.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}

function itemOption(i,selected,map){const b=map?map.get(i.id)||{qty:0}:null;return `<option value="${esc(i.id)}" ${i.id===selected?'selected':''}>${esc(i.code)} · ${esc(itemLabel(i))}${i.owner==='Customer'?' · '+esc(i.customer):''}${b?' · '+fmtQty(b.qty,i)+' on hand':''}</option>`}
function receiveEditor({itemId,poId}={}){
 const items=stockItems.filter(i=>i.category!=='scrap').sort(byCode);
 if(!items.length){toast('Add a stock item first, then receive stock into it.');stockItemEditor();return}
 const pos=records.filter(r=>r.kind==='purchase'&&r.status!=='Cancelled'),po=records.find(r=>r.id===poId),map=balances(stockMoves);
 $('#modal').innerHTML=`<div class="modalhead"><h2>Receive stock</h2><button class="close" aria-label="Close">×</button></div><form id="receive-form"><div class="formgrid">
 <label class="field full">Stock item<select name="item_id" required><option value="">Select item</option>${items.map(i=>itemOption(i,itemId,map)).join('')}</select><small class="fine">Not listed? Add it with ＋ Stock item first.</small></label>
 ${field('Date received','date',today(),'date',`required max="${today()}"`)}
 ${field('Quantity','quantity','','number','required min="0.001" max="1000000" step="0.001"')}
 <label class="field cost-field">Price basis<select name="basis"><option value="unit">Per sheet / unit</option><option value="kg">Per kg</option></select></label>
 ${field('Rate (PKR)','rate','','number','min="0" max="1000000000" step="0.01"').replace('class="field"','class="field cost-field"')}
 <label class="field">Purchase order (optional)<select name="po_id"><option value="">None</option>${pos.map(p=>`<option value="${esc(p.id)}" ${p.id===poId?'selected':''}>${esc(p.reference)} · ${esc(p.party)} · ${esc(p.status)}</option>`).join('')}</select></label>
 ${field('Supplier / source','party',po?.party||'','text','maxlength="150"')}
 ${field('Delivery note / bill no.','doc_reference','','text','maxlength="150"')}
 <label class="field check" id="mark-po"><input type="checkbox" name="mark_received" ${po&&po.status!=='Received'?'checked':''}> Mark the purchase order Received</label>
 <label class="field full">Notes<textarea name="notes" maxlength="1000"></textarea></label></div>
 <div class="summary"><span>Receipt</span><b id="receive-preview">—</b></div><p class="help" id="receive-help"></p>
 <div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Receive stock</button></div></form>`;
 if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#receive-form'),f=form.elements;
 const preview=()=>{const item=stockById(f.item_id.value),pick=records.find(r=>r.id===f.po_id.value);$('#mark-po').hidden=!pick||pick.status==='Received';if(!item){$('#receive-preview').textContent='—';$('#receive-help').textContent='';return}
  const customer=item.owner==='Customer',consumable=item.category==='consumable',q=Number(f.quantity.value)||0;
  $$('.cost-field').forEach(el=>el.hidden=customer);f.basis.closest('label').hidden=customer||consumable||!sheetWeightKg(item);if(f.basis.closest('label').hidden)f.basis.value='unit';
  let text=`${fmtQty(q,item)}${kgText(item,q)?' · '+kgText(item,q):''}`;
  if(!customer)try{const uc=unitCost(item,f.basis.value,f.rate.value||0);text+=` · ${money(uc)} per ${unitOf(item)} · total ${money(Math.round(uc*100*q)/100)}`}catch{}
  $('#receive-preview').textContent=text;
  $('#receive-help').textContent=customer?`Customer-owned material for ${item.customer}: counted only, never valued or posted.`:consumable?`Post this receipt in Accounts → Journal to expense it to ${item.account}. Do not also record it as an expense.`:'Post this receipt in Accounts → Journal (Dr inventory, Cr supplier). Do not also record this purchase as an expense; settle the supplier with a journal (Dr 2001, Cr bank).';
 };
 f.po_id.onchange=()=>{const p=records.find(r=>r.id===f.po_id.value);if(p&&!f.party.value)f.party.value=p.party;f.mark_received.checked=!!p&&p.status!=='Received';preview()};
 form.oninput=preview;form.onchange=preview;preview();
 form.onsubmit=e=>{e.preventDefault();try{
  const item=stockById(f.item_id.value);if(!item)throw Error('Choose a stock item.');
  if(!f.date.value||f.date.value>today())throw Error('Enter a receipt date that is not in the future.');
  const q=validateQuantity(item,f.quantity.value),customer=item.owner==='Customer',consumable=item.category==='consumable';
  const uc=customer?0:unitCost(item,f.basis.value,f.rate.value||0);if(!customer&&!(uc>0))throw Error('Enter the purchase rate. Use Owner Capital when posting opening stock.');
  const total=Math.round(uc*100*q)/100,p=records.find(r=>r.id===f.po_id.value);
  const m=addStockMove({item_id:item.id,type:'receipt',date:f.date.value,quantity:q,unit_cost:uc,value:customer||consumable?0:total,amount:consumable?total:0,po_id:p?.id||'',po_reference:p?.reference||'',party:f.party.value.trim()||(customer?item.customer:''),doc_reference:f.doc_reference.value.trim(),notes:f.notes.value.trim()});
  if(p&&f.mark_received.checked&&!$('#mark-po').hidden)p.status='Received';
  stockTab=stockTabFor(item);$('#modal').close();render();toast(`${m.reference}: ${fmtQty(q,item)} received into ${item.code}.${customer?'':' Post it in Accounts → Journal.'}`);
 }catch(err){$('#stock-error').textContent=err.message}};
}

function issueEditor({itemId,jobId}={}){
 const map=balances(stockMoves),avail=stockItems.filter(i=>i.category!=='scrap'&&(map.get(i.id)?.qty||0)>0).sort(byCode),fixed=workOrders.find(j=>j.id===jobId);
 if(!avail.length){toast('Nothing in stock to issue. Receive stock first.');return}
 const jobs=workOrders.filter(j=>j.status!=='Completed');
 $('#modal').innerHTML=`<div class="modalhead"><h2>Issue stock${fixed?' · '+esc(fixed.reference):''}</h2><button class="close" aria-label="Close">×</button></div><form id="issue-form"><div class="formgrid">
 ${fixed?`<input type="hidden" name="job_id" value="${esc(fixed.id)}"><p class="full"><b>${esc(fixed.party)}</b> · Quote ${esc(fixed.quote_reference)} · material owned by ${esc(fixed.material_owner)}</p>`:`<label class="field full">Job<select name="job_id"><option value="">Workshop use - consumables only</option>${jobs.map(j=>`<option value="${esc(j.id)}">${esc(j.reference)} · ${esc(j.party)}</option>`).join('')}</select></label>`}
 <label class="field full">Stock item<select name="item_id" required><option value="">Select item</option>${avail.map(i=>itemOption(i,itemId,map)).join('')}</select></label>
 ${field('Quantity','quantity','1','number','required min="0.001" max="1000000" step="0.001"')}${field('Date issued','date',today(),'date',`required max="${today()}"`)}</div>
 <fieldset id="issue-after" class="plainset"><div class="linehead">AFTER CUTTING (OPTIONAL)</div><div class="formgrid">
 ${field('Usable offcut width (mm)','offcut_width','','number','min="1" max="20000" step="1"')}${field('Usable offcut length (mm)','offcut_length','','number','min="1" max="20000" step="1"')}
 ${field('Skeleton / scrap weight (kg)','scrap_kg','','number','min="0" max="1000000" step="0.01"')}</div><p class="help">A usable offcut goes back to stock as a remnant and takes its share of the sheet cost by area. Scrap is weighed into the scrap bin for later sale.</p></fieldset>
 <label class="field" style="margin-top:18px">Notes<textarea name="notes" maxlength="1000"></textarea></label>
 <div class="summary"><span>Material cost to job</span><b id="issue-preview">—</b></div><p class="help" id="issue-help"></p>
 <div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Issue stock</button></div></form>`;
 if(!$('#modal').open)$('#modal').showModal();
 const back=()=>$('#modal').close();$('.close').onclick=$('.cancel').onclick=back;
 const form=$('#issue-form'),f=form.elements;
 // Validates the form and returns the movements it would create, without saving anything.
 const plan=()=>{
  const item=stockById(f.item_id.value);if(!item)throw Error('Choose a stock item.');
  const job=workOrders.find(j=>j.id===f.job_id.value),sheet=['sheet','remnant'].includes(item.category);
  if(!job&&item.category!=='consumable')throw Error('Choose the job this material is for.');
  if(job?.status==='Completed')throw Error('This job is completed. Issue material before completing a job.');
  if(item.owner==='Customer'&&job?.party!==item.customer)throw Error(`This material belongs to ${item.customer} and can only be used on their jobs.`);
  const q=validateQuantity(item,f.quantity.value),b=balanceOf(item.id,stockMoves);if(q>b.qty)throw Error(`Only ${fmtQty(b.qty,item)} of ${item.code} on hand.`);
  const value=item.owner==='Customer'||item.category==='consumable'?0:outValue(b,q);
  let offcut=null,scrap=0;
  if(sheet&&(f.offcut_width.value||f.offcut_length.value))offcut=offcutValue(item,value/q,f.offcut_length.value,f.offcut_width.value);
  if(sheet&&f.scrap_kg.value){scrap=Math.round(Number(f.scrap_kg.value)*100)/100;const kg=(sheetWeightKg(item)||Infinity)*q;if(!(scrap>=0)||scrap>kg)throw Error(`Scrap cannot exceed the ${kg.toFixed(1)} kg issued.`)}
  return {item,job,q,value,offcut,scrap};
 };
 const preview=()=>{const item=stockById(f.item_id.value);$('#issue-after').hidden=!item||!['sheet','remnant'].includes(item.category);try{const p=plan();$('#issue-preview').textContent=money(p.value-(p.offcut?.value||0))+(p.offcut?` · after ${money(p.offcut.value)} offcut credit`:'');$('#issue-help').textContent=p.item.owner==='Customer'?'Customer-owned material: no cost to the job.':p.item.category==='consumable'?'Consumables were expensed when received; this records usage only.':`${fmtQty(p.q,p.item)} at ${money(p.value/p.q)} average cost.`}catch(err){$('#issue-preview').textContent='—';$('#issue-help').textContent=item?err.message:''}};
 form.oninput=preview;form.onchange=preview;preview();
 form.onsubmit=e=>{e.preventDefault();try{
  const {item,job,q,value,offcut,scrap}=plan(),notes=f.notes.value.trim(),date=f.date.value;if(!date||date>today())throw Error('Enter an issue date that is not in the future.');
  const link={job_id:job?.id||'',job_reference:job?.reference||'',party:job?.party||'Workshop use',date};
  const issued=addStockMove({...link,item_id:item.id,type:'issue',quantity:-q,value:-value,notes});
  if(offcut){const rem={id:crypto.randomUUID(),category:'remnant',owner:item.owner,customer:item.customer||'',material:item.material,grade:item.grade||'',thickness_mm:item.thickness_mm,width_mm:offcut.width_mm,length_mm:offcut.length_mm,location:item.location||'',reorder_level:0,source_item_id:item.id,code:nextReference('REM',stockItems,'code'),created_at:new Date().toISOString()};stockItems.push(rem);addStockMove({...link,item_id:rem.id,type:'offcut',quantity:1,value:offcut.value,notes:`From ${item.code}`})}
  if(scrap>0){const bin=scrapBin(item.material);addStockMove({...link,item_id:bin.id,type:'scrap',quantity:scrap,notes:`From ${item.code}`})}
  toast(`${issued.reference}: ${fmtQty(q,item)} issued${job?' to '+job.reference:''}.`);
  $('#modal').close();render();
 }catch(err){$('#stock-error').textContent=err.message}};
}

function countEditor(id){
 const item=stockById(id),b=balanceOf(id,stockMoves);
 $('#modal').innerHTML=`<div class="modalhead"><h2>Stock count · ${esc(item.code)}</h2><button class="close" aria-label="Close">×</button></div><form id="count-form"><p>${esc(itemLabel(item))}</p><p class="help">Recorded on hand: <b>${fmtQty(b.qty,item)}</b>${item.category==='sheet'||item.category==='remnant'?` · ${money(b.value)}`:''}</p><div class="formgrid">
 ${field('Counted quantity','counted',b.qty,'number','required min="0" max="1000000" step="0.001"')}${field('Count date','date',today(),'date',`required max="${today()}"`)}
 ${select('Reason','reason',['Physical count','Damaged','Lost / missing','Measurement correction','Remnant scrapped'],'Physical count')}${field('Notes','notes','','text','maxlength="500"')}</div>
 <div class="summary"><span>Adjustment</span><b id="count-preview">No change</b></div><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Record count</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#count-form'),f=form.elements;
 const plan=()=>{const counted=Number(f.counted.value);if(!Number.isFinite(counted)||counted<0)throw Error('Enter the counted quantity.');if(counted>0)validateQuantity(item,counted);const diff=qty3(counted-b.qty);if(diff===0)return {diff,value:0};
  const valued=item.owner==='Business'&&['sheet','remnant'].includes(item.category);if(!valued)return {diff,value:0};
  if(diff<0)return {diff,value:-outValue(b,-diff)};
  const last=[...stockMoves].reverse().find(m=>m.item_id===id&&m.type==='receipt'),avg=b.qty>0?b.value/b.qty:last?.unit_cost||0;return {diff,value:Math.round(avg*diff*100)/100}};
 form.oninput=()=>{try{const p=plan();$('#count-preview').textContent=p.diff===0?'No change':`${p.diff>0?'+':''}${fmtQty(p.diff,item)}${p.value?' · '+money(p.value):''}`;$('#stock-error').textContent=''}catch(err){$('#stock-error').textContent=err.message}};
 form.onsubmit=e=>{e.preventDefault();try{if(f.date.value>today())throw Error('The count date cannot be in the future.');const p=plan();if(p.diff===0)throw Error('The count matches the recorded quantity. Nothing to adjust.');const m=addStockMove({item_id:id,type:'adjust',date:f.date.value,quantity:p.diff,value:p.value,party:item.customer||'',notes:[f.reason.value,f.notes.value.trim()].filter(Boolean).join(' - ')});$('#modal').close();render();toast(`${m.reference}: ${item.code} adjusted by ${p.diff>0?'+':''}${fmtQty(p.diff,item)}.${p.value?' Post it in Accounts → Journal.':''}`)}catch(err){$('#stock-error').textContent=err.message}};
}

function disposeEditor(id){
 const item=stockById(id),b=balanceOf(id,stockMoves),scrap=item.category==='scrap';
 $('#modal').innerHTML=`<div class="modalhead"><h2>${scrap?'Dispose of scrap without a sale':'Return material to customer'} · ${esc(item.code)}</h2><button class="close" aria-label="Close">×</button></div><form id="dispose-form"><p class="help">On hand: <b>${fmtQty(b.qty,item)}</b>${scrap?'':' · '+esc(item.customer)}</p><div class="formgrid">
 ${field(scrap?'Weight (kg)':'Quantity returned','quantity',b.qty,'number','required min="0.001" max="1000000" step="0.001"')}${field('Date','date',today(),'date',`required max="${today()}"`)}
 ${field(scrap?'Reason / gate pass':'Notes / gate pass','notes','','text','maxlength="500"')}</div>
 <p class="help">${scrap?'For scrap that is thrown away or given away. To sell scrap, use Sell scrap in the scrap yard.':'Customer material is not valued, so nothing is posted.'}</p><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">${scrap?'Record disposal':'Record return'}</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#dispose-form'),f=form.elements;
 form.onsubmit=e=>{e.preventDefault();try{
  const q=validateQuantity(item,f.quantity.value);if(q>b.qty)throw Error(`Only ${fmtQty(b.qty,item)} on hand.`);if(f.date.value>today())throw Error('The date cannot be in the future.');
  const m=addStockMove({item_id:id,type:'dispose',date:f.date.value,quantity:-q,party:scrap?'':item.customer,notes:f.notes.value.trim()});
  $('#modal').close();render();toast(`${m.reference} recorded.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}

function stockHistory(id){
 const item=stockById(id),b=balanceOf(id,stockMoves),kg=sheetWeightKg(item);let qty=0,value=0;
 const rows=stockMoves.filter(m=>m.item_id===id).map(m=>{qty=qty3(qty+Number(m.quantity));value=Math.round(value*100+Number(m.value)*100)/100;return {m,qty,value}}).reverse();
 $('#modal').innerHTML=`<div class="modalhead"><h2>${esc(item.code)}</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody"><p><b>${esc(itemLabel(item))}</b></p><p class="help">${esc(categoryLabels[item.category])} · ${item.owner==='Customer'?'Owned by '+esc(item.customer):'Business stock'}${item.location?' · '+esc(item.location):''}${kg?` · ${kg} kg per piece`:''}</p><div class="summary"><span>On hand ${fmtQty(b.qty,item)}${kgText(item,b.qty)?' · '+kgText(item,b.qty):''}</span><b>${money(b.value)}${b.qty>0&&b.value?' · avg '+money(b.avg):''}</b></div>${rows.length?`<div class="tablewrap" style="margin-top:18px"><table><thead><tr><th>DATE / REF</th><th>MOVEMENT</th><th class="money">QTY</th><th class="money">BALANCE</th><th class="money">VALUE</th></tr></thead><tbody>${rows.map(({m,qty,value})=>`<tr><td>${esc(m.date)}<small>${esc(m.reference)}</small></td><td>${moveLabels[m.type]}<small>${esc([m.job_reference,m.po_reference,m.party,m.doc_reference,m.notes].filter(Boolean).join(' · '))}</small></td><td class="money">${Number(m.quantity)>0?'+':''}${fmtQty(m.quantity,item)}</td><td class="money">${fmtQty(qty,item)}</td><td class="money">${money(value)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="help">No movements yet.</p>'}</div>`;
 $('#modal').showModal();$('.close').onclick=()=>$('#modal').close();
}


// HR: employees, daily attendance, salary advances and monthly payroll (local workspace only).
// A finalised payroll locks that month's attendance and is corrected with journal entries.
let hrTab='employees',attDate=today(),payMonth=today().slice(0,7);
const empById=id=>employees.find(e=>e.id===id);
const byEmpCode=(a,b)=>String(a.code).localeCompare(String(b.code));
const monthName=m=>new Date(m+'-01T00:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});
const monthLocked=month=>payrolls.some(r=>r.month===month&&r.status!=='Draft');
const hrPosted=(kind,id)=>journals.some(j=>j.source_kind===kind&&j.source_id===id);
const payLabel=e=>e.pay_type==='Daily'?`${money(e.rate)} / day`:`${money(e.rate)} / month`;
function hrQueue(){return [...advances.map(a=>({...a,source_kind:'advance',label:`${a.reference} · Salary advance`,party:empById(a.employee_id)?.name||''})),...payrolls.filter(r=>r.status!=='Draft').map(r=>({...r,source_kind:'payroll',label:`${r.reference} · Payroll ${monthName(r.month)}`,date:r.finalised_date,amount:payrollTotals(r.lines).gross,party:`${r.lines.length} employees`})),...payrolls.filter(r=>r.status==='Paid').map(r=>({...r,source_kind:'salary',label:`${r.reference} · Salaries paid`,date:r.paid_date,amount:payrollTotals(r.lines).net,party:r.paid_method}))]}

function hrPage(){
 const head=`<div class="heading"><div><div class="eyebrow">PEOPLE & WORKSHOP</div><h1>HR</h1><p class="sub">Employees, attendance, salary advances and monthly payroll.</p></div>${session?'':'<div class="row"><button id="hr-new-employee">＋ Employee</button><button class="primary" id="hr-mark-today">Mark today’s attendance</button></div>'}</div>`;
 if(session)return head+'<section class="card"><div class="cardbody"><p>HR is available in the local workspace only for now.</p><p class="help">Cloud tables for staff records have not been set up yet. Sign out to use HR with your local records.</p></div></section>';
 const active=employees.filter(e=>employedOn(e,today())),doc=attendance.find(d=>d.date===today())?.entries||{},marked=active.filter(e=>doc[e.id]),present=marked.filter(e=>['P','H'].includes(doc[e.id].status));
 const owed=employees.reduce((n,e)=>n+Math.round(advanceBalance(e.id,advances,payrolls)*100),0)/100;
 return `${head}${notice()}<div class="stats">${stat('Active staff',String(active.length),`${active.filter(e=>e.cost_type==='production').length} production · ${active.filter(e=>e.cost_type==='office').length} office`,'hr')}${stat('Present today',`${present.length} / ${active.length}`,`${marked.length} of ${active.length} marked`,'workorders')}${stat('Monthly salaries',money(active.filter(e=>e.pay_type==='Monthly').reduce((n,e)=>n+Number(e.rate),0)),'Fixed salaries, before overtime and daily wages','accounts')}${stat('Advances outstanding',money(owed),'To recover through payroll','accounts')}</div>
 ${active.length&&marked.length<active.length&&!monthLocked(today().slice(0,7))?`<div class="notice"><span><b>Attendance:</b> ${active.length-marked.length} of ${active.length} staff not marked for today.</span><button data-hr-today>Mark attendance ↗</button></div>`:''}
 <div class="sectionlinks">${[['employees','Employees',employees.length],['attendance','Attendance',''],['advances','Advances',advances.length],['payroll','Payroll',payrolls.length]].map(([k,l,n])=>`<button data-hr-tab="${k}" class="${hrTab===k?'selected':''}">${l} <span class="fine">&nbsp;${n}</span></button>`).join('')}</div>
 ${hrTab==='attendance'?attendanceTab():hrTab==='advances'?advancesTab():hrTab==='payroll'?payrollTab():employeesTab()}`;
}
function bindHR(){
 if(session)return;
 $('#hr-new-employee').onclick=()=>employeeEditor();
 $$('[data-hr-today],#hr-mark-today').forEach(b=>b.onclick=()=>{hrTab='attendance';attDate=today();render()});
 $$('[data-hr-tab]').forEach(b=>b.onclick=()=>{hrTab=b.dataset.hrTab;render()});
 $$('[data-employee]').forEach(b=>b.onclick=()=>employeeEditor(b.dataset.employee));
 if(hrTab==='attendance')bindAttendance();
 if($('#hr-new-advance'))$('#hr-new-advance').onclick=advanceEditor;
 $$('[data-advance-delete]').forEach(b=>b.onclick=()=>deleteAdvance(b.dataset.advanceDelete));
 if($('#pay-prepare'))$('#pay-prepare').onclick=preparePayroll;
 $$('[data-payroll]').forEach(b=>b.onclick=()=>payrollEditor(b.dataset.payroll));
 if($('#employee-search'))$('#employee-search').oninput=e=>{$('#employee-rows').innerHTML=employeeTable(e.target.value);$$('[data-employee]').forEach(b=>b.onclick=()=>employeeEditor(b.dataset.employee))};
}

function employeesTab(){return `<section class="card"><div class="toolbar"><input id="employee-search" class="search" type="search" placeholder="Search name, code, role or phone…" aria-label="Search employees"></div><div id="employee-rows">${employeeTable('')}</div></section><p class="help">Production staff post to Direct Labour (5201); office staff to Administration Salaries (6101). Employee details, including CNIC and bank account, are stored in this browser and included in backups. Keep backups somewhere private.</p>`}
function employeeTable(term){
 const t=term.trim().toLowerCase(),year=today().slice(0,4);
 const rows=employees.filter(e=>`${e.code} ${e.name} ${e.role} ${e.phone||''}`.toLowerCase().includes(t)).sort((a,b)=>(a.status==='Left')-(b.status==='Left')||byEmpCode(a,b));
 if(!rows.length)return `<div class="empty">${t?'No matching employees.':'No employees yet. Add your laser operators, helpers, designers and office staff with ＋ Employee.'}</div>`;
 return `<div class="tablewrap"><table><thead><tr><th>EMPLOYEE</th><th>TYPE</th><th class="money">PAY</th><th>JOINED</th><th class="money">PAID LEAVE ${year}</th><th class="money">ADVANCE DUE</th><th>STATUS</th><th></th></tr></thead><tbody>${rows.map(e=>{const owed=advanceBalance(e.id,advances,payrolls);return `<tr><td class="ref">${esc(e.code)}<small>${esc(e.name)} · ${esc(e.role)}</small></td><td>${e.cost_type==='production'?'Production':'Office'}<small>${e.pay_type==='Daily'?'Daily wage':'Monthly salary'}</small></td><td class="money">${payLabel(e)}${Number(e.ot_rate)?`<small>OT ${money(e.ot_rate)} / h</small>`:''}</td><td>${esc(e.join_date)}${e.leave_date?`<small>Left ${esc(e.leave_date)}</small>`:''}</td><td class="money">${leaveTaken(e,year,attendance)} of ${Number(e.annual_leave||0)} days</td><td class="money">${owed?money(owed):'—'}</td><td>${badge(e.status==='Left'?'Left':'Active')}</td><td><button class="textbutton" data-employee="${esc(e.id)}">Edit</button></td></tr>`}).join('')}</tbody></table></div>`;
}
function employeeEditor(id){
 const e=empById(id)||{cost_type:'production',pay_type:'Monthly',role:roles[0],status:'Active',join_date:today(),annual_leave:14,ot_rate:0};
 const used=!!id&&(attendance.some(d=>d.entries?.[id])||advances.some(a=>a.employee_id===id)||payrolls.some(r=>r.lines.some(l=>l.employee_id===id)));
 const opt=(list,value)=>list.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('');
 $('#modal').innerHTML=`<div class="modalhead"><h2>${id?'Edit employee · '+esc(e.code):'New employee'}</h2><button class="close" aria-label="Close">×</button></div><form id="employee-form"><div class="formgrid">
 ${field('Full name','name',e.name||'','text','required maxlength="150"')}${field('CNIC (optional)','cnic',e.cnic||'','text','maxlength="15" placeholder="12345-1234567-1" pattern="\\d{5}-\\d{7}-\\d"')}
 ${field('Phone','phone',e.phone||'','tel','maxlength="40"')}<label class="field">Role<select name="role">${opt(roles.map(r=>[r,r]),e.role)}</select></label>
 <label class="field">Staff type<select name="cost_type">${opt(Object.entries(costTypes),e.cost_type)}</select></label><label class="field">Pay basis<select name="pay_type">${opt([['Monthly','Monthly salary'],['Daily','Daily wage']],e.pay_type)}</select></label>
 ${field(e.pay_type==='Daily'?'Daily wage (PKR)':'Monthly salary (PKR)','rate',e.rate||'','number','required min="1" max="10000000" step="0.01"')}${field('Overtime rate per hour (PKR)','ot_rate',e.ot_rate||0,'number','min="0" max="100000" step="0.01"')}
 <p class="help full" id="ot-hint"></p>
 ${field('Joining date','join_date',e.join_date,'date','required')}${field('Paid leave days per year','annual_leave',e.annual_leave??14,'number','min="0" max="60" step="1"')}
 <label class="field">Status<select name="status">${opt([['Active','Active'],['Left','Left']],e.status)}</select></label>${field('Leaving date','leave_date',e.leave_date||'','date')}
 ${field('Bank account / IBAN (optional)','bank_account',e.bank_account||'','text','maxlength="40"')}${field('Emergency contact','emergency',e.emergency||'','text','maxlength="150"')}
 <label class="field full">Notes<textarea name="notes" maxlength="2000">${esc(e.notes||'')}</textarea></label></div>
 <div id="hr-error" class="error" role="alert"></div><div class="actions">${id&&!used?'<button type="button" class="danger" id="employee-delete">Delete</button>':''}<button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save employee</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#employee-form'),f=form.elements;
 const hint=()=>{const r=Number(f.rate.value),hourly=f.pay_type.value==='Daily'?r/8:r/30/8;f.rate.closest('label').firstChild.textContent=f.pay_type.value==='Daily'?'Daily wage (PKR)':'Monthly salary (PKR)';$('#ot-hint').textContent=r>0?`Ordinary hourly rate ≈ ${money(Math.round(hourly*100)/100)} (${f.pay_type.value==='Daily'?'wage ÷ 8 hours':'salary ÷ 30 days ÷ 8 hours'}). Many workshops pay overtime at double the ordinary rate; check the labour law that applies to you.`:''};
 form.oninput=hint;f.pay_type.onchange=hint;hint();
 f.status.onchange=()=>{if(f.status.value==='Left'&&!f.leave_date.value)f.leave_date.value=today();if(f.status.value==='Active')f.leave_date.value=''};
 if($('#employee-delete'))$('#employee-delete').onclick=()=>{employees=employees.filter(x=>x.id!==id);$('#modal').close();render();toast(`${e.code} deleted.`)};
 form.onsubmit=ev=>{ev.preventDefault();try{
  const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v).trim()]));
  const next={...e,...data,id:e.id||crypto.randomUUID(),rate:Number(data.rate),ot_rate:Number(data.ot_rate||0),annual_leave:Number(data.annual_leave||0),leave_date:data.status==='Left'?data.leave_date:'',created_at:e.created_at||new Date().toISOString()};
  validateEmployee(next,employees);
  if(used&&(next.join_date>e.join_date))throw Error('The joining date cannot move later once attendance or pay is recorded.');
  if(!next.code)next.code=nextReference('EMP',employees,'code');
  employees=id?employees.map(x=>x.id===id?next:x):[...employees,next];
  hrTab='employees';$('#modal').close();render();toast(id?`${next.code} updated.`:`${next.code} ${next.name} added.`);
 }catch(err){$('#hr-error').textContent=err.message}};
}

function attendanceTab(){
 const month=attDate.slice(0,7),locked=monthLocked(month),staff=employees.filter(e=>employedOn(e,attDate)).sort(byEmpCode),entries=attendance.find(d=>d.date===attDate)?.entries||{};
 const monthStaff=employees.filter(e=>employedIn(e,month)).sort(byEmpCode);
 return `<section class="card"><form id="att-form"><div class="toolbar"><label class="row">Date <input id="att-date" type="date" value="${esc(attDate)}" max="${today()}" required></label><div class="row">${locked?'':'<button type="button" id="att-all">Mark unmarked as present</button><button type="submit" class="primary">Save attendance</button>'}</div></div>
 ${locked?`<p class="help" style="padding:0 24px">Payroll for ${monthName(month)} is finalised, so attendance for that month is locked.</p>`:''}
 ${staff.length?`<div class="tablewrap"><table class="att-table"><thead><tr><th>EMPLOYEE</th><th>STATUS</th><th>OVERTIME (HOURS)</th></tr></thead><tbody>${staff.map(e=>{const x=entries[e.id]||{};return `<tr><td class="ref">${esc(e.code)}<small>${esc(e.name)} · ${esc(e.role)}</small></td><td><select data-att-status="${esc(e.id)}" aria-label="Attendance for ${esc(e.name)}" ${locked?'disabled':''}><option value="">Not marked</option>${Object.entries(attendanceCodes).map(([c,l])=>`<option value="${c}" ${x.status===c?'selected':''}>${l}</option>`).join('')}</select></td><td><input data-att-ot="${esc(e.id)}" type="number" min="0" max="16" step="0.25" value="${x.ot||''}" placeholder="0" aria-label="Overtime hours for ${esc(e.name)}" ${locked?'disabled':''}></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No employees were employed on this date.</div>'}
 <div id="hr-error" class="error" role="alert" style="padding:0 24px"></div></form></section>
 <section class="card" style="margin-top:24px"><div class="cardhead"><div><h2>${monthName(month)} summary</h2><p class="sub" style="margin-top:6px">Days by status for the month of the selected date.</p></div>${monthStaff.length?'<button id="att-csv">Export CSV</button>':''}</div>${monthStaff.length?`<div class="tablewrap"><table><thead><tr><th>EMPLOYEE</th>${['P','H','A','L','U','O'].map(c=>`<th class="money">${attendanceCodes[c].toUpperCase()}</th>`).join('')}<th class="money">NOT MARKED</th><th class="money">OT HOURS</th></tr></thead><tbody>${monthStaff.map(e=>{const s=attendanceSummary(e,month,attendance);return `<tr><td class="ref">${esc(e.code)}<small>${esc(e.name)}</small></td>${['P','H','A','L','U','O'].map(c=>`<td class="money">${s[c]||'—'}</td>`).join('')}<td class="money">${s.unmarked?`<span class="late">${s.unmarked}</span>`:'—'}</td><td class="money">${s.ot||'—'}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No staff employed this month.</div>'}</section>
 <p class="help">Unmarked days count as worked for monthly staff and unpaid for daily-wage staff when payroll is prepared. Mark weekly offs and public holidays as “Weekly off / holiday”: they are paid for monthly staff and unpaid for daily-wage staff.</p>`;
}
function bindAttendance(){
 $('#att-date').onchange=e=>{if(e.target.value&&e.target.value<=today()){attDate=e.target.value;render()}};
 if($('#att-csv'))$('#att-csv').onclick=()=>{const month=attDate.slice(0,7),rows=employees.filter(e=>employedIn(e,month)).sort(byEmpCode);downloadCSV(`sutluj-attendance-${month}.csv`,[['Month','Code','Employee',...Object.values(attendanceCodes),'Not marked','Overtime hours'],...rows.map(e=>{const s=attendanceSummary(e,month,attendance);return [month,e.code,e.name,s.P,s.H,s.A,s.L,s.U,s.O,s.unmarked,s.ot]})]);toast(`Exported attendance for ${rows.length} staff.`)};
 if(!$('#att-all'))return;
 $('#att-all').onclick=()=>$$('[data-att-status]').forEach(s=>{if(!s.value)s.value='P'});
 $('#att-form').onsubmit=e=>{e.preventDefault();try{
  if(monthLocked(attDate.slice(0,7)))throw Error('Payroll for this month is finalised; attendance is locked.');
  const entries={};
  for(const s of $$('[data-att-status]')){const id=s.dataset.attStatus,ot=Number($(`[data-att-ot="${id}"]`).value||0),name=empById(id).name;
   if(!Number.isFinite(ot)||ot<0||ot>16)throw Error(`${name}: overtime must be between 0 and 16 hours.`);
   if(ot&&!['P','H'].includes(s.value))throw Error(`${name}: overtime needs Present or Half day.`);
   if(s.value)entries[id]={status:s.value,...(ot?{ot}:{})};}
  attendance=[...attendance.filter(d=>d.date!==attDate),...(Object.keys(entries).length?[{id:attDate,date:attDate,entries}]:[])];
  render();toast(`Attendance saved for ${attDate}: ${Object.keys(entries).length} of ${$$('[data-att-status]').length} marked.`);
 }catch(err){$('#hr-error').textContent=err.message}};
}

function advancesTab(){
 const rows=[...advances].sort((a,b)=>b.date.localeCompare(a.date)||b.reference.localeCompare(a.reference));
 return `<section class="card"><div class="cardhead"><div><h2>Salary advances</h2><p class="sub" style="margin-top:6px">Cash given ahead of payday, recovered through payroll.</p></div><button class="primary" id="hr-new-advance">＋ Advance</button></div>${rows.length?`<div class="tablewrap"><table><thead><tr><th>REFERENCE</th><th>EMPLOYEE</th><th class="money">AMOUNT</th><th>PAID FROM</th><th>ACCOUNTS</th><th></th></tr></thead><tbody>${rows.map(a=>{const e=empById(a.employee_id),posted=hrPosted('advance',a.id);return `<tr><td class="ref">${esc(a.reference)}<small>${esc(a.date)}</small></td><td>${esc(e?.name)}<small>${esc(e?.code)}${a.notes?' · '+esc(a.notes):''}</small></td><td class="money">${money(a.amount)}</td><td>${esc(a.method)}</td><td>${posted?badge('Posted'):badge('Pending')}</td><td>${posted?'':`<button class="textbutton danger" data-advance-delete="${esc(a.id)}">Delete</button>`}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No advances recorded.</div>'}</section><p class="help">Post advances in Accounts → Journal (Dr Staff Advances 1102, Cr cash/bank). Recover them in payroll; the Employees tab shows each balance.</p>`;
}
function advanceEditor(){
 const staff=employees.filter(e=>employedOn(e,today())).sort(byEmpCode);if(!staff.length){toast('Add an active employee first.');return}
 $('#modal').innerHTML=`<div class="modalhead"><h2>Salary advance</h2><button class="close" aria-label="Close">×</button></div><form id="advance-form"><div class="formgrid"><label class="field full">Employee<select name="employee_id" required><option value="">Select employee</option>${staff.map(e=>`<option value="${esc(e.id)}">${esc(e.code)} · ${esc(e.name)} · ${payLabel(e)}${advanceBalance(e.id,advances,payrolls)?' · owes '+money(advanceBalance(e.id,advances,payrolls)):''}</option>`).join('')}</select></label>
 ${field('Date','date',today(),'date',`required max="${today()}"`)}${field('Amount (PKR)','amount','','number','required min="1" max="10000000" step="0.01"')}${select('Paid from','method',Object.keys(payAccounts),'Cash on Hand')}${field('Notes','notes','','text','maxlength="300"')}</div>
 <div id="hr-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Record advance</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 $('#advance-form').onsubmit=ev=>{ev.preventDefault();try{const f=Object.fromEntries(new FormData(ev.target)),e=empById(f.employee_id);if(!e)throw Error('Choose an employee.');const amount=Math.round(Number(f.amount)*100)/100;if(!(amount>0))throw Error('Enter the advance amount.');if(f.date>today()||!employedOn(e,f.date))throw Error('The date must be while the employee is employed and not in the future.');
  const a={id:crypto.randomUUID(),reference:nextReference('ADV',advances),employee_id:e.id,date:f.date,amount,method:f.method,notes:f.notes.trim(),created_at:new Date().toISOString()};advances.push(a);hrTab='advances';$('#modal').close();render();toast(`${a.reference}: ${money(amount)} advance to ${e.name}. Post it in Accounts → Journal.`)}catch(err){$('#hr-error').textContent=err.message}};
}
function deleteAdvance(id){const a=advances.find(x=>x.id===id);if(!a||hrPosted('advance',id))return;if(advanceBalance(a.employee_id,advances.filter(x=>x.id!==id),payrolls)<0){toast('This advance has already been recovered in payroll and cannot be deleted.');return}advances=advances.filter(x=>x.id!==id);render();toast(`${a.reference} deleted.`)}

function payrollTab(){
 const runs=[...payrolls].sort((a,b)=>b.month.localeCompare(a.month));
 return `<section class="card"><div class="toolbar"><label class="row">Month <input id="pay-month" type="month" value="${esc(payMonth)}" max="${today().slice(0,7)}"></label><button class="primary" id="pay-prepare">Prepare payroll</button></div>${runs.length?`<div class="tablewrap"><table><thead><tr><th>PAYROLL</th><th>STATUS</th><th class="money">STAFF</th><th class="money">GROSS</th><th class="money">NET PAY</th><th></th></tr></thead><tbody>${runs.map(r=>{const lines=r.status==='Draft'?draftLines(r).map(x=>x.line):r.lines,t=payrollTotals(lines);return `<tr><td class="ref">${esc(r.reference)}<small>${monthName(r.month)}</small></td><td>${badge(r.status)}${r.paid_date?`<small>Paid ${esc(r.paid_date)}</small>`:''}</td><td class="money">${lines.length}</td><td class="money">${money(t.gross)}</td><td class="money">${money(t.net)}</td><td><button class="textbutton" data-payroll="${esc(r.id)}">Open</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No payrolls yet. Choose a month and prepare its payroll.</div>'}</section><p class="help">Draft → Finalise (locks the month’s attendance and posts wages to Salaries Payable) → Record payment (settles Salaries Payable from cash or bank). Download payslips once finalised.</p>`;
}
// Current figures for a draft, from attendance, advances and the amounts typed into the draft.
function draftLines(run){return employees.filter(e=>employedIn(e,run.month)).sort(byEmpCode).map(e=>{const s=attendanceSummary(e,run.month,attendance),due=advanceBalance(e.id,advances,payrolls,run.id),inputs=run.inputs?.[e.id]||{};try{return {e,due,line:payrollLine(e,s,inputs,due)}}catch(err){return {e,due,error:err.message,line:payrollLine(e,s,{},due)}}})}
function preparePayroll(){
 const month=$('#pay-month').value;if(!month||month>today().slice(0,7)){toast('Choose a month up to the current month.');return}
 payMonth=month;const existing=payrolls.find(r=>r.month===month);if(existing){payrollEditor(existing.id);return}
 if(!employees.some(e=>employedIn(e,month))){toast(`No employees were employed in ${monthName(month)}.`);return}
 const run={id:crypto.randomUUID(),reference:`PAY-${month}`,month,status:'Draft',inputs:{},lines:[],created_at:new Date().toISOString()};payrolls.push(run);hrTab='payroll';render();payrollEditor(run.id);
}
function payrollEditor(id){
 const run=payrolls.find(r=>r.id===id);if(!run)return;const draft=run.status==='Draft';
 const rows=draft?draftLines(run):run.lines.map(line=>({e:empById(line.employee_id),line,due:0}));
 const days=l=>{const d=l.days;return `${l.paid_days} paid<small>${['P','H','A','L','U','O'].filter(c=>d[c]).map(c=>`${c} ${d[c]}`).join(' · ')}${d.unmarked?` · <span class="late">${d.unmarked} not marked</span>`:''}</small>`};
 const num=(empId,field,value,extra='')=>`<input class="pay-input" data-emp="${esc(empId)}" data-field="${field}" type="number" min="0" step="0.01" value="${value||''}" placeholder="0" ${extra}>`;
 const t=payrollTotals(rows.map(r=>r.line)),unmarked=rows.filter(r=>r.line.days.unmarked).length;
 $('#modal').innerHTML=`<div class="modalhead"><h2>${esc(run.reference)} · ${monthName(run.month)}</h2><button class="close" aria-label="Close">×</button></div><form id="payroll-form" class="payroll"><p>${badge(run.status)} ${run.finalised_date?`<span class="fine">Finalised ${esc(run.finalised_date)}</span>`:''} ${run.paid_date?`<span class="fine"> · Paid ${esc(run.paid_date)} from ${esc(run.paid_method)}</span>`:''}</p>
 ${draft&&unmarked?`<div class="notice"><span>${unmarked} employee${unmarked===1?' has':'s have'} days not marked. Monthly staff are paid for those days; daily-wage staff are not. Mark attendance first if that is wrong.</span></div>`:''}
 <div class="tablewrap"><table class="pay-table"><thead><tr><th>EMPLOYEE</th><th>DAYS</th><th class="money">EARNED</th><th class="money">OVERTIME</th><th class="money">BONUS</th><th class="money">GROSS</th><th class="money">ADVANCE</th><th class="money">OTHER DEDUCTIONS</th><th class="money">NET PAY</th>${draft?'':'<th></th>'}</tr></thead><tbody>${rows.map(({e,line:l,due,error})=>`<tr data-row="${esc(l.employee_id)}"><td class="ref">${esc(l.code)}<small>${esc(l.name)} · ${l.pay_type==='Daily'?money(l.rate)+'/day':money(l.rate)+'/month'}</small>${error?`<small class="late">${esc(error)}</small>`:''}</td><td>${days(l)}</td><td class="money">${money(l.basic-l.absence)}${l.absence?`<small>after ${money(l.absence)} unpaid days</small>`:''}</td><td class="money">${l.ot_pay?money(l.ot_pay):'—'}${l.ot_hours?`<small>${l.ot_hours} h</small>`:''}</td><td class="money">${draft?num(l.employee_id,'bonus',run.inputs?.[l.employee_id]?.bonus):l.bonus?money(l.bonus):'—'}</td><td class="money" data-cell="gross">${money(l.gross)}</td><td class="money">${draft?num(l.employee_id,'advance',run.inputs?.[l.employee_id]?.advance,`max="${due}"`)+(due?`<small>due ${money(due)}</small>`:''):l.advance?money(l.advance):'—'}</td><td class="money">${draft?num(l.employee_id,'deductions',run.inputs?.[l.employee_id]?.deductions)+`<input class="pay-input pay-note" data-emp="${esc(l.employee_id)}" data-field="deduction_note" type="text" maxlength="60" placeholder="e.g. income tax, EOBI" value="${esc(run.inputs?.[l.employee_id]?.deduction_note||'')}">`:l.deductions?`${money(l.deductions)}<small>${esc(l.deduction_note)}</small>`:'—'}</td><td class="money" data-cell="net"><b>${money(l.net)}</b></td>${draft?'':`<td><button type="button" class="textbutton" data-payslip="${esc(l.employee_id)}">Payslip</button></td>`}</tr>`).join('')}</tbody><tfoot><tr><td><b>Total</b></td><td></td><td></td><td></td><td></td><td class="money"><b id="pay-gross">${money(t.gross)}</b></td><td class="money"><b>${money(t.advance)}</b></td><td class="money"><b>${money(t.deductions)}</b></td><td class="money"><b id="pay-net">${money(t.net)}</b></td>${draft?'':'<td></td>'}</tr></tfoot></table></div>
 ${run.status==='Finalised'?`<div class="formgrid" style="margin-top:18px">${field('Payment date','paid_date',today(),'date',`min="${run.month}-01" max="${today()}"`)}${select('Paid from','paid_method',Object.keys(payAccounts),'Business Bank Account')}</div>`:''}
 <p class="help">${draft?'Bonus, advance recovery and other deductions are saved with the draft. Earned pay and overtime come from attendance and update when attendance changes.':run.status==='Finalised'?'Finalised: figures are fixed. Record the payment once net pay has been handed over or transferred.':'Paid. Corrections need a journal entry.'}</p>
 <div id="hr-error" class="error" role="alert"></div><div class="actions">${draft?'<button type="button" class="danger" id="pay-delete">Delete draft</button><button type="button" class="cancel">Close</button><button type="submit" name="action" value="save">Save draft</button><button type="submit" name="action" value="finalise" class="primary" id="pay-finalise">Finalise payroll</button>':run.status==='Finalised'?'<button type="button" class="cancel">Close</button><button type="submit" name="action" value="pay" class="primary">Record payment</button>':'<button type="button" class="cancel">Close</button>'}</div></form>`;
 if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 $$('[data-payslip]').forEach(b=>b.onclick=()=>downloadPayslip(run,b.dataset.payslip,b));
 if(!draft){$('#payroll-form').onsubmit=ev=>{ev.preventDefault();try{const f=new FormData(ev.target),date=f.get('paid_date');if(!date||date>today()||date<run.month+'-01')throw Error('Enter a payment date from the payroll month up to today.');Object.assign(run,{status:'Paid',paid_date:date,paid_method:f.get('paid_method')});render();payrollEditor(id);toast(`${run.reference} marked paid. Post it in Accounts → Journal.`)}catch(err){$('#hr-error').textContent=err.message}};return}
 const readInputs=()=>{const inputs={};$$('.pay-input').forEach(i=>{const x=inputs[i.dataset.emp]??={};if(i.value!=='')x[i.dataset.field]=i.dataset.field==='deduction_note'?i.value:Number(i.value)});return inputs};
 $('#payroll-form').oninput=ev=>{const empId=ev.target.dataset?.emp;if(!empId)return;const e=empById(empId),inputs=readInputs(),due=advanceBalance(empId,advances,payrolls,run.id);let line;try{line=payrollLine(e,attendanceSummary(e,run.month,attendance),inputs[empId]||{},due);$('#hr-error').textContent=''}catch(err){$('#hr-error').textContent=err.message;return}const row=$(`[data-row="${empId}"]`);row.querySelector('[data-cell=gross]').textContent=money(line.gross);row.querySelector('[data-cell=net]').innerHTML=`<b>${money(line.net)}</b>`;const all=draftLines({...run,inputs}).map(r=>r.line),tt=payrollTotals(all);$('#pay-gross').textContent=money(tt.gross);$('#pay-net').textContent=money(tt.net)};
 $('#pay-delete').onclick=()=>{payrolls=payrolls.filter(r=>r.id!==id);$('#modal').close();render();toast(`${run.reference} draft deleted.`)};
 $('#payroll-form').onsubmit=ev=>{ev.preventDefault();try{
  run.inputs=readInputs();
  if(ev.submitter.value==='save'){render();payrollEditor(id);toast('Payroll draft saved.');return}
  const confirmBtn=$('#pay-finalise');if(confirmBtn.dataset.confirm!=='yes'){confirmBtn.dataset.confirm='yes';confirmBtn.textContent='Confirm: finalise and lock';$('#hr-error').textContent=`Finalising fixes these figures and locks ${monthName(run.month)} attendance. Click again to confirm.`;return}
  const lines=draftLines(run),bad=lines.find(r=>r.error);if(bad)throw Error(bad.error);
  const t=payrollTotals(lines.map(r=>r.line));if(!(t.gross>0))throw Error('There is nothing to pay for this month.');
  const end=`${run.month}-${String(monthDays(run.month)).padStart(2,'0')}`;
  Object.assign(run,{status:'Finalised',lines:lines.map(r=>r.line),finalised_date:end<today()?end:today()});
  render();payrollEditor(id);toast(`${run.reference} finalised: net pay ${money(t.net)}. Post it in Accounts → Journal.`);
 }catch(err){$('#hr-error').textContent=err.message}};
}
async function downloadPayslip(run,empId,button){
 const line=run.lines.find(l=>l.employee_id===empId);if(!line)return;button.disabled=true;button.textContent='Preparing…';
 try{const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createPayslipPDF(run,line,empById(empId),new Uint8Array(await response.arrayBuffer()),window.PDFLib,{advanceBalance:advanceBalance(empId,advances,payrolls)});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`Sutluj-Payslip-${line.code}-${run.month}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Payslip downloaded.');
 }catch(err){$('#hr-error').textContent=err.message||'Could not create the payslip.'}finally{button.disabled=false;button.textContent='Payslip'}
}

// Quotations: list overview, status chips, quick PDF and duplicate, company letterhead and default terms.
function quoteState(r){return r.kind==='quote'&&['Draft','Sent'].includes(r.status)&&r.valid_until&&r.valid_until<today()?'Expired':r.status}
function daysUntil(date){return Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(today()+'T00:00:00Z'))/86400000)}
function quoteSummary(){
 const quotes=records.filter(r=>r.kind==='quote'),sum=list=>list.reduce((n,r)=>n+Number(r.amount),0),year=today().slice(0,4);
 const open=quotes.filter(r=>['Draft','Sent'].includes(quoteState(r))),won=quotes.filter(r=>r.status==='Accepted'&&r.date.startsWith(year)),decided=quotes.filter(r=>['Accepted','Declined'].includes(r.status));
 const expiring=open.filter(r=>r.valid_until&&daysUntil(r.valid_until)<=7);
 const chips=['All','Draft','Sent','Accepted','Declined','Expired'].map(s=>{const n=s==='All'?quotes.length:quotes.filter(r=>quoteState(r)===s).length;return `<button class="chip ${filter===s?'selected':''}" data-quote-filter="${s}">${s} <span>${n}</span></button>`}).join('');
 return `<div class="stats">${stat('Open quotations',money(sum(open)),`${open.length} awaiting a decision`,'sales')}${stat(`Won in ${year}`,money(sum(won)),`${won.length} accepted`,'sales')}${stat('Win rate',decided.length?Math.round(decided.filter(r=>r.status==='Accepted').length/decided.length*100)+'%':'—',`${decided.length} decided quotations`,'accounts')}${stat('Expiring within 7 days',String(expiring.length),expiring.length?`Follow up ${expiring.slice(0,2).map(r=>esc(r.reference)).join(', ')}`:'Nothing needs chasing','sales')}</div><div class="chips" role="group" aria-label="Filter quotations by status">${chips}</div>`;
}
function quoteProgress(r){
 const job=workOrders.find(j=>j.quote_id===r.id),inv=invoices.find(i=>i.quote_id===r.id);
 if(inv)return `Invoiced<small>${esc(inv.reference)} · ${esc(invoiceStatus(inv,payments,today()))}</small>`;
 if(job)return `${job.status==='Completed'?'Job completed':'In production'}<small>${esc(job.reference)}</small>`;
 return r.status==='Accepted'?'<span class="late">Start work order</span>':quoteState(r)==='Expired'?'<span class="fine">Revise or close</span>':'<span class="fine">—</span>';
}
function quoteTable(rows){
 return `<div class="tablewrap"><table class="quote-table"><thead><tr><th>QUOTATION</th><th>CUSTOMER & PROJECT</th><th>VALID UNTIL</th><th>STATUS</th><th>PROGRESS</th><th class="money">AMOUNT</th><th><span aria-label="Actions"></span></th></tr></thead><tbody>${rows.map(r=>{const state=quoteState(r),left=r.valid_until?daysUntil(r.valid_until):null;return `<tr><td class="ref">${esc(r.reference)}<small>${esc(r.date)}</small></td><td>${esc(r.party)}<small>${esc(r.description)}${r.customer_ref?` · Ref ${esc(r.customer_ref)}`:''}</small></td><td>${r.valid_until?esc(r.valid_until):'—'}${r.valid_until&&['Draft','Sent'].includes(state)?`<small class="${left<=7?'late':''}">${left===0?'Expires today':left===1?'1 day left':left+' days left'}</small>`:''}</td><td>${quoteStatusCell(r,state)}</td><td>${quoteProgress(r)}</td><td class="money"><b>${money(r.amount)}</b></td><td class="quote-actions"><button class="textbutton" data-edit="${esc(r.id)}">Open</button><button class="textbutton" data-quote-pdf="${esc(r.id)}">PDF</button><button class="textbutton" data-quote-copy="${esc(r.id)}" title="Duplicate as a new draft">Copy</button><button class="textbutton danger" data-record-delete="${esc(r.id)}" aria-label="Delete ${esc(r.reference)}">Delete</button></td></tr>`}).join('')}</tbody></table></div>`;
}
function bindQuoteRows(){
 $$('[data-quote-pdf]').forEach(b=>b.onclick=()=>downloadSavedPDF(records.find(r=>r.id===b.dataset.quotePdf),b));
 $$('[data-quote-copy]').forEach(b=>b.onclick=()=>editor('quote',undefined,records.find(r=>r.id===b.dataset.quoteCopy)));
 $$('[data-quote-status]').forEach(sel=>sel.onchange=()=>setQuoteStatus(sel.dataset.quoteStatus,sel.value,sel));
 $$('[data-quote-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.quoteFilter;$$('[data-quote-filter]').forEach(c=>c.classList.toggle('selected',c===b));updateTable()});
}
function quoteTermsFields(r){
 return `<div class="linehead" style="margin-top:22px">COMMERCIAL TERMS · PRINTED ON THE QUOTATION</div><div class="formgrid">
 ${paymentTermsPicker(r)}
 ${field('Delivery / lead time (this project)','lead_time',r.lead_time||'','text','maxlength="150" placeholder="e.g. 3-4 working days after drawing approval"')}
 ${field('Prepared by','prepared_by',r.prepared_by||'','text','maxlength="100"')}
 <label class="field">Bank account to print<select name="bank_account_id">${bankAccountOptions(r.bank_account_id)}</select></label>
 <label class="field full">Terms & conditions <span class="fine">(one per line)</span><textarea name="terms" rows="5" maxlength="4000">${esc(r.terms||'')}</textarea></label></div>`;
}
function pdfParty(doc){return (doc.documentType==='purchase'||doc.kind==='purchase'?vendors:customers).find(c=>c.name===doc.party)||{}}
function pdfContext(doc){return {company,party:pdfParty(doc),bankAccount:findBankAccount(company,doc.bank_account_id),stampLogo:stampLogo(company.stamp_color)}}
// single-ink copies of the logo for the stamp, one per ink colour, made once per session
const stampLogos={};
function stampLogo(color='blue'){return stampLogos[color]??=inkLogo('sutluj-logo.jpg',color).catch(()=>null)}
function pdfFileName(doc){const kind=doc.documentType==='purchase'||doc.kind==='purchase'?'PO':'Quotation';return `Sutluj-${kind}-${String(doc.reference||'Draft').replace(/[^a-zA-Z0-9_-]/g,'-')}-${String(doc.party||'').replace(/[^a-zA-Z0-9]+/g,'-').slice(0,40)}.pdf`.replace(/-+\.pdf$/,'.pdf')}
async function downloadSavedPDF(r,button){
 if(!r)return;button.disabled=true;const label=button.textContent;button.textContent='Preparing…';
 try{const doc={...r,lines:r.lines.map(l=>({...l,quantity:Number(l.quantity),rate:Number(l.rate)})),tax:Number(r.tax),...(r.kind==='purchase'?{documentType:'purchase'}:{})};const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createQuotePDF(doc,new Uint8Array(await response.arrayBuffer()),window.PDFLib,pdfContext(doc));const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=pdfFileName(doc);document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast(`${r.reference} PDF downloaded.`);
 }catch(err){toast(err.message||'Could not create the PDF.')}finally{button.disabled=false;button.textContent=label}
}
function companyCard(){
 const c=company;return `<section class="card"><div class="cardhead"><div><h2>Company details & quotation defaults</h2><p class="sub" style="margin-top:6px">Printed on quotations, invoices and purchase orders.</p></div></div><div class="cardbody"><form id="company-form"><div class="formgrid">
 ${field('Business name','name',c.name,'text','required maxlength="120"')}${field('Tagline','tagline',c.tagline,'text','maxlength="120"')}
 <label class="field full">Address<textarea name="address" rows="2" maxlength="300">${esc(c.address)}</textarea></label>
 ${field('Phone','phone',c.phone,'tel','maxlength="60"')}${field('Email','email',c.email,'email','maxlength="120"')}${field('Website','website',c.website,'text','maxlength="120"')}${field('Prepared by (default)','prepared_by',c.prepared_by,'text','maxlength="100"')}
 ${field('NTN','ntn',c.ntn,'text','maxlength="30"')}${field('STRN (sales tax registration)','strn',c.strn,'text','maxlength="30"')}
 ${field('Machine cost per cutting hour (PKR)','machine_rate',c.machine_rate||0,'number','min="0" max="1000000" step="1"')}
 <label class="field full">Default terms & conditions <span class="fine">(one per line)</span><textarea name="terms" rows="7" maxlength="4000">${esc(c.terms)}</textarea></label></div>
 <p class="help">Stored in this browser. New quotations start with these defaults; existing quotations keep their own terms.</p><div id="company-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="primary">Save company details</button></div></form></div></section>`;
}
function bindCompany(){
 $('#company-form').onsubmit=e=>{e.preventDefault();$('#company-error').textContent='';try{
  const data=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,String(v).trim()]));
  if(!data.name)throw Error('Enter the business name.');data.machine_rate=Number(data.machine_rate)||0;if(data.machine_rate<0)throw Error('Enter a machine rate of zero or more.');
  company={...defaultCompany,...company,...data,bank_accounts:bankAccountsOf(company)};localStorage.setItem('sutluj-company',JSON.stringify(company));toast('Company details saved. They appear on the next PDF you download.');
 }catch(err){$('#company-error').textContent=err.message||'Could not save company details.'}};
}

// Status can be changed from the list. Once a work order exists the quote must stay Accepted.
function quoteStatusCell(r,state){
 if(workOrders.some(j=>j.quote_id===r.id))return `${badge(state)}<small>Locked: job started</small>`;
 return `<select class="status-select ${esc(state.toLowerCase())}" data-quote-status="${esc(r.id)}" aria-label="Status of ${esc(r.reference)}">${statuses.quote.map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select>${state==='Expired'?'<small class="late">Expired</small>':''}`;
}
async function setQuoteStatus(id,status,select){
 const r=records.find(x=>x.id===id);if(!r||r.status===status)return;
 select.disabled=true;
 try{
  if(workOrders.some(j=>j.quote_id===id))throw Error('A work order has started from this quote, so it must stay Accepted.');
  await saveRecord({status},id);render();if($('#search'))$('#search').value=query;
  toast(`${r.reference} marked ${status}.${status==='Accepted'?' Open it and choose Work order to start production.':''}`);
 }catch(err){render();toast(err.message||'Could not change the status.')}
}

// Deleting a work order (local workspace only; the cloud tables do not allow it).
// Invoiced jobs stay. Stock issued to the job stays issued and keeps the job number in Inventory.
function confirmWorkOrderDelete(id){
 const j=workOrders.find(x=>x.id===id);if(!j||session)return;
 const invoice=invoices.find(i=>i.quote_id===j.quote_id),moves=stockMoves.filter(m=>m.job_id===id),dialog=$('#delete-modal');
 dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">${invoice?'Work order cannot be deleted':'Delete work order?'}</h2></div><form id="delete-job-form">${invoice?`<p><b>${esc(j.reference)}</b> has been invoiced as <b>${esc(invoice.reference)}</b>. Invoiced jobs are kept so the invoice stays traceable.</p><div class="actions"><button type="button" id="cancel-job-delete" autofocus>Close</button></div>`:`<p>Delete <b>${esc(j.reference)}</b> for <b>${esc(j.party)}</b> (quote ${esc(j.quote_reference)})?</p>${moves.length?`<p class="notice">${moves.length} stock movement${moves.length===1?'':'s'} (${moves.map(m=>esc(m.reference)).join(', ')}) stay recorded against this job number, including ${money(jobMaterialCost(id,stockMoves))} of material cost. If sheets came back unused, record a stock count in Inventory.</p>`:''}${records.some(r=>r.kind==='expense'&&r.job_id===id)?`<p class="help">Expenses booked to this job stay in Accounts → Expenses with the job number in their notes.</p>`:''}<p class="help">The quote stays and can start a new work order. This deletes the saved local record; export a backup first if you may need it.</p><div class="actions"><button type="button" id="cancel-job-delete" autofocus>Cancel</button><button type="submit" class="delete-confirm">Delete work order</button></div>`}</form>`;
 dialog.showModal();$('#cancel-job-delete').onclick=()=>dialog.close();
 $('#delete-job-form').onsubmit=e=>{e.preventDefault();if(invoice)return;workOrders=workOrders.filter(x=>x.id!==id);if(jobView===id)jobView=null;dialog.close();if($('#modal').open)$('#modal').close();render();toast(`${j.reference} deleted. Quote ${j.quote_reference} can start a new work order.`)};
}

// Work orders: accepted quotes waiting for a job card, the job list, and the job card page with
// production stages, parts and scrap, stock issues, labour, booked expenses and job costing.
function jobQuote(j){return j.quote_snapshot||records.find(r=>r.id===j.quote_id)||{lines:[],tax:0}}
function jobExpenses(j){return records.filter(r=>r.kind==='expense'&&r.job_id===j.id)}
function jobFigures(j){
 const q=jobQuote(j),revenue=documentTotals((q.lines||[]).map(l=>({...l,quantity:Number(l.quantity),rate:Number(l.rate)})),Number(q.tax)).net;
 const issued=stockMoves.some(m=>m.job_id===j.id&&m.type==='issue');
 return jobCosting({revenue,material:jobMaterialCost(j.id,stockMoves),machineMinutes:Number(j.cutting_minutes)||0,machineRate:Number(company.machine_rate)||0,labour:labourCost(j.labour||[]),expenses:jobExpenses(j).reduce((n,r)=>n+Math.round(Number(r.amount)*100),0)/100});
}
// Kilograms of material consumed: stock issued less offcuts returned, or a manual figure when nothing was issued from stock.
function jobConsumedKg(j){
 const moves=stockMoves.filter(m=>m.job_id===j.id&&['issue','offcut'].includes(m.type));
 if(!moves.length)return Number(j.consumed_kg_manual)||0;
 return Math.round(moves.reduce((n,m)=>n-(sheetWeightKg(stockById(m.item_id))||0)*Number(m.quantity),0)*1000)/1000;
}
function jobNetKg(j){return (jobQuote(j).lines||[]).reduce((n,l,i)=>n+(partWeightKg(l,j.parts?.[i])||0),0)}
function isInvoiced(j){return invoices.some(i=>i.quote_id===j.quote_id)}
function workOrderEditor(id){if($('#modal').open)$('#modal').close();page='workorders';jobView=id;render();window.scrollTo(0,0)}

function workOrderPage(){
 const open=workOrders.find(j=>j.id===jobView);if(open)return jobCardPage(open);jobView=null;
 const ready=records.filter(r=>r.kind==='quote'&&r.status==='Accepted'&&!workOrders.some(j=>j.quote_id===r.id)).sort((a,b)=>b.date.localeCompare(a.date));
 const active=workOrders.filter(j=>j.status!=='Completed'),overdue=active.filter(j=>j.due_date&&j.due_date<today()),toInvoice=workOrders.filter(j=>j.status==='Completed'&&!isInvoiced(j));
 const chips=[['All',workOrders.length],['Active',active.length],['Overdue',overdue.length],['Ready to invoice',toInvoice.length],['Invoiced',workOrders.filter(isInvoiced).length]].map(([k,n])=>`<button class="chip ${jobFilter===k?'selected':''}" data-job-filter="${k}">${k} <span>${n}</span></button>`).join('');
 return `<div class="heading"><div><div class="eyebrow">WORKSHOP PRODUCTION</div><h1>Work orders</h1><p class="sub">Accepted quote → Job card → Design → Material → Cutting → Quality check → Invoice</p></div></div>${notice()}
 <div class="stats">${stat('Waiting for a job card',String(ready.length),`${money(ready.reduce((n,r)=>n+Number(r.amount),0))} of accepted quotes`,'sales')}${stat('In production',String(active.length),`${active.filter(j=>j.priority==='Urgent').length} urgent`,'workorders')}${stat('Overdue',String(overdue.length),overdue.length?`Due before today: ${overdue.slice(0,2).map(j=>esc(j.reference)).join(', ')}`:'Nothing late','workorders')}${stat('Ready to invoice',String(toInvoice.length),money(toInvoice.reduce((n,j)=>n+jobFigures(j).revenue,0))+' before tax','accounts')}</div>
 <section class="card" style="margin-bottom:24px"><div class="cardhead"><div><h2>Accepted quotes ready for production</h2><p class="sub" style="margin-top:6px">Create a job card to start production.</p></div></div>${ready.length?`<div class="tablewrap"><table><thead><tr><th>QUOTATION</th><th>CUSTOMER & PROJECT</th><th>LEAD TIME</th><th class="money">VALUE</th><th></th></tr></thead><tbody>${ready.map(q=>`<tr><td class="ref">${esc(q.reference)}<small>${esc(q.date)}</small></td><td>${esc(q.party)}<small>${esc(q.description)}${q.customer_ref?` · Ref ${esc(q.customer_ref)}`:''}</small></td><td>${esc(q.lead_time||'—')}</td><td class="money"><b>${money(q.amount)}</b></td><td><button class="primary" data-create-job="${esc(q.id)}">Create job card</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Every accepted quote has a job card. Mark a quote Accepted in Sales to see it here.</div>'}</section>
 <div class="chips">${chips}</div><section class="card"><div class="toolbar"><input id="job-search" class="search" type="search" aria-label="Search work orders" placeholder="Search job, customer, quote or operator…"></div><div id="job-rows">${workOrderRows('')}</div></section>
 <p class="help">Margins use the quote value before tax against material issued, machine time (${Number(company.machine_rate)?money(company.machine_rate)+' per hour':'set a machine rate in Settings'}), labour and booked expenses.</p>`;
}
function workOrderRows(term){
 const t=term.trim().toLowerCase();
 const jobs=workOrders.filter(j=>jobFilter==='All'||(jobFilter==='Active'&&j.status!=='Completed')||(jobFilter==='Overdue'&&j.status!=='Completed'&&j.due_date&&j.due_date<today())||(jobFilter==='Ready to invoice'&&j.status==='Completed'&&!isInvoiced(j))||(jobFilter==='Invoiced'&&isInvoiced(j)))
  .filter(j=>`${j.reference} ${j.party} ${j.quote_reference} ${j.operator_name||''}`.toLowerCase().includes(t))
  .sort((a,b)=>(a.status==='Completed')-(b.status==='Completed')||(b.priority==='Urgent')-(a.priority==='Urgent')||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999')));
 if(!jobs.length)return '<div class="empty">No work orders here. Create a job card from an accepted quote above.</div>';
 return `<div class="tablewrap"><table class="job-table"><thead><tr><th>JOB / QUOTE</th><th>CUSTOMER & PROJECT</th><th>DUE</th><th>STAGE</th><th>OVERALL PROGRESS</th><th>OPERATOR</th><th class="money">COST / MARGIN</th><th></th></tr></thead><tbody>${jobs.map(j=>{const f=jobFigures(j),stage=jobStage(j,isInvoiced(j)),late=j.status!=='Completed'&&j.due_date&&j.due_date<today();return `<tr><td class="ref">${esc(j.reference)}<small>${esc(j.quote_reference)}</small></td><td>${esc(j.party)}<small>${esc(jobQuote(j).description||'')}</small></td><td>${j.due_date?esc(j.due_date):'—'}${late?'<small class="late">Overdue</small>':''}</td><td><span class="pill stage">${esc(stage)}</span>${j.priority==='Urgent'?' <span class="pill overdue">Urgent</span>':''}</td><td>${progressMeter(j.status==='Completed'?100:scopeProgress(scopeOf(j)))}</td><td>${esc(j.operator_name||'—')}</td><td class="money">${money(f.cost)}<small class="${f.marginPct!=null&&f.marginPct<0?'late':''}">${f.cost===0?'No costs yet':f.marginPct==null?'—':`${f.marginPct}% margin`}</small></td><td class="job-actions"><button data-job="${esc(j.id)}">Open</button>${session?'':`<button class="textbutton danger" data-job-delete="${esc(j.id)}" aria-label="Delete ${esc(j.reference)}">Delete</button>`}</td></tr>`}).join('')}</tbody></table></div>`;
}
function bindWorkOrders(){
 if(page!=='workorders')return;
 if(jobView){bindJobCard(workOrders.find(j=>j.id===jobView));return}
 const bind=()=>{$$('[data-job]').forEach(b=>b.onclick=()=>workOrderEditor(b.dataset.job));$$('[data-job-delete]').forEach(b=>b.onclick=()=>confirmWorkOrderDelete(b.dataset.jobDelete))};bind();
 $$('[data-create-job]').forEach(b=>b.onclick=()=>startWorkOrder(records.find(r=>r.id===b.dataset.createJob),b));
 $$('[data-job-filter]').forEach(b=>b.onclick=()=>{jobFilter=b.dataset.jobFilter;$$('[data-job-filter]').forEach(c=>c.classList.toggle('selected',c===b));$('#job-rows').innerHTML=workOrderRows($('#job-search').value);bind()});
 if($('#job-search'))$('#job-search').oninput=e=>{$('#job-rows').innerHTML=workOrderRows(e.target.value);bind()};
}
async function startWorkOrder(q,button){
 if(!q)return;const existing=workOrders.find(j=>j.quote_id===q.id);if(existing){workOrderEditor(existing.id);return}
 if(q.status!=='Accepted'){toast('Save the quote with Accepted status before creating its job card.');return}
 if(button)button.disabled=true;
 try{let job;
  if(session)job=await api('/rest/v1/rpc/start_work_order',{method:'POST',body:JSON.stringify({p_quote:q.id,p_version:q.updated_at})});
  else job={id:crypto.randomUUID(),quote_id:q.id,quote_reference:q.reference,reference:nextDocumentNumber('JOB',workOrders,today().slice(0,4)),party:q.party,quote_snapshot:structuredClone(q),design_status:'Pending',material_status:'Pending',cutting_status:'Pending',qc_status:'Pending',status:'Open',design_reference:'',material_owner:'Business',material_used:'',cutting_minutes:0,est_minutes:0,notes:'',scope:defaultScope(),priority:'Normal',due_date:addDays(today(),7),operator_id:'',operator_name:'',machine:'',parts:{},labour:[],created_at:new Date().toISOString()};
  workOrders.unshift(job);toast(`${job.reference} created for ${q.party}.`);workOrderEditor(job.id);
 }catch(err){toast(err.message)}finally{if(button)button.disabled=false}
}

function jobCardPage(j){
 const locked=j.status==='Completed',invoice=invoices.find(i=>i.quote_id===j.quote_id),stage=jobStage(j,!!invoice),q=jobQuote(j),f=jobFigures(j),local=!session;
 const scrap=scrapSummary(jobNetKg(j),jobConsumedKg(j)),fromStock=stockMoves.some(m=>m.job_id===j.id&&m.type==='issue');
 const scope=scopeOf(j),steps=[...scope.map((t,i)=>({name:`${i+1}. ${t.name}${t.status==='In progress'&&taskProgress(t)?` · ${taskProgress(t)}%`:''}`,done:t.status==='Done',na:t.status==='Not required',active:t.status==='In progress'})),{name:'Completed',done:locked},{name:'Invoiced',done:!!invoice}];const firstOpen=steps.findIndex(t=>!t.done&&!t.na);
 const opt=(list,value)=>list.map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('');
 const staff=employees.filter(e=>employedOn(e,today())||e.id===j.operator_id);
 return `<div class="heading"><div><button class="textbutton" data-jobs-back>← All work orders</button><div class="eyebrow" style="margin-top:10px">JOB CARD</div><h1>${esc(j.reference)}</h1><p class="sub">${esc(j.party)} · Quote ${esc(j.quote_reference)} · <span class="pill stage">${esc(stage)}</span>${j.priority==='Urgent'?' <span class="pill overdue">Urgent</span>':''}</p></div><div class="row"><button id="job-pdf">Job card PDF</button>${local?'<button class="danger" id="job-delete">Delete</button>':''}${locked?`<button class="primary" id="job-invoice">${invoice?'View invoice '+esc(invoice.reference):'Create invoice'}</button>`:''}</div></div>
 ${local?`<div class="stats">${stat('Quote value',money(f.revenue),'Before sales tax','sales')}${stat('Job cost',money(f.cost),'Material, machine, labour, expenses','accounts')}${stat('Margin',f.cost===0||f.marginPct==null?'—':f.marginPct+'%',f.cost===0?'Record costs to see the margin':money(f.margin),'accounts')}${stat('Scrap',scrap.scrapPct==null?'—':scrap.scrapPct+'%',scrap.utilisationPct==null?'Needs part sizes and material consumed':`${scrap.utilisationPct}% material utilisation`,'inventory')}</div>`:''}
 <ol class="stage-track">${steps.map((t,i)=>`<li class="${t.done?'done':t.na?'na':i===firstOpen?'current':t.active?'active':''}">${esc(t.name)}${t.na?' <span>N/A</span>':''}</li>`).join('')}</ol>${local?scopeCard(j,locked):''}

 <form id="job-form"><section class="card"><div class="cardhead"><h2>Job details & production</h2>${locked?badge('Completed'):''}</div><div class="cardbody"><fieldset ${locked?'disabled':''} class="plainset" style="margin:0"><div class="formgrid">
 ${local?`${field('Due date','due_date',j.due_date||'','date')}<label class="field">Priority<select name="priority">${opt(priorities,j.priority||'Normal')}</select></label>
 <label class="field">Operator<select name="operator_id"><option value="">Not assigned</option>${staff.map(e=>`<option value="${esc(e.id)}" ${e.id===j.operator_id?'selected':''}>${esc(e.name)} · ${esc(e.role)}</option>`).join('')}</select></label>${field('Machine','machine',j.machine||'','text','maxlength="100" placeholder="e.g. Fiber laser 3 kW"')}`:''}
 ${field('Drawing / DXF reference','design_reference',j.design_reference,'text','maxlength="500"')}${select('Material owner','material_owner',['Business','Customer'],j.material_owner)}
 ${local?field('Estimated cutting time (min)','est_minutes',j.est_minutes||0,'number','min="0" max="100000" step="1"'):`${select('Design / DXF','design_status',['Pending','In progress','Ready','Not required'],j.design_status)}${select('Material','material_status',['Pending','Ready'],j.material_status)}${select('Cutting','cutting_status',['Pending','In progress','Done'],j.cutting_status)}`}
 ${field('Actual cutting time (min)','cutting_minutes',j.cutting_minutes,'number','min="0" max="1000000" step="0.01" required')}
 <label class="field full">Instructions for the workshop<textarea name="notes" maxlength="4000" placeholder="Nesting notes, edge finish, packing, delivery…">${esc(j.notes)}</textarea></label>
 ${local?`<div class="field full"><span>Material used <span class="fine">(from stock issues)</span></span>${materialUsedList(j)}</div><label class="field full">Material notes <span class="fine">(optional, for anything not issued from stock)</span><textarea name="material_used" maxlength="4000" placeholder="e.g. customer-supplied plate, cut from customer's own sheet">${esc(j.material_used)}</textarea></label>`:`<label class="field full">Material used<textarea name="material_used" maxlength="4000">${esc(j.material_used)}</textarea></label>`}</div></fieldset>
 ${local?`<div class="linehead" style="margin-top:24px">PARTS & SCRAP</div><div class="tablewrap"><table class="parts-table"><thead><tr><th>#</th><th>PART</th><th>MATERIAL</th><th class="money">QTY</th><th>PART SIZE L × W (MM)</th><th class="money">NET WEIGHT</th></tr></thead><tbody>${(q.lines||[]).map((l,i)=>{const p=j.parts?.[i]||{},kg=partWeightKg(l,p);return `<tr><td>${i+1}</td><td>${esc(l.description)}</td><td>${l.thickness_mm?esc(thicknessText(l).replace(' | Custom thickness','').replace(/ \| /g,' · ')):'<span class="fine">Set in quote</span>'}</td><td class="money">${esc(l.quantity)}</td><td><span class="part-size"><input type="number" min="1" max="20000" step="0.1" data-part-length="${i}" value="${p.length||''}" aria-label="Part ${i+1} length" ${locked?'disabled':''}> × <input type="number" min="1" max="20000" step="0.1" data-part-width="${i}" value="${p.width||''}" aria-label="Part ${i+1} width" ${locked?'disabled':''}></span></td><td class="money" data-part-kg="${i}">${kg==null?'—':kg.toLocaleString('en-PK',{maximumFractionDigits:1})+' kg'}</td></tr>`}).join('')}</tbody></table></div>
 <div class="formgrid" style="margin-top:14px">${fromStock?`<p class="help">Material consumed from stock issues: <b>${jobConsumedKg(j).toLocaleString('en-PK',{maximumFractionDigits:1})} kg</b> (sheets issued less offcuts returned).</p>`:j.material_owner==='Customer'?field('Customer material consumed (kg)','consumed_kg_manual',j.consumed_kg_manual||'','number',`min="0" max="1000000" step="0.1" placeholder="If not issued from customer stock" ${locked?'disabled':''}`):'<p class="help">Issue sheets from stock (below) to record the material consumed, its cost and the scrap.</p>'}
 <div class="summary scrap-summary" id="scrap-summary">${scrapText(scrap)}</div></div>
 <p class="help">Net weight uses each part's overall size (a rectangular blank), so holes and cut-outs count as part. Scrap = material consumed − net part weight.</p>`:''}
 <div id="job-error" class="error" role="alert"></div>${locked?'':'<div class="actions"><button type="submit" name="action" value="save">Save job</button><button type="submit" name="action" value="complete" class="primary">Mark completed</button></div>'}</div></section></form>
 ${local?`<section class="card" style="margin-top:24px"><div class="cardhead"><h2>Material from stock</h2>${locked?'':'<button id="job-issue">Issue from stock</button>'}</div><div class="cardbody">${jobStockTable(j)}</div></section>
 <section class="card" style="margin-top:24px"><div class="cardhead"><h2>Labour</h2><button id="labour-add">＋ Add labour</button></div>${labourTable(j)}</section>
 <section class="card" style="margin-top:24px" id="job-expenses"><div class="cardhead"><h2>Job expenses</h2><button id="expense-add">＋ Book expense</button></div>${jobExpenseTable(j)}</section>
 <section class="card" style="margin-top:24px"><div class="cardhead"><h2>Job costing</h2><span class="fine">Quote value excludes sales tax</span></div><div class="cardbody">${[['Quote value',f.revenue],['Material from stock',-f.material],[`Machine time (${Number(j.cutting_minutes)||0} min${Number(company.machine_rate)?` at ${money(company.machine_rate)}/h`:''})`,-f.machine],['Labour',-f.labour],['Booked expenses',-f.expenses]].map(([k,v])=>`<div class="cost-row"><span>${k}</span><b>${money(v)}</b></div>`).join('')}<div class="summary"><span>Margin${f.marginPct==null?'':` (${f.marginPct}%)`}</span><b class="${f.margin<0?'late':''}">${money(f.margin)}</b></div>
 ${Number(company.machine_rate)?'':'<p class="help">Set a machine cost per cutting hour in Settings → Company details to include machine time.</p>'}${jobScrapNote(j)}${j.est_minutes?`<p class="help">Cutting time: estimated ${j.est_minutes} min, actual ${Number(j.cutting_minutes)||0} min (${Number(j.cutting_minutes)>j.est_minutes?'+':''}${Math.round((Number(j.cutting_minutes)||0)-j.est_minutes)} min).</p>`:''}<p class="help">Machine time and labour are costing allocations; wages are posted through payroll. Material and booked expenses are posted through Accounts → Journal.</p></div></section>`:'<p class="help">Parts, scrap, labour, expenses and job costing are available in the local workspace.</p>'}`;
}
function scrapText(s){return s.scrapPct==null?`<span>${s.netKg>0?'Enter the material consumed to calculate scrap':'Enter part sizes to calculate scrap'}</span><b>${s.netKg>0?`Net ${s.netKg.toLocaleString('en-PK')} kg`:s.consumedKg>0?`${s.consumedKg.toLocaleString('en-PK')} kg consumed`:''}</b>`:`<span>Net ${s.netKg.toLocaleString('en-PK')} kg of ${s.consumedKg.toLocaleString('en-PK')} kg consumed</span><b>Scrap ${s.scrapKg.toLocaleString('en-PK')} kg · ${s.scrapPct}%</b>`}
function jobStockTable(j){const moves=stockMoves.filter(m=>m.job_id===j.id);return moves.length?`<div class="tablewrap"><table><thead><tr><th>MOVEMENT</th><th>ITEM</th><th class="money">QTY</th><th class="money">WEIGHT</th><th class="money">COST</th></tr></thead><tbody>${moves.map(m=>{const i=stockById(m.item_id),kg=sheetWeightKg(i);return `<tr><td>${esc(m.reference)}<small>${moveLabels[m.type]}</small></td><td>${esc(i?.code)}<small>${esc(i?itemLabel(i):'')}</small></td><td class="money">${fmtQty(Math.abs(m.quantity),i)}</td><td class="money">${m.type==='scrap'?fmtQty(m.quantity,i):kg?(kg*Math.abs(m.quantity)).toLocaleString('en-PK',{maximumFractionDigits:1})+' kg':'—'}</td><td class="money">${m.type==='scrap'?'—':money(-m.value)}</td></tr>`}).join('')}</tbody></table></div><div class="summary"><span>Material cost from stock</span><b>${money(jobMaterialCost(j.id,stockMoves))}</b></div>`:'<p class="help">No stock issued yet. Issue sheets here to cost the material, return usable offcuts and weigh the scrap.</p>'}
function labourTable(j){const rows=j.labour||[];return rows.length?`<div class="tablewrap"><table><thead><tr><th>DATE / WHO</th><th>TASK</th><th class="money">HOURS</th><th class="money">COST</th><th></th></tr></thead><tbody>${rows.map(e=>`<tr><td>${esc(e.date)}<small>${esc(e.name)}</small></td><td>${esc(e.task)}</td><td class="money">${e.hours}<small>${money(e.rate)}/h</small></td><td class="money">${money(Math.round(e.rate*e.hours*100)/100)}</td><td><button class="textbutton danger" data-labour-delete="${esc(e.id)}" aria-label="Remove labour entry">Remove</button></td></tr>`).join('')}</tbody><tfoot><tr><td><b>Total</b></td><td></td><td class="money"><b>${rows.reduce((n,e)=>n+e.hours,0)}</b></td><td class="money"><b>${money(labourCost(rows))}</b></td><td></td></tr></tfoot></table></div>`:'<div class="empty">No labour recorded. Add hours for design, operating, finishing or packing.</div>'}
function jobExpenseTable(j){const rows=jobExpenses(j);return rows.length?`<div class="tablewrap"><table><thead><tr><th>EXPENSE</th><th>ACCOUNT</th><th class="money">AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.reference)}<small>${esc(r.date)} · ${esc(r.party)}</small></td><td>${esc(r.account_code)}<small>${esc(accountList.find(a=>a.code===r.account_code)?.name||'')}</small></td><td class="money">${money(r.amount)}</td><td>${badge(r.status)}${journals.some(x=>x.source_kind==='expense'&&x.source_id===r.id)?'<small>Posted</small>':''}</td><td><button class="textbutton" data-edit="${esc(r.id)}">Open</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No expenses booked. Book gas, outsourced bending, transport or consumables used on this job.</div>'}
function readJobForm(j){
 const data=Object.fromEntries(new FormData($('#job-form')));delete data.action;
 const base={design_status:data.design_status,design_reference:(data.design_reference||'').trim(),material_status:data.material_status,material_owner:data.material_owner,material_used:data.material_used||'',cutting_status:data.cutting_status,cutting_minutes:Number(data.cutting_minutes)||0,notes:data.notes||''};
 if(session)return base;
 for(const k of ['design_status','material_status','cutting_status'])delete base[k];
 const parts={};$$('[data-part-length]').forEach(el=>{const i=el.dataset.partLength,w=$(`[data-part-width="${i}"]`).value;if(el.value||w)parts[i]={length:Number(el.value)||0,width:Number(w)||0}});
 const op=employees.find(e=>e.id===data.operator_id);
 return {...base,due_date:data.due_date||'',priority:data.priority||'Normal',operator_id:data.operator_id||'',operator_name:op?.name||'',machine:(data.machine||'').trim(),...legacyFromScope(scopeOf(workOrders.find(x=>x.id===j.id)||j)),est_minutes:Number(data.est_minutes)||0,parts,...('consumed_kg_manual' in data?{consumed_kg_manual:data.consumed_kg_manual===''?'':Number(data.consumed_kg_manual)}:{})};
}
function saveJobLocally(j,data){const next={...j,...data};workOrders=workOrders.map(x=>x.id===j.id?next:x);return next}
function bindJobCard(j){
 if(!j)return;const id=j.id;
 $('[data-jobs-back]').onclick=()=>{jobView=null;render()};
 $('#job-pdf').onclick=()=>downloadJobCard(workOrders.find(x=>x.id===id),$('#job-pdf'));
 if($('#job-delete'))$('#job-delete').onclick=()=>confirmWorkOrderDelete(id);
 if($('#job-invoice'))$('#job-invoice').onclick=()=>invoiceFromQuote({...j.quote_snapshot,id:j.quote_id});
 // live part weights and scrap while typing
 const recalc=()=>{if(session)return;const draft={...j,...readJobForm(j)};(jobQuote(j).lines||[]).forEach((l,i)=>{const kg=partWeightKg(l,draft.parts[i]),cell=$(`[data-part-kg="${i}"]`);if(cell)cell.textContent=kg==null?'—':kg.toLocaleString('en-PK',{maximumFractionDigits:1})+' kg'});$('#scrap-summary').innerHTML=scrapText(scrapSummary(jobNetKg(draft),jobConsumedKg(draft)))};
 if($('#scrap-summary'))$('#job-form').oninput=recalc;
 $('#job-form').onsubmit=async e=>{e.preventDefault();const buttons=[...e.target.querySelectorAll('[type=submit]')];try{
  const data=readJobForm(j),complete=e.submitter?.value==='complete',problem=complete?completionProblem(session?{...j,...data,qc_status:'Not required'}:{...j,...data,stock_issued:stockMoves.some(m=>m.job_id===j.id&&m.type==='issue')}):'';
  if(problem)throw Error(problem);data.status=complete?'Completed':'In progress';if(complete&&!session)data.completed_at=today();buttons.forEach(b=>b.disabled=true);
  if(session){const result=await api(`/rest/v1/work_orders?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(j.updated_at)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(data)});if(!result?.length)throw Error('Job changed in another browser. Refresh and try again.');workOrders=workOrders.map(x=>x.id===id?result[0]:x)}else saveJobLocally(j,data);
  render();toast(complete?`${j.reference} completed. Ready to invoice.`:`${j.reference} saved.`);
 }catch(err){$('#job-error').textContent=err.message}finally{buttons.forEach(b=>b.disabled=false)}};
 if(session)return;
 bindScope(j);
 if($('#job-issue'))$('#job-issue').onclick=()=>{saveJobLocally(j,readJobForm(j));issueEditor({jobId:id})};
 $('#labour-add').onclick=()=>{if(j.status!=='Completed')saveJobLocally(j,readJobForm(j));labourEditor(id)};
 $('#expense-add').onclick=()=>{if(j.status!=='Completed')saveJobLocally(j,readJobForm(j));jobExpenseEditor(id)};
 $$('[data-labour-delete]').forEach(b=>b.onclick=()=>{const cur=workOrders.find(x=>x.id===id);saveJobLocally(cur,{labour:(cur.labour||[]).filter(e=>e.id!==b.dataset.labourDelete)});render();toast('Labour entry removed.')});
 $$('#job-expenses [data-edit]').forEach(b=>b.onclick=()=>editor('expense',b.dataset.edit));
}
function labourEditor(id){
 const j=workOrders.find(x=>x.id===id),staff=employees.filter(e=>employedOn(e,today())).sort((a,b)=>a.name.localeCompare(b.name));
 $('#modal').innerHTML=`<div class="modalhead"><h2>Add labour · ${esc(j.reference)}</h2><button class="close" aria-label="Close">×</button></div><form id="labour-form"><div class="formgrid">
 <label class="field full">Who<select name="employee_id"><option value="">Someone else (type the name below)</option>${staff.map(e=>`<option value="${esc(e.id)}" ${e.id===j.operator_id?'selected':''}>${esc(e.name)} · ${esc(e.role)}</option>`).join('')}</select></label>
 ${field('Name','name','','text','maxlength="150"')}<label class="field">Task<select name="task">${labourTasks.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 ${field('Date','date',today(),'date',`required max="${today()}"`)}${field('Hours','hours','','number','required min="0.25" max="24" step="0.25"')}
 ${field('Hourly rate (PKR)','rate','','number','required min="0" max="100000" step="0.01"')}<p class="help full" id="labour-hint"></p></div>
 <div class="summary"><span>Labour cost</span><b id="labour-cost">—</b></div><div id="hr-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Add labour</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#labour-form').elements;
 const pick=()=>{const e=empById(f.employee_id.value);f.name.closest('label').hidden=!!e;if(e){f.name.value=e.name;f.rate.value=hourlyRate(e);$('#labour-hint').textContent=`Rate from HR: ${e.pay_type==='Daily'?'daily wage ÷ 8 hours':'monthly salary ÷ 30 days ÷ 8 hours'}. Change it if needed.`}else{f.name.value='';$('#labour-hint').textContent=''}cost()};
 const cost=()=>{const c=Number(f.hours.value)*Number(f.rate.value);$('#labour-cost').textContent=c>0?money(Math.round(c*100)/100):'—'};
 f.employee_id.onchange=pick;$('#labour-form').oninput=cost;pick();
 $('#labour-form').onsubmit=ev=>{ev.preventDefault();try{
  const entry=validateLabour({id:crypto.randomUUID(),employee_id:f.employee_id.value,name:f.name.value.trim(),task:f.task.value,date:f.date.value,hours:f.hours.value,rate:f.rate.value});
  if(entry.date>today())throw Error('The date cannot be in the future.');
  const cur=workOrders.find(x=>x.id===id);saveJobLocally(cur,{labour:[...(cur.labour||[]),entry]});$('#modal').close();render();toast(`${entry.hours} h of ${entry.task.toLowerCase()} added to ${cur.reference}.`);
 }catch(err){$('#hr-error').textContent=err.message}};
}
function jobExpenseEditor(id){
 const j=workOrders.find(x=>x.id===id),types=Object.keys(jobExpenseTypes);
 $('#modal').innerHTML=`<div class="modalhead"><h2>Book expense · ${esc(j.reference)}</h2><button class="close" aria-label="Close">×</button></div><form id="job-expense-form"><div class="formgrid">
 <label class="field">Expense type<select name="type">${types.map(t=>`<option>${esc(t)}</option>`).join('')}</select><small class="fine" id="expense-account"></small></label>${field('Date','date',today(),'date',`required max="${today()}"`)}
 ${field('Paid to / supplier','party','','text','required maxlength="150"')}${field('Amount (PKR)','amount','','number','required min="0.01" max="1000000000" step="0.01"')}
 ${field('Description','description','','text','required maxlength="500"')}${select('Status','status',['Paid','Pending'],'Paid')}</div>
 <p class="help">Booked as an expense in Accounts → Expenses against this job. Post it from Accounts → Journal (paid from cash/bank, or to payables if pending).</p><div id="hr-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Book expense</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#job-expense-form').elements;const sync=()=>{const code=jobExpenseTypes[f.type.value];$('#expense-account').textContent=`Account ${code} · ${accountList.find(a=>a.code===code)?.name||''}`;if(!f.description.value||f.description.dataset.auto){f.description.value=`${f.type.value} - ${j.reference}`;f.description.dataset.auto='1'}};
 f.type.onchange=sync;f.description.oninput=()=>delete f.description.dataset.auto;sync();
 $('#job-expense-form').onsubmit=async ev=>{ev.preventDefault();try{
  const amount=Math.round(Number(f.amount.value)*100)/100;if(!(amount>0))throw Error('Enter the amount.');if(f.date.value>today())throw Error('The date cannot be in the future.');
  await saveRecord({kind:'expense',party:f.party.value.trim(),description:f.description.value.trim(),date:f.date.value,status:f.status.value,category:'Operating expense',account_code:jobExpenseTypes[f.type.value],notes:`Job ${j.reference} · ${j.party}`,lines:[],tax:0,amount,job_id:j.id,job_reference:j.reference});
  $('#modal').close();render();toast(`${money(amount)} booked to ${j.reference}. Post it in Accounts → Journal.`);
 }catch(err){$('#hr-error').textContent=err.message}};
}
async function downloadJobCard(j,button){
 button.disabled=true;button.textContent='Preparing…';
 try{const rows=stockMoves.filter(m=>m.job_id===j.id).map(m=>{const i=stockById(m.item_id);return [m.reference,i?.code||'',`${moveLabels[m.type]} · ${i?itemLabel(i):''}`,fmtQty(Math.abs(m.quantity),i)]});
  const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const tasks=scopeOf(j).filter(t=>t.status!=='Not required').map(t=>t.name);if(!tasks.some(t=>/deliver|dispatch/i.test(t)))tasks.push('Dispatched / collected');
  const bytes=await createJobCardPDF(j,jobQuote(j),rows,new Uint8Array(await response.arrayBuffer()),window.PDFLib,{company,stages:tasks});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`Sutluj-Job-Card-${j.reference}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Job card downloaded. Print it for the workshop.');
 }catch(err){toast(err.message||'Could not create the job card.')}finally{button.disabled=false;button.textContent='Job card PDF'}
}

// Invoices: completed jobs waiting for an invoice, the invoice register with balances, and receivables ageing.
function dueFromTerms(terms,date){const m=String(terms||'').match(/(\d+)\s*days?/i);return m&&/credit|days/i.test(terms)?addDays(date,Number(m[1])):date}
function invoicePage(){
 const t=today(),ready=workOrders.filter(j=>j.status==='Completed'&&!isInvoiced(j)).sort((a,b)=>String(b.completed_at||'').localeCompare(String(a.completed_at||'')));
 const rows=invoices.map(i=>({i,...invoiceBalance(i,payments),status:invoiceStatus(i,payments,t)})),sum=list=>list.reduce((n,x)=>n+Math.round(x*100),0)/100;
 const received=sum(payments.filter(p=>p.date.startsWith(t.slice(0,7))).map(p=>Number(p.amount)));
 const chips=['All','Unpaid','Part paid','Overdue','Paid'].map(k=>`<button class="chip ${invFilter===k?'selected':''}" data-invoice-filter="${k}">${k} <span>${k==='All'?rows.length:rows.filter(r=>r.status===k).length}</span></button>`).join('');
 return `<div class="heading"><div><div class="eyebrow">CUSTOMER BILLING</div><h1>Invoices</h1><p class="sub">Completed job → Invoice → Payment</p></div></div>${notice()}
 <div class="stats">${stat('Ready to invoice',String(ready.length),`${money(sum(ready.map(j=>Number(jobQuote(j).amount)||0)))} incl. tax`,'invoices')}${stat('Outstanding',money(sum(rows.map(r=>r.due))),(n=>`${n} invoice${n===1?'':'s'} unpaid or part paid`)(rows.filter(r=>r.due>0).length),'accounts')}${stat('Overdue',money(sum(rows.filter(r=>r.status==='Overdue').map(r=>r.due))),(n=>`${n} invoice${n===1?'':'s'} past the due date`)(rows.filter(r=>r.status==='Overdue').length),'accounts')}${stat('Received this month',money(received),new Date(t+'T00:00:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'}),'accounts')}</div>
 <section class="card" style="margin-bottom:24px"><div class="cardhead"><div><h2>Completed jobs ready to invoice</h2><p class="sub" style="margin-top:6px">Each completed work order is invoiced once, from its accepted quotation.</p></div></div>${ready.length?`<div class="tablewrap"><table><thead><tr><th>JOB / QUOTE</th><th>CUSTOMER & PROJECT</th><th>COMPLETED</th><th class="money">AMOUNT</th><th></th></tr></thead><tbody>${ready.map(j=>{const q=jobQuote(j);return `<tr><td class="ref">${esc(j.reference)}<small>${esc(j.quote_reference)}</small></td><td>${esc(j.party)}<small>${esc(q.description||'')}${q.payment_terms?' · '+esc(q.payment_terms):''}</small></td><td>${esc(j.completed_at||'—')}</td><td class="money"><b>${money(q.amount)}</b><small>incl. ${esc(q.tax||0)}% tax</small></td><td><button class="primary" data-invoice-create="${esc(j.id)}">Create invoice</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No completed jobs waiting. Mark a work order completed to invoice it here.</div>'}</section>
 <div class="chips">${chips}</div><section class="card"><div class="toolbar"><input id="invoice-search" class="search" type="search" placeholder="Search invoice, customer, job or quote…" aria-label="Search invoices"></div><div id="invoice-rows">${invoiceRows('')}</div></section>${ageingCard()}<p class="help">Balances come from invoices and recorded payments. Post invoices and receipts in Accounts → Journal to include them in the accounts. Credit notes are not yet available.</p>`;
}
function invoiceRows(term){
 const t=term.trim().toLowerCase(),d=today();
 const rows=invoices.map(i=>({i,...invoiceBalance(i,payments),status:invoiceStatus(i,payments,d)})).filter(r=>invFilter==='All'||r.status===invFilter).filter(({i})=>`${i.reference} ${i.party} ${i.quote_reference} ${i.job_reference||''} ${i.description||''}`.toLowerCase().includes(t)).sort((a,b)=>b.i.date.localeCompare(a.i.date)||String(b.i.reference).localeCompare(String(a.i.reference)));
 if(!rows.length)return `<div class="empty">${invoices.length?'No invoices match.':'No invoices yet. Create one from a completed job above.'}</div>`;
 return `<div class="tablewrap"><table class="invoice-table"><thead><tr><th>INVOICE</th><th>CUSTOMER & PROJECT</th><th>DUE</th><th>STATUS</th><th class="money">TOTAL</th><th class="money">BALANCE</th><th></th></tr></thead><tbody>${rows.map(({i,due,status})=>{const days=daysUntil(i.due_date);return `<tr><td class="ref">${esc(i.reference)}<small>${esc(i.date)}</small></td><td>${esc(i.party)}<small>${esc(i.description||'')} · ${[i.job_reference,i.quote_reference].filter(Boolean).map(esc).join(' · ')}</small></td><td>${esc(i.due_date)}${due>0?`<small class="${days<0?'late':''}">${days<0?`${-days} day${days===-1?'':'s'} overdue`:days===0?'Due today':`Due in ${days} day${days===1?'':'s'}`}</small>`:''}</td><td>${badge(status)}</td><td class="money">${money(i.amount)}</td><td class="money"><b>${due>0?money(due):'—'}</b></td><td class="quote-actions"><button class="textbutton" data-invoice="${esc(i.id)}">Open</button><button class="textbutton" data-invoice-pdf="${esc(i.id)}">PDF</button>${due>0?`<button class="textbutton" data-invoice-pay="${esc(i.id)}">Payment</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`;
}
function bindInvoices(){
 const bind=()=>{$$('[data-invoice]').forEach(b=>b.onclick=()=>openInvoice(b.dataset.invoice));$$('[data-invoice-pdf]').forEach(b=>b.onclick=()=>downloadInvoicePDF(invoices.find(i=>i.id===b.dataset.invoicePdf),b));$$('[data-invoice-pay]').forEach(b=>b.onclick=()=>{openInvoice(b.dataset.invoicePay);const f=$('#invoice-payment');if(f){f.scrollIntoView({block:'center'});f.elements.amount.focus()}})};
 bind();bindStatements();
 if($('#ageing-csv'))$('#ageing-csv').onclick=exportAgeingCSV;
 $$('[data-invoice-create]').forEach(b=>b.onclick=()=>{const j=workOrders.find(x=>x.id===b.dataset.invoiceCreate);if(j)invoiceFromQuote({...jobQuote(j),id:j.quote_id})});
 $$('[data-invoice-filter]').forEach(b=>b.onclick=()=>{invFilter=b.dataset.invoiceFilter;$$('[data-invoice-filter]').forEach(c=>c.classList.toggle('selected',c===b));$('#invoice-rows').innerHTML=invoiceRows($('#invoice-search').value);bind()});
 if($('#invoice-search'))$('#invoice-search').oninput=e=>{$('#invoice-rows').innerHTML=invoiceRows(e.target.value);bind()};
}

// Purchase orders waiting to go into stock, and the goods received note (GRN) that receives them line by line.
function posToReceive(){return records.filter(r=>r.kind==='purchase'&&['Ordered','Received'].includes(r.status)&&poReceiptStatus(r,stockMoves).pending).sort((a,b)=>(b.status==='Received')-(a.status==='Received')||a.date.localeCompare(b.date))}
function poReceivingCard(){
 const pos=posToReceive();
 return `<section class="card" style="margin-bottom:24px"><div class="cardhead"><div><h2>Purchase orders to receive</h2><p class="sub" style="margin-top:6px">Ordered and received POs that are not yet in stock. Receive each line into a stock item.</p></div></div>${pos.length?`<div class="tablewrap"><table class="invoice-table"><thead><tr><th>PURCHASE ORDER</th><th>SUPPLIER & DETAILS</th><th>STATUS</th><th>LINES IN STOCK</th><th class="money">VALUE</th><th></th></tr></thead><tbody>${pos.map(p=>{const st=poReceiptStatus(p,stockMoves);return `<tr><td class="ref">${esc(p.reference)}<small>${esc(p.date)}</small></td><td>${esc(p.party)}<small>${esc(p.description)}</small></td><td>${badge(p.status)}${p.status==='Received'?'<small class="late">Delivered, not in stock</small>':'<small>Awaiting delivery</small>'}</td><td>${st.done} of ${st.lines.length}</td><td class="money"><b>${money(p.amount)}</b></td><td><button class="primary" data-po-receive="${esc(p.id)}">Receive into stock</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">Every ordered or received purchase order is in stock.</div>'}</section>`;
}
function poReceiveEditor(poId){
 const po=records.find(r=>r.id===poId);if(!po)return;
 const st=poReceiptStatus(po,stockMoves),items=stockItems.filter(i=>i.owner==='Business'&&['sheet','consumable'].includes(i.category)).sort(byCode);
 const lineValue=l=>Math.round(Number(l.quantity)*Number(l.rate)*(100-lineDiscount(l)))/100;
 const row=({index,line,receivedQty,complete})=>{
  if(complete)return `<tr class="grn-done"><td>${index+1}</td><td>${esc(line.description)}</td><td colspan="4"><span class="pill received">In stock</span>${receivedQty?` <span class="fine">${receivedQty} received</span>`:''}</td></tr>`;
  const match=matchStockItem(line,items),proposal=itemFromPOLine(line);
  return `<tr data-grn-line="${index}"><td>${index+1}</td><td>${esc(line.description)}<small>Ordered ${esc(line.quantity)} · ${money(lineValue(line))}${receivedQty?` · ${receivedQty} already received`:''}</small></td>
  <td><select data-grn-item aria-label="Stock item for line ${index+1}"><option value="">Choose stock item</option>${proposal&&!match?`<option value="__new">＋ New item: ${esc(itemLabel(proposal))}</option>`:''}${items.map(i=>`<option value="${esc(i.id)}" ${match?.id===i.id?'selected':''}>${esc(i.code)} · ${esc(itemLabel(i))}</option>`).join('')}<option value="__skip">Not received now</option></select>${!match&&!proposal?'<small>Not recognised. Choose an item, or add it with ＋ Stock item.</small>':''}</td>
  <td><input data-grn-qty type="number" min="0" step="any" value="${receivedQty?'':esc(line.quantity)}" aria-label="Quantity received for line ${index+1}"></td>
  <td><input data-grn-cost type="number" min="0" step="any" value="${receivedQty?'':lineValue(line)}" aria-label="Cost for line ${index+1}"></td>
  <td><label class="grn-check"><input data-grn-complete type="checkbox" checked> Fully received</label></td></tr>`;
 };
 $('#modal').innerHTML=`<div class="modalhead"><h2>Goods received · ${esc(po.reference)}</h2><button class="close" aria-label="Close">×</button></div><form id="grn-form" class="payroll"><p><b>${esc(po.party)}</b> · ${esc(po.description)} · ${badge(po.status)}</p>
 <div class="formgrid">${field('Date received','date',today(),'date',`required max="${today()}"`)}${field('Delivery challan / bill no.','doc_reference','','text','maxlength="150"')}</div>
 <div class="tablewrap" style="margin-top:18px"><table class="grn-table"><thead><tr><th>#</th><th>PO LINE</th><th>STOCK ITEM</th><th>QTY RECEIVED</th><th>COST (PKR)</th><th></th></tr></thead><tbody>${st.lines.map(row).join('')}</tbody></table></div>
 <p class="help">Quantity is in the stock item's unit (sheets for sheet stock). Cost is the line's value by default, so a PO priced per lot is spread over the sheets received. Untick “Fully received” for a part delivery; the rest stays on the list. Post the receipts in Accounts → Journal and do not also record this purchase as an expense.</p>
 <div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Receive into stock</button></div></form>`;
 if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 $('#grn-form').onsubmit=e=>{e.preventDefault();try{
  const f=e.target.elements,date=f.date.value;if(!date||date>today())throw Error('Enter a receipt date that is not in the future.');
  // validate every line before saving anything
  const plan=$$('[data-grn-line]').map(tr=>{const index=Number(tr.dataset.grnLine),line=po.lines[index],choice=tr.querySelector('[data-grn-item]').value;
   if(choice==='__skip')return null;if(!choice)throw Error(`Line ${index+1}: choose a stock item, or “Not received now”.`);
   let item=choice==='__new'?{...itemFromPOLine(line),id:crypto.randomUUID(),created_at:new Date().toISOString()}:stockById(choice);
   const q=validateQuantity(item,tr.querySelector('[data-grn-qty]').value),cost=Math.round(Number(tr.querySelector('[data-grn-cost]').value)*100)/100;
   if(!(cost>0))throw Error(`Line ${index+1}: enter the cost of what was received.`);
   return {index,item,isNew:choice==='__new',q,cost,complete:tr.querySelector('[data-grn-complete]').checked};}).filter(Boolean);
  if(!plan.length)throw Error('Nothing selected to receive.');
  const refs=[];
  for(const p of plan){
   if(p.isNew){validateItem(p.item,stockItems);p.item.code=itemCode(p.item,stockItems);stockItems.push(p.item)}
   const consumable=p.item.category==='consumable';
   refs.push(addStockMove({item_id:p.item.id,type:'receipt',date,quantity:p.q,unit_cost:Math.round(p.cost/p.q*100)/100,value:consumable?0:p.cost,amount:consumable?p.cost:0,po_id:po.id,po_reference:po.reference,po_line:p.index,line_complete:p.complete,party:po.party,doc_reference:f.doc_reference.value.trim(),notes:''}).reference);
  }
  const done=!poReceiptStatus(po,stockMoves).pending;if(done)po.status='Received';
  $('#modal').close();render();toast(`${po.reference}: ${refs.join(', ')} received into stock.${done?' Purchase order fully received.':' Remaining lines stay on the list.'} Post them in Accounts → Journal.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}

// Scope of work: the job's own task list, changed with one click and saved straight away.
function scopeCard(j,locked){
 const scope=scopeOf(j),done=scope.filter(t=>t.status==='Done').length,applicable=scope.filter(t=>t.status!=='Not required').length;
 const staff=employees.filter(e=>employedOn(e,today())).sort((a,b)=>a.name.localeCompare(b.name));
 const missing=standardTasks.filter(([key])=>!scope.some(t=>t.key===key)).map(([,name])=>name);
 const label=s=>s==='Not required'?'N/A':s;
 return `<section class="card scope-card" style="margin-bottom:24px"><div class="cardhead"><div><h2>Scope of work</h2><p class="sub" style="margin-top:6px"><b>${scopeProgress(scope)}% complete</b> · ${done} of ${applicable} task${applicable===1?'':'s'} done${scope.length>applicable?` · ${scope.length-applicable} not required`:''}</p><div class="job-progress" aria-hidden="true"><i style="width:${scopeProgress(scope)}%"></i></div></div>${locked?'':`<div class="row scope-add"><select id="scope-add" aria-label="Task to add"><option value="">Add a task…</option>${[...missing,...extraTasks.filter(n=>!scope.some(t=>t.name===n))].map(n=>`<option>${esc(n)}</option>`).join('')}<option value="__custom">Custom task…</option></select><input id="scope-custom" type="text" maxlength="60" placeholder="Task name" hidden><button type="button" id="scope-add-btn">＋ Add task</button></div>`}</div>
 <ol class="scope-list">${scope.map((t,i)=>`<li class="scope-task ${t.status==='Done'?'is-done':t.status==='In progress'?'is-active':t.status==='Not required'?'is-na':''}"><span class="scope-num">${t.status==='Done'?'✓':i+1}</span><div class="scope-main"><b>${esc(t.name)}</b><small>${[t.status==='Done'&&t.done_at?`Done ${esc(t.done_at)}`:'',t.assignee_name?esc(t.assignee_name):''].filter(Boolean).join(' · ')||'&nbsp;'}</small></div>
 <div class="seg" role="group" aria-label="Status of ${esc(t.name)}">${taskStatuses.map(s=>`<button type="button" class="${t.status===s?'on '+s.toLowerCase().replace(/ /g,'-'):''}" data-task="${esc(t.id)}" data-status="${s}" ${locked?'disabled':''} aria-pressed="${t.status===s}">${label(s)}</button>`).join('')}</div>
 <div class="scope-progress">${t.status==='In progress'?`<input type="range" min="0" max="100" step="5" value="${taskProgress(t)}" data-task-progress="${esc(t.id)}" aria-label="Progress of ${esc(t.name)}" style="--p:${taskProgress(t)}%" ${locked?'disabled':''}><output>${taskProgress(t)}%</output>`:t.status==='Done'?'<span class="bar done"><i style="width:100%"></i></span><output>100%</output>':t.status==='Pending'?'<span class="bar"><i style="width:0"></i></span><output>0%</output>':''}</div>
 <select class="scope-who" data-task-who="${esc(t.id)}" aria-label="Assigned to" ${locked?'disabled':''}><option value="">Unassigned</option>${staff.map(e=>`<option value="${esc(e.id)}" ${e.id===t.assignee_id?'selected':''}>${esc(e.name)}</option>`).join('')}</select>
 <div class="scope-tools">${locked?'':`<button type="button" data-task-move="${esc(t.id)}" data-dir="-1" aria-label="Move ${esc(t.name)} up" ${i===0?'disabled':''}>↑</button><button type="button" data-task-move="${esc(t.id)}" data-dir="1" aria-label="Move ${esc(t.name)} down" ${i===scope.length-1?'disabled':''}>↓</button><button type="button" data-task-remove="${esc(t.id)}" aria-label="Remove ${esc(t.name)}" ${scope.length===1?'disabled':''}>×</button>`}</div></li>`).join('')}</ol></section>`;
}
function bindScope(j){
 const id=j.id;
 // keep unsaved form entries, then apply the scope change and save straight away
 const change=fn=>{let cur=workOrders.find(x=>x.id===id);if(cur.status!=='Completed')cur=saveJobLocally(cur,readJobForm(cur));const scope=fn(scopeOf(cur).map(t=>({...t})));saveJobLocally(cur,{scope,...legacyFromScope(scope)});render()};
 $$('[data-task][data-status]').forEach(b=>b.onclick=()=>change(scope=>scope.map(t=>{if(t.id!==b.dataset.task)return t;const status=b.dataset.status;return {...t,status,progress:status==='Done'?100:status==='In progress'?(Number(t.progress)>0&&Number(t.progress)<100?Number(t.progress):10):0,done_at:status==='Done'?(t.done_at||today()):''}})));
 // dragging shows the value; letting go saves it, and 100% marks the task done
 $$('[data-task-progress]').forEach(r=>{r.oninput=()=>{r.nextElementSibling.textContent=r.value+'%';r.style.setProperty('--p',r.value+'%')};r.onchange=()=>change(scope=>scope.map(t=>t.id!==r.dataset.taskProgress?t:Number(r.value)>=100?{...t,status:'Done',progress:100,done_at:t.done_at||today()}:{...t,progress:Number(r.value)}))});
 $$('[data-task-who]').forEach(sel=>sel.onchange=()=>change(scope=>scope.map(t=>t.id===sel.dataset.taskWho?{...t,assignee_id:sel.value,assignee_name:empById(sel.value)?.name||''}:t)));
 $$('[data-task-move]').forEach(b=>b.onclick=()=>change(scope=>{const i=scope.findIndex(t=>t.id===b.dataset.taskMove),k=i+Number(b.dataset.dir);if(k>=0&&k<scope.length)[scope[i],scope[k]]=[scope[k],scope[i]];return scope}));
 $$('[data-task-remove]').forEach(b=>b.onclick=()=>change(scope=>scope.length>1?scope.filter(t=>t.id!==b.dataset.taskRemove):scope));
 if(!$('#scope-add'))return;
 $('#scope-add').onchange=()=>{$('#scope-custom').hidden=$('#scope-add').value!=='__custom';if(!$('#scope-custom').hidden)$('#scope-custom').focus()};
 $('#scope-add-btn').onclick=()=>{
  const pick=$('#scope-add').value,name=(pick==='__custom'?$('#scope-custom').value:pick).trim();
  if(!name){toast(pick==='__custom'?'Type the task name.':'Choose a task to add.');return}
  const std=standardTasks.find(([,n])=>n===name);
  change(scope=>scope.some(t=>t.name.toLowerCase()===name.toLowerCase())?scope:[...scope,{id:std?std[0]:crypto.randomUUID(),key:std?std[0]:'',name,status:'Pending'}]);toast(`${name} added to the scope of work.`);
 };
}

function progressMeter(p){return `<div class="progress-meter ${p>=100?'full':''}" role="img" aria-label="Overall progress ${p}%"><i style="width:${p}%"></i><span>${p}%</span></div>`}

// Material used on a job, straight from its stock issues: item, quantity, weight and cost.
function materialUsedList(j){
 const issues=stockMoves.filter(m=>m.job_id===j.id&&m.type==='issue');
 if(!issues.length)return `<p class="help material-empty">Nothing issued from stock yet. Use <b>Issue from stock</b> in Material from stock below${j.material_owner==='Customer'?', or describe customer material in the notes':''}.</p>`;
 return `<ul class="material-used">${issues.map(m=>{const i=stockById(m.item_id),q=Math.abs(m.quantity),kg=sheetWeightKg(i);return `<li><b>${fmtQty(q,i)} × ${esc(i?.code||'')}</b><span>${esc(i?itemLabel(i):'')}${i?.owner==='Customer'?' · customer material':''}</span><span class="fine">${kg?(kg*q).toLocaleString('en-PK',{maximumFractionDigits:1})+' kg · ':''}${m.value?money(-m.value)+' · ':''}${esc(m.reference)} · ${esc(m.date)}</span></li>`}).join('')}</ul>`;
}

// Bank accounts: several per company, one default; each invoice or quotation can pick which one prints.
function bankAccountOptions(selected=''){
 const list=bankAccountsOf(company),def=defaultBankAccount(company);
 if(!list.length)return '<option value="">No bank account yet (add one in Settings)</option><option value="none">Don\'t print bank details</option>';
 return `<option value="" ${!selected?'selected':''}>Default: ${esc(bankAccountLabel(def))}</option>${list.map(a=>`<option value="${esc(a.id)}" ${a.id===selected?'selected':''}>${esc(bankAccountLabel(a))}</option>`).join('')}<option value="none" ${selected==='none'?'selected':''}>Don't print bank details</option>`;
}
function bankAccountsCard(){
 const list=bankAccountsOf(company);
 return `<section class="card"><div class="cardhead"><div><h2>Bank accounts</h2><p class="sub" style="margin-top:6px">Printed on invoices and quotations. Choose the account on each document; the default is used otherwise.</p></div><button class="primary" id="bank-add">＋ Add bank account</button></div>${list.length?`<div class="tablewrap"><table><thead><tr><th>ACCOUNT</th><th>BENEFICIARY</th><th>IBAN / ACCOUNT NO.</th><th>CURRENCY</th><th></th></tr></thead><tbody>${list.map(a=>`<tr><td class="ref">${esc(a.nickname||a.bank_name)}${a.is_default?' <span class="pill accepted">Default</span>':''}<small>${esc(a.nickname?a.bank_name:'')}${a.bank_branch?(a.nickname?' · ':'')+esc(a.bank_branch):''}</small></td><td>${esc(a.account_title)}</td><td>${esc(formatIBAN(a.iban)||'—')}<small>${esc(a.account_number||'')}${a.swift?' · SWIFT '+esc(a.swift):''}</small></td><td>${esc(a.currency||'PKR')}</td><td class="quote-actions"><button class="textbutton" data-bank-edit="${esc(a.id)}">Edit</button>${a.is_default?'':`<button class="textbutton" data-bank-default="${esc(a.id)}">Make default</button>`}<button class="textbutton danger" data-bank-delete="${esc(a.id)}">Delete</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No bank accounts yet. Add the accounts customers can pay into.</div>'}</section>`;
}
function saveBankAccounts(list){company={...company,bank_accounts:list};localStorage.setItem('sutluj-company',JSON.stringify(company))}
function bindBankAccounts(){
 $('#bank-add').onclick=()=>bankAccountEditor();
 $$('[data-bank-edit]').forEach(b=>b.onclick=()=>bankAccountEditor(b.dataset.bankEdit));
 $$('[data-bank-default]').forEach(b=>b.onclick=()=>{saveBankAccounts(bankAccountsOf(company).map(a=>({...a,is_default:a.id===b.dataset.bankDefault})));render();toast('Default bank account changed.')});
 $$('[data-bank-delete]').forEach(b=>b.onclick=()=>{
  const a=bankAccountsOf(company).find(x=>x.id===b.dataset.bankDelete),used=[...records,...invoices].filter(d=>d.bank_account_id===a.id).length,dialog=$('#delete-modal');
  dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">Delete bank account?</h2></div><form id="bank-delete-form"><p>Delete <b>${esc(bankAccountLabel(a))}</b>?</p>${used?`<p class="help">${used} document${used===1?'':'s'} chose this account; their PDFs will print the default account instead.</p>`:''}<div class="actions"><button type="button" id="bank-delete-cancel" autofocus>Cancel</button><button type="submit" class="delete-confirm">Delete account</button></div></form>`;
  dialog.showModal();$('#bank-delete-cancel').onclick=()=>dialog.close();
  $('#bank-delete-form').onsubmit=e=>{e.preventDefault();let list=bankAccountsOf(company).filter(x=>x.id!==a.id);if(a.is_default&&list.length)list=list.map((x,i)=>({...x,is_default:i===0}));saveBankAccounts(list);dialog.close();render();toast('Bank account deleted.')};
 });
}
function bankAccountEditor(id){
 const a=bankAccountsOf(company).find(x=>x.id===id)||{currency:'PKR',account_title:company.name,is_default:!bankAccountsOf(company).length};
 // a name saved before the list existed (e.g. "Meezan Bank") selects its listed bank
 const saved=String(a.bank_name||'').trim().toLowerCase(),match=pakistanBanks.find(b=>b.toLowerCase()===saved)||(saved?pakistanBanks.find(b=>b.toLowerCase().startsWith(saved)):null),other=!!saved&&!match;
 $('#modal').innerHTML=`<div class="modalhead"><h2>${id?'Edit':'Add'} bank account</h2><button class="close" aria-label="Close">×</button></div><form id="bank-form"><div class="formgrid">
 ${field('Nickname (optional)','nickname',a.nickname||'','text','maxlength="60" placeholder="e.g. Main PKR account, USD export"')}
 <label class="field">Bank name<select name="bank_name"><option value="">Select bank</option>${pakistanBanks.map(b=>`<option ${b===match?'selected':''}>${esc(b)}</option>`).join('')}<option value="__other" ${other?'selected':''}>Other (type the name)</option></select></label>
 <label class="field" id="bank-other" ${other?'':'hidden'}>Bank name (other)<input name="bank_name_other" maxlength="100" value="${other?esc(a.bank_name):''}"></label>
 ${field('Branch name / address','bank_branch',a.bank_branch||'','text','maxlength="200" placeholder="e.g. Gulberg Branch, 12 Main Boulevard, Lahore"')}
 ${field('Beneficiary name (account title)','account_title',a.account_title||'','text','maxlength="120"')}
 ${field('Beneficiary address','beneficiary_address',a.beneficiary_address||'','text','maxlength="200" placeholder="Defaults to the business address"')}
 ${field('Account number','account_number',a.account_number||'','text','maxlength="30"')}
 <label class="field">IBAN<input name="iban" maxlength="40" value="${esc(formatIBAN(a.iban))}" placeholder="PK00 ABCD 0000 0000 0000 0000" autocomplete="off"><small class="fine" id="iban-check"></small></label>
 ${field('SWIFT / BIC code','swift',a.swift||'','text','maxlength="11" placeholder="8 or 11 characters"')}
 <label class="field">Currency<select name="currency">${bankCurrencies.map(x=>`<option ${x===(a.currency||'PKR')?'selected':''}>${x}</option>`).join('')}</select></label>
 <label class="field check full"><input type="checkbox" name="is_default" ${a.is_default?'checked':''}> Default account for new invoices and quotations</label></div>
 <div id="bank-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save bank account</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#bank-form').elements;
 f.bank_name.onchange=()=>{$('#bank-other').hidden=f.bank_name.value!=='__other';if(!$('#bank-other').hidden)f.bank_name_other.focus()};
 const check=()=>{const p=ibanProblem(f.iban.value);$('#iban-check').textContent=!f.iban.value.trim()?'':p||'IBAN check digits are valid.';$('#iban-check').className=p?'fine late':'fine ok'};f.iban.oninput=check;check();
 $('#bank-form').onsubmit=e=>{e.preventDefault();$('#bank-error').textContent='';try{
  const d=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,String(v).trim()]));
  const next={id:a.id||crypto.randomUUID(),nickname:d.nickname,bank_name:d.bank_name==='__other'?d.bank_name_other:d.bank_name,bank_branch:d.bank_branch,account_title:d.account_title,beneficiary_address:d.beneficiary_address,account_number:d.account_number,iban:compactIBAN(d.iban),swift:d.swift.toUpperCase(),currency:d.currency,is_default:!!d.is_default};
  const problem=bankAccountProblem(next);if(problem)throw Error(problem);
  let list=bankAccountsOf(company);list=id?list.map(x=>x.id===id?next:x):[...list,next];
  if(next.is_default)list=list.map(x=>({...x,is_default:x.id===next.id}));else if(!list.some(x=>x.is_default))list=list.map((x,i)=>({...x,is_default:i===0}));
  saveBankAccounts(list);$('#modal').close();render();toast(`${bankAccountLabel(next)} saved.`);
 }catch(err){$('#bank-error').textContent=err.message}};
}

// Quotation terms: payment terms and validity periods kept in Settings and picked on each quotation.
function validityPicker(r){
 const opts=validityOptionsOf(company),days=r.valid_until&&r.date?daysBetweenDates(r.date,r.valid_until):null,preset=opts.includes(days)?days:'custom';
 return `<label class="field">Quotation validity<select id="validity-pick">${opts.map(n=>`<option value="${n}" ${preset===n?'selected':''}>${n} days${n===Number(company.validity_days)?' (default)':''}</option>`).join('')}<option value="custom" ${preset==='custom'?'selected':''}>Custom date</option></select></label>`;
}
function paymentTermsPicker(r){
 const list=paymentTermsOf(company),cur=String(r.payment_terms||'').trim(),custom=!!cur&&!list.includes(cur);
 return `<label class="field">Payment terms<select name="payment_terms">${!cur?'<option value="">Select payment terms</option>':''}${list.map(t=>`<option ${t===cur?'selected':''}>${esc(t)}</option>`).join('')}<option value="__custom" ${custom?'selected':''}>Custom…</option></select></label>
 <label class="field" id="terms-custom" ${custom?'':'hidden'}>Custom payment terms<input name="payment_terms_custom" maxlength="150" value="${custom?esc(cur):''}" placeholder="e.g. 40% advance, 60% within 10 days"></label>`;
}
function bindQuoteTermsPickers(){
 const form=$('#recordform'),pick=$('#validity-pick'),date=form.elements.date,until=form.elements.valid_until,terms=form.elements.payment_terms;
 const apply=()=>{if(pick.value!=='custom'&&date.value)until.value=addDays(date.value,Number(pick.value))};
 pick.onchange=()=>{apply();if(pick.value==='custom')until.focus()};
 date.addEventListener('change',apply);
 until.addEventListener('input',()=>{const d=date.value&&until.value?daysBetweenDates(date.value,until.value):null;pick.value=[...pick.options].some(o=>o.value===String(d))?String(d):'custom'});
 terms.onchange=()=>{$('#terms-custom').hidden=terms.value!=='__custom';if(!$('#terms-custom').hidden)form.elements.payment_terms_custom.focus()};
 // a customer with default payment terms fills them in
 form.addEventListener('party-chosen',e=>{const t=e.detail?.payment_terms;if(!t)return;if([...terms.options].some(o=>o.value===t))terms.value=t;else{terms.value='__custom';form.elements.payment_terms_custom.value=t}terms.onchange();toast(`Payment terms set from ${e.detail.name}: ${t}`)});
}
function quoteTermsCard(){
 const terms=paymentTermsOf(company),days=validityOptionsOf(company);
 return `<section class="card"><div class="cardhead"><div><h2>Quotation terms</h2><p class="sub" style="margin-top:6px">Payment terms and validity periods offered when preparing a quotation. Lead time is entered on each quotation.</p></div></div><div class="cardbody">
 <div class="linehead">PAYMENT TERMS</div><ul class="option-list">${terms.map(t=>`<li><span>${esc(t)}</span>${t===company.payment_terms?'<span class="pill accepted">Default</span>':`<button type="button" class="textbutton" data-term-default="${esc(t)}">Make default</button>`}${t===company.payment_terms?'':`<button type="button" class="textbutton danger" data-term-remove="${esc(t)}">Remove</button>`}</li>`).join('')}</ul>
 <div class="row option-add"><input id="term-new" maxlength="150" placeholder="Add payment terms, e.g. 30% advance, 70% on delivery" aria-label="New payment terms"><button type="button" id="term-add">＋ Add</button></div>
 <div class="linehead" style="margin-top:24px">QUOTATION VALIDITY</div><div class="chips">${days.map(n=>`<span class="chip ${n===Number(company.validity_days)?'selected':''}">${n} days${n===Number(company.validity_days)?' · default':` <button type="button" class="chip-action" data-validity-default="${n}" title="Make default">★</button><button type="button" class="chip-action" data-validity-remove="${n}" aria-label="Remove ${n} days">×</button>`}</span>`).join('')}</div>
 <div class="row option-add"><input id="validity-new" type="number" min="1" max="365" step="1" placeholder="Days, e.g. 45" aria-label="New validity in days"><button type="button" id="validity-add">＋ Add</button></div>
 <div id="terms-error" class="error" role="alert"></div></div></section>`;
}
function saveCompanyPatch(patch,message){company={...company,...patch};localStorage.setItem('sutluj-company',JSON.stringify(company));render();toast(message)}
function bindQuoteTerms(){
 const error=m=>{$('#terms-error').textContent=m};
 $('#term-add').onclick=()=>{const t=$('#term-new').value.trim();if(!t)return error('Type the payment terms to add.');if(paymentTermsOf(company).some(x=>x.toLowerCase()===t.toLowerCase()))return error('These payment terms are already in the list.');saveCompanyPatch({payment_terms_options:[...paymentTermsOf(company),t]},'Payment terms added.')};
 $('#term-new').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('#term-add').click()}};
 $$('[data-term-default]').forEach(b=>b.onclick=()=>saveCompanyPatch({payment_terms:b.dataset.termDefault,payment_terms_options:paymentTermsOf(company)},'Default payment terms changed.'));
 $$('[data-term-remove]').forEach(b=>b.onclick=()=>saveCompanyPatch({payment_terms_options:paymentTermsOf(company).filter(t=>t!==b.dataset.termRemove)},'Payment terms removed. Quotations that used them keep their wording.'));
 $('#validity-add').onclick=()=>{const n=Number($('#validity-new').value);if(!Number.isInteger(n)||n<1||n>365)return error('Enter a validity between 1 and 365 days.');if(validityOptionsOf(company).includes(n))return error(`${n} days is already in the list.`);saveCompanyPatch({validity_options:[...validityOptionsOf(company),n]},`${n} days added.`)};
 $('#validity-new').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('#validity-add').click()}};
 $$('[data-validity-default]').forEach(b=>b.onclick=()=>saveCompanyPatch({validity_days:Number(b.dataset.validityDefault),validity_options:validityOptionsOf(company)},'Default validity changed.'));
 $$('[data-validity-remove]').forEach(b=>b.onclick=()=>saveCompanyPatch({validity_options:validityOptionsOf(company).filter(n=>n!==Number(b.dataset.validityRemove))},'Validity removed.'));
}

// Customers and vendors: full records with address, tax registration, commercial terms and bank details.
// The cloud tables hold only name, contact, phone, email and address, so the other fields are local-only.
const provinces=['Punjab','Sindh','Khyber Pakhtunkhwa','Balochistan','Islamabad Capital Territory','Gilgit-Baltistan','Azad Jammu & Kashmir'];
const supplyCategories=['Steel / sheet metal','Industrial gas','Consumables','Machine services','Transport','Outsourced fabrication','Other'];
const partyBaseFields=['name','contact','phone','email','address'];
let partyFilter='Active';
const partyMeta=kind=>kind==='customers'?{one:'customer',title:'Customers',prefix:'CUS',eyebrow:'BUSINESS CONTACTS',sub:'People and businesses you quote for and invoice.',table:'customers'}:{one:'vendor',title:'Vendors',prefix:'VEN',eyebrow:'BUSINESS CONTACTS',sub:'Suppliers of material, gas, consumables and services.',table:'vendors'};
const partyList=kind=>kind==='customers'?customers:vendors;
function setPartyList(kind,list){if(kind==='customers')customers=list;else vendors=list}
function partyCity(c){return [c.city,c.province&&c.province!=='Islamabad Capital Territory'?c.province:''].filter(Boolean).join(', ')}
function customerBalance(name){return invoices.filter(i=>i.party===name).reduce((n,i)=>n+Math.round(invoiceBalance(i,payments).due*100),0)/100}
function vendorOpenPOs(name){const pos=records.filter(r=>r.kind==='purchase'&&r.party===name&&['Draft','Ordered'].includes(r.status));return {count:pos.length,value:pos.reduce((n,r)=>n+Number(r.amount),0)}}
function partyPage(kind){
 const m=partyMeta(kind),list=partyList(kind),active=list.filter(c=>c.status!=='Inactive');
 const extra=kind==='customers'?stat('Receivable',money(active.reduce((n,c)=>n+customerBalance(c.name),0)),'Outstanding on invoices','accounts')+stat('With NTN / STRN',String(active.filter(c=>c.ntn||c.strn).length),'For sales tax invoices','accounts'):stat('Open purchase orders',money(active.reduce((n,c)=>n+vendorOpenPOs(c.name).value,0)),'Draft and ordered','procurement')+stat('With bank details',String(active.filter(c=>c.iban||c.account_number).length),'Ready to pay','accounts');
 return `<div class="heading"><div><div class="eyebrow">${m.eyebrow}</div><h1>${m.title}</h1><p class="sub">${m.sub}</p></div><button class="primary" id="party-add">＋ Add ${m.one}</button></div>
 <div class="stats">${stat(`Active ${m.title.toLowerCase()}`,String(active.length),`${list.length-active.length} inactive`,kind)}${stat('Cities',String(new Set(active.map(c=>c.city).filter(Boolean)).size),'Where they are based',kind)}${extra}</div>
 <div class="chips">${['Active','Inactive','All'].map(k=>`<button class="chip ${partyFilter===k?'selected':''}" data-party-filter="${k}">${k} <span>${k==='All'?list.length:k==='Active'?active.length:list.length-active.length}</span></button>`).join('')}</div>
 <section class="card"><div class="toolbar"><input id="party-search" class="search" type="search" placeholder="Search name, code, contact, city, phone, NTN…" aria-label="Search ${m.title.toLowerCase()}"><button id="party-csv">Export CSV</button></div><div id="party-rows">${partyRows(kind,'')}</div></section>
 <p class="help">${session?'Name, contact, phone, email and address are saved to Supabase; other details are kept in this browser only.':'Saved in this browser and included in backups.'} Editing or deleting does not change existing quotes, invoices or purchase orders, which keep the name they were issued with.</p>`;
}
function partyRows(kind,term){
 const t=term.trim().toLowerCase(),list=partyList(kind).filter(c=>partyFilter==='All'||(partyFilter==='Inactive')===(c.status==='Inactive')).filter(c=>[c.code,c.name,c.contact,c.city,c.phone,c.mobile,c.email,c.ntn,c.strn,c.supply_category].join(' ').toLowerCase().includes(t)).sort((a,b)=>a.name.localeCompare(b.name));
 if(!list.length)return `<div class="empty">${t?'No matches.':`No ${partyMeta(kind).title.toLowerCase()} here yet.`}</div>`;
 const isC=kind==='customers';
 return `<div class="tablewrap"><table class="party-table"><thead><tr><th>${isC?'CUSTOMER':'VENDOR'}</th><th>CONTACT</th><th>CITY</th><th>TAX</th><th>${isC?'TERMS':'SUPPLIES'}</th><th class="money">${isC?'BALANCE DUE':'OPEN POs'}</th><th></th></tr></thead><tbody>${list.map(c=>{const due=isC?customerBalance(c.name):0,po=isC?null:vendorOpenPOs(c.name);return `<tr class="${c.status==='Inactive'?'is-inactive':''}"><td class="ref">${esc(c.name)}${c.status==='Inactive'?' <span class="pill">Inactive</span>':''}<small>${esc(c.code||'')}${c.type==='Individual'?' · Individual':''}</small></td><td>${esc(c.contact||'—')}${c.designation?`<small>${esc(c.designation)}</small>`:''}<small>${esc([c.phone||c.mobile,c.email].filter(Boolean).join(' · '))}</small></td><td>${esc(partyCity(c)||'—')}</td><td>${c.ntn?`NTN ${esc(c.ntn)}`:'—'}${c.strn?`<small>STRN ${esc(c.strn)}</small>`:''}${c.atl==='Yes'?'<small>Active taxpayer</small>':''}</td><td>${esc(isC?(c.payment_terms||'—'):(c.supply_category||'—'))}${isC&&Number(c.credit_limit)?`<small>Limit ${money(c.credit_limit)}</small>`:''}</td><td class="money">${isC?(due?`<b class="${Number(c.credit_limit)&&due>Number(c.credit_limit)?'late':''}">${money(due)}</b>`:'—'):(po.count?`${money(po.value)}<small>${po.count} open</small>`:'—')}</td><td class="quote-actions">${isC?`<button class="textbutton" data-statement="${esc(c.name)}">Statement</button>`:''}<button class="textbutton" data-party-edit="${esc(c.id)}">Edit</button><button class="textbutton danger" data-party-delete="${esc(c.id)}">Delete</button></td></tr>`}).join('')}</tbody></table></div>`;
}
function bindParties(kind){
 const bind=()=>{bindStatements();$$('[data-party-edit]').forEach(b=>b.onclick=()=>partyEditor(kind,b.dataset.partyEdit));$$('[data-party-delete]').forEach(b=>b.onclick=()=>deleteParty(kind,b.dataset.partyDelete))};
 $('#party-add').onclick=()=>partyEditor(kind);
 $('#party-search').oninput=e=>{$('#party-rows').innerHTML=partyRows(kind,e.target.value);bind()};
 $$('[data-party-filter]').forEach(b=>b.onclick=()=>{partyFilter=b.dataset.partyFilter;$$('[data-party-filter]').forEach(c=>c.classList.toggle('selected',c===b));$('#party-rows').innerHTML=partyRows(kind,$('#party-search').value);bind()});
 $('#party-csv').onclick=()=>{const rows=partyList(kind);downloadCSV(`sutluj-${kind}-${today()}.csv`,[['Code','Name','Type','Status','Contact','Designation','Phone','Mobile','Email','Website','Address','City','Province','Country','NTN','STRN','CNIC','Active taxpayer',kind==='customers'?'Payment terms':'Supplies','Credit limit','Bank','Account title','Account number','IBAN','Branch','Notes'],...rows.map(c=>[c.code,c.name,c.type,c.status||'Active',c.contact,c.designation,c.phone,c.mobile,c.email,c.website,c.address,c.city,c.province,c.country,c.ntn,c.strn,c.cnic,c.atl,kind==='customers'?c.payment_terms:c.supply_category,c.credit_limit,c.bank_name,c.account_title,c.account_number,c.iban,c.bank_branch,c.notes].map(v=>v??''))]);toast(`Exported ${rows.length} ${kind}.`)};
 bind();
}
function partyEditor(kind,id){
 const m=partyMeta(kind),list=partyList(kind),c=list.find(x=>x.id===id)||{type:'Company',status:'Active',country:'Pakistan'},isC=kind==='customers',local=!session;
 const opt=(arr,v,blank)=>`${blank!=null?`<option value="">${blank}</option>`:''}${arr.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}`;
 const savedBank=String(c.bank_name||'').trim().toLowerCase(),bankMatch=pakistanBanks.find(b=>b.toLowerCase()===savedBank)||(savedBank?pakistanBanks.find(b=>b.toLowerCase().startsWith(savedBank)):null),bankOther=!!savedBank&&!bankMatch;
 const terms=paymentTermsOf(company);
 // fields sit on a 6-column grid; w(n,html) sets how many columns a field spans
 const w=(n,html)=>html.replace('class="field','class="field s'+n);
 const cities=['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Gujranwala','Sialkot','Multan','Peshawar','Quetta','Hyderabad','Sheikhupura','Kasur','Gujrat'];
 $('#modal').innerHTML=`<div class="modalhead"><h2>${id?`Edit ${m.one}${c.code?' · '+esc(c.code):''}`:`New ${m.one}`}</h2><button class="close" aria-label="Close">×</button></div><form id="party-form" class="party-form">
 <div class="linehead">GENERAL</div><div class="formgrid">
 ${w(local?3:6,field(`${isC?'Customer':'Vendor'} / company name`,'name',c.name||'','text','required maxlength="150"'))}
 ${local?`<label class="field s1">Type<select name="type">${opt(['Company','Individual'],c.type||'Company')}</select></label><label class="field s2">Status<select name="status" title="Inactive ${kind} are hidden from new ${isC?'quotes':'purchase orders'}.">${opt(['Active','Inactive'],c.status||'Active')}</select></label>`:''}
 ${w(local?2:3,field('Contact person','contact',c.contact||'','text','maxlength="150"'))}${local?w(2,field('Designation','designation',c.designation||'','text','maxlength="100" placeholder="e.g. Purchase Manager"')):''}
 ${w(local?1:3,field('Phone','phone',c.phone||'','tel','maxlength="60"'))}${local?w(1,field('Mobile / WhatsApp','mobile',c.mobile||'','tel','maxlength="60"')):''}
 ${w(local?3:6,field('Email','email',c.email||'','email','maxlength="254"'))}${local?w(3,field('Website','website',c.website||'','text','maxlength="150"')):''}</div>
 <div class="linehead">ADDRESS</div><div class="formgrid">${w(local?3:6,field('Street address','address',c.address||'','text','maxlength="300"'))}
 ${local?`${w(1,field('City','city',c.city||'','text','maxlength="80" list="pk-cities"'))}<datalist id="pk-cities">${cities.map(x=>`<option value="${x}">`).join('')}</datalist><label class="field s1">Province<select name="province">${opt(provinces,c.province,'Select')}</select></label>${w(1,field('Country','country',c.country||'Pakistan','text','maxlength="60"'))}`:''}</div>
 ${local?`<div class="linehead">TAX REGISTRATION</div><div class="formgrid">${w(2,field('NTN','ntn',c.ntn||'','text','maxlength="20" placeholder="e.g. 1234567-8"'))}${w(2,field('STRN (sales tax)','strn',c.strn||'','text','maxlength="20" placeholder="e.g. 32-77-8761-234-56"'))}
 ${w(1,field('CNIC (individuals)','cnic',c.cnic||'','text','maxlength="15" placeholder="12345-1234567-1"'))}<label class="field s1">Active taxpayer <span class="hint" title="Check FBR’s Active Taxpayer List (ATL); it affects withholding tax rates.">ⓘ</span><select name="atl">${opt(['Yes','No'],c.atl,'Not checked')}</select></label></div>
 <div class="linehead">COMMERCIAL</div><div class="formgrid">${isC?`<label class="field s3">Default payment terms <span class="hint" title="Filled in when this customer is chosen on a quotation.">ⓘ</span><select name="payment_terms">${opt(terms.includes(c.payment_terms)||!c.payment_terms?terms:[...terms,c.payment_terms],c.payment_terms,'Use the quotation default')}</select></label>${w(3,field('Credit limit (PKR)','credit_limit',c.credit_limit||'','number','min="0" max="1000000000" step="1" placeholder="Optional"'))}`:`<label class="field s3">Supplies<select name="supply_category">${opt(supplyCategories,c.supply_category,'Select')}</select></label><label class="field s3">Payment terms<input name="payment_terms" maxlength="150" value="${esc(c.payment_terms||'')}" placeholder="e.g. 30 days credit"></label>`}</div>
 <div class="linehead">BANK DETAILS</div><div class="formgrid"><label class="field s2">Bank name<select name="bank_name"><option value="">Select bank</option>${pakistanBanks.map(b=>`<option ${b===bankMatch?'selected':''}>${esc(b)}</option>`).join('')}<option value="__other" ${bankOther?'selected':''}>Other (type the name)</option></select></label>
 <label class="field s2" id="party-bank-other" ${bankOther?'':'hidden'}>Bank name (other)<input name="bank_name_other" maxlength="100" value="${bankOther?esc(c.bank_name):''}"></label>
 ${w(2,field('Account title','account_title',c.account_title||'','text','maxlength="120"'))}${w(2,field('Account number','account_number',c.account_number||'','text','maxlength="30"'))}
 <label class="field s3">IBAN<input name="iban" maxlength="40" value="${esc(formatIBAN(c.iban))}" placeholder="PK00 ABCD 0000 0000 0000 0000" autocomplete="off"><small class="fine" id="party-iban-check"></small></label>${w(3,field('Branch','bank_branch',c.bank_branch||'','text','maxlength="200"'))}</div>
 <div class="linehead">NOTES</div><label class="field"><textarea name="notes" rows="2" maxlength="2000" placeholder="Delivery instructions, gate timings, preferred contact…">${esc(c.notes||'')}</textarea></label>`:''}
 <div id="party-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save ${m.one}</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#party-form'),f=form.elements;
 if(f.bank_name)f.bank_name.onchange=()=>{$('#party-bank-other').hidden=f.bank_name.value!=='__other';if(!$('#party-bank-other').hidden)f.bank_name_other.focus()};
 if(f.iban){const check=()=>{const p=ibanProblem(f.iban.value);$('#party-iban-check').textContent=!f.iban.value.trim()?'':p||'IBAN check digits are valid.';$('#party-iban-check').className=p?'fine late':'fine ok'};f.iban.oninput=check;check()}
 form.onsubmit=async e=>{e.preventDefault();$('#party-error').textContent='';const btn=form.querySelector('[type=submit]');try{
  const d=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v).trim()]));
  if(!d.name)throw Error(`Enter the ${m.one} name.`);
  if(list.some(x=>x.id!==id&&x.name.toLowerCase()===d.name.toLowerCase()))throw Error(`A ${m.one} with this name already exists.`);
  if(local){
   if(d.cnic&&!/^\d{5}-\d{7}-\d$/.test(d.cnic))throw Error('Enter the CNIC as 12345-1234567-1, or leave it blank.');
   if(d.ntn&&!/^[0-9A-Z-]{7,15}$/i.test(d.ntn))throw Error('Enter the NTN as digits (and a dash), e.g. 1234567-8.');
   if(d.bank_name==='__other')d.bank_name=d.bank_name_other;delete d.bank_name_other;
   d.iban=compactIBAN(d.iban);const ib=ibanProblem(d.iban);if(ib)throw Error(ib);
   if(d.credit_limit!=null)d.credit_limit=d.credit_limit===''?'':Number(d.credit_limit);
  }
  btn.disabled=true;let saved;
  if(session){const base=Object.fromEntries(partyBaseFields.map(k=>[k,d[k]||''])),result=await api(`/rest/v1/${m.table}${id?`?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(c.updated_at)}`:''}`,{method:id?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(id?base:{...base,owner_id:session.user.id})});if(!result?.length)throw Error(`This ${m.one} changed in another browser. Close this form and refresh.`);saved=result[0]}
  else saved={...c,...d,id:id||crypto.randomUUID(),code:c.code||nextReference(m.prefix,list,'code')};
  setPartyList(kind,id?list.map(x=>x.id===id?saved:x):[...list,saved]);$('#modal').close();render();toast(`${saved.name} saved.`);
 }catch(err){$('#party-error').textContent=err.message}finally{btn.disabled=false}};
}
function deleteParty(kind,id){
 const m=partyMeta(kind),c=partyList(kind).find(x=>x.id===id);if(!c)return;
 const used=kind==='customers'?records.filter(r=>['quote','enquiry'].includes(r.kind)&&r.party===c.name).length+invoices.filter(i=>i.party===c.name).length:records.filter(r=>r.kind==='purchase'&&r.party===c.name).length;
 const dialog=$('#delete-modal');
 dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">Delete ${m.one}?</h2></div><form id="party-delete-form"><p>Delete <b>${esc(c.name)}</b>${c.code?` (${esc(c.code)})`:''}?</p>${used?`<p class="help">${used} document${used===1?' uses':'s use'} this name. They keep it, but the contact, tax and bank details here will be gone. ${session?'':'Marking the '+m.one+' Inactive keeps the details and hides it from new documents.'}</p>`:''}<div id="party-delete-error" class="error" role="alert"></div><div class="actions"><button type="button" id="party-delete-cancel" autofocus>Cancel</button>${used&&!session?'<button type="button" id="party-deactivate">Mark inactive</button>':''}<button type="submit" class="delete-confirm">Delete ${m.one}</button></div></form>`;
 dialog.showModal();$('#party-delete-cancel').onclick=()=>dialog.close();
 if($('#party-deactivate'))$('#party-deactivate').onclick=()=>{setPartyList(kind,partyList(kind).map(x=>x.id===id?{...x,status:'Inactive'}:x));dialog.close();render();toast(`${c.name} marked inactive.`)};
 $('#party-delete-form').onsubmit=async e=>{e.preventDefault();try{if(session){const r=await api(`/rest/v1/${m.table}?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(c.updated_at)}`,{method:'DELETE',headers:{Prefer:'return=representation'}});if(!r?.length)throw Error('This record changed or was deleted. Refresh and try again.')}setPartyList(kind,partyList(kind).filter(x=>x.id!==id));dialog.close();render();toast(`${c.name} deleted.`)}catch(err){$('#party-delete-error').textContent=err.message}};
}

// Scrap yard and scrap sales: scrap is collected into one bin per material (kg, no stock value) and
// sold by weight. Sales are numbered SS-YYYY-NNNN, reduce the bins, and post to Scrap Sales (4302).
function scrapBin(material){
 let bin=stockItems.find(i=>i.category==='scrap'&&i.material===material);
 if(!bin){bin={id:crypto.randomUUID(),category:'scrap',owner:'Business',customer:'',material,unit:'kg',reorder_level:0,location:'',created_at:new Date().toISOString()};bin.code=itemCode(bin,stockItems);stockItems.push(bin)}
 return bin;
}
function scrapBins(){return stockItems.filter(i=>i.category==='scrap').sort((a,b)=>String(a.code).localeCompare(String(b.code)))}
const scrapOnHand=()=>Object.fromEntries(scrapBins().map(b=>[b.id,balanceOf(b.id,stockMoves).qty]));
const scrapPosted=(kind,id)=>journals.some(j=>j.source_kind===kind&&j.source_id===id);
function scrapQueue(){return [...scrapSales.map(s=>({...s,source_kind:'scrapsale',label:`${s.reference} · Scrap sale`,party:s.buyer,amount:s.amount})),...scrapSales.filter(s=>s.method==='Credit'&&s.received_date).map(s=>({...s,source_kind:'scrapreceipt',label:`${s.reference} · Scrap sale received`,date:s.received_date,party:s.received_method,amount:s.amount}))]}
function scrapYard(term=''){
 const t=today(),month=t.slice(0,7),bins=scrapBins(),hand=scrapOnHand();
 const monthSales=scrapSales.filter(s=>s.date.startsWith(month)),soldKg=monthSales.reduce((n,s)=>n+scrapSaleTotals(s.lines).kg,0),soldPKR=monthSales.reduce((n,s)=>n+Number(s.amount),0);
 const generated=stockMoves.filter(m=>m.type==='scrap'&&m.date.startsWith(month)).reduce((n,m)=>n+Number(m.quantity),0);
 const est=bins.reduce((n,b)=>n+hand[b.id]*lastRate(scrapSales,b.material),0),onHandKg=bins.reduce((n,b)=>n+hand[b.id],0);
 const fmtKg=kg=>`${Number(kg).toLocaleString('en-PK',{maximumFractionDigits:2})} kg`;
 const q=term.trim().toLowerCase(),sales=[...scrapSales].filter(s=>`${s.reference} ${s.buyer} ${s.vehicle_no||''} ${s.weighbridge_slip||''}`.toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date)||String(b.reference).localeCompare(String(a.reference)));
 return `<div class="scrap-stats"><div><span>In the yard</span><b>${fmtKg(onHandKg)}</b><small>≈ ${money(Math.round(est))} at last rates</small></div><div><span>Sold this month</span><b>${money(soldPKR)}</b><small>${fmtKg(soldKg)} in ${monthSales.length} sale${monthSales.length===1?'':'s'}</small></div><div><span>Average rate</span><b>${averageRate(scrapSales)?money(averageRate(scrapSales))+' / kg':'—'}</b><small>All scrap sales</small></div><div><span>Generated this month</span><b>${fmtKg(generated)}</b><small>From jobs and collections</small></div></div>
 <div class="scrap-head"><h3>Scrap yard</h3><div class="row"><button type="button" id="scrap-weigh">⚖ Weigh yard</button><button type="button" id="scrap-record">＋ Record scrap</button><button type="button" class="primary" id="scrap-sell">Sell scrap</button></div></div>
 ${bins.length?`<div class="tablewrap"><table><thead><tr><th>SCRAP BIN</th><th class="money">IN THE YARD</th><th class="money">LAST RATE</th><th class="money">EST. VALUE</th><th></th></tr></thead><tbody>${bins.map(b=>{const kg=hand[b.id],rate=lastRate(scrapSales,b.material);return `<tr><td class="ref">${esc(itemLabel(b))}<small>${esc(b.code)}</small></td><td class="money"><b>${fmtKg(kg)}</b></td><td class="money">${rate?money(rate)+' / kg':'—'}</td><td class="money">${rate&&kg?money(Math.round(kg*rate)):'—'}</td><td class="quote-actions"><button class="textbutton" data-scrap-sell="${esc(b.id)}">Sell</button>${kg>0?`<button class="textbutton" data-stock-dispose="${esc(b.id)}">Dispose</button>`:''}<button class="textbutton" data-stock-history="${esc(b.id)}">History</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No scrap yet. It is added when you record skeleton scrap on a job, or with Record scrap.</div>'}
 <div class="scrap-head" style="margin-top:8px"><h3>Scrap sales</h3><span class="fine">${scrapSales.length} sale${scrapSales.length===1?'':'s'} · ${money(scrapSales.reduce((n,s)=>n+Number(s.amount),0))} in total</span></div>
 ${sales.length?`<div class="tablewrap"><table class="invoice-table"><thead><tr><th>SALE</th><th>BUYER</th><th>MATERIAL</th><th class="money">KG</th><th class="money">AMOUNT</th><th>PAYMENT</th><th>ACCOUNTS</th><th></th></tr></thead><tbody>${sales.map(s=>{const tt=scrapSaleTotals(s.lines,s.tax),open=s.method==='Credit'&&!s.received_date;return `<tr><td class="ref">${esc(s.reference)}<small>${esc(s.date)}</small></td><td>${esc(s.buyer)}<small>${esc([s.vehicle_no&&'Vehicle '+s.vehicle_no,s.weighbridge_slip&&'Slip '+s.weighbridge_slip].filter(Boolean).join(' · '))}</small></td><td>${s.lines.map(l=>`${esc(l.label)}<small>${fmtKg(l.kg)} × ${money(l.rate)}</small>`).join('')}</td><td class="money">${fmtKg(tt.kg)}</td><td class="money"><b>${money(s.amount)}</b>${tt.tax?`<small>incl. ${money(tt.tax)} tax</small>`:''}</td><td>${open?badge('Credit'):badge('Received')}<small>${esc(open?'Awaiting payment':s.method==='Credit'?`${s.received_method} · ${s.received_date}`:s.method)}</small></td><td>${scrapPosted('scrapsale',s.id)&&(s.method!=='Credit'||!s.received_date||scrapPosted('scrapreceipt',s.id))?badge('Posted'):badge('Pending')}</td><td class="quote-actions"><button class="textbutton" data-scrap-pdf="${esc(s.id)}">PDF</button>${open?`<button class="textbutton" data-scrap-receive="${esc(s.id)}">Mark received</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">${q?'No matching sales.':'No scrap sales yet.'}</div>`}`;
}
function bindScrapYard(){
 if($('#scrap-record'))$('#scrap-record').onclick=scrapCollectEditor;
 if($('#scrap-weigh'))$('#scrap-weigh').onclick=scrapWeighEditor;
 if($('#scrap-sell'))$('#scrap-sell').onclick=()=>scrapSaleEditor();
 $$('[data-scrap-sell]').forEach(b=>b.onclick=()=>scrapSaleEditor(b.dataset.scrapSell));
 $$('[data-scrap-receive]').forEach(b=>b.onclick=()=>scrapReceiveEditor(b.dataset.scrapReceive));
 $$('[data-scrap-pdf]').forEach(b=>b.onclick=()=>downloadScrapSalePDF(scrapSales.find(s=>s.id===b.dataset.scrapPdf),b));
}
function scrapCollectEditor(){
 const jobs=workOrders.filter(j=>j.status!=='Completed');
 $('#modal').innerHTML=`<div class="modalhead"><h2>Record scrap</h2><button class="close" aria-label="Close">×</button></div><form id="scrap-collect"><div class="formgrid">
 <label class="field">Material<select name="material" required>${Object.entries(materials).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>${field('Weight (kg)','kg','','number','required min="0.01" max="1000000" step="0.01"')}
 ${select('Source','source',['Workshop collection','Remnant scrapped','Rejected parts','Job skeleton'],'Workshop collection')}<label class="field">Job (optional)<select name="job_id"><option value="">Not linked to a job</option>${jobs.map(j=>`<option value="${esc(j.id)}">${esc(j.reference)} · ${esc(j.party)}</option>`).join('')}</select></label>
 ${field('Date','date',today(),'date',`required max="${today()}"`)}${field('Notes','notes','','text','maxlength="300"')}</div>
 <p class="help">Adds weighed scrap to the material's scrap bin. Scrap carries no stock value; it becomes revenue when sold.</p><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Record scrap</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 $('#scrap-collect').onsubmit=e=>{e.preventDefault();try{const f=Object.fromEntries(new FormData(e.target)),kg=Math.round(Number(f.kg)*100)/100;if(!(kg>0))throw Error('Enter the weight in kg.');if(f.date>today())throw Error('The date cannot be in the future.');
  const bin=scrapBin(f.material),job=workOrders.find(j=>j.id===f.job_id);const m=addStockMove({item_id:bin.id,type:'scrap',date:f.date,quantity:kg,job_id:job?.id||'',job_reference:job?.reference||'',party:job?.party||'',notes:[f.source,f.notes.trim()].filter(Boolean).join(' - ')});
  stockTab='scrap';$('#modal').close();render();toast(`${m.reference}: ${kg} kg added to ${bin.code}.`)}catch(err){$('#stock-error').textContent=err.message}};
}
function scrapSaleEditor(binId){
 // every material is offered, so scrap can be sold by its weighbridge weight even if little or none was recorded
 const bins=Object.keys(materials).map(k=>scrapBins().find(b=>b.material===k)||{id:'new-'+k,material:k,code:`SCRAP-${materialCodes[k]}`,category:'scrap'}),hand=scrapOnHand();
 const recorded=b=>hand[b.id]||0,preset=bins.find(b=>b.id===binId);
 const buyers=[...new Set([...customers.filter(c=>c.status!=='Inactive').map(c=>c.name),...scrapSales.map(s=>s.buyer)])].sort();
 $('#modal').innerHTML=`<div class="modalhead"><h2>Sell scrap</h2><button class="close" aria-label="Close">×</button></div><form id="scrap-sale" class="scrap-sale"><div class="formgrid">
 ${field('Buyer','buyer','','text','required maxlength="150" list="scrap-buyers" placeholder="Scrap dealer or customer"')}<datalist id="scrap-buyers">${buyers.map(b=>`<option value="${esc(b)}">`).join('')}</datalist>${field('Buyer phone','buyer_phone','','tel','maxlength="60"')}
 ${field('Sale date','date',today(),'date',`required max="${today()}"`)}${field('Vehicle no.','vehicle_no','','text','maxlength="30" placeholder="e.g. LES-1234"')}
 ${field('Weighbridge slip no.','weighbridge_slip','','text','maxlength="40"')}<label class="field">Payment<select name="method">${Object.keys(scrapPayAccounts).map(k=>`<option ${k==='Cash on Hand'?'selected':''}>${k}</option>`).join('')}<option value="Credit">On credit (received later)</option></select></label></div>
 <div class="tablewrap" style="margin-top:16px"><table class="scrap-lines"><thead><tr><th>SCRAP</th><th class="money">RECORDED IN YARD</th><th class="money">WEIGHED KG SOLD</th><th class="money">RATE / KG (PKR)</th><th class="money">AMOUNT</th></tr></thead><tbody>${bins.map(b=>`<tr data-bin="${esc(b.id)}" data-material="${b.material}" data-recorded="${recorded(b)}"><td>Scrap - ${esc(materials[b.material])}<small>${esc(b.code)}</small></td><td class="money">${recorded(b).toLocaleString('en-PK',{maximumFractionDigits:2})} kg${recorded(b)?` <button type="button" class="textbutton" data-all="${recorded(b)}">Use</button>`:''}</td><td class="money"><input type="number" data-kg min="0" step="any" value="${preset===b&&recorded(b)?recorded(b):''}" placeholder="0"><small class="weigh-note" data-note></small></td><td class="money"><input type="number" data-rate min="0" step="any" value="${lastRate(scrapSales,b.material)||''}" placeholder="0"></td><td class="money" data-amount>—</td></tr>`).join('')}</tbody></table></div>
 <label class="field check" style="margin-top:12px"><input type="checkbox" name="empty_yard"> This load empties the yard for the materials sold (write off any recorded scrap left over)</label>
 <div class="lines-foot"><span></span><div class="doc-totals"><div><span>Weight</span><b id="ss-kg">0 kg</b></div><div><span>Scrap sales</span><b id="ss-net">PKR 0</b></div><div><span>Sales tax <input name="tax" type="number" value="0" min="0" max="100" step="0.01" aria-label="Sales tax percent"> %</span><b id="ss-tax">PKR 0</b></div><div class="grand"><span>Total</span><b id="ss-total">PKR 0</b></div></div></div>
 ${field('Notes','notes','','text','maxlength="300"')}
 <p class="help">Enter the weight from the weighbridge. If it is more than recorded, the difference is added to the yard as “weighed at sale” before the sale. Rates start from the last sale of each material. Post the sale in Accounts → Journal (Dr cash/bank or receivables, Cr Scrap Sales 4302).</p><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Record sale</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#scrap-sale'),rows=()=>$$('#scrap-sale [data-bin]');
 const read=()=>rows().map(tr=>({item_id:tr.dataset.bin,material:tr.dataset.material,label:`Scrap - ${materials[tr.dataset.material]}`,recorded:Number(tr.dataset.recorded),kg:Number(tr.querySelector('[data-kg]').value)||0,rate:Number(tr.querySelector('[data-rate]').value)||0}));
 const update=()=>{const lines=read(),empty=form.elements.empty_yard.checked;rows().forEach((tr,i)=>{const l=lines[i];tr.querySelector('[data-amount]').textContent=l.kg&&l.rate?money(Math.round(l.kg*l.rate*100)/100):'—';const d=Math.round((l.kg-l.recorded)*100)/100;tr.querySelector('[data-note]').textContent=!l.kg?'':d>0?`+${d} kg weighed at sale`:d<0&&empty?`${-d} kg left over written off`:''});const t=scrapSaleTotals(lines.filter(l=>l.kg>0),form.elements.tax.value);$('#ss-kg').textContent=`${t.kg.toLocaleString('en-PK')} kg`;$('#ss-net').textContent=money(t.net);$('#ss-tax').textContent=money(t.tax);$('#ss-total').textContent=money(t.total)};
 form.oninput=update;form.onchange=update;$$('#scrap-sale [data-all]').forEach(b=>b.onclick=()=>{b.closest('tr').querySelector('[data-kg]').value=b.dataset.all;update()});update();
 form.onsubmit=e=>{e.preventDefault();try{
  const f=Object.fromEntries(new FormData(form));if(f.date>today())throw Error('The sale date cannot be in the future.');
  const sale=validateScrapSale({buyer:f.buyer.trim(),date:f.date,method:f.method,tax:Number(f.tax||0),lines:read()},{}, {byWeight:true});
  const t=scrapSaleTotals(sale.lines,sale.tax),id=crypto.randomUUID(),reference=nextDocumentNumber('SS',scrapSales,f.date.slice(0,4)),link={date:f.date,party:sale.buyer,doc_reference:reference,scrap_sale_id:id};
  const saved=sale.lines.map(l=>{
   const bin=scrapBin(l.material),diff=weighAdjustment(l.recorded,l.kg);
   if(diff>0)addStockMove({...link,item_id:bin.id,type:'scrap',quantity:diff,notes:`Weighed at sale ${reference} (not recorded before)`});
   addStockMove({...link,item_id:bin.id,type:'dispose',quantity:-l.kg,notes:`Scrap sale ${reference}`});
   if(diff<0&&f.empty_yard)addStockMove({...link,item_id:bin.id,type:'adjust',quantity:diff,notes:`Yard emptied at sale ${reference}: recorded scrap not found`});
   return {item_id:bin.id,material:l.material,label:l.label,kg:Math.round(l.kg*100)/100,rate:l.rate};
  });
  scrapSales.push({...sale,id,reference,buyer_phone:f.buyer_phone.trim(),vehicle_no:f.vehicle_no.trim().toUpperCase(),weighbridge_slip:f.weighbridge_slip.trim(),notes:f.notes.trim(),lines:saved,amount:t.total,created_at:new Date().toISOString()});
  stockTab='scrap';$('#modal').close();render();toast(`${reference}: ${t.kg} kg sold to ${sale.buyer} for ${money(t.total)}. Post it in Accounts → Journal.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}
// Weigh the yard: enter the actual kg of each material; differences become dated movements.
function scrapWeighEditor(){
 const hand=scrapOnHand(),rows=Object.keys(materials).map(k=>{const b=scrapBins().find(x=>x.material===k);return {material:k,recorded:b?hand[b.id]:0}});
 $('#modal').innerHTML=`<div class="modalhead"><h2>Weigh the scrap yard</h2><button class="close" aria-label="Close">×</button></div><form id="scrap-weigh-form">
 <p class="help">Weigh each material in the yard and enter the actual kg. Leave a row blank to keep its recorded weight. The difference is recorded as an adjustment, so the yard matches what is really there.</p>
 <div class="tablewrap"><table class="scrap-lines"><thead><tr><th>SCRAP</th><th class="money">RECORDED</th><th class="money">WEIGHED KG</th><th class="money">DIFFERENCE</th></tr></thead><tbody>${rows.map(r=>`<tr data-material="${r.material}" data-recorded="${r.recorded}"><td>Scrap - ${esc(materials[r.material])}</td><td class="money">${r.recorded.toLocaleString('en-PK',{maximumFractionDigits:2})} kg</td><td class="money"><input type="number" data-weighed min="0" step="any" placeholder="Not weighed"></td><td class="money" data-diff>—</td></tr>`).join('')}</tbody></table></div>
 <div class="formgrid" style="margin-top:14px">${field('Date weighed','date',today(),'date',`required max="${today()}"`)}${field('Notes','notes','','text','maxlength="200" placeholder="e.g. Monthly yard weighing"')}</div>
 <div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Update yard</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#scrap-weigh-form'),trs=()=>$$('#scrap-weigh-form [data-material]');
 form.oninput=()=>trs().forEach(tr=>{const v=tr.querySelector('[data-weighed]').value,d=v===''?null:weighAdjustment(tr.dataset.recorded,v);tr.querySelector('[data-diff]').innerHTML=d==null?'—':d===0?'No change':`<b class="${d<0?'late':''}">${d>0?'+':''}${d} kg</b>`});
 form.onsubmit=e=>{e.preventDefault();try{
  const date=form.elements.date.value,notes=form.elements.notes.value.trim();if(date>today())throw Error('The date cannot be in the future.');
  const changes=trs().map(tr=>({material:tr.dataset.material,recorded:Number(tr.dataset.recorded),weighed:tr.querySelector('[data-weighed]').value})).filter(r=>r.weighed!=='').map(r=>{const kg=Number(r.weighed);if(!(kg>=0)||kg>1e7)throw Error('Enter weights of zero or more.');return {...r,diff:weighAdjustment(r.recorded,kg)}}).filter(r=>r.diff!==0);
  if(!changes.length)throw Error('Nothing to change. Enter a weighed figure that differs from the recorded weight.');
  for(const c of changes){const bin=scrapBin(c.material);addStockMove({item_id:bin.id,type:c.diff>0?'scrap':'adjust',date,quantity:c.diff,notes:['Yard weighed',notes].filter(Boolean).join(' - ')})}
  stockTab='scrap';$('#modal').close();render();toast(`Scrap yard updated for ${changes.length} material${changes.length===1?'':'s'}.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}
function scrapReceiveEditor(id){
 const s=scrapSales.find(x=>x.id===id);if(!s)return;
 $('#modal').innerHTML=`<div class="modalhead"><h2>Payment received · ${esc(s.reference)}</h2><button class="close" aria-label="Close">×</button></div><form id="scrap-receive"><p><b>${esc(s.buyer)}</b> · ${money(s.amount)}</p><div class="formgrid">${field('Date received','date',today(),'date',`required min="${s.date}" max="${today()}"`)}${select('Received into','method',Object.keys(scrapPayAccounts),'Cash on Hand')}</div><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Mark received</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 $('#scrap-receive').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(f.date<s.date||f.date>today()){$('#stock-error').textContent='The date must be between the sale date and today.';return}Object.assign(s,{received_date:f.date,received_method:f.method});$('#modal').close();render();toast(`${s.reference} marked received. Post the receipt in Accounts → Journal.`)};
}
async function downloadScrapSalePDF(s,button){
 if(!s)return;const label=button.textContent;button.disabled=true;button.textContent='Preparing…';
 try{const t=scrapSaleTotals(s.lines,s.tax),paid=s.method!=='Credit'||s.received_date;
  const doc={documentType:'invoice',docTitle:'Scrap Sale',refLabel:'Sale No.',reference:s.reference,date:s.date,party:s.buyer,description:`Scrap metal sold by weight${s.vehicle_no?` · loaded on ${s.vehicle_no}`:''}`,extraMeta:[...(s.vehicle_no?[['Vehicle no.',s.vehicle_no]]:[]),...(s.weighbridge_slip?[['Weighbridge slip',s.weighbridge_slip]]:[])],lines:s.lines.map(l=>({description:`${l.label}`,quantity:l.kg,unit:'kg',rate:l.rate})),tax:Number(s.tax||0),notes:s.notes,paid:paid?t.total:0,outstanding:paid?0:t.total,bank_account_id:paid?'none':''};
  const party=customers.find(c=>c.name===s.buyer)||{phone:s.buyer_phone};
  const response=await fetch('sutluj-logo.jpg');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createQuotePDF(doc,new Uint8Array(await response.arrayBuffer()),window.PDFLib,{company,party,bankAccount:findBankAccount(company,doc.bank_account_id),stampLogo:stampLogo(company.stamp_color)});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`Sutluj-Scrap-Sale-${s.reference}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast(`${s.reference} PDF downloaded.`);
 }catch(err){toast(err.message||'Could not create the PDF.')}finally{button.disabled=false;button.textContent=label}
}

// Scrap a job sent to the yard, valued at the latest scrap sale rate (shown for information; sales post as other income).
function jobScrapNote(j){const moves=stockMoves.filter(m=>m.job_id===j.id&&m.type==='scrap');if(!moves.length)return '';const kg=moves.reduce((n,m)=>n+Number(m.quantity),0),value=moves.reduce((n,m)=>n+Number(m.quantity)*lastRate(scrapSales,stockById(m.item_id)?.material),0);return `<p class="help">Scrap recovered: <b>${kg.toLocaleString('en-PK',{maximumFractionDigits:2})} kg</b>${value?` (≈ ${money(Math.round(value))} at the latest scrap rates)`:''}. Scrap sales are booked as Scrap Sales income, not against the job.</p>`}

// Start fresh: clears the local workspace for new entries. A backup downloads first; company details,
// bank accounts and quotation terms stay; customers, vendors, employees and stock items can be kept.
function resetCard(){
 const counts=[['quotes',records.filter(r=>r.kind==='quote').length],['work orders',workOrders.length],['invoices',invoices.length],['stock movements',stockMoves.length],['journal entries',journals.length]].filter(([,n])=>n).map(([k,n])=>`${n} ${k}`).join(', ');
 return `<section class="card danger-zone"><div class="cardhead"><div><h2>Start fresh</h2><p class="sub" style="margin-top:6px">Delete the entries in this browser to start testing or working from a clean workspace.</p></div></div><div class="cardbody"><form id="reset-form">
 <p>Deletes every transaction: enquiries, quotes, purchase orders, expenses, petty cash, work orders, invoices, payments, journals, stock movements, attendance, advances, payroll and scrap sales${counts?` (currently ${counts}, and more)`:''}. Numbering starts again from 1.</p>
 <div class="reset-keep"><label class="check"><input type="checkbox" name="keep_parties" checked> Keep customers and vendors (${customers.length+vendors.length})</label><label class="check"><input type="checkbox" name="keep_employees" checked> Keep employees (${employees.length})</label><label class="check"><input type="checkbox" name="keep_items" checked> Keep the stock item list, with all quantities at zero (${stockItems.filter(i=>['sheet','consumable'].includes(i.category)).length})</label></div>
 <p class="help">Company details, bank accounts and quotation terms are always kept. A backup file of everything is downloaded first, so you can recover it. Cloud (Supabase) data is not affected.</p>
 <div class="formgrid"><label class="field">Type DELETE to confirm<input name="confirm" autocomplete="off" placeholder="DELETE"></label></div>
 <div id="reset-error" class="error" role="alert"></div><div class="actions" style="justify-content:flex-start"><button type="submit" class="delete-confirm">Back up and delete entries</button></div></form></div></section>`;
}
function bindReset(){
 $('#reset-form').onsubmit=e=>{e.preventDefault();const f=e.target.elements;
  if(f.confirm.value.trim()!=='DELETE'){$('#reset-error').textContent='Type DELETE (in capitals) to confirm.';f.confirm.focus();return}
  exportWorkspaceBackup();
  const keepParties=f.keep_parties.checked,keepEmployees=f.keep_employees.checked,keepItems=f.keep_items.checked;
  records=[];invoices=[];payments=[];workOrders=[];journals=[];stockMoves=[];attendance=[];advances=[];payrolls=[];scrapSales=[];
  if(!keepParties){customers=[];vendors=[]}
  if(!keepEmployees)employees=[];
  // remnants and scrap bins are physical pieces and weights, so only sheet and consumable definitions are kept
  stockItems=keepItems?stockItems.filter(i=>['sheet','consumable'].includes(i.category)):[];
  try{localStorage.removeItem('sutluj-last-quote-number')}catch{}
  jobView=null;page='overview';render();toast('Workspace cleared. A backup of the previous entries was downloaded.');
 };
}

// Company stamp printed on quotations and invoices.
function stampCard(){
 const t=stampText(company),on=company.stamp_enabled!==false;
 return `<section class="card"><div class="cardhead"><div><h2>Company stamp</h2><p class="sub" style="margin-top:6px">A round digital stamp printed beside the authorised signatory on quotations and invoices.</p></div></div><div class="cardbody stamp-settings"><div class="stamp-preview" id="stamp-preview">${stampSVG(company,210)}</div><form id="stamp-form"><div class="formgrid">
 <label class="field check full"><input type="checkbox" name="stamp_enabled" ${on?'checked':''}> Print the stamp on quotations, invoices and purchase orders</label>
 <label class="field full">Centre of the stamp<select name="stamp_center"><option value="logo" ${company.stamp_center!=='text'?'selected':''}>Company logo</option><option value="text" ${company.stamp_center==='text'?'selected':''}>Text lines (e.g. NTN and STRN)</option></select></label>
 ${field('Centre line 1','stamp_line1',t.line1,'text','maxlength="30" placeholder="e.g. NTN 1234567-8"')}${field('Centre line 2','stamp_line2',t.line2,'text','maxlength="30" placeholder="e.g. STRN or city"')}
 ${field('Bottom text','stamp_bottom',company.stamp_bottom??company.tagline??'','text','maxlength="40" placeholder="Your tagline"')}<label class="field">Ink<select name="stamp_color">${[['blue','Blue'],['black','Black'],['red','Red']].map(([k,l])=>`<option value="${k}" ${k===(company.stamp_color||'blue')?'selected':''}>${l}</option>`).join('')}</select></label></div>
 <p class="help">The top arc uses the business name. The logo is printed in the stamp’s ink colour; centre lines are used when the centre shows text. Purchase orders are never stamped.</p><div class="actions"><button type="submit" class="primary">Save stamp</button></div></form></div></section>`;
}
function bindStamp(){
 const form=$('#stamp-form');if(!form)return;
 const read=()=>{const f=form.elements;return {stamp_center:f.stamp_center.value,stamp_enabled:f.stamp_enabled.checked,stamp_line1:f.stamp_line1.value.trim(),stamp_line2:f.stamp_line2.value.trim(),stamp_bottom:f.stamp_bottom.value.trim(),stamp_color:f.stamp_color.value}};
 const preview=async()=>{const c={...company,...read()},logo=await stampLogo(c.stamp_color);$('#stamp-preview').innerHTML=stampSVG(c,210,logo?.dataUrl||'');$('#stamp-preview').classList.toggle('off',!c.stamp_enabled);const text=c.stamp_center==='text';form.elements.stamp_line1.closest('label').hidden=!text;form.elements.stamp_line2.closest('label').hidden=!text};
 form.oninput=form.onchange=preview;preview();
 $('#stamp-preview').classList.toggle('off',company.stamp_enabled===false);
 form.onsubmit=e=>{e.preventDefault();saveCompanyPatch(read(),'Stamp saved. It appears on the next quotation or invoice PDF.')};
}

// Restore from backup: replaces the local workspace (and company settings) with an exported backup file.
// The current workspace is exported first, so a mistaken restore can be undone.
async function restoreBackup(file){
 let backup;
 try{backup=validateWorkspace(JSON.parse(await file.text()))}catch{toast('This file is not a Sutluj backup, or it is damaged. Nothing was changed.');return}
 const d=backup.data,count=k=>d[k]?.length||0,when=backup.savedAt?new Date(backup.savedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'unknown date';
 const summary=[['quotes & other records',count('records')],['customers',count('customers')],['vendors',count('vendors')],['work orders',count('workOrders')],['invoices',count('invoices')],['stock items',count('stockItems')],['employees',count('employees')],['scrap sales',count('scrapSales')]].filter(([,n])=>n).map(([k,n])=>`${n} ${k}`).join(', ')||'no entries';
 const dialog=$('#delete-modal');
 dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">Restore this backup?</h2></div><form id="restore-form"><p><b>${esc(file.name)}</b> · saved ${esc(when)}</p><p>${esc(summary)}${backup.company?' · company details and settings':''}.</p><p class="help">Everything currently in this browser is replaced. A backup of the current workspace is downloaded first.</p><div class="actions"><button type="button" id="restore-cancel" autofocus>Cancel</button><button type="submit" class="delete-confirm">Back up current and restore</button></div></form>`;
 dialog.showModal();$('#restore-cancel').onclick=()=>dialog.close();
 $('#restore-form').onsubmit=e=>{e.preventDefault();
  exportWorkspaceBackup();
  ({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=d);
  if(backup.company&&typeof backup.company==='object'){company={...defaultCompany,...backup.company};try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}}
  try{localStorage.removeItem('sutluj-last-quote-number')}catch{} // numbering continues from the restored quotes
  jobView=null;dialog.close();page='overview';render();toast(`Backup restored: ${summary}.`);
 };
}

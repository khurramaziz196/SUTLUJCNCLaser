import {createLocalStore,validateWorkspace} from './local-store.mjs?v=dn-1';
import {createInvoicePDF} from './invoice-pdf.mjs?v=area-1';
import {validateJournal,sourceLines,reverseLines,ledgerReport} from './ledger.mjs?v=coa-2';
import {invoiceBalance,invoiceStatus,validatePayment,documentTotals,validateDiscount,lineDiscount,lineCents,receivablesAgeing,ageingBuckets,customerStatement} from './invoice-math.mjs?v=area-1';
import {createStatementPDF} from './statement-pdf.mjs?v=soa-3';
import {accountGroups,accountList,expenseAccounts,applyChartSettings,systemAccounts,nextAccountCode,accountProblem} from './accounts.mjs?v=coa-2';
import {attendanceCodes,roles,costTypes,payAccounts,monthDays,monthDates,employedOn,employedIn,validateEmployee,attendanceSummary,leaveTaken,advanceBalance,payrollLine,payrollTotals} from './hr.mjs?v=hr-1';
import {createPayslipPDF} from './payslip-pdf.mjs?v=gr-1';
import {priorities,labourTasks,jobExpenseTypes,jobStage,completionProblem,partWeightKg,scrapSummary,hourlyRate,validateLabour,labourCost,jobCosting,taskStatuses,standardTasks,extraTasks,defaultScope,scopeOf,legacyFromScope,taskProgress,scopeProgress,lineCell,deriveScope,lineProgress,materializeLines,countsPieces,cellFromCount,piecesDone} from './jobs.mjs?v=pcs-2';
import {createJobCardPDF} from './jobcard-pdf.mjs?v=plan-2';
import {stampSVG,stampText,inkLogo} from './stamp.mjs?v=logo-2';
import {scrapPayAccounts,scrapSaleTotals,validateScrapSale,averageRate,lastRate,weighAdjustment} from './scrap.mjs?v=scrap-2';
import {materials,gauges,matchGauge,thicknessText,inferThickness,dimensionTail} from './gauge.mjs';
import {areaSqFt,validSize,poWeightKg} from './size.mjs?v=2';
import {IN,FT,sheetPresets,planLine,sheetLabel,layoutRects,normalizeSheetId,sheetFromId} from './nesting.mjs?v=4';
import {mountCalculator} from './calculator.mjs?v=2';
import {createDeliveryNotePDF} from './dn-pdf.mjs?v=2';
import {balancesAsAt,natural,movements,accountLedger,profitLoss,previousPeriod,balanceSheet,trialBalance,cashFlow,cashAccounts} from './finance.mjs?v=2';
import {vendorPayMethods,payableAccounts,payableFor,validateVendorPayment,partyLedger,monthlySummary,ageing,averageDaysToPay,settleBills} from './parties.mjs?v=1';
import {workflows,guides,glossary,faq,tourSteps} from './help.mjs?v=1';
import { createQuotePDF } from './quote-pdf.mjs?v=po-1';
import {defaultCompany,nextDocumentNumber,addDays,quoteNumber,pakistanBanks,bankCurrencies,compactIBAN,formatIBAN,ibanProblem,swiftProblem,bankAccountsOf,defaultBankAccount,findBankAccount,bankAccountLabel,bankAccountProblem,paymentTermsOf,validityOptionsOf,daysBetweenDates} from './documents.mjs?v=gr-1';
import {materialCodes,sheetSizes,categoryLabels,consumableUnits,consumableAccounts,moveLabels,receiptOffsets,qty3,isWhole,unitOf,sheetWeightKg,itemLabel,nextReference,itemCode,validateItem,balances,balanceOf,outValue,validateQuantity,unitCost,offcutValue,suggestedOffset,isPostable,needsReorder,jobMaterialCost,poReceiptStatus,itemFromPOLine,matchStockItem} from './inventory.mjs?v=std-3';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={deliveries:'<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',invoices:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',inventory:'<path d="M3 21V7l9-4 9 4v14M3 21h18M7 21v-7h10v7M7 10h10M12 14v7"/>',hr:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',workorders:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 3h8v4H8zM8 12h8M8 16h6"/>',overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',sales:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5"/>',procurement:'<path d="m3 7 9-4 9 4-9 5zM3 7v10l9 4 9-4V7M12 12v9"/>',accounts:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M15 13h6M7 3v3"/>',customers:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',vendors:'<path d="M3 21V7l9-4 9 4v14M7 21v-6h10v6M7 9h2M15 9h2M7 12h2M15 12h2"/>',settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>'};
const icon=k=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[k]||icons.sales}</svg>`;
const today=()=>new Date().toLocaleDateString('en-CA');
const currency='PKR';
const money=n=>`${currency} ${Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:2})}`;
const short=n=>Number(n||0).toLocaleString('en-PK',{notation:'compact',maximumFractionDigits:1});
const statuses={enquiry:['New','Quoted','Closed'],quote:['Draft','Sent','Accepted','Declined'],purchase:['Draft','Ordered','Received','Cancelled'],expense:['Pending','Paid'],cash:['Posted']};
const categories=['Capital expense','Operating expense','General expense'];
const labels={enquiry:'enquiry',quote:'quote',purchase:'purchase order',expense:'expense',cash:'petty cash entry'};
let helpTopic='',helpReturn='',helpFlow='sell',helpStep=0,tourStep=null;
let page='overview',tab='quote',query='',filter='All',session=null,connected=false,lastSync=null,loading=false;
let config;try{config=JSON.parse(localStorage.getItem('sutluj-connection')||'{}')}catch{config={}}
let company;try{company={...defaultCompany,...JSON.parse(localStorage.getItem('sutluj-company')||'{}')}}catch{company={...defaultCompany}}
// Rebrand: company details saved under the old name (name, terms, stamp text, …) switch to GR Synergy Ventures once.
if(JSON.stringify(company).includes('Sutluj CNC Laser')){company=JSON.parse(JSON.stringify(company).replace(/Sutluj CNC Laser/g,'GR Synergy Ventures').replace(/SUTLUJ CNC LASER/g,'GR SYNERGY VENTURES'));try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}}
applyChartSettings(company.coa||{});
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
let invoices=[],payments=[],workOrders=[],journals=[],stockItems=[],stockMoves=[],stockTab='sheet',employees=[],attendance=[],advances=[],payrolls=[],scrapSales=[],vendorPayments=[],stockTakes=[],deliveryNotes=[],dnFilter='All',takeView=null,partyView=null,partyTab='overview',partyYear=new Date().getFullYear(),partyFrom=new Date().getFullYear()+'-01-01',partyTo=new Date().toLocaleDateString('en-CA'),jobView=null,jobFilter='All',invFilter='All',lineMode='quote';
let localStore,localSaveError='';
try{localStore=createLocalStore(localStorage)}catch{localSaveError='Browser storage is unavailable. Export a backup before closing.'}
let reportFrom=today().slice(0,4)+'-01-01',reportTo=today();
let statementFrom=today().slice(0,4)+'-01-01',statementTo=today();
function toast(s){$('#toast').textContent=localSaveError&&!session?localSaveError:s;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',4500)}
function navigate(p){if(p!=='help')helpTopic='';else if(page!=='help')helpReturn=page;page=p;jobView=null;partyView=null;takeView=null;partyTab='overview';query='';filter='All';tab=p==='procurement'?'purchase':p==='accounts'?'dash':'quote';render()}
const badge=s=>`<span class="pill ${esc(s.toLowerCase())}">${esc(s)}</span>`;
function render(){saveLocalWorkspace();document.title='GR Synergy Ventures · Business workspace';$('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand company-brand"><img class="company-logo" src="sutluj-logo.jpg?v=gr-3" alt="GR Synergy Ventures"></div><div class="navlabel">WORKSPACE</div><nav class="nav" aria-label="Main navigation">${sidebarNavigation()}</nav><button class="sidefoot help-foot ${page==='help'?'active':''}" data-help-open><span class="help-ico">?</span><span><b>Help &amp; tutorials</b><small>${setupProgress().done<setupProgress().total?`Setup ${setupProgress().done} of ${setupProgress().total} done`:'Guides, workflows, tour'}</small></span><span class="help-arrow">›</span></button></aside><div><header class="topbar"><div class="crumb">Workspace &nbsp; / &nbsp; <b>${esc(pageName(page))}</b></div><div class="right"><button class="help-btn" data-help-open title="Help for this page" aria-label="Help for this page">?</button><button class="connection" data-nav="settings">${connected?'Supabase connected':session?'Sync unavailable':'Local workspace'}</button><span class="fine">${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span><div class="avatar">GR</div></div></header><main class="content">${!session&&localSaveError?`<div class="notice" role="alert"><span>${esc(localSaveError)}</span><button data-backup>Export backup</button></div>`:''}${page==='help'?helpPage():page==='settings'?settings():page==='customers'||page==='vendors'?partyPage(page):page==='overview'?overview():listing()}<div class="footer"><span>GR Synergy Ventures · Business management</span><span>${connected?`Last synced ${lastSync?.toLocaleTimeString()||''} · refreshes every 30 seconds`:(localSaveError?'Local saving needs attention':'Saved locally in this browser')}</span></div></main></div></div>${tourCard()}`;
$$('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));if($('#open-calc'))$('#open-calc').onclick=()=>openSheetCalculator(false);$$('[data-new]').forEach(b=>b.onclick=()=>editor(b.dataset.new));$$('[data-edit]').forEach(b=>b.onclick=()=>editor(records.find(r=>r.id===b.dataset.edit)?.kind,b.dataset.edit));$$('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;query='';filter='All';render()});if($('#search'))$('#search').oninput=e=>{query=e.target.value;updateTable()};if($('#filter'))$('#filter').onchange=e=>{filter=e.target.value;updateTable()};if($('#export'))$('#export').onclick=exportCSV;if($('#refresh'))$('#refresh').onclick=()=>sync(true);bindRecordDeletes();bindQuoteRows();bindInvoices();bindWorkOrders();bindAccounting();bindAccountsPro();if(page==='overview')bindOverview();if(page==='deliveries'||page==='workorders')bindDeliveries();if(page==='inventory')bindInventory();if(page==='hr')bindHR();$$('[data-backup]').forEach(b=>b.onclick=exportWorkspaceBackup);if(page==='settings')bindSettings();if(page==='accounts'&&tab==='chart')bindChart();if(page==='customers'||page==='vendors')bindParties(page);bindHelp();}
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
 if(!session){const toShip=workOrders.filter(j=>j.status==='Completed').map(j=>({j,dv:jobDelivery(j)})).filter(x=>x.dv.total&&x.dv.done<x.dv.total);if(toShip.length)add('amber',`${plural(toShip.length,'completed job')} to deliver`,toShip.slice(0,3).map(x=>esc(`${x.j.reference} · ${x.dv.done}/${x.dv.total} pcs`)).join(', '),'Delivery notes',{page:'deliveries'})}
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
 if(!session){const owed=vendors.map(v=>({v,...partyOwed('vendors',v)})).filter(x=>x.due>0);if(owed.length){const late=owed.filter(x=>x.overdue>0);add(late.length?'red':'amber',`${plural(owed.length,'vendor')} to pay`,`${money(owed.reduce((n,x)=>n+x.due,0))} payable${late.length?` · ${money(late.reduce((n,x)=>n+x.overdue,0))} overdue`:''} · ${owed.sort((a,b)=>b.due-a.due).slice(0,3).map(x=>esc(x.v.name)).join(', ')}`,'View payables',{page:'vendors',party:'To pay'})}}
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
 $$('[data-go]').forEach(b=>b.onclick=()=>{const g=JSON.parse(b.dataset.go);page=g.page;jobView=null;query='';filter='All';tab=g.tab||(g.page==='accounts'?'chart':'quote');if(g.inv)invFilter=g.inv;if(g.party)partyFilter=g.party;if(g.job)jobFilter=g.job;if(g.stock)stockTab=g.stock;render();window.scrollTo(0,0)});
 $$('[data-job-open]').forEach(b=>b.onclick=()=>{page='workorders';jobView=b.dataset.jobOpen;render();window.scrollTo(0,0)});
}
function listing(){if(page==='inventory')return inventoryPage();if(page==='hr')return hrPage();if(page==='accounts'&&['dash','journal','ledger','reports'].includes(tab))return accountingPage();if(page==='workorders')return workOrderPage();if(page==='deliveries')return deliveryPage();if(page==='invoices'||page==='sales'&&tab==='invoice')return invoicePage();if(page==='accounts'&&tab==='chart')return chartPage();let title=page==='sales'?'Sales':page==='procurement'?'Procurement':'Accounts';let subtitle=page==='sales'?'Manage customer enquiries and laser-cutting quotes.':page==='procurement'?'Track raw-material purchases from order to receipt.':'Keep expenses and petty cash organised.';return `<div class="heading"><div><div class="eyebrow">${page==='sales'?'CUSTOMERS & QUOTES':page==='procurement'?'MATERIALS & SUPPLIERS':'BUSINESS FINANCES'}</div><h1>${title}</h1><p class="sub">${subtitle}</p></div><div class="heading-actions">${page==='sales'?'<button id="open-calc">▦ Sheet calculator</button>':''}<button class="primary" data-new="${tab}">＋ New ${labels[tab]}</button></div></div>${notice()}${page!=='procurement'?`<div class="sectionlinks">${(page==='sales'?['quote','enquiry','invoice']:['dash','chart','journal','ledger','reports','expense','cash']).map(t=>t==='invoice'?`<button data-nav="invoices">Invoices <span class="fine">&nbsp;${invoices.length}</span></button>`:`<button data-tab="${t}" class="${tab===t?'selected':''}">${t==='dash'?'Dashboard':t==='ledger'?'Ledger':t==='journal'?'Journal':t==='reports'?'Reports':t==='chart'?'Chart of Accounts':t==='cash'?'Petty cash':t==='enquiry'?'Enquiries':t[0].toUpperCase()+t.slice(1)+'s'} ${['dash','ledger','reports','journal'].includes(t)?'':`<span class="fine">&nbsp;${t==='chart'?accountGroups.length:t==='invoice'?invoices.length:records.filter(r=>r.kind===t).length}</span>`}</button>`).join('')}</div>`:''}${tab==='cash'?`<div class="notice"><span>Petty cash balance: <b>${money(records.filter(r=>r.kind==='cash').reduce((s,r)=>s+(r.category==='Cash in'?1:-1)*r.amount,0))}</b></span><span>Record top-ups as cash in and spending as cash out.</span></div>`:''}${page==='sales'&&tab==='quote'?quoteSummary():''}<section class="card"><div class="toolbar"><input id="search" class="search" type="search" placeholder="Search name, reference or description…" aria-label="Search records"><div class="row">${tab==='quote'?'':`<select id="filter" aria-label="Filter by status"><option>All</option>${statuses[tab].map(s=>`<option>${s}</option>`).join('')}</select>`}<button id="export">Export CSV</button>${session?'<button id="refresh">Refresh</button>':''}</div></div><div id="results">${table(filtered(),tab)}</div></section>`}
function filtered(){return records.filter(r=>r.kind===tab&&(filter==='All'||(tab==='quote'?quoteState(r):r.status)===filter)&&`${r.reference} ${r.party} ${r.description} ${r.category}`.toLowerCase().includes(query.toLowerCase()))}
function updateTable(){$('#results').innerHTML=table(filtered(),tab);$$('[data-edit]').forEach(b=>b.onclick=()=>editor(tab,b.dataset.edit));bindRecordDeletes();bindQuoteRows()}
function table(rows,kind){if(!rows.length)return '<div class="empty">No records found. Create an entry or change your search.</div>';if(kind==='quote')return quoteTable(rows);return `<div class="tablewrap"><table><thead><tr><th>REFERENCE</th><th>${kind==='purchase'?'SUPPLIER':kind==='expense'||kind==='cash'?'PAYEE / SOURCE':'CUSTOMER'} & DETAILS</th><th>DATE</th><th>STATUS</th><th class="money">AMOUNT</th><th><span aria-label="Actions"></span></th></tr></thead><tbody>${rows.map(r=>`<tr><td class="ref">${esc(r.reference)}${r.account_code?`<small>${esc(r.account_code)} · ${esc(accountList.find(a=>a.code===r.account_code)?.name||'Account')}</small>`:''}${r.category?`<small>${esc(r.category)}</small>`:''}${r.kind==='quote'&&r.valid_until?`<small class="${['Draft','Sent'].includes(r.status)&&r.valid_until<today()?'expired':''}">${['Draft','Sent'].includes(r.status)&&r.valid_until<today()?'Expired':'Valid until'} ${esc(r.valid_until)}</small>`:''}</td><td>${esc(r.party)}<small>${esc(r.description)}</small></td><td>${esc(r.date)}</td><td>${badge(r.status)}</td><td class="money">${r.kind==='enquiry'?'—':money(r.amount)}</td><td class="row-actions"><button class="textbutton" data-edit="${esc(r.id)}">Open ↗</button>${r.kind==='purchase'?`<button class="textbutton row-pdf" data-quote-pdf="${esc(r.id)}" aria-label="Download ${esc(r.reference)} PDF">PDF</button>`:''}${['enquiry','quote','purchase'].includes(r.kind)?`<button class="textbutton danger" data-record-delete="${esc(r.id)}" aria-label="Delete ${esc(r.reference)}">Delete</button>`:''}</td></tr>`).join('')}</tbody></table></div>`}
function field(label,name,value='',type='text',extra=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`}
function select(label,name,opts,value){return `<label class="field">${label}<select name="${name}">${opts.map(s=>`<option ${s===value?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`}
function editor(kind,id,copy){if(!kind)return;lineMode=kind==='purchase'?'po':'quote';const existing=records.find(r=>r.id===id);const fresh={kind,date:today(),status:statuses[kind][0],tax:0,lines:[{description:'',quantity:1,rate:0}],...(kind==='quote'?{valid_until:addDays(today(),company.validity_days),payment_terms:company.payment_terms,lead_time:'',prepared_by:company.prepared_by,terms:company.terms}:{})};const r=existing||(copy?{...fresh,...structuredClone(copy),id:undefined,reference:undefined,date:today(),status:'Draft',valid_until:fresh.valid_until,created_at:undefined}:fresh);const priced=['quote','purchase'].includes(kind);$('#modal').innerHTML=`<div class="modalhead"><h2>${id?`${esc(r.reference)}`:copy?`Copy of ${esc(copy.reference)}`:`New ${labels[kind]}`}</h2><button class="close" aria-label="Close">×</button></div><form id="recordform" data-kind="${kind}" class="${priced?'priced':''}"><div class="formgrid">${['quote','enquiry'].includes(kind)?customerPicker(r.party):kind==='purchase'?vendorPicker(r.party):field('Payee / source','party',r.party,'text','required maxlength="150"')}${field('Date','date',r.date,'date','required')}${field(kind==='enquiry'?'Job requirements':'Description','description',r.description,'text','required maxlength="500"')}${select('Status','status',statuses[kind],r.status)}${kind==='quote'&&!session?validityPicker(r)+field('Valid until','valid_until',r.valid_until||'','date'):''}${kind==='quote'&&!session?field('Customer reference / RFQ no. (optional)','customer_ref',r.customer_ref||'','text','maxlength="100"')+field('Attention (optional)','attention',r.attention||'','text','maxlength="150" placeholder="Defaults to the customer’s contact person"'):''}${kind==='expense'?select('Category','category',categories,r.category):kind==='cash'?select('Entry type','category',['Cash in','Cash out'],r.category):''}${kind==='expense'?expenseAccountField(r):''}${!priced&&kind!=='enquiry'?field('Amount (PKR)','amount',r.amount||'','number','min="0.01" max="1000000000" step="0.01" required'):''}${kind==='enquiry'?`<label class="field full">Material, thickness, quantity and contact details<textarea name="notes" maxlength="4000">${esc(r.notes)}</textarea></label>`:''}</div>${priced?`<div class="linehead" style="margin-top:22px">LINE ITEMS</div><div class="line-table" role="table" aria-label="Line items"><div id="lines">${lineHeader()}${(r.lines?.length?r.lines:[{description:r.description||'',quantity:1,rate:r.amount||0}]).map(lineHTML).join('')}</div></div><div class="lines-foot"><button type="button" id="addline">＋ Add line</button><div class="doc-totals"><div><span>Subtotal</span><b id="t-gross"></b></div><div id="t-disc-row" hidden><span>Discount</span><b id="t-disc"></b></div><div><span>Sales tax <input name="tax" type="number" value="${esc(r.tax||0)}" min="0" max="100" step="0.01" required aria-label="Sales tax percent"> %</span><b id="t-tax"></b></div><div class="grand"><span>Total</span><b id="total"></b></div></div></div>${kind==='quote'?`<details class="quote-plan" id="quote-plan" open><summary>Sheet plan & layout<span id="qp-head"></span></summary><div class="plan-foot"><label class="row">Gap between parts <input type="number" name="qp_gap" min="0" max="100" step="0.5" value="${esc(r.sheet_gap??5)}"> mm</label><label class="row">Edge margin <input type="number" name="qp_margin" min="0" max="100" step="0.5" value="${esc(r.sheet_margin??0)}"> mm</label></div><div id="qp-body"></div><div class="qp-actions"><button type="button" id="qp-open" class="primary">▦ Open sheet calculator</button><span class="fine">Layouts, best sheet, material cost and suggested rates in a floating window you can move or pop out. Planning only: the quote amount still comes from the line items.</span></div></details>`:''}`:''}${kind==='quote'&&!session?quoteTermsFields(r):''}${kind!=='enquiry'?`<label class="field" style="margin-top:18px">${kind==='quote'||kind==='purchase'?'Notes (printed on the PDF)':'Notes / payment reference'}<textarea name="notes" maxlength="4000">${esc(r.notes)}</textarea></label>`:''}<p class="help">${session?'Saved securely to your Supabase account.':'Save your changes to keep them in this browser after refresh.'}</p><div id="formerror" class="error" role="alert"></div><div class="actions">${id&&['enquiry','quote','purchase'].includes(kind)?'<button type="button" class="danger" id="delete-record">Delete</button>':''}${id&&kind==='enquiry'&&r.status!=='Quoted'?'<button type="button" id="convert">Create quote</button>':''}${id&&kind==='purchase'&&!session?'<button type="button" id="receivestock">Receive into stock</button>':''}${priced?'<button type="button" id="downloadquote">Download PDF</button>':''}<button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Save ${labels[kind]}</button></div></form>`;
$('#modal').showModal();if(['quote','enquiry'].includes(kind))bindCustomerPicker(r.party);if(kind==='quote'&&!session)bindQuoteTermsPickers();if(kind==='quote')bindQuotePlan();if(kind==='purchase')bindVendorPicker(r.party);$('.close').onclick=()=>$('#modal').close();$('.cancel').onclick=()=>$('#modal').close();if(priced){$('#addline').onclick=()=>{const prev=readLines().pop()||{};$('#lines').insertAdjacentHTML('beforeend',lineHTML({description:'',quantity:1,rate:0,material:prev.material||'',thickness_mm:prev.thickness_mm??null,unit:prev.unit||'pcs'}));wireLines();$$('.linedesc').pop().focus()};wireLines();$('[name=tax]').oninput=updateTotal}if($('#convert'))$('#convert').onclick=()=>{const f=new FormData($('#recordform'));$('#modal').close();editor('quote');$('[name=party]').value=f.get('party');$('[name=party]').dispatchEvent(new Event('change'));$('[name=description]').value=f.get('description');$('[name=notes]').value=`From enquiry ${r.reference}\n${f.get('notes')}`;$('.linedesc').value=f.get('description')};
if(kind==='expense')$('[name=category]').onchange=()=>{const current=$('[name=account_code]').value;$('#expense-account-field').outerHTML=expenseAccountField({category:$('[name=category]').value,account_code:current,id:r.id})};
if($('#delete-record'))$('#delete-record').onclick=()=>confirmRecordDelete(id);
if($('#downloadquote'))$('#downloadquote').onclick=()=>downloadQuotePDF(r);
if($('#receivestock'))$('#receivestock').onclick=()=>poReceiveEditor(id);
$('#recordform').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const btn=form.querySelector('[type=submit]');const data=Object.fromEntries(new FormData(form));const lines=priced?readLines():[];try{lines.forEach(l=>{const p=validSize(l);if(p)throw Error(p)});lines.forEach(l=>validateDiscount(l.discount))}catch(err){$('#formerror').textContent=err.message;return}if(data.valid_until&&data.valid_until<data.date){$('#formerror').textContent='Valid until cannot be before the quote date.';return}const amount=priced?calculate(lines,Number(data.tax)):kind==='enquiry'?0:Number(data.amount);if(!Number.isFinite(amount)||amount<0||amount>1e9){$('#formerror').textContent='Enter a valid amount below PKR 1 billion.';return}const record={...(kind==='expense'?{account_code:data.account_code||null}:{}),...(kind==='quote'&&!session?{valid_until:data.valid_until||null,customer_ref:(data.customer_ref||'').trim(),attention:(data.attention||'').trim(),payment_terms:(data.payment_terms==='__custom'?data.payment_terms_custom:data.payment_terms||'').trim(),lead_time:(data.lead_time||'').trim(),prepared_by:(data.prepared_by||'').trim(),terms:(data.terms||'').trim(),bank_account_id:data.bank_account_id||'',sheet_gap:data.qp_gap===''||data.qp_gap==null?5:Math.max(0,Number(data.qp_gap)||0),sheet_margin:data.qp_margin===''||data.qp_margin==null?0:Math.max(0,Number(data.qp_margin)||0)}:{}),kind,party:data.party.trim(),description:data.description.trim(),date:data.date,status:data.status,category:data.category||'',notes:data.notes||'',lines,tax:priced?Number(data.tax):0,amount};if(!record.party||!record.description){$('#formerror').textContent='Enter a name and description.';return}btn.disabled=true;try{await saveRecord(record,id);$('#modal').close();render();toast(session?'Record saved to Supabase.':'Record saved locally in this browser.')}catch(err){$('#formerror').textContent=err.message}finally{btn.disabled=false}};
}
function gaugeOptions(material,mm,blank='Custom mm / not set'){const match=matchGauge(material,mm),custom=Number(mm)>0&&!match;return `<option value="">${blank}</option>${custom?`<option value="custom" selected>${Number(mm)} mm</option>`:''}`+Object.entries(gauges[material]||{}).map(([g,n])=>`<option value="${g}" title="${n} mm" ${match?.gauge===g?'selected':''}>${g} ga</option>`).join('')}
const lineUnits=['pcs','sheets','sets','kg','m','m²','hrs','lot'];
// One compact row per item: description, material, gauge, thickness, quantity, unit, rate, discount and amount.
// Purchase-order lines pick a standard sheet size (same list as stock items), Custom (W × L in feet) or no size.
function poSizeValue(l){const w=Number(l.width_ft),L=Number(l.length_ft);if(!(w>0&&L>0))return l.size_custom?'custom':'';const p=sheetPresets.find(p=>Math.abs(p.w-Math.min(w,L)*FT)<3&&Math.abs(p.l-Math.max(w,L)*FT)<3);return p?p.id:'custom'}
function poSizeSelect(l){const v=poSizeValue(l);return `<select class="linepreset" aria-label="Sheet size"><option value="" ${v===''?'selected':''}>— Size —</option>${sheetPresets.map(p=>`<option value="${p.id}" ${v===p.id?'selected':''}>${esc(p.label)}</option>`).join('')}<option value="custom" ${v==='custom'?'selected':''}>Custom (ft)…</option></select>`}
function applyPoSize(el){
 const ps=el.querySelector('.linepreset'),span=el.querySelector('.linesize'),w=el.querySelector('.linew'),l=el.querySelector('.linel'),v=ps.value,p=sheetPresets.find(x=>x.id===v);
 span.classList.toggle('hide',v!=='custom');
 if(p){w.value=Math.round(p.w/FT*100)/100;l.value=Math.round(p.l/FT*100)/100}else if(v===''){w.value='';l.value=''}else w.focus();
 const d=el.querySelector('.linedesc');if(p&&(!d.value.trim()||d.value===el.dataset.autodesc)){const m=el.querySelector('.linematerial').value,g=el.querySelector('.linegauge').value;d.value=`${materials[m]||'Steel'} sheet${/^\d/.test(g)?` ${g} ga`:''} ${p.label.split(' (')[0]}`;el.dataset.autodesc=d.value}
 updateTotal();
}
function lineHTML(input){const l=inferThickness(input);return `<div class="lineitem${session?' no-discount':''}" role="row">
 <span class="lineno" aria-hidden="true"></span>
 <div class="linedesc-cell"><input class="linedesc" aria-label="Item description" value="${esc(l.description)}" placeholder="Item, e.g. MS mounting plate" required maxlength="300">${lineMode==='po'?poSizeSelect(l):''}<span class="linesize${lineMode==='po'&&poSizeValue(l)!=='custom'?' hide':''}"><input class="linew" type="number" aria-label="Width in ${lineMode==='po'?'feet':'inches'}" min="0" max="10000" step="any" value="${esc((lineMode==='po'?l.width_ft:l.width_in)??'')}" placeholder="W"><i>×</i><input class="linel" type="number" aria-label="Length in ${lineMode==='po'?'feet':'inches'}" min="0" max="10000" step="any" value="${esc((lineMode==='po'?l.length_ft:l.length_in)??'')}" placeholder="L"><i>${lineMode==='po'?'ft':'in'}</i></span></div>
 <span class="ml ml-qty" aria-hidden="true">Qty</span><input class="lineqty" type="number" aria-label="Quantity" value="${l.quantity}" min="0.001" max="1000000" step="any" required>
 <span class="ml ml-mat" aria-hidden="true">Material</span><select class="linematerial" aria-label="Material"><option value="">Material</option>${Object.entries(materials).map(([k,v])=>`<option value="${k}" ${k===l.material?'selected':''}>${v}</option>`).join('')}</select>
 <span class="ml ml-gau" aria-hidden="true">Gauge</span><select class="linegauge" aria-label="Gauge (US)" ${l.material?'':'disabled'}>${gaugeOptions(l.material,l.thickness_mm,'—')}</select>
 <input class="linemm" type="hidden" aria-label="Thickness in mm" min="0.001" max="500" step="0.001" value="${l.thickness_mm??''}" placeholder="mm">
 <span class="ml ml-area" aria-hidden="true">${lineMode==='po'?'Weight kg':'Area ft²'}</span><output class="linearea" aria-label="${lineMode==='po'?'Weight in kg':'Area in square feet'}"></output>
 <span class="ml ml-unit" aria-hidden="true">Unit</span><select class="lineunit" aria-label="Unit">${lineUnits.map(u=>`<option ${u===(l.unit||'pcs')?'selected':''}>${u}</option>`).join('')}</select>
 <span class="ml ml-rate" aria-hidden="true">Rate (PKR)</span><input class="linerate" type="number" aria-label="Unit price in PKR" value="${l.rate}" min="0" max="1000000000" step="any" required>
 ${session?'':`<span class="ml ml-disc" aria-hidden="true">Disc %</span><input class="linediscount" type="number" aria-label="Discount percent" min="0" max="100" step="any" value="${lineDiscount(l)||''}" placeholder="0">`}
 <span class="ml ml-amt" aria-hidden="true">Amount</span><output class="lineamount" aria-label="Line amount"></output>
 <span class="lineactions"><button type="button" class="moveline" title="Move up" aria-label="Move line up">↑</button><button type="button" class="copyline" title="Duplicate line" aria-label="Duplicate line">⧉</button><button type="button" class="removeline" title="Remove line" aria-label="Remove line">×</button></span>
 ${lineMode==='quote'?`<input type="hidden" class="linesheet" value="${esc(normalizeSheetId(l.sheet)||'')}" data-auto="${l.sheet&&!l.sheet_auto?'':'1'}">`:''}<small class="gauge-note visually-hidden"></small></div>`}
function lineHeader(){return `<div class="lineitem linehead-row${session?' no-discount':''}" aria-hidden="true"><span>#</span><span>${lineMode==='po'?'Item description · Sheet size':'Item description · W × L (in)'}</span><span class="num">Qty</span><span>Material</span><span>Gauge</span><span class="num">${lineMode==='po'?'Weight kg':'Area ft²'}</span><span>Unit</span><span class="num">Rate (PKR)</span>${session?'':'<span class="num">Disc %</span>'}<span class="num">Amount</span><span></span></div>`}
// A line with W x L is priced on its total area (ft²); without a size it is priced on the quantity.
function areaPricing(el){const a=areaSqFt({width_in:el.querySelector('.linew').value,length_in:el.querySelector('.linel').value,quantity:el.querySelector('.lineqty').value});return a?{pricing:'area',area_sqft:a.total}:{pricing:'qty',area_sqft:null}}
// Purchase orders keep the size in feet, show the sheet weight and are priced Qty x Rate.
function poLine(l){const {width_in,length_in,...rest}=l,line={...rest,width_ft:width_in,length_ft:length_in,pricing:'qty',area_sqft:null};return {...line,weight_kg:poWeightKg(line)}}
function readLines(){const rows=$$('.lineitem:not(.linehead-row)');return readLineRows().map((l,i)=>{if(lineMode==='po')return poLine(l);const h=rows[i]?.querySelector('.linesheet');return h&&h.value?{...l,sheet:h.value,sheet_auto:h.dataset.auto==='1'}:l})}
function readLineRows(){return $$('.lineitem:not(.linehead-row)').map(el=>({description:el.querySelector('.linedesc').value,quantity:Number(el.querySelector('.lineqty').value),rate:Number(el.querySelector('.linerate').value),material:el.querySelector('.linematerial').value,unit:el.querySelector('.lineunit')?.value||'pcs',thickness_mm:el.querySelector('.linemm').value===''?null:Number(el.querySelector('.linemm').value),gauge:/^\d/.test(el.querySelector('.linegauge').value)?el.querySelector('.linegauge').value:null,width_in:el.querySelector('.linew').value===''?null:Number(el.querySelector('.linew').value),length_in:el.querySelector('.linel').value===''?null:Number(el.querySelector('.linel').value),...areaPricing(el),gauge_standard:'US sheet-metal',...(Number(el.querySelector('.linediscount')?.value)?{discount:Number(el.querySelector('.linediscount').value)}:{})}))}
function updateGauge(el,origin){const material=el.querySelector('.linematerial'),gauge=el.querySelector('.linegauge'),mm=el.querySelector('.linemm'),desc=el.querySelector('.linedesc');
 if(origin==='gauge'){if(gauges[material.value]?.[gauge.value])mm.value=gauges[material.value][gauge.value];else if(!gauge.value)mm.value='';}
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
 $$('.lineitem:not(.linehead-row)').forEach((el,i)=>{el.querySelector('.lineno').textContent=i+1;const l=lines[i];el.querySelector('.lineamount').textContent=Number.isFinite(l.quantity*l.rate)?money(lineCents(l)/100).replace('PKR ',''):'—';const ao=el.querySelector('.linearea');if(lineMode==='po'){const kg=l.weight_kg;ao.textContent=kg!=null?kg.toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';ao.title=kg!=null?`${l.width_ft}' × ${l.length_ft}' × ${l.thickness_mm} mm × ${l.quantity} = ${kg} kg (nominal density)`:'Enter W × L in feet, material and gauge to see the weight';return}const a=areaSqFt(l);ao.textContent=a?a.total.toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';ao.title=a?`${a.each} ft² per piece × ${l.quantity} = ${a.total} ft². Amount = area × rate.`:'Enter W × L in inches to price by area; otherwise Amount = Qty × Rate.'});
 $('#t-gross').textContent=money(t.gross);$('#t-disc').textContent=t.discount>0?'− '+money(t.discount):money(0);$('#t-disc-row').hidden=!(t.discount>0);$('#t-tax').textContent=money(t.tax);
 $('#total').textContent=money(t.total);
 if($('#qp-body'))refreshQuotePlan();
}
function wireLines(){$$('.lineitem:not(.linehead-row)').forEach(el=>{
 el.querySelectorAll('input,select').forEach(e=>e.oninput=updateTotal);
 const desc=el.querySelector('.linedesc');desc.title=desc.value;desc.addEventListener('input',()=>{desc.title=desc.value});
 el.querySelector('.linemm').oninput=()=>updateGauge(el,'mm');el.querySelector('.linegauge').onchange=()=>updateGauge(el,'gauge');el.querySelector('.linematerial').onchange=()=>updateGauge(el,'material');
 if(el.querySelector('.linepreset'))el.querySelector('.linepreset').onchange=()=>applyPoSize(el);
 el.querySelector('.removeline').onclick=()=>{if($$('.lineitem:not(.linehead-row)').length>1){el.remove();updateTotal()}else toast('Keep at least one line item.')};
 el.querySelector('.moveline').onclick=()=>{const prev=el.previousElementSibling;if(prev&&!prev.classList.contains('linehead-row')){prev.before(el);updateTotal()}};
 el.querySelector('.copyline').onclick=()=>{const [line]=readLinesFrom([el]);el.insertAdjacentHTML('afterend',lineHTML(line));wireLines();el.nextElementSibling.querySelector('.linedesc').focus()};
 updateGauge(el,'init')});updateTotal()}
function readLinesFrom(rows){const all=$$('.lineitem:not(.linehead-row)');const lines=readLines();return rows.map(r=>lines[all.indexOf(r)])}
async function saveRecord(r,id){if(id&&journals.some(j=>j.source_kind==='expense'&&j.source_id===id))throw Error('This expense is posted. Use a journal reversal or adjustment to correct it.');const existing=records.find(v=>v.id===id);if(!session){if(existing)Object.assign(existing,r);else records.unshift({...r,id:crypto.randomUUID(),reference:ref(r.kind,r.date,r.party),created_at:new Date().toISOString()});return}const payload={...r};if(!id){payload.reference=ref(r.kind,r.date,r.party);payload.owner_id=session.user.id}const saved=await api(`/rest/v1/business_records${id?`?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(existing.updated_at)}`:''}`,{method:id?'PATCH':'POST',body:JSON.stringify(payload),headers:{Prefer:'return=representation'}});if(!saved?.length)throw new Error('This record changed in another browser. Close this form, refresh, then reopen it.');if(id)records=records.map(v=>v.id===id?saved[0]:v);else records.unshift(saved[0]);connected=true;lastSync=new Date()}
function ref(k,date=today(),party=''){if(k==='quote'){let last=0;try{last=Number(localStorage.getItem('sutluj-last-quote-number'))||0}catch{}const next=quoteNumber(party,records.filter(r=>r.kind==='quote'),last);try{localStorage.setItem('sutluj-last-quote-number',next.slice(-5))}catch{}return next}return nextDocumentNumber(({quote:'QT',enquiry:'EN',purchase:'PO',expense:'EX',cash:'PC'})[k],records.filter(r=>r.kind===k),date.slice(0,4))}
function settings(){return `<div class="heading"><div><div class="eyebrow">WORKSPACE SETTINGS</div><h1>Your business, connected</h1><p class="sub">GR Synergy Ventures · Pakistani rupee (PKR)</p></div></div><div class="settings">${companyCard()}${stampCard()}${quoteTermsCard()}${bankAccountsCard()}${localBackupCard()}${session?'':resetCard()}<section class="card"><div class="cardhead"><h2>Supabase connection</h2>${badge(connected?'Connected':'Not connected')}</div><div class="cardbody"><p class="help">Your local workspace saves in this browser now. When your Supabase project is ready, run the supplied database setup, create your owner account, then connect here. Export a local backup before switching.</p><form id="connectionform"><div class="formgrid">${field('Project URL','url',config.url||'','url','placeholder="https://your-project.supabase.co" required')}${field('Public publishable key','key',config.key||'','password','placeholder="sb_publishable_…" required autocomplete="off"')}</div><p class="help">Use only a publishable or legacy anon key. Never enter a secret or service-role key. Connection settings stay in this browser. While signed in, records are stored in Supabase; otherwise they are saved locally.</p><div class="actions"><button class="primary" ${session?'disabled':''}>Save connection settings</button></div><div id="configerror" class="error" role="alert"></div></form></div></section><section class="card"><div class="cardhead"><h2>${session?'Signed in':'Owner sign-in'}</h2></div><div class="cardbody">${session?`<p>${esc(session.user.email)}</p><p class="help">Records are private to this account. Use the same owner account on your other browsers. Sign in again after closing or reloading this page.</p><button id="signout">Sign out</button><button id="syncsettings" style="margin-left:10px">Refresh records</button>`:`<form id="loginform"><div class="formgrid">${field('Email','email','','email','required autocomplete="username"')}${field('Password','password','','password','required autocomplete="current-password"')}</div><p class="help">Create this user in Supabase → Authentication → Users first. You do not need to sign in to use local saving.</p><div id="loginerror" class="error" role="alert"></div><div class="actions"><button class="primary">Sign in and load records</button></div></form>`}</div></section><section class="card"><div class="cardhead"><h2>Set up Supabase when you’re ready</h2></div><div class="cardbody"><ol class="help"><li>Create a project in Supabase and choose a region near your business.</li><li>Run <a href="schema.sql" download>the database setup</a> in its SQL Editor.</li><li>Create your owner user in Authentication → Users.</li><li>Copy your project URL and public key from Project Settings → API.</li><li>Save the connection above and sign in. Your live workspace starts empty.</li></ol><p class="help">The initial setup supports one owner account, protects its records with row-level security, and refreshes connected browsers every 30 seconds. Local data is kept separate and is not automatically uploaded.</p></div></section></div>`}
function validateConfig(url,key){const u=new URL(url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.pathname!=='/'||u.search||u.hash||u.username)throw new Error('Use your HTTPS Supabase project URL, without a path.');if(key.startsWith('sb_secret_'))throw new Error('Secret keys must never be used in the browser.');if(!key.startsWith('sb_publishable_')){try{const p=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(p.role!=='anon')throw Error()}catch{throw new Error('Enter a public publishable key or legacy anon key.')}}return {url:u.origin,key}}
function bindSettings(){bindCompany();if($('#restore-file'))$('#restore-file').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)restoreBackup(file)};bindStamp();bindQuoteTerms();bindBankAccounts();if($('#reset-form'))bindReset();$('#connectionform').onsubmit=e=>{e.preventDefault();try{const f=new FormData(e.target);config=validateConfig(f.get('url').trim(),f.get('key').trim());localStorage.setItem('sutluj-connection',JSON.stringify(config));toast('Connection settings saved. Sign in below.')}catch(err){$('#configerror').textContent=err.message}};if($('#loginform'))$('#loginform').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button');const localBeforeLogin=structuredClone(workspaceData());btn.disabled=true;try{validateConfig(config.url,config.key);const f=new FormData(e.target);const result=await fetchJSON(config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});saveLocalWorkspace();if(localSaveError)throw Error(localSaveError);session={...result,expires_at:Date.now()+result.expires_in*1000};records=[];customers=[];vendors=[];invoices=[];payments=[];workOrders=[];journals=[];stockItems=[];stockMoves=[];employees=[];attendance=[];advances=[];payrolls=[];scrapSales=[];await sync(false);navigate('overview');toast('Connected. Your live business records are ready.')}catch(err){session=null;connected=false;({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=localBeforeLogin);$('#loginerror').textContent=err.message||'Could not connect. Check your settings.'}finally{btn.disabled=false}};if($('#signout'))$('#signout').onclick=async()=>{try{await api('/auth/v1/logout',{method:'POST'})}catch{}session=null;connected=false;restoreLocalWorkspace();render();toast('Signed out. Local workspace restored.')};if($('#syncsettings'))$('#syncsettings').onclick=()=>sync(true)}
function samplesToRecords(){return samples.map((r,i)=>({id:`demo-${i}`,kind:r[0],reference:r[1],party:r[2],description:r[3],amount:r[4],status:r[5],category:r[6]||'',date:today(),notes:'',lines:[{description:r[3],quantity:1,rate:r[4]}],tax:0}))}
async function fetchJSON(url,opts){const response=await fetch(url,{...opts,signal:AbortSignal.timeout(15000)});const text=await response.text();let data;try{data=text?JSON.parse(text):null}catch{throw new Error('The service returned an unreadable response. Please retry.')}if(!response.ok)throw new Error(data?.msg||data?.message||data?.error_description||'The request failed. Please check your connection.');return data}
let refreshing;
async function api(path,opts={}){if(!session)throw new Error('Please sign in first.');if(Date.now()>session.expires_at-60000){if(!refreshing)refreshing=fetchJSON(config.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})}).then(r=>{session={...r,expires_at:Date.now()+r.expires_in*1000}}).finally(()=>refreshing=null);await refreshing}return fetchJSON(config.url+path,{...opts,headers:{apikey:config.key,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json',...opts.headers}})}
async function sync(notify=false){if(!session||loading)return;loading=true;try{let all=[],offset=0;for(;;){const batch=await api(`/rest/v1/business_records?select=*&order=created_at.desc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)break;offset+=batch.length}const [directory,vendorDirectory,billing,receipts,jobs,ledger]=await Promise.all([loadCustomers(),loadVendors(),loadBilling('invoices'),loadBilling('invoice_payments'),loadBilling('work_orders'),loadBilling('journal_entries')]);journals=ledger;workOrders=jobs;invoices=billing;payments=receipts;records=all;customers=directory;vendors=vendorDirectory;connected=true;lastSync=new Date();if(!$('#modal').open&&!$('#delete-modal').open){const active=document.activeElement?.id;if(!['search','customersearch','vendorsearch','accountsearch','accounttype','invoice-search','job-search','report-from','report-to'].includes(active)){render();if($('#search'))$('#search').value=query;if($('#filter'))$('#filter').value=filter}}if(notify)toast('Records refreshed.')}catch(err){connected=false;if(notify)toast(err.message);else throw err}finally{loading=false}}
const csvCell=v=>{let s=String(v??'');if(typeof v!=='number'&&/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
function downloadCSV(name,rows){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportCSV(){const rows=filtered();const clean=csvCell;const fields=['reference','kind','party','description','date','status','category','account_code','amount','valid_until','notes'];const csv='\uFEFF'+[fields,...rows.map(r=>fields.map(f=>r[f]))].map(r=>r.map(clean).join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`gr-synergy-${tab}-${today()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`Exported ${rows.length} records.`)}
setInterval(()=>{if(session&&!$('#modal').open&&!$('#delete-modal').open&&document.visibilityState==='visible')sync(false).catch(()=>{const b=$('.connection');if(b)b.textContent='Sync unavailable';toast('Unable to refresh records. Check your connection, then refresh.');})},30000);
// Phones show list tables as stacked cards: each cell gets its column heading as a label (see styles.css).
// Grids and input tables keep horizontal scrolling.
const gridTables='.att-table,.pay-table,.grn-table,.parts-table,.scrap-lines,.ageing,.scope-matrix,.sc-rows,.sc-sum,.take-table';
function labelTables(){
 for(const t of document.querySelectorAll('table:not(.stack)')){
  if(t.matches(gridTables))continue;const heads=[...t.querySelectorAll('thead th')].map(th=>th.textContent.trim());if(!heads.length)continue;t.classList.add('stack');
 }
 for(const t of document.querySelectorAll('table.stack')){
  const heads=[...t.querySelectorAll('thead th')].map(th=>th.textContent.trim());
  for(const tr of t.querySelectorAll('tbody tr')){if(tr.dataset.labelled)continue;tr.dataset.labelled='1';let col=0;for(const td of tr.children){td.dataset.label=td.colSpan>1?'':heads[col]||'';col+=td.colSpan||1}}
 }
}
new MutationObserver(()=>{if(!labelTables.queued){labelTables.queued=true;queueMicrotask(()=>{labelTables.queued=false;labelTables()})}}).observe(document.body,{childList:true,subtree:true});
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'navigate_business_module',description:'Open the overview, sales, procurement, accounts, customers, vendors or settings module. Does not create or change records.',inputSchema:{type:'object',properties:{module:{type:'string',enum:Object.keys(icons)}},required:['module'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||!Object.keys(icons).includes(input.module))throw new Error('Unknown module');navigate(input.module);return {module:page,mode:session?'connected':'preview'}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

async function downloadQuotePDF(record){
 const form=$('#recordform');if(!form.reportValidity())return;
 const button=$('#downloadquote');button.disabled=true;button.textContent='Preparing PDF…';$('#formerror').textContent='';
 try{
  const data=Object.fromEntries(new FormData(form));
  const purchase=form.dataset.kind==='purchase';const quote={...record,...data,lines:readLines(),tax:Number(data.tax),...(purchase?{documentType:'purchase'}:{})};
  const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
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
 const label=k=>({workorders:'Work orders',deliveries:'Delivery notes',hr:'HR'})[k]||k[0].toUpperCase()+k.slice(1);
 return ['overview','sales','workorders','deliveries','invoices','procurement','inventory','accounts','hr','customers','vendors','settings'].map(k=>link(k,label(k))).join('');
}

function expenseAccountField(record){const options=expenseAccounts(record.category||'Capital expense');return `<label class="field full" id="expense-account-field">Account<select name="account_code" ${record.id?'':'required'}><option value="">${record.id?'Unclassified - select an account':'Select an account'}</option>${options.map(a=>`<option value="${a.code}" ${a.code===record.account_code?'selected':''}>${a.code} - ${esc(a.name)}</option>`).join('')}</select><small class="fine">Classify here, then review and post this expense in Accounts → Journal.</small></label>`}
function chartPage(){return `<div class="heading"><div><div class="eyebrow">BUSINESS FINANCES</div><h1>Chart of Accounts</h1><p class="sub">${accountList.length} accounts in ${accountGroups.length} groups · PKR · balances as at today</p></div><button class="primary" id="acct-add">＋ Add account</button></div>${notice()}${accountingTabs()}<div class="notice"><span>Post invoices, payments and classified expenses in Journal. Reports use posted entries only; invoice balances are also available in Sales.</span></div><section class="card"><div class="toolbar"><input id="accountsearch" type="search" class="search" aria-label="Search accounts" placeholder="Search account code or name…"><select id="accounttype" aria-label="Account type"><option value="">All account types</option>${[...new Set(accountGroups.map(g=>g.type))].map(t=>`<option>${t}</option>`).join('')}</select></div><div id="accountgroups">${chartGroups('','')}</div></section><p class="help">Customer-owned material is excluded from these inventory accounts; its usage is recorded in Work orders. Customer advances have their own liability group. Customers, vendors and job numbers will remain separate from account codes.</p>`}
// Chart of accounts maintenance: add your own accounts, rename, describe and deactivate. Saved in company
// settings (company.coa) so it travels with backups; codes are never changed or removed.
function saveCoa(coa){company={...company,coa};try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}applyChartSettings(coa)}
function accountEditor(code){
 const coa={custom:[],renamed:{},inactive:[],...(company.coa||{})},a=code?accountList.find(x=>x.code===code):null,isNew=!a;
 const used=!!a&&journals.some(j=>j.lines.some(l=>l.account===code)),bal=a?natural(code,balancesAsAt(journals,today())[code]||0)/100:0,system=a&&systemAccounts.includes(code);
 const groups=accountGroups.map(g=>`<option value="${g.code}" ${a?.parent===g.code?'selected':''}>${g.code} · ${esc(g.name)} (${g.type})</option>`).join('');
 $('#modal').innerHTML=`<div class="modalhead"><h2>${isNew?'New account':`Account ${esc(code)}`}</h2><button class="close" aria-label="Close">×</button></div><form id="acct-form"><div class="formgrid">
 ${isNew?`<label class="field">Group<select name="parent" required><option value="">Choose group</option>${groups}</select></label>${field('Code','code','','text','required maxlength="4" pattern="\\d{4}" placeholder="e.g. 1004"')}`:`<p class="full"><b>${esc(a.code)}</b> · ${esc(accountGroups.find(g=>g.code===a.parent)?.name||'')} · ${esc(a.type)}${a.custom?' · <span class="pill">Your account</span>':''}${system?' · <span class="pill">Used by the app</span>':''}</p>`}
 <label class="field full">Name<input name="name" required maxlength="80" value="${esc(a?.name||'')}"></label>
 <label class="field full">Description <span class="fine">(optional)</span><input name="description" maxlength="200" value="${esc(coa.custom.find(c=>c.code===code)?.description??a?.description??'')}" placeholder="What goes in this account"></label>
 ${isNew?'':`<label class="field full sc-check"><span><input type="checkbox" name="inactive" ${a.inactive?'checked':''} ${system?'disabled':''}> Inactive — hide from account pickers${system?' (this account is used by the app and stays active)':bal?` (balance ${money(bal)} must be zero first)`:''}</span></label>`}</div>
 ${!isNew&&a.baseName&&a.name!==a.baseName?`<p class="help">Standard name: ${esc(a.baseName)}.</p>`:''}<p class="help">Codes are permanent so posted entries never move. ${used?'This account has posted entries.':''}</p>
 <div id="acct-error" class="error" role="alert"></div><div class="actions">${!isNew&&a.custom&&!used?'<button type="button" class="danger" id="acct-delete">Delete</button>':''}<button type="button" class="cancel">Cancel</button><button type="submit" class="primary">${isNew?'Add account':'Save'}</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#acct-form').elements;
 if(isNew)f.parent.onchange=()=>{const g=accountGroups.find(x=>x.code===f.parent.value);if(g)f.code.value=nextAccountCode(g)};
 if($('#acct-delete'))$('#acct-delete').onclick=()=>{if(!confirm(`Delete account ${code}?`))return;saveCoa({...coa,custom:coa.custom.filter(c=>c.code!==code),inactive:coa.inactive.filter(c=>c!==code)});$('#modal').close();render();toast(`Account ${code} deleted.`)};
 $('#acct-form').onsubmit=e=>{e.preventDefault();const name=f.name.value.trim(),desc=f.description.value.trim();
  if(isNew){const p=accountProblem({code:f.code.value.trim(),parent:f.parent.value,name});if(p){$('#acct-error').textContent=p;return}saveCoa({...coa,custom:[...coa.custom,{code:f.code.value.trim(),parent:f.parent.value,name,description:desc}]});$('#modal').close();render();toast(`Account ${f.code.value} · ${name} added.`);return}
  if(!name){$('#acct-error').textContent='Enter the account name.';return}
  const off=f.inactive?.checked;if(off&&!a.inactive&&bal){$('#acct-error').textContent=`This account has a balance of ${money(bal)}. Clear it with a journal before making it inactive.`;return}
  const next={...coa,inactive:off?[...new Set([...coa.inactive,code])]:coa.inactive.filter(c=>c!==code)};
  if(a.custom)next.custom=coa.custom.map(c=>c.code===code?{...c,name,description:desc}:c);else{const r={...coa.renamed};if(name===a.baseName)delete r[code];else r[code]=name;next.renamed=r;next.descriptions={...(coa.descriptions||{}),[code]:desc}}
  saveCoa(next);$('#modal').close();render();toast(`Account ${code} saved.`)};
}
function chartGroups(search,type){const term=search.trim().toLowerCase();const groups=accountGroups.filter(g=>!type||g.type===type).map(g=>({...g,children:!term||`${g.code} ${g.name}`.toLowerCase().includes(term)?g.children:g.children.filter(a=>`${a.code} ${a.name}`.toLowerCase().includes(term))})).filter(g=>g.children.length);const bal=balancesAsAt(journals,today()),nat=c=>natural(c,bal[c]||0)/100;return groups.length?groups.map(g=>{const tot=g.children.reduce((n,a)=>n+nat(a.code),0);return `<details class="account-group" ${term?'open':''}><summary><span class="account-code">${g.code}</span><b>${esc(g.name)}</b><span class="fine">${esc(g.class||'')}</span><span class="pill">${g.type}</span><span class="fine">${g.children.length} sub-accounts</span><b class="acct-total ${tot<0?'neg':''}">${tot?money(tot):'—'}</b></summary><div class="tablewrap"><table><thead><tr><th>CODE</th><th>SUB-ACCOUNT</th><th>TYPE</th><th class="money">BALANCE TODAY</th><th></th></tr></thead><tbody>${g.children.map(a=>`<tr class="${a.inactive?'is-inactive':''}"><td class="ref">${a.code}</td><td>${esc(a.name)}${a.custom?' <span class="pill">Yours</span>':''}${a.inactive?' <span class="pill">Inactive</span>':''}${(company.coa?.descriptions?.[a.code]??a.description)?`<small>${esc(company.coa?.descriptions?.[a.code]??a.description)}</small>`:''}</td><td>${g.type}</td><td class="money ${nat(a.code)<0?'neg':''}">${bal[a.code]?money(nat(a.code)):'—'}</td><td class="quote-actions"><button class="textbutton" data-ledger="${a.code}">Ledger ↗</button><button class="textbutton" data-acct-edit="${a.code}">Edit</button></td></tr>`).join('')}</tbody></table></div></details>`}).join(''):'<div class="empty">No matching accounts.</div>'}
function bindChart(){const update=()=>{$('#accountgroups').innerHTML=chartGroups($('#accountsearch').value,$('#accounttype').value);bindAccountsPro();$$('[data-acct-edit]').forEach(b=>b.onclick=()=>accountEditor(b.dataset.acctEdit))};$$('[data-acct-edit]').forEach(b=>b.onclick=()=>accountEditor(b.dataset.acctEdit));if($('#acct-add'))$('#acct-add').onclick=()=>accountEditor();$('#accountsearch').oninput=update;$('#accounttype').onchange=update}

async function loadBilling(table){let all=[];for(let offset=0;;offset+=500){const batch=await api(`/rest/v1/${table}?select=*&order=created_at.desc,id.asc&offset=${offset}&limit=500`);all.push(...batch);if(batch.length<500)return all}}
function invoiceFromQuote(q){const job=workOrders.find(j=>j.quote_id===q.id);if(!job||job.status!=='Completed'){toast('Complete the work order before issuing an invoice.');return;}const prior=invoices.find(i=>i.quote_id===q.id);if(prior){openInvoice(prior.id);return}$('#modal').innerHTML=`<div class="modalhead"><h2>Create invoice</h2><button class="close" aria-label="Close">×</button></div><form id="issue-invoice"><p>Invoice <b>${esc(q.party)}</b> for completed job <b>${esc(job.reference)}</b> (quotation ${esc(q.reference)}).</p><div class="tablewrap"><table><thead><tr><th>ITEM</th><th class="money">QTY</th><th class="money">AMOUNT</th></tr></thead><tbody>${(q.lines||[]).map(l=>`<tr><td>${esc(l.description)}</td><td class="money">${esc(l.quantity)}</td><td class="money">${money(lineCents(l)/100)}</td></tr>`).join('')}</tbody></table></div><div class="summary"><span>Total including ${esc(q.tax||0)}% sales tax</span><b>${money(q.amount)}</b></div><div class="formgrid" style="margin-top:18px">${field('Invoice date','date',today(),'date',`required max="${today()}"`)}${field('Due date','due_date',dueFromTerms(q.payment_terms,today()),'date','required')}${session?'':`<label class="field full">Bank account to print<select name="bank_account_id">${bankAccountOptions(q.bank_account_id)}</select></label>`}</div><p class="help">${q.payment_terms?`Due date set from the payment terms “${esc(q.payment_terms)}”. `:''}Issuing fixes the invoice details; only payments can be added afterwards.</p><div id="billing-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button class="primary" type="submit">Issue invoice</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();$('.cancel').onclick=()=>$('#modal').close();$('#issue-invoice').onchange=e=>{if(e.target.name==='date'&&q.payment_terms)e.currentTarget.elements.due_date.value=dueFromTerms(q.payment_terms,e.target.value)};$('#issue-invoice').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]'),f=Object.fromEntries(new FormData(e.target));b.disabled=true;try{if(f.due_date<f.date)throw Error('Due date cannot be before invoice date.');if(q.amount<=0)throw Error('Save a quote with a positive total first.');let i;if(session){i=await api('/rest/v1/rpc/issue_quote_invoice',{method:'POST',body:JSON.stringify({p_quote:q.id,p_version:q.updated_at,p_date:f.date,p_due:f.due_date})})}else{i={...structuredClone(q),id:crypto.randomUUID(),quote_id:q.id,quote_reference:q.reference,reference:nextDocumentNumber('INV',invoices,f.date.slice(0,4)),bank_account_id:f.bank_account_id||'',job_id:job.id,job_reference:job.reference,date:f.date,due_date:f.due_date};}if(!invoices.some(x=>x.id===i.id))invoices.unshift(i);page='invoices';jobView=null;render();openInvoice(i.id);toast(`${i.reference} issued for ${q.party}.`)}catch(err){$('#billing-error').textContent=err.message}finally{b.disabled=false}}}
function openInvoice(id){const i=invoices.find(i=>i.id===id);if(!i)return;const {paid,due}=invoiceBalance(i,payments);const history=payments.filter(p=>p.invoice_id===id);const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>${esc(i.reference)}</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody" id="invoice-detail"><div class="actions" style="margin:0 0 20px"><button type="button" id="downloadinvoice">Download PDF</button></div><div id="invoice-pdf-error" class="error" role="alert"></div><p><b>${esc(i.party)}</b> · ${badge(invoiceStatus(i,payments,today()))}</p><p>${esc(i.description)}</p><p class="help">Quote ${esc(i.quote_reference)} · Issued ${esc(i.date)} · Due ${esc(i.due_date)}</p><div class="tablewrap"><table><thead><tr><th>ITEM</th><th>QUANTITY</th><th>RATE</th></tr></thead><tbody>${i.lines.map(l=>`<tr><td>${esc(l.description)}<small>${esc(thicknessText(l))}</small>${lineDiscount(l)?`<small>Less ${lineDiscount(l)}% discount</small>`:''}</td><td>${esc(l.quantity)}</td><td>${money(l.rate)}</td></tr>`).join('')}</tbody></table></div><div class="summary">Total (including ${esc(i.tax)}% tax): <b>${money(i.amount)}</b></div>${session?'':`<label class="field" style="margin-top:14px;max-width:420px">Bank account on the PDF<select id="invoice-bank">${bankAccountOptions(i.bank_account_id)}</select></label>`}<p>Received: <b>${money(paid)}</b> · Outstanding: <b>${money(due)}</b></p><h3>Payment history</h3>${history.length?`<ul>${history.map(p=>`<li>${esc(p.date)} · ${money(p.amount)} · ${esc(p.method)}${p.reference?' · '+esc(p.reference):''}</li>`).join('')}</ul>`:'<p class="help">No payments recorded.</p>'}${due>0?`<form id="invoice-payment"><h3>Record payment</h3><div class="formgrid">${field('Amount received (PKR)','amount','','number',`required min="0.01" max="${due}" step="0.01"`)}${field('Payment date','date',today(),'date',`required min="${i.date}" max="${today()}"`)}${select('Received into','method',['Business Bank Account','Cash on Hand','Petty Cash'],'Business Bank Account')}${field('Payment reference / receipt number','reference','','text','maxlength="150"')}</div><p class="help">Record money already received. This does not collect money. Post the receipt in Accounts → Journal to update the accounting cash/bank balance.</p><div id="billing-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="primary">Record payment</button></div></form>`:''}</div>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();$('#downloadinvoice').onclick=()=>downloadInvoicePDF(i);if($('#invoice-bank'))$('#invoice-bank').onchange=e=>{i.bank_account_id=e.target.value;saveLocalWorkspace();toast('Bank account for this invoice updated.')};if($('#invoice-payment'))$('#invoice-payment').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]'),f=Object.fromEntries(new FormData(e.target));b.disabled=true;try{validatePayment(f.amount,invoiceBalance(i,payments).due);if(f.date<i.date||f.date>today())throw Error('Payment date must be between invoice date and today.');let p;if(session){p=await api('/rest/v1/rpc/record_invoice_payment',{method:'POST',body:JSON.stringify({p_id:requestId,p_invoice:id,p_amount:Number(f.amount),p_date:f.date,p_method:f.method,p_reference:f.reference.trim()})})}else p={...f,amount:Number(f.amount),id:requestId,invoice_id:id};if(!payments.some(x=>x.id===p.id))payments.unshift(p);render();openInvoice(id);toast('Payment recorded.')}catch(err){$('#billing-error').textContent=err.message}finally{b.disabled=false}}}

// ---- Accounts: dashboard, post all, account ledger, financial reports, period lock ----
let ledgerCode='1002',ledgerFrom=today().slice(0,4)+'-01-01',ledgerTo=today(),reportView='pl',reportCompare=true;
const acctName=c=>accountList.find(a=>a.code===c)?.name||c;
const sumNat=(b,codes)=>codes.reduce((n,c)=>n+natural(c,b[c]||0),0)/100;
const lockDate=()=>company.books_lock_date||'';
function accountsDash(){
 const d=today(),b=balancesAsAt(journals,d),ym=d.slice(0,7),month=profitLoss(journals,ym+'-01',d),year=profitLoss(journals,d.slice(0,4)+'-01-01',d);
 const cash=sumNat(b,cashAccounts),recv=sumNat(b,['1101']),pay=sumNat(b,['2001','2002','2003','2004']),q=sourceQueue(),blocked=q.filter(r=>r.source_kind==='expense'&&!r.account_code).length,lock=lockDate();
 const kinds={invoice:'Invoices',payment:'Customer receipts',expense:'Expenses',stock:'Stock movements',vendorpay:'Vendor payments',scrapsale:'Scrap sales',scrapreceipt:'Scrap receipts',advance:'Staff advances',payroll:'Payroll',payrollpay:'Salary payments'};
 const byKind=Object.entries(q.reduce((m,r)=>(m[r.source_kind]=(m[r.source_kind]||0)+1,m),{}));
 const months=Array.from({length:6},(_,k)=>{const m=monthShift(ym,k-5),last=new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7),0)).toISOString().slice(0,10),p=profitLoss(journals,m+'-01',last);return {m,a:p.totalRevenue,b:p.totalDirect+p.totalExpenses}});
 return `<div class="stats">${stat('Cash & bank',money(cash),cashAccounts.map(c=>`${acctName(c).replace(' Account','').replace(' on Hand','')} ${money(natural(c,b[c]||0)/100)}`).join(' · '),'accounts')}${stat('Receivables',money(recv),'Customer receivables (posted)','invoices')}${stat('Payables',money(pay),'Supplier payables (posted)','procurement')}${stat(`Net profit · ${monthLabel(ym,true)}`,money(month.net),`${year.net<0?'Loss':'Profit'} ${d.slice(0,4)} to date: ${money(year.net)}`,'accounts')}</div>
 <div class="ov-grid"><div class="ov-col">
 <section class="card"><div class="cardhead"><div><h2>Awaiting posting</h2><p class="sub">${q.length?`${q.length} transaction${q.length===1?'':'s'} not yet in the books`:'Everything is posted.'}</p></div><div class="row">${q.length?`<button id="post-all" class="primary">Post all…</button>`:''}<button data-tab="journal">Journal ↗</button></div></div>${q.length?`<ul class="post-kinds">${byKind.map(([k,n])=>`<li><span>${esc(kinds[k]||k)}</span><b>${n}</b></li>`).join('')}</ul>${blocked?`<p class="help" style="padding:0 24px 16px">${blocked} expense${blocked===1?' needs':'s need'} an account before posting (Accounts → Expenses).</p>`:''}`:'<div class="all-clear"><b>All clear</b><span>Reports include every recorded transaction.</span></div>'}</section>
 <section class="card"><div class="cardhead"><div><h2>${monthLabel(ym,true)} at a glance</h2><p class="sub">From posted entries.</p></div><button data-report="pl">Full P&amp;L ↗</button></div><div class="cardbody pl-mini">${[['Revenue',month.totalRevenue],['Direct costs',-month.totalDirect],['Gross profit',month.gross,month.grossMargin],['Operating expenses',-month.totalExpenses],['Net profit',month.net,month.netMargin]].map(([k,v,m],i)=>`<div class="${i===2||i===4?'sub-total':''}"><span>${k}${m!=null&&m!==undefined?` <small>${m}%</small>`:''}</span><b class="${v<0?'neg':''}">${money(v)}</b></div>`).join('')}</div></section></div>
 <div class="ov-col"><section class="card"><div class="cardhead"><div><h2>Revenue vs costs</h2><p class="sub">Last 6 months · posted revenue against direct costs and expenses.</p></div></div><div class="cardbody">${months.some(x=>x.a||x.b)?pairChart(months,'Revenue','Costs'):'<div class="all-clear"><b>No posted figures yet</b><span>Post the queue to see the trend.</span></div>'}</div></section>
 <section class="card"><div class="cardhead"><div><h2>Period lock</h2><p class="sub">${lock?`Books closed up to <b>${esc(lock)}</b>. Nothing can be posted or reversed on or before that date.`:'Books are open. Close a finished month so nothing is posted into it by mistake.'}</p></div></div><div class="cardbody lock-row"><label class="row">Lock up to <input type="date" id="lock-date" value="${esc(lock)}" max="${d}"></label><button id="lock-save">${lock?'Update lock':'Lock books'}</button>${lock?'<button id="lock-clear" class="textbutton danger">Unlock</button>':''}</div></section></div></div>`;
}
// Post every queued transaction with default accounts (reviewable first).
function postAllEditor(){
 const q=sourceQueue(),lock=lockDate(),revs=accountList.filter(a=>a.type==='Revenue'&&!a.inactive),requestId=crypto.randomUUID();
 $('#modal').innerHTML=`<div class="modalhead"><h2>Post all to the accounts</h2><button class="close" aria-label="Close">×</button></div><form id="post-all-form"><div class="formgrid">
 <label class="field">Invoices: revenue account<select name="revenue">${revs.map(a=>`<option value="${a.code}" ${a.code==='4001'?'selected':''}>${a.code} · ${esc(a.name)}</option>`).join('')}</select></label>
 <label class="field">Paid expenses: paid from<select name="paid">${cashAccounts.map(c=>`<option value="${c}" ${c==='1002'?'selected':''}>${c} · ${esc(acctName(c))}</option>`).join('')}</select></label></div>
 <p class="help">Stock receipts use the suggested supplier payable for each item; pending expenses go to Service Contractors (2004). Everything else posts exactly as on its own Review posting screen.</p><div id="post-all-list"></div>
 <div id="journal-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary" id="post-all-go">Post</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#post-all-form').elements;
 const plan=()=>q.map(r=>{let lines=null,why='';if(lock&&r.date<=lock)why=`Dated in the locked period (≤ ${lock})`;else if(r.source_kind==='expense'&&!r.account_code)why='Classify the expense first';else try{lines=sourceLines(r.source_kind,r,r.source_kind==='invoice'?f.revenue.value:undefined,r.source_kind==='stock'&&r.type==='receipt'?suggestedOffset(r.item):r.source_kind==='expense'?(r.status==='Paid'?f.paid.value:'2004'):undefined);validateJournal(lines)}catch(e){lines=null;why=e.message}return {r,lines,why}});
 const show=()=>{const p=plan(),ok=p.filter(x=>x.lines),skip=p.filter(x=>!x.lines);$('#post-all-list').innerHTML=`<div class="tablewrap" style="max-height:340px"><table class="post-all-table"><thead><tr><th>TRANSACTION</th><th>DATE</th><th class="money">AMOUNT</th><th>POSTS AS</th></tr></thead><tbody>${p.map(x=>`<tr class="${x.lines?'':'skip'}"><td>${esc(x.r.label)}<small>${esc(x.r.party||'')}</small></td><td>${esc(x.r.date)}</td><td class="money">${money(x.r.amount)}</td><td>${x.lines?x.lines.map(l=>`<small>${l.debit?'Dr':'Cr'} ${esc(l.account)} ${esc(acctName(l.account))} · ${money(l.debit||l.credit)}</small>`).join(''):`<small class="late">Skipped: ${esc(x.why)}</small>`}</td></tr>`).join('')}</tbody></table></div><p class="help"><b>${ok.length}</b> will be posted${skip.length?`, <b>${skip.length}</b> skipped`:''}.</p>`;$('#post-all-go').textContent=`Post ${ok.length} entr${ok.length===1?'y':'ies'}`;$('#post-all-go').disabled=!ok.length};
 $('#post-all-form').onchange=show;show();
 $('#post-all-form').onsubmit=async e=>{e.preventDefault();const btn=$('#post-all-go');btn.disabled=true;let n=0;try{for(const x of plan().filter(x=>x.lines)){await saveJournal({id:crypto.randomUUID(),date:x.r.date,description:x.r.label,source_kind:x.r.source_kind,source_id:x.r.id,lines:x.lines});n++}$('#modal').close();render();toast(`${n} entr${n===1?'y':'ies'} posted. Reports updated.`)}catch(err){$('#journal-error').textContent=`${n} posted, then: ${err.message}`;render()}finally{btn.disabled=false}};
}
function ledgerPage(){
 const L=accountLedger(journals,ledgerCode,ledgerFrom,ledgerTo),a=accountList.find(x=>x.code===ledgerCode);
 return `<section class="card"><div class="toolbar ledger-tools"><label class="row">Account <select id="lg-account">${accountGroups.map(g=>`<optgroup label="${g.code} ${esc(g.name)}">${g.children.map(c=>`<option value="${c.code}" ${c.code===ledgerCode?'selected':''}>${c.code} · ${esc(c.name)}</option>`).join('')}</optgroup>`).join('')}</select></label><label class="row">From <input type="date" id="lg-from" value="${esc(ledgerFrom)}"></label><label class="row">To <input type="date" id="lg-to" value="${esc(ledgerTo)}"></label><span class="spacer"></span><button id="lg-csv">Export CSV</button><button id="lg-print">Print</button></div>
 <div class="ledger-sum"><div><span>Opening balance</span><b>${money(L.opening)}</b></div><div><span>Debits</span><b>${money(L.debits)}</b></div><div><span>Credits</span><b>${money(L.credits)}</b></div><div class="close"><span>Closing balance · ${esc(a?.type||'')}</span><b>${money(L.closing)}</b></div></div>
 <div class="tablewrap" id="lg-table"><table class="ledger-table"><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>AGAINST</th><th class="money">DEBIT</th><th class="money">CREDIT</th><th class="money">BALANCE</th></tr></thead><tbody><tr class="opening"><td>${esc(ledgerFrom)}</td><td colspan="4">Opening balance</td><td class="money"><b>${money(L.opening)}</b></td></tr>${L.entries.map(e=>`<tr><td>${esc(e.date)}</td><td><button class="linklike" data-journal="${esc(e.id)}">${esc(e.description)}</button><small>${esc(({manual:'Manual journal',reversal:'Reversal',invoice:'Invoice',payment:'Customer receipt',expense:'Expense',stock:'Stock movement',vendorpay:'Vendor payment',scrapsale:'Scrap sale',scrapreceipt:'Scrap receipt',advance:'Staff advance',payroll:'Payroll',payrollpay:'Salary payment'})[e.kind]||e.kind)}</small></td><td><small>${e.against.map(c=>`${c} ${esc(acctName(c))}`).join('<br>')}</small></td><td class="money">${e.debit?money(e.debit):''}</td><td class="money">${e.credit?money(e.credit):''}</td><td class="money"><b>${money(e.balance)}</b></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No posted entries for this account in the period.</td></tr>'}<tr class="total"><td colspan="3">Closing balance</td><td class="money">${money(L.debits)}</td><td class="money">${money(L.credits)}</td><td class="money"><b>${money(L.closing)}</b></td></tr></tbody></table></div></section><p class="help">Balances are shown on the account's normal side: debit for assets, costs and expenses; credit for liabilities, equity and revenue. Click an entry to open the journal.</p>`;
}
const reportViews=[['pl','Profit & loss'],['bs','Balance sheet'],['tb','Trial balance'],['cf','Cash flow'],['tax','Sales tax']];
function reportsPage(){
 return `<section class="card"><form id="report-period" class="toolbar report-tools"><span class="seg report-seg">${reportViews.map(([k,l])=>`<button type="button" data-report="${k}" class="${reportView===k?'on done':''}">${l}</button>`).join('')}</span>${['bs','tb'].includes(reportView)?'':`<label class="row">From <input type="date" name="from" value="${esc(reportFrom)}" required></label>`}<label class="row">${['bs','tb'].includes(reportView)?'As at':'To'} <input type="date" name="to" value="${esc(reportTo)}" required></label>${reportView==='pl'?`<label class="row sc-check"><input type="checkbox" id="report-compare" ${reportCompare?'checked':''}> Compare with previous period</label>`:''}<span class="spacer"></span><span class="seg quick-periods"><button type="button" data-period="month">This month</button><button type="button" data-period="lastmonth">Last month</button><button type="button" data-period="year">This year</button></span><button id="report-csv" type="button">CSV</button><button id="report-print" type="button">Print</button></form><div id="report-error" class="error" role="alert"></div></section><div id="report-output">${reportOutput()}</div>`;
}
function reportOutput(){
 const q=sourceQueue().filter(s=>s.date<=reportTo).length,warn=q?`<p class="help warn">${q} transaction${q===1?'':'s'} up to ${esc(reportTo)} ${q===1?'is':'are'} not posted yet and not in these figures. <button class="textbutton" data-tab="dash">Post them ↗</button></p>`:'';
 const head=(title,sub)=>`<div class="report-head"><b>${esc(company.name)}</b><h2>${title}</h2><span>${sub}</span></div>`;
 if(reportView==='pl'){
  const p=profitLoss(journals,reportFrom,reportTo),pp=reportCompare?previousPeriod(reportFrom,reportTo):null,o=pp?profitLoss(journals,pp.from,pp.to):null,cols=o?4:2;
  const ch=(a,b)=>!o?'':`<td class="money">${money(b)}</td><td class="money ${a-b<0?'neg':'pos'}">${b?`${a-b>=0?'+':''}${Math.round((a-b)/Math.abs(b)*100)}%`:a?'new':'—'}</td>`;
  const tot=rows=>rows.reduce((n,r)=>n+r.amount,0);
  const section=(title,rows,orows,always=true)=>{const codes=[...new Set([...rows.map(r=>r.code),...(orows||[]).map(r=>r.code)])].sort();if(!codes.length&&!always)return '';const a=tot(rows),b=tot(orows||[]);return `<tr class="sec"><td colspan="${cols}">${title}</td></tr>${codes.map(c=>{const x=rows.find(r=>r.code===c)?.amount||0,y=(orows||[]).find(r=>r.code===c)?.amount||0;return `<tr><td><button class="linklike" data-ledger="${c}">${c} · ${esc(acctName(c))}</button></td><td class="money ${x<0?'neg':''}">${money(x)}</td>${ch(x,y)}</tr>`}).join('')||`<tr><td colspan="${cols}" class="fine">None</td></tr>`}<tr class="sub-total"><td>Total ${title.toLowerCase()}</td><td class="money">${money(a)}</td>${ch(a,b)}</tr>`};
  const byCls=(src,c)=>(src||[]).filter(r=>r.cls===c),opCls=['Operating expenses','Finance costs','Other expenses'];
  const line=(label,a,b,cls='grand',m)=>`<tr class="${cls}"><td>${label}${m!=null?` <small>${m}% margin</small>`:''}</td><td class="money">${money(a)}</td>${ch(a,b)}</tr>`;
  const opA=p.totalExpenses-p.totalTax,opB=o?o.totalExpenses-o.totalTax:0;
  return warn+`<section class="card report">${head('Profit &amp; loss',`${esc(reportFrom)} to ${esc(reportTo)}${o?` · compared with ${esc(pp.from)} to ${esc(pp.to)}`:''}`)}<div class="tablewrap"><table class="fin-table"><thead><tr><th>ACCOUNT</th><th class="money">THIS PERIOD</th>${o?'<th class="money">PREVIOUS</th><th class="money">CHANGE</th>':''}</tr></thead><tbody>
  ${section('Revenue',p.revenue,o?.revenue)}${section('Cost of sales',p.direct,o?.direct)}${line('Gross profit',p.gross,o?.gross,'grand',p.grossMargin)}
  ${opCls.map(c=>section(c,byCls(p.expenses,c),byCls(o?.expenses,c),c==='Operating expenses')).join('')}${line('Profit before tax',p.gross-opA,o?o.gross-opB:0)}
  ${section('Taxation',byCls(p.expenses,'Taxation'),byCls(o?.expenses,'Taxation'),false)}${line('Net profit / loss after tax',p.net,o?.net,'grand net',p.netMargin)}</tbody></table></div></section>`;
 }
 if(reportView==='bs'){
  const s=balanceSheet(journals,reportTo),money0=v=>money(v);
  const block=(title,groups,total,classes,extra='')=>`<tr class="sec"><td colspan="2">${title}</td></tr>${classes.map(c=>{const gs=groups.filter(g=>(g.cls||classes[0])===c);if(!gs.length)return '';return `${classes.length>1?`<tr class="cls"><td colspan="2">${esc(c)}</td></tr>`:''}${gs.map(g=>`<tr class="grp"><td class="ind">${g.code} ${esc(g.name)}</td><td></td></tr>${g.lines.map(l=>`<tr><td class="ind2"><button class="linklike" data-ledger="${l.code}">${l.code} · ${esc(l.name)}</button></td><td class="money ${l.amount<0?'neg':''}">${money0(l.amount)}</td></tr>`).join('')}<tr class="sub-total"><td class="ind">Total ${esc(g.name.toLowerCase())}</td><td class="money">${money0(g.total)}</td></tr>`).join('')}${classes.length>1?`<tr class="cls-total"><td>Total ${esc(c.toLowerCase())}</td><td class="money">${money0(gs.reduce((n,g)=>n+g.total,0))}</td></tr>`:''}`}).join('')}${extra}<tr class="grand"><td>Total ${title.toLowerCase()}</td><td class="money">${money0(total)}</td></tr>`;
  return warn+`<section class="card report">${head('Balance sheet',`As at ${esc(reportTo)}`)}<div class="tablewrap"><table class="fin-table"><tbody>${block('Assets',s.assets,s.totalAssets,['Non-current assets','Current assets'])}${block('Liabilities',s.liabilities,s.totalLiabilities,['Non-current liabilities','Current liabilities'])}${block('Equity',s.equity,s.totalEquity,['Equity'],`<tr><td class="ind">Current earnings (profit not yet closed to retained earnings)</td><td class="money">${money0(s.earnings)}</td></tr>`)}<tr class="grand net"><td>Liabilities + equity</td><td class="money">${money0(s.totalLiabilities+s.totalEquity)}</td></tr></tbody></table></div><p class="bs-check ${s.balanced?'ok':'late'}">${s.balanced?'✓ Balanced: assets equal liabilities plus equity.':`Out of balance by ${money(s.difference)}.`}</p></section>`;
 }
 if(reportView==='tb'){
  const t=trialBalance(journals,reportTo),even=Math.round(t.debit*100)===Math.round(t.credit*100);
  return warn+`<section class="card report">${head('Trial balance',`As at ${esc(reportTo)}`)}<div class="tablewrap"><table class="fin-table"><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th class="money">DEBIT</th><th class="money">CREDIT</th></tr></thead><tbody>${t.rows.map(r=>`<tr><td><button class="linklike" data-ledger="${r.code}">${r.code}</button></td><td>${esc(r.name)}</td><td>${esc(r.type)}</td><td class="money">${r.debit?money(r.debit):''}</td><td class="money">${r.credit?money(r.credit):''}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">No posted balances.</td></tr>'}<tr class="grand"><td colspan="3">Totals</td><td class="money">${money(t.debit)}</td><td class="money">${money(t.credit)}</td></tr></tbody></table></div><p class="bs-check ${even?'ok':'late'}">${even?'✓ Debits equal credits.':'Debits and credits differ.'}</p></section>`;
 }
 if(reportView==='cf'){
  const c=cashFlow(journals,reportFrom,reportTo),acts=['Operating','Investing','Financing'];
  return warn+`<section class="card report">${head('Cash flow',`${esc(reportFrom)} to ${esc(reportTo)} · cash on hand, bank and petty cash`)}<div class="tablewrap"><table class="fin-table"><thead><tr><th>SOURCE / USE OF CASH</th><th class="money">CASH IN</th><th class="money">CASH OUT</th><th class="money">NET</th></tr></thead><tbody><tr class="grp"><td>Opening cash &amp; bank</td><td></td><td></td><td class="money"><b>${money(c.opening)}</b></td></tr>${acts.map(a=>{const rows=c.rows.filter(r=>r.activity===a);return rows.length?`<tr class="sec"><td colspan="4">${a} activities</td></tr>${rows.map(r=>`<tr><td class="ind">${r.code} · ${esc(r.name)}</td><td class="money">${r.cashIn?money(r.cashIn):''}</td><td class="money">${r.cashOut?money(r.cashOut):''}</td><td class="money ${r.net<0?'neg':''}">${money(r.net)}</td></tr>`).join('')}<tr class="sub-total"><td class="ind">Net cash from ${a.toLowerCase()} activities</td><td></td><td></td><td class="money">${money(c[a.toLowerCase()])}</td></tr>`:''}).join('')}<tr class="grand"><td>Total</td><td class="money">${money(c.totalIn)}</td><td class="money">${money(c.totalOut)}</td><td class="money">${money(c.totalIn-c.totalOut)}</td></tr><tr class="grand net"><td>Closing cash &amp; bank</td><td></td><td></td><td class="money">${money(c.closing)}</td></tr></tbody></table></div></section>`;
 }
 const m=movements(journals,reportFrom,reportTo),input=(m['2201']||0)/100,output=-(m['2202']||0)/100,ctrl=-(m['2203']||0)/100;
 return warn+`<section class="card report">${head('Sales tax summary',`${esc(reportFrom)} to ${esc(reportTo)}`)}<div class="tablewrap"><table class="fin-table"><tbody><tr><td><button class="linklike" data-ledger="2202">2202 · Output tax on sales</button></td><td class="money">${money(output)}</td></tr><tr><td><button class="linklike" data-ledger="2201">2201 · Input tax on purchases</button></td><td class="money">− ${money(input)}</td></tr><tr class="grand"><td>${output-input>=0?'Net tax payable':'Net tax refundable'}</td><td class="money">${money(Math.abs(output-input))}</td></tr><tr><td><button class="linklike" data-ledger="2203">2203 · Tax control (payments / adjustments)</button></td><td class="money">${money(ctrl)}</td></tr></tbody></table></div><p class="help" style="padding:0 24px 16px">From the tax amounts posted on invoices, scrap sales and purchases. A guide for your return, not a filed return.</p></section>`;
}
function printReport(){
 const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print the report.');return}
 const html=($('#report-output')||$('#lg-table'))?.innerHTML||'';
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(company.name)} report</title><style>body{font:12.5px Helvetica,Arial,sans-serif;margin:28px;color:#1a2b36}table{width:100%;border-collapse:collapse}td,th{padding:6px 8px;border-bottom:1px solid #e1e6e8;text-align:left}.money{text-align:right}.sec td{font-weight:700;padding-top:14px;text-transform:uppercase;font-size:11px;color:#55666b}.grand td{font-weight:700;border-top:2px solid #1a2b36}.sub-total td{font-weight:600}.ind{padding-left:22px}.report-head h2{margin:4px 0}.report-head span{color:#6b7a80}button{all:unset}.help,.warn{display:none}small{color:#6b7a80}@media print{.noprint{display:none}}</style></head><body><button class="noprint" onclick="print()" style="all:revert">Print</button>${html}</body></html>`);w.document.close();
}
function bindAccountsPro(){
 if(page!=='accounts')return;
 $$('[data-report]').forEach(b=>b.onclick=()=>{reportView=b.dataset.report;tab='reports';render()});
 $$('[data-ledger]').forEach(b=>b.onclick=()=>{ledgerCode=b.dataset.ledger;if(tab==='reports'){ledgerFrom=['bs','tb'].includes(reportView)?reportTo.slice(0,4)+'-01-01':reportFrom;ledgerTo=reportTo}tab='ledger';render();window.scrollTo(0,0)});
 if($('#post-all'))$('#post-all').onclick=postAllEditor;
 if($('#lock-save'))$('#lock-save').onclick=()=>{const v=$('#lock-date').value;if(!v){toast('Choose the last date to lock.');return}company={...company,books_lock_date:v};try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}render();toast(`Books locked up to ${v}.`)};
 if($('#lock-clear'))$('#lock-clear').onclick=()=>{if(!confirm('Unlock the books? Entries could then be posted into closed periods.'))return;const {books_lock_date,...rest}=company;company=rest;try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}render();toast('Books unlocked.')};
 if($('#lg-account')){const go=()=>{const f=$('#lg-from').value,t=$('#lg-to').value;if(!f||!t||f>t){toast('From date must be on or before the To date.');return}ledgerCode=$('#lg-account').value;ledgerFrom=f;ledgerTo=t;render()};$('#lg-account').onchange=go;$('#lg-from').onchange=go;$('#lg-to').onchange=go;
  $('#lg-csv').onclick=()=>{const L=accountLedger(journals,ledgerCode,ledgerFrom,ledgerTo);downloadCSV(`gr-synergy-ledger-${ledgerCode}-${ledgerTo}.csv`,[['Date','Description','Against','Debit (PKR)','Credit (PKR)','Balance (PKR)'],[ledgerFrom,'Opening balance','','','',L.opening],...L.entries.map(e=>[e.date,e.description,e.against.join(' '),e.debit||'',e.credit||'',e.balance]),[ledgerTo,'Closing balance','',L.debits,L.credits,L.closing]]);toast('Ledger exported.')};$('#lg-print').onclick=printReport}
 if($('#report-period')){const form=$('#report-period');
  form.onchange=e=>{if(e.target.id==='report-compare'){reportCompare=e.target.checked;render();return}const f=form.elements,from=f.from?.value||reportFrom,to=f.to.value;if(!to||from>to){$('#report-error').textContent='From date must be on or before the end date.';return}reportFrom=from;reportTo=to;render()};form.onsubmit=e=>e.preventDefault();
  $$('[data-period]').forEach(b=>b.onclick=()=>{const d=today(),k=b.dataset.period;if(k==='month'){reportFrom=d.slice(0,7)+'-01';reportTo=d}else if(k==='lastmonth'){const m=monthShift(d.slice(0,7),-1);reportFrom=m+'-01';reportTo=new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7),0)).toISOString().slice(0,10)}else{reportFrom=d.slice(0,4)+'-01-01';reportTo=d}render()});
  $('#report-print').onclick=printReport;
  $('#report-csv').onclick=()=>{let rows;if(reportView==='pl'){const p=profitLoss(journals,reportFrom,reportTo);rows=[['Section','Code','Account','Amount (PKR)'],...p.revenue.map(r=>['Revenue',r.code,r.name,r.amount]),['Revenue','','Total',p.totalRevenue],...p.direct.map(r=>['Direct costs',r.code,r.name,r.amount]),['Direct costs','','Total',p.totalDirect],['','','Gross profit',p.gross],...p.expenses.map(r=>['Expenses',r.code,r.name,r.amount]),['Expenses','','Total',p.totalExpenses],['','','Net profit',p.net]]}
   else if(reportView==='bs'){const s=balanceSheet(journals,reportTo);rows=[['Section','Group','Code','Account','Amount (PKR)'],...[['Assets',s.assets],['Liabilities',s.liabilities],['Equity',s.equity]].flatMap(([sec,gs])=>gs.flatMap(g=>g.lines.map(l=>[sec,g.name,l.code,l.name,l.amount]))),['Equity','','','Current earnings',s.earnings],['','','','Total assets',s.totalAssets],['','','','Total liabilities',s.totalLiabilities],['','','','Total equity',s.totalEquity]]}
   else if(reportView==='tb'){const t=trialBalance(journals,reportTo);rows=[['Code','Account','Type','Debit (PKR)','Credit (PKR)'],...t.rows.map(r=>[r.code,r.name,r.type,r.debit,r.credit]),['','Totals','',t.debit,t.credit]]}
   else if(reportView==='cf'){const c=cashFlow(journals,reportFrom,reportTo);rows=[['Activity','Code','Source / use','Cash in','Cash out','Net'],['','','Opening cash','','',c.opening],...c.rows.map(r=>[r.activity,r.code,r.name,r.cashIn,r.cashOut,r.net]),['','','Closing cash','','',c.closing]]}
   else{const m=movements(journals,reportFrom,reportTo);rows=[['Item','Amount (PKR)'],['Output tax',-(m['2202']||0)/100],['Input tax',(m['2201']||0)/100],['Tax control',-(m['2203']||0)/100]]}
   downloadCSV(`gr-synergy-${reportView}-${reportTo}.csv`,rows);toast('Report exported.')};
 }
}
function accountingTabs(){return `<div class="sectionlinks">${[['dash','Dashboard'],['chart','Chart of Accounts'],['journal',`Journal${sourceQueue().length?` · ${sourceQueue().length} to post`:''}`],['ledger','Ledger'],['reports','Reports'],['expense','Expenses'],['cash','Petty cash']].map(([key,label])=>`<button data-tab="${key}" class="${tab===key?'selected':''}">${label}</button>`).join('')}</div>`}
function sourceQueue(){return [...invoices.map(r=>({...r,source_kind:'invoice',label:r.reference})),...payments.map(r=>({...r,source_kind:'payment',label:'Receipt · '+(invoices.find(i=>i.id===r.invoice_id)?.reference||r.invoice_id)})),...records.filter(r=>r.kind==='expense').map(r=>({...r,source_kind:'expense',label:r.reference})),...stockQueue(),...hrQueue(),...scrapQueue(),...vendorPayments.map(p=>({...p,source_kind:'vendorpay',label:`${p.reference} · Payment to ${p.vendor}`,party:p.vendor}))].filter(r=>!journals.some(j=>j.source_kind===r.source_kind&&j.source_id===r.id))}
function accountingPage(){const t={dash:['Accounts','PKR · Cash, receivables, payables, profit and posting at a glance.'],journal:['Journal & posting','PKR · Review and post transactions to the accounts.'],ledger:['Account ledger','PKR · Every posted entry for one account, with running balance.'],reports:['Financial reports','PKR · Based only on posted journal entries.']}[tab]||['Accounts',''];return `<div class="heading"><div><div class="eyebrow">BUSINESS FINANCES</div><h1>${t[0]}</h1><p class="sub">${t[1]}${lockDate()?` · books locked to ${esc(lockDate())}`:''}</p></div><div class="heading-actions">${sourceQueue().length&&tab!=='reports'?'<button id="post-all">Post all…</button>':''}<button class="primary" id="new-journal">＋ Journal entry</button></div></div>${notice()}${accountingTabs()}${tab==='journal'?journalPage():tab==='ledger'?ledgerPage():tab==='dash'?accountsDash():reportsPage()}`}
function journalPage(){const pending=sourceQueue();return `<section class="card"><div class="cardhead"><h2>Awaiting posting (${pending.length})</h2></div><p class="help" style="padding:0 24px">Quotes and purchase orders are not posted. Classify expenses first. Review the revenue account for each invoice; an invoice with mixed revenue can be split with a later journal adjustment. Petty cash register entries are separate and need manual journal entries. Stock movements post at the value recorded in Inventory. Payroll posts when finalised and again when salaries are paid.</p>${pending.length?`<div class="tablewrap"><table><thead><tr><th>SOURCE</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>${pending.map(r=>`<tr><td>${esc(r.label)}<small>${esc(r.party||r.method||'')} · ${r.source_kind}</small></td><td>${esc(r.date)}</td><td>${money(r.amount)}</td><td><button data-post-kind="${r.source_kind}" data-post-id="${esc(r.id)}" ${r.source_kind==='expense'&&!r.account_code?'disabled':''}>${r.source_kind==='expense'&&!r.account_code?'Classify expense first':'Review posting'}</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">All available transactions have been posted.</div>'}</section><section class="card" style="margin-top:24px"><div class="cardhead"><h2>Posted journal (${journals.length})</h2></div>${journals.length?`<div class="tablewrap"><table><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>DEBITS = CREDITS</th><th></th></tr></thead><tbody>${journals.map(j=>`<tr><td>${esc(j.date)}</td><td>${esc(j.description)}<small>${j.source_kind==='reversal'?'Reversal':esc(j.source_kind)}${journals.some(r=>r.reversal_of===j.id)?' · Reversed':''}</small></td><td>${money(j.lines.reduce((n,l)=>n+Number(l.debit),0))}</td><td><button data-journal="${esc(j.id)}">View</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No posted entries yet. Reports will show zero until transactions are posted.</div>'}</section>`}
function journalLinesTable(lines){return `<div class="tablewrap"><table><thead><tr><th>ACCOUNT</th><th>DEBIT</th><th>CREDIT</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${esc(l.account)} · ${esc(accountList.find(a=>a.code===l.account)?.name||'')}</td><td>${money(l.debit)}</td><td>${money(l.credit)}</td></tr>`).join('')}</tbody></table></div>`}
async function persistJournal(payload){await saveJournal(payload);$('#modal').close();render();toast('Journal posted. Reports updated.')}
// Saves one journal (Supabase or local). Refuses dates inside the locked period.
async function saveJournal(payload){if(lockDate()&&payload.date<=lockDate())throw Error(`The books are locked up to ${lockDate()}. Choose a later date or unlock the period in Accounts → Dashboard.`);let saved;if(session)saved=await api('/rest/v1/rpc/post_journal',{method:'POST',body:JSON.stringify({p_id:payload.id,p_date:payload.date,p_description:payload.description,p_lines:payload.lines,p_kind:payload.source_kind,p_source:payload.source_id||null,p_account:payload.account||null,p_offset:payload.offset||null})});else{validateJournal(payload.lines);saved={...payload,created_at:new Date().toISOString()};if(saved.source_kind==='reversal')saved.reversal_of=saved.source_id;}if(!journals.some(j=>j.id===saved.id))journals.unshift(saved);return saved}
function postingEditor(kind,id){const r=sourceQueue().find(r=>r.source_kind===kind&&r.id===id);if(!r)return;const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>Review posting</h2><button class="close" aria-label="Close">×</button></div><form id="post-source"><p><b>${esc(r.label)}</b> · ${money(r.amount)} · ${esc(r.date)}</p>${kind==='invoice'?`<label class="field">Revenue account<select id="post-account" required><option value="">Select revenue account</option>${accountList.filter(a=>a.type==='Revenue'&&!a.inactive).map(a=>`<option value="${a.code}">${a.code} · ${esc(a.name)}</option>`).join('')}</select></label>`:''}${kind==='stock'&&r.type==='receipt'?`<label class="field">Credit account<select id="post-offset">${receiptOffsets.map(code=>`<option value="${code}" ${code===suggestedOffset(r.item)?'selected':''}>${code} · ${esc(accountList.find(a=>a.code===code).name)}</option>`).join('')}</select></label><p class="help">Use the supplier payable for a purchase on credit, cash/bank if already paid, or Owner Capital for opening stock. Do not also record this purchase as an expense.</p>`:''}${kind==='expense'?`<label class="field">${r.status==='Paid'?'Paid from':'Offset account'}<select id="post-offset">${(r.status==='Paid'?['1001','1002','1003']:['2004']).map(code=>`<option value="${code}">${code} · ${esc(accountList.find(a=>a.code===code).name)}</option>`).join('')}</select></label><p class="help">The recorded expense amount is posted in full. Input tax is not inferred.</p>`:''}<div id="posting-preview"></div><p class="help">Posting fixes this accounting entry. Corrections use a reversal or adjustment.</p><div id="journal-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="primary">Post to accounts</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const build=()=>sourceLines(kind,r,$('#post-account')?.value,$('#post-offset')?.value);const preview=()=>{try{$('#posting-preview').innerHTML=journalLinesTable(build())}catch{$('#posting-preview').innerHTML=''}};if($('#post-account'))$('#post-account').onchange=preview;if($('#post-offset'))$('#post-offset').onchange=preview;preview();$('#post-source').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]');b.disabled=true;try{await persistJournal({id:requestId,date:r.date,description:r.label,source_kind:kind,source_id:id,account:$('#post-account')?.value,offset:$('#post-offset')?.value,lines:build()})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}
function journalRow(){return `<div class="journal-line"><select aria-label="Journal account" required><option value="">Choose account</option>${accountList.filter(a=>!a.inactive).map(a=>`<option value="${a.code}">${a.code} · ${esc(a.name)}</option>`).join('')}</select><input aria-label="Debit" type="number" value="0" min="0" step="0.01" required><input aria-label="Credit" type="number" value="0" min="0" step="0.01" required><button type="button" class="remove-journal" aria-label="Remove journal line">×</button></div>`}
function manualJournal(){const requestId=crypto.randomUUID();$('#modal').innerHTML=`<div class="modalhead"><h2>New journal entry</h2><button class="close" aria-label="Close">×</button></div><form id="manual-journal"><div class="formgrid">${field('Date','date',today(),'date','required')}${field('Description / reference','description','','text','required maxlength="500"')}</div><p class="help">Use for opening balances and adjustments. Debit and credit totals must match. Avoid entering transactions already in the posting queue.</p><div class="linehead">ACCOUNT · DEBIT (PKR) · CREDIT (PKR)</div><div id="journal-lines">${journalRow()}${journalRow()}</div><button id="add-journal-line" type="button">＋ Add line</button><div id="journal-error" class="error" role="alert"></div><div class="actions"><button class="primary" type="submit">Post journal</button></div></form>`;$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const wire=()=>$$('.remove-journal').forEach(b=>b.onclick=()=>{if($$('.journal-line').length>2)b.closest('.journal-line').remove()});wire();$('#add-journal-line').onclick=()=>{if($$('.journal-line').length<100){$('#journal-lines').insertAdjacentHTML('beforeend',journalRow());wire()}};$('#manual-journal').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]');b.disabled=true;try{const f=Object.fromEntries(new FormData(e.target)),lines=$$('.journal-line').map(el=>({account:el.querySelector('select').value,debit:Number(el.querySelectorAll('input')[0].value),credit:Number(el.querySelectorAll('input')[1].value)}));validateJournal(lines);if(!f.description.trim())throw Error('Enter a description.');await persistJournal({id:requestId,...f,description:f.description.trim(),lines,source_kind:'manual'})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}
function viewJournal(id){const j=journals.find(j=>j.id===id),reversed=journals.some(r=>r.reversal_of===id);$('#modal').innerHTML=`<div class="modalhead"><h2>Posted journal</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody"><p>${esc(j.date)} · ${esc(j.description)}</p>${journalLinesTable(j.lines)}${!reversed&&j.source_kind!=='reversal'?`<form id="reverse-journal"><p class="help">A reversal posts equal and opposite amounts and keeps the original audit record. Source transactions stay marked as posted; use an adjustment for the correction.</p>${field('Reversal date','date',today(),'date',`required min="${j.date}"`)}<div id="journal-error" class="error" role="alert"></div><div class="actions"><button type="submit" class="danger">Post reversal</button></div></form>`:`<p class="help">${reversed?'This entry has been reversed.':'This is a reversal entry.'}</p>`}</div>`;$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();if($('#reverse-journal')){const requestId=crypto.randomUUID();$('#reverse-journal').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await persistJournal({id:requestId,date:new FormData(e.target).get('date'),description:'Reversal: '+j.description,source_kind:'reversal',source_id:id,lines:reverseLines(j.lines)})}catch(err){$('#journal-error').textContent=err.message}finally{b.disabled=false}}}}
function bindAccounting(){if($('#new-journal'))$('#new-journal').onclick=manualJournal;$$('[data-post-kind]').forEach(b=>b.onclick=()=>postingEditor(b.dataset.postKind,b.dataset.postId));$$('[data-journal]').forEach(b=>b.onclick=()=>viewJournal(b.dataset.journal));}

function profitAccountRows(report){const rows=accountList.filter(a=>['Revenue','Direct cost','Expense'].includes(a.type)&&report.period[a.code]);return rows.length?`<div class="tablewrap"><table><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th>PERIOD AMOUNT</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${a.code}</td><td>${esc(a.name)}</td><td>${a.type}</td><td>${money((a.type==='Revenue'?-1:1)*report.period[a.code]/100)}</td></tr>`).join('')}</tbody></table></div>`:''}

async function downloadInvoicePDF(invoice,button=$('#downloadinvoice')){
 const label=button.textContent,error=$('#invoice-pdf-error');button.disabled=true;button.textContent='Preparing…';if(error)error.textContent='';
 try{
  const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createInvoicePDF(invoice,payments,new Uint8Array(await response.arrayBuffer()),window.PDFLib,today(),pdfContext(invoice));
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');
  link.href=url;link.download=`GR-Synergy-Invoice-${invoice.reference.replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  toast('Invoice PDF prepared. Open the downloaded PDF to print.');
 }catch(err){if($('#invoice-pdf-error'))$('#invoice-pdf-error').textContent=err.message||'Could not create PDF. Please retry.';else toast(err.message||'Could not create PDF. Please retry.')}
 finally{button.disabled=false;button.textContent=label}
}

function workspaceData(){return {records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales,vendorPayments,stockTakes,deliveryNotes}}
function restoreLocalWorkspace(){try{const data=localStore?.load();if(data)for(const [k,prefix] of [['customers','CUS'],['vendors','VEN']])for(const c of [...(data[k]||[])].sort((a,b)=>String(a.name).localeCompare(String(b.name))))if(!c.code)c.code=nextReference(prefix,data[k],'code');if(data){({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=data);vendorPayments=data.vendorPayments||[];stockTakes=data.stockTakes||[];deliveryNotes=data.deliveryNotes||[]}else{records=samplesToRecords();customers=sampleCustomers();vendors=sampleVendors();invoices=[];payments=[];workOrders=[];journals=[];stockItems=[];stockMoves=[];employees=[];attendance=[];advances=[];payrolls=[];scrapSales=[];vendorPayments=[];stockTakes=[];deliveryNotes=[];}}catch(error){localSaveError=error.message}}
function saveLocalWorkspace(){if(session||!localStore)return;try{localStore.save(workspaceData());localSaveError=''}catch(error){localSaveError=error.message.includes('tab')||error.message.includes('read')?error.message:'Could not save locally. Browser storage may be full or disabled. Export a backup before closing.'}}
function localBackupCard(){return `<section class="card"><div class="cardhead"><h2>${session?'Workspace backup':'Local saving & backup'}</h2></div><div class="cardbody"><p>${session?'Export the currently loaded cloud records as a backup.':'Saved records are stored in this browser on this computer and survive refreshes and restarts.'}</p><p class="help">Keep using the same browser and app address. Clearing browser/site data or using a private window can remove local records. Unsaved form changes are not included. Export backups regularly; Supabase will provide shared storage when connected.</p><div class="row backup-actions"><button data-backup class="primary">Export backup</button>${session?'':'<label class="button-like" for="restore-file">Restore from backup…</label><input id="restore-file" type="file" accept="application/json,.json" hidden>'}</div>${session?'':'<p class="help">Restoring replaces everything in this browser with the backup file, including company details, bank accounts and the stamp. Use it to move your workspace to another computer or web address.</p>'}</div></section>`}
function exportWorkspaceBackup(){const data={version:1,revision:crypto.randomUUID(),savedAt:new Date().toISOString(),company,data:workspaceData()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='GR-Synergy-Backup-'+today()+'.json';try{localStorage.setItem('gr-last-backup',today())}catch{}document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
window.addEventListener('beforeunload',event=>{if(!session&&localSaveError){event.preventDefault();event.returnValue=''}});


// Receivables ageing and customer statements (operational invoice balances, not ledger balances).
function ageingCard(){const a=receivablesAgeing(invoices,payments,today());return `<section class="card" style="margin-top:24px"><div class="cardhead"><div><h2>Receivables ageing</h2><p class="sub" style="margin-top:6px">Outstanding invoice balances by days past the due date, as at today.</p></div>${a.rows.length?'<button id="ageing-csv">Export ageing CSV</button>':''}</div>${a.rows.length?`<div class="tablewrap"><table class="ageing"><thead><tr><th>CUSTOMER</th>${ageingBuckets.map(b=>`<th class="money">${b.toUpperCase()}</th>`).join('')}<th class="money">TOTAL DUE</th><th></th></tr></thead><tbody>${a.rows.map(r=>`<tr><td>${esc(r.party)}<small>${r.invoices} open invoice${r.invoices===1?'':'s'}</small></td>${r.buckets.map((v,i)=>`<td class="money ${i>1&&v?'late':''}">${v?money(v):'—'}</td>`).join('')}<td class="money"><b>${money(r.total)}</b></td><td><button class="textbutton" data-statement="${esc(r.party)}">Statement ↗</button></td></tr>`).join('')}</tbody><tfoot><tr><td><b>Total</b></td>${a.totals.map(v=>`<td class="money"><b>${money(v)}</b></td>`).join('')}<td class="money"><b>${money(a.total)}</b></td><td></td></tr></tfoot></table></div>`:'<div class="empty">No outstanding invoices. Nothing to chase today.</div>'}</section>`}
function exportAgeingCSV(){const a=receivablesAgeing(invoices,payments,today());downloadCSV(`gr-synergy-receivables-ageing-${today()}.csv`,[['As at','Customer','Open invoices',...ageingBuckets.map(b=>b+' (PKR)'),'Total due (PKR)'],...a.rows.map(r=>[today(),r.party,r.invoices,...r.buckets,r.total]),[today(),'TOTAL','',...a.totals,a.total]]);toast(`Exported ageing for ${a.rows.length} customers.`)}
function bindStatements(){$$('[data-statement]').forEach(b=>b.onclick=()=>openStatement(b.dataset.statement))}
function statementBody(st){return `<div class="stats statement-stats">${stat('Opening balance',money(st.opening),'Before '+esc(st.from),'accounts')}${stat('Invoiced',money(st.charged),'In this period','sales')}${stat('Received',money(st.received),'In this period','accounts')}${stat('Balance due',money(st.closing),'As at '+esc(st.to),'accounts')}</div>${st.entries.length?`<div class="tablewrap"><table><thead><tr><th>DATE</th><th>TYPE / INVOICE</th><th class="money">CHARGES</th><th class="money">RECEIVED</th><th class="money">BALANCE</th></tr></thead><tbody>${st.entries.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.type)} · ${esc(e.reference)}<small>${esc(e.details)}</small></td><td class="money">${e.charge?money(e.charge):'—'}</td><td class="money">${e.credit?money(e.credit):'—'}</td><td class="money">${money(e.balance)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No invoices or payments for this customer in the selected period.</div>'}`}
function openStatement(party){if(!party)return;const build=()=>customerStatement(party,invoices,payments,statementFrom,statementTo);$('#modal').innerHTML=`<div class="modalhead"><h2>Statement · ${esc(party)}</h2><button class="close" aria-label="Close">×</button></div><form id="statement-form"><div class="formgrid">${field('From','from',statementFrom,'date','required')}${field('To','to',statementTo,'date','required')}</div><div id="statement-error" class="error" role="alert"></div><div id="statement-output">${statementBody(build())}</div><p class="help">Built from issued invoices and recorded payments for this customer name. It does not include quotes, unissued work or manual journal entries.</p><div class="actions"><button type="button" id="statement-csv">Export CSV</button><button type="button" id="statement-pdf" class="primary">Download PDF</button></div></form>`;if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();const form=$('#statement-form');form.onsubmit=e=>e.preventDefault();const update=()=>{const from=form.elements.from.value,to=form.elements.to.value;if(!from||!to||from>to){$('#statement-error').textContent='From date must be on or before the end date.';return false}statementFrom=from;statementTo=to;$('#statement-error').textContent='';$('#statement-output').innerHTML=statementBody(build());return true};form.elements.from.onchange=update;form.elements.to.onchange=update;
 $('#statement-csv').onclick=()=>{if(!update())return;const st=build();downloadCSV(`GR-Synergy-Statement-${party.replace(/[^a-zA-Z0-9_-]/g,'-')}-${st.to}.csv`,[['Customer','Date','Type','Invoice','Details','Charges (PKR)','Received (PKR)','Balance (PKR)'],[party,st.from,'Opening balance','','','','',st.opening],...st.entries.map(e=>[party,e.date,e.type,e.reference,e.details,e.charge||'',e.credit||'',e.balance]),[party,st.to,'Balance due','','',st.charged,st.received,st.closing]]);toast('Statement exported.')};
 $('#statement-pdf').onclick=async()=>{if(!update())return;const button=$('#statement-pdf');button.disabled=true;button.textContent='Preparing PDF…';try{const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');const st=build(),bytes=await createStatementPDF(st,new Uint8Array(await response.arrayBuffer()),window.PDFLib,statementOptions('customers',customers.find(c=>c.name===party)||{name:party},st));const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`GR-Synergy-Statement-${party.replace(/[^a-zA-Z0-9_-]/g,'-')}-${st.to}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Statement PDF downloaded.')}catch(error){$('#statement-error').textContent=error.message||'Could not create PDF. Please retry.'}finally{button.disabled=false;button.textContent='Download PDF'}};
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
 const head=`<div class="heading"><div><div class="eyebrow">MATERIALS & STOCK</div><h1>Inventory</h1><p class="sub">Sheets, remnants, consumables, customer-owned material and scrap.</p></div>${session?'':'<div class="row heading-actions"><button id="stock-take">☑ Stock take</button><button id="stock-adjust">± Adjust stock</button><button id="stock-new">＋ Stock item</button><button class="primary" id="stock-receive">＋ Receive stock</button></div>'}</div>`;
 if(session)return head+'<section class="card"><div class="cardbody"><p>Inventory is available in the local workspace only for now.</p><p class="help">Cloud tables for stock have not been set up yet. Sign out to use inventory with your local records.</p></div></section>';
 const map=balances(stockMoves),b=i=>map.get(i.id)||{qty:0,value:0},own=stockItems.filter(i=>i.owner==='Business');
 const sheets=own.filter(i=>i.category==='sheet'),rems=own.filter(i=>i.category==='remnant'&&b(i).qty>0),low=stockItems.filter(i=>needsReorder(i,balanceOf(i.id,stockMoves)));
 const kg=list=>list.reduce((n,i)=>n+(sheetWeightKg(i)||0)*b(i).qty,0).toLocaleString('en-PK',{maximumFractionDigits:0});
const lastTake=[...stockTakes].filter(t=>t.status==='Posted').sort((a,b)=>b.date.localeCompare(a.date))[0],drafts=stockTakes.filter(t=>t.status==='Draft').length;
 const count=t=>t==='takes'?stockTakes.length:t==='valuation'?valuationRows('').length:t==='moves'?stockMoves.length:t==='sheet'?sheets.length:t==='scrap'||t==='consumable'?own.filter(i=>i.category===t).length:stockList('',t).length;
 return `${head}${notice()}<div class="stats">${stat('Stock value',money(own.reduce((n,i)=>n+b(i).value,0)/100),'Business sheets and remnants at average cost','accounts')}${stat('Sheets on hand',sheets.reduce((n,i)=>n+b(i).qty,0).toLocaleString('en-PK'),`${kg(sheets)} kg across ${sheets.length} size${sheets.length===1?'':'s'}`,'inventory')}${stat('Reorder alerts',String(low.length),'Items at or below reorder level','procurement')}${stat('Last stock take',lastTake?esc(lastTake.date):'Never',lastTake?`${esc(lastTake.reference)} · ${daysBetweenDates(lastTake.date,today())} days ago · net ${money(lastTake.variance_value||0)}${drafts?` · ${drafts} draft`:''}`:drafts?`${drafts} draft in progress`:'Count stock with Stock take','inventory')}</div>${lowStockNotice()}${poReceivingCard()}
 <div class="sectionlinks">${[['sheet','Sheets'],['remnant','Remnants'],['consumable','Consumables'],['customer','Customer material'],['scrap','Scrap'],['moves','Movements'],['valuation','Valuation'],['takes','Stock takes']].map(([k,l])=>`<button data-stock-tab="${k}" class="${stockTab===k?'selected':''}">${l} <span class="fine">&nbsp;${count(k)}</span></button>`).join('')}</div>
 ${stockTab==='takes'&&stockTakes.find(t=>t.id===takeView)?stockTakePage(stockTakes.find(t=>t.id===takeView)):`<section class="card"><div class="toolbar"><input id="stock-search" class="search" type="search" placeholder="Search code, material, size, job or location…" aria-label="Search stock"><div class="row"><button id="stock-csv">Export CSV</button></div></div><div id="stock-rows">${stockTable('')}</div></section>`}<p class="help">${{sheet:'Full sheets are counted in whole pieces and valued at weighted average cost. Issue them to jobs from the work order.',remnant:'Usable offcuts returned from jobs. Each carries its share of the sheet cost by area. Use these before cutting a new sheet.',consumable:'Gas, nozzles and lenses are counted for reordering. Their cost is expensed to the chosen account when the receipt is posted, so they carry no stock value.',customer:'Material supplied by customers. Counted only; never valued or posted, and only usable on that customer’s jobs.',scrap:'Scrap comes in from job skeletons and recorded collections, and goes out through scrap sales. Sales post to Scrap Sales (4302) from Accounts → Journal; disposals without a sale have no accounting value.',moves:'Every receipt, issue, offcut, scrap and adjustment. Movements cannot be edited; use a stock count to correct quantities.',valuation:'Business sheets and remnants at weighted average cost; consumables and customer material are counted but not valued. Items with no movement for 90 days are flagged as slow-moving.',takes:'A stock take counts many items at once: print the blind count sheet, enter the counts, review the variances, then post them all as adjustments.'}[stockTab]}</p>`;
}
function stockList(term,tab=stockTab){
 const map=balances(stockMoves),q=i=>(map.get(i.id)||{qty:0}).qty,t=term.trim().toLowerCase();
 const live=i=>q(i)>0||!stockMoves.some(m=>m.item_id===i.id); // hide used-up remnants and customer lots, not new items
 const list=stockItems.filter(i=>tab==='customer'?i.owner==='Customer'&&live(i):i.owner==='Business'&&i.category===tab&&(tab!=='remnant'||live(i)));
 return list.filter(i=>`${i.code} ${itemLabel(i)} ${i.location||''} ${i.customer||''} ${i.source_job_ref||''} ${i.source_party||''}`.toLowerCase().includes(t)).sort(byCode);
}
function stockTable(term){
 if(stockTab==='moves')return moveTable(term);
 if(stockTab==='scrap')return scrapYard(term);
 if(stockTab==='valuation')return valuationTable(term);
 if(stockTab==='takes')return stockTakesList();
 const rows=stockList(term);
 if(!rows.length)return `<div class="empty">${term?'No matching stock.':{sheet:'No sheet stock yet. Add a stock item such as “Mild steel 1.5 mm 1220 × 2440”, then receive stock into it.',remnant:'No usable remnants. Return an offcut when issuing a sheet to a job.',consumable:'No consumables yet. Add items such as oxygen and nitrogen cylinders, nozzles and lenses.',customer:'No customer material in stock.',scrap:'No scrap recorded. Record skeleton weight when issuing sheets to a job.'}[stockTab]}</div>`;
 const valued=['sheet','remnant'].includes(stockTab);
 return `<div class="tablewrap"><table><thead><tr><th>ITEM</th><th class="money">ON HAND</th>${valued?'<th class="money">AVG COST</th><th class="money">VALUE</th>':stockTab==='consumable'?'<th class="money">LAST PRICE</th>':''}<th>STATUS</th><th></th></tr></thead><tbody>${rows.map(i=>{const b=balanceOf(i.id,stockMoves),last=[...stockMoves].reverse().find(m=>m.item_id===i.id&&m.type==='receipt');return `<tr><td class="ref">${esc(i.code)}<small>${esc(itemLabel(i))}${i.owner==='Customer'?' · '+esc(i.customer):''}${i.location?' · '+esc(i.location):''}</small>${i.source_job_ref?`<small class="src">Left over from <b>${esc(i.source_job_ref)}</b>${i.source_party?' · '+esc(i.source_party):''}${i.source_line?' · '+esc(i.source_line):''}${i.source_quote?' · '+esc(i.source_quote):''}</small>`:''}</td><td class="money">${fmtQty(b.qty,i)}<small>${kgText(i,b.qty)}</small></td>${valued?`<td class="money">${money(b.avg)}</td><td class="money">${money(b.value)}</td>`:stockTab==='consumable'?`<td class="money">${last?money(last.unit_cost):'—'}</td>`:''}<td>${needsReorder(i,b)?badge('Reorder'):b.qty>0?badge('In stock'):badge('Out of stock')}${Number(i.reorder_level)>0&&i.owner==='Business'?`<small>Reorder at ${fmtQty(i.reorder_level,i)}</small>`:''}</td><td class="stock-actions">${!['remnant','scrap'].includes(i.category)?`<button class="textbutton" data-stock-receive="${esc(i.id)}">Receive</button>`:''}${i.category!=='scrap'&&b.qty>0?`<button class="textbutton" data-stock-issue="${esc(i.id)}">Issue</button>`:''}${(i.category==='scrap'||i.owner==='Customer')&&b.qty>0?`<button class="textbutton" data-stock-dispose="${esc(i.id)}">${i.category==='scrap'?'Sell / dispose':'Return'}</button>`:''}${i.category!=='scrap'?`<button class="textbutton" data-stock-adjust="${esc(i.id)}">Adjust</button>`:''}<button class="textbutton" data-stock-count="${esc(i.id)}">Count</button><button class="textbutton" data-stock-history="${esc(i.id)}">History</button>${i.category!=='scrap'?`<button class="textbutton" data-stock-edit="${esc(i.id)}">Edit</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`;
}
function moveRows(term){const t=term.trim().toLowerCase();return [...stockMoves].sort((a,b)=>b.date.localeCompare(a.date)||b.created_at.localeCompare(a.created_at)||b.reference.localeCompare(a.reference)).map(m=>({m,i:stockById(m.item_id)})).filter(({m,i})=>`${m.reference} ${moveLabels[m.type]} ${i?.code} ${i?itemLabel(i):''} ${m.job_reference||''} ${m.po_reference||''} ${m.party||''} ${m.doc_reference||''}`.toLowerCase().includes(t))}
function moveTable(term){const rows=moveRows(term);return rows.length?`<div class="tablewrap"><table><thead><tr><th>REFERENCE</th><th>ITEM</th><th>MOVEMENT</th><th class="money">QTY</th><th class="money">VALUE</th><th>ACCOUNTS</th></tr></thead><tbody>${rows.map(({m,i})=>`<tr><td class="ref">${esc(m.reference)}<small>${esc(m.date)}</small></td><td>${esc(i?.code)}<small>${esc(i?itemLabel(i):'')}</small></td><td>${moveLabels[m.type]}<small>${esc([m.job_reference,m.po_reference,m.party,m.doc_reference,m.notes].filter(Boolean).join(' · '))}</small></td><td class="money">${Number(m.quantity)>0?'+':''}${fmtQty(m.quantity,i)}</td><td class="money">${m.value?money(m.value):m.amount?money(m.amount)+'<small>'+(m.type==='dispose'?'sale':'expensed')+'</small>':'—'}</td><td>${!isPostable(m,i)?'<span class="fine">Not posted</span>':stockPosted(m)?badge('Posted'):badge('Pending')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No stock movements yet.</div>'}
function bindInventory(){
 if(session)return;
 $('#stock-new').onclick=()=>stockItemEditor();$('#stock-receive').onclick=()=>receiveEditor();$('#stock-adjust').onclick=()=>adjustEditor();$('#stock-take').onclick=()=>newStockTake();
 $$('[data-take-open]').forEach(b=>b.onclick=()=>{takeView=b.dataset.takeOpen;render()});
 const openTake=stockTab==='takes'&&stockTakes.find(t=>t.id===takeView);if(openTake){bindStockTake(openTake);$$('[data-stock-tab]').forEach(b=>b.onclick=()=>{stockTab=b.dataset.stockTab;takeView=null;render()});return}
 $$('[data-po-receive]').forEach(b=>b.onclick=()=>poReceiveEditor(b.dataset.poReceive));
 $$('[data-stock-tab]').forEach(b=>b.onclick=()=>{stockTab=b.dataset.stockTab;render()});
 $('#stock-search').oninput=e=>{$('#stock-rows').innerHTML=stockTable(e.target.value);bindStockRows();$$('[data-take-open]').forEach(b=>b.onclick=()=>{takeView=b.dataset.takeOpen;render()})};
 $('#stock-csv').onclick=exportStockCSV;bindStockRows();
}
function bindStockRows(){
 const on=(attr,fn)=>$$(`[data-stock-${attr}]`).forEach(b=>b.onclick=()=>fn(b.dataset['stock'+attr[0].toUpperCase()+attr.slice(1)]));
 on('receive',id=>receiveEditor({itemId:id}));on('issue',id=>issueEditor({itemId:id}));on('count',countEditor);on('adjust',id=>adjustEditor(id));on('history',stockHistory);on('edit',stockItemEditor);on('dispose',disposeEditor);bindScrapYard();
}
function exportStockCSV(){
 const term=$('#stock-search')?.value||'';
 if(stockTab==='valuation'){const rows=valuationRows(term);downloadCSV(`gr-synergy-stock-valuation-${today()}.csv`,[['Item code','Item','Category','Owner','Location','On hand','Unit','Avg cost (PKR)','Value (PKR)','Last receipt','Last movement','Days since movement'],...rows.map(x=>[x.i.code,itemLabel(x.i),x.i.category,x.i.owner==='Customer'?x.i.customer:'Business',x.i.location||'',x.b.qty,unitOf(x.i),valuedItem(x.i)?x.b.avg:'',valuedItem(x.i)?x.b.value:'',x.lastRec,x.lastMove,x.age??''])]);toast(`Exported ${rows.length} items.`);return}
 if(stockTab==='takes'){toast('Open a stock take to export it.');return}
 if(stockTab==='moves'){const rows=moveRows(term);downloadCSV(`gr-synergy-stock-movements-${today()}.csv`,[['Reference','Date','Movement','Item code','Item','Quantity','Unit','Value (PKR)','Amount (PKR)','Job','Purchase order','Party','Document','Notes','Accounts'],...rows.map(({m,i})=>[m.reference,m.date,moveLabels[m.type],i?.code,i?itemLabel(i):'',m.quantity,i?unitOf(i):'',m.value,m.amount,m.job_reference||'',m.po_reference||'',m.party||'',m.doc_reference||'',m.notes||'',!isPostable(m,i)?'Not posted':stockPosted(m)?'Posted':'Pending'])]);toast(`Exported ${rows.length} movements.`);return}
 const rows=stockList(term);downloadCSV(`gr-synergy-stock-${stockTab}-${today()}.csv`,[['As at','Code','Item','Owner','Customer','Location','On hand','Unit','Weight (kg)','Average cost (PKR)','Value (PKR)','Reorder level'],...rows.map(i=>{const b=balanceOf(i.id,stockMoves),kg=sheetWeightKg(i);return [today(),i.code,itemLabel(i),i.owner,i.customer||'',i.location||'',b.qty,unitOf(i),kg?Math.round(kg*b.qty*10)/10:'',b.avg,b.value,i.reorder_level||0]})]);toast(`Exported ${rows.length} items.`);
}

function stockItemEditor(id){
 const it=stockById(id)||{category:stockTab==='consumable'?'consumable':stockTab==='remnant'?'remnant':'sheet',owner:stockTab==='customer'?'Customer':'Business',material:'steel',width_mm:1219.2,length_mm:2438.4,unit:'cylinder',account:'5101',reorder_level:0};
 const used=!!id&&stockMoves.some(m=>m.item_id===id),lock=used?'disabled':'';
 const presetOf=(w,l)=>sheetPresets.find(p=>Math.abs(p.w-Number(w))<3&&Math.abs(p.l-Number(l))<3),preset=presetOf(it.width_mm,it.length_mm);
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
 <label class="field full">Sheet size<select name="size" ${lock}>${sheetPresets.map(p=>`<option value="${p.id}" ${preset?.id===p.id?'selected':''}>${esc(p.label)} · ${Math.round(p.w)} × ${Math.round(p.l)} mm</option>`).join('')}<option value="custom" ${preset?'':'selected'}>Custom size / offcut (enter mm)</option></select><small class="fine">Standard sheet sizes sold in Pakistan. The same list is offered on purchase orders.</small></label>${id?'':'<label class="field full sc-check" id="stock-allsizes"><span><input type="checkbox" name="all_sizes"> Create all 5 standard sizes for this material and gauge (sizes that already exist are skipped)</span></label>'}
 ${field('Width (mm)','width_mm',it.width_mm??'','number',`min="1" max="20000" step="0.1" required ${lock}`)}
 ${field('Length (mm)','length_mm',it.length_mm??'','number',`min="1" max="20000" step="0.1" required ${lock}`)}
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
 f.size.onchange=()=>{const p=sheetPresets.find(x=>x.id===f.size.value);if(p){f.width_mm.value=Math.round(p.w*10)/10;f.length_mm.value=Math.round(p.l*10)/10}weight()};
 f.width_mm.oninput=f.length_mm.oninput=()=>{f.size.value=presetOf(f.width_mm.value,f.length_mm.value)?.id||'custom';weight()};
 toggle();weight();
 if($('#stock-delete'))$('#stock-delete').onclick=()=>{stockItems=stockItems.filter(x=>x.id!==id);$('#modal').close();render();toast(`${it.code} deleted.`)};
 form.onsubmit=e=>{e.preventDefault();try{
  const sheet=f.category.value!=='consumable';
  const next={...it,id:it.id||crypto.randomUUID(),category:f.category.value,owner:f.owner.value,customer:f.owner.value==='Customer'?f.customer.value:'',reorder_level:Number(f.reorder_level.value||0),location:f.location.value.trim(),created_at:it.created_at||new Date().toISOString(),
   ...(sheet?{material:f.material.value,grade:f.grade.value.trim(),thickness_mm:Number(f.thickness_mm.value),width_mm:Number(f.width_mm.value),length_mm:Number(f.length_mm.value),name:'',unit:'sheet',account:''}:{name:f.name.value.trim(),unit:f.unit.value,account:f.account.value,material:'',grade:'',thickness_mm:null,width_mm:null,length_mm:null})};
  if(used)Object.assign(next,{category:it.category,owner:it.owner,customer:it.customer,material:it.material,thickness_mm:it.thickness_mm,width_mm:it.width_mm,length_mm:it.length_mm,unit:it.unit});
  if(!id&&f.all_sizes?.checked&&next.category==='sheet'){
   const made=[];for(const p of sheetPresets){const item={...next,id:crypto.randomUUID(),width_mm:Math.round(p.w*10)/10,length_mm:Math.round(p.l*10)/10};const exists=stockItems.some(x=>x.category===item.category&&x.owner===item.owner&&(x.customer||'')===(item.customer||'')&&x.material===item.material&&Math.abs(Number(x.thickness_mm)-item.thickness_mm)<0.001&&Math.abs(Number(x.width_mm)-item.width_mm)<3&&Math.abs(Number(x.length_mm)-item.length_mm)<3);if(exists)continue;validateItem(item,stockItems);let code=itemCode(item,stockItems),n=1;while(stockItems.some(x=>x.code===code))code=`${itemCode(item,stockItems)}-${++n}`;item.code=code;stockItems=[...stockItems,item];made.push(code)}
   stockTab=stockTabFor(next);$('#modal').close();render();toast(made.length?`${made.length} standard size${made.length===1?'':'s'} added: ${made.join(', ')}.`:'All standard sizes already exist for this material and gauge.');return;
  }
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

// Offcuts the job's sheet plan leaves on the sheets of one stock item: for each plan line cut from that
// material, thickness and sheet size, the strip beyond the parts and the strip beside them, on the full sheets
// and on the last (part-filled) sheet. Identical pieces are merged with a count.
function planOffcutsFor(job,item){
 if(!job||!item||!['sheet','remnant'].includes(item.category))return null;
 const plan=jobSheetPlan(job),near=(a,b)=>Math.abs(Number(a)-b)<3,out=[];let sheets=0,partsKg=0;
 for(const x of plan.lines){
  if(!x.r?.sheets||x.l.material!==item.material||Math.abs(Number(x.l.thickness_mm)-Number(item.thickness_mm))>0.01)continue;
  const W=Math.min(+item.width_mm,+item.length_mm),L=Math.max(+item.width_mm,+item.length_mm);if(!(near(x.d.w,W)&&near(x.d.l,L)))continue;
  const lay=layoutRects(x.d.w,x.d.l,Number(x.p.w_in)*IN,Number(x.p.l_in)*IN,plan.gap,plan.margin);if(!lay.count)continue;
  const q=Math.ceil(Number(x.l.quantity)||0),n=Math.ceil(q/lay.count),last=q-(n-1)*lay.count;sheets+=n;
  partsKg+=(sheetWeightKg({category:'sheet',material:item.material,thickness_mm:item.thickness_mm,width_mm:Number(x.p.w_in)*IN,length_mm:Number(x.p.l_in)*IN})||0)*q;
  const cut=rects=>{const mx=Math.max(...rects.map(r=>r.x+r.w)),my=Math.max(...rects.map(r=>r.y+r.h)),o=[];if(x.d.l-mx>=IN)o.push([x.d.w,x.d.l-mx]);if(x.d.w-my>=IN)o.push([x.d.w-my,mx]);return o};
  const add=(pieces,count)=>{if(count<=0)return;for(const [a,b] of pieces){const w=Math.round(Math.min(a,b)*10)/10,l=Math.round(Math.max(a,b)*10)/10,key=`${x.i}|${w}|${l}`,hit=out.find(o=>o.key===key);if(hit)hit.count+=count;else out.push({key,line:x.i,desc:x.l.description||`Line ${x.i+1}`,w,l,count})}};
  add(cut(lay.rects),last===lay.count?n:n-1);if(last<lay.count)add(cut(lay.rects.slice(0,last)),1);
 }
 if(!sheets)return null;
 return {sheets,partsKg,offcuts:out.map(o=>({...o,kg:(sheetWeightKg({category:'sheet',material:item.material,thickness_mm:item.thickness_mm,width_mm:o.w,length_mm:o.l})||0)*o.count,keep:Math.min(o.w,o.l)>=6*IN&&o.w*o.l>=144*IN*IN}))};
}
// Plan sheet to issue first: the stock item matching the first plan group that has stock.
function planStockItem(job,avail){
 for(const g of jobSheetPlan(job).groups){const near=(a,b)=>Math.abs(Number(a)-b)<3,hit=avail.find(i=>['sheet','remnant'].includes(i.category)&&i.material===g.l.material&&Math.abs(Number(i.thickness_mm)-Number(g.l.thickness_mm))<0.01&&(i.owner!=='Customer'||i.customer===job.party)&&near(Math.min(+i.width_mm,+i.length_mm),g.d.w)&&near(Math.max(+i.width_mm,+i.length_mm),g.d.l));if(hit)return {item:hit,sheets:g.sheets}}
 return null;
}
const inchSize=(w,l)=>`${Math.round(w/IN*10)/10}" × ${Math.round(l/IN*10)/10}"`;
function issueEditor({itemId,jobId}={}){
 const map=balances(stockMoves),avail=stockItems.filter(i=>i.category!=='scrap'&&(map.get(i.id)?.qty||0)>0).sort(byCode),fixed=workOrders.find(j=>j.id===jobId);
 if(!avail.length){toast('Nothing in stock to issue. Receive stock first.');return}
 const planned=!itemId&&fixed?planStockItem(fixed,avail):null;if(planned)itemId=planned.item.id;
 const jobs=workOrders.filter(j=>j.status!=='Completed');
 $('#modal').innerHTML=`<div class="modalhead"><h2>Issue stock${fixed?' · '+esc(fixed.reference):''}</h2><button class="close" aria-label="Close">×</button></div><form id="issue-form"><div class="formgrid">
 ${fixed?`<input type="hidden" name="job_id" value="${esc(fixed.id)}"><p class="full"><b>${esc(fixed.party)}</b> · Quote ${esc(fixed.quote_reference)} · material owned by ${esc(fixed.material_owner)}</p>`:`<label class="field full">Job<select name="job_id"><option value="">Workshop use - consumables only</option>${jobs.map(j=>`<option value="${esc(j.id)}">${esc(j.reference)} · ${esc(j.party)}</option>`).join('')}</select></label>`}
 <label class="field full">Stock item<select name="item_id" required><option value="">Select item</option>${avail.map(i=>itemOption(i,itemId,map)).join('')}</select></label>
 ${field('Quantity','quantity',planned?String(planned.sheets):'1','number','required min="0.001" max="1000000" step="0.001"')}${field('Date issued','date',today(),'date',`required max="${today()}"`)}</div>${planned?`<p class="help">Selected from the job's sheet plan: <b>${planned.sheets} sheet${planned.sheets===1?'':'s'}</b> of ${esc(itemLabel(planned.item))}.</p>`:''}
 <fieldset id="issue-after" class="plainset"><div id="issue-offcuts"></div><details class="issue-other"><summary>Other usable offcut (not in the plan)</summary><div class="formgrid">${field('Width (mm)','offcut_width','','number','min="1" max="20000" step="0.1"')}${field('Length (mm)','offcut_length','','number','min="1" max="20000" step="0.1"')}</div></details>
 <div class="formgrid" style="margin-top:10px">${field('Scrap to the scrap bin (kg)','scrap_kg','','number','min="0" max="1000000" step="0.01"')}<p class="help" id="scrap-calc" style="align-self:end"></p></div><p class="help">Remnants go back to stock with their share of the sheet cost by area and a note of this job. Scrap is weighed into the scrap bin for later sale.</p></fieldset>
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
 let offState={},lastKey='';
 const offTable=()=>{const item=stockById(f.item_id.value),job=workOrders.find(j=>j.id===f.job_id.value),po=planOffcutsFor(job,item),box=$('#issue-offcuts');if(!box)return null;
  const key=`${item?.id}|${job?.id}`;if(key!==lastKey){lastKey=key;offState={};po?.offcuts.forEach((o,k)=>offState[k]=o.keep?'remnant':'scrap')}
  if(!po){box.innerHTML=job&&item&&['sheet','remnant'].includes(item.category)?'<p class="help">This sheet is not in the job’s sheet plan, so no offcuts are suggested. Enter any usable offcut below.</p>':'';return null}
  const q=Number(f.quantity.value)||0;
  box.innerHTML=`<div class="linehead">OFFCUTS FROM THE SHEET PLAN</div>${q!==po.sheets?`<p class="help warn">The plan uses ${po.sheets} sheet${po.sheets===1?'':'s'} of this size; you are issuing ${q}. Offcuts below are for the planned sheets.</p>`:''}${po.offcuts.length?`<table class="offcut-table"><thead><tr><th>OFFCUT (W × L)</th><th>FROM</th><th class="money">PCS</th><th class="money">WEIGHT</th><th>KEEP AS</th></tr></thead><tbody>${po.offcuts.map((o,k)=>`<tr><td><b>${inchSize(o.w,o.l)}</b><small>${Math.round(o.w)} × ${Math.round(o.l)} mm</small></td><td>${esc(o.desc)}</td><td class="money">${o.count}</td><td class="money">${o.kg?o.kg.toFixed(1)+' kg':'—'}</td><td><span class="seg keep-seg"><button type="button" data-keep="${k}" data-as="remnant" class="${offState[k]==='remnant'?'on done':''}">Remnant</button><button type="button" data-keep="${k}" data-as="scrap" class="${offState[k]==='scrap'?'on pending':''}">Scrap</button></span></td></tr>`).join('')}</tbody></table>`:'<p class="help">The parts use the sheets fully; no offcuts of 1 inch or more.</p>'}`;
  box.querySelectorAll('[data-keep]').forEach(b=>b.onclick=()=>{offState[b.dataset.keep]=b.dataset.as;offTable();scrapCalc(true)});
  return po;
 };
 const scrapCalc=force=>{const item=stockById(f.item_id.value),job=workOrders.find(j=>j.id===f.job_id.value),po=planOffcutsFor(job,item),el=$('#scrap-calc');if(!el)return;if(!po||!item){el.textContent='';return}
  const issuedKg=(sheetWeightKg(item)||0)*(Number(f.quantity.value)||0),keptKg=po.offcuts.reduce((n,o,k)=>n+(offState[k]==='remnant'?o.kg:0),0),kg=Math.max(0,Math.round((issuedKg-po.partsKg-keptKg)*10)/10);
  el.innerHTML=`Calculated: ${issuedKg.toFixed(1)} kg issued − ${po.partsKg.toFixed(1)} kg parts − ${keptKg.toFixed(1)} kg remnants = <b>${kg} kg</b>. Weigh to confirm.`;
  if(force||!f.scrap_kg.dataset.touched)f.scrap_kg.value=kg;
 };
 f.scrap_kg.addEventListener('input',()=>f.scrap_kg.dataset.touched='1');
 const preview=()=>{const item=stockById(f.item_id.value);$('#issue-after').hidden=!item||!['sheet','remnant'].includes(item.category);offTable();scrapCalc(false);try{const p=plan();$('#issue-preview').textContent=money(p.value-(p.offcut?.value||0))+(p.offcut?` · after ${money(p.offcut.value)} offcut credit`:'');$('#issue-help').textContent=p.item.owner==='Customer'?'Customer-owned material: no cost to the job.':p.item.category==='consumable'?'Consumables were expensed when received; this records usage only.':`${fmtQty(p.q,p.item)} at ${money(p.value/p.q)} average cost.`}catch(err){$('#issue-preview').textContent='—';$('#issue-help').textContent=item?err.message:''}};
 form.oninput=preview;form.onchange=preview;preview();
 form.onsubmit=e=>{e.preventDefault();try{
  const {item,job,q,value,offcut,scrap}=plan(),notes=f.notes.value.trim(),date=f.date.value;if(!date||date>today())throw Error('Enter an issue date that is not in the future.');
  const link={job_id:job?.id||'',job_reference:job?.reference||'',party:job?.party||'Workshop use',date};
  const issued=addStockMove({...link,item_id:item.id,type:'issue',quantity:-q,value:-value,notes});
  const src={source_item_id:item.id,source_job_id:job?.id||'',source_job_ref:job?.reference||'',source_party:job?.party||'',source_quote:job?.quote_reference||''};
  const remnant=(w,l,count,value,line)=>{const rem={id:crypto.randomUUID(),category:'remnant',owner:item.owner,customer:item.customer||'',material:item.material,grade:item.grade||'',thickness_mm:item.thickness_mm,width_mm:Math.min(w,l),length_mm:Math.max(w,l),location:item.location||'',reorder_level:0,...src,source_line:line||'',code:nextReference('REM',stockItems,'code'),created_at:new Date().toISOString()};stockItems.push(rem);addStockMove({...link,item_id:rem.id,type:'offcut',quantity:count,value,notes:`Left over from ${job?job.reference+' · ':''}${line?line+' · ':''}${item.code}`});return rem};
  const made=[];
  const po=planOffcutsFor(job,item);if(po)po.offcuts.forEach((o,k)=>{if(offState[k]!=='remnant')return;const one=offcutValue(item,value/q,o.l,o.w);made.push(remnant(o.w,o.l,o.count,Math.round(one.value*o.count*100)/100,o.desc).code)});
  if(offcut)made.push(remnant(offcut.width_mm,offcut.length_mm,1,offcut.value,'').code);
  if(scrap>0){const bin=scrapBin(item.material);addStockMove({...link,item_id:bin.id,type:'scrap',quantity:scrap,notes:`From ${item.code}`})}
  toast(`${issued.reference}: ${fmtQty(q,item)} issued${job?' to '+job.reference:''}${made.length?` · ${made.length} remnant${made.length===1?'':'s'} to stock (${made.join(', ')})`:''}${scrap>0?` · ${scrap} kg to scrap`:''}.`);
  $('#modal').close();render();
 }catch(err){$('#stock-error').textContent=err.message}};
}

// ---- Inventory control: adjustments, stock takes and valuation ----
const valuedItem=i=>i.owner==='Business'&&['sheet','remnant'].includes(i.category);
// Quantity change → value at average cost (decreases take the exact average-cost value out).
function adjustmentFor(item,diff){
 diff=qty3(diff);if(!diff||!valuedItem(item))return {diff,value:0};
 const b=balanceOf(item.id,stockMoves);if(diff<0)return {diff,value:-outValue(b,-diff)};
 const last=[...stockMoves].reverse().find(m=>m.item_id===item.id&&m.type==='receipt'),avg=b.qty>0?b.value/b.qty:last?.unit_cost||0;return {diff,value:Math.round(avg*diff*100)/100};
}
const adjustReasons=['Damaged','Lost / missing','Found / not recorded','Measurement correction','Write-off','Opening balance correction','Other'];
function adjustEditor(itemId){
 const items=stockItems.filter(i=>i.category!=='scrap').sort(byCode);if(!items.length){toast('Add a stock item first.');return}
 const map=balances(stockMoves);
 $('#modal').innerHTML=`<div class="modalhead"><h2>Adjust stock</h2><button class="close" aria-label="Close">×</button></div><form id="adjust-form"><div class="formgrid">
 <label class="field full">Stock item<select name="item_id" required><option value="">Select item</option>${items.map(i=>itemOption(i,itemId,map)).join('')}</select></label>
 <label class="field">Adjustment<select name="dir"><option value="-1">Decrease (−)</option><option value="1">Increase (+)</option></select></label>${field('Quantity','quantity','1','number','required min="0.001" max="1000000" step="0.001"')}
 ${select('Reason','reason',adjustReasons,'Damaged')}${field('Date','date',today(),'date',`required max="${today()}"`)}
 <label class="field full">Notes<input name="notes" maxlength="500" placeholder="What happened, who checked it"></label></div>
 <div class="summary"><span id="adjust-what">Adjustment</span><b id="adjust-preview">—</b></div><p class="help">Valued at average cost. Post the adjustment in Accounts → Journal (Dr/Cr inventory against 5001 material cost).</p><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Record adjustment</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const form=$('#adjust-form'),f=form.elements;
 const plan=()=>{const item=stockById(f.item_id.value);if(!item)throw Error('Choose a stock item.');const q=validateQuantity(item,f.quantity.value),b=balanceOf(item.id,stockMoves),diff=q*Number(f.dir.value);if(b.qty+diff<-1e-9)throw Error(`Only ${fmtQty(b.qty,item)} on hand.`);return {item,b,...adjustmentFor(item,diff)}};
 const preview=()=>{try{const p=plan();$('#adjust-what').textContent=`${p.item.code}: ${fmtQty(p.b.qty,p.item)} → ${fmtQty(qty3(p.b.qty+p.diff),p.item)}`;$('#adjust-preview').textContent=`${p.diff>0?'+':''}${fmtQty(p.diff,p.item)}${p.value?' · '+money(p.value):''}`;$('#stock-error').textContent=''}catch(err){$('#adjust-preview').textContent='—';$('#stock-error').textContent=f.item_id.value?err.message:''}};
 form.oninput=preview;form.onchange=preview;preview();
 form.onsubmit=e=>{e.preventDefault();try{if(f.date.value>today())throw Error('The date cannot be in the future.');const p=plan();const m=addStockMove({item_id:p.item.id,type:'adjust',date:f.date.value,quantity:p.diff,value:p.value,party:p.item.customer||'',notes:[f.reason.value,f.notes.value.trim()].filter(Boolean).join(' - ')});$('#modal').close();render();toast(`${m.reference}: ${p.item.code} ${p.diff>0?'+':''}${fmtQty(p.diff,p.item)} (${f.reason.value}).${p.value?' Post it in Accounts → Journal.':''}`)}catch(err){$('#stock-error').textContent=err.message}};
}
// Stock take: a count of many items at once. Draft → enter counts → post all variances as adjustments.
const takeScopes={all:'All stock',sheet:'Sheets',remnant:'Remnants',consumable:'Consumables',customer:'Customer material'};
function takeItems(scope,location){return stockItems.filter(i=>i.category!=='scrap'&&(scope==='all'||(scope==='customer'?i.owner==='Customer':i.owner==='Business'&&i.category===scope))&&(!location||String(i.location||'').toLowerCase()===location.toLowerCase())).filter(i=>i.category!=='remnant'||balanceOf(i.id,stockMoves).qty>0).sort(byCode)}
function newStockTake(){
 const locs=[...new Set(stockItems.map(i=>i.location).filter(Boolean))].sort(),staff=employees.filter(e=>employedOn(e,today()));
 $('#modal').innerHTML=`<div class="modalhead"><h2>New stock take</h2><button class="close" aria-label="Close">×</button></div><form id="take-form"><div class="formgrid">
 ${select('What to count','scope',Object.keys(takeScopes),'all').replace(/<option>(\w+)<\/option>/g,(m,k)=>`<option value="${k}">${takeScopes[k]}</option>`).replace(/<option selected>(\w+)<\/option>/g,(m,k)=>`<option value="${k}" selected>${takeScopes[k]}</option>`)}
 <label class="field">Location<select name="location"><option value="">All locations</option>${locs.map(l=>`<option>${esc(l)}</option>`).join('')}</select></label>
 ${field('Count date','date',today(),'date',`required max="${today()}"`)}<label class="field">Counted by<input name="counted_by" list="take-staff" maxlength="80" placeholder="Name"><datalist id="take-staff">${staff.map(e=>`<option value="${esc(e.name)}">`).join('')}</datalist></label></div>
 <p class="help" id="take-count"></p><div id="stock-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">Start count</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const f=$('#take-form').elements,count=()=>{$('#take-count').textContent=`${takeItems(f.scope.value,f.location.value).length} items will be on the count sheet.`};$('#take-form').onchange=count;count();
 $('#take-form').onsubmit=e=>{e.preventDefault();const items=takeItems(f.scope.value,f.location.value);if(!items.length){$('#stock-error').textContent='No items to count in this selection.';return}
  const t={id:crypto.randomUUID(),reference:nextReference('ST',stockTakes),date:f.date.value,scope:f.scope.value,location:f.location.value,counted_by:f.counted_by.value.trim(),status:'Draft',created_at:new Date().toISOString(),lines:items.map(i=>({item_id:i.id,system_qty:balanceOf(i.id,stockMoves).qty,counted:null,note:''}))};
  stockTakes.push(t);$('#modal').close();takeView=t.id;stockTab='takes';render();toast(`${t.reference} started with ${t.lines.length} items. Enter the counts, then post.`)};
}
function takeLineCalc(t,l){const item=stockById(l.item_id);if(!item)return null;const now=balanceOf(item.id,stockMoves).qty,base=t.status==='Posted'?l.system_qty:now,counted=l.counted==null||l.counted===''?null:Number(l.counted),diff=counted==null?null:qty3(counted-base);const adj=diff&&t.status!=='Posted'?adjustmentFor(item,diff):{value:l.value||0};return {item,base,counted,diff,value:diff?adj.value:0,changed:t.status!=='Posted'&&qty3(now-l.system_qty)!==0}}
function stockTakePage(t){
 const rows=t.lines.map(l=>({l,c:takeLineCalc(t,l)})).filter(x=>x.c),done=rows.filter(x=>x.c.counted!=null).length,vars=rows.filter(x=>x.c.diff),plus=vars.filter(x=>x.c.value>0).reduce((n,x)=>n+x.c.value,0),minus=vars.filter(x=>x.c.value<0).reduce((n,x)=>n+x.c.value,0),posted=t.status==='Posted';
 return `<section class="card take-card"><div class="cardhead"><div><button class="textbutton back" data-take-back>← All stock takes</button><h2>${esc(t.reference)} · ${esc(takeScopes[t.scope]||'Stock')}${t.location?' · '+esc(t.location):''} ${badge(t.status)}</h2><p class="sub" style="margin-top:6px">Count date ${esc(t.date)}${t.counted_by?` · counted by ${esc(t.counted_by)}`:''}${posted?` · posted ${esc(t.posted_at||'')}`:''}</p></div><div class="row">${posted?'':'<button type="button" id="take-fill">Fill uncounted = system</button>'}<button type="button" id="take-print">Print count sheet</button><button type="button" id="take-csv">Export CSV</button>${posted?'':'<button type="button" class="danger" id="take-delete">Delete draft</button>'}</div></div>
 <div class="take-sum"><div><span>Counted</span><b>${done} / ${rows.length}</b></div><div><span>Items with variance</span><b>${vars.length}</b></div><div><span>Gain</span><b class="pos">${money(plus)}</b></div><div><span>Loss</span><b class="neg">${money(minus)}</b></div><div class="net"><span>Net variance</span><b>${money(plus+minus)}</b></div></div>
 <div class="tablewrap"><table class="take-table"><thead><tr><th>ITEM</th><th>LOCATION</th><th class="money">SYSTEM</th><th class="money">COUNTED</th><th class="money">VARIANCE</th><th class="money">VALUE</th><th>NOTE</th></tr></thead><tbody>${rows.map(({l,c},k)=>`<tr class="${c.diff?'var':''} ${c.counted==null?'todo':''}"><td class="ref">${esc(c.item.code)}<small>${esc(itemLabel(c.item))}${c.item.owner==='Customer'?' · '+esc(c.item.customer):''}</small>${c.changed?'<small class="late">Stock moved since the count started; variance uses today’s figure.</small>':''}</td><td>${esc(c.item.location||'—')}</td><td class="money">${fmtQty(c.base,c.item)}</td><td class="money">${posted?(c.counted==null?'—':fmtQty(c.counted,c.item)):`<input type="number" min="0" step="${isWhole(c.item)?1:0.001}" data-take-count="${k}" value="${c.counted??''}" placeholder="—">`}</td><td class="money" data-take-var="${k}">${c.diff==null?'—':c.diff===0?'<span class="ok">✓</span>':`<b class="${c.diff>0?'pos':'neg'}">${c.diff>0?'+':''}${fmtQty(c.diff,c.item)}</b>`}</td><td class="money" data-take-val="${k}">${c.value?money(c.value):'—'}</td><td>${posted?esc(l.note||''):`<input data-take-note="${k}" value="${esc(l.note||'')}" maxlength="200" placeholder="Reason">`}</td></tr>`).join('')}</tbody></table></div>
 ${posted?'':`<div class="take-foot"><span class="fine">Counts save as you type. Posting creates one adjustment per variance (reference ${esc(t.reference)}) to post in Accounts → Journal.</span><button type="button" class="primary" id="take-post" ${done?'':'disabled'}>Post ${vars.length} adjustment${vars.length===1?'':'s'}</button></div>`}</section>`;
}
function bindStockTake(t){
 $('[data-take-back]').onclick=()=>{takeView=null;render()};
 const save=()=>saveLocalWorkspace();
 $$('[data-take-count]').forEach(inp=>inp.oninput=()=>{const k=Number(inp.dataset.takeCount);t.lines[k].counted=inp.value===''?null:Number(inp.value);const c=takeLineCalc(t,t.lines[k]);$(`[data-take-var="${k}"]`).innerHTML=c.diff==null?'—':c.diff===0?'<span class="ok">✓</span>':`<b class="${c.diff>0?'pos':'neg'}">${c.diff>0?'+':''}${fmtQty(c.diff,c.item)}</b>`;$(`[data-take-val="${k}"]`).textContent=c.value?money(c.value):'—';inp.closest('tr').classList.toggle('var',!!c.diff);inp.closest('tr').classList.toggle('todo',c.counted==null);save()});
 $$('[data-take-count]').forEach(inp=>inp.onchange=()=>render());
 $$('[data-take-note]').forEach(inp=>inp.onchange=()=>{t.lines[Number(inp.dataset.takeNote)].note=inp.value.trim();save()});
 if($('#take-fill'))$('#take-fill').onclick=()=>{let n=0;for(const l of t.lines)if(l.counted==null){l.counted=balanceOf(l.item_id,stockMoves).qty;n++}render();toast(n?`${n} uncounted item${n===1?'':'s'} set to the system quantity.`:'Every item already has a count.')};
 if($('#take-delete'))$('#take-delete').onclick=()=>{if(!confirm(`Delete draft ${t.reference}?`))return;stockTakes=stockTakes.filter(x=>x.id!==t.id);takeView=null;render();toast(`${t.reference} deleted.`)};
 $('#take-csv').onclick=()=>{downloadCSV(`gr-synergy-${t.reference}.csv`,[['Item code','Item','Location','System','Counted','Variance','Value (PKR)','Note'],...t.lines.map(l=>{const c=takeLineCalc(t,l);return c?[c.item.code,itemLabel(c.item),c.item.location||'',c.base,c.counted??'',c.diff??'',c.value||'',l.note||'']:null}).filter(Boolean)]);toast('Stock take exported.')};
 $('#take-print').onclick=()=>printCountSheet(t);
 if($('#take-post'))$('#take-post').onclick=()=>{const rows=t.lines.map(l=>({l,c:takeLineCalc(t,l)})).filter(x=>x.c&&x.c.counted!=null);const uncounted=t.lines.length-rows.length;if(uncounted&&!confirm(`${uncounted} item${uncounted===1?' is':'s are'} not counted and will be left unchanged. Post the counted items?`))return;
  let made=0;for(const {l,c} of rows){if(c.diff&&c.base+c.diff<-1e-9)continue;l.system_qty=c.base;if(c.diff){const m=addStockMove({item_id:c.item.id,type:'adjust',date:t.date,quantity:c.diff,value:c.value,party:c.item.customer||'',notes:`Stock take ${t.reference}${l.note?' - '+l.note:''}`});l.move_id=m.id;l.value=c.value;made++}}
  Object.assign(t,{status:'Posted',posted_at:today(),variance_value:rows.reduce((n,x)=>n+(x.c.value||0),0),adjustments:made});render();toast(`${t.reference} posted: ${made} adjustment${made===1?'':'s'}${made?'. Post them in Accounts → Journal.':'. Stock matched the count.'}`)};
}
function printCountSheet(t){
 const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print the count sheet.');return}
 const rows=t.lines.map(l=>stockById(l.item_id)).filter(Boolean);
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(t.reference)} count sheet</title><style>body{font:13px Helvetica,Arial,sans-serif;margin:28px;color:#1a2b36}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #c9d1d6;padding:7px 8px;text-align:left}th{background:#eef2f4;font-size:11px;letter-spacing:.5px}td.box{width:90px}small{color:#6b7a80}.sig{display:flex;gap:60px;margin-top:40px}.sig div{flex:1;border-top:1px solid #333;padding-top:6px}@media print{button{display:none}}</style></head><body><button onclick="print()">Print</button><h1>${esc(company.name)} · Stock count sheet</h1><p>${esc(t.reference)} · ${esc(takeScopes[t.scope]||'')}${t.location?' · '+esc(t.location):''} · Count date ${esc(t.date)}${t.counted_by?' · Counted by '+esc(t.counted_by):''}</p><table><thead><tr><th>#</th><th>ITEM CODE</th><th>DESCRIPTION</th><th>LOCATION</th><th>UNIT</th><th>COUNTED</th><th>NOTE</th></tr></thead><tbody>${rows.map((i,k)=>`<tr><td>${k+1}</td><td><b>${esc(i.code)}</b></td><td>${esc(itemLabel(i))}${i.owner==='Customer'?`<br><small>${esc(i.customer)}</small>`:''}</td><td>${esc(i.location||'')}</td><td>${esc(unitOf(i))}</td><td class="box"></td><td class="box"></td></tr>`).join('')}</tbody></table><p><small>System quantities are not printed so that the count is blind.</small></p><div class="sig"><div>Counted by</div><div>Checked by</div><div>Date</div></div></body></html>`);
 w.document.close();
}
function stockTakesList(){
 if(!stockTakes.length)return '<div class="empty">No stock takes yet. Use <b>Stock take</b> to count your stock and post the differences in one go.</div>';
 return `<div class="tablewrap"><table><thead><tr><th>STOCK TAKE</th><th>DATE</th><th>WHAT</th><th>COUNTED BY</th><th class="money">ITEMS</th><th class="money">NET VARIANCE</th><th>STATUS</th><th></th></tr></thead><tbody>${[...stockTakes].sort((a,b)=>b.date.localeCompare(a.date)||String(b.reference).localeCompare(String(a.reference))).map(t=>{const net=t.status==='Posted'?Number(t.variance_value||0):t.lines.reduce((n,l)=>n+(takeLineCalc(t,l)?.value||0),0),done=t.lines.filter(l=>l.counted!=null).length;return `<tr><td class="ref">${esc(t.reference)}</td><td>${esc(t.date)}</td><td>${esc(takeScopes[t.scope]||'')}${t.location?' · '+esc(t.location):''}</td><td>${esc(t.counted_by||'—')}</td><td class="money">${done}/${t.lines.length}</td><td class="money ${net<0?'neg':net>0?'pos':''}">${net?money(net):'—'}</td><td>${badge(t.status)}</td><td><button class="textbutton" data-take-open="${esc(t.id)}">Open ↗</button></td></tr>`}).join('')}</tbody></table></div>`;
}
// Valuation: every item with quantity, average cost, value, share of total, last receipt and last movement.
function valuationRows(term){
 const t=(term||'').trim().toLowerCase(),d=today();
 return stockItems.filter(i=>i.category!=='scrap').map(i=>{const b=balanceOf(i.id,stockMoves),mv=stockMoves.filter(m=>m.item_id===i.id),lastRec=mv.filter(m=>m.type==='receipt').map(m=>m.date).sort().pop()||'',lastMove=mv.map(m=>m.date).sort().pop()||'',age=lastMove?daysBetweenDates(lastMove,d):null;return {i,b,lastRec,lastMove,age}}).filter(x=>x.b.qty>0).filter(x=>`${x.i.code} ${itemLabel(x.i)} ${x.i.location||''} ${x.i.customer||''}`.toLowerCase().includes(t)).sort((a,b)=>b.b.value-a.b.value||byCode(a.i,b.i));
}
function valuationTable(term){
 const rows=valuationRows(term),total=rows.reduce((n,x)=>n+(valuedItem(x.i)?x.b.value:0),0),slow=rows.filter(x=>x.age!=null&&x.age>90);
 const byCat=['sheet','remnant'].map(c=>({c,v:rows.filter(x=>x.i.category===c&&x.i.owner==='Business').reduce((n,x)=>n+x.b.value,0),n:rows.filter(x=>x.i.category===c&&x.i.owner==='Business').length}));
 if(!rows.length)return '<div class="empty">Nothing in stock.</div>';
 return `<div class="val-chips">${byCat.map(x=>`<span><b>${money(x.v)}</b> ${categoryLabels[x.c]} · ${x.n} item${x.n===1?'':'s'}</span>`).join('')}<span class="${slow.length?'warn':''}"><b>${slow.length}</b> slow-moving (no movement in 90+ days)</span></div>
 <div class="tablewrap"><table><thead><tr><th>ITEM</th><th>CATEGORY</th><th class="money">ON HAND</th><th class="money">AVG COST</th><th class="money">VALUE</th><th class="money">% OF VALUE</th><th>LAST RECEIPT</th><th>LAST MOVEMENT</th></tr></thead><tbody>${rows.map(x=>{const v=valuedItem(x.i);return `<tr><td class="ref">${esc(x.i.code)}<small>${esc(itemLabel(x.i))}${x.i.owner==='Customer'?' · '+esc(x.i.customer):''}</small></td><td>${esc(x.i.owner==='Customer'?'Customer':categoryLabels[x.i.category]||x.i.category)}</td><td class="money">${fmtQty(x.b.qty,x.i)}<small>${kgText(x.i,x.b.qty)}</small></td><td class="money">${v?money(x.b.avg):'—'}</td><td class="money">${v?`<b>${money(x.b.value)}</b>`:'<span class="fine">not valued</span>'}</td><td class="money">${v&&total?(x.b.value/total*100).toFixed(1)+'%':'—'}</td><td>${esc(x.lastRec||'—')}</td><td>${esc(x.lastMove||'—')}${x.age!=null?`<small class="${x.age>90?'late':''}">${x.age} days ago${x.age>90?' · slow':''}</small>`:''}</td></tr>`}).join('')}<tr class="total"><td colspan="4"><b>Total stock value</b></td><td class="money"><b>${money(total)}</b></td><td class="money">100%</td><td colspan="2"></td></tr></tbody></table></div>`;
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
 if($('#att-csv'))$('#att-csv').onclick=()=>{const month=attDate.slice(0,7),rows=employees.filter(e=>employedIn(e,month)).sort(byEmpCode);downloadCSV(`gr-synergy-attendance-${month}.csv`,[['Month','Code','Employee',...Object.values(attendanceCodes),'Not marked','Overtime hours'],...rows.map(e=>{const s=attendanceSummary(e,month,attendance);return [month,e.code,e.name,s.P,s.H,s.A,s.L,s.U,s.O,s.unmarked,s.ot]})]);toast(`Exported attendance for ${rows.length} staff.`)};
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
 try{const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createPayslipPDF(run,line,empById(empId),new Uint8Array(await response.arrayBuffer()),window.PDFLib,{advanceBalance:advanceBalance(empId,advances,payrolls)});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`GR-Synergy-Payslip-${line.code}-${run.month}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Payslip downloaded.');
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
function stampLogo(color='blue'){return stampLogos[color]??=inkLogo('sutluj-logo.jpg?v=gr-3',color).catch(()=>null)}
function pdfFileName(doc){const kind=doc.documentType==='purchase'||doc.kind==='purchase'?'PO':'Quotation';return `GR-Synergy-${kind}-${String(doc.reference||'Draft').replace(/[^a-zA-Z0-9_-]/g,'-')}-${String(doc.party||'').replace(/[^a-zA-Z0-9]+/g,'-').slice(0,40)}.pdf`.replace(/-+\.pdf$/,'.pdf')}
async function downloadSavedPDF(r,button){
 if(!r)return;button.disabled=true;const label=button.textContent;button.textContent='Preparing…';
 try{const doc={...r,lines:r.lines.map(l=>({...l,quantity:Number(l.quantity),rate:Number(l.rate)})),tax:Number(r.tax),...(r.kind==='purchase'?{documentType:'purchase'}:{})};const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
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
 return `<div class="heading"><div><button class="textbutton" data-jobs-back>← All work orders</button><div class="eyebrow" style="margin-top:10px">JOB CARD</div><h1>${esc(j.reference)}</h1><p class="sub">${esc(j.party)} · Quote ${esc(j.quote_reference)} · <span class="pill stage">${esc(stage)}</span>${j.priority==='Urgent'?' <span class="pill overdue">Urgent</span>':''}</p></div><div class="row">${local&&jobDelivery(j).done<jobDelivery(j).total?`<button data-dn-new="${esc(j.id)}">＋ Delivery note</button>`:''}<button id="job-pdf">Job card PDF</button>${local?'<button class="danger" id="job-delete">Delete</button>':''}${locked?`<button class="primary" id="job-invoice">${invoice?'View invoice '+esc(invoice.reference):'Create invoice'}</button>`:''}</div></div>
 ${local?`<div class="stats">${stat('Quote value',money(f.revenue),'Before sales tax','sales')}${stat('Job cost',money(f.cost),'Material, machine, labour, expenses','accounts')}${stat('Margin',f.cost===0||f.marginPct==null?'—':f.marginPct+'%',f.cost===0?'Record costs to see the margin':money(f.margin),'accounts')}${(()=>{const pl=jobSheetPlan(j),n=pl.groups.reduce((t,g)=>t+g.sheets,0);return stat('Sheets needed',n?String(n):'—',n?pl.groups.map(g=>`${g.sheets} × ${sheetLabel(g.d.w,g.d.l)}`).join(', '):'Enter part sizes in the sheet plan','inventory')})()}</div>`:''}
 <ol class="stage-track">${steps.map((t,i)=>`<li class="${t.done?'done':t.na?'na':i===firstOpen?'current':t.active?'active':''}">${esc(t.name)}${t.na?' <span>N/A</span>':''}</li>`).join('')}</ol>${local?scopeCard(j,locked):''}

 <form id="job-form"><section class="card"><div class="cardhead"><h2>Job details & production</h2>${locked?badge('Completed'):''}</div><div class="cardbody"><fieldset ${locked?'disabled':''} class="plainset" style="margin:0"><div class="formgrid job-grid">
 ${local?`${field('Due date','due_date',j.due_date||'','date')}<label class="field">Priority<select name="priority">${opt(priorities,j.priority||'Normal')}</select></label>
 <label class="field">Operator<select name="operator_id"><option value="">Not assigned</option>${staff.map(e=>`<option value="${esc(e.id)}" ${e.id===j.operator_id?'selected':''}>${esc(e.name)} · ${esc(e.role)}</option>`).join('')}</select></label>${field('Machine','machine',j.machine||'','text','maxlength="100" placeholder="e.g. Fiber laser 3 kW"')}`:''}
 ${field('Drawing / DXF ref.','design_reference',j.design_reference,'text','maxlength="500" placeholder="File or revision"')}${select('Material owner','material_owner',['Business','Customer'],j.material_owner)}
 ${local?field('Est. cutting (min)','est_minutes',j.est_minutes||0,'number','min="0" max="100000" step="1"'):`${select('Design / DXF','design_status',['Pending','In progress','Ready','Not required'],j.design_status)}${select('Material','material_status',['Pending','Ready'],j.material_status)}${select('Cutting','cutting_status',['Pending','In progress','Done'],j.cutting_status)}`}
 ${field('Actual cutting (min)','cutting_minutes',j.cutting_minutes,'number','min="0" max="1000000" step="0.01" required')}
 ${local?`<div class="field full job-mat"><span>Material used <span class="fine">from stock issues</span></span>${materialUsedList(j)}</div>`:''}
 <label class="field half">Workshop instructions<textarea name="notes" rows="2" class="autogrow" maxlength="4000" placeholder="Nesting notes, edge finish, packing, delivery…">${esc(j.notes)}</textarea></label>
 ${local?`<label class="field half">Material notes <span class="fine">optional</span><textarea name="material_used" rows="2" class="autogrow" maxlength="4000" placeholder="Anything not issued from stock, e.g. customer's own plate">${esc(j.material_used)}</textarea></label>`:`<label class="field half">Material used<textarea name="material_used" rows="2" class="autogrow" maxlength="4000">${esc(j.material_used)}</textarea></label>`}</div><div class="job-hints" id="job-hints">${jobHints(j)}</div></fieldset>
 ${local?sheetPlanBlock(j,q,locked):''}
 <div id="job-error" class="error" role="alert"></div>${locked?'':'<div class="actions"><button type="submit" name="action" value="save">Save job</button><button type="submit" name="action" value="complete" class="primary">Mark completed</button></div>'}</div></section></form>
 ${local?`<section class="card" style="margin-top:24px"><div class="cardhead"><h2>Material from stock</h2>${locked?'':'<button id="job-issue">Issue from stock</button>'}</div><div class="cardbody">${jobStockTable(j)}</div></section>
 ${jobDeliveryCard(j)}
 <section class="card" style="margin-top:24px"><div class="cardhead"><h2>Labour</h2><button id="labour-add">＋ Add labour</button></div>${labourTable(j)}</section>
 <section class="card" style="margin-top:24px" id="job-expenses"><div class="cardhead"><h2>Job expenses</h2><button id="expense-add">＋ Book expense</button></div>${jobExpenseTable(j)}</section>
 <section class="card" style="margin-top:24px"><div class="cardhead"><h2>Job costing</h2><span class="fine">Quote value excludes sales tax</span></div><div class="cardbody">${[['Quote value',f.revenue],['Material from stock',-f.material],[`Machine time (${Number(j.cutting_minutes)||0} min${Number(company.machine_rate)?` at ${money(company.machine_rate)}/h`:''})`,-f.machine],['Labour',-f.labour],['Booked expenses',-f.expenses]].map(([k,v])=>`<div class="cost-row"><span>${k}</span><b>${money(v)}</b></div>`).join('')}<div class="summary"><span>Margin${f.marginPct==null?'':` (${f.marginPct}%)`}</span><b class="${f.margin<0?'late':''}">${money(f.margin)}</b></div>
 ${Number(company.machine_rate)?'':'<p class="help">Set a machine cost per cutting hour in Settings → Company details to include machine time.</p>'}${jobScrapNote(j)}${j.est_minutes?`<p class="help">Cutting time: estimated ${j.est_minutes} min, actual ${Number(j.cutting_minutes)||0} min (${Number(j.cutting_minutes)>j.est_minutes?'+':''}${Math.round((Number(j.cutting_minutes)||0)-j.est_minutes)} min).</p>`:''}<p class="help">Machine time and labour are costing allocations; wages are posted through payroll. Material and booked expenses are posted through Accounts → Journal.</p></div></section>`:'<p class="help">Parts, scrap, labour, expenses and job costing are available in the local workspace.</p>'}`;
}
// Sheet planning on the job card: per quote line, the part size (inches, from the quote) and the sheet it is cut
// from give pieces per sheet and sheets needed. Saved on the job as sheet_plan; part sizes are also kept in mm
// as parts (for the part weights used later by scrap).
// Sheet sizes to choose from: the standard Pakistani sizes, any other size held in stock, and the job's
// current size if it is none of these. All in inches.
function sheetOptions(current){
 const half=v=>Math.round(v/IN*2)/2,extra=[];
 for(const i of stockItems.filter(i=>i.category==='sheet')){const w=half(Math.min(+i.width_mm,+i.length_mm)),l=half(Math.max(+i.width_mm,+i.length_mm)),id=`${w}x${l}`;if(w>0&&l>0&&!sheetPresets.some(p=>p.id===id)&&!extra.some(e=>e.id===id))extra.push({id,label:`${w}" × ${l}" (in stock)`,w:w*IN,l:l*IN})}
 const all=[...sheetPresets,...extra],cur=normalizeSheetId(current),d=cur&&cur!=='custom'&&!all.some(o=>o.id===cur)?sheetFromId(cur):null;
 return d?[...all,{id:cur,label:`${sheetLabel(d.w,d.l)} (saved size)`,...d}]:all;
}
function planInputs(j,i,l){
 const p=j.sheet_plan?.lines?.[i]||{},mm=j.parts?.[i],r2=v=>Math.round(v*100)/100;
 return {w_in:p.w_in??l.width_in??(mm?.width?r2(mm.width/IN):''),l_in:p.l_in??l.length_in??(mm?.length?r2(mm.length/IN):''),sheet:normalizeSheetId(p.sheet||l.sheet)||'48x96',sw_ft:p.sw_ft??'',sl_ft:p.sl_ft??''};
}
function sheetDims(p){if(p.sheet==='custom')return {w:Number(p.sw_ft)*FT,l:Number(p.sl_ft)*FT};return sheetFromId(p.sheet)||{w:0,l:0}}
function sheetsInStock(l,w,len,party){const near=(a,b)=>Math.abs(Number(a)-b)<6;return stockItems.filter(i=>i.category==='sheet'&&i.material===l.material&&Math.abs(Number(i.thickness_mm)-Number(l.thickness_mm))<0.01&&(i.owner!=='Customer'||i.customer===party)&&((near(i.width_mm,w)&&near(i.length_mm,len))||(near(i.width_mm,len)&&near(i.length_mm,w)))).reduce((n,i)=>n+Math.max(0,balanceOf(i.id,stockMoves).qty),0)}
// Results for every line plus totals grouped by material, thickness and sheet size.
// ---- Delivery notes: partial or full deliveries per job, every edit kept as a revision, cancel instead of delete ----
// Pieces delivered per quote line on non-cancelled delivery notes (optionally leaving one note out, when editing it).
// before: only count notes created before that moment (what was "delivered earlier" for a given note).
function jobDelivery(j,excludeId,before){
 const lines=jobQuote(j).lines||[],ordered=lines.map(l=>Math.ceil(Number(l.quantity)||0)),delivered=lines.map(()=>0);
 for(const d of deliveryNotes)if(d.job_id===j.id&&d.status!=='Cancelled'&&d.id!==excludeId&&(!before||String(d.created_at)<before))for(const l of d.lines)if(delivered[l.line]!=null)delivered[l.line]+=Number(l.qty)||0;
 const total=ordered.reduce((a,b)=>a+b,0),done=delivered.reduce((a,b)=>a+b,0);
 return {lines,ordered,delivered,total,done,status:!done?'Not delivered':done>=total?'Delivered':'Partly delivered'};
}
const pieceKg=l=>Number(l.width_in)>0&&Number(l.length_in)>0?(sheetWeightKg({category:'sheet',material:l.material,thickness_mm:l.thickness_mm,width_mm:Number(l.width_in)*IN,length_mm:Number(l.length_in)*IN})||0):0;
const lineSize=l=>Number(l.width_in)>0&&Number(l.length_in)>0?`${l.width_in}" × ${l.length_in}"`:'';
const lineMat=l=>l.material?`${materials[l.material]||''}${l.thickness_mm?' '+(matchGauge(l.material,l.thickness_mm)?.gauge?matchGauge(l.material,l.thickness_mm).gauge+' ga':Number(l.thickness_mm)+' mm'):''}`:'';
// The job's "Delivery / dispatch" task follows the pieces delivered on each line.
function syncDeliveryScope(jobId){
 const j=workOrders.find(x=>x.id===jobId);if(!j)return;const scope=scopeOf(j).map(t=>({...t})),task=scope.find(t=>/deliver|dispatch/i.test(t.name));if(!task)return;
 const dv=jobDelivery(j),n=Math.max(1,dv.lines.length),lines=materializeLines(scope,j.scope_lines,n);
 dv.lines.forEach((l,li)=>{const q=dv.ordered[li]||1,got=Math.min(q,dv.delivered[li]),prev=lines[li][task.id];if(prev?.status==='Not required')return;lines[li][task.id]=countsPieces(task,l.quantity)?cellFromCount(prev,got,q,today()):got>=q?{status:'Done',progress:100,done_at:prev?.done_at||today()}:got?{status:'In progress',progress:Math.round(got/q*100),done_at:''}:{status:'Pending',progress:0,done_at:''}});
 const derived=deriveScope(scope,lines,n);saveJobLocally(j,{scope:derived,scope_lines:lines,...legacyFromScope(derived)});
}
function dnEditor({jobId,id}={}){
 const old=id?deliveryNotes.find(d=>d.id===id):null,j=workOrders.find(x=>x.id===(old?.job_id||jobId));if(!j)return;
 const dv=jobDelivery(j,old?.id),earlier=old?jobDelivery(j,old.id,old.created_at).delivered:dv.delivered,cust=customers.find(c=>c.name===j.party)||{},staff=employees.filter(e=>employedOn(e,today()));
 const val=(k,d='')=>old?.[k]??d,qtyFor=li=>old?(old.lines.find(l=>l.line===li)?.qty??0):Math.max(0,dv.ordered[li]-dv.delivered[li]);
 if(!old&&dv.done>=dv.total){toast(`${j.reference} is fully delivered.`);return}
 $('#modal').innerHTML=`<div class="modalhead"><h2>${old?`Edit ${esc(old.reference)} · revision ${(old.revision||0)+1}`:'New delivery note'} · ${esc(j.reference)}</h2><button class="close" aria-label="Close">×</button></div><form id="dn-form"><p><b>${esc(j.party)}</b> · Quote ${esc(j.quote_reference||'')} · ${badge(dv.status)} ${dv.done}/${dv.total} pcs delivered${old?' on other notes':''}</p><div class="formgrid dn-grid">
 ${field('Date','date',val('date',today()),'date',`required max="${today()}"`)}${field('Customer PO / ref.','customer_po',val('customer_po',jobQuote(j).customer_ref||''),'text','maxlength="80"')}
 ${field('Contact','contact',val('contact',cust.contact||''),'text','maxlength="80"')}${field('Phone','phone',val('phone',cust.phone||cust.mobile||''),'text','maxlength="40"')}
 <label class="field full">Delivery address<input name="address" maxlength="250" value="${esc(val('address',[cust.address,cust.city].filter(Boolean).join(', ')))}"></label>
 ${field('Vehicle no.','vehicle',val('vehicle'),'text','maxlength="40" placeholder="e.g. LES-1234"')}${field('Driver','driver',val('driver'),'text','maxlength="60"')}
 ${field('Driver phone','driver_phone',val('driver_phone'),'text','maxlength="40"')}<label class="field">Dispatched by<input name="dispatched_by" list="dn-staff" maxlength="60" value="${esc(val('dispatched_by'))}"><datalist id="dn-staff">${staff.map(e=>`<option value="${esc(e.name)}">`).join('')}</datalist></label>
 ${field('Packages','packages',val('packages'),'text','maxlength="60" placeholder="e.g. 2 bundles, 1 crate"')}${field('Received by','received_by',val('received_by'),'text','maxlength="80" placeholder="Fill in when signed back"')}</div>
 <div class="tablewrap" style="margin-top:14px"><table class="dn-lines"><thead><tr><th>#</th><th>ITEM</th><th class="money">ORDERED</th><th class="money">EARLIER</th><th class="money">THIS DELIVERY</th><th class="money">BALANCE</th></tr></thead><tbody>${dv.lines.map((l,li)=>{const rem=Math.max(0,dv.ordered[li]-dv.delivered[li]);return `<tr><td>${li+1}</td><td>${esc(l.description||'Item')}<small>${esc([lineSize(l),lineMat(l)].filter(Boolean).join(' · '))}</small></td><td class="money">${dv.ordered[li]}</td><td class="money">${earlier[li]}${old&&earlier[li]!==dv.delivered[li]?`<small>${dv.delivered[li]-earlier[li]} on later notes</small>`:''}</td><td class="money"><input type="number" min="0" max="${rem}" step="1" data-dn-qty="${li}" data-rem="${rem}" value="${Math.min(qtyFor(li),rem)}" ${rem?'':'disabled'}></td><td class="money" data-dn-bal="${li}"></td></tr>`}).join('')}</tbody></table></div>
 <div class="row dn-tools"><button type="button" id="dn-all">Deliver all remaining</button><button type="button" id="dn-none">Clear</button><span class="spacer"></span><span id="dn-sum" class="fine"></span></div>
 <label class="field" style="margin-top:10px">Remarks<textarea name="notes" maxlength="1000" rows="2">${esc(val('notes'))}</textarea></label>
 ${old?'<label class="field">Reason for this revision<input name="revision_reason" required maxlength="200" placeholder="e.g. quantity corrected, vehicle changed"></label><p class="help">The current version is kept as a revision; the delivery note number stays the same.</p>':''}
 <div id="dn-error" class="error" role="alert"></div><div class="actions"><button type="button" class="cancel">Cancel</button><button type="submit" class="primary">${old?'Save revision':'Create delivery note'}</button></div></form>`;
 $('#modal').showModal();$('.close').onclick=$('.cancel').onclick=()=>$('#modal').close();
 const qs=()=>$$('[data-dn-qty]').map(i=>({li:Number(i.dataset.dnQty),q:i.disabled?0:Math.round(Number(i.value)||0),rem:Number(i.dataset.rem)}));
 const upd=()=>{let pcs=0,kg=0;for(const x of qs()){$(`[data-dn-bal="${x.li}"]`).textContent=Math.max(0,x.rem-x.q);pcs+=x.q;kg+=pieceKg(dv.lines[x.li])*x.q}const fin=qs().every(x=>x.q>=x.rem);$('#dn-sum').innerHTML=`${pcs} pcs${kg?` · about ${Math.round(kg).toLocaleString('en-PK')} kg`:''} · <b>${fin?'Final delivery':'Partial delivery'}</b>`};
 $('#dn-form').oninput=upd;upd();
 $('#dn-all').onclick=()=>{$$('[data-dn-qty]').forEach(i=>{if(!i.disabled)i.value=i.dataset.rem});upd()};$('#dn-none').onclick=()=>{$$('[data-dn-qty]').forEach(i=>i.value=0);upd()};
 $('#dn-form').onsubmit=e=>{e.preventDefault();try{
  const f=e.target.elements,list=qs();
  for(const x of list){if(x.q<0||x.q>x.rem)throw Error(`Line ${x.li+1}: deliver between 0 and ${x.rem} pieces.`)}
  const lines=list.filter(x=>x.q>0).map(x=>{const l=dv.lines[x.li];return {line:x.li,description:l.description||'Item',size:lineSize(l),material:lineMat(l),unit:l.unit||'pcs',ordered:dv.ordered[x.li],previous:earlier[x.li],qty:x.q,balance:dv.ordered[x.li]-earlier[x.li]-x.q,kg:Math.round(pieceKg(l)*x.q*10)/10}});
  if(!lines.length)throw Error('Enter the pieces in this delivery.');if(f.date.value>today())throw Error('The date cannot be in the future.');
  const data={date:f.date.value,customer_po:f.customer_po.value.trim(),contact:f.contact.value.trim(),phone:f.phone.value.trim(),address:f.address.value.trim(),vehicle:f.vehicle.value.trim(),driver:f.driver.value.trim(),driver_phone:f.driver_phone.value.trim(),dispatched_by:f.dispatched_by.value.trim(),packages:f.packages.value.trim(),received_by:f.received_by.value.trim(),notes:f.notes.value.trim(),lines,final:list.every(x=>x.q>=x.rem),weight_kg:Math.round(lines.reduce((n,l)=>n+l.kg,0)*10)/10};
  let dn;
  if(old){const {revisions=[],...snap}=old;dn={...old,...data,revisions:[...revisions,{...snap,saved_at:new Date().toISOString()}],revision:(old.revision||0)+1,revision_reason:f.revision_reason.value.trim(),updated_at:new Date().toISOString()};deliveryNotes=deliveryNotes.map(d=>d.id===old.id?dn:d)}
  else{dn={id:crypto.randomUUID(),reference:nextDocumentNumber('DN',deliveryNotes,f.date.value.slice(0,4)),job_id:j.id,job_reference:j.reference,quote_reference:j.quote_reference||'',party:j.party,status:'Issued',revision:0,revisions:[],created_at:new Date().toISOString(),...data};deliveryNotes.push(dn)}
  syncDeliveryScope(j.id);$('#modal').close();render();toast(`${dn.reference}${dn.revision?` rev ${dn.revision}`:''} saved · ${lines.reduce((n,l)=>n+l.qty,0)} pcs · ${dn.final?'final':'partial'} delivery.`);
 }catch(err){$('#dn-error').textContent=err.message}};
}
async function downloadDNPDF(dn,btn){
 const t=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Preparing…'}
 try{const res=await fetch('sutluj-logo.jpg?v=gr-3');if(!res.ok)throw Error('The company logo could not be loaded.');const bytes=await createDeliveryNotePDF(dn,new Uint8Array(await res.arrayBuffer()),window.PDFLib,{company,party:customers.find(c=>c.name===dn.party)||{},stampLogo:stampLogo(company.stamp_color)});const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=`GR-Synergy-Delivery-Note-${dn.reference}${dn.revision?'-rev'+dn.revision:''}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast(`${dn.reference}${dn.revision?' rev '+dn.revision:''} PDF downloaded.`)}
 catch(e){toast(e.message||'Could not create the PDF.')}finally{if(btn){btn.disabled=false;btn.textContent=t}}
}
function dnView(id){
 const dn=deliveryNotes.find(d=>d.id===id);if(!dn)return;const versions=[...(dn.revisions||[]).map((r,k)=>({...r,_k:k})),{...dn,_k:'current'}].reverse();
 $('#modal').innerHTML=`<div class="modalhead"><h2>${esc(dn.reference)}${dn.revision?` · Rev ${dn.revision}`:''} ${badge(dn.status==='Cancelled'?'Cancelled':dn.final?'Final':'Partial')}</h2><button class="close" aria-label="Close">×</button></div><div class="cardbody">
 <p><b>${esc(dn.party)}</b> · ${esc(dn.job_reference)} · ${esc(dn.date)}${dn.vehicle?` · vehicle ${esc(dn.vehicle)}`:''}${dn.driver?` · driver ${esc(dn.driver)}`:''}${dn.received_by?` · received by ${esc(dn.received_by)}`:''}</p>
 <div class="tablewrap"><table><thead><tr><th>ITEM</th><th class="money">ORDERED</th><th class="money">EARLIER</th><th class="money">THIS DN</th><th class="money">BALANCE</th></tr></thead><tbody>${dn.lines.map(l=>`<tr><td>${esc(l.description)}<small>${esc([l.size,l.material].filter(Boolean).join(' · '))}</small></td><td class="money">${l.ordered}</td><td class="money">${l.previous}</td><td class="money"><b>${l.qty}</b></td><td class="money">${l.balance}</td></tr>`).join('')}</tbody></table></div>
 ${dn.status==='Cancelled'?`<p class="help warn">Cancelled ${esc(dn.cancelled_at||'')}${dn.cancel_reason?': '+esc(dn.cancel_reason):''}. Its pieces no longer count as delivered.</p>`:''}
 <div class="linehead" style="margin-top:16px">VERSIONS</div><table class="dn-versions"><tbody>${versions.map(v=>`<tr><td><b>${v._k==='current'?`Rev ${dn.revision||0} · current`:`Rev ${v.revision||0}`}</b><small>${esc(v.revision_reason||(v.revision?'':'Original'))}</small></td><td>${esc(v.date)} · ${v.lines.reduce((n,l)=>n+l.qty,0)} pcs</td><td>${esc((v.saved_at||v.updated_at||v.created_at||'').slice(0,16).replace('T',' '))}${v._k==='current'?'':' · replaced'}</td><td><button class="textbutton" data-dn-ver="${v._k}">PDF</button></td></tr>`).join('')}</tbody></table>
 <div class="actions">${dn.status==='Cancelled'?'':'<button type="button" class="danger" id="dn-cancel">Cancel note</button><button type="button" id="dn-edit">Edit (new revision)</button>'}<button type="button" class="primary" id="dn-pdf">Download PDF</button></div></div>`;
 if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();
 $('#dn-pdf').onclick=()=>downloadDNPDF(dn,$('#dn-pdf'));
 $$('[data-dn-ver]').forEach(b=>b.onclick=()=>downloadDNPDF(b.dataset.dnVer==='current'?dn:{...dn.revisions[Number(b.dataset.dnVer)],status:'Issued'},b));
 if($('#dn-edit'))$('#dn-edit').onclick=()=>dnEditor({id:dn.id});
 if($('#dn-cancel'))$('#dn-cancel').onclick=()=>{const why=prompt(`Cancel ${dn.reference}? Its pieces will no longer count as delivered. Reason:`);if(why===null)return;Object.assign(dn,{status:'Cancelled',cancelled_at:today(),cancel_reason:why.trim()});syncDeliveryScope(dn.job_id);$('#modal').close();render();toast(`${dn.reference} cancelled and kept on record.`)};
}
function deliveryPage(){
 const ym=today().slice(0,7),live=deliveryNotes.filter(d=>d.status!=='Cancelled'),month=live.filter(d=>d.date.startsWith(ym));
 const ready=workOrders.map(j=>({j,dv:jobDelivery(j)})).filter(x=>x.dv.total>0&&x.dv.done<x.dv.total).sort((a,b)=>(b.j.status==='Completed')-(a.j.status==='Completed')||String(a.j.due_date||'9999').localeCompare(String(b.j.due_date||'9999')));
 const chips=[['All',deliveryNotes.length],['Partial',live.filter(d=>!d.final).length],['Final',live.filter(d=>d.final).length],['Cancelled',deliveryNotes.length-live.length]];
 return `<div class="heading"><div><div class="eyebrow">DISPATCH</div><h1>Delivery notes</h1><p class="sub">Deliver jobs in full or in parts. Every delivery note keeps its revisions; cancelled notes stay on record.</p></div></div>${notice()}
 <div class="stats">${stat('Delivery notes this month',String(month.length),`${monthLabel(ym,true)}`,'deliveries')}${stat('Pieces delivered',month.reduce((n,d)=>n+d.lines.reduce((m,l)=>m+l.qty,0),0).toLocaleString('en-PK'),'This month','deliveries')}${stat('Jobs to deliver',String(ready.length),`${ready.filter(x=>x.j.status==='Completed').length} completed and waiting`,'workorders')}${stat('Partly delivered',String(ready.filter(x=>x.dv.done>0).length),'Balance still to send','deliveries')}</div>
 <section class="card"><div class="cardhead"><div><h2>Ready to deliver</h2><p class="sub">Jobs with pieces still to send, completed jobs first.</p></div></div>${ready.length?`<div class="tablewrap"><table><thead><tr><th>JOB</th><th>CUSTOMER</th><th>STAGE</th><th>DELIVERED</th><th>DUE</th><th></th></tr></thead><tbody>${ready.map(({j,dv})=>`<tr><td class="ref">${esc(j.reference)}<small>${esc(j.quote_reference||'')}</small></td><td>${esc(j.party)}</td><td>${badge(jobStage(j,isInvoiced(j)))}</td><td><div class="progress-meter ${dv.done>=dv.total?'full':''}"><i style="width:${Math.round(dv.done/dv.total*100)}%"></i><span>${dv.done}/${dv.total}</span></div></td><td>${esc(j.due_date||'—')}</td><td><button class="primary" data-dn-new="${esc(j.id)}">＋ Delivery note</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="all-clear"><b>Nothing waiting</b><span>Every job is fully delivered.</span></div>'}</section>
 <div class="chips">${chips.map(([k,n])=>`<button class="chip ${dnFilter===k?'selected':''}" data-dn-filter="${k}">${k} <span>${n}</span></button>`).join('')}</div>
 <section class="card"><div class="toolbar"><input id="dn-search" class="search" type="search" placeholder="Search DN, job, customer, vehicle…" aria-label="Search delivery notes"></div><div id="dn-rows">${dnRows('')}</div></section>`;
}
function dnRows(term){
 const t=term.trim().toLowerCase(),rows=[...deliveryNotes].filter(d=>dnFilter==='All'||(dnFilter==='Cancelled'?d.status==='Cancelled':d.status!=='Cancelled'&&(dnFilter==='Final')===!!d.final)).filter(d=>`${d.reference} ${d.job_reference} ${d.party} ${d.vehicle||''} ${d.driver||''}`.toLowerCase().includes(t)).sort((a,b)=>b.date.localeCompare(a.date)||String(b.reference).localeCompare(String(a.reference)));
 if(!rows.length)return '<div class="empty">No delivery notes here yet. Create one from Ready to deliver or from a job card.</div>';
 return `<div class="tablewrap"><table><thead><tr><th>DELIVERY NOTE</th><th>DATE</th><th>JOB / CUSTOMER</th><th class="money">PIECES</th><th>TYPE</th><th>STATUS</th><th></th></tr></thead><tbody>${rows.map(d=>`<tr class="${d.status==='Cancelled'?'is-inactive':''}"><td class="ref">${esc(d.reference)}${d.revision?` <span class="pill">Rev ${d.revision}</span>`:''}<small>${esc([d.vehicle,d.driver].filter(Boolean).join(' · '))}</small></td><td>${esc(d.date)}</td><td>${esc(d.job_reference)}<small>${esc(d.party)}</small></td><td class="money">${d.lines.reduce((n,l)=>n+l.qty,0)}${d.weight_kg?`<small>${Math.round(d.weight_kg)} kg</small>`:''}</td><td>${badge(d.final?'Final':'Partial')}</td><td>${badge(d.status==='Cancelled'?'Cancelled':d.received_by?'Received':'Issued')}</td><td class="quote-actions"><button class="textbutton" data-dn-open="${esc(d.id)}">Open</button><button class="textbutton" data-dn-pdf="${esc(d.id)}">PDF</button></td></tr>`).join('')}</tbody></table></div>`;
}
function bindDeliveries(){
 const bindRows=()=>{$$('[data-dn-open]').forEach(b=>b.onclick=()=>dnView(b.dataset.dnOpen));$$('[data-dn-pdf]').forEach(b=>b.onclick=()=>downloadDNPDF(deliveryNotes.find(d=>d.id===b.dataset.dnPdf),b))};
 $$('[data-dn-new]').forEach(b=>b.onclick=()=>dnEditor({jobId:b.dataset.dnNew}));
 $$('[data-dn-filter]').forEach(b=>b.onclick=()=>{dnFilter=b.dataset.dnFilter;render()});
 if($('#dn-search'))$('#dn-search').oninput=e=>{$('#dn-rows').innerHTML=dnRows(e.target.value);bindRows()};
 bindRows();
}
// Job card: deliveries for this job.
function jobDeliveryCard(j){
 const dv=jobDelivery(j),dns=deliveryNotes.filter(d=>d.job_id===j.id).sort((a,b)=>a.date.localeCompare(b.date));
 return `<section class="card" style="margin-top:24px"><div class="cardhead"><div><h2>Deliveries</h2><p class="sub">${badge(dv.status)} ${dv.done}/${dv.total} pcs delivered${dv.lines.length>1?` · ${dv.lines.map((l,i)=>`${esc(l.description||'Line '+(i+1))} ${dv.delivered[i]}/${dv.ordered[i]}`).join(' · ')}`:''}</p></div>${dv.done<dv.total?`<button class="primary" data-dn-new="${esc(j.id)}">＋ Delivery note</button>`:''}</div>${dns.length?`<div class="tablewrap"><table><tbody>${dns.map(d=>`<tr class="${d.status==='Cancelled'?'is-inactive':''}"><td class="ref">${esc(d.reference)}${d.revision?` <span class="pill">Rev ${d.revision}</span>`:''}</td><td>${esc(d.date)}</td><td>${d.lines.reduce((n,l)=>n+l.qty,0)} pcs</td><td>${badge(d.status==='Cancelled'?'Cancelled':d.final?'Final':'Partial')}</td><td class="quote-actions"><button class="textbutton" data-dn-open="${esc(d.id)}">Open</button><button class="textbutton" data-dn-pdf="${esc(d.id)}">PDF</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No delivery notes yet.</div>'}</section>`;
}
function jobSheetPlan(j){
 const q=jobQuote(j),gap=j.sheet_plan?.gap??q.sheet_gap??5,margin=j.sheet_plan?.margin??q.sheet_margin??0;
 const lines=(q.lines||[]).map((l,i)=>{const p=planInputs(j,i,l),d=sheetDims(p),r=planLine({w_in:p.w_in,l_in:p.l_in,qty:l.quantity,sheet_w:d.w,sheet_l:d.l,gap,margin});return {i,l,p,d,r}});
 const groups=[];for(const x of lines){if(!x.r?.sheets)continue;const key=`${x.l.material}|${x.l.thickness_mm}|${Math.round(x.d.w)}x${Math.round(x.d.l)}`;let g=groups.find(g=>g.key===key);if(!g){const kg=sheetWeightKg({category:'sheet',material:x.l.material,thickness_mm:x.l.thickness_mm,width_mm:x.d.w,length_mm:x.d.l});g={key,l:x.l,d:x.d,sheets:0,kg,stock:sheetsInStock(x.l,x.d.w,x.d.l,j.party)};groups.push(g)}g.sheets+=x.r.sheets}
 return {gap,margin,lines,groups,party:j.party,locked:j.status==='Completed'};
}
function planCells(x){
 if(!x.r)return ['—','—','—'];
 if(!x.r.perSheet)return [`<span class="late" title="Choose a larger sheet or reduce the edge margin">Too big</span>`,'—','—'];
 return [`<span title="${esc(x.r.layout)}">${x.r.perSheet}</span>`,`<b>${x.r.sheets}</b>${x.r.sheets>1&&x.r.lastSheet<x.r.perSheet?`<small>last sheet ${x.r.lastSheet} pcs</small>`:''}`,`${x.r.usage}%`];
}
function planSummary(plan){
 if(!plan.groups.length)return '<span>Enter the part size (W × L in inches) and choose the sheet to see how many sheets the order needs.</span>';
 return plan.groups.map(g=>{const name=[materials[g.l.material],g.l.thickness_mm?(matchGauge(g.l.material,g.l.thickness_mm)?.gauge?`${matchGauge(g.l.material,g.l.thickness_mm).gauge} ga`:`${Number(g.l.thickness_mm)} mm`):''].filter(Boolean).join(' ');return `<div class="plan-total"><span><b>${g.sheets} sheet${g.sheets===1?'':'s'}</b> of ${esc(sheetLabel(g.d.w,g.d.l))} ${esc(name||'material')}${g.kg?` · about ${Math.round(g.kg*g.sheets).toLocaleString('en-PK')} kg`:''}</span><span class="${g.stock>=g.sheets?'ok':'short'}">${g.stock?`${g.stock} in stock`:'None in stock'}${g.stock&&g.stock<g.sheets?` · short by ${g.sheets-g.stock}`:''}</span></div>`}).join('');
}
function pdfSheetPlan(j){const pl=jobSheetPlan(j);return {lines:pl.lines.map(x=>({size:Number(x.p.w_in)>0&&Number(x.p.l_in)>0?`${x.p.w_in} x ${x.p.l_in} in`:'',sheet:x.r?.sheets?sheetLabel(x.d.w,x.d.l).replace(/'/g,' ft').replace(/ ft ×/,' ft x'):'',per:x.r?.perSheet?String(x.r.perSheet):'',sheets:x.r?.sheets?String(x.r.sheets):''})),groups:pl.groups.map(g=>`Total: ${g.sheets} sheet${g.sheets===1?'':'s'} of ${sheetLabel(g.d.w,g.d.l).replace(/'/g,' ft').replace(/ ft ×/,' ft x')}${g.kg?` (about ${Math.round(g.kg*g.sheets)} kg)`:''}`)}}
// Drawing of one sheet for a plan line: sheet, edge margin, gaps and every part position (parts needed in
// dark, spare places on the sheet as dashed outlines). Redrawn live as the inputs change.
// Sheet side in inches with feet, e.g. 96" (8 ft); nominal 1220/2440 mm sheets read as 48"/96".
function inchText(mm){const inch=mm/IN,r=Math.abs(inch-Math.round(inch))<0.15?Math.round(inch):Math.round(inch*10)/10,ft=r/12;return `${r}" (${Number.isInteger(ft)?ft:Math.round(ft*10)/10} ft)`}
function planDiagram(x,gap,margin){
 // number and size inside each part, the size only where it fits
 const partLabel=(k,r,cx,cy,numFs)=>{const size=`${x.p.w_in}" × ${x.p.l_in}"`,sf=Math.min(fs*0.8,r.w/(size.length*0.62),r.h*0.28);const both=sf>fs*0.3&&r.h>numFs*2.4;if(numFs<=fs*0.35&&!both)return '';return both?`<text class="pf-num" x="${cx}" y="${cy-sf*0.25}" text-anchor="middle" font-size="${Math.min(numFs,r.h*0.32)}">${k+1}</text><text class="pf-plabel" x="${cx}" y="${cy+sf*1.15}" text-anchor="middle" font-size="${sf}">${esc(size)}</text>`:`<text class="pf-num" x="${cx}" y="${cy+numFs*0.35}" text-anchor="middle" font-size="${numFs}">${k+1}</text>`};
 const title=`<b>#${x.i+1} ${esc(x.l.description||'Part')}</b>`;
 if(!x.r)return `<figure class="plan-fig empty"><figcaption>${title}<span>Enter W × L to see the layout</span></figcaption></figure>`;
 const sw=x.d.w,sl=x.d.l,lay=layoutRects(sw,sl,Number(x.p.w_in)*IN,Number(x.p.l_in)*IN,gap,margin),q=Math.ceil(Number(x.l.quantity)||0);
 const firstSheet=Math.min(q||lay.count,lay.count),pad=Math.max(sl,sw)*0.06,vbW=sl+pad*2.9,vbH=sw+pad*2.6,fs=Math.max(sl,sw)*0.036;
 const hid=`pfh${x.i}`,show=lay.rects.slice(0,1500),numFs=Math.min(fs*0.95,Math.min(...show.map(r=>Math.min(r.w,r.h)))*0.45);
 const parts=show.map((r,k)=>{const used=k<firstSheet,cx=pad+r.x+r.w/2,cy=pad*1.2+r.y+r.h/2;return `<g><title>Part ${k+1}${used?'':' (spare place)'} · ${Math.round(r.w)} × ${Math.round(r.h)} mm${r.turned?' · turned':''}</title><rect class="${used?'pf-part':'pf-spare'}${r.turned?' turned':''}${(k%2)?' alt':''}" x="${pad+r.x}" y="${pad*1.2+r.y}" width="${r.w}" height="${r.h}"/>${used?partLabel(k,r,cx,cy,numFs):''}</g>`}).join('');
 const labelPart='';
 // Offcuts left after cutting: the strip beyond the last part along the sheet, and the strip beside the parts.
 // Sizes are W × L like the parts (W across the sheet, L along it); pieces under 1 inch are ignored.
 const maxX=Math.max(0,...lay.rects.map(r=>r.x+r.w)),maxY=Math.max(0,...lay.rects.map(r=>r.y+r.h)),inch=v=>Math.round(v/IN*10)/10,offcuts=[];
 if(lay.count&&sl-maxX>=IN)offcuts.push({x:maxX,y:0,w:sl-maxX,h:sw});
 if(lay.count&&sw-maxY>=IN)offcuts.push({x:0,y:maxY,w:maxX,h:sw-maxY});
 const offText=o=>`${inch(o.h)}" × ${inch(o.w)}"`;
 // Each offcut outlined, so the cut line between two offcuts is visible.
 const offcutBoxes=offcuts.map(o=>`<rect class="pf-offbox" x="${pad+o.x}" y="${pad*1.2+o.y}" width="${o.w}" height="${o.h}"/>`).join('');
 // Dimension chains like a shop drawing: along the bottom the part lengths then the offcut, down the right side
 // the part widths then the offcut. Many identical parts are shown as one span, e.g. 7 × 10".
 const T=pad*1.2,chain=(spans,along)=>{
  const tick=fs*0.45,out=[];
  for(const sp of spans){const len=sp.b-sp.a;if(len<IN*0.5)continue;const lab=sp.label,tf=Math.min(fs*0.78,len/(lab.length*0.62)),cls=sp.off?'pf-dimline off':'pf-dimline';
   if(along){const y=T+sw+pad*0.55,x1=pad+sp.a,x2=pad+sp.b;out.push(`<g class="${cls}"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/><line x1="${x2}" y1="${y-tick}" x2="${x2}" y2="${y+tick}"/>${tf>fs*0.32?`<text x="${(x1+x2)/2}" y="${y+tf*1.35}" text-anchor="middle" font-size="${tf}">${esc(lab)}</text>`:''}</g>`)}
   else{const x=pad+sl+pad*0.45,y1=T+sp.a,y2=T+sp.b;out.push(`<g class="${cls}"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/><line x1="${x-tick}" y1="${y2}" x2="${x+tick}" y2="${y2}"/>${tf>fs*0.32?`<text x="${x+tf*0.5}" y="${(y1+y2)/2+tf*0.35}" font-size="${tf}">${esc(lab)}</text>`:''}</g>`)}}
  return out.join('');
 };
 const spansOf=(rects,pos,size,limit,total)=>{const minC=Math.min(...lay.rects.map(r=>pos==='x'?r.y:r.x)),line=rects.filter(r=>Math.abs((pos==='x'?r.y:r.x)-minC)<1).sort((a,b)=>a[pos]-b[pos]),sp=[];
  if(line.length>6){const a=line[0][pos],b=Math.max(...line.map(r=>r[pos]+r[size])),n=line.length,each=inch(line[0][size]);sp.push({a,b,label:line.every(r=>Math.abs(r[size]-line[0][size])<1)?`${n} × ${each}"`:`${inch(b-a)}"`})}
  else for(const r of line)sp.push({a:r[pos],b:r[pos]+r[size],label:`${inch(r[size])}"`});
  if(lay.count&&total-limit>=IN)sp.push({a:limit,b:total,label:`${inch(total-limit)}"`,off:true});return sp};
 const dimLines=lay.count?chain(spansOf(lay.rects,'x','w',maxX,sl),true)+chain(spansOf(lay.rects,'y','h',maxY,sw),false):'';
 const offcutSvg=offcuts.map(o=>{const t=offText(o),flat=Math.min(fs*0.85,o.h*0.42,o.w/(t.length*0.62)),up=Math.min(fs*0.85,o.w*0.42,o.h/(t.length*0.62)),turn=flat<fs*0.3&&up>=fs*0.3,f=turn?up:flat;if(f<fs*0.3)return '';const cx=pad+o.x+o.w/2,cy=pad*1.2+o.y+o.h/2,bw=t.length*f*0.6+f;return `<g class="pf-offlabel"${turn?` transform="rotate(-90 ${cx} ${cy})"`:''}><title>Offcut ${t}</title><rect x="${cx-bw/2}" y="${cy-f*0.85}" width="${bw}" height="${f*1.5}" rx="${f*0.3}"/><text x="${cx}" y="${cy+f*0.3}" text-anchor="middle" font-size="${f}">${esc(t)}</text></g>`}).join('');
 const svg=`<svg viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="Sheet layout for part ${x.i+1}">
  <defs><pattern id="${hid}" patternUnits="userSpaceOnUse" width="${fs*0.9}" height="${fs*0.9}" patternTransform="rotate(45)"><rect width="${fs*0.9}" height="${fs*0.9}" fill="#fde7d3"/><line x1="0" y1="0" x2="0" y2="${fs*0.9}" stroke="#ef9a5a" stroke-width="${fs*0.25}"/></pattern></defs>
  <text class="pf-dim" x="${pad+sl/2}" y="${pad*0.8}" text-anchor="middle" font-size="${fs}">${inchText(sl)}</text>
  <text class="pf-dim" x="${pad*0.55}" y="${pad*1.2+sw/2}" text-anchor="middle" font-size="${fs}" transform="rotate(-90 ${pad*0.55} ${pad*1.2+sw/2})">${inchText(sw)}</text>
  <rect class="pf-sheet${margin>0?' has-margin':''}" x="${pad}" y="${pad*1.2}" width="${sl}" height="${sw}" ${margin>0?'':`style="fill:url(#${hid})"`}/>
  ${margin>0?`<rect class="pf-usable" x="${pad+margin}" y="${pad*1.2+margin}" width="${sl-2*margin}" height="${sw-2*margin}" style="fill:url(#${hid})"/>`:''}
  ${parts}${labelPart}${offcutBoxes}${offcutSvg}${dimLines}<rect class="pf-outline" x="${pad}" y="${pad*1.2}" width="${sl}" height="${sw}"/></svg>`;
 const status=!lay.count?`<span class="late">Part does not fit this sheet${margin?` with a ${margin} mm margin`:''} — choose a larger sheet${margin?' or reduce the margin':''}.</span>`:`<span>${lay.count} per sheet · ${x.r.sheets} sheet${x.r.sheets===1?'':'s'} · ${x.r.usage}% used</span>`;
 return `<figure class="plan-fig">${svg}<figcaption>${title}${status}<small>${lay.count?esc(lay.layout):''}${x.r.sheets>1?` · sheet 1 shown; last sheet has ${x.r.lastSheet} pcs`:q&&q<lay.count?` · ${lay.count-q} spare place${lay.count-q===1?'':'s'} on the sheet`:''}</small>${offcuts.length?`<small class="pf-offnote">Offcut${offcuts.length>1?'s':''}: ${offcuts.map(offText).join(' and ')} (W × L)</small>`:''}</figcaption></figure>`;
}
// Every available sheet size for one part, ranked by the least offcut over the whole quantity
// (sheet area bought minus part area), then by fewer sheets.
function sheetSuggestions(x,gap,margin,party){
 const q=Math.ceil(Number(x.l.quantity)||0),pa=Number(x.p.w_in)*Number(x.p.l_in);if(!(pa>0)||!q)return [];
 return sheetOptions(x.p.sheet).map(o=>{const r=planLine({w_in:x.p.w_in,l_in:x.p.l_in,qty:q,sheet_w:o.w,sheet_l:o.l,gap,margin});if(!r?.sheets)return null;const sheetIn=o.w*o.l/(IN*IN),waste=(r.sheets*sheetIn-q*pa)/144;return {o,r,waste:Math.round(waste*10)/10,stock:sheetsInStock(x.l,o.w,o.l,party)}}).filter(Boolean).sort((a,b)=>a.waste-b.waste||a.r.sheets-b.r.sheets);
}
function suggestPanel(x,gap,margin,party,locked){
 const list=sheetSuggestions(x,gap,margin,party);
 if(!list.length)return `<aside class="pf-suggest"><h4>Best sheet</h4><p class="fine">${Number(x.p.w_in)>0&&Number(x.p.l_in)>0?'This part does not fit any standard sheet. Use a custom size.':'Enter the part size to compare sheets.'}</p></aside>`;
 const cur=x.p.sheet,best=list[0],mine=list.find(s=>s.o.id===cur),save=mine&&best.o.id!==cur?Math.round((mine.waste-best.waste)*10)/10:0;
 return `<aside class="pf-suggest"><h4>Best sheet for ${esc(String(Math.ceil(Number(x.l.quantity)||0)))} pcs</h4><ol>${list.slice(0,5).map((s,k)=>`<li class="${k===0?'best':''} ${s.o.id===cur?'current':''}"><div><b>${esc(sheetLabel(s.o.w,s.o.l))}</b>${k===0?' <span class="tag best">Best</span>':''}${s.o.id===cur?' <span class="tag cur">In use</span>':''}<small>${s.r.sheets} sheet${s.r.sheets===1?'':'s'} · ${s.r.perSheet}/sheet · ${s.r.usage}% used</small><small class="${s.waste>0?'waste':''}">${s.waste.toLocaleString('en-PK')} ft² offcut${s.stock?` · ${s.stock} in stock`:''}</small></div>${s.o.id===cur||locked?'':`<button type="button" class="textbutton" data-use-sheet="${x.i}" data-sheet="${esc(s.o.id)}">Use</button>`}</li>`).join('')}</ol>${save>0?`<p class="pf-save">Switching to ${esc(sheetLabel(best.o.w,best.o.l))} saves about <b>${save.toLocaleString('en-PK')} ft²</b> of material.</p>`:mine&&best.o.id===cur?'<p class="pf-ok">You are using the best sheet for this part.</p>':''}<p class="fine">Ranked by least offcut (sheet area bought minus part area), then fewer sheets.</p></aside>`;
}
// Sheet plan inside the quote editor: for every sized line, the sheet layout drawing, the best sheet and the
// material it needs, so the quote can be priced on real sheets. Each line keeps its sheet in a hidden input
// (.linesheet); "Auto" follows the best sheet as sizes change, a chosen sheet stays fixed.
function stockCostFor(l,d){const near=(a,b)=>Math.abs(Number(a)-b)<6,it=stockItems.find(i=>i.category==='sheet'&&i.owner!=='Customer'&&i.material===l.material&&Math.abs(Number(i.thickness_mm)-Number(l.thickness_mm))<0.01&&((near(i.width_mm,d.w)&&near(i.length_mm,d.l))||(near(i.width_mm,d.l)&&near(i.length_mm,d.w)))&&balanceOf(i.id,stockMoves).avg>0);return it?balanceOf(it.id,stockMoves).avg:0}
function quotePlan(){
 const gap=Math.max(0,Number($('[name=qp_gap]')?.value)||0),marginV=$('[name=qp_margin]')?.value,margin=Math.max(0,Number(marginV)||0),party=$('#recordform [name=party]')?.value||'';
 const rows=$$('#lines .lineitem:not(.linehead-row)'),lines=readLines();
 const items=lines.map((l,i)=>{const hid=rows[i]?.querySelector('.linesheet');if(!hid)return null;const auto=hid.dataset.auto==='1';let p={w_in:l.width_in??'',l_in:l.length_in??'',sheet:hid.value||'48x96'};
  if(auto){const best=sheetSuggestions({i,l,p},gap,margin,party)[0];if(best){p.sheet=best.o.id;hid.value=best.o.id}}
  const d=sheetDims(p),r=planLine({w_in:p.w_in,l_in:p.l_in,qty:l.quantity,sheet_w:d.w,sheet_l:d.l,gap,margin});return {i,l,p,d,r,auto}}).filter(x=>x&&Number(x.p.w_in)>0&&Number(x.p.l_in)>0);
 const groups=[];for(const x of items){if(!x.r?.sheets)continue;const key=`${x.l.material}|${x.l.thickness_mm}|${Math.round(x.d.w)}x${Math.round(x.d.l)}`;let g=groups.find(g=>g.key===key);if(!g){g={key,l:x.l,d:x.d,sheets:0,kg:sheetWeightKg({category:'sheet',material:x.l.material,thickness_mm:x.l.thickness_mm,width_mm:x.d.w,length_mm:x.d.l}),stock:sheetsInStock(x.l,x.d.w,x.d.l,party),cost:stockCostFor(x.l,x.d)};groups.push(g)}g.sheets+=x.r.sheets}
 return {gap,margin,lines:items,groups,party,locked:false};
}
function refreshQuotePlan(){
 const body=$('#qp-body');if(!body)return;const plan=quotePlan();
 if(!plan.lines.length){body.innerHTML='<p class="fine" style="margin:6px 0 0">Enter W × L (inches) on a line to see the sheets it needs and the layout.</p>';$('#qp-head').textContent='';return}
 const cost=plan.groups.reduce((n,g)=>n+g.sheets*g.cost,0);
 $('#qp-head').textContent=` · ${plan.groups.map(g=>`${g.sheets} × ${sheetLabel(g.d.w,g.d.l)}`).join(', ')}${cost?` · material ≈ ${money(cost)}`:''}`;
 body.innerHTML=`<div class="summary plan-summary">${planSummary(plan)}${plan.groups.some(g=>g.cost)?`<div class="plan-total"><span>Material at average stock cost</span><b>${money(cost)}</b></div>`:''}</div>
 <ul class="qp-lines">${plan.lines.map(x=>{const best=sheetSuggestions(x,plan.gap,plan.margin,plan.party)[0];return `<li><span>Line ${x.i+1} · ${esc(x.l.description||'Item')} <small>${esc(`${x.p.w_in}" × ${x.p.l_in}"`)} × ${esc(String(x.l.quantity))}</small></span><span>${x.r?.sheets?`<b>${x.r.sheets} × ${esc(sheetLabel(x.d.w,x.d.l))}</b>${x.auto?' <span class="tag">Auto</span>':''} · ${x.r.perSheet}/sheet · ${x.r.usage}%${best&&best.o.id!==x.p.sheet?` · <span class="qp-hint">best: ${esc(sheetLabel(best.o.w,best.o.l))}</span>`:''}`:'<span class="late">Does not fit</span>'}</span></li>`}).join('')}</ul>`;
}
function setQuoteSheet(i,id){const hid=$$('#lines .lineitem:not(.linehead-row)')[i]?.querySelector('.linesheet');if(!hid)return;if(id==='__auto'){hid.dataset.auto='1'}else{hid.dataset.auto='';hid.value=id}refreshQuotePlan()}
function bindQuotePlan(){
 const box=$('#quote-plan');if(!box)return;
 box.addEventListener('change',e=>{const s=e.target.closest('[data-qsheet]');if(s)setQuoteSheet(Number(s.dataset.qsheet),s.value)});
 box.addEventListener('click',e=>{const b=e.target.closest('[data-use-sheet]');if(b)setQuoteSheet(Number(b.dataset.useSheet),b.dataset.sheet)});
 $$('[name=qp_gap],[name=qp_margin]').forEach(i=>i.oninput=refreshQuotePlan);
 $('#qp-open').onclick=()=>openSheetCalculator(true);
 refreshQuotePlan();
}
// Sheet calculator window: floats over the app (drag by the title bar, resize from the corner, minimise,
// maximise) or pops out into its own browser window. When opened from a quote, "Apply to quote" writes the
// items back into the quote's lines; the pop-out sends them back over a BroadcastChannel.
let calcWin=null,calcToken='';
function stockSnapshot(){return stockItems.filter(i=>i.category==='sheet'&&i.owner!=='Customer').map(i=>{const b=balanceOf(i.id,stockMoves);return {material:i.material,thickness_mm:Number(i.thickness_mm),w:Math.min(+i.width_mm,+i.length_mm),l:Math.max(+i.width_mm,+i.length_mm),count:Math.max(0,b.qty),cost:b.avg}}).filter(s=>s.w>0&&s.l>0)}
function calcInitFromQuote(){
 const rows=$$('#lines .lineitem:not(.linehead-row)');
 return {rows:readLines().map((l,i)=>{const h=rows[i]?.querySelector('.linesheet');return {description:l.description,qty:Number(l.quantity)||1,material:l.material||'steel',thickness_mm:l.thickness_mm??null,w_in:l.width_in??'',l_in:l.length_in??'',sheet:!h||h.dataset.auto==='1'||!h.value?'auto':h.value}}),gap:Number($('[name=qp_gap]')?.value??5),margin:Number($('[name=qp_margin]')?.value??0)};
}
function openSheetCalculator(fromQuote){
 const linked=!!fromQuote&&!!$('#recordform[data-kind="quote"]');
 const init={...(linked?calcInitFromQuote():{rows:[],gap:5,margin:0}),stock:stockSnapshot(),extraSheets:sheetOptions('').filter(o=>!sheetPresets.some(p=>p.id===o.id))};
 calcToken=linked?crypto.randomUUID():'';
 calcWin?.remove();
 const host=$('#modal').open?$('#modal'):document.body;
 calcWin=document.createElement('div');calcWin.className='floatwin';calcWin.setAttribute('role','dialog');calcWin.setAttribute('aria-label','Sheet calculator');
 calcWin.innerHTML=`<div class="fw-head"><b>Sheet calculator</b><span class="fw-sub">${linked?'linked to this quote':'standalone'}</span><span class="fw-btns"><button type="button" data-fw="pop" title="Open in a separate browser window">⧉ Pop out</button><button type="button" data-fw="min" title="Minimise">–</button><button type="button" data-fw="max" title="Maximise">□</button><button type="button" data-fw="close" title="Close">×</button></span></div><div class="fw-body"></div>`;
 host.appendChild(calcWin);
 const api=mountCalculator(calcWin.querySelector('.fw-body'),{...init,onApply:linked?s=>applyCalcToQuote(s):null});
 const win=calcWin,head=win.querySelector('.fw-head');
 head.addEventListener('pointerdown',e=>{if(e.target.closest('button')||win.classList.contains('max'))return;const r=win.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;head.setPointerCapture(e.pointerId);const move=ev=>{win.style.left=Math.max(0,Math.min(innerWidth-120,ev.clientX-dx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-40,ev.clientY-dy))+'px';win.style.right='auto'};const up=()=>{head.removeEventListener('pointermove',move);head.removeEventListener('pointerup',up)};head.addEventListener('pointermove',move);head.addEventListener('pointerup',up)});
 head.addEventListener('click',e=>{const b=e.target.closest('[data-fw]');if(!b)return;const a=b.dataset.fw;
  if(a==='close'){win.remove();if(calcWin===win)calcWin=null}
  else if(a==='min'){win.classList.toggle('min');win.classList.remove('max')}
  else if(a==='max'){win.classList.toggle('max');win.classList.remove('min')}
  else if(a==='pop'){const s=api.state();try{localStorage.setItem('gr-sheet-calc',JSON.stringify({token:calcToken||crypto.randomUUID(),linked,init:{rows:s.rows.map(({resolved_sheet,sheets,suggested_rate,...r})=>r),gap:s.gap,margin:s.margin,rotate:s.rotate,goal:s.goal,sizes:s.sizes,custom:s.custom,rates:s.rates,markup:s.markup,cutRate:s.cutRate,stock:init.stock,extraSheets:init.extraSheets},company:company.name}))}catch{}
   const tok=JSON.parse(localStorage.getItem('gr-sheet-calc')||'{}').token;const w=window.open(`calculator.html?v=calc-2#${tok}`,'gr-sheet-calc','width=1320,height=880');if(!w){toast('Allow pop-ups for this site to open the calculator in its own window.');return}calcToken=tok;win.remove();if(calcWin===win)calcWin=null;toast(linked?'Calculator opened in its own window. Apply from there to update this quote.':'Calculator opened in its own window.')}
 });
}
function applyCalcToQuote(s){
 if(!$('#recordform[data-kind="quote"]')||!$('#lines')){toast('Open the quotation, then apply the sheet plan again.');return}
 let rows=$$('#lines .lineitem:not(.linehead-row)');
 s.rows.forEach((r,i)=>{
  if(!rows[i]){$('#addline').click();rows=$$('#lines .lineitem:not(.linehead-row)')}
  const el=rows[i],set=(sel,v)=>{const x=el.querySelector(sel);if(x&&v!==undefined&&v!==null)x.value=v};
  if(String(r.description||'').trim())set('.linedesc',r.description);
  set('.lineqty',r.qty);
  const mat=el.querySelector('.linematerial');if(mat&&r.material){mat.value=r.material;updateGauge(el,'material')}
  const mm=el.querySelector('.linemm');if(mm){mm.value=r.thickness_mm??'';updateGauge(el,'mm')}
  set('.linew',r.w_in);set('.linel',r.l_in);
  const h=el.querySelector('.linesheet');if(h){if(r.sheet==='auto'){h.dataset.auto='1';h.value=r.resolved_sheet||h.value}else{h.dataset.auto='';h.value=r.sheet}}
  if(s.applyRates&&r.suggested_rate)set('.linerate',r.suggested_rate);
 });
 if($('[name=qp_gap]'))$('[name=qp_gap]').value=s.gap;if($('[name=qp_margin]'))$('[name=qp_margin]').value=s.margin;
 updateTotal();toast(`Sheet plan applied to ${s.rows.length} line${s.rows.length===1?'':'s'}${s.applyRates?' with suggested rates':''}. Save the quote to keep it.`);
}
function planDiagrams(plan){return `<div class="plan-legend"><span><i class="pf-part"></i>Part (numbered)</span><span><i class="pf-part turned"></i>Turned part</span><span><i class="pf-spare"></i>Spare place</span><span><i class="pf-offcut"></i>Unused / offcut</span><span><i class="pf-margin"></i>Edge margin</span></div><div class="plan-figs">${plan.lines.map(x=>`<div class="plan-row">${planDiagram(x,plan.gap,plan.margin)}${suggestPanel(x,plan.gap,plan.margin,plan.party,plan.locked)}</div>`).join('')}</div>`}
function sheetPlanBlock(j,q,locked){
 const plan=jobSheetPlan(j),dis=locked?'disabled':'';
 return `<div class="linehead" style="margin-top:24px">SHEET PLAN</div><div class="tablewrap"><table class="parts-table plan-table"><thead><tr><th>#</th><th>PART</th><th>MATERIAL</th><th class="money">QTY</th><th>PART SIZE W × L (IN)</th><th>CUT FROM SHEET</th><th class="money">PCS / SHEET</th><th class="money">SHEETS NEEDED</th><th class="money">SHEET USE</th></tr></thead><tbody>${plan.lines.map(x=>{const c=planCells(x),g=x.l.thickness_mm?matchGauge(x.l.material,x.l.thickness_mm):null;return `<tr><td>${x.i+1}</td><td>${esc(x.l.description)}</td><td>${x.l.material?`${esc(materials[x.l.material]||'')}${x.l.thickness_mm?` · ${g?`${g.gauge} ga`:`${Number(x.l.thickness_mm)} mm`}`:''}`:'<span class="fine">Set in quote</span>'}</td><td class="money">${esc(x.l.quantity)}</td>
  <td><span class="part-size"><input type="number" min="0.1" max="2000" step="any" data-plan-w="${x.i}" value="${esc(x.p.w_in)}" aria-label="Part ${x.i+1} width in inches" placeholder="W" ${dis}> × <input type="number" min="0.1" max="2000" step="any" data-plan-l="${x.i}" value="${esc(x.p.l_in)}" aria-label="Part ${x.i+1} length in inches" placeholder="L" ${dis}></span></td>
  <td><select data-plan-sheet="${x.i}" aria-label="Sheet for part ${x.i+1}" ${dis}>${sheetOptions(x.p.sheet).map(o=>`<option value="${o.id}" title="${esc(o.label)}" ${o.id===x.p.sheet?'selected':''}>${esc(o.label)}</option>`).join('')}<option value="custom" ${x.p.sheet==='custom'?'selected':''}>Custom (ft)…</option></select><span class="part-size plan-custom" data-plan-custom="${x.i}" ${x.p.sheet==='custom'?'':'hidden'}><input type="number" min="0.5" max="100" step="any" data-plan-sw="${x.i}" value="${esc(x.p.sw_ft)}" placeholder="W ft" aria-label="Sheet width in feet" ${dis}> × <input type="number" min="0.5" max="100" step="any" data-plan-sl="${x.i}" value="${esc(x.p.sl_ft)}" placeholder="L ft" aria-label="Sheet length in feet" ${dis}></span></td>
  <td class="money" data-plan-per="${x.i}">${c[0]}</td><td class="money" data-plan-sheets="${x.i}">${c[1]}</td><td class="money" data-plan-use="${x.i}">${c[2]}</td></tr>`}).join('')}</tbody></table></div>
 <div class="plan-foot"><label class="row">Gap between parts <input type="number" name="plan_gap" min="0" max="100" step="0.5" value="${esc(plan.gap)}" ${dis}> mm</label><label class="row">Edge margin <input type="number" name="plan_margin" min="0" max="100" step="0.5" value="${esc(plan.margin)}" ${dis}> mm</label></div>
 <div class="summary plan-summary" id="plan-summary">${planSummary(plan)}</div>
 <div class="plan-diagrams" id="plan-diagrams">${planDiagrams(plan)}</div>
 <p class="help">Estimate for rectangular blanks laid out in rows, trying both directions and filling the leftover strip with turned parts. The drawing shows sheet 1 to scale; hover a part for its size. Nesting software can fit more for irregular shapes. Scrap is not calculated for now.</p>`;
}
function readSheetPlan(){
 const lines={},parts={};
 $$('[data-plan-w]').forEach(el=>{const i=el.dataset.planW,v=k=>$(`[data-plan-${k}="${i}"]`)?.value??'',w=v('w'),l=v('l');lines[i]={w_in:w===''?'':Number(w),l_in:l===''?'':Number(l),sheet:v('sheet'),sw_ft:v('sw')===''?'':Number(v('sw')),sl_ft:v('sl')===''?'':Number(v('sl'))};if(Number(w)>0&&Number(l)>0)parts[i]={length:Math.round(Number(l)*IN*10)/10,width:Math.round(Number(w)*IN*10)/10}});
 const num=(n,d)=>{const v=$(`[name=${n}]`)?.value;return v===''||v==null?d:Math.max(0,Number(v)||0)};
 return {sheet_plan:{gap:num('plan_gap',5),margin:num('plan_margin',0),lines},parts};
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
 const {sheet_plan,parts}=readSheetPlan();
 const op=employees.find(e=>e.id===data.operator_id);
 return {...base,due_date:data.due_date||'',priority:data.priority||'Normal',operator_id:data.operator_id||'',operator_name:op?.name||'',machine:(data.machine||'').trim(),...legacyFromScope(scopeOf(workOrders.find(x=>x.id===j.id)||j)),est_minutes:Number(data.est_minutes)||0,parts,sheet_plan,...('consumed_kg_manual' in data?{consumed_kg_manual:data.consumed_kg_manual===''?'':Number(data.consumed_kg_manual)}:{})};
}
function saveJobLocally(j,data){const next={...j,...data};workOrders=workOrders.map(x=>x.id===j.id?next:x);return next}
function bindJobCard(j){
 if(!j)return;const id=j.id;
 $('[data-jobs-back]').onclick=()=>{jobView=null;render()};
 $('#job-pdf').onclick=()=>downloadJobCard(workOrders.find(x=>x.id===id),$('#job-pdf'));
 if($('#job-delete'))$('#job-delete').onclick=()=>confirmWorkOrderDelete(id);
 if($('#job-invoice'))$('#job-invoice').onclick=()=>invoiceFromQuote({...j.quote_snapshot,id:j.quote_id});
 // live part weights and scrap while typing
 const recalc=()=>{if(session)return;const draft={...j,...readSheetPlan()},plan=jobSheetPlan(draft);plan.lines.forEach(x=>{const c=planCells(x);[['per',0],['sheets',1],['use',2]].forEach(([k,n])=>{const cell=$(`[data-plan-${k}="${x.i}"]`);if(cell)cell.innerHTML=c[n]});const cu=$(`[data-plan-custom="${x.i}"]`);if(cu)cu.hidden=x.p.sheet!=='custom'});$('#plan-summary').innerHTML=planSummary(plan);$('#plan-diagrams').innerHTML=planDiagrams(plan)};
 const hints=()=>{const f=$('#job-form');if(!f||!$('#job-hints'))return;$('#job-hints').innerHTML=jobHints({...j,due_date:f.elements.due_date?.value||'',est_minutes:f.elements.est_minutes?.value||0,cutting_minutes:f.elements.cutting_minutes?.value||0})};
 const grow=t=>{t.style.height='auto';t.style.height=Math.min(t.scrollHeight+2,320)+'px'};$$('#job-form textarea.autogrow').forEach(grow);
 $('#job-form').addEventListener('input',e=>{if(e.target.matches('textarea.autogrow'))grow(e.target);if(['due_date','est_minutes','cutting_minutes'].includes(e.target.name))hints()});
 if($('#plan-summary')){$('#job-form').oninput=recalc;$('#job-form').onchange=recalc}
 if($('#plan-diagrams'))$('#plan-diagrams').onclick=e=>{const b=e.target.closest('[data-use-sheet]');if(!b)return;const sel=$(`[data-plan-sheet="${b.dataset.useSheet}"]`);if(!sel)return;if(![...sel.options].some(o=>o.value===b.dataset.sheet))sel.insertAdjacentHTML('afterbegin',`<option value="${esc(b.dataset.sheet)}">${esc(b.dataset.sheet)}</option>`);sel.value=b.dataset.sheet;recalc();toast('Sheet changed. Save the job to keep it.')};
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
  const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const tasks=scopeOf(j).filter(t=>t.status!=='Not required').map(t=>t.name);if(!tasks.some(t=>/deliver|dispatch/i.test(t)))tasks.push('Dispatched / collected');
  const bytes=await createJobCardPDF(j,jobQuote(j),rows,new Uint8Array(await response.arrayBuffer()),window.PDFLib,{company,stages:tasks,sheetPlan:pdfSheetPlan(j)});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`GR-Synergy-Job-Card-${j.reference}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Job card downloaded. Print it for the workshop.');
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
  <td><select data-grn-item aria-label="Stock item for line ${index+1}"><option value="">Choose stock item</option>${proposal&&!match?`<option value="__new" selected>＋ New stock item: ${esc(itemLabel(proposal))}</option>`:''}${items.map(i=>`<option value="${esc(i.id)}" ${match?.id===i.id?'selected':''}>${esc(i.code)} · ${esc(itemLabel(i))}</option>`).join('')}<option value="__skip">Not received now</option></select>${match?'<small class="grn-hint ok">Matched to existing stock</small>':proposal?'<small class="grn-hint new">New size: a stock item will be created</small>':'<small>Not recognised. Choose an item, or add it with ＋ Stock item.</small>'}</td>
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
  const refs=[],created=[];
  for(const p of plan){
   if(p.isNew){const same=matchStockItem(po.lines[p.index],stockItems.filter(i=>i.owner==='Business'));if(same)p.item=same;else{validateItem(p.item,stockItems);p.item.code=itemCode(p.item,stockItems);stockItems.push(p.item);created.push(p.item.code)}}
   const consumable=p.item.category==='consumable';
   refs.push(addStockMove({item_id:p.item.id,type:'receipt',date,quantity:p.q,unit_cost:Math.round(p.cost/p.q*100)/100,value:consumable?0:p.cost,amount:consumable?p.cost:0,po_id:po.id,po_reference:po.reference,po_line:p.index,line_complete:p.complete,party:po.party,doc_reference:f.doc_reference.value.trim(),notes:''}).reference);
  }
  const done=!poReceiptStatus(po,stockMoves).pending;if(done)po.status='Received';
  $('#modal').close();render();toast(`${po.reference}: ${refs.join(', ')} received into stock.${created.length?` New stock item${created.length===1?'':'s'}: ${created.join(', ')}.`:''}${done?' Purchase order fully received.':' Remaining lines stay on the list.'} Post them in Accounts → Journal.`);
 }catch(err){$('#stock-error').textContent=err.message}};
}

// Scope of work: the job's own task list, changed with one click and saved straight away.
// Scope of work as a matrix: one row per quote line, one column per task. Each cell is a status chip (click to
// change it, with a % for work in progress); the job-level tasks are derived from the lines (deriveScope), so the
// stage track, completion check, overview and job card PDF keep working.
let scopeEdit=false;
const cellText=c=>c.status==='Done'?'✓':c.status==='In progress'?`${taskProgress(c)}%`:c.status==='Not required'?'N/A':'—';
const cellClass=c=>({Pending:'pending','In progress':'active',Done:'done','Not required':'na'})[c.status]||'pending';
// Small live hints under the job details: due date countdown, cutting time against the estimate.
function jobHints(j){
 const out=[],d=j.due_date?daysUntil(j.due_date):null;
 if(d!==null&&j.status!=='Completed')out.push(d<0?`<span class="hint late">Due ${-d} day${d===-1?'':'s'} ago</span>`:d===0?'<span class="hint soon">Due today</span>':`<span class="hint ${d<=2?'soon':''}">Due in ${d} day${d===1?'':'s'}</span>`);
 const est=Number(j.est_minutes)||0,act=Number(j.cutting_minutes)||0;
 if(est&&act){const pct=Math.round((act-est)/est*100);out.push(`<span class="hint ${pct>10?'late':pct<0?'good':''}">Cutting ${act} of ${est} min estimated${pct?` · ${pct>0?'+':''}${pct}%`:''}</span>`)}else if(est)out.push(`<span class="hint">Estimated cutting ${est} min (${Math.round(est/60*10)/10} h)</span>`);
 if(Number(company.machine_rate)&&(act||est))out.push(`<span class="hint">Machine cost ≈ ${money(Math.round(Number(company.machine_rate)*(act||est)/60))}${act?'':' (estimate)'}</span>`);
 return out.join('');
}
function scopeCard(j,locked){
 const scope=scopeOf(j),q=jobQuote(j),qLines=q.lines?.length?q.lines:[{description:q.description||'Job',quantity:''}],n=qLines.length,sl=j.scope_lines;
 const done=scope.filter(t=>t.status==='Done').length,applicable=scope.filter(t=>t.status!=='Not required').length,total=scopeProgress(scope);
 const staff=employees.filter(e=>employedOn(e,today())).sort((a,b)=>a.name.localeCompare(b.name));
 const missing=standardTasks.filter(([key])=>!scope.some(t=>t.key===key)).map(([,name])=>name);
 const chip=(c,li,t,extra='')=>`<button type="button" class="sc-cell ${cellClass(c)}" data-cell="${li}|${esc(t.id)}" ${locked?'disabled':''} title="${esc(t.name)}: ${esc(c.status==='Not required'?'N/A':c.status)}${c.status==='In progress'?` ${taskProgress(c)}%`:''}${c.done_at?` · done ${esc(c.done_at)}`:''}${extra}"><span>${cellText(c)}</span>${c.status==='In progress'?`<i style="width:${taskProgress(c)}%"></i>`:''}</button>`;
 const pieceChip=(c,li,t,d,qn,note,warn)=>`<button type="button" class="sc-cell ${cellClass(c)} pcs${warn?' warn':''}" data-cell="${li}|${esc(t.id)}" ${locked?'disabled':''} title="${esc(t.name)}: ${d} of ${qn} pieces done${c.done_at?` · completed ${esc(c.done_at)}`:''}${esc(note)}"><span>${c.status==='Done'?`✓ ${qn}/${qn}`:`${d}/${qn}`}${warn?' !':''}</span>${c.status==='In progress'?`<i style="width:${Math.round(d/qn*100)}%"></i>`:''}</button>`;
 const bar=p=>`<span class="sm-bar ${p===100?'full':''}"><i style="width:${p}%"></i></span><b>${p}%</b>`;
 const lineInfo=l=>[l.quantity?`${l.quantity} ${l.unit||'pcs'}`:'',Number(l.width_in)&&Number(l.length_in)?`${l.width_in}" × ${l.length_in}"`:'',l.material?`${materials[l.material]||''}${l.thickness_mm?' '+(matchGauge(l.material,l.thickness_mm)?.gauge?matchGauge(l.material,l.thickness_mm).gauge+' ga':Number(l.thickness_mm)+' mm'):''}`:''].filter(Boolean).join(' · ');
 return `<section class="card scope-card scope-matrix-card" style="margin-bottom:24px"><div class="cardhead"><div><h2>Scope of work</h2><p class="sub" style="margin-top:6px"><b>${total}% complete</b> · ${done} of ${applicable} task${applicable===1?'':'s'} done${n>1?` · ${n} line items`:''}${scope.length>applicable?` · ${scope.length-applicable} not required`:''}</p><div class="job-progress" aria-hidden="true"><i style="width:${total}%"></i></div></div>
 ${locked?'':`<div class="row scope-add"><select id="scope-add" aria-label="Task to add"><option value="">Add a task…</option>${[...missing,...extraTasks.filter(x=>!scope.some(t=>t.name===x))].map(x=>`<option>${esc(x)}</option>`).join('')}<option value="__custom">Custom task…</option></select><input id="scope-custom" type="text" maxlength="60" placeholder="Task name" hidden><button type="button" id="scope-add-btn">＋ Add</button><button type="button" id="scope-edit" class="${scopeEdit?'on':''}">${scopeEdit?'Done editing':'Edit tasks'}</button></div>`}</div>
 <div class="tablewrap"><table class="scope-matrix"><thead><tr><th class="sm-line">LINE ITEM</th>${scope.map((t,k)=>`<th class="sm-task">${esc(t.name)}${scopeEdit&&!locked?`<span class="sm-tools"><button type="button" data-task-move="${esc(t.id)}" data-dir="-1" ${k===0?'disabled':''} aria-label="Move ${esc(t.name)} left">‹</button><button type="button" data-task-move="${esc(t.id)}" data-dir="1" ${k===scope.length-1?'disabled':''} aria-label="Move ${esc(t.name)} right">›</button><button type="button" data-task-remove="${esc(t.id)}" ${scope.length===1?'disabled':''} aria-label="Remove ${esc(t.name)}">×</button></span>`:''}</th>`).join('')}<th class="sm-prog">PROGRESS</th></tr></thead><tbody>
 ${qLines.map((l,li)=>{let prev=null;const qn=Math.ceil(Number(l.quantity)||1);return `<tr><td class="sm-line"><b>${li+1}. ${esc(l.description||'Item')}</b><small>${esc(lineInfo(l))}</small></td>${scope.map(t=>{const c=lineCell(sl,li,t);if(!countsPieces(t,l.quantity)||c.status==='Not required')return `<td>${chip(c,li,t)}</td>`;const d=piecesDone(c,qn),warn=prev!=null&&d>prev.d;const out=`<td>${pieceChip(c,li,t,d,qn,warn?` · only ${prev.d} of ${qn} through ${prev.name}`:'',warn)}</td>`;prev={d,name:t.name};return out}).join('')}<td class="sm-prog">${bar(lineProgress(scope,sl,li))}</td></tr>`}).join('')}
 ${n>1?`<tr class="sm-all"><td class="sm-line"><b>All lines</b><small>Click to set a task on every line</small></td>${scope.map(t=>`<td>${chip(t,'all',t,' (all lines)')}</td>`).join('')}<td class="sm-prog">${bar(total)}</td></tr>`:''}
 <tr class="sm-who"><td class="sm-line"><small>Assigned to</small></td>${scope.map(t=>`<td><select data-task-who="${esc(t.id)}" aria-label="${esc(t.name)} assigned to" ${locked?'disabled':''}><option value="">—</option>${staff.map(e=>`<option value="${esc(e.id)}" ${e.id===t.assignee_id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></td>`).join('')}<td></td></tr>
 </tbody></table></div>
 <div class="sm-legend"><span class="sc-cell pending"><span>—</span></span>Pending<span class="sc-cell active"><span>50%</span><i style="width:50%"></i></span>In progress<span class="sc-cell done"><span>✓</span></span>Done<span class="sc-cell na"><span>N/A</span></span>Not required<span class="fine">· Click a cell to change it.</span></div>
 <div class="sm-pop" id="sm-pop" hidden></div></section>`;
}
function bindScope(j){
 const id=j.id;
 // keep unsaved form entries, then apply the change to the line cells, derive the job-level tasks and save
 const change=fn=>{let cur=workOrders.find(x=>x.id===id);if(cur.status!=='Completed')cur=saveJobLocally(cur,readJobForm(cur));const n=Math.max(1,jobQuote(cur).lines?.length||1);let scope=scopeOf(cur).map(t=>({...t})),lines=materializeLines(scope,cur.scope_lines,n);({scope,lines}=fn({scope,lines}));scope=deriveScope(scope,lines,n);saveJobLocally(cur,{scope,scope_lines:lines,...legacyFromScope(scope)});render()};
 const qtyOf=li=>jobQuote(workOrders.find(x=>x.id===id)).lines?.[li]?.quantity;
 const setCell=(target,taskId,status,progress)=>change(({scope,lines})=>{const task=scope.find(t=>t.id===taskId);for(const li of Object.keys(lines)){if(target!=='all'&&String(li)!==String(target))continue;const c=lines[li][taskId]||{status:'Pending',progress:0};const p=status==='Done'?100:status==='In progress'?(progress!=null?progress:(c.progress>0&&c.progress<100?c.progress:10)):0,qty=qtyOf(li);if(task&&countsPieces(task,qty)&&status!=='Not required'){lines[li][taskId]=cellFromCount(c,status==='Done'?qty:status==='Pending'?0:Math.max(1,Math.round(p*Math.ceil(qty)/100)),qty,today());continue}lines[li][taskId]=p>=100&&status==='In progress'?{status:'Done',progress:100,done_at:c.done_at||today()}:{status,progress:p,done_at:status==='Done'?(c.done_at||today()):''}}return {scope,lines}});
 const setCount=(li,taskId,n)=>change(({scope,lines})=>{lines[li][taskId]=cellFromCount(lines[li][taskId],n,qtyOf(li),today());return {scope,lines}});
 const pop=$('#sm-pop'),card=$('.scope-matrix-card');
 const closePop=()=>{pop.hidden=true;pop.innerHTML=''};
 $$('[data-cell]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [li,taskId]=b.dataset.cell.split('|'),task=scopeOf(workOrders.find(x=>x.id===id)).find(t=>t.id===taskId);if(!task)return;const cur=workOrders.find(x=>x.id===id),c=li==='all'?task:lineCell(cur.scope_lines,Number(li),task),p=taskProgress(c);
  const qn=li==='all'?0:Math.ceil(Number(qtyOf(li))||1);
  if(li!=='all'&&countsPieces(task,qtyOf(li))){const d=c.status==='Not required'?0:piecesDone(c,qn);
   pop.innerHTML=`<div class="sm-pop-head">${esc(task.name)} · line ${Number(li)+1} · ${qn} pcs</div><div class="sm-count"><button type="button" data-cnt="-1" aria-label="One less">−</button><input type="number" min="0" max="${qn}" step="1" value="${d}" data-cnt-val aria-label="Pieces done"><span>of ${qn} pcs done</span><button type="button" data-cnt="1" aria-label="One more">＋</button></div><div class="sm-count-actions"><button type="button" class="primary" data-cnt-save>Save</button><button type="button" data-cnt-all>All ${qn} done</button><button type="button" data-pop-status="Not required" class="${c.status==='Not required'?'on not-required':''}">N/A</button></div>`;
   const br=b.getBoundingClientRect(),cr=card.getBoundingClientRect();pop.style.left=Math.max(8,Math.min(cr.width-300,br.left-cr.left-110))+'px';pop.style.top=(br.bottom-cr.top+6)+'px';pop.hidden=false;
   const v=pop.querySelector('[data-cnt-val]'),clamp=n=>Math.max(0,Math.min(qn,Math.round(Number(n)||0)));v.focus();v.select();
   pop.querySelectorAll('[data-cnt]').forEach(x=>x.onclick=()=>{v.value=clamp(Number(v.value)+Number(x.dataset.cnt))});
   const save=()=>{closePop();setCount(li,taskId,clamp(v.value))};pop.querySelector('[data-cnt-save]').onclick=save;v.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();save()}};
   pop.querySelector('[data-cnt-all]').onclick=()=>{closePop();setCount(li,taskId,qn)};
   pop.querySelector('[data-pop-status]').onclick=()=>{closePop();setCell(li,taskId,'Not required')};
   return;
  }
  pop.innerHTML=`<div class="sm-pop-head">${esc(task.name)} · ${li==='all'?'all lines':`line ${Number(li)+1}`}</div><div class="seg">${taskStatuses.map(s=>`<button type="button" data-pop-status="${s}" class="${c.status===s?'on '+s.toLowerCase().replace(/ /g,'-'):''}">${s==='Not required'?'N/A':s}</button>`).join('')}</div><label class="sm-pop-range">Progress <input type="range" min="0" max="100" step="5" value="${c.status==='In progress'?p:c.status==='Done'?100:0}" data-pop-range><output>${c.status==='In progress'?p:c.status==='Done'?100:0}%</output></label>`;
  const br=b.getBoundingClientRect(),cr=card.getBoundingClientRect();pop.style.left=Math.max(8,Math.min(cr.width-300,br.left-cr.left-110))+'px';pop.style.top=(br.bottom-cr.top+6)+'px';pop.hidden=false;
  pop.querySelectorAll('[data-pop-status]').forEach(x=>x.onclick=()=>{closePop();setCell(li,taskId,x.dataset.popStatus)});
  const r=pop.querySelector('[data-pop-range]');r.oninput=()=>r.nextElementSibling.textContent=r.value+'%';r.onchange=()=>{closePop();const v=Number(r.value);setCell(li,taskId,v>=100?'Done':v<=0?'Pending':'In progress',v)};
 });
 pop.onclick=e=>e.stopPropagation();document.addEventListener('click',closePop,{once:true});
 $$('[data-task-who]').forEach(sel=>sel.onchange=()=>change(({scope,lines})=>({scope:scope.map(t=>t.id===sel.dataset.taskWho?{...t,assignee_id:sel.value,assignee_name:empById(sel.value)?.name||''}:t),lines})));
 $$('[data-task-move]').forEach(b=>b.onclick=()=>change(({scope,lines})=>{const i=scope.findIndex(t=>t.id===b.dataset.taskMove),k=i+Number(b.dataset.dir);if(k>=0&&k<scope.length)[scope[i],scope[k]]=[scope[k],scope[i]];return {scope,lines}}));
 $$('[data-task-remove]').forEach(b=>b.onclick=()=>change(({scope,lines})=>({scope:scope.length>1?scope.filter(t=>t.id!==b.dataset.taskRemove):scope,lines})));
 if(!$('#scope-add'))return;
 $('#scope-edit').onclick=()=>{scopeEdit=!scopeEdit;render()};
 $('#scope-add').onchange=()=>{$('#scope-custom').hidden=$('#scope-add').value!=='__custom';if(!$('#scope-custom').hidden)$('#scope-custom').focus()};
 $('#scope-add-btn').onclick=()=>{
  const pick=$('#scope-add').value,name=(pick==='__custom'?$('#scope-custom').value:pick).trim();
  if(!name){toast(pick==='__custom'?'Type the task name.':'Choose a task to add.');return}
  const std=standardTasks.find(([,x])=>x===name);
  change(({scope,lines})=>{if(scope.some(t=>t.name.toLowerCase()===name.toLowerCase()))return {scope,lines};const t={id:std?std[0]:crypto.randomUUID(),key:std?std[0]:'',name,status:'Pending'};for(const li of Object.keys(lines))lines[li][t.id]={status:'Pending',progress:0,done_at:''};return {scope:[...scope,t],lines}});toast(`${name} added to every line.`);
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
 const viewing=partyView&&partyList(kind).find(c=>c.id===partyView);if(viewing)return partyProfile(kind,viewing);partyView=null;
 const m=partyMeta(kind),list=partyList(kind),active=list.filter(c=>c.status!=='Inactive');
 const extra=kind==='customers'?stat('Receivable',money(active.reduce((n,c)=>n+customerBalance(c.name),0)),'Outstanding on invoices','accounts')+stat('With NTN / STRN',String(active.filter(c=>c.ntn||c.strn).length),'For sales tax invoices','accounts'):(()=>{const owed=list.map(v=>({v,...partyOwed('vendors',v)})).filter(x=>x.due>0),late=owed.filter(x=>x.overdue>0);return stat('Payable to vendors',money(owed.reduce((n,x)=>n+x.due,0)),owed.length?`${owed.length} vendor${owed.length===1?'':'s'} to pay`:'Nothing owed','accounts')+stat('Overdue payables',money(late.reduce((n,x)=>n+x.overdue,0)),late.length?`<span class="kpi-warn">${late.length} vendor${late.length===1?'':'s'} past due</span>`:'Nothing past due','accounts')})()+stat('Open purchase orders',money(active.reduce((n,c)=>n+vendorOpenPOs(c.name).value,0)),'Draft and ordered','procurement');
 return `<div class="heading"><div><div class="eyebrow">${m.eyebrow}</div><h1>${m.title}</h1><p class="sub">${m.sub}</p></div><button class="primary" id="party-add">＋ Add ${m.one}</button></div>
 <div class="stats">${stat(`Active ${m.title.toLowerCase()}`,String(active.length),`${list.length-active.length} inactive`,kind)}${kind==='customers'?stat('Cities',String(new Set(active.map(c=>c.city).filter(Boolean)).size),'Where they are based',kind):''}${extra}</div>
 <div class="chips">${['Active','Inactive','All',kind==='customers'?'To collect':'To pay'].map(k=>`<button class="chip ${partyFilter===k?'selected':''} ${k.startsWith('To ')?'chip-owed':''}" data-party-filter="${k}">${k} <span>${k==='All'?list.length:k==='Active'?active.length:k.startsWith('To ')?list.filter(c=>partyOwed(kind,c).due>0).length:list.length-active.length}</span></button>`).join('')}</div>
 <section class="card"><div class="toolbar"><input id="party-search" class="search" type="search" placeholder="Search name, code, contact, city, phone, NTN…" aria-label="Search ${m.title.toLowerCase()}"><button id="party-csv">Export CSV</button></div><div id="party-rows">${partyRows(kind,'')}</div></section>
 <p class="help">${session?'Name, contact, phone, email and address are saved to Supabase; other details are kept in this browser only.':'Saved in this browser and included in backups.'} Editing or deleting does not change existing quotes, invoices or purchase orders, which keep the name they were issued with.</p>`;
}
// What a customer owes us / what we owe a vendor, with the overdue part.
function partyOwed(kind,c){const a=partyAccount(kind,c);return {due:Math.max(0,a.balance),overdue:a.age.overdue}}
function partyRows(kind,term){
 const t=term.trim().toLowerCase(),owedMode=partyFilter.startsWith('To '),list=partyList(kind).filter(c=>partyFilter==='All'||(owedMode?partyOwed(kind,c).due>0:(partyFilter==='Inactive')===(c.status==='Inactive'))).filter(c=>[c.code,c.name,c.contact,c.city,c.phone,c.mobile,c.email,c.ntn,c.strn,c.supply_category].join(' ').toLowerCase().includes(t)).sort((a,b)=>owedMode?partyOwed(kind,b).due-partyOwed(kind,a).due:a.name.localeCompare(b.name));
 if(!list.length)return `<div class="empty">${t?'No matches.':owedMode?(kind==='customers'?'No customer owes you anything.':'You owe no vendor anything.'):`No ${partyMeta(kind).title.toLowerCase()} here yet.`}</div>`;
 const isC=kind==='customers';
 return `<div class="tablewrap"><table class="party-table"><thead><tr><th>${isC?'CUSTOMER':'VENDOR'}</th><th>CONTACT</th><th>CITY</th><th>TAX</th><th>${isC?'TERMS':'SUPPLIES'}</th><th class="money">${isC?'BALANCE DUE':'PAYABLE'}</th><th></th></tr></thead><tbody>${list.map(c=>{const due=isC?customerBalance(c.name):0,po=isC?null:vendorOpenPOs(c.name);return `<tr class="${c.status==='Inactive'?'is-inactive':''}"><td class="ref"><button class="linklike" data-party-open="${esc(c.id)}">${esc(c.name)}</button>${c.status==='Inactive'?' <span class="pill">Inactive</span>':''}<small>${esc(c.code||'')}${c.type==='Individual'?' · Individual':''}</small></td><td>${esc(c.contact||'—')}${c.designation?`<small>${esc(c.designation)}</small>`:''}<small>${esc([c.phone||c.mobile,c.email].filter(Boolean).join(' · '))}</small></td><td>${esc(partyCity(c)||'—')}</td><td>${c.ntn?`NTN ${esc(c.ntn)}`:'—'}${c.strn?`<small>STRN ${esc(c.strn)}</small>`:''}${c.atl==='Yes'?'<small>Active taxpayer</small>':''}</td><td>${esc(isC?(c.payment_terms||'—'):(c.supply_category||'—'))}${isC&&Number(c.credit_limit)?`<small>Limit ${money(c.credit_limit)}</small>`:''}</td><td class="money">${isC?(due?`<b class="${Number(c.credit_limit)&&due>Number(c.credit_limit)?'late':''}">${money(due)}</b>`:'—'):(()=>{const o=partyOwed('vendors',c);return `${o.due>0?`<b class="${o.overdue>0?'late':''}">${money(o.due)}</b><small>${o.overdue>0?`${money(o.overdue)} overdue`:'Not yet due'}</small>`:'—'}${po.count?`<small>${po.count} open PO · ${money(po.value)}</small>`:''}`})()}</td><td class="quote-actions"><button class="textbutton" data-party-open="${esc(c.id)}">Account ↗</button><button class="textbutton" data-party-edit="${esc(c.id)}">Edit</button><button class="textbutton danger" data-party-delete="${esc(c.id)}">Delete</button></td></tr>`}).join('')}</tbody></table></div>`;
}
function bindParties(kind){
 const viewing=partyView&&partyList(kind).find(c=>c.id===partyView);if(viewing)return bindPartyProfile(kind,viewing);
 const bind=()=>{bindStatements();$$('[data-party-open]').forEach(b=>b.onclick=()=>{partyView=b.dataset.partyOpen;partyTab='overview';render();window.scrollTo(0,0)});$$('[data-party-edit]').forEach(b=>b.onclick=()=>partyEditor(kind,b.dataset.partyEdit));$$('[data-party-delete]').forEach(b=>b.onclick=()=>deleteParty(kind,b.dataset.partyDelete))};
 $('#party-add').onclick=()=>partyEditor(kind);
 $('#party-search').oninput=e=>{$('#party-rows').innerHTML=partyRows(kind,e.target.value);bind()};
 $$('[data-party-filter]').forEach(b=>b.onclick=()=>{partyFilter=b.dataset.partyFilter;$$('[data-party-filter]').forEach(c=>c.classList.toggle('selected',c===b));$('#party-rows').innerHTML=partyRows(kind,$('#party-search').value);bind()});
 $('#party-csv').onclick=()=>{const rows=partyList(kind);downloadCSV(`gr-synergy-${kind}-${today()}.csv`,[['Code','Name','Type','Status','Contact','Designation','Phone','Mobile','Email','Website','Address','City','Province','Country','NTN','STRN','CNIC','Active taxpayer',kind==='customers'?'Payment terms':'Supplies','Credit limit','Bank','Account title','Account number','IBAN','Branch','Notes'],...rows.map(c=>[c.code,c.name,c.type,c.status||'Active',c.contact,c.designation,c.phone,c.mobile,c.email,c.website,c.address,c.city,c.province,c.country,c.ntn,c.strn,c.cnic,c.atl,kind==='customers'?c.payment_terms:c.supply_category,c.credit_limit,c.bank_name,c.account_title,c.account_number,c.iban,c.bank_branch,c.notes].map(v=>v??''))]);toast(`Exported ${rows.length} ${kind}.`)};
 bind();
}
// Customer / vendor account page: balance, ageing, 12-month activity, ledger with running balance,
// monthly summary, documents, payments and details. Vendors are billed by received purchase orders
// and paid through vendor payments (Dr supplier payable, Cr cash/bank when posted).
const payShort=m=>({'Business Bank Account':'Bank','Cash on Hand':'Cash','Petty Cash':'Petty cash'})[m]||m||'';
function customerEntries(name){
 const mine=invoices.filter(i=>i.party===name),ref=new Map(mine.map(i=>[i.id,i.reference]));
 return [...mine.map(i=>({date:i.date,type:'Invoice',reference:i.reference,details:i.description||'',due_date:i.due_date||'',charge:Number(i.amount),credit:0,order:0})),
  ...payments.filter(p=>ref.has(p.invoice_id)).map(p=>({date:p.date,type:'Payment',reference:ref.get(p.invoice_id),details:[payShort(p.method),p.reference].filter(Boolean).join(' · '),charge:0,credit:Number(p.amount),order:1}))];
}
function billDate(po){const d=stockMoves.filter(m=>m.type==='receipt'&&m.po_id===po.id).map(m=>m.date).sort()[0];return d||po.date}
function vendorBills(name){return records.filter(r=>r.kind==='purchase'&&r.party===name&&r.status==='Received').map(po=>({id:po.id,date:billDate(po),reference:po.reference,details:po.description||'',amount:Number(po.amount)}))}
function vendorEntries(name){
 const v=vendors.find(x=>x.name===name);return [...vendorBills(name).map(b=>({date:b.date,type:'Bill',reference:b.reference,details:b.details,due_date:dueFromTerms(v?.payment_terms,b.date),charge:b.amount,credit:0,order:0})),
  ...vendorPayments.filter(p=>p.vendor===name).map(p=>({date:p.date,type:'Payment',reference:p.reference,details:[payShort(p.method),records.find(r=>r.id===p.po_id)?.reference,p.ref_no].filter(Boolean).join(' · '),charge:0,credit:Number(p.amount),order:1}))];
}
function partyAccount(kind,c){
 const d=today(),isC=kind==='customers',entries=isC?customerEntries(c.name):vendorEntries(c.name);
 let open;
 if(isC)open=invoices.filter(i=>i.party===c.name).sort((a,b)=>a.date.localeCompare(b.date)).map(i=>{const b=invoiceBalance(i,payments);return {reference:i.reference,date:i.date,due_date:i.due_date||i.date,amount:Number(i.amount),paid:b.paid,due:b.due}});
 else{const s=settleBills(vendorBills(c.name),vendorPayments.filter(p=>p.vendor===c.name));open=s.bills.map(b=>({...b,due_date:dueFromTerms(c.payment_terms,b.date)}))}
 const bal=entries.reduce((n,e)=>n+Math.round(e.charge*100)-Math.round(e.credit*100),0)/100;
 return {entries,open,balance:bal,age:ageing(open,d)};
}
// Everything the statement-of-account PDF prints besides the transactions. Ageing and open items are
// current figures, so they are included only when the statement runs to today or later.
function statementOptions(kind,c,st){
 const acct=partyAccount(kind,c),current=st.to>=today(),years=[];for(let y=+st.from.slice(0,4);y<=+st.to.slice(0,4);y++)years.push(y);
 return {kind:kind==='customers'?'customer':'vendor',company,companyName:company.name,party:c,preparedOn:today(),open:current?acct.open:[],age:current?acct.age:null,monthly:years.flatMap(y=>monthlySummary(acct.entries,y).months),bankAccount:kind==='customers'?defaultBankAccount(company):null,stampLogo:stampLogo(company.stamp_color)};
}
function partyProfile(kind,c){
 const isC=kind==='customers',m=partyMeta(kind),d=today(),yr=d.slice(0,4),acct=partyAccount(kind,c),{entries,age}=acct;
 const sumYear=(k)=>entries.filter(e=>e.date.startsWith(yr)).reduce((n,e)=>n+e[k],0),life=k=>entries.reduce((n,e)=>n+e[k],0);
 const lastPay=entries.filter(e=>e.credit>0).map(e=>e.date).sort().pop();
 let stats;
 if(isC){
  const quotes=records.filter(r=>r.kind==='quote'&&r.party===c.name),won=quotes.filter(q=>q.status==='Accepted').length,lost=quotes.filter(q=>q.status==='Declined').length,openQ=quotes.filter(q=>['Draft','Sent'].includes(quoteState(q)));
  const limit=Number(c.credit_limit)||0,dtp=averageDaysToPay(invoices.filter(i=>i.party===c.name),payments);
  stats=stat('Balance due',money(acct.balance),age.overdue?`<span class="kpi-warn">${money(age.overdue)} overdue</span>`:limit?`${Math.round(acct.balance/limit*100)}% of ${money(limit)} limit`:'Nothing overdue','accounts')
   +stat(`Invoiced ${yr}`,money(sumYear('charge')),`${money(life('charge'))} all time`,'invoices')
   +stat(`Received ${yr}`,money(sumYear('credit')),dtp===null?(lastPay?`Last payment ${lastPay}`:'No payments yet'):`Pays in ${dtp} days on average`,'accounts')
   +stat('Open quotes',money(openQ.reduce((n,q)=>n+Number(q.amount),0)),won+lost?`${Math.round(won/(won+lost)*100)}% win rate · ${won} won of ${won+lost}`:`${openQ.length} awaiting a decision`,'sales');
 }else{
  const oldest=acct.open.filter(b=>b.due>0).map(b=>b.date).sort()[0],openPO=vendorOpenPOs(c.name);
  stats=stat('Payable',money(acct.balance),age.overdue?`<span class="kpi-warn">${money(age.overdue)} past due</span>`:oldest?`Oldest unpaid bill ${oldest}`:'Nothing owed','accounts')
   +stat(`Purchased ${yr}`,money(sumYear('charge')),`${money(life('charge'))} all time · received POs`,'procurement')
   +stat(`Paid ${yr}`,money(sumYear('credit')),lastPay?`Last payment ${lastPay}`:'No payments yet','accounts')
   +stat('Open purchase orders',money(openPO.value),`${openPO.count} draft or ordered`,'procurement');
 }
 const tabs=isC?[['overview','Overview'],['ledger','Account ledger'],['monthly','Monthly'],['docs','Invoices'],['payments','Payments'],['quotes','Quotes'],['jobs','Jobs'],['details','Details']]:[['overview','Overview'],['ledger','Account ledger'],['monthly','Monthly'],['docs','Bills'],['payments','Payments'],['quotes','Purchase orders'],['details','Details']];
 if(!tabs.some(([k])=>k===partyTab))partyTab='overview';
 const contact=[c.contact&&`${c.contact}${c.designation?` (${c.designation})`:''}`,c.phone||c.mobile,c.email,partyCity(c)].filter(Boolean).map(esc).join(' · ');
 return `<div class="heading party-heading"><div><button class="textbutton back" data-party-back>← All ${m.title.toLowerCase()}</button><div class="eyebrow">${esc(c.code||'')} · ${isC?'CUSTOMER ACCOUNT':'VENDOR ACCOUNT'}</div><h1>${esc(c.name)} ${c.status==='Inactive'?'<span class="pill">Inactive</span>':''}</h1><p class="sub">${contact||'No contact details yet'}${isC&&c.payment_terms?` · Terms: ${esc(c.payment_terms)}`:''}${!isC&&c.supply_category?` · ${esc(c.supply_category)}`:''}</p></div>
 <div class="heading-actions"><button data-party-edit="${esc(c.id)}">Edit</button><button id="party-pdf">Statement PDF</button>${isC?`<button class="primary" id="party-new-doc">＋ New quote</button>`:`<button id="party-new-doc">＋ Purchase order</button><button class="primary" id="vp-add">＋ Record payment</button>`}</div></div>
 <div class="stats">${stats}</div>
 <div class="sectionlinks party-tabs">${tabs.map(([k,l])=>`<button data-party-tab="${k}" class="${partyTab===k?'selected':''}">${l}</button>`).join('')}</div>
 <div id="party-tab">${partyTabBody(kind,c,acct)}</div>`;
}
function partyTabBody(kind,c,acct){
 const isC=kind==='customers',d=today(),words=isC?{charge:'Invoiced',credit:'Received',doc:'Invoice'}:{charge:'Billed',credit:'Paid',doc:'Bill'};
 const amt=v=>v?money(v):'—';
 if(partyTab==='overview'){
  const months=Array.from({length:12},(_,k)=>{const mm=monthShift(d.slice(0,7),k-11),inM=acct.entries.filter(e=>e.date.slice(0,7)===mm);return {m:mm,a:inM.reduce((n,e)=>n+e.charge,0),b:inM.reduce((n,e)=>n+e.credit,0)}});
  const recent=[...acct.entries].sort((a,b)=>b.date.localeCompare(a.date)||b.order-a.order).slice(0,8),maxAge=Math.max(1,...acct.age.buckets.map(b=>b.amount));
  const limit=isC?Number(c.credit_limit)||0:0;
  return `<div class="ov-grid"><div class="ov-col">
  <section class="card"><div class="cardhead"><div><h2>${isC?'Receivable ageing':'Payable ageing'}</h2><p class="sub">${money(acct.age.total)} open${acct.age.overdue?` · <span class="kpi-warn">${money(acct.age.overdue)} past due</span>`:''}</p></div></div><div class="cardbody age-bars">${acct.age.buckets.map((b,i)=>`<div class="age-row ${i>1&&b.amount?'late':''}"><span>${b.label}</span><div><i style="width:${b.amount/maxAge*100}%"></i></div><b>${b.amount?money(b.amount):'—'}</b></div>`).join('')}
  ${limit?`<div class="credit-meter"><span>Credit limit used</span><div><i style="width:${Math.min(100,acct.balance/limit*100)}%" class="${acct.balance>limit?'over':''}"></i></div><b>${money(acct.balance)} of ${money(limit)}</b></div>`:''}</div></section>
  <section class="card"><div class="cardhead"><div><h2>Recent activity</h2><p class="sub">Latest ${words.doc.toLowerCase()}s and payments.</p></div><button data-party-tab="ledger">Full ledger ↗</button></div>${recent.length?`<ul class="activity">${recent.map(e=>`<li><span class="dot ${e.charge?'charge':'credit'}"></span><div><b>${esc(e.type==='Invoice'||e.type==='Bill'?`${e.type} ${e.reference}`:`Payment · ${e.reference}`)}</b><small>${esc(e.date)}${e.details?` · ${esc(e.details)}`:''}</small></div><b class="${e.credit?'pos':''}">${e.charge?money(e.charge):'− '+money(e.credit)}</b></li>`).join('')}</ul>`:'<div class="all-clear"><b>No activity yet</b><span>'+(isC?'Invoices and payments for this customer will appear here.':'Received purchase orders and payments will appear here.')+'</span></div>'}</section></div>
  <div class="ov-col"><section class="card"><div class="cardhead"><div><h2>Last 12 months</h2><p class="sub">${words.charge} against ${words.credit.toLowerCase()} each month.</p></div></div><div class="cardbody">${months.some(x=>x.a||x.b)?pairChart(months,words.charge,words.credit):'<div class="all-clear"><b>No figures yet</b></div>'}</div></section>
  ${partyDetailsCard(kind,c,true)}</div></div>`;
 }
 if(partyTab==='ledger'){
  const st=partyLedger(acct.entries,partyFrom,partyTo);
  return `<section class="card"><div class="toolbar ledger-tools"><label class="row">From <input type="date" id="pl-from" value="${esc(partyFrom)}"></label><label class="row">To <input type="date" id="pl-to" value="${esc(partyTo)}"></label><span class="spacer"></span><button id="pl-csv">Export CSV</button><button id="pl-pdf" class="primary">Download PDF</button></div>
  <div class="ledger-sum"><div><span>Opening balance</span><b>${money(st.opening)}</b></div><div><span>${words.charge}</span><b>${money(st.charged)}</b></div><div><span>${words.credit}</span><b>${money(st.received)}</b></div><div class="close"><span>Closing balance</span><b>${money(st.closing)}</b></div></div>
  <div class="tablewrap"><table class="ledger-table"><thead><tr><th>DATE</th><th>TYPE</th><th>REFERENCE</th><th>DETAILS</th><th class="money">${words.charge.toUpperCase()}</th><th class="money">${words.credit.toUpperCase()}</th><th class="money">BALANCE</th></tr></thead><tbody><tr class="opening"><td>${esc(st.from)}</td><td colspan="3">Opening balance</td><td></td><td></td><td class="money"><b>${money(st.opening)}</b></td></tr>${st.entries.map(e=>`<tr><td>${esc(e.date)}</td><td><span class="pill entry-${e.type.toLowerCase()}">${esc(e.type)}</span></td><td class="ref">${esc(e.reference)}</td><td>${esc(e.details)}</td><td class="money">${amt(e.charge)}</td><td class="money">${amt(e.credit)}</td><td class="money"><b>${money(e.balance)}</b></td></tr>`).join('')||`<tr><td colspan="7" class="empty">No entries in this period.</td></tr>`}</tbody></table></div></section>`;
 }
 if(partyTab==='monthly'){
  const years=[...new Set([String(new Date().getFullYear()),...acct.entries.map(e=>e.date.slice(0,4))])].sort().reverse(),sm=monthlySummary(acct.entries,partyYear);
  return `<section class="card"><div class="toolbar"><label class="row">Year <select id="pm-year">${years.map(y=>`<option ${String(partyYear)===y?'selected':''}>${y}</option>`).join('')}</select></label><span class="fine">Opening balance ${money(sm.opening)}</span><span class="spacer"></span><button id="pm-csv">Export CSV</button></div>
  <div class="tablewrap"><table class="monthly-table"><thead><tr><th>MONTH</th><th class="money">${words.charge.toUpperCase()}</th><th class="money">${words.credit.toUpperCase()}</th><th class="money">NET</th><th class="money">CLOSING BALANCE</th><th>ENTRIES</th></tr></thead><tbody>${sm.months.map(x=>`<tr class="${x.count?'':'quiet'}"><td>${monthLabel(x.month,true)}</td><td class="money">${amt(x.charged)}</td><td class="money">${amt(x.credited)}</td><td class="money">${x.net?money(x.net):'—'}</td><td class="money"><b>${money(x.closing)}</b></td><td>${x.count||'—'}</td></tr>`).join('')}<tr class="total"><td>Total ${partyYear}</td><td class="money">${money(sm.charged)}</td><td class="money">${money(sm.credited)}</td><td class="money">${money(sm.charged-sm.credited)}</td><td class="money">${money(sm.closing)}</td><td></td></tr></tbody></table></div></section>`;
 }
 if(partyTab==='docs'){
  if(isC){const rows=invoices.filter(i=>i.party===c.name).sort((a,b)=>b.date.localeCompare(a.date));
   return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>INVOICE</th><th>DATE</th><th>DUE</th><th>STATUS</th><th class="money">TOTAL</th><th class="money">PAID</th><th class="money">BALANCE</th><th></th></tr></thead><tbody>${rows.map(i=>{const b=invoiceBalance(i,payments);return `<tr><td class="ref">${esc(i.reference)}<small>${esc(i.description||'')}</small></td><td>${esc(i.date)}</td><td>${esc(i.due_date||'—')}</td><td>${badge(invoiceStatus(i,payments,d))}</td><td class="money">${money(i.amount)}</td><td class="money">${amt(b.paid)}</td><td class="money"><b>${amt(b.due)}</b></td><td><button class="textbutton" data-open-invoice="${esc(i.id)}">Open ↗</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No invoices yet. Completed work orders are invoiced from Invoices.</div>'}</section>`}
  const rows=[...acct.open].sort((a,b)=>b.date.localeCompare(a.date));
  return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>BILL (PO)</th><th>RECEIVED</th><th>DUE</th><th>STATUS</th><th class="money">AMOUNT</th><th class="money">PAID</th><th class="money">BALANCE</th><th></th></tr></thead><tbody>${rows.map(b=>`<tr><td class="ref">${esc(b.reference)}<small>${esc(b.details)}</small></td><td>${esc(b.date)}</td><td>${esc(b.due_date)}</td><td>${badge(b.due<=0?'Paid':b.paid>0?'Part paid':b.due_date<d?'Overdue':'Unpaid')}</td><td class="money">${money(b.amount)}</td><td class="money">${amt(b.paid)}</td><td class="money"><b>${amt(b.due)}</b></td><td><button class="textbutton" data-edit="${esc(b.id)}">Open ↗</button>${b.due>0?`<button class="textbutton" data-vp-po="${esc(b.id)}">Pay</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No bills yet. A purchase order counts as a bill once its status is Received.</div>'}<p class="help" style="padding:0 24px 18px">Payments marked against a purchase order settle that bill; other payments settle the oldest bills first.</p></section>`;
 }
 if(partyTab==='payments'){
  if(isC){const ids=new Map(invoices.filter(i=>i.party===c.name).map(i=>[i.id,i])),rows=payments.filter(p=>ids.has(p.invoice_id)).sort((a,b)=>b.date.localeCompare(a.date));
   return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>DATE</th><th>INVOICE</th><th>RECEIVED INTO</th><th>REFERENCE</th><th class="money">AMOUNT</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${esc(p.date)}</td><td class="ref">${esc(ids.get(p.invoice_id).reference)}</td><td>${esc(p.method||'—')}</td><td>${esc(p.reference||'—')}</td><td class="money"><b>${money(p.amount)}</b></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No payments received yet. Record a payment from the invoice.</div>'}</section>`}
  const rows=vendorPayments.filter(p=>p.vendor===c.name).sort((a,b)=>b.date.localeCompare(a.date)||String(b.reference).localeCompare(String(a.reference)));
  return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>PAYMENT</th><th>DATE</th><th>PAID FROM</th><th>AGAINST</th><th>CHEQUE / REF.</th><th>POSTED</th><th class="money">AMOUNT</th><th></th></tr></thead><tbody>${rows.map(p=>{const posted=journals.some(j=>j.source_kind==='vendorpay'&&j.source_id===p.id);return `<tr><td class="ref">${esc(p.reference)}${p.notes?`<small>${esc(p.notes)}</small>`:''}</td><td>${esc(p.date)}</td><td>${esc(p.method)}<small>${esc(p.payable_account)} · ${esc(accountList.find(a=>a.code===p.payable_account)?.name||'')}</small></td><td>${esc(records.find(r=>r.id===p.po_id)?.reference||'Oldest bills')}</td><td>${esc(p.ref_no||'—')}</td><td>${posted?badge('Posted'):'<span class="pill">Not posted</span>'}</td><td class="money"><b>${money(p.amount)}</b></td><td>${posted?'':`<button class="textbutton danger" data-vp-delete="${esc(p.id)}">Delete</button>`}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No payments to this vendor yet. Use ＋ Record payment.</div>'}<p class="help" style="padding:0 24px 18px">Post vendor payments in Accounts → Journal (Dr supplier payable, Cr cash/bank). Posted payments can no longer be deleted.</p></section>`;
 }
 if(partyTab==='quotes'){
  const kindRec=isC?'quote':'purchase',rows=records.filter(r=>r.kind===kindRec&&r.party===c.name).sort((a,b)=>b.date.localeCompare(a.date));
  return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>${isC?'QUOTATION':'PURCHASE ORDER'}</th><th>DATE</th><th>STATUS</th><th class="money">AMOUNT</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td class="ref">${esc(r.reference)}<small>${esc(r.description||'')}</small></td><td>${esc(r.date)}</td><td>${badge(isC?quoteState(r):r.status)}</td><td class="money">${money(r.amount)}</td><td><button class="textbutton" data-edit="${esc(r.id)}">Open ↗</button><button class="textbutton" data-quote-pdf="${esc(r.id)}">PDF</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">No ${isC?'quotations':'purchase orders'} yet.</div>`}</section>`;
 }
 if(partyTab==='jobs'){
  const rows=workOrders.filter(j=>j.party===c.name).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
  return `<section class="card">${rows.length?`<div class="tablewrap"><table><thead><tr><th>JOB</th><th>QUOTE</th><th>STAGE</th><th>PROGRESS</th><th>DUE</th><th class="money">VALUE</th><th></th></tr></thead><tbody>${rows.map(j=>{const p=scopeProgress(scopeOf(j));return `<tr><td class="ref">${esc(j.reference)}</td><td>${esc(j.quote_reference||'—')}</td><td>${badge(jobStage(j,isInvoiced(j)))}</td><td><div class="progress-meter ${p===100?'full':''}"><i style="width:${p}%"></i><span>${p}%</span></div></td><td>${esc(j.due_date||'—')}</td><td class="money">${money(jobFigures(j).revenue)}</td><td><button class="textbutton" data-job-open="${esc(j.id)}">Open ↗</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">No work orders for this customer yet.</div>'}</section>`;
 }
 return partyDetailsCard(kind,c,false);
}
function partyDetailsCard(kind,c,compact){
 const isC=kind==='customers',row=(k,v)=>v?`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`:'';
 const groups=[['Contact',[['Contact person',c.contact],['Designation',c.designation],['Phone',c.phone],['Mobile',c.mobile],['Email',c.email],['Website',c.website]]],['Address',[['Address',c.address],['City',c.city],['Province',c.province],['Country',c.country]]],['Tax',[['Type',c.type],['NTN',c.ntn],['STRN',c.strn],['CNIC',c.cnic],['Active taxpayer',c.atl]]],['Terms',[[isC?'Payment terms':'Supplies',isC?c.payment_terms:c.supply_category],...(!isC?[['Payment terms',c.payment_terms]]:[]),['Credit limit',Number(c.credit_limit)?money(c.credit_limit):'']]],['Bank',[['Bank',c.bank_name],['Account title',c.account_title],['Account number',c.account_number],['IBAN',c.iban?formatIBAN(c.iban):''],['Branch',c.bank_branch]]]];
 const shown=compact?groups.filter(([g])=>['Contact','Tax','Bank'].includes(g)):groups;
 const body=shown.map(([g,rows])=>{const inner=rows.map(([k,v])=>row(k,v)).join('');return inner?`<div class="dgroup"><h3>${g}</h3><dl>${inner}</dl></div>`:''}).join('');
 return `<section class="card"><div class="cardhead"><div><h2>${compact?'Key details':'Details'}</h2></div><button data-party-edit="${esc(c.id)}">Edit ↗</button></div><div class="cardbody party-details">${body||'<p class="fine">No details recorded yet.</p>'}${!compact&&c.notes?`<div class="dgroup"><h3>Notes</h3><p>${esc(c.notes)}</p></div>`:''}</div></section>`;
}
function pairChart(months,la,lb){
 const max=Math.max(1,...months.flatMap(m=>[m.a,m.b])),H=140,W=560,band=W/months.length,bw=Math.min(14,band/3);
 const bars=months.map((m,k)=>{const x=k*band+band/2,ha=m.a/max*H,hb=m.b/max*H;return `<g><title>${monthLabel(m.m,true)}: ${la} ${money(m.a)}, ${lb} ${money(m.b)}</title><rect class="b-sales" x="${x-bw-1}" y="${H-ha}" width="${bw}" height="${Math.max(ha,m.a?2:0)}" rx="2"/><rect class="b-spent" x="${x+1}" y="${H-hb}" width="${bw}" height="${Math.max(hb,m.b?2:0)}" rx="2"/><text x="${x}" y="${H+16}" text-anchor="middle">${monthLabel(m.m)}</text></g>`}).join('');
 return `<svg class="trend-chart" viewBox="0 0 ${W} ${H+22}" role="img" aria-label="${la} and ${lb} by month"><line x1="0" x2="${W}" y1="${H/2}" y2="${H/2}"/><text class="axis" x="${W}" y="${H/2-4}" text-anchor="end">${short(max/2)}</text><line x1="0" x2="${W}" y1="${H}" y2="${H}" class="base"/>${bars}</svg><div class="chart-legend"><span><i class="b-sales"></i>${la} <b>${money(months.reduce((n,m)=>n+m.a,0))}</b></span><span><i class="b-spent"></i>${lb} <b>${money(months.reduce((n,m)=>n+m.b,0))}</b></span></div>`;
}
function bindPartyProfile(kind,c){
 const isC=kind==='customers',rerender=()=>{render();};
 $('[data-party-back]').onclick=()=>{partyView=null;partyTab='overview';render();window.scrollTo(0,0)};
 $$('[data-party-tab]').forEach(b=>b.onclick=()=>{partyTab=b.dataset.partyTab;rerender()});
 $$('[data-party-edit]').forEach(b=>b.onclick=()=>partyEditor(kind,b.dataset.partyEdit));
 $$('[data-open-invoice]').forEach(b=>b.onclick=()=>openInvoice(b.dataset.openInvoice));
 $$('[data-quote-pdf]').forEach(b=>b.onclick=()=>downloadSavedPDF(records.find(r=>r.id===b.dataset.quotePdf),b));
 $$('[data-job-open]').forEach(b=>b.onclick=()=>{page='workorders';jobView=b.dataset.jobOpen;partyView=null;render();window.scrollTo(0,0)});
 $('#party-new-doc').onclick=()=>{editor(isC?'quote':'purchase');const p=$('#recordform [name=party]');if(p){p.value=c.name;p.dispatchEvent(new Event('input',{bubbles:true}));p.dispatchEvent(new Event('change',{bubbles:true}))}};
 if($('#vp-add'))$('#vp-add').onclick=()=>vendorPaymentEditor(c);
 $$('[data-vp-po]').forEach(b=>b.onclick=()=>vendorPaymentEditor(c,b.dataset.vpPo));
 $$('[data-vp-delete]').forEach(b=>b.onclick=()=>{const p=vendorPayments.find(x=>x.id===b.dataset.vpDelete);if(!p||journals.some(j=>j.source_kind==='vendorpay'&&j.source_id===p.id))return;if(!confirm(`Delete payment ${p.reference} of ${money(p.amount)}?`))return;vendorPayments=vendorPayments.filter(x=>x.id!==p.id);render();toast(`${p.reference} deleted.`)});
 const statement=()=>partyLedger(isC?customerEntries(c.name):vendorEntries(c.name),partyFrom,partyTo);
 const pdf=async btn=>{btn.disabled=true;const t=btn.textContent;btn.textContent='Preparing…';try{const st={...statement(),party:c.name};const res=await fetch('sutluj-logo.jpg?v=gr-3');if(!res.ok)throw Error('The company logo could not be loaded.');const bytes=await createStatementPDF(st,new Uint8Array(await res.arrayBuffer()),window.PDFLib,statementOptions(kind,c,st));const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=`GR-Synergy-${isC?'Statement':'Vendor-Statement'}-${c.name.replace(/[^a-zA-Z0-9_-]/g,'-')}-${st.to}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Statement PDF downloaded.')}catch(e){toast(e.message||'Could not create the PDF.')}finally{btn.disabled=false;btn.textContent=t}};
 $('#party-pdf').onclick=()=>pdf($('#party-pdf'));
 if($('#pl-pdf'))$('#pl-pdf').onclick=()=>pdf($('#pl-pdf'));
 const dates=()=>{const f=$('#pl-from').value,t=$('#pl-to').value;if(!f||!t||f>t){toast('From date must be on or before the To date.');return}partyFrom=f;partyTo=t;rerender()};
 if($('#pl-from')){$('#pl-from').onchange=dates;$('#pl-to').onchange=dates}
 if($('#pl-csv'))$('#pl-csv').onclick=()=>{const st=statement(),w=isC?['Invoiced','Received']:['Billed','Paid'];downloadCSV(`gr-synergy-ledger-${c.name.replace(/[^a-zA-Z0-9]+/g,'-')}-${st.to}.csv`,[['Date','Type','Reference','Details',`${w[0]} (PKR)`,`${w[1]} (PKR)`,'Balance (PKR)'],[st.from,'Opening balance','','','','',st.opening],...st.entries.map(e=>[e.date,e.type,e.reference,e.details,e.charge||'',e.credit||'',e.balance]),[st.to,'Closing balance','','',st.charged,st.received,st.closing]]);toast('Ledger exported.')};
 if($('#pm-year'))$('#pm-year').onchange=e=>{partyYear=Number(e.target.value);rerender()};
 if($('#pm-csv'))$('#pm-csv').onclick=()=>{const sm=monthlySummary(isC?customerEntries(c.name):vendorEntries(c.name),partyYear),w=isC?['Invoiced','Received']:['Billed','Paid'];downloadCSV(`gr-synergy-monthly-${c.name.replace(/[^a-zA-Z0-9]+/g,'-')}-${partyYear}.csv`,[['Month',`${w[0]} (PKR)`,`${w[1]} (PKR)`,'Net (PKR)','Closing balance (PKR)'],['Opening','','','',sm.opening],...sm.months.map(x=>[x.month,x.charged,x.credited,x.net,x.closing]),['Total',sm.charged,sm.credited,sm.charged-sm.credited,sm.closing]]);toast('Monthly summary exported.')};
}
function vendorPaymentEditor(v,poId=''){
 const acct=partyAccount('vendors',v),openBills=acct.open.filter(b=>b.due>0),preset=openBills.find(b=>b.id===poId),requestId=crypto.randomUUID();
 $('#modal').innerHTML=`<div class="modalhead"><h2>Record payment · ${esc(v.name)}</h2><button class="close" aria-label="Close">×</button></div><form id="vp-form"><div class="formgrid">
 ${field('Date','date',today(),'date','required')}${field('Amount (PKR)','amount',preset?preset.due:acct.balance>0?acct.balance:'','number','required min="0.01" step="0.01"')}
 <label class="field">Paid from<select name="method">${Object.keys(vendorPayMethods).map(k=>`<option ${k==='Business Bank Account'?'selected':''}>${k}</option>`).join('')}</select></label>
 <label class="field">Payable account<select name="payable_account">${payableAccounts.map(code=>`<option value="${code}" ${code===payableFor(v)?'selected':''}>${code} · ${esc(accountList.find(a=>a.code===code)?.name||'')}</option>`).join('')}</select></label>
 <label class="field">Against bill<select name="po_id"><option value="">Oldest bills first</option>${openBills.map(b=>`<option value="${esc(b.id)}" ${b.id===poId?'selected':''}>${esc(b.reference)} · ${money(b.due)} due</option>`).join('')}</select></label>
 ${field('Cheque / transfer ref.','ref_no','','text','maxlength="60"')}
 <label class="field full">Notes<input name="notes" maxlength="200"></label></div>
 <p class="help">Balance owed to ${esc(v.name)}: <b>${money(acct.balance)}</b>. Post the payment later in Accounts → Journal.</p><div id="vp-error" class="error" role="alert"></div><div class="actions"><button type="button" class="close-btn">Cancel</button><button type="submit" class="primary">Save payment</button></div></form>`;
 if(!$('#modal').open)$('#modal').showModal();$('.close').onclick=()=>$('#modal').close();$('.close-btn').onclick=()=>$('#modal').close();
 const f=$('#vp-form');f.elements.po_id.onchange=()=>{const b=openBills.find(x=>x.id===f.elements.po_id.value);if(b)f.elements.amount.value=b.due};
 f.onsubmit=e=>{e.preventDefault();if(vendorPayments.some(p=>p.request_id===requestId))return;try{const p=validateVendorPayment({vendor:v.name,date:f.elements.date.value,amount:f.elements.amount.value,method:f.elements.method.value,payable_account:f.elements.payable_account.value,po_id:f.elements.po_id.value,ref_no:f.elements.ref_no.value.trim(),notes:f.elements.notes.value.trim()});
  const rec={...p,id:crypto.randomUUID(),request_id:requestId,reference:nextReference('VP',vendorPayments,'reference'),created_at:new Date().toISOString()};vendorPayments.push(rec);$('#modal').close();partyTab='payments';render();toast(`${rec.reference} · ${money(rec.amount)} paid to ${v.name}.`)}catch(err){$('#vp-error').textContent=err.message}};
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
  const response=await fetch('sutluj-logo.jpg?v=gr-3');if(!response.ok)throw Error('The company logo could not be loaded. Please retry.');
  const bytes=await createQuotePDF(doc,new Uint8Array(await response.arrayBuffer()),window.PDFLib,{company,party,bankAccount:findBankAccount(company,doc.bank_account_id),stampLogo:stampLogo(company.stamp_color)});
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download=`GR-Synergy-Scrap-Sale-${s.reference}.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast(`${s.reference} PDF downloaded.`);
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
  records=[];invoices=[];payments=[];workOrders=[];journals=[];stockMoves=[];attendance=[];advances=[];payrolls=[];scrapSales=[];vendorPayments=[];stockTakes=[];deliveryNotes=[];
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
 try{backup=validateWorkspace(JSON.parse(await file.text()))}catch{toast('This file is not a GR Synergy Ventures backup, or it is damaged. Nothing was changed.');return}
 const d=backup.data,count=k=>d[k]?.length||0,when=backup.savedAt?new Date(backup.savedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'unknown date';
 const summary=[['quotes & other records',count('records')],['customers',count('customers')],['vendors',count('vendors')],['work orders',count('workOrders')],['invoices',count('invoices')],['stock items',count('stockItems')],['employees',count('employees')],['scrap sales',count('scrapSales')]].filter(([,n])=>n).map(([k,n])=>`${n} ${k}`).join(', ')||'no entries';
 const dialog=$('#delete-modal');
 dialog.innerHTML=`<div class="modalhead"><h2 id="delete-title">Restore this backup?</h2></div><form id="restore-form"><p><b>${esc(file.name)}</b> · saved ${esc(when)}</p><p>${esc(summary)}${backup.company?' · company details and settings':''}.</p><p class="help">Everything currently in this browser is replaced. A backup of the current workspace is downloaded first.</p><div class="actions"><button type="button" id="restore-cancel" autofocus>Cancel</button><button type="submit" class="delete-confirm">Back up current and restore</button></div></form>`;
 dialog.showModal();$('#restore-cancel').onclick=()=>dialog.close();
 $('#restore-form').onsubmit=e=>{e.preventDefault();
  exportWorkspaceBackup();
  ({records,customers,vendors,invoices,payments,workOrders,journals,stockItems,stockMoves,employees,attendance,advances,payrolls,scrapSales}=d);vendorPayments=d.vendorPayments||[];stockTakes=d.stockTakes||[];deliveryNotes=d.deliveryNotes||[];
  if(backup.company&&typeof backup.company==='object'){company={...defaultCompany,...backup.company};applyChartSettings(company.coa||{});try{localStorage.setItem('sutluj-company',JSON.stringify(company))}catch{}}
  try{localStorage.removeItem('sutluj-last-quote-number')}catch{} // numbering continues from the restored quotes
  jobView=null;dialog.close();page='overview';render();toast(`Backup restored: ${summary}.`);
 };
}

// Help & tutorials: setup checklist, workflows, module guides, glossary / FAQ and a guided tour (help.mjs holds the wording).
function setupItems(){
 let backup='';try{backup=localStorage.getItem('gr-last-backup')||''}catch{}
 const real=(list,prefix)=>list.some(x=>!String(x.id).startsWith(prefix));
 return [
  {id:'company',label:'Company details',hint:'Name, address, phone and NTN print on every document.',done:!!(company.name&&company.address&&(company.phone||company.email)),page:'settings'},
  {id:'bank',label:'Bank account',hint:'Shown on quotes and invoices so customers can pay.',done:bankAccountsOf(company).length>0,page:'settings'},
  {id:'stamp',label:'Company stamp',hint:'Set the colour and centre text or logo.',done:!!(company.stamp_color||company.stamp_line||company.stamp_center),page:'settings'},
  {id:'customers',label:'Add your customers',hint:'With payment terms, NTN and contact person.',done:real(customers,'customer-demo'),page:'customers'},
  {id:'vendors',label:'Add your vendors',hint:'Steel suppliers, gas, services.',done:real(vendors,'vendor-demo'),page:'vendors'},
  {id:'stock',label:'Set up stock items',hint:'“Create all 5 standard sizes” per material.',done:stockItems.length>0,page:'inventory'},
  {id:'quote',label:'Send your first quotation',hint:'Try the Sheet calculator while pricing.',done:records.some(r=>r.kind==='quote'&&!String(r.id).startsWith('demo-')),page:'sales'},
  {id:'backup',label:'Export a backup',hint:backup?`Last backup ${backup}. Do this every week.`:'Do this every week and keep the file safe.',done:!!backup&&daysBetweenDates(backup,today())<=7,page:'settings'}
 ];
}
function setupProgress(){const items=setupItems();return {items,done:items.filter(i=>i.done).length,total:items.length}}
const guideFor=p=>guides.find(g=>g.topics.includes(p))?.id||'';
const pageName=p=>({workorders:'Work orders',deliveries:'Delivery notes',hr:'HR',help:'Help & tutorials'})[p]||(p?p[0].toUpperCase()+p.slice(1):'');
function helpPage(){
 const sp=setupProgress(),pct=Math.round(sp.done/sp.total*100),flow=workflows.find(w=>w.id===helpFlow)||workflows[0],st=flow.steps[helpStep]||flow.steps[0];
 const guideCard=g=>`<details class="guide ${helpTopic===g.id?'focus':''}" id="guide-${g.id}" data-search="${esc((g.title+' '+g.what+' '+g.steps.join(' ')+' '+g.tips.join(' ')).toLowerCase())}" ${helpTopic===g.id?'open':''}><summary><span class="g-ico">${icon(g.page==='sales'&&g.id==='calculator'?'inventory':g.page)}</span><span><b>${esc(g.title)}</b><small>${esc(g.what)}</small></span></summary><div class="g-body"><h4>How to</h4><ol>${g.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${g.tips.length?`<h4>Good to know</h4><ul>${g.tips.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}<div class="g-foot"><button class="primary" data-help-go="${g.page}" ${g.id==='calculator'?'data-help-calc':''}>${g.id==='calculator'?'Open sheet calculator':'Open '+esc(pageName(g.page))}</button></div></div></details>`;
 return `<div class="heading help-head"><div><div class="eyebrow">HELP CENTRE</div><h1>Help &amp; tutorials</h1><p class="sub">How the app works, step by step, with a guide for every module.</p></div><div class="row">${helpReturn&&helpReturn!=='help'?`<button data-nav="${helpReturn}">← Back to ${esc(pageName(helpReturn))}</button>`:''}<button class="primary" data-tour-start>▶ Take the guided tour</button></div></div>
 <div class="help-search"><input id="help-search" type="search" placeholder="Search help — e.g. remnant, delivery, posting, stock take" aria-label="Search help"><span class="fine" id="help-count"></span></div>
 <div class="help-top">
  <section class="card setup"><div class="cardhead"><div><h2>Getting started</h2><p class="sub">${sp.done===sp.total?'All set up. Keep backing up every week.':`${sp.done} of ${sp.total} done`}</p></div><div class="ring" style="--p:${pct}"><span>${pct}%</span></div></div><ul class="checklist">${sp.items.map(i=>`<li class="${i.done?'done':''}"><span class="tick">${i.done?'✓':''}</span><span><b>${esc(i.label)}</b><small>${esc(i.hint)}</small></span>${i.done?'':`<button class="textbutton" data-help-go="${i.page}">Set up →</button>`}</li>`).join('')}</ul></section>
  <section class="card flows"><div class="cardhead"><h2>How the work flows</h2><div class="seg">${workflows.map(w=>`<button data-flow="${w.id}" class="${w.id===flow.id?'selected':''}">${esc(w.title)}</button>`).join('')}</div></div><div class="cardbody"><p class="sub">${esc(flow.sub)} Click a step.</p><ol class="flow">${flow.steps.map((s,i)=>`<li><button data-flow-step="${i}" class="${s===st?'on':''} ${flow.steps.indexOf(st)>i?'past':''}"><span>${i+1}</span>${esc(s.label)}</button></li>`).join('')}</ol><div class="flow-detail"><div><div class="eyebrow">STEP ${flow.steps.indexOf(st)+1} OF ${flow.steps.length} · ${esc(pageName(st.page).toUpperCase())}</div><h3>${esc(st.label)}</h3><p>${esc(st.text)}</p></div><div class="row"><button data-flow-step="${Math.max(0,flow.steps.indexOf(st)-1)}" ${st===flow.steps[0]?'disabled':''}>←</button><button data-flow-step="${Math.min(flow.steps.length-1,flow.steps.indexOf(st)+1)}" ${st===flow.steps.at(-1)?'disabled':''}>→</button><button class="primary" data-help-go="${st.page}" data-help-tab="${st.tab||''}">Open ${esc(pageName(st.page))}</button></div></div></div></section>
 </div>
 <h2 class="help-h">Module guides</h2><div class="guides">${guides.map(guideCard).join('')}</div>
 <div class="help-two"><section><h2 class="help-h">Glossary</h2><div class="card gloss">${glossary.map(([t,d])=>`<div class="term" data-search="${esc((t+' '+d).toLowerCase())}"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div></section>
 <section><h2 class="help-h">Questions</h2><div class="faq">${faq.map(([q,a])=>`<details class="card" data-search="${esc((q+' '+a).toLowerCase())}"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section></div>
 <p class="help-none empty" hidden>Nothing matches. Try another word, or take the guided tour.</p>`;
}
function tourCard(){
 if(tourStep===null)return '';const s=tourSteps[tourStep],n=tourSteps.length;
 return `<div class="tour" role="dialog" aria-label="Guided tour"><div class="tour-bar"><i style="width:${(tourStep+1)/n*100}%"></i></div><div class="eyebrow">GUIDED TOUR · ${tourStep+1} OF ${n}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><div class="row"><button class="textbutton" data-tour-end>End tour</button><span style="flex:1"></span><button data-tour-move="-1" ${tourStep?'':'disabled'}>Back</button><button class="primary" data-tour-move="1">${tourStep===n-1?'Finish':'Next'}</button></div></div>`;
}
function tourGo(i){if(i<0||i>=tourSteps.length){tourStep=null;render();toast('Tour finished. Open Help any time from the ? button.');return}tourStep=i;const s=tourSteps[i];if(s.page==='help')helpTopic='';navigate(s.page);scrollTo(0,0)}
function bindHelp(){
 $$('[data-help-open]').forEach(b=>b.onclick=()=>{if(page==='help'){helpTopic='';render();return}helpTopic=guideFor(page);navigate('help')});
 $$('[data-tour-start]').forEach(b=>b.onclick=()=>tourGo(0));
 $$('[data-tour-end]').forEach(b=>b.onclick=()=>{tourStep=null;render()});
 $$('[data-tour-move]').forEach(b=>b.onclick=()=>tourGo(tourStep+Number(b.dataset.tourMove)));
 if(tourStep!==null){const nb=$(`.nav [data-nav="${tourSteps[tourStep].page}"]`);if(nb)nb.classList.add('tour-hl');if(tourSteps[tourStep].page==='help')$('.help-foot')?.classList.add('tour-hl')}
 if(page!=='help')return;
 $$('[data-help-go]').forEach(b=>b.onclick=()=>{const t=b.dataset.helpTab,calc=b.hasAttribute('data-help-calc');navigate(b.dataset.helpGo);if(t){tab=t;render()}if(calc)openSheetCalculator(false)});
 $$('[data-flow]').forEach(b=>b.onclick=()=>{helpFlow=b.dataset.flow;helpStep=0;render()});
 $$('[data-flow-step]').forEach(b=>b.onclick=()=>{helpStep=Number(b.dataset.flowStep);const y=scrollY;render();scrollTo(0,y)});
 const search=$('#help-search');search.oninput=()=>{const q=search.value.trim().toLowerCase();let shown=0;$$('[data-search]').forEach(el=>{const hit=!q||el.dataset.search.includes(q);el.hidden=!hit;if(hit)shown++;if(el.tagName==='DETAILS'&&el.classList.contains('guide'))el.open=!!q&&hit||el.classList.contains('focus')});$$('.help-two section,.guides').forEach(sec=>{const box=sec.classList.contains('guides')?sec:sec;box.hidden=![...box.querySelectorAll('[data-search]')].some(e=>!e.hidden)});$$('.help-h').forEach(h=>{const next=h.nextElementSibling;h.hidden=!!next?.hidden});$('.help-top').hidden=!!q;$('.help-none').hidden=!q||shown>0;$('#help-count').textContent=q?`${shown} result${shown===1?'':'s'}`:''};
 if(helpTopic){const g=$(`#guide-${helpTopic}`);if(g)requestAnimationFrame(()=>g.scrollIntoView({behavior:'smooth',block:'start'}))}
}

try{new BroadcastChannel('gr-sheet-calc').onmessage=e=>{if(e.data?.type==='apply'&&e.data.token&&e.data.token===calcToken)applyCalcToQuote(e.data.state)}}catch{}
// Start the app last, once every helper in this file is defined (helpers declared with const are
// not usable before their line runs, and the first page can call any of them).
restoreLocalWorkspace();
render();

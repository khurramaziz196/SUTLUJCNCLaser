// HR rules for a small workshop: employees, daily attendance, salary advances and monthly payroll.
// Monthly salaries are reduced by salary ÷ 30 for each unpaid day; daily wages pay for days worked.
// Income tax, EOBI and social security are entered per payslip; no statutory rates are assumed.
// Amounts are PKR with two decimals; calculations use paise.
export const attendanceCodes={P:'Present',H:'Half day',A:'Absent',L:'Paid leave',U:'Unpaid leave',O:'Weekly off / holiday'};
export const roles=['Laser operator','CAD / DXF designer','Helper','Supervisor','Bending / fabrication','Driver','Office / admin','Sales'];
export const costTypes={production:'Production (direct labour)',office:'Office / admin'};
export const payAccounts={'Cash on Hand':'1001','Business Bank Account':'1002','Petty Cash':'1003'};
export const hrKinds=['payroll','salary','advance'];

const paise=v=>Math.round(Number(v)*100);
const pkr=c=>Math.round(c)/100;
export const monthDays=month=>new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();
export const monthDates=month=>Array.from({length:monthDays(month)},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`);
export const employedOn=(e,date)=>e.join_date<=date&&(!e.leave_date||date<=e.leave_date);
export const employedIn=(e,month)=>e.join_date.slice(0,7)<=month&&(!e.leave_date||e.leave_date.slice(0,7)>=month);

export function validateEmployee(e,list){
 if(!String(e.name||'').trim())throw Error('Enter the employee name.');
 if(e.cnic&&!/^\d{5}-\d{7}-\d$/.test(e.cnic))throw Error('Enter the CNIC as 12345-1234567-1, or leave it blank.');
 if(e.cnic&&list.some(x=>x.id!==e.id&&x.cnic===e.cnic))throw Error('Another employee already has this CNIC.');
 if(!costTypes[e.cost_type])throw Error('Choose production or office staff.');
 if(!['Monthly','Daily'].includes(e.pay_type))throw Error('Choose monthly salary or daily wage.');
 const rate=Number(e.rate),ot=Number(e.ot_rate||0),leave=Number(e.annual_leave||0);
 if(!Number.isFinite(rate)||rate<=0||rate>10000000)throw Error(`Enter the ${e.pay_type==='Daily'?'daily wage':'monthly salary'}.`);
 if(!Number.isFinite(ot)||ot<0||ot>100000)throw Error('Enter an overtime rate of zero or more.');
 if(!Number.isFinite(leave)||leave<0||leave>60)throw Error('Paid leave must be between 0 and 60 days a year.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(e.join_date||''))throw Error('Enter the joining date.');
 if(e.status==='Left'&&!e.leave_date)throw Error('Enter the leaving date.');
 if(e.leave_date&&e.leave_date<e.join_date)throw Error('The leaving date cannot be before the joining date.');
 return e;
}

// Attendance for one employee in a month. Days before joining or after leaving are not employed.
export function attendanceSummary(e,month,attendance){
 const byDate=new Map(attendance.map(d=>[d.date,d.entries||{}]));
 const s={employed:0,notEmployed:0,P:0,H:0,A:0,L:0,U:0,O:0,unmarked:0,ot:0};
 for(const date of monthDates(month)){
  if(!employedOn(e,date)){s.notEmployed++;continue}
  s.employed++;const x=byDate.get(date)?.[e.id];
  if(x&&attendanceCodes[x.status]){s[x.status]++;s.ot+=Number(x.ot)||0}else s.unmarked++;
 }
 s.ot=Math.round(s.ot*100)/100;return s;
}

// Paid leave taken in a calendar year, for the leave balance.
export function leaveTaken(e,year,attendance){return attendance.filter(d=>d.date.startsWith(year)&&d.entries?.[e.id]?.status==='L').length}

// Advances given less amounts recovered in finalised payrolls (optionally ignoring one run being edited).
export function advanceBalance(employeeId,advances,payrolls,exceptRun){
 const given=advances.filter(a=>a.employee_id===employeeId).reduce((n,a)=>n+paise(a.amount),0);
 const recovered=payrolls.filter(r=>r.id!==exceptRun&&r.status!=='Draft').flatMap(r=>r.lines).filter(l=>l.employee_id===employeeId).reduce((n,l)=>n+paise(l.advance),0);
 return pkr(given-recovered);
}

// One payslip. Monthly staff: unmarked days count as worked. Daily staff: only marked working days are paid.
export function payrollLine(e,s,inputs={},advanceDue=0){
 const rate=paise(e.rate),otRate=paise(e.ot_rate||0);
 let basic,absence=0,paidDays;
 if(e.pay_type==='Monthly'){
  const unpaid=s.A+s.U+s.H/2+s.notEmployed;paidDays=Math.max(0,s.employed-(s.A+s.U+s.H/2));
  basic=rate;absence=paidDays<=0?rate:Math.min(rate,Math.round(rate*unpaid/30));
 }else{paidDays=s.P+s.H/2+s.L;basic=Math.round(rate*paidDays)}
 const ot=Math.round(otRate*s.ot),bonus=paise(inputs.bonus||0),advance=paise(inputs.advance||0),deductions=paise(inputs.deductions||0);
 if(bonus<0||advance<0||deductions<0)throw Error(`${e.name}: amounts cannot be negative.`);
 if(advance>paise(advanceDue))throw Error(`${e.name}: advance recovery is more than the PKR ${Number(advanceDue).toLocaleString('en-PK')} outstanding.`);
 const gross=basic-absence+ot+bonus,net=gross-advance-deductions;
 if(net<0)throw Error(`${e.name}: deductions are more than the gross pay.`);
 return {employee_id:e.id,code:e.code,name:e.name,role:e.role,cost_type:e.cost_type,pay_type:e.pay_type,rate:pkr(rate),ot_rate:pkr(otRate),days:s,paid_days:paidDays,basic:pkr(basic),absence:pkr(absence),ot_hours:s.ot,ot_pay:pkr(ot),bonus:pkr(bonus),gross:pkr(gross),advance:pkr(advance),deductions:pkr(deductions),deduction_note:String(inputs.deduction_note||'').trim(),net:pkr(net)};
}

export function payrollTotals(lines){const t={gross:0,advance:0,deductions:0,net:0};for(const l of lines)for(const k in t)t[k]+=paise(l[k]);for(const k in t)t[k]=pkr(t[k]);return t}

// Journal lines. Finalising accrues wages; paying settles Salaries Payable; an advance is a staff receivable.
export function hrLines(kind,source){
 const line=(account,debit,credit)=>({account,debit,credit});
 if(kind==='advance'){const bank=payAccounts[source.method];if(!bank)throw Error('Unknown cash/bank account.');return [line('1102',Number(source.amount),0),line(bank,0,Number(source.amount))]}
 if(kind==='salary'){const bank=payAccounts[source.paid_method];if(!bank)throw Error('Unknown cash/bank account.');const net=payrollTotals(source.lines).net;return [line('2301',net,0),line(bank,0,net)]}
 if(kind==='payroll'){
  const cost={};const add=(a,c)=>{if(c)cost[a]=(cost[a]||0)+c};
  for(const l of source.lines){const prod=l.cost_type==='production';add(prod?'5201':'6101',paise(l.basic)-paise(l.absence)+paise(l.bonus));add(prod?'5201':'6102',paise(l.ot_pay))}
  const t=payrollTotals(source.lines);
  return [...Object.entries(cost).filter(([,c])=>c).map(([a,c])=>line(a,pkr(c),0)),...(t.net?[line('2301',0,t.net)]:[]),...(t.advance?[line('1102',0,t.advance)]:[]),...(t.deductions?[line('2302',0,t.deductions)]:[])];
 }
 throw Error('Unsupported HR posting.');
}

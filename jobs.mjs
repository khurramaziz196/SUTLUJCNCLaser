// Job card rules: production stage, part weights, scrap and utilisation, labour rates and job costing.
// Machine and labour time are costing allocations only; wages post through payroll, material through
// stock issues and other job costs through booked expenses.
import {densities} from './inventory.mjs';

export const priorities=['Normal','Urgent','Low'];
export const qcStatuses=['Pending','Passed','Rework','Not required'];
export const labourTasks=['Design / CAD','Machine operation','Loading / unloading','Deburring / finishing','Bending','Quality check','Packing / dispatch'];
// Job expense types and the direct-cost account each is booked to.
export const jobExpenseTypes={'Assist gas - oxygen':'5101','Assist gas - nitrogen':'5102','Nozzles / lenses':'5103','Other consumables':'5104','Outsourced bending / fabrication':'5202','Job transport':'5203'};

const paise=v=>Math.round(Number(v)*100);
const round1=v=>Math.round(v*10)/10;

// Scope of work: each job has its own ordered task list. The four standard tasks keep the
// original work order fields (design/material/cutting/QC status) in step, so cloud jobs and
// older jobs without a task list still work.
export const taskStatuses=['Pending','In progress','Done','Not required'];
export const standardTasks=[['design','Design'],['material','Material'],['cutting','Cutting'],['qc','Quality check']];
export const extraTasks=['Bending','Welding / fabrication','Deburring / finishing','Powder coating / painting','Packing','Delivery / dispatch'];
export const defaultScope=()=>standardTasks.map(([key,name])=>({id:key,key,name,status:'Pending'}));
const settled=t=>t.status==='Done'||t.status==='Not required';

export function scopeOf(job){
 if(Array.isArray(job.scope)&&job.scope.length)return job.scope;
 const from={design:{Ready:'Done','Not required':'Not required','In progress':'In progress'}[job.design_status],material:job.material_status==='Ready'?'Done':undefined,cutting:{Done:'Done','In progress':'In progress'}[job.cutting_status],qc:{Passed:'Done','Not required':'Not required',Rework:'In progress'}[job.qc_status]};
 return defaultScope().map(t=>({...t,status:from[t.key]||'Pending'}));
}
export function legacyFromScope(scope){
 const st=k=>scope.find(t=>t.key===k)?.status;
 const design=st('design'),material=st('material'),cutting=st('cutting'),qc=st('qc');
 return {design_status:!design||design==='Not required'?'Not required':design==='Done'?'Ready':design==='In progress'?'In progress':'Pending',
  material_status:!material||settled({status:material})?'Ready':'Pending',
  cutting_status:!cutting||settled({status:cutting})?'Done':cutting==='In progress'?'In progress':'Pending',
  qc_status:!qc||qc==='Not required'?'Not required':qc==='Done'?'Passed':'Pending'};
}
// Progress per task: Done counts 100%, In progress its own percentage, otherwise 0.
export const taskProgress=t=>t.status==='Done'?100:t.status==='In progress'?Math.max(0,Math.min(100,Number(t.progress)||0)):0;
export function scopeProgress(scope){const tasks=scope.filter(t=>t.status!=='Not required');return tasks.length?Math.round(tasks.reduce((n,t)=>n+taskProgress(t),0)/tasks.length):0}
export function jobStage(job,invoiced){
 if(invoiced)return 'Invoiced';
 if(job.status==='Completed')return 'Ready to invoice';
 const tasks=scopeOf(job).filter(t=>t.status!=='Not required'),next=tasks.find(t=>t.status!=='Done');
 if(!next)return 'Ready to complete';
 if(next.status==='In progress')return taskProgress(next)?`${next.name} ${taskProgress(next)}%`:next.name;
 return tasks.some(t=>t.status!=='Pending')?`Awaiting ${next.name}`:'Not started';
}
export function completionProblem(job){
 const scope=scopeOf(job),open=scope.filter(t=>!settled(t));
 if(!scope.some(t=>t.status==='Done'))return 'Mark at least one task done before completing the job.';
 if(open.length)return `Finish or mark N/A: ${open.map(t=>t.name).join(', ')}.`;
 // Business material must come out of stock so inventory and job cost are right. Customer material can be
 // issued from customer stock or described in the notes. Cloud jobs (no stock_issued flag) keep the text rule.
 if(scope.find(t=>t.key==='material')?.status==='Done'){
  const noted=String(job.material_used||'').trim();
  if(job.stock_issued===undefined){if(!noted)return 'Record the material used.'}
  else if(!job.stock_issued&&job.material_owner!=='Customer')return 'Issue the material from stock (Material from stock → Issue from stock) before completing.';
  else if(!job.stock_issued&&!noted)return 'Issue the customer material from stock, or describe it in Material notes.';
 }
 return '';
}

// Net weight of the cut parts on one quote line from the part's overall size (rectangular blank).
export function partWeightKg(line,size={}){
 const d=densities[line.material],l=Number(size.length),w=Number(size.width),t=Number(line.thickness_mm),q=Number(line.quantity);
 if(!d||!(l>0)||!(w>0)||!(t>0)||!(q>0))return null;
 return Math.round(l*w*t*d*q/1000)/1000;
}

// Scrap = material consumed - net part weight. Utilisation = net / consumed.
export function scrapSummary(netKg,consumedKg){
 netKg=Number(netKg)||0;consumedKg=Number(consumedKg)||0;
 // Scrap needs both sides: part sizes for the net weight, and the material consumed.
 if(!(consumedKg>0)||!(netKg>0))return {netKg:round1(netKg),consumedKg:round1(consumedKg),scrapKg:null,scrapPct:null,utilisationPct:null};
 const scrap=Math.max(0,consumedKg-netKg);
 return {netKg:round1(netKg),consumedKg:round1(consumedKg),scrapKg:round1(scrap),scrapPct:Math.round(scrap/consumedKg*1000)/10,utilisationPct:Math.round(Math.min(netKg,consumedKg)/consumedKg*1000)/10};
}

// Default hourly labour rate: monthly salary over 30 days of 8 hours, or a daily wage over 8 hours.
export function hourlyRate(employee){if(!employee)return 0;const r=Number(employee.rate)||0;return Math.round((employee.pay_type==='Daily'?r/8:r/30/8)*100)/100}

export function validateLabour(entry){
 const h=Number(entry.hours),rate=Number(entry.rate);
 if(!String(entry.name||'').trim())throw Error('Choose who did the work.');
 if(!labourTasks.includes(entry.task))throw Error('Choose the task.');
 if(!Number.isFinite(h)||h<=0||h>24)throw Error('Enter hours between 0 and 24.');
 if(!Number.isFinite(rate)||rate<0||rate>100000)throw Error('Enter an hourly rate of zero or more.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(entry.date||''))throw Error('Enter the date.');
 return {...entry,hours:Math.round(h*100)/100,rate:Math.round(rate*100)/100};
}
export const labourCost=entries=>entries.reduce((n,e)=>n+Math.round(paise(e.rate)*Number(e.hours)),0)/100;

export function jobCosting({revenue=0,material=0,machineMinutes=0,machineRate=0,labour=0,expenses=0}){
 const machine=Math.round(paise(machineRate)*Number(machineMinutes)/60)/100;
 const cost=(paise(material)+paise(machine)+paise(labour)+paise(expenses))/100;
 const margin=(paise(revenue)-paise(cost))/100;
 return {revenue:Number(revenue),material:Number(material),machine,labour:Number(labour),expenses:Number(expenses),cost,margin,marginPct:Number(revenue)>0?Math.round(margin/Number(revenue)*1000)/10:null};
}

// Scope per line item: scope_lines[lineIndex][taskId] = {status, progress, done_at}. Lines without their own
// entry follow the job-level task. The job-level task is then derived from its lines: N/A when every line is
// N/A, Done when every applicable line is done, Pending when none has started, otherwise In progress with
// the average of the lines.
export function lineCell(scopeLines, li, task) {
 const c = scopeLines?.[li]?.[task.id];
 return c ? {status: c.status || 'Pending', progress: Number(c.progress) || 0, done_at: c.done_at || '', done_qty: c.done_qty ?? null} : {status: task.status || 'Pending', progress: Number(task.progress) || 0, done_at: task.done_at || '', done_qty: null};
}
export function deriveScope(scope, scopeLines, lineCount) {
 const n = Math.max(1, lineCount || 1);
 return scope.map(t => {
  const cells = Array.from({length: n}, (_, i) => lineCell(scopeLines, i, t)), app = cells.filter(c => c.status !== 'Not required');
  if (!app.length) return {...t, status: 'Not required', progress: 0, done_at: ''};
  if (app.every(c => c.status === 'Done')) return {...t, status: 'Done', progress: 100, done_at: app.map(c => c.done_at).filter(Boolean).sort().pop() || t.done_at || ''};
  if (app.every(c => c.status === 'Pending')) return {...t, status: 'Pending', progress: 0, done_at: ''};
  return {...t, status: 'In progress', progress: Math.round(app.reduce((s, c) => s + taskProgress(c), 0) / app.length), done_at: ''};
 });
}
export function lineProgress(scope, scopeLines, li) {
 const cells = scope.map(t => lineCell(scopeLines, li, t)).filter(c => c.status !== 'Not required');
 return cells.length ? Math.round(cells.reduce((s, c) => s + taskProgress(c), 0) / cells.length) : 0;
}
// Every line gets its own copy of every task, so later changes no longer follow the job-level value.
export function materializeLines(scope, scopeLines, lineCount) {
 const out = {};
 for (let i = 0; i < Math.max(1, lineCount || 1); i++) { out[i] = {}; for (const t of scope) out[i][t.id] = lineCell(scopeLines, i, t); }
 return out;
}

// Piece counting: a task on a line with more than one piece is tracked as pieces done (0…qty); the status and %
// follow from the count. Design (per drawing) and Material (per sheet issued) stay a simple status.
export const countsPieces = (task, qty) => Number(qty) > 1 && !['design', 'material'].includes(task.key);
export function cellFromCount(prev, done, qty, today) {
 const q = Math.max(1, Math.ceil(Number(qty) || 1)), n = Math.max(0, Math.min(q, Math.round(Number(done) || 0)));
 const status = n === 0 ? 'Pending' : n === q ? 'Done' : 'In progress';
 return {status, progress: Math.round(n / q * 100), done_qty: n, done_at: status === 'Done' ? (prev?.done_at || today) : ''};
}
export function piecesDone(cell, qty) { const q = Math.ceil(Number(qty) || 1); return cell.done_qty != null ? cell.done_qty : cell.status === 'Done' ? q : cell.status === 'In progress' ? Math.round((Number(cell.progress) || 0) * q / 100) : 0; }

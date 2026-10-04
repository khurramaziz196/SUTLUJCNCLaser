import {accountList} from './accounts.mjs?v=hr-1';
import {lineCents} from './invoice-math.mjs?v=area-1';
import {stockLines} from './inventory.mjs';
import {hrKinds,hrLines} from './hr.mjs';
import {scrapKinds,scrapLines} from './scrap.mjs';
import {partyKinds,partyLines} from './parties.mjs?v=1';
export const toCents=v=>Math.round(Number(v)*100);
export function validateJournal(lines){
 if(!Array.isArray(lines)||lines.length<2||lines.length>100)throw Error('Use between 2 and 100 journal lines.');
 let debit=0,credit=0;
 for(const l of lines){if(!accountList.some(a=>a.code===l.account))throw Error('Choose a posting account for every line.');
 const d=Number(l.debit),c=Number(l.credit);
 if(!Number.isFinite(d)||!Number.isFinite(c)||d<0||c<0||d>1e9||c>1e9||Math.abs(d*100-toCents(d))>0.00001||Math.abs(c*100-toCents(c))>0.00001||(d>0)===(c>0))throw Error('Each line needs a positive debit or credit, with up to two decimals.');
 debit+=toCents(d);credit+=toCents(c);}
 if(debit!==credit)throw Error('Debits and credits must balance.');
 return debit/100;
}
export function sourceLines(kind,source,account,offset){
 const line=(account,debit,credit)=>({account,debit,credit});
 if(kind==='invoice'){
 if(!accountList.some(a=>a.code===account&&a.type==='Revenue'))throw Error('Select a revenue account.');
 const net=source.lines.reduce((n,l)=>n+lineCents(l),0),tax=toCents(source.amount)-net;
 if(tax<0)throw Error('Invoice total is inconsistent.');
 return [line('1101',source.amount,0),line(account,0,net/100),...(tax?[line('2202',0,tax/100)]:[])];}
 if(kind==='payment'){const bank={'Business Bank Account':'1002','Cash on Hand':'1001','Petty Cash':'1003'}[source.method];if(!bank)throw Error('Unknown payment account.');return [line(bank,source.amount,0),line('1101',0,source.amount)];}
 if(kind==='expense'){if(!source.account_code)throw Error('Classify the expense first.');if(!['1001','1002','1003','2004'].includes(offset)||source.status==='Pending'&&offset!=='2004'||source.status==='Paid'&&offset==='2004')throw Error('Select cash/bank for a paid expense, or payables for a pending expense.');return [line(source.account_code,source.amount,0),line(offset,0,source.amount)];}
 if(kind==='stock')return stockLines(source,source.item,offset);
 if(hrKinds.includes(kind))return hrLines(kind,source);
 if(scrapKinds.includes(kind))return scrapLines(kind,source);
 if(partyKinds.includes(kind))return partyLines(kind,source);
 throw Error('Unsupported posting source.');
}
export function reverseLines(lines){return lines.map(l=>({account:l.account,debit:l.credit,credit:l.debit}));}
export function ledgerReport(journals,from,to){
 const period={},closing={};
 for(const j of journals){if(j.date>to)continue;for(const l of j.lines){const n=toCents(l.debit)-toCents(l.credit);closing[l.account]=(closing[l.account]||0)+n;if(j.date>=from)period[l.account]=(period[l.account]||0)+n;}}
 const total=type=>accountList.filter(a=>a.type===type).reduce((n,a)=>n+(period[a.code]||0),0)/100;
 const revenue=-total('Revenue'),direct=total('Direct cost'),expenses=total('Expense');
 return {period,closing,revenue,direct,expenses,gross:revenue-direct,net:revenue-direct-expenses};
}

// Scrap sales: scrap metal weighed out of the scrap bins and sold by the kilogram.
// A sale credits Scrap Sales (4302), with any sales tax to VAT Output (2202). Cash sales debit the
// cash/bank account received into; credit sales debit Customer Receivables (1101) until received.
export const scrapPayAccounts={'Cash on Hand':'1001','Business Bank Account':'1002','Petty Cash':'1003'};
export const scrapKinds=['scrapsale','scrapreceipt'];
const paise=v=>Math.round(Number(v)*100);

export function scrapSaleTotals(lines,taxPct=0){
 const net=lines.reduce((n,l)=>n+Math.round(Number(l.kg)*paise(l.rate)),0),tax=Math.round(net*Number(taxPct||0)/100);
 return {kg:Math.round(lines.reduce((n,l)=>n+Number(l.kg),0)*100)/100,net:net/100,tax:tax/100,total:(net+tax)/100};
}

// lines: [{item_id, kg, rate}], onHand: item_id -> kg recorded in the yard.
// byWeight: sell the weighed kg even when more than recorded (the extra is added to the yard first).
export function validateScrapSale(sale,onHand,{byWeight=false}={}){
 if(!String(sale.buyer||'').trim())throw Error('Enter the buyer.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(sale.date||''))throw Error('Enter the sale date.');
 const lines=(sale.lines||[]).filter(l=>Number(l.kg)>0);
 if(!lines.length)throw Error('Enter the kilograms sold for at least one material.');
 for(const l of lines){
  const kg=Number(l.kg),rate=Number(l.rate);
  if(!Number.isFinite(kg)||kg>1e7||Math.abs(kg*100-Math.round(kg*100))>1e-6)throw Error('Enter weights in kg with up to two decimals.');
  if(!byWeight&&kg>Number(onHand[l.item_id]||0)+1e-9)throw Error(`Only ${onHand[l.item_id]||0} kg of ${l.label||'this scrap'} is in the yard.`);
  if(!Number.isFinite(rate)||rate<=0||rate>1e6)throw Error(`Enter the rate per kg for ${l.label||'each material'}.`);
 }
 const tax=Number(sale.tax||0);if(!Number.isFinite(tax)||tax<0||tax>100)throw Error('Enter sales tax between 0 and 100%.');
 if(sale.method!=='Credit'&&!scrapPayAccounts[sale.method])throw Error('Choose where the money was received, or On credit.');
 return {...sale,lines,tax};
}

// Average rate actually realised per kg, overall or for one material.
export function averageRate(sales,material){
 let kg=0,value=0;
 for(const s of sales)for(const l of s.lines)if(!material||l.material===material){kg+=Number(l.kg);value+=Number(l.kg)*Number(l.rate)}
 return kg?Math.round(value/kg*100)/100:0;
}
export function lastRate(sales,material){
 const s=[...sales].sort((a,b)=>b.date.localeCompare(a.date)||String(b.created_at).localeCompare(String(a.created_at))).find(x=>x.lines.some(l=>l.material===material));
 return s?Number(s.lines.find(l=>l.material===material).rate):0;
}

export function scrapLines(kind,sale){
 const line=(account,debit,credit)=>({account,debit,credit});
 const t=scrapSaleTotals(sale.lines,sale.tax);
 if(kind==='scrapsale'){
  const debit=sale.method==='Credit'?'1101':scrapPayAccounts[sale.method];if(!debit)throw Error('Unknown cash/bank account.');
  return [line(debit,t.total,0),line('4302',0,t.net),...(t.tax?[line('2202',0,t.tax)]:[])];
 }
 if(kind==='scrapreceipt'){const bank=scrapPayAccounts[sale.received_method];if(!bank)throw Error('Unknown cash/bank account.');return [line(bank,t.total,0),line('1101',0,t.total)]}
 throw Error('Unsupported scrap posting.');
}

// Movements that bring a bin to a weighed figure: positive adds scrap, negative writes the recorded excess off.
export function weighAdjustment(recordedKg,weighedKg){const d=Math.round((Number(weighedKg)-Number(recordedKg))*100)/100;return Math.abs(d)<0.005?0:d}

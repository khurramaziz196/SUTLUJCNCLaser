// Sheet-metal inventory rules. Values are PKR with two decimals; calculations use paise.
// Sheets and remnants are counted in whole pieces and valued at weighted average cost.
// Consumables (gas, nozzles, lenses) are counted for reordering only: their cost is
// expensed to the chosen 51xx account when received, so they carry no stock value.
// Customer-owned material is counted but never valued or posted.
// A movement's `value` is the change in stock value; `amount` is money spent on
// consumables or received for scrap, which is posted but never held as stock.
import {materials,matchGauge,inferThickness} from './gauge.mjs';

export const densities={steel:7.85,galvanized:7.85,stainless:7.93,aluminium:2.70}; // g/cm³, nominal
export const materialCodes={steel:'MS',stainless:'SS',aluminium:'AL',galvanized:'GI'};
export const sheetSizes=[[1220,2440,'4 × 8 ft'],[1220,3050,'4 × 10 ft'],[1250,2500,''],[1500,3000,''],[1524,3048,'5 × 10 ft']];
export const categoryLabels={sheet:'Sheet',remnant:'Remnant',consumable:'Consumable',scrap:'Scrap'};
export const consumableUnits=['cylinder','pcs','kg','litre','box'];
export const consumableAccounts=['5101','5102','5103','5104'];
export const moveLabels={receipt:'Receipt',issue:'Issue to job',offcut:'Offcut returned',scrap:'Scrap from job',adjust:'Count adjustment',dispose:'Disposal / return'};
export const receiptOffsets=['2001','2002','2003','1001','1002','1003','3001'];
export const saleAccounts={'Cash on Hand':'1001','Business Bank Account':'1002','Petty Cash':'1003'};

const paise=v=>Math.round(Number(v)*100);
export const qty3=v=>Math.round(Number(v)*1000)/1000;
const isSheet=item=>['sheet','remnant'].includes(item?.category);
export const isWhole=item=>isSheet(item)||item?.unit==='cylinder'||item?.unit==='pcs'||item?.unit==='box';
export const unitOf=item=>item.category==='sheet'?'sheet':item.category==='remnant'?'piece':item.category==='scrap'?'kg':item.unit||'pcs';

export function sheetWeightKg(item){
 if(!isSheet(item))return null;
 const d=densities[item.material],l=Number(item.length_mm),w=Number(item.width_mm),t=Number(item.thickness_mm);
 if(!d||!(l>0)||!(w>0)||!(t>0))return null;
 return Math.round(l*w*t*d/1000)/1000; // mm³ × g/cm³ ÷ 1e6 = kg, kept to 0.001 kg
}

// Sheet size as feet and inches when it is a whole-foot sheet (4' × 8'), with mm; otherwise mm only.
export function sizeName(w,l){w=Number(w);l=Number(l);const inch=v=>v/25.4,whole=v=>Math.abs(inch(v)/12-Math.round(inch(v)/12))<0.01;return whole(w)&&whole(l)?`${Math.round(inch(w)/12)}' × ${Math.round(inch(l)/12)}' (${Math.round(w)} × ${Math.round(l)} mm)`:`${Math.round(inch(w)*10)/10}" × ${Math.round(inch(l)*10)/10}" (${Math.round(w)} × ${Math.round(l)} mm)`}
export function itemLabel(item){
 if(item.category==='consumable')return item.name||'Consumable';
 if(item.category==='scrap')return `Scrap - ${materials[item.material]||'mixed metal'}`;
 const g=matchGauge(item.material,item.thickness_mm);
 return [`${materials[item.material]||'Material'}${item.grade?' '+item.grade:''}`,`${Number(item.thickness_mm)} mm${g?` (${g.gauge} ga)`:''}`,sizeName(item.width_mm,item.length_mm)].join(' · ');
}

// Sequential references such as SM-0007, based on the highest existing number.
export function nextReference(prefix,list,field='reference'){
 const n=list.reduce((max,r)=>{const m=String(r[field]||'').match(new RegExp('^'+prefix+'-(\\d+)$'));return m?Math.max(max,Number(m[1])):max},0);
 return `${prefix}-${String(n+1).padStart(4,'0')}`;
}

export function itemCode(item,items){
 if(item.category==='consumable')return nextReference('CON',items,'code');
 if(item.category==='remnant')return nextReference('REM',items,'code');
 if(item.category==='scrap')return `SCRAP-${materialCodes[item.material]||'MIX'}`;
 const base=`${materialCodes[item.material]}${item.grade?'-'+String(item.grade).toUpperCase().replace(/[^A-Z0-9]/g,''):''}-${Number(item.thickness_mm)}-${Math.round(Number(item.width_mm))}x${Math.round(Number(item.length_mm))}`;
 return item.owner==='Customer'?nextReference('CUST-'+base,items,'code'):base;
}

const sameStock=(a,b)=>a.category===b.category&&a.owner===b.owner&&(a.customer||'')===(b.customer||'')&&(a.category==='consumable'?String(a.name).trim().toLowerCase()===String(b.name).trim().toLowerCase():a.material===b.material&&String(a.grade||'').trim().toLowerCase()===String(b.grade||'').trim().toLowerCase()&&Number(a.thickness_mm)===Number(b.thickness_mm)&&Number(a.length_mm)===Number(b.length_mm)&&Number(a.width_mm)===Number(b.width_mm));

export function validateItem(item,items){
 if(!['sheet','remnant','consumable'].includes(item.category))throw Error('Choose a stock category.');
 if(!['Business','Customer'].includes(item.owner))throw Error('Choose who owns this material.');
 if(item.owner==='Customer'&&!String(item.customer||'').trim())throw Error('Choose the customer who owns this material.');
 if(item.owner==='Customer'&&item.category==='consumable')throw Error('Consumables are business stock.');
 if(isSheet(item)){
  if(!densities[item.material])throw Error('Choose a material.');
  for(const [k,label,max] of [['thickness_mm','thickness',100],['length_mm','length',20000],['width_mm','width',20000]]){const v=Number(item[k]);if(!Number.isFinite(v)||v<=0||v>max)throw Error(`Enter a ${label} between 0 and ${max} mm.`)}
  if(Number(item.width_mm)>Number(item.length_mm))throw Error('Enter the shorter side as width.');
 }else{
  if(!String(item.name||'').trim())throw Error('Enter the consumable name.');
  if(!consumableUnits.includes(item.unit))throw Error('Choose a unit.');
  if(!consumableAccounts.includes(item.account))throw Error('Choose the consumable cost account.');
 }
 const reorder=Number(item.reorder_level||0);if(!Number.isFinite(reorder)||reorder<0||reorder>1e6)throw Error('Enter a reorder level of zero or more.');
 if(items.some(x=>x.id!==item.id&&x.category!=='remnant'&&sameStock(x,item)))throw Error('This stock item already exists. Receive into the existing item instead.');
 return item;
}

export function balances(moves){
 const map=new Map();
 for(const m of moves){const b=map.get(m.item_id)||{qty:0,value:0};b.qty=qty3(b.qty+Number(m.quantity));b.value+=paise(m.value);map.set(m.item_id,b)}
 return map;
}
export function balanceOf(itemId,moves){const b=balances(moves.filter(m=>m.item_id===itemId)).get(itemId)||{qty:0,value:0};return {qty:b.qty,value:b.value/100,avg:b.qty>0?Math.round(b.value/b.qty)/100:0}}

// Cost of taking q units out at weighted average; taking the last unit clears any rounding remainder.
export function outValue(balance,q){
 q=qty3(q);if(!(q>0))throw Error('Enter a quantity above zero.');
 if(q>balance.qty)throw Error(`Only ${balance.qty} available.`);
 return q===balance.qty?balance.value:Math.round(paise(balance.value)*q/balance.qty)/100;
}

export function validateQuantity(item,q){
 q=Number(q);
 if(!Number.isFinite(q)||q<=0||q>1e6)throw Error('Enter a quantity above zero.');
 if(isWhole(item)&&!Number.isInteger(q))throw Error(`${isSheet(item)?'Sheets':'This item'} must be counted in whole numbers.`);
 if(Math.abs(q*1000-Math.round(q*1000))>1e-6)throw Error('Use up to three decimal places.');
 return qty3(q);
}

// Unit cost per sheet from a per-sheet or per-kg rate (steel is commonly priced per kg).
export function unitCost(item,basis,rate){
 rate=Number(rate);if(!Number.isFinite(rate)||rate<0||rate>1e9)throw Error('Enter a rate of zero or more.');
 if(basis!=='kg')return Math.round(rate*100)/100;
 const kg=sheetWeightKg(item);if(!kg)throw Error('A per-kg rate needs a sheet with material and size.');
 return Math.round(rate*kg*100)/100;
}

// A usable offcut takes its share of one sheet's cost in proportion to area.
export function offcutValue(item,perSheetCost,length,width){
 length=Number(length);width=Number(width);
 if(!isSheet(item))throw Error('Offcuts can only come from sheets or remnants.');
 if(!(length>0)||!(width>0))throw Error('Enter the offcut length and width.');
 const [l,w]=[Math.max(length,width),Math.min(length,width)];
 if(l>Number(item.length_mm)||w>Number(item.width_mm)||l*w>=Number(item.length_mm)*Number(item.width_mm))throw Error('The offcut must be smaller than the sheet it came from.');
 return {length_mm:l,width_mm:w,value:Math.round(paise(perSheetCost)*l*w/(Number(item.length_mm)*Number(item.width_mm)))/100};
}

export function inventoryAccount(item){return item.category==='consumable'?item.account:{steel:'1201',galvanized:'1201',stainless:'1202',aluminium:'1203'}[item.material]}
export function suggestedOffset(item){return item.category!=='consumable'?'2001':['5101','5102'].includes(item.account)?'2002':'2003'}

export function isPostable(move,item){
 if(!item||item.owner!=='Business')return false;
 if(move.type==='dispose'||item.category==='consumable')return ['dispose','receipt'].includes(move.type)&&paise(move.amount)>0;
 return paise(move.value)!==0;
}

export function stockLines(move,item,offset){
 if(!isPostable(move,item))throw Error('This stock movement has no accounting value.');
 const line=(account,debit,credit)=>({account,debit,credit}),v=Math.abs(paise(move.value))/100,stock=inventoryAccount(item);
 if(move.type==='dispose'){const bank=saleAccounts[move.method];if(!bank)throw Error('Unknown cash/bank account.');return [line(bank,Number(move.amount),0),line('4302',0,Number(move.amount))]}
 if(move.type==='receipt'){if(!receiptOffsets.includes(offset))throw Error('Select the supplier payable, cash/bank, or owner capital for opening stock.');const cost=item.category==='consumable'?Number(move.amount):v;return [line(stock,cost,0),line(offset,0,cost)]}
 const cost='5001';
 if(move.type==='issue')return [line(cost,v,0),line(stock,0,v)];
 if(move.type==='offcut')return [line(stock,v,0),line(cost,0,v)];
 if(move.type==='adjust')return paise(move.value)>0?[line(stock,v,0),line(cost,0,v)]:[line(cost,v,0),line(stock,0,v)];
 throw Error('Unsupported stock movement.');
}

export function needsReorder(item,balance){return item.owner==='Business'&&['sheet','consumable'].includes(item.category)&&Number(item.reorder_level)>0&&balance.qty<=Number(item.reorder_level)}

// Material cost of a job: sheets issued less usable offcuts returned.
export function jobMaterialCost(jobId,moves){return moves.filter(m=>m.job_id===jobId&&['issue','offcut'].includes(m.type)).reduce((n,m)=>n-paise(m.value),0)/100}

// Goods received against purchase orders. Each receipt records the PO line it fills; a line is done
// when a receipt for it was marked fully received. Older receipts linked to a PO without a line
// (made before line-by-line receiving) count as receiving the whole order.
export function poReceiptStatus(po,moves){
 const linked=moves.filter(m=>m.type==='receipt'&&m.po_id===po.id),legacy=linked.some(m=>m.po_line==null);
 const lines=(po.lines||[]).map((line,index)=>{const own=linked.filter(m=>m.po_line===index);return {index,line,receivedQty:qty3(own.reduce((n,m)=>n+Number(m.quantity),0)),complete:legacy||own.some(m=>m.line_complete)}});
 return {lines,done:lines.filter(l=>l.complete).length,pending:lines.some(l=>!l.complete)};
}
// Sheet size written in a description, e.g. "1220 × 2440 mm" -> width 1220, length 2440.
export function sizeFromText(text){const m=String(text||'').match(/(\d{3,5})\s*[×xX*]\s*(\d{3,5})/);if(!m)return null;const a=Number(m[1]),b=Number(m[2]);return {width_mm:Math.min(a,b),length_mm:Math.max(a,b)}}
// What a PO line describes, as a business sheet item (material, thickness and size), when it can be read.
export function itemFromPOLine(line){
 const ft=Number(line.width_ft)>0&&Number(line.length_ft)>0?{width_mm:Math.round(Math.min(line.width_ft,line.length_ft)*304.8*10)/10,length_mm:Math.round(Math.max(line.width_ft,line.length_ft)*304.8*10)/10}:null;
 const l=inferThickness(line),size=ft||sizeFromText(line.description);
 if(!densities[l.material]||!(Number(l.thickness_mm)>0)||!size)return null;
 return {category:'sheet',owner:'Business',customer:'',material:l.material,grade:'',thickness_mm:Number(l.thickness_mm),...size,reorder_level:0,location:''};
}
export function matchStockItem(line,items){
 const want=itemFromPOLine(line);if(!want)return null;
 return items.find(i=>i.category==='sheet'&&i.owner==='Business'&&i.material===want.material&&Math.abs(Number(i.thickness_mm)-want.thickness_mm)<0.0005&&Math.abs(Number(i.width_mm)-want.width_mm)<3&&Math.abs(Number(i.length_mm)-want.length_mm)<3)||null;
}

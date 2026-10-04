// Job card for the workshop floor: job details, parts to cut, material issued, instructions and stage sign-off.
import {materials,matchGauge} from './gauge.mjs';
export async function createJobCardPDF(job, quote, materialRows, logoBytes, PDFLib, context={}) {
  const {PDFDocument, StandardFonts, rgb}=PDFLib;
  const company=context.company||{name:'GR Synergy Ventures'};
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica), bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink=rgb(.10,.17,.21), blue=rgb(.06,.26,.45), muted=rgb(.40,.46,.49), line=rgb(.86,.89,.91), white=rgb(1,1,1), tint=rgb(.95,.97,.98);
  const logo=await pdf.embedJpg(logoBytes);
  const clean=v=>String(v??'').replace(/\r\n/g,'\n').replace(/[‐-―]/g,'-').replace(/\t/g,'    ');
  const lines=quote?.lines||[];
  try{[job.material_used,job.party,job.reference,job.quote_reference,job.design_reference,job.machine,job.operator_name,job.notes,quote?.description,...lines.map(l=>l.description),...materialRows.flat()].forEach(v=>regular.encodeText(clean(v).replace(/\n/g,' ')))}
  catch{throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this job.');}
  const wrap=(value,width,size=10,font=regular)=>{const out=[];for(const p of clean(value).split('\n')){let cur='';for(const word of p.split(/ +/)){if(!word)continue;if(font.widthOfTextAtSize(cur?cur+' '+word:word,size)<=width){cur=cur?cur+' '+word:word;continue}if(cur)out.push(cur);cur=word}out.push(cur)}return out};
  let page,y;
  const text=(v,x,yy,size=10,font=regular,color=ink)=>page.drawText(clean(v),{x,y:yy,size,font,color});
  const right=(v,x,yy,size=10,font=regular,color=ink)=>text(v,x-font.widthOfTextAtSize(clean(v),size),yy,size,font,color);
  const rule=yy=>page.drawLine({start:{x:42,y:yy},end:{x:553,y:yy},thickness:.5,color:line});
  const label=(v,x,yy)=>text(v,x,yy,8,bold,muted);
  const newPage=()=>{page=pdf.addPage([595.28,841.89]);y=790;text(`JOB CARD ${job.reference}`,42,y,10,bold,blue);right(job.party,553,y,9,regular,muted);rule(776);y=752};
  const ensure=h=>{if(y-h<70)newPage()};
  page=pdf.addPage([595.28,841.89]);
  page.drawImage(logo,{x:38,y:728,width:80,height:80});
  text(company.name,128,790,14,bold,blue);text('Workshop job card',128,774,9,regular,muted);
  right('JOB CARD',553,792,22,bold,blue);right(job.reference,553,770,12,bold);
  if(job.priority==='Urgent'){page.drawRectangle({x:483,y:742,width:70,height:18,color:rgb(.63,.27,.11)});text('URGENT',497,748,9,bold,white)}
  y=716;rule(y);y-=22;
  const facts=[['Customer',job.party],['Quotation',job.quote_reference],['Job opened',String(job.created_at||'').slice(0,10)],['Due date',job.due_date||'-'],['Priority',job.priority||'Normal'],['Operator',job.operator_name||'-'],['Machine',job.machine||'-'],['Drawing / DXF',job.design_reference||'-'],['Material owner',job.material_owner||'Business'],['Est. cutting time',job.est_minutes?`${job.est_minutes} min`:'-']];
  facts.forEach(([k,v],i)=>{const x=i%2?310:42,yy=y-Math.floor(i/2)*17;text(k,x,yy,8.5,regular,muted);text(wrap(v,150,9.5,bold)[0]||'',x+92,yy,9.5,bold)});
  y-=Math.ceil(facts.length/2)*17+8;
  if(quote?.description){label('PROJECT',42,y);y-=14;for(const r of wrap(quote.description,511,10)){text(r,42,y);y-=13}y-=6}
  const header=(cols)=>{ensure(40);page.drawRectangle({x:42,y:y-8,width:511,height:24,color:blue});cols.forEach(([t,x,align])=>align==='r'?right(t,x,y,8.5,bold,white):text(t,x,y,8.5,bold,white));y-=28};
  label('PARTS TO CUT',42,y);y-=22;
  header([['#',50],['PART / DESCRIPTION',70],['MATERIAL & THICKNESS',290],['SIZE W x L (IN)',430],['QTY',545,'r']]);
  lines.forEach((l,i)=>{const size=job.parts?.[i];const g=matchGauge(l.material,l.thickness_mm);const mat=l.thickness_mm?`${materials[l.material]||''} ${g?`${g.gauge} ga`:`${Number(l.thickness_mm)} mm`}`.trim():'-';const desc=wrap(l.description,210,9.5);ensure(desc.length*13+10);desc.forEach((r,j)=>text(r,70,y-j*13,9.5));text(String(i+1),50,y,9.5,regular,muted);text(wrap(mat,135,9)[0],290,y,9);text(context.sheetPlan?.lines?.[i]?.size||(size?.length&&size?.width?`${size.width} x ${size.length} mm`:'-'),430,y,9);right(String(l.quantity),545,y,9.5,bold);y-=desc.length*13+6;rule(y+2);y-=10});
  const plan=context.sheetPlan;
  if(plan?.lines?.some(p=>p.sheets)){y-=6;label('SHEET PLAN',42,y);y-=22;header([['#',50],['PART',70],['CUT FROM SHEET',260],['PCS / SHEET',440,'r'],['SHEETS',545,'r']]);plan.lines.forEach((p,i)=>{if(!p.sheet)return;ensure(18);text(String(i+1),50,y,9,regular,muted);text(wrap(lines[i]?.description||'',180,9)[0]||'',70,y,9);text(p.sheet,260,y,9);right(p.per,440,y,9);right(p.sheets,545,y,9.5,bold);y-=14;rule(y+4);y-=4});for(const g of plan.groups||[]){ensure(16);text(g,70,y,9.5,bold,blue);y-=14}y-=4}
  if(materialRows.length){y-=6;label('MATERIAL ISSUED FROM STOCK',42,y);y-=22;header([['MOVEMENT',50],['ITEM',130],['DESCRIPTION',230],['QTY',545,'r']]);for(const r of materialRows){ensure(18);text(r[0],50,y,9);text(r[1],130,y,9);text(wrap(r[2],250,8.5)[0],230,y,8.5,regular,muted);right(r[3],545,y,9);y-=14;rule(y+4);y-=4}}
  if(String(job.material_used||'').trim()){y-=8;ensure(40);label(materialRows.length?'MATERIAL NOTES':'MATERIAL',42,y);y-=14;for(const r of wrap(job.material_used,511,9.5)){ensure(13);text(r,42,y,9.5);y-=13}}
  if(String(job.notes||'').trim()){y-=8;ensure(40);label('INSTRUCTIONS',42,y);y-=14;for(const r of wrap(job.notes,511,9.5)){ensure(13);text(r,42,y,9.5);y-=13}}
  y-=12;ensure(70+(context.stages?.length||5)*24);label('SCOPE OF WORK - SIGN-OFF',42,y);y-=22;
  header([['TASK',50],['DONE BY',170],['DATE',320],['SIGNATURE',420]]);
  for(const stage of context.stages||['Design','Material','Cutting','Quality check','Dispatched / collected']){text(stage,50,y,9.5);y-=10;rule(y);y-=14}
  y-=6;text(`Actual cutting time: ________ min    Sheets used: ________    Scrap weight: ________ kg`,42,y,9,regular,muted);
  const pages=pdf.getPages();
  pages.forEach((p,i)=>{page=p;rule(52);text(`${company.name} | Internal job card - not for the customer`,42,38,8,regular,muted);right(`Page ${i+1} of ${pages.length}`,553,38,8,regular,muted)});
  pdf.setTitle(`Job card ${job.reference}`);pdf.setAuthor(company.name);
  return pdf.save();
}

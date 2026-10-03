import {materials,matchGauge} from './gauge.mjs';
import {sizeText} from './size.mjs?v=1';
import {lineCents,lineDiscount,billedQty} from './invoice-math.mjs?v=area-1';
import {defaultCompany,amountInWords,formatIBAN,defaultBankAccount} from './documents.mjs?v=gr-1';
import {drawStamp} from './stamp.mjs?v=logo-2';
// Shared PDF generator for quotations, invoices and purchase orders.
// context.company is the letterhead; context.party is the customer or vendor directory entry.
export async function createQuotePDF(quote, logoBytes, PDFLib, context={}) {
  const {PDFDocument, StandardFonts, rgb}=PDFLib;
  const company={...defaultCompany,...(context.company||{})},party=context.party||{};
  const isInvoice=quote.documentType==='invoice', isPurchase=quote.documentType==='purchase', isQuote=!isInvoice&&!isPurchase;
  const docName=quote.docTitle||(isInvoice?'Invoice':isPurchase?'Purchase Order':'Quotation');
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink=rgb(.10,.17,.21), blue=rgb(.06,.26,.45), muted=rgb(.40,.46,.49), line=rgb(.86,.89,.91), white=rgb(1,1,1), tint=rgb(.95,.97,.98);
  const logo=await pdf.embedJpg(logoBytes);
  const clean=v=>String(v??'').replace(/\r\n/g,'\n').replace(/[‐-―]/g,'-').replace(/\t/g,'    ');
  const amount=v=>Number(v).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
  if(!quote.party?.trim()||!quote.description?.trim()||!quote.lines?.length)throw Error(`Enter a ${isPurchase?'vendor':'customer'}, description and at least one line item.`);
  if(!Number.isFinite(quote.tax)||quote.tax<0||quote.tax>100)throw Error('Enter a valid tax percentage.');
  let cents=0,gross=0;
  for(const l of quote.lines){
    if(!l.description?.trim()||!Number.isFinite(l.quantity)||l.quantity<=0||!Number.isFinite(l.rate)||l.rate<0)throw Error('Check item descriptions, quantities and unit prices.');
    if(l.discount!=null&&l.discount!==''&&(!Number.isFinite(Number(l.discount))||Number(l.discount)<0||Number(l.discount)>100))throw Error('Enter a line discount between 0 and 100%.');
    cents+=lineCents(l);gross+=Math.round(billedQty(l)*l.rate*100);
  }
  const taxCents=Math.round(cents*quote.tax/100),total=(cents+taxCents)/100;
  if(!Number.isFinite(total)||total>1e9)throw Error('The total must be below PKR 1 billion.');
  const wrap=(value,width,size=10,font=regular)=>{
    const lines=[];
    for(const paragraph of clean(value).split('\n')){
      let current='';
      for(const word of paragraph.split(/ +/)){
        if(!word)continue;
        if(font.widthOfTextAtSize(current?current+' '+word:word,size)<=width){current=current?current+' '+word:word;continue}
        if(current){lines.push(current);current=''}
        for(const char of word){if(font.widthOfTextAtSize(current+char,size)>width){lines.push(current);current=''}current+=char}
      }
      lines.push(current);
    }
    return lines;
  };
  // Fail clearly for characters the embedded font cannot represent.
  const fields=[...Object.values(context.bankAccount||{}),...['designation','mobile','city','province','ntn','strn','cnic'].map(k=>party[k]),quote.party,quote.description,quote.notes,quote.reference,quote.quote_reference,quote.due_date,quote.valid_until,quote.attention,quote.customer_ref,quote.payment_terms,quote.lead_time,quote.terms,quote.prepared_by,party.phone,party.email,party.address,...Object.values(company),...quote.lines.map(l=>l.description)];
  try{fields.forEach(v=>regular.encodeText(clean(v).replace(/\n/g,' ')))}catch{throw Error('PDF export currently supports English and Latin characters. Please remove unsupported characters from this document or the company details.');}
  let page,y;
  const text=(value,x,yy,size=10,font=regular,color=ink)=>page.drawText(clean(value),{x,y:yy,size,font,color});
  const right=(value,x,yy,size=10,font=regular,color=ink)=>text(value,x-font.widthOfTextAtSize(clean(value),size),yy,size,font,color);
  const rule=(yy,thickness=.5)=>page.drawLine({start:{x:42,y:yy},end:{x:553,y:yy},thickness,color:line});
  function newPage(){page=pdf.addPage([595.28,841.89]);y=790;text(company.name.toUpperCase(),42,y,10,bold,blue);right(`${docName} ${quote.reference||'DRAFT'}`,553,y,9,regular,muted);rule(776,1);y=752;}
  function ensure(height){if(y-height<80)newPage()}
  function block(value,width,size=10,font=regular,color=ink,x=42,gap=4){for(const row of wrap(value,width,size,font)){ensure(size+gap);text(row,x,y,size,font,color);y-=size+gap}}
  const label=(value,x,yy)=>text(value,x,yy,8,bold,muted);
  const materialText=l=>{if(!l.thickness_mm)return '';const g=matchGauge(l.material,l.thickness_mm);return [materials[l.material],g?`${g.gauge} ga`:`${Number(l.thickness_mm)} mm`].filter(Boolean).join(' · ')};

  // Letterhead: logo and company details on the left; document title and reference box on the right.
  page=pdf.addPage([595.28,841.89]);
  page.drawImage(logo,{x:38,y:716,width:92,height:92});
  let cy=792;
  text(company.name,140,cy,15,bold,blue);cy-=14;
  if(company.tagline){text(company.tagline,140,cy,8.5,regular,muted);cy-=14}
  for(const row of [...wrap(company.address,200,8.5),[company.phone,company.email].filter(Boolean).join('  |  '),company.website,[company.ntn&&`NTN ${company.ntn}`,company.strn&&`STRN ${company.strn}`].filter(Boolean).join('  |  ')].filter(Boolean)){text(row,140,cy,8.5);cy-=12}
  right(docName.toUpperCase(),553,792,isPurchase?17:21,bold,blue);
  const meta=[[quote.refLabel||(isInvoice?'Invoice No.':isPurchase?'PO No.':'Quotation No.'),quote.reference||'DRAFT - not saved'],['Date',quote.date],...(quote.extraMeta||[]),...(isQuote&&quote.valid_until?[['Valid until',quote.valid_until]]:[]),...(isInvoice&&quote.due_date?[['Due date',quote.due_date],...(quote.quote_reference?[['Quotation ref.',quote.quote_reference]]:[])]:[]),...(isInvoice&&quote.job_reference?[['Job No.',quote.job_reference]]:[]),...(!isPurchase&&quote.customer_ref?[['Your ref.',quote.customer_ref]]:[]),...(quote.prepared_by?[['Prepared by',quote.prepared_by]]:[])];
  const boxTop=772,rowH=15,boxH=meta.length*rowH+10;
  page.drawRectangle({x:358,y:boxTop-boxH,width:195,height:boxH,color:tint});
  meta.forEach(([k,v],i)=>{const yy=boxTop-14-i*rowH;text(k,366,yy,8.5,regular,muted);right(wrap(v,110,9,bold)[0],545,yy,9,bold)});
  y=Math.min(cy,boxTop-boxH,716)-12;rule(y,1);y-=20;

  // Parties: who the document is for, and what the job is.
  const partyTop=y;
  label(isInvoice?'BILL TO':isPurchase?'SUPPLIER':'QUOTATION FOR',42,y);y-=17;
  block(quote.party,250,12,bold,ink,42,4);
  const attention=quote.attention||party.contact;
  for(const row of [attention&&`Attn: ${attention}${party.designation&&!quote.attention?`, ${party.designation}`:''}`,[party.phone||party.mobile,party.email].filter(Boolean).join('  |  ')].filter(Boolean))block(row,250,9,regular,ink,42,4);
  const where=[party.address,[party.city,party.province].filter(Boolean).join(', ')].filter(Boolean).join(', ');
  if(where)block(where,250,9,regular,muted,42,4);
  const tax=[party.ntn&&`NTN ${party.ntn}`,party.strn&&`STRN ${party.strn}`,!party.ntn&&party.cnic&&`CNIC ${party.cnic}`].filter(Boolean).join('  |  ');
  if(tax&&!isQuote)block(tax,250,9,bold,ink,42,4);
  const leftEnd=y;y=partyTop;
  label(isPurchase?'ORDER FOR':'PROJECT / DESCRIPTION',320,y);y-=17;
  block(quote.description,233,10,regular,ink,320,4);
  y=Math.min(leftEnd,y)-12;

  // Items.
  function tableHeader(){ensure(40);page.drawRectangle({x:42,y:y-9,width:511,height:26,color:blue});text('#',50,y,8.5,bold,white);text('ITEM DESCRIPTION / SIZE & MATERIAL',72,y,8.5,bold,white);right('QTY',330,y,8.5,bold,white);right('AREA FT²',400,y,8.5,bold,white);right('RATE (PKR)',470,y,8.5,bold,white);right('AMOUNT (PKR)',545,y,8.5,bold,white);y-=29;}
  tableHeader();
  quote.lines.forEach((item,index)=>{
    const desc=wrap(item.description,220,10), detail=wrap([sizeText(item),materialText(item),lineDiscount(item)?`Less ${lineDiscount(item)}% discount`:''].filter(Boolean).join('\n'),220,8.5);
    const height=desc.length*14+(detail[0]?detail.length*12:0)+8;
    if(y-height<80){newPage();tableHeader()}
    if(index%2)page.drawRectangle({x:42,y:y-height+10,width:511,height:height,color:rgb(.98,.985,.99)});
    text(String(index+1),50,y,10,regular,muted);
    desc.forEach((s,i)=>text(s,72,y-i*14));
    detail.filter(Boolean).forEach((s,i)=>text(s,72,y-desc.length*14-i*12,8.5,regular,muted));
    const byArea=item.pricing==='area'&&Number(item.area_sqft)>0;right(`${item.quantity}${item.unit?' '+item.unit:''}`,330,y);right(byArea?Number(item.area_sqft).toFixed(2):'-',400,y,10,regular,byArea?ink:muted);right(amount(item.rate),470,y);if(byArea)right('per ft²',470,y-12,7.5,regular,muted);right(amount(lineCents(item)/100),545,y);
    y-=height;
  });
  rule(y+10);

  // Totals and amount in words.
  y-=14;ensure(150+(gross!==cents?44:0));
  const totalsRow=(k,v,font=regular)=>{text(k,340,y,10,font);right(v,545,y,10,font);y-=19};
  if(gross!==cents){totalsRow('Gross amount',amount(gross/100));totalsRow('Discount','-'+amount((gross-cents)/100))}
  totalsRow('Subtotal',amount(cents/100));
  totalsRow(`Sales tax (${quote.tax}%)`,amount(taxCents/100));
  y-=6;page.drawRectangle({x:330,y:y-12,width:223,height:34,color:rgb(.93,.96,.98)});
  text('TOTAL (PKR)',340,y,10.5,bold,blue);right(amount(total),545,y,13,bold);y-=32;
  label('AMOUNT IN WORDS',42,y);y-=14;block(amountInWords(total),511,9.5,bold);y-=4;
  if(isInvoice){ensure(60);text('Received (PKR)',340,y);right(amount(quote.paid),545,y);y-=21;text('Balance due (PKR)',340,y,10,bold);right(amount(quote.outstanding),545,y,11,bold);y-=26;}

  // Commercial terms (quotations), terms and conditions, bank details and notes.
  const section=(title,need=40)=>{ensure(need+20);y-=2;label(title,42,y);y-=5;rule(y);y-=13};
  // Bank transfer details as a bordered two-column table: beneficiary and bank on the left, account codes on the right.
  // context.bankAccount: the account chosen for this document, null for none, undefined for the default
  const acct=context.bankAccount===undefined?defaultBankAccount(company):context.bankAccount,hasBank=!isPurchase&&!!acct;
  const bankLeft=acct?[['Beneficiary Name',acct.account_title||company.name],['Beneficiary Address',acct.beneficiary_address||company.address],['Bank Name',acct.bank_name],['Branch Address',acct.bank_branch]]:[];
  const bankRight=acct?[['Account Number',acct.account_number],['IBAN Code',formatIBAN(acct.iban)],['Swift Code',acct.swift],['Currency',acct.currency||'PKR']]:[];
  const bankTable=()=>{
   // rows grow to fit wrapped values (up to two lines per cell)
   const lines=(v,w)=>wrap(v||'-',w,8.5,bold).slice(0,2),rows=bankLeft.map((l,i)=>({l,r:bankRight[i],lv:lines(l[1],145),rv:lines(bankRight[i][1],155)})).map(x=>({...x,h:Math.max(x.lv.length,x.rv.length)*11+6}));
   const h=rows.reduce((n,x)=>n+x.h,0),top=y+11;ensure(h+30);
   page.drawRectangle({x:42,y:top-h,width:511,height:h,borderColor:line,borderWidth:.8});
   page.drawLine({start:{x:300,y:top},end:{x:300,y:top-h},thickness:.8,color:line});
   let ry=top;
   rows.forEach((x,i)=>{
    if(i)page.drawLine({start:{x:42,y:ry},end:{x:553,y:ry},thickness:.5,color:line});
    const cell=(k,vs,cx,lw)=>{const yy=ry-11;text(k,cx+6,yy,8.5,regular,muted);text(':',cx+lw,yy,8.5,bold);vs.forEach((v,j)=>text(v,cx+lw+8,yy-j*11,8.5,bold))};
    cell(x.l[0],x.lv,42,98);cell(x.r[0],x.rv,300,80);ry-=x.h;
   });
   y=top-h-10;
  };
  if(isQuote){
    const rows=[['Payment terms',quote.payment_terms],['Delivery / lead time',quote.lead_time],['Validity',quote.valid_until?`Valid until ${quote.valid_until}`:'']].filter(([,v])=>v&&String(v).trim());
    if(rows.length){section('COMMERCIAL TERMS',30+rows.length*16);for(const [k,v] of rows){const vs=wrap(v,380,9);text(k,42,y,9,regular,muted);vs.forEach((s,i)=>text(s,145,y-i*12,9));y-=vs.length*12+3}y-=4}
    if(hasBank){section('BANK DETAILS FOR PAYMENT',100);bankTable()}
    const terms=clean(quote.terms||'').split('\n').map(s=>s.trim()).filter(Boolean);
    if(terms.length){section('TERMS & CONDITIONS',50);terms.forEach((t,i)=>{const rows=wrap(t,490,8);ensure(rows.length*10+3);text(`${i+1}.`,42,y,8,regular,muted);rows.forEach((s,j)=>text(s,58,y-j*10,8));y-=rows.length*10+2});y-=2}
  }else if(hasBank){section('BANK DETAILS FOR PAYMENT',100);bankTable()}
  if(quote.notes?.trim()){section('NOTES',45);block(quote.notes,511,9.5);y-=6;}

  // Signatures.
  // signature lines need about 62pt above the footer rule at y=52
  // the company stamp (quotations, invoices and purchase orders) sits between the two signature blocks and needs a little more room
  const stamped=company.stamp_enabled!==false;
  if(y-(stamped?70:62)<54)newPage();y=Math.min(y-32,140);
  if(stamped){const ink=await context.stampLogo;const logoImg=ink?.bytes?await pdf.embedPng(ink.bytes):null;drawStamp(page,PDFLib,{bold,regular},company,{cx:262,cy:y-2,r:40,logo:logoImg})}
  page.drawLine({start:{x:42,y},end:{x:230,y},thickness:.6,color:ink});page.drawLine({start:{x:365,y},end:{x:553,y},thickness:.6,color:ink});
  text(`For ${company.name}`,42,y-14,9,bold);text('Authorised signatory',42,y-27,8.5,regular,muted);
  text(isQuote?'Accepted by customer':isPurchase?'Supplier acknowledgement':'Received by',365,y-14,9,bold);text('Name, signature, stamp & date',365,y-27,8.5,regular,muted);

  const footer=[company.name,company.phone,company.email,company.website].filter(Boolean).join('  |  ');
  const pages=pdf.getPages();
  pages.forEach((p,i)=>{page=p;rule(52);text(footer,42,38,8,regular,muted);right(`Page ${i+1} of ${pages.length}`,553,38,8,regular,muted);if(isQuote)text('This is a quotation, not a tax invoice.',42,26,7.5,regular,muted);});
  pdf.setTitle(`${company.name} - ${docName} ${quote.reference||'Draft'}`);pdf.setAuthor(company.name);pdf.setSubject(quote.description);
  return pdf.save();
}

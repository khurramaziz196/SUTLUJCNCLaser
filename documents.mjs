// Company letterhead defaults, document numbering and amounts in words for customer-facing documents.
export const defaultCompany={
 name:'Sutluj CNC Laser',tagline:'CNC laser cutting · Sheet metal',address:'',phone:'',email:'',website:'',ntn:'',strn:'',
 bank_accounts:[],prepared_by:'',validity_days:15,machine_rate:0,
 payment_terms:'50% advance, balance before delivery',
 payment_terms_options:['100% advance','50% advance, balance before delivery','Cash on delivery','15 days credit','30 days credit'],validity_options:[7,15,30],
 terms:[
  'Prices are in PKR and based on the drawings, material and quantities quoted. Changes are re-quoted.',
  'Material is supplied by Sutluj CNC Laser unless stated as customer-supplied. Customer-supplied material is cut at the customer\'s risk for material defects.',
  'Standard laser-cutting tolerances apply unless otherwise agreed in writing.',
  'Lead time starts from receipt of approved drawings and the advance payment.',
  'Transport, bending and finishing are not included unless listed above.',
  'Goods remain the property of Sutluj CNC Laser until paid in full.'
 ].join('\n')
};

// Sequential numbers per prefix and year, e.g. QT-2026-0001. Older references are left as they are.
export function nextDocumentNumber(prefix,list,year,field='reference'){
 const pattern=new RegExp(`^${prefix}-${year}-(\\d+)$`);
 const n=list.reduce((max,r)=>{const m=String(r?.[field]||'').match(pattern);return m?Math.max(max,Number(m[1])):max},0);
 return `${prefix}-${year}-${String(n+1).padStart(4,'0')}`;
}

export function addDays(date,days){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+Number(days||0));return d.toISOString().slice(0,10)}

// Pakistani numbering (thousand, lakh, crore): 219000 -> "Rupees Two Lakh Nineteen Thousand Only".
const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
const two=n=>n<20?ones[n]:tens[Math.floor(n/10)]+(n%10?' '+ones[n%10]:'');
const three=n=>[n>=100?ones[Math.floor(n/100)]+' Hundred':'',n%100?two(n%100):''].filter(Boolean).join(' ');
function words(n){
 if(n===0)return 'Zero';
 const crore=Math.floor(n/1e7),lakh=Math.floor(n%1e7/1e5),thousand=Math.floor(n%1e5/1e3),rest=n%1000;
 return [crore?words(crore)+' Crore':'',lakh?two(lakh)+' Lakh':'',thousand?two(thousand)+' Thousand':'',rest?three(rest):''].filter(Boolean).join(' ');
}
export function amountInWords(value){
 const paise=Math.round(Math.abs(Number(value))*100),rupees=Math.floor(paise/100),p=paise%100;
 return `Rupees ${words(rupees)}${p?` and ${two(p)} Paisa`:''} Only`;
}

// Quotation numbers: Q-<first three letters of the customer>-<running number across all quotes>,
// e.g. Q-CRE-00001 then Q-ATL-00002. The running number keeps every quotation unique.
export function customerCode(name){return (String(name||'').toUpperCase().replace(/[^A-Z]/g,'')+'XXX').slice(0,3)}
// lastIssued keeps numbers from deleted quotations from being reused.
export function quoteNumber(party,quotes,lastIssued=0){
 const n=quotes.reduce((max,q)=>{const m=String(q?.reference||'').match(/^Q-[A-Z]{3}-(\d{5,})$/);return m?Math.max(max,Number(m[1])):max},Number(lastIssued)||0);
 return `Q-${customerCode(party)}-${String(n+1).padStart(5,'0')}`;
}

// Banks operating in Pakistan, for the bank name dropdown ("Other" covers any not listed or renamed).
export const pakistanBanks=['Allied Bank Limited','Askari Bank Limited','Bank Alfalah Limited','Bank AL Habib Limited','BankIslami Pakistan Limited','Bank of Khyber','Bank of Punjab','Dubai Islamic Bank Pakistan Limited','Faysal Bank Limited','First Women Bank Limited','Habib Bank Limited (HBL)','Habib Metropolitan Bank Limited','JS Bank Limited','MCB Bank Limited','MCB Islamic Bank Limited','Meezan Bank Limited','National Bank of Pakistan','Samba Bank Limited','Silkbank Limited','Sindh Bank Limited','Soneri Bank Limited','Standard Chartered Bank (Pakistan) Limited','Summit Bank Limited','United Bank Limited (UBL)','Al Baraka Bank (Pakistan) Limited','Zarai Taraqiati Bank Limited','Citibank N.A. Pakistan','Deutsche Bank AG Pakistan','Industrial and Commercial Bank of China (ICBC) Pakistan','Bank of China Pakistan','Khushhali Microfinance Bank','Mobilink Microfinance Bank','Telenor Microfinance Bank (Easypaisa)','U Microfinance Bank','FINCA Microfinance Bank','NRSP Microfinance Bank','HBL Microfinance Bank'];
export const bankCurrencies=['PKR','USD','EUR','GBP','AED','SAR','CNY'];

export const compactIBAN=v=>String(v||'').replace(/\s+/g,'').toUpperCase();
export const formatIBAN=v=>compactIBAN(v).replace(/(.{4})/g,'$1 ').trim();
// ISO 13616 check: move the first four characters to the end, letters to numbers (A=10), remainder mod 97 must be 1.
export function ibanProblem(value){
 const iban=compactIBAN(value);if(!iban)return '';
 if(iban.startsWith('PK')&&!/^PK\d{2}[A-Z]{4}\d{16}$/.test(iban))return 'A Pakistani IBAN has 24 characters: PK, 2 check digits, a 4-letter bank code and 16 digits.';
 if(!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban))return 'Enter the IBAN as letters and digits only, e.g. PK36SCBL0000001123456702.';
 let rest=0;for(const ch of iban.slice(4)+iban.slice(0,4)){const n=/[A-Z]/.test(ch)?String(ch.charCodeAt(0)-55):ch;for(const d of n)rest=(rest*10+Number(d))%97}
 return rest===1?'':'This IBAN fails its check digits. Please copy it again from your bank.';
}
export function swiftProblem(value){const s=String(value||'').trim().toUpperCase();return !s||/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s)?'':'A SWIFT / BIC code has 8 or 11 characters, e.g. MEZNPKKA.'}

// Several bank accounts per company. Bank details saved before accounts existed become the first
// (default) account. A document stores the chosen account id, 'none' to print no bank details,
// or nothing to use the default.
const legacyBankKeys=['bank_name','bank_branch','account_title','beneficiary_address','account_number','iban','swift','currency'];
export function bankAccountsOf(company){
 if(Array.isArray(company.bank_accounts)&&company.bank_accounts.length)return company.bank_accounts;
 if(!(company.iban||company.account_number||company.bank_name))return [];
 return [{id:'account-1',nickname:'',is_default:true,...Object.fromEntries(legacyBankKeys.map(k=>[k,company[k]||(k==='currency'?'PKR':'')]))}];
}
export const defaultBankAccount=company=>{const list=bankAccountsOf(company);return list.find(a=>a.is_default)||list[0]||null};
export function findBankAccount(company,id){if(id==='none')return null;return (id&&bankAccountsOf(company).find(a=>a.id===id))||defaultBankAccount(company)}
export function bankAccountLabel(a){const tail=compactIBAN(a.iban||a.account_number).slice(-4);return [a.nickname||a.bank_name||'Bank account',a.nickname&&a.bank_name?a.bank_name:'',a.currency||'PKR',tail?`••••${tail}`:''].filter(Boolean).join(' · ')}
export function bankAccountProblem(a){
 if(!a.bank_name)return 'Choose the bank.';
 if(!a.account_title)return 'Enter the beneficiary name (account title).';
 if(!a.account_number&&!a.iban)return 'Enter the account number or IBAN.';
 return ibanProblem(a.iban)||swiftProblem(a.swift);
}

// Payment terms and validity periods offered when preparing a quotation; the defaults are always included.
export function paymentTermsOf(company){return [...new Set([...(company.payment_terms_options||[]),company.payment_terms].map(t=>String(t||'').trim()).filter(Boolean))]}
export function validityOptionsOf(company){return [...new Set([...(company.validity_options||[]),company.validity_days].map(Number).filter(n=>Number.isInteger(n)&&n>0&&n<=365))].sort((a,b)=>a-b)}
export const daysBetweenDates=(from,to)=>Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000);

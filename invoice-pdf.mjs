import {createQuotePDF} from './quote-pdf.mjs?v=logo-2';
import {invoiceBalance,invoiceStatus,cents,lineCents} from './invoice-math.mjs';
export async function createInvoicePDF(invoice,payments,logoBytes,PDFLib,asAt,context={}){
 const lines=invoice.lines.map(l=>({...l,quantity:Number(l.quantity),rate:Number(l.rate)}));
 const subtotal=lines.reduce((n,l)=>n+lineCents(l),0);
 const expected=subtotal+Math.round(subtotal*Number(invoice.tax)/100);
 if(expected!==cents(invoice.amount))throw Error('Invoice total does not match its saved items. Please review the invoice.');
 const {paid,due}=invoiceBalance(invoice,payments);
 return createQuotePDF({...invoice,lines,tax:Number(invoice.tax),documentType:'invoice',status:invoiceStatus(invoice,payments,asAt),paid,outstanding:due},logoBytes,PDFLib,context);
}

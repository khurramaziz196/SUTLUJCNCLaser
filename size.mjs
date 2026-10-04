// Part size on quotation lines: width x length in inches and the area in square feet.
// Area = W x L / 144 per piece; the line area multiplies by the quantity.
const inch=v=>{const n=Number(v);return v!==''&&v!=null&&Number.isFinite(n)&&n>0?n:null};
export function areaSqFt(line){const w=inch(line.width_in),l=inch(line.length_in);if(!w||!l)return null;const each=w*l/144,qty=Number(line.quantity)>0?Number(line.quantity):1;return {each:Math.round(each*100)/100,total:Math.round(each*qty*100)/100}}
export function sizeText(line){const w=inch(line.width_in),l=inch(line.length_in);if(!w||!l)return '';const a=areaSqFt(line);return `${w}" x ${l}" · ${a.each} sq ft/pc${Number(line.quantity)>1?` · ${a.total} sq ft total`:''}`}
export function validSize(line){for(const k of ['width_in','length_in','width_ft','length_ft']){const v=line[k];if(v===''||v==null)continue;const n=Number(v);if(!Number.isFinite(n)||n<=0||n>10000)return `Enter width and length in ${k.endsWith('_ft')?'feet':'inches'} (greater than 0).`}return ''}

// Purchase orders: sheet size in feet and the weight of the sheets ordered.
// Weight (kg) = W ft x L ft (as mm) x thickness mm x density g/cm³ / 1,000,000 x quantity. Amount stays Qty x Rate.
import {densities} from './inventory.mjs?v=grn-1';
export function poWeightKg(line){const w=inch(line.width_ft),l=inch(line.length_ft),t=Number(line.thickness_mm),d=densities[line.material],q=Number(line.quantity)>0?Number(line.quantity):1;if(!w||!l||!(t>0)||!d)return null;return Math.round(w*304.8*l*304.8*t*d/1e6*q*100)/100}
export function poSizeText(line){const w=inch(line.width_ft),l=inch(line.length_ft);return w&&l?`${w}' x ${l}'`:''}

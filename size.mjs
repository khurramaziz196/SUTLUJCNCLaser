// Part size on quotation lines: width x length in inches and the area in square feet.
// Area = W x L / 144 per piece; the line area multiplies by the quantity.
const inch=v=>{const n=Number(v);return v!==''&&v!=null&&Number.isFinite(n)&&n>0?n:null};
export function areaSqFt(line){const w=inch(line.width_in),l=inch(line.length_in);if(!w||!l)return null;const each=w*l/144,qty=Number(line.quantity)>0?Number(line.quantity):1;return {each:Math.round(each*100)/100,total:Math.round(each*qty*100)/100}}
export function sizeText(line){const w=inch(line.width_in),l=inch(line.length_in);if(!w||!l)return '';const a=areaSqFt(line);return `${w}" x ${l}" · ${a.each} sq ft/pc${Number(line.quantity)>1?` · ${a.total} sq ft total`:''}`}
export function validSize(line){for(const k of ['width_in','length_in']){const v=line[k];if(v===''||v==null)continue;const n=Number(v);if(!Number.isFinite(n)||n<=0||n>10000)return 'Enter width and length in inches (greater than 0).'}return ''}

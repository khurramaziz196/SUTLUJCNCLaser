// Nominal US sheet-metal gauge values. Inch values converted with 25.4 mm/in,
// rounded to 0.001 mm. Source: https://unipunch.com/support/charts/metal-gauges/
// Galvanized source: https://www.metalsupermarkets.com/sheet-metal-gauge-chart/
export const materials={steel:'Mild steel',stainless:'Stainless steel',aluminium:'Aluminium',galvanized:'Galvanized steel'};
const series=(start,values)=>Object.fromEntries(values.map((inch,i)=>[start+i,Math.round((inch*25.4+1e-9)*1000)/1000]));
export const gauges={
 steel:series(3,[.2391,.2242,.2092,.1943,.1793,.1644,.1495,.1345,.1196,.1046,.0897,.0747,.0673,.0598,.0538,.0478,.0418,.0359,.0329,.0299,.0269,.0239,.0209,.0179,.0164,.0149,.0135]),
 stainless:series(1,[.2812,.2656,.2500,.2344,.2187,.2031,.1875,.1719,.1562,.1406,.1250,.1094,.0937,.0781,.0703,.0625,.0562,.0500,.0437,.0375,.0344,.0312,.0281,.0250,.0219,.0187,.0172,.0156,.0141]),
 aluminium:series(1,[.2893,.2576,.2294,.2043,.1819,.1620,.1443,.1285,.1144,.1019,.0907,.0808,.0720,.0641,.0571,.0508,.0453,.0403,.0359,.0320,.0285,.0253,.0226,.0201,.0179,.0159,.0142,.0126,.0113]),
 galvanized:Object.fromEntries([[8,.1681],[9,.1532],[10,.1382],[11,.1233],[12,.1084],[14,.0785],[16,.0635],[18,.0516],[20,.0396],[22,.0336],[24,.0276],[26,.0217],[28,.0187],[30,.0157]].map(([g,v])=>[g,Math.round((v*25.4+1e-9)*1000)/1000]))
};
export function matchGauge(material,mm){if(!gauges[material]||!Number.isFinite(Number(mm))||Number(mm)<=0)return null;const entries=Object.entries(gauges[material]);const exact=entries.find(([,n])=>Math.abs(n-Number(mm))<.00001);return exact?{gauge:exact[0],mm:exact[1]}:null;}
export function thicknessText(line){if(!line.thickness_mm)return '';const material=materials[line.material]||'Material unspecified';const match=matchGauge(line.material,line.thickness_mm);return `${material} | ${Number(line.thickness_mm)} mm${match?` | ${match.gauge} ga (US nominal)`:' | Custom thickness'}`;}
// A trailing "N mm" is read as thickness unless it is a sheet dimension such as "1220 × 2440 mm" or above 500 mm.
export const dimensionTail=/\d\s*[×xX*]\s*\d+(?:\.\d+)?\s*mm\s*$/;
function describedThickness(text){const pick=m=>m&&!m[1]&&Number(m[2])>0&&Number(m[2])<=500;const tail=text.match(/(?:(\d\s*[×xX*])\s*)?(\d+(?:\.\d+)?)\s*mm\s*$/);if(pick(tail))return Number(tail[2]);if(!tail)return null;const other=[...text.matchAll(/(?:(\d\s*[×xX*])\s*)?(\d+(?:\.\d+)?)\s*mm\b/g)].find(pick);return other?Number(other[2]):null;}
export function inferThickness(line){const mm=describedThickness(String(line.description||''));const m=mm==null?null:[null,mm];let material=line.material||'';if(!material){if(/\b(MS|mild steel)\b/i.test(line.description))material='steel';else if(/\b(SS|stainless)\b/i.test(line.description))material='stainless';else if(/alumin[iu]*m/i.test(line.description))material='aluminium';else if(/galvanized|galvanised|\bGI\b/i.test(line.description))material='galvanized';}return {...line,material,thickness_mm:line.thickness_mm??(m?Number(m[1]):null)};}

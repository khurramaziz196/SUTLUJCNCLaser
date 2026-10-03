// Round company stamp: name on the top arc, tagline on the bottom arc, stars at the sides and two
// lines in the centre (NTN and STRN by default). Drawn as vectors in PDFs; stampSVG gives a matching preview.
export const stampInks={blue:[0.12,0.25,0.62],black:[0.1,0.1,0.12],red:[0.72,0.13,0.15]};

export function stampText(company){
 const c=company||{};
 return {
  top:String(c.name||'Company').toUpperCase(),
  bottom:String(c.stamp_bottom??c.tagline??'').toUpperCase(),
  line1:String(c.stamp_line1??(c.ntn?`NTN ${c.ntn}`:'')).trim(),
  line2:String(c.stamp_line2??(c.strn?`STRN ${c.strn}`:'')).trim()
 };
}

// Ring sizes as fractions of the outer radius.
const RING={inner:0.9,band:0.62,text:0.73};
const TILT=-12; // degrees: a hand-pressed stamp is rarely straight

// Draws the stamp centred at (cx, cy) with outer radius r on a pdf-lib page.
// logo: an embedded single-colour PNG of the company logo, drawn in the centre when the stamp shows the logo.
export function drawStamp(page,PDFLib,fonts,company,{cx,cy,r=44,logo=null}={}){
 const {rgb,degrees}=PDFLib,t=stampText(company),[R,G,B]=stampInks[company.stamp_color]||stampInks.blue,ink=rgb(R,G,B),opacity=0.86;
 const rad=d=>d*Math.PI/180,tilt=rad(TILT);
 page.drawCircle({x:cx,y:cy,size:r,borderColor:ink,borderWidth:2.4,borderOpacity:opacity});
 page.drawCircle({x:cx,y:cy,size:r*RING.inner,borderColor:ink,borderWidth:0.8,borderOpacity:opacity});
 page.drawCircle({x:cx,y:cy,size:r*RING.band,borderColor:ink,borderWidth:1.3,borderOpacity:opacity});
 const bandMid=r*RING.text,capH=size=>size*0.7;
 // fit a string onto an arc: shrink the font until it spans at most maxDeg degrees
 const fit=(text,font,maxDeg,size)=>{const track=0.6;let s=size;const span=sz=>[...text].reduce((n,ch)=>n+font.widthOfTextAtSize(ch,sz)+track,0)-track;while(s>4&&span(s)/bandMid>rad(maxDeg))s-=0.25;return {size:s,width:span(s),track}};
 const arc=(text,font,top,maxDeg,size)=>{
  if(!text)return;const f=fit(text,font,maxDeg,size),radius=top?bandMid-capH(f.size)/2:bandMid+capH(f.size)/2;
  let pos=-f.width/2;
  for(const ch of text){
   const w=font.widthOfTextAtSize(ch,f.size),mid=(pos+w/2)/radius;pos+=w+f.track;
   const theta=(top?Math.PI/2-mid:-Math.PI/2+mid)+tilt; // top runs clockwise, bottom anticlockwise
   const tx=top?Math.sin(theta):-Math.sin(theta),ty=top?-Math.cos(theta):Math.cos(theta); // reading direction
   const px=cx+radius*Math.cos(theta)-tx*w/2,py=cy+radius*Math.sin(theta)-ty*w/2;
   page.drawText(ch,{x:px,y:py,size:f.size,font,color:ink,opacity,rotate:degrees((top?theta-Math.PI/2:theta+Math.PI/2)*180/Math.PI)});
  }
 };
 arc(t.top,fonts.bold,true,150,r*0.2);
 arc(t.bottom,fonts.bold,false,118,r*0.15);
 // stars at the sides of the band
 for(const side of [0,Math.PI]){const a=side+tilt,sx=cx+bandMid*Math.cos(a),sy=cy+bandMid*Math.sin(a),s=r*0.065;
  const pts=Array.from({length:10},(_,i)=>{const rr=i%2?s*0.45:s,ang=-Math.PI/2+i*Math.PI/5;return `${(rr*Math.cos(ang)).toFixed(2)},${(rr*Math.sin(ang)).toFixed(2)}`});
  page.drawSvgPath(`M${pts.join(' L')} Z`,{x:sx,y:sy,color:ink,opacity});}
 // centre: the company logo (rotated with the stamp), or two text lines either side of a divider
 const rotate=(ox,oy)=>[cx+ox*Math.cos(tilt)-oy*Math.sin(tilt),cy+ox*Math.sin(tilt)+oy*Math.cos(tilt)];
 if(logo&&company.stamp_center!=='text'){const side=r*RING.band*2*0.94,[x,y]=rotate(-side/2,-side/2);page.drawImage(logo,{x,y,width:side,height:side,rotate:degrees(TILT),opacity:0.95});return}
 const lines=[t.line1,t.line2].filter(Boolean),inner=r*RING.band*2*0.82,gap=r*0.07,rot=(ox,oy)=>[cx+ox*Math.cos(tilt)-oy*Math.sin(tilt),cy+ox*Math.sin(tilt)+oy*Math.cos(tilt)];
 lines.forEach((text,i)=>{let size=(i===0?r*0.16:r*0.12);while(size>4&&fonts.bold.widthOfTextAtSize(text,size)>inner)size-=0.25;
  const w=fonts.bold.widthOfTextAtSize(text,size),oy=lines.length===1?-capH(size)/2:(i===0?gap:-gap-capH(size)),[x,y]=rot(-w/2,oy);
  page.drawText(text,{x,y,size,font:fonts.bold,color:ink,opacity,rotate:degrees(TILT)});});
 if(lines.length===2){const half=r*RING.band*0.8,[x1,y1]=rot(-half,0),[x2,y2]=rot(half,0);page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:0.6,color:ink,opacity});}
}

// SVG preview for Settings, using the same layout.
export function stampSVG(company,size=200,logoUrl=''){
 const t=stampText(company),[R,G,B]=stampInks[company.stamp_color]||stampInks.blue,ink=`rgb(${Math.round(R*255)},${Math.round(G*255)},${Math.round(B*255)})`,r=size/2-4,c=size/2,esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
 const band=r*RING.text,top=`M ${c-band} ${c} A ${band} ${band} 0 0 1 ${c+band} ${c}`,bottom=`M ${c-band} ${c} A ${band} ${band} 0 0 0 ${c+band} ${c}`;
  const showLogo=!!logoUrl&&company.stamp_center!=='text',lines=showLogo?[]:[t.line1,t.line2].filter(Boolean),side=r*RING.band*2*0.94;
 return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Company stamp preview"><g transform="rotate(${-TILT} ${c} ${c})" fill="none" stroke="${ink}" opacity="0.86" font-family="Helvetica, Arial, sans-serif" font-weight="700">
 <circle cx="${c}" cy="${c}" r="${r}" stroke-width="3"/><circle cx="${c}" cy="${c}" r="${r*RING.inner}" stroke-width="1"/><circle cx="${c}" cy="${c}" r="${r*RING.band}" stroke-width="1.6"/>
 <defs><path id="st-top" d="${top}"/><path id="st-bottom" d="${bottom}"/></defs>
 <text fill="${ink}" stroke="none" font-size="${r*0.2}" dominant-baseline="central"><textPath href="#st-top" startOffset="50%" text-anchor="middle" textLength="${band*Math.PI*0.78}" lengthAdjust="spacing">${esc(t.top)}</textPath></text>
 <text fill="${ink}" stroke="none" font-size="${r*0.13}" dominant-baseline="central"><textPath href="#st-bottom" startOffset="50%" text-anchor="middle" ${t.bottom.length*r*0.1>band*Math.PI*0.62?`textLength="${band*Math.PI*0.62}" lengthAdjust="spacingAndGlyphs"`:''}>${esc(t.bottom)}</textPath></text>
 <text fill="${ink}" stroke="none" font-size="${r*0.13}" x="${c-band}" y="${c}" text-anchor="middle" dominant-baseline="central">★</text><text fill="${ink}" stroke="none" font-size="${r*0.13}" x="${c+band}" y="${c}" text-anchor="middle" dominant-baseline="central">★</text>
 ${lines.map((l,i)=>`<text fill="${ink}" stroke="none" font-size="${i===0?r*0.16:r*0.12}" x="${c}" y="${lines.length===1?c:c+(i===0?-r*0.07:r*0.07)}" text-anchor="middle" dominant-baseline="${lines.length===1?'central':i===0?'text-after-edge':'text-before-edge'}" textLength="${Math.min(r*RING.band*1.64,l.length*r*(i===0?0.095:0.072))}" lengthAdjust="spacingAndGlyphs">${esc(l)}</text>`).join('')}
 ${showLogo?`<image href="${logoUrl}" x="${c-side/2}" y="${c-side/2}" width="${side}" height="${side}" opacity="0.95"/>`:''}
 ${lines.length===2?`<line x1="${c-r*RING.band*0.8}" x2="${c+r*RING.band*0.8}" y1="${c}" y2="${c}" stroke-width="0.8"/>`:''}</g></svg>`;
}

// Turns the colour logo into a single-ink stamp image: dark and coloured parts become ink, white becomes
// transparent. Runs in the browser (canvas); returns PNG bytes and a data URL for previews.
export async function inkLogo(url,color='blue',px=320){
 const [R,G,B]=(stampInks[color]||stampInks.blue).map(v=>Math.round(v*255));
 const img=await new Promise((ok,fail)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>fail(Error('The company logo could not be loaded.'));i.src=url});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=px;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,px,px);
 const data=ctx.getImageData(0,0,px,px),d=data.data;
 for(let i=0;i<d.length;i+=4){const lum=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255,a=Math.max(0,Math.min(1,(0.92-lum)*1.9));d[i]=R;d[i+1]=G;d[i+2]=B;d[i+3]=Math.round(a*255)}
 ctx.putImageData(data,0,0);const dataUrl=canvas.toDataURL('image/png');
 return {dataUrl,bytes:Uint8Array.from(atob(dataUrl.split(',')[1]),ch=>ch.charCodeAt(0))};
}

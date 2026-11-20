/** Experimental high-resolution portrait of the rogue, anchored to the supplied original text artwork.
 * The source illustration is preserved as ASCII text, not a bitmap. Dynamic masks are additive and
 * remain intentionally limited to the rogue; other classes retain the existing portraits.
 */
import { ROGUE_REFERENCE_ROWS } from './reference-rogue.js';
const RARITY_INK=['common','uncommon','rare','epic','legendary'];
const VISIBLE_SLOTS=['head','body','hands','feet','weapon','ring','amulet'];
function equippedVisuals(state){const items=Array.isArray(state?.items)?state.items:[],equip=state?.equip||{};return Object.fromEntries(VISIBLE_SLOTS.map(slot=>[slot,items.find(item=>item?.uid===equip[slot]&&item.slot===slot)||null]));}
import { escape } from './utils.js';

export const DETAIL_W = 160, DETAIL_H = 103;
const RAMP=' .:-=+*#%@';
const cache=new Map();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hash=value=>{let s=2166136261;for(const c of String(value)){s=Math.imul(s^c.charCodeAt(0),16777619)>>>0;}return s>>>0;};
const grade=(item)=>clamp(Math.floor(Number(item?.armor)||0),0,3);
function mask(canvas,inks,box,slot,item,draw){
 const [x0,y0,x1,y1]=box,seed=hash(item?.visualId||item?.catalogId||item?.uid||item?.kind||slot);
 const mark=slot+'-'+RARITY_INK[clamp(Math.floor(Number(item?.rarity)||0),0,4)];
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  if(canvas[y][x]===' ')continue;
  const nx=(x-x0)/Math.max(1,x1-x0),ny=(y-y0)/Math.max(1,y1-y0);
  const old=canvas[y][x];const c=draw({x,y,nx,ny,old,seed});
  if(c===null)continue;
  canvas[y][x]=c;inks[y][x]=mark;
 }
}
function renderArmoredZone(canvas,inks,eq,slot,box){
 const item=eq[slot];if(!item)return;
 const weight=grade(item),seed=hash(item?.visualId||item?.catalogId||item?.uid||item?.kind||slot);
 mask(canvas,inks,box,slot,item,({x,y,nx,ny,old})=>{
  const edge=nx<.08||nx>.92;
  const vertical=(x+seed)%19===0,stitch=(y+seed)%13===0;
  if(weight>=3){
   if(edge||vertical)return '|';
   if(stitch)return '=';
   return '#%@'[(x*3+y+seed)%3];
  }
  if(weight===2){
   if(vertical||stitch)return (x+y)%2?'=':'+';
   return '*##%'[(x+y*2+seed)%4];
  }
  if((x+y+seed)%11===0)return '/';
  return (RAMP.indexOf(old)>0?old:'=');
 });
}
export function composeReferenceRogue(state,{compact=false}={}){
 const eq=equippedVisuals(state),key=JSON.stringify([compact,...Object.values(eq).map(item=>item&&[item.uid,item.kind,item.armor,item.rarity,item.visualId,item.catalogId])]);
 if(cache.has(key))return cache.get(key);
 const canvas=ROGUE_REFERENCE_ROWS.map(row=>row.split(''));
 const inks=Array.from({length:DETAIL_H},()=>Array(DETAIL_W).fill('base'));
 // Coordinates are tied to this specific illustrated stance, and do not replace the original silhouette.
 renderArmoredZone(canvas,inks,eq,'head',[61,3,115,34]);
 renderArmoredZone(canvas,inks,eq,'body',[60,34,121,67]);
 renderArmoredZone(canvas,inks,eq,'hands',[52,30,79,55]);
 renderArmoredZone(canvas,inks,eq,'feet',[45,79,113,101]);
 // Metal/cloth features are carved INSIDE existing character areas to retain the outer silhouette.
 if(eq.body&&grade(eq.body)>=2){
  const item=eq.body;mask(canvas,inks,[71,42,113,64],'body',item,({nx,ny,old,x,y})=>{
   if(nx>.12&&nx<.88 && Math.abs(ny-.40)<.04)return '=';
   if(nx>.15&&nx<.85 && Math.abs(nx-.5)<.024)return '|';
   return old;
  });
 }
 // Rarity of an accessory applies only in a narrow area, never to the whole figure.
 if(eq.amulet)mask(canvas,inks,[93,31,103,42],'amulet',eq.amulet,({old})=>old);
 if(eq.ring)mask(canvas,inks,[30,43,38,50],'ring',eq.ring,({old})=>old);
 // A weapon differs in outline/material details near the actual right-hand weapon silhouette.
 if(eq.weapon){
  const type=String(eq.weapon.kind||'');
  const kind=/Adaga|L[aâ]mina/i.test(type)?'dagger':/Espada/i.test(type)?'sword':/Machado/i.test(type)?'axe':/Arco|Besta/i.test(type)?'bow':/Cajado|Varinha/i.test(type)?'staff':'blade';
  mask(canvas,inks,[116,32,151,67],'weapon',eq.weapon,({x,y,nx,ny,old,seed})=>{
   const groove=kind==='dagger'?3:kind==='sword'?6:kind==='axe'?8:5;
   return ((x+y+seed)%groove===0)?'#':old;
  });
 }
 let rows=canvas.map(row=>row.join('')),inksOut=inks;
 if(compact){
  // Every source quadrant contributes to the compact result, avoiding crop of head, arms and boots.
  const factor=2,order=' .:-=+*#%@';const r=[],ink=[];
  for(let y=0;y<DETAIL_H;y+=factor){let line='',col=[];
   for(let x=0;x<DETAIL_W;x+=factor){let chosen={ch:' ',ink:'base'};
    for(let dy=0;dy<factor;dy++)for(let dx=0;dx<factor;dx++){
     if(y+dy>=DETAIL_H||x+dx>=DETAIL_W)continue;
     const ch=canvas[y+dy][x+dx],part=inks[y+dy][x+dx];
     if(order.indexOf(ch)>order.indexOf(chosen.ch))chosen={ch,ink:part};
    }
    line+=chosen.ch;col.push(chosen.ink);
   }r.push(line);ink.push(col);
  }rows=r;inksOut=ink;
 }
 const result={rows,text:rows.join('\n'),ink:inksOut,width:rows[0].length,height:rows.length,equipped:eq};
 if(cache.size>64)cache.clear();cache.set(key,result);return result;
}
export function renderReferenceRogue(state,compact=false){
 const art=composeReferenceRogue(state,{compact});
 const lines=art.rows.map((row,y)=>{
  let html='';for(let x=0;x<row.length;){
   const ink=art.ink[y][x];let end=x+1;while(end<row.length&&art.ink[y][end]===ink)end++;
   const segment=escape(row.slice(x,end));
   html+=ink==='base'?segment:`<span class="avatar-ink avatar-${ink}">${segment}</span>`;x=end;
  }return html;
 });
 return `<pre class="ascii-art hero-portrait dynamic-hero density-hero reference-density ${compact?'compact-density':'full-reference-density'}" data-ascii="true" aria-label="Ladino ASCII detalhado com equipamentos">${lines.join('\n')}</pre>`;
}

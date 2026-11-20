import {renderHighDensityHero} from './high-density-portraits.js';
/** ASCII REALMS: retratos de densidade, compostos de camadas ASCII reais.
 * O desenho nunca integra o salvamento: a composicao usa classe e equipamentos.
 */
import {escape} from './utils.js';
import {classes} from './data.js';

export const AVATAR_WIDTH=64,AVATAR_HEIGHT=44;
export const VISIBLE_SLOTS=Object.freeze(['head','body','hands','feet','weapon','ring','amulet']);
export const RARITY_INK=Object.freeze(['common','uncommon','rare','epic','legendary']);
const RAMP='.:-=+*#%@';
const cache=new Map();

export function equippedVisuals(state){
 const items=Array.isArray(state?.items)?state.items:[],eq=state?.equip||{};
 return Object.fromEntries(VISIBLE_SLOTS.map(slot=>[slot,items.find(item=>item?.uid===eq[slot]&&item.slot===slot)||null]));
}
function rarityOf(eq,slot){return eq[slot]?`${slot}-${RARITY_INK[Math.max(0,Math.min(4,Math.floor(Number(eq[slot].rarity)||0)))]}`:'base';}
function weaponType(cls,item){
 if(!item)return 'none';const kind=String(item.kind||classes[cls]?.weapons?.[0]||'');
 if(/Arco/i.test(kind))return 'bow';if(/Besta/i.test(kind))return 'crossbow';
 if(/Cajado/i.test(kind))return 'staff';if(/Varinha|Grim[oó]rio/i.test(kind))return 'wand';
 if(/Machado/i.test(kind))return 'axe';if(/Martelo/i.test(kind))return 'hammer';
 if(/Adaga|L[aâ]mina/i.test(kind))return 'dagger';return 'sword';
}
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function drawScene(cls,eq){
 const W=AVATAR_WIDTH,H=AVATAR_HEIGHT;
 const chars=Array.from({length:H},()=>Array(W).fill(' '));
 const ink=Array.from({length:H},()=>Array(W).fill('base'));
 // Pintura por camadas: contorno e densidade variam com relevo e superficie.
 function mask(x1,y1,x2,y2,inside,slot,material=0,edgeSymbol=null){
  x1=clamp(Math.floor(x1),0,W-1);x2=clamp(Math.ceil(x2),0,W-1);
  y1=clamp(Math.floor(y1),0,H-1);y2=clamp(Math.ceil(y2),0,H-1);
  const visible=rarityOf(eq,slot);
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){
   const depth=inside(x+.5,y+.5);
   if(depth<=0)continue;
   const left=inside(x-.5,y+.5),right=inside(x+1.5,y+.5);
   const above=inside(x+.5,y-.5),below=inside(x+.5,y+1.5);
   const boundary=Math.min(left,right,above,below)<=0;
   const shade=clamp(.23+.60*depth+.18*(1-(x-x1)/(x2-x1+1))+.07*Math.sin((x*3+y*7+material*13)*.61),0,.999);
   chars[y][x]=boundary?(edgeSymbol||(left<=0||right<=0?'|':above<=0||below<=0?'-':'/')):RAMP[Math.floor(shade*(RAMP.length-1))];
   ink[y][x]=visible;
  }
 }
 const rect=(x,y,w,h,slot,material=0)=>mask(x,y,x+w,y+h,(px,py)=>px>=x&&px<x+w&&py>=y&&py<y+h?1:0,slot,material);
 const oval=(cx,cy,rx,ry,slot,material=0)=>mask(cx-rx-1,cy-ry-1,cx+rx+1,cy+ry+1,(x,y)=>1-((x-cx)/rx)**2-((y-cy)/ry)**2,slot,material);
 const poly=(points,slot,material=0)=>{
  const X=points.map(p=>p[0]),Y=points.map(p=>p[1]);
  mask(Math.min(...X),Math.min(...Y),Math.max(...X),Math.max(...Y),(x,y)=>{
   let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
   }return hit?Math.min(1,Math.max(.15,(Math.min(...X.map(v=>Math.abs(x-v)))+3)/9)):0;
  },slot,material);
 };
 const line=(x1,y1,x2,y2,ch,slot='base',thick=1)=>{
  const dx=x2-x1,dy=y2-y1,steps=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))*2);
  for(let i=0;i<=steps;i++){
   const x=Math.round(x1+dx*i/Math.max(1,steps)),y=Math.round(y1+dy*i/Math.max(1,steps));
   for(let t=0;t<thick;t++)put(x+t,y,ch,slot);
  }
 };
 function put(x,y,ch,slot='base'){
  if(x>=0&&x<W&&y>=0&&y<H&&ch!==' '){chars[y][x]=ch;ink[y][x]=rarityOf(eq,slot);}
 }
 const text=(x,y,value,slot='base')=>[...value].forEach((c,i)=>put(x+i,y,c,slot));
 const armor=clamp(Number(eq.body?.armor||0),0,3);
 const classArmor=cls==='guerreiro'?2:cls==='arqueiro'?1:cls==='ladino'?1:0;
 const grade=armor||classArmor;
 const shoulder=grade===3?13:grade===2?11:grade===1?9:7;
 const robe=cls==='mago'&&grade<3,coat=cls==='ladino'&&grade<3;
 // Silhueta inferior, com pernas separadas para nao produzir uma coluna uniforme.
 if(robe){
  poly([[24,24],[40,24],[46,42],[18,42]],'base',3);
  line(32,29,32,42,'|');
  line(23,36,41,36,'_');
 }else if(coat){
  poly([[25,23],[39,23],[43,39],[35,36],[32,27],[29,36],[21,39]],'base',2);
 }
 poly([[25,25],[31,25],[30,40],[24,42],[21,40]],'base',1);
 poly([[33,25],[39,25],[43,40],[39,42],[34,40]],'base',1);
 // Calçados acompanham o proprio slot, sem alterar atributos.
 poly([[23,38],[30,38],[30,42],[19,42],[19,40]],'feet',4);
 poly([[35,38],[42,38],[46,42],[34,42]],'feet',4);
 if(eq.feet){text(21,40,'|###|','feet');text(37,40,'|###|','feet');}
 // Torso e ombreiras, com volume explicitamente diferente por classe/categoria.
 oval(32,18,shoulder,9,'body',grade+2);
 poly([[32-shoulder,15],[32-shoulder+3,12],[32+shoulder-3,12],[32+shoulder,15],[39,28],[25,28]],'body',grade+3);
 if(grade===3){
  oval(19,15,8,5,'body',6);oval(45,15,8,5,'body',6);
  line(24,14,40,14,'=','body',2);text(25,18,'/%%####%%\\','body');
  text(26,22,'[##====##]','body');line(32,15,32,25,'|','body');
 }else if(grade===2){
  oval(21,15,6,4,'body',3);oval(43,15,6,4,'body',3);
  text(26,18,'{*######*}','body');text(27,22,'[==##==]','body');
 }else if(grade===1){
  text(26,18,'/::****::\\','body');text(26,22,'|=+=++=+=|','body');
 }else{line(27,14,25,27,'/','body');line(37,14,39,27,'\\','body');text(29,19,'<**>','body');}
 if(eq.body){text(28,20,grade===3?'|####|':grade===2?'[####]':'<++++>','body');}
 line(25,27,39,27,'=','body');
 // Bracos laterais conectam-se aos ombros. Detalhes das luvas so se eq.hands.
 poly([[23,16],[18,17],[17,29],[22,30],[26,21]],'base',2);
 poly([[41,16],[46,17],[47,29],[42,30],[38,21]],'base',2);
 oval(19,29,3,3,'hands',4);oval(45,29,3,3,'hands',4);
 if(eq.hands){text(16,28,'[###]','hands');text(42,28,'[###]','hands');}
 // Pescoco e rosto. Cada classe possui uma anatomia identificavel.
 rect(29,9,6,5,'base',2);
 oval(32,8,6,7,'base',3);
 const head=eq.head,heavyHelmet=Number(head?.armor||0)>=3;
 if(head){
  if(heavyHelmet){
   poly([[26,3],[29,0],[35,0],[38,3],[39,12],[36,14],[28,14],[25,12]],'head',6);
   text(27,5,'/%%%%%%%\\','head');text(27,8,'[==  ==]','head');text(28,11,'|######|','head');
  }else{
   poly([[32,0],[37,2],[40,12],[36,14],[28,14],[24,12],[27,2]],'head',2);
   text(27,6,'/:::::::\\','head');text(28,10,'|_  _|','head');
  }
 }else if(cls==='mago'||cls==='ladino'){
  poly([[32,0],[36,1],[40,13],[35,11],[29,11],[24,13],[28,1]],'base',3);
  text(28,7,cls==='mago'?'/o  o\\':'/ -- \\');
 }else if(cls==='arqueiro'){
  poly([[26,2],[38,2],[40,8],[24,8]],'base',3);text(27,4,'/==++==\\');
 }else{text(27,3,'/#####\\');text(28,7,'| o o |');}
 if(!heavyHelmet){text(28,9,'/  --  \\',head?'head':'base');text(30,12,'\__/ ',head?'head':'base');}
 // Emblema de classe e acessorios, por cima da armadura.
 if(cls==='mago'){text(30,16,'<*>','body');line(31,22,32,26,':','body');}
 if(cls==='arqueiro'){text(24,17,'||','body');line(41,14,48,24,'/','base');}
 if(cls==='ladino'){text(28,17,'/\\','body');text(26,25,'==##==','body');}
 if(cls==='guerreiro'){text(29,17,'|##|','body');text(28,24,'[===]','body');}
 if(eq.amulet){text(30,15,'<*>','amulet');text(31,17,'@','amulet');}
 if(eq.ring){put(19,29,'@','ring');}
 // Arma ocupa a mao direita, linha 29. Nao existe slot de escudo na Etapa 8.
 const type=weaponType(cls,eq.weapon),weaponSlot='weapon';
 if(type==='sword'){
  line(49,4,49,33,'|',weaponSlot,2);text(48,2,'/\\',weaponSlot);
  text(44,26,'==[##]==',weaponSlot);text(47,31,'|_|',weaponSlot);
 }else if(type==='axe'){
  line(49,9,49,37,'|',weaponSlot,2);poly([[46,8],[56,8],[59,11],[57,18],[46,19]],weaponSlot,7);
  text(47,10,'/%%%%%\\',weaponSlot);text(45,25,'==[]==',weaponSlot);
 }else if(type==='hammer'){
  line(49,9,49,39,'|',weaponSlot,2);rect(43,8,14,6,weaponSlot,7);
  text(43,9,'[###########]',weaponSlot);
 }else if(type==='dagger'){
  line(50,22,50,36,'|',weaponSlot);text(49,19,'/\\',weaponSlot);text(47,28,'=[+]=',weaponSlot);
 }else if(type==='staff'||type==='wand'){
  const top=type==='staff'?1:17;
  line(49,top+4,49,41,'|',weaponSlot,2);
  text(46,top,'<%%%>',weaponSlot);text(47,top+2,'[O]',weaponSlot);
  text(46,29,'==[]',weaponSlot);
 }else if(type==='bow'){
  for(let y=7;y<=37;y++){
   const x=Math.round(49+6*(Math.abs(y-22)/15));put(x,y,y<22?'/':'\\',weaponSlot);
  }line(55,7,55,37,'|',weaponSlot);line(46,23,60,23,'=',weaponSlot);text(59,23,'>',weaponSlot);
 }else if(type==='crossbow'){
  line(44,28,59,28,'=',weaponSlot);text(53,27,'/\\',weaponSlot);text(58,28,'>',weaponSlot);
 }
 return {chars,ink,type};
}
export function composeHeroAvatar(state){
 const cls=classes[state?.cls]?state.cls:'guerreiro',eq=equippedVisuals(state);
 const key=JSON.stringify([cls,...VISIBLE_SLOTS.map(slot=>eq[slot]?[eq[slot].uid,eq[slot].rarity,eq[slot].armor,eq[slot].kind]:null)]);
 if(cache.has(key))return cache.get(key);
 const {chars,ink,type}=drawScene(cls,eq);
 const rows=chars.map(row=>row.join(''));
 const result={text:rows.join('\n'),rows,width:AVATAR_WIDTH,height:AVATAR_HEIGHT,ink,equipped:eq,weaponType:type};
 if(cache.size>150)cache.clear();cache.set(key,result);
 return result;
}
/** Versao de combate: reduz a grade sem cortar cabeca, membros ou arma. */
export function composeCompactHeroAvatar(state){
 const full=composeHeroAvatar(state),rows=[],inks=[];
 const order=' .:-=+*#%@|/\\[]()<>_';
 for(let y=0;y<full.height;y+=2){
  let row='',colors=[];
  for(let x=0;x<full.width;x+=2){
   const cells=[[x,y],[x+1,y],[x,y+1],[x+1,y+1]].map(([xx,yy])=>({ch:full.rows[yy][xx],ink:full.ink[yy][xx]}));
   const occupied=cells.filter(c=>c.ch!==' ');
   if(!occupied.length){row+=' ';colors.push('base');continue;}
   const most=occupied.sort((a,b)=>order.indexOf(b.ch)-order.indexOf(a.ch))[0];
   row+=most.ch;colors.push(most.ink);
  }
  rows.push(row);inks.push(colors);
 }
 return {text:rows.join('\n'),rows,width:32,height:22,ink:inks,equipped:full.equipped,weaponType:full.weaponType};
}
export function renderHeroAvatar(state,extraClass=''){
 if(['guerreiro','mago','arqueiro','ladino'].includes(state?.cls))return renderHighDensityHero(state,String(extraClass).includes('compact-density'));
 const a=String(extraClass).includes('compact-density')?composeCompactHeroAvatar(state):composeHeroAvatar(state);
 const lines=a.rows.map((row,y)=>{
  let html='',start=0;
  while(start<row.length){const color=a.ink[y][start];let end=start+1;
   while(end<row.length&&a.ink[y][end]===color)end++;
   const segment=escape(row.slice(start,end));html+=color==='base'?segment:`<span class="avatar-ink avatar-${color}">${segment}</span>`;start=end;
  }return html;
 });
 return `<pre class="ascii-art hero-portrait dynamic-hero density-hero ${escape(extraClass)}" data-ascii="true" aria-label="Avatar ASCII do ${escape(classes[state?.cls]?.name||'Guerreiro')} com equipamentos equipados">${lines.join('\n')}</pre>`;
}

// ASCII REALMS | Lote 4: retratos dos moradores e interiores regionais.
// Desenhos determinísticos, ASCII imprimível, sem alteração de mecânicas ou salvamentos.
import {LOCAL_NPCS,RECURRING_NPCS} from './city-life.js';
import {TAVERN_GUESTS} from './tavern-stories.js';
import {maps} from './data.js';

export const NPC_WIDTH=64, NPC_HEIGHT=40, INTERIOR_WIDTH=100, INTERIOR_HEIGHT=38;
export const INTERIOR_TYPES=Object.freeze(['tavern','forge','weapon','armor','accessory','potion','materials']);
const allNpc=[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS];
const hash=str=>{let n=2166136261;for(const c of str)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
class Canvas {
 constructor(w,h,seed){this.w=w;this.h=h;this.seed=seed;this.rows=Array.from({length:h},()=>Array(w).fill(' '));}
 put(x,y,ch){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.w&&y<this.h&&ch&&ch!==' ')this.rows[y][x]=ch[0];}
 line(x,y,X,Y,ch){const steps=Math.ceil(Math.max(Math.abs(X-x),Math.abs(Y-y))*2);for(let i=0;i<=steps;i++){const f=steps?i/steps:0;this.put(x+(X-x)*f,y+(Y-y)*f,ch);}}
 box(x,y,w,h,edge='|',fill=' '){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){this.put(i,j,j===y||j===y+h-1?'-':i===x||i===x+w-1?edge:fill);}}
 ellipse(cx,cy,rx,ry,ink='@%#*+=-:.',salt=0){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d>1)continue;const glint=(cx-x)/rx*.23-(cy-y)/ry*.21;const grain=((hash(`${this.seed}:${salt}:${x}:${y}`)%17)-8)/68;const k=Math.max(0,Math.min(ink.length-1,Math.floor((d*.6+glint+grain+.06)*(ink.length-1))));this.put(x,y,ink[k]);}}
 text(x,y,str){for(let i=0;i<str.length;i++)this.put(x+i,y,str[i]);}
 out(){return this.rows.map(r=>r.join('')).join('\n');}
}
function portrait(npc){const seed=hash(npc.id),p=new Canvas(NPC_WIDTH,NPC_HEIGHT,seed),role=(npc.role||'').toLowerCase(),n=(npc.name||'').toLowerCase();
 const hood=/exorcista|refugiada|andarilho|peregrina|sacerdot|acolito|acólito|vigia|vigilante|escriba|arquivista|herborista/.test(role),metal=/ferreir|mineir|batedor|sentinela|vigilante|guarda|caçad|ca[cç]ad|artes[aã]/.test(role),staff=/exorcista|curandeira|peregrina|ac[oó]lito|herborista/.test(role),bag=/mercador|cart[oó]graf|mensageir|viajante|guia|barqueiro/.test(role);
 const faceX=30+(seed%5)-2,faceY=12;const crown=hood?'#':'%';
 // Ombros e roupas em camadas: couro, tecido, ferro e fivelas.
 p.ellipse(faceX,32,16+((seed>>>4)%3),11,metal?'@%%##**++--':'@%#**++==--',3);
 for(let y=25;y<39;y++){const w=Math.min(19,9+(y-24));p.line(faceX-w,y,faceX+w,y,(y%4===0)?'#':metal?'%':'*');}
 for(let y=27;y<38;y+=3){p.line(faceX-10,y,faceX-6,y+2,'/');p.line(faceX+10,y,faceX+6,y+2,'\\');}
 p.ellipse(faceX,faceY+2,8,10,'@%%##**++--',4);
 if(hood){p.ellipse(faceX,10,11,12,'@%%##**++--',8);p.ellipse(faceX,14,7,8,' .:=+*##%',10);}
 else {for(let dx=-9;dx<=9;dx++){let y=5+Math.round(Math.abs(dx)*.22);p.put(faceX+dx,y,crown);p.put(faceX+dx,y+1,'#');}p.line(faceX-9,8,faceX-10,18,'#');p.line(faceX+9,8,faceX+10,18,'#');}
 for(const dx of [-4,4]){p.put(faceX+dx,15,'@');p.put(faceX+dx+1,15,'.');}
 p.line(faceX-2,21,faceX+2,21,'-');p.put(faceX,18,':');
 if(seed%3===0){p.line(faceX-6,22,faceX-4,24,'#');p.line(faceX+4,24,faceX+6,22,'#');}
 // Braços, mãos, cintos, ornamentos de profissão.
 for(const dx of [-14,14]){p.ellipse(faceX+dx,30,5,8,metal?'@%#*+':'+*#%:',dx);p.ellipse(faceX+dx,37,3,2,'@%#',dx+17);}
 p.line(faceX-10,33,faceX+10,33,'=');p.text(faceX-2,33,'[##]');
 if(staff){p.line(53,9,53,39,'|');p.line(50,11,53,7,'/');p.line(53,7,56,11,'\\');p.text(51,6,'*#*');}
 if(bag){p.box(49,28,10,10,'|',':');p.text(51,31,'###');p.line(46,24,54,28,'/');}
 if(metal){p.line(7,12,13,36,'/');p.line(10,14,14,36,'|');p.text(4,11,'[###]');}
 if(/mensageir|cart[oó]graf|escriba|arquivista/.test(role)){p.text(5,28,'/====\\');p.text(5,29,'| :::|');p.text(5,30,'\\====/');}
 if(n.includes('nox')||n.includes('silas')){p.put(13,5,'*');p.put(50,4,'*');}
 return p.out();}
function interior(region,type){const seed=hash(`${region}:${type}`),p=new Canvas(INTERIOR_WIDTH,INTERIOR_HEIGHT,seed),f=region%4,shade=['#','%','*','@'][f];
 // Hall with masonry, beams, converging floor and contrasting back wall.
 for(let y=0;y<30;y++){for(let x=0;x<INTERIOR_WIDTH;x++){const r=hash(`${seed}:${x}:${y}`)%29;if(r===0)p.put(x,y,':');else if(r===1)p.put(x,y,'.');}}
 for(let x=0;x<INTERIOR_WIDTH;x+=14){p.line(x,0,x,29,'|');p.line(x+1,0,x+1,29,':');}
 for(let y=4;y<30;y+=6){p.line(0,y,99,y,'-');for(let x=7+(y%3)*3;x<99;x+=19)p.put(x,y-2,'|');}
 p.line(1,1,98,1,'=');p.line(1,29,98,29,'=');p.line(0,37,34,29,'/');p.line(99,37,65,29,'\\');
 for(let y=30;y<38;y++){for(let x=0;x<100;x++){const t=hash(`${seed}:${x}:${y}`)%23;if(t<3)p.put(x,y,t===0?'%':':');}if(y%3===0)p.line(0,y,99,y,'_');}
 // Contrasting windows, beams and region-coded lamps.
 for(const x of [4,80]){p.box(x,7,16,13,'|',f===1?':':'.');p.text(x+2,8,'/==========\\');p.text(x+2,12,'|  .. **  |');p.text(x+2,16,'\\==========/');p.line(x+7,9,x+7,18,'|');}
 if(type==='tavern'){
  p.box(28,16,43,14,'|','%');p.text(32,19,'###  __   ____   __  ###');p.text(32,23,'(   )|__| (____) (   )');
  for(const x of [3,82]){p.box(x,28,14,8,'|','#');p.text(x+2,30,'(_____)');p.line(x+2,35,x+2,37,'|');}
  for(const x of [30,46,62]){p.box(x,9,5,6,'|',':');p.text(x+1,10,'o');}p.text(34,3,'/==  THE HEARTH  ==\\');
 }else if(type==='forge'){
  p.box(34,10,34,20,'|','%');p.text(39,13,'/-- FORGE FIRE --\\');p.ellipse(51,23,10,5,'@%%##**+=:',4);p.box(15,27,20,8,'|','#');p.text(19,29,'/--ANVIL--\\');p.line(77,14,68,32,'/');p.text(73,11,'[####]');
 }else if(type==='weapon'){
  for(const x of [29,40,51,62]){p.line(x,10,x,29,'|');p.text(x-2,9,'/##\\');p.text(x-2,29,'[##]');}p.text(28,4,'/== ARSENAL ==\\');p.box(22,31,55,6,'|','#');
 }else if(type==='armor'){
  for(const x of [25,48,71]){p.ellipse(x,19,9,10,'@%##**+=:',x);p.text(x-5,10,'/#####\\');p.text(x-5,20,'|#[]#|');p.text(x-6,29,'/======\\');}p.text(34,3,'[ ARMORY ]');
 }else if(type==='accessory'){
  p.box(22,12,56,19,'|',':');for(const x of [30,47,64]){p.text(x-3,15,'/---\\');p.text(x-3,17,'| * |');p.text(x-3,19,'\\---/');p.text(x-3,24,'(###)');}p.text(30,5,'|  RELICS & GEMS  |');
 }else if(type==='potion'){
  for(const x of [26,40,54,68]){p.text(x-4,17,' /--\\');p.text(x-4,18,' |::|');p.text(x-4,19,' |@@|');p.text(x-4,20,' \\__/');p.text(x-4,26,'[####]');}p.text(29,5,'{ ALCHEMICAL VIALS }');p.box(23,29,54,7,'|','%');
 }else if(type==='materials'){
  for(const x of [20,41,62]){p.box(x,16,18,15,'|','#');p.text(x+2,19,'/####\\');p.text(x+2,23,'|%%%%|');}p.text(33,5,'[ LOCAL MARKET ]');p.text(27,34,'<>   []   %%   <>');
 }
 // Region markers and fixture materials, intentionally not identical between cities.
 for(let k=0;k<8;k++){const x=8+k*11;if(hash(`${seed}:${k}`)%3===0)p.text(x,2,region===7?'@%':region===5?'**':region===2?'~~':'##');}
 return p.out();}
export const NPC_PORTRAITS=Object.freeze(Object.fromEntries(allNpc.map(n=>[n.id,portrait(n)])));
export const INTERIOR_ART=Object.freeze(Object.fromEntries(maps.flatMap((m,i)=>INTERIOR_TYPES.map(type=>[`${i}:${type}`,interior(i,type)]))));
export const densityNpcArtwork=id=>NPC_PORTRAITS[id]??null;
export const densityInteriorArtwork=(region,type)=>INTERIOR_ART[`${region}:${type}`]??null;

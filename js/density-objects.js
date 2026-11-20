/** Lote 5: biblioteca ASCII textual, determinística, sem alterar objetos persistidos. */
import {EQUIPMENT_CATALOG,CATALOG_BY_ID} from './equipment-catalog.js';
import {maps} from './data.js';
import {FORGE_MATERIALS} from './forge-materials.js';
import {ARTISAN_CATALYSTS} from './artisan-economy.js';
const W=27,H=21,CW=11,CH=9;
const ink='@%#*+=-:.';
function hash(s){let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0;}
class Pen{
 constructor(w=W,h=H){this.w=w;this.h=h;this.g=Array.from({length:h},()=>Array(w).fill(' '));}
 dot(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.w&&y<this.h&&c&&c!==' ')this.g[y][x]=c[0];}
 stroke(x,y,ex,ey,ch){const n=Math.max(Math.abs(ex-x),Math.abs(ey-y),1);for(let i=0;i<=n;i++)this.dot(x+(ex-x)*i/n,y+(ey-y)*i/n,ch);}
 text(x,y,t){[...t].forEach((c,i)=>this.dot(x+i,y,c));}
 rect(x,y,w,h,b='#',fill){for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(j===0||j===h-1||i===0||i===w-1)this.dot(x+i,y+j,b);else if(fill)this.dot(x+i,y+j,fill[(i+j)%fill.length]);}}
 fillEllipse(cx,cy,rx,ry,chars=ink){for(let y=Math.ceil(cy-ry);y<=cy+ry;y++)for(let x=Math.ceil(cx-rx);x<=cx+rx;x++){const d=Math.pow((x-cx)/Math.max(rx,1),2)+Math.pow((y-cy)/Math.max(ry,1),2);if(d<=1)this.dot(x,y,chars[Math.min(chars.length-1,Math.floor(d*chars.length))]);}}
 out(){return this.g.map(a=>a.join('')).join('\n');}
}
const rarityChars=['-=','+=','*#','%#','@%'];
function decoration(p,seed,rarity){const r=Number.isInteger(rarity)?Math.max(0,Math.min(4,rarity)):0;for(let i=0;i<r+1;i++){const x=3+(hash(`${seed}:${i}`)%21),y=3+(hash(`${seed}:${i}:y`)%15);if(p.g[y][x]!==' ')p.dot(x,y,rarityChars[r][i%2]);}}
function weapon(p,m,seed){const k=m.kind.toLowerCase(),r=seed%3;
 if(/arco|besta/.test(k)){p.stroke(5,3,7,17,'/');p.stroke(7,17,18,18,'_');p.stroke(18,18,21,13,'\\');p.stroke(21,13,18,4,'/');p.stroke(18,4,5,3,'_');p.stroke(6,3,19,18,'|');p.stroke(7,11,23,11,'=');p.text(21,10,'>>');if(k.includes('besta')){p.stroke(4,10,19,10,'#');p.rect(8,9,8,4,'%');}else{p.stroke(5,3,6,15,'#');p.stroke(19,5,21,13,'*');}}
 else if(/cajado|grimório/.test(k)){if(k.includes('grimório')){p.rect(6,4,16,15,'#','.:');p.stroke(13,5,13,18,'|');p.text(9,8,'*%@*');p.text(8,12,'<>++');p.text(9,16,'==--');}else{p.stroke(13,6,13,20,'|');p.stroke(14,8,14,20,'#');p.fillEllipse(13,5,4,3,'@%#*:');p.text(11,4,'<*>');p.text(10,9,'--=--');p.text(11,18,'[=]');}}
 else if(/adaga|lâmina curta|punhal/.test(k)){for(const d of [-1,1]){const x=14+6*d;p.stroke(x,4,x+d*2,12,'/');p.stroke(x-1,5,x+d*2,12,'%');p.stroke(x-3,13,x+3,13,'=');p.stroke(x,14,x,19,'#');p.text(x-1,18,'[]');}}
 else if(/machado|gume/.test(k)){p.stroke(12,3,12,20,'#');p.stroke(13,5,13,19,'|');p.fillEllipse(17,7,7,5,'@%%##**+:');p.stroke(20,3,22,10,'/');p.stroke(11,3,21,3,'=');p.stroke(11,12,22,12,'=');p.text(10,18,'[##]');}
 else{p.stroke(13,2,13,17,'#');p.stroke(12,4,12,15,'%');p.stroke(14,4,14,15,'*');p.stroke(13,1,13,4,'@');p.stroke(6,16,20,16,'=');p.stroke(8,15,18,15,'#');p.stroke(13,17,13,20,'|');p.text(11,19,'[##]');if(r===1){p.stroke(11,5,11,12,'/');p.stroke(15,5,15,12,'\\');}else if(r===2){p.text(10,8,'<@#@>');}}
}
function armor(p,m,seed){const slot=m.slot,weight=m.armor||1;
 if(slot==='head'){p.fillEllipse(13,9,weight===3?10:8,8,weight===3?'@%%##**+=-':'%##**++=--');p.rect(7,9,13,6,'#');p.text(9,11,weight===3?'|#==#|':'|:  :|');p.stroke(4,14,8,18,'/');p.stroke(22,14,18,18,'\\');if(weight===1){p.stroke(8,4,13,1,'/');p.stroke(13,1,18,4,'\\');}if(weight===3){p.text(10,3,'/###\\');p.text(8,16,'[====]');}}
 else if(slot==='body'){const rx=weight===3?11:weight===2?10:8;p.fillEllipse(13,10,rx,8,weight===3?'@%%##*++=-':'%##**++==-.');p.text(8,3,'/====\\');p.stroke(4,6,3,14,'/');p.stroke(22,6,23,14,'\\');for(let y=8;y<18;y+=3){p.stroke(6,y,20,y,weight===3?'#':'=');p.text(10,y,'[##]');}if(weight===1){p.stroke(7,16,4,20,'/');p.stroke(19,16,22,20,'\\');}if(weight===3){p.text(4,7,'[###]');p.text(18,7,'[###]');}}
 else if(slot==='hands'){for(const x of [4,16]){p.rect(x,4,8,13,'#',weight===3?'%#':'*+');p.stroke(x+1,16,x+1,20,'|');p.stroke(x+3,16,x+3,20,'|');p.stroke(x+5,16,x+5,20,'|');p.text(x+1,7,'[##]');}p.text(10,10,'==');}
 else if(slot==='feet'){for(const x of [4,15]){p.rect(x,2,8,15,'#',weight===3?'%#':'*+');p.stroke(x+1,15,x-1,19,'/');p.stroke(x+6,15,x+8,19,'\\');p.stroke(x-1,19,x+8,19,'=');for(let y=6;y<15;y+=4)p.text(x+1,y,'=##=');}}
 else {p.fillEllipse(13,10,8,7,'@%#*+=-:.');}
}
function accessory(p,m){if(m.slot==='ring'){p.fillEllipse(13,12,10,8,'@%#*+=-:.');p.fillEllipse(13,12,5,4,' .');p.text(10,3,'/###\\');p.text(11,5,'<@>');}else{p.stroke(4,3,13,9,'/');p.stroke(22,3,13,9,'\\');p.stroke(4,3,8,14,':');p.stroke(22,3,18,14,':');p.fillEllipse(13,13,7,7,'@%#*+=-:.');p.text(10,12,'<@#@>');p.text(11,15,'[+]');}}
function signature(p,id){
 // Ornamentos gravados no metal/tecido, não etiquetas com o nome.
 const h=hash(id),runes=['@','#','%','*','+','=','/', '\\','<','>'];
 const columns=[9,11,13,15,17];
 for(let i=0;i<5;i++){const x=columns[i],y=10+((h>>>(i*5))%3);p.dot(x,y,runes[(h>>>(i*3))%runes.length]);}
 const x=12+(h%4);p.dot(x,5,runes[(h>>>17)%runes.length]);
}
function equipment(m,rarity=0){const p=new Pen(),seed=hash(m.id);if(m.slot==='weapon')weapon(p,m,seed);else if(m.category==='armor')armor(p,m,seed);else accessory(p,m);signature(p,m.id);decoration(p,seed,rarity);return p.out();}
const MATERIALS=[...maps.map(m=>m[6]),...FORGE_MATERIALS,...ARTISAN_CATALYSTS];
function material(name){const p=new Pen(),seed=hash(name),idx=MATERIALS.indexOf(name),kind=idx<10?0:idx<20?1:2;
 if(kind===0){p.fillEllipse(13,12,9,7,'@%##**++=--:.');p.stroke(7,8,16,3,'/');p.stroke(16,3,21,8,'\\');p.stroke(9,14,19,14,'=');p.text(10,11,'<##>');}
 else if(kind===1){p.stroke(5,18,11,3,'/');p.stroke(11,3,23,9,'\\');p.stroke(23,9,19,19,'/');p.stroke(19,19,5,18,'=');p.fillEllipse(14,12,6,5,'@%##*+=-');p.text(10,11,'/%#\\');}
 else{p.rect(8,12,11,7,'#');p.stroke(7,12,10,5,'/');p.stroke(19,12,16,5,'\\');p.fillEllipse(13,7,6,6,'@%#*+=:');p.text(11,5,'<*>');p.text(10,18,'[===]');}
 signature(p,name);decoration(p,seed,2);return p.out();}
function supply(kind){const p=new Pen();if(['hp','mp','elixir','antidote'].includes(kind)){p.text(10,3,'/====\\');p.text(11,4,'|##|');p.stroke(9,7,7,11,'/');p.stroke(17,7,19,11,'\\');p.rect(7,11,13,8,'#',kind==='hp'?'@%':kind==='mp'?'*+':kind==='elixir'?'#%':'=+');p.text(10,13,kind==='hp'?'[++]':kind==='mp'?'[**]':kind==='elixir'?'[##]':'[==]');p.text(9,19,'\\====/');}else{p.rect(5,7,17,12,'#','.:');p.text(7,8,'/======\\');p.text(8,12,'[####]');p.text(8,16,'======');}return p.out();}
function compact(art){const lines=art.split('\n'),p=new Pen(CW,CH),sx=W/CW,sy=H/CH;for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const block=[];for(let yy=Math.floor(y*sy);yy<Math.min(H,Math.ceil((y+1)*sy));yy++)for(let xx=Math.floor(x*sx);xx<Math.min(W,Math.ceil((x+1)*sx));xx++){const c=lines[yy][xx];if(c!==' ')block.push(c);}if(block.length)p.dot(x,y,block[Math.floor(block.length/2)]);}return p.out();}
export const OBJECT_ART=Object.freeze(Object.fromEntries(EQUIPMENT_CATALOG.map(m=>[m.id,equipment(m)])));
export const MATERIAL_ART=Object.freeze(Object.fromEntries(MATERIALS.map(name=>[name,material(name)])));
export const SUPPLY_ART=Object.freeze(Object.fromEntries(['hp','mp','elixir','antidote','chest'].map(k=>[k,supply(k)])));
export const OBJECT_ICON=Object.freeze(Object.fromEntries([...Object.entries(OBJECT_ART),...Object.entries(MATERIAL_ART),...Object.entries(SUPPLY_ART)].map(([key,art])=>[key,compact(art)])));
export function equipmentArtwork(item){if(!item)return null;return OBJECT_ART[item.catalogId]||OBJECT_ART[item.id]||fallbackEquipmentArtwork(item);}
export function fallbackEquipmentArtwork(item){const category=['head','body','hands','feet'].includes(item.slot)?'armor':['ring','amulet'].includes(item.slot)?'accessory':'weapon';return equipment({id:item.uid||item.name||'original',slot:item.slot,category,kind:item.kind||'Espada',armor:item.armor||1},item.rarity||0);}
export function objectArtwork(key){return OBJECT_ART[key]||MATERIAL_ART[key]||SUPPLY_ART[key]||null;}
export function objectIcon(key){return OBJECT_ICON[key]||null;}
export const OBJECT_ART_DIMENSIONS=Object.freeze({detail:[W,H],compact:[CW,CH]});
export const OBJECT_MATERIAL_NAMES=Object.freeze(MATERIALS);

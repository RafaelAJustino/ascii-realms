/** Etapa HD7. Artes de equipamentos e recursos em ASCII puro, geradas sob demanda.
 * Os blueprints preservam a identidade dos modelos da Expansão Épica 6.
 * Nenhuma string de arte é persistida no salvamento. */
import {CATALOG_BY_ID,EQUIPMENT_CATALOG} from './equipment-catalog.js';
import {OBJECT_MATERIAL_NAMES} from './density-objects.js';
import {Scene,noise} from './hd-scene-engine.js';
export const HD_OBJECT_WIDTH=70,HD_OBJECT_HEIGHT=54;
export const HD_OBJECT_IDS=Object.freeze([...EQUIPMENT_CATALOG.map(x=>x.id),...OBJECT_MATERIAL_NAMES,'hp','mp','elixir','antidote','chest']);
const CACHE_LIMIT=18,cache=new Map();
function fingerprint(str){let n=2166136261;for(let i=0;i<str.length;i++)n=Math.imul(n^str.charCodeAt(i),16777619);return n>>>0;}
function cached(key,fn){if(cache.has(key)){const a=cache.get(key);cache.delete(key);cache.set(key,a);return a;}const a=fn();cache.set(key,a);if(cache.size>CACHE_LIMIT)cache.delete(cache.keys().next().value);return a;}
export function hdObjectCacheSize(){return cache.size;}
const stroke=(s,x,y,X,Y,c)=>s.segment(x,y,X,Y,c);
function jewel(s,x,y,r=7,seed=0){s.polygon([[x,y-r],[x+r*.75,y],[x,y+r],[x-r*.75,y]],(xx,yy)=>noise(xx,yy,s.seed+seed)>.5?'%':'#','*');stroke(s,x,y-r,x,y+r,'|');stroke(s,x-r*.7,y,x+r*.7,y,'=');s.ellipse(x-1,y-2,Math.max(1,r*.22),Math.max(1,r*.2),'#%@',seed+12);}
function gleam(s,cx,cy,rx,ry,seed=0){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<=1&&s.cells[y]?.[x]&&s.cells[y][x]!==' '&&noise(x,y,s.seed+seed)>.86)s.put(x,y,noise(x,y,s.seed+seed+31)>.42?'%':'*');}}
function weapon(s,model){const kind=(model.kind||'espada').toLowerCase(),seed=fingerprint(model.id);
 if(/arco|besta/.test(kind)){
  // Recurve bow / crossbow with limbs and tensioned string.
  const cx=31,top=6,bottom=48;
  for(let y=top;y<=bottom;y++){const phase=(y-top)/(bottom-top),curve=Math.sin(phase*Math.PI)*11;const x=kind.includes('besta')?cx+Math.round(curve*.35):cx+Math.round(curve);s.put(x,y,phase<.3?'%':phase<.7?'#':'*');s.put(x-1,y,'=',false);}
  stroke(s,cx,top,cx,bottom,':');stroke(s,cx-3,top,cx-3,bottom,'|');
  if(kind.includes('besta')){stroke(s,9,29,60,29,'#');stroke(s,14,26,54,26,'%');s.polygon([[27,31],[38,31],[43,49],[24,49]],(x,y)=>noise(x,y,seed)>.5?'#':'%','#');stroke(s,10,29,31,29,'=');stroke(s,49,29,60,29,'=');}
  else{stroke(s,18,25,51,25,'=');stroke(s,18,26,51,26,':');s.txt(48,23,'>>>');stroke(s,46,24,41,19,'/');stroke(s,46,26,41,31,'\\');}
  for(let k=0;k<7;k++)s.put(27+(seed%7),10+k*5,'%');
 }else if(/cajado|grim[oó]rio|tomo/.test(kind)){
  if(/grim[oó]rio|tomo/.test(kind)){
   s.polygon([[14,11],[35,14],[35,49],[14,45]],(x,y)=>noise(x,y,seed)>.48?'#':'%','#');
   s.polygon([[35,14],[57,10],[57,44],[35,49]],(x,y)=>noise(x,y,seed+1)>.4?'%':'*','#');
   stroke(s,35,15,35,49,'@');for(let y=19;y<42;y+=4){stroke(s,18,y,31,y+1,'=');stroke(s,40,y,54,y-1,':');}jewel(s,35,30,8,seed);s.txt(15,11,'/===/');s.txt(39,10,'\\==\\');
  }else{stroke(s,34,14,31,51,'#');stroke(s,35,14,32,51,'%');stroke(s,36,14,33,51,'*');jewel(s,35,11,9,seed);s.ellipse(35,11,14,9,' .:-=+*#%@',7);s.ellipse(35,11,7,5,' .:-=+*#%@',9);for(let y=22;y<48;y+=5){s.txt(29,y,'<===>');s.txt(34,y+2,'#');}s.txt(28,50,'/=====\\');}
 }else if(/machado|gume|martelo/.test(kind)){
  stroke(s,34,8,34,50,'#');stroke(s,35,8,35,50,'%');stroke(s,33,15,33,47,'*');
  s.polygon([[34,8],[46,6],[57,11],[61,18],[56,29],[45,32],[34,26]],(x,y)=>noise(x,y,seed)>.5?'%':'#','#');
  s.polygon([[34,8],[23,6],[13,10],[10,19],[16,29],[27,31],[34,25]],(x,y)=>noise(x,y,seed+1)>.5?'#':'*','%');
  stroke(s,59,12,61,21,'@');stroke(s,11,12,9,21,'@');for(let y=17;y<30;y+=3)stroke(s,18,y,51,y,'=');s.txt(30,45,'[####]');
 }else if(/adaga|punhal|l[aâ]mina curta/.test(kind)){
  for(const sign of [-1,1]){const x=35+sign*13;stroke(s,x,9,x+sign*4,37,'#');stroke(s,x+1,12,x+sign*4+1,35,'%');s.polygon([[x,7],[x+sign*7,38],[x-3*sign,36]],(xx,yy)=>noise(xx,yy,seed+sign)>.43?'*':'#','%');stroke(s,x-7,39,x+7,39,'=');stroke(s,x+2,40,x+2,50,'#');s.txt(x-2,48,'[##]');}
 }else{
  // Swords have distinct blade profiles and guards, not a generic line.
  const wide=model.region%3===0?6:4;const tip=6+(seed%3),base=38;
  s.polygon([[35,tip],[35+wide,tip+9],[35+wide-1,base],[35-wide+1,base],[35-wide,tip+9]],(x,y)=>noise(x,y,seed+10)>.55?'%':'#','%');
  stroke(s,35,tip,35,base,'@');for(let y=tip+8;y<base;y+=3){stroke(s,35-wide+1,y,35+wide-1,y,'=');s.put(35,y,'%');}
  stroke(s,20,39,50,39,'#');stroke(s,23,40,47,40,'%');s.polygon([[19,37],[25,37],[29,42],[24,43]],'#','#');s.polygon([[44,42],[49,37],[53,37],[49,43]],'#','#');
  stroke(s,35,42,35,51,'#');stroke(s,34,43,34,50,'%');s.txt(31,49,'[####]');
 }
 for(let i=0;i<7;i++){const x=14+(fingerprint(`${model.id}:${i}`)%41),y=13+(fingerprint(`y${model.id}:${i}`)%30);s.put(x,y,['*','%','+','#'][i%4],false);}
}
function armor(s,model){const weight=model.armor||1,seed=fingerprint(model.id),r=model.region||0;
 if(model.slot==='head'){
  const wide=weight===3?22:19;
  s.ellipse(35,28,wide,22,weight===3?'@%#*+=-:':' .:-=+*#%@',8);
  s.polygon([[35-wide,28],[25,14],[35,8],[44,14],[35+wide,28],[48,44],[22,44]],(x,y)=>noise(x,y,seed)>.43?'%':'#','#');
  s.ellipse(35,33,12,13,' .:-=+*#%@',12);for(let x=27;x<44;x+=3)stroke(s,x,32,x,39,weight===1?':':'#');
  if(weight===3){stroke(s,14,25,12,40,'@');stroke(s,55,25,58,40,'@');s.txt(24,21,'<====@@====>');s.txt(26,43,'/==========\\');}
  else{s.txt(24,13,'/===+====+===\\');stroke(s,15,29,22,44,'/');stroke(s,55,29,48,44,'\\');}
  jewel(s,35,18,4,r);
 }else if(model.slot==='body'){
  const rx=weight===3?23:weight===2?20:17;
  s.polygon([[35-rx,15],[25,9],[45,9],[35+rx,15],[48,47],[22,47]],(x,y)=>noise(x,y,seed)>.45?'#':'%','#');
  s.ellipse(35,27,rx-4,18,weight===1?' .:-=+*#%@':'@%#*+=-:.',7);s.polygon([[23,14],[47,14],[51,43],[20,43]],(x,y)=>noise(x,y,seed+2)>.46?'%':'#','#');
  for(let y=19;y<43;y+=5){stroke(s,22,y,48,y,weight===3?'#':'=');for(const x of [27,42])s.put(x,y,'@');}
  stroke(s,35,15,35,45,weight===1?'|':'@');
  for(const x of [13,57]){s.ellipse(x,19,weight===3?13:8,weight===3?11:8,'@%#*+=-:',x);s.put(x,13,'@');}s.txt(27,43,'[==##==]');jewel(s,35,27,weight===3?8:5,r);
  if(weight===1){stroke(s,17,43,8,51,'/');stroke(s,53,43,62,51,'\\');}
 }else if(model.slot==='hands'){
  for(const x of [18,51]){s.polygon([[x-8,8],[x+7,8],[x+9,36],[x+7,47],[x-9,45],[x-11,35]],(xx,yy)=>noise(xx,yy,seed+x)>.5?'%':'#','#');for(let y=15;y<42;y+=5){stroke(s,x-8,y,x+8,y,'=');}for(let i=0;i<4;i++)stroke(s,x-6+i*4,39,x-7+i*4,51,'#');s.txt(x-6,31,'[##]');}
 }else if(model.slot==='feet'){
  for(const x of [18,50]){s.polygon([[x-8,7],[x+7,7],[x+7,36],[x+13,43],[x+12,49],[x-11,49],[x-13,44]],(xx,yy)=>noise(xx,yy,seed+x)>.5?'%':'#','#');for(let y=13;y<40;y+=5)stroke(s,x-8,y,x+7,y,'=');s.txt(x-9,47,'[=====]');}
 }else{ s.ellipse(35,28,23,18,' .:-=+*#%@',3);}
 for(let i=0;i<6;i++){const x=24+((seed>>>(i*4))%23),y=18+((seed>>>(i*3))%20);s.put(x,y,['@','%','#','*','+','='][i]);}
}
function accessory(s,model){const seed=fingerprint(model.id);
 if(model.slot==='ring'){
  s.ellipse(35,33,24,16,' .:-=+*#%@',4);s.ellipse(35,33,15,10,'@%#*+=-:.',6);for(let y=26;y<43;y++)for(let x=19;x<51;x++){if(((x-35)/14)**2+((y-33)/9)**2<.84)s.erase(x,y);}
  s.polygon([[27,14],[35,5],[43,14],[43,24],[27,24]],(x,y)=>noise(x,y,seed)>.5?'#':'%','#');jewel(s,35,15,8,seed);s.txt(20,28,'*===*');s.txt(43,28,'*===*');
 }else{
  stroke(s,10,9,35,26,'#');stroke(s,60,9,35,26,'%');stroke(s,11,10,35,31,':');stroke(s,59,10,35,31,':');
  for(let x=11;x<60;x+=5){s.put(x,12+(Math.abs(x-35)*.37),'*');}
  s.ellipse(35,33,20,17,'@%#*+=-:.',3);jewel(s,35,32,13,seed);s.txt(25,49,'/======\\');
 }
}
function material(s,name){const ix=OBJECT_MATERIAL_NAMES.indexOf(name),region=ix%10,seed=fingerprint(name);
 if(ix<10){s.polygon([[16,38],[24,16],[33,7],[48,14],[58,36],[47,49],[20,47]],(x,y)=>noise(x,y,seed)>.5?'%':'#','#');s.ellipse(37,32,16,16,' .:-=+*#%@',region);for(let i=0;i<9;i++){const x=24+(fingerprint(`${name}/${i}`)%28),y=19+(fingerprint(`y/${name}/${i}`)%25);s.put(x,y,['@','%','#','*'][i%4]);}stroke(s,21,39,49,18,'/');}
 else if(ix<20){s.polygon([[12,43],[27,16],[35,6],[46,17],[60,39],[42,49],[21,50]],(x,y)=>noise(x,y,seed)>.5?'@':'%','#');stroke(s,15,43,34,10,'/');stroke(s,34,10,56,43,'\\');s.ellipse(37,30,13,14,'@%#*+=-:.',6);jewel(s,37,27,8,seed);}
 else{s.ellipse(35,28,20,22,' .:-=+*#%@',6);s.polygon([[35,3],[54,16],[59,41],[35,51],[12,41],[16,16]],(x,y)=>noise(x,y,seed)>.5?'#':'%','#');jewel(s,35,25,13,seed);for(let i=0;i<7;i++)s.txt(14+i*5,48-i%3,'*');}
 // Each region has a different, engravable structure (not a label).
 for(let i=0;i<region+2;i++){let x=12+(i*6)%49,y=44-(i%4)*3;s.segment(x,y,x+2,y-2,i%2?'*':'%');}
}
function supply(s,kind){const seed=fingerprint(kind);
 if(kind==='chest'){
  s.polygon([[12,24],[18,11],[51,11],[58,24],[55,47],[15,47]],(x,y)=>noise(x,y,seed)>.55?'%':'#','#');
  s.polygon([[13,22],[20,8],[50,8],[57,22]],(x,y)=>noise(x,y,seed+2)>.5?'#':'%','@');stroke(s,15,28,55,28,'=');for(const x of [18,49]){stroke(s,x,25,x,46,'@');s.txt(x-3,25,'[===]');}s.txt(30,31,'[####]');jewel(s,35,32,4,seed);s.txt(20,46,'[=============]');
 }else{
  s.polygon([[28,8],[42,8],[42,16],[48,24],[48,44],[42,50],[26,50],[22,44],[22,24],[28,16]],(x,y)=>noise(x,y,seed)>.52?'#':'%','#');
  s.ellipse(35,34,17,14,kind==='hp'?'@%%##*+=':kind==='mp'?'*++==--:.':kind==='elixir'?'@%#*+=-:.':'%#*++=-:.',4);stroke(s,27,9,43,9,'=');stroke(s,26,12,44,12,'#');stroke(s,25,19,45,19,':');stroke(s,24,44,46,44,'@');jewel(s,35,31,kind==='elixir'?11:8,seed);for(let i=0;i<8;i++)s.put(23+i*3,38,['#','%','*','@'][i%4]);
 }
}
function background(s,seed,region){for(let i=0;i<55;i++){const x=3+(fingerprint(`${seed}:x:${i}`)%64),y=3+(fingerprint(`${seed}:y:${i}`)%47);if(noise(x,y,seed)>.4)s.put(x,y,i%7?' .:'[i%3]:'*',false);}for(const x of [3,65]){s.segment(x,12,x,42,'|',false);s.segment(x+1,15,x+1,38,':',false);}s.segment(7,51,62,51,'=',false);const marks=['/\\','--','~~','##','::','**','++','@@','*+','..'];s.txt(8,49,marks[region%10]);s.txt(60,49,marks[region%10]);}
function make(model,key){const seed=fingerprint(key),region=model?.region??seed%10,s=new Scene(HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT,seed);background(s,seed,region);
 if(model){if(model.category==='weapon')weapon(s,model);else if(model.category==='armor')armor(s,model);else accessory(s,model);}else if(OBJECT_MATERIAL_NAMES.includes(key))material(s,key);else supply(s,key);
 // A distinctive sigil is engraved on the *object*, never a text label.
 const glyphs=['@','#','%','*','+','=','/','\\','<','>'];
 if(model&&model.slot==='body')for(let i=0;i<6;i++)s.put(28+i*2,36,glyphs[(seed>>>(i*4))%glyphs.length]);
 else if(model&&model.slot==='weapon')for(let i=0;i<4;i++)s.put(30+i*3,44,glyphs[(seed>>>(i*5))%glyphs.length],false);
 else if(model)for(let i=0;i<5;i++)s.put(26+i*4,34,glyphs[(seed>>>(i*4))%glyphs.length],false);
 gleam(s,35,24,26,22,region);return s.out();}
export function highDensityObjectArtwork(key){if(typeof key!=='string'||!HD_OBJECT_IDS.includes(key))return null;return cached(key,()=>make(CATALOG_BY_ID.get(key),key));}
export function highDensityEquipmentArtwork(item){if(!item||typeof item!=='object')return null;
 const key=item.catalogId||item.id;
 if(CATALOG_BY_ID.has(key))return highDensityObjectArtwork(key);
 const slot=['weapon','head','body','hands','feet','ring','amulet'].includes(item.slot)?item.slot:'weapon';
 const fallback={id:`legacy:${item.kind||''}:${slot}:${item.name||''}`,region:Number.isInteger(item.region)?Math.abs(item.region)%10:0,slot,category:slot==='weapon'?'weapon':['ring','amulet'].includes(slot)?'accessory':'armor',kind:item.kind||'Espada',armor:item.armor||1};
 return cached(fallback.id,()=>make(fallback,fallback.id));
}

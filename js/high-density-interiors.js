// ASCII REALMS | Etapa 6: sete estabelecimentos por cidade, em alta densidade.
import {maps} from './data.js';
import {INTERIOR_TYPES} from './density-settlements.js';
import {Scene,noise} from './hd-scene-engine.js';
export const INTERIOR_HD_WIDTH=124,INTERIOR_HD_HEIGHT=54;
export const HIGH_DENSITY_INTERIOR_TYPES=INTERIOR_TYPES;
const MAX=10,cache=new Map();
const cached=(key,fn)=>{if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}const v=fn();cache.set(key,v);if(cache.size>MAX)cache.delete(cache.keys().next().value);return v;};
export const interiorCacheSize=()=>cache.size;
function glass(s,x,y,w=16,h=17,mode='glow'){s.shadeRect(x,y,w,h,s.seed+61,' .:-=+*#%@',mode==='ice'?.70:.26,mode==='ice'?.94:.73);s.outline(x,y,w-1,h-1,'#');s.segment(x+w/2,y,x+w/2,y+h,'|');s.segment(x,y+h*.48,x+w,y+h*.48,'=');for(let k=0;k<3;k++)s.segment(x+2,y+2+k*4,x+5,y+2+k*4,'/');}
function shelf(s,x,y,w=36,h=31){s.outline(x,y,w,h,'#');for(let j=5;j<h;j+=8){s.segment(x+1,y+j,x+w-1,y+j,'=');s.segment(x+2,y+j+1,x+w-2,y+j+1,'.');}for(const xx of [x+4,x+w-5])s.segment(xx,y,xx,y+h,'|');}
function cask(s,x,y,w=11,h=15){s.ellipse(x+w/2,y+h/2,w/2,h/2,'@%#**+==:',6);s.segment(x,y+3,x+w,y+3,'=');s.segment(x,y+h-3,x+w,y+h-3,'=');s.txt(x+2,y+Math.floor(h/2),'[###]');}
function desk(s,x,y,w,h=12){s.shadeRect(x,y,w,h,s.seed+56,' .:-=+*#%@',.39,.75);s.outline(x,y,w-1,h-1,'#');s.segment(x,y+3,x+w,y+3,'=');for(let xx=x+4;xx<x+w-2;xx+=10)s.segment(xx,y+h-2,xx,y+h+4,'|');}
function rackSword(s,x,y,offset=0){s.segment(x,y+4,x,y+22,'|');s.segment(x-3,y+4,x+3,y+4,'=');s.segment(x-2,y+6,x+2,y+6,'=');s.polygon([[x,y-2],[x+2,y+4],[x-2,y+4]],(xx,yy)=>noise(xx,yy,s.seed+offset)>.4?'%':'#');s.txt(x-2,y+22,'[##]');}
function suit(s,x,y,h=24){s.ellipse(x,y+5,5,7,' .:-=+*#%@',2);s.ellipse(x,y+14,9,12,' .:-=+*#%@',4);s.segment(x-8,y+9,x+8,y+9,'=');s.segment(x,y+12,x,y+24,'|');s.segment(x-7,y+22,x+7,y+22,'=');s.segment(x-6,y+26,x-6,y+h+7,'|');s.segment(x+6,y+26,x+6,y+h+7,'|');}
function potion(s,x,y,h=11){s.band(x+4,y,5,3,'#');s.ellipse(x+6,y+h*.67,7,h*.40,'@%#*+=-:');s.txt(x+3,y+4,'/===\\');s.txt(x+3,y+h-1,'\\===/');}
function chest(s,x,y,w=20,h=10){s.shadeRect(x,y,w,h,s.seed+10,' .:-=+*#%@',.4,.81);s.outline(x,y,w-1,h-1,'#');s.segment(x,y+3,x+w-1,y+3,'=');s.txt(x+Math.floor(w*.40),y+5,'[%]');}
function fireplace(s,x,y){s.stone(x,y-19,29,19,s.seed+100,.48);s.arch(x+3,y-14,22,14);s.ellipse(x+14,y-8,11,7,'@%#*+=-:.',11);s.txt(x+6,y-17,'/==FIRE==\\');s.segment(x-2,y,x+31,y,'=');}
function workAnvil(s,x,y){s.shadeRect(x,y-7,25,5,s.seed+4,' .:-=+*#%@',.4,.85);s.polygon([[x+3,y-2],[x+23,y-2],[x+18,y+3],[x+8,y+3]],'#','=');s.segment(x+9,y+3,x+9,y+10,'|');s.segment(x+16,y+3,x+16,y+10,'|');s.segment(x+2,y+10,x+22,y+10,'=');}
function localMotifs(s,region){const motif=['##','~=','~:','%%','::','**','++','@%','*+','@.'][region],objectKind=region===1?'palm':region===6?'dead':'pine';
 for(const x of [6,117]){s.segment(x,3,x,37,'|');for(let y=5;y<33;y+=5){s.txt(x-2,y,motif);}}
 if(region===0){s.segment(2,6,32,6,'=');for(let y=8;y<32;y+=6)s.segment(5,y,10,y+3,'/');}
 if(region===1){for(const x of [16,108])s.ellipse(x,7,5,4,' .:-=*#%@',x);}
 if(region===2){for(let y=30;y<36;y+=3)s.segment(0,y,124,y,'~');}
 if(region===3){for(const x of [6,117])s.segment(x-3,12,x+3,16,'/');}
 if(region===4){for(const x of [6,117])s.segment(x-4,23,x+4,20,':');}
 if(region===5){for(const x of [25,100])s.txt(x,7,'*   *');}
 if(region===6){for(const x of [9,115])s.txt(x-2,11,'+');}
 if(region===7){for(const x of [12,110])s.ellipse(x,32,4,4,' .:-=+*#%@',x);}
 if(region===8){for(const x of [24,98])s.txt(x,6,'* . *');}
 if(region===9){for(const x of [10,111])s.txt(x,10,'/\\');}
}
function backdrop(s,region){const isDark=[6,7,9].includes(region),ice=region===5;
 // Receding ceiling beams and stone relief; clear central negative space for fixtures.
 s.shadeRect(0,0,124,37,s.seed+3,' .:-=+*#%@',isDark?.23:.32,ice?.83:.67);
 for(let y=0;y<37;y+=7){s.segment(0,y,123,y,y===0?'@':'=');for(let x=(y/7)%2?7:0;x<124;x+=18)s.segment(x,y+1,x,y+3,'|');}
 for(const x of [0,21,102,122]){s.segment(x,0,x,37,'#');s.segment(x+1,0,x+1,37,region===5?'%':':');}
 s.segment(0,36,123,36,'=');s.polygon([[0,37],[124,37],[124,54],[0,54]],(x,y)=>noise(x,y,s.seed+5)>.5?':':'.');
 for(let y=40;y<54;y+=4){s.segment(0,y,123,y,'_');for(let x=(y%3)*5;x<124;x+=18)s.segment(x,y-3,x-4,y-1,'/');}
 s.segment(0,53,49,37,'/');s.segment(123,53,73,37,'\\');
 glass(s,5,9,17,18,region===5?'ice':'glow');glass(s,102,9,17,18,region===5?'ice':'glow');
 // Architectural changes are deliberate, large-scale shapes, not a changed label.
 if(region===0){for(const x of [24,99]){s.segment(x,2,x,38,'#');s.segment(x-2,6,x+2,6,'=');s.segment(x-7,28,x+4,17,'/');}s.txt(8,2,"/\\     /\\");}
 if(region===1){for(const x of [28,91]){s.arch(x-7,12,14,22);s.ellipse(x,11,9,5,' .:-=+*#%@',x);}s.segment(29,35,95,35,'=');}
 if(region===2){for(const x of [11,109]){s.segment(x,34,x,49,'|');s.segment(x-5,34,x+5,34,'=');}for(let x=4;x<122;x+=9)s.segment(x,51,x+7,49,'~');}
 if(region===3){for(const x of [18,103]){s.segment(x,2,x,33,'#');s.segment(x-7,4,x+7,4,'=');s.txt(x-3,13,'[##]');}for(let x=0;x<123;x+=16)s.segment(x,34,x+7,34,'=');}
 if(region===4){for(const x of [16,108]){s.segment(x-6,13,x+5,30,'/');s.segment(x-3,15,x+1,23,'|');}for(let x=6;x<123;x+=19)s.segment(x,1,x+8,5,'\\');}
 if(region===5){for(const x of [16,37,86,109]){s.polygon([[x-5,2],[x+5,2],[x,19]],(xx,yy)=>noise(xx,yy,s.seed)>.6?'%':'*','/');}for(let x=4;x<121;x+=13)s.txt(x,34,'*.*');}
 if(region===6){for(const x of [32,90]){s.segment(x-7,4,x,21,'/');s.segment(x,21,x+7,4,'\\');s.segment(x-8,4,x+8,4,'=');s.txt(x-2,13,'+');}s.txt(55,10,"/\\  /\\");}
 if(region===7){for(const x of [26,96]){s.stone(x-5,12,11,25,s.seed+x,.42);s.ellipse(x,32,6,5,'@%#*+=-:',x);}for(let x=5;x<124;x+=11)s.txt(x,35,'@@');}
 if(region===8){for(const x of [26,95]){s.segment(x-4,8,x-4,35,'#');s.segment(x+4,8,x+4,35,'#');s.segment(x-6,7,x+6,7,'=');s.segment(x-6,34,x+6,34,'=');}s.ellipse(62,7,10,5,' .:-=*#%@',18);}
 if(region===9){for(const x of [25,98]){s.polygon([[x,3],[x+9,18],[x,33],[x-9,18]],(xx,yy)=>noise(xx,yy,s.seed+x)>.5?'@':'#','/');}s.segment(42,8,82,8,'=');for(let x=0;x<124;x+=14)s.txt(x,35,'@.');}
 localMotifs(s,region);
}
function maker(region,type){const s=new Scene(INTERIOR_HD_WIDTH,INTERIOR_HD_HEIGHT,3000+region*73+INTERIOR_TYPES.indexOf(type)*107);backdrop(s,region);
 if(type==='tavern'){
  fireplace(s,48,35);desk(s,35,34,54,11);for(const x of [6,108])cask(s,x-1,40,14,13);
  for(const x of [28,91]){s.ellipse(x,46,16,4,'@%##*+=-:',x);s.segment(x-10,47,x-10,53,'|');s.segment(x+10,47,x+10,53,'|');}
  for(const x of [43,59,75]){s.ellipse(x,29,4,6,' .:-=*#%@',x);s.txt(x-2,31,'(_)');}
  s.txt(48,5,'/== THE HEARTH ==\\');
 }else if(type==='forge'){
  fireplace(s,39,34);workAnvil(s,54,42);shelf(s,5,6,28,27);for(const x of [9,23])rackSword(s,x,10,x);
  s.segment(98,8,90,39,'/');s.txt(95,8,'[####]');s.txt(52,5,'<< FORGE >>');
  s.ellipse(51,30,14,6,'@%#**+==',4);
 }else if(type==='weapon'){
  shelf(s,30,6,64,29);for(const x of [39,51,63,75,87])rackSword(s,x,8,x);desk(s,31,38,63,10);for(const x of [17,106])s.segment(x,17,x+6,37,'/');
  s.txt(49,4,'< ARMORY >');
 }else if(type==='armor'){
  for(const x of [35,62,89]){suit(s,x,13);s.segment(x-12,45,x+12,45,'=');}
  s.txt(51,4,'[ ARMOR ]');chest(s,9,42,23,10);chest(s,93,42,23,10);
 }else if(type==='accessory'){
  shelf(s,28,9,69,29);desk(s,27,38,70,11);
  for(const x of [37,55,73,88]){s.txt(x-3,14,'/---\\');s.txt(x-3,17,'| @ |');s.txt(x-3,20,'\\___/');s.ellipse(x,31,5,4,'@%#*+=-:');}s.txt(43,5,'{ RELICS & GEMS }');
 }else if(type==='potion'){
  shelf(s,25,7,76,28);for(const x of [32,46,60,74,88])potion(s,x,14,12);for(const x of [34,55,76])potion(s,x,29,10);
  desk(s,26,39,75,11);s.ellipse(62,41,14,5,'@%#*+=-:.',5);s.txt(43,5,'{ ALCHEMY }');
 }else if(type==='materials'){
  for(const x of [23,49,75]){chest(s,x,34,24,16);s.txt(x+3,32,'/#####\\');s.txt(x+4,39,region===5?'**%%**':region===7?'@@%%@@':'##%%##');}
  for(const x of [14,109]){shelf(s,x-9,13,19,25);}s.txt(43,5,'[ LOCAL MARKET ]');
 }
 // A regional sigil is attached to architecture, not a label pasted over the portrait.
 const marks=['Y','O','~','M','X','*','+','@','*','0'];s.txt(60,2,`<${marks[region]}>`);
 return s.out();}
export function highDensityInteriorArtwork(region,type){if(!Number.isInteger(region)||region<0||region>=maps.length||!INTERIOR_TYPES.includes(type))return null;return cached(`${region}:${type}`,()=>maker(region,type));}

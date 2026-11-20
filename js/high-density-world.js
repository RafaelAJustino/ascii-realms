// ASCII REALMS | Etapa 6: 30 paisagens de alta densidade, sob demanda.
// Todas as ilustrações são texto ASCII e conservam os identificadores oficiais.
import {maps} from './data.js';
import {canonicalDungeons} from './ascii-validator.js';
import {Scene,noise} from './hd-scene-engine.js';
export const WORLD_WIDTH=140, WORLD_HEIGHT=64;
export const WORLD_IDS=Object.freeze({cities:maps.map(m=>m[1]),biomes:maps.map(m=>m[0]),dungeons:[...canonicalDungeons]});
const cache=new Map(), MAX_CACHE=8;
const stash=(id,make)=>{if(cache.has(id)){const value=cache.get(id);cache.delete(id);cache.set(id,value);return value;}const value=make();cache.set(id,value);if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);return value;};
export const worldCacheSize=()=>cache.size;
const path=(s,mid,y0)=>{s.polygon([[mid-5,y0],[mid+6,y0],[mid+45,63],[mid-48,63]],(x,y)=>noise(x,y,s.seed)>.57?':':'.');for(let y=y0+4;y<62;y+=4){const half=5+(y-y0)*1.5;s.segment(mid-half,y,mid+half,y,noise(y,mid,s.seed)>.5?'_':'.');}};
const glimmer=(s,cx,cy,rx,ry,seed)=>{for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){let dy=(y-cy)/ry,dx=(x-cx)/rx;if(dx*dx+dy*dy<1&&noise(x,y,seed)>.53)s.put(x,y,noise(x,y,seed+7)>.5?'@':'*');}};
function obelisk(s,x,y,h=28,ink='@'){const w=Math.round(h*.26);s.polygon([[x,y-h],[x+w*.5,y-h+4],[x+w,y-h],[x+w+2,y],[x-2,y]],(xx,yy)=>noise(xx,yy,s.seed)>.55?ink:'#','#');s.segment(x+w*.5,y-h+4,x+w*.5,y,'|');s.segment(x-4,y,x+w+4,y,'=');}
function columns(s,x0,base,count,step,h,broken=false){for(let i=0;i<count;i++){const x=x0+i*step,top=base-h+(broken&&i%3===0?5:0);s.shadeRect(x,top,5,base-top,s.seed+i,' .:-=+*#%@',.35,.93);s.segment(x-2,top,x+6,top,'=');s.segment(x-3,base,x+7,base,'=');s.segment(x+2,top+2,x+2,base-1,'|');}if(!broken)s.segment(x0-3,base-h-3,x0+(count-1)*step+8,base-h-3,'=');}
function river(s,y=52,kind='water'){for(let yy=y;yy<64;yy++){const left=kind==='lava'?54-Math.round((yy-y)*1.6):25-Math.round((yy-y)*1.1),right=kind==='lava'?78+Math.round((yy-y)*2):107+Math.round((yy-y)*.7);for(let x=Math.max(0,left);x<Math.min(140,right);x++){const n=noise(x,yy,s.seed+9);s.put(x,yy,kind==='lava'?(n>.6?'@':n>.35?'%':'#'):(n>.69?'~':n>.42?'=':'_'));}}}
function boats(s,x,y){s.polygon([[x,y],[x+30,y],[x+23,y+6],[x+7,y+6]],(xx,yy)=>noise(xx,yy,s.seed)>.4?'#':'*','#');s.segment(x+15,y,x+15,y-17,'|');s.polygon([[x+16,y-16],[x+16,y-1],[x+27,y-2]],(xx,yy)=>noise(xx,yy,s.seed)>.5?'+':'=','/');}
function grave(s,x,y){s.band(x,y-9,8,9,(xx,yy)=>noise(xx,yy,s.seed)>.62?'%':'#');s.segment(x,y-10,x+7,y-10,'_');s.segment(x-2,y,x+10,y,'=');s.segment(x+4,y-8,x+4,y-3,'|');s.segment(x+2,y-6,x+6,y-6,'-');}
function forge(s,x,y){s.stone(x,y-23,32,23,s.seed+4,.58);s.roof(x-5,y-32,42,12,s.seed+3,'ash');glimmer(s,x+16,y-16,11,7,s.seed+9);s.txt(x+7,y-7,'/==ANVIL==\\');s.segment(x+6,y-6,x+26,y-6,'=');}
function portal(s,x,y,radius=16){s.ellipse(x,y-radius/2,radius,radius*1.3,'@%##*+=-:.',6);s.ellipse(x,y-radius/2,radius*.68,radius*.93,' .:-=+*#%',17);for(let t=0;t<11;t++){const theta=t*6.283/11,x1=x+Math.cos(theta)*radius,y1=y-radius/2+Math.sin(theta)*radius*1.3;s.put(x1,y1,t%2?'@':'*');}}
function makeCity(index){const s=new Scene(WORLD_WIDTH,WORLD_HEIGHT,100+index*101),night=index>=6;s.sky(36,night);if([1,3,5,7,9].includes(index))s.skyline(31,index===3?29:17,index===5?'ice':index===7?'ash':'rock',index*19+17);s.ground(50,[2].includes(index)?'water':index===7?'lava':index===5?'ice':index===9?'void':'soil');
 switch(index){
 case 0: // Log settlement, elevated watchtower, timber market and ancient trunks.
  for(const [x,h] of [[8,24],[129,29],[24,21],[111,18]])s.tree(x,55,h/19,'pine');s.building(19,52,33,24,'wood',10);s.building(84,52,34,26,'wood',13);s.tower(58,52,22,37,'wood');s.segment(6,52,133,52,'=');path(s,70,55);break;
 case 1: // Oasis city, minarets and twin domes reflected in water.
  s.ellipse(66,15,8,6,' .:-+*#%@',3);s.building(10,54,45,24,'dome',3);s.building(83,53,46,25,'dome',4);for(const x of [5,68,127])s.tower(x,54,10,38,'stone',x);river(s,55);s.tree(2,50,1,'palm');s.tree(136,50,1,'palm');break;
 case 2: // Stilt houses, suspension jetty and canal.
  river(s,46);for(const x of [6,49,96]){s.building(x,48,35,20,'wood',x);for(let j=3;j<35;j+=10)s.segment(x+j,48,x+j,61,'|');}s.segment(0,49,139,49,'=');for(let k=0;k<140;k+=8)s.segment(k,49,k+4,54,'/');boats(s,42,55);for(const x of [3,135])s.tree(x,50,.9,'swamp');break;
 case 3: // Iron citadel between cliffs with multi-tier battlements.
  s.stone(11,32,118,22,s.seed+1,.52);s.segment(11,31,129,31,'=');for(const x of [4,39,100,126])s.tower(x,55,14,40,'stone',x);s.tower(52,55,36,48,'stone');s.arch(58,36,24,19);for(const x of [16,87])s.window(x,37,9,9);path(s,70,52);break;
 case 4: // Cracked archway and reconstructed shelter among a fallen colonnade.
  columns(s,4,52,4,18,31,true);s.building(68,54,39,24,'stone',2);s.arch(46,30,30,27);for(const x of [14,36,118]){s.segment(x,56,x+9,49,'/');s.segment(x+1,57,x+11,53,'#');}s.ellipse(119,52,14,5,'.:-=+*#',5);break;
 case 5: // Ice palisades with crystal cathedral and insulated houses.
  s.skyline(28,22,'ice',811);for(const x of [6,39,100])s.building(x,53,31,22,'ice',x);s.tower(65,53,24,43,'ice');for(const x of [4,127])obelisk(s,x,55,28,'%');for(let y=55;y<63;y+=3)s.segment(0,y,139,y,'_');break;
 case 6: // A cursed chapel beside graves and leafless trees.
  s.building(42,53,57,31,'obsidian',7);s.tower(63,53,16,48,'obsidian');s.segment(60,10,82,10,'=');for(const x of [6,19,108,126])grave(s,x,54);for(const x of [0,137])s.tree(x,51,1.3,'dead');glimmer(s,71,36,10,6,20);break;
 case 7: // Basalt bridge, molten moat, iron fortress.
  s.skyline(32,29,'ash',7);s.stone(17,31,109,23,s.seed+2,.37);for(const x of [6,112])s.tower(x,52,20,43,'obsidian');s.tower(56,52,26,49,'obsidian');river(s,54,'lava');s.segment(47,55,93,55,'=');s.segment(41,62,99,62,'=');break;
 case 8: // Luminous avenue of columns, domes and central sanctum.
  for(const x of [6,108])s.building(x,51,28,29,'dome',x);columns(s,38,54,5,15,28);s.building(57,51,30,36,'temple',27);s.tower(65,51,13,45,'temple');path(s,70,54);for(let x=4;x<140;x+=17)s.put(x,56,'*');break;
 case 9: // Geometry dissolves around floating bastion and central gate.
  s.skyline(40,19,'rock',888);for(const x of [10,113]){s.tower(x,54,16,45,'obsidian',x);obelisk(s,x+18,49,25,'@');}s.stone(40,34,60,20,23,.27);portal(s,70,34,19);for(let x=8;x<135;x+=17)s.segment(x,55,x+6,50,'/');s.ellipse(70,57,24,3,'.:-=+*#',10);break;
 }
 // Deliberate foreground relief, no border or title printed over the illustration.
 for(let x=2;x<140;x+=13){if(noise(x,62,s.seed)>.50){s.segment(x,62,x+3,60,'/');s.put(x+4,60,index===5?'*':index===7?'@':'.');}}
 return s.out();}
function makeBiome(index){const s=new Scene(WORLD_WIDTH,WORLD_HEIGHT,1200+index*97),dark=index>=6;s.sky(38,dark);s.ground(49,index===2?'water':index===7?'lava':index===5?'ice':index===9?'void':'soil');
 switch(index){
 case 0:for(const x of [5,24,43,96,117,137])s.tree(x,51,1.65+(x%3)*.2,'pine');path(s,70,46);s.segment(51,51,89,51,'=');for(const x of [50,88])s.segment(x,51,x,60,'#');break;
 case 1:s.skyline(42,12,'rock',15);for(const x of [5,32,108,134])s.tree(x,50,1,'palm');s.ellipse(70,51,24,8,' .:-=+*#%',13);for(let x=15;x<130;x+=7)s.segment(x,59,x+6,58,'_');break;
 case 2:river(s,49);for(const x of [0,18,35,97,117,139])s.tree(x,49,1.25,'swamp');for(let x=10;x<140;x+=8)s.segment(x,57,x+3,48,'/');boats(s,52,54);break;
 case 3:s.skyline(43,38,'rock',23);for(const x of [9,42,97])obelisk(s,x,52,16,'#');path(s,68,50);for(let x=10;x<120;x+=18)s.segment(x,58,x+9,52,'/');break;
 case 4:columns(s,14,53,4,24,30,true);s.arch(93,28,34,28);s.tree(4,51,1.2,'dead');s.tree(133,51,1.15,'dead');for(let x=10;x<139;x+=15)s.segment(x,61,x+8,57,'/');break;
 case 5:s.skyline(42,38,'ice',52);for(const x of [10,32,88,124])obelisk(s,x,53,17,'%');for(let y=51;y<64;y+=4)s.segment(0,y,139,y,'_');break;
 case 6:for(const x of [4,18,39,103,128])s.tree(x,52,1.25,'dead');for(const x of [55,70,86])grave(s,x,51);portal(s,70,27,13);path(s,69,52);break;
 case 7:s.skyline(40,37,'ash',421);river(s,49,'lava');for(const x of [6,29,112,132])obelisk(s,x,52,32,'@');s.segment(42,47,99,47,'=');break;
 case 8:columns(s,10,53,6,23,30,true);s.ellipse(67,19,16,4,' .:-=*#%@',12);s.tower(61,52,17,36,'temple');path(s,71,52);break;
 case 9:s.skyline(44,30,'rock',89);for(const x of [11,38,104,128])obelisk(s,x,54,31,'@');portal(s,70,29,20);for(let y=49;y<64;y+=4)s.segment(1,y,139,y,':');break;
 }
 return s.out();}
function makeDungeon(index){const s=new Scene(WORLD_WIDTH,WORLD_HEIGHT,2200+index*113); // radial perspective into a regional chamber
 s.polygon([[0,0],[140,0],[108,20],[31,20]],(x,y)=>noise(x,y,s.seed)>.5?'#':'%');s.polygon([[0,0],[30,20],[30,49],[0,64]],(x,y)=>noise(x,y,s.seed)>.45?'#':':');s.polygon([[140,0],[109,20],[109,49],[140,64]],(x,y)=>noise(x,y,s.seed)>.45?'@':'#');s.polygon([[0,64],[30,49],[109,49],[140,64]],(x,y)=>noise(x,y,s.seed)>.5?':':'.');
 for(let y=8;y<64;y+=7){const f=y/64,x=Math.floor(29*(1-f));s.segment(x,y,30,y,'=');s.segment(109,y,139-x,y,'=');s.segment(x+1,y,x+3,Math.min(63,y+5),'|');s.segment(137-x,y,136-x,Math.min(63,y+5),'|');}
 s.arch(43,22,54,31);s.door(60,32,21,21);s.segment(0,63,30,49,'/');s.segment(139,63,109,49,'\\');for(const x of [18,116]){s.segment(x,28,x+3,12,'|');s.ellipse(x+3,11,5,5,' .:-=*#%@',x);}
 switch(index){
 case 0:for(const x of [13,40,100,126])s.tree(x,56,.83,'dead');for(let x=30;x<120;x+=8)s.segment(x,11,x+4,33,'/');break;
 case 1:for(const x of [14,120])obelisk(s,x,58,28,'%');for(let y=33;y<63;y+=6)s.segment(34,y,106,y,'~');break;
 case 2:river(s,56);for(const x of [10,29,103,130])s.tree(x,58,.9,'swamp');for(const x of [42,97])glimmer(s,x,39,8,6,s.seed+x);break;
 case 3:for(const x of [8,102])forge(s,x,55);for(const x of [30,105])glimmer(s,x,23,10,8,s.seed+x);break;
 case 4:columns(s,31,57,5,20,29,true);for(const x of [12,120])grave(s,x,60);break;
 case 5:for(const x of [14,34,93,128])obelisk(s,x,62,35,'%');s.ellipse(69,19,15,5,' .:-=+*%@',61);break;
 case 6:for(const x of [10,29,108,126])grave(s,x,60);for(let y=5;y<50;y+=6)s.segment(40,y,100,y,':');break;
 case 7:river(s,57,'lava');for(const x of [15,119])obelisk(s,x,56,28,'@');glimmer(s,70,43,12,9,s.seed);break;
 case 8:columns(s,7,57,4,17,33);columns(s,93,57,3,17,33);s.ellipse(70,10,9,4,' .:-=*#%@',0);break;
 case 9:for(const x of [9,122])obelisk(s,x,58,36,'@');portal(s,70,36,21);for(let x=35;x<102;x+=8)s.segment(x,63,x+5,55,'/');break;
 }
 return s.out();}
function idxOf(name,list){return list.indexOf(name);}
export function highDensityCityArtwork(name){const i=idxOf(name,WORLD_IDS.cities);return i<0?null:stash(`city:${i}`,()=>makeCity(i));}
export function highDensityBiomeArtwork(name){const i=idxOf(name,WORLD_IDS.biomes);return i<0?null:stash(`biome:${i}`,()=>makeBiome(i));}
export function highDensityDungeonArtwork(name){const i=idxOf(name,WORLD_IDS.dungeons);return i<0?null:stash(`dungeon:${i}`,()=>makeDungeon(i));}

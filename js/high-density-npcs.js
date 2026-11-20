/** ASCII REALMS HD7: 32 retratos de NPCs, arquitetura de arte sob demanda. */
import {LOCAL_NPCS,RECURRING_NPCS} from './city-life.js';
import {TAVERN_GUESTS} from './tavern-stories.js';
import {Scene,noise} from './hd-scene-engine.js';
export const HD_NPC_WIDTH=96,HD_NPC_HEIGHT=68;
const NPCS=[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS];
export const HD_NPC_IDS=Object.freeze(NPCS.map(n=>n.id));
const byId=new Map(NPCS.map(n=>[n.id,n]));
const cache=new Map(),LIMIT=8;
const hash=str=>{let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
export const hdNpcCacheSize=()=>cache.size;
function paintCloth(s,cx,cy,rx,ry,seed,hard=false){s.ellipse(cx,cy,rx,ry,hard?'@%##**+==--:':' .:-=+*##%%@',seed);for(let y=cy-ry+4;y<cy+ry-1;y+=6){s.segment(cx-rx*.65,y,cx+rx*.65,y,hard?'=':':');s.segment(cx-rx*.5,y+1,cx-rx*.1,y+3,hard?'%':'*');}}
function staff(s,x,y,seed){s.segment(x,y-39,x,y+10,'#');s.segment(x+1,y-37,x+1,y+10,'%');s.ellipse(x,y-39,6,7,' .:-=+*#%@',seed);s.txt(x-4,y-39,'<%#%>');s.txt(x-2,y+7,'[##]');}
function weapon(s,x,y,type){if(type==='hammer'){s.segment(x,y-30,x,y+9,'#');s.polygon([[x-8,y-32],[x+9,y-32],[x+10,y-22],[x-9,y-22]],'%','#');s.segment(x-9,y-32,x+10,y-32,'@');}else if(type==='bow'){s.segment(x,y-36,x+6,y-17,'/');s.segment(x+6,y-17,x,y+8,'\\');s.segment(x,y-36,x,y+8,':');s.segment(x,y-17,x+13,y-17,'=');s.txt(x+10,y-19,'>>>');}else{s.segment(x,y-34,x,y+10,'#');s.segment(x-3,y-5,x+3,y-5,'=');s.txt(x-2,y+8,'[##]');}}
function make(npc){const seed=hash(npc.id),name=npc.name||'',role=(npc.role||'').toLowerCase(),s=new Scene(HD_NPC_WIDTH,HD_NPC_HEIGHT,seed);
 const cx=46+(seed%9)-4,cy=22,front=seed%3,hood=/andarilho|exorcista|peregr|ac[oó]lito|refug|vigia|cart[oó]graf|escriba|arquivista|barqueira|herborista/.test(role),armor=/vigilante|guarda|sentinela|ferreir|mineir|batedor|ca[cç]ad|desertor|artes[aã]|lenhador/.test(role),hasBag=/mensageir|mercador|guia|barqueir|cart[oó]graf|viajante|diplomata/.test(role);
 const scale=17+(seed%4),shoulder=27+(seed%7),headRx=11+(seed%3),h=68;
 // Diffuse environment is text, never a raster image.
 for(let i=0;i<90;i++){const x=2+(hash(`${seed}:x${i}`)%92),y=2+(hash(`${seed}:y${i}`)%65);if(noise(x,y,seed)>.42)s.put(x,y,['.',':','*'][i%3],false);}
 for(const x of [5,90]){s.segment(x,12,x,58,':',false);s.segment(x+1,20,x+1,53,'.',false);}
 // Outer cape and asymmetrical hem, shoulder silhouette, forearms anchored at hands.
 s.polygon([[cx-shoulder,42],[cx-16,34],[cx+14,34],[cx+shoulder,42],[cx+shoulder+3,66],[cx-shoulder-1,66]],(x,y)=>noise(x,y,seed+3)>.46?'#':'%','#');
 paintCloth(s,cx,51,shoulder,16,6,armor);
 s.ellipse(cx-shoulder+4,49,10,14,armor?'@%%##**+=':' .:-=+*#%@',4);
 s.ellipse(cx+shoulder-4,49,10,14,armor?'@%%##**+=':' .:-=+*#%@',8);
 s.segment(cx-shoulder,47,cx-shoulder-3,62,'/');s.segment(cx+shoulder,47,cx+shoulder+3,62,'\\');
 s.ellipse(cx-shoulder+3,64,7,4,'@%#*+=-',11);s.ellipse(cx+shoulder-3,64,7,4,'@%#*+=-',12);
 for(let y=39;y<65;y+=5){s.segment(cx-15,y,cx+15,y,armor?'#':'=');s.segment(cx-10,y+1,cx-3,y+4,'/');s.segment(cx+3,y+4,cx+10,y+1,'\\');}
 s.segment(cx-16,61,cx+16,61,'=');s.txt(cx-4,60,'[==##==]');
 // Head: jaw, cheek, eyes, beard/hair. Keep a coherent silhouette.
 s.ellipse(cx,cy+3,headRx,17,' .:-=+*#%@',9);
 s.polygon([[cx-headRx,cy-1],[cx-headRx+2,cy-13],[cx,cy-18],[cx+headRx-2,cy-12],[cx+headRx,cy+1],[cx+7,cy+13],[cx-7,cy+13]],(x,y)=>noise(x,y,seed)>.48?'#':'%','#');
 s.ellipse(cx,cy+5,headRx-2,13,' .:-=+*#%@',14);
 if(hood){s.ellipse(cx,cy-1,headRx+6,21,' .:-=+*#%@',19);s.ellipse(cx,cy+5,headRx-3,13,' .:-=+*#%@',20);s.segment(cx-headRx-4,cy-7,cx-10,cy+18,'#');s.segment(cx+headRx+4,cy-7,cx+10,cy+18,'#');s.txt(cx-5,cy-14,'/###\\');}
 else{const style=seed%4;for(let x=cx-headRx+1;x<=cx+headRx;x++)for(let y=cy-15;y<cy-11+(Math.abs(x-cx)/headRx)*4;y++){s.put(x,y,style===0?'%':style===1?'#':'@');}for(const sign of [-1,1])s.segment(cx+sign*(headRx-2),cy-12,cx+sign*(headRx+2),cy+5,'#');}
 const eyeY=cy+2+(seed%2);for(const d of [-5,5]){s.txt(cx+d-2,eyeY,'=@@');s.put(cx+d,eyeY+1,'.');}
 s.segment(cx-2,cy+7,cx+2,cy+7,':');s.segment(cx-4,cy+11,cx+4,cy+11,'=');s.put(cx,cy+9,'*');
 if(/ferreir|mineir|ca[cç]ador|lenhador|mercador/.test(role)){
  for(let y=cy+12;y<=cy+19;y++){s.segment(cx-6+Math.floor((y-cy-12)*.5),y,cx+6-Math.floor((y-cy-12)*.5),y,noise(y,cx,seed)>.5?'%':'#');}
 }
 if(armor){s.ellipse(cx-20,43,12,8,'@%##**+=:',24);s.ellipse(cx+20,43,12,8,'@%##**+=:',25);s.polygon([[cx-14,43],[cx+14,43],[cx+10,56],[cx,60],[cx-10,56]],(x,y)=>noise(x,y,seed)>.5?'#':'%','#');s.segment(cx-12,46,cx+12,46,'@');}
 if(hasBag){s.polygon([[cx+22,46],[cx+35,47],[cx+37,63],[cx+19,64]],(x,y)=>noise(x,y,seed)>.5?'#':'*','#');s.txt(cx+21,52,'[###]');s.segment(cx+15,35,cx+29,50,'/');}
 // Professions change equipment and pose, not merely a label.
 if(/herborista|exorcista|ac[oó]lito|curandeira|peregrina/.test(role))staff(s,12,49,seed);
 else if(/ferreir|mineir|lenhador|artes[aã]/.test(role))weapon(s,14,50,'hammer');
 else if(/ca[cç]ad|batedor/.test(role))weapon(s,12,50,'bow');
 else if(/guarda|sentinela|vigia|vigilante|desertor/.test(role))weapon(s,13,51,'sword');
 else if(/cart[oó]graf|escriba|arquivista|mensageira|mensageiro/.test(role)){s.polygon([[8,44],[24,42],[29,59],[12,61]],'#','#');s.txt(10,48,'/====\\');for(let i=0;i<4;i++)s.txt(12,50+i*2,'--::-');}
 if(/diplomata/.test(role)){s.polygon([[cx-20,39],[cx,50],[cx+20,39],[cx,59]],(x,y)=>noise(x,y,seed)>.4?'%':'#','#');s.txt(cx-5,51,'<##%#>');}
 if(name.toLowerCase().includes('nox')||name.toLowerCase().includes('silas')){s.ellipse(cx,cy-3,19,22,' .:-=+*#%@',37);s.txt(cx-4,cy,'##@@##');}
 // Each person's physical attributes also vary by face and garment stitching.
 for(let i=0;i<8;i++){const x=cx-14+(hash(`${npc.id}/a${i}`)%29),y=44+(hash(`${npc.id}/b${i}`)%16);s.put(x,y,['%','#','*','+','@',':'][i%6]);}
 return s.out();}
export function highDensityNpcArtwork(id){if(!byId.has(id))return null;if(cache.has(id))return cache.get(id);const a=make(byId.get(id));cache.set(id,a);if(cache.size>LIMIT)cache.delete(cache.keys().next().value);return a;}

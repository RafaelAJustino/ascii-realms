/** Etapa HD7: ilustrações narrativas em ASCII. O texto/decisões não são modificados. */
import {NARRATIVE_EVENTS} from './journey-events.js';
import {EPIC_EVENTS} from './epic-events.js';
import {TAVERN_EVENTS} from './tavern-stories.js';
import {Scene,noise} from './hd-scene-engine.js';
export const HD_EVENT_WIDTH=120,HD_EVENT_HEIGHT=64;
const EVENTS=[...NARRATIVE_EVENTS,...EPIC_EVENTS,...TAVERN_EVENTS],byId=new Map(EVENTS.map(e=>[e.id,e]));
export const HD_EVENT_IDS=Object.freeze(EVENTS.map(e=>e.id));
const cache=new Map(),LIMIT=8;
export const hdEventCacheSize=()=>cache.size;
const hash=s=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const CONFIG={
 'wounded-traveler':'traveler','forgotten-altar':'altar','suspicious-chest':'chest','trapped-creature':'cage','attacked-caravan':'wagon','ancient-ruins':'ruin','mysterious-spring':'spring','lost-merchant':'traveler','abandoned-camp':'camp','hidden-passage':'door',
 'road-toll':'ambush','caravan-ledger':'ledger','bandit-hideout':'ambush','bandit-deserter':'traveler','witness-confrontation':'ambush','hungry-refugees':'camp','watchtower-smoke':'tower','moonlit-shrine':'altar','venom-tracks':'tracks','forgotten-letter':'letter','fallen-soldier':'armor','masked-pilgrim':'traveler','broken-bridge':'bridge','mining-dispute':'mine','frozen-camp':'camp','ashen-offering':'altar','celestial-envoy':'traveler','void-whispers':'portal','stolen-medicine':'potion','ambushed-messenger':'ambush',
 'tavern-mapa-rasgado':'ledger','tavern-voz-na-mata':'forest','tavern-odre-perdido':'potion','tavern-poco-selado':'spring','tavern-raiz-negra':'forest','tavern-barco-vazio':'boat','tavern-contrato-ferro':'ledger','tavern-molde-perdido':'forge','tavern-nome-apagado':'ledger','tavern-selo-funerario':'altar','tavern-rastro-sem-pegadas':'tracks','tavern-cartas-do-frio':'letter','tavern-sino-calado':'tower','tavern-vila-esquecida':'ruin','tavern-ordem-das-cinzas':'ledger','tavern-metal-das-brasas':'forge','tavern-juramento-velado':'altar','tavern-carta-da-aurora':'letter','tavern-memoria-perdida':'portal','tavern-ultima-chama':'camp'
};
const line=(s,x,y,X,Y,c)=>s.segment(x,y,X,Y,c);
function figure(s,x,y,seed,variation=0){const hood=variation%3===0,guard=variation%3===2;
 s.ellipse(x,y-23,7,10,' .:-=+*#%@',seed);s.ellipse(x,y-21,4,7,' .:-=+*#%@',seed+2);
 if(hood){s.ellipse(x,y-26,10,11,'@%#*+=-:.',3);s.txt(x-4,y-28,'/####\\');}else{s.txt(x-5,y-31,'/##%##\\');}
 s.ellipse(x,y-8,12,13,guard?'@%##**+=:':' .:-=+*#%@',seed+4);s.polygon([[x-11,y-18],[x+12,y-18],[x+17,y+3],[x-17,y+3]],(xx,yy)=>noise(xx,yy,seed)>.4?'#':'%','#');
 for(let j=0;j<4;j++)line(s,x-10,y-14+j*4,x+10,y-14+j*4,guard?'#':'=');
 line(s,x-10,y-13,x-18,y-1,'/');line(s,x+10,y-13,x+17,y-1,'\\');line(s,x-5,y+3,x-8,y+12,'#');line(s,x+5,y+3,x+8,y+12,'#');
 line(s,x-11,y+13,x-3,y+13,'=');line(s,x+3,y+13,x+11,y+13,'=');
 if(guard){line(s,x+18,y-10,x+18,y-36,'#');s.txt(x+15,y-10,'=###=');}
}
function monument(s,x,y,type='altar',seed=0){
 if(type==='altar'){s.stone(x-23,y-11,46,14,s.seed+7,.67);s.stone(x-16,y-24,32,13,s.seed+1,.72);s.ellipse(x,y-28,11,12,' .:-=+*#%@',seed);s.ellipse(x,y-28,5,8,'@%#*+=-',seed+2);s.txt(x-11,y-21,'/==========\\');s.txt(x-4,y-32,'<##>');}
 if(type==='tower'){s.tower(x-16,y+9,32,49,'stone',seed);s.ellipse(x+1,y-41,7,6,' .:-=+*#%@',seed);for(let i=0;i<15;i++){const px=x-11+hash(`${seed}:${i}`)%23,py=y-47-hash(`v${seed}:${i}`)%10;s.put(px,py,i%3?'*':'.');}}
 if(type==='ruin'){for(const xx of [x-35,x-19,x+8,x+26]){s.stone(xx,y-27,10,30,seed+xx,.54);s.segment(xx-2,y-27,xx+11,y-27,'=');}s.arch(x-13,y-39,30,40,seed);s.segment(x-32,y+5,x+32,y+5,'=');}
 if(type==='door'){s.stone(x-26,y-37,52,42,seed,.65);s.arch(x-13,y-34,26,40,seed+1);s.door(x-11,y-9,22,19,seed);for(const xx of [x-20,x+20])s.segment(xx,y-30,xx,y+4,'#');}
 if(type==='portal'){s.ellipse(x,y-15,26,34,' .:-=+*#%@',seed);s.ellipse(x,y-15,20,27,'@%##*+=-:',seed+1);for(let i=0;i<12;i++){const angle=i*Math.PI/6,px=x+Math.cos(angle)*27,py=y-15+Math.sin(angle)*35;s.put(px,py,i%2?'@':'*');}s.txt(x-7,y-17,'<*#@#*>');}
}
function book(s,x,y,seed,kind='ledger'){
 s.polygon([[x-23,y-18],[x,y-14],[x,y+17],[x-23,y+13]],(xx,yy)=>noise(xx,yy,seed)>.5?'#':'%','#');
 s.polygon([[x,y-14],[x+26,y-19],[x+26,y+12],[x,y+17]],(xx,yy)=>noise(xx,yy,seed+1)>.5?'*':'%','#');
 line(s,x,y-13,x,y+18,'@');for(let j=-10;j<12;j+=5){line(s,x-20,y+j,x-4,y+j+3,'=');line(s,x+5,y+j+3,x+22,y+j,':');}
 if(kind==='letter'){s.txt(x-6,y+2,'<@@>');s.txt(x-5,y+5,'[##]');}else{s.txt(x-9,y,'/====\\');}
}
function chest(s,x,y,seed){s.polygon([[x-26,y-14],[x-20,y-28],[x+21,y-28],[x+27,y-14],[x+25,y+17],[x-25,y+17]],(xx,yy)=>noise(xx,yy,seed)>.4?'%':'#','#');
 s.polygon([[x-26,y-14],[x-22,y-32],[x+21,y-32],[x+27,y-14]],(xx,yy)=>noise(xx,yy,seed+1)>.4?'#':'%','#');
 line(s,x-26,y-8,x+27,y-8,'=');for(const xx of [x-18,x+16]){line(s,xx,y-12,xx,y+17,'@');s.txt(xx-3,y-8,'[===]');}s.txt(x-5,y,'[==@==]');}
function camp(s,x,y,seed,fire=true){s.polygon([[x-29,y+3],[x,y-33],[x+27,y+4]],(xx,yy)=>noise(xx,yy,seed)>.52?'#':'*','%');line(s,x,y-33,x,y+4,'@');line(s,x-27,y+4,x+29,y+4,'=');
 s.polygon([[x-3,y-24],[x-3,y+2],[x+16,y+2]],(xx,yy)=>noise(xx,yy,seed+1)>.4?':':'#','*');
 if(fire){s.ellipse(x-25,y+11,9,7,'@%#*+=-:',seed);s.txt(x-30,y+7,'/\\//\\');for(let i=0;i<9;i++)s.put(x-28+(i*3)%11,y-2-i%7,i%2?'*':'+');}s.txt(x+12,y-4,'[###]');}
function wagon(s,x,y,seed){s.polygon([[x-34,y-20],[x+29,y-20],[x+31,y+8],[x-33,y+8]],(xx,yy)=>noise(xx,yy,seed)>.48?'#':'%','#');s.polygon([[x-37,y-22],[x,y-43],[x+34,y-22]],(xx,yy)=>noise(xx,yy,seed+1)>.5?'%':'#','#');
 line(s,x-37,y-21,x+34,y-21,'=');for(const xx of [x-21,x+19]){s.ellipse(xx,y+10,8,7,'@%#*+=-:',seed+xx);s.txt(xx-4,y+8,'[####]');}for(const xx of [x-26,x-7,x+12])s.segment(xx,y-17,xx,y+5,'|');}
function bridge(s,seed){s.polygon([[0,45],[120,45],[120,56],[0,56]],(x,y)=>noise(x,y,seed)>.5?'=':'*','#');for(let x=0;x<120;x+=10){s.segment(x,32,x,53,'|');s.segment(x,32,x+10,32,'=');s.segment(x,43,x+10,43,'=');}for(let y=56;y<64;y+=3)s.segment(0,y,119,y,'~');}
function cage(s,x,y,seed){s.polygon([[x-25,y-33],[x+25,y-33],[x+25,y+7],[x-25,y+7]],(xx,yy)=>noise(xx,yy,seed)>.5?':':'.','#');for(let xx=x-22;xx<=x+22;xx+=6){line(s,xx,y-33,xx,y+7,'#');}s.txt(x-18,y-35,'/==================\\');s.ellipse(x,y-8,10,15,' .:-=+*#%@',seed+3);for(let i=0;i<3;i++)s.txt(x-7,y-15+i*6,'/##\\');}
function spring(s,x,y,seed){s.ellipse(x,y+5,36,12,' .:-=+*#%@',seed);for(let j=0;j<5;j++){s.ellipse(x,y-25+j*8,5+j*3,5+j*2,' .:-=+*#%@',seed+j);s.segment(x-5-j*2,y-22+j*8,x+5+j*2,y-22+j*8,'~');}s.txt(x-21,y+12,'~~===~~~~===~~');}
function mine(s,x,y,seed){s.arch(x-27,y-33,54,40,seed);for(let xx=x-20;xx<x+20;xx+=8)s.segment(xx,y-25,xx,y+5,'|');s.txt(x-10,y-13,'/%%%%%%%%\\');s.txt(x-15,y+4,'[==#====#==]');s.ellipse(x+29,y+5,12,9,'@%#*+=-:',2);}
function forge(s,x,y,seed){s.stone(x-28,y-32,56,35,seed,.59);s.ellipse(x+1,y-18,18,14,' .:-=+*#%@',seed+10);s.txt(x-23,y-34,'/==##==FORGE==##==\\');s.polygon([[x-25,y+10],[x+24,y+10],[x+18,y+17],[x-21,y+17]],'#','#');s.txt(x-13,y+8,'[===ANVIL===]');}
function potion(s,x,y,seed){s.polygon([[x-9,y-32],[x+8,y-32],[x+8,y-22],[x+16,y-14],[x+15,y+10],[x-17,y+10],[x-17,y-13],[x-9,y-22]],(xx,yy)=>noise(xx,yy,seed)>.42?'%':'#','#');s.ellipse(x,y,18,14,' .:-=+*#%@',5);s.txt(x-7,y-33,'[==##==]');s.txt(x-6,y-4,'[####]');}
function tree(s,x,y,seed){s.tree(x,y,1.5,seed%3===0?'dead':'pine');s.tree(x-24,y,1.1,'pine');s.tree(x+23,y,1.25,'swamp');}
function theme(id){return CONFIG[id]||'traveler';}
function make(event){const seed=hash(event.id),s=new Scene(HD_EVENT_WIDTH,HD_EVENT_HEIGHT,seed),t=theme(event.id),indoor=event.id.startsWith('tavern-');
 if(indoor){s.stone(0,0,120,50,seed,.34);for(const xx of [5,108]){s.window(xx,8,11,14);}for(let y=52;y<64;y+=4)s.segment(0,y,119,y,'_');s.segment(0,50,119,50,'=');for(const xx of [12,105])s.segment(xx,5,xx,51,'#');}
 else{s.sky(30,['portal','ambush','altar'].includes(t));s.ground(52,['bridge','boat','spring'].includes(t)?'water':['forge'].includes(t)?'lava':'soil');for(const x of [6,111])s.tree(x,49,.7,seed%4===0?'dead':'pine');}
 switch(t){
 case 'traveler':figure(s,58,42,seed,seed%3);figure(s,94,46,seed+3,1);if(seed%2)book(s,20,36,seed,'letter');break;
 case 'ambush':for(const [i,x] of [20,55,90].entries())figure(s,x,40,seed+i*9,i+2);s.segment(0,55,119,55,'=');break;
 case 'wagon':wagon(s,58,37,seed);figure(s,108,40,seed,2);break;
 case 'cage':cage(s,62,39,seed);figure(s,110,41,seed,2);break;
 case 'altar':monument(s,57,47,'altar',seed);for(let i=0;i<9;i++){let x=10+i*12;s.put(x,13+i%4,'*');}break;
 case 'ruin':monument(s,60,48,'ruin',seed);break;
 case 'tower':monument(s,63,45,'tower',seed);break;
 case 'portal':monument(s,60,48,'portal',seed);break;
 case 'door':monument(s,60,48,'door',seed);break;
 case 'chest':chest(s,57,38,seed);break;
 case 'camp':camp(s,62,39,seed);if(seed%2)figure(s,103,43,seed,1);break;
 case 'ledger':case 'letter':book(s,59,35,seed,t);s.ellipse(59,51,38,6,' .:-=+*#%@',seed);break;
 case 'bridge':bridge(s,seed);figure(s,65,30,seed,2);break;
 case 'spring':spring(s,60,41,seed);break;
 case 'tracks':for(let i=0;i<7;i++){const x=16+i*14,y=51-(i%3)*7;s.ellipse(x,y,5,3,'@%#*+',seed+i);s.put(x-4,y-3,'*');s.put(x+4,y-3,'*');}tree(s,70,46,seed);break;
 case 'armor':figure(s,60,42,seed,2);s.txt(42,15,'/###########\\');break;
 case 'mine':mine(s,56,42,seed);figure(s,100,42,seed+2,2);break;
 case 'forge':forge(s,60,40,seed);break;
 case 'potion':potion(s,58,38,seed);s.ellipse(60,52,28,5,'@%#*+=-',4);break;
 case 'forest':tree(s,60,49,seed);figure(s,100,40,seed,1);break;
 case 'boat':s.polygon([[17,42],[100,42],[90,57],[27,57]],(x,y)=>noise(x,y,seed)>.5?'#':'%','#');s.segment(60,16,60,50,'|');s.polygon([[61,17],[61,41],[84,40]],'%','/');for(let x=5;x<116;x+=7)s.txt(x,60,'~~');break;
 }
 // Event-specific material and lighting. No labels, colored icon stand-ins or copied scenes.
 const opts=['.','*',':','+','%','@'];for(let i=0;i<18;i++){const x=5+(hash(`${event.id}/x/${i}`)%109),y=8+(hash(`${event.id}/y/${i}`)%39);s.put(x,y,opts[(seed+i)%opts.length],false);}
 return s.out();}
export function highDensityEventArtwork(id){if(!byId.has(id))return null;if(cache.has(id))return cache.get(id);const a=make(byId.get(id));cache.set(id,a);if(cache.size>LIMIT)cache.delete(cache.keys().next().value);return a;}
export function hdEventTheme(id){return theme(id);}

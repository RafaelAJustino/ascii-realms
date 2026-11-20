/** Lote 6: ilustrações ASCII de eventos, sem modificar narrativa, escolhas ou saves. */
import {NARRATIVE_EVENTS} from './journey-events.js';
import {EPIC_EVENTS} from './epic-events.js';
import {TAVERN_EVENTS} from './tavern-stories.js';
export const EVENT_ART_DIMENSIONS=Object.freeze([84,34]);
const [W,H]=EVENT_ART_DIMENSIONS;
const all=[...NARRATIVE_EVENTS,...EPIC_EVENTS,...TAVERN_EVENTS];
function hash(s){let x=2166136261;for(const c of s)x=Math.imul(x^c.charCodeAt(0),16777619);return x>>>0;}
class Drawing{
 constructor(){this.p=Array.from({length:H},()=>Array(W).fill(' '));}
 dot(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<W&&y<H&&c&&c!==' ')this.p[y][x]=c[0];}
 line(x,y,X,Y,c){const n=Math.max(1,Math.abs(X-x),Math.abs(Y-y));for(let i=0;i<=n;i++)this.dot(x+(X-x)*i/n,y+(Y-y)*i/n,c);}
 text(x,y,str){[...str].forEach((c,i)=>{if(c!==' ')this.dot(x+i,y,c);});}
 ellipse(cx,cy,rx,ry,chars='@%%###***++==--::..'){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const q=((x-cx)/rx)**2+((y-cy)/ry)**2;if(q<=1)this.dot(x,y,chars[Math.min(chars.length-1,Math.floor(q*(chars.length-1)))]);}}
 box(x,y,w,h,stroke='#',fill=null){for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(!i||!j||i===w-1||j===h-1)this.dot(x+i,y+j,stroke);else if(fill)this.dot(x+i,y+j,fill[(i+j)%fill.length]);}}
 result(){return this.p.map(row=>row.join('')).join('\n');}
}
function atmosphere(d,h,indoor){for(let i=0;i<175;i++){let x=2+(hash(`${h}/${i}`)%(W-4)),y=2+(hash(`y${h}/${i}`)%24);if(!indoor&&y>17)continue;d.dot(x,y,['.','.',':','+','*'][hash(`star${i}${h}`)%5]);}
 if(indoor){d.line(2,5,82,5,'=');d.line(2,5,2,29,'|');d.line(81,5,81,29,'|');for(let x=8;x<80;x+=13){d.line(x,5,x+3,2,'/');d.line(x+3,2,x+10,5,'\\');}for(let y=10;y<28;y+=5)d.line(2,y,81,y,'.');}
 else{d.line(1,30,82,30,'_');for(let x=1;x<82;x++){let y=26+(hash(`${h}ground${x}`)%5);d.dot(x,y,'#');if(x%3===0)d.dot(x,y-1,':');}}}
function tree(d,x,y,s=1){let h=10*s;d.line(x,y,x,y-h,'#');for(let k=0;k<4;k++){const yy=y-h+1+k*2*s,rx=(5-k)*s;d.line(x-rx,yy,x,yy-3*s,'/');d.line(x,yy-3*s,x+rx,yy,'\\');d.line(x-rx,yy,x+rx,yy,'*');}d.text(x-2,y,'/###\\');}
function human(d,x,y,weapon=false){d.ellipse(x,y-13,3.5,4,'@%#*+=-.');d.text(x-2,y-14,'|..|');d.line(x-4,y-8,x+4,y-8,'#');d.box(x-4,y-7,9,9,'#','%*=');d.line(x-4,y-6,x-7,y,'/');d.line(x+4,y-6,x+7,y,'\\');d.line(x-2,y+2,x-4,y+8,'#');d.line(x+2,y+2,x+4,y+8,'#');d.text(x-6,y+8,'/##\\');if(weapon){d.line(x+8,y-2,x+8,y-18,'|');d.text(x+5,y-4,'==#==');d.dot(x+8,y-19,'^');}}
function wagon(d,x,y){d.box(x,y-11,30,12,'#','%#*+=-');d.line(x-5,y-11,x+15,y-23,'/');d.line(x+15,y-23,x+35,y-11,'\\');d.line(x-5,y-11,x+35,y-11,'=');for(let dx of [5,24]){d.ellipse(x+dx,y+2,4,4,'@%##*+-.');d.text(x+dx-1,y+1,'[]');}d.text(x+9,y-7,'[####]');}
function altar(d,x,y){d.box(x-10,y-4,21,8,'#','%%##*');d.box(x-7,y-12,15,9,'#','%#*+');d.text(x-5,y-10,'<*@@@*>');d.text(x-4,y-7,'::###::');d.line(x,y-13,x,y-20,'|');d.text(x-2,y-22,'\\*//');}
function chest(d,x,y){d.box(x-14,y-9,29,14,'#','@%#*+');d.line(x-14,y-10,x+14,y-10,'=');d.line(x-11,y-13,x+11,y-13,'=');d.line(x-11,y-13,x-14,y-10,'/');d.line(x+11,y-13,x+14,y-10,'\\');d.text(x-3,y-5,'[==@==]');d.line(x,y-3,x,y+4,'|');}
function ruin(d,x,y){for(const ox of [-18,-6,7,19]){d.box(x+ox,y-19,5,21,'#','%%');d.text(x+ox-2,y-20,'/####\\');}d.line(x-22,y-21,x+25,y-21,'=');d.line(x-19,y-24,x+22,y-24,'#');d.text(x-10,y-27,'/========\\');d.text(x-16,y+2,'##==##   ##==##');}
function passage(d,x,y){d.ellipse(x,y-8,20,18,'@%##**++==--::..');d.ellipse(x,y-4,11,13,' ..');d.text(x-5,y-13,'/%%%%%\\');d.line(x-9,y+1,x+9,y+1,'#');d.text(x-11,y+3,'/#############\\');}
function letter(d,x,y){d.box(x-15,y-15,31,24,'#','.:');for(let i=0;i<5;i++)d.text(x-11,y-10+i*3,('=--=====-++-====--').slice(i,i+16));d.text(x-4,y+3,'<@@@>');d.line(x-12,y+6,x+12,y+6,'=');}
function bridge(d,x,y){d.line(x-27,y,x+27,y,'#');d.line(x-27,y+2,x+27,y+2,'=');for(let i=-26;i<27;i+=7)d.line(x+i,y-6,x+i,y+2,'|');d.line(x-27,y-6,x+27,y-6,'-');for(let i=0;i<5;i++){d.line(x-33,y+5+i*2,x+33,y+5+i*2,['~','-','.','~','_'][i]);}}
function shrine(d,x,y){altar(d,x,y);d.line(x-17,y-11,x-25,y-20,'/');d.line(x+17,y-11,x+25,y-20,'\\');d.text(x-27,y-21,'*+:');d.text(x+24,y-21,':+*');}
function book(d,x,y){d.box(x-17,y-17,35,25,'#','-:.');d.line(x,y-16,x,y+7,'#');for(let i=0;i<5;i++){d.text(x-13,y-12+i*3,'-==--==-=');d.text(x+3,y-12+i*3,'==--==--=');}d.text(x-3,y-19,'/###\\');}
function cave(d,x,y){passage(d,x,y);for(let i=0;i<8;i++){const xx=x-27+i*8,yy=y-20+(hash(`stal${x}${i}`)%5);d.line(xx,yy,xx+2,yy+7,'\\');}}
function flame(d,x,y){d.ellipse(x,y-5,7,12,'@%##**++=--:..');d.line(x-4,y+4,x+6,y+8,'#');d.line(x-7,y+6,x+8,y+6,'=');d.text(x-5,y-10,'/\u0025##\\');d.text(x-2,y-15,'/\\');}
function portal(d,x,y){d.ellipse(x,y-9,19,18,'@%%###**++==--::.');d.ellipse(x,y-9,13,13,'  ..');d.line(x-17,y-10,x-17,y+4,'#');d.line(x+17,y-10,x+17,y+4,'#');d.text(x-8,y-8,'<<**%%**>>');d.text(x-10,y-3,'...::::...');}
function camp(d,x,y){d.line(x-20,y+6,x,y-15,'/');d.line(x,y-15,x+20,y+6,'\\');d.line(x-20,y+6,x+20,y+6,'#');d.line(x,y-15,x,y+6,'|');d.text(x-8,y-4,'/@%###%\\');flame(d,x+25,y+1);}
function tower(d,x,y){d.box(x-9,y-23,19,30,'#','%%#*+');d.text(x-12,y-25,'[##] [##] [##]');d.box(x-4,y-15,9,9,'@',' .');d.box(x-3,y-3,7,9,'#',' .');d.line(x+1,y-25,x+1,y-30,'|');d.text(x+2,y-30,'~~*');}
const themeDefs=[
 [/altar|santu|oferenda|relic|juramento|selo|exorcis|ritual|orac/i,'shrine'],
 [/ba[uú]|tesouro|cofre|ouro|moeda|escondid/i,'chest'],
 [/caravana|carro[cç]a|mercador|provis[oõ]es|odre|refugiad/i,'wagon'],
 [/torre|fuma[cç]a|vigia|sinal|sentinela/i,'tower'],
 [/carta|livro|registro|conta|nome|contrato|manuscrito|assinatura/i,'book'],
 [/ponte|barco|travessia|rio|po[cç]o|fonte|[aá]gua/i,'bridge'],
 [/acampamento|fogueira|neve|abrigo|ca[cç]ador/i,'camp'],
 [/ru[ií]na|pedra|coluna|inscri[cç][aã]o|vila|soldado|armadura/i,'ruin'],
 [/passagem|gruta|mina|caverna|ninho|esconderijo/i,'cave'],
 [/chama|brasas|cinzas|fogo|calor|metal/i,'flame'],
 [/portal|vazio|mem[oó]ria|voz|sussurro|mist[eé]rio/i,'portal'],
 [/bandid|saqueador|embosc|confront|desertor|guarda|roubad|mercen[aá]rio/i,'ambush'],
 [/carta|leitura|mapa|pista|lenda|documento/i,'letter']
];
const themeOverrides=Object.freeze({
 'road-toll':'ambush','bandit-hideout':'cave','witness-confrontation':'ambush','venom-tracks':'cave',
 'frozen-camp':'camp','ashen-offering':'flame','stolen-medicine':'ambush','ambushed-messenger':'ambush',
 'fallen-soldier':'ruin','tavern-ultima-chama':'flame','tavern-vila-esquecida':'ruin',
 'tavern-rastro-sem-pegadas':'cave','tavern-voz-na-mata':'wanderer','tavern-raiz-negra':'shrine',
 'tavern-molde-perdido':'book','tavern-carta-da-aurora':'letter','tavern-cartas-do-frio':'letter',
 'forgotten-letter':'letter','caravan-ledger':'book','tavern-mapa-rasgado':'letter',
 'tavern-nome-apagado':'book','tavern-contrato-ferro':'book',
 'tavern-selo-funerario':'shrine','tavern-juramento-velado':'shrine',
 'tavern-metal-das-brasas':'flame','tavern-barco-vazio':'bridge',
 'tavern-odre-perdido':'wagon','tavern-poco-selado':'bridge',
 'trapped-creature':'cave','masked-pilgrim':'wanderer'
});
export function eventTheme(event){if(themeOverrides[event.id])return themeOverrides[event.id];const s=`${event.title} ${event.description}`;return themeDefs.find(([re])=>re.test(s))?.[1]||'wanderer';}
function create(event){const d=new Drawing(),h=hash(event.id),indoor=event.id.startsWith('tavern-');atmosphere(d,h,indoor);
 if(!indoor){tree(d,12,30,1);if(h%3===0)tree(d,73,29,1);}
 const theme=eventTheme(event),x=41+(h%5)-2,y=22;
 switch(theme){case 'chest':chest(d,x,y);break;case 'wagon':wagon(d,x-12,y);break;case 'tower':tower(d,x,y);break;case 'shrine':shrine(d,x,y);break;case 'bridge':bridge(d,x,y);break;case 'camp':camp(d,x,y);break;case 'ruin':ruin(d,x,y);break;case 'cave':cave(d,x,y);break;case 'flame':flame(d,x,y);break;case 'portal':portal(d,x,y);break;case 'book':book(d,x,y);break;case 'letter':letter(d,x,y);break;case 'ambush':human(d,x-13,y,true);human(d,x+14,y,true);break;default:human(d,x-4,y,false);letter(d,x+20,y-4);}
 if(indoor){d.box(5,24,74,5,'#','%#*');d.text(9,25,'[==]');d.text(66,25,'[==]');}
 // Distinct environmental marks tied to the stable ID, not textual labels.
 for(let i=0;i<8;i++){const xx=10+(hash(`${event.id}:sig:${i}`)%63),yy=8+(hash(`y:${event.id}:sig:${i}`)%16);if(d.p[yy][xx]===' ')d.dot(xx,yy,['+','*',':','.'][i%4]);}
 return d.result();}
export const EVENT_ART=Object.freeze(Object.fromEntries(all.map(event=>[event.id,create(event)])));
export function densityEventArtwork(id){return EVENT_ART[id]||null;}
export function eventMotionClass(id){const theme=eventTheme(all.find(e=>e.id===id)||{title:'',description:''});return ['flame','portal','shrine'].includes(theme)?'event-flicker':theme==='ambush'?'event-tension':'event-idle';}

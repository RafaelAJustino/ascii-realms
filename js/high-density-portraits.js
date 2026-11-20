/** ASCII REALMS, Etapa 3: composição de personagens de alta densidade.
 * Quatro bases ORIGINAIS, sem armas pré-desenhadas; máscaras e pontos de ancoragem
 * tornam peças equipadas parte da anatomia em vez de recolorir uma área estática.
 * Nenhum desenho é armazenado no salvamento, apenas os itens já existentes.
 */
import {HIGH_DENSITY_HERO_ROWS} from './high-density-hero-arts.js';
import {escape} from './utils.js';

export const PORTRAIT_W=160, PORTRAIT_H=103;
export const HD_SLOTS=Object.freeze(['head','body','hands','feet','weapon','ring','amulet']);
export const HD_RARITIES=Object.freeze(['common','uncommon','rare','epic','legendary']);
const RAMP=' .:-=+*#%@';
const cache=new Map();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>{let n=2166136261;for(const ch of String(s))n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return n>>>0;};
const signature=it=>String(it?.catalogId||it?.visualId||it?.uid||it?.name||it?.kind||'generic');

function equipped(state){
 const items=Array.isArray(state?.items)?state.items:[],eq=state?.equip||{};
 return Object.fromEntries(HD_SLOTS.map(slot=>[slot,items.find(item=>item&&item.slot===slot&&item.uid===eq[slot])||null]));
}
function category(item){
 if(!item)return 0;
 const n=Number(item.armor);
 if(Number.isFinite(n)&&n>=1)return clamp(Math.floor(n),1,3);
 const label=String(item.name||item.kind||'');
 if(/placas|pesad|reforcad|ferro|basti[aã]o/i.test(label))return 3;
 if(/malha|m[eé]dia|escamas|cota/i.test(label))return 2;
 return 1;
}
export function weaponProfile(item){
 if(!item)return 'none';
 const kind=String(item.kind||item.name||'');
 if(/Besta/i.test(kind))return 'crossbow';
 if(/Arco/i.test(kind))return 'bow';
 if(/Grim[oó]rio|Livro|Tomo/i.test(kind))return 'grimoire';
 if(/Cajado|Cetro/i.test(kind))return 'staff';
 if(/Varinha/i.test(kind))return 'wand';
 if(/Machado/i.test(kind))return 'axe';
 if(/Martelo/i.test(kind))return 'hammer';
 if(/Adaga|Punhal|L[aâ]mina Curta/i.test(kind))return 'dagger';
 return 'sword';
}
function compose(state){
 const cls=state?.cls,base=HIGH_DENSITY_HERO_ROWS[cls];
 if(!base)throw new Error('Classe sem retrato ASCII: '+cls);
 const eq=equipped(state);
 const key=JSON.stringify([cls,...HD_SLOTS.map(slot=>{
  const item=eq[slot];return item?[item.uid,item.catalogId,item.visualId,item.kind,item.name,item.armor,item.rarity]:null;
 })]);
 if(cache.has(key))return cache.get(key);
 const canvas=base.map(row=>[...row]);
 const ink=Array.from({length:PORTRAIT_H},()=>Array(PORTRAIT_W).fill('base'));
 const slotColor=slot=>slot+'-'+HD_RARITIES[clamp(Math.floor(Number(eq[slot]?.rarity)||0),0,4)];
 const seedFor=slot=>hash(signature(eq[slot]));
 // Âncoras de articulações registradas para cada silhueta original.
 const anchors={
  guerreiro:{left:[49,75],right:[111,75],neck:[80,37],chest:[80,53],leftFoot:[64,93],rightFoot:[96,93]},
  mago:{left:[46,74],right:[119,73],neck:[80,39],chest:[80,55],leftFoot:[63,95],rightFoot:[97,95]},
  arqueiro:{left:[54,69],right:[109,68],neck:[80,38],chest:[80,54],leftFoot:[67,94],rightFoot:[94,94]},
  ladino:{left:[44,74],right:[113,75],neck:[80,40],chest:[80,54],leftFoot:[66,95],rightFoot:[94,95]}
 }[cls];
 function put(x,y,char,slot='base'){
  x=Math.round(x);y=Math.round(y);
  if(x<0||x>=PORTRAIT_W||y<0||y>=PORTRAIT_H||!char)return;
  canvas[y][x]=char;ink[y][x]=slot==='base'?'base':slotColor(slot);
 }
 function shade(x,y,slot,baseDensity=170,highlight=0){
  const id=seedFor(slot);
  const grain=((Math.imul(x+13,31)^Math.imul(y+7,137)^id)>>>0)%27-13;
  const lighting=12*(1-x/PORTRAIT_W)+5*Math.sin((x+y*.7)/7);
  const index=clamp(Math.round((baseDensity+highlight+grain+lighting)/255*9),1,9);
  return RAMP[index];
 }
 function polygon(points,slot,density=175,style='leather'){
  const minX=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0])))-1),maxX=Math.min(159,Math.ceil(Math.max(...points.map(p=>p[0])))+1);
  const minY=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))-1),maxY=Math.min(102,Math.ceil(Math.max(...points.map(p=>p[1])))+1);
  const id=seedFor(slot);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   let inside=false;
   for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [a,b]=points[i],[c,d]=points[j];
    if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;
   }
   if(!inside)continue;
   const highlight=(style==='metal'?14:style==='cloth'?-11:0)+((x+id)%13===0?18:0);
   put(x,y,shade(x,y,slot,density,highlight),slot);
  }
 }
 function ellipse(cx,cy,rx,ry,slot,density=170,style='leather'){
  for(let y=Math.max(0,Math.floor(cy-ry));y<=Math.min(102,Math.ceil(cy+ry));y++){
   for(let x=Math.max(0,Math.floor(cx-rx));x<=Math.min(159,Math.ceil(cx+rx));x++){
    const dx=(x-cx)/rx,dy=(y-cy)/ry,depth=1-dx*dx-dy*dy;
    if(depth<=0)continue;
    const light=22*(1-dx)+8*Math.sin(dy*9);
    put(x,y,shade(x,y,slot,density-12+depth*27,light+(style==='metal'?11:0)),slot);
   }
  }
 }
 function line(x0,y0,x1,y1,slot,brightness=205,width=1){
  const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
  for(let k=0;k<=steps;k++){
   const x=x0+(x1-x0)*k/steps,y=y0+(y1-y0)*k/steps;
   for(let j=0;j<width;j++)put(x+j,y,shade(Math.round(x),Math.round(y),slot,brightness),slot);
  }
 }
 function detail(x,y,text,slot){for(let i=0;i<text.length;i++)if(text[i]!==' ')put(x+i,y,text[i],slot);}
 function etching(slot,x0,y0,x1,y1,step=5){
  const id=seedFor(slot);const rarity=Number(eq[slot].rarity)||0;
  for(let k=0;k<5+rarity;k++){
   const x=x0+(id+k*step*7)%(Math.max(1,x1-x0));
   const y=y0+(id+k*step*3)%(Math.max(1,y1-y0));
   // Apenas sobre a própria peça, preservando a anatomia original.
   if(x>=0&&x<160&&y>=0&&y<103&&ink[y][x]===slotColor(slot))put(x,y,k%2?'*':'%',slot);
  }
 }
 // Sobreposição anatômica das armaduras, do centro para a borda.
 if(eq.body){
  const weight=category(eq.body),metal=weight>=2?'metal':'cloth';
  const shoulder=weight===3?20:weight===2?15:9;
  if(weight===1){
   polygon([[65,39],[95,39],[99,51],[94,68],[83,72],[65,68],[61,52]],'body',133,'cloth');
   for(let i=0;i<9;i++)line(65+i*3,42,69+i*2,64,'body',115);
   polygon([[64,40],[78,47],[74,68],[64,64]],'body',155,'leather');
  }else if(weight===2){
   polygon([[62,38],[98,38],[105,51],[96,68],[81,74],[64,69],[56,51]],'body',164,metal);
   ellipse(80,54,19,11,'body',185,'metal');
   for(let y of [48,56,64])line(67,y,94,y,'body',193,2);
   for(let y of [50,60,68])line(70,y,88,y+3,'body',112);
  }else{
   polygon([[59,37],[101,37],[110,49],[100,72],[84,75],[60,72],[51,49]],'body',193,'metal');
   ellipse(80,54,23,16,'body',211,'metal');
   polygon([[60,43],[78,39],[79,68],[66,62]],'body',218,'metal');
   polygon([[82,39],[101,43],[95,63],[82,68]],'body',157,'metal');
   line(80,40,80,70,'body',240,2);
   for(let y of [46,54,63,70])line(64,y,96,y,'body',162,2);
  }
  // Ombros pertencem à armadura equipada, não flutuam no fundo.
  ellipse(80-29,43,shoulder,weight===3?9:weight===2?7:5,'body',weight===3?206:154,metal);
  ellipse(80+29,43,shoulder,weight===3?9:weight===2?7:5,'body',weight===3?194:146,metal);
  if(weight>=2){for(let y of [43,47]){line(43,y,61,y,'body',221);line(99,y,117,y,'body',211);}}
  // Relevos e placas articuladas mantêm profundidade também nas armaduras pesadas.
  if(weight===3){
   for(const y of [44,52,60,67]){
    line(61,y,76,y-2,'body',238,2);
    line(84,y-2,100,y,'body',128,2);
   }
   for(const x of [67,73,87,93]){
    ellipse(x,47,2,2,'body',236,'metal');
    ellipse(x,64,2,2,'body',222,'metal');
   }
   polygon([[77,47],[81,45],[85,48],[83,58],[79,60],[76,55]],'body',130,'metal');
  }else if(weight===2){
   for(const y of [51,58,65]){
    line(66,y,94,y+1,'body',220);
   }
  }
  line(63,68,97,69,'body',weight===3?234:168,weight===3?3:2);
  if(cls==='mago'){detail(76,51,'<**>','body');line(79,54,80,63,'body',229);}
  if(cls==='ladino'){line(65,45,92,66,'body',238,2);detail(79,52,'/\\','body');}
  if(cls==='arqueiro')line(64,43,94,64,'body',123,3);
  if(cls==='guerreiro')detail(77,51,'[##]','body');
  if(Number(eq.body.rarity)>=3){detail(76,61,'<##>','body');}
  etching('body',62,42,99,70,11);
 }
 // Cabeça: capuz, máscara, malha, elmo fechado e variações de modelo.
 if(eq.head){
  const weight=category(eq.head),id=seedFor('head'),metal=weight>=2?'metal':'cloth';
  if(weight===1){
   polygon([[80,2],[90,7],[98,19],[96,35],[88,40],[71,40],[63,34],[64,20],[70,7]],'head',135,'cloth');
   ellipse(80,25,13,11,'head',51,'cloth');
   polygon([[70,11],[80,5],[90,11],[94,21],[84,16],[73,17]],'head',173,'cloth');
  }else if(weight===2){
   polygon([[70,8],[77,5],[87,6],[95,15],[96,31],[89,37],[71,37],[64,31],[64,16]],'head',174,'metal');
   ellipse(80,23,12,12,'head',136,'metal');
   for(let y of [16,22,28])line(68,y,92,y+1,'head',200);
   line(80,8,80,35,'head',209);
  }else{
   polygon([[72,3],[79,1],[88,4],[96,15],[97,30],[91,40],[69,40],[63,30],[64,15]],'head',194,'metal');
   polygon([[70,17],[90,17],[94,29],[88,35],[72,35],[66,29]],'head',222,'metal');
   line(80,4,80,36,'head',250,2);
   line(69,24,92,24,'head',233,2);
   line(73,29,87,29,'head',66,3); // viseira
   if(Number(eq.head.rarity)>=3){line(77,5,80,0,'head',245,2);line(80,0,83,5,'head',226,2);}
  }
  if(weight<=2){line(73,27,77,27,'head',230);line(84,27,88,27,'head',230);}
  if(id%2)line(71,13,87,15,'head',214);
  etching('head',67,10,93,34);
 }
 // Luvas substituem a geometria das mãos existentes, nunca braço desconectado.
 if(eq.hands){
  const weight=category(eq.hands),d=weight===3?211:weight===2?179:139;
  for(const [cx,cy] of [anchors.left,anchors.right]){
   ellipse(cx,cy-1,weight===3?10:weight===2?8:7,weight===3?9:7,'hands',d,weight>=2?'metal':'leather');
   line(cx-5,cy-2,cx+5,cy-2,'hands',224,2);
   for(let i=-2;i<=2;i++)line(cx+i*2,cy+1,cx+i*2,cy+5,'hands',d+20);
   if(weight===3)line(cx-8,cy-4,cx+8,cy-4,'hands',244,2);
  }
  etching('hands',44,66,116,78,12);
 }
 // Botas formam solado e greva completos, alterando os contornos do corpo.
 if(eq.feet){
  const weight=category(eq.feet),d=weight===3?210:weight===2?181:142;
  for(const [cx,cy] of [anchors.leftFoot,anchors.rightFoot]){
   polygon([[cx-7,cy-9],[cx+6,cy-9],[cx+9,cy+3],[cx+13,cy+5],[cx-12,cy+5],[cx-13,cy+2]],'feet',d,weight>=2?'metal':'leather');
   for(let y of [cy-6,cy-2])line(cx-7,y,cx+7,y,'feet',d+28,weight===3?2:1);
   line(cx-12,cy+5,cx+13,cy+5,'feet',240,2);
  }
  etching('feet',52,86,107,101);
 }
 // Anel e amuleto utilizam pontos de ancoragem, independentemente da arma.
 if(eq.amulet){
  const [cx,cy]=anchors.chest;
  line(cx,cy-10,cx,cy-1,'amulet',169);
  polygon([[cx,cy-5],[cx+4,cy],[cx,cy+5],[cx-4,cy]],'amulet',222,'metal');
  put(cx,cy,'%','amulet');
  if(Number(eq.amulet.rarity)>=3){line(cx-6,cy,cx-4,cy,'amulet',205);line(cx+4,cy,cx+6,cy,'amulet',205);}
 }
 // A arma só aparece se o slot estiver efetivamente equipado. A mão é seu ponto de fixação.
 const weapon=weaponProfile(eq.weapon);
 if(eq.weapon){
  const slot='weapon',[gripX,gripY]=anchors.right,ornament=hash(signature(eq.weapon))%3;
  const joint=(x=130,y=73)=>line(gripX,gripY,x,y,slot,167,3);
  if(weapon==='sword'){
   joint();polygon([[127,69],[124,18],[130,5],[135,18],[133,69]],slot,198,'metal');
   line(130,13,130,68,slot,246,2);
   line(118,72,142,72,slot,228,3);
   line(130,73,130,88,slot,125,4);ellipse(130,89,5,4,slot,217,'metal');
  }else if(weapon==='axe'){
   joint();line(131,24,131,97,slot,135,4);
   polygon([[128,22],[141,13],[151,18],[155,31],[146,41],[130,34]],slot,218,'metal');
   line(135,19,148,23,slot,250,2);
  }else if(weapon==='hammer'){
   joint();line(131,17,131,97,slot,138,4);
   polygon([[116,15],[147,15],[151,29],[146,33],[115,32]],slot,194,'metal');
   for(let y of [19,27])line(119,y,146,y,slot,241,2);
  }else if(weapon==='dagger'){
   line(gripX,gripY,132,66,slot,141,4);
   polygon([[128,66],[148,36],[145,57],[134,69]],slot,214,'metal');
   line(132,66,146,44,slot,251);
   line(125,61,138,71,slot,220,3);
   if(cls==='ladino'){
    const [lx,ly]=anchors.left;
    line(lx,ly,33,63,slot,132,4);
    polygon([[31,64],[10,34],[16,57],[28,67]],slot,219,'metal');
    line(28,63,13,41,slot,252);
    line(26,68,36,59,slot,210,3);
   }
  }else if(weapon==='bow'){
   joint(129,69);
   for(let y=9;y<=94;y++){
    const a=(y-9)/85,x=Math.round(123+16*Math.sin(Math.PI*a));
    for(let z=0;z<3;z++)put(x+z,y,shade(x,y,slot,181),slot);
   }
   line(125,11,125,93,slot,222);
   line(97,60,155,60,slot,228,2);
   polygon([[154,56],[158,60],[154,64]],slot,226,'metal');
  }else if(weapon==='crossbow'){
   joint(127,69);line(117,63,153,63,slot,195,4);
   polygon([[134,45],[148,50],[158,64],[149,78],[134,82],[142,63]],slot,176,'leather');
   line(136,48,157,64,slot,233);line(157,64,136,80,slot,232);
   line(135,63,159,63,slot,240);
  }else if(weapon==='staff'){
   joint(131,72);line(131,19,131,101,slot,145,5);
   polygon([[131,1],[141,12],[135,23],[125,23],[120,12]],slot,216,'metal');
   ellipse(131,13,7,9,slot,241,'metal');
   for(let y of [31,38,67,83])line(126,y,137,y+2,slot,210,2);
  }else if(weapon==='wand'){
   line(gripX,gripY,145,26,slot,188,4);
   ellipse(146,25,6,7,slot,226,'metal');
   line(145,25,145,17,slot,243);
  }else if(weapon==='grimoire'){
   joint(127,73);
   polygon([[118,54],[133,50],[145,55],[143,83],[132,79],[118,84]],slot,175,'leather');
   line(132,51,132,79,slot,241,2);
   for(let y of [60,66,72]){line(120,y,129,y-2,slot,220);line(135,y-2,143,y,slot,215);}
  }
  // ID do modelo altera sulcos, inscrições e pequenos rebites, além da anatomia por tipo.
  if(ornament===1){detail(129,72,'#','weapon');}else if(ornament===2){detail(128,69,'*%','weapon');}
 }
 // O anel é aplicado por último: permanece visível sobre o punho que segura a arma.
 if(eq.ring){const [cx,cy]=anchors.right;ellipse(cx,cy+1,4,3,'ring',218,'metal');put(cx,cy+1,'.','ring');}
 const rows=canvas.map(line=>line.join(''));
 const result={rows,ink,width:PORTRAIT_W,height:PORTRAIT_H,text:rows.join('\n'),equipped:eq,weaponType:weapon,anchors};
 if(cache.size>=128)cache.clear();cache.set(key,result);return result;
}
export function composeHighDensityHero(state,{compact=false}={}){
 const full=compose(state);if(!compact)return full;
 const rows=[],ink=[];
 for(let y=0;y<PORTRAIT_H;y+=2){
  let line='',colors=[];
  for(let x=0;x<PORTRAIT_W;x+=2){
   let chosen=' ',color='base',score=-1;
   for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
    if(y+dy>=PORTRAIT_H)continue;
    const c=full.rows[y+dy][x+dx],label=full.ink[y+dy][x+dx];
    const priority=label==='base'?0:2;
    const rank=RAMP.indexOf(c);
    const value=(c===' '?-100:priority*20+Math.max(0,rank));
    if(value>score){score=value;chosen=c;color=label;}
   }
   line+=chosen;colors.push(color);
  }
  rows.push(line);ink.push(colors);
 }
 return {rows,ink,width:80,height:52,text:rows.join('\n'),equipped:full.equipped,weaponType:full.weaponType,anchors:full.anchors};
}
export function renderHighDensityHero(state,compact=false){
 const art=composeHighDensityHero(state,{compact});
 const lines=art.rows.map((line,y)=>{
  let html='';for(let x=0;x<line.length;){
   const color=art.ink[y][x];let end=x+1;
   while(end<line.length&&art.ink[y][end]===color)end++;
   const segment=escape(line.slice(x,end));
   html+=color==='base'?segment:`<span class="avatar-ink avatar-${color}">${segment}</span>`;x=end;
  }return html;
 });
 const label={guerreiro:'Guerreiro',mago:'Mago',arqueiro:'Arqueiro',ladino:'Ladino'}[state?.cls]||'Herói';
 return `<pre class="ascii-art hero-portrait dynamic-hero density-hero high-density-character ${compact?'compact-density':'full-reference-density'}" data-ascii="true" data-class="${state.cls}" aria-label="${label} ASCII de alta densidade com equipamentos">${lines.join('\n')}</pre>`;
}

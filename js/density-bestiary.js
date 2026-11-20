// ASCII REALMS: bestiario de densidade. ASCII imprimivel, sem imagens externas.
// Cada criatura tem composicao deterministica a partir do seu identificador.
import {maps} from './data.js';
import {highDensityMonsterArt} from './high-density-monsters.js';
import {highDensityBossArt} from './high-density-bosses.js';
import {REGION_SPECIES} from './expanded-species.js';
import {canonicalDungeonBosses} from './ascii-validator.js';

const SHADE=' .:-=+*#%@';
const clip=(v,a,b)=>Math.max(a,Math.min(b,v));
const digest=s=>{let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
const seeded=(seed)=>{let x=seed||1;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};};
const classify=(name,boss=false)=>{
 const n=name.toLowerCase();
 if(/aranha|matriarca|escorpi[aã]o|vespa|mosquito|besouro|escaravelho|vermes/.test(n))return 'arachnid';
 if(/serpente|v[ií]bora|enguia|sanguessuga|hidra|crocodilo|lagarto|salamandra/.test(n))return 'serpent';
 if(/corvo|abutre|[aá]guia|harpia|coruja|morcego|grifo|le[aã]o alado/.test(n))return 'winged';
 if(/drag[aã]o|dem[oô]nio|quimera|predador abissal|de vorador/.test(n))return 'dragon';
 if(/lobo|raposa|chacal|hiena|c[aã]o|urso|javali|lince|cervo|alce|cabra|foca|fera|yeti|troll|le[aã]o/.test(n))return 'beast';
 if(/ent\b|raiz|carvalho|enraizado|[aá]rvore|junco/.test(n))return 'tree';
 if(/golem|colosso|tit[aã]|sentinela|est[aá]tua|aut[oô]mato|guardia[oã]|armadura|ferr[ií]fero|[ií]dolo|fornalha|n[uú]cleo/.test(n))return 'construct';
 if(/espectro|esp[ií]rito|sombra|banshee|vulto|eco\b|lamento|vento|fagulha|orbe|elemental|aus[eê]ncia|primordial|ara uto/.test(n))return 'spirit';
 if(/carni[cç]al|esqueleto|m[uú]mia|zumbi|mortos|sepulcral|cadav[eé]rica|ossu[aá]ria|ossu[aá]rio|t[uú]mulo|necromante/.test(n))return 'undead';
 if(/bruxa|cultista|arqueiro|bandido|capit[aã]o|saqueador|desertor|mercen[aá]rio|assaltante|contrabandista|alquimista|ca[cç]ador|paladino|profeta|cavaleiro|inquisidor|n[oô]made|rei\b|senhor|juiz|vigia|arconte|serafim|devorador|ara[uú]to|capataz|prof anador|ladr[aã]o|sentinela/.test(n))return 'humanoid';
 if(/bolha|lodo|aberra[cç][aã]o|[ií]dolo|corrompido/.test(n))return 'spirit';
 return boss?'dragon':'beast';
};
class Painter{
 constructor(w,h,seed){this.w=w;this.h=h;this.seed=seed;this.rand=seeded(seed);this.p=Array.from({length:h},()=>Array(w).fill(' '));}
 put(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<this.w&&y>=0&&y<this.h&&c&&c!==' ')this.p[y][x]=c;}
 ellipse(cx,cy,rx,ry,level=7,texture=1){
  const minX=Math.floor(cx-rx),maxX=Math.ceil(cx+rx),minY=Math.floor(cy-ry),maxY=Math.ceil(cy+ry);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   const dx=(x-cx)/rx,dy=(y-cy)/ry,d=dx*dx+dy*dy;
   if(d>1)continue;
   const light=.25*(-dx)-.35*dy+.2*(1-d);
   const grain=(this.rand()-.5)*texture*1.8;
   const z=clip(Math.round(level+light*3+grain),1,9);
   this.put(x,y,d>.94?(y>cy?'#':':'):SHADE[z]);
  }
 }
 line(x1,y1,x2,y2,brush='#',thick=1){
  const steps=Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1)))*2+1;
  for(let i=0;i<=steps;i++){const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
   for(let o=-Math.floor((thick-1)/2);o<=Math.floor(thick/2);o++)this.put(x+o,y,brush);
  }
 }
 polygon(points,fill='=',outline='#'){
  const minY=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),maxY=Math.min(this.h-1,Math.ceil(Math.max(...points.map(p=>p[1]))));
  for(let y=minY;y<=maxY;y++){
   const nodes=[];for(let j=0;j<points.length;j++){const [x1,y1]=points[j],[x2,y2]=points[(j+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))nodes.push(x1+(y-y1)*(x2-x1)/(y2-y1));}
   nodes.sort((a,b)=>a-b);for(let k=0;k<nodes.length-1;k+=2)for(let x=Math.ceil(nodes[k]);x<=Math.floor(nodes[k+1]);x++)this.put(x,y,fill);
  }
  points.forEach((p,i)=>{const q=points[(i+1)%points.length];this.line(...p,...q,outline);});
 }
 eyes(x,y,spacing=4,glow=false){this.put(x-spacing,y,'(');this.put(x-spacing+1,y,glow?'@':'o');this.put(x-spacing+2,y,')');this.put(x+spacing-2,y,'(');this.put(x+spacing-1,y,glow?'@':'o');this.put(x+spacing,y,')');}
 signature(x,y,seed){const accents=['/\\','<>','::','##','%%','++','**','@@','[]','{}'];const a=accents[(seed>>>0)%accents.length];for(let i=0;i<a.length;i++)this.put(x+i,y,a[i]);}
 finish(){return this.p.map(row=>row.join('')).join('\n');}
}
function humanoid(p,cx,cy,scale,seed,{undead=false,construct=false,boss=false}={}){
 const r=scale,s=p.rand;
 // boots, legs, cloth folds, shoulders, neck and face: all parts connected.
 p.polygon([[cx-9*r,cy+9*r],[cx+9*r,cy+9*r],[cx+12*r,cy+19*r],[cx-12*r,cy+19*r]],undead?':':'=');
 for(const side of [-1,1]){
  p.polygon([[cx+side*3*r,cy+16*r],[cx+side*9*r,cy+16*r],[cx+side*9*r,cy+26*r],[cx+side*3*r,cy+26*r]],construct?'#':':');
  p.ellipse(cx+side*7*r,cy+27*r,5*r,2*r,5);
  p.line(cx+side*10*r,cy-5*r,cx+side*14*r,cy+9*r,'#',2);
  p.ellipse(cx+side*14*r,cy+12*r,3*r,8*r,construct?8:6);
  p.ellipse(cx+side*11*r,cy-3*r,6*r,4*r,construct?8:7);
 }
 p.ellipse(cx,cy+5*r,11*r,15*r,construct?8:6,1.3);
 p.ellipse(cx,cy-14*r,7*r,8*r,undead?6:7);
 if(!undead){p.polygon([[cx-8*r,cy-18*r],[cx-5*r,cy-23*r],[cx+5*r,cy-23*r],[cx+8*r,cy-18*r],[cx+7*r,cy-13*r],[cx-7*r,cy-13*r]],construct?'#':':');}
 p.eyes(cx,cy-14*r,4*r,undead||boss);
 p.line(cx-3*r,cy-10*r,cx+3*r,cy-10*r,undead?'%':'-');
 for(let row=0;row<5;row++){const y=cy-row*4*r+11*r;p.line(cx-8*r,y,cx+8*r,y,construct?'#':row%2?'=':'+');}
 if(undead){for(let k=-2;k<=2;k++)p.line(cx+k*3*r,cy+2*r,cx+k*3*r,cy+13*r,'|');p.put(cx,cy-12*r,'X');}
 // Held armament, anchored on dominant hand, not floating.
 if(seed%3===0){p.line(cx+17*r,cy+12*r,cx+17*r,cy-24*r,'|',2);p.polygon([[cx+17*r,cy-29*r],[cx+21*r,cy-23*r],[cx+17*r,cy-18*r],[cx+13*r,cy-23*r]],'#');}
 else if(seed%3===1){p.line(cx+17*r,cy+12*r,cx+25*r,cy-21*r,'|',2);p.line(cx+22*r,cy-16*r,cx+29*r,cy-13*r,'/');p.line(cx+20*r,cy-9*r,cx+30*r,cy-6*r,'/');}
 else{p.line(cx+16*r,cy+13*r,cx+23*r,cy-18*r,'|',2);p.line(cx+18*r,cy-7*r,cx+28*r,cy-7*r,'#',2);}
}
function beast(p,cx,cy,r,seed){
 // Quadruped in three-quarter profile with visible muzzle, paws and tail.
 p.ellipse(cx-3*r,cy+2*r,18*r,10*r,7);
 p.ellipse(cx+14*r,cy-8*r,10*r,11*r,7);
 p.polygon([[cx+10*r,cy-17*r],[cx+11*r,cy-27*r],[cx+16*r,cy-19*r]],'*');
 p.polygon([[cx+18*r,cy-18*r],[cx+23*r,cy-26*r],[cx+24*r,cy-13*r]],'*');
 p.polygon([[cx+18*r,cy-6*r],[cx+34*r,cy-5*r],[cx+27*r,cy+4*r],[cx+18*r,cy+3*r]],'=');
 p.eyes(cx+16*r,cy-10*r,4*r);
 p.put(cx+32*r,cy-2*r,'@');
 p.line(cx-16*r,cy-2*r,cx-27*r,cy-16*r,seed%2?'~':'/',3);
 for(const leg of [-13,-4,7,15]){p.line(cx+leg*r,cy+8*r,cx+(leg+(leg%2?2:-2))*r,cy+22*r,'#',3);p.ellipse(cx+(leg+(leg%2?2:-2))*r,cy+23*r,4*r,2*r,5);}
 for(let i=0;i<12;i++){const x=cx-18*r+i*3*r;p.put(x,cy-9*r+(i%3)*r,seed%2?'^':'/');}
}
function arachnid(p,cx,cy,r,seed){
 const spider=seed%4!==0;
 p.ellipse(cx-6*r,cy+1*r,13*r,11*r,8);
 p.ellipse(cx+11*r,cy+1*r,9*r,7*r,7);
 p.eyes(cx+13*r,cy-2*r,4*r,true);
 for(let side of [-1,1])for(let k=0;k<4;k++){
  const y=cy-9*r+k*5*r,ex=cx+side*(21+k*2)*r,tip=cx+side*(29+(k%2)*3)*r;
  p.line(cx+side*9*r,cy+k*r-4*r,ex,y,'#',2);
  p.line(ex,y,tip,cy+(k+11)*r,'/',2);
 }
 if(spider){p.line(cx+11*r,cy+7*r,cx+6*r,cy+14*r,'/');p.line(cx+16*r,cy+7*r,cx+19*r,cy+14*r,'\\');}
 else{p.line(cx-18*r,cy-7*r,cx-24*r,cy-21*r,'#',2);p.line(cx-24*r,cy-21*r,cx-9*r,cy-28*r,'#',2);p.put(cx-8*r,cy-28*r,'@');}
 for(let i=0;i<7;i++)p.put(cx-15*r+i*4*r,cy+3*r,'*');
}
function serpent(p,cx,cy,r,seed){
 // Coiled trunk formed by successive overlapping segments and a raised neck.
 for(let i=0;i<22;i++){const t=i/21,x=cx-22*r+44*r*t,y=cy+11*r+Math.sin(t*Math.PI*3+seed%7)*7*r;p.ellipse(x,y,6*r,5*r,6+(i%2),.6);}
 for(let i=0;i<11;i++){const t=i/10;p.ellipse(cx+14*r+Math.sin(t*Math.PI/2)*4*r,cy+12*r-t*28*r,5*r,5*r,7,.7);}
 p.ellipse(cx+19*r,cy-18*r,12*r,6*r,8);
 p.polygon([[cx+26*r,cy-20*r],[cx+35*r,cy-14*r],[cx+27*r,cy-12*r]],'=');
 p.eyes(cx+20*r,cy-21*r,4*r,true);
 p.line(cx+31*r,cy-15*r,cx+39*r,cy-12*r,'-');p.line(cx+39*r,cy-12*r,cx+41*r,cy-16*r,'/');
 for(let i=0;i<11;i++)p.put(cx-19*r+i*4*r,cy+7*r+Math.sin((i/10)*Math.PI*3+seed%7)*7*r,'/');
}
function winged(p,cx,cy,r,seed,{dragon=false,boss=false}={}){
 p.polygon([[cx-4*r,cy-12*r],[cx-17*r,cy-24*r],[cx-35*r,cy-29*r],[cx-25*r,cy-7*r],[cx-15*r,cy+3*r],[cx-5*r,cy+7*r]],dragon?'#':'=', '#');
 p.polygon([[cx+4*r,cy-12*r],[cx+17*r,cy-24*r],[cx+35*r,cy-29*r],[cx+25*r,cy-7*r],[cx+15*r,cy+3*r],[cx+5*r,cy+7*r]],dragon?'#':'=', '#');
 for(const side of [-1,1]){for(let i=0;i<4;i++)p.line(cx+side*6*r,cy-9*r,cx+side*(16+i*4)*r,cy-(25-i*7)*r,dragon?'%':'/');}
 p.ellipse(cx,cy+5*r,10*r,13*r,7);
 p.ellipse(cx+4*r,cy-13*r,8*r,8*r,8);
 p.eyes(cx+5*r,cy-15*r,4*r,boss);
 if(dragon){p.polygon([[cx+7*r,cy-18*r],[cx+20*r,cy-18*r],[cx+26*r,cy-12*r],[cx+9*r,cy-10*r]],'#');p.line(cx-4*r,cy+12*r,cx-18*r,cy+23*r,'#',3);p.line(cx-18*r,cy+23*r,cx-25*r,cy+17*r,'/',2);}
 else p.polygon([[cx+11*r,cy-14*r],[cx+23*r,cy-10*r],[cx+11*r,cy-9*r]],'=' , '#');
 for(const side of [-1,1]){p.line(cx+side*5*r,cy+14*r,cx+side*7*r,cy+24*r,'|',2);p.line(cx+side*7*r,cy+24*r,cx+side*13*r,cy+25*r,'_');}
}
function tree(p,cx,cy,r,seed){
 p.polygon([[cx-10*r,cy+25*r],[cx-6*r,cy-1*r],[cx-17*r,cy-12*r],[cx-7*r,cy-8*r],[cx-3*r,cy-24*r],[cx+4*r,cy-9*r],[cx+16*r,cy-13*r],[cx+7*r,cy+3*r],[cx+11*r,cy+25*r]],'#');
 for(let k=0;k<5;k++){const x=cx+(k-2)*10*r,y=cy-(13+(k%2)*7)*r;p.ellipse(x,y,11*r,10*r,k%2?7:5);}
 p.eyes(cx,cy+2*r,5*r,true);
 p.line(cx-4*r,cy+12*r,cx+5*r,cy+12*r,'_');
 for(const d of [-1,1]){p.line(cx+d*6*r,cy+12*r,cx+d*19*r,cy+21*r,'#',2);p.line(cx+d*7*r,cy+23*r,cx+d*17*r,cy+28*r,'/',2);}
 for(let i=0;i<8;i++)p.line(cx-2*r+i*r,cy+7*r,cx-5*r+i*r,cy+22*r,seed%2?'|':':');
}
function spirit(p,cx,cy,r,seed,boss){
 for(let j=0;j<9;j++){
  const rr=(14-j)*r,x=cx+Math.sin(j+seed)*3*r,y=cy+(j-3)*4*r;
  p.ellipse(x,y,rr,Math.max(3*r,7*r-j*r*.25),Math.max(2,8-j%5),1.2);
 }
 p.ellipse(cx,cy-12*r,12*r,14*r,8);
 p.eyes(cx,cy-16*r,5*r,true);
 p.ellipse(cx,cy-7*r,3*r,4*r,2);
 for(let k=-3;k<=3;k++){
  p.line(cx+k*4*r,cy+20*r,cx+(k*5+(seed%3-1)*3)*r,cy+29*r,k%2?':':'*');
 }
 if(boss)for(let k=0;k<6;k++){const a=k*Math.PI/3;p.ellipse(cx+Math.cos(a)*20*r,cy+Math.sin(a)*19*r,3*r,3*r,9);}
}
const bossExtras=(p,cx,cy,r,seed,kind)=>{
 const rand=seeded(seed^0xb055);
 // Crown/horns and large floating heraldry, giving bosses more visual scale.
 for(let sign of [-1,1]){
  p.line(cx+sign*9*r,cy-22*r,cx+sign*22*r,cy-32*r,'#',2);
  p.line(cx+sign*22*r,cy-32*r,cx+sign*17*r,cy-39*r,'/',2);
  p.ellipse(cx+sign*36*r,cy-17*r,6*r,7*r,5);
  p.ellipse(cx+sign*42*r,cy-17*r,2*r,3*r,9);
 }
 for(let i=0;i<10;i++){const x=cx+(rand()-.5)*90*r,y=cy+(rand()-.5)*68*r;p.put(x,y,rand()>.5?'*':'+');}
 p.line(cx-16*r,cy+35*r,cx+16*r,cy+35*r,'=',2);
 p.signature(cx-2*r,cy+36*r,seed);
};
function produce(name,{boss=false,dungeon=false,region=0}={}){
 const seed=digest(name+':'+region+':density2'),kind=classify(name,boss);
 const w=boss?110:76,h=boss?70:52,p=new Painter(w,h,seed);
 const cx=w/2,cy=h*.52,r=boss?1.0:.78;
 // Fit silhouette inside every frame; each family uses distinct structural geometry.
 if(kind==='humanoid'||kind==='construct'||kind==='undead')humanoid(p,cx,cy,r,seed,{undead:kind==='undead',construct:kind==='construct',boss});
 else if(kind==='beast')beast(p,cx,cy,r,seed);
 else if(kind==='arachnid')arachnid(p,cx,cy,r,seed);
 else if(kind==='serpent')serpent(p,cx,cy,r,seed);
 else if(kind==='winged'||kind==='dragon')winged(p,cx,cy,r,seed,{dragon:kind==='dragon',boss});
 else if(kind==='tree')tree(p,cx,cy,r,seed);
 else spirit(p,cx,cy,r,seed,boss);
 if(boss)bossExtras(p,cx,cy,r,seed,kind);
 // Additional morphology derived from the creature identity, not solely from colour.
 const n=name.toLowerCase();
 if(/cervo|alce|cabra|javali|troll|yeti/.test(n))for(const side of [-1,1]){
   p.line(cx+side*10*r,cy-21*r,cx+side*18*r,cy-33*r,'#',2);
   p.line(cx+side*18*r,cy-33*r,cx+side*23*r,cy-37*r,'/',2);
 }
 if(/morcego|harpia|corvo|abutre|coruja|[aá]guia/.test(n))for(let k=0;k<5;k++){
   p.line(cx+(k-2)*11*r,cy-15*r,cx+(k-2)*12*r,cy-21*r,'/',2);
 }
 if(/aranha|escorpi[aã]o|vespa|besouro|mosquito/.test(n))for(let i=0;i<5;i++){
   p.put(cx-9*r+i*4*r,cy+2*r,'@');
 }
 if(/golem|aut[oô]mato|colosso|sentinela|est[aá]tua|guardia[oã]|armadura/.test(n)){
   p.line(cx-9*r,cy+15*r,cx+9*r,cy+15*r,'=',2);
   p.signature(cx-1*r,cy-1*r,seed^0xabba);
 }
 if(/bruxa|necromante|cultista|inquisidor|paladino|arconte|profeta|juiz/.test(n)){
   p.line(cx-12*r,cy-1*r,cx-5*r,cy+21*r,'/',2);
   p.line(cx+12*r,cy-1*r,cx+5*r,cy+21*r,'\\',2);
 }
 if(/lobo|c[aã]o|chacal|hiena|raposa/.test(n)){
   p.line(cx+23*r,cy+3*r,cx+29*r,cy+7*r,'=',2);
   p.put(cx+28*r,cy+6*r,'v');
 }
 if(/serpente|hidra|crocodilo|lagarto|salamandra/.test(n)){
   for(let i=0;i<7;i++)p.put(cx-15*r+i*5*r,cy+17*r,'^');
 }
 if(/esqueleto|m[uú]mia|mortos|carni[cç]al|cadav[eé]rica/.test(n)){
   p.put(cx-4*r,cy-13*r,'X');p.put(cx+4*r,cy-13*r,'X');
 }
 if(/drag[aã]o|dem[oô]nio|infernal|chamas|lava|brasa/.test(n)){
   for(let side of [-1,1])p.line(cx+side*8*r,cy-12*r,cx+side*13*r,cy-24*r,'^',2);
 }

 // Local materials and creature-specific ornamental marks on visible silhouette.
 for(let i=0;i<(boss?14:7);i++){
  const x=Math.floor(cx-12*r+p.rand()*24*r),y=Math.floor(cy-10*r+p.rand()*22*r);
  if(p.p[y]?.[x]&&p.p[y][x]!==' '&&p.p[y][x]!=='o')p.put(x,y,['@','%','#','*','+'][seed%5]);
 }
 p.signature(cx-1*r,cy+6*r,seed);
 return p.finish();
}
export const DENSITY_SPECIES_NAMES=Object.freeze(REGION_SPECIES.flatMap(row=>row.map(x=>x.name)));
export const DENSITY_REGIONAL_BOSSES=Object.freeze(maps.map(row=>row[2]));
export const DENSITY_DUNGEON_BOSSES=Object.freeze([...canonicalDungeonBosses]);
export const DENSITY_BESTIARY=Object.freeze(Object.fromEntries([
 ...DENSITY_SPECIES_NAMES.map((name,i)=>[name,produce(name,{region:Math.floor(i/15)})]),
 ...DENSITY_REGIONAL_BOSSES.map((name,i)=>[name,produce(name,{boss:true,region:i})]),
 ...DENSITY_DUNGEON_BOSSES.map((name,i)=>[name,produce(name,{boss:true,dungeon:true,region:i})])
]));
export function densityCreatureArtwork(name,compact=false,phase=1){return highDensityBossArt(name,compact,phase)||highDensityMonsterArt(name,compact)||DENSITY_BESTIARY[name]||null;}
export function densityCreatureFamily(name){return classify(name,DENSITY_REGIONAL_BOSSES.includes(name)||DENSITY_DUNGEON_BOSSES.includes(name));}

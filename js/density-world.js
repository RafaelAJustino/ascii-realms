// ASCII REALMS | Lote 3: paisagens em ASCII de densidade.
// Geometria e textura deterministicas. Nenhum pixel grafico, SVG ou recurso externo.
import {maps} from './data.js';
import {dungeonScenes} from './dungeon-artworks.js';

export const SCENE_WIDTH=112;
export const SCENE_HEIGHT=42;
const W=SCENE_WIDTH,H=SCENE_HEIGHT;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hash=(a,b,seed)=>{let t=Math.imul(a+37,374761393)^Math.imul(b+53,668265263)^Math.imul(seed+17,1274126177);t=Math.imul(t^(t>>>13),1274126177);return ((t^(t>>>16))>>>0)/4294967296;};
const blank=()=>Array.from({length:H},()=>Array(W).fill(' '));
function put(g,x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H&&c&&c!==' ')g[y][x]=c[0];}
function line(g,x1,y1,x2,y2,c){const length=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let i=0;i<=length;i++){const t=length?i/length:0;put(g,x1+(x2-x1)*t,y1+(y2-y1)*t,typeof c==='function'?c(t,i):c);}}
function rect(g,x,y,w,h,border='|',fill=' '){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(yy===y||yy===y+h-1)put(g,xx,yy,'-');else if(xx===x||xx===x+w-1)put(g,xx,yy,border);else if(fill!==' ')put(g,xx,yy,fill);}}
function roof(g,x,y,w,h,shade='#'){let cx=x+w/2;for(let k=0;k<h;k++){let span=Math.max(1,Math.round((k+1)*w/(2*h)));const yy=y+k;put(g,cx-span,yy,'/');put(g,cx+span,yy,'\\');for(let xx=Math.round(cx-span+1);xx<cx+span;xx++)if(hash(xx,yy,w)<.38)put(g,xx,yy,shade);}line(g,x,y+h,x+w,y+h,'_');}
function texture(g,x1,y1,x2,y2,seed,palette='.:+*#'){for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++){let r=hash(x,y,seed);if(r<.18){put(g,x,y,palette[Math.floor(hash(x+13,y+17,seed)*palette.length)]);}}}
function sky(g,region,night=false){for(let y=1;y<22;y++)for(let x=0;x<W;x++){const r=hash(x,y,region+10);if(r<(night?.028:.011))put(g,x,y,night?r<.008?'*':'.':'.');}if([1,5,8,9].includes(region)){const x=region===8?83:20,y=5;for(let k=-2;k<=2;k++)line(g,x-4+Math.abs(k),y+k,x+4-Math.abs(k),y+k,k===0?'=':'.');}}
function mound(g,baseline,amp,seed,palette='.:*#'){for(let x=0;x<W;x++){let crest=baseline-Math.round(amp*(.5+.5*Math.sin((x+seed*7)*.073)+.18*Math.sin(x*.21+seed)));for(let y=crest;y<H;y++){const r=hash(x,y,seed);if(y===crest)put(g,x,y,r<.55?'.':'_');else if(r<.2)put(g,x,y,palette[Math.floor(r*11)%palette.length]);}}}
function peak(g,cx,base,width,height,seed,ice=false){const left=cx-width/2,right=cx+width/2;for(let y=base-height;y<=base;y++){const step=(y-(base-height))/height,dx=width*step/2;put(g,cx-dx,y,'/');put(g,cx+dx,y,'\\');for(let x=cx-dx+1;x<cx+dx;x++){const r=hash(Math.round(x),y,seed);if(r<.57)put(g,x,y,ice?(r<.17?'@':'#'):(r<.14?'@':r<.29?'%':'#'));}if(ice&&step<.3)line(g,cx-dx+1,y,cx+dx-1,y,ridgeChar(step));}}
function ridgeChar(step){return step<.12?'@':'%';}
function tree(g,x,y,scale,seed,dry=false){const h=scale*2+5;line(g,x,y,x,y-h+3,dry?'|':'#');line(g,x+1,y,x+1,y-h+5,'|');for(let k=0;k<3;k++){const level=y-h+2+k*3;const width=(3-k)*scale;line(g,x,level-1,x-width,level+3,'/');line(g,x,level-1,x+width,level+3,'\\');line(g,x-width,level+3,x+width,level+3,dry?'.':k?'%':'#');if(!dry){for(let t=-width+1;t<width;t++){if(hash(t,level,seed)<.65)put(g,x+t,level+2,'#');}}} }
function palm(g,x,y,seed){line(g,x,y,x+2,y-11,'|');line(g,x+1,y,x+3,y-11,'/');for(const dx of [-14,-10,-6,5,10,14]){line(g,x+3,y-12,x+3+dx,y-8+(Math.abs(dx)%4),dx<0?'_':'-');}put(g,x+3,y-12,'@');}
function reeds(g,x,y,seed){for(let t=0;t<10;t++){const dx=t*2;line(g,x+dx,y,x+dx+(t%3)-1,y-4-t%5,'/');put(g,x+dx+(t%3)-1,y-4-t%5,t%2?'#':'%');}}
function stone(g,x,y,w,h,seed,kind='fort'){rect(g,x,y,w,h,'|');for(let yy=y+2;yy<y+h-1;yy+=3){line(g,x+1,yy,x+w-2,yy,'-');for(let xx=x+3+(yy%2)*3;xx<x+w-2;xx+=7)put(g,xx,yy-1,'|');}for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){const r=hash(xx,yy,seed);if(r<.085)put(g,xx,yy,kind==='ruin'?':':r<.02?'@':'#');}}
function tower(g,x,y,w,h,seed,kind='fort'){stone(g,x,y,w,h,seed);rect(g,x-2,y-3,w+4,4,'|');for(let xx=x-2;xx<x+w+2;xx+=5){rect(g,xx,y-5,3,3,'|','#');}rect(g,x+Math.round(w/2)-2,y+6,5,7,'|','#');put(g,x+Math.round(w/2),y+7,'o');}
function house(g,x,y,w,h,seed,type='timber'){roof(g,x-3,y-Math.round(h*.46),w+6,Math.round(h*.46),type==='ice'?'@':type==='wood'?'%':'#');rect(g,x,y,w,h,'|');for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){const r=hash(xx,yy,seed);if(r<.065)put(g,xx,yy,type==='timber'?':':type==='ice'?'*':'#');}rect(g,x+Math.round(w*.42),y+h-8,7,8,'|');for(let xx=x+4;xx<x+w-6;xx+=10){rect(g,xx,y+4,5,5,'|','#');put(g,xx+2,y+6,'o');}}
function dome(g,x,y,w,h,seed){rect(g,x,y,w,h,'|');for(let row=0;row<8;row++){let dx=Math.round(w*(row/8)/2);line(g,x+w/2-dx,y-row-1,x+w/2+dx,y-row-1,row===7?'_':'#');}for(let xx=x+4;xx<x+w-4;xx+=10)rect(g,xx,y+4,6,7,'|','#');rect(g,x+w/2-4,y+h-9,9,9,'|','%');}
function ground(g,region,seed){const water=[1,2].includes(region),lava=region===7,voidLand=region===9;for(let y=35;y<H;y++)for(let x=0;x<W;x++){const r=hash(x,y,seed);if(water){if(r<.26)put(g,x,y,'~');else if(r<.48)put(g,x,y,'_');}else if(lava){put(g,x,y,r<.19?'@':r<.42?'%':r<.63?'#':'.');}else if(voidLand){if(r<.22)put(g,x,y,':');else if(r<.4)put(g,x,y,'.');}else if(r<.47)put(g,x,y,r<.2?'.':r<.34?':':'_');}for(let x=0;x<W;x+=5){if(hash(x,seed,region)<.2)put(g,x,34,'_');}}
function wilderness(region){const g=blank(),seed=region*37+9;sky(g,region,region>=6);ground(g,region,seed+6);if(region===0){mound(g,28,8,seed);for(let x of [3,17,31,78,94,107])tree(g,x,36,3+(x%2),seed+x);line(g,43,41,59,32,'.');line(g,68,41,59,32,'.');}
if(region===1){mound(g,29,5,seed,'..:+');peak(g,82,34,38,15,seed);for(let x of [4,19,99])palm(g,x,37,seed+x);for(let x=43;x<80;x++)if(hash(x,34,seed)<.4)put(g,x,34,'~');}
if(region===2){mound(g,29,5,seed,'..:#');for(let x of [7,24,88,103])tree(g,x,34,2,seed+x,true);reeds(g,37,37,seed);reeds(g,70,37,seed);line(g,28,37,94,37,'~');line(g,22,39,100,39,'~');}
if(region===3){peak(g,27,35,55,28,seed);peak(g,81,34,69,33,seed+5);peak(g,109,38,40,17,seed+10);line(g,45,40,65,31,'/');line(g,65,31,80,40,'\\');}
if(region===4){mound(g,29,5,seed);for(let x of [14,46,79]){for(let dx of [0,8])rect(g,x+dx,18,4,20,'|');line(g,x-4,17,x+16,17,'_');}for(let x of [10,52,90])tree(g,x,36,2,seed+x,true);}
if(region===5){peak(g,26,34,54,28,seed,true);peak(g,77,34,70,30,seed+2,true);peak(g,105,35,28,15,seed+4,true);for(let x of [4,103])tree(g,x,37,3,seed+x);}
if(region===6){mound(g,28,6,seed);for(let x of [12,32,87,103])tree(g,x,34,2,seed+x,true);for(let x of [40,69]){line(g,x,34,x,21,'|');roof(g,x-4,16,8,5,'%');}for(let x=47;x<62;x+=4)put(g,x,32,'+');}
if(region===7){peak(g,22,38,48,27,seed);peak(g,75,37,74,34,seed+1);for(let x=40;x<73;x++)if(hash(x,33,seed)<.8)put(g,x,33,'@');for(let y=31;y<42;y++)for(let x=40;x<73;x++){if(hash(x,y,seed)<.46)put(g,x,y,'@');}line(g,45,38,76,30,'#');}
if(region===8){mound(g,34,3,seed,'..:*');for(let x of [19,54,88]){rect(g,x,23,4,14,'|');roof(g,x-5,15,13,8,'#');}for(let x=35;x<78;x+=3)if(hash(x,31,seed)<.42)put(g,x,31,'*');}
if(region===9){mound(g,35,9,seed,'..:#');for(let x of [17,46,83,102]){line(g,x,37,x,14-(x%7),'|');line(g,x-6,19-(x%7),x+6,19-(x%7),'=');}for(let y=14;y<32;y++)for(let x=30;x<85;x++){if(hash(x,y,seed)<.022)put(g,x,y,'@');} }
return g.map(row=>row.join('')).join('\n');}
function city(region){const g=blank(),seed=region*37+132;sky(g,region,region>=6);ground(g,region,seed+13);if(region===0){for(let x of [2,104])tree(g,x,36,3,seed+x);house(g,10,23,31,14,seed,'wood');house(g,69,22,31,15,seed+2,'wood');tower(g,46,18,19,20,seed,'fort');}
if(region===1){mound(g,26,5,seed);for(let x of [5,99])palm(g,x,38,seed+x);dome(g,16,20,34,17,seed);dome(g,64,17,35,20,seed+1);}
if(region===2){for(let y=32;y<42;y++)for(let x=0;x<W;x+=3)put(g,x,y,'~');for(let x of [8,45,78]){house(g,x,20,27,13,seed+x,'wood');for(let bx=x+4;bx<x+26;bx+=8)line(g,bx,32,bx,39,'|');}line(g,0,34,112,34,'=');}
if(region===3){peak(g,56,31,100,28,seed);tower(g,5,17,21,21,seed);tower(g,85,17,21,21,seed+1);stone(g,25,24,63,15,seed);tower(g,44,12,24,26,seed+2);}
if(region===4){for(let x of [7,79]){stone(g,x,20,28,18,seed+x,'ruin');for(let j=0;j<4;j++)put(g,x+Math.round(hash(j,x,seed)*25),18,'#');}dome(g,38,20,38,18,seed);for(let x of [14,88])line(g,x,21,x,14,'|');}
if(region===5){peak(g,55,27,95,23,seed,true);house(g,8,22,31,16,seed,'ice');house(g,73,22,31,16,seed+5,'ice');tower(g,43,18,23,21,seed,'ice');}
if(region===6){for(let x of [4,89])tree(g,x,37,2,seed+x,true);tower(g,15,20,24,19,seed);tower(g,73,19,24,20,seed+7);roof(g,36,7,39,17,'%');stone(g,38,22,36,17,seed,'ruin');}
if(region===7){peak(g,57,28,111,25,seed);tower(g,7,18,23,21,seed);tower(g,83,18,23,21,seed+1);stone(g,29,25,55,14,seed);roof(g,37,8,41,18,'@');for(let x=0;x<W;x+=9)if(hash(x,33,seed)<.6)put(g,x,34,'@');}
if(region===8){for(let x of [5,86])dome(g,x+1,23,22,15,seed+x);dome(g,35,15,43,24,seed);for(let x=26;x<93;x+=15){line(g,x,38,x,27,'|');put(g,x,25,'*');} }
if(region===9){mound(g,37,6,seed);tower(g,7,17,22,23,seed);tower(g,83,17,22,23,seed+1);stone(g,29,26,54,14,seed);roof(g,38,8,37,19,'#');for(let x=36;x<80;x+=4)put(g,x,31,hash(x,8,seed)<.5?'@':'%');}
 return g.map(row=>row.join('')).join('\n');}
function dungeon(region){const g=blank(),seed=region*51+293;const element=['roots','sand','swamp','forge','tomb','ice','crypt','fire','temple','void'][region];
// Perspective corridor, dark side walls, far door and ancient masonry.
for(let y=2;y<40;y++){const margin=Math.round((39-y)*.63)+1;for(let x=0;x<W;x++){if(x<margin||x>=W-margin){const r=hash(x,y,seed);if(r<.31)put(g,x,y,r<.065?'@':r<.14?'%':'#');}else if(y>29&&hash(x,y,seed)<.14)put(g,x,y,'.');}}
line(g,2,39,38,9,'/');line(g,W-3,39,73,9,'\\');line(g,38,9,73,9,'=');line(g,2,39,W-3,39,'_');
for(let x=9;x<W-8;x+=13){line(g,x,3,x+2,10,':');line(g,x,31,x-1,39,'/');}
for(let y=12;y<37;y+=5){const left=Math.round(3+(37-y)*.62);line(g,left,y,38,y,'.');line(g,73,y,W-left-1,y,'.');}
rect(g,43,16,27,20,'|');roof(g,40,11,32,7,region===7?'@':'#');rect(g,50,25,14,11,'|',region===9?'@':'#');for(let i=0;i<5;i++){line(g,51+i*2,26,51+i*2,34,'|');}
if(element==='roots'){for(let x of [6,17,87,103])tree(g,x,39,2,seed+x,true);for(let x=15;x<100;x+=14)line(g,x,8,x+4,27,'/');}
if(element==='sand'){for(let x of [10,25,86,101]){line(g,x,38,x,15,'|');line(g,x-3,15,x+3,15,'=');}texture(g,30,32,82,40,seed,'..::');}
if(element==='swamp'){for(let x=7;x<107;x+=11)line(g,x,3,x+6,26,'/');for(let y of [33,37,40])line(g,16,y,97,y,'~');reeds(g,15,39,seed);}
if(element==='forge'){for(let x of [17,95]){rect(g,x-5,14,11,19,'|');put(g,x,20,'@');put(g,x,21,'@');}for(let x=35;x<83;x+=4)put(g,x,39,'#');}
if(element==='tomb'){for(let x of [11,27,85,101]){rect(g,x-3,21,7,17,'|');roof(g,x-5,16,11,6,'%');}for(let x=38;x<75;x+=3)put(g,x,38,'.');}
if(element==='ice'){for(let x of [8,25,91,104]){line(g,x,3,x+4,24,'/');line(g,x+5,4,x+4,24,'\\');}texture(g,30,28,80,40,seed,'*%#');}
if(element==='crypt'){for(let x of [10,24,88,104]){rect(g,x,14,6,24,'|');roof(g,x-5,9,15,6,'#');}for(let y=3;y<20;y+=4)line(g,37,y,73,y,':');}
if(element==='fire'){for(let x of [16,34,82,99]){line(g,x,35,x+3,11,'/');put(g,x+3,11,'@');}for(let x=24;x<94;x+=3)if(hash(x,40,seed)<.8)put(g,x,40,'@');}
if(element==='temple'){for(let x of [17,30,82,96]){rect(g,x,15,6,23,'|');roof(g,x-5,9,15,7,'%');}for(let x=30;x<80;x+=6)put(g,x,5,'*');}
if(element==='void'){for(let x of [9,30,83,105]){line(g,x,38,x+4,9,'/');line(g,x+4,9,x+8,38,'\\');}for(let y=5;y<30;y++)for(let x=36;x<76;x++){if(hash(x,y,seed)<.025)put(g,x,y,'@');}}
return g.map(row=>row.join('')).join('\n');}
export const DENSITY_CITIES=Object.freeze(Object.fromEntries(maps.map((m,i)=>[m[1],city(i)])));
export const DENSITY_BIOMES=Object.freeze(Object.fromEntries(maps.map((m,i)=>[m[0],wilderness(i)])));
export const DENSITY_DUNGEONS=Object.freeze(Object.fromEntries(Object.keys(dungeonScenes).map((name,i)=>[name,dungeon(i)])));
export const densityCityArtwork=name=>DENSITY_CITIES[name]??null;
export const densityBiomeArtwork=name=>DENSITY_BIOMES[name]??null;
export const densityDungeonArtwork=name=>DENSITY_DUNGEONS[name]??null;

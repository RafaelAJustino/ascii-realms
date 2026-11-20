/**
 * ASCII REALMS, Etapa 5: atlas exclusivo de chefes em ASCII de alta densidade.
 * Carrega as artes somente quando solicitadas e mantém cache pequeno.
 * Fases dos chefes regionais são apenas visuais, sem efeitos sobre combate.
 */
import {HD_BOSS_PACKED,HD_BOSS_WIDTH,HD_BOSS_HEIGHT} from './high-density-boss-data.js';
export {HD_BOSS_WIDTH,HD_BOSS_HEIGHT};

const REGION_BOSSES=Object.freeze([
 'Guardião das Raízes','Escorpião Imperial','Hidra Venenosa','Golem Ancestral',
 'Rei Esquecido','Dragão Glacial','Senhor dos Mortos','Demônio das Chamas',
 'Serafim Corrompido','Entidade Primordial'
]);
const DUNGEON_BOSSES=Object.freeze([
 'Coração Enraizado','Matriarca de Areia','Devorador Tóxico','Colosso Ferrífero',
 'Sentinela do Túmulo','Titã de Geada','Arauto das Cinzas Mortas','Fornalha Viva',
 'Juiz da Aurora','Núcleo do Nada'
]);
const ALL=new Set([...REGION_BOSSES,...DUNGEON_BOSSES]);
const regional=new Set(REGION_BOSSES);
const cache=new Map();
const compactCache=new Map();
const RAMPS=' .:-=+*#%@';
const CACHE_LIMIT=12;
const COMPACT_WIDTH=76,COMPACT_HEIGHT=52;
export const HD_REGIONAL_BOSSES=REGION_BOSSES;
export const HD_DUNGEON_BOSSES=DUNGEON_BOSSES;
export const HD_BOSS_NAMES=Object.freeze([...REGION_BOSSES,...DUNGEON_BOSSES]);

function remember(map,key,value){
 if(map.has(key))map.delete(key);
 map.set(key,value);
 if(map.size>CACHE_LIMIT)map.delete(map.keys().next().value);
 return value;
}
function decode(key){
 const raw=HD_BOSS_PACKED[key];
 if(typeof raw!=='string')return null;
 const rows=raw.split('\n').map(line=>{
  const indent=parseInt(line.slice(0,2),36);
  if(!Number.isInteger(indent)||indent<0||indent>HD_BOSS_WIDTH)throw new Error('Boss HD: indentação inválida '+key);
  return ' '.repeat(indent)+line.slice(2).padEnd(HD_BOSS_WIDTH-indent,' ');
 });
 if(rows.length!==HD_BOSS_HEIGHT||rows.some(row=>row.length!==HD_BOSS_WIDTH))throw new Error('Boss HD: dimensões inválidas '+key);
 return rows.join('\n');
}
function compactArt(full){
 const src=full.split('\n');
 const result=[];
 for(let y=0;y<COMPACT_HEIGHT;y++){
  let row='';
  const fy=(y+.5)*HD_BOSS_HEIGHT/COMPACT_HEIGHT-.5;
  for(let x=0;x<COMPACT_WIDTH;x++){
   const fx=(x+.5)*HD_BOSS_WIDTH/COMPACT_WIDTH-.5;
   let total=0,highest=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const yy=Math.max(0,Math.min(HD_BOSS_HEIGHT-1,Math.round(fy+dy*.45)));
    const xx=Math.max(0,Math.min(HD_BOSS_WIDTH-1,Math.round(fx+dx*.45)));
    const n=Math.max(0,RAMPS.indexOf(src[yy][xx]));
    total+=n;highest=Math.max(highest,n);
   }
   row+=RAMPS[Math.min(9,Math.max(0,Math.round(total/9*.81+highest*.19)))];
  }
  result.push(row);
 }
 return result.join('\n');
}
export function highDensityBossArt(name,compact=false,phase=1){
 if(typeof name!=='string'||!ALL.has(name))return null;
 const selected=regional.has(name)?Math.max(1,Math.min(3,Number.isInteger(phase)?phase:1)):1;
 const key=name+'@'+selected;
 const dest=compact?compactCache:cache;
 if(dest.has(key)){const value=dest.get(key);remember(dest,key,value);return value;}
 if(compact){
  const full=highDensityBossArt(name,false,selected);
  return remember(compactCache,key,compactArt(full));
 }
 return remember(cache,key,decode(key));
}
export function highDensityBossCacheSize(){return {full:cache.size,compact:compactCache.size};}

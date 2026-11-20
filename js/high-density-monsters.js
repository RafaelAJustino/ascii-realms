/** ASCII REALMS: reconstrução sob demanda, cache LRU e enquadramento compacto. */
import {HD_MONSTER_WIDTH,HD_MONSTER_HEIGHT,HD_MONSTER_PACKED} from './high-density-monster-data.js';
export {HD_MONSTER_WIDTH,HD_MONSTER_HEIGHT};
const PACKED=HD_MONSTER_PACKED;
const cache=new Map();
const compactCache=new Map();
const RAMP=' .:-=+*#%@';
function compactArt(full){
  const src=full.split('\n');
  const w=76,h=52,out=[];
  for(let y=0;y<h;y++){
    let row='';
    const sy=(y+.5)*HD_MONSTER_HEIGHT/h;
    for(let x=0;x<w;x++){
      const sx=(x+.5)*HD_MONSTER_WIDTH/w;
      let sum=0,mx=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const yy=Math.max(0,Math.min(HD_MONSTER_HEIGHT-1,Math.round(sy+dy*.42)));
        const xx=Math.max(0,Math.min(HD_MONSTER_WIDTH-1,Math.round(sx+dx*.42)));
        const n=Math.max(0,RAMP.indexOf(src[yy][xx]));
        sum+=n;mx=Math.max(mx,n);
      }
      row+=RAMP[Math.min(9,Math.round(sum/9*.79+mx*.21))];
    }out.push(row);
  }return out.join('\n');
}

export const HD_MONSTER_NAMES=Object.freeze(Object.keys(PACKED));
export function highDensityMonsterArt(name,compact=false){
  if(compact&&compactCache.has(name))return compactCache.get(name);
  if(!Object.hasOwn(PACKED,name))return null;
  if(cache.has(name)) {const art=cache.get(name);if(!compact)return art;const small=compactArt(art);if(compactCache.size>=14)compactCache.delete(compactCache.keys().next().value);compactCache.set(name,small);return small;}
  const rows=PACKED[name].split('\n').map(row=>{
    const indent=parseInt(row.slice(0,2),36);
    return ' '.repeat(indent)+row.slice(2).padEnd(HD_MONSTER_WIDTH-indent,' ');
  });
  if(rows.length!==HD_MONSTER_HEIGHT||rows.some(row=>row.length!==HD_MONSTER_WIDTH))throw new Error('Arte HD incorreta: '+name);
  const art=rows.join('\n');
  if(cache.size>=14)cache.delete(cache.keys().next().value);
  cache.set(name,art);
  if(compact){const small=compactArt(art);if(compactCache.size>=14)compactCache.delete(compactCache.keys().next().value);compactCache.set(name,small);return small;}
  return art;
}
export function hdMonsterCacheSize(){return cache.size;}

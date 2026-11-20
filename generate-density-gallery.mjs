import {writeFileSync} from 'node:fs';
import {renderHeroAvatar} from './js/hero-avatar.js';
import {classes} from './js/data.js';
const weapon={guerreiro:'Espada',mago:'Cajado',arqueiro:'Arco',ladino:'Adaga'};
const states=[];
for(const cls of Object.keys(classes)){
 const initial={cls,items:[],equip:{}};
 states.push({name:`${classes[cls].name} | sem equipamentos`,state:initial});
 for(const grade of [1,2,3]){
  const it={uid:'armor'+grade,slot:'body',armor:grade,rarity:grade,kind:'Armadura'};
  states.push({name:`${classes[cls].name} | armadura ${['','leve','média','pesada'][grade]}`,state:{cls,items:[it],equip:{body:it.uid}}});
 }
 const slots=['head','body','hands','feet','weapon','ring','amulet'];
 const items=slots.map((slot,i)=>({uid:`${cls}-${slot}`,slot,kind:slot==='weapon'?weapon[cls]:'Armadura',armor:3,rarity:i%5}));
 states.push({name:`${classes[cls].name} | equipamento completo, raridades distintas`,state:{cls,items,equip:Object.fromEntries(items.map(it=>[it.slot,it.uid]))}});
}
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS | Galeria de avatares por densidade</title><link rel="stylesheet" href="../css/dynamic-combat-art.css"><link rel="stylesheet" href="../css/density-art.css"><style>body{margin:0;padding:22px;background:#0c1015;color:#d4e5df;font:14px/1.45 Arial,sans-serif}h1,p{max-width:850px;margin:12px auto}main{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:16px}section{padding:12px;min-width:0;background:#151d25;border:1px solid #344449;border-radius:8px}h2{font-size:13px;margin:0 0 10px}.ascii-container{display:flex;align-items:center;justify-content:center;max-width:100%;overflow:hidden}.density-hero{margin:0 auto;display:block;flex:none;font-size:8px;line-height:1.02;max-width:none;overflow:visible;color:#a5e5b5}.dynamic-hero [class*="-common"]{color:#b7bfc7}.dynamic-hero [class*="-uncommon"]{color:#75cf83}.dynamic-hero [class*="-rare"]{color:#77b7f9}.dynamic-hero [class*="-epic"]{color:#c59bfb}.dynamic-hero [class*="-legendary"]{color:#f5cb64}@media(max-width:450px){body{padding:10px}.density-hero{font-size:6px}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style></head><body><h1>ASCII REALMS: galeria de heróis</h1><p>Arte construída exclusivamente com caracteres ASCII de densidade. Compare as quatro classes, os três pesos de armadura e as cores individuais de equipamento.</p><main>${states.map(({name,state})=>`<section><h2>${name}</h2><div class="ascii-container">${renderHeroAvatar(state)}</div></section>`).join('')}</main></body></html>`;
writeFileSync('docs/galeria-ascii-densidade.html',html);
console.log(`${states.length} comparações na galeria HTML`);

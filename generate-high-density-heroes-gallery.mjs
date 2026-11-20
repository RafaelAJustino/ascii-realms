import {writeFileSync} from 'node:fs';
import {renderHighDensityHero} from './js/high-density-portraits.js';
const clsNames={guerreiro:'Guerreiro',mago:'Mago',arqueiro:'Arqueiro',ladino:'Ladino'};
const types={guerreiro:['Espada','Machado','Martelo'],mago:['Cajado','Varinha','Grimório'],arqueiro:['Arco','Besta'],ladino:['Adaga','Lâmina Curta']};
const cases=[];
for(const cls of Object.keys(clsNames)){
 cases.push({cls,title:'Traje original',items:[]});
 for(let weight=1;weight<=3;weight++){
  const items=[['head',weight,weight===3?2:1,'Capacete'],['body',weight,weight,'Armadura'],['hands',weight,3,'Luvas'],['feet',weight,4,'Botas'],['weapon',0,4,types[cls][0]],['ring',0,2,'Anel'],['amulet',0,3,'Amuleto']].map(([slot,armor,rarity,kind],i)=>({uid:`${cls}-${weight}-${slot}`,catalogId:`ep6-r${weight}-${slot}-${i}`,slot,armor,rarity,kind}));
  cases.push({cls,title:`Armadura ${['','leve','média','pesada'][weight]} + conjunto completo`,items});
 }
 for(const kind of types[cls].slice(1)){
  cases.push({cls,title:`Arma: ${kind}`,items:[{uid:`${cls}-${kind}`,slot:'weapon',kind,rarity:4,catalogId:`ep6-alt-${kind}`}]});
 }
}
const css=`:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;padding:20px;background:#0e141b;color:#dce4e6;font:15px system-ui}h1{font-size:24px}p{line-height:1.5;color:#aab5c0}nav{position:sticky;top:0;background:#0e141b;z-index:2;padding:10px 0}a{color:#b7d8f8;margin-right:12px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,550px),1fr));gap:16px}.card{border:1px solid #344558;border-radius:10px;padding:14px;overflow:hidden;min-width:0}.art{width:100%;overflow:auto}.art pre{width:max-content;max-width:none!important;white-space:pre!important;font:5.5px/1 'DejaVu Sans Mono',Consolas,monospace!important;letter-spacing:0!important;font-variant-ligatures:none;text-align:left!important;margin:0!important}.avatar-ink[class*="-common"]{color:#b7bfc7}.avatar-ink[class*="-uncommon"]{color:#75cf83}.avatar-ink[class*="-rare"]{color:#77b7f9}.avatar-ink[class*="-epic"]{color:#c59bfb}.avatar-ink[class*="-legendary"]{color:#f5cb64}h2{font-size:16px}small{color:#aab5c0} @media(max-width:600px){.card{padding:8px}.art pre{font-size:3px!important}}`;
const cards=cases.map(({cls,title,items})=>{const state={cls,items,equip:Object.fromEntries(items.map(it=>[it.slot,it.uid]))};return `<article class="card" id="${cls}"><h2>${clsNames[cls]}: ${title}</h2><small>160 × 103, 7 slots reais e raridade por peça</small><div class="art">${renderHighDensityHero(state)}</div></article>`;}).join('\n');
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS: Composição dinâmica HD</title><style>${css}</style></head><body><h1>Heróis ASCII 160 × 103: Etapa 3</h1><p>Quatro bases desenhadas no mesmo estilo. Armas e equipamentos são acrescentados ao compor o avatar. Cores pertencem a cada item; o traje base não inclui armas fixas.</p><nav>${Object.keys(clsNames).map(cls=>`<a href="#${cls}">${clsNames[cls]}</a>`).join('')}</nav><main>${cards}</main></body></html>`;
writeFileSync('docs/galeria-quatro-herois-alta-densidade.html',html);
console.log(`${cases.length} comparações produzidas`);

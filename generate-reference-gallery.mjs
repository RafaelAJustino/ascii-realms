import {writeFileSync} from 'node:fs';
import {renderReferenceRogue} from './js/high-density-rogue.js';
const setups=[
 {name:'Referência original, sem alterações',items:[]},
 {name:'Ladino com peitoral leve',items:[{uid:'i-body',slot:'body',armor:1,rarity:1,kind:'Armadura leve'}]},
 {name:'Ladino com peitoral médio',items:[{uid:'i-body',slot:'body',armor:2,rarity:2,kind:'Armadura média'}]},
 {name:'Ladino com armadura pesada',items:[{uid:'i-body',slot:'body',armor:3,rarity:3,kind:'Armadura pesada'}]},
 {name:'Ladino com elmo e armadura pesados',items:[{uid:'i-body',slot:'body',armor:3,rarity:3,kind:'Armadura pesada'},{uid:'i-head',slot:'head',armor:3,rarity:2,kind:'Capacete'}]},
 {name:'Ladino com armadura e adaga lendárias',items:[{uid:'i-body',slot:'body',armor:3,rarity:4,kind:'Armadura pesada'},{uid:'i-weapon',slot:'weapon',armor:0,rarity:4,kind:'Adaga'}]}
];
const cards=setups.map(({name,items})=>{const state={cls:'ladino',items,equip:Object.fromEntries(items.map(item=>[item.slot,item.uid]))};return `<section><h2>${name}</h2><div class="canvas">${renderReferenceRogue(state)}</div></section>`;}).join('\n');
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ladino ASCII de Referência | Laboratório</title><style>
:root{color-scheme:dark;font-family:system-ui;background:#10161b;color:#dee7df}body{max-width:1100px;margin:auto;padding:20px}h1{font-size:1.4rem}p{line-height:1.6}section{border:1px solid #405258;border-radius:10px;margin:16px 0;padding:14px;background:#19252a}h2{font-size:1rem}.canvas{overflow:auto;width:100%;max-height:740px}.canvas pre{font-size:7px;line-height:1!important;letter-spacing:0;white-space:pre;font-family:Consolas,'Liberation Mono',monospace;font-weight:400}.avatar-head-rare,.avatar-body-rare,.avatar-weapon-rare{color:#78aeea}.avatar-body-uncommon{color:#76b881}.avatar-body-epic{color:#d199ec}.avatar-body-legendary,.avatar-weapon-legendary{color:#f0c579}.avatar-head-epic{color:#d199ec}</style></head><body><h1>ASCII REALMS: Piloto de Alta Densidade</h1><p>Fonte original fornecida pelo usuário, preservada em 160 × 103. As versões abaixo são composições experimentais baseadas em máscaras; o encaixe físico dos equipamentos ainda exige revisão artística.</p>${cards}</body></html>`;
writeFileSync('docs/galeria-ladino-referencia.html',html);

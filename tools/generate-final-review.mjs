/** Galeria de revisão visual: nunca substitui as galerias completas dos lotes. */
import {writeFileSync,readFileSync} from 'node:fs';
import {composeHighDensityHero} from '../js/high-density-portraits.js';
import {HD_MONSTER_NAMES,highDensityMonsterArt} from '../js/high-density-monsters.js';
import {HD_REGIONAL_BOSSES,HD_DUNGEON_BOSSES,highDensityBossArt} from '../js/high-density-bosses.js';
import {WORLD_IDS,highDensityCityArtwork} from '../js/high-density-world.js';
import {HD_NPC_IDS,highDensityNpcArtwork} from '../js/high-density-npcs.js';
import {HD_EVENT_IDS,highDensityEventArtwork} from '../js/high-density-events.js';
import {HD_OBJECT_IDS,highDensityObjectArtwork} from '../js/high-density-objects.js';

const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const heroNames={guerreiro:'Guerreiro',mago:'Mago',arqueiro:'Arqueiro',ladino:'Ladino'};
const weapons={guerreiro:'Espada Longa',mago:'Cajado',arqueiro:'Arco',ladino:'Adaga'};
function sampleState(cls,weighted=false){
 if(!weighted)return {cls,items:[],equip:{}};
 const specs=[
  ['head','Elmo de Ferro','Elmo',3,2],
  ['body','Armadura de Placas','Armadura',3,3],
  ['hands','Luvas reforçadas','Luvas',2,0],
  ['feet','Botas de couro','Botas',1,1],
  ['weapon',weapons[cls],weapons[cls],0,4],
  ['ring','Anel Raro','Anel',0,2],
  ['amulet','Amuleto Ancestral','Amuleto',0,4]
 ];
 const items=specs.map(([slot,name,kind,armor,rarity],index)=>({uid:`qa-${cls}-${index}`,slot,name,kind,armor,rarity,catalogId:`qa-gallery-${cls}-${index}`}));
 return {cls,items,equip:Object.fromEntries(items.map(item=>[item.slot,item.uid]))};
}
function heroHtml(cls,weighted){const a=composeHighDensityHero(sampleState(cls,weighted));return a.rows.map((row,y)=>{
 let out='';for(let x=0;x<row.length;){let end=x+1;const ink=a.ink[y][x];while(end<row.length&&a.ink[y][end]===ink)end++;
 const value=escape(row.slice(x,end));out+=ink==='base'?value:`<span class="avatar-ink avatar-${ink}">${value}</span>`;x=end;}
 return out;
}).join('\n');}
function card(title,description,body,colored=false){return `<details class="review-card"><summary><strong>${escape(title)}</strong><span>${escape(description)}</span></summary><div class="review-viewport"><pre class="${colored?'dynamic-hero':''}">${body}</pre></div></details>`;}
const sections=[];
sections.push('<h2>Personagens e equipamentos</h2><p>As quatro classes, antes e depois de equipar um conjunto de demonstração. O conjunto é apenas visual e não altera o salvamento.</p>');
for(const cls of Object.keys(heroNames)){
 sections.push(card(`${heroNames[cls]}: sem equipamento`,'160 × 103 caracteres, silhueta-base',heroHtml(cls,false),true));
 sections.push(card(`${heroNames[cls]}: conjunto equipado`,'Armadura pesada, arma da classe e raridades individuais',heroHtml(cls,true),true));
}
sections.push('<h2>Bestiário e chefes</h2>');
for(const name of HD_MONSTER_NAMES.slice(0,3))sections.push(card(name,'Monstro, 112 × 78',escape(highDensityMonsterArt(name))));
for(const name of [HD_REGIONAL_BOSSES[0],HD_DUNGEON_BOSSES[0]])sections.push(card(name,'Chefe, 128 × 88',escape(highDensityBossArt(name))));
sections.push('<h2>Mundo, NPCs, objetos e eventos</h2>');
sections.push(card(WORLD_IDS.cities[0],'Cidade, 140 × 64',escape(highDensityCityArtwork(WORLD_IDS.cities[0]))));
sections.push(card(HD_NPC_IDS[0],'Retrato de NPC, 96 × 68',escape(highDensityNpcArtwork(HD_NPC_IDS[0]))));
sections.push(card(HD_OBJECT_IDS[0],'Equipamento, 70 × 54',escape(highDensityObjectArtwork(HD_OBJECT_IDS[0]))));
sections.push(card(HD_EVENT_IDS[0],'Evento, 120 × 64',escape(highDensityEventArtwork(HD_EVENT_IDS[0]))));
const css=readFileSync(new URL('../css/dynamic-combat-art.css',import.meta.url),'utf8');
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS | Revisão final HD8</title><style>body{margin:auto;max-width:950px;padding:15px;font:14px/1.55 system-ui,sans-serif;background:#0b1718;color:#d3e5d7}a{color:#a9dbb7}h1,h2{color:#c2e1c7}.review-card{margin:9px 0;border:1px solid #4b6a59;border-radius:8px;overflow:hidden}.review-card>summary{cursor:pointer;display:flex;justify-content:space-between;flex-wrap:wrap;gap:9px;padding:11px;background:#1a2a29}.review-card>summary span{font-size:12px;color:#a7bdb1}.review-viewport{overflow:auto;max-height:560px;max-width:100%;background:#071113;padding:6px;scrollbar-width:thin}.review-viewport pre{display:block;margin:auto;width:max-content;max-width:none;font:400 6px/1.06 Consolas,"Liberation Mono",monospace;white-space:pre;letter-spacing:0;font-variant-ligatures:none;color:#a5e5b5}.review-card[open] summary{border-bottom:1px solid #4b6a59}.links{display:flex;flex-wrap:wrap;gap:10px}.links a{border:1px solid #597564;padding:7px;border-radius:5px}p{color:#b7cbbd}@media(max-width:450px){.review-viewport pre{font-size:4px}}${css}</style></head><body><h1>ASCII REALMS: Galeria de revisão, Etapa 8</h1><p>As artes são formadas somente por caracteres ASCII. Esta seleção permite conferir as proporções, o sombreamento e as cores individuais dos equipamentos. As galerias completas dos lotes anteriores continuam disponíveis.</p><div class="links"><a href="galeria-quatro-herois-alta-densidade.html">Heróis</a><a href="galeria-monstros-hd4.html">150 monstros</a><a href="galeria-chefes-hd5.html">20 chefes</a><a href="galeria-cenarios-hd6.html">100 cenários</a><a href="galeria-objetos-hd7.html">255 objetos</a><a href="galeria-npcs-hd7.html">32 NPCs</a><a href="galeria-eventos-hd7.html">50 eventos</a></div>${sections.join('\n')}<p><strong>Nota:</strong> a verificação de dimensões e unicidade é automática. A avaliação artística individual e os testes completos de gameplay em dispositivo real permanecem pendentes.</p></body></html>`;
writeFileSync(new URL('../docs/galeria-revisao-final-hd8.html',import.meta.url),html);
writeFileSync(new URL('../docs/qa-amostra-heroi.txt',import.meta.url),composeHighDensityHero(sampleState('ladino',true)).text);
console.log('OK: galeria final com quatro classes e exemplos de cada categoria.');

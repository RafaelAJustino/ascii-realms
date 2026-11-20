/** Gera galerias estáticas para inspeção de ASCII; não são sprites usados pelo jogo. */
import {writeFileSync} from 'node:fs';
import {EQUIPMENT_CATALOG} from './js/equipment-catalog.js';
import {HD_OBJECT_IDS,HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT,highDensityObjectArtwork} from './js/high-density-objects.js';
import {HD_NPC_IDS,HD_NPC_WIDTH,HD_NPC_HEIGHT,highDensityNpcArtwork} from './js/high-density-npcs.js';
import {HD_EVENT_IDS,HD_EVENT_WIDTH,HD_EVENT_HEIGHT,highDensityEventArtwork} from './js/high-density-events.js';
import {LOCAL_NPCS,RECURRING_NPCS} from './js/city-life.js';
import {TAVERN_GUESTS} from './js/tavern-stories.js';
import {NARRATIVE_EVENTS} from './js/journey-events.js';
import {EPIC_EVENTS} from './js/epic-events.js';
import {TAVERN_EVENTS} from './js/tavern-stories.js';
import {OBJECT_MATERIAL_NAMES} from './js/density-objects.js';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function gallery(title,entries,dim,filename){
 const base=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>
 :root{color-scheme:dark}body{font:14px/1.45 system-ui,sans-serif;background:#101917;color:#d5dfda;max-width:1180px;padding:20px;margin:auto}h1{color:#d6d4ac}a{color:#9cd8c2}h3{margin:0}
 .intro{color:#9baba3}.entries{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:12px}details{border:1px solid #426454;border-radius:8px;padding:12px;min-width:0}summary{cursor:pointer;font-weight:700;overflow-wrap:anywhere}summary span{font-weight:400;color:#9fafa6}pre{font:400 4px/1.02 Consolas,'Liberation Mono',monospace;white-space:pre;text-align:left;letter-spacing:0;font-variant-ligatures:none;width:max-content;margin:auto;color:#b9cab2;max-width:none}figure{margin:9px 0 0;overflow:auto;max-height:590px;background:#0a1110;padding:8px;border-radius:5px}footer{font-size:12px;color:#9caba5;padding:20px 0}
 @media(min-width:730px){pre{font-size:5px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important}}
 </style></head><body><nav><a href="galeria-objetos-hd7.html">Objetos</a> · <a href="galeria-npcs-hd7.html">NPCs</a> · <a href="galeria-eventos-hd7.html">Eventos</a></nav><h1>${escape(title)}</h1><p class="intro">${entries.length} artes ASCII. Grade ${dim.join(' × ')}. Abra um cartão para inspecionar o desenho em fonte monoespaçada. As artes são geradas por código e precisam de revisão estética individual.</p><div class="entries">`;
 const markup=entries.map((entry,i)=>`<details${i===0?' open':''}><summary>${escape(entry.name)} <span>(${escape(entry.id)})</span></summary><figure><pre>${escape(entry.art)}</pre></figure></details>`).join('');
 writeFileSync('docs/'+filename,base+markup+'</div><footer>ASCII REALMS: Alta Densidade, Etapa 7. Galeria estática de QA, não substitui artes textuais no jogo.</footer></body></html>');
}
const npc=[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS],allEvents=[...NARRATIVE_EVENTS,...EPIC_EVENTS,...TAVERN_EVENTS],names=new Map(EQUIPMENT_CATALOG.map(m=>[m.id,m.name]));
gallery('Equipamentos, materiais e consumíveis',HD_OBJECT_IDS.map(id=>({id,name:names.get(id)||id,art:highDensityObjectArtwork(id)})),[HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT],'galeria-objetos-hd7.html');
gallery('Moradores e visitantes do mundo',HD_NPC_IDS.map(id=>({id,name:npc.find(n=>n.id===id)?.name||id,art:highDensityNpcArtwork(id)})),[HD_NPC_WIDTH,HD_NPC_HEIGHT],'galeria-npcs-hd7.html');
gallery('Acontecimentos narrativos',HD_EVENT_IDS.map(id=>({id,name:allEvents.find(e=>e.id===id)?.title||id,art:highDensityEventArtwork(id)})),[HD_EVENT_WIDTH,HD_EVENT_HEIGHT],'galeria-eventos-hd7.html');
const records=[...HD_OBJECT_IDS.map((id,i)=>({id,name:names.get(id)||id,category:i<220?'equipment':i<250?'material':'object',resolution:[HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT],source:'js/high-density-objects.js'})),
 ...HD_NPC_IDS.map(id=>({id,name:npc.find(n=>n.id===id)?.name||id,category:'npc',resolution:[HD_NPC_WIDTH,HD_NPC_HEIGHT],source:'js/high-density-npcs.js'})),
 ...HD_EVENT_IDS.map(id=>({id,name:allEvents.find(e=>e.id===id)?.title||id,category:'event',resolution:[HD_EVENT_WIDTH,HD_EVENT_HEIGHT],source:'js/high-density-events.js'}))].map(r=>({...r,status:'integrated',visualApproval:'pending-individual-review'}));
writeFileSync('docs/inventario-alta-densidade-etapa7.json',JSON.stringify({title:'ASCII REALMS HD Etapa 7',summary:{total:records.length,equipment:220,materials:30,objects:5,npcs:32,events:50,allArtIntegrated:true,allArtArtisticallyApproved:false},records},null,2)+'\n');
console.log('Galerias escritas: 255 objetos, 32 NPCs, 50 eventos.');

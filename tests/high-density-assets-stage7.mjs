import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HD_OBJECT_IDS,HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT,highDensityObjectArtwork,highDensityEquipmentArtwork,hdObjectCacheSize} from '../js/high-density-objects.js';
import {HD_NPC_IDS,HD_NPC_WIDTH,HD_NPC_HEIGHT,highDensityNpcArtwork,hdNpcCacheSize} from '../js/high-density-npcs.js';
import {HD_EVENT_IDS,HD_EVENT_WIDTH,HD_EVENT_HEIGHT,highDensityEventArtwork,hdEventCacheSize} from '../js/high-density-events.js';
import {EQUIPMENT_CATALOG} from '../js/equipment-catalog.js';
import {OBJECT_MATERIAL_NAMES,OBJECT_ICON} from '../js/density-objects.js';
import {LOCAL_NPCS,RECURRING_NPCS} from '../js/city-life.js';
import {TAVERN_GUESTS,TAVERN_EVENTS} from '../js/tavern-stories.js';
import {EPIC_EVENTS} from '../js/epic-events.js';
import {NARRATIVE_EVENTS} from '../js/journey-events.js';
assert.equal(HD_OBJECT_IDS.length,255);
assert.equal(HD_NPC_IDS.length,32);
assert.equal(HD_EVENT_IDS.length,50);
assert.equal(new Set(HD_OBJECT_IDS).size,255);
assert.equal(new Set(HD_NPC_IDS).size,32);
assert.equal(new Set(HD_EVENT_IDS).size,50);
assert.equal(hdObjectCacheSize(),0,'Objetos devem ser gerados sob demanda');
assert.equal(hdNpcCacheSize(),0,'NPCs devem ser gerados sob demanda');
assert.equal(hdEventCacheSize(),0,'Eventos devem ser gerados sob demanda');
assert.deepEqual(HD_OBJECT_IDS,[...EQUIPMENT_CATALOG.map(m=>m.id),...OBJECT_MATERIAL_NAMES,'hp','mp','elixir','antidote','chest']);
assert.deepEqual(HD_NPC_IDS,[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS].map(n=>n.id));
assert.deepEqual(HD_EVENT_IDS,[...NARRATIVE_EVENTS,...EPIC_EVENTS,...TAVERN_EVENTS].map(e=>e.id));
let printed=0;
for(const [ids,render,width,height,tag] of [
 [HD_OBJECT_IDS,highDensityObjectArtwork,HD_OBJECT_WIDTH,HD_OBJECT_HEIGHT,'object'],
 [HD_NPC_IDS,highDensityNpcArtwork,HD_NPC_WIDTH,HD_NPC_HEIGHT,'npc'],
 [HD_EVENT_IDS,highDensityEventArtwork,HD_EVENT_WIDTH,HD_EVENT_HEIGHT,'event']
]){
 const unique=new Set();
 for(const id of ids){
  const art=render(id);const rows=art?.split('\n');
  assert.equal(rows?.length,height,tag+': '+id);
  assert.ok(rows.every(row=>row.length===width),tag+': largura '+id);
  assert.match(art,/^[\x20-\x7e\n]+$/,tag+': ASCII imprimível '+id);
  assert.ok((art.match(/[@%#*+=:\/.\\]/g)||[]).length>200,tag+': sombreado '+id);
  assert.ok(!unique.has(art),tag+': ilustração duplicada '+id);unique.add(art);printed++;
  assert.equal(render(id),art,tag+': determinismo '+id);
  assert.ok(hdObjectCacheSize()<=18&&hdNpcCacheSize()<=8&&hdEventCacheSize()<=8,'Caches limitados');
 }
 assert.equal(unique.size,ids.length);
}
for(const id of ['',null,'unknown','__proto__']){
 assert.equal(highDensityObjectArtwork(id),null);
 assert.equal(highDensityNpcArtwork(id),null);
 assert.equal(highDensityEventArtwork(id),null);
}
for(const slot of ['weapon','head','body','hands','feet','ring','amulet']){
 const original={uid:'legacy-uid',name:'Relíquia antiga',kind:slot==='weapon'?'Espada':slot==='ring'?'Anel':'Armadura',slot,rarity:4,region:2,armor:3};
 const art=highDensityEquipmentArtwork(original);
 assert.equal(art.split('\n').length,HD_OBJECT_HEIGHT);
 assert.ok(art.split('\n').every(line=>line.length===HD_OBJECT_WIDTH));
 assert.ok(art.length>2000);
}
assert.equal(highDensityEquipmentArtwork(null),null);
for(const model of EQUIPMENT_CATALOG){
 const art=highDensityEquipmentArtwork({uid:'my-save-item',catalogId:model.id,slot:model.slot,name:model.name});
 assert.equal(art,highDensityObjectArtwork(model.id));
 assert.ok(OBJECT_ICON[model.id],'ícone compacto mantido');
}
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
for(const token of ['highDensityObjectArtwork','highDensityEquipmentArtwork','highDensityNpcArtwork','highDensityEventArtwork',
 'data-hd-art-key','data-hd-npc-id','details.addEventListener(\'toggle\'','el.textContent=art','escape(detailed)',
 'hd-npc-portrait','hd-object-scene','hd-event-scene','detailed.some(cls=>container.classList.contains(cls))']){
 assert.ok(ui.includes(token),'Integração em UI: '+token);
}
const css=readFileSync(new URL('../css/high-density-stage7.css',import.meta.url),'utf8');
assert.match(css,/white-space:pre/);assert.match(css,/font-variant-ligatures:none/);
assert.match(css,/max-width:100%/);assert.match(css,/overflow:hidden/);
assert.match(css,/prefers-reduced-motion:reduce/);
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/high-density-stage7\.css/);
const schema=readFileSync(new URL('../js/state-schema.js',import.meta.url),'utf8');assert.match(schema,/SAVE_VERSION\s*=\s*14/);
console.log(`OK: Etapa 7, ${printed} artes ASCII HD (255 objetos, 32 NPCs, 50 eventos), cache limitado, itens legados, UI e save v14.`);

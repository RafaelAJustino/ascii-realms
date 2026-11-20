import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EQUIPMENT_CATALOG} from '../js/equipment-catalog.js';
import {FORGE_MATERIALS} from '../js/forge-materials.js';
import {ARTISAN_CATALYSTS} from '../js/artisan-economy.js';
import {maps} from '../js/data.js';
import {OBJECT_ART,MATERIAL_ART,SUPPLY_ART,OBJECT_ICON,OBJECT_MATERIAL_NAMES,OBJECT_ART_DIMENSIONS,objectArtwork,objectIcon,equipmentArtwork,fallbackEquipmentArtwork} from '../js/density-objects.js';
const detail=Object.values(OBJECT_ART),material=Object.values(MATERIAL_ART),supply=Object.values(SUPPLY_ART);
assert.equal(detail.length,220);
assert.equal(new Set(detail).size,220,'each model must have visually distinct detailed art');
assert.equal(material.length,30);assert.equal(new Set(material).size,30);
assert.equal(supply.length,5);assert.equal(Object.keys(OBJECT_ICON).length,255);
assert.deepEqual(OBJECT_ART_DIMENSIONS,{detail:[27,21],compact:[11,9]});
assert.deepEqual(OBJECT_MATERIAL_NAMES,[...maps.map(m=>m[6]),...FORGE_MATERIALS,...ARTISAN_CATALYSTS]);
for(const [id,art] of [...Object.entries(OBJECT_ART),...Object.entries(MATERIAL_ART),...Object.entries(SUPPLY_ART)]){
 const lines=art.split('\n');assert.equal(lines.length,21,id);assert.ok(lines.every(x=>x.length===27),id);
 assert.match(art,/^[\x20-\x7e\n]+$/,id);assert.ok(art.replace(/\s/g,'').length>35,id);
 const ic=objectIcon(id);assert.equal(ic.split('\n').length,9);assert.ok(ic.split('\n').every(x=>x.length===11),id);
 assert.match(ic,/^[\x20-\x7e\n]+$/,id);
 assert.equal(objectArtwork(id),art);
}
for(const model of EQUIPMENT_CATALOG){
 assert.equal(equipmentArtwork({catalogId:model.id}),OBJECT_ART[model.id]);
 assert.equal(model.slot==='weapon'||['head','body','hands','feet','ring','amulet'].includes(model.slot),true);
}
for(const slot of ['weapon','head','body','hands','feet','ring','amulet']){
 const art=fallbackEquipmentArtwork({slot,kind:'Espada',name:'Item antigo',armor:3,rarity:4});
 assert.equal(art.split('\n').length,21);assert.ok(art.split('\n').every(line=>line.length===27));
}
assert.equal(objectArtwork('inexistente'),null);assert.equal(objectIcon('inexistente'),null);
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
for(const token of ['objectPreview(model.id)','objectPreview(entry.name)','itemPreview(it)','smallObjectIcon(type)','smallObjectIcon(name)','object-art-detail','escape(detailed)'])assert.ok(ui.includes(token),token);
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/density-objects\.css/);
const css=readFileSync(new URL('../css/density-objects.css',import.meta.url),'utf8');assert.match(css,/white-space:pre/);assert.match(css,/overflow:hidden/);
console.log('OK: 220 desenhos de equipamentos distintos, 30 materiais, 5 objetos/poções, 255 ícones ASCII compactos, fallback de saves e UI integrada.');

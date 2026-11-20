/** Auditoria de cobertura visual real das seis etapas. Não altera regras do jogo. */
import {readFileSync,writeFileSync} from 'node:fs';
import {maps,classes} from './js/data.js';
import {REGION_SPECIES} from './js/expanded-species.js';
import {DENSITY_BESTIARY} from './js/density-bestiary.js';
import {highDensityMonsterArt} from './js/high-density-monsters.js';
import {DENSITY_CITIES,DENSITY_BIOMES,DENSITY_DUNGEONS} from './js/density-world.js';
import {NPC_PORTRAITS,INTERIOR_ART} from './js/density-settlements.js';
import {OBJECT_ART,MATERIAL_ART,SUPPLY_ART,OBJECT_ICON} from './js/density-objects.js';
import {EVENT_ART} from './js/density-events.js';
import {TAVERNS,TAVERN_GUESTS} from './js/tavern-stories.js';
import {EQUIPMENT_CATALOG} from './js/equipment-catalog.js';
const file='docs/inventario-visual-densidade.json';
const snapshot=JSON.parse(readFileSync(file,'utf8'));
const checked=snapshot.records.map(record=>{
 let found=false;
 switch(record.category){
 case 'hero': found=Object.hasOwn(classes,record.id);break; // Retrato gerado por classe + equipamento
 case 'monster':found=Boolean(highDensityMonsterArt(record.name));break;
  case 'regional-boss':case 'dungeon-boss':found=Boolean(DENSITY_BESTIARY[record.name]);break;
 case 'city':found=Boolean(DENSITY_CITIES[record.name]);break;
 case 'biome':found=Boolean(DENSITY_BIOMES[record.name]);break;
 case 'dungeon':found=Boolean(DENSITY_DUNGEONS[record.name]);break;
 case 'tavern':found=Boolean(INTERIOR_ART[`${Number(record.id.split('-')[1])}:tavern`]);break;
 case 'tavern-guest':case 'npc':found=Boolean(NPC_PORTRAITS[record.id]);break;
 case 'interior':found=Boolean(INTERIOR_ART[record.id]);break;
 case 'equipment':found=Boolean(OBJECT_ART[record.id]&&OBJECT_ICON[record.id]);break;
 case 'material':found=Boolean(MATERIAL_ART[record.id]&&OBJECT_ICON[record.id]);break;
 case 'object':found=Boolean(SUPPLY_ART[record.id]&&OBJECT_ICON[record.id]);break;
 case 'narrative-event':found=Boolean(EVENT_ART[record.id]);break;
 }
 return {...record,status:found?'redesenhado':'pendente'};
});
// O inventário identifica entidades cadastradas e não todas as suas possíveis variações visuais.
const categories={};for(const r of checked)categories[r.category]=(categories[r.category]||0)+1;
const redrawn=checked.filter(r=>r.status==='redesenhado').length;
const summary={...snapshot.summary,categories,redrawn,remaining:checked.length-redrawn};
writeFileSync(file,JSON.stringify({summary,records:checked},null,2)+'\n');
console.log(JSON.stringify({total:checked.length,redrawn,remaining:summary.remaining,categoryCounts:categories},null,2));
if(summary.remaining)process.exitCode=1;

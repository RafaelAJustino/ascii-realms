/** Inventário final: verificação técnica, não aprovação estética subjetiva. */
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {HIGH_DENSITY_HERO_ROWS} from '../js/high-density-hero-arts.js';
import {HD_MONSTER_NAMES,highDensityMonsterArt} from '../js/high-density-monsters.js';
import {HD_BOSS_NAMES,HD_REGIONAL_BOSSES,highDensityBossArt} from '../js/high-density-bosses.js';
import {WORLD_IDS,highDensityCityArtwork,highDensityBiomeArtwork,highDensityDungeonArtwork} from '../js/high-density-world.js';
import {HIGH_DENSITY_INTERIOR_TYPES,highDensityInteriorArtwork} from '../js/high-density-interiors.js';
import {HD_OBJECT_IDS,highDensityObjectArtwork} from '../js/high-density-objects.js';
import {HD_NPC_IDS,highDensityNpcArtwork} from '../js/high-density-npcs.js';
import {HD_EVENT_IDS,highDensityEventArtwork} from '../js/high-density-events.js';
import {asciiDimensions} from '../js/ascii-presentation.js';

export function auditHighDensity(){
 const entries=[],hashes=new Map(),errors=[];
 function record(category,id,art,width,height,{phase=null}={}){
  if(typeof art!=='string') {errors.push(`Arte ausente: ${category}/${id}`);return;}
  const size=asciiDimensions(art);
  const rows=art.split('\n');
  const printable=/^[\x20-\x7e\n]+$/;
  const digest=createHash('sha256').update(art).digest('hex');
  if(size.width!==width||size.height!==height||rows.some(row=>row.length!==width))errors.push(`Dimensão divergente: ${category}/${id}`);
  if(!printable.test(art)||art.includes('\r')||art.includes('\t'))errors.push(`Caracteres incompatíveis: ${category}/${id}`);
  if(hashes.has(digest))errors.push(`Duplicata textual: ${category}/${id} e ${hashes.get(digest)}`);
  hashes.set(digest,`${category}/${id}`);
  const body=art.replace(/\s/g,'');
  entries.push({category,id,phase,width,height,sha256:digest,inkRatio:Number((body.length/(width*height)).toFixed(4)),technicalStatus:'validated',artisticReview:'pending'});
 }
 for(const [cls,rows] of Object.entries(HIGH_DENSITY_HERO_ROWS))record('heroes',cls,rows.join('\n'),160,103);
 for(const name of HD_MONSTER_NAMES)record('monsters',name,highDensityMonsterArt(name),112,78);
 for(const name of HD_BOSS_NAMES)record('bosses',name,highDensityBossArt(name),128,88);
 for(const [kind,names,make] of [
  ['cities',WORLD_IDS.cities,highDensityCityArtwork],
  ['biomes',WORLD_IDS.biomes,highDensityBiomeArtwork],
  ['dungeons',WORLD_IDS.dungeons,highDensityDungeonArtwork]
 ])for(const name of names)record(kind,name,make(name),140,64);
 for(let region=0;region<10;region++)for(const type of HIGH_DENSITY_INTERIOR_TYPES){record('interiors',`${region}:${type}`,highDensityInteriorArtwork(region,type),124,54);}
 for(const id of HD_OBJECT_IDS)record('objects',id,highDensityObjectArtwork(id),70,54);
 for(const id of HD_NPC_IDS)record('npcs',id,highDensityNpcArtwork(id),96,68);
 for(const id of HD_EVENT_IDS)record('events',id,highDensityEventArtwork(id),120,64);
 const phaseVariants=[];
 for(const name of HD_REGIONAL_BOSSES)for(const phase of [2,3]){
  const art=highDensityBossArt(name,false,phase),dimensions=asciiDimensions(art);
  if(dimensions.width!==128||dimensions.height!==88||!/^[\x20-\x7e\n]+$/.test(art))errors.push(`Fase inválida: ${name} @ ${phase}`);
  if(art===highDensityBossArt(name,false,phase-1))errors.push(`Fase sem diferença visual: ${name} @ ${phase}`);
  phaseVariants.push({name,phase,width:128,height:88,sha256:createHash('sha256').update(art).digest('hex')});
 }
 const totals=Object.fromEntries([...new Set(entries.map(e=>e.category))].map(cat=>[cat,entries.filter(e=>e.category===cat).length]));
 return {base:'Alta Densidade, Etapa 7',total:entries.length,totals,bossPhaseVariants:phaseVariants.length,errors,artisticReview:'pendente: exige revisão individual',entries,phaseVariants};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const report=auditHighDensity();
 writeFileSync(new URL('../docs/inventario-alta-densidade-etapa8.json',import.meta.url),JSON.stringify(report,null,2));
 console.log(`Inventário: ${report.total} artes, ${report.bossPhaseVariants} fases adicionais. Problemas técnicos: ${report.errors.length}`);
 if(report.errors.length){console.error(report.errors.slice(0,20).join('\n'));process.exitCode=1;}
}

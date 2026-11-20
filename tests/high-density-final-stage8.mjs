import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditHighDensity} from '../tools/audit-high-density-stage8.mjs';
import {asciiDimensions,fitAsciiFont,clampAsciiFont} from '../js/ascii-presentation.js';
import {composeHighDensityHero} from '../js/high-density-portraits.js';
import {HD_MONSTER_NAMES,highDensityMonsterArt} from '../js/high-density-monsters.js';
import {HD_BOSS_NAMES,highDensityBossArt} from '../js/high-density-bosses.js';
import {highDensityEquipmentArtwork} from '../js/high-density-objects.js';
const base=new URL('../',import.meta.url);
const read=name=>readFileSync(new URL(name,base),'utf8');
const audit=auditHighDensity();
assert.equal(audit.total,611);
assert.equal(audit.bossPhaseVariants,20);
assert.deepEqual(audit.totals,{heroes:4,monsters:150,bosses:20,cities:10,biomes:10,dungeons:10,interiors:70,objects:255,npcs:32,events:50});
assert.deepEqual(audit.errors,[],'O inventário de alta densidade não pode conter dimensões, caracteres ou artes repetidas');
assert.ok(audit.entries.every(entry=>entry.sha256.length===64&&entry.artisticReview==='pending'));
assert.deepEqual(asciiDimensions(' abc  \n.. '),{width:6,height:2});
assert.deepEqual(asciiDimensions(''),{width:0,height:1});
assert.deepEqual(asciiDimensions('a\r\nb'),asciiDimensions('a\nb'));
assert.equal(fitAsciiFont({availableWidth:400,availableHeight:300,naturalWidth:800,naturalHeight:100,baseFont:10}),5);
assert.equal(fitAsciiFont({availableWidth:400,availableHeight:300,naturalWidth:100,naturalHeight:600,baseFont:10}),5);
assert.equal(fitAsciiFont({availableWidth:400,availableHeight:300,naturalWidth:100,naturalHeight:100,baseFont:10}),10);
assert.equal(clampAsciiFont(Infinity,{min:2,max:22}),2);
assert.equal(clampAsciiFont(100,{min:2,max:22}),22);
// Arte de mesma entidade continua consistente no retrato completo e compacto.
for(const cls of ['guerreiro','mago','arqueiro','ladino']){
 const state={cls,items:[],equip:{}};
 const full=composeHighDensityHero(state,{compact:false});
 const compact=composeHighDensityHero(state,{compact:true});
 assert.deepEqual(asciiDimensions(full.text),{width:160,height:103});
 assert.deepEqual(asciiDimensions(compact.text),{width:80,height:52});
}
for(const name of HD_MONSTER_NAMES.slice(0,5))assert.deepEqual(asciiDimensions(highDensityMonsterArt(name,true)),{width:76,height:52});
for(const name of HD_BOSS_NAMES.slice(0,5))assert.deepEqual(asciiDimensions(highDensityBossArt(name,true)),{width:76,height:52});
const legacy={uid:'old-save-1',slot:'body',name:'Armadura antiga',kind:'Cota de malha',rarity:2,armor:2};
assert.deepEqual(asciiDimensions(highDensityEquipmentArtwork(legacy)),{width:70,height:54});
const js=read('js/ui.js'),viewer=read('js/ascii-presentation.js'),css=read('css/high-density-final.css');
assert.match(js,/export function fitAscii\(el\)/);
assert.match(js,/const maxFont=inCombat\?6:10/);
assert.match(js,/attachAsciiResizeObserver\(\)/);
assert.match(js,/el\.classList\.contains\('high-density-character'\)/);
assert.match(js,/openDetailedAsciiViewer\(content,artElement\)/);
for(const needle of ['textContent=contents','dialog.showModal()','role="status"','aria-label="Diminuir zoom"','aria-label="Aumentar zoom"','dialog.close()','pre.style.setProperty(\'--hd8-font\'',"dialog._setSize(7)"]){
 assert.ok(viewer.includes(needle),'Visualizador acessível: '+needle);
}
assert.match(css,/overflow:auto/);
assert.match(css,/font-variant-ligatures:none/);
assert.match(css,/--hd8-font/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.ok(!read('css/combat-compact.css').includes('#ascii-art-viewer pre{font-size:6px!important}'));
assert.match(read('index.html'),/high-density-final\.css/);
assert.match(read('js/state-schema.js'),/SAVE_VERSION\s*=\s*14/);
console.log(`OK: Etapa 8, inventário técnico ${audit.total} artes + ${audit.bossPhaseVariants} fases, inspeção, medidas, equipamentos legados, combate, responsividade e save v14.`);

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ADVENTURE_STORIES,ADVENTURE_BY_ID,adventureDefaults,normalizeAdventure,stringHash,newAdventureSeed,
 storylineFor,adventureEntry,discoverAdventure,acceptAdventure,advanceAdventureExploration,
 advanceAdventureCombat,deliverAdventure,resolveAdventure
} from '../js/procedural-adventures.js';
import {normalizeSave,SAVE_VERSION} from '../js/state-schema.js';

assert.equal(SAVE_VERSION,14);
assert.equal(ADVENTURE_STORIES.length,20);
assert.equal(new Set(ADVENTURE_STORIES.map(x=>x.id)).size,20);
for(let region=0;region<10;region++){
 const stories=ADVENTURE_STORIES.filter(x=>x.region===region);
 assert.equal(stories.length,2);
 assert.equal(stories[0].type,'hunt');assert.equal(stories[1].type,'delivery');
 for(const story of stories){
  assert.equal(story.clues.length,2);assert.ok(story.sourceGuest&&story.sourceEvent);
  assert.ok(story.lead.length>40&&story.endings.report.length>20&&story.endings.protect.length>20);
  assert.ok(story.reward.xp>0&&story.reward.gold>0);
 }
}
assert.equal(newAdventureSeed(()=>0),0);
assert.equal(newAdventureSeed(()=>.99999999),4294967253);
assert.equal(stringHash('registro'),stringHash('registro'));

function makeState(seed=42){return {
 adventure:adventureDefaults(seed),cityLife:{reputation:Array(10).fill(0)},gold:100,combat:null,
 journey:{path:'unknown',event:null},area:1,lv:5,stats:[5,5,5,5,5,5]
};}
// A escolha da história não muda entre renders e reflete decisões anteriores.
let base=makeState(61),first=storylineFor(base,0);
assert.equal(storylineFor(base,0),first);
assert.ok([0,1].includes(first.variant));
let seedWithChoiceEffect=null;
for(let seed=0;seed<500;seed++){
 const x=makeState(seed);const before=storylineFor(x,1).id;
 x.adventure.decisions['adventure-0-0']='report';
 if(storylineFor(x,1).id!==before){seedWithChoiceEffect=seed;break;}
}
assert.notEqual(seedWithChoiceEffect,null,'Decisões anteriores devem afetar histórias futuras');
const branch=makeState(seedWithChoiceEffect),originalNext=storylineFor(branch,1).id;
branch.adventure.decisions['adventure-0-0']='report';
assert.notEqual(storylineFor(branch,1).id,originalNext);

// A primeira investigação exige o contato correto: escolher visitante incorreto não libera.
let s=makeState(23),story=storylineFor(s,0);
assert.equal(discoverAdventure(s,0,'guest',`guest-${story.variant===0?1:0}`),null);
assert.equal(adventureEntry(s,0).entry,null);
assert.equal(discoverAdventure(s,0,'guest',story.sourceGuest).id,story.id);
assert.equal(discoverAdventure(s,0,'guest',story.sourceGuest),null);
assert.equal(s.adventure.selected['0'],story.id);
assert.equal(acceptAdventure(s,1,story.id),false);
assert.equal(acceptAdventure(s,0,story.id),true);
assert.equal(acceptAdventure(s,0,story.id),false);
assert.equal(s.adventure.entries[story.id].phase,'investigate');
assert.equal(advanceAdventureExploration(s,1,()=>0),null,'Não avançar por outra região');
assert.equal(advanceAdventureExploration(s,0,()=>.99),null);
const firstClue=advanceAdventureExploration(s,0,()=>0);
assert.equal(firstClue.kind,'clue');assert.equal(firstClue.complete,false);
assert.deepEqual(s.adventure.entries[story.id].clues,[0]);
const secondClue=advanceAdventureExploration(s,0,()=>0);
assert.equal(secondClue.complete,true);
assert.deepEqual(s.adventure.entries[story.id].clues,[0,1]);
assert.equal(advanceAdventureExploration(s,0,()=>0),null);
assert.equal(s.adventure.entries[story.id].phase,story.type);
assert.equal(resolveAdventure(s,0,story.id,'protect'),null,'Não receber recompensa antes do objetivo final');

if(story.type==='hunt'){
 const foe={humanoid:true,boss:false};s.combat={enemy:foe};
 assert.equal(advanceAdventureCombat(s,0,{humanoid:false}),null);
 assert.equal(advanceAdventureCombat(s,1,foe),null);
 assert.ok(advanceAdventureCombat(s,0,foe));
 assert.equal(advanceAdventureCombat(s,0,foe),null,'Não registrar a mesma vitória duas vezes');
 const foe2={humanoid:true};s.combat={enemy:foe2};
 assert.ok(advanceAdventureCombat(s,0,foe2)?.complete);
 assert.equal(s.adventure.entries[story.id].phase,'decision');
}else{
 assert.equal(deliverAdventure(s,1,story.id),null);
 assert.ok(deliverAdventure(s,0,story.id));
 assert.equal(deliverAdventure(s,0,story.id),null);
 assert.equal(s.adventure.entries[story.id].phase,'decision');
}
s.combat=null;
const beforeGold=s.gold;
assert.equal(resolveAdventure(s,0,story.id,'corrupt'),null);
const result=resolveAdventure(s,0,story.id,'protect');
assert.equal(result.gold,Math.floor(story.reward.gold*.55));
assert.equal(result.xp,Math.round(story.reward.xp*1.2));
assert.equal(s.gold,beforeGold+result.gold);
assert.equal(s.cityLife.reputation[0],4);
assert.equal(resolveAdventure(s,0,story.id,'protect'),null,'Recompensa nunca é duplicada');
assert.equal(s.adventure.completed.length,1);
assert.equal(s.adventure.entries[story.id].phase,'done');
assert.ok(s.adventure.journal.length>0);

// Variante complementar, sempre entregue na taverna e nunca cobrada do inventário.
let delivery=makeState();delivery.adventure.selected['0']=ADVENTURE_BY_ID['adventure-0-1'].id;
delivery.adventure.entries['adventure-0-1']={phase:'available',clues:[],kills:0};
assert.equal(acceptAdventure(delivery,0,'adventure-0-1'),true);
advanceAdventureExploration(delivery,0,()=>0);advanceAdventureExploration(delivery,0,()=>0);
assert.ok(deliverAdventure(delivery,0,'adventure-0-1'));
assert.ok(resolveAdventure(delivery,0,'adventure-0-1','report'));
assert.equal(delivery.adventure.decisions['adventure-0-1'],'report');
assert.equal(delivery.cityLife.reputation[0],2);
assert.equal(delivery.adventure.completed.length,1);

// Confirmações e salvamento normalizado: uma investigação já ativa continua após recarga.
const saved=normalizeAdventure(s.adventure,123);
assert.equal(saved.selected['0'],story.id);
assert.deepEqual(saved.entries[story.id],s.adventure.entries[story.id]);
assert.deepEqual(saved.decisions,s.adventure.decisions);
assert.equal(saved.journal.length,s.adventure.journal.length);
const malformed=normalizeAdventure({seed:-1,selected:{0:'adventure-0-0',1:'invalid'},entries:{'adventure-0-0':{phase:'hunt',clues:[0,0,99],kills:999},evil:{phase:'done'}},completed:['evil'],decisions:{evil:'hack'},journal:[null,'ok']},123);
assert.equal(malformed.seed,123);
assert.deepEqual(malformed.entries['adventure-0-0'],{phase:'hunt',clues:[0],kills:2});
assert.ok(!Object.hasOwn(malformed.entries,'evil'));
assert.deepEqual(malformed.completed,[]);
assert.deepEqual(malformed.journal,['ok']);

const oldSave={version:13,name:'Antigo',cls:'mago',lv:22,xp:100,points:3,stats:[3,8,2,5,4,3],gold:876,items:[],equip:{},area:21,bosses:[0,1],narrative:{completed:[]}};
const migrated=normalizeSave(oldSave);
assert.equal(migrated.version,14);
assert.equal(migrated.gold,876);assert.equal(migrated.lv,22);
assert.deepEqual(migrated.stats,oldSave.stats);
assert.deepEqual(migrated.bosses,[0,1]);
assert.ok(Number.isSafeInteger(migrated.adventure.seed));
assert.equal(normalizeSave(oldSave).adventure.seed,migrated.adventure.seed);
const continued=normalizeSave({...oldSave,adventure:delivery.adventure});
assert.equal(continued.adventure.completed.length,1);
assert.equal(continued.adventure.decisions['adventure-0-1'],'report');
assert.equal(continued.adventure.entries['adventure-0-1'].phase,'done');

const src=file=>readFileSync(new URL('../js/'+file,import.meta.url),'utf8');
assert.match(src('main.js'),/adventureAccept/);
assert.match(src('main.js'),/adventureDeliver/);
assert.match(src('main.js'),/adventureClaim/);
assert.match(src('main.js'),/discoverAdventure\(rt\.state,mapId\(rt\.area\),'guest',p\)/);
assert.match(src('exploration.js'),/advanceAdventureExploration/);
assert.match(src('combat.js'),/advanceAdventureCombat/);
assert.match(src('progression-ui.js'),/DIÁRIO DE AVENTURAS/);
assert.match(src('ui.js'),/AVENTURAS PESSOAIS/);
assert.doesNotMatch(src('combat.js'),/from ['"]\.\/companions/);
console.log('OK: 20 histórias escritas, 10 aventuras selecionáveis, semente, dois desfechos, pista exploratória, objetivos de caça/entrega, unicidade, migração v13-v14 e integração.');

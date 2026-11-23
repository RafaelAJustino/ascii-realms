import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.setItem?.(k,v)??store.set(k,v),removeItem:k=>store.delete(k)};
const events={};
const app={innerHTML:'',addEventListener(name,cb){events[name]=cb;},querySelector(){return null;},querySelectorAll(){return [];}};
globalThis.document={querySelector:s=>s==='#app'?app:null,querySelectorAll(){return []},scrollingElement:null,visibilityState:'hidden'};
globalThis.window={innerHeight:844,addEventListener(){}};
globalThis.requestAnimationFrame=cb=>cb();globalThis.setInterval=()=>0;
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {KEY}=await import('../js/data.js');
const {EVENT_BY_ID}=await import('../js/journey-events.js');
const {save,load}=await import('../js/storage.js');
const {normalizeSave}=await import('../js/state-schema.js');
const {combat,endCombat,startMiniBossCombat,enemyTurn,hitEnemy}=await import('../js/combat.js');
const {selectPath,openPaths,completeExplorationStep,cancelExplorationStep,chooseEventOption,explore}=await import('../js/exploration.js');
const {miniBossFor,MINI_BOSSES,miniBossArtwork,miniBossDamageFactor,miniBossRegen,miniBossSkills}=await import('../js/mini-bosses.js');
const {challengeProgress,recordExplorationCompletion,resetExplorationSequence,resolveMiniBoss,mapUnlocked,encounterPending}=await import('../js/exploration-challenge.js');
const {canExplore}=await import('../js/journey-paths.js');
const {world,pathJourney,worldMap,miniBossIntro,combatUI}=await import('../js/ui.js');
const {isCityServiceAction}=await import('../js/main.js');
const click=action=>events.click({target:{closest:()=>({disabled:false,dataset:{action}})}});
newGame('Mini Boss Tester','guerreiro');rt.state.lv=99;rt.state.xp=77;rt.state.mp=1000;rt.area=1;rt.state.area=1;
assert.equal(challengeProgress(rt.state,1).current,0);assert.equal(canExplore(rt.state,1),true);
assert.equal(selectPath('safe'),true);
assert.match(pathJourney(),/Explorações consecutivas: 0\/15/);
assert.match(pathJourney(),/EXP/);
assert.match(pathJourney(),/aria-valuenow="77"/);
// Ações abortadas não contam; conclusões isoladas só contam uma vez.
assert.equal(completeExplorationStep(),false);
assert.equal(challengeProgress(rt.state).current,0);
rt.state.journey.pendingKind='event';completeExplorationStep();completeExplorationStep();
assert.equal(challengeProgress(rt.state).current,1);
// 5, 10 e 14 têm avisos progressivos e o décimo quinto é garantido.
for(let i=2;i<=14;i++){rt.state.journey.pendingKind='event';completeExplorationStep();}
assert.equal(challengeProgress(rt.state).current,14);
assert.equal(rt.state.journey.last.some(x=>x.includes('Vesper')),true);
assert.equal(mapUnlocked(rt.state,2),false);
rt.state.journey.pendingKind='event';const fifteenth=completeExplorationStep();
assert.equal(fifteenth.triggered,true);assert.equal(rt.screen,'miniBoss');
assert.equal(challengeProgress(rt.state).current,15);assert.equal(encounterPending(rt.state),true);
assert.equal(canExplore(rt.state,1),false);
assert.equal(openPaths(),true);assert.equal(rt.screen,'miniBoss');
assert.match(miniBossIntro(),/Vesper, o Cervo de Espinhos/);
assert.match(miniBossIntro(),/data-action="miniBossFight"/);
assert.match(miniBossIntro(),/ascii-art/);
// Um salvamento interrompido não descarta o Mini Boss.
save();rt.state=null;assert.equal(load(),true);assert.equal(rt.screen,'miniBoss');
assert.equal(startMiniBossCombat(),true);assert.equal(rt.state.combat.enemy.miniBoss,true);
assert.equal(startMiniBossCombat(),false);
assert.match(combatUI(),/MINI BOSS/);
const monster=rt.state.combat.enemy;
assert.equal(monster.baseName,MINI_BOSSES[0].name);
assert.equal(miniBossSkills(monster).length,3);
assert.ok(monster.maxhp>100);
assert.ok(miniBossDamageFactor(monster,'physical')<1);
assert.ok(miniBossRegen(monster)>0);
// Recarregar durante a luta restaura o desafio, sem vitória nem recompensas.
save();rt.state=null;assert.equal(load(),true);
assert.equal(rt.screen,'miniBoss');assert.equal(rt.state.combat,null);
assert.equal(rt.state.explorationChallenge.defeatedMiniBosses[1],undefined);
assert.equal(startMiniBossCombat(),true);
const originalGold=rt.state.gold;endCombat(false);
assert.equal(rt.state.combat,null);assert.equal(rt.screen,'city');
assert.equal(challengeProgress(rt.state).current,0);
assert.equal(encounterPending(rt.state),false);
assert.equal(mapUnlocked(rt.state,2),false);
assert.ok(rt.state.gold<=originalGold);
// Navegação pura não reinicia contadores. A entrada em serviços urbanos sim.
assert.equal(isCityServiceAction('navArea','diario','world'),false);
assert.equal(isCityServiceAction('nav','inventory','world'),false);
assert.equal(isCityServiceAction('nav','tavern','city'),true);
assert.equal(isCityServiceAction('citySection','market','city'),true);
assert.equal(isCityServiceAction('shop','materials','city'),true);
assert.equal(isCityServiceAction('tavernTalk','npc','tavern'),true);
assert.equal(isCityServiceAction('craft',null,'forge'),true);
assert.equal(isCityServiceAction('buyPotion','hp','merchant'),false);
assert.equal(isCityServiceAction('questAccept','q0-kill0','quests'),false);
rt.state.journey={path:'safe',area:1,steps:12,last:[],event:null,pendingKind:null};
for(let i=0;i<12;i++)recordExplorationCompletion(rt.state,1);
assert.equal(challengeProgress(rt.state).current,12);
click('citySection:market');assert.equal(challengeProgress(rt.state).current,0);
assert.match(rt.cityResetNotice,/reiniciada para 0\/15/);
// A vitória apenas no chefe regional não libera o mapa seguinte.
rt.state.bosses=[0];assert.equal(mapUnlocked(rt.state,2),false);
// Completar 15 vezes novamente e vencer desbloqueia a região 2.
for(let i=0;i<15;i++)recordExplorationCompletion(rt.state,1);
assert.equal(startMiniBossCombat(),true);
const oldItems=rt.state.items.length,oldMaterials=rt.state.materials['Madeira Antiga']||0;
endCombat(true);
assert.equal(rt.state.combat,null);assert.equal(challengeProgress(rt.state).defeated,true);
assert.equal(mapUnlocked(rt.state,2),true);
assert.equal(rt.state.items.length>=oldItems+1,true);
assert.equal(rt.state.materials['Madeira Antiga'],oldMaterials+3);
assert.equal(startMiniBossCombat(),false);assert.equal(recordExplorationCompletion(rt.state,1).count,1);
assert.match(world(),/Derrotado anteriormente/);
assert.match(worldMap(),/BOSS/);
// Os dez chefes são exclusivos e possuem duas passivas, três técnicas e artes diferentes.
assert.equal(MINI_BOSSES.length,10);
assert.equal(new Set(MINI_BOSSES.map(x=>x.name)).size,10);
assert.equal(new Set(MINI_BOSSES.map(x=>x.id)).size,10);
assert.equal(new Set(Array.from({length:10},(_,i)=>miniBossArtwork(i))).size,10);
for(let i=0;i<10;i++){
 const x=miniBossFor(i),art=miniBossArtwork(i);
 assert.equal(x.skills.length,3);assert.equal(x.passives.length,2);
 assert.equal(art.split('\n').length>=17,true);
 assert.ok(art.includes('%')||art.includes('#'));
}
// Legados preservam todas as regiões antigas, sem conceder desbloqueios novos.
const old=JSON.parse(store.get(KEY));delete old.explorationChallenge;old.bosses=[0,1];old.area=21;old.lv=30;
const migrated=normalizeSave(old);assert.equal(mapUnlocked(migrated,1),true);assert.equal(mapUnlocked(migrated,2),true);
assert.equal(migrated.explorationChallenge.defeatedStageBosses[10],true);
const fresh=JSON.parse(store.get(KEY));fresh.bosses=[0];fresh.explorationChallenge.defeatedMiniBosses={};fresh.area=1;
assert.equal(mapUnlocked(normalizeSave(fresh),2),false);
// Uma decisão narrativa pendente em salvamento antigo deve continuar concluível após migração.
const legacyEvent=JSON.parse(store.get(KEY));
legacyEvent.journey={path:'safe',area:1,steps:4,last:[],event:Object.keys(EVENT_BY_ID).find(id=>!legacyEvent.narrative.completed.includes(id))};
delete legacyEvent.explorationChallenge;
const loadedEvent=normalizeSave(legacyEvent);
assert.equal(loadedEvent.journey.pendingKind,'event');
console.log('OK: Mini Bosses, 15 conclusões efetivas, idempotência, derrota, vitória, prémios, regras urbanas, XP, combate, 10 artes e migração v14.');

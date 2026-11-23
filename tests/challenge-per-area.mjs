import assert from 'node:assert/strict';
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[],scrollingElement:null,visibilityState:'hidden'};
globalThis.window={innerHeight:844,addEventListener(){}};globalThis.requestAnimationFrame=f=>f();globalThis.setInterval=()=>0;
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {save,load}=await import('../js/storage.js');
const {normalizeSave}=await import('../js/state-schema.js');
const {AREA_MINI_BOSSES,miniBossForArea,miniBossArtworkForArea,stageBossForArea}=await import('../js/area-bosses.js');
const {REQUIRED_EXPLORATIONS,challengeFor,challengeProgress,recordExplorationCompletion,resetExplorationSequence,resolveMiniBoss,selectChallengeMap,mapUnlocked,challengeCleared,encounterPending}=await import('../js/exploration-challenge.js');
const {changeArea}=await import('../js/exploration.js');
const {startMiniBossCombat,endCombat,combat}=await import('../js/combat.js');
const {miniBossIntro,pathJourney,worldMap}=await import('../js/ui.js');
const {isCityServiceAction}=await import('../js/main.js');
const {KEY}=await import('../js/data.js');
newGame('Contador','guerreiro');rt.state.lv=100;
assert.equal(challengeFor(rt.state).schemaVersion,2);
assert.equal(challengeProgress(rt.state,1).current,0);
assert.equal(mapUnlocked(rt.state,1),true);
assert.equal(mapUnlocked(rt.state,2),false);
assert.equal(AREA_MINI_BOSSES.length,100);
assert.equal(AREA_MINI_BOSSES.filter(Boolean).length,90);
assert.equal(new Set(AREA_MINI_BOSSES.filter(Boolean).map(x=>x.id)).size,90);
assert.equal(new Set(AREA_MINI_BOSSES.filter(Boolean).map(x=>x.name)).size,90);
assert.equal(new Set([1,2,9,11].map(miniBossArtworkForArea)).size,4);
for(let area=1;area<=100;area++){
 assert.equal(Boolean(miniBossForArea(area)),area%10!==0,`mini ${area}`);
 assert.equal(Boolean(stageBossForArea(area)),area%10===0,`boss ${area}`);
}
for(let n=1;n<15;n++){
 const result=recordExplorationCompletion(rt.state,1);
 assert.equal(result.triggered,false);
 assert.equal(result.count,n);
}
assert.equal(challengeProgress(rt.state,1).current,14);
assert.equal(recordExplorationCompletion(rt.state,1).triggered,true);
assert.equal(recordExplorationCompletion(rt.state,1).triggered,false);
assert.equal(challengeProgress(rt.state,1).current,15);
assert.equal(startMiniBossCombat(),true);
assert.equal(rt.state.combat.enemy.miniBoss,true);
assert.equal(rt.state.combat.enemy.miniBossArea,1);
const initialItems=rt.state.items.length;
endCombat(true);
assert.equal(rt.state.combat,null);
assert.equal(challengeProgress(rt.state,1).current,0);
assert.equal(challengeCleared(rt.state,1),true);
assert.equal(mapUnlocked(rt.state,2),true);
assert.equal(rt.state.items.length>initialItems,true);
changeArea(2);
assert.equal(rt.area,2);assert.equal(rt.state.area,2);
assert.equal(challengeProgress(rt.state,2).current,0);
assert.equal(challengeProgress(rt.state,2).defeated,false);
for(let n=0;n<7;n++)recordExplorationCompletion(rt.state,2);
assert.equal(challengeProgress(rt.state,2).current,7);
// Uma derrota em combate comum não apaga as explorações acumuladas.
rt.state.journey={path:'safe',area:2,steps:7,last:[],event:null,pendingKind:'combat'};
combat(false);endCombat(false);
assert.equal(challengeProgress(rt.state,2).current,7);
assert.equal(isCityServiceAction('nav','inventory','city'),false);
assert.equal(isCityServiceAction('tavernTalk','npc','tavern'),true);
resetExplorationSequence(rt.state,2);
assert.equal(challengeProgress(rt.state,2).current,0);
for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,2);
assert.equal(startMiniBossCombat(),true);
endCombat(false);
assert.equal(challengeProgress(rt.state,2).current,0);
assert.equal(challengeCleared(rt.state,2),false);
for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,2);
assert.equal(startMiniBossCombat(),true);
endCombat(true);
assert.equal(challengeCleared(rt.state,2),true);
const currentTrophies=rt.state.items.filter(x=>x.name?.includes('Troféu de')).length;
for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,2);
assert.equal(startMiniBossCombat(),true);
endCombat(true);
assert.equal(rt.state.items.filter(x=>x.name?.includes('Troféu de')).length,currentTrophies,'revanche não duplica troféu único');
assert.equal(challengeProgress(rt.state,2).current,0);
assert.equal(challengeCleared(rt.state,2),true);
changeArea(1);assert.equal(challengeProgress(rt.state,1).current,0);
// Libera sequencialmente os mapas 3..9. O mapa 10 exige um chefe de fase.
for(let area=3;area<=9;area++){
 assert.equal(mapUnlocked(rt.state,area),true);
 changeArea(area);
 for(let step=0;step<15;step++)recordExplorationCompletion(rt.state,area);
 assert.equal(encounterPending(rt.state),true);
 assert.equal(resolveMiniBoss(rt.state,area,true),true);
 assert.equal(challengeProgress(rt.state,area).current,0);
 assert.equal(mapUnlocked(rt.state,area+1),true);
}
changeArea(10);assert.equal(challengeProgress(rt.state,10).kind,'boss');
assert.equal(mapUnlocked(rt.state,11),false);
for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,10);
assert.match(miniBossIntro(),/BOSS DA FASE/);
assert.equal(startMiniBossCombat(),true);
assert.equal(rt.state.combat.enemy.boss,true);
assert.equal(rt.state.combat.enemy.challengeStageArea,10);
endCombat(false);
assert.equal(challengeProgress(rt.state,10).current,0);
assert.equal(mapUnlocked(rt.state,11),false);
for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,10);
assert.equal(startMiniBossCombat(),true);
endCombat(true);
assert.equal(challengeCleared(rt.state,10),true);
assert.equal(challengeProgress(rt.state,10).current,0);
assert.equal(mapUnlocked(rt.state,11),true);
assert.equal(rt.state.bosses.includes(0),true);
changeArea(11);assert.equal(challengeProgress(rt.state,11).current,0);
assert.equal(challengeProgress(rt.state,11).kind,'mini');
assert.equal(mapUnlocked(rt.state,12),false);
assert.match(worldMap(),/BOSS/);
// A mudança de mapa zera ambos os lados, mas não apaga a vitória.
recordExplorationCompletion(rt.state,11);recordExplorationCompletion(rt.state,11);
changeArea(10);assert.equal(challengeProgress(rt.state,11).current,0);
assert.equal(challengeCleared(rt.state,10),true);
// Uma vitória regravada não concede novos mapas que não venceram o desafio intermediário.
assert.equal(mapUnlocked(rt.state,20),false);
// Gravação e recuperação do desafio pendente.
changeArea(11);for(let n=0;n<15;n++)recordExplorationCompletion(rt.state,11);
save();rt.state=null;assert.equal(load(),true);
assert.equal(encounterPending(rt.state),true);assert.equal(rt.state.explorationChallenge.pendingMapId,11);
assert.equal(rt.screen,'miniBoss');assert.equal(challengeProgress(rt.state,11).current,15);
// Validação independente de todas as 100 áreas, incluindo os bosses 20 a 100.
const {emptyChallenge}=await import('../js/exploration-challenge.js');
const simulation={area:1,explorationChallenge:emptyChallenge(),bosses:[]};
for(let area=1;area<=100;area++){
 assert.equal(mapUnlocked(simulation,area),true,`área ${area} liberada em sequência`);
 if(area>1){simulation.area=area;selectChallengeMap(simulation,area);}
 for(let n=0;n<REQUIRED_EXPLORATIONS;n++)recordExplorationCompletion(simulation,area);
 assert.equal(challengeProgress(simulation,area).current,15);
 assert.equal(resolveMiniBoss(simulation,area,true),true);
 assert.equal(challengeProgress(simulation,area).current,0);
 assert.equal(challengeCleared(simulation,area),true);
 assert.equal(challengeProgress(simulation,area).kind,area%10===0?'boss':'mini');
}
assert.equal(Object.keys(simulation.explorationChallenge.defeatedMiniBosses).length,90);
assert.equal(Object.keys(simulation.explorationChallenge.defeatedStageBosses).length,10);
// Migração da versão antiga: blocos regionais previamente liberados não se perdem.
const legacy=JSON.parse(storage.get(KEY));legacy.area=21;legacy.bosses=[0,1];legacy.explorationChallenge={currentMapId:2,consecutiveByMap:{2:5},consecutiveExplorations:5,defeatedMiniBosses:{0:true,1:true}};
const old=normalizeSave(legacy);
assert.equal(mapUnlocked(old,30),true);
assert.equal(mapUnlocked(old,31),false);
assert.equal(old.explorationChallenge.defeatedStageBosses[10],true);
assert.equal(old.explorationChallenge.consecutiveByMap[21],5);
assert.equal(old.version,14);
console.log('OK: 100 áreas, 90 mini bosses, 10 chefes de fase, contagem de 15, vitória, derrota, reavaliação, troca, cidade, salvamento e migração v14.');

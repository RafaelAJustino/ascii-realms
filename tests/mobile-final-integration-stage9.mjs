/** Etapa 9: teste de integração dos fluxos reais sob DOM simulado.
 * Não substitui um teste e2e no navegador, mas executa handlers e lógica reais.
 */
import assert from 'node:assert/strict';
const storage=new Map(),listeners={};let failRemove=false,confirmAnswer=true,alertMessages=[];
globalThis.localStorage={
 getItem:key=>storage.get(key)??null,
 setItem:(key,value)=>storage.set(key,String(value)),
 removeItem(key){if(failRemove&&key.endsWith('-pre-migration'))throw Error('storage blocked');storage.delete(key);}
};
const viewport={scrollTop:0,scrollHeight:1200,clientHeight:600,querySelectorAll(){return []},querySelector(){return null}};
const app={innerHTML:'',addEventListener(name,fn){listeners[name]=fn},querySelector(selector){return selector==='.content'?viewport:null},querySelectorAll(){return []},contains(){return false}};
globalThis.document={querySelector:s=>s==='#app'?app:null,scrollingElement:null,activeElement:null,visibilityState:'hidden',querySelectorAll(){return []}};
globalThis.window={innerHeight:844,addEventListener(){}};
globalThis.requestAnimationFrame=callback=>callback();
globalThis.confirm=()=>confirmAnswer;
globalThis.alert=text=>alertMessages.push(text);
globalThis.setInterval=()=>0;
const {rt}=await import('../js/runtime.js');
const {KEY,maps}=await import('../js/data.js');
const {newGame}=await import('../js/player.js');
const {combat,act}=await import('../js/combat.js');
const {load,save,hasRecoverableSave,deleteSave,BACKUP_KEY,MIGRATION_BACKUP_KEY}=await import('../js/storage.js');
const {setCombatSpeed}=await import('../js/combat-speed.js');
const {questStatus,questById}=await import('../js/progression.js');
const {activeJourney}=await import('../js/journey-paths.js');
const {sectionNavigation}=await import('../js/navigation-sections.js');
const {home}=await import('../js/ui.js');
await import('../js/main.js');
const click=action=>{assert.ok(listeners.click);listeners.click({target:{closest(){return {disabled:false,dataset:{action}}}}});};

// Criação, navegação, seleção de caminho e persistência durante expedição.
newGame('Heroína Teste','guerreiro');
assert.equal(rt.screen,'world');assert.equal(rt.state.version,14);
assert.ok(hasRecoverableSave());assert.ok(storage.has(KEY)&&storage.has(BACKUP_KEY));
click('explore');assert.equal(rt.screen,'paths');
click('pathSelect:safe');assert.equal(rt.screen,'journey');assert.ok(activeJourney(rt.state));
rt.state.gold=800;save();rt.state=null;
assert.ok(load());assert.equal(rt.screen,'journey');assert.equal(rt.state.gold,800);
click('journeyCamp');assert.equal(rt.screen,'camp');
click('campLeave');assert.equal(rt.screen,'journey');

// Encontro, impacto real, vitória, retorno contextual à mesma expedição.
assert.ok(setCombatSpeed('instant'));
combat();assert.equal(rt.screen,'combat');assert.equal(rt.state.combat.turn,0);
assert.equal(rt.state.combat.enemy.hp>0,true);
rt.state.combat.enemy.hp=1;rt.state.combat.enemy.def=0;
const random=Math.random;Math.random=()=>0;
try{await act('attack');}finally{Math.random=random;}
assert.equal(rt.state.combat,null);assert.equal(rt.screen,'journey');
assert.ok(activeJourney(rt.state));assert.ok(rt.state.statistics.monstersDefeated>=1);
click('journeyCity');assert.equal(rt.screen,'city');assert.equal(activeJourney(rt.state),false);

// Diário e recompensas: aceitar, entregar materiais e resgatar uma única vez.
click('nav:quests');assert.equal(rt.screen,'quests');
click('questAccept:q0-collect');assert.equal(questStatus(questById('q0-collect')),'Em andamento');
rt.state.materials[maps[0][6]]=3;
click('questDeliver:q0-collect');assert.equal(questStatus(questById('q0-collect')),'Concluída');
const goldBefore=rt.state.gold;
click('questClaim:q0-collect');assert.equal(questStatus(questById('q0-collect')),'Recompensa recebida');
const reward=questById('q0-collect').reward.gold;
assert.equal(rt.state.gold,goldBefore+reward);
click('questClaim:q0-collect');assert.equal(rt.state.gold,goldBefore+reward,'nunca duplicar recompensa');

// Navegação contextual para a taverna também deve registrar uma visita real.
click('nav:tavern');assert.equal(rt.screen,'tavern');
const firstVisit=rt.state.cityLife.tavern.visits[0];assert.ok(firstVisit>=1);
click('navArea:diario');assert.equal(rt.screen,'quests');
click('navArea:mundo');assert.equal(rt.screen,'tavern');
assert.equal(rt.state.cityLife.tavern.visits[0],firstVisit+1);
click('navArea:personagem');assert.equal(rt.screen,'player');
click('nav:inventory');assert.equal(rt.screen,'inventory');
assert.match(app.innerHTML,/invent[aá]rio/i);
click('navArea:diario');assert.equal(rt.screen,'quests');

// A masmorra ativa não permite navegar para o diário ou a aventura.
rt.state.dungeons.attempt={id:'test',room:1,roomResolved:false};rt.screen='dungeon';
assert.match(sectionNavigation('dungeon',rt.state),/navArea:diario"\s+disabled/);
click('navArea:diario');assert.equal(rt.screen,'dungeon');
click('navArea:aventura');assert.equal(rt.screen,'dungeon');
rt.state.dungeons.attempt=null;

// Reabertura a partir apenas do backup, inclusive com principal inválido.
save();const knownGood=storage.get(BACKUP_KEY);
storage.set(KEY,'{invalid-json');
assert.ok(hasRecoverableSave(),'continuação visível com backup íntegro');
assert.match(home(),/data-action="continue"/);
rt.state=null;assert.equal(load(),true);assert.equal(rt.state.name,'Heroína Teste');
assert.equal(JSON.parse(storage.get(KEY)).name,JSON.parse(knownGood).name);
assert.equal(JSON.parse(storage.get(KEY)).version,14);

// Excluir exige confirmação, e não deixa nenhum backup que ressuscite a partida.
rt.state=null;rt.screen='home';confirmAnswer=false;
click('delete');assert.ok(storage.has(KEY));assert.ok(hasRecoverableSave());
confirmAnswer=true;failRemove=true;
click('delete');assert.ok(storage.has(KEY),'falha na exclusão mantém salvamento principal');
assert.ok(alertMessages.some(x=>x.includes('Não foi possível excluir')));
failRemove=false;click('delete');
assert.equal(storage.has(KEY),false);assert.equal(storage.has(BACKUP_KEY),false);assert.equal(storage.has(MIGRATION_BACKUP_KEY),false);
assert.equal(hasRecoverableSave(),false);assert.equal(load(),false);
assert.match(home(),/Nenhuma aventura salva/);

// Um arquivo inválido não habilita Continuar; novo jogo limpa migração obsoleta.
storage.set(KEY,'{bad');assert.equal(hasRecoverableSave(),false);
storage.delete(KEY);
storage.set(MIGRATION_BACKUP_KEY,knownGood);
assert.equal(hasRecoverableSave(),true);
newGame('Nova Heroína','mago');
assert.equal(rt.state.name,'Nova Heroína');assert.equal(storage.has(MIGRATION_BACKUP_KEY),false);
assert.equal(rt.state.version,14);
assert.equal(deleteSave(),true);
console.log('OK: Etapa 9, navegação ponta a ponta simulada, expedição, combate, missões, taverna, masmorra, backups, exclusão e novo jogo.');

import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:q=>q==='#app'?app:null};
globalThis.window={addEventListener(){},innerHeight:850};
globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame,stats,passives}=await import('../js/player.js');
const {combat,act}=await import('../js/combat.js');
const {active,classes}=await import('../js/data.js');
const {CLASS_SKILLS,CLASS_RESOURCES,CLASS_PASSIVES,gainResource,consumeResource,resourceValue,hasPassive} = await import('../js/class-combat.js');
const {SPECIAL_MILESTONES,hasMilestone,investedMilestones} = await import('../js/attribute-milestones.js');
const {monsterKit,monsterPassives,bossKit,SPECIES_KITS,BOSS_KITS,monsterDamageFactor}=await import('../js/monster-identity.js');
const {availableMonsterActions}=await import('../js/monster-ai.js');
const {applyStatus,periodicStatuses,expireStatuses,statusActive}=await import('../js/combat-effects.js');
const {turnsRemaining,playerCooldownDetails}=await import('../js/turn-cooldowns.js');
const {save,load}=await import('../js/storage.js');
const {combatQuickControls,skills,character}=await import('../js/ui.js');
const {setCombatSpeed}=await import('../js/combat-speed.js');
setCombatSpeed('instant',{setItem(){},getItem(){return 'instant'}});
for(const [cls,info] of Object.entries(CLASS_RESOURCES)){
 assert.equal(info.max,5);
 assert.equal(active[cls].length,4);
 assert.equal(CLASS_SKILLS[cls].length,4);
 assert.equal(CLASS_PASSIVES[cls].length,4);
 assert.deepEqual(CLASS_PASSIVES[cls].map(x=>x.level),[1,10,25,40]);
 newGame('Teste '+cls,cls);
 for(const [lv,expected] of [[1,1],[9,1],[10,2],[24,2],[25,3],[39,3],[40,4],[100,4]]){
  rt.state.lv=lv;assert.equal(passives().filter(x=>x.active).length,expected);
 }
 rt.state.lv=100;rt.state.hp=stats().maxhp;rt.state.mp=stats().maxmp;
 combat();const c=rt.state.combat;
 assert.equal(resourceValue(c),0);
 assert.equal(gainResource(c,cls,100),5);
 assert.equal(consumeResource(c,cls,3),true);assert.equal(resourceValue(c),2);
 assert.equal(consumeResource(c,cls,3),false);assert.equal(resourceValue(c),2);
 c.classResource.value=0;
 const mpBefore=rt.state.mp,turnBefore=c.turn;
 await act('skill',3);
 assert.equal(c.turn,turnBefore,'recurso insuficiente deve impedir turno');assert.equal(rt.state.mp,mpBefore);
 assert.match(combatQuickControls(),/Requer 3/);
 for(let i=0;i<4;i++){
  c.cooldowns={};c.classResource.value=5;
  c.enemy.hp=c.enemy.maxhp=1_000_000_000;c.enemy.atk=0;c.enemy.mp=0;c.enemy.def=0;c.enemy.speciesId=null;c.enemy.guardTurns=0;c.enemy.affinities={};c.enemy.boss=false;c.enemy.effects=[];c.enemy.telegraphCooldown=15;
  rt.state.hp=stats().maxhp;rt.state.mp=stats().maxmp;
  const beforeMp=rt.state.mp, beforeHp=c.enemy.hp, beforeTurn=c.turn;
  const action=active[cls][i];const previous=Math.random;Math.random=()=>.01;
  try{await act('skill',i);}finally{Math.random=previous;}
  assert.equal(rt.busy,false);assert.equal(c.turn,beforeTurn+1,`${cls} skill ${i}: 1 turno`);
  assert.ok(rt.state.mp<=beforeMp-action[2]+12,`${cls} skill ${i}: MP`);
  assert.ok(turnsRemaining(c,playerCooldownDetails(rt.state,i).id)>0,`${cls} skill ${i}: cooldown`);
  if(!['guard','evade'].includes(action[4]))assert.ok(c.enemy.hp<beforeHp,`${cls} skill ${i}: dano, hp=${c.enemy.hp}, antes=${beforeHp}, log=${JSON.stringify(rt.log.slice(0,6))}`);
  assert.ok(resourceValue(c)>=0&&resourceValue(c)<=5);
 }
 assert.match(skills(),/Habilidades passivas/);
 assert.match(skills(),/CD /);
 assert.match(character(),/Talentos especiais do atributo/);
 rt.state.combat=null;rt.state.hp=stats().maxhp;save();rt.state=null;
 assert.equal(load(),true);assert.equal(rt.state.cls,cls);assert.equal(rt.state.version,14);assert.equal(rt.state.combat,null);
}
for(const key of ['for','int','agi','des','vit','sor']){
 const specials=SPECIAL_MILESTONES[key];assert.deepEqual(specials.map(x=>x[1]),[15,30,50,75]);
 const idx=['for','int','agi','des','vit','sor'].indexOf(key);
 for(const points of [0,14,15,29,30,49,50,74,75]){
  const n=Array(6).fill(0);n[idx]=points;
  for(const [id,threshold] of specials)assert.equal(hasMilestone(n,key,id),points>=threshold);
  assert.equal(investedMilestones(n)[key].count,Math.floor(points/5));
 }
}
assert.equal(Object.keys(SPECIES_KITS).length,150);
assert.equal(Object.keys(BOSS_KITS).length,10);
const {DUNGEON_BOSS_KITS}=await import('../js/monster-identity.js');assert.equal(Object.keys(DUNGEON_BOSS_KITS).length,10);
for(const kit of Object.values(SPECIES_KITS)){
 assert.equal(kit.actions.length,3);assert.equal(kit.passives.length,2);
 assert.equal(new Set(kit.actions.map(x=>x.id)).size,3);
 assert.ok(kit.actions.every(x=>x.power>=0&&x.power<=1.5));
 const e={speciesId:kit.id,lv:50,mp:200,cooldowns:{},hp:100,maxhp:100};
 assert.ok(monsterKit(e));assert.equal(monsterPassives(e).length,2);
 assert.equal(availableMonsterActions(e).length,4);
 assert.ok(monsterDamageFactor(e,'physical')>=.78);
}
for(const kit of Object.values(BOSS_KITS)){
 assert.equal(kit.phaseAttacks.length,2);assert.ok(kit.phaseAttacks[1].power>kit.phaseAttacks[0].power);
 assert.ok(bossKit({baseName:kit.name})?.passive.name);
}
let effects=[];assert.equal(applyStatus(effects,'poison'),true);assert.equal(applyStatus(effects,'poison'),false);
assert.equal(effects.length,1);assert.equal(statusActive(effects,'poison'),true);
let dummy={hp:100,maxhp:100};const dealt=periodicStatuses(dummy,effects);assert.equal(dummy.hp,100-dealt);
expireStatuses(effects);expireStatuses(effects);expireStatuses(effects);assert.equal(effects.length,0);
console.log('OK: 16 habilidades em combate real, 16 passivas, 4 recursos limitados, 24 marcos especiais, 150 kits de monstros, 10 chefes, cooldowns, MP, UI e migração v14.');

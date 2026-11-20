import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []},addEventListener(){}};
globalThis.document={querySelector:q=>q==='#app'?app:null};
globalThis.window={addEventListener(){}};
globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame,stats}=await import('../js/player.js');
const {enemy}=await import('../js/monsters.js');
const {combat,enemyTurn,act}=await import('../js/combat.js');
const {incomingDamage}=await import('../js/final-balance.js');
const {resolveBossAttack,initBossPhases}=await import('../js/boss-phases.js');
const {buyItem,buyPotion,potionPrice,sell}=await import('../js/shops.js');
const {setCombatSpeed}=await import('../js/combat-speed.js');
const {save,load}=await import('../js/storage.js');
setCombatSpeed('instant',{setItem(){},getItem(){return 'instant'}});

newGame('Proteção','guerreiro');rt.area=1;rt.state.lv=28;rt.state.stats[4]+=60;
rt.state.hp=stats().maxhp;
let sample=enemy(1,false);sample.lv=1;sample.atk=180;sample.mp=0;sample.maxmp=0;sample.telegraphCooldown=8;sample.hp=sample.maxhp;
const start=rt.state.hp;
rt.state.combat={enemy:structuredClone(sample),effects:[],turn:0,guard:0,cooldowns:{}};
let oldRandom=Math.random;Math.random=()=>.99;
try{enemyTurn();}finally{Math.random=oldRandom;}
const baseLoss=start-rt.state.hp;
assert.equal(baseLoss,incomingDamage(180,stats().def));
rt.state.hp=start;rt.state.combat={enemy:structuredClone(sample),effects:[{type:'defdown',name:'Maldição',power:.25,duration:2}],turn:0,guard:0,cooldowns:{}};
oldRandom=Math.random;Math.random=()=>.99;
try{enemyTurn();}finally{Math.random=oldRandom;}
assert.ok(start-rt.state.hp>baseLoss,'maldição deve aumentar dano recebido');

const curse=initBossPhases({boss:true,name:'Rei Esquecido',baseName:'Rei Esquecido',lv:45,hp:100,maxhp:100,atk:120});
curse.telegraph={name:'Teste',element:'dark',power:1.5,effect:'curse'};
const player={hp:1000,combatEffects:[],elementalAffinities:{}};
const hit=resolveBossAttack(curse,player,{def:50,md:50,maxhp:1000,damageReduction:.2},0,()=>{});
assert.ok(hit>0);assert.equal(player.hp,1000-hit);
assert.deepEqual(player.combatEffects.map(e=>[e.type,e.power,e.duration]),[['defdown',.25,2]]);

// O atordoamento impede somente a próxima ação do jogador, sem impedir o turno inimigo.
newGame('Atordoado','arqueiro');rt.state.lv=15;rt.area=1;rt.state.hp=stats().maxhp;
combat();const c=rt.state.combat;
c.enemy.hp=c.enemy.maxhp=500;c.enemy.atk=15;c.enemy.mp=0;c.enemy.lv=1;
c.effects=[{type:'stun',name:'Congelado',power:0,duration:1}];
const enemyHpBefore=c.enemy.hp,consumablesBefore=structuredClone(rt.state.consumables);
await act('attack');
assert.ok(rt.state.combat,'batalha continua');
assert.equal(rt.state.combat.enemy.hp,enemyHpBefore,'jogador atordoado não deve atacar');
assert.deepEqual(rt.state.consumables,consumablesBefore);
assert.equal(rt.state.combat.turn,1);
assert.equal(rt.state.combat.effects.some(e=>e.type==='stun'),false);
assert.ok(rt.log.some(entry=>String(entry.text||entry).includes('atordoado')));
rt.state.combat=null;rt.screen='city';rt.state.gold=3000;
const before=JSON.stringify({gold:rt.state.gold,materials:rt.state.materials,consumables:rt.state.consumables,items:rt.state.items});
assert.equal(potionPrice('falso'),null);
assert.equal(buyPotion('falso'),false);
assert.equal(buyItem('falso',3),false);
assert.equal(buyItem('weapon',NaN),false);
assert.equal(buyItem('weapon',3,'mago'),false);
assert.equal(sell('item-inexistente'),false);
assert.equal(JSON.stringify({gold:rt.state.gold,materials:rt.state.materials,consumables:rt.state.consumables,items:rt.state.items}),before,'ações inválidas não mutam economia');
assert.equal(buyPotion('hp'),true);
assert.ok(Number.isFinite(rt.state.gold)&&rt.state.gold>=0);
save();rt.state=null;assert.equal(load(),true);assert.ok(Number.isFinite(rt.state.gold));
console.log('OK: dano mitigado em batalha, maldição de defesa, especial de chefe, atordoamento consumindo somente a ação do jogador, transações inválidas sem mutação e recarga.');

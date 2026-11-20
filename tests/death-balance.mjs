import assert from 'node:assert/strict';
import {applyDeathXpPenalty,DEATH_XP_LOSS_RATE} from '../js/death-penalty.js';
import {classes} from '../js/data.js';
import {xpNeed} from '../js/utils.js';
import {normalizeSave,SAVE_VERSION} from '../js/state-schema.js';

assert.equal(DEATH_XP_LOSS_RATE,.20);
for (const lv of [1,2,10,25,50,75,100]) {
 const hero={lv,xp:100,points:15};
 const result=applyDeathXpPenalty(hero);
 assert.deepEqual(result,{lost:20,remaining:80});
 assert.equal(hero.lv,lv);assert.equal(hero.points,15);
}
for (const [xp,lost] of [[0,0],[1,1],[4,1],[5,1],[9,2],[99,20],[1000,200]]){
 const hero={lv:4,xp};assert.equal(applyDeathXpPenalty(hero).lost,lost);assert.equal(hero.xp,xp-lost);
 assert.ok(hero.xp>=0&&hero.xp<=(xpNeed(4)) || xp>xpNeed(4));
}
const oldClassStats={guerreiro:[8,2,3,4,8,3],mago:[2,9,4,4,3,4],arqueiro:[4,3,7,9,4,5],ladino:[5,3,9,6,4,8]};
for (const cls of Object.keys(oldClassStats)){
 assert.equal(classes[cls].stats.length,6);
 assert.ok(classes[cls].stats.reduce((s,n)=>s+n,0)<oldClassStats[cls].reduce((s,n)=>s+n,0));
 assert.ok(classes[cls].stats.every(n=>Number.isInteger(n)&&n>=1));
}
// Dados salvos mantêm seus atributos (não são recalculados a partir dos novos valores iniciais).
const source={version:12,name:'Veterano',cls:'guerreiro',lv:27,xp:345,points:6,stats:[14,8,12,8,20,10],gold:140,items:[],equip:{},area:1,investedStats:[5,0,0,0,5,0]};
const migrated=normalizeSave(source);
assert.deepEqual(migrated.stats,source.stats);
assert.equal(migrated.lv,27);assert.equal(migrated.xp,345);
assert.deepEqual(migrated.investedStats,source.investedStats);
assert.equal(migrated.version,SAVE_VERSION);
// Garantia estrutural de que a derrota utiliza o cálculo único da penalidade.
const fs=await import('node:fs');
const combatSource=fs.readFileSync(new URL('../js/combat.js',import.meta.url),'utf8');
assert.match(combatSource,/const xpPenalty=applyDeathXpPenalty\(rt\.state\)/);
assert.match(combatSource,/xpPenalty\.lost/);
console.log('OK: penalidade de 20% do XP atual, sem perda de níveis, rebalanceamento inicial e salvamentos antigos preservados.');

// Teste integrado: derrota real em combate, gravação e ausência de regressão de nível.
const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:selector=>selector==='#app'?app:null};
globalThis.window={addEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
const {rt}=await import('../js/runtime.js');
const {newGame,stats}=await import('../js/player.js');
const {combat,endCombat}=await import('../js/combat.js');
const {load}=await import('../js/storage.js');
for(const cls of Object.keys(classes)){
 newGame('Penalidade '+cls,cls);
 assert.deepEqual(rt.state.stats,classes[cls].stats,`Atributos iniciais de ${cls}`);
 const level=12, xp=250, gold=100;
 rt.state.lv=level;rt.state.xp=xp;rt.state.points=9;rt.state.gold=gold;
 rt.state.hp=stats().maxhp;
 combat();
 endCombat(false);
 assert.equal(rt.state.lv,level,'Derrota não reduz nível');
 assert.equal(rt.state.points,9,'Derrota não retira pontos de atributo');
 assert.equal(rt.state.xp,200,'Perda de 20% do XP do nível atual');
 assert.equal(rt.state.gold,90,'Regra preexistente de perda de 10% do ouro');
 assert.ok(rt.log.some(x=>x.includes('-50 EXP')),'Mensagem de penalidade');
 assert.equal(rt.state.combat,null);
 assert.equal(load(),true,'Carregamento após derrota');
 assert.equal(rt.state.lv,level);assert.equal(rt.state.xp,200);
 assert.deepEqual(rt.state.stats,classes[cls].stats);
}
console.log('OK: derrotas integradas nas quatro classes, penalidade única, ouro original e XP persistido.');

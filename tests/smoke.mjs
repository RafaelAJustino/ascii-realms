import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');const {newGame,stats}=await import('../js/player.js');const {load}=await import('../js/storage.js');const {combat,act}=await import('../js/combat.js');const {render}=await import('../js/ui.js');
newGame('Teste','guerreiro');assert.equal(rt.state.lv,1);assert.equal(rt.state.gold,100);assert.equal(rt.screen,'world');
combat();assert.equal(rt.screen,'combat');assert.ok(rt.state.combat.enemy.hp>0);assert.ok(app.innerHTML.includes('HISTÓRICO DE COMBATE'));
const turn=act('attack');assert.equal(rt.busy,true);await turn;assert.equal(rt.busy,false);assert.ok(rt.log.length>1);
const saved=localStorage.getItem('ascii-realms-save-v1');assert.ok(saved);rt.state=null;assert.equal(load(),true);assert.equal(rt.state.name,'Teste');assert.equal(rt.state.combat,null);render();
console.log('OK: criação, combate assíncrono, renderização, salvamento e carregamento.');
const {changeArea,explore}=await import('../js/exploration.js');const {buyItem,buyPotion,sell}=await import('../js/shops.js');
rt.state.gold=10000;buyItem('weapon',3);assert.equal(rt.state.items.length,1);const uid=rt.state.items[0].uid;assert.ok(rt.state.gold<10000);sell(uid);assert.equal(rt.state.items.length,0);buyPotion('hp');assert.ok(rt.state.consumables.hp>=4);
changeArea(2);assert.equal(rt.area,1);rt.state.lv=2;rt.state.explorationChallenge.defeatedMiniBosses[1]=true;changeArea(2);assert.equal(rt.area,2);assert.equal(rt.state.area,2);
assert.ok(app.innerHTML.includes('Explorar'));console.log('OK: lojas, inventário, compra/venda e bloqueio de áreas.');

// Regressão: derrotar monstro deve encerrar combate e conceder recompensas uma única vez.
rt.state.lv=1;rt.state.xp=0;rt.state.gold=100;rt.state.items=[];rt.area=1;
combat();rt.state.combat.enemy.hp=1;rt.state.combat.enemy.def=0;
const originalRandom=Math.random;Math.random=()=>0;
try {await act('attack');} finally {Math.random=originalRandom;}
assert.equal(rt.state.combat,null);assert.equal(rt.screen,'result');
assert.ok(rt.state.gold>100);assert.ok(rt.log.some(x=>(typeof x==='string'?x:x.text).includes('Vitória!')));
const goldAfterVictory=rt.state.gold;await act('attack');assert.equal(rt.state.gold,goldAfterVictory);
console.log('OK: vitória encerra combate e não duplica recompensas.');
// Regressão: bônus de equipamento não deve quebrar a tela de atributos.
const {character}=await import('../js/ui.js');rt.state.items.push({uid:'test-bonus',slot:'ring',attrs:{for:2}});rt.state.equip.ring='test-bonus';assert.ok(character().includes('+2'));
console.log('OK: tela de atributos com bônus de equipamento.');

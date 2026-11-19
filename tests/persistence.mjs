import assert from 'node:assert/strict';
const store=new Map();let fail=false;
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem(k,v){if(fail)throw Error('quota');store.set(k,v)},removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame,gainXp}=await import('../js/player.js');
const {load,save,BACKUP_KEY,MIGRATION_BACKUP_KEY}=await import('../js/storage.js');
const {KEY}=await import('../js/data.js');
const {equip}=await import('../js/equipment.js');
const {perform}=await import('../js/operations.js');
newGame('Migrar','guerreiro');assert.equal(rt.state.version,11);
rt.state.gold=1234;rt.state.lv=10;rt.state.xp=72;rt.state.points=3;rt.state.bosses=[0];rt.state.materials={'Madeira Antiga':4};rt.state.items=[{uid:'w1',slot:'weapon',lv:3,cls:'guerreiro',attrs:{for:2},price:10}];
rt.state.equip.weapon='w1';save();
const old=JSON.parse(store.get(KEY));old.version=1;delete old.quests;delete old.bestiary;delete old.statistics;delete old.dungeons;delete old.specializations;delete old.enhancements;
store.set(KEY,JSON.stringify(old));rt.state=null;assert.equal(load(),true);assert.equal(rt.state.version,11);assert.equal(rt.state.gold,1234);assert.equal(rt.state.lv,10);assert.equal(rt.state.xp,72);assert.deepEqual(rt.state.bosses,[0]);assert.equal(rt.state.equip.weapon,'w1');assert.equal(rt.state.materials['Madeira Antiga'],4);assert.ok(rt.state.quests&&rt.state.bestiary&&rt.state.dungeons);assert.equal(JSON.parse(store.get(MIGRATION_BACKUP_KEY)).version,1);
// Uma falha durante migração não publica estado parcialmente atualizado.
store.set(KEY,JSON.stringify(old));rt.state=null;fail=true;assert.equal(load(),false);assert.equal(rt.state,null);assert.equal(JSON.parse(store.get(KEY)).version,1);fail=false;assert.equal(load(),true);
// Salvamento principal corrompido é restaurado a partir de cópia válida.
store.set(KEY,'{corrompido');rt.state=null;assert.equal(load(),true);assert.equal(rt.state.gold,1234);
// Estado persistido de combate nunca é retomado em situação inconsistente.
rt.state.combat={enemy:{hp:0}};save();rt.state=null;assert.equal(load(),true);assert.equal(rt.state.combat,null);
// Atributos e equipamento podem ser modificados após migração.
rt.state.equip.weapon=null;equip('w1');assert.equal(rt.state.equip.weapon,'w1');
rt.state.equip.weapon=null;save();assert.equal(rt.state.equip.weapon,null);
const oldLevel=rt.state.lv;gainXp(100000);assert.ok(rt.state.lv>oldLevel);
let executions=0;assert.equal(perform(()=>{executions++;assert.equal(perform(()=>executions++),false)}),true);assert.equal(executions,1);
console.log('OK: v9, migração v1, backup, recuperação, falha de escrita, combate seguro, equipamentos, nível e proteção de reentrada.');

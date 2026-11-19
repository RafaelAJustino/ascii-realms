import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null,createElement:()=>({style:{},getBoundingClientRect:()=>({width:600}),remove(){}})};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');const {newGame,stats}=await import('../js/player.js');const {makeItem,equip,validEquip}=await import('../js/equipment.js');const {recipes,craft,enhance,upgradeCost,FORGE_MATERIALS,SETS,UPGRADE_BONUS,setBonuses}=await import('../js/crafting.js');const {save,load}=await import('../js/storage.js');
newGame('Ferreiro','guerreiro');rt.state.lv=100;rt.state.gold=1000000;
for(let i=0;i<10;i++){assert.equal(recipes(i).length,9);rt.state.materials[FORGE_MATERIALS[i]]=500;}
rt.state.materials['Madeira Antiga']=500;
const recipe=recipes(0)[0],before=rt.state.gold;
assert.equal(craft(recipe.id),true);assert.equal(rt.state.gold,before-recipe.gold);assert.equal(rt.state.items.length,1);assert.equal(rt.state.materials[FORGE_MATERIALS[0]],500-recipe.materials[FORGE_MATERIALS[0]]);
const first=rt.state.items[0];assert.equal(first.upgrade,undefined);assert.equal(enhance(first.uid,()=>0),true);assert.equal(first.upgrade,1);
const failed=upgradeCost(first);const gold=rt.state.gold;assert.equal(enhance(first.uid,()=>0),true); // +2 guaranteed
assert.equal(first.upgrade,2);assert.equal(rt.state.gold,gold-failed.gold);
assert.equal(enhance(first.uid,()=>1),false);assert.equal(first.upgrade,2); // +3 can fail
for(let i=3;i<=10;i++)assert.equal(enhance(first.uid,()=>0),true);
assert.equal(first.upgrade,10);assert.equal(upgradeCost(first),null);assert.equal(enhance(first.uid,()=>0),false);
assert.equal(new Set(rt.state.items.map(x=>x.uid)).size,rt.state.items.length);
const base=stats().atk;equip(first.uid);const enhanced=stats().atk;assert.ok(enhanced>base);rt.state.equip.weapon=null;assert.equal(stats().atk,base);
const slots=['head','body','hands','feet','weapon'];for(const slot of slots){const item=makeItem(3,slot,'guerreiro',2,0);item.setId=SETS[0].id;rt.state.items.push(item);equip(item.uid);}
const full=stats();assert.equal(setBonuses(Object.values(rt.state.equip).map(uid=>rt.state.items.find(x=>x.uid===uid)).filter(Boolean)).active[0].n,5);
rt.state.equip.feet=null;assert.ok(stats().regen<full.regen);assert.ok(stats().def<=full.def);
assert.equal(validEquip(makeItem(100,'weapon','mago')),false);
const oldGold=rt.state.gold;const bad=recipes(9)[0];assert.equal(craft(bad.id),false);assert.equal(rt.state.gold,oldGold);
save();rt.state=null;assert.equal(load(),true);assert.equal(rt.state.version,11);assert.equal(rt.state.items.find(x=>x.uid===first.uid).upgrade,10);assert.ok(rt.state.items.some(x=>x.setId===SETS[0].id));
console.log('OK: 90 receitas, recursos, IDs, +10, falhas, bônus cumulativos, restrições, salvamento v4.');

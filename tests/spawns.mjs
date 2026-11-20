import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {enemy}=await import('../js/monsters.js');
const {combat,endCombat}=await import('../js/combat.js');
const {artworks}=await import('../js/artworks.js');
const {EXTENDED_ARTWORKS,regionSpecies}=await import('../js/expanded-species.js');
const {render}=await import('../js/ui.js');
const {save,load}=await import('../js/storage.js');
newGame('Teste','guerreiro');
for(let region=0;region<10;region++){
 let last=null;const seen=new Set();
 for(let n=0;n<40;n++){
  const e=enemy(region*10+1);
  assert.notEqual(e.speciesId,last,'espécie repetida em sequência');
  assert.ok(artworks[e.baseName]||EXTENDED_ARTWORKS[e.baseName],`arte ausente: ${e.baseName}`);
  seen.add(e.speciesIndex);last=e.speciesId;
 }
 assert.ok(seen.size>=3,'os três grupos originais de drops devem aparecer');
 assert.equal(regionSpecies(region).length,15);
 const boss=enemy((region+1)*10,true);
 assert.ok(artworks[boss.baseName],`arte do chefe ausente: ${boss.baseName}`);
}
rt.area=1;combat();
assert.ok(app.innerHTML.includes('ascii-art'));
const species=rt.state.combat.enemy.speciesId;
rt.state.combat=null;combat();
assert.notEqual(rt.state.combat.enemy.speciesId,species);
rt.state.combat=null;save();assert.equal(load(),true);
assert.ok(rt.state.lastEncounterSpecies);
console.log('OK: variedade, ausência de repetição consecutiva, artes individuais e persistência.');

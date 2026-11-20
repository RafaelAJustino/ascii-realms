import assert from 'node:assert/strict';
const store = new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:k=>k==='#app'?app:null};
globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {enemy}=await import('../js/monsters.js');
const {rewardFor}=await import('../js/loot.js');
const {recordEncounter,recordOutcome}=await import('../js/progression.js');
const {bestiaryUI}=await import('../js/progression-ui.js');
const {save,load}=await import('../js/storage.js');
const {regionSpecies}=await import('../js/expanded-species.js');
newGame('Expansao','guerreiro');
for(let region=0;region<10;region++){
 for(const original of regionSpecies(region).slice(3)){
  let e;
  // Exercise full generator, including special creatures, with controlled random.
  const before=Math.random;try{
   let count=0;Math.random=()=>count++%2===0?.01:original.kind==='special'?.01:.95;
   e=enemy(region*10+1);
  }finally{Math.random=before;}
  assert.ok(regionSpecies(region).some(s=>s.name===e.baseName));
  const drops=rewardFor(e,'guerreiro',false,()=>0);
  assert.ok(Object.keys(drops.materials).every(k=>!!k&&k!=='undefined'));
  assert.ok(drops.items.every(x=>x.lv<=e.lv));
 }
}
const newSpecies=regionSpecies(0)[5];
recordEncounter({baseName:newSpecies.name});recordOutcome({baseName:newSpecies.name},true);
assert.ok(bestiaryUI().includes(newSpecies.name));
save();assert.equal(load(),true);assert.equal(rt.state.bestiary[newSpecies.name].wins,1);
assert.ok(!('companions' in rt.state));
console.log('OK: geracao regional, drops validos, bestiario, salvamento e ausencia de companheiros.');

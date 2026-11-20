import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame,gainXp,stats}=await import('../js/player.js');
const {load,save}=await import('../js/storage.js');
const {xpNeed}=await import('../js/utils.js');
const {creatureFrames,animationFrame,combatAnimationClass,syncCreatureAnimation}=await import('../js/ascii-animation.js');
const {enemy}=await import('../js/monsters.js');
const {maps}=await import('../js/data.js');
const art='  /\\  \n (oo) \n /||\\ ';
const frames=creatureFrames(art);assert.equal(frames.length,4);
assert.ok(frames.every(f=>f.split('\n').length===3));
assert.ok(frames.every(f=>f.split('\n').every(line=>line.length===frames[0].split('\n')[0].length)));
assert.equal(animationFrame(frames,0),frames[0]);assert.equal(animationFrame(frames,240),frames[1]);
assert.equal(combatAnimationClass('enemy-hit'),'creature-hurt');
syncCreatureAnimation(app,false);
const report=[];
for(const cls of ['guerreiro','mago','arqueiro','ladino']){
 newGame('Teste '+cls,cls);
 for(const level of [1,10,25,50,75,100]){
  while(rt.state.lv<level)gainXp(xpNeed(rt.state.lv));
  const s=stats();assert.equal(rt.state.lv,level);
  for(const key of ['maxhp','maxmp','atk','mag','def','md','hit','dodge','crit'])assert.ok(Number.isFinite(s[key])&&s[key]>=0,`${cls} ${level} ${key}`);
  assert.ok(s.maxhp>0&&s.maxmp>0);
  const e=enemy(level,false);
  assert.ok(e.hp>0&&e.atk>0);
  const hit=s.atk*.84+s.mag*.16;
  const avgDamage=Math.max(1,hit-e.def*.65)*s.hit/100*(1+s.crit/100*(s.critD-1));
  const turns=e.hp/Math.max(1,avgDamage);
  const received=Math.max(1,e.atk-s.def*.55)*(1-s.dodge/100);
  const survival=s.maxhp/received;
  report.push({cls,level,avgDamage:Math.round(avgDamage),turns:Math.round(turns),survival:Math.round(survival),maxmp:s.maxmp});
  save();rt.state=null;assert.equal(load(),true);assert.equal(rt.state.lv,level);
 }
}
assert.equal(maps.length,10);assert.equal(report.length,24);
console.log('OK: animações ASCII, 4 classes × 6 níveis, atributos finitos, estimativas de dano/sobrevivência, EXP 1-100 e persistência.');
console.log('Estimativas estáticas (sem equipamentos, IA ou uso de habilidades):');
console.log(JSON.stringify(report));

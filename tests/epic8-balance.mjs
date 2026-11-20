import assert from 'node:assert/strict';
import {BALANCE,healthScale,monsterHealth,monsterAttack,incomingDamage,effectiveProtection,worldDanger} from '../js/final-balance.js';
import {classes} from '../js/data.js';
import {catalogInRegion,createCatalogItem} from '../js/equipment-catalog.js';

const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,v)=>store.set(key,v),removeItem:key=>store.delete(key)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:q=>q==='#app'?app:null};
globalThis.window={addEventListener(){}};
globalThis.requestAnimationFrame=f=>f();
const {newGame,stats}=await import('../js/player.js');
const {enemy}=await import('../js/monsters.js');
const {rt}=await import('../js/runtime.js');
const {save,load}=await import('../js/storage.js');

assert.equal(healthScale(1),1);
assert.equal(healthScale(20),1);
assert.equal(healthScale(100),1.8);
assert.equal(healthScale(100,true),1.4);
assert.ok(monsterHealth(90,false)>monsterHealth(80,false));
assert.ok(monsterHealth(100,true)>monsterHealth(100,false));
assert.ok(monsterAttack(100,true)>monsterAttack(100,false));
for(const raw of [8,25,100,400,1000]){
 const values=[0,raw*.5,raw,raw*5,raw*100].map(def=>incomingDamage(raw,def));
 for(let i=1;i<values.length;i++)assert.ok(values[i]<=values[i-1],'Defesa nunca aumenta dano');
 assert.ok(values.at(-1)>=Math.floor(raw*(1-BALANCE.defenseMitigationLimit)),'defesa não gera imunidade');
 assert.ok(values[0]===raw,'ataque sem defesa não é alterado');
}
assert.equal(effectiveProtection(100,[{type:'defdown',duration:2,power:.25}]),75);
assert.equal(effectiveProtection(100,[{type:'defdown',duration:0,power:.25}]),100);
assert.equal(effectiveProtection(100,[{type:'stun',duration:2,power:.25}]),100);
assert.equal(worldDanger(10,11,100,100).label,'ALTO');
assert.equal(worldDanger(10,10,40,100).label,'MODERADO');
assert.equal(worldDanger(15,15,100,100).label,'CONTROLADO');

const sampleLevels=[1,10,25,50,75,100],audit=[];
for(const cls of Object.keys(classes))for(const level of sampleLevels){
 newGame('Teste de equilíbrio',cls);
 rt.area=level;rt.state.lv=level;
 const main={guerreiro:0,mago:1,arqueiro:3,ladino:2}[cls];
 const spent=level-1;
 rt.state.stats[main]+=Math.floor(spent*3*.55);
 rt.state.stats[4]+=Math.floor(spent*3*.25);
 rt.state.stats[main===3?5:3]+=Math.floor(spent*3*.20);
 const region=Math.floor((level-1)/10);
 const models=catalogInRegion(region,null,cls);
 for(const slot of ['weapon','head','body','hands','feet','ring','amulet']){
  const model=models.filter(m=>m.slot===slot&&m.level<=level).sort((a,b)=>b.level-a.level)[0];
  if(model){const item=createCatalogItem(model,1);rt.state.items.push(item);rt.state.equip[slot]=item.uid;}
 }
 const s=stats(),e=enemy(level,false),boss=enemy(level,true);
 assert.ok(s.maxhp>0&&s.atk>0&&s.mag>0);
 assert.ok(e.maxhp>0&&e.atk>0&&boss.maxhp>e.maxhp);
 const base=cls==='mago'?s.mag:s.atk;
 const dealt=Math.max(1,base-e.def*.65)*s.hit/100*(1+s.crit/100*(s.critD-1));
 const incoming=incomingDamage(e.atk,s.def);
 const ttk=e.maxhp/dealt,survival=s.maxhp/incoming;
 assert.ok(Number.isFinite(ttk)&&ttk>0&&ttk<100,`${cls} nível ${level}: duração estimada de combate`);
 assert.ok(survival>1&&survival<1000,`${cls} nível ${level}: sobrevivência positiva`);
 audit.push({cls,level,ttk:Math.round(ttk*10)/10,survival:Math.round(survival*10)/10});
 save();rt.state=null;assert.equal(load(),true);
 assert.equal(rt.state.lv,level);assert.equal(rt.state.stats[main],classes[cls].stats[main]+Math.floor(spent*3*.55));
}
assert.equal(audit.length,24);
console.log('OK: função de defesa sem invulnerabilidade, HP progressivo, chefes reforçados, 4 classes x 6 níveis com equipamentos, risco regional e persistência v14.');
console.log('Estimativas para ataques básicos e modelos de equipamento, não equivalem a simulações completas:',JSON.stringify(audit));

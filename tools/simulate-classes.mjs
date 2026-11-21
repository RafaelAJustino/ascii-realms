/** Reproducible expected-value simulation of neutral single-target combat.
 * Uses real class attributes, equipment bonuses, cooldowns and defense formulas.
 * Assumptions documented below; not a substitute for interactive Monte Carlo playtests.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []},addEventListener(){}};
globalThis.document={querySelector:q=>q==='#app'?app:null};
globalThis.window={addEventListener(){},innerHeight:900};globalThis.requestAnimationFrame=f=>f();
const [{rt},{newGame,stats},{classes,active},{PLAYER_COOLDOWNS},{EQUIPMENT_CATALOG,createCatalogItem},{monsterAttack,monsterHealth,incomingDamage}]=await Promise.all([
 import('../js/runtime.js'),import('../js/player.js'),import('../js/data.js'),import('../js/turn-cooldowns.js'),import('../js/equipment-catalog.js'),import('../js/final-balance.js')
]);
const levels=[1,10,25,50,75,100],classIds=['guerreiro','mago','arqueiro','ladino'],builds=['equilibrada','especializada','híbrida'],armors=['leve','média','pesada'];
const prime={guerreiro:0,mago:1,arqueiro:3,ladino:2};
function distribute(cls,lv,build){const total=(lv-1)*3,weights=build==='equilibrada'?Array(6).fill(1/6):build==='especializada'?Array(6).fill(.02):Array(6).fill(.03);if(build==='especializada'){weights[prime[cls]]=.64;weights[4]=.25;weights[3]=.07;}else if(build==='híbrida'){weights[prime[cls]]=.43;weights[4]=.28;weights[2]=.2;weights[3]+=.03;}
 const sum=weights.reduce((a,b)=>a+b,0),invested=weights.map(w=>Math.floor(total*w/sum));for(let i=0;invested.reduce((a,b)=>a+b,0)<total;i++)invested[(i*2+1)%6]++;return invested;
}
function fitItems(cls,lv,armor){const maxRegion=Math.floor((lv-1)/10),arm=armor==='leve'?1:armor==='média'?2:3;
 const allowed=EQUIPMENT_CATALOG.filter(m=>m.region<=maxRegion&&m.level<=lv);
 const slotNames=armor==='leve'?['weapon','body','head','feet']:armor==='média'?['weapon','body','hands','feet']:['weapon','body','head','hands','feet'];
 const items=slotNames.map(slot=>{let candidates=allowed.filter(m=>m.slot===slot&&(slot!=='weapon'||m.cls===cls));
 if(slot==='body')candidates=candidates.filter(m=>m.armor===arm);
 if(slot==='head'&&armor==='leve')candidates=candidates.filter(m=>m.armor===1);
 if(slot==='head'&&armor==='pesada')candidates=candidates.filter(m=>m.armor===3);
 if(slot==='hands'&&armor==='média')candidates=candidates.filter(m=>m.armor===2);
 if(slot==='hands'&&armor==='pesada')candidates=candidates.filter(m=>m.armor===3);
 if(slot==='feet'&&armor==='leve')candidates=candidates.filter(m=>m.armor===1);
 if(slot==='feet'&&armor!=='leve')candidates=candidates.filter(m=>m.armor===2);
 candidates.sort((a,b)=>b.level-a.level||b.region-a.region);
 const model=candidates[0];return model?createCatalogItem(model,lv>=75?2:lv>=40?1:0,model.level):null;}).filter(Boolean);
 return items;
}
function makeState(cls,lv,build,armor){newGame('Simulação',cls);const invest=distribute(cls,lv,build);rt.state.lv=lv;rt.state.stats=classes[cls].stats.map((v,i)=>v+invest[i]);rt.state.investedStats=invest;rt.state.points=0;
 const items=fitItems(cls,lv,armor);rt.state.items=items;rt.state.equip={weapon:null,head:null,body:null,hands:null,feet:null,ring:null,amulet:null};for(const item of items)rt.state.equip[item.slot]=item.uid;
 rt.state.hp=stats().maxhp;rt.state.mp=stats().maxmp;return {stats:stats(),invest,items};
}
function fight(s,cls,lv,boss=false){const hp=monsterHealth(lv,boss),atk=monsterAttack(lv,boss),def=Math.floor(lv*.85*(boss?1.2:1));
 const magic=cls==='mago';let mp=s.maxmp,energy=0,turn=0,total=0,totalMp=0,burst=0,cd=[0,0,0,0],guard=0;
 while(turn<36){let idx=-1;
  // Deterministic priority schedule. 1 class-resource per basic/normal action, special costs 3.
  for(const k of [3,1,0,2]){if(lv<active[cls][k][1]||cd[k]>0||mp<active[cls][k][2]||(k===3&&energy<3))continue;
   if(k===2&&['guard','evade'].includes(active[cls][k][4])&&guard>0)continue;
   if(k===2&&active[cls][k][4]==='mark'&&turn%3!==0)continue;
   idx=k;break;}
  let mult=1,element='physical',type='damage';if(idx>=0){const row=active[cls][idx];mult=row[3];type=row[4];mp-=row[2];totalMp+=row[2];if(idx===3)energy-=3;else energy=Math.min(5,energy+(idx===2&&type==='guard'?2:1));}
  else energy=Math.min(5,energy+1);
  const bypass=type==='pierce'?.55:type==='impact'?.3:0;
  const base=magic?s.mag:s.atk;let expected=incomingDamage(base*mult*(1+(s.crit/100)*(s.critD-1)),def*(1-bypass))*s.hit/100;
  if(['guard','evade'].includes(type)){expected=0;guard=2;}if(type==='double')expected*=2;
  if(type==='execute'&&turn>=3)expected*=1.12;
  if(type==='storm'||type==='burn'||type==='freeze')expected*=1+s.elementalBonus;
  if(type==='mark')expected+=base*.08;
  if(type==='poison'||type==='burn')expected+=hp*.012;
  expected=Math.max(0,expected);total+=expected;burst=Math.max(burst,expected);
  for(let k=0;k<4;k++)cd[k]=Math.max(0,cd[k]-1);if(idx>=0)cd[idx]=PLAYER_COOLDOWNS[cls][idx];
  mp=Math.min(s.maxmp,mp+s.regen);turn++;if(guard>0)guard--;
 }
 const dpt=total/turn,ttk=hp/Math.max(1,dpt),incoming=incomingDamage(atk,s.def)*(1-s.dodge/100)*(1-s.damageReduction),survive=s.maxhp/Math.max(1,incoming),bossTtk=monsterHealth(lv,true)/Math.max(1,dpt*0.96);
 return {dpt:+dpt.toFixed(1),burst:+burst.toFixed(1),ttk:+ttk.toFixed(1),survival:+survive.toFixed(1),bossTtk:+bossTtk.toFixed(1),mpPerTurn:+(totalMp/turn).toFixed(1),hp:s.maxhp,mp:s.maxmp,hit:+s.hit.toFixed(1),dodge:+s.dodge.toFixed(1),crit:+s.crit.toFixed(1)};
}
const rows=[];for(const cls of classIds)for(const level of levels)for(const build of builds)for(const armor of armors){const {stats,invest,items}=makeState(cls,level,build,armor);rows.push({classe:cls,nível:level,build,armadura:armor,peças:items.length,...fight(stats,cls,level),pontos:invest.join('/')});}
const cols=Object.keys(rows[0]);const csv=[cols.join(','),...rows.map(x=>cols.map(k=>JSON.stringify(x[k]??'')).join(','))].join('\n');
const out=new URL('../docs/',import.meta.url);mkdirSync(out,{recursive:true});writeFileSync(new URL('balanco-216-cenarios.csv',out),csv+'\n');
const summaries=classIds.flatMap(cls=>levels.map(level=>{const some=rows.filter(r=>r.classe===cls&&r.nível===level),average=k=>+(some.reduce((sum,x)=>sum+x[k],0)/some.length).toFixed(1);return {classe:cls,nível:level,DPTo:average('dpt'),turnos:average('ttk'),sobrevivência:average('survival'),chefe:average('bossTtk'),MPturno:average('mpPerTurn')};}));
writeFileSync(new URL('balanceamento-resumo.json',out),JSON.stringify({method:'Deterministic expected-value, 36-turn rotation, neutral affinities, existing weapon and armor catalog, 3 builds and 3 armor tiers, not interactive Monte Carlo',caseCount:rows.length,summaries},null,2));
console.log('Cenários:',rows.length);console.table(summaries);

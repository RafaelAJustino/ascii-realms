import {dungeonCombatEnd} from './dungeons.js';
import {specSkills,selectedSpec} from './specializations.js';
import { progressQuest, recordEncounter, recordOutcome, statAdd } from './progression.js';
import { BOSS_PHASES, updateBossPhase, bossSpecialAvailable, announceBossAttack, resolveBossAttack } from './boss-phases.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { stats, gainXp } from './player.js';
import { save } from './storage.js';
import { makeItem, rollRarity, rarityName } from './equipment.js';
import { enemy } from './monsters.js';
import { render } from './ui.js';
import { rewardFor } from './loot.js';
import { PLAYER_SKILL_ELEMENTS,applyElementalDamage,elementalMessage,elementMultiplier } from './elements.js';
import { chooseMonsterAction,finishMonsterAction } from './monster-ai.js';
import { monsterRarity } from './monster-rarity.js';
export function combat(boss=false){if(rt.state.combat)return;let lv=boss?rt.area:Math.min(100,rt.area+rand(0,1));rt.state.combat={enemy:enemy(lv,boss),effects:[],turn:0,guard:0};recordEncounter(rt.state.combat.enemy);rt.log=[`Um ${rt.state.combat.enemy.name} apareceu!`];rt.sub='main';rt.screen='combat';save();render();}

export function effectsTick(target,effects){for(let ef of [...effects]){if(ef.type==='poison'||ef.type==='burn'||ef.type==='bleed'){let dmg=Math.max(1,Math.floor(target.maxhp*ef.power));target.hp=Math.max(0,target.hp-dmg);rt.log.unshift(`${ef.name}: ${dmg} de dano.`);}if(ef.type==='regen')target.hp=Math.min(target.maxhp,target.hp+Math.ceil(target.maxhp*ef.power));ef.duration--;if(ef.duration<=0)effects.splice(effects.indexOf(ef),1);}}

export function endCombat(win){let e=rt.state.combat.enemy;const inDungeon=!!rt.state.combat.dungeonRoom;recordOutcome(e,win);if(win){progressQuest('kill',e.baseName);if(e.boss)progressQuest('boss',e.baseName);if(rt.state.statistics)rt.state.statistics.monstersDefeated++;let s=stats(),exp=Math.floor((12+e.lv*9)*(e.boss?8:1)*clamp(1+(e.lv-rt.state.lv)*.15,.15,1.5)*(1+s.expBonus/100)),gold=Math.floor((8+e.lv*4)*(e.boss?7:1)*(e.boss?1:monsterRarity(e.rarityId).reward));exp=Math.floor(exp*(e.boss?1:monsterRarity(e.rarityId).reward));rt.state.gold+=gold;statAdd('goldEarned',gold);rt.log.unshift(`Vitória! +${exp} EXP, +${gold} ouro.`);gainXp(exp);const firstBoss=e.boss&&!rt.state.bosses.includes(mapId(rt.area));
const reward=rewardFor(e,rt.state.cls,firstBoss);
for(const [name,count] of Object.entries(reward.materials)){rt.state.materials[name]=(rt.state.materials[name]||0)+count;statAdd('itemsFound',count);rt.log.unshift(`Material obtido: ${name} ×${count}.`);}
for(const [name,count] of Object.entries(reward.consumables)){rt.state.consumables[name]=(rt.state.consumables[name]||0)+count;statAdd('itemsFound',count);rt.log.unshift(`Consumível obtido: ${name} ×${count}.`);}
for(const it of reward.items){rt.state.items.push(it);statAdd('itemsFound');rt.log.unshift(`Item obtido: ${it.name} (${rarityName(it.rarity)}).`);}
if(e.boss&&!rt.state.bosses.includes(mapId(rt.area))){rt.state.bosses.push(mapId(rt.area));if(rt.state.statistics)rt.state.statistics.bossesDefeated++;rt.log.unshift('Chefe derrotado! Próximo mapa liberado.');}}else{if(rt.state.statistics)rt.state.statistics.deaths++;let lost=Math.floor(rt.state.gold*.1);rt.state.gold-=lost;let s=stats();rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;rt.log.unshift(`Derrota. Você perdeu ${lost} ouro e retornou à cidade.`);}if(inDungeon)dungeonCombatEnd(win);rt.state.combat=null;rt.sub='main';rt.screen='result';save();render();}

export function hitEnemy(mult=1,type='damage',element='physical'){let c=rt.state.combat,e=c.enemy,s=stats(),mag=rt.state.cls==='mago',base=(mag?s.mag:s.atk)*mult,hit=Math.random()*100<s.hit;if(!hit){rt.log.unshift('Seu ataque errou!');return;}let critical=Math.random()*100<s.crit,damage=Math.max(1,Math.floor(base*(critical?s.critD:1)*(e.boss?1+s.bossBonus/100:1)-e.def*.65));if(type==='pierce')damage+=e.def;damage=applyElementalDamage(damage,e,element);if(element!=='physical')damage=Math.floor(damage*(1+(s.elementalBonus||0)));if(type==='execute'&&e.hp/e.maxhp<.35)damage=Math.floor(damage*1.6);if(e.guardTurns>0)damage=Math.ceil(damage*.65);e.hp=Math.max(0,e.hp-damage);rt.impactMeta={critical,element};statAdd('damageDealt',damage);rt.state.statistics.highestDamage=Math.max(rt.state.statistics.highestDamage||0,damage);if(e.boss&&e.hp>0)updateBossPhase(e,message=>rt.log.unshift(message));const feedback=elementalMessage(e,element);if(feedback)rt.log.unshift(feedback);rt.log.unshift(`Você causou ${damage} de dano${critical?' CRÍTICO!':''}.`);if(damage>0&&(type==='poison'||type==='burn'))e.effects.push({type,name:type==='poison'?'Veneno':'Queimadura',power:.035,duration:3+(s.statusDuration||0)});if(s.extraAttack&&damage>0&&e.hp>0&&Math.random()<s.extraAttack){const extra=Math.max(1,Math.floor(damage*.28));e.hp=Math.max(0,e.hp-extra);statAdd('damageDealt',extra);rt.log.unshift(`Ataque adicional: ${extra} de dano!`);}if(s.leech){let heal=Math.ceil(damage*s.leech/100);rt.state.hp=Math.min(s.maxhp,rt.state.hp+heal);}}

export function enemyTurn(){
 const c=rt.state.combat;if(!c)return;
 const e=c.enemy,s=stats();effectsTick(e,e.effects);
 if(e.hp<=0)return endCombat(true);
 const stunned=c.effects.some(x=>x.type==='stun');
 if(stunned){rt.log.unshift(`${e.name} está atordoado.`);c.effects=c.effects.filter(x=>x.type!=='stun');return;}
 if(e.boss){
  // O ataque anunciado sempre se resolve no turno seguinte, sem novo sorteio.
  if(e.telegraph){
   const combatPlayer={hp:rt.state.hp,elementalAffinities:rt.state.elementalAffinities||{},combatEffects:c.effects};
   resolveBossAttack(e,combatPlayer,s,c.guard,message=>rt.log.unshift(message));
   rt.state.hp=combatPlayer.hp;
   return;
  }
  if(e.bossSpecialCooldown>0)e.bossSpecialCooldown--;
  if(bossSpecialAvailable(e)&&((e.bossPhase===3)||Math.random()<.65)){
   announceBossAttack(e,message=>rt.log.unshift(message));
   return;
  }
 }
 // Decisão baseada em recursos, arquétipo, vida, recargas e afinidades.
 const action=chooseMonsterAction(e,{hp:rt.state.hp,maxhp:s.maxhp,effects:c.effects,affinities:rt.state.elementalAffinities||{}},{playerStats:s});
 finishMonsterAction(e,action);
 if(e.dungeonBoss&&c.turn%3===2&&action.kind!=='heal'&&action.kind!=='guard'){action.kind='damage';action.power=Math.max(action.power,1.45);action.element=e.attackElement;action.id='dungeon-special';action.name=e.dungeonSpecial||'Poder Ancestral';}if(action.id!=='strike')rt.log.unshift(`${e.name} utilizou ${action.name} (${e.archetype})!`);
 if(action.kind==='heal'){
  const heal=Math.min(e.maxhp-e.hp,Math.ceil(e.maxhp*.18));e.hp+=heal;rt.log.unshift(`${e.name} recuperou ${heal} HP.`);
 }else if(action.kind==='guard'){
  e.guardTurns=2;rt.log.unshift(`${e.name} reforçou sua proteção.`);
 }else{
  if(Math.random()*100<s.dodge){rt.log.unshift(`Você esquivou do ataque de ${e.name}!`);}
  else{
   const defense=action.element==='physical'?s.def:s.md;
   let damage=Math.max(1,Math.floor(e.atk*action.power-defense*.55));
   damage=applyElementalDamage(damage,{affinities:rt.state.elementalAffinities||{}},action.element);
   if(c.guard>0)damage=Math.ceil(damage*.45);damage=Math.ceil(damage*(1-(s.damageReduction||0)));
   rt.state.hp=Math.max(0,rt.state.hp-damage);statAdd('damageTaken',damage);
   rt.log.unshift(`${e.name} ${action.id==='strike'?'atacou':'utilizou uma habilidade estratégica'}: -${damage} HP.`);
   if(damage===0)rt.log.unshift('O ataque não causou dano!');
   if(action.kind==='debuff'&&damage>0&&!c.effects.some(x=>x.type==='poison')){
    c.effects.push({type:'poison',name:'Veneno',power:.025,duration:3});rt.log.unshift('Você foi envenenado!');
   }
  }
 }
 if(e.guardTurns>0)e.guardTurns--;
 e.mp=Math.min(e.maxmp,e.mp+Math.max(1,Math.floor(e.lv*.08)));

}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function pushLog(message, kind='info') { rt.log.unshift({text:message, kind, id:Date.now()+Math.random()}); }
function normalizeLogs() { rt.log = rt.log.map(x=>typeof x==='string'?{text:x,kind:'info',id:Math.random()}:x); }
function syncCombatLog() { normalizeLogs(); rt.log=rt.log.slice(0,25); }
function damageSnapshot() { return {enemy:rt.state.combat?.enemy.hp, player:rt.state.hp}; }
function markImpact(before, side) {
 const after=damageSnapshot(), amount=side==='enemy'?before.enemy-after.enemy:before.player-after.player;
 rt.float={side, amount, critical:side==='enemy'&&!!rt.impactMeta?.critical, element:side==='enemy'?rt.impactMeta?.element:null, key:Date.now()};rt.impactMeta=null; rt.phase=side==='enemy'?'enemy-hit':'player-hit';render();
}
export async function act(kind,param) {
 if(rt.busy||!rt.state?.combat)return;
 const c=rt.state.combat,e=c.enemy,s=stats();
 if(kind==='skill'){let a=active[rt.state.cls][param];if(!a||rt.state.lv<a[1]||rt.state.mp<a[2])return;}
 if(kind==='spec'){const a=specSkills(rt.state)[param];if(!a||rt.state.mp<a.cost)return;}
 if(kind==='potion'&&(!rt.state.consumables[param]||rt.state.consumables[param]<1))return;
 if(kind==='flee'&&(e.boss||c.dungeonRoom))return;
 rt.busy=true;rt.phase='player-action';rt.float=null;rt.impactMeta=null;
 normalizeLogs();let before=damageSnapshot();
 try {
  if(kind==='attack'){pushLog('Você realizou um ataque básico.','action');hitEnemy();}
  else if(kind==='skill'){
   const a=active[rt.state.cls][param];rt.state.mp-=a[2];pushLog(`Você utilizou ${a[0]}!`,'action');
   if(a[4]==='guard'){c.guard=3;pushLog(`${a[0]} ativada: defesa reforçada por 3 turnos.`,'effect');}
   else hitEnemy(a[3],a[4],PLAYER_SKILL_ELEMENTS[rt.state.cls][param]);
  } else if(kind==='spec'){const a=specSkills(rt.state)[param];rt.state.mp-=a.cost;pushLog(`Você utilizou ${a.name}!`,'action');if(a.type==='guard'){c.guard=3;rt.state.hp=Math.min(s.maxhp,rt.state.hp+Math.ceil(s.maxhp*.12));}else hitEnemy(a.mult,a.type,a.element);
  } else if(kind==='potion'){
   const max=param==='mp'?s.maxmp:s.maxhp,heal=Math.ceil(max*.45);
   if(param==='hp')rt.state.hp=Math.min(s.maxhp,rt.state.hp+heal);
   else if(param==='mp')rt.state.mp=Math.min(s.maxmp,rt.state.mp+heal);
   else if(param==='elixir'){rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;}
   else c.effects=c.effects.filter(x=>x.type!=='poison');
   rt.state.consumables[param]--;pushLog(`Consumível ${param} utilizado.`,'heal');
  } else if(kind==='flee'){
   if(Math.random()<clamp(.5+(rt.state.lv-e.lv)*.07+s.agi*.006,.1,.9)){
    rt.state.combat=null;rt.sub='main';rt.screen='world';rt.log.unshift({text:'Você fugiu!',kind:'info',id:Math.random()});save();render();return;
   }pushLog('Falha ao fugir!','error');
  }
  syncCombatLog();rt.phase='player-action';render();await delay(220);
  if(!rt.state.combat)return;
  markImpact(before,'enemy');await delay(350);
  if(e.hp<=0){rt.phase='idle';return endCombat(true);}
  for(const ef of [...c.effects]){
   if(['poison','burn','bleed'].includes(ef.type)){
    const d=Math.max(1,Math.floor(s.maxhp*ef.power));rt.state.hp=Math.max(0,rt.state.hp-d);statAdd('damageTaken',d);pushLog(`${ef.name}: -${d} HP.`,'damage');
   }
   ef.duration--;if(ef.duration<=0)c.effects.splice(c.effects.indexOf(ef),1);
  }
  if(rt.state.hp<=0)return endCombat(false);
  rt.phase='enemy-preparing';rt.float=null;pushLog(`${e.name} está preparando sua ação...`,'action');syncCombatLog();render();
  await delay(950);
  if(!rt.state.combat)return;
  before=damageSnapshot();enemyTurn();syncCombatLog();markImpact(before,'player');
  await delay(350);
  if(rt.state.hp<=0)return endCombat(false);
  if(e.hp<=0)return endCombat(true);
  c.turn++;if(c.guard>0)c.guard--;rt.state.mp=Math.min(s.maxmp,rt.state.mp+s.regen);
  rt.phase='idle';rt.float=null;save();render();
 }finally{rt.busy=false;rt.phase='idle';if(rt.state?.combat)render();}
}

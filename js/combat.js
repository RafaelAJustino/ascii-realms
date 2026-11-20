import {progressDynamic} from './dynamic-quests.js';
import {incomingDamage,effectiveProtection} from './final-balance.js';
import {advanceAdventureCombat} from './procedural-adventures.js';
import { applyDeathXpPenalty } from './death-penalty.js';
import {resetCooldowns,finishCooldownTurn,canUse,playerCooldownDetails,specCooldownDetails,tickCooldowns} from './turn-cooldowns.js';
import {markGuardianVictory,recordSecret,SECRET_BOSS_REGIONS} from './secrets.js';
import {dungeonCombatEnd} from './dungeons.js';
import {recordWeaponVictory} from './weapon-evolution.js';
import {effectiveSkill} from './skill-variants.js';
import {combatTimings,visualPause} from './combat-speed.js';
import {playCombatAction,playCombatReaction,heroSkillElement,visualDuration,cancelCombatVisuals} from './combat-visuals.js';
import {resetCombatVisualState,invalidateCombatVisualState,currentVisualSession,impactResult} from './combat-visual-state.js';
import {stopCreatureAnimation} from './ascii-animation.js';
import {specSkills,selectedSpec} from './specializations.js';
import { progressQuest, recordEncounter, recordOutcome, statAdd, observeMonsterAction, observeMonsterAffinity } from './progression.js';
import { BOSS_PHASES, updateBossPhase, bossSpecialAvailable, announceBossAttack, resolveBossAttack } from './boss-phases.js';
import { rt } from './runtime.js';
import {activeJourney,endJourney,addJourneyLog} from './journey-paths.js';
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
import { selectAnnouncedAction,announceMonsterAction,consumeAnnouncedAction,resolveElementReaction } from './combat-tactics.js';
import { monsterRarity } from './monster-rarity.js';
export function combat(boss=false,secret=false,forcedSpeciesId=null){if(rt.state.combat)return;cancelCombatVisuals(rt.app);stopCreatureAnimation();resetCombatVisualState(rt);rt.busy=false;let lv=boss?rt.area:Math.min(100,rt.area+rand(0,1));rt.state.combat={enemy:enemy(lv,boss,forcedSpeciesId),effects:[],turn:0,guard:0,cooldowns:{}};
 if(secret&&!boss&&SECRET_BOSS_REGIONS.includes(mapId(rt.area))){
  const e=rt.state.combat.enemy;
  e.secretGuardian=true;
  e.name=`Guardião Esquecido: ${e.baseName}`;
  e.hp=Math.ceil(e.hp*1.35);e.maxhp=e.hp;e.atk=Math.ceil(e.atk*1.12);
 }
 recordEncounter(rt.state.combat.enemy);rt.log=[`Um ${rt.state.combat.enemy.name} apareceu!`];rt.sub='attack';rt.screen='combat';save();render();}

export function effectsTick(target,effects){for(let ef of [...effects]){if(ef.type==='poison'||ef.type==='burn'||ef.type==='bleed'){let dmg=Math.max(1,Math.floor(target.maxhp*ef.power));target.hp=Math.max(0,target.hp-dmg);rt.log.unshift(`${ef.name}: ${dmg} de dano.`);}if(ef.type==='regen')target.hp=Math.min(target.maxhp,target.hp+Math.ceil(target.maxhp*ef.power));ef.duration--;if(ef.duration<=0)effects.splice(effects.indexOf(ef),1);}}

export function endCombat(win){cancelCombatVisuals(rt.app);stopCreatureAnimation();invalidateCombatVisualState(rt);let e=rt.state.combat.enemy;resetCooldowns(rt.state.combat);resetCooldowns(e);const inDungeon=!!rt.state.combat.dungeonRoom;recordOutcome(e,win);if(win){progressQuest('kill',e.baseName);progressDynamic(rt.state,'kill',mapId(rt.area));const storyProgress=advanceAdventureCombat(rt.state,mapId(rt.area),e);if(storyProgress)rt.log.unshift(storyProgress.text);if(e.boss)progressQuest('boss',e.baseName);if(rt.state.statistics)rt.state.statistics.monstersDefeated++;recordWeaponVictory(rt.state,e);let s=stats(),exp=Math.floor((12+e.lv*9)*(e.boss?8:1)*clamp(1+(e.lv-rt.state.lv)*.15,.15,1.5)*(1+s.expBonus/100)),gold=Math.floor((8+e.lv*4)*(e.boss?7:1)*(e.boss?1:monsterRarity(e.rarityId).reward));exp=Math.floor(exp*(e.boss?1:monsterRarity(e.rarityId).reward));rt.state.gold+=gold;statAdd('goldEarned',gold);rt.log.unshift(`Vitória! +${exp} EXP, +${gold} ouro.`);gainXp(exp);const firstBoss=e.boss&&!rt.state.bosses.includes(mapId(rt.area));
const reward=rewardFor(e,rt.state.cls,firstBoss,Math.random,rt.state.investedStats);
for(const [name,count] of Object.entries(reward.materials)){rt.state.materials[name]=(rt.state.materials[name]||0)+count;statAdd('itemsFound',count);rt.log.unshift(`Material obtido: ${name} ×${count}.`);}
for(const [name,count] of Object.entries(reward.consumables)){rt.state.consumables[name]=(rt.state.consumables[name]||0)+count;statAdd('itemsFound',count);rt.log.unshift(`Consumível obtido: ${name} ×${count}.`);}
for(const it of reward.items){rt.state.items.push(it);statAdd('itemsFound');rt.log.unshift(`Item obtido: ${it.name} (${rarityName(it.rarity)}).`);}
if(e.secretGuardian&&markGuardianVictory(rt.state,mapId(rt.area))){
 const region=mapId(rt.area),relic=makeItem(e.lv,'weapon',rt.state.cls,2,region);
 rt.state.items.push(relic);statAdd('itemsFound');
 const message=`Guardião secreto derrotado! Relíquia obtida: ${relic.name}.`;
 rt.log.unshift(message);recordSecret(rt.state,message);
 }
 if(e.boss&&!rt.state.bosses.includes(mapId(rt.area))){rt.state.bosses.push(mapId(rt.area));if(rt.state.statistics)rt.state.statistics.bossesDefeated++;rt.log.unshift('Chefe derrotado! Próximo mapa liberado.');}}else{if(rt.state.statistics)rt.state.statistics.deaths++;let lost=Math.floor(rt.state.gold*.1);rt.state.gold-=lost;const xpPenalty=applyDeathXpPenalty(rt.state);let s=stats();rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;rt.log.unshift(`Derrota. -${lost} ouro, -${xpPenalty.lost} EXP do nível atual. Seu nível foi preservado.`);}if(inDungeon)dungeonCombatEnd(win);const resumeJourney=!inDungeon&&win&&!e.boss&&activeJourney(rt.state);if(resumeJourney)addJourneyLog(rt.state,rt.log.slice(0,5));if(!win&&activeJourney(rt.state))endJourney(rt.state);rt.state.combat=null;rt.sub='main';rt.screen=resumeJourney?'journey':(!win&&!inDungeon?'city':'result');save();render();}

export function hitEnemy(mult=1,type='damage',element='physical'){let c=rt.state.combat,e=c.enemy,s=stats(),mag=rt.state.cls==='mago',base=(mag?s.mag:s.atk)*mult,hit=Math.random()*100<s.hit;if(!hit){rt.log.unshift('Seu ataque errou!');return;}let critical=Math.random()*100<s.crit,damage=Math.max(1,Math.floor(base*(critical?s.critD:1)*(e.boss?1+s.bossBonus/100:1)-e.def*.65));if(type==='pierce')damage+=e.def;damage=applyElementalDamage(damage,e,element);if(element!=='physical')damage=Math.floor(damage*(1+(s.elementalBonus||0)));if(type==='execute'&&e.hp/e.maxhp<.35)damage=Math.floor(damage*1.6);if(e.guardTurns>0)damage=Math.ceil(damage*.65);e.hp=Math.max(0,e.hp-damage);if(element!=='physical')observeMonsterAffinity(e,element,elementMultiplier(e,element));const reaction=resolveElementReaction(e,element,damage);if(reaction.message)rt.log.unshift(reaction.message);if(reaction.bonus)damage+=reaction.bonus;rt.impactMeta={critical,element};statAdd('damageDealt',damage);rt.state.statistics.highestDamage=Math.max(rt.state.statistics.highestDamage||0,damage);if(e.boss&&e.hp>0)updateBossPhase(e,message=>rt.log.unshift(message));const feedback=elementalMessage(e,element);if(feedback)rt.log.unshift(feedback);rt.log.unshift(`Você causou ${damage} de dano${critical?' CRÍTICO!':''}.`);if(damage>0&&(type==='poison'||type==='burn'))e.effects.push({type,name:type==='poison'?'Veneno':'Queimadura',power:.035,duration:3+(s.statusDuration||0)});if(s.extraAttack&&damage>0&&e.hp>0&&Math.random()<s.extraAttack){const extra=Math.max(1,Math.floor(damage*.28));e.hp=Math.max(0,e.hp-extra);statAdd('damageDealt',extra);rt.log.unshift(`Ataque adicional: ${extra} de dano!`);}if(s.leech){let heal=Math.ceil(damage*s.leech/100);rt.state.hp=Math.min(s.maxhp,rt.state.hp+heal);}}

export function enemyTurn(){
 const c=rt.state.combat;if(!c)return;
 const e=c.enemy,s=stats();effectsTick(e,e.effects);
 if(e.hp<=0)return endCombat(true);
 if(e.boss){
  // O ataque anunciado sempre se resolve no turno seguinte, sem novo sorteio.
  if(e.telegraph){
   c.lastVisualAction={id:'boss-special',kind:'damage',element:e.attackElement||'physical'};
   observeMonsterAction(e,{id:'boss-special',name:e.telegraph.name});
   const combatPlayer={hp:rt.state.hp,elementalAffinities:rt.state.elementalAffinities||{},combatEffects:c.effects};
   resolveBossAttack(e,combatPlayer,s,c.guard,message=>rt.log.unshift(message));
   rt.state.hp=combatPlayer.hp;
   tickCooldowns(e);return;
  }
  if(e.bossSpecialCooldown>0)e.bossSpecialCooldown--;
  if(bossSpecialAvailable(e)&&((e.bossPhase===3)||Math.random()<.65)){
   c.lastVisualAction={kind:'guard',id:'announce'};
   announceBossAttack(e,message=>rt.log.unshift(message));
   tickCooldowns(e);return;
  }
 }
 // Anúncios não alteram as regras de ação. A habilidade só gasta MP ao ser executada.
 if(!e.boss&&e.telegraphCooldown>0)e.telegraphCooldown--;
 let action=consumeAnnouncedAction(e);
 if(!action&&!e.boss){
  const announced=selectAnnouncedAction(e);
  if(announced&&announceMonsterAction(e,announced)){
   c.lastVisualAction={kind:'guard',id:'announce'};
   rt.log.unshift(`! ATAQUE ANUNCIADO! ${e.telegraph.message}`);
   tickCooldowns(e);return;
  }
 }
 // Decisão baseada em recursos, arquétipo, vida, recargas e afinidades.
 action??=chooseMonsterAction(e,{hp:rt.state.hp,maxhp:s.maxhp,effects:c.effects,affinities:rt.state.elementalAffinities||{}},{playerStats:s});
 finishMonsterAction(e,action);
 c.lastVisualAction={...action};
 if(e.dungeonBoss&&c.turn%3===2&&action.kind!=='heal'&&action.kind!=='guard'){action.kind='damage';action.power=Math.max(action.power,1.45);action.element=e.attackElement;action.id='dungeon-special';action.name=e.dungeonSpecial||'Poder Ancestral';}c.lastVisualAction={...action};observeMonsterAction(e,action);if(action.id!=='strike')rt.log.unshift(`${e.name} utilizou ${action.name} (${e.archetype})!`);
 if(action.kind==='heal'){
  const heal=Math.min(e.maxhp-e.hp,Math.ceil(e.maxhp*.18));e.hp+=heal;rt.log.unshift(`${e.name} recuperou ${heal} HP.`);
 }else if(action.kind==='guard'){
  e.guardTurns=2;rt.log.unshift(`${e.name} reforçou sua proteção.`);
 }else{
  if(Math.random()*100<s.dodge){rt.log.unshift(`Você esquivou do ataque de ${e.name}!`);}
  else{
   const defense=effectiveProtection(action.element==='physical'?s.def:s.md,c.effects);
   let damage=incomingDamage(e.atk*action.power,defense);
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


function pushLog(message, kind='info') { rt.log.unshift({text:message, kind, id:Date.now()+Math.random()}); }
function normalizeLogs() { rt.log = rt.log.map(x=>typeof x==='string'?{text:x,kind:'info',id:Math.random()}:x); }
function syncCombatLog() { normalizeLogs(); rt.log=rt.log.slice(0,25); }
function damageSnapshot() { return {enemy:rt.state.combat?.enemy.hp, player:rt.state.hp}; }
function markImpact(before, side) {
 const visual=impactResult(before,damageSnapshot(),side,rt.impactMeta);
 rt.float=visual;rt.impactMeta=null;
 rt.phase=visual&&!visual.heal?(side==='enemy'?'enemy-hit':'player-hit'):'idle';
 render();
 return visual;
}
export async function act(kind,param) {
 if(rt.busy||!rt.state?.combat||!['attack','skill','spec','potion','flee'].includes(kind))return;
 const c=rt.state.combat,e=c.enemy,s=stats();
 if(kind==='potion'&&!['hp','mp','elixir','antidote'].includes(param))return;
 const stunned=c.effects.some(x=>x.type==='stun'&&x.duration>0);
 if(kind==='skill'){const a=effectiveSkill(rt.state,Number(param)),cd=playerCooldownDetails(rt.state,Number(param));if(!a||!cd||rt.state.lv<a.level||rt.state.mp<a.cost||!canUse(c,cd.id))return;}
 if(kind==='spec'){const a=specSkills(rt.state)[Number(param)],cd=specCooldownDetails(rt.state,Number(param));if(!a||!cd||rt.state.mp<a.cost||!canUse(c,cd.id))return;}
 if(kind==='potion'&&(!rt.state.consumables[param]||rt.state.consumables[param]<1))return;
 if(kind==='flee'&&(e.boss||c.dungeonRoom))return;
 const session=rt.combatVisualId;
 rt.busy=true;rt.phase='player-action';rt.float=null;rt.impactMeta=null;
 rt.app.querySelectorAll('.combat-controls button, .combat-speed-option').forEach(button=>button.disabled=true);
 normalizeLogs();let before=damageSnapshot();const playerLogIds=new Set(rt.log.map(x=>x.id));
 try {
  if(!stunned)await playCombatAction(rt.app,{session,side:'hero',cls:rt.state.cls,kind,index:Number(param)||0,element:kind==='skill'?heroSkillElement(rt.state.cls,Number(param)||0):kind==='spec'?specSkills(rt.state)[param]?.element:'physical'});
  if(!currentVisualSession(rt,session,c))return;
  if(stunned){pushLog('Você está atordoado e perdeu sua ação.','effect');}
  else if(kind==='attack'){pushLog('Você realizou um ataque básico.','action');hitEnemy();}
  else if(kind==='skill'){
   const a=effectiveSkill(rt.state,param);rt.state.mp-=a.cost;pushLog(`Você utilizou ${a.name}${a.variant==='standard'?'':` (${a.variant==='power'?'Potência':'Economia'})`}!`,'action');
   if(a.type==='guard'){c.guard=a.guardTurns;pushLog(`${a.name} ativada: defesa reforçada por ${a.guardTurns} turnos.`,'effect');}
   else hitEnemy(a.mult,a.type,PLAYER_SKILL_ELEMENTS[rt.state.cls][param]);
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
    cancelCombatVisuals(rt.app);stopCreatureAnimation();invalidateCombatVisualState(rt);rt.state.combat=null;rt.sub='main';rt.screen=activeJourney(rt.state)?'journey':'world';rt.log.unshift({text:'Você fugiu!',kind:'info',id:Math.random()});if(activeJourney(rt.state))addJourneyLog(rt.state,'Você fugiu do encontro.');save();render();return;
   }pushLog('Falha ao fugir!','error');
  }
  // Apenas ações concluídas consomem um turno. A habilidade usada recebe
  // sua recarga depois da redução das demais, nunca no próprio turno.
  const used=stunned?null:kind==='skill'?playerCooldownDetails(rt.state,Number(param)):kind==='spec'?specCooldownDetails(rt.state,Number(param)):null;
  finishCooldownTurn(c,used?.id,used?.turns||0);
  syncCombatLog();rt.phase='player-action';
  if(!rt.state.combat)return;
  const newPlayerLogs=rt.log.filter(x=>!playerLogIds.has(x.id));
  const heroImpact=before.enemy!==e.hp?markImpact(before,'enemy'):rt.state.hp>before.player?markImpact(before,'player'):markImpact(before,'enemy');
  await playCombatReaction(rt.app,{session,side:heroImpact?.side||'enemy',amount:heroImpact?.amount||0,heal:!!heroImpact?.heal,log:newPlayerLogs,critical:!!heroImpact?.critical});
  if(!currentVisualSession(rt,session,c))return;
  rt.float=null;
  if(e.hp<=0){rt.phase='idle';return endCombat(true);}
  for(const ef of [...c.effects]){
   if(['poison','burn','bleed'].includes(ef.type)){
    const d=Math.max(1,Math.floor(s.maxhp*ef.power));rt.state.hp=Math.max(0,rt.state.hp-d);statAdd('damageTaken',d);pushLog(`${ef.name}: -${d} HP.`,'damage');
   }
   ef.duration--;if(ef.duration<=0)c.effects.splice(c.effects.indexOf(ef),1);
  }
  if(rt.state.hp<=0)return endCombat(false);
  rt.phase='enemy-preparing';rt.float=null;pushLog(`${e.name} está preparando sua ação...`,'action');syncCombatLog();render();
  await visualPause(visualDuration()===0?0:combatTimings().enemyPrepare);
  if(!currentVisualSession(rt,session,c))return;
  before=damageSnapshot();const enemyLogIds=new Set(rt.log.map(x=>x.id));enemyTurn();syncCombatLog();
  if(!currentVisualSession(rt,session,c))return;
  await playCombatAction(rt.app,{session,side:'enemy',kind:'monster',skill:c.lastVisualAction,element:c.lastVisualAction?.element||e.attackElement||'physical'});
  if(!currentVisualSession(rt,session,c))return;
  const enemyLog=rt.log.filter(x=>!enemyLogIds.has(x.id));
  const enemyImpact=e.hp>before.enemy?markImpact(before,'enemy'):markImpact(before,'player');
  await playCombatReaction(rt.app,{session,side:enemyImpact?.side||'player',amount:enemyImpact?.amount||0,heal:!!enemyImpact?.heal,log:enemyLog,kind:c.lastVisualAction?.kind});
  if(!currentVisualSession(rt,session,c))return;
  rt.float=null;
  if(rt.state.hp<=0)return endCombat(false);
  if(e.hp<=0)return endCombat(true);
  c.turn++;if(c.guard>0)c.guard--;rt.state.mp=Math.min(s.maxmp,rt.state.mp+s.regen);
  rt.phase='idle';rt.float=null;save();render();
 }finally{if(currentVisualSession(rt,session,c)){rt.busy=false;rt.phase='idle';rt.float=null;render();}else if(!rt.state?.combat){rt.busy=false;}}
}

import {miniBossForArea,areaBossWarning} from './area-bosses.js';
import {isStageBossArea,challengeProgress} from './exploration-challenge.js';
import {miniBossFor,miniBossArtwork,miniBossDamageFactor,miniBossAttackFactor,miniBossRegen,miniBossDrain,chooseMiniBossSkill} from './mini-bosses.js';
import {encounterPending,resolveMiniBoss,mapUnlocked,resetExplorationSequence,recordExplorationCompletion} from './exploration-challenge.js';
import {initCombatResource,resourceValue,gainResource,consumeResource,canPaySkillResource,skillInfo,hasPassive,passiveTier} from './class-combat.js';
import {applyStatus,statusActive,statusValue,periodicStatuses,expireStatuses,combatEvent} from './combat-effects.js';
import {hasMilestone} from './attribute-milestones.js';
import {monsterDamageFactor,monsterPassives,bossKit,dungeonBossKit,dungeonBossPhase} from './monster-identity.js';
import {progressDynamic} from './dynamic-quests.js';
import {incomingDamage,effectiveProtection,monsterHealth,monsterAttack} from './final-balance.js';
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

/** Encontro garantido após 15 resultados válidos, com retorno seguro após recarga. */
export function startMiniBossCombat(){
 const state=rt.state,area=rt.area,region=mapId(rt.area),kit=miniBossForArea(area);
 if(!state||state.combat||!encounterPending(state)||state.explorationChallenge.pendingMapId!==area||rt.busy)return false;
 if(isStageBossArea(area)){combat(true,false,null,true);return true;}
 if(!kit)return false;
 cancelCombatVisuals(rt.app);stopCreatureAnimation();resetCombatVisualState(rt);
 const level=Math.min(100,Math.max(rt.area,Math.min(state.lv,region*10+8)));
 const e=enemy(level,false);
 e.name=kit.name;e.baseName=kit.name;e.speciesId=null;e.miniBoss=true;e.miniBossRegion=region;e.miniBossArea=area;e.miniBossKit=kit;e.boss=false;e.rarityId='champion';e.lv=level;
 e.hp=Math.ceil(monsterHealth(level,false)*kit.hp);e.maxhp=e.hp;e.atk=Math.ceil(monsterAttack(level,false)*kit.atk);e.def=Math.ceil(level*.85*kit.def);
 e.mp=50+level*3;e.maxmp=e.mp;e.attackElement=kit.element;e.archetype=kit.archetype;e.affinities={};e.telegraph=null;e.cooldowns={};e.turn=0;
 state.combat={enemy:e,effects:[],turn:0,guard:0,cooldowns:{}};
 initCombatResource(state.combat,state.cls);recordEncounter(e);rt.busy=false;rt.log=[`${kit.name} protege o território!`,kit.intro];rt.sub='attack';rt.screen='combat';save();render();return true;
}

export function combat(boss=false,secret=false,forcedSpeciesId=null,challengeStage=false){if(rt.state.combat)return;cancelCombatVisuals(rt.app);stopCreatureAnimation();resetCombatVisualState(rt);rt.busy=false;let lv=boss?rt.area:Math.min(100,rt.area+rand(0,1));rt.state.combat={enemy:enemy(lv,boss,forcedSpeciesId),effects:[],turn:0,guard:0,cooldowns:{}};initCombatResource(rt.state.combat,rt.state.cls);if(challengeStage&&boss)rt.state.combat.enemy.challengeStageArea=rt.area;
 if(secret&&!boss&&SECRET_BOSS_REGIONS.includes(mapId(rt.area))){
  const e=rt.state.combat.enemy;
  e.secretGuardian=true;
  e.name=`Guardião Esquecido: ${e.baseName}`;
  e.hp=Math.ceil(e.hp*1.35);e.maxhp=e.hp;e.atk=Math.ceil(e.atk*1.12);
 }
 const firstEnemy=rt.state.combat.enemy;if(monsterPassives(firstEnemy).some(x=>x.id==='menace')&&Math.random()<.18)applyStatus(rt.state.combat.effects,'weaken',{duration:1,power:.08});
 recordEncounter(rt.state.combat.enemy);rt.log=[`Um ${rt.state.combat.enemy.name} apareceu!`];rt.sub='attack';rt.screen='combat';save();render();}

export function effectsTick(target,effects){for(let ef of [...effects]){if(ef.type==='poison'||ef.type==='burn'||ef.type==='bleed'){let dmg=Math.max(1,Math.floor(target.maxhp*ef.power));target.hp=Math.max(0,target.hp-dmg);rt.log.unshift(`${ef.name}: ${dmg} de dano.`);}if(ef.type==='regen')target.hp=Math.min(target.maxhp,target.hp+Math.ceil(target.maxhp*ef.power));ef.duration--;if(ef.duration<=0)effects.splice(effects.indexOf(ef),1);}}

export function endCombat(win){cancelCombatVisuals(rt.app);stopCreatureAnimation();invalidateCombatVisualState(rt);let e=rt.state.combat.enemy;resetCooldowns(rt.state.combat);resetCooldowns(e);const inDungeon=!!rt.state.combat.dungeonRoom,mini=!!e.miniBoss,miniRegion=e.miniBossRegion,challengeArea=e.miniBossArea||e.challengeStageArea,challengeStage=!!e.challengeStageArea;const journeyStep=!mini&&!e.boss&&!inDungeon&&rt.state.journey?.pendingKind==='combat'&&activeJourney(rt.state);recordOutcome(e,win);if(win){progressQuest('kill',e.baseName);progressDynamic(rt.state,'kill',mapId(rt.area));const storyProgress=advanceAdventureCombat(rt.state,mapId(rt.area),e);if(storyProgress)rt.log.unshift(storyProgress.text);if(e.boss)progressQuest('boss',e.baseName);if(rt.state.statistics)rt.state.statistics.monstersDefeated++;recordWeaponVictory(rt.state,e);let s=stats(),exp=Math.floor((12+e.lv*9)*(e.boss?8:mini?3.25:1)*clamp(1+(e.lv-rt.state.lv)*.15,.15,1.5)*(1+s.expBonus/100)),gold=Math.floor((8+e.lv*4)*(e.boss?7:mini?3.5:1)*(e.boss||mini?1:monsterRarity(e.rarityId).reward));exp=Math.floor(exp*(e.boss||mini?1:monsterRarity(e.rarityId).reward));rt.state.gold+=gold;statAdd('goldEarned',gold);rt.log.unshift(`Vitória! +${exp} EXP, +${gold} ouro.`);gainXp(exp);const firstBoss=challengeStage&&!rt.state.bosses.includes(mapId(rt.area)),firstMini=mini&&!challengeProgress(rt.state,challengeArea).defeated;
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
 if(mini&&resolveMiniBoss(rt.state,challengeArea,true)){
  const kit=miniBossForArea(challengeArea),region=mapId(challengeArea);
  if(firstMini){const relic=makeItem(e.lv,'weapon',rt.state.cls,2,region);relic.name=`Troféu de ${kit.name}`;rt.state.items.push(relic);statAdd('itemsFound');
  rt.state.materials[maps[region][6]]=(rt.state.materials[maps[region][6]]||0)+3;statAdd('itemsFound',3);
  rt.log.unshift(`${kit.defeat} Troféu raro e 3 materiais regionais obtidos.`);}else rt.log.unshift(`Revanche vencida contra ${kit.name}.`);
  rt.log.unshift(mapUnlocked(rt.state,challengeArea+1)?'CONQUISTA: Mini Boss derrotado. Próximo mapa liberado!':'CONQUISTA: Mini Boss derrotado.');
 }
 if(challengeStage&&resolveMiniBoss(rt.state,challengeArea,true)){
  const region=mapId(challengeArea);
  if(!rt.state.bosses.includes(region)){rt.state.bosses.push(region);if(rt.state.statistics)rt.state.statistics.bossesDefeated++;}
  rt.log.unshift(challengeArea===100?'Chefe final derrotado!':'Chefe da Fase derrotado! Próxima fase liberada.');
 }}else{if(rt.state.statistics)rt.state.statistics.deaths++;let lost=Math.floor(rt.state.gold*.1);rt.state.gold-=lost;const xpPenalty=applyDeathXpPenalty(rt.state);let s=stats();rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;rt.log.unshift(`Derrota. -${lost} ouro, -${xpPenalty.lost} EXP do nível atual. Seu nível foi preservado.`);if(mini||challengeStage)resolveMiniBoss(rt.state,challengeArea,false);}if(inDungeon)dungeonCombatEnd(win);
 let nextEncounter=false;
 if(journeyStep){
  rt.state.journey.pendingKind=null;
  if(win){rt.state.journey.steps++;rt.state.narrative.explorations++;progressQuest('explore',mapId(rt.area));progressDynamic(rt.state,'explore',mapId(rt.area));const result=recordExplorationCompletion(rt.state,rt.area);
    if(result.hint){addJourneyLog(rt.state,areaBossWarning(rt.area,result.hint));}
    if(result.triggered){addJourneyLog(rt.state,`Você percebe ${miniBossForArea(rt.area)?.name||maps[mapId(rt.area)][2]} entre as sombras. O confronto é inevitável.`);nextEncounter=true;}}
 }
 const resumeJourney=!inDungeon&&win&&!e.boss&&activeJourney(rt.state);if(resumeJourney)addJourneyLog(rt.state,rt.log.slice(0,5));if(!win&&activeJourney(rt.state))endJourney(rt.state);if(win&&hasMilestone(rt.state.investedStats,'sor','destiny')&&Math.random()<.12){const heal=Math.max(1,Math.floor(stats().maxhp*.06));rt.state.hp=Math.min(stats().maxhp,rt.state.hp+heal);rt.log.unshift(`Destino Favorável: +${heal} HP.`);}rt.state.combat=null;rt.sub='main';rt.screen=nextEncounter?'miniBoss':resumeJourney?'journey':(!win&&!inDungeon?'city':'result');save();render();}

/** Dano do herói: base -> passivas/marcos -> acerto/crítico -> defesa -> afinidade -> escudo -> HP. */
export function hitEnemy(mult=1,type='damage',element='physical',options={}){
 const c=rt.state?.combat;if(!c)return 0;const e=c.enemy,s=stats(),cls=rt.state.cls;
 const invested=rt.state.investedStats,feat=(key,id)=>hasMilestone(invested,key,id);
 const magical=cls==='mago'||options.magic===true;
 const isPhysical=element==='physical';
 const extraHit=type==='precise'?15:0;
 const enemyEvasion=monsterPassives(e).some(x=>x.id==='survival')&&e.hp/e.maxhp<.3?7:e.archetype==='opportunist'?3:0;
 const accuracy=clamp(s.hit+extraHit-enemyEvasion,0,99);
 if(Math.random()*100>=accuracy){rt.log.unshift('Seu ataque errou!');return 0;}
 let power=magical?s.mag:s.atk;
 if(cls==='arqueiro'&&type==='precise'&&feat('des','technique'))power*=1.04;
 if(isPhysical&&feat('for','brutal')&&(mult>=1.5||['impact','pierce','execute','double'].includes(type)))power*=1.05;
 if(isPhysical&&feat('for','implacable')&&e.def>e.lv*.9)power*=1.06;
 if(isPhysical&&feat('for','titan'))power*=1.04;
 if(magical&&feat('int','archmage'))power*=1.04;
 if(magical&&feat('int','channel')&&options.empowered)power*=1.04;
 if(hasPassive(rt.state,'hunter_instinct')&&statusActive(e.effects,'mark'))power*=1.1;
 if(hasPassive(rt.state,'sneak_attack')&&(e.hp/e.maxhp<.45||e.effects.some(x=>['poison','weaken','bleed'].includes(x.type))))power*=1+.08+.015*(passiveTier(rt.state.lv)-1);
 if(hasPassive(rt.state,'opportunist_predator')&&(e.hp/e.maxhp<.4||e.effects.some(x=>['poison','weaken','bleed'].includes(x.type))))power*=1.09;
 if(hasPassive(rt.state,'firing_rhythm'))power*=1+Math.min(3,c.sequence||0)*.03;
 const critical=Math.random()*100<s.crit;
 const bypass=type==='pierce'?.55:type==='impact'?.3:0;
 const raw=power*mult*(critical?s.critD:1)*(e.boss?1+s.bossBonus/100:1);
 const defense=Math.max(0,e.def*(1-bypass));
 let damage=incomingDamage(raw,defense);
 damage=applyElementalDamage(damage,e,element);
 damage=Math.floor(damage*(1+(element!=='physical'?s.elementalBonus:0)));
 if(type==='execute'&&(e.hp/e.maxhp<.35||statusActive(e.effects,'poison')))damage=Math.floor(damage*1.38);
 if(statusActive(e.effects,'mark'))damage=Math.floor(damage*(1+statusValue(e.effects,'mark')));
 damage=Math.floor(damage*monsterDamageFactor(e,element)*miniBossDamageFactor(e,element));
 if(e.guardTurns>0)damage=Math.ceil(damage*.65);
 damage=Math.min(e.hp,Math.max(0,damage));e.hp-=damage;
 if(element!=='physical')observeMonsterAffinity(e,element,elementMultiplier(e,element));
 const reaction=resolveElementReaction(e,element,damage);
 if(reaction.message)rt.log.unshift(reaction.message);
 if(reaction.bonus)damage+=reaction.bonus;
 if(reaction.bonus&&hasPassive(rt.state,'resonance')){const bonus=Math.min(e.hp,Math.max(1,Math.floor(reaction.bonus*.2)));e.hp-=bonus;damage+=bonus;}
 rt.impactMeta={critical,element};statAdd('damageDealt',damage);
 rt.state.statistics.highestDamage=Math.max(rt.state.statistics.highestDamage||0,damage);
 const apply=(id,power=null,duration=null)=>applyStatus(e.effects,id,{power,duration,boss:e.boss});
 if(damage>0){
  if(type==='poison')apply('poison',Math.min(.055,.035*(hasPassive(rt.state,'poison_master')?1.2:1)),3+(s.statusDuration||0));
  if(type==='burn')apply('burn',.035,3+(s.statusDuration||0));
  if(type==='weaken')apply('weaken',e.boss?.10:.16,2);
  if(type==='freeze')apply('freeze',.10,2);
  if(type==='mark')apply('mark',.12,3);
  if(isPhysical&&feat('for','impact')&&Math.random()<.08)apply('weaken',.10,1);
  if(type==='double'&&cls==='ladino'&&Math.random()<.13)apply('bleed',.021,2);
 }
 if(e.boss&&e.hp>0)updateBossPhase(e,message=>rt.log.unshift(message));
 if(e.dungeonBoss&&e.hp>0&&dungeonBossPhase(e)>(e.dungeonPhase||1)){e.dungeonPhase=dungeonBossPhase(e);rt.log.unshift(`${e.name}: nova fase!`);}
 const feedback=elementalMessage(e,element);if(feedback)rt.log.unshift(feedback);
 rt.log.unshift(`Você causou ${damage} de dano${critical?' CRÍTICO!':''}.`);
 if(s.extraAttack&&damage>0&&e.hp>0&&Math.random()<s.extraAttack){const extra=Math.min(e.hp,Math.max(1,Math.floor(damage*.28)));e.hp-=extra;statAdd('damageDealt',extra);rt.log.unshift(`Ataque adicional: ${extra} de dano!`);}
 if(s.leech&&damage){const heal=Math.ceil(damage*s.leech/100);rt.state.hp=Math.min(s.maxhp,rt.state.hp+heal);}
 return damage;
}

export function enemyTurn(){
 const c=rt.state.combat;if(!c)return;
 const e=c.enemy,s=stats();if(e.miniBoss)e.turn=c.turn;effectsTick(e,e.effects);
 if((monsterPassives(e).some(p=>p.id==='regeneration')||(bossKit(e)?.passive?.kind==='regen'&&((e.bossPhase||1)>=2||e.hp/e.maxhp<.5))||dungeonBossKit(e)?.passive?.kind==='regen')&&e.hp>0&&e.hp<e.maxhp){const heal=Math.max(1,Math.floor(e.maxhp*.01));e.hp=Math.min(e.maxhp,e.hp+heal);}
 if(e.miniBoss&&e.hp>0&&e.hp<e.maxhp)e.hp=Math.min(e.maxhp,e.hp+miniBossRegen(e));
 if(e.hp<=0)return endCombat(true);
 if(e.boss){
  // O ataque anunciado sempre se resolve no turno seguinte, sem novo sorteio.
  if(e.telegraph){
   c.lastVisualAction={id:'boss-special',kind:'damage',element:e.attackElement||'physical'};
   observeMonsterAction(e,{id:'boss-special',name:e.telegraph.name});
   const combatPlayer={hp:rt.state.hp,elementalAffinities:rt.state.elementalAffinities||{},combatEffects:c.effects};
   const oldEffectTypes=new Set(c.effects.map(x=>x.type));resolveBossAttack(e,combatPlayer,s,c.guard,message=>rt.log.unshift(message));
   if(hasPassive(rt.state,'tenacity')||hasMilestone(rt.state.investedStats,'vit','robust'))for(const effect of c.effects){if(!oldEffectTypes.has(effect.type))effect.duration=Math.max(1,effect.duration-(hasPassive(rt.state,'tenacity')?1:0)-(hasMilestone(rt.state.investedStats,'vit','robust')?1:0));}
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
 let action=e.miniBoss&&e.telegraph?.kind==='mini'?e.telegraph.action:consumeAnnouncedAction(e);
 if(e.miniBoss&&e.telegraph?.kind==='mini'){e.telegraph=null;e.telegraphCooldown=3;}
 if(e.miniBoss&&!action){
  const next=chooseMiniBossSkill(e,{hp:rt.state.hp,maxhp:s.maxhp,effects:c.effects});
  if(next.announce&&(e.telegraphCooldown||0)<=0){
    e.telegraph={kind:'mini',action:next,message:`${e.name} prepara ${next.name}. Proteja-se neste turno!`};
    c.lastVisualAction={kind:'guard',id:'announce'};rt.log.unshift(`! MINI BOSS: ${e.telegraph.message}`);tickCooldowns(e);return;
  }
  action=next;
 }
 if(e.miniBoss&&e.telegraphCooldown>0)e.telegraphCooldown--;
 if(!action&&!e.boss&&!e.miniBoss){
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
 if(e.dungeonBoss&&c.turn%3===2&&action.kind!=='heal'&&action.kind!=='guard'){const art=dungeonBossKit(e)?.phaseAttacks[dungeonBossPhase(e)-1];action.kind='damage';action.power=Math.max(action.power,art?.power||1.45);action.element=art?.element||e.attackElement;action.id=art?.id||'dungeon-special';action.name=art?.name||e.dungeonSpecial||'Poder Ancestral';}c.lastVisualAction={...action};observeMonsterAction(e,action);if(action.id!=='strike')rt.log.unshift(`${e.name} utilizou ${action.name} (${e.archetype})!`);
 if(action.kind==='heal'){
  const heal=Math.min(e.maxhp-e.hp,Math.ceil(e.maxhp*.18));e.hp+=heal;rt.log.unshift(`${e.name} recuperou ${heal} HP.`);
 }else if(action.kind==='guard'){
  e.guardTurns=2;rt.log.unshift(`${e.name} reforçou sua proteção.`);
 }else{
  if(Math.random()*100<Math.min(40,s.dodge+(statusActive(c.effects,'evade')?8:0)+(statusActive(c.effects,'freeze')?2:0))){rt.log.unshift(`Você esquivou do ataque de ${e.name}!`);if(hasPassive(rt.state,'cat_reflexes')||hasMilestone(rt.state.investedStats,'agi','fast_reflexes'))gainResource(c,rt.state.cls,1);}
  else{
   const defense=effectiveProtection(action.element==='physical'?s.def:s.md,c.effects);
   let incomingPower=e.atk*action.power*miniBossAttackFactor(e);
   if(statusActive(e.effects,'weaken'))incomingPower*=1-statusValue(e.effects,'weaken');
   if(statusActive(e.effects,'freeze'))incomingPower*=.9;
   if(monsterPassives(e).some(p=>p.id==='ferocity')&&e.hp/e.maxhp<.35)incomingPower*=1.08;
   if(e.boss)incomingPower*=1+(.055*Math.max(0,(e.bossPhase||1)-1));
   if(monsterPassives(e).some(p=>p.id==='toxic_blood')&&action.element==='poison')incomingPower*=1.08;
   const bossKind=(bossKit(e)||dungeonBossKit(e))?.passive?.kind;
   if(bossKind==='fire'&&action.element==='fire'&&e.hp/e.maxhp<.7)incomingPower*=1.08;
   if(bossKind==='poison'&&action.element==='poison')incomingPower*=1.08;
   let damage=incomingDamage(incomingPower,defense);
   damage=applyElementalDamage(damage,{affinities:rt.state.elementalAffinities||{}},action.element);
   if(c.guard>0)damage=Math.ceil(damage*.45);damage=Math.ceil(damage*(1-(s.damageReduction||0)));
   if(damage>0&&rt.state.cls==='guerreiro'&&rt.state.hp<=s.maxhp*.3&&hasPassive(rt.state,'last_bastion')&&!c.passiveUses?.lastBastion){damage=Math.ceil(damage*.65);c.passiveUses??={};c.passiveUses.lastBastion=true;rt.log.unshift('Último Bastião reduziu o impacto.');}
   rt.state.hp=Math.max(0,rt.state.hp-damage);statAdd('damageTaken',damage);
   if(c.guard>0&&damage>0){gainResource(c,rt.state.cls,1);if(hasPassive(rt.state,'counterattack')&&Math.random()<.18){const counter=Math.min(e.hp,Math.ceil(s.atk*.25));e.hp-=counter;statAdd('damageDealt',counter);rt.log.unshift(`Contra-ataque: ${counter} de dano.`);}}else if(rt.state.cls==='guerreiro'&&damage>0)gainResource(c,rt.state.cls,1);
   rt.log.unshift(`${e.name} ${action.id==='strike'?'atacou':'utilizou uma habilidade estratégica'}: -${damage} HP.`);if(e.miniBoss&&damage>0){const drain=miniBossDrain(e,damage);if(drain){e.hp=Math.min(e.maxhp,e.hp+drain);rt.log.unshift(`${e.name} absorveu ${drain} HP.`);}}
   const passiveKind=(bossKit(e)||dungeonBossKit(e))?.passive?.kind;
   if(damage>0&&passiveKind==='drain'&&c.turn%3===2)e.hp=Math.min(e.maxhp,e.hp+Math.floor(damage*.12));
   if(damage>0&&passiveKind==='curse'&&c.turn%4===1)applyStatus(c.effects,'weaken',{duration:1,power:.08});
   if(damage===0)rt.log.unshift('O ataque não causou dano!');
   if(['debuff','poison','weaken','bleed','drain'].includes(action.kind)&&damage>0){
    const kind=action.kind==='bleed'?'bleed':action.kind==='weaken'?'weaken':action.kind==='drain'?'weaken':'poison';if(applyStatus(c.effects,kind,{duration:Math.max(1,3-(hasPassive(rt.state,'tenacity')?1:0)-(hasMilestone(rt.state.investedStats,'vit','robust')?1:0)),power:kind==='poison'&&monsterPassives(e).some(p=>p.id==='toxic_blood')?.0276:.024}))rt.log.unshift(`Você recebeu ${kind}.`);
    if(action.kind==='drain'&&damage>0)e.hp=Math.min(e.maxhp,e.hp+Math.floor(damage*.18));
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
 if(kind==='skill'){const a=effectiveSkill(rt.state,Number(param)),cd=playerCooldownDetails(rt.state,Number(param));if(!a||!cd||rt.state.lv<a.level||rt.state.mp<a.cost||!canUse(c,cd.id)||!canPaySkillResource(c,rt.state.cls,Number(param)))return;}
 if(kind==='spec'){const a=specSkills(rt.state)[Number(param)],cd=specCooldownDetails(rt.state,Number(param));if(!a||!cd||rt.state.mp<a.cost||!canUse(c,cd.id))return;}
 if(kind==='potion'&&(!rt.state.consumables[param]||rt.state.consumables[param]<1))return;
 if(kind==='flee'&&(e.boss||e.miniBoss||c.dungeonRoom))return;
 const session=rt.combatVisualId;
 rt.busy=true;rt.phase='player-action';rt.float=null;rt.impactMeta=null;
 rt.app.querySelectorAll('.combat-controls button, .combat-speed-option').forEach(button=>button.disabled=true);
 normalizeLogs();let before=damageSnapshot();const playerLogIds=new Set(rt.log.map(x=>x.id));
 try {
  if(!stunned)await playCombatAction(rt.app,{session,side:'hero',cls:rt.state.cls,kind,index:Number(param)||0,element:kind==='skill'?heroSkillElement(rt.state.cls,Number(param)||0):kind==='spec'?specSkills(rt.state)[param]?.element:'physical'});
  if(!currentVisualSession(rt,session,c))return;
  if(stunned){pushLog('Você está atordoado e perdeu sua ação.','effect');}
  else if(kind==='attack'){pushLog('Você realizou um ataque básico.','action');hitEnemy();gainResource(c,rt.state.cls,1);c.sequence=(c.sequence||0)+1;}
  else if(kind==='skill'){
   const a=effectiveSkill(rt.state,param);rt.state.mp-=a.cost;pushLog(`Você utilizou ${a.name}${a.variant==='standard'?'':` (${a.variant==='power'?'Potência':'Economia'})`}!`,'action');
   const definition=skillInfo(rt.state.cls,Number(param));const spent=consumeResource(c,rt.state.cls,definition?.resourceCost||0);
   if(!spent)throw Error('Recurso insuficiente em habilidade validada');
   if(a.type==='guard'){c.guard=Math.min(3,a.guardTurns);gainResource(c,rt.state.cls,2);if(hasMilestone(rt.state.investedStats,'agi','fluid'))applyStatus(c.effects,'evade',{duration:1,power:.02});pushLog(`${a.name}: guarda ativa por 2 turnos.`,'effect');if(hasMilestone(rt.state.investedStats,'vit','recovery'))rt.state.hp=Math.min(s.maxhp,rt.state.hp+Math.max(1,Math.floor(s.maxhp*.01)));}
   else if(a.type==='evade'){applyStatus(c.effects,'evade',{duration:Math.min(3,a.guardTurns)});if(hasMilestone(rt.state.investedStats,'agi','fluid'))gainResource(c,rt.state.cls,1);gainResource(c,rt.state.cls,1);pushLog('Passo Sombrio: esquiva melhorada por dois turnos.','effect');}
   else if(a.type==='double'){hitEnemy(a.mult,'double','physical');if(e.hp>0)hitEnemy(a.mult,'double','physical');}
   else hitEnemy(a.mult,a.type,PLAYER_SKILL_ELEMENTS[rt.state.cls][param],{empowered:Boolean(definition?.resourceCost)});
   if(hasPassive(rt.state,'arcane_flow')&&rt.state.cls==='mago')rt.state.mp=Math.min(s.maxmp,rt.state.mp+Math.max(1,Math.min(3,Math.floor(s.maxmp*.007))));
   if(hasMilestone(rt.state.investedStats,'int','clarity')&&rt.state.cls==='mago')rt.state.mp=Math.min(s.maxmp,rt.state.mp+2);
   if(rt.state.cls==='mago'&&param!==3)gainResource(c,rt.state.cls,1);
   if(rt.state.cls==='arqueiro'&&param!==3)gainResource(c,rt.state.cls,1);
   if(rt.state.cls==='ladino'&&param!==3)gainResource(c,rt.state.cls,1);
   if(rt.state.cls==='guerreiro'&&param!==3&&a.type!=='guard')gainResource(c,rt.state.cls,1);
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
    cancelCombatVisuals(rt.app);stopCreatureAnimation();invalidateCombatVisualState(rt);rt.state.combat=null;rt.sub='main';rt.screen=activeJourney(rt.state)?'journey':'world';rt.log.unshift({text:'Você fugiu!',kind:'info',id:Math.random()});if(activeJourney(rt.state))addJourneyLog(rt.state,'Você fugiu do encontro.');if(activeJourney(rt.state)&&rt.state.journey?.pendingKind==='combat')rt.state.journey.pendingKind=null;save();render();return;
   }pushLog('Falha ao fugir!','error');
  }
  // Apenas ações concluídas consomem um turno. A habilidade usada recebe
  // sua recarga depois da redução das demais, nunca no próprio turno.
  if(!stunned&&kind!=='attack')c.sequence=0;
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

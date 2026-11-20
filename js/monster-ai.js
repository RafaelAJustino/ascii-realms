import {finishCooldownTurn,turnsRemaining} from './turn-cooldowns.js';
import { elementMultiplier } from './elements.js';
import { monsterRarity } from './monster-rarity.js';
export const ARCHETYPES=Object.freeze(['aggressive','defensive','strategic','opportunist','magical','wild']);
const skills=[
 {id:'strike',name:'Ataque',cost:0,cooldown:0,power:1,element:'physical',kind:'damage',unlock:1},
 {id:'heavy',name:'Golpe Devastador',cost:12,cooldown:2,power:1.35,element:'physical',kind:'damage',unlock:5},
 {id:'hex',name:'Maldição',cost:15,cooldown:3,power:.9,element:'dark',kind:'debuff',unlock:10},
 {id:'heal',name:'Regeneração',cost:12,cooldown:3,power:0,element:'holy',kind:'heal',unlock:15},
 {id:'element',name:'Explosão Elemental',cost:22,cooldown:3,power:1.65,element:'fire',kind:'damage',unlock:20},
 {id:'guard',name:'Postura Protetora',cost:10,cooldown:3,power:0,element:'physical',kind:'guard',unlock:10}
];
const styles={aggressive:{damage:1.3,heal:.5,guard:.5,debuff:.8},defensive:{damage:.8,heal:1.8,guard:1.7,debuff:1},strategic:{damage:1.1,heal:1.2,guard:1.2,debuff:1.25},opportunist:{damage:1.15,heal:.8,guard:.8,debuff:1.1},magical:{damage:1.05,heal:1,guard:.7,debuff:1.9},wild:{damage:1,heal:1,guard:1,debuff:1}};
export function availableMonsterActions(enemy){const cooldowns=enemy.cooldowns||{};return skills.filter(a=>enemy.lv>=a.unlock&&enemy.mp>=a.cost&&turnsRemaining(enemy,a.id)===0);}
export function scoreMonsterAction(action,enemy,player,{playerStats={},random=Math.random}={}){
 const hp=enemy.hp/Math.max(1,enemy.maxhp),playerHp=player.hp/Math.max(1,player.maxhp||player.hp),archetype=enemy.archetype||'wild';
 const style=styles[archetype]||styles.wild;
 const rank=enemy.boss?4:['common','wanderer','elite','champion','legendary'].indexOf(enemy.rarityId);
 const skill=Math.max(0,rank)/4;
 let score=0;
 if(action.kind==='heal')score=hp<.3?350:hp<.55?140:hp<.8?25:-100;
 else if(action.kind==='guard')score=(hp<.45?75:25)+(enemy.effects?.some(x=>['poison','burn','bleed'].includes(x.type))?12:0)-(enemy.guardTurns>0?150:0);
 else {
  const defense=action.element==='physical'?(playerStats.def||0):(playerStats.md||0);
  const base=Math.max(1,enemy.atk*action.power-defense*.55);
  const factor=elementMultiplier(player,action.element);
  const predicted=base*factor;
  score=predicted*1.5+ (predicted>=player.hp?85:0)+(playerHp<.3?25:0);
  if(action.kind==='debuff')score+=player.effects?.some(x=>x.type==='poison')?-30:35;
  if(action.id==='strike')score+=12;
  if(archetype==='strategic')score+=factor>1?40*skill:factor===0?-120:0;
  if(archetype==='opportunist'&&playerHp<.35)score+=predicted*.6;
  if(archetype==='magical'&&action.element!=='physical')score+=30;
 }
 score*=style[action.kind==='heal'?'heal':action.kind==='guard'?'guard':action.kind==='debuff'?'debuff':'damage'];
 // Comuns variam mais; lendários priorizam a melhor ação.
 const noise=archetype==='wild'?55:45-skill*38;
 return score+(random()-.5)*noise;
}
export function chooseMonsterAction(enemy,player,options={}){
 const random=options.random||Math.random;
 const actions=availableMonsterActions(enemy).map(a=>a.id==='element'?{...a,element:enemy.attackElement||'fire'}:a);
 if(!actions.length)return skills[0];
 return actions.map(action=>({action,score:scoreMonsterAction(action,enemy,player,{...options,random})})).sort((a,b)=>b.score-a.score)[0].action;
}
export function finishMonsterAction(enemy,action){enemy.mp=Math.max(0,enemy.mp-action.cost);finishCooldownTurn(enemy,action.id,action.cooldown);}

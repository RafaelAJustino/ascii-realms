import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {active} from '../js/data.js';
import {PLAYER_COOLDOWNS,SPECIALIZATION_COOLDOWNS,skillKey,specKey,playerSkillCooldown,specSkillCooldown,turnsRemaining,canUse,finishCooldownTurn,tickCooldowns,resetCooldowns,normalizeCombatCooldowns} from '../js/turn-cooldowns.js';
import {availableMonsterActions,finishMonsterAction,chooseMonsterAction} from '../js/monster-ai.js';

assert.deepEqual(Object.keys(PLAYER_COOLDOWNS).sort(),Object.keys(active).sort());
for(const [cls,skills] of Object.entries(active)){
 assert.equal(skills.length,4);
 assert.equal(PLAYER_COOLDOWNS[cls].length,skills.length);
 for(let i=0;i<skills.length;i++){
  assert.ok(playerSkillCooldown(cls,i)>=1&&playerSkillCooldown(cls,i)<=5);
  assert.equal(skillKey(cls,i),`${cls}:skill:${i}`);
 }
}
assert.equal(Object.keys(SPECIALIZATION_COOLDOWNS).length,8);
for(const [spec,values] of Object.entries(SPECIALIZATION_COOLDOWNS)){
 assert.equal(values.length,2);assert.ok(values.every(v=>v>=1&&v<=5));assert.equal(specSkillCooldown(spec,0),values[0]);assert.match(specKey(spec,1),/spec:1$/);
}
// Sequência exata da especificação: 3 -> 3,2,1 -> disponível.
const player={cooldowns:{}};
const key=skillKey('guerreiro',1);
finishCooldownTurn(player,key,3);
assert.equal(turnsRemaining(player,key),3);
for(const expected of [2,1,0]){
 assert.equal(canUse(player,key),false);
 finishCooldownTurn(player);
 assert.equal(turnsRemaining(player,key),expected);
}
assert.equal(canUse(player,key),true);
// Duas habilidades são independentes, e a recém-usada nunca diminui no próprio turno.
finishCooldownTurn(player,skillKey('guerreiro',0),2);
finishCooldownTurn(player,skillKey('guerreiro',2),3);
assert.equal(turnsRemaining(player,skillKey('guerreiro',0)),1);
assert.equal(turnsRemaining(player,skillKey('guerreiro',2)),3);
tickCooldowns(player);
assert.equal(turnsRemaining(player,skillKey('guerreiro',0)),0);
assert.equal(turnsRemaining(player,skillKey('guerreiro',2)),2);
// Consultar/selecionar a habilidade, tentar ação inválida e passar o tempo não alteram o objeto.
const snapshot=structuredClone(player);
turnsRemaining(player,skillKey('guerreiro',2));canUse(player,skillKey('guerreiro',2));
assert.deepEqual(player,snapshot);
normalizeCombatCooldowns({cooldowns:{valid:3,bad:-1,huge:100,fraction:1.5}});
resetCooldowns(player);assert.deepEqual(player.cooldowns,{});
// IA deve respeitar recarga, MP e desbloqueio.
const enemy={lv:25,mp:100,maxmp:100,cooldowns:{},hp:80,maxhp:100,atk:60,archetype:'aggressive',rarityId:'elite',effects:[]};
const heavy=availableMonsterActions(enemy).find(a=>a.id==='heavy');
assert.ok(heavy);
finishMonsterAction(enemy,heavy);
assert.equal(enemy.mp,88);assert.equal(turnsRemaining(enemy,'heavy'),2);
assert.ok(!availableMonsterActions(enemy).some(a=>a.id==='heavy'));
for(const expected of [1,0]){
 const basic=availableMonsterActions(enemy).find(a=>a.id==='strike');
 finishMonsterAction(enemy,basic);
 assert.equal(turnsRemaining(enemy,'heavy'),expected);
}
assert.ok(availableMonsterActions(enemy).some(a=>a.id==='heavy'));
for(const skill of availableMonsterActions(enemy).filter(a=>a.id!=='strike'))enemy.cooldowns[skill.id]=4;
assert.equal(chooseMonsterAction(enemy,{hp:100,maxhp:100},{random:()=>0}).id,'strike');
// Integração: interface informa o cooldown, função de ação o rejeita antes do bloqueio.
const combat=readFileSync(new URL('../js/combat.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.match(combat,/!canUse\(c,cd\.id\)/);
assert.match(combat,/finishCooldownTurn\(c,used\?\.id,used\?\.turns\|\|0\)/);
assert.match(ui,/RECARGA:.*TURNO/);
assert.match(ui,/remaining>0/);
assert.match(combat,/tickCooldowns\(e\)/);
console.log('OK: 16 habilidades e 16 habilidades de especialização; sequência exata 3-2-1; independência; bloqueio de MP; IA; fallback; turnos reais.');

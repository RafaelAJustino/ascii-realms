import assert from 'node:assert/strict';
import { BOSS_PHASES,bossPhase,initBossPhases,updateBossPhase,announceBossAttack,resolveBossAttack,bossSpecialAvailable } from '../js/boss-phases.js';
import { maps } from '../js/data.js';
assert.equal(Object.keys(BOSS_PHASES).length,10);
for(const map of maps){const name=map[2],def=BOSS_PHASES[name];assert.ok(def, name);assert.equal(def.phases.length,3);assert.ok(def.special.name&&def.special.message);}
assert.equal(bossPhase(71,100),1);assert.equal(bossPhase(70,100),2);assert.equal(bossPhase(40,100),2);assert.equal(bossPhase(39,100),3);
for(const map of maps){const enemy=initBossPhases({boss:true,name:map[2],baseName:map[2],hp:100,maxhp:100,atk:30});let log=[];
 enemy.hp=35;assert.deepEqual(updateBossPhase(enemy,x=>log.push(x)),[2,3]);assert.deepEqual(enemy.phaseHistory,[1,2,3]);assert.deepEqual(updateBossPhase(enemy,x=>log.push(x)),[]);assert.equal(log.length,2);
 assert.equal(bossSpecialAvailable(enemy),true);assert.equal(announceBossAttack(enemy,x=>log.push(x)),true);assert.equal(bossSpecialAvailable(enemy),false);
 const player={hp:150,elementalAffinities:{}};const stats={def:8,md:8,maxhp:150};const damage=resolveBossAttack(enemy,player,stats,0,x=>log.push(x));assert.ok(damage>=0&&damage<=97);assert.equal(player.hp,150-damage);assert.equal(enemy.telegraph,null);assert.equal(enemy.bossSpecialCooldown,3);
 assert.equal(resolveBossAttack(enemy,player,stats,0,x=>log.push(x)),null);assert.equal(player.hp,150-damage);
 enemy.hp=0;assert.deepEqual(updateBossPhase(enemy,x=>log.push(x)),[]);
}
console.log('OK: 10 chefes, 3 fases, limites, salto de fases, anúncio, resolução única, derrota e limite de dano.');

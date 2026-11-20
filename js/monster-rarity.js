// Configuração centralizada de raridades dos encontros comuns.
export const MONSTER_RARITIES = Object.freeze([
 {id:'common',label:'Comum',chance:0.90,hp:1,attack:1,reward:1,drop:1},
 {id:'wanderer',label:'Errante',chance:0.05,hp:1.25,attack:1.10,reward:1.25,drop:1.25},
 {id:'elite',label:'Elite',chance:0.03,hp:1.75,attack:1.30,reward:1.75,drop:1.75},
 {id:'champion',label:'Campeão',chance:0.015,hp:2.50,attack:1.50,reward:2.50,drop:2.5},
 {id:'legendary',label:'Lendário',chance:0.005,hp:4,attack:1.80,reward:4,drop:4}
]);
export function rollMonsterRarity(random=Math.random){
 const value=random();let cumulative=0;
 for(const rarity of MONSTER_RARITIES){cumulative+=rarity.chance;if(value<cumulative)return rarity;}
 return MONSTER_RARITIES[MONSTER_RARITIES.length-1];
}
export function monsterRarity(id){return MONSTER_RARITIES.find(r=>r.id===id)||MONSTER_RARITIES[0];}

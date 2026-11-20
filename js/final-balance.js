/**
 * Etapa 8: funções puras para a dificuldade de combate.
 * Curva gradual depois da primeira região, sem depender do inventário/salvamento.
 */
export const BALANCE = Object.freeze({
  healthGrowthStart: 20,
  healthGrowthPerLevel: .01,
  healthGrowthLimit: .80,
  bossHealthPerLevel: .005,
  bossHealthLimit: .40,
  bossAttackMultiplier: 1.30,
  defenseMitigationLimit: .62
});

export function healthScale(level,boss=false){
 const after=Math.max(0,Math.min(100,Number(level)||0)-BALANCE.healthGrowthStart);
 return 1+Math.min(boss?BALANCE.bossHealthLimit:BALANCE.healthGrowthLimit,
  after*(boss?BALANCE.bossHealthPerLevel:BALANCE.healthGrowthPerLevel));
}

export function monsterHealth(level,boss,rarity=1,species=1){
 const base=35+level*13+level**1.3;
 return Math.max(1,Math.floor(base*(boss?6:rarity*species)*healthScale(level,boss)));
}

export function monsterAttack(level,boss,rarity=1,species=1){
 return Math.max(1,Math.floor((7+level*2.5)*(boss?BALANCE.bossAttackMultiplier:rarity*species)));
}

/** Defesa concede proteção crescente, porém sem tornar o personagem invulnerável. */
export function incomingDamage(raw,defense){
 if(!Number.isFinite(raw)||raw<=0)return 0;
 const safeDefense=Number.isFinite(defense)?Math.max(0,defense):0;
 const reduction=Math.min(BALANCE.defenseMitigationLimit,safeDefense/(safeDefense+raw*1.4));
 return Math.max(1,Math.floor(raw*(1-reduction)));
}

/** Maldições reduzem a eficiência da defesa, sem modificar atributos permanentes. */
export function effectiveProtection(defense,effects=[]){
 const penalty=Array.isArray(effects)?effects.filter(e=>e?.type==='defdown'&&e.duration>0)
  .reduce((value,e)=>Math.max(value,Math.min(.6,Math.max(0,e.power||0))),0):0;
 return Math.max(0,(Number.isFinite(defense)?defense:0)*(1-penalty));
}

export function worldDanger(level,area,hp,maxhp){
 const difference=Math.max(0,area-level),ratio=hp/Math.max(1,maxhp);
 if(difference>0||ratio<.25)return {label:'ALTO',message:'Recupere HP e confira o nível antes de explorar.'};
 if(ratio<.55||area%10===0)return {label:'MODERADO',message:'Leve poções e prepare uma habilidade defensiva.'};
 return {label:'CONTROLADO',message:'Mantenha equipamentos e recursos atualizados.'};
}

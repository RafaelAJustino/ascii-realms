import {bossKit} from './monster-identity.js';
import { applyElementalDamage } from './elements.js';
import {incomingDamage,effectiveProtection} from './final-balance.js';

// Fases e golpes são dados adicionais, sem modificar os atributos base dos chefes.
const definitions = [
 ['Guardião das Raízes',['Despertar das Raízes','Bosque Furioso','Coração da Floresta'],{name:'Abraço das Raízes',element:'physical',power:1.35,effect:'root',message:'As raízes se erguem ao redor do herói!'},'regen'],
 ['Escorpião Imperial',['Carapaça Imperial','Ferrão Mortal','Tempestade de Areia'],{name:'Ferrão Imperial',element:'poison',power:1.5,effect:'poison',message:'O ferrão do escorpião brilha com toxinas!'},'guard'],
 ['Hidra Venenosa',['Três Cabeças','Fúria Tóxica','Hidra Descontrolada'],{name:'Rajada de Presas',element:'poison',power:1.45,effect:'poison',message:'As cabeças da hidra se preparam para atacar juntas!'},'regen'],
 ['Golem Ancestral',['Pedra Viva','Núcleo Instável','Colosso de Ferro'],{name:'Martelo Sísmico',element:'physical',power:1.65,effect:'stun',message:'O golem ergue os punhos para esmagar o chão!'},'guard'],
 ['Rei Esquecido',['Trono Perdido','Coroa Maldita','Último Decreto'],{name:'Decreto Sombrio',element:'dark',power:1.5,effect:'curse',message:'O rei pronuncia uma sentença amaldiçoada!'},'guard'],
 ['Dragão Glacial',['Asas de Gelo','Nevasca Voraz','Inverno Eterno'],{name:'Sopro do Inverno',element:'ice',power:1.7,effect:'freeze',message:'O Dragão Glacial concentra energia congelante!'},'guard'],
 ['Senhor dos Mortos',['Sussurros Fúnebres','Colheita de Almas','Reino dos Mortos'],{name:'Colheita Vital',element:'dark',power:1.4,effect:'drain',message:'O Senhor dos Mortos invoca almas para drenar sua vida!'},'regen'],
 ['Demônio das Chamas',['Brasas Vivas','Inferno Crescente','Erupção Final'],{name:'Erupção Infernal',element:'fire',power:1.65,effect:'burn',message:'O demônio reúne chamas em uma esfera explosiva!'},'guard'],
 ['Serafim Corrompido',['Luz Fraturada','Asas Profanas','Juízo Final'],{name:'Julgamento Partido',element:'holy',power:1.6,effect:'curse',message:'O serafim reúne luz e sombras para o julgamento!'},'guard'],
 ['Entidade Primordial',['Forma Incerta','Ruptura Elemental','Fim dos Tempos'],{name:'Colapso Primordial',element:'lightning',power:1.7,effect:'burn',message:'O vazio distorce os elementos em torno da entidade!'},'regen']
];
export const BOSS_PHASES = Object.freeze(Object.fromEntries(definitions.map(([name,phases,special,defense])=>[name,{phases,special,defense}])));
export function bossPhase(hp,maxhp){const ratio=hp/Math.max(1,maxhp);return ratio>.7?1:ratio>=.4?2:3;}
export function initBossPhases(enemy){if(!enemy.boss)return enemy;enemy.bossPhase=1;enemy.phaseHistory=[1];enemy.telegraph=null;enemy.bossSpecialCooldown=0;return enemy;}
export function updateBossPhase(enemy,log=()=>{}){
 if(!enemy.boss||enemy.hp<=0)return [];
 const next=bossPhase(enemy.hp,enemy.maxhp),previous=enemy.bossPhase||1,definition=BOSS_PHASES[enemy.baseName];
 const changes=[];
 for(let phase=previous+1;phase<=next;phase++){
  if(!enemy.phaseHistory?.includes(phase)){
   enemy.phaseHistory??=[1];enemy.phaseHistory.push(phase);changes.push(phase);
   log(`✦ ${enemy.name}: FASE ${phase} · ${definition?.phases[phase-1]||'Fúria'}!`);
  }
 }
 enemy.bossPhase=Math.max(previous,next);
 return changes;
}
export function bossSpecialAvailable(enemy){return !!(enemy.boss&&enemy.bossPhase>=2&&!enemy.telegraph&&(enemy.bossSpecialCooldown||0)<=0&&BOSS_PHASES[enemy.baseName]);}
export function announceBossAttack(enemy,log){const special=BOSS_PHASES[enemy.baseName]?.special;if(!special)return false;const variant=bossKit(enemy)?.phaseAttacks[(enemy.bossPhase||1)>=3?1:0]||special;enemy.telegraph={...special,...variant,message:special.message};log(`⚠ ATAQUE IMINENTE! ${special.message} Você tem um turno para reagir.`);return true;}
export function resolveBossAttack(enemy,player,playerStats,guard,log){
 const attack=enemy.telegraph;if(!attack)return null;
 enemy.telegraph=null;enemy.bossSpecialCooldown=3;
 const defense=effectiveProtection(attack.element==='physical'?playerStats.def:playerStats.md,player.combatEffects);
 // Mesma mitigação dos ataques comuns e elementais.
 let damage=incomingDamage(enemy.atk*attack.power,defense);
 damage=applyElementalDamage(damage,{affinities:player.elementalAffinities||{}},attack.element);
 if(guard>0)damage=Math.ceil(damage*.45);
 damage=Math.ceil(damage*(1-(playerStats.damageReduction||0)));
 // Evita morte súbita inevitável por um único golpe anunciado em HP cheio.
 damage=Math.min(damage,Math.max(1,Math.floor(playerStats.maxhp*.65)));
 player.hp=Math.max(0,player.hp-damage);
 log(`${enemy.name} utilizou ${attack.name}: -${damage} HP!`);
 if(damage>0&&player.hp>0){
  if(['poison','burn'].includes(attack.effect)){
   player.combatEffects??=[];
   if(!player.combatEffects.some(x=>x.type===attack.effect))player.combatEffects.push({type:attack.effect,name:attack.effect==='burn'?'Queimadura':'Veneno',power:.025,duration:3});
  }else if(attack.effect==='drain'){
   const healed=Math.min(enemy.maxhp-enemy.hp,Math.ceil(damage*.3));enemy.hp+=healed;log(`${enemy.name} drenou ${healed} HP.`);
  }else if(attack.effect==='curse'||attack.effect==='root'||attack.effect==='freeze'||attack.effect==='stun'){
   player.combatEffects??=[];
   const type=attack.effect==='curse'?'defdown':'stun';
   if(!player.combatEffects.some(x=>x.type===type))player.combatEffects.push({type,name:attack.effect,duration:type==='defdown'?2:1,power:.25});
   log(`${enemy.name} aplicou ${attack.effect}!`);
  }
 }
 return damage;
}

import { maps } from './data.js';
import { rt } from './runtime.js';
import { gainXp } from './player.js';
import { save } from './storage.js';
import { render } from './ui.js';

export const QUESTS=maps.flatMap((m,region)=>{
 const base=region*10, reward=(boss=false)=>({xp:Math.round((12+(base+6)*9)*(boss?10:3)),gold:Math.round((8+(base+6)*4)*(boss?10:3)),consumables:{hp:boss?3:1}});
 return [
  ...[0,1].map((species)=>({id:`q${region}-kill${species}`,region,type:'kill',target:m[3+species],required:species?6:4,title:`Caçada: ${m[3+species]}`,description:`Derrote ${species?6:4} criaturas ${m[3+species]} em ${m[0]}.`,reward:reward()})),
  {id:`q${region}-collect`,region,type:'collect',target:m[6],required:3,title:`Suprimentos de ${m[0]}`,description:`Encontre e entregue 3 unidades de ${m[6]}.`,reward:reward()},
  {id:`q${region}-explore`,region,type:'explore',target:region,required:5,title:`Explorar ${m[0]}`,description:'Realize 5 explorações válidas neste mapa.',reward:reward()},
  {id:`q${region}-boss`,region,type:'boss',target:m[2],required:1,title:`Confrontar ${m[2]}`,description:`Derrote ${m[2]} e proteja ${m[1]}.`,reward:reward(true)}
 ];
});
export const questById=id=>QUESTS.find(q=>q.id===id);
export function questState(s=rt.state){s.quests??={active:{},completed:[]};s.quests.active??={};s.quests.completed??=[];s.quests.claimed??=[];return s.quests;}
export function questStatus(q,s=rt.state){const state=questState(s);if(state.claimed.includes(q.id))return 'Recompensa recebida';if(state.completed.includes(q.id))return 'Concluída';if(state.active[q.id])return 'Em andamento';return 'Disponível';}
export function acceptQuest(id){const q=questById(id),s=rt.state;if(!q||!s||s.combat||q.region!==Math.floor((rt.area-1)/10)||questStatus(q,s)!=='Disponível')return false;questState(s).active[id]={progress:0};if(q.type==='boss'&&s.bosses.includes(q.region)){delete questState(s).active[id];questState(s).completed.push(id);}save();render();return true;}
export function progressQuest(type,target,amount=1,s=rt.state){if(!s)return;const state=questState(s);for(const [id,entry] of Object.entries(state.active)){const q=questById(id);if(!q||q.type!==type||q.target!==target)continue;entry.progress=Math.min(q.required,Math.max(0,(entry.progress||0)+amount));if(entry.progress>=q.required&&type!=='collect'){delete state.active[id];if(!state.completed.includes(id))state.completed.push(id);}}}
export function collectProgress(q,s=rt.state){return Math.min(q.required,s.materials?.[q.target]||0);}
export function deliverQuest(id){const q=questById(id),s=rt.state;if(!q||q.type!=='collect'||!s||s.combat||questStatus(q,s)!=='Em andamento'||collectProgress(q,s)<q.required)return false;s.materials[q.target]-=q.required;delete questState(s).active[id];questState(s).completed.push(id);save();render();return true;}
export function claimQuest(id){const q=questById(id),s=rt.state;if(!q||!s||s.combat||questStatus(q,s)!=='Concluída')return false;const state=questState(s);state.completed=state.completed.filter(x=>x!==id);state.claimed.push(id);s.gold+=q.reward.gold;gainXp(q.reward.xp);for(const [type,n] of Object.entries(q.reward.consumables||{}))s.consumables[type]=(s.consumables[type]||0)+n;statAdd('goldEarned',q.reward.gold,s);statAdd('questsCompleted',1,s);save();render();return true;}
export const statDefaults=()=>({playTimeSeconds:0,monstersDefeated:0,bossesDefeated:0,deaths:0,damageDealt:0,highestDamage:0,damageTaken:0,goldEarned:0,goldSpent:0,itemsFound:0,questsCompleted:0,dungeonsCompleted:0});
export function statAdd(key,amount=1,s=rt.state){if(!s||!Number.isFinite(amount)||amount<0)return;s.statistics??=statDefaults();s.statistics[key]=(s.statistics[key]||0)+amount;}
export function recordEncounter(e,s=rt.state){if(!s)return;const id=e.baseName||e.name;const entry=s.bestiary??={};const v=entry[id]??={encounters:0,wins:0,losses:0};v.encounters++;}
export function recordOutcome(e,win,s=rt.state){if(!s)return;const id=e.baseName||e.name;const entry=s.bestiary??={};const v=entry[id]??={encounters:0,wins:0,losses:0};v[win?'wins':'losses']++;}

// Conhecimento é registrado apenas após uma ação/afinidade realmente observada.
export function observeMonsterAction(enemy,action,s=rt.state){
 if(!s||!enemy||!action?.id)return false;
 const key=enemy.baseName||enemy.name;
 const entry=(s.bestiary??={})[key]??={encounters:0,wins:0,losses:0};
 entry.observedActions??={};
 const existing=entry.observedActions[action.id];
 entry.observedActions[action.id]={name:String(action.name||action.id).slice(0,60),count:Math.min(999,(existing?.count||0)+1)};
 return true;
}
export function observeMonsterAffinity(enemy,element,multiplier,s=rt.state){
 if(!s||!enemy||element==='physical'||!Number.isFinite(multiplier)||multiplier===1)return false;
 const key=enemy.baseName||enemy.name;
 const entry=(s.bestiary??={})[key]??={encounters:0,wins:0,losses:0};
 entry.observedAffinities??={};entry.observedAffinities[element]=multiplier;
 return true;
}

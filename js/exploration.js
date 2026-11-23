import {mapUnlocked,recordExplorationCompletion,resetExplorationSequence,encounterPending,selectChallengeMap} from './exploration-challenge.js';
import {areaBossWarning,miniBossForArea,stageBossForArea} from './area-bosses.js';
import {progressDynamic} from './dynamic-quests.js';
import {advanceAdventureExploration,adventureEntry} from './procedural-adventures.js';
import {regionSpecies} from './expanded-species.js';
import {secretDiscoveryChance,selectSecret,secretGuardianChance,recordSecret,SECRET_BY_ID} from './secrets.js';
import {FORGE_MATERIALS} from './crafting.js';
import {creditNarrativeChoice} from './city-life.js';
import {progressQuest,statAdd} from './progression.js';
import {rt} from './runtime.js';
import {maps} from './data.js';
import {mapId} from './utils.js';
import {advanceWorldClimate,regionConditions,encounterChance,narrativeChance} from './world-climate.js';
import {stats} from './player.js';
import {save} from './storage.js';
import {combat} from './combat.js';
import {render} from './ui.js';
import {PATHS,activeJourney,choosePath,endJourney,addJourneyLog,canExplore} from './journey-paths.js';
import {EVENT_CHANCE,pickNarrativeEvent,pendingEvent,resolveNarrativeChoice,campAvailable,campRestStatus,restAtCamp,useCampConsumable} from './journey-events.js';
export function openPaths(){if(encounterPending(rt.state)){rt.screen='miniBoss';render();return true;}
 if(rt.state?.journey?.pendingKind==='merchant'){rt.screen='merchant';rt.shop='merchant';render();return true;}
 if(!canExplore(rt.state,rt.area))return false;
 if(activeJourney(rt.state)){rt.screen='journey';render();return true;}
 rt.screen='paths';render();return true;
}
export function selectPath(id){if(!canExplore(rt.state,rt.area)||!choosePath(rt.state,id))return false;
 rt.screen='journey';rt.log=[];save();render();return true;
}
function finishJourney(destination){if(!activeJourney(rt.state)||rt.state.combat||pendingEvent(rt.state)||encounterPending(rt.state))return false;
 endJourney(rt.state);rt.screen=destination;if(rt.shop==='merchant')rt.shop='weapon';rt.log=[];save();render();return true;
}
export function returnToHome(){return finishJourney('world');}
/** Saída explícita da expedição: acesso direto aos serviços da cidade, sem tela intermediária. */
export function returnToCity(){return finishJourney('city');}
/** Chamada apenas após a resolução real de uma etapa, nunca no clique de Explorar. */
export function completeExplorationStep(){
 const s=rt.state;if(!activeJourney(s)||!s.journey.pendingKind)return false;
 s.journey.pendingKind=null;
 const region=mapId(rt.area);s.journey.steps++;s.narrative.explorations++;progressQuest('explore',region);progressDynamic(s,'explore',region);
 const result=recordExplorationCompletion(s,rt.area);
 if(result.hint)addJourneyLog(s,areaBossWarning(rt.area,result.hint));
 if(result.triggered){addJourneyLog(s,`Uma presença poderosa se revela: ${miniBossForArea(rt.area)?.name||stageBossForArea(rt.area)?.name}. O desafio chegou!`);rt.screen='miniBoss';rt.log=['O guardião do território finalmente se revela.'];}
 return result;
}
/** Abandonar/fugir não conclui a etapa que estava pendente. */
export function cancelExplorationStep(){if(rt.state?.journey)rt.state.journey.pendingKind=null;}
/** Comprar ou ignorar mercadorias conclui o encontro apenas ao sair do mercante. */
export function finishTravelingMerchant(){
 if(!activeJourney(rt.state)||rt.state.journey.pendingKind!=='merchant'||rt.screen!=='merchant')return false;
 completeExplorationStep();if(!encounterPending(rt.state))rt.screen='journey';rt.shop='weapon';save();render();return true;
}
/** O encontro hostil mantém as chances da etapa 1 (72/80/86%).
 * Apenas o subconjunto não-hostil pode originar eventos inéditos.
 * Os resultados tradicionais continuam disponíveis, sem repetição de recompensas únicas.
 */
export function explore(){
 if(!activeJourney(rt.state)||pendingEvent(rt.state)||rt.state.journey.pendingKind||!canExplore(rt.state,rt.area)||rt.busy)return false;
 rt.state.journey.pendingKind='combat';
 const path=rt.state.journey.path;
 const climate=advanceWorldClimate(rt.state,mapId(rt.area));
 if(climate?.announcement)addJourneyLog(rt.state,climate.announcement);
 const conditions=regionConditions(rt.state,mapId(rt.area));
 const chance=encounterChance(PATHS[path].combatChance,conditions);
 const roll=Math.random();
 if(roll<chance){
  // O guardião é uma variante rara e opcional do encontro hostil já sorteado.
  const region=mapId(rt.area),guardian=Math.random()<secretGuardianChance(rt.state,region,path);
  save();combat(false,guardian);return true;
 }
 // Pistas de missões aceitas têm prioridade entre acontecimentos não hostis.
 const currentAdventure=adventureEntry(rt.state,mapId(rt.area));
 if(currentAdventure?.entry?.phase==='investigate'){
  const clue=advanceAdventureExploration(rt.state,mapId(rt.area));
  if(clue){completeExplorationStep();addJourneyLog(rt.state,clue.text);rt.log=[clue.text];if(!encounterPending(rt.state))rt.screen='journey';save();render();return true;}
 }
 if(rt.state.narrative.completed.length>0&&Math.random()<secretDiscoveryChance(path,conditions)){
  const secret=selectSecret(rt.state,mapId(rt.area));
  if(secret){rt.state.journey.pendingKind='event';rt.state.journey.event=secret.id;rt.screen='journey';rt.log=[`Descoberta rara: ${secret.title}.`];save();render();return true;}
 }
 if(Math.random()<narrativeChance(EVENT_CHANCE[path],conditions)){
  const event=pickNarrativeEvent(rt.state);
  if(event){rt.state.journey.pendingKind='event';rt.state.journey.event=event.id;rt.screen='journey';rt.log=[];save();render();return true;}
 }
 // Descobertas opcionais surgem sem substituir eventos já escolhidos.
 if(!currentAdventure?.entry){const lead=advanceAdventureExploration(rt.state,mapId(rt.area));
  if(lead){completeExplorationStep();addJourneyLog(rt.state,lead.text);rt.log=[lead.text];if(!encounterPending(rt.state))rt.screen='journey';save();render();return true;}}
 const remaining=(roll-chance)/(1-chance);
 if(remaining<.5){rt.state.journey.pendingKind='merchant';rt.screen='merchant';rt.shop='merchant';rt.log=['Um mercante viajante oferece seus produtos.'];addJourneyLog(rt.state,'Encontrou um mercante viajante.');}
 else if(remaining<.75){let d=Math.ceil(stats().maxhp*(.08+Math.random()*.12));rt.state.hp=Math.max(0,rt.state.hp-d);statAdd('damageTaken',d);rt.log=[`Armadilha! Você perdeu ${d} HP.`];if(rt.state.hp===0){let lost=Math.floor(rt.state.gold*.1);rt.state.gold-=lost;rt.state.hp=stats().maxhp;rt.state.mp=stats().maxmp;rt.log.unshift(`Você desmaiou e perdeu ${lost} ouro.`);cancelExplorationStep();resetExplorationSequence(rt.state,rt.area);endJourney(rt.state);rt.screen='city';}
 else{completeExplorationStep();rt.screen=encounterPending(rt.state)?'miniBoss':'journey';}addJourneyLog(rt.state,rt.log);}
 else{let name=maps[mapId(rt.area)][6];rt.state.materials[name]=(rt.state.materials[name]||0)+1;const forgeMat=FORGE_MATERIALS[mapId(rt.area)];rt.state.materials[forgeMat]=(rt.state.materials[forgeMat]||0)+1;statAdd('itemsFound');rt.log=[`Você encontrou: ${name}.`];completeExplorationStep();rt.screen=encounterPending(rt.state)?'miniBoss':'journey';addJourneyLog(rt.state,rt.log);}
 save();render();return true;
}
export function chooseEventOption(eventId,choiceId){if(!activeJourney(rt.state)||rt.state.combat||rt.busy)return false;
 const current=stats();const result=resolveNarrativeChoice(rt.state,eventId,choiceId,{maxhp:current.maxhp,maxmp:current.maxmp,materialName:maps[mapId(rt.area)][6],record:statAdd});
 if(!result)return false;
 creditNarrativeChoice(rt.state,eventId,choiceId,mapId(rt.area));
 if(SECRET_BY_ID[eventId])recordSecret(rt.state,`Descoberta: ${SECRET_BY_ID[eventId].title}.`);
 addJourneyLog(rt.state,result.text);rt.log=[result.text];save();
 if(result.combat){
  rt.state.journey.pendingKind='combat';
  const bandit=result.enemyKind==='bandit'?regionSpecies(mapId(rt.area)).find(species=>species.humanoid)?.id:null;
  combat(false,false,bandit);
 }else{completeExplorationStep();if(!encounterPending(rt.state))rt.screen='journey';save();render();}
 return true;
}
export function openCamp(){if(!activeJourney(rt.state)||!campAvailable(rt.state)||rt.busy)return false;rt.screen='camp';render();return true;}
export function leaveCamp(){if(!activeJourney(rt.state)||rt.state.combat)return false;rt.screen='journey';render();return true;}
export function campRest(){if(!activeJourney(rt.state)||rt.screen!=='camp'||rt.busy)return false;
 const current=stats(),result=restAtCamp(rt.state,{maxhp:current.maxhp,maxmp:current.maxmp});if(!result)return false;
 advanceWorldClimate(rt.state,mapId(rt.area));
 statAdd('goldSpent',10);
 const message=`Descanso: +${result.hp} HP e +${result.mp} MP, custo 10 ouro.`;addJourneyLog(rt.state,message);rt.log=[message];save();
 if(result.ambush)combat();else render();return true;
}
export function campUsePotion(type){if(!activeJourney(rt.state)||rt.screen!=='camp'||rt.busy)return false;
 const current=stats();if(!useCampConsumable(rt.state,type,{maxhp:current.maxhp,maxmp:current.maxmp}))return false;
 const message=`Consumível ${type} utilizado no acampamento.`;addJourneyLog(rt.state,message);rt.log=[message];save();render();return true;
}
export function changeArea(n){if(n<1||n>100||encounterPending(rt.state)||!mapUnlocked(rt.state,n))return;if(activeJourney(rt.state))endJourney(rt.state);rt.area=n;rt.state.area=n;selectChallengeMap(rt.state,n);rt.screen='world';save();render();}

/** Etapa UX 4. Visões puras da expedição, sem sorteios ou alteração de estado. */
import {PATHS,activeJourney} from './journey-paths.js';
import {campRestStatus,CAMP_COOLDOWN} from './journey-events.js';
import {encounterChance,regionConditions} from './world-climate.js';

export const PATH_GUIDANCE=Object.freeze({
 safe:Object.freeze({tag:'MENOR RISCO',focus:'Menos encontros hostis',hint:'Trilhas conhecidas. Boa opção para explorar com menos combates.'}),
 unknown:Object.freeze({tag:'RISCO INTERMEDIÁRIO',focus:'Combate e descoberta',hint:'Rota equilibrada, com oportunidades de acontecimentos narrativos.'}),
 dangerous:Object.freeze({tag:'MAIOR RISCO',focus:'Mais encontros hostis',hint:'Trecho hostil. Algumas descobertas raras e guardiões dependem desta rota.'})
});

/** As porcentagens são instantâneas: o clima avança ANTES do próximo sorteio. */
export function pathChoices(state,area){
 const region=Math.max(0,Math.min(9,Math.floor((area-1)/10)));
 const conditions=regionConditions(state,region);
 return Object.values(PATHS).map(path=>({
  ...path,...PATH_GUIDANCE[path.id],
  encounterPercent:Math.round(encounterChance(path.combatChance,conditions)*100),
  nonHostilePercent:100-Math.round(encounterChance(path.combatChance,conditions)*100)
 }));
}
const percent=(value,max)=>Math.max(0,Math.min(100,Math.round(100*Math.max(0,Number(value)||0)/Math.max(1,Number(max)||1))));
export function journeyOverview(state,area,{maxhp,maxmp}={}){
 if(!activeJourney(state))return null;
 const path=PATHS[state.journey.path];
 const rest=campRestStatus(state);
 const route=pathChoices(state,area).find(choice=>choice.id===path.id);
 return {
  pathName:path.name,pathId:path.id,pathDescription:path.description,
  encounterPercent:route.encounterPercent,steps:state.journey.steps,
  hp:state.hp,maxhp,hpPercent:percent(state.hp,maxhp),
  mp:state.mp,maxmp,mpPercent:percent(state.mp,maxmp),
  pendingEvent:!!state.journey.event,
  last:state.journey.last||[],
  restRemaining:rest.remaining,canRest:rest.canRest,
  restProgress:Math.max(0,CAMP_COOLDOWN-rest.remaining),
  restGoal:CAMP_COOLDOWN
 };
}

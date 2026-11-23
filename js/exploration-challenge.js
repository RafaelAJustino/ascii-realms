/** Desafios de 100 áreas: 15 resultados concluídos, combate obrigatório e progressão persistente.
 * Áreas 10,20,...,100 usam o chefe da fase; as outras 90 usam um mini boss.
 * schemaVersion=2 migra os dez desafios regionais antigos sem bloquear mapas já acessíveis.
 */
export const REQUIRED_EXPLORATIONS=15;
export const FIRST_AREA=1, LAST_AREA=100;
const validArea = n => Number.isInteger(Number(n)) && Number(n)>=FIRST_AREA && Number(n)<=LAST_AREA;
const areaNumber = n => Math.min(LAST_AREA,Math.max(FIRST_AREA,Number(n)||1));
const streak = n => Number.isSafeInteger(n)?Math.max(0,Math.min(REQUIRED_EXPLORATIONS,n)):0;
export const isStageBossArea = area => validArea(area) && Number(area)%10===0;
export const challengeKind = area => isStageBossArea(area)?'boss':'mini';
export function emptyChallenge(){return {schemaVersion:2,currentMapId:1,consecutiveExplorations:0,consecutiveByMap:{},miniBossEncounterPending:false,pendingMapId:null,defeatedMiniBosses:{},defeatedStageBosses:{},unlockedThrough:1};}
function copyVictories(source,target,kind){
 if(!source||typeof source!=='object'||Array.isArray(source))return;
 for(const [id,won] of Object.entries(source))if(validArea(id)&&won===true&&(isStageBossArea(id)===(kind==='boss')))target[id]=true;
}
/** Migração estável, incluindo salvamentos de antes dos mini bosses (v14).
 * O legado destravava REGIÕES de 10 áreas, não mapas individuais.
 */
export function normalizeChallenge(value,legacyState={}){
 const c=emptyChallenge(),area=areaNumber(legacyState.area),legacy=value?.schemaVersion!==2;
 c.currentMapId=area;
 if(!legacy){
  c.unlockedThrough=validArea(value.unlockedThrough)?Number(value.unlockedThrough):1;
  for(const [id,count] of Object.entries(value.consecutiveByMap||{}))if(validArea(id))c.consecutiveByMap[id]=streak(count);
  copyVictories(value.defeatedMiniBosses,c.defeatedMiniBosses,'mini');
  copyVictories(value.defeatedStageBosses,c.defeatedStageBosses,'boss');
  // Compatibilidade com registros antigos de chefes guardados fora do desafio.
  for(const id of legacyState.bosses||[])if(Number.isInteger(id)&&id>=0&&id<10)c.defeatedStageBosses[(id+1)*10]=true;
 }else{
  const oldMini=value?.defeatedMiniBosses||{},bosses=new Set(legacyState.bosses||[]);
  // Mantém TODOS os mapas que a partida antiga já podia acessar.
  let highestRegion=Math.floor((area-1)/10);
  for(let region=1;region<10;region++){
   if(bosses.has(region-1)&&oldMini[region-1]===true)highestRegion=Math.max(highestRegion,region);
   if(!value&&bosses.has(region-1))highestRegion=Math.max(highestRegion,region);
  }
  c.unlockedThrough=Math.min(100,(highestRegion+1)*10);
  for(const id of bosses)if(Number.isInteger(id)&&id>=0&&id<10)c.defeatedStageBosses[(id+1)*10]=true;
  for(const id of Object.keys(oldMini))if(Number.isInteger(+id)&&+id>=0&&+id<10&&oldMini[id]===true)c.defeatedMiniBosses[+id*10+1]=true;
  const oldRegion=Math.floor((area-1)/10);
  if(value&&Number(value.currentMapId)===oldRegion){
   c.consecutiveByMap[area]=streak(value.consecutiveByMap?.[oldRegion]??value.consecutiveExplorations);
  }
 }
 // Tanto no novo formato como no legado, um combate especial pendente é recuperável.
 const pending=legacy?(Number(value?.pendingMapId)===Math.floor((area-1)/10)?area:null):Number(value?.pendingMapId);
 if(value?.miniBossEncounterPending===true&&validArea(pending)){
  c.miniBossEncounterPending=true;c.pendingMapId=pending;c.consecutiveByMap[pending]=REQUIRED_EXPLORATIONS;
 }
 c.consecutiveExplorations=streak(c.consecutiveByMap[area]||0);
 return c;
}
export function challengeFor(state){if(!state)return emptyChallenge();if(!state.explorationChallenge)state.explorationChallenge=emptyChallenge();return state.explorationChallenge;}
export function challengeCleared(state,area){
 if(!validArea(area))return false;
 const c=challengeFor(state);
 return isStageBossArea(area)?c.defeatedStageBosses?.[area]===true:c.defeatedMiniBosses?.[area]===true;
}
/** Mapas desbloqueiam pela vitória no desafio imediatamente anterior. */
export function mapUnlocked(state,area){
 if(!state||!validArea(area))return false;
 if(Number(area)===1)return true;
 const c=challengeFor(state),id=Number(area);
 const grandfathered=Math.max(1,Math.min(LAST_AREA,c.unlockedThrough||1));
 if(id<=grandfathered)return true;
 // Uma vitória isolada/inconsistente não pode pular desafios intermediários.
 for(let previous=grandfathered;previous<id;previous++)if(!challengeCleared(state,previous))return false;
 return true;
}
export function challengeProgress(state,area=state?.area){
 const c=challengeFor(state),id=Number(area),current=streak(c.consecutiveByMap?.[id]);
 const defeated=challengeCleared(state,id),pending=!!c.miniBossEncounterPending&&c.pendingMapId===id;
 return {area:id,kind:challengeKind(id),current,required:REQUIRED_EXPLORATIONS,percent:Math.round(current/REQUIRED_EXPLORATIONS*100),defeated,pending};
}
export function encounterPending(state){return !!challengeFor(state).miniBossEncounterPending;}
/** Reinicia qualquer sequência concluída ou não, sem apagar vitórias. */
export function resetExplorationSequence(state,area=state?.area){
 if(!state||!validArea(area))return false;
 const c=challengeFor(state),id=Number(area),before=streak(c.consecutiveByMap?.[id]);
 if(before>0){c.consecutiveByMap??={};c.consecutiveByMap[id]=0;}
 if(c.currentMapId===id)c.consecutiveExplorations=0;
 return before!==0;
}
/** Ao mudar de área, abandona ambas as sequências. Nunca transfere contagem. */
export function selectChallengeMap(state,area=state?.area){
 if(!state||!validArea(area)||encounterPending(state))return false;
 const c=challengeFor(state),id=Number(area),changed=c.currentMapId!==id;
 if(changed){resetExplorationSequence(state,c.currentMapId);resetExplorationSequence(state,id);}
 c.currentMapId=id;c.consecutiveExplorations=streak(c.consecutiveByMap?.[id]);
 return changed;
}
export function recordExplorationCompletion(state,area=state?.area){
 const c=challengeFor(state),id=Number(area);
 if(!validArea(id)||encounterPending(state)||c.currentMapId!==id)return {count:challengeProgress(state,id).current,triggered:false};
 const next=Math.min(REQUIRED_EXPLORATIONS,streak(c.consecutiveByMap[id])+1);
 c.consecutiveByMap[id]=next;c.consecutiveExplorations=next;
 if(next===REQUIRED_EXPLORATIONS){c.miniBossEncounterPending=true;c.pendingMapId=id;}
 return {count:next,triggered:next===REQUIRED_EXPLORATIONS,hint:[5,10,14].includes(next)?next:null};
}
/** Um único desfecho atômico: derrota ou vitória sempre zera contagem.
 * Vitória anterior continua registrada mesmo após novas derrotas.
 */
export function resolveMiniBoss(state,area,won){
 const c=challengeFor(state),id=Number(area);
 if(!validArea(id)||!c.miniBossEncounterPending||c.pendingMapId!==id)return false;
 c.miniBossEncounterPending=false;c.pendingMapId=null;
 if(won){const target=isStageBossArea(id)?c.defeatedStageBosses:c.defeatedMiniBosses;target[id]=true;}
 resetExplorationSequence(state,id);c.currentMapId=id;c.consecutiveExplorations=0;
 return true;
}

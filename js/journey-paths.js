/** Estado persistente da jornada, independente de combates e da interface. */
export const PATHS=Object.freeze({
 safe:Object.freeze({id:'safe',name:'Caminho Seguro',description:'Trilhas conhecidas e clareiras tranquilas. Menos encontros hostis.',combatChance:.72}),
 unknown:Object.freeze({id:'unknown',name:'Caminho Desconhecido',description:'Uma passagem incerta entre ruínas e vegetação antiga.',combatChance:.80}),
 dangerous:Object.freeze({id:'dangerous',name:'Caminho Perigoso',description:'Rastros ameaçadores conduzem a regiões pouco exploradas.',combatChance:.86})
});
export function emptyJourney(){return {path:null,area:null,steps:0,last:[],event:null};}
export function normalizeJourney(value,area){
 const safe=emptyJourney();if(!value||typeof value!=='object'||Array.isArray(value))return safe;
 if(!Object.hasOwn(PATHS,value.path)||!Number.isInteger(value.area)||value.area!==area)return safe;
 return {path:value.path,area,steps:Number.isSafeInteger(value.steps)&&value.steps>=0?Math.min(value.steps,1000000):0,last:Array.isArray(value.last)?value.last.filter(x=>typeof x==='string').slice(0,8).map(x=>x.slice(0,200)):[],event:typeof value.event==='string'?value.event:null};
}
export function activeJourney(state){return !!state?.journey?.path&&!!PATHS[state.journey.path]&&state.journey.area===state.area;}
export function addJourneyLog(state,messages){if(!activeJourney(state))return;const lines=(Array.isArray(messages)?messages:[messages]).map(x=>typeof x==='string'?x:x?.text).filter(x=>typeof x==='string');state.journey.last=[...lines,...state.journey.last].slice(0,8);}
export function choosePath(state,id){if(!state||!PATHS[id]||state.combat)return false;state.journey={...emptyJourney(),path:id,area:state.area};return true;}
export function endJourney(state){if(!state)return false;state.journey=emptyJourney();return true;}
export function canExplore(state,area){const region=Math.floor((area-1)/10);return !!state&&!state.combat&&area>=1&&area<=100&&area<=state.lv&&(region===0||state.bosses.includes(region-1));}

/** Tempo, clima e acontecimentos regionais. Etapa 7 sem companheiros.
 * O tempo avanca apenas em acoes de exploracao ou descanso.
 * Nenhum sorteio acontece ao carregar o salvamento ou renderizar a interface.
 */
export const TICKS_PER_DAY=12;
export const WEATHER_PERIOD=4;
export const REGION_EVENT_DURATION=7;
export const WEATHER=Object.freeze({
 clear:{name:'Ceu limpo',risk:0,narrative:1,description:'O tempo favorece a viagem.'},
 rain:{name:'Chuva',risk:-.01,narrative:1.10,description:'A chuva encobre parte da trilha.'},
 fog:{name:'Neblina',risk:.01,narrative:1.18,description:'A visibilidade esta reduzida.'},
 storm:{name:'Tempestade',risk:.02,narrative:1.12,description:'Trovoes ecoam pela regiao.'}
});
export const REGIONAL_EVENTS=Object.freeze({
 incursion:{name:'Incursao de monstros',description:'Patrulhas relatam criaturas perto das estradas.',risk:.02,narrative:1},
 caravan:{name:'Caravana desaparecida',description:'Um comboio nao chegou a seu destino.',risk:.01,narrative:1.2},
 festival:{name:'Festival regional',description:'Os habitantes compartilham historias e noticias.',risk:-.01,narrative:1.2},
 scarcity:{name:'Escassez de suprimentos',description:'Os viajantes procuram rotas alternativas.',risk:0,narrative:1.1},
 discovery:{name:'Vestigios antigos',description:'Rastros de um lugar esquecido atraem aventureiros.',risk:0,narrative:1.25}
});
const WEATHERS=['clear','clear','rain','fog','clear','storm','rain','fog'];
const REGIONAL_IDS=Object.keys(REGIONAL_EVENTS);
const integer=(v,min,max,fallback)=>Number.isSafeInteger(v)&&v>=min&&v<=max?v:fallback;
export function worldClimateDefaults(){return {tick:0,events:{},history:[]};}
export function normalizeWorldClimate(value){
 const result=worldClimateDefaults();if(!value||typeof value!=='object'||Array.isArray(value))return result;
 result.tick=integer(value.tick,0,1000000000,0);
 if(value.events&&typeof value.events==='object'&&!Array.isArray(value.events))for(const [region,entry] of Object.entries(value.events)){
  if(!/^([0-9])$/.test(region)||!entry||!REGIONAL_EVENTS[entry.id])continue;
  const expires=integer(entry.expires,0,1000000010,0);
  if(expires>result.tick)result.events[region]={id:entry.id,expires};
 }
 if(Array.isArray(value.history))result.history=value.history.filter(x=>typeof x==='string').slice(0,8).map(x=>x.slice(0,180));
 return result;
}
export function timeOfDay(state){const tick=state?.worldClimate?.tick||0;const hour=(6+(tick%TICKS_PER_DAY)*2)%24;return {day:Math.floor(tick/TICKS_PER_DAY)+1,hour,period:hour>=6&&hour<18?'Dia':'Noite'};}
export function regionWeather(state,region){const tick=state?.worldClimate?.tick||0;const block=Math.floor(tick/WEATHER_PERIOD);return WEATHERS[(block*5+region*3)%WEATHERS.length];}
export function regionalEvent(state,region){const w=state?.worldClimate;const e=w?.events?.[region];return e&&e.expires>w.tick&&REGIONAL_EVENTS[e.id]?{...REGIONAL_EVENTS[e.id],id:e.id,remaining:e.expires-w.tick}:null;}
export function regionConditions(state,region){
 const time=timeOfDay(state),weatherId=regionWeather(state,region),weather=WEATHER[weatherId],event=regionalEvent(state,region);
 // As variacoes sao pequenas; todos os resultados permanecem no intervalo [0,1].
 const risk=weather.risk+(time.period==='Noite'?.01:0)+(event?.risk||0);
 const narrative=weather.narrative*(event?.narrative||1);
 return {time,weatherId,weather,event,risk,narrative};
}
export function encounterChance(base,conditions){return Math.max(0,Math.min(1,Math.round((base+conditions.risk)*10000)/10000));}
export function narrativeChance(base,conditions){return Math.max(0,Math.min(1,Math.round(base*conditions.narrative*10000)/10000));}
/** Retorna uma descricao, sem produzir recompensa ou encontro extra. */
export function advanceWorldClimate(state,region,rng=Math.random){
 if(!state?.worldClimate||!Number.isInteger(region)||region<0||region>9)return null;
 const world=state.worldClimate;world.tick=Math.min(1000000000,world.tick+1);
 for(const [key,event] of Object.entries(world.events))if(event.expires<=world.tick)delete world.events[key];
 let announcement=null;
 // Somente uma janela a cada seis acoes, e nunca um novo evento enquanto o atual durar.
 if(world.tick%6===0&&!world.events[region]&&rng()<.20){
  const id=REGIONAL_IDS[Math.min(REGIONAL_IDS.length-1,Math.floor(rng()*REGIONAL_IDS.length))];
  world.events[region]={id,expires:world.tick+REGION_EVENT_DURATION};
  announcement=`Acontecimento regional: ${REGIONAL_EVENTS[id].name}.`;
  world.history=[announcement,...world.history].slice(0,8);
 }
 return {tick:world.tick,announcement};
}

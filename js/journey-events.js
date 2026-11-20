import {EPIC_EVENTS} from './epic-events.js';
import {SECRET_EVENTS,SECRET_BY_ID} from './secrets.js';
/** Eventos únicos de exploração. Consequências são processadas uma única vez na confirmação. */
export const NARRATIVE_EVENTS=Object.freeze([
 {id:'wounded-traveler',title:'Viajante ferido',description:'Um viajante ferido pede auxílio à beira da trilha.',choices:[{id:'help',label:'Ajudar (1 poção de vida)',requires:{consumable:'hp'},effect:{consume:'hp',gold:24,flag:'travelerHelped'},text:'O viajante agradece e entrega 24 ouro.'},{id:'guide',label:'Indicar o caminho seguro',effect:{gold:8,flag:'travelerGuided'},text:'O viajante segue sua indicação e lhe dá 8 ouro.'},{id:'leave',label:'Seguir em frente',effect:{},text:'Você continua sua jornada.'}]},
 {id:'forgotten-altar',title:'Altar abandonado',description:'Runas apagadas circundam um altar coberto por raízes.',choices:[{id:'pray',label:'Prestar homenagem',effect:{mpPercent:20,flag:'altarPrayed'},text:'O altar recupera parte de sua mana.'},{id:'search',label:'Procurar oferendas',effect:{material:1},text:'Você encontra um material regional.'},{id:'leave',label:'Não tocar no altar',effect:{},text:'Você deixa as runas intactas.'}]},
 {id:'suspicious-chest',title:'Baú suspeito',description:'Um baú antigo repousa próximo a marcas estranhas no solo.',choices:[{id:'open',label:'Abrir o baú',effect:{gold:34,damagePercent:10},text:'Você encontra 34 ouro, mas uma armadilha o atinge.'},{id:'inspect',label:'Examinar a fechadura',effect:{gold:12,flag:'carefulExplorer'},text:'Uma abertura lateral revela 12 ouro.'},{id:'ignore',label:'Ignorar o baú',effect:{},text:'O baú permanece fechado.'}]},
 {id:'trapped-creature',title:'Criatura aprisionada',description:'Uma pequena criatura se debate em uma armadilha.',choices:[{id:'release',label:'Libertar a criatura',effect:{flag:'creatureFreed',hpPercent:10},text:'A criatura aponta uma fonte que recupera sua vida.'},{id:'observe',label:'Observar de longe',effect:{},text:'Você reconhece o perigo e se afasta.'}]},
 {id:'attacked-caravan',title:'Caravana atacada',description:'Uma caravana abandonada bloqueia parte da estrada.',choices:[{id:'defend',label:'Enfrentar os saqueadores',effect:{combat:true,flag:'caravanDefended'},text:'Você se prepara para defender a caravana.'},{id:'supplies',label:'Recuperar suprimentos',effect:{material:1,damagePercent:7},text:'Você encontra materiais, mas sofre ferimentos.'},{id:'leave',label:'Procurar uma rota segura',effect:{},text:'Você evita os saqueadores.'}]},
 {id:'ancient-ruins',title:'Ruínas antigas',description:'Uma muralha antiga protege inscrições esquecidas.',choices:[{id:'study',label:'Estudar inscrições',effect:{mpPercent:15,flag:'ruinsRead'},text:'Você compreende parte das inscrições e recupera mana.'},{id:'gather',label:'Procurar fragmentos',effect:{material:2},text:'Você recolhe dois materiais regionais.'},{id:'leave',label:'Seguir caminho',effect:{},text:'Você deixa as ruínas para trás.'}]},
 {id:'mysterious-spring',title:'Fonte misteriosa',description:'Água transparente brota de uma pedra antiga.',choices:[{id:'drink',label:'Beber da fonte',effect:{hpPercent:25},text:'A fonte restaura parte de sua vida.'},{id:'fill',label:'Encher um recipiente',effect:{potion:'hp'},text:'Você guarda uma poção de vida.'},{id:'leave',label:'Não beber',effect:{},text:'Você mantém distância.'}]},
 {id:'lost-merchant',title:'Mercador perdido',description:'Um comerciante perdeu suas provisões na estrada.',choices:[{id:'help',label:'Ajudar a procurar',effect:{gold:20,flag:'merchantHelped'},text:'O comerciante recompensa sua ajuda com 20 ouro.'},{id:'trade',label:'Pedir uma poção',effect:{potion:'mp'},text:'O comerciante compartilha uma poção de mana.'},{id:'leave',label:'Seguir adiante',effect:{},text:'O comerciante permanece na estrada.'}]},
 {id:'abandoned-camp',title:'Acampamento abandonado',description:'Restos de uma fogueira indicam uma parada recente.',choices:[{id:'search',label:'Revistar o acampamento',effect:{gold:14,material:1},text:'Você encontra 14 ouro e material regional.'},{id:'rest',label:'Recolher-se por alguns minutos',effect:{mpPercent:12},text:'A tranquilidade restaura um pouco de mana.'},{id:'leave',label:'Não se aproximar',effect:{},text:'Você segue pela trilha.'}]},
 {id:'hidden-passage',title:'Passagem secreta',description:'Uma abertura quase invisível aparece entre as rochas.',choices:[{id:'enter',label:'Entrar pela passagem',effect:{gold:28,damagePercent:8,flag:'passageDiscovered'},text:'Você descobre 28 ouro, mas sofre escoriações.'},{id:'mark',label:'Marcar a localização',effect:{flag:'passageMarked'},text:'Você registra a posição da passagem.'},{id:'leave',label:'Continuar pela trilha',effect:{},text:'Você deixa a passagem intacta.'}]}
]);
export const EVENT_BY_ID=Object.freeze(Object.fromEntries([...NARRATIVE_EVENTS,...EPIC_EVENTS,...SECRET_EVENTS].map(event=>[event.id,event])));
export function narrativeDefaults(){return {completed:[],decisions:{},flags:{},explorations:0,lastRestAt:-5};}
export function normalizeNarrative(source){const base=narrativeDefaults();if(!source||typeof source!=='object'||Array.isArray(source))return base;
 const completed=Array.isArray(source.completed)?[...new Set(source.completed.filter(id=>Object.hasOwn(EVENT_BY_ID,id)))]:[];
 const decisions={};for(const id of completed){const choice=source.decisions?.[id];if(EVENT_BY_ID[id].choices.some(c=>c.id===choice))decisions[id]=choice;}
 const flags={};
 for(const event of Object.values(EVENT_BY_ID)){const choice=event.choices.find(c=>c.id===decisions[event.id]);if(choice?.effect.flag)flags[choice.effect.flag]=true;}
 return {completed,decisions,flags,explorations:Number.isSafeInteger(source.explorations)&&source.explorations>=0?Math.min(source.explorations,100000000):0,lastRestAt:Number.isInteger(source.lastRestAt)?Math.max(-5,Math.min(source.lastRestAt,100000000)): -5};
}
export function availableEvents(state){
 const region=Math.floor(((state?.journey?.area||state?.area||1)-1)/10);
 const path=state?.journey?.path;
 return [...NARRATIVE_EVENTS,...EPIC_EVENTS].filter(e=>{
  if(state.narrative.completed.includes(e.id))return false;
  if(e.regions&&!e.regions.includes(region))return false;
  if(e.paths&&!e.paths.includes(path))return false;
  if(e.requires?.flag&&!state.narrative.flags[e.requires.flag])return false;
  return true;
 });
}
export function pendingEvent(state){return state?.journey?.event?EVENT_BY_ID[state.journey.event]||null:null;}
/** Probabilidades condicionadas à exploração não-hostil. Sem alterar os encontros de combate. */
export const EVENT_CHANCE=Object.freeze({safe:.55,unknown:.65,dangerous:.70});
export function pickNarrativeEvent(state,rng=Math.random){const options=availableEvents(state);if(!options.length)return null;return options[Math.min(options.length-1,Math.floor(rng()*options.length))];}
export function canChoose(state,eventId,choiceId){const event=pendingEvent(state);if(!event||event.id!==eventId||state.narrative.completed.includes(eventId))return false;
 const choice=event.choices.find(x=>x.id===choiceId);if(!choice)return false;
 if(choice.requires?.consumable&&(state.consumables[choice.requires.consumable]||0)<=0)return false;
 if(choice.requires?.gold&&state.gold<choice.requires.gold)return false;
 if(choice.requires?.stat!==undefined&&(state.stats?.[choice.requires.stat]||0)<choice.requires.min)return false;
 return true;
}
export function resolveNarrativeChoice(state,eventId,choiceId,{maxhp,maxmp,materialName,record=()=>{}}){if(!canChoose(state,eventId,choiceId))return null;
 const event=EVENT_BY_ID[eventId],choice=event.choices.find(x=>x.id===choiceId),e=choice.effect;
 // Validar antes de modificar qualquer estado, e concluir atomicamente numa única execução.
 if(e.payGold&&state.gold<e.payGold)return null;
 if(e.consume){if((state.consumables[e.consume]||0)<1)return null;state.consumables[e.consume]--;}
 if(e.payGold){state.gold-=e.payGold;record('goldSpent',e.payGold);}
 if(e.gold){state.gold+=e.gold;record('goldEarned',e.gold);}
 if(e.material){state.materials[materialName]=(state.materials[materialName]||0)+e.material;record('itemsFound',e.material);}
 if(e.potion){state.consumables[e.potion]=(state.consumables[e.potion]||0)+1;record('itemsFound',1);}
 if(e.hpPercent)state.hp=Math.min(maxhp,state.hp+Math.ceil(maxhp*e.hpPercent/100));
 if(e.mpPercent)state.mp=Math.min(maxmp,state.mp+Math.ceil(maxmp*e.mpPercent/100));
 if(e.damagePercent){const damage=Math.ceil(maxhp*e.damagePercent/100),before=state.hp;state.hp=Math.max(1,before-damage);record('damageTaken',before-state.hp);}
 state.narrative.completed.push(eventId);state.narrative.decisions[eventId]=choiceId;
 if(e.flag)state.narrative.flags[e.flag]=true;
 state.journey.event=null;
 return {text:choice.text,combat:!!e.combat,enemyKind:e.enemyKind||null};
}
export const CAMP_COST=10,CAMP_COOLDOWN=5,CAMP_AMBUSH_CHANCE=.10;
export function campAvailable(state){return !!state?.journey?.path&&!state.combat&&!state.journey.event;}
export function campRestStatus(state){const left=Math.max(0,CAMP_COOLDOWN-(state.narrative.explorations-state.narrative.lastRestAt));return {remaining:left,canRest:campAvailable(state)&&left===0&&state.gold>=CAMP_COST};}
export function restAtCamp(state,{maxhp,maxmp},rng=Math.random){if(!campRestStatus(state).canRest)return null;
 state.gold-=CAMP_COST;state.narrative.lastRestAt=state.narrative.explorations;
 const hp=Math.min(maxhp-state.hp,Math.ceil(maxhp*.25));const mp=Math.min(maxmp-state.mp,Math.ceil(maxmp*.25));
 state.hp+=hp;state.mp+=mp;
 return {hp,mp,ambush:rng()<CAMP_AMBUSH_CHANCE};
}
export function useCampConsumable(state,type,{maxhp,maxmp}){if(!campAvailable(state)||!['hp','mp','elixir'].includes(type)||(state.consumables[type]||0)<=0)return false;
 if(type==='hp'&&state.hp>=maxhp||type==='mp'&&state.mp>=maxmp||type==='elixir'&&state.hp>=maxhp&&state.mp>=maxmp)return false;
 if(type==='hp')state.hp=Math.min(maxhp,state.hp+Math.ceil(maxhp*.45));
 else if(type==='mp')state.mp=Math.min(maxmp,state.mp+Math.ceil(maxmp*.45));
 else{state.hp=maxhp;state.mp=maxmp;}
 state.consumables[type]--;return true;
}

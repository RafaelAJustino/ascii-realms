import {tavernDefaults,normalizeTavern} from './tavern-stories.js';
/** Etapa 5. Cidades, NPCs, reputação e atividades. Regras puras, sem acesso ao DOM. */
import {maps} from './data.js';

export const LOCAL_NPCS=Object.freeze([
 {id:'ina-folhas',name:'Ina das Folhas',role:'Estalajadeira',trait:'acolhedora e observadora',dialog:'As árvores guardam mais histórias do que os viajantes.'},
 {id:'ravi-oasis',name:'Ravi Rubro',role:'Guia',trait:'pragmático e paciente',dialog:'No deserto, um caminho conhecido vale mais que ouro.'},
 {id:'nara-porto',name:'Nara da Névoa',role:'Barqueira',trait:'reservada e atenta',dialog:'A névoa esconde perigos, mas também atalhos.'},
 {id:'orim-ferro',name:'Orim Ferrovelho',role:'Ferreiro',trait:'orgulhoso e leal',dialog:'Uma lâmina confiável exige tempo e bons materiais.'},
 {id:'sel-ruinas',name:'Sel das Ruínas',role:'Arquivista',trait:'curiosa e meticulosa',dialog:'Nenhuma inscrição sobrevive por acaso.'},
 {id:'bora-neve',name:'Bora da Neve',role:'Caçadora',trait:'cautelosa e franca',dialog:'Se não respeitar o frio, nem chegará até o dragão.'},
 {id:'mirna-cinzento',name:'Mirna Cinzenta',role:'Curandeira',trait:'serena e desconfiada',dialog:'Nem toda maldição é visível aos olhos.'},
 {id:'tarek-cinzas',name:'Tarek das Cinzas',role:'Batedor',trait:'ousado e disciplinado',dialog:'As brasas parecem mortas até o vento mudar.'},
 {id:'aria-luz',name:'Aria da Luz',role:'Mensageira',trait:'idealista e determinada',dialog:'Toda promessa merece ser cumprida.'},
 {id:'nox-refugio',name:'Nox do Refúgio',role:'Vigia',trait:'silencioso e firme',dialog:'Aqui, lembrar quem você é já é uma vitória.'}
].map((npc,region)=>Object.freeze({...npc,region})));
export const RECURRING_NPCS=Object.freeze([
 {id:'elio-viajante',name:'Élio, o Viajante',role:'Viajante',trait:'grato e perseverante',flag:'travelerHelped',dialog:'Você me salvou na estrada. Desde então, posso viajar novamente.',reward:{type:'hp',amount:1,rep:4}},
 {id:'tomas-mercador',name:'Tomás, o Mercador',role:'Mercador',trait:'astuto e cordial',flag:'merchantHelped',dialog:'Reconheço quem me ajudou a recuperar minhas provisões.',reward:{gold:15,rep:2}}
].map(Object.freeze));
export const REP_MIN=-30, REP_MAX=100;
const validRegion=region=>Number.isInteger(region)&&region>=0&&region<10;
export function cityLifeDefaults(){return {reputation:Array(10).fill(0),npcs:{},rumorsSeen:[],quizAnswered:[],offersBought:[],forgeOrders:[],creditedEvents:[],tavern:tavernDefaults()};}
export function normalizeCityLife(source){
 const base=cityLifeDefaults();if(!source||typeof source!=='object'||Array.isArray(source))return base;
 const npcs={};const allowed=new Set([...LOCAL_NPCS,...RECURRING_NPCS].map(n=>n.id));
 for(const [id,value] of Object.entries(source.npcs||{})){if(allowed.has(id)&&value&&typeof value==='object'&&!Array.isArray(value))npcs[id]={talks:Number.isSafeInteger(value.talks)&&value.talks>=0?Math.min(999,value.talks):0,rewarded:!!value.rewarded};}
 const list=(key,valid)=>Array.isArray(source[key])?[...new Set(source[key].filter(valid))].slice(0,250):[];
 return {
  reputation:base.reputation.map((_,i)=>Number.isFinite(source.reputation?.[i])?Math.max(REP_MIN,Math.min(REP_MAX,Math.trunc(source.reputation[i]))):0),
  npcs,
  rumorsSeen:list('rumorsSeen',x=>typeof x==='string'&&/^\d:([0-9]+)$/.test(x)&&x.length<12),
  quizAnswered:list('quizAnswered',validRegion),
  offersBought:list('offersBought',x=>typeof x==='string'&&/^\d:\d+$/.test(x)&&x.length<24),
  forgeOrders:list('forgeOrders',validRegion),
  creditedEvents:list('creditedEvents',x=>typeof x==='string'&&x.length<64),
  tavern:normalizeTavern(source.tavern)
 };
}
export function reputation(state,region){return validRegion(region)?state.cityLife?.reputation?.[region]||0:0;}
export function reputationLabel(value){return value<0?'Desconfiada':value>=80?'Honrada':value>=50?'Respeitada':value>=20?'Conhecida':'Neutra';}
export function reputationDiscount(state,region){const n=reputation(state,region);return n>=80?15:n>=50?10:n>=20?5:0;}
export function cityPrice(state,region,base){if(!Number.isFinite(base)||base<0)return 0;return Math.max(1,Math.floor(base*(100-reputationDiscount(state,region))/100));}
export function addReputation(state,region,delta){if(!validRegion(region)||!Number.isFinite(delta))return 0;const rep=state.cityLife.reputation;const before=rep[region];rep[region]=Math.max(REP_MIN,Math.min(REP_MAX,before+Math.trunc(delta)));return rep[region]-before;}
const NARRATIVE_REPUTATION=Object.freeze({'wounded-traveler:help':8,'wounded-traveler:guide':2,'wounded-traveler:leave':-2,'trapped-creature:release':3,'attacked-caravan:defend':6,'attacked-caravan:supplies':-3,'lost-merchant:help':6,'ancient-ruins:study':2,'road-toll:intimidate':2,'road-toll:pay':-1,'caravan-ledger:keep':3,'caravan-ledger:sell':-3,'bandit-hideout:warn':5,'bandit-hideout:assault':4,'hungry-refugees:feed':5,'hungry-refugees:guide':2,'bandit-deserter:listen':2,'witness-confrontation:record':4,'stolen-medicine:recover':3,'stolen-medicine:spare':1,'ambushed-messenger:defend':4,'ambushed-messenger:divert':4});
export function creditNarrativeChoice(state,eventId,choiceId,region){const key=`${eventId}:${choiceId}`;if(state.cityLife.creditedEvents.includes(eventId))return 0;if(!state.narrative?.completed?.includes(eventId)||state.narrative?.decisions?.[eventId]!==choiceId)return 0;state.cityLife.creditedEvents.push(eventId);return addReputation(state,region,NARRATIVE_REPUTATION[key]||0);}
export function cityNpcs(state,region){if(!validRegion(region))return [];
 return [LOCAL_NPCS[region],...RECURRING_NPCS.filter(n=>state.narrative?.flags?.[n.flag])];
}
export function npcDialogue(state,npc,region){const met=state.cityLife.npcs[npc.id]?.talks||0;
 if(npc.id==='elio-viajante'&&state.narrative?.flags?.travelerHelped)return npc.dialog;
 if(npc.id==='tomas-mercador'&&state.narrative?.flags?.merchantHelped)return npc.dialog;
 if(reputation(state,region)>=50&&met>0)return `Sua palavra tem peso em ${maps[region][1]}. ${npc.dialog}`;
 return npc.dialog;
}
export function talkToNpc(state,region,id){const npc=cityNpcs(state,region).find(n=>n.id===id);if(!npc)return null;
 const old=state.cityLife.npcs[npc.id]||{talks:0,rewarded:false};const message=npcDialogue(state,npc,region);
 const result={message,received:0};if(npc.reward&&!old.rewarded){if(npc.reward.type){state.consumables[npc.reward.type]=(state.consumables[npc.reward.type]||0)+npc.reward.amount;result.received=npc.reward.amount;}
  if(npc.reward.gold){state.gold+=npc.reward.gold;result.gold=npc.reward.gold;}
  result.reputation=addReputation(state,region,npc.reward.rep);old.rewarded=true;
 }
 old.talks=Math.min(999,old.talks+1);state.cityLife.npcs[npc.id]=old;return result;
}
export function cityRumors(region,state=null){if(!validRegion(region))return [];const m=maps[region];return [
 `Dizem que ${m[3]} costuma ser visto nas trilhas de ${m[0]}.`,
 `Os moradores falam de ${m[2]}, que ameaça esta região.`,
 `O recurso ${m[6]} é procurado por ferreiros e aventureiros.`,
 ...(state?.narrative?.flags?.passageMarked||state?.narrative?.flags?.passageDiscovered?['Uma passagem secreta mencionada pelos viajantes ainda desperta curiosidade na taverna.']:[])
 ];}
export function hearRumor(state,region){const rumors=cityRumors(region,state);if(!rumors.length)return null;
 const seen=rumors.map((_,i)=>`${region}:${i}`);const index=seen.findIndex(key=>!state.cityLife.rumorsSeen.includes(key));const chosen=index<0?(state.cityLife.npcs[LOCAL_NPCS[region].id]?.talks||0)%rumors.length:index;
 const key=seen[chosen];if(!state.cityLife.rumorsSeen.includes(key))state.cityLife.rumorsSeen.push(key);return rumors[chosen];
}
export function cityQuizOptions(region){if(!validRegion(region))return [];const choices=[null,null,null];
 choices[region%3]=maps[region][3];choices[(region+1)%3]=maps[(region+1)%10][3];choices[(region+2)%3]=maps[(region+2)%10][3];return choices;}
export function canAnswerQuiz(state,region){return validRegion(region)&&!state.cityLife.quizAnswered.includes(region);}
export function answerQuiz(state,region,answer){if(!canAnswerQuiz(state,region)||!Number.isInteger(answer)||answer<0||answer>2)return null;
 state.cityLife.quizAnswered.push(region);const correct=answer===region%3;
 if(correct){state.gold+=12;addReputation(state,region,3);}return {correct,answer:maps[region][3],gold:correct?12:0};
}
const OFFER_SLOTS=['weapon','ring','body'];
/** O estoque é determinístico por região e a cada seis explorações. A ficha final do item é sorteada na compra, como no mercante existente. */
export function cityOffer(state,region){if(!validRegion(region))return null;
 const window=Math.floor(Math.max(0,state.narrative?.explorations||0)/6),slot=OFFER_SLOTS[(region+window)%OFFER_SLOTS.length],lv=Math.max(1,Math.min(state.lv,region*10+6));
 const rarity=state.narrative?.flags?.merchantHelped?2:1;
 const key=`${region}:${window}`,basePrice=Math.floor((lv*13+25)*(1+rarity*.8));
 return {key,region,window,slot,lv,rarity,basePrice,price:cityPrice(state,region,basePrice),sold:state.cityLife.offersBought.includes(key)};
}
export function canBuyOffer(state,region){const offer=cityOffer(state,region);return !!offer&&!offer.sold&&!state.combat&&state.gold>=offer.price;}
export function markOfferBought(state,offer){if(!offer||state.cityLife.offersBought.includes(offer.key))return false;
 state.cityLife.offersBought.push(offer.key);return true;}
export function forgeOrder(state,region){if(!validRegion(region))return null;
 const level=Math.max(1,Math.min(state.lv,region*10+6));const slot=region%2?'amulet':'weapon';
 const basePrice=Math.floor((level*13+25)*1.8),gold=Math.max(20,Math.ceil(basePrice*.65));
 const unlocked=[...(state.quests?.completed||[]),...(state.quests?.claimed||[])].some(id=>typeof id==='string'&&id.startsWith(`q${region}-`));
 return {region,level,slot,gold,rarity:1,material:maps[region][6],required:2,unlocked,completed:state.cityLife.forgeOrders.includes(region)};
}
export function canForgeOrder(state,region){const order=forgeOrder(state,region);return !!order&&order.unlocked&&!order.completed&&!state.combat&&state.gold>=order.gold&&(state.materials[order.material]||0)>=order.required;}
export function markForgeOrder(state,region){if(state.cityLife.forgeOrders.includes(region))return false;state.cityLife.forgeOrders.push(region);return true;}

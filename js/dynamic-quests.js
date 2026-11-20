/** Expansão Épica IV: cadeias de missões narrativas descobertas no mundo.
 * Módulo puro: as missões não dependem de relógio, DOM ou aleatoriedade por renderização.
 */
import {TAVERN_GUESTS,TAVERN_EVENTS} from './tavern-stories.js';
const REGION_STORIES=[
 ['O mapa que sangra','Rastros sob as raízes','Descubra por que os caminhos mudam durante a noite.','Encontre o esconderijo indicado pelo mapa.'],
 ['A dívida das dunas','O poço dos desaparecidos','Investigue a rota dos carregamentos perdidos.','Siga os rastros da caravana além do poço selado.'],
 ['Remédios no lodo','A barca sem tripulação','Investigue a origem da raiz negra.','Procure os responsáveis pelo barco abandonado.'],
 ['A assinatura de ferro','O eco da galeria','Examine as marcas deixadas no contrato de mineração.','Encontre provas na galeria interditada.'],
 ['Nomes sob a pedra','O selo dos saqueadores','Compare os registros das tumbas esquecidas.','Siga as pistas do selo funerário roubado.'],
 ['O rastro invisível','Cartas ao vento','Identifique o animal que ronda os abrigos de inverno.','Recolha testemunhos sobre as cartas perdidas.'],
 ['O sino da maldição','A vila dos esquecidos','Investigue o cântico ouvido na vigília.','Descubra o destino das famílias da vila esquecida.'],
 ['A ordem que arde','Marcas nas cinzas','Reúna o testemunho do desertor.','Examine os vestígios do comando incendiário.'],
 ['O juramento incompleto','A carta sem assinatura','Busque vestígios do juramento dos antigos guardiões.','Descubra a identidade do autor da carta.'],
 ['As memórias do vazio','A chama de vigília','Investigue a lembrança de um lugar que ainda não existe.','Preserve os registros da última sentinela.']
];
export const DYNAMIC_QUESTS=Object.freeze(REGION_STORIES.flatMap((titles,region)=>[0,1].map(stage=>Object.freeze({
 id:`dq-${region}-${stage}`,region,stage,title:titles[stage*2],description:titles[stage*2+1],
 required:stage?4:3,type:stage?'kill':'explore',
 reward:Object.freeze({xp:Math.round((region+1)*48*(stage?2:1)),gold:(region+1)*18*(stage?2:1)}),
 source:TAVERN_GUESTS[region*2].id,sourceEvent:TAVERN_EVENTS[region*2].id
}))));
export const DYNAMIC_BY_ID=Object.freeze(Object.fromEntries(DYNAMIC_QUESTS.map(q=>[q.id,q])));
export const dynamicDefaults=()=>({active:{},completed:[],claimed:[],decisions:{}});
export function normalizeDynamic(source){const d=dynamicDefaults();if(!source||typeof source!=='object'||Array.isArray(source))return d;
 const valid=id=>Object.hasOwn(DYNAMIC_BY_ID,id);
 const unique=arr=>Array.isArray(arr)?[...new Set(arr.filter(valid))]:[];
 d.claimed=unique(source.claimed);
 d.completed=unique(source.completed).filter(id=>!d.claimed.includes(id));
 for(const [id,val] of Object.entries(source.active||{}))if(valid(id)&&!d.completed.includes(id)&&!d.claimed.includes(id)&&Number.isInteger(val?.progress)&&val.progress>=0)d.active[id]={progress:Math.min(DYNAMIC_BY_ID[id].required,val.progress)};
 for(const [id,decision] of Object.entries(source.decisions||{}))if(valid(id)&&['investigate','protect'].includes(decision))d.decisions[id]=decision;
 return d;
}
export function dynamicUnlocked(state,quest){if(!quest)return false;
 const d=state.dynamicQuests||dynamicDefaults();
 if(quest.stage)return d.claimed.includes(`dq-${quest.region}-0`);
 const tavern=state.cityLife?.tavern;
 const discovered=tavern?.guestsMet?.includes(quest.source)||tavern?.completed?.includes(quest.sourceEvent);
 const regionEvents=state.narrative?.completed||[];
 // Alternativa: uma descoberta narrativa realizada na mesma região também revela o primeiro contato.
 return !!discovered||(quest.region===0&&regionEvents.includes('epic-ledger-fragment'));
}
export function dynamicStatus(state,quest){const d=state.dynamicQuests||dynamicDefaults();if(d.claimed.includes(quest.id))return 'Recompensa recebida';if(d.completed.includes(quest.id))return 'Concluída';if(d.active[quest.id])return 'Em andamento';return dynamicUnlocked(state,quest)?'Disponível':'Não descoberta';}
export function acceptDynamic(state,id,region){const q=DYNAMIC_BY_ID[id];if(!q||state.combat||region!==q.region||dynamicStatus(state,q)!=='Disponível')return false;state.dynamicQuests.active[id]={progress:0};return true;}
/** Somente ações concluídas contam. Chamadas duplicadas sem ação não são feitas pelo fluxo de jogo. */
export function progressDynamic(state,type,region,amount=1){if(!Number.isInteger(region)||amount<=0||!Number.isInteger(amount))return [];
 const d=state.dynamicQuests||dynamicDefaults(),finished=[];
 for(const [id,entry] of Object.entries(d.active)){
  const q=DYNAMIC_BY_ID[id];if(!q||q.type!==type||q.region!==region)continue;
  entry.progress=Math.min(q.required,entry.progress+amount);
  if(entry.progress>=q.required){delete d.active[id];d.completed.push(id);finished.push(id);}
 }
 return finished;
}
export function claimDynamic(state,id,decision){const q=DYNAMIC_BY_ID[id],d=state.dynamicQuests;if(!q||state.combat||!d?.completed.includes(id)||d.claimed.includes(id)||!['investigate','protect'].includes(decision))return null;
 d.completed=d.completed.filter(x=>x!==id);d.claimed.push(id);d.decisions[id]=decision;
 // Escolhas diferentes oferecem recompensas distintas, mas sempre limitadas.
 const gold=decision==='protect'?Math.floor(q.reward.gold*.65):q.reward.gold;
 const xp=decision==='investigate'?Math.floor(q.reward.xp*.8):q.reward.xp;
 state.gold+=gold;
 const reputation=decision==='protect'?2:1;
 if(state.cityLife?.reputation)state.cityLife.reputation[q.region]=Math.min(100,(state.cityLife.reputation[q.region]||0)+reputation);
 return {gold,xp,reputation,title:q.title,unlocked:q.stage===0?`dq-${q.region}-1`:null};
}

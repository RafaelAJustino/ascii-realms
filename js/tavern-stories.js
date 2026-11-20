/** Expansão Épica III. Visitas com encontros ocasionais e consequências duráveis.
 * Apenas estado e dados. Não depende do DOM nem de relógio real. */

export const TAVERNS=Object.freeze([
 'O Corvo das Raízes','A Última Duna','O Junco Negro','O Martelo Partido','A Ânfora Rachada',
 'A Lareira Branca','O Sino Velado','A Brasa Errante','O Cálice da Aurora','A Luz que Resta'
]);
const GUEST_DATA=[
 ['Mara da Trilha','Cartógrafa','Procura um mapa que não revela a mesma estrada duas vezes.','Um caminho riscado no pergaminho aponta para um refúgio esquecido.'],
 ['Dorian Quebra-Ramos','Lenhador','Perdeu companheiros ao seguir uma voz entre árvores.','Os lobos evitam a margem leste desde a última lua.'],
 ['Samir das Areias','Mercador','Guarda uma dívida com um batedor desaparecido.','O carregamento de água foi desviado para uma passagem seca.'],
 ['Ilya do Sal','Peregrina','Busca o último poço que ainda não foi tomado.','A água das dunas canta antes das tempestades.'],
 ['Vesna do Lodo','Herborista','Coleciona antídotos para salvar os moradores do pântano.','A raiz negra cresce perto dos barcos abandonados.'],
 ['Bram dos Juncos','Barqueiro','Viu luzes cruzarem a água sem deixar ondas.','Algumas balsas chegam vazias ao amanhecer.'],
 ['Edrik do Ferro','Mineiro','Desconfia de um contrato assinado com sangue.','As batidas vêm de uma galeria fechada há décadas.'],
 ['Runa Cinzel','Artesã','Tenta recuperar o molde de uma antiga lâmina.','Uma ordem antiga deixou marcas no minério.'],
 ['Cassian da Pedra','Escriba','Investiga nomes apagados de um mausoléu.','Um nome desaparecido aparece em três inscrições.'],
 ['Dália das Tumbas','Vigilante','Viu saqueadores carregarem um selo funerário.','Uma passagem foi lacrada antes da queda das ruínas.'],
 ['Oren do Inverno','Caçador','Rastreia uma criatura que não deixa pegadas.','O silêncio da neve anuncia uma ameaça próxima.'],
 ['Freya do Gelo','Mensageira','Carrega cartas sem destinatários conhecidos.','Um abrigo permanece aberto nas noites mais frias.'],
 ['Silas dos Sinos','Exorcista','Busca a origem de uma prece proibida.','A maldição começou antes de os sinos silenciarem.'],
 ['Mirela do Véu','Refugiada','Lembra do nome de uma vila apagada dos mapas.','As sombras repetem nomes de quem já partiu.'],
 ['Varek da Brasa','Desertor','Desobedeceu uma ordem de incendiar uma aldeia.','Um comandante ainda procura os que se recusaram a obedecer.'],
 ['Asha das Cinzas','Ferreira','Recolhe metal do campo de batalha.','O ferro das cinzas não aceita qualquer tempera.'],
 ['Elian da Aurora','Acólito','Duvida dos juramentos feitos pelos guardiões.','Nem todo selo protege o que parece proteger.'],
 ['Liora do Limiar','Diplomata','Procura um acordo entre ordens rivais.','Uma carta esquecida pode mudar uma antiga aliança.'],
 ['Nohr do Vazio','Andarilho','Lembra fragmentos de jornadas que não viveu.','No vazio, algumas lembranças são portas.'],
 ['Seren da Vigília','Sentinela','Mantém acesa uma chama contra a escuridão.','Uma luz solitária responde quando a noite aprofunda.']
];
export const TAVERN_GUESTS=Object.freeze(GUEST_DATA.map(([name,role,story,rumor],i)=>Object.freeze({id:`guest-${i}`,region:Math.floor(i/2),name,role,story,rumor})));
const EVENT_DATA=[
 ['mapa-rasgado','O mapa rasgado','Um viajante oferece um mapa danificado por uma tempestade.',['Guardar o mapa','Devolver ao dono','Ignorar a oferta']],
 ['voz-na-mata','Voz entre as árvores','Um lenhador pede ajuda para encontrar quem o chamou na floresta.',['Ouvir o relato','Doar suprimentos','Encerrar a conversa']],
 ['odre-perdido','O odre perdido','Um mercador encontra a marca de uma caravana desaparecida.',['Investigar a marca','Comprar a informação','Não se envolver']],
 ['poco-selado','O poço selado','Uma peregrina fala sobre um poço que foi fechado por ordem de soldados.',['Pedir detalhes','Ajudar a peregrina','Deixar o assunto']],
 ['raiz-negra','A raiz negra','Uma herborista procura alguém disposto a salvar um doente.',['Compartilhar um antídoto','Ouvir suas suspeitas','Recusar']],
 ['barco-vazio','O barco vazio','Um barqueiro afirma ter visto uma embarcação sem tripulação.',['Examinar o registro','Pagar pela travessia','Ignorar']],
 ['contrato-ferro','Contrato de ferro','Um mineiro mostra a assinatura de um contratante desconhecido.',['Guardar a cópia','Avisar o mineiro','Esquecer o contrato']],
 ['molde-perdido','Molde desaparecido','Uma artesã encontra o símbolo de uma ordem extinta.',['Estudar o símbolo','Ajudar na pesquisa','Descartar a pista']],
 ['nome-apagado','O nome apagado','Um escriba apresenta uma inscrição cujo nome foi raspado.',['Comparar registros','Proteger o manuscrito','Não investigar']],
 ['selo-funerario','O selo funerário','Uma vigilante denuncia saqueadores que roubaram um selo antigo.',['Registrar denúncia','Doar para a vigília','Não intervir']],
 ['rastro-sem-pegadas','Rastro sem pegadas','Um caçador jura que algo percorreu a neve sem deixar marcas.',['Ouvir seus planos','Ajudar com provisões','Duvidar']],
 ['cartas-do-frio','Cartas do frio','Uma mensageira possui correspondências de uma aldeia abandonada.',['Guardar uma carta','Indicar abrigo','Devolver as cartas']],
 ['sino-calado','O sino calado','Um exorcista revela um cântico que precedeu a maldição.',['Anotar o cântico','Oferecer proteção','Afastar-se']],
 ['vila-esquecida','A vila esquecida','Uma refugiada lembra os nomes de quem desapareceu.',['Preservar os nomes','Ouvir a história','Mudar de assunto']],
 ['ordem-das-cinzas','A ordem das cinzas','Um desertor confessa ter se recusado a queimar um povoado.',['Proteger seu relato','Denunciar a ordem','Ignorar a confissão']],
 ['metal-das-brasas','Metal das brasas','Uma ferreira identifica uma marca militar em um pedaço de metal.',['Guardar a marca','Ajudar na coleta','Rejeitar o achado']],
 ['juramento-velado','Juramento velado','Um acólito suspeita que um guardião ocultou parte de um juramento.',['Investigar o juramento','Pedir prudência','Não ouvir']],
 ['carta-da-aurora','Carta da aurora','Uma diplomata encontra uma carta sem assinatura entre duas ordens.',['Ler a carta','Preservar o acordo','Não tomar partido']],
 ['memoria-perdida','Memória perdida','Um andarilho relata uma lembrança de uma cidade ainda não visitada.',['Anotar a lembrança','Oferecer auxílio','Deixar para trás']],
 ['ultima-chama','A última chama','Uma sentinela conta que a última luz do refúgio está enfraquecendo.',['Proteger a chama','Compartilhar recursos','Seguir em frente']]
];
export const TAVERN_EVENTS=Object.freeze(EVENT_DATA.map(([id,title,description,choices],i)=>Object.freeze({id:`tavern-${id}`,region:Math.floor(i/2),guest:TAVERN_GUESTS[i].id,title,description,choices:Object.freeze(choices.map((label,j)=>Object.freeze({id:['investigate','help','leave'][j],label})))})));
const safeInt=(n,max)=>Number.isSafeInteger(n)&&n>=0?Math.min(n,max):0;
export function tavernDefaults(){return {visits:Array(10).fill(0),completed:[],decisions:{},pending:null,guestsMet:[],guestTalks:{}};}
export function normalizeTavern(source){const d=tavernDefaults();if(!source||typeof source!=='object'||Array.isArray(source))return d;
 const known=new Set(TAVERN_EVENTS.map(e=>e.id)),guestIds=new Set(TAVERN_GUESTS.map(g=>g.id));
 d.visits=d.visits.map((_,i)=>safeInt(source.visits?.[i],100000));
 d.completed=Array.isArray(source.completed)?[...new Set(source.completed.filter(x=>known.has(x)))]:[];
 d.decisions=Object.fromEntries(Object.entries(source.decisions||{}).filter(([key,value])=>known.has(key)&&['investigate','help','leave'].includes(value)&&d.completed.includes(key)));
 d.pending=known.has(source.pending)&&!d.completed.includes(source.pending)?source.pending:null;
 d.guestsMet=Array.isArray(source.guestsMet)?[...new Set(source.guestsMet.filter(x=>guestIds.has(x)))]:[];
 d.guestTalks=Object.fromEntries(Object.entries(source.guestTalks||{}).filter(([id])=>guestIds.has(id)).map(([id,n])=>[id,safeInt(n,999)]));
 return d;
}
export function tavernStory(state){return state.cityLife.tavern;}
function hash(s){let h=2166136261;for(const ch of s){h=Math.imul(h^ch.charCodeAt(0),16777619)}return h>>>0;}
/** Um único sorteio determinístico por VISITA real, sem temporizador e sem reroll por render. */
export function enterTavern(state,region){if(!Number.isInteger(region)||region<0||region>=10||state.combat)return null;
 const t=tavernStory(state);t.visits[region]++;
 if(t.pending)return TAVERN_EVENTS.find(e=>e.id===t.pending)||null;
 const eligible=TAVERN_EVENTS.filter(e=>e.region===region&&!t.completed.includes(e.id));
 if(!eligible.length)return null;
 const seed=hash(`${state.name}|${state.cls}|${region}|${t.visits[region]}`);
 if(seed%100>=38)return null;
 const event=eligible[Math.floor(seed/100)%eligible.length];t.pending=event.id;return event;
}
export function pendingTavernEvent(state,region){return TAVERN_EVENTS.find(e=>e.id===state.cityLife?.tavern?.pending&&e.region===region)||null;}
export function resolveTavernEvent(state,region,eventId,choiceId){const event=pendingTavernEvent(state,region),t=tavernStory(state);
 if(!event||event.id!==eventId||t.completed.includes(eventId))return null;
 const choice=event.choices.find(c=>c.id===choiceId);if(!choice)return null;
 // Decisões distintas: investigar rende informação, ajudar custa 5 ouro e dá reputação; ignorar não rende nada.
 if(choiceId==='help'&&state.gold<5)return null;
 let goldDelta=0,repDelta=0,summary='';
 if(choiceId==='investigate'){repDelta=1;summary='Uma pista foi registrada. Os moradores passam a confiar um pouco mais em você.';}
 else if(choiceId==='help'){state.gold-=5;goldDelta=-5;repDelta=4;summary='Você contribuiu com 5 ouro. O gesto fortaleceu sua relação com a cidade.';}
 else{repDelta=-1;summary='Você não se envolveu. A história terá outro desfecho.';}
 state.cityLife.reputation[region]=Math.max(-30,Math.min(100,state.cityLife.reputation[region]+repDelta));
 t.completed.push(eventId);t.decisions[eventId]=choiceId;t.pending=null;
 if(!t.guestsMet.includes(event.guest))t.guestsMet.push(event.guest);
 return {summary,repDelta,goldDelta,choiceId,eventId};
}
export function guestDialogue(state,guest){const t=tavernStory(state),e=TAVERN_EVENTS.find(x=>x.guest===guest.id);
 if(t.completed.includes(e.id)){
  const choice=t.decisions[e.id];return choice==='help'?'Sua ajuda não foi esquecida. '+guest.rumor:choice==='investigate'?'A pista que examinamos ainda pode ser importante. '+guest.rumor:'Ainda lembro da ocasião em que preferiu não se envolver.';
 }
 return guest.story;
}
export function guestForRegion(region,state=null){
 const current=TAVERN_GUESTS.filter(g=>g.region===region);
 // Visitantes de encontros concluídos podem reaparecer na cidade seguinte,
 // com diálogos que refletem a decisão efetivamente tomada.
 const recurrent=state&&region>0?TAVERN_GUESTS.filter(g=>g.region===region-1&&state.cityLife?.tavern?.guestsMet?.includes(g.id)):[];
 return [...current,...recurrent];
}

/** Falar nunca distribui ouro/itens, impedindo exploração de recompensas. */
export function talkToGuest(state,region,id){const guest=guestForRegion(region,state).find(g=>g.id===id);if(!guest)return null;
 const t=tavernStory(state),count=t.guestTalks[id]||0;
 const message=count%2===0?guestDialogue(state,guest):guest.rumor;
 t.guestTalks[id]=Math.min(999,count+1);
 if(!t.guestsMet.includes(id))t.guestsMet.push(id);
 return {message,guest:guest.name};
}

/** Expansão Épica V: aventuras narrativas controladas por uma semente persistente.
 * Não altera missões tradicionais nem a campanha principal. Sem relógio ou DOM.
 * Duas histórias escritas por região; a semente e as decisões anteriores definem
 * qual delas será apresentada. Cada história possui duas pistas e um desfecho.
 */
import {TAVERN_GUESTS,TAVERN_EVENTS} from './tavern-stories.js';

const STORY_DATA=[
 [
  ['A testemunha das raízes','Uma cartógrafa fala de trilhas usadas por saqueadores para desviar caravanas.','Uma fivela com a marca dos salteadores está cravada em um tronco.','Pegadas recentes levam a um posto escondido sob as raízes.','Os assaltantes ainda protegem o acesso ao posto.','A cartógrafa reconhece as marcas e aceita guardar as provas.','Os registros revelam quem financia os ataques.'],
  ['A carta do lenhador','Um lenhador procura uma carta perdida entre as trilhas da mata.','Uma tira de pergaminho está presa a uma árvore tombada.','Um selo de cera indica que a carta foi aberta por alguém da região.','A carta precisa chegar ao lenhador antes que desapareça outra testemunha.','A entrega permite que uma família encontre refúgio.','A mensagem revela uma rota secreta para os moradores.']
 ],
 [
  ['O cobrador das dunas','Um mercador acusa homens armados de cobrar pedágio sobre a água.','Moedas marcadas foram enterradas perto de um marco de pedra.','O registro da caravana cita o mesmo capitão duas vezes.','Os cobradores continuam vigiando as dunas.','As contas revelam os intermediários da rota.','O comércio de água poderá ser investigado sem destruir o poço.'],
  ['O último odre','Uma peregrina deseja entregar água a um abrigo isolado.','Um odre intacto foi escondido sob uma formação de sal.','As marcas da tampa apontam para o abrigo mencionado na taverna.','O odre deve ser devolvido antes da próxima travessia.','Os viajantes recebem água suficiente para seguir adiante.','O poço continua acessível aos moradores.']
 ],
 [
  ['A barca dos contrabandistas','Uma herborista suspeita que ladrões desviaram remédios pelos canais.','Uma corda marcada com tinta negra prende um barco abandonado.','Restos de caixas revelam uma rota de contrabando.','Os contrabandistas ainda usam o canal.','Os remédios podem voltar aos doentes.','O mapa dos canais permanece com a comunidade.'],
  ['O remédio perdido','Um barqueiro procura o registro de uma mistura usada contra a febre.','Uma página úmida contém o primeiro ingrediente.','O segundo fragmento descreve como preparar a dose.','O registro precisa voltar à taverna para alcançar a herborista.','A receita poderá salvar outros moradores.','O conhecimento é preservado antes que apodreça.']
 ],
 [
  ['O juramento da forja','Um mineiro denuncia homens armados que expulsaram trabalhadores.','Uma ferramenta marcada foi deixada na galeria vazia.','As ordens roubadas mencionam uma escolta mercenária.','Os mercenários ainda vigiam o caminho de minério.','A mina pode voltar aos trabalhadores.','A assinatura do contratante aparece nas provas.'],
  ['As páginas de Runa','Uma artesã precisa recuperar o molde descrito por sua antiga mestra.','O primeiro desenho está sob pedras partidas.','Uma placa metálica completa a inscrição do molde.','Os desenhos devem chegar à artesã na taverna.','O molde será preservado na oficina.','O conhecimento pode ser compartilhado com outros ferreiros.']
 ],
 [
  ['O selo dos ladrões de tumbas','Um escriba descobriu que saqueadores vendem inscrições funerárias.','Uma lasca gravada foi escondida perto de uma coluna.','Um inventário roubado lista nomes de túmulos violados.','Os ladrões continuam rondando as ruínas.','Os nomes dos mortos poderão ser restaurados.','As rotas de saque ficarão registradas.'],
  ['O epitáfio perdido','Uma vigilante procura páginas arrancadas de um livro de sepultamentos.','O primeiro nome surge na parede de uma galeria.','Uma folha lacrada completa a lista dos desaparecidos.','O livro precisa voltar aos guardiões das ruínas.','As famílias recebem um registro dos seus mortos.','Os nomes permanecerão preservados.']
 ],
 [
  ['Caçada no abrigo branco','Um caçador denuncia assaltantes que roubam os abrigos durante as tempestades.','Uma pegada de bota rompe a neve perto de um depósito.','Uma bandeira rasgada revela o grupo responsável.','Os ladrões ainda vigiam a única passagem segura.','Os abrigos poderão ser abastecidos novamente.','As marcas dos assaltantes serão reconhecidas no futuro.'],
  ['Cartas na nevasca','Uma mensageira perdeu cartas que deveriam alcançar um vilarejo isolado.','Uma carta surgiu sob um bloco de gelo.','Outra mensagem foi protegida por um velho abrigo.','As cartas precisam ser entregues à mensageira.','Os moradores descobrem que ainda têm parentes vivos.','Os destinatários recebem as mensagens originais.']
 ],
 [
  ['A vigília do sino','Um exorcista teme que saqueadores profanem uma torre esquecida.','Um fragmento de bronze caiu junto à muralha.','O livro da torre menciona homens levando o badalo.','Os profanadores permanecem junto à estrada maldita.','O sino poderá ser restaurado.','O registro da profanação será guardado.'],
  ['A lista dos esquecidos','Uma refugiada tenta recuperar os nomes de sua antiga vila.','Uma parede riscada guarda parte dos nomes.','Um documento encontrado entre as ruínas completa a lista.','A lista deve retornar à refugiada na taverna.','As famílias serão lembradas.','Os nomes deixarão de desaparecer da memória.']
 ],
 [
  ['Os desertores das cinzas','Um desertor afirma que antigos companheiros cobram tributos em nome de uma ordem caída.','Uma insígnia de ferro surge entre brasas frias.','Uma ordem queimada revela o capitão responsável.','Os mercenários ainda controlam a estrada.','O povoado poderá abrir novamente suas portas.','O testemunho do desertor será protegido.'],
  ['O metal de Asha','Uma ferreira procura marcas que permitam identificar sobreviventes da guerra.','Uma peça de armadura exibe um nome quase apagado.','Um estandarte queimado confirma a unidade desaparecida.','As provas devem chegar à ferreira na taverna.','As famílias receberão notícias.','O relato da unidade será preservado.']
 ],
 [
  ['O juramento quebrado','Um acólito investiga saqueadores que roubam símbolos sagrados.','Uma placa luminosa foi retirada de um altar.','Um registro menciona a rota dos profanadores.','Os saqueadores permanecem nas passagens elevadas.','O relicário poderá ser reparado.','O juramento original será conhecido.'],
  ['A carta da aurora','Uma diplomata procura a mensagem que pode encerrar uma disputa antiga.','Metade do selo foi encontrada junto às muralhas.','O fragmento restante identifica o emissário.','A mensagem deve voltar à diplomata na taverna.','As ordens poderão voltar a conversar.','O acordo poderá ser negociado.']
 ],
 [
  ['O preço da memória','Um andarilho relata ladrões que comercializam lembranças gravadas em pedra.','Um fragmento escuro conserva uma voz distante.','A marca de um mercador liga as pedras a uma caravana.','Os ladrões ainda estão nas sombras da passagem.','As memórias roubadas podem ser devolvidas.','Os nomes esquecidos serão preservados.'],
  ['O fogo da sentinela','Uma sentinela procura inscrições necessárias para manter uma antiga chama acesa.','Uma runa foi encontrada num arco quebrado.','Uma segunda inscrição descreve o ritual de vigília.','As inscrições precisam voltar à sentinela na taverna.','A chama poderá ser mantida durante a noite.','A vigília poderá seguir por mais uma geração.']
 ]
];

export const ADVENTURE_STORIES=Object.freeze(STORY_DATA.flatMap((pair,region)=>pair.map(([title,lead,clue1,clue2,threat,report,protect],variant)=>Object.freeze({
 id:`adventure-${region}-${variant}`,region,variant,title,lead,clues:Object.freeze([clue1,clue2]),threat,
 endings:Object.freeze({report,protect}),
 type:variant===0?'hunt':'delivery',
 sourceGuest:TAVERN_GUESTS[region*2+variant].id,
 sourceEvent:TAVERN_EVENTS[region*2+variant].id,
 huntTarget:2,
 reward:Object.freeze({xp:Math.round((region+1)*65),gold:(region+1)*24})
}))));
export const ADVENTURE_BY_ID=Object.freeze(Object.fromEntries(ADVENTURE_STORIES.map(story=>[story.id,story])));

export function stringHash(text){let h=2166136261;for(const char of String(text))h=Math.imul(h^char.charCodeAt(0),16777619);return h>>>0;}
export function newAdventureSeed(random=Math.random){return Math.floor(Math.min(.999999999,Math.max(0,random()))*4294967296)>>>0;}
export const adventureDefaults=(seed=0)=>({seed:seed>>>0,selected:{},entries:{},completed:[],decisions:{},journal:[]});
export function normalizeAdventure(value,fallbackSeed=0){const a=adventureDefaults(Number.isSafeInteger(value?.seed)&&value.seed>=0&&value.seed<=0xffffffff?value.seed:fallbackSeed);
 if(!value||typeof value!=='object'||Array.isArray(value))return a;
 for(const [region,id] of Object.entries(value.selected||{}))if(/^\d$/.test(region)&&ADVENTURE_BY_ID[id]?.region===Number(region))a.selected[region]=id;
 for(const [id,entry] of Object.entries(value.entries||{}))if(ADVENTURE_BY_ID[id]&&a.selected[String(ADVENTURE_BY_ID[id].region)]===id&&entry&&typeof entry==='object'){
  const phases=['available','investigate','hunt','delivery','decision','done'];const phase=phases.includes(entry.phase)?entry.phase:'available';
  const clues=[...new Set((Array.isArray(entry.clues)?entry.clues:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<2))];
  a.entries[id]={phase,clues,kills:Number.isInteger(entry.kills)?Math.max(0,Math.min(2,entry.kills)):0};
 }
 a.completed=[...new Set(Array.isArray(value.completed)?value.completed.filter(id=>a.entries[id]?.phase==='done'):[])];
 for(const [id,choice] of Object.entries(value.decisions||{}))if(a.completed.includes(id)&&['report','protect'].includes(choice))a.decisions[id]=choice;
 a.journal=Array.isArray(value.journal)?value.journal.filter(line=>typeof line==='string').slice(-16).map(line=>line.slice(0,240)):[];
 return a;
}
export function storylineFor(state,region){if(!Number.isInteger(region)||region<0||region>9)return null;
 const a=state?.adventure;if(!a)return null;
 const saved=a.selected[String(region)];if(saved)return ADVENTURE_BY_ID[saved]||null;
 // A semente determina a base. Decisões em regiões anteriores alteram histórias futuras.
 const earlier=Object.entries(a.decisions).filter(([id])=>ADVENTURE_BY_ID[id]?.region<region).sort(([l],[r])=>l.localeCompare(r));
 const history=earlier.map(([id,ending])=>`${id}:${ending}`).join('|');
 const variant=(stringHash(`${a.seed}|${region}|${history}`)>>>11)&1;
 return ADVENTURE_BY_ID[`adventure-${region}-${variant}`];
}
function appendJournal(state,message){const journal=state.adventure.journal;journal.push(message.slice(0,240));if(journal.length>16)journal.splice(0,journal.length-16);}
export function adventureEntry(state,region){const story=storylineFor(state,region);return story?{story,entry:state.adventure.entries[story.id]||null}:null;}
export function discoverAdventure(state,region,source='exploration',sourceId=null){if(state.combat)return null;
 const selected=adventureEntry(state,region);if(!selected||selected.entry)return null;
 if(source==='guest'&&sourceId!==selected.story.sourceGuest)return null;
 if(source==='event'&&sourceId!==selected.story.sourceEvent)return null;
 const {story}=selected;state.adventure.selected[String(region)]=story.id;
 state.adventure.entries[story.id]={phase:'available',clues:[],kills:0};
 appendJournal(state,`Nova pista em ${story.title}: ${story.lead}`);
 return story;
}
export function acceptAdventure(state,region,id){const current=adventureEntry(state,region);if(state.combat||!current||current.story.id!==id||current.entry?.phase!=='available')return false;
 current.entry.phase='investigate';appendJournal(state,`Investigação iniciada: ${current.story.title}.`);return true;
}
/** Um único indício por exploração não hostil; nenhuma alteração de inventário.
 * O requisito é descobrir DUAS pistas distintas, não gastar passos artificiais.
 */
export function advanceAdventureExploration(state,region,random=Math.random){if(state.combat||state.journey?.event||region!==Math.floor(((state.area||1)-1)/10))return null;
 const current=adventureEntry(state,region);if(!current)return null;
 if(!current.entry){if(random()>=.16)return null;const story=discoverAdventure(state,region);return story?{kind:'discovered',text:`Uma nova pista: ${story.lead}`,id:story.id}:null;}
 const {story,entry}=current;
 if(entry.phase!=='investigate'||random()>=.38)return null;
 const next=entry.clues.includes(0)?1:0;
 if(entry.clues.includes(next))return null;
 entry.clues.push(next);
 if(entry.clues.length===2)entry.phase=story.type==='hunt'?'hunt':'delivery';
 const text=story.clues[next]+(entry.clues.length===2?(story.type==='hunt'?` ${story.threat} Enfrente 2 humanoides hostis da região.`:' A correspondência pode ser entregue na taverna.'):'');
 appendJournal(state,text);
 return {kind:'clue',text,id:story.id,complete:entry.clues.length===2};
}
export function advanceAdventureCombat(state,region,enemy){if(!enemy?.humanoid||enemy.boss||enemy.adventureRecorded||state.combat?.enemy!==enemy)return null;
 const current=adventureEntry(state,region);if(!current||current.entry?.phase!=='hunt')return null;
 const {story,entry}=current;enemy.adventureRecorded=true;entry.kills=Math.min(story.huntTarget,entry.kills+1);
 if(entry.kills===story.huntTarget)entry.phase='decision';
 const text=entry.phase==='decision'?`A ameaça foi contida. Decida o destino das provas de ${story.title}.`:`Hostil derrotado: ${entry.kills}/${story.huntTarget}.`;
 appendJournal(state,text);return {text,complete:entry.phase==='decision'};
}
export function deliverAdventure(state,region,id){const current=adventureEntry(state,region);
 if(state.combat||!current||current.story.id!==id||current.entry?.phase!=='delivery')return null;
 current.entry.phase='decision';const text=`Correspondência entregue. É hora de decidir como encerrar ${current.story.title}.`;appendJournal(state,text);return text;
}
export function resolveAdventure(state,region,id,ending){const current=adventureEntry(state,region);
 if(state.combat||!current||current.story.id!==id||current.entry?.phase!=='decision'||!['report','protect'].includes(ending))return null;
 const {story,entry}=current;entry.phase='done';state.adventure.completed.push(id);state.adventure.decisions[id]=ending;
 const gold=ending==='report'?story.reward.gold:Math.floor(story.reward.gold*.55);
 const xp=ending==='protect'?Math.round(story.reward.xp*1.2):story.reward.xp;
 const rep=ending==='protect'?4:2;
 state.gold+=gold;
 if(state.cityLife?.reputation)state.cityLife.reputation[region]=Math.max(-30,Math.min(100,(state.cityLife.reputation[region]||0)+rep));
 const narration=story.endings[ending];appendJournal(state,`${story.title}: ${narration}`);
 return {title:story.title,gold,xp,reputation:rep,narration};
}

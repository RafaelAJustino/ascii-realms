/** Etapa 7: apresentação do diário. Nunca altera missões, progresso ou salvamento. */
import {rt} from './runtime.js';
import {maps} from './data.js';
import {QUESTS,questStatus,collectProgress} from './progression.js';
import {DYNAMIC_QUESTS,dynamicStatus} from './dynamic-quests.js';
import {adventureEntry} from './procedural-adventures.js';
import {escape} from './utils.js';
import {btn,panel} from './ui-helpers.js';

const FILTERS=[['ready','Prontas'],['active','Em andamento'],['available','Disponíveis'],['finished','Concluídas']];
const PHASE_LABELS={available:'Descoberta',investigate:'Investigar pistas',hunt:'Derrotar inimigos',delivery:'Entregar na taverna',decision:'Escolher desfecho',done:'Concluída'};
const locationLabel=region=>maps[region]?.[0]||`Região ${region+1}`;
const storyBucket=phase=>phase==='done'?'finished':phase==='available'?'available':phase==='decision'||phase==='delivery'?'ready':'active';
const progressBar=(count,total)=>`<div class="ux7-quest-progress"><div class="ux7-quest-track" role="progressbar" aria-label="Progresso da missão" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${Math.max(0,Math.min(total,count))}"><span style="width:${Math.max(0,Math.min(100,Math.round(count/Math.max(1,total)*100)))}%"></span></div><b>${Math.max(0,Math.min(total,count))}/${total}</b></div>`;
const entry=(bucket,kind,region,title,description,content)=>`<article class="ux7-quest-card" data-bucket="${bucket}" data-kind="${kind}"><div class="ux7-quest-heading"><strong>${escape(title)}</strong><span class="ux7-quest-kind">${escape(kind)}</span></div><p class="small muted ux7-quest-region">${escape(locationLabel(region))}</p><p class="small ux7-quest-description">${escape(description)}</p>${content}</article>`;

export function questDashboard(personalPanel=''){
 const state=rt.state,region=Math.floor((rt.area-1)/10),cards=[],counts={ready:0,active:0,available:0,finished:0};
 const register=(bucket,kind,origin,title,description,content)=>{counts[bucket]++;cards.push({bucket,html:entry(bucket,kind,origin,title,description,content)});};
 for(const q of QUESTS){
  const status=questStatus(q,state),inRegion=q.region===region;
  if(status==='Disponível'&&!inRegion)continue;
  const have=q.type==='collect'?collectProgress(q,state):state.quests?.active?.[q.id]?.progress||0;
  const progress=status==='Concluída'||status==='Recompensa recebida'?q.required:Math.max(0,Math.min(q.required,have));
  const readyToDeliver=status==='Em andamento'&&q.type==='collect'&&have>=q.required;
  const bucket=status==='Recompensa recebida'?'finished':status==='Concluída'||readyToDeliver?'ready':status==='Em andamento'?'active':'available';
  let action='';
  if(status==='Disponível')action=btn('Aceitar missão',`questAccept:${q.id}`);
  if(readyToDeliver)action=btn('Entregar materiais',`questDeliver:${q.id}`);
  if(status==='Concluída')action=btn('Receber recompensa',`questClaim:${q.id}`);
  if(status==='Em andamento'||status==='Concluída')action+=btn('Acompanhar na aventura',`uxTrackQuest:${q.id}`);
  const hint=readyToDeliver?'Materiais disponíveis. Faça a entrega para concluir.':status==='Concluída'?'Objetivo cumprido. Recompensa disponível.':status==='Recompensa recebida'?'Recompensa já recebida.':status==='Disponível'?'Aceite esta missão para registrar seu progresso.':`Objetivo: ${q.required} · ${q.type==='collect'?'Reúna os materiais indicados.':q.type==='explore'?'Explore a região.':q.type==='boss'?'Derrote o chefe regional.':'Derrote os inimigos indicados.'}`;
  register(bucket,'Regional',q.region,q.title,q.description,`${status==='Em andamento'||readyToDeliver?progressBar(progress,q.required):''}<p class="small muted">${escape(hint)}</p><p class="small ux7-quest-reward">Recompensa: ${q.reward.xp} EXP · ${q.reward.gold} ouro · ${q.reward.consumables.hp} poção(ões)</p>${action}`);
 }
 for(const q of DYNAMIC_QUESTS){
  const status=dynamicStatus(state,q);
  if(status==='Não descoberta'||status==='Disponível'&&q.region!==region)continue;
  const bucket=status==='Recompensa recebida'?'finished':status==='Concluída'?'ready':status==='Em andamento'?'active':'available';
  const progress=status==='Em andamento'?state.dynamicQuests?.active?.[q.id]?.progress||0:q.required;
  const action=status==='Disponível'?btn('Aceitar história',`dynamicAccept:${q.id}`):status==='Concluída'?`<div class="ux7-decision-actions">${btn('Investigar e registrar provas',`dynamicClaim:${q.id}:investigate`)}${btn('Proteger os envolvidos',`dynamicClaim:${q.id}:protect`)}</div>`:'';
  const hint=status==='Concluída'?'Decida como encerrar esta história.':status==='Em andamento'?(q.type==='explore'?'Continue explorando nesta região.':'Derrote os inimigos necessários nesta região.'):status==='Recompensa recebida'?'História encerrada.':'História descoberta por suas interações.';
  register(bucket,'Narrativa',q.region,q.title,q.description,`${status==='Em andamento'?progressBar(progress,q.required):''}<p class="small muted">${hint}</p><p class="small ux7-quest-reward">Recompensa base: ${q.reward.xp} EXP · ${q.reward.gold} ouro; varia conforme a decisão.</p>${action}${status==='Em andamento'||status==='Concluída'?btn('Acompanhar na aventura',`uxTrackQuest:${q.id}`):''}`);
 }
 for(let r=0;r<maps.length;r++){
  const current=adventureEntry(state,r);
  if(!current?.entry)continue;
  const {story,entry:adventure}=current,phase=adventure.phase,bucket=storyBucket(phase);
  if(bucket==='available'&&r!==region)continue;
  const inRegion=r===region;
  const count=phase==='investigate'?adventure.clues.length:phase==='hunt'?adventure.kills:null;
  const progress=count!==null?progressBar(count,2):'';
  const ending=phase==='done'?story.endings[state.adventure.decisions[story.id]]||'Concluída.':'';
  const action=phase==='available'&&inRegion?btn('Iniciar investigação',`adventureAccept:${story.id}`):phase==='decision'&&inRegion?`<div class="ux7-decision-actions">${btn('Registrar as provas',`adventureClaim:${story.id}:report`)}${btn('Proteger as testemunhas',`adventureClaim:${story.id}:protect`)}</div>`:phase==='delivery'&&inRegion?btn('Ir à taverna para entregar','nav:tavern'):'';
  const instruction=!inRegion&&phase!=='done'?`Retorne a ${locationLabel(r)} para continuar.`:phase==='investigate'?'Procure duas pistas durante a exploração.':phase==='hunt'?'Derrote os inimigos vinculados à investigação.':phase==='delivery'?'A entrega é realizada na taverna da região.':phase==='decision'?'Escolha o desfecho da investigação.':phase==='available'?'Investigação disponível para iniciar.':ending;
  register(bucket,'Pessoal',r,story.title,story.lead,`${progress}<p class="small muted">${escape(PHASE_LABELS[phase]||phase)} · ${escape(instruction)}</p>${action}${['active','ready'].includes(bucket)?btn('Acompanhar na aventura',`uxTrackQuest:${story.id}`):''}`);
 }
 cards.sort((a,b)=>FILTERS.findIndex(([key])=>key===a.bucket)-FILTERS.findIndex(([key])=>key===b.bucket));
 const filter=FILTERS.some(([key])=>key===rt.questFilter)?rt.questFilter:'available';
 const labels=Object.fromEntries(FILTERS);
 const tabs=`<div class="ux7-quest-filters" role="group" aria-label="Filtrar missões">${FILTERS.map(([key,label])=>`<button type="button" data-action="questFilter:${key}" class="${key===filter?'is-active':''}" aria-pressed="${key===filter}">${label} <span class="ux7-quest-number">${counts[key]}</span></button>`).join('')}</div>`;
 const text=filter==='ready'?'Missões com objetivo completo ou decisão pendente.':filter==='active'?'Missões que você está realizando agora.':filter==='available'?'Missões que podem ser iniciadas nesta região.':'Recompensas recebidas e histórias concluídas.';
 const empty=`<div class="ux7-quest-empty" data-bucket="${filter}"><strong>Não há missões nesta categoria.</strong><p class="small muted">${filter==='available'?'Explore a região e converse na taverna para encontrar novas histórias.':filter==='active'?'Consulte a aba Disponíveis para iniciar uma missão.':filter==='ready'?'Continue suas explorações ou cumpra os objetivos ativos.':'As missões finalizadas aparecerão aqui.'}</p>${filter==='active'?btn('Ver disponíveis','questFilter:available'):''}</div>`;
 const journal=state.adventure?.journal?.length?`<details class="ux7-disclosure" data-ux7-key="quest-journal"><summary>Registro das aventuras (${Math.min(state.adventure.journal.length,8)} recentes)</summary><div class="ux7-disclosure-body">${state.adventure.journal.slice(-8).reverse().map(line=>`<p class="small">${escape(line)}</p>`).join('')}</div></details>`:'';
 const feedback=rt.cityFeedback?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:'';
 return panel('DIÁRIO DE MISSÕES',`<p class="small muted ux7-intro">Região atual: <b>${escape(locationLabel(region))}</b>. Acompanhe missões regionais, narrativas e pessoais sem perder objetivos de outras regiões.</p>${feedback}${tabs}<div class="ux7-quest-dashboard" data-filter="${filter}"><p class="small muted ux7-quest-filter-hint">${escape(text)}</p><div class="ux7-quest-cards">${cards.map(x=>x.html).join('')}${counts[filter]===0?empty:''}</div></div>${personalPanel?`<details class="ux7-disclosure ux7-personal-detail" data-ux7-key="quest-personal"><summary>Detalhes da aventura pessoal nesta região</summary><div class="ux7-disclosure-body">${personalPanel}</div></details>`:''}${journal}<div class="ux7-quest-foot">${btn('Ir à taverna','nav:tavern')}${btn('Voltar à cidade','nav:city')}</div>`);
}

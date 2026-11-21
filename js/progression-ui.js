import {DUNGEON_BOSS_KITS} from './monster-identity.js';
import {monsterKit,bossKit} from './monster-identity.js';
import {questDashboard} from './mobile-quests-stage7.js';
import {densityCreatureArtwork} from './density-bestiary.js';
import {DYNAMIC_QUESTS,dynamicStatus,dynamicUnlocked} from './dynamic-quests.js';
import {adventureEntry} from './procedural-adventures.js';
import {regionSpecies,EXTENDED_ARTWORKS} from './expanded-species.js';
import { rt } from './runtime.js';
import { maps } from './data.js';
import { detailedArtworks } from './artworks-detailed.js';
import { artworks } from './artworks.js';
import { BOSS_PROFILES, SPECIES_PROFILES } from './elements.js';
import { dropProfiles } from './loot.js';
import { QUESTS, questStatus, questState, collectProgress, statDefaults } from './progression.js';
import { btn,panel } from './ui-helpers.js';
import { escape,bar } from './utils.js';
import {MONSTER_PATTERNS,observedElementLabel} from './combat-tactics.js';

export function proceduralQuestUI(){
 const region=Math.floor((rt.area-1)/10),current=adventureEntry(rt.state,region),a=rt.state.adventure;
 if(!current)return '';
 const {story,entry}=current;
 if(!entry)return panel('AVENTURAS PESSOAIS',`<p class="small muted">Uma história secundária está oculta nesta região. Converse com moradores da taverna ou siga explorando. Cada personagem encontra histórias diferentes.</p><p class="small muted">Aventura pessoal: ${a.completed.length} concluída(s).</p>`);
 const choices=entry.phase==='decision'?`<div class="procedural-actions">${btn('Registrar as provas',`adventureClaim:${story.id}:report`)}${btn('Proteger as testemunhas',`adventureClaim:${story.id}:protect`)}</div>`:'';
 const progress=entry.phase==='investigate'?`<p class="small">Pistas descobertas: ${entry.clues.length}/2 ${bar(entry.clues.length,2)}</p>${story.clues.map((clue,i)=>`<p class="small ${entry.clues.includes(i)?'':'muted'}">${entry.clues.includes(i)?'[*] '+escape(clue):'[ ] Pista ainda não encontrada'}</p>`).join('')}`:
 entry.phase==='hunt'?`<p class="small">Humanoides hostis derrotados: ${entry.kills}/2 ${bar(entry.kills,2)}</p>`:
 entry.phase==='delivery'?'<p class="small">Leve a correspondência à taverna da região. A entrega não consome itens do inventário.</p>':
 entry.phase==='decision'?'<p class="small">Investigação concluída. Escolha o destino das provas.</p>':'';
 const ending=a.decisions[story.id],resolution=entry.phase==='done'?`<p class="small">Desfecho: ${escape(story.endings[ending]||'Concluído.')}</p>`:'';
 return panel('AVENTURA PESSOAL · '+escape(story.title),`<div class="procedural-quest">${rt.cityFeedback?.startsWith(story.title)?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:''}<p class="small">${escape(story.lead)}</p><p class="small muted">${story.type==='hunt'?'Investigação e confronto':'Investigação e entrega'} · ${entry.phase==='done'?'Concluída':entry.phase==='available'?'Descoberta':'Em andamento'}</p>${progress}${resolution}${entry.phase==='available'?btn('Iniciar investigação',`adventureAccept:${story.id}`):''}${choices}<p class="small muted">Recompensa única: experiência, ouro e reputação. O desfecho influenciará histórias posteriores.</p></div>`);
}
// MISSÕES NARRATIVAS e DIÁRIO DE AVENTURAS: conteúdo e fluxos preservados no diário filtrável.
export function questUI(){return questDashboard(proceduralQuestUI());}
export function bestiaryUI(){return Object.values(DUNGEON_BOSS_KITS).filter(kit=>(rt.state.bestiary?.[kit.name]?.encounters||0)>0).map(kit=>{const n=rt.state.bestiary[kit.name];return panel('CHEFE DE MASMORRA · '+escape(kit.name),`<p class="small">Encontros: ${n.encounters} · Vitórias: ${n.wins}</p><p class="small">Passiva: ${escape(kit.passive.name)} · ${escape(kit.passive.description)}</p>${n.wins?`<p class="small">Técnicas: ${escape(kit.phaseAttacks.map(x=>x.name).join(', '))}</p>`:''}`);}).join('')+maps.map((m,region)=>{const regional=regionSpecies(region);const species=[...regional.map(x=>x.name),m[2]];const hidden=species.filter((name,i)=>i<regional.length&&i>=3&&!rt.state.bestiary?.[name]?.encounters).length;return panel(m[0],`<p class="small muted">${regional.length} espécies regionais · ${hidden} ainda não descobertas</p>`+species.map((name,i)=>{const v=rt.state.bestiary?.[name];if(!v?.encounters)return i<3||i===regional.length?`<div class="item muted">??? · Espécie não descoberta</div>`:'';const profile=(i===regional.length?BOSS_PROFILES:SPECIES_PROFILES)[name]||regional[i]?.profile||{affinities:{}};const known=v.wins>=1,intermediate=v.wins>=5,complete=v.wins>=10;const observed=v.observedActions&&typeof v.observedActions==='object'?Object.values(v.observedActions):[];
const observedAffinities=v.observedAffinities&&typeof v.observedAffinities==='object'?Object.entries(v.observedAffinities):[];
const discoveries=v.encounters>=2?`<p class="small">Padrão observado: ${escape(MONSTER_PATTERNS[profile.archetype]||MONSTER_PATTERNS.wild)}</p>`:'';
const techniques=observed.length?`<p class="small">Técnicas vistas: ${observed.map(a=>escape(a.name)+` (${Math.min(999,a.count||1)}x)`).join(' · ')}</p>`:'';
const observedTypes=observedAffinities.length?`<p class="small">Afinidades testadas: ${observedAffinities.map(([element,factor])=>escape(observedElementLabel(element,factor))).join(' · ')}</p>`:'';
const affinities=Object.entries(profile.affinities||{});const weaknesses=affinities.filter(([,n])=>n>1).map(([k,n])=>`${k} ${n}x`).join(', ')||'Nenhuma conhecida';const resistances=affinities.filter(([,n])=>n<1).map(([k,n])=>`${k} ${n}x`).join(', ')||'Nenhuma conhecida';return `<div class="item"><b>${escape(name)}</b> · ${v.encounters} encontros · ${v.wins} vitórias · ${v.losses} derrotas<div class="ascii-container"><pre class="ascii-art" data-ascii="true">${escape(densityCreatureArtwork(name)||detailedArtworks[name]||EXTENDED_ARTWORKS[name]||artworks[name]||'???')}</pre></div><p class="small">${m[0]} · níveis ${region*10+1}-${region*10+10}</p>${known?`<p class="small">Atributos aproximados: HP ${Math.floor(35+(region*10+5)*13+(region*10+5)**1.3)*(i===regional.length?6:1)} · Elemento ${escape(profile.archetype||'físico')} · Fraquezas: ${escape(weaknesses)}</p>`:''}${intermediate?`<p class="small">Resistências: ${escape(resistances)} · Materiais: ${escape(i===regional.length?m[6]:dropProfiles[region].materials[regional[i].originalIndex])} · Habilidades: ${escape(profile.archetype||'ataque básico')} e técnicas de nível</p>`:''}${discoveries}${techniques}${known?`<p class="small">${escape(i===regional.length?'Passiva de chefe: '+(bossKit({baseName:name})?.passive.name||'Desconhecida'):'Passiva identificada: '+(monsterKit({speciesId:regional[i]?.id})?.passives?.[0]?.name||'Desconhecida'))}</p>`:''}${intermediate?`<p class="small">${escape(i===regional.length?'Especial: '+(bossKit({baseName:name})?.phaseAttacks?.[0]?.name||'Desconhecido'):'Técnicas conhecidas: '+(monsterKit({speciesId:regional[i]?.id})?.actions?.map(x=>x.name).join(', ')||'Desconhecidas'))}</p>`:''}${observedTypes}${complete?`<p class="small">Drops possíveis: ${escape(i===regional.length?'Equipamento raro do chefe':dropProfiles[region].equipment[regional[i].originalIndex])}, consumíveis e materiais locais.</p>`:''}</div>`;}).join(''));}).join('');}
export function statisticsUI(){const s={...statDefaults(),...rt.state.statistics};const labels={playTimeSeconds:'Tempo de jogo',monstersDefeated:'Monstros derrotados',bossesDefeated:'Chefes derrotados',deaths:'Mortes',damageDealt:'Dano causado',highestDamage:'Maior dano',damageTaken:'Dano recebido',goldEarned:'Ouro obtido',goldSpent:'Ouro gasto',itemsFound:'Itens encontrados',questsCompleted:'Missões concluídas',dungeonsCompleted:'Masmorras concluídas'};return panel('ESTATÍSTICAS',Object.entries(labels).map(([k,label])=>`<div class="stat"><span>${label}</span><b>${k==='playTimeSeconds'?`${Math.floor(s[k]/3600)}h ${Math.floor(s[k]%3600/60)}m ${s[k]%60}s`:s[k]}</b></div>`).join(''));}

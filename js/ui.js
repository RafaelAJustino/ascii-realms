import {SECRET_EVENTS,SECRET_BOSS_REGIONS} from './secrets.js';
import {fallbackMenu} from './menu-history.js';
import {ACHIEVEMENTS,ACHIEVEMENT_BY_ID,equippedTitle} from './achievements.js';
import {nextEvolution,evolutionRequirement,isEvolvableWeapon,EVOLUTION_STAGES} from './weapon-evolution.js';
import {effectiveSkill,SKILL_VARIANTS,configuredVariant} from './skill-variants.js';
import {COMBAT_SPEEDS,getCombatSpeed} from './combat-speed.js';
import {PATHS,activeJourney,canExplore} from './journey-paths.js';
import {regionConditions,encounterChance} from './world-climate.js';
import {pendingEvent,canChoose,campRestStatus,CAMP_COST,CAMP_COOLDOWN} from './journey-events.js';
import {captureViewport,restoreViewport,shouldPreserveViewport} from './viewport-state.js';
import { detailedArtworks } from './artworks-detailed.js';
import { dungeonScenes, dungeonBossArt } from './dungeon-artworks.js';
import { heroArtworks } from './hero-artworks.js';
import {renderHeroAvatar} from './hero-avatar.js';
import { detailedCities } from './cities-detailed.js';
import {syncCreatureAnimation,combatAnimationClass} from './ascii-animation.js';
import {DUNGEONS,DUNGEON_BOSS_ART,dungeonAvailable,dungeonState} from './dungeons.js';
import {specOptions,selectedSpec,specSkills} from './specializations.js';
import {recipes,craft,enhance,upgradeCost,SETS,setBonuses,UPGRADE_BONUS} from './crafting.js';
import { questUI,bestiaryUI,statisticsUI } from './progression-ui.js';
import { BOSS_PHASES } from './boss-phases.js';
import { monsterRarity } from './monster-rarity.js';
import { artworks } from './artworks.js';
import { cityArtworks } from './city-artworks.js';
const $ = selector => document.querySelector(selector);
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { btn, panel, stat } from './ui-helpers.js';
import { passives, stats } from './player.js';
import {distribution,ATTRIBUTE_HELP,pending} from './hero-distribution.js';
import { makeItem, validEquip, rarityName } from './equipment.js';
import { potionPrice } from './shops.js';
import {cityNpcs,npcDialogue,reputation,reputationLabel,reputationDiscount,cityPrice,cityOffer,forgeOrder,canForgeOrder,canAnswerQuiz,cityQuizOptions} from './city-life.js';
import {QUESTS,questStatus} from './progression.js';
export function header(){if(rt.state?.combat&&rt.screen==='combat')return '<div class="brand">ASCII REALMS</div>';if(!rt.state)return `<div class="brand">* ASCII REALMS *</div><div class="muted">Um mundo de fantasia em caracteres</div>`;let s=stats();return `<div class="brand">* ASCII REALMS *</div><div class="small">${escape(rt.state.name)} · ${classes[rt.state.cls].name} · Nível ${rt.state.lv} · <span class="gold">${rt.state.gold} ouro</span></div><div class="small">HP ${rt.state.hp}/${s.maxhp}${bar(rt.state.hp,s.maxhp)}MP ${rt.state.mp}/${s.maxmp}${bar(rt.state.mp,s.maxmp,'mp')}EXP ${rt.state.lv===100?'MAX':`${rt.state.xp}/${xpNeed(rt.state.lv)}`}${bar(rt.state.lv===100?1:rt.state.xp,rt.state.lv===100?1:xpNeed(rt.state.lv),'exp')}</div>`;}

export function climateSummary(){if(!rt.state)return '';const c=regionConditions(rt.state,mapId(rt.area));const t=c.time;
 return `<div class="climate-summary" role="status"><span><b>DIA ${t.day}</b> · ${String(t.hour).padStart(2,'0')}:00 · ${t.period}</span><span>CLIMA: <b>${escape(c.weather.name)}</b></span>${c.event?`<span class="climate-event">REGIÃO: <b>${escape(c.event.name)}</b> · ${c.event.remaining} ações restantes</span>`:''}</div>`;
}
export function home(){const saved=Boolean(localStorage.getItem(KEY));return panel('INÍCIO',`<div class="start-actions">${btn('> CONTINUAR','continue',!saved)}${btn('+ NOVO JOGO','create')}<button class="danger" data-action="delete" ${saved?'':'disabled'}>X EXCLUIR JOGO</button></div>`);}

export function playerMenu(){const entries=[['* HERÓI','character'],['[] INVENTÁRIO','inventory'],['+ EQUIPAMENTOS','inventory'],['! HABILIDADES','skills'],['? MISSÕES','quests'],['& BESTIÁRIO','bestiary'],['% ESTATÍSTICAS','statistics'],['/ ESPECIALIZAÇÃO','specializations'],['* CONQUISTAS','achievements'],['# DESCOBERTAS','secrets']];return panel('JOGADOR',`<div class="player-actions">${entries.map(([label,id])=>btn(label,`nav:${id}`)).join('')}</div><div class="menu-back">${btn('< VOLTAR','nav:world')}</div>`);}

export function create(){return panel('CRIAR PERSONAGEM',`<div class="character-creation"><label for="hero-name">Nome do aventureiro</label><p><input id="hero-name" maxlength="24" placeholder="Seu nome" value="Herói"></p><label for="hero-class">Classe</label><p><select id="hero-class">${Object.entries(classes).map(([id,c])=>`<option value="${id}">${c.name}</option>`).join('')}</select></p><div id="class-preview"></div>${btn('Iniciar aventura','start')}</div>`);}

export function world(){let m=maps[mapId(rt.area)],boss=rt.area%10===0;return panel(`MAPA ${mapId(rt.area)+1} · ${m[0]}`,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape((detailedCities[m[1]]||cityArtworks[m[1]]))}</pre></div><p>Área ${rt.area} de 100 · Nível mínimo ${rt.area}</p><p class="muted">Criaturas: ${m.slice(3,6).join(', ')}.</p>${climateSummary()}${rt.achievementFeedback?`<p class="stage6-status" role="status">${escape(rt.achievementFeedback)}</p>`:''}<div class="main-actions">${btn('> Explorar','explore',!canExplore(rt.state,rt.area))}${btn('# Selecionar Mapa','maps')}${btn('H Visitar Cidade','city')}${btn('@ Jogador','nav:player')}</div>${boss?`<div class="world-boss">${btn(rt.state.bosses.includes(mapId(rt.area))?'Reenfrentar chefe':'Desafiar chefe','boss')}</div>`:''}`);}

export function pathSelection(){const m=maps[mapId(rt.area)];return panel('ESCOLHER CAMINHO',`<p class="small muted">${escape(m[0])} · Área ${rt.area}. Escolha como iniciar a jornada.</p>${climateSummary()}<div class="path-options">${Object.values(PATHS).map(x=>`<div class="path-option"><b>${escape(x.name)}</b><p class="small muted">${escape(x.description)}</p><p class="small muted">Chance de encontro hostil agora: ${Math.round(encounterChance(x.combatChance,regionConditions(rt.state,mapId(rt.area)))*100)}%</p>${btn('> SEGUIR CAMINHO',`pathSelect:${x.id}`,!canExplore(rt.state,rt.area))}</div>`).join('')}</div>`);}
export function pathJourney(){if(!activeJourney(rt.state))return pathSelection();const m=maps[mapId(rt.area)],path=PATHS[rt.state.journey.path],j=rt.state.journey,event=pendingEvent(rt.state);
 const eventCard=event?panel(event.title,`<p class="small">${escape(event.description)}</p><div class="journey-event-options">${event.choices.map(choice=>btn(escape(choice.label),`journeyChoice:${event.id}:${choice.id}`,!canChoose(rt.state,event.id,choice.id))).join('')}</div><p class="small muted">Escolha uma opção para continuar. O evento será concluído apenas uma vez.</p>`):'';
 return panel('EXPLORAÇÃO',`<p><b>CAMINHO:</b> ${escape(path.name)}</p><p class="small muted">MAPA: ${escape(m[0])} · ÁREA: ${rt.area} · EXPLORAÇÕES: ${j.steps}</p>${climateSummary()}<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape(detailedCities[m[1]]||cityArtworks[m[1]])}</pre></div><p class="small">${escape(path.description)}</p>${j.last.length?`<div class="journey-history" role="log" aria-label="Acontecimentos recentes"><b>ACONTECIMENTOS RECENTES</b>${j.last.map(line=>`<p class="small">${escape(line)}</p>`).join('')}</div>`:''}${eventCard}<div class="journey-actions">${btn('> CONTINUAR EXPLORANDO','journeyContinue',!!event||!canExplore(rt.state,rt.area))}${btn('^ ACAMPAMENTO','journeyCamp',!!event)}${btn('< VOLTAR PARA INÍCIO','journeyCity',!!event)}</div>`);}
export function campUI(){if(!activeJourney(rt.state))return panel('ACAMPAMENTO','Jornada não encontrada.');const current=stats(),c=campRestStatus(rt.state),consumables=rt.state.consumables;
 return panel('ACAMPAMENTO',`<p class="small">${escape(PATHS[rt.state.journey.path].name)} · Área ${rt.area}</p><p>HP: <b>${rt.state.hp}/${current.maxhp}</b> · MP: <b>${rt.state.mp}/${current.maxmp}</b> · Ouro: <b>${rt.state.gold}</b></p>${climateSummary()}<p class="small muted">Descansar recupera 25% de HP/MP, custa ${CAMP_COST} ouro e exige ${CAMP_COOLDOWN} explorações entre descansos. Há 10% de chance de emboscada.</p>${c.remaining?`<p class="small muted">Próximo descanso disponível após ${c.remaining} explorações.</p>`:''}${rt.state.gold<CAMP_COST?'<p class="small muted">Ouro insuficiente para descansar.</p>':''}<div class="camp-actions">${btn('DESCANSAR (10 OURO)','campRest',!c.canRest)}${['hp','mp','elixir'].map(type=>btn(`USAR ${type.toUpperCase()} (${consumables[type]||0})`,`campPotion:${type}`,!consumables[type]||(type==='hp'&&rt.state.hp>=current.maxhp)||(type==='mp'&&rt.state.mp>=current.maxmp)||(type==='elixir'&&rt.state.hp>=current.maxhp&&rt.state.mp>=current.maxmp))).join('')}${btn('< VOLTAR AO CAMINHO','campLeave')}</div><p class="small muted">Jornada: ${rt.state.journey.steps} explorações. Eventos concluídos: ${rt.state.narrative.completed.length}.</p>`);}

export function secretsUI(){
 const state=rt.state,found=SECRET_EVENTS.filter(x=>state.narrative.completed.includes(x.id));
 const defeated=state.secrets.guardians.length;
 const entries=SECRET_EVENTS.map(secret=>{
  const known=state.narrative.completed.includes(secret.id);
  return `<div class="secret-entry ${known?'found':''}"><b>${known?escape(secret.title):'??? Descoberta oculta'}</b><span class="small muted"> Região ${secret.region+1} · ${known?'Descoberta':'Não descoberta'}</span>${known?`<p class="small">${escape(secret.description)}</p>`:''}</div>`;
 }).join('');
 return panel('DIÁRIO DE DESCOBERTAS',`<p class="small">Segredos descobertos: <b>${found.length}/${SECRET_EVENTS.length}</b> · Guardiões secretos derrotados: <b>${defeated}/${SECRET_BOSS_REGIONS.length}</b></p><p class="small muted">Explore caminhos desconhecidos ou perigosos. Alguns guardiões surgem apenas em caminhos perigosos de regiões específicas.</p><div class="secret-list">${entries}</div>`)+panel('GUARDIÕES SECRETOS',SECRET_BOSS_REGIONS.map(region=>`<div class="secret-entry"><b>Região ${region+1}</b> · ${state.secrets.guardians.includes(region)?'Derrotado':'Não descoberto'}</div>`).join(''))+(state.secrets.recent.length?panel('ÚLTIMAS DESCOBERTAS',state.secrets.recent.map(line=>`<p class="small">${escape(line)}</p>`).join('')):'');
}

export function worldMap(){return maps.map((m,i)=>panel(`${i+1}. ${m[0]} ${rt.state.bosses.includes(i)?'✓':''}`,`<p class="muted">Áreas ${i*10+1} a ${i*10+10} · ${m[1]} · Chefe: ${m[2]}</p><div class="actions">${Array.from({length:10},(_,j)=>{let n=i*10+j+1,locked=n>rt.state.lv||(i>0&&!rt.state.bosses.includes(i-1));return btn(`${n}${j===9?' B':''}`,`area:${n}`,locked);}).join('')}</div>`)).join('');}

export function character(){
 const d=distribution(rt.state),permanent=rt.state.stats;
 const rows=A.map((a,i)=>`<div class="hero-attribute"><div class="hero-attribute-title"><b>${N[i]}</b><span class="small muted">${a.toUpperCase()}</span></div><p class="small muted">${ATTRIBUTE_HELP[i]}</p><div class="hero-attribute-controls">${btn('−',`attrMinus:${i}`,d.delta[i]===0)}<span class="hero-attribute-value">${permanent[i]} ${d.delta[i]?`&gt; <strong>${permanent[i]+d.delta[i]}</strong>`:'= '+permanent[i]}${d.current[a]>permanent[i]?` <small class="muted">(+${d.current[a]-permanent[i]} equip.)</small>`:''}</span>${btn('+',`attrPlus:${i}`,d.remaining===0)}</div></div>`).join('');
 const fields=[['HP máximo','maxhp',0],['MP máximo','maxmp',0],['Ataque físico','atk',0],['Ataque mágico','mag',0],['Defesa física','def',0],['Defesa mágica','md',0],['Precisão','hit',1,'%'],['Esquiva','dodge',1,'%'],['Crítico','crit',1,'%'],['Dano crítico','critD',3,'x']];
 const fmt=(v,dec,unit='')=>Number(v).toFixed(dec)+unit;
 const preview=fields.map(([label,key,dec,unit=''])=>{const before=d.current[key],after=d.preview[key],diff=after-before,changed=Math.abs(diff)>1e-8;return `<div class="hero-preview-row"><span>${label}</span><span class="${changed?'hero-preview-changed':'muted'}">${fmt(before,dec,unit)} ${changed?`&gt; ${fmt(after,dec,unit)} (+${fmt(diff,dec,unit)})`:'='}</span></div>`;}).join('');
 return panel('ATRIBUTOS',`<p class="small">Título equipado: <b>${escape(equippedTitle(rt.state)||'Nenhum')}</b></p><div class="ascii-container">${renderHeroAvatar(rt.state)}</div><div class="hero-points"><span>Disponíveis: <b>${rt.state.points}</b></span><span>Utilizados: <b>${d.spent}</b></span><span>Restantes: <b>${d.remaining}</b></span></div><div class="hero-attributes">${rows}</div><div class="hero-distribution-actions">${btn('APLICAR PONTOS','attrApply',!pending())}${btn('DESCARTAR ALTERAÇÕES','attrDiscard',!pending())}</div><p class="small muted" role="status" id="hero-feedback">${rt.heroFeedback||'Os pontos só serão salvos ao aplicar.'}</p>`)+panel('PRÉVIA DAS ESTATÍSTICAS',`<div class="hero-preview">${preview}</div><p class="small muted">Prévia calculada com equipamentos, conjuntos, passivas e especialização atuais.</p>`);
}

export function inventory(){return panel('EQUIPAMENTOS',Object.entries(rt.state.equip).map(([slot,id])=>{let it=rt.state.items.find(x=>x.uid===id);return `<div class="item">${slot}: ${it?escape(it.name)+(it.upgrade?' +'+it.upgrade:''):'Vazio'} ${it?btn('Remover',`unequip:${slot}`):''}</div>`;}).join(''))+panel('ITENS',`<div class="actions">${['all','weapon','armor','accessory','consumable','material'].map(t=>btn(t,`filter:${t}`)).join('')}</div>${rt.state.items.filter(it=>rt.filter==='all'||rt.filter==='weapon'&&it.slot==='weapon'||rt.filter==='armor'&&['head','body','hands','feet'].includes(it.slot)||rt.filter==='accessory'&&['ring','amulet'].includes(it.slot)).map(it=>`<div class="item"><b class="${['','green','rare','epic','legend'][it.rarity]}">${escape(it.name)}${it.upgrade?' +'+it.upgrade:''}</b> · Nv ${it.lv} · ${rarityName(it.rarity)}<div class="small muted">${it.kind} ${it.armor?'· Armadura '+['','leve','média','pesada'][it.armor]:''} · ${Object.entries(it.attrs).map(([k,v])=>`${k.toUpperCase()} +${v}`).join('')} · ATQ +${it.attack} MAG +${it.magic} DEF +${it.def}${it.upgrade?' · Aprimoramento +'+Math.round(UPGRADE_BONUS[it.upgrade]*100)+'%':''}${it.setId?' · Conjunto '+escape(SETS.find(x=>x.id===it.setId)?.name||''):''}</div>${btn('Equipar',`equip:${it.uid}`,!validEquip(it)||rt.state.equip[it.slot]===it.uid)} ${btn('Vender',`sell:${it.uid}`,Object.values(rt.state.equip).includes(it.uid))}</div>`).join('')||'<p class="muted">Nenhum item nesta categoria.</p>'}${Object.entries(rt.state.consumables).map(([k,v])=>`<div class="item">${k}: ${v} ${btn('Usar',`use:${k}`,!v||k==='antidote'||rt.state.combat!==null)}</div>`).join('')}${Object.entries(rt.state.materials).filter(([k,v])=>v>0).map(([k,v])=>`<div class="item">${escape(k)} ×${v} ${btn('Vender',`material:${encodeURIComponent(k)}`)}</div>`).join('')}`);}

export function skills(){
 const variants=active[rt.state.cls].map((base,i)=>{
  const a=effectiveSkill(rt.state,i),unlocked=rt.state.lv>=a.level;
  return `<div class="stage6-card"><div class="stage6-heading"><b>${escape(a.name)}</b><span class="small ${unlocked?'green':'muted'}">${unlocked?'Desbloqueada':`Nível ${a.level}`}</span></div><p class="muted">Configuração: ${escape(SKILL_VARIANTS[a.variant].name)} · ${a.cost} MP · ${a.type==='guard'?`${a.guardTurns} turnos de proteção`:`${a.mult}x de poder`}</p><div class="stage6-actions" role="group" aria-label="Variação de ${escape(a.name)}">${Object.entries(SKILL_VARIANTS).map(([id,variant])=>`<button type="button" data-action="skillVariant:${i}:${id}" aria-pressed="${a.variant===id}" ${!unlocked||a.variant===id?'disabled':''} title="${escape(variant.description)}">${escape(variant.name)}</button>`).join('')}</div><p class="muted">${escape(SKILL_VARIANTS[a.variant].description)}</p></div>`;
 }).join('');
 return panel('HABILIDADES ATIVAS',`<p class="small muted">Escolha uma variação fora de combate. Potência consome 25% mais MP e aumenta o poder em 12%. Economia reduz 25% do custo de MP e reduz o poder em 8%. Habilidades defensivas ajustam a duração.</p><div class="stage6-progress">${variants}</div>`)
  +panel('HABILIDADES PASSIVAS',passives().map(p=>`<div class="item"><b>${p.name}</b> · Nv ${p.lv}<div class="small muted">${p.desc} · ${rt.state.lv>=p.lv?'Ativa':'Bloqueada'}</div></div>`).join(''))+specializationSummary();
}
export function achievementsUI(){
 const known=rt.state.achievements?.unlocked||[];
 const rows=ACHIEVEMENTS.map(a=>{const done=known.includes(a.id),count=Math.min(a.goal,a.progress(rt.state)),percent=Math.round(100*count/a.goal);
 return `<div class="stage6-card"><div class="stage6-heading"><b>${escape(a.name)}</b><span class="stage6-tag">${done?'Concluída':escape(a.group)}</span></div><p>${escape(a.description)}</p><div class="stage6-counter">${count}/${a.goal} · ${done?'Título liberado: '+escape(a.title):'Em andamento'}</div><div class="stage6-meter"><div class="stage6-meter-fill" style="width:${percent}%"></div></div>${done?`<div class="stage6-weapon-actions">${btn(rt.state.achievements.title===a.id?'Título equipado':'Equipar título',`titleEquip:${a.id}`,rt.state.achievements.title===a.id)}</div>`:''}</div>`;}).join('');
 return panel('CONQUISTAS E TÍTULOS',`<p>Desbloqueadas: <b>${known.length}/${ACHIEVEMENTS.length}</b> · Título atual: <b>${escape(equippedTitle(rt.state)||'Nenhum')}</b></p><div class="stage6-weapon-actions">${btn('Remover título','titleEquip:clear',!rt.state.achievements?.title)}</div><div class="stage6-progress">${rows}</div>`);
}
export function evolutionUI(){
 const weapons=rt.state.items.filter(isEvolvableWeapon);
 return panel('ARMAS EVOLUTIVAS',`<p class="small muted">Relíquias de masmorras e armas épicas ou lendárias. Apenas vitórias com a arma equipada contam. Evolução máxima: estágio 3, com bônus de até 9% do ataque ou magia base da arma. O aprimoramento +10 permanece independente.</p>${rt.evolutionFeedback?`<p class="stage6-status" role="status">${escape(rt.evolutionFeedback)}</p>`:''}<div class="stage6-progress">${weapons.map(it=>{
  const stage=it.evolution?.stage||0,req=evolutionRequirement(rt.state,it),equipped=rt.state.equip.weapon===it.uid;
  return `<div class="stage6-card"><div class="stage6-heading"><b>${escape(it.name)}</b><span class="stage6-tag">${stage}/3</span></div><p class="small muted">${equipped?'Equipada':'No inventário'} · ${stage?EVOLUTION_STAGES[stage-1].label:'Adormecida'} · ATQ base ${it.attack||0} · MAG base ${it.magic||0}</p>${req?`<div class="stage6-pair"><span class="stage6-counter">Vitórias: ${req.killsDone}/${req.kills}</span><span class="stage6-counter">Chefes: ${req.bossesDone}/${req.bosses}</span><span class="stage6-counter">Missões: ${req.questsDone}/${req.quests}</span><span class="stage6-counter">${escape(req.material)}: ${req.materialsDone}/${req.materials}</span></div><div class="stage6-weapon-actions">${btn('EVOLUIR: '+req.label,`evolveWeapon:${it.uid}`,!req.ready)}</div>`:'<p class="stage6-status">Evolução máxima alcançada.</p>'}</div>`;
 }).join('')||'<p class="muted">Nenhuma arma especial encontrada. Relíquias são obtidas na conclusão inicial das masmorras.</p>'}</div>`);
}

export function city(){let m=maps[mapId(rt.area)],region=mapId(rt.area),rep=reputation(rt.state,region),discount=reputationDiscount(rt.state,region);
 return panel(m[1],`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape((detailedCities[m[1]]||cityArtworks[m[1]]))}</pre></div>${climateSummary()}<div class="city-reputation"><b>REPUTAÇÃO:</b> ${rep} · ${reputationLabel(rep)} · desconto nas lojas: ${discount}%</div>${rt.cityFeedback?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:''}<div class="actions">${['weapon','armor','accessory','potion'].map((s,i)=>btn(['Armas','Armaduras','Acessórios','Poções'][i],`shop:${s}`)).join('')}${btn('Taverna e moradores','nav:tavern')}${btn('Descansar (20 ouro)','rest',rt.state.gold<20)}${btn('Missões da cidade','nav:quests')}${btn('Ferraria','nav:forge')}${btn('Masmorras','nav:dungeons')}</div>`)+store();}

export function tavernUI(){const region=mapId(rt.area),m=maps[region],rep=reputation(rt.state,region),npcList=cityNpcs(rt.state,region);
 const npcHtml=npcList.map(npc=>`<div class="city-npc"><div><b>${escape(npc.name)}</b> <span class="small muted">${escape(npc.role)} · ${escape(npc.trait)}</span></div><p class="small muted">${escape(npcDialogue(rt.state,npc,region))}</p><div class="small muted">Conversas: ${rt.state.cityLife.npcs[npc.id]?.talks||0}</div>${btn('Conversar',`tavernTalk:${npc.id}`)}</div>`).join('');
 const offers=QUESTS.filter(q=>q.region===region&&questStatus(q,rt.state)==='Disponível').slice(0,2);
 return panel(`TAVERNA · ${escape(m[1])}`,`<p class="small">Moradores, rumores e contratos da região.</p>${climateSummary()}<div class="city-reputation">Reputação: <b>${rep}</b> · ${reputationLabel(rep)}</div>${rt.cityFeedback?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:''}${btn('Ouvir um rumor','tavernRumor')}<div class="city-npcs">${npcHtml}</div>`)
 +panel('CONTRATOS DA CIDADE',offers.length?offers.map(q=>`<div class="city-contract"><b>${escape(q.title)}</b><p class="small muted">${escape(q.description)}</p>${btn('Aceitar contrato',`tavernContract:${q.id}`)}</div>`).join(''):'<p class="small muted">Nenhum novo contrato disponível. Consulte suas missões em andamento no menu Jogador.</p>')
 +panel('DESAFIO DA TAVERNA',canAnswerQuiz(rt.state,region)?`<p class="small">Qual destas criaturas vive em ${escape(m[0])}? Uma tentativa por cidade.</p><div class="city-quiz">${cityQuizOptions(region).map((name,i)=>btn(escape(name),`tavernQuiz:${i}`)).join('')}</div><p class="small muted">Acerto: 12 ouro e 3 pontos de reputação.</p>`:'<p class="small muted">Desafio concluído nesta cidade.</p>');}


export function store(){
 if(rt.shop==='merchant')return panel('MERCANTE VIAJANTE',`${[['hp','Poção de Vida'],['mp','Poção de Mana']].map(([type,name])=>{const price=potionPrice(type),insufficient=rt.state.gold<price;return `<div class="item merchant-item"><div><b>${name}</b><div class="small muted">Preço: <span class="gold">${price} Ouro</span></div>${insufficient?'<div class="small red">Ouro insuficiente</div>':''}</div>${btn('Comprar',`buyPotion:${type}`,insufficient)}</div>`;}).join('')}${btn('Voltar',activeJourney(rt.state)?'journeyReturn':'world')}`);
 const region=mapId(rt.area),price=base=>cityPrice(rt.state,region,base);
 const offer=cityOffer(rt.state,region),stock=offer&&!offer.sold?panel('ESTOQUE ESPECIAL',`<div class="item"><b>Lote ${offer.rarity===2?'raro do mercador resgatado':'incomum'} de ${escape(({weapon:'arma',ring:'anel',body:'armadura'})[offer.slot])}</b> · Nível ${offer.lv}<p class="small muted">Item com atributos sorteados na compra, seguindo as regras normais. Estoque: 1 unidade. Oferta muda a cada 6 explorações.</p><p class="small">Preço: <b class="gold">${offer.price} Ouro</b>${offer.price!==offer.basePrice?` <span class="muted">(base: ${offer.basePrice})</span>`:''}</p>${btn('Comprar lote especial','cityOffer',rt.state.gold<offer.price)}</div>`):panel('ESTOQUE ESPECIAL','<p class="small muted">Oferta esgotada. Novo lote após a próxima renovação.</p>');
 if(rt.shop==='potion')return panel('LOJA DE POÇÕES',Object.entries({hp:'Poção de Vida',mp:'Poção de Mana',elixir:'Elixir',antidote:'Antídoto'}).map(([type,name])=>{const base=potionPrice(type),cost=price(base);return `<div class="item">${name} · Preço: ${cost} Ouro${cost!==base?` <span class="small muted">(base: ${base})</span>`:''} ${rt.state.gold<cost?'<span class="red small">Ouro insuficiente</span>':''} ${btn('Comprar',`buyPotion:${type}`,rt.state.gold<cost)}</div>`;}).join(''))+stock;
 let slots=rt.shop==='weapon'?['weapon']:rt.shop==='armor'?['head','body','hands','feet']:['ring','amulet'],levels=[3,6,9].map(n=>region*10+n);
 return panel('CATÁLOGO',slots.flatMap(slot=>levels.map(lv=>{const item=makeItem(lv,slot),cost=price(item.price);return `<div class="item">${escape(item.name)} · Nv ${lv} · ${rarityName(item.rarity)} · Preço: ${cost} Ouro${cost!==item.price?` <span class="small muted">(base: ${item.price})</span>`:''} · ${slot} ${rt.state.gold<cost?'<span class="red small">Ouro insuficiente</span>':''} ${btn('Comprar',`buy:${slot}:${lv}`,rt.state.gold<cost)}</div>`;})).join(''))+stock;
}

function displayLog(){
 const entries=[...rt.log].map((entry,i)=>typeof entry==='string'?{text:entry,kind:/dano|HP|atacou/i.test(entry)?'damage':/EXP|ouro|Item obtido|Nível/i.test(entry)?'reward':'info',id:i}:entry);
 return `<div class="log" role="log" aria-live="polite">${entries.map((entry,i)=>`<div class="log-entry ${entry.kind||'info'} ${i===0?'new':''}">${escape(entry.text)}</div>`).join('')}</div>`;
}
/** A escolha do submenu pertence à navegação, não ao ciclo de turnos. */
export function combatControls(){
 const locked=rt.busy;
 const actionButton=(name,action,unavailable=false,meta='',extraClass='')=>
  `<button class="combat-action ${extraClass}" data-action="${action}" ${locked||unavailable?'disabled':''} aria-label="${escape(name+(meta?' '+meta:''))}"><span class="combat-action-name">${escape(name)}</span>${meta?`<span class="combat-action-meta">${escape(meta)}</span>`:''}</button>`;
 if(rt.sub==='main')return `<div class="combat-menu-grid">${actionButton('Atacar','submenu:attack')}${actionButton('Consumível','submenu:potion')}${actionButton('Fugir','flee',rt.state.combat.enemy.boss||!!rt.state.combat.dungeonRoom)}</div>`;
 if(rt.sub==='attack'){
  const basic=actionButton('Ataque comum','attack',false,'','combat-attack-basic');
  const skills=active[rt.state.cls].map((a,i)=>{
   const skill=effectiveSkill(rt.state,i),belowLevel=rt.state.lv<skill.level,lowMp=rt.state.mp<skill.cost;
   return actionButton(skill.name,`skill:${i}`,belowLevel||lowMp,belowLevel?`Nível ${skill.level} · Bloqueada`:`${skill.cost} MP${skill.variant==='standard'?'':skill.variant==='power'?' · Potência':' · Economia'}`,'combat-skill');
  }).join('');
  const exclusive=specSkills(rt.state).map((a,i)=>actionButton(a.name,`spec:${i}`,rt.state.mp<a.cost,`${a.cost} MP`,'combat-specialization')).join('');
  return `<div class="combat-attacks"><div class="combat-attack-basic-row">${basic}</div><div class="combat-skills-grid">${skills}</div>${exclusive?`<div class="combat-extra-skills"><div class="combat-extra-title">Especialização</div><div class="combat-extra-grid">${exclusive}</div></div>`:''}<div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div></div>`;
 }
 const potions=Object.entries(rt.state.consumables).map(([k,v])=>actionButton(`${k} (${v})`,`potion:${k}`,!v)).join('');
 return `<div class="combat-menu-grid">${potions}</div><div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div>`;
}

function resourceMeter(label,current,max,kind){
 const safeMax=Math.max(1,Number(max)||1),value=Math.max(0,Math.min(safeMax,Number(current)||0));
 const percent=Math.max(0,Math.min(100,100*value/safeMax));
 const tone=kind==='mp'?'mp':percent<=30?'low':percent<=65?'mid':'high';
 return `<div class="resource-meter ${kind}" role="group" aria-label="${label} ${value} de ${max}"><span class="resource-label">${label}</span><div class="resource-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><div class="resource-fill ${tone}" style="width:${percent}%"></div></div><span class="resource-value">${value}/${max}</span></div>`;
}
export function combatUI(){
 const c=rt.state.combat,e=c.enemy,s=stats(),artwork=detailedArtworks[e.baseName]||dungeonBossArt[e.baseName]||DUNGEON_BOSS_ART[e.baseName]||artworks[e.baseName]||art[e.baseName]||art.boss;
 const controls=combatControls();
 const status=rt.phase==='enemy-preparing'?`${e.name} prepara seu ataque...`:rt.phase==='player-action'?'Executando sua ação...':rt.phase==='enemy-hit'?'O inimigo recebeu o impacto!':rt.phase==='player-hit'?'Você recebeu o impacto!':'Escolha sua ação';
 const floating=rt.float?.amount>0?`<div class="floating-damage ${rt.float.side} ${rt.float.critical?'critical':''} ${rt.float.heal?'heal':''}">-${rt.float.amount}</div>`:'';
 const bossInfo=e.boss?`<div class="boss-phase">* FASE ${e.bossPhase||1}/3 · ${escape(BOSS_PHASES[e.baseName]?.phases[(e.bossPhase||1)-1]||'')} ${e.telegraph?`<div class="boss-warning">! ATAQUE IMINENTE! ${escape(e.telegraph.message)}<div>Prepare sua defesa neste turno.</div></div>`:''}</div>`:e.telegraph?.kind==='monster'?`<div class="combat-warning" role="status">! ATAQUE ANUNCIADO! ${escape(e.telegraph.message)}</div>`:'';
 return `<section class="combat-stage">`+panel(`${e.boss?'CHEFE · ':''}${escape(e.name)} ${e.boss?'':`<span class="monster-rarity rarity-${monsterRarity(e.rarityId).id}">[${monsterRarity(e.rarityId).label}]</span>`} · Nível ${e.lv}`,` ${bossInfo}<div class="enemy-visual ${rt.phase==='enemy-hit'?'impact':''} ${rt.float?.critical?'critical':''} ${rt.float?.element||''}">${resourceMeter('HP',e.hp,e.maxhp,'hp')}<div class="ascii-container"><pre class="ascii-art ${combatAnimationClass(rt.phase)}" data-creature-id="${escape(e.baseName)}" data-ascii="true">${escape(artwork)}</pre></div>${rt.float?.side==='enemy'?floating:''}</div>`)
 +panel('HERÓI · '+escape(rt.state.name),`<div class="hero-visual ${rt.phase==='player-hit'?'impact':''} ${rt.float?.heal?'healing':''}">${resourceMeter('HP',rt.state.hp,s.maxhp,'hp')}${resourceMeter('MP',rt.state.mp,s.maxmp,'mp')}${rt.float?.side==='player'?floating:''}</div><div class="ascii-container">${renderHeroAvatar(rt.state)}</div>` )
 +panel('AÇÕES',`<p class="turn-status">${escape(status)}</p><div class="combat-speed-options" role="group" aria-label="Velocidade do combate">${Object.entries(COMBAT_SPEEDS).map(([value,option])=>`<button type="button" class="combat-speed-option ${getCombatSpeed()===value?'selected':''}" data-action="combatSpeed:${value}" aria-pressed="${getCombatSpeed()===value}" ${rt.busy?'disabled':''}>${option.label}</button>`).join('')}</div><div class="combat-controls ${rt.busy?'locked':''}">${controls}</div>`)
 +panel('HISTÓRICO DE COMBATE',displayLog())+`</section>`;
}
export function forgeUI(){const region=mapId(rt.area),r=recipes(region),items=rt.state.items;const materials=Object.entries(rt.state.materials).filter(([,n])=>n>0).map(([name,n])=>`<div class="item">${escape(name)} ×${n}</div>`).join('')||'<p class="muted">Nenhum material.</p>';const craftRows=r.map(x=>`<div class="item"><b>${escape(x.name)}</b> · Nv ${x.level} · ${x.gold} ouro<div class="small muted">${Object.entries(x.materials).map(([k,v])=>`${escape(k)} ×${v}`).join(' · ')}</div>${btn('Fabricar',`craft:${x.id}`,rt.state.lv<x.level||rt.state.gold<x.gold||Object.entries(x.materials).some(([k,v])=>(rt.state.materials[k]||0)<v))}</div>`).join('');const upgradeRows=items.map(it=>{const cost=upgradeCost(it);return `<div class="item">${escape(it.name)} +${it.upgrade||0}${cost?` · ${cost.gold} ouro · ${Math.round(cost.chance*100)}% · bônus +${Math.round(cost.bonus*100)}%<div class="small muted">${Object.entries(cost.materials).map(([k,v])=>`${escape(k)} ×${v}`).join('')}</div>${btn('Aprimorar',`enhance:${it.uid}`,rt.state.gold<cost.gold||Object.entries(cost.materials).some(([k,v])=>(rt.state.materials[k]||0)<v))}`:' · Nível máximo +10'}</div>`;}).join('');const equipped=Object.values(rt.state.equip).map(uid=>items.find(x=>x.uid===uid)).filter(Boolean),sets=setBonuses(equipped);const order=forgeOrder(rt.state,region),commission=order&&!order.completed?`<div class="item"><b>Encomenda especial</b> · ${order.slot==='weapon'?'Arma':'Amuleto'} incomum, nível ${order.level}<p class="small muted">Exige ${order.required} × ${escape(order.material)}. Atributos definidos na fabricação, como nos demais equipamentos.</p><p>Preço: ${order.gold} ouro</p>${!order.unlocked?'<p class="small muted">Requer uma missão concluída nesta região.</p>':''}${btn('Encomendar equipamento','forgeOrder',!canForgeOrder(rt.state,region))}</div>`:'<p class="small muted">Encomenda regional já concluída.</p>';return (rt.cityFeedback?panel('FERRARIA · MENSAGEM',escape(rt.cityFeedback)):'')+panel('ENCOMENDA REGIONAL',commission)+panel('FERRARIA · MATERIAIS',materials)+panel('RECEITAS',craftRows)+panel('APRIMORAMENTO',upgradeRows||'<p class="muted">Nenhum equipamento.</p>')+panel('CONJUNTOS',SETS.map(set=>{const active=sets.active.find(x=>x.set.id===set.id),n=active?.n||equipped.filter(it=>it.setId===set.id).length;return `<div class="item">${escape(set.name)} · ${n}/5 peças <span class="small muted">2 peças: bônus principal · 3: VIT · 4: bônus adicional · 5: regeneração</span></div>`;}).join(''))+evolutionUI();}

export function specializationSummary(){const s=selectedSpec(rt.state);return panel('ESPECIALIZAÇÃO',s?`<p><b>${escape(s.name)}</b> · ${escape(s.passive)}</p><p>60: ${escape(s.skill)} · 75: ${escape(s.improved)} · 90: ${escape(s.ultimate)}</p>`:'<p class="muted">Escolha uma especialização a partir do nível 50.</p>');}
export function specializationUI(){const s=selectedSpec(rt.state);if(s)return specializationSummary()+panel('HABILIDADES EXCLUSIVAS',specSkills(rt.state).map(a=>`<div class="item">${escape(a.name)} · ${a.cost} MP · ${a.mult}x · ${a.element}</div>`).join('')||'Novas habilidades nos níveis 60 e 90.');return panel('ESCOLHA SUA ESPECIALIZAÇÃO',specOptions(rt.state.cls).map(x=>`<div class="item"><b>${escape(x.name)}</b><p>${escape(x.passive)} · ${escape(x.improved)}</p><p>Ativa 60: ${escape(x.skill)} · Final 90: ${escape(x.ultimate)}</p>${btn('Escolher '+x.name,`chooseSpec:${x.id}`,rt.state.lv<50)}</div>`).join(''));}
export function dungeonUI(){const ds=dungeonState(rt.state),a=ds.attempt;if(a){const d=DUNGEONS.find(x=>x.id===a.id);return panel(d.name,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape(dungeonScenes[d.name]||d.art)}</pre></div><p>Sala ${a.room}/5 · ${['Combate','Combate ou armadilha','Recuperação','Elite','Chefe exclusivo'][a.room-1]}</p><p>HP e MP são mantidos entre salas.</p><div class="actions">${a.roomResolved?(a.room<5?btn('Próxima sala','dungeonAdvance'):''):btn('Entrar na sala','dungeonAction')}${btn('Abandonar tentativa','dungeonAbandon')}</div>`);}return DUNGEONS.map(d=>panel(d.name,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape(dungeonScenes[d.name]||d.art)}</pre></div><p>${escape(d.description)} · Nível recomendado ${d.level} · Chefe: ${escape(d.boss)}</p><p>Melhor sala: ${ds.best[d.id]||0}/5 · ${ds.completed.includes(d.id)?'Concluída':'Não concluída'}</p>${btn('Entrar','dungeonEnter:'+d.region,!dungeonAvailable(rt.state,d))}`)).join('');}

let lastRenderedScreen=null;
export function render(){const preserve=shouldPreserveViewport(lastRenderedScreen,rt.screen);const viewport=preserve?captureViewport(rt.app):null;const oldBars=[...rt.app.querySelectorAll('.bar>div')].map(x=>x.style.width);rt.app.innerHTML=`<header class="head">${header()}</header><div class="content ${rt.state?.combat&&rt.screen==='combat'?'combat-content':''}">${rt.state&&!['world','home','combat','result','journey'].includes(rt.screen)?'<div class="menu-back-container"><button type="button" class="menu-back-button" data-action="menuBack">&lt; VOLTAR</button></div>':''}${!rt.state?(rt.screen==='create'?create():home()):({home:home,world,paths:pathSelection,journey:pathJourney,camp:campUI,player:playerMenu,character,inventory,skills,achievements:achievementsUI,secrets:secretsUI,quests:questUI,bestiary:bestiaryUI,statistics:statisticsUI,tavern:tavernUI,forge:forgeUI,dungeons:dungeonUI,dungeon:dungeonUI,specializations:specializationUI,maps:worldMap,city,combat:combatUI,merchant:store,result:()=>panel('RESULTADO',`${displayLog()}${btn('Continuar',dungeonState(rt.state).attempt?'nav:dungeon':'world')}`)}[rt.screen]||world)()}`;if(rt.screen!=='combat'){rt.app.querySelectorAll('.content button[data-action]').forEach(button=>{if(button.closest('.menu-back-container'))return;if(/^\s*(?:<|&lt;)?\s*VOLTAR\s*$/i.test(button.textContent.trim())){const wrapper=button.closest('.menu-back');if(wrapper&&wrapper.querySelectorAll('button').length===1)wrapper.remove();else button.remove();}});}if(viewport)restoreViewport(rt.app,viewport);else{const doc=document.scrollingElement;if(doc)doc.scrollTop=0;const content=rt.app.querySelector('.content');if(content)content.scrollTop=0;}lastRenderedScreen=rt.screen;rt.app.querySelectorAll('.bar>div').forEach((el,i)=>{if(oldBars[i]){const target=el.style.width;el.style.width=oldBars[i];requestAnimationFrame(()=>{el.style.width=target;});}});rt.app.querySelectorAll('.ascii-art').forEach(fitAscii);if(!viewport)rt.app.querySelectorAll('.log').forEach(el=>el.scrollTop=0);syncCreatureAnimation(rt.app,rt.screen==='combat');if(viewport)restoreViewport(rt.app,viewport);if(rt.screen==='create'){let sel=$('#hero-class'),preview=$('#class-preview');const update=()=>{let c=classes[sel.value];preview.textContent=`${c.name} · HP ${c.hp} · MP ${c.mp} · Armas: ${c.weapons.join(', ')}`;};sel.onchange=update;update();}}

export function fitAscii(el){
 const container=el.parentElement;
 if(!container)return;
 const maxFont=6;
 const available=Math.max(1,container.clientWidth-8);
 const availableHeight=Math.max(1,container.clientHeight||window.innerHeight*.25);
 el.style.fontSize=`${maxFont}px`;
 el.style.whiteSpace='pre';el.style.width='max-content';el.style.maxWidth='none';
 const naturalWidth=Math.max(1,el.scrollWidth);
 const naturalHeight=Math.max(1,el.scrollHeight);
 const ratio=Math.min(1,available/naturalWidth,availableHeight/naturalHeight);
 el.style.fontSize=`${Math.max(.5,Math.floor(maxFont*ratio*100)/100)}px`;
 el.dataset.artSmall=ratio<.38?'true':'false';
 if(ratio<.38 && !container.closest('.combat-stage')){
   container.classList.add('ascii-zoomable');
   container.title='Arte detalhada: clique para ampliar';
   container.setAttribute('tabindex','0');
   container.setAttribute('role','button');
   container.setAttribute('aria-label','Ampliar arte ASCII');
   container.onclick=()=>openAsciiViewer(el.textContent);
   container.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAsciiViewer(el.textContent);}};
 }else{container.classList.remove('ascii-zoomable');container.onclick=null;container.onkeydown=null;container.removeAttribute('role');container.removeAttribute('tabindex');}
}
function openAsciiViewer(content){
 let dialog=document.querySelector('#ascii-art-viewer');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='ascii-art-viewer';dialog.innerHTML='<button type="button" class="ascii-close">Fechar</button><pre></pre>';document.body.appendChild(dialog);dialog.querySelector('button').onclick=()=>dialog.close();}
 dialog.querySelector('pre').textContent=content;
 if(!dialog.open)dialog.showModal();
}
window.addEventListener('resize',()=>document.querySelectorAll('.ascii-art').forEach(fitAscii));

// Atualização localizada: não reconstrói cabeçalho, arte, painéis nem a página.
export function updateHeroDistribution(){
 if(rt.screen!=='character'||!rt.app.querySelector('.hero-attributes'))return render();
 const snapshot=captureViewport(rt.app);
 const next=document.createElement('div');next.innerHTML=character();
 for(const selector of ['.hero-points','.hero-attributes','.hero-distribution-actions','#hero-feedback','.hero-preview']){
  const current=rt.app.querySelector(selector),replacement=next.querySelector(selector);
  if(current&&replacement){
   if(selector==='.hero-attributes'){
    const oldRows=current.querySelectorAll('.hero-attribute'),newRows=replacement.querySelectorAll('.hero-attribute');
    if(oldRows.length===newRows.length){oldRows.forEach((row,i)=>{const oldValue=row.querySelector('.hero-attribute-value'),newValue=newRows[i].querySelector('.hero-attribute-value');if(oldValue&&newValue)oldValue.innerHTML=newValue.innerHTML;const oldButtons=row.querySelectorAll('button'),newButtons=newRows[i].querySelectorAll('button');oldButtons.forEach((button,j)=>{if(newButtons[j])button.disabled=newButtons[j].disabled;});});continue;}
   }
   if(selector==='.hero-distribution-actions'){const a=current.querySelectorAll('button'),b=replacement.querySelectorAll('button');a.forEach((button,i)=>{if(b[i])button.disabled=b[i].disabled;});continue;}
   current.innerHTML=replacement.innerHTML;
  }
 }
 restoreViewport(rt.app,snapshot);
}

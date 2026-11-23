import {miniBossForArea,miniBossArtworkForArea,stageBossForArea} from './area-bosses.js';
import {isStageBossArea} from './exploration-challenge.js';
import {challengeProgress,mapUnlocked,encounterPending,REQUIRED_EXPLORATIONS} from './exploration-challenge.js';
import {miniBossFor,miniBossArtwork} from './mini-bosses.js';
import {playerSkillCooldown} from './turn-cooldowns.js';
import {CLASS_RESOURCES,CLASS_SKILLS,skillInfo,resourceValue,canPaySkillResource} from './class-combat.js';
import {SPECIAL_MILESTONES,specialMilestones} from './attribute-milestones.js';
import {monsterKit,monsterPassives,bossKit} from './monster-identity.js';
import {uxIcon,guideForScreen,settingsOverlay,applyUxPrefs,trackedQuest} from './ux-consolidated.js';
import {screenHeadingLabel,enhanceMobileAccessibility} from './mobile-accessibility-stage8.js';
import {hasRecoverableSave} from './storage.js';
import {fitAsciiFont,openDetailedAsciiViewer} from './ascii-presentation.js';
import {WELCOME_ART_MOBILE,WELCOME_ART_DESKTOP,fitWelcomeArtwork} from './welcome-art.js';
import {objectArtwork,objectIcon,equipmentArtwork,OBJECT_ICON} from './density-objects.js';
import {highDensityObjectArtwork,highDensityEquipmentArtwork} from './high-density-objects.js';
import {highDensityNpcArtwork} from './high-density-npcs.js';
import {highDensityEventArtwork} from './high-density-events.js';
import {densityEventArtwork,eventMotionClass} from './density-events.js';
import {densityNpcArtwork,densityInteriorArtwork} from './density-settlements.js';
import {densityCreatureArtwork} from './density-bestiary.js';
import {catalogForShop,createCatalogItem,itemBonusesLabel} from './equipment-catalog.js';
import {worldDanger} from './final-balance.js';
import {DYNAMIC_QUESTS,dynamicStatus} from './dynamic-quests.js';
import {adventureEntry} from './procedural-adventures.js';
import {TAVERNS,TAVERN_GUESTS,guestForRegion,guestDialogue,pendingTavernEvent} from './tavern-stories.js';
import {EXTENDED_ARTWORKS} from './expanded-species.js';
import {investedMilestones} from './attribute-milestones.js';
import {turnsRemaining,playerCooldownDetails,specCooldownDetails} from './turn-cooldowns.js';
import {SECRET_EVENTS,SECRET_BOSS_REGIONS} from './secrets.js';
import {fallbackMenu} from './menu-history.js';
import {sectionNavigation,rememberSectionScreen} from './navigation-sections.js';
import {ACHIEVEMENTS,ACHIEVEMENT_BY_ID,equippedTitle} from './achievements.js';
import {nextEvolution,evolutionRequirement,isEvolvableWeapon,EVOLUTION_STAGES} from './weapon-evolution.js';
import {effectiveSkill,SKILL_VARIANTS,configuredVariant} from './skill-variants.js';
import {COMBAT_SPEEDS,getCombatSpeed} from './combat-speed.js';
import {PATHS,activeJourney,canExplore} from './journey-paths.js';
import {pathChoices,journeyOverview} from './adventure-presentation.js';
import {regionConditions,encounterChance} from './world-climate.js';
import {pendingEvent,canChoose,campRestStatus,CAMP_COST,CAMP_COOLDOWN} from './journey-events.js';
import {captureViewport,restoreViewport,shouldPreserveViewport} from './viewport-state.js';
import { detailedArtworks } from './artworks-detailed.js';
import { dungeonScenes, dungeonBossArt } from './dungeon-artworks.js';
import { heroArtworks } from './hero-artworks.js';
import {renderHeroAvatar} from './hero-avatar.js';
import {compareEquipment,formatValue,EQUIPMENT_SLOTS} from './equipment-comparison.js';
import { detailedCities } from './cities-detailed.js';
import {syncCreatureAnimation,combatAnimationClass} from './ascii-animation.js';
import {DUNGEONS,DUNGEON_BOSS_ART,dungeonAvailable,dungeonState} from './dungeons.js';
import {specOptions,selectedSpec,specSkills} from './specializations.js';
import {recipes,craft,enhance,upgradeCost,SETS,setBonuses,UPGRADE_BONUS} from './crafting.js';
import {materialMarket,refiningCost} from './artisan-economy.js';
import {CATALOG_BY_ID} from './equipment-catalog.js';
import { questUI,bestiaryUI,statisticsUI } from './progression-ui.js';
import { BOSS_PHASES } from './boss-phases.js';
import { monsterRarity } from './monster-rarity.js';
import { artworks } from './artworks.js';
import { cityArtworks } from './city-artworks.js';
import {densityCityArtwork,densityBiomeArtwork,densityDungeonArtwork} from './density-world.js';
import {highDensityCityArtwork,highDensityBiomeArtwork,highDensityDungeonArtwork} from './high-density-world.js';
import {highDensityInteriorArtwork} from './high-density-interiors.js';
const $ = selector => document.querySelector(selector);
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { btn, panel, stat } from './ui-helpers.js';
import { passives, stats } from './player.js';
import {distribution,ATTRIBUTE_HELP,pending} from './hero-distribution.js';
import { makeItem, validEquip, rarityName } from './equipment.js';
import { potionPrice } from './shops.js';
import {LOCAL_NPCS,RECURRING_NPCS,cityNpcs,npcDialogue,reputation,reputationLabel,reputationDiscount,cityPrice,cityOffer,forgeOrder,canForgeOrder,canAnswerQuiz,cityQuizOptions} from './city-life.js';
import {QUESTS,questStatus} from './progression.js';
export function header(){
 if(rt.state?.combat&&rt.screen==='combat')return '<div class="brand">ASCII REALMS</div>';
 const screen=rt.state?screenHeadingLabel(rt.screen):'Bem-vindo';
 return `<div class="ux-topbar"><div class="ux-head-ident"><div class="brand">ASCII REALMS</div><div class="ux-head-section">${escape(screen)}</div></div><button type="button" class="ux-settings-trigger" data-action="uxSettingsOpen" aria-label="Abrir configurações">${uxIcon('settings')}</button></div>`;
}

export function climateSummary(){if(!rt.state)return '';const c=regionConditions(rt.state,mapId(rt.area));const t=c.time;
 return `<div class="climate-summary" role="status"><span><b>DIA ${t.day}</b> · ${String(t.hour).padStart(2,'0')}:00 · ${t.period}</span><span>CLIMA: <b>${escape(c.weather.name)}</b></span>${c.event?`<span class="climate-event">REGIÃO: <b>${escape(c.event.name)}</b> · ${c.event.remaining} ações restantes</span>`:''}</div>`;
}
export function home(){
 const saved=hasRecoverableSave();
 return `<div class="ux-start-screen"><div class="ux-start-illustration" role="img" aria-label="Paisagem medieval épica em caracteres ASCII com montanhas, castelo, ruínas e o título ASCII REALMS"><pre class="ux-welcome-art ux-welcome-art-mobile" aria-hidden="true">${escape(WELCOME_ART_MOBILE)}</pre><pre class="ux-welcome-art ux-welcome-art-desktop" aria-hidden="true">${escape(WELCOME_ART_DESKTOP)}</pre></div><div class="ux-start-copy"><span class="ux-kicker">UMA AVENTURA EM CARACTERES</span><h2>O mundo aguarda seu herói.</h2><p>Explore regiões esquecidas, supere criaturas e escreva sua própria história.</p></div><p class="ux-save-status" role="status">${saved?'Aventura salva neste dispositivo.':'Nenhuma aventura salva neste dispositivo.'}</p><div class="start-actions">${saved?btn('Continuar aventura','continue')+btn('Criar novo personagem','create'):btn('Criar novo personagem','create')+btn('Continuar aventura','continue',true)}<button type="button" class="danger" data-action="delete" ${saved?'':'disabled'}>Excluir progresso salvo</button></div><p class="small muted ux-home-help">O progresso fica armazenado no navegador. Excluir exige confirmação.</p></div>`;
}

export function playerMenu(){
 const entries=[['Herói e atributos','character','Aparência, pontos e marcos'],['Inventário e equipamentos','inventory','Trocar, comparar e utilizar itens'],['Habilidades','skills','Golpes, magias e variações'],['Especialização','specializations','Novas habilidades e caminhos'],['Estatísticas','statistics','Desempenho da aventura'],['Conquistas e títulos','achievements','Títulos e feitos desbloqueados']];
 return panel('PERSONAGEM',`<p class="small muted ux-section-lead">Seu herói, equipamentos e evolução em um só lugar.</p><div class="ux-route-list">${entries.map(([label,id,description])=>`<button type="button" class="ux-route" data-action="nav:${id}"><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div><p class="small muted ux-related-link">Procurando missões e descobertas? ${btn('Abrir Diário','navArea:diario')}</p>`);
}
export function diaryHub(){
 const state=rt.state,region=mapId(rt.area);
 const active=QUESTS.filter(q=>state.quests?.active?.[q.id]);
 const ready=QUESTS.filter(q=>state.quests?.completed?.includes(q.id));
 const narrativeActive=Object.keys(state.dynamicQuests?.active||{}).length;
 const personalActive=Object.values(state.adventure?.entries||{}).filter(entry=>['investigate','hunt','delivery','decision'].includes(entry.phase)).length;
 const discovered=Object.values(state.bestiary||{}).filter(entry=>entry?.encounters>0).length;
 const guests=Array.isArray(state.cityLife?.tavern?.guestsMet)?state.cityLife.tavern.guestsMet:[];
 const metLocal=Object.keys(state.cityLife?.npcs||{}).filter(id=>state.cityLife.npcs[id]?.talks>0);
 const named=[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS].filter(npc=>metLocal.includes(npc.id)||guests.includes(npc.id));
 const current=active.filter(q=>q.region===region);
 const nearest=trackedQuest(state,region)||current[0]||active[0];
 const questLine=nearest?`<strong>${escape(nearest.title)}</strong><span class="small muted">${escape(nearest.description)} · ${escape(maps[nearest.region][0])}</span>`:'<span class="small muted">Nenhuma missão tradicional em andamento. Converse na taverna ou explore a região.</span>';
 const links=[['Missões',`${active.length+narrativeActive+personalActive} em andamento · ${ready.length} para receber`,'quests'],['Bestiário',`${discovered} criaturas encontradas`,'bestiary'],['Descobertas',`${SECRET_EVENTS.filter(secret=>state.narrative?.completed?.includes(secret.id)).length} segredos registrados`,'secrets']];
 return panel('DIÁRIO DE AVENTURAS',`<p class="small muted ux-section-lead">Missões, registros, criaturas e pessoas que você conheceu.</p><div class="ux-hub-highlight"><span class="ux-kicker">OBJETIVO EM ANDAMENTO</span>${questLine}${btn('Consultar missões','nav:quests')}</div><div class="ux-route-list">${links.map(([label,description,id])=>`<button type="button" class="ux-route" data-action="nav:${id}"><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div><details class="ux-disclosure"><summary>NPCs conhecidos (${named.length})</summary>${named.length?`<ul class="ux-known-npcs">${named.map(npc=>`<li>${escape(npc.name)} <span class="small muted">· ${escape(npc.role)}</span></li>`).join('')}</ul>`:'<p class="small muted">Converse com personagens nas tavernas para conhecê-los.</p>'}</details>${state.adventure?.journal?.length?`<details class="ux-disclosure"><summary>Últimos acontecimentos</summary>${state.adventure.journal.slice(-5).reverse().map(entry=>`<p class="small muted">${escape(entry)}</p>`).join('')}</details>`:''}`);
}
export function atlasHub(){
 const state=rt.state,region=mapId(rt.area),m=maps[region],bosses=state.bosses?.length||0;
 const unlocked=maps.filter((_,i)=>mapUnlocked(state,i*10+1)).length;
 const routes=[['Mapa e regiões','Escolha uma área desbloqueada','maps'],['Visitar cidade',`Serviços disponíveis em ${m[1]}`,'city'],['Taverna','Personagens, rumores e contratos','tavern'],['Ferraria','Melhorias e fabricação','forge'],['Masmorras','Desafios e chefes especiais','dungeons']];
 return panel('MUNDO',`<div class="ux-hub-highlight"><span class="ux-kicker">SUA LOCALIZAÇÃO</span><strong>${escape(m[0])}</strong><span class="small muted">${escape(m[1])} · Área ${rt.area}/100 · ${unlocked}/10 regiões acessíveis · ${bosses}/10 chefes regionais vencidos</span></div><div class="ux-route-list">${routes.map(([label,description,id])=>`<button type="button" class="ux-route" data-action="nav:${id}"><span><strong>${label}</strong><small>${escape(description)}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div><p class="small muted ux-section-footnote">Cada área é liberada após a primeira vitória no desafio da área anterior. A cada 10 áreas há um Boss de Fase.</p>`);
}

export function create(){return panel('CRIAR PERSONAGEM',`<div class="character-creation"><label for="hero-name">Nome do aventureiro</label><p><input id="hero-name" maxlength="24" placeholder="Seu nome" value="Herói"></p><label for="hero-class">Classe</label><p><select id="hero-class">${Object.entries(classes).map(([id,c])=>`<option value="${id}">${c.name}</option>`).join('')}</select></p><div id="class-preview"></div>${btn('Iniciar aventura','start')}</div>`);}

function adventureVitals(summary){
 return `<div class="ux-journey-vitals" aria-label="Recursos atuais"><div class="ux-journey-vital"><div class="ux-vital-heading"><span>HP</span><strong>${summary.hp}/${summary.maxhp}</strong></div><div class="ux-journey-meter" role="progressbar" aria-label="Vida atual" aria-valuemin="0" aria-valuemax="${summary.maxhp}" aria-valuenow="${summary.hp}"><span style="width:${summary.hpPercent}%"></span></div></div><div class="ux-journey-vital"><div class="ux-vital-heading"><span>MP</span><strong>${summary.mp}/${summary.maxmp}</strong></div><div class="ux-journey-meter mp" role="progressbar" aria-label="Mana atual" aria-valuemin="0" aria-valuemax="${summary.maxmp}" aria-valuenow="${summary.mp}"><span style="width:${summary.mpPercent}%"></span></div></div></div>`;
}
function journeyArt(art,label){return `<details class="ux-journey-art"><summary>${escape(label)}</summary><div class="ascii-container city-scene hd-world-scene"><pre class="ascii-art" data-ascii="true" aria-label="${escape(label)}">${escape(art)}</pre></div></details>`;}
function journeyHistory(lines){return lines.length?`<details class="ux-journey-log"><summary>Últimos acontecimentos (${lines.length})</summary><ul>${lines.map(line=>`<li>${escape(line)}</li>`).join('')}</ul></details>`:'';}

/** Reutiliza os mesmos dados de XP, HP e MP do herói; nenhuma segunda fórmula. */
function miniBossMeter(state,area=rt.area){
 const progress=challengeProgress(state,area),isBoss=isStageBossArea(area),kit=isBoss?stageBossForArea(area):miniBossForArea(area);
 if(!kit)return '';
 const kind=isBoss?'BOSS DA FASE':'MINI BOSS';
 const message=progress.pending?`${kind} encontrado: ${kit.name}`:`Explorações consecutivas: ${progress.current}/${REQUIRED_EXPLORATIONS}`;
 return `<div class="mini-boss-progress" role="group" aria-label="Desafio da área ${area}"><p class="mini-boss-name">${kind} · ${escape(kit.name)}</p><div class="mini-boss-progress-heading"><strong>${escape(message)}</strong><span>${progress.pending?'Encontro obrigatório':`${progress.percent}%`}</span></div><div class="mini-boss-progress-track" role="progressbar" aria-label="Progresso do desafio" aria-valuemin="0" aria-valuemax="${REQUIRED_EXPLORATIONS}" aria-valuenow="${progress.current}"><span style="width:${progress.percent}%"></span></div><p class="small muted">Estado: <b>${progress.defeated?'Derrotado anteriormente, novo confronto disponível':'Não derrotado'}</b> · Ações na cidade reiniciam a sequência.</p></div>`;
}
function explorationXp(){const s=rt.state,isMax=s.lv>=100,max=isMax?1:xpNeed(s.lv),xp=isMax?1:Math.max(0,Math.min(max,s.xp));const pct=isMax?100:clamp(xp/max*100,0,100);return `<div class="mini-boss-exp stat-exp" aria-label="Experiência do personagem"><div class="mini-boss-exp-heading"><span>EXP</span><b>${isMax?'MAX':`${xp}/${max}`}</b></div><div class="mini-boss-exp-track" role="progressbar" aria-label="Experiência" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${xp}"><span style="width:${pct}%"></span></div></div>`;}
export function miniBossIntro(){
 const state=rt.state,area=state?.explorationChallenge?.pendingMapId,isBoss=isStageBossArea(area);
 const kit=isBoss?stageBossForArea(area):miniBossForArea(area),region=mapId(area),label=isBoss?'BOSS DA FASE':'MINI BOSS';
 if(!kit||!encounterPending(state))return panel('DESAFIO','Nenhum confronto especial pendente.');
 const picture=isBoss?(densityCreatureArtwork(kit.name,true,1)||detailedArtworks[kit.name]||artworks[kit.name]||art.boss):miniBossArtworkForArea(area);
 const profile=isBoss?'Boss principal com fases, ataques anunciados e mecânicas exclusivas.':`Passivas: ${kit.passives.map(p=>escape(p.name)).join(' · ')}. Técnicas: ${kit.skills.map(x=>escape(x[1])).join(' · ')}.`;
 return `<section class="mini-boss-intro"><span class="mini-boss-kicker">${label} · ÁREA ${area} · ${escape(maps[region][0])}</span><h3>${escape(kit.name)}</h3><p class="mini-boss-story">${escape(kit.intro)}</p><div class="ascii-container mini-boss-portrait"><pre class="ascii-art" data-ascii="true" aria-label="${label} ${escape(kit.name)}">${escape(picture)}</pre></div><div class="mini-boss-warning" role="status">15/15 explorações concluídas. O encontro é obrigatório para continuar.</div><p class="small muted">${profile}</p>${btn(`ENFRENTAR ${label}`,'miniBossFight')}</section>`;
}

export function world(){
 const region=mapId(rt.area),m=maps[region],boss=rt.area%10===0,s=stats(),risk=worldDanger(rt.state.lv,rt.area,rt.state.hp,s.maxhp),exploreAllowed=canExplore(rt.state,rt.area);
 const inJourney=activeJourney(rt.state),challenge=challengeProgress(rt.state,rt.area),overview=inJourney?journeyOverview(rt.state,rt.area,s):null;
 const quest=trackedQuest(rt.state,region);
 const objective=quest?quest.description:inJourney?'Continue a exploração no caminho escolhido.':'Explore a região, descubra acontecimentos e encontre novos desafios.';
 const nextAction=inJourney?'Retomar expedição':exploreAllowed?'Iniciar uma exploração':'Preparar-se para explorar';
 const explanation=inJourney?`${overview.pathName} · ${overview.steps} explorações realizadas. Sua rota permanece salva.`:exploreAllowed?'Escolha um caminho e descubra o que existe adiante.':'Verifique seu progresso para continuar.';
 const pct=(value,max)=>Math.round(clamp(100*value/Math.max(1,max),0,100));
 const vital=(name,value,max,color)=>`<div class="ux-world-vital"><span>${name}</span><div class="ux-world-meter ${color}" role="progressbar" aria-label="${name}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><span style="width:${pct(value,max)}%"></span></div><b>${value}/${max}</b></div>`;
 const currentExp=rt.state.lv===100?1:rt.state.xp,requiredExp=rt.state.lv===100?1:xpNeed(rt.state.lv);
 return `<section class="ux-world-dashboard"><div class="ux-world-hero-card"><div class="ux-world-hero-top"><div><strong class="ux-world-hero-name">${escape(rt.state.name)}</strong><span>${escape(classes[rt.state.cls].name)} · Nível ${rt.state.lv}</span></div><strong class="ux-world-gold">${rt.state.gold} ouro</strong></div><div class="ux-world-vitals">${vital('HP',rt.state.hp,s.maxhp,'hp')}${vital('MP',rt.state.mp,s.maxmp,'mp')}${vital('EXP',currentExp,requiredExp,'exp')}</div></div>
 <section class="ux-adventure-overview ux-world-place-card" aria-label="Local atual"><div class="ux-adventure-location"><span class="ux-kicker">LOCAL ATUAL</span><span class="ux-world-area">Área ${rt.area}/100</span><strong>${escape(m[0])}</strong></div><div class="ascii-container ux-world-scene hd-world-scene"><pre class="ascii-art" data-ascii="true" aria-label="Paisagem de ${escape(m[0])}">${escape(highDensityBiomeArtwork(m[0])||densityBiomeArtwork(m[0])||detailedCities[m[1]]||cityArtworks[m[1]])}</pre></div><div class="ux-world-goal"><span class="ux-kicker">OBJETIVO</span><p>${escape(objective)}</p>${quest?`<button type="button" class="ux-world-goal-link" data-action="nav:quests">Consultar missão</button>`:''}</div><div class="ux-next-step"><strong>${escape(nextAction)}</strong><p>${escape(explanation)}</p></div></section>
 ${inJourney?`<p class="ux-resume-line"><strong>Expedição em andamento:</strong> ${escape(overview.pathName)} · ${overview.steps} explorações · ${overview.pendingEvent?'Há uma decisão pendente.':'Rota preservada.'}</p>`:''}
 ${miniBossMeter(rt.state,rt.area)}<div class="main-actions ux-world-actions" aria-label="Ações da aventura">${btn(inJourney?'Continuar explorando':'Explorar','explore',!exploreAllowed)}${btn('Selecionar mapa','maps')}${btn('Visitar cidade','city')}${challenge.pending?btn(isStageBossArea(rt.area)?'ENFRENTAR BOSS DA FASE':'ENFRENTAR MINI BOSS','miniBossIntro'):''}</div>
 <details class="ux-disclosure ux-world-extra"><summary>Região e condições</summary><p class="ux-risk-line epic8-danger small"><b>RISCO ${escape(risk.label)}</b> · ${escape(risk.message)}</p>${climateSummary()}<p class="small muted">Criaturas conhecidas: ${escape(m.slice(3,6).join(', '))}. Área ${rt.area}/100.</p></details>${rt.achievementFeedback?`<p class="stage6-status" role="status">${escape(rt.achievementFeedback)}</p>`:''}</section>`;
}

export function pathSelection(){
 const m=maps[mapId(rt.area)],paths=pathChoices(rt.state,rt.area),ready=canExplore(rt.state,rt.area);
 const list=paths.map(path=>`<article class="ux-path-card" data-path="${path.id}" role="listitem"><div class="ux-path-heading"><span class="ux-path-tag">${escape(path.tag)}</span><strong>${escape(path.name)}</strong></div><p><b>${escape(path.focus)}.</b> ${escape(path.hint)}</p><div class="ux-path-stats"><span class="ux-path-stat">Encontro hostil: ${path.encounterPercent}%</span><span class="ux-path-stat">Outros resultados: ${path.nonHostilePercent}%</span></div>${btn(`Escolher ${escape(path.name.replace('Caminho ',''))}`,`pathSelect:${path.id}`,!ready)}</article>`).join('');
 return panel('ESCOLHER CAMINHO',`${miniBossMeter(rt.state,rt.area)}<p class="ux-path-intro">${escape(m[0])} · Área ${rt.area}. Selecione o risco que prefere para esta expedição.</p>${climateSummary()}<div class="ux-path-grid" role="list" aria-label="Rotas de exploração">${list}</div><p class="ux-path-note">Percentuais estimados por exploração, considerando as condições atuais. O clima pode alterá-los entre ações. Recompensas e descobertas não são garantidas.</p>`);
}
export function pathJourney(){
 if(!activeJourney(rt.state))return pathSelection();
 const m=maps[mapId(rt.area)],j=rt.state.journey,event=pendingEvent(rt.state),personal=adventureEntry(rt.state,mapId(rt.area)),overview=journeyOverview(rt.state,rt.area,stats());
 const scene=highDensityBiomeArtwork(m[0])||densityBiomeArtwork(m[0])||detailedCities[m[1]]||cityArtworks[m[1]];
 const stepProgress=personal?.entry&&personal.entry.phase!=='done'?`<div class="ux-journey-alert"><strong>Investigação: ${escape(personal.story.title)}</strong>${escape({available:'Disponível em Missões',investigate:`Pistas ${personal.entry.clues.length}/2`,hunt:`Confrontos ${personal.entry.kills}/2`,delivery:'Entregue na taverna',decision:'Aguardando decisão'}[personal.entry.phase]||'Em andamento')}</div>`:'';
 const pending=event?`<section class="ux-journey-event" aria-label="Decisão de exploração"><h4>${escape(event.title)}</h4><p>${escape(event.description)}</p><div class="journey-event-options">${event.choices.map(choice=>btn(escape(choice.label),`journeyChoice:${event.id}:${choice.id}`,!canChoose(rt.state,event.id,choice.id))).join('')}</div><p class="small muted">Resolva o acontecimento para continuar explorando.</p><details class="ux-journey-art"><summary>Ver ilustração do acontecimento</summary>${eventScene(event.id)}</details></section>`:'';
 const challenge=challengeProgress(rt.state,mapId(rt.area));
 const rest=overview.restRemaining===0?'Descanso disponível no acampamento':`Próximo descanso em ${overview.restRemaining} explorações (sem interromper sua rota)`;
 return panel('EXPLORAÇÃO',`<div class="ux-journey-header"><div class="ux-journey-place"><span class="ux-kicker">EXPEDIÇÃO EM ANDAMENTO</span><strong>${escape(overview.pathName)}</strong><p>${escape(m[0])} · Área ${rt.area}/100</p></div><div class="ux-journey-meta"><div class="ux-journey-chip">Passos realizados<strong>${overview.steps}</strong></div><div class="ux-journey-chip">Risco estimado<strong>${overview.encounterPercent}% hostil</strong></div></div><div class="ux-journey-stats expedition-stats">${adventureVitals(overview)}${explorationXp()}</div></div>${miniBossMeter(rt.state,rt.area)}${climateSummary()}${pending?'<div class="ux-journey-alert" role="status"><strong>Decisão pendente</strong>Escolha como agir para liberar a exploração e o acampamento.</div>':''}${pending}${stepProgress}<div class="ux-journey-actions" aria-label="Ações da expedição">${btn('CONTINUAR EXPLORANDO','journeyContinue',!!event||!!rt.state.journey.pendingKind||!canExplore(rt.state,rt.area))}${challenge.pending?btn(isStageBossArea(rt.area)?'ENFRENTAR BOSS DA FASE':'ENFRENTAR MINI BOSS','miniBossIntro'):''}${btn('Acampamento','journeyCamp',!!event)}${btn('Voltar à cidade','journeyCity',!!event)}</div><p class="ux-journey-rest">${escape(rest)}. Voltar à cidade encerra a expedição e abre seus serviços.</p>${journeyHistory(j.last)}${journeyArt(scene,`Ver paisagem de ${m[0]}`)}`);
}
export function campUI(){
 if(!activeJourney(rt.state))return panel('ACAMPAMENTO','Jornada não encontrada.');
 const current=stats(),c=campRestStatus(rt.state),consumables=rt.state.consumables,overview=journeyOverview(rt.state,rt.area,current);
 const detail=c.remaining?`Próximo descanso em ${c.remaining} explorações.`:rt.state.gold<CAMP_COST?`Ouro insuficiente: descanso custa ${CAMP_COST} ouro.`:'Você pode descansar agora.';
 const potions=['hp','mp','elixir'].map(type=>btn(`Usar ${type==='hp'?'vida':type==='mp'?'mana':'elixir'} (${consumables[type]||0})`,`campPotion:${type}`,!consumables[type]||(type==='hp'&&rt.state.hp>=current.maxhp)||(type==='mp'&&rt.state.mp>=current.maxmp)||(type==='elixir'&&rt.state.hp>=current.maxhp&&rt.state.mp>=current.maxmp))).join('');
 return panel('ACAMPAMENTO',`<div class="ux-camp-summary"><span class="ux-kicker">EXPEDIÇÃO · ${escape(overview.pathName)}</span><p class="small muted">Área ${rt.area}/100 · ${overview.steps} explorações · ${rt.state.gold} ouro</p>${adventureVitals(overview)}</div><div class="ux-camp-status" role="status"><strong>${escape(detail)}</strong><p class="small muted">Descansar recupera 25% do HP e MP máximos, custa ${CAMP_COST} ouro e tem 10% de chance de emboscada. Intervalo: ${CAMP_COOLDOWN} explorações.</p></div><div class="ux-camp-actions" aria-label="Ações do acampamento">${btn(`Descansar (${CAMP_COST} ouro)`,'campRest',!c.canRest)}${potions}${btn('Voltar ao caminho','campLeave')}</div>${climateSummary()}${journeyHistory(rt.state.journey.last)}`);
}

export function secretsUI(){
 const state=rt.state,found=SECRET_EVENTS.filter(x=>state.narrative.completed.includes(x.id));
 const defeated=state.secrets.guardians.length;
 const entries=SECRET_EVENTS.map(secret=>{
  const known=state.narrative.completed.includes(secret.id);
  return `<div class="secret-entry ${known?'found':''}"><b>${known?escape(secret.title):'??? Descoberta oculta'}</b><span class="small muted"> Região ${secret.region+1} · ${known?'Descoberta':'Não descoberta'}</span>${known?`<p class="small">${escape(secret.description)}</p>`:''}</div>`;
 }).join('');
 return panel('DIÁRIO DE DESCOBERTAS',`<p class="small">Segredos descobertos: <b>${found.length}/${SECRET_EVENTS.length}</b> · Guardiões secretos derrotados: <b>${defeated}/${SECRET_BOSS_REGIONS.length}</b></p><p class="small muted">Explore caminhos desconhecidos ou perigosos. Alguns guardiões surgem apenas em caminhos perigosos de regiões específicas.</p><div class="secret-list">${entries}</div>`)+panel('GUARDIÕES SECRETOS',SECRET_BOSS_REGIONS.map(region=>`<div class="secret-entry"><b>Região ${region+1}</b> · ${state.secrets.guardians.includes(region)?'Derrotado':'Não descoberto'}</div>`).join(''))+(state.secrets.recent.length?panel('ÚLTIMAS DESCOBERTAS',state.secrets.recent.map(line=>`<p class="small">${escape(line)}</p>`).join('')):'');
}

export function worldMap(){
 const current=mapId(rt.area);
 return maps.map((m,i)=>panel(`${i+1}. ${escape(m[0])} ${rt.state.bosses.includes(i)?'✓':''}`,`<p class="small muted">Áreas ${i*10+1} a ${i*10+10} · ${escape(m[1])} · Boss da Fase: ${escape(m[2])}</p><details class="ux7-disclosure ux9-map-region" data-ux9-map="${i}" ${i===current?'open':''}><summary>${i===current?'Selecionar área atual':'Ver áreas desta fase'}</summary><div class="actions">${Array.from({length:10},(_,j)=>{const n=i*10+j+1,locked=!mapUnlocked(rt.state,n),status=challengeProgress(rt.state,n);return `<div class="area-challenge-option">${btn(`${n}${j===9?' BOSS':''}`,`area:${n}`,locked)}<span class="small muted">${status.defeated?'Vencido':locked?'Bloqueado':`Disponível · ${status.current}/15`}</span></div>`;}).join('')}</div></details>`)).join('');
}

export function character(){
 const d=distribution(rt.state),permanent=rt.state.stats,hero=rt.state,current=d.current;
 const currentMilestones=investedMilestones(d.invested),plannedMilestones=investedMilestones(d.plannedInvested);
 const rows=A.map((a,i)=>`<div class="hero-attribute ux6-attribute"><div class="hero-attribute-title"><b>${escape(N[i])}</b><span class="small muted">${a.toUpperCase()} · ${permanent[i]} base</span></div><p class="small muted">${escape(ATTRIBUTE_HELP[i])}</p><div class="hero-attribute-controls"><button type="button" data-action="attrMinus:${i}" aria-label="Retirar um ponto de ${escape(N[i])}" ${d.delta[i]===0?'disabled':''}>−</button><span class="hero-attribute-value">${permanent[i]}${d.delta[i]?` &gt; <strong>${permanent[i]+d.delta[i]}</strong>`:''}${d.current[a]>permanent[i]?`<small class="muted ux6-equip-boost">Equip.: +${d.current[a]-permanent[i]}</small>`:''}</span><button type="button" data-action="attrPlus:${i}" aria-label="Adicionar um ponto em ${escape(N[i])}" ${d.remaining===0?'disabled':''}>+</button></div><div class="milestone-info">${(()=>{const m=currentMilestones[a],next=plannedMilestones[a],promoted=next.count>m.count;return `<div class="milestone-top"><span>Investidos: ${m.points}${next.points!==m.points?' &gt; '+next.points:''}</span><span>Marcos: ${m.count}${promoted?' &gt; '+next.count:''}</span></div><div class="milestone-track" role="progressbar" aria-label="Progresso do marco de ${escape(N[i])}" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${next.progress}"><span style="width:${next.progress*20}%"></span></div><div class="milestone-bottom"><span>${next.progress}/5</span><span>${escape(next.rule.label)}: +${next.total}${next.rule.unit}</span></div><small class="muted ux6-next-milestone">Próximo marco: ${next.next} pontos investidos</small><details class="ux-class-milestones"><summary>Talentos especiais do atributo</summary>${specialMilestones(d.invested)[a].map((milestone,index)=>{const planned=specialMilestones(d.plannedInvested)[a][index],state=milestone.unlocked?'Desbloqueado':planned.unlocked?'Prévia, não confirmado':'Bloqueado';return `<div class="ux-milestone-special"><b>${milestone.points} pontos · ${escape(milestone.name)}</b><span>${state}</span><p class="small muted">${escape(milestone.description)}</p></div>`;}).join('')}</details>${promoted?'<div class="ux6-unlocked">Novo marco na prévia</div>':''}`;})()}</div></div>`).join('');
 const fields=[['HP máximo','maxhp',0],['MP máximo','maxmp',0],['Ataque físico','atk',0],['Ataque mágico','mag',0],['Defesa física','def',0],['Defesa mágica','md',0],['Precisão','hit',1,'%'],['Esquiva','dodge',1,'%'],['Crítico','crit',1,'%'],['Dano crítico','critD',3,'x']];
 const fmt=(v,dec,unit='')=>Number(v).toFixed(dec)+unit;
 const preview=fields.map(([label,key,dec,unit=''])=>{const before=d.current[key],after=d.preview[key],diff=after-before,changed=Math.abs(diff)>1e-8;return `<div class="hero-preview-row"><span>${label}</span><span class="${changed?'hero-preview-changed':'muted'}">${fmt(before,dec,unit)}${changed?` &gt; ${fmt(after,dec,unit)} (${diff>0?'+':''}${fmt(diff,dec,unit)})`:''}</span></div>`;}).join('');
 const rank=escape(equippedTitle(hero)||'Nenhum');
 return panel('MEU HERÓI',`<div class="ux6-hero-heading"><span class="ux-kicker">PERSONAGEM</span><h4>${escape(hero.name)}</h4><p>${escape(classes[hero.cls].name)} · Nível ${hero.lv}</p><p class="small muted">Título equipado: ${rank} · <span class="gold">${hero.gold} ouro</span></p></div><div class="ux6-summary-grid"><div><span>HP</span><strong>${hero.hp}/${current.maxhp}</strong></div><div><span>MP</span><strong>${hero.mp}/${current.maxmp}</strong></div><div><span>ATQ / MAG</span><strong>${current.atk} / ${current.mag}</strong></div><div><span>DEF / RES</span><strong>${current.def} / ${current.md}</strong></div></div><details class="ux6-detail ux6-hero-art" data-ux6-key="hero-art"><summary>Ver aparência e equipamentos do herói</summary><div class="ascii-container ux6-portrait">${renderHeroAvatar(rt.state)}</div><p class="small muted">A aparência ASCII acompanha os equipamentos utilizados.</p></details><div class="ux6-shortcuts">${btn('Ver inventário','nav:inventory')}${btn('Ver habilidades','nav:skills')}</div>`)
 +panel('DISTRIBUIÇÃO DE ATRIBUTOS',`<p class="small muted ux6-intro">Adicione ou retire pontos para visualizar a diferença. Nada será salvo até confirmar.</p><div class="hero-points"><span>Disponíveis: <b>${hero.points}</b></span><span>Em edição: <b>${d.spent}</b></span><span>Restantes: <b>${d.remaining}</b></span></div><div class="hero-attributes">${rows}</div><div class="hero-distribution-actions">${btn('APLICAR PONTOS','attrApply',!pending())}${btn('DESCARTAR ALTERAÇÕES','attrDiscard',!pending())}</div><p class="small muted" role="status" id="hero-feedback">${escape(rt.heroFeedback||'Os pontos só serão salvos ao aplicar.')}</p>`)
 +panel('RESULTADO DOS ATRIBUTOS',`<p class="small muted">Estatísticas calculadas com equipamentos, marcos, passivas, conjuntos e especialização.</p><div class="hero-preview">${preview}</div>`);
}

/** ASCII detalhado somente sob demanda; ícone leve nas listas. */
function objectPreview(id,item=null){
 // Lote 7: a composição HD é criada apenas ao expandir os detalhes.
 const detailed=item?equipmentArtwork(item):objectArtwork(id);
 if(!detailed)return '';
 const icon=objectIcon(id)||(item?.catalogId?objectIcon(item.catalogId):null);
 const key=item?.catalogId||id;
 const payload=item?encodeURIComponent(JSON.stringify({slot:item.slot,kind:item.kind,name:item.name,armor:item.armor,region:item.region,catalogId:item.catalogId,rarity:item.rarity})):'';
 const rarity=Number.isInteger(item?.rarity)?Math.max(0,Math.min(4,item.rarity)):0;
 return `<details class="object-art-detail" data-hd-art-key="${escape(String(key))}" data-hd-item="${payload}"><summary>Ver arte ASCII</summary><div class="object-art-content">${icon?`<pre class="object-art-icon" aria-hidden="true">${escape(icon)}</pre>`:''}<div class="ascii-container object-art-scene hd-object-scene hd-rarity-${rarity}"><pre class="ascii-art" data-ascii="true">${escape(detailed)}</pre></div></div></details>`;
}
function itemPreview(it){return objectPreview(it.catalogId||it.uid,it);}
function smallObjectIcon(id){const art=objectIcon(id);return art?`<pre class="object-art-icon" aria-hidden="true">${escape(art)}</pre>`:'';}
const UX6_FILTERS=Object.freeze([['all','Todos'],['weapon','Armas'],['armor','Armaduras'],['accessory','Acessórios']]);
function equipmentCategory(item){return item.slot==='weapon'?'weapon':['head','body','hands','feet'].includes(item.slot)?'armor':'accessory';}
function equipmentCompareHTML(item){
 const comparison=compareEquipment(rt.state,item);
 if(!comparison)return '<p class="small muted">Comparação indisponível.</p>';
 const rows=comparison.changed.map(row=>`<div class="ux6-compare-row"><span>${escape(row.label)}</span><span class="ux6-compare-values">${formatValue(row.before,row.unit)} &gt; ${formatValue(row.after,row.unit)} <strong class="${row.difference>0?'ux6-gain':'ux6-loss'}">${row.difference>0?'+':''}${formatValue(row.difference,row.unit)}</strong></span></div>`).join('');
 return `<div class="ux6-comparison" aria-label="Comparação estimada de atributos"><div class="ux6-compare-header"><strong>Comparar atributos</strong><span class="small muted">${comparison.currentItem?`Equipado: ${escape(comparison.currentItem.name)}`:'Slot vazio'}</span></div><p class="small muted">Valores da ficha antes e depois de equipar, incluindo conjuntos.</p>${rows||'<p class="small muted">Sem alteração nos atributos da ficha.</p>'}</div>`;
}
function equipmentBagItem(item){
 const equipped=rt.state.equip[item.slot]===item.uid,allowed=validEquip(item),restricted=Boolean(dungeonState(rt.state).attempt);
 const reason=!allowed?(item.lv>rt.state.lv?`Exige nível ${item.lv}`:'Incompatível com a classe'):'Toque para comparar antes de equipar';
 return `<details class="ux6-item-card" data-ux6-key="item-${escape(item.uid)}"><summary class="ux6-item-title"><span class="ux6-rarity-dot ux6-rarity-${item.rarity}" aria-hidden="true"></span><span class="ux6-item-heading"><strong class="${['','green','rare','epic','legend'][item.rarity]}">${escape(item.name)}${item.upgrade?' +'+item.upgrade:''}</strong><small>${escape(EQUIPMENT_SLOTS[item.slot]||item.slot)} · Nv ${item.lv} · ${escape(rarityName(item.rarity))}${equipped?' · EQUIPADO':''}</small></span><span class="ux6-chevron" aria-hidden="true">+</span></summary><div class="ux6-item-details"><p class="small muted">${escape(item.kind||'Equipamento')}${item.armor?' · Armadura '+['','leve','média','pesada'][item.armor]:''} · ${escape(itemBonusesLabel(item)||'Sem bônus adicionais')}</p>${item.setId?`<p class="small muted">Conjunto: ${escape(SETS.find(x=>x.id===item.setId)?.name||'')}</p>`:''}${equipmentCompareHTML(item)}<p class="small muted">${escape(reason)}</p><div class="ux6-item-buttons">${btn(equipped?'Equipado':'Equipar',`equip:${item.uid}`,!allowed||equipped)}${btn('Vender',`sell:${item.uid}`,equipped||restricted)}</div>${itemPreview(item)}</div></details>`;
}
export function inventory(){
 const state=rt.state,tab=['equipped','bag','consumables','materials'].includes(rt.inventoryTab)?rt.inventoryTab:'equipped';
 const entries=Object.entries(state.equip);const wearing=entries.filter(([,uid])=>uid!==null).length;
 const tabs=[['equipped','Equipados'],['bag','Mochila'],['consumables','Consumíveis'],['materials','Materiais']];
 const nav=`<div class="ux6-inventory-tabs" role="group" aria-label="Seções do inventário">${tabs.map(([id,label])=>`<button type="button" data-action="inventoryTab:${id}" class="${tab===id?'is-active':''}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div>`;
 let body='';
 if(tab==='equipped'){
  body=`<p class="small muted">Itens equipados alteram atributos e a aparência do herói. Abra um slot para inspecionar sua arte.</p><details class="ux6-detail ux6-equipped-avatar" data-ux6-key="equipped-avatar"><summary>Ver aparência atual do herói</summary><div class="ascii-container ux6-portrait">${renderHeroAvatar(state)}</div></details><div class="ux6-slots">${entries.map(([slot,uid])=>{const it=state.items.find(x=>x.uid===uid);return `<div class="ux6-slot"><div><small>${escape(EQUIPMENT_SLOTS[slot]||slot)}</small><strong>${it?escape(it.name)+(it.upgrade?' +'+it.upgrade:''):'Slot vazio'}</strong>${it?`<span class="small muted">${escape(rarityName(it.rarity))} · Nível ${it.lv}</span>`:''}</div>${it?btn('Retirar',`unequip:${slot}`):''}${it?`<div class="ux6-slot-art">${itemPreview(it)}</div>`:''}</div>`;}).join('')}</div><div class="ux6-shortcuts">${btn('Escolher equipamentos','inventoryTab:bag')}</div>`;
 }else if(tab==='bag'){
  const filter=UX6_FILTERS.some(([id])=>id===rt.filter)?rt.filter:'all';
  const inventoryItems=state.items.filter(it=>filter==='all'||equipmentCategory(it)===filter);
  body=`<p class="small muted">Abra um item para ver a diferença nos atributos antes de equipá-lo.</p><div class="ux6-bag-filters" role="group" aria-label="Filtrar equipamentos">${UX6_FILTERS.map(([id,label])=>`<button type="button" data-action="filter:${id}" class="${filter===id?'is-active':''}" aria-pressed="${filter===id}">${label}</button>`).join('')}</div><p class="small muted">${inventoryItems.length} item(ns) nesta categoria.</p><div class="ux6-bag">${inventoryItems.map(equipmentBagItem).join('')||'<p class="small muted">Nenhum equipamento nessa categoria.</p>'}</div>`;
 }else if(tab==='consumables'){
  const names={hp:'Poção de HP',mp:'Poção de MP',elixir:'Elixir',antidote:'Antídoto'};
  body=`<p class="small muted">Consumíveis são usados fora do combate aqui. Durante a batalha, utilize o menu de consumíveis da arena.</p><div class="ux6-consumables">${Object.entries(state.consumables).map(([id,count])=>`<div class="ux6-resource-item"><span>${smallObjectIcon(id)}<strong>${escape(names[id]||id)}</strong><small>Quantidade: ${count}</small></span>${btn('Usar',`use:${id}`,!count||id==='antidote'||state.combat!==null)}${objectPreview(id)}</div>`).join('')}</div>`;
 }else{
  const list=Object.entries(state.materials).filter(([,count])=>count>0),restricted=Boolean(dungeonState(state).attempt);
  body=`<p class="small muted">Materiais encontrados na exploração podem ser usados na ferraria ou vendidos.</p><div class="ux6-consumables">${list.map(([id,count])=>`<div class="ux6-resource-item"><span>${smallObjectIcon(id)}<strong>${escape(id)}</strong><small>Quantidade: ${count}</small></span>${btn('Vender',`material:${encodeURIComponent(id)}`,restricted)}${objectPreview(id)}</div>`).join('')||'<p class="small muted">Você ainda não possui materiais.</p>'}</div>`;
 }
 return panel('INVENTÁRIO E EQUIPAMENTOS',`<div class="ux6-inventory-summary"><span><strong>${wearing}/${entries.length}</strong> equipados</span><span><strong>${state.items.length}</strong> equipamentos</span><span><strong>${state.gold}</strong> ouro</span></div>${nav}<section class="ux6-tab-panel" aria-label="${escape(tabs.find(([id])=>id===tab)[1])}">${body}</section>`);
}

export function skills(){
 const variants=active[rt.state.cls].map((base,i)=>{
  const a=effectiveSkill(rt.state,i),unlocked=rt.state.lv>=a.level,info=skillInfo(rt.state.cls,i);
  return `<section class="ux6-skill"><div class="ux6-skill-top"><div><strong>${escape(a.name)}</strong><p class="small muted">${escape(info?.description||'')}</p><p class="small muted">${a.type==='guard'?`${a.guardTurns} turnos de proteção`:`Poder ${a.mult}x`} · ${a.cost} MP · CD ${playerSkillCooldown(rt.state.cls,i)} turno(s)${info?.resourceCost?` · ${info.resourceCost} ${CLASS_RESOURCES[rt.state.cls].name}`:''}</p></div><span class="ux6-skill-state ${unlocked?'unlocked':''}">${unlocked?'Disponível':`Nv ${a.level}`}</span></div>${unlocked?`<fieldset class="ux6-variant-choice"><legend>Variação da habilidade</legend>${Object.entries(SKILL_VARIANTS).map(([id,variant])=>`<button type="button" data-action="skillVariant:${i}:${id}" aria-pressed="${a.variant===id}" ${a.variant===id?'disabled':''} title="${escape(variant.description)}">${escape(variant.name)}</button>`).join('')}</fieldset><p class="small muted ux6-skill-hint">${escape(SKILL_VARIANTS[a.variant].description)}</p>`:`<p class="small muted ux6-skill-hint">Desbloqueia no nível ${a.level}.</p>`}</section>`;
 }).join('');
 const passiveList=passives(),activePassives=passiveList.filter(p=>rt.state.lv>=p.lv).length;
 return panel('HABILIDADES',`<p class="small muted ux6-intro">Configure suas habilidades antes de entrar em combate. As mudanças não alteram a recarga dos turnos.</p><div class="ux6-skill-list">${variants}</div><details class="ux6-detail" data-ux6-key="passives"><summary>Habilidades passivas (${activePassives}/${passiveList.length})</summary><div class="ux6-passives">${passiveList.map(p=>`<div><strong>${escape(p.name)}</strong><span class="small muted">Nv ${p.lv} · ${rt.state.lv>=p.lv?'Ativa':'Bloqueada'}</span><p class="small muted">${escape(p.desc)}</p></div>`).join('')}</div></details><div class="ux6-shortcuts">${btn('Ver especialização','nav:specializations')}${btn('Voltar ao herói','nav:character')}</div>`)+specializationSummary();
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

export function city(){
 const region=mapId(rt.area),m=maps[region],rep=reputation(rt.state,region),discount=reputationDiscount(rt.state,region);
 const market=rt.citySection==='market',health=stats(),missingHp=Math.max(0,health.maxhp-rt.state.hp),missingMp=Math.max(0,health.maxmp-rt.state.mp);
 const routes=[
  ['Mercado e lojas','Armas, armaduras, acessórios e suprimentos','citySection:market'],
  ['Taverna e moradores','Conversas, rumores, encontros e contratos','nav:tavern'],
  ['Missões da cidade','Ver objetivos, progresso e recompensas','nav:quests'],
  ['Ferraria','Fabricar, aprimorar e evoluir equipamentos','nav:forge'],
  ['Masmorras','Desafios especiais e chefes exclusivos','nav:dungeons']
 ];
 const services=`<div class="ux7-service-list">${routes.map(([name,description,action])=>`<button type="button" class="ux7-service" data-action="${action}"><span><strong>${name}</strong><small>${description}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div><div class="ux7-rest"><span><strong>Estalagem</strong><small>Recupere a vida e a mana. Custo: 20 ouro.</small><small>HP faltante: ${missingHp} · MP faltante: ${missingMp}</small></span>${btn('Descansar (20 ouro)','rest',rt.state.gold<20||(!missingHp&&!missingMp))}</div>`;
 const stores=[['weapon','Armas'],['armor','Armaduras'],['accessory','Acessórios'],['potion','Poções'],['materials','Materiais']];
 const storeTabs=`<div class="ux7-store-tabs" role="group" aria-label="Categorias do comércio">${stores.map(([id,label])=>`<button type="button" class="${rt.shop===id?'is-active':''}" aria-pressed="${rt.shop===id}" data-action="shop:${id}">${label}</button>`).join('')}</div>`;
 const artDetails=`<details class="ux7-disclosure ux7-city-art" data-ux7-key="city-art"><summary>Ver cenário ASCII da cidade</summary><div class="ascii-container city-scene hd-world-scene"><pre class="ascii-art" data-ascii="true">${escape(highDensityCityArtwork(m[1])||densityCityArtwork(m[1])||detailedCities[m[1]]||cityArtworks[m[1]])}</pre></div></details>`;
 const marketContent=`<p class="small muted ux7-market-help">O saldo e os descontos são aplicados pelas lojas originais. Selecione uma categoria para consultar preços e itens.</p>${storeTabs}${store()}`;
 return panel(`CIDADE · ${escape(m[1])}`,`<div class="ux7-city-summary"><p class="small muted">${escape(m[0])} · Área ${rt.area}</p><div class="ux7-city-metrics"><span>OURO <b>${rt.state.gold}</b></span><span>REPUTAÇÃO <b>${rep}</b></span><span>DESCONTO <b>${discount}%</b></span></div><p class="small muted ux7-city-standing">REPUTAÇÃO: ${reputationLabel(rep)} nesta cidade.</p>${climateSummary()}</div>${challengeProgress(rt.state,region).current>0&&!challengeProgress(rt.state,region).defeated?`<div class="mini-boss-city-warning" role="status">Atenção: usar serviços da cidade reiniciará sua sequência de ${challengeProgress(rt.state,region).current}/15 explorações.</div>`:''}${rt.cityResetNotice?`<p class="mini-boss-reset" role="status">${escape(rt.cityResetNotice)}</p>`:''}${rt.cityFeedback?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:''}<div class="ux7-city-switch" role="group" aria-label="Áreas da cidade"><button type="button" data-action="citySection:services" class="${!market?'is-active':''}" aria-pressed="${!market}">Serviços</button><button type="button" data-action="citySection:market" class="${market?'is-active':''}" aria-pressed="${market}">Mercado</button></div>${!market?services+artDetails:''}`)
 +`<section class="ux7-city-shop"><details class="ux7-disclosure ux7-market-disclosure" data-ux7-key="city-market" ${market?'open':''}><summary>Comércio da cidade · ${escape(stores.find(([id])=>id===rt.shop)?.[1]||'Armas')}</summary><div class="ux7-market-content">${marketContent}</div></details></section>`+(market?artDetails:'');
}

function eventScene(id){const artwork=highDensityEventArtwork(id)||densityEventArtwork(id);return artwork?`<div class="ascii-container density-event-scene hd-event-scene" role="img" aria-label="Ilustração ASCII do acontecimento"><pre class="ascii-art density-event-art ${eventMotionClass(id)}" data-ascii="true">${escape(artwork)}</pre></div>`:'';}
function interiorScene(region,type){const art=highDensityInteriorArtwork(region,type)||densityInteriorArtwork(region,type);return art?`<div class="ascii-container settlement-scene hd-interior-scene"><pre class="ascii-art" data-ascii="true">${escape(art)}</pre></div>`:'';}
function npcPortrait(id){const art=densityNpcArtwork(id);return art?`<details class="npc-art-detail" data-hd-npc-id="${escape(id)}"><summary>Ver retrato ASCII</summary><div class="ascii-container npc-portrait hd-npc-portrait"><pre class="ascii-art" data-ascii="true">${escape(art)}</pre></div></details>`:'';}

export function tavernUI(){
 const region=mapId(rt.area),m=maps[region],rep=reputation(rt.state,region),npcList=cityNpcs(rt.state,region);
 const npcHtml=npcList.map(npc=>`<article class="city-npc ux7-npc"><div class="ux7-npc-title"><b>${escape(npc.name)}</b><span class="small muted">${escape(npc.role)} · ${escape(npc.trait)}</span></div><p class="small muted">Conversas: ${rt.state.cityLife.npcs[npc.id]?.talks||0}</p><details class="ux7-npc-dialogue" data-ux7-key="npc-dialog-${escape(npc.id)}"><summary>Conhecer diálogo</summary><p>${escape(npcDialogue(rt.state,npc,region))}</p>${npcPortrait(npc.id)}</details>${btn('Conversar',`tavernTalk:${npc.id}`)}</article>`).join('');
 const story=pendingTavernEvent(rt.state,region),visits=rt.state.cityLife.tavern.visits[region]||0;
 const personalAdventure=adventureEntry(rt.state,region);
 const guests=guestForRegion(region,rt.state).map(guest=>{
  const response=personalAdventure?.story.sourceGuest===guest.id&&personalAdventure?.entry?.phase==='done'
   ?`<p class="small">${escape(personalAdventure.story.endings[rt.state.adventure.decisions[personalAdventure.story.id]]||'Sua decisão foi lembrada.')}</p>`:'';
  return `<article class="city-npc ux7-npc"><div class="ux7-npc-title"><b>${escape(guest.name)}</b><span class="small muted">${escape(guest.role)}</span></div><details class="ux7-npc-dialogue" data-ux7-key="npc-dialog-${escape(guest.id)}"><summary>Conhecer diálogo</summary><p>${escape(guestDialogue(rt.state,guest))}</p>${response}${npcPortrait(guest.id)}</details>${btn('Conversar',`tavernGuest:${guest.id}`)}</article>`;
 }).join('');
 const storyCard=story?`<div class="tavern-story" role="group" aria-label="Encontro na taverna"><b>${escape(story.title)}</b><p>${escape(story.description)}</p><details class="ux7-disclosure" data-ux7-key="tavern-event-art"><summary>Ver acontecimento em ASCII</summary>${eventScene(story.id)}</details><div class="tavern-story-choices">${story.choices.map(c=>btn(escape(c.label)+(c.id==='help'?' (5 ouro)':''),`tavernStory:${story.id}:${c.id}`,c.id==='help'&&rt.state.gold<5)).join('')}</div></div>`:'<p class="small muted">Nem toda visita revela um acontecimento. Continue sua jornada para descobrir novas histórias.</p>';
 const offers=QUESTS.filter(q=>q.region===region&&questStatus(q,rt.state)==='Disponível').slice(0,2);
 const dynamicOffers=DYNAMIC_QUESTS.filter(q=>q.region===region&&dynamicStatus(rt.state,q)==='Disponível');
 const adventure=personalAdventure,adventureCard=adventure?.entry?(adventure.entry.phase==='delivery'?`<div class="city-contract"><b>${escape(adventure.story.title)}</b><p class="small">Você reuniu os documentos. Entregue-os ao contato local.</p>${btn('Entregar correspondência',`adventureDeliver:${adventure.story.id}`)}</div>`:adventure.entry.phase==='available'?`<div class="city-contract"><b>${escape(adventure.story.title)}</b><p class="small muted">Uma história foi descoberta por suas decisões. Você pode iniciar esta investigação.</p>${btn('Iniciar aventura',`adventureAccept:${adventure.story.id}`)}</div>`:`<p class="small muted">${escape(adventure.story.title)}: consulte o progresso em Diário > Missões.</p>`):'<p class="small muted">Converse com os visitantes ou explore a região para descobrir uma aventura pessoal.</p>';
 const section=(key,title,content,defaultOpen=false)=>`<details class="ux7-disclosure ux7-tavern-section" data-ux7-key="tavern-${key}" ${defaultOpen?'open':''}><summary>${title}</summary><div class="ux7-disclosure-body">${content}</div></details>`;
 return panel(`TAVERNA · ${escape(TAVERNS[region])}`,`<p class="small muted">${escape(m[1])} · Visitas: ${visits} · Conversas, rumores e contratos.</p><div class="ux7-tavern-meta"><span>Reputação: <strong>${rep} · ${reputationLabel(rep)}</strong></span><span>Ouro: <strong>${rt.state.gold}</strong></span></div>${rt.cityFeedback?`<p class="city-feedback" role="status">${escape(rt.cityFeedback)}</p>`:''}<div class="ux7-tavern-shortcuts">${btn('Ouvir um rumor','tavernRumor')}${btn('Consultar diário','nav:quests')}</div>${section('people',`Moradores e visitantes (${npcList.length+guestForRegion(region,rt.state).length})`,`<div class="city-npcs">${npcHtml}${guests}</div>`,true)}${section('stories','Acontecimentos na taverna',storyCard)}${section('adventure','AVENTURAS PESSOAIS',adventureCard)}${section('contracts',`Contratos da cidade (${offers.length+dynamicOffers.length})`,`<h4>MISSÕES DESCOBERTAS</h4>${dynamicOffers.length?dynamicOffers.map(q=>`<div class="city-contract"><b>${escape(q.title)}</b><p class="small muted">${escape(q.description)}</p>${btn('Aceitar missão',`dynamicAccept:${q.id}`)}</div>`).join(''):'<p class="small muted">Converse com os visitantes para descobrir missões especiais.</p>'}<h4>CONTRATOS DA CIDADE</h4>${offers.length?offers.map(q=>`<div class="city-contract"><b>${escape(q.title)}</b><p class="small muted">${escape(q.description)}</p>${btn('Aceitar contrato',`tavernContract:${q.id}`)}</div>`).join(''):'<p class="small muted">Nenhum novo contrato disponível. Consulte as missões em andamento no Diário.</p>'}`)}${section('quiz','Desafio da taverna',canAnswerQuiz(rt.state,region)?`<p class="small">Qual destas criaturas vive em ${escape(m[0])}? Uma tentativa por cidade.</p><div class="city-quiz">${cityQuizOptions(region).map((name,i)=>btn(escape(name),`tavernQuiz:${i}`)).join('')}</div><p class="small muted">Acerto: 12 ouro e 3 pontos de reputação.</p>`:'<p class="small muted">Desafio concluído nesta cidade.</p>')}${section('interior','Ver interior da taverna em ASCII',interiorScene(region,'tavern'))}`);
}


export function store(){
 if(rt.shop==='merchant')return panel('MERCANTE VIAJANTE',`${interiorScene(mapId(rt.area),'materials')}${[['hp','Poção de Vida'],['mp','Poção de Mana']].map(([type,name])=>{const price=potionPrice(type),insufficient=rt.state.gold<price;return `<div class="item merchant-item"><div>${smallObjectIcon(type)}<b>${name}</b>${objectPreview(type)}<div class="small muted">Preço: <span class="gold">${price} Ouro</span></div>${insufficient?'<div class="small red">Ouro insuficiente</div>':''}</div>${btn('Comprar',`buyPotion:${type}`,insufficient)}</div>`;}).join('')}${btn('Voltar',activeJourney(rt.state)?'journeyReturn':'world')}`);
 const region=mapId(rt.area),price=base=>cityPrice(rt.state,region,base);
 const offer=cityOffer(rt.state,region),stock=offer&&!offer.sold?panel('ESTOQUE ESPECIAL',`<div class="item"><b>Lote ${offer.rarity===2?'raro do mercador resgatado':'incomum'} de ${escape(({weapon:'arma',ring:'anel',body:'armadura'})[offer.slot])}</b> · Nível ${offer.lv}<p class="small">${escape(makeItem(offer.lv,offer.slot,rt.state.cls,offer.rarity,region).name)}</p><p class="small muted">${escape(itemBonusesLabel(makeItem(offer.lv,offer.slot,rt.state.cls,offer.rarity,region)))}</p><p class="small muted">Modelo e atributos definidos para este lote. Estoque: 1 unidade. Oferta muda a cada 6 explorações.</p><p class="small">Preço: <b class="gold">${offer.price} Ouro</b>${offer.price!==offer.basePrice?` <span class="muted">(base: ${offer.basePrice})</span>`:''}</p>${btn('Comprar lote especial','cityOffer',rt.state.gold<offer.price)}</div>`):panel('ESTOQUE ESPECIAL','<p class="small muted">Oferta esgotada. Novo lote após a próxima renovação.</p>');
 if(rt.shop==='materials')return panel('MERCADO DE INSUMOS',`${interiorScene(region,'materials')}<p class="small muted">Materiais locais, minérios e catalisadores. A reputação concede descontos. A revenda sempre vale menos que a compra.</p><div class="epic7-cards">${materialMarket(region).map(entry=>{
   const cost=price(entry.price),owned=rt.state.materials[entry.name]||0;
   return `<div class="epic7-card">${smallObjectIcon(entry.name)}<b>${escape(entry.name)}</b>${objectPreview(entry.name)}<div class="small muted">${escape(entry.type)} · ${escape(entry.description)} · Você possui ${owned}</div><div class="epic7-card-footer"><span><b class="gold">${cost} ouro</b> por unidade <span class="small muted">· revenda: ${entry.sell}</span></span>${btn('Comprar',`buyMaterial:${encodeURIComponent(entry.name)}`,rt.state.gold<cost)}</div></div>`;
  }).join('')}</div>`)+stock;
 if(rt.shop==='potion')return panel('LOJA DE POÇÕES',interiorScene(region,'potion')+Object.entries({hp:'Poção de Vida',mp:'Poção de Mana',elixir:'Elixir',antidote:'Antídoto'}).map(([type,name])=>{const base=potionPrice(type),cost=price(base);return `<div class="item">${smallObjectIcon(type)}${name}${objectPreview(type)} · Preço: ${cost} Ouro${cost!==base?` <span class="small muted">(base: ${base})</span>`:''} ${rt.state.gold<cost?'<span class="red small">Ouro insuficiente</span>':''} ${btn('Comprar',`buyPotion:${type}`,rt.state.gold<cost)}</div>`;}).join(''))+stock;
 const category=rt.shop==='weapon'?'weapon':rt.shop==='armor'?'armor':'accessory';
 const models=catalogForShop(region,rt.state.cls,category);
 return panel('CATÁLOGO',`${interiorScene(region,category==='weapon'?'weapon':category==='armor'?'armor':'accessory')}<p class="small muted">${models.length} modelos da região · Armaduras livres para todas as classes. Armas exclusivas por classe.</p><div class="epic6-catalog">${models.map(model=>{
   const item=createCatalogItem(model),cost=price(item.price),insufficient=rt.state.gold<cost,levelBlocked=rt.state.lv<model.level;
   const classLabel=model.category==='armor'?`Armadura ${['','leve','média','pesada'][model.armor]}`:model.category==='weapon'?`Arma: ${classes[model.cls].name}`:'Acessório';
   return `<div class="epic6-shop-item">${smallObjectIcon(model.id)}<b>${escape(item.name)}</b>${objectPreview(model.id)}<div class="small muted">${escape(classLabel)} · Nível ${item.lv} · ${rarityName(item.rarity)}</div><div class="small muted">${escape(itemBonusesLabel(item))}</div><div class="epic6-shop-footer"><span>Preço: <b class="gold">${cost} Ouro</b>${cost!==item.price?` <span class="small muted">(base: ${item.price})</span>`:''}</span>${btn('Comprar',`buyCatalog:${model.id}`,insufficient||levelBlocked)}</div>${insufficient?'<div class="small red">Ouro insuficiente</div>':levelBlocked?'<div class="small muted">Nível insuficiente</div>':''}</div>`;
 }).join('')}</div>`)+stock;
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
   const skill=effectiveSkill(rt.state,i),belowLevel=rt.state.lv<skill.level,lowMp=rt.state.mp<skill.cost,lowResource=!canPaySkillResource(rt.state.combat,rt.state.cls,i),remaining=turnsRemaining(rt.state.combat,playerCooldownDetails(rt.state,i).id);
   return actionButton(skill.name,`skill:${i}`,belowLevel||lowMp||lowResource||remaining>0,remaining?`RECARGA: ${remaining} ${remaining===1?'TURNO':'TURNOS'}`:belowLevel?`Nível ${skill.level} · Bloqueada`:`${skill.cost} MP${skill.variant==='standard'?'':skill.variant==='power'?' · Potência':' · Economia'}`,'combat-skill');
  }).join('');
  const exclusive=specSkills(rt.state).map((a,i)=>{const remaining=turnsRemaining(rt.state.combat,specCooldownDetails(rt.state,i).id);return actionButton(a.name,`spec:${i}`,rt.state.mp<a.cost||remaining>0,remaining?`RECARGA: ${remaining} ${remaining===1?'TURNO':'TURNOS'}`:`${a.cost} MP`,'combat-specialization');}).join('');
  return `<div class="combat-attacks"><div class="combat-attack-basic-row">${basic}</div><div class="combat-skills-grid">${skills}</div>${exclusive?`<div class="combat-extra-skills"><div class="combat-extra-title">Especialização</div><div class="combat-extra-grid">${exclusive}</div></div>`:''}<div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div></div>`;
 }
 const potions=Object.entries(rt.state.consumables).map(([k,v])=>actionButton(`${k} (${v})`,`potion:${k}`,!v)).join('');
 return `<div class="combat-menu-grid">${potions}</div><div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div>`;
}

/** Etapa 5: ações primárias sem navegação entre submenus; não altera regras do turno. */
export function combatQuickControls(){
 const c=rt.state.combat,locked=rt.busy;
 const button=(name,action,unavailable=false,meta='',extraClass='')=>
  `<button type="button" class="combat-action ${extraClass}" data-action="${action}" ${locked||unavailable?'disabled':''} aria-label="${escape(name+(meta?' · '+meta:''))}"><span class="combat-action-name">${escape(name)}</span>${meta?`<span class="combat-action-meta">${escape(meta)}</span>`:''}</button>`;
 const skills=active[rt.state.cls].map((_,i)=>{
  const skill=effectiveSkill(rt.state,i),below=rt.state.lv<skill.level,lowMp=rt.state.mp<skill.cost,lowResource=!canPaySkillResource(c,rt.state.cls,i),remaining=turnsRemaining(c,playerCooldownDetails(rt.state,i).id);
  const meta=remaining?`Recarga: ${remaining} ${remaining===1?'turno':'turnos'}`:below?`Disponível no nível ${skill.level}`:lowMp?`Mana insuficiente · ${skill.cost} MP`:lowResource?`Requer ${skillInfo(rt.state.cls,i)?.resourceCost} ${CLASS_RESOURCES[rt.state.cls]?.name}`:`${skill.cost} MP${skill.variant==='power'?' · Potência':skill.variant==='economy'?' · Economia':''}`;
  return button(skill.name,`skill:${i}`,below||lowMp||lowResource||remaining>0,meta,'ux-combat-skill');
 }).join('');
 const specials=specSkills(rt.state).map((a,i)=>{
  const remaining=turnsRemaining(c,specCooldownDetails(rt.state,i).id);
  return button(a.name,`spec:${i}`,rt.state.mp<a.cost||remaining>0,remaining?`Recarga: ${remaining} ${remaining===1?'turno':'turnos'}`:rt.state.mp<a.cost?`Mana insuficiente · ${a.cost} MP`:`${a.cost} MP`,'ux-combat-special');
 }).join('');
 const potions=Object.entries(rt.state.consumables).map(([kind,count])=>{
  const names={hp:'Poção de vida',mp:'Poção de mana',elixir:'Elixir',antidote:'Antídoto'};
  return button(names[kind]||kind,`potion:${kind}`,!count,`${count} ${count===1?'disponível':'disponíveis'}`,'ux-combat-consumable');
 }).join('');
 const cannotFlee=Boolean(c.enemy.boss||c.dungeonRoom);
 return `<div class="ux-combat-attacks"><div class="ux-combat-primary">${button('ATAQUE COMUM','attack',false,'Sem custo de MP','ux-combat-basic')}</div><div class="ux-combat-skills-title">HABILIDADES <span>4 opções</span></div><div class="ux-combat-skills">${skills}</div>${specials?`<details class="ux-combat-details" data-panel="specials"><summary>Habilidades da especialização</summary><div class="ux-combat-detail-buttons">${specials}</div></details>`:''}<div class="ux-combat-secondary"><details class="ux-combat-details ux-combat-items" data-panel="items"><summary>Consumíveis</summary><div class="ux-combat-detail-buttons">${potions}</div></details>${button('Fugir','flee',cannotFlee,cannotFlee?'Indisponível nesta batalha':'Tentar escapar','ux-combat-flee')}</div></div>`;
}

function resourceMeter(label,current,max,kind){
 const safeMax=Math.max(1,Number(max)||1),value=Math.max(0,Math.min(safeMax,Number(current)||0));
 const percent=Math.max(0,Math.min(100,100*value/safeMax));
 const tone=kind==='mp'?'mp':percent<=30?'low':percent<=65?'mid':'high';
 return `<div class="resource-meter ${kind}" role="group" aria-label="${label} ${value} de ${max}"><span class="resource-label">${label}</span><div class="resource-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><div class="resource-fill ${tone}" style="width:${percent}%"></div></div><span class="resource-value">${value}/${max}</span></div>`;
}
export function combatUI(){
 const c=rt.state.combat,e=c.enemy,s=stats(),artwork=(e.miniBoss?miniBossArtworkForArea(e.miniBossArea):null)||densityCreatureArtwork(e.baseName,true,e.boss?e.bossPhase||1:1)||detailedArtworks[e.baseName]||EXTENDED_ARTWORKS[e.baseName]||dungeonBossArt[e.baseName]||DUNGEON_BOSS_ART[e.baseName]||artworks[e.baseName]||art[e.baseName]||art.boss;
 const controls=combatQuickControls();
 const resource=CLASS_RESOURCES[rt.state.cls],resourceText=resource?`${resource.name}: ${resourceValue(c)}/${resource.max}`:'';
 const lastEntry=rt.log[0];
 const lastText=typeof lastEntry==='string'?lastEntry:lastEntry?.text||'O confronto começou.';
 const status=rt.phase==='enemy-preparing'?`${e.name} prepara seu ataque...`:rt.phase==='player-action'?'Executando sua ação...':rt.phase==='enemy-hit'?'O inimigo recebeu o impacto!':rt.phase==='player-hit'?'Você recebeu o impacto!':'Escolha sua ação';
 const floating=rt.float?.amount>0?`<div class="floating-damage ${rt.float.side} ${rt.float.critical?'critical':''} ${rt.float.heal?'heal':''}" role="status">${rt.float.heal?'+':'-'}${rt.float.amount}</div>`:'';
 const bossInfo=e.boss?`<div class="boss-phase">* FASE ${e.bossPhase||1}/3 · ${escape(BOSS_PHASES[e.baseName]?.phases[(e.bossPhase||1)-1]||'')} ${e.telegraph?`<div class="boss-warning">! ATAQUE IMINENTE! ${escape(e.telegraph.message)}<div>Prepare sua defesa neste turno.</div></div>`:''}</div>`:['monster','mini'].includes(e.telegraph?.kind)?`<div class="combat-warning" role="status">! ATAQUE ANUNCIADO! ${escape(e.telegraph.message)}</div>`:'';
 const enemyName=`${e.miniBoss?'MINI BOSS · ':e.boss||e.dungeonBoss?'CHEFE · ':''}${escape(e.name)}${e.boss?'':` <span class="monster-rarity rarity-${monsterRarity(e.rarityId).id}">[${monsterRarity(e.rarityId).label}]</span>`}`;
 return `<section class="combat-stage"><section class="combat-arena" aria-label="Arena de combate compartilhada">`
 +`<div class="combat-enemy-status combat-arena-status"><h3>${enemyName}</h3><p class="combat-arena-level">Nível ${e.lv}</p>${resourceMeter('HP',e.hp,e.maxhp,'hp')}${bossInfo}</div>`
 +`<div class="combat-enemy enemy-visual ${rt.phase==='enemy-hit'?'impact':''} ${rt.float?.critical?'critical':''} ${rt.float?.element||''}"><div class="ascii-container"><pre class="ascii-art ${combatAnimationClass(rt.phase)}" data-creature-id="${escape(e.baseName)}" data-ascii="true">${escape(artwork)}</pre></div>${rt.float?.side==='enemy'?floating:''}</div>`
 +`<div class="combat-player hero-visual ${rt.phase==='player-hit'?'impact':''} ${rt.float?.heal?'healing':''}"><div class="ascii-container">${renderHeroAvatar(rt.state,'compact-density')}</div>${rt.float?.side==='player'?floating:''}</div>`
 +`<div class="combat-player-status combat-arena-status"><h3>${escape(rt.state.name)}</h3><p class="combat-arena-level">${escape(classes[rt.state.cls]?.name||rt.state.cls)} · Nível ${rt.state.lv}</p>${resourceMeter('HP',rt.state.hp,s.maxhp,'hp')}${resourceMeter('MP',rt.state.mp,s.maxmp,'mp')}</div>`
 +`<div class="combat-effects combat-fx-layer" aria-hidden="true"></div></section>`
 +panel('AÇÕES',`<p class="turn-status" role="status">${escape(status)}</p><p class="class-resource" role="status">${escape(resourceText)}</p>${e.telegraph?`<div class="ux-combat-telegraph" role="alert"><strong>ATAQUE ANUNCIADO</strong><span>${escape(e.telegraph.message)}</span></div>`:''}<div class="ux-combat-latest" role="status" aria-live="polite"><span>ÚLTIMO ACONTECIMENTO</span><p>${escape(lastText)}</p></div>${rt.state.combat.effects?.length?`<p class="epic8-effects small" role="status">EFEITOS: ${rt.state.combat.effects.map(ef=>escape(ef.name==='stun'?'Atordoamento':ef.type==='defdown'?'Defesa reduzida':ef.name||ef.type)).join(' · ')}</p>`:''}<div class="combat-controls ${rt.busy?'locked':''}">${controls}</div><div class="combat-speed-options" role="group" aria-label="Velocidade do combate">${Object.entries(COMBAT_SPEEDS).map(([value,option])=>`<button type="button" class="combat-speed-option ${getCombatSpeed()===value?'selected':''}" data-action="combatSpeed:${value}" aria-pressed="${getCombatSpeed()===value}" ${rt.busy?'disabled':''}>${option.label}</button>`).join('')}</div>`)
 +`<details class="ux-combat-details ux-combat-history" data-panel="history"><summary>HISTÓRICO DE COMBATE <span>(${rt.log.length} registros)</span></summary><div class="ux-combat-history-body">${displayLog()}</div></details></section>`;
}
export function forgeUI(){
 const region=mapId(rt.area),r=recipes(region,rt.state.cls),items=rt.state.items;
 const materials=Object.entries(rt.state.materials).filter(([,n])=>n>0).map(([name,n])=>`<div class="epic7-material">${smallObjectIcon(name)}<span>${escape(name)}</span><b>×${n}</b></div>`).join('')||'<p class="muted">Nenhum material.</p>';
 const craftCard=x=>{
  const owned=Object.entries(x.materials).map(([name,required])=>({name,required,have:rt.state.materials[name]||0}));
  const canCraft=rt.state.lv>=x.level&&rt.state.gold>=x.gold&&owned.every(x=>x.have>=x.required);
  const model=x.modelId?CATALOG_BY_ID.get(x.modelId):null;
  const preview=model?createCatalogItem(model,x.rarity,x.level):null;
  return `<div class="epic7-card">${model?smallObjectIcon(model.id):smallObjectIcon('chest')}<div class="epic7-card-heading"><b>${escape(x.name)}</b>${x.modelId?`<span class="epic7-label">${rarityName(x.rarity)}</span>`:''}</div>${model?objectPreview(model.id):objectPreview('chest')}<p class="small muted">Nível ${x.level}${x.setId?' · Conjunto':''}${preview?` · ${escape(itemBonusesLabel(preview))}`:''}</p><div class="epic7-requirements">${owned.map(x=>`<span class="${x.have<x.required?'epic7-missing':'epic7-owned'}">${escape(x.name)} ${x.have}/${x.required}</span>`).join('')}</div><div class="epic7-card-footer"><span class="gold">${x.gold} ouro</span>${btn('Fabricar',`craft:${x.id}`,!canCraft)}</div></div>`;
 };
 const normal=r.filter(x=>!x.id.startsWith('ep7-'));
 const expanded=r.filter(x=>x.id.startsWith('ep7-'));
 const refine=refiningCost(region),refineReady=refine&&rt.state.gold>=refine.gold&&Object.entries(refine.materials).every(([name,n])=>(rt.state.materials[name]||0)>=n);
 const upgradeRows=items.map(it=>{const cost=upgradeCost(it);return `<div class="item">${escape(it.name)} +${it.upgrade||0}${cost?` · ${cost.gold} ouro · ${Math.round(cost.chance*100)}% · bônus +${Math.round(cost.bonus*100)}%<div class="small muted">${Object.entries(cost.materials).map(([k,v])=>`${escape(k)} ×${v}`).join('')}</div>${btn('Aprimorar',`enhance:${it.uid}`,rt.state.gold<cost.gold||Object.entries(cost.materials).some(([k,v])=>(rt.state.materials[k]||0)<v))}`:' · Nível máximo +10'}</div>`;}).join('');
 const equipped=Object.values(rt.state.equip).map(uid=>items.find(x=>x.uid===uid)).filter(Boolean),sets=setBonuses(equipped);
 const order=forgeOrder(rt.state,region),commission=order&&!order.completed?`<div class="item"><b>Encomenda especial</b> · ${order.slot==='weapon'?'Arma':'Amuleto'} incomum, nível ${order.level}<p class="small muted">Exige ${order.required} × ${escape(order.material)}. Atributos definidos na fabricação, como nos demais equipamentos.</p><p>Preço: ${order.gold} ouro</p>${!order.unlocked?'<p class="small muted">Requer uma missão concluída nesta região.</p>':''}${btn('Encomendar equipamento','forgeOrder',!canForgeOrder(rt.state,region))}</div>`:'<p class="small muted">Encomenda regional já concluída.</p>';
 return (rt.cityFeedback?panel('FERRARIA · MENSAGEM',escape(rt.cityFeedback)):'')+panel('INTERIOR DA FERRARIA',`<details class="ux7-disclosure ux9-optional-art"><summary>Ver interior em arte ASCII</summary><div class="ux7-disclosure-body">${interiorScene(region,'forge')}</div></details>`)
  +panel('ENCOMENDA REGIONAL',commission)
  +panel('MOCHILA DE MATERIAIS',`<div class="epic7-material-grid">${materials}</div>`)
  +panel('REFINO DE CATALISADORES',`<p class="small muted">Transforme recursos locais em ${escape(refine.result)}. Também pode ser encontrado nos inimigos ou comprado na cidade.</p><div class="epic7-card"><div class="epic7-requirements">${Object.entries(refine.materials).map(([name,n])=>`<span class="${(rt.state.materials[name]||0)<n?'epic7-missing':'epic7-owned'}">${escape(name)} ${(rt.state.materials[name]||0)}/${n}</span>`).join('')}</div><div class="epic7-card-footer"><span class="gold">${refine.gold} ouro</span>${btn('Refinar ×1','refine',!refineReady)}</div></div>`)
  +panel('FABRICAÇÃO ARTESANAL · 9 RECEITAS',`<p class="small muted">Equipamentos com modelo fixo e raridade aprimorada. Cada receita exige o nível indicado. Armas seguem as restrições da sua classe.</p><div class="epic7-cards">${expanded.map(craftCard).join('')}</div>`)
  +panel('RECEITAS CLÁSSICAS · 9 RECEITAS',`<div class="epic7-cards">${normal.map(craftCard).join('')}</div>`)
  +panel('APRIMORAMENTO',upgradeRows||'<p class="muted">Nenhum equipamento.</p>')
  +panel('CONJUNTOS',SETS.map(set=>{const active=sets.active.find(x=>x.set.id===set.id),n=active?.n||equipped.filter(it=>it.setId===set.id).length;return `<div class="item">${escape(set.name)} · ${n}/5 peças <span class="small muted">2 peças: bônus principal · 3: VIT · 4: bônus adicional · 5: regeneração</span></div>`;}).join(''))
  +evolutionUI();
}

export function specializationSummary(){const s=selectedSpec(rt.state);return panel('ESPECIALIZAÇÃO',s?`<p><b>${escape(s.name)}</b> · ${escape(s.passive)}</p><p>60: ${escape(s.skill)} · 75: ${escape(s.improved)} · 90: ${escape(s.ultimate)}</p>`:'<p class="muted">Escolha uma especialização a partir do nível 50.</p>');}
export function specializationUI(){const s=selectedSpec(rt.state);if(s)return specializationSummary()+panel('HABILIDADES EXCLUSIVAS',specSkills(rt.state).map(a=>`<div class="item">${escape(a.name)} · ${a.cost} MP · ${a.mult}x · ${a.element}</div>`).join('')||'Novas habilidades nos níveis 60 e 90.');return panel('ESCOLHA SUA ESPECIALIZAÇÃO',specOptions(rt.state.cls).map(x=>`<div class="item"><b>${escape(x.name)}</b><p>${escape(x.passive)} · ${escape(x.improved)}</p><p>Ativa 60: ${escape(x.skill)} · Final 90: ${escape(x.ultimate)}</p>${btn('Escolher '+x.name,`chooseSpec:${x.id}`,rt.state.lv<50)}</div>`).join(''));}
export function dungeonUI(){
 const ds=dungeonState(rt.state),attempt=ds.attempt;
 const artDetail=d=>`<details class="ux7-disclosure ux9-optional-art"><summary>Visualizar arte ASCII da masmorra</summary><div class="ux7-disclosure-body"><div class="ascii-container city-scene hd-world-scene"><pre class="ascii-art" data-ascii="true">${escape(highDensityDungeonArtwork(d.name)||densityDungeonArtwork(d.name)||dungeonScenes[d.name]||d.art)}</pre></div></div></details>`;
 if(attempt){
  const dungeon=DUNGEONS.find(d=>d.id===attempt.id);
  if(!dungeon)return panel('MASMORRA',`<p class="small muted">Tentativa inconsistente. Retorne à cidade ou reinicie o jogo para recuperar o salvamento.</p>${btn('Abandonar tentativa inválida','dungeonAbandon')}`);
  return panel(dungeon.name,`<p><b>Sala ${attempt.room}/5</b> · ${['Combate','Combate ou armadilha','Recuperação','Elite','Chefe exclusivo'][attempt.room-1]}</p><p>HP e MP são mantidos entre salas.</p><div class="actions">${attempt.roomResolved?(attempt.room<5?btn('Próxima sala','dungeonAdvance'):''):btn('Entrar na sala','dungeonAction')}${btn('Abandonar tentativa','dungeonAbandon')}</div>${artDetail(dungeon)}`);
 }
 return DUNGEONS.map(d=>panel(d.name,`<p>${escape(d.description)} · Nível recomendado ${d.level} · Chefe: ${escape(d.boss)}</p><p>Melhor sala: ${ds.best[d.id]||0}/5 · ${ds.completed.includes(d.id)?'Concluída':'Não concluída'}</p>${btn('Entrar',`dungeonEnter:${d.region}`,!dungeonAvailable(rt.state,d))}${artDetail(d)}`)).join('');
}

let lastRenderedScreen=null;
export function render(){rememberSectionScreen(rt.screen);const preserve=shouldPreserveViewport(lastRenderedScreen,rt.screen)&&rt.pendingNavScroll==null;const viewport=preserve?captureViewport(rt.app):null;const oldBars=[...rt.app.querySelectorAll('.bar>div')].map(x=>x.style.width);const openedCombatDetails=rt.screen==='combat'?[...rt.app.querySelectorAll('.ux-combat-details[open]')].map(el=>el.dataset.panel):[];const openedHeroDetails=['character','inventory','skills'].includes(rt.screen)&&lastRenderedScreen===rt.screen?[...rt.app.querySelectorAll('details.ux6-detail[open],details.ux6-item-card[open]')].map(el=>el.getAttribute('data-ux6-key')).filter(Boolean):[];const oldTownDetails=['city','tavern','quests'].includes(rt.screen)&&lastRenderedScreen===rt.screen?[...rt.app.querySelectorAll('details[data-ux7-key]')].map(el=>({key:el.getAttribute('data-ux7-key'),open:el.open})):null;const bottomNavigation=sectionNavigation(rt.screen,rt.state);rt.app.innerHTML=`<header class="head">${header()}</header><div class="content ${rt.state?.combat&&rt.screen==='combat'?'combat-content':''}${bottomNavigation?' has-bottom-nav':''}" id="game-content" aria-label="Conteúdo: ${escape(screenHeadingLabel(rt.screen))}"><h2 class="ux8-screen-heading">${escape(screenHeadingLabel(rt.screen))}</h2>${rt.cityResetNotice&&['tavern','forge','merchant'].includes(rt.screen)?`<p class="mini-boss-reset" role="status">${escape(rt.cityResetNotice)}</p>`:''}${rt.screen==='world'?'':guideForScreen(rt.screen)}${rt.state&&!['world','home','combat','result','journey'].includes(rt.screen)?'<div class="menu-back-container"><button type="button" class="menu-back-button" data-action="menuBack">&lt; VOLTAR</button></div>':''}${!rt.state?(rt.screen==='create'?create():home()):({home:home,world,diary:diaryHub,atlas:atlasHub,paths:pathSelection,journey:pathJourney,camp:campUI,player:playerMenu,character,inventory,skills,achievements:achievementsUI,secrets:secretsUI,quests:questUI,bestiary:bestiaryUI,statistics:statisticsUI,tavern:tavernUI,forge:forgeUI,dungeons:dungeonUI,dungeon:dungeonUI,specializations:specializationUI,maps:worldMap,city,miniBoss:miniBossIntro,combat:combatUI,merchant:store,result:()=>panel('RESULTADO',`${displayLog()}${btn('Continuar',dungeonState(rt.state).attempt?'nav:dungeon':'world')}`)}[rt.screen]||world)()}${rt.screen==='world'?guideForScreen(rt.screen):''}</div>${bottomNavigation}${rt.showSettings?settingsOverlay():''}`;applyUxPrefs(rt.app);if(rt.screen==='home')fitWelcomeArtwork(rt.app);rt.app.querySelectorAll('.ux-combat-details').forEach(el=>{if(openedCombatDetails.includes(el.dataset.panel))el.open=true;});rt.app.querySelectorAll('details[data-ux6-key]').forEach(el=>{if(openedHeroDetails.includes(el.dataset.ux6Key))el.open=true;});if(oldTownDetails?.length){const statuses=new Map(oldTownDetails.map(entry=>[entry.key,entry.open]));rt.app.querySelectorAll('details[data-ux7-key]').forEach(el=>{const key=el.getAttribute('data-ux7-key');if(key==='city-market'&&rt.screen==='city')el.open=rt.citySection==='market';else if(statuses.has(key))el.open=statuses.get(key);});}if(rt.screen!=='combat'){rt.app.querySelectorAll('.content button[data-action]').forEach(button=>{if(button.closest('.menu-back-container'))return;if(/^\s*(?:<|&lt;)?\s*VOLTAR\s*$/i.test(button.textContent.trim())){const wrapper=button.closest('.menu-back');if(wrapper&&wrapper.querySelectorAll('button').length===1)wrapper.remove();else button.remove();}});}if(viewport)restoreViewport(rt.app,viewport);else{const doc=document.scrollingElement;if(doc)doc.scrollTop=0;const content=rt.app.querySelector('.content');if(content)content.scrollTop=0;}lastRenderedScreen=rt.screen;rt.app.querySelectorAll('.bar>div').forEach((el,i)=>{if(oldBars[i]){const target=el.style.width;el.style.width=oldBars[i];requestAnimationFrame(()=>{el.style.width=target;});}});rt.app.querySelectorAll('.ascii-art').forEach(fitAscii);attachAsciiResizeObserver();rt.app.querySelectorAll('details.ux-journey-art').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)details.querySelectorAll('.ascii-art').forEach(fitAscii);}));rt.app.querySelectorAll('details.ux6-hero-art,details.ux6-equipped-avatar,details.ux6-item-card').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)details.querySelectorAll('.ascii-art').forEach(fitAscii);}));rt.app.querySelectorAll('details.ux7-disclosure,details.ux7-npc-dialogue').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)details.querySelectorAll('.ascii-art').forEach(fitAscii);}));rt.app.querySelectorAll('details.npc-art-detail,details.object-art-detail').forEach(details=>details.addEventListener('toggle',()=>{if(details.open){const el=details.querySelector('.ascii-art');if(el){if(details.classList.contains('npc-art-detail')){const art=highDensityNpcArtwork(details.dataset.hdNpcId);if(art)el.textContent=art;}else{let item=null;try{item=details.dataset.hdItem?JSON.parse(decodeURIComponent(details.dataset.hdItem)):null;}catch{}const art=item?highDensityEquipmentArtwork(item):highDensityObjectArtwork(details.dataset.hdArtKey);if(art)el.textContent=art;}fitAscii(el);}}}));if(!viewport)rt.app.querySelectorAll('.log').forEach(el=>el.scrollTop=0);if(rt.pendingNavScroll!==null&&rt.pendingNavScroll!==undefined){const position=rt.pendingNavScroll;rt.pendingNavScroll=null;const content=rt.app.querySelector('.content');if(content)content.scrollTop=Math.min(position,Math.max(0,content.scrollHeight-content.clientHeight));}syncCreatureAnimation(rt.app,rt.screen==='combat');if(viewport)restoreViewport(rt.app,viewport);enhanceMobileAccessibility(rt.app,rt.screen);if(rt.screen==='create'){let sel=$('#hero-class'),preview=$('#class-preview');const update=()=>{let c=classes[sel.value];preview.textContent=`${c.name} · HP ${c.hp} · MP ${c.mp} · Armas: ${c.weapons.join(', ')}`;};sel.onchange=update;update();}}

// A Etapa 8 compartilha o dimensionamento entre arte completa, combate e galeria.
// ResizeObserver observa apenas alteração de largura, evitando ciclos de layout.
let asciiResizeObserver=null;
const measuredWidths=new WeakMap();
function attachAsciiResizeObserver(){
 if(typeof ResizeObserver==='undefined')return;
 if(!asciiResizeObserver){
  asciiResizeObserver=new ResizeObserver(entries=>{
   for(const entry of entries){
    const container=entry.target,el=container.querySelector(':scope > .ascii-art');
    if(!el||!container.isConnected)continue;
    const w=container.clientWidth;
    if(Math.abs(w-(measuredWidths.get(container)??w))>=2){
     measuredWidths.set(container,w);
     requestAnimationFrame(()=>{if(el.isConnected)fitAscii(el);});
    }
   }
  });
 }
 asciiResizeObserver.disconnect();
 document.querySelectorAll('#app .ascii-art').forEach(el=>{
  const parent=el.parentElement;if(parent){measuredWidths.set(parent,parent.clientWidth);asciiResizeObserver.observe(parent);}
 });
}
export function fitAscii(el){
 const container=el.parentElement;
 if(!container||!container.isConnected)return;
 const inCombat=Boolean(container.closest('.combat-stage'));
 const artLabel=el.getAttribute('aria-label')||el.dataset.creatureId||el.closest('.panel')?.querySelector('h3')?.textContent?.trim()||'cenário ou personagem';
 el.setAttribute('aria-hidden','true');
 const maxFont=inCombat?6:10;
 const available=Math.max(1,container.clientWidth-8);
 // Uma região de leitura mantém altura finita mesmo quando o pai cresce com o conteúdo.
 const heightCap=Math.max(90,window.innerHeight*(inCombat?.50:.55));
 const availableHeight=Math.max(1,Math.min(container.clientHeight||heightCap,heightCap));
 el.style.fontSize=`${maxFont}px`;
 el.style.whiteSpace='pre';el.style.width='max-content';el.style.maxWidth='none';
 const naturalWidth=Math.max(1,el.scrollWidth),naturalHeight=Math.max(1,el.scrollHeight);
 const fontSize=fitAsciiFont({availableWidth:available,availableHeight,naturalWidth,naturalHeight,baseFont:maxFont});
 el.style.fontSize=`${fontSize}px`;
 const ratio=fontSize/maxFont;
 el.dataset.artSmall=ratio<.38?'true':'false';
 const detailed=['hd-world-scene','hd-interior-scene','hd-event-scene','hd-object-scene','hd-npc-portrait'];
 const zoomNeeded=el.classList.contains('high-density-character')||ratio<.38||(ratio<.78&&detailed.some(cls=>container.classList.contains(cls)));
 if(zoomNeeded&&!inCombat){
  container.classList.add('ascii-zoomable');
  container.title='Arte detalhada: clique para ampliar';
  container.removeAttribute('tabindex');
  container.setAttribute('role','button');
  container.setAttribute('aria-label',`Ampliar arte ASCII: ${artLabel}`);
  container.onclick=()=>openAsciiViewer(el.textContent,el);

 }else{
  container.classList.remove('ascii-zoomable');container.onclick=null;container.onkeydown=null;
  container.setAttribute('role','img');container.setAttribute('aria-label',`Arte ASCII: ${artLabel}`);container.removeAttribute('tabindex');container.removeAttribute('title');
 }
}
function openAsciiViewer(content,artElement){return openDetailedAsciiViewer(content,artElement);}
let resizeAsciiPending=false;
window.addEventListener('resize',()=>{
 if(resizeAsciiPending)return;resizeAsciiPending=true;
 requestAnimationFrame(()=>{resizeAsciiPending=false;document.querySelectorAll('#app .ascii-art').forEach(fitAscii);});
});

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
    if(oldRows.length===newRows.length){oldRows.forEach((row,i)=>{const oldValue=row.querySelector('.hero-attribute-value'),newValue=newRows[i].querySelector('.hero-attribute-value');if(oldValue&&newValue)oldValue.innerHTML=newValue.innerHTML;const oldMilestone=row.querySelector('.milestone-info'),newMilestone=newRows[i].querySelector('.milestone-info');if(oldMilestone&&newMilestone)oldMilestone.innerHTML=newMilestone.innerHTML;const oldButtons=row.querySelectorAll('button'),newButtons=newRows[i].querySelectorAll('button');oldButtons.forEach((button,j)=>{if(newButtons[j])button.disabled=newButtons[j].disabled;});});continue;}
   }
   if(selector==='.hero-distribution-actions'){const a=current.querySelectorAll('button'),b=replacement.querySelectorAll('button');a.forEach((button,i)=>{if(b[i])button.disabled=b[i].disabled;});continue;}
   current.innerHTML=replacement.innerHTML;
  }
 }
 restoreViewport(rt.app,snapshot);
}

import { detailedArtworks } from './artworks-detailed.js';
import { dungeonScenes, dungeonBossArt } from './dungeon-artworks.js';
import { heroArtworks } from './hero-artworks.js';
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
import { makeItem, validEquip, rarityName } from './equipment.js';
import { potionPrice } from './shops.js';
export function header(){if(rt.state?.combat&&rt.screen==='combat')return '<div class="brand">ASCII REALMS</div>';if(!rt.state)return `<div class="brand">* ASCII REALMS *</div><div class="muted">Um mundo de fantasia em caracteres</div>`;let s=stats();return `<div class="brand">* ASCII REALMS *</div><div class="small">${escape(rt.state.name)} · ${classes[rt.state.cls].name} · Nível ${rt.state.lv} · <span class="gold">${rt.state.gold} ouro</span></div><div class="small">HP ${rt.state.hp}/${s.maxhp}${bar(rt.state.hp,s.maxhp)}MP ${rt.state.mp}/${s.maxmp}${bar(rt.state.mp,s.maxmp,'mp')}EXP ${rt.state.lv===100?'MAX':`${rt.state.xp}/${xpNeed(rt.state.lv)}`}${bar(rt.state.lv===100?1:rt.state.xp,rt.state.lv===100?1:xpNeed(rt.state.lv),'exp')}</div>`;}

export function home(){return panel('INÍCIO',`<p>Explore 100 áreas, enfrente 10 chefes e evolua até o nível 100.</p>${localStorage.getItem(KEY)?btn('Continuar aventura','continue'):''}${btn('Novo jogo','create')}${localStorage.getItem(KEY)?btn('Excluir progresso','delete'):''}`);}

export function create(){return panel('CRIAR PERSONAGEM',`<label>Nome do aventureiro</label><p><input id="hero-name" maxlength="24" placeholder="Seu nome" value="Herói"></p><label>Classe</label><p><select id="hero-class">${Object.entries(classes).map(([id,c])=>`<option value="${id}">${c.name}</option>`).join('')}</select></p><div id="class-preview"></div>${btn('Iniciar aventura','start')}`);}

export function world(){let m=maps[mapId(rt.area)],boss=rt.area%10===0;return panel(`MAPA ${mapId(rt.area)+1} · ${m[0]}`,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape((detailedCities[m[1]]||cityArtworks[m[1]]))}</pre></div><p>Área ${rt.area} de 100 · Nível mínimo ${rt.area}</p><p class="muted">Criaturas: ${m.slice(3,6).join(', ')}.</p><div class="actions">${btn('Explorar','explore')}${boss?btn(rt.state.bosses.includes(mapId(rt.area))?'Reenfrentar chefe':'Desafiar chefe','boss'):''}${btn('Visitar cidade','city')}${btn('Selecionar área','maps')}</div>`);}

export function worldMap(){return maps.map((m,i)=>panel(`${i+1}. ${m[0]} ${rt.state.bosses.includes(i)?'✓':''}`,`<p class="muted">Áreas ${i*10+1} a ${i*10+10} · ${m[1]} · Chefe: ${m[2]}</p><div class="actions">${Array.from({length:10},(_,j)=>{let n=i*10+j+1,locked=n>rt.state.lv||(i>0&&!rt.state.bosses.includes(i-1));return btn(`${n}${j===9?' B':''}`,`area:${n}`,locked);}).join('')}</div>`)).join('');}

export function character(){let s=stats();return panel('ATRIBUTOS',`<div class="ascii-container"><pre class="ascii-art" data-ascii="true">${escape(heroArtworks[rt.state.cls])}</pre></div><p>${rt.state.points} pontos disponíveis</p>${A.map((a,i)=>`<div class="stat"><span>${N[i]} (${a.toUpperCase()})</span><span>${rt.state.stats[i]}${s[a]>rt.state.stats[i]?` +${s[a]-rt.state.stats[i]}`:''} ${btn('+',`attr:${i}`,!rt.state.points)}</span></div>`).join('')}`)+panel('ESTATÍSTICAS',Object.entries({HP:s.maxhp,MP:s.maxmp,'Ataque físico':s.atk,'Ataque mágico':s.mag,'Defesa física':s.def,'Defesa mágica':s.md,'Precisão':s.hit.toFixed(1)+'%','Esquiva':s.dodge.toFixed(1)+'%','Crítico':s.crit.toFixed(1)+'%','Dano crítico':s.critD.toFixed(2)+'x'}).map(([k,v])=>stat(k,v)).join(''));}

export function inventory(){return panel('EQUIPAMENTOS',Object.entries(rt.state.equip).map(([slot,id])=>{let it=rt.state.items.find(x=>x.uid===id);return `<div class="item">${slot}: ${it?escape(it.name)+(it.upgrade?' +'+it.upgrade:''):'Vazio'} ${it?btn('Remover',`unequip:${slot}`):''}</div>`;}).join(''))+panel('ITENS',`<div class="actions">${['all','weapon','armor','accessory','consumable','material'].map(t=>btn(t,`filter:${t}`)).join('')}</div>${rt.state.items.filter(it=>rt.filter==='all'||rt.filter==='weapon'&&it.slot==='weapon'||rt.filter==='armor'&&['head','body','hands','feet'].includes(it.slot)||rt.filter==='accessory'&&['ring','amulet'].includes(it.slot)).map(it=>`<div class="item"><b class="${['','green','rare','epic','legend'][it.rarity]}">${escape(it.name)}${it.upgrade?' +'+it.upgrade:''}</b> · Nv ${it.lv} · ${rarityName(it.rarity)}<div class="small muted">${it.kind} ${it.armor?'· Armadura '+['','leve','média','pesada'][it.armor]:''} · ${Object.entries(it.attrs).map(([k,v])=>`${k.toUpperCase()} +${v}`).join('')} · ATQ +${it.attack} MAG +${it.magic} DEF +${it.def}${it.upgrade?' · Aprimoramento +'+Math.round(UPGRADE_BONUS[it.upgrade]*100)+'%':''}${it.setId?' · Conjunto '+escape(SETS.find(x=>x.id===it.setId)?.name||''):''}</div>${btn('Equipar',`equip:${it.uid}`,!validEquip(it)||rt.state.equip[it.slot]===it.uid)} ${btn('Vender',`sell:${it.uid}`,Object.values(rt.state.equip).includes(it.uid))}</div>`).join('')||'<p class="muted">Nenhum item nesta categoria.</p>'}${Object.entries(rt.state.consumables).map(([k,v])=>`<div class="item">${k}: ${v} ${btn('Usar',`use:${k}`,!v||k==='antidote'||rt.state.combat!==null)}</div>`).join('')}${Object.entries(rt.state.materials).filter(([k,v])=>v>0).map(([k,v])=>`<div class="item">${escape(k)} ×${v} ${btn('Vender',`material:${encodeURIComponent(k)}`)}</div>`).join('')}`);}

export function skills(){return panel('HABILIDADES ATIVAS',active[rt.state.cls].map(a=>`<div class="item"><b>${a[0]}</b> · Nível ${a[1]} · ${a[2]} MP <span class="${rt.state.lv>=a[1]?'green':'muted'}">${rt.state.lv>=a[1]?'Desbloqueada':'Bloqueada'}</span></div>`).join(''))+panel('HABILIDADES PASSIVAS',passives().map(p=>`<div class="item"><b>${p.name}</b> · Nv ${p.lv}<div class="small muted">${p.desc} · ${rt.state.lv>=p.lv?'Ativa':'Bloqueada'}</div></div>`).join(''))+specializationSummary();}

export function city(){let m=maps[mapId(rt.area)];return panel(m[1],`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape((detailedCities[m[1]]||cityArtworks[m[1]]))}</pre></div><div class="actions">${['weapon','armor','accessory','potion'].map((s,i)=>btn(['Armas','Armaduras','Acessórios','Poções'][i],`shop:${s}`)).join('')}${btn('Descansar (20 ouro)','rest',rt.state.gold<20)}${btn('Missões da cidade','nav:quests')}${btn('Ferraria','nav:forge')}${btn('Masmorras','nav:dungeons')}${btn('Especializações','nav:specializations')}${btn('Voltar à exploração','world')}</div>`)+store();}

export function store(){if(rt.shop==='merchant')return panel('MERCANTE VIAJANTE',`${btn('Poção de vida','buyPotion:hp',rt.state.gold<potionPrice('hp'))}${btn('Poção de mana','buyPotion:mp',rt.state.gold<potionPrice('mp'))}${btn('Voltar','world')}`);if(rt.shop==='potion')return panel('LOJA DE POÇÕES',Object.entries({hp:'Poção de Vida',mp:'Poção de Mana',elixir:'Elixir',antidote:'Antídoto'}).map(([t,n])=>`<div class="item">${n} · ${potionPrice(t)} ouro ${btn('Comprar',`buyPotion:${t}`,rt.state.gold<potionPrice(t))}</div>`).join(''));let slots=rt.shop==='weapon'?['weapon']:rt.shop==='armor'?['head','body','hands','feet']:['ring','amulet'],levels=[3,6,9].map(n=>mapId(rt.area)*10+n);return panel('CATÁLOGO',slots.flatMap(slot=>levels.map(lv=>{let it=makeItem(lv,slot);return `<div class="item">${escape(it.name)} · Nv ${lv} · ${it.price} ouro · ${slot} ${btn('Comprar',`buy:${slot}:${lv}`,rt.state.gold<it.price)}</div>`;})).join(''));}

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
   const belowLevel=rt.state.lv<a[1],lowMp=rt.state.mp<a[2];
   return actionButton(a[0],`skill:${i}`,belowLevel||lowMp,belowLevel?`Nível ${a[1]} · Bloqueada`:`${a[2]} MP`,'combat-skill');
  }).join('');
  const exclusive=specSkills(rt.state).map((a,i)=>actionButton(a.name,`spec:${i}`,rt.state.mp<a.cost,`${a.cost} MP`,'combat-specialization')).join('');
  return `<div class="combat-attacks"><div class="combat-attack-basic-row">${basic}</div><div class="combat-skills-grid">${skills}</div>${exclusive?`<div class="combat-extra-skills"><div class="combat-extra-title">Especialização</div><div class="combat-extra-grid">${exclusive}</div></div>`:''}<div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div></div>`;
 }
 const potions=Object.entries(rt.state.consumables).map(([k,v])=>actionButton(`${k} (${v})`,`potion:${k}`,!v)).join('');
 return `<div class="combat-menu-grid">${potions}</div><div class="combat-back-row">${actionButton('Voltar','submenu:main')}</div>`;
}

export function combatUI(){
 const c=rt.state.combat,e=c.enemy,s=stats(),artwork=detailedArtworks[e.baseName]||dungeonBossArt[e.baseName]||DUNGEON_BOSS_ART[e.baseName]||artworks[e.baseName]||art[e.baseName]||art.boss;
 const controls=combatControls();
 const status=rt.phase==='enemy-preparing'?`${e.name} prepara seu ataque...`:rt.phase==='player-action'?'Executando sua ação...':rt.phase==='enemy-hit'?'O inimigo recebeu o impacto!':rt.phase==='player-hit'?'Você recebeu o impacto!':'Escolha sua ação';
 const floating=rt.float?.amount>0?`<div class="floating-damage ${rt.float.side} ${rt.float.critical?'critical':''} ${rt.float.heal?'heal':''}">-${rt.float.amount}</div>`:'';
 const bossInfo=e.boss?`<div class="boss-phase">* FASE ${e.bossPhase||1}/3 · ${escape(BOSS_PHASES[e.baseName]?.phases[(e.bossPhase||1)-1]||'')} ${e.telegraph?`<div class="boss-warning">! ATAQUE IMINENTE! ${escape(e.telegraph.message)}<div>Prepare sua defesa neste turno.</div></div>`:''}</div>`:'';
 return `<section class="combat-stage">`+panel(`${e.boss?'CHEFE · ':''}${escape(e.name)} ${e.boss?'':`<span class="monster-rarity rarity-${monsterRarity(e.rarityId).id}">[${monsterRarity(e.rarityId).label}]</span>`} · Nível ${e.lv}`,` ${bossInfo}<div class="enemy-visual ${rt.phase==='enemy-hit'?'impact':''} ${rt.float?.critical?'critical':''} ${rt.float?.element||''}">HP ${e.hp}/${e.maxhp}${bar(e.hp,e.maxhp)}<div class="ascii-container"><pre class="ascii-art ${combatAnimationClass(rt.phase)}" data-creature-id="${escape(e.baseName)}" data-ascii="true">${escape(artwork)}</pre></div>${rt.float?.side==='enemy'?floating:''}</div>`)
 +panel('HERÓI · '+escape(rt.state.name),`<div class="hero-visual ${rt.phase==='player-hit'?'impact':''} ${rt.float?.heal?'healing':''}">HP ${rt.state.hp}/${s.maxhp} · MP ${rt.state.mp}/${s.maxmp}${rt.float?.side==='player'?floating:''}</div><div class="ascii-container"><pre class="ascii-art hero-portrait" data-ascii="true">${escape(heroArtworks[rt.state.cls])}</pre></div>` )
 +panel('AÇÕES',`<p class="turn-status">${escape(status)}</p><div class="combat-controls ${rt.busy?'locked':''}">${controls}</div>`)
 +panel('HISTÓRICO DE COMBATE',displayLog())+`</section>`;
}
export function forgeUI(){const region=mapId(rt.area),r=recipes(region),items=rt.state.items;const materials=Object.entries(rt.state.materials).filter(([,n])=>n>0).map(([name,n])=>`<div class="item">${escape(name)} ×${n}</div>`).join('')||'<p class="muted">Nenhum material.</p>';const craftRows=r.map(x=>`<div class="item"><b>${escape(x.name)}</b> · Nv ${x.level} · ${x.gold} ouro<div class="small muted">${Object.entries(x.materials).map(([k,v])=>`${escape(k)} ×${v}`).join(' · ')}</div>${btn('Fabricar',`craft:${x.id}`,rt.state.lv<x.level||rt.state.gold<x.gold||Object.entries(x.materials).some(([k,v])=>(rt.state.materials[k]||0)<v))}</div>`).join('');const upgradeRows=items.map(it=>{const cost=upgradeCost(it);return `<div class="item">${escape(it.name)} +${it.upgrade||0}${cost?` · ${cost.gold} ouro · ${Math.round(cost.chance*100)}% · bônus +${Math.round(cost.bonus*100)}%<div class="small muted">${Object.entries(cost.materials).map(([k,v])=>`${escape(k)} ×${v}`).join('')}</div>${btn('Aprimorar',`enhance:${it.uid}`,rt.state.gold<cost.gold||Object.entries(cost.materials).some(([k,v])=>(rt.state.materials[k]||0)<v))}`:' · Nível máximo +10'}</div>`;}).join('');const equipped=Object.values(rt.state.equip).map(uid=>items.find(x=>x.uid===uid)).filter(Boolean),sets=setBonuses(equipped);return panel('FERRARIA · MATERIAIS',materials)+panel('RECEITAS',craftRows)+panel('APRIMORAMENTO',upgradeRows||'<p class="muted">Nenhum equipamento.</p>')+panel('CONJUNTOS',SETS.map(set=>{const active=sets.active.find(x=>x.set.id===set.id),n=active?.n||equipped.filter(it=>it.setId===set.id).length;return `<div class="item">${escape(set.name)} · ${n}/5 peças <span class="small muted">2 peças: bônus principal · 3: VIT · 4: bônus adicional · 5: regeneração</span></div>`;}).join(''));}

export function specializationSummary(){const s=selectedSpec(rt.state);return panel('ESPECIALIZAÇÃO',s?`<p><b>${escape(s.name)}</b> · ${escape(s.passive)}</p><p>60: ${escape(s.skill)} · 75: ${escape(s.improved)} · 90: ${escape(s.ultimate)}</p>`:'<p class="muted">Escolha uma especialização a partir do nível 50.</p>');}
export function specializationUI(){const s=selectedSpec(rt.state);if(s)return specializationSummary()+panel('HABILIDADES EXCLUSIVAS',specSkills(rt.state).map(a=>`<div class="item">${escape(a.name)} · ${a.cost} MP · ${a.mult}x · ${a.element}</div>`).join('')||'Novas habilidades nos níveis 60 e 90.');return panel('ESCOLHA SUA ESPECIALIZAÇÃO',specOptions(rt.state.cls).map(x=>`<div class="item"><b>${escape(x.name)}</b><p>${escape(x.passive)} · ${escape(x.improved)}</p><p>Ativa 60: ${escape(x.skill)} · Final 90: ${escape(x.ultimate)}</p>${btn('Escolher '+x.name,`chooseSpec:${x.id}`,rt.state.lv<50)}</div>`).join(''));}
export function dungeonUI(){const ds=dungeonState(rt.state),a=ds.attempt;if(a){const d=DUNGEONS.find(x=>x.id===a.id);return panel(d.name,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape(dungeonScenes[d.name]||d.art)}</pre></div><p>Sala ${a.room}/5 · ${['Combate','Combate ou armadilha','Recuperação','Elite','Chefe exclusivo'][a.room-1]}</p><p>HP e MP são mantidos entre salas.</p><div class="actions">${a.roomResolved?(a.room<5?btn('Próxima sala','dungeonAdvance'):''):btn('Entrar na sala','dungeonAction')}${btn('Abandonar tentativa','dungeonAbandon')}</div>`);}return DUNGEONS.map(d=>panel(d.name,`<div class="ascii-container city-scene"><pre class="ascii-art" data-ascii="true">${escape(dungeonScenes[d.name]||d.art)}</pre></div><p>${escape(d.description)} · Nível recomendado ${d.level} · Chefe: ${escape(d.boss)}</p><p>Melhor sala: ${ds.best[d.id]||0}/5 · ${ds.completed.includes(d.id)?'Concluída':'Não concluída'}</p>${btn('Entrar','dungeonEnter:'+d.region,!dungeonAvailable(rt.state,d))}`)).join('');}

export function render(){const content=rt.app.querySelector('.content');const oldScroll=content?.scrollTop||0;const oldBars=[...rt.app.querySelectorAll('.bar>div')].map(x=>x.style.width);rt.app.innerHTML=`<header class="head">${header()}</header><div class="content ${rt.state?.combat&&rt.screen==='combat'?'combat-content':''}">${!rt.state?(rt.screen==='create'?create():home()):({home:home,world,character,inventory,skills,quests:questUI,bestiary:bestiaryUI,statistics:statisticsUI,forge:forgeUI,dungeons:dungeonUI,dungeon:dungeonUI,specializations:specializationUI,maps:worldMap,city,combat:combatUI,merchant:store,result:()=>panel('RESULTADO',`${displayLog()}${btn('Continuar',dungeonState(rt.state).attempt?'nav:dungeon':'world')}`)}[rt.screen]||world)()}</div>${rt.state&&rt.screen!=='combat'?`<nav class="nav">${[['world','Explorar'],['maps','Mapas'],['character','Herói'],['inventory','Itens'],['skills','Skills'],['city','Cidade'],['forge','Ferraria'],['dungeons','Masmorras'],['specializations','Especialização'],['quests','Missões'],['bestiary','Bestiário'],['statistics','Estatísticas']].map(([id,n])=>btn(n,`nav:${id}`,!!rt.state.combat)).join('')}</nav>`:''}`;const newContent=rt.app.querySelector('.content');if(newContent&&rt.screen==='combat')newContent.scrollTop=0;rt.app.querySelectorAll('.bar>div').forEach((el,i)=>{if(oldBars[i]){const target=el.style.width;el.style.width=oldBars[i];requestAnimationFrame(()=>{el.style.width=target;});}});rt.app.querySelectorAll('.ascii-art').forEach(fitAscii);rt.app.querySelectorAll('.log').forEach(el=>el.scrollTop=0);syncCreatureAnimation(rt.app,rt.screen==='combat');if(rt.screen==='create'){let sel=$('#hero-class'),preview=$('#class-preview');const update=()=>{let c=classes[sel.value];preview.textContent=`${c.name} · HP ${c.hp} · MP ${c.mp} · Armas: ${c.weapons.join(', ')}`;};sel.onchange=update;update();}}

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

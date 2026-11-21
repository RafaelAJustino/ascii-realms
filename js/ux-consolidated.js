/** Revisão única de UX/UI. Preferências são locais, isoladas do save v14. */
import {QUESTS} from './progression.js';
import {DYNAMIC_QUESTS} from './dynamic-quests.js';
import {ADVENTURE_BY_ID} from './procedural-adventures.js';
import {maps} from './data.js';
const PREFS='ascii-realms-ux-prefs-v1', GUIDES='ascii-realms-ux-guides-v1';
const prefDefaults=Object.freeze({largeText:false,reducedMotion:false,showGuides:true});
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
export function uxPrefs(){const val=read(PREFS,{});return {...prefDefaults,...(val&&typeof val==='object'&&!Array.isArray(val)?val:{})};}
export function changeUxPref(key){if(!Object.hasOwn(prefDefaults,key))return false;const next=uxPrefs();next[key]=!next[key];return write(PREFS,next);}
export function applyUxPrefs(app){if(!app?.classList)return;const p=uxPrefs();app.classList.toggle('ux-text-large',!!p.largeText);app.classList.toggle('ux-motion-off',!!p.reducedMotion);}
export function resetUxGuides(){try{localStorage.removeItem(GUIDES);return true;}catch{return false;}}
const GUIDE_CONTENT={world:['Primeiros passos','Toque em Explorar para escolher um caminho. Mapa e Cidade ficam logo abaixo.'],paths:['Escolha sua rota','Seguro oferece menos encontros; Perigoso aumenta o risco. A rota continua após cada acontecimento.'],journey:['Sua expedição','Use Continuar explorando para avançar. O acampamento e o retorno à cidade ficam disponíveis nesta tela.'],combat:['Turnos de combate','Ataque comum não gasta MP. As habilidades mostram custo e recarga. Consumíveis ficam na seção expansível.'],player:['Desenvolva seu herói','Atributos, equipamentos, habilidades e conquistas estão organizados nesta seção.'],character:['Distribuição de pontos','Os botões + e − fazem uma prévia. Os atributos só mudam após Aplicar pontos.'],inventory:['Escolha seu equipamento','Abra um item para comparar seus atributos antes de equipá-lo.'],quests:['Acompanhe objetivos','Aceite uma missão e marque Acompanhar para ver o objetivo na aventura.']};
export function guideForScreen(screen){if(!uxPrefs().showGuides||!GUIDE_CONTENT[screen])return '';const seen=read(GUIDES,{});if(seen?.[screen])return '';const [title,message]=GUIDE_CONTENT[screen];return `<aside class="ux-first-tip" role="note"><div><strong>${title}</strong><p>${message}</p></div><button type="button" data-action="uxDismissTip:${screen}" aria-label="Dispensar orientação">Entendi</button></aside>`;}
export function dismissUxGuide(screen){if(!Object.hasOwn(GUIDE_CONTENT,screen))return false;const seen=read(GUIDES,{});seen[screen]=true;return write(GUIDES,seen);}
export function trackQuest(state,id){
 if(!state)return false;
 const valid=QUESTS.some(q=>q.id===id&&(state.quests?.active?.[id]||state.quests?.completed?.includes(id)))||
  DYNAMIC_QUESTS.some(q=>q.id===id&&(state.dynamicQuests?.active?.[id]||state.dynamicQuests?.completed?.includes(id)))||
  !!(ADVENTURE_BY_ID[id]&&state.adventure?.entries?.[id]&&state.adventure.entries[id].phase!=='available'&&state.adventure.entries[id].phase!=='done');
 if(!valid)return false;
 const key=`ascii-realms-ux-quest:${String(state.name||'')}:${String(state.cls||'')}`;
 try{localStorage.setItem(key,id);return true;}catch{return false;}
}
export function trackedQuest(state,region){
 if(!state)return null;
 let id;try{id=localStorage.getItem(`ascii-realms-ux-quest:${String(state.name||'')}:${String(state.cls||'')}`);}catch{}
 const regional=QUESTS.filter(q=>state.quests?.active?.[q.id]||state.quests?.completed?.includes(q.id));
 const narrative=DYNAMIC_QUESTS.filter(q=>state.dynamicQuests?.active?.[q.id]||state.dynamicQuests?.completed?.includes(q.id));
 const personal=Object.entries(state.adventure?.entries||{}).filter(([key,entry])=>ADVENTURE_BY_ID[key]&&!['available','done'].includes(entry.phase))
  .map(([key])=>({...ADVENTURE_BY_ID[key],description:ADVENTURE_BY_ID[key].lead}));
 const all=[...regional,...narrative,...personal];
 return all.find(q=>q.id===id)||all.find(q=>q.region===region)||all[0]||null;
}

const SVG_BASE='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
const SVG_PATHS={aventura:'<path d="M12 2.5 14.5 9.5 21.5 12l-7 2.5-2.5 7-2.5-7L2.5 12l7-2.5z"/><path d="M12 9v6M9 12h6"/>',personagem:'<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',diario:'<path d="M12 6c-3.2-2-6.2-2.3-9-1v14c3.2-1.3 6.2-1 9 1 2.8-2 5.8-2.3 9-1V5c-2.8-1.3-5.8-1-9 1z"/><path d="M12 6v14"/>',mundo:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>'};
export function uxIcon(name){return `<svg class="ux-icon" ${SVG_BASE} aria-hidden="true" focusable="false">${SVG_PATHS[name]||SVG_PATHS.aventura}</svg>`;}
export function settingsOverlay(){const p=uxPrefs();const toggle=(name,label,hint)=>`<button type="button" class="ux-settings-row" data-action="uxPref:${name}"><span><strong>${label}</strong><small>${hint}</small></span><b aria-hidden="true" class="ux-switch ${p[name]?'on':''}">${p[name]?'ON':'OFF'}</b></button>`;
 return `<div class="ux-settings-overlay" role="presentation"><section class="ux-settings-sheet" role="dialog" aria-modal="true" aria-label="Configurações"><div class="ux-settings-heading"><div><small>ASCII REALMS</small><h2>Configurações</h2></div><button type="button" data-action="uxSettingsClose" aria-label="Fechar configurações">Fechar</button></div><p class="small muted">Personalize a interface. Suas escolhas não modificam o personagem ou as regras do jogo.</p>${toggle('largeText','Texto maior','Aumenta o tamanho das informações do jogo')}${toggle('reducedMotion','Reduzir animações','Minimiza movimentos e efeitos visuais')}${toggle('showGuides','Dicas contextuais','Explicações curtas sobre cada tela')}<button type="button" class="ux-settings-secondary" data-action="uxResetGuides">Reexibir orientações</button><p class="small muted">Seu progresso permanece salvo neste navegador. A exclusão do personagem continua disponível somente na tela inicial, mediante confirmação.</p></section></div>`;
}

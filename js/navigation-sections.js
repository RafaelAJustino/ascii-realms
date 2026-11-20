/** Navegação mobile-first da Etapa 3. Estado somente em memória, fora do salvamento. */
import {activeJourney} from './journey-paths.js';

export const SECTIONS=Object.freeze([
 Object.freeze({id:'aventura',label:'Aventura',root:'world'}),
 Object.freeze({id:'personagem',label:'Personagem',root:'player'}),
 Object.freeze({id:'diario',label:'Diário',root:'diary'}),
 Object.freeze({id:'mundo',label:'Mundo',root:'atlas'})
]);
const GROUPS=Object.freeze({
 aventura:['world','paths','journey','camp','merchant'],
 personagem:['player','character','inventory','skills','statistics','specializations','achievements'],
 diario:['diary','quests','bestiary','secrets'],
 mundo:['atlas','maps','city','tavern','forge','dungeons','dungeon']
});
const lastScreens=Object.create(null);
const positions=new Map();
export function sectionForScreen(screen){return SECTIONS.find(section=>GROUPS[section.id].includes(screen))?.id||null;}
export function rememberSectionScreen(screen){const section=sectionForScreen(screen);if(section)lastScreens[section]=screen;}
export function rememberSectionPosition(screen,scroll=0,shop=''){if(sectionForScreen(screen))positions.set(`${screen}:${screen==='city'?shop:''}`,Math.max(0,Number(scroll)||0));}
export function sectionPosition(screen,shop=''){return positions.get(`${screen}:${screen==='city'?shop:''}`)||0;}
export function resetNavigationSections(){for(const section of SECTIONS)delete lastScreens[section.id];positions.clear();}
export function sectionDestination(section,{currentScreen='',state=null}={}){
 const def=SECTIONS.find(item=>item.id===section);
 if(!def)return null;
 if(section==='aventura'&&activeJourney(state)){
  const remembered=lastScreens.aventura;
  if(['journey','camp','paths'].includes(remembered)&&sectionForScreen(currentScreen)!==section)return remembered;
  return 'journey';
 }
 if(section==='mundo'&&state?.dungeons?.attempt)return 'dungeon';
 if(sectionForScreen(currentScreen)===section)return def.root;
 return lastScreens[section]||def.root;
}
export function sectionDisabled(section,state){return !!state?.dungeons?.attempt&&!['personagem','mundo'].includes(section);}
export function sectionNavigation(screen,state){
 if(!state||state.combat||['combat','result','home','create'].includes(screen))return '';
 const current=sectionForScreen(screen);
 return `<nav class="ux-area-nav" aria-label="Navegação principal">${SECTIONS.map(section=>`<button type="button" class="ux-area-tab${current===section.id?' is-current':''}" data-action="navArea:${section.id}" ${current===section.id?'aria-current="page"':''} ${sectionDisabled(section.id,state)?'disabled aria-disabled="true"':''}>${section.label}</button>`).join('')}</nav>`;
}

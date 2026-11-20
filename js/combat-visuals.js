/** Efeitos visuais efêmeros, sem alterar as regras ou o estado do combate. */
import {getCombatSpeed} from './combat-speed.js';
import {PLAYER_SKILL_ELEMENTS} from './elements.js';
import {activeVisualSession} from './combat-visual-state.js';

const RATIOS={normal:1.55,fast:1,instant:0};
const activeAnimations=new Set();
export function cancelCombatVisuals(root){
 for(const animation of activeAnimations)try{animation.cancel();}catch{}
 activeAnimations.clear();
 root?.querySelectorAll?.('.combat-fx,.combat-reaction').forEach(node=>node.remove());
}
function sessionActive(session){return activeVisualSession(session);}
const GESTURES={
 guerreiro:{basic:'slash',skills:['crush','barrier','fury','execute']},
 mago:{basic:'arcane',skills:['fire','barrier','storm','meteor']},
 arqueiro:{basic:'arrow',skills:['arrow','rain','pierce','arrow']},
 ladino:{basic:'dagger',skills:['shadow','poison','shadow','execute']}
};
const SYMBOLS={slash:'\\\\//',crush:'##',barrier:'[====]',fury:'////',execute:'!X!',arcane:'*.*',fire:'***',storm:'~*~',meteor:'(*)',arrow:'--->',rain:'v v v',pierce:'====>',dagger:'/\\',shadow:':::',poison:':.:',heal:'+++',guard:'[###]',magic:'*~*',electric:'~=~',ice:'***',hit:'!!',dodge:'   ',block:'[##]'};
export function combatEffectFor({cls='guerreiro',kind='attack',index=0,skill=null,element='physical',side='hero'}={}){
 if(side==='enemy'){
  if(skill?.kind==='heal')return 'heal';
  if(skill?.kind==='guard')return 'barrier';
  if(element==='fire')return 'fire';if(element==='ice')return 'ice';if(element==='lightning'||element==='electric')return 'electric';
  if(element==='poison')return 'poison';
  if(element==='dark')return 'shadow';if(element==='holy')return 'arcane';
  if(skill?.element&&skill.element!=='physical')return 'magic';
  if(skill?.kind==='debuff')return 'poison';
  return skill?.id==='strike'?'crush':skill?.id==='boss-special'?'meteor':'shadow';
 }
 if(kind==='potion')return 'heal';
 if(kind==='skill')return GESTURES[cls]?.skills[index]||'slash';
 if(kind==='spec')return element==='physical'?'fury':combatEffectFor({side:'enemy',skill:{element},element});
 return GESTURES[cls]?.basic||'slash';
}
export function visualDuration(){
 const speed=getCombatSpeed(),reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 return reduced?0:(RATIOS[speed]??1);
}
function animate(node,frames,ms){
 if(!node||ms<=0||typeof node.animate!=='function')return Promise.resolve();
 try{const animation=node.animate(frames,{duration:ms,easing:'ease-out',fill:'none'});activeAnimations.add(animation);return animation.finished.catch(()=>{}).then(()=>{activeAnimations.delete(animation);});}catch{return Promise.resolve();}
}
/** Anima apenas os elementos de cena existentes; não provoca render() nem layout shift. */
export async function playCombatAction(root,options={}){
 const ratio=visualDuration(),stage=root?.querySelector?.('.combat-arena');
 if(!stage||ratio===0||!sessionActive(options.session))return;
 const actor=stage.querySelector(options.side==='enemy'?'.combat-enemy .ascii-art':'.combat-player .hero-portrait');
 const target=stage.querySelector(options.side==='enemy'?'.combat-player .hero-portrait':'.combat-enemy .ascii-art');
 if(!actor||!target)return;
 const effect=combatEffectFor(options),isDefense=['barrier','heal','guard'].includes(effect),isRange=['arcane','fire','meteor','storm','arrow','rain','pierce','electric','ice','magic','poison'].includes(effect);
 const prep=animate(actor,[{transform:'translateX(0)',filter:'brightness(1)'},{transform:'translateX(0)',filter:'brightness(1.35)'},{transform:'translateX(0)',filter:'brightness(1)'}],Math.round(70*ratio));
 await prep;
 if(!sessionActive(options.session)||!stage.isConnected)return;
 const host=stage.querySelector('.combat-effects')||createFxLayer(stage);
 const attackerRect=actor.getBoundingClientRect(),targetRect=target.getBoundingClientRect(),hostRect=host.getBoundingClientRect();
 const start={x:attackerRect.left+attackerRect.width*.5-hostRect.left,y:attackerRect.top+attackerRect.height*.5-hostRect.top};
 const finish={x:targetRect.left+targetRect.width*.5-hostRect.left,y:targetRect.top+targetRect.height*.5-hostRect.top};
 const fx=document.createElement('span');fx.className=`combat-fx combat-fx-${effect}`;fx.textContent=SYMBOLS[effect]||'***';
 fx.style.left=`${start.x}px`;fx.style.top=`${start.y}px`;host.appendChild(fx);
 try{
  if(!isDefense){
   const duration=Math.round((isRange?145:115)*ratio);
   const deltaX=finish.x-start.x,deltaY=finish.y-start.y;
   const animFx=animate(fx,[{transform:'translate(0,0)',opacity:0},{transform:`translate(${deltaX*.25}px,${deltaY*.25}px)`,opacity:1},{transform:`translate(${deltaX}px,${deltaY}px)`,opacity:1}],duration);
   const animActor=animate(actor,[{transform:'translateX(0)'},{transform:`translateX(${options.side==='enemy'?-5:5}px)`},{transform:'translateX(0)'}],duration);
   await Promise.all([animFx,animActor]);
   if(!sessionActive(options.session)||!stage.isConnected)return;
   await animate(target,[{filter:'brightness(1)'},{filter:'brightness(1.7)'},{filter:'brightness(1)'}],Math.round(90*ratio));
  }else{
   await animate(fx,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(-8px)'},{opacity:0,transform:'translateY(-15px)'}],Math.round(150*ratio));
  }
 }finally{fx.remove();}
}
function createFxLayer(stage){const layer=document.createElement('div');layer.className='combat-fx-layer';layer.setAttribute('aria-hidden','true');stage.appendChild(layer);return layer;}
/** A reação usa o resultado já resolvido. Não inventa bloqueio, dano ou cura. */
export async function playCombatReaction(root,{session=null,side='enemy',amount=0,heal=false,log=[],kind='damage',critical=false}={}){
 const ratio=visualDuration();if(ratio===0||!sessionActive(session))return;
 const area=root?.querySelector?.(side==='enemy'?'.combat-enemy':'.combat-player');if(!area)return;
 const messages=log.map(x=>typeof x==='string'?x:x.text||'').join(' ').toLowerCase();
 const missed=/ataque errou|errou o ataque/.test(messages)&&amount===0;
 const dodge=/esquiv/.test(messages)&&amount===0;
 const blocked=/bloque/.test(messages)&&amount===0;
 const healed=heal&&amount>0;
 const label=missed?'ERROU':dodge?'ESQUIVOU':blocked?'BLOQUEOU':healed?'CURA':critical&&amount>0?'CRITICO':'';
 if(!label)return;
 const node=document.createElement('span');node.className=`combat-reaction ${missed?'miss':dodge?'dodge':blocked?'block':healed?'heal':critical?'critical':'damage'}`;node.textContent=label;area.appendChild(node);
 try{await animate(node,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(-4px)'},{opacity:0,transform:'translateY(-14px)'}],Math.round(140*ratio));}finally{node.remove();}
}

export function heroSkillElement(cls,index){return PLAYER_SKILL_ELEMENTS?.[cls]?.[index]||'physical';}
export const EFFECT_SYMBOLS=SYMBOLS;

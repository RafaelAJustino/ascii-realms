// ASCII quadro a quadro: nenhuma geometria e substituida nem ampliada.
// Modificacoes locais de mesma largura simulam piscadas e luz nas texturas.
export function creatureFrames(source) {
  const raw=String(source||'').replace(/\r/g,'');
  const blink=raw.replace(/\(o\)/g,'(-)').replace(/\[o\]/g,'[-]');
  const glint=raw.replace(/#(?=##)/g,'%');
  const exert=raw.replace(/:(?=##)/g,';');
  return [raw,glint,blink,exert];
}
export function animationFrame(frames,elapsed,period=240){return frames[Math.floor(Math.max(0,elapsed)/period)%frames.length];}
export function combatAnimationClass(phase){return ({'player-action':'creature-attack','enemy-preparing':'creature-charge','enemy-hit':'creature-hurt','player-hit':'creature-attack'})[phase]||'creature-breathe';}
let timer=null,activeElement=null,frames=[],index=0,identity=null;
export function syncCreatureAnimation(root,enabled){
 const element=enabled&&root?.querySelector?.('.enemy-visual .ascii-art');
 if(!element){stopCreatureAnimation();return;}
 const currentId=element.dataset?.creatureId;
 if(timer&&activeElement?.isConnected&&identity===currentId){activeElement=element;return;}
 stopCreatureAnimation();activeElement=element;identity=currentId;frames=creatureFrames(element.textContent);index=0;
 if(typeof window==='undefined'||!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 timer=setInterval(()=>{
   if(!activeElement?.isConnected){stopCreatureAnimation();return;}
   if(activeElement.closest('.enemy-visual')?.classList.contains('impact'))return;
   activeElement.textContent=frames[++index%frames.length];
 },280);
}
export function stopCreatureAnimation(){if(timer!==null)clearInterval(timer);timer=null;activeElement=null;frames=[];index=0;identity=null;}

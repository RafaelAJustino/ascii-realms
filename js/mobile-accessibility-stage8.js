/** Etapa 8: acessibilidade progressiva, sem novas dependências ou alteração de salvamento. */
export const SCREEN_LABELS=Object.freeze({
 home:'Início',create:'Criação de personagem',world:'Aventura',paths:'Escolher caminho',
 journey:'Expedição',camp:'Acampamento',combat:'Combate',result:'Resultado do combate',
 player:'Personagem',character:'Atributos',inventory:'Inventário',skills:'Habilidades',
 achievements:'Conquistas',secrets:'Descobertas',quests:'Missões',diary:'Diário de aventuras',
 atlas:'Mundo',maps:'Mapa',city:'Cidade',merchant:'Comércio',tavern:'Taverna',
 forge:'Ferraria',dungeons:'Masmorras',dungeon:'Masmorra',statistics:'Estatísticas',
 bestiary:'Bestiário',specializations:'Especializações'
});
export const screenHeadingLabel=screen=>SCREEN_LABELS[screen]||'Aventura';
/**
 * Reforça semântica após o HTML ser criado. Não troca botões nem interfere
 * com delegação de cliques, mudanças de estado ou funções da gameplay.
 */
export function enhanceMobileAccessibility(root,screen){
 if(!root||typeof root.querySelectorAll!=='function')return;
 const content=root.querySelector?.('.content');
 if(!content||typeof content.querySelectorAll!=='function')return;
 // Navegação exclusiva por toque/mouse. tabIndex=-1 não impede clique,
 // abertura de details nem digitação após tocar/clicar em um campo.
 for(const item of content.querySelectorAll('button,a,input,select,textarea,summary,[role="button"]')){
  item.setAttribute('tabindex','-1');
 }
 const title=content.querySelector('.ux8-screen-heading');
 if(title)title.textContent=screenHeadingLabel(screen);
 for(const art of content.querySelectorAll('pre.ascii-art')){
  art.setAttribute('aria-hidden','true');
  const region=art.closest('.ascii-container');
  if(!region)continue;
  const name=art.getAttribute('aria-label')||art.dataset.creatureId||art.closest('.panel')?.querySelector('h3')?.textContent?.trim()||'personagem ou cenário';
  region.setAttribute('role',region.classList.contains('ascii-zoomable')?'button':'img');
  region.setAttribute('aria-label',`${region.classList.contains('ascii-zoomable')?'Ampliar arte ASCII':'Arte ASCII'}: ${name}`);
 }
 // Botões selecionáveis já possuem aria-pressed na maioria das telas.
 // Corrige versões legadas sem sobrescrever estados informados pelo componente.
 for(const group of content.querySelectorAll('.ux7-city-switch,.ux7-store-tabs,.ux7-quest-filters,.ux6-inventory-tabs,.ux6-bag-filters,.combat-speed-options')){
  for(const button of group.querySelectorAll('button')){
   if(!button.hasAttribute('aria-pressed')){
    button.setAttribute('aria-pressed',String(button.classList.contains('is-active')||button.classList.contains('selected')));
   }
  }
 }
 for(const feedback of content.querySelectorAll('.city-feedback,#hero-feedback')){
  if(!feedback.hasAttribute('role'))feedback.setAttribute('role','status');
  feedback.setAttribute('aria-live','polite');
 }
}

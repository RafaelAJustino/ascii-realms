/** ASCII REALMS, HD8: medição e inspeção acessível de artes textuais.
 * O desenho continua sendo texto puro. Nenhum caractere vira um elemento gráfico.
 */
export function asciiDimensions(art){
 const lines=String(art??'').replace(/\r\n?/g,'\n').split('\n');
 return {width:Math.max(0,...lines.map(line=>[...line].length)),height:lines.length};
}
export function clampAsciiFont(value,{min=.5,max=18}={}){
 return Math.max(min,Math.min(max,Number.isFinite(value)?value:min));
}
export function fitAsciiFont({availableWidth,availableHeight,naturalWidth,naturalHeight,baseFont=10}){
 const scale=Math.min(1,Math.max(0,availableWidth)/Math.max(1,naturalWidth),Math.max(0,availableHeight)/Math.max(1,naturalHeight));
 return Math.floor(clampAsciiFont(baseFont*scale,{min:.5,max:baseFont})*100)/100;
}

let currentDialog=null;
function setupViewer(){
 if(currentDialog?.isConnected)return currentDialog;
 const dialog=document.createElement('dialog');
 dialog.id='ascii-art-viewer';
 dialog.setAttribute('aria-labelledby','ascii-viewer-title');
 dialog.className='hd8-viewer';
 dialog.innerHTML=`<div class="hd8-viewer-bar"><strong id="ascii-viewer-title">Arte ASCII detalhada</strong><div class="hd8-viewer-actions"><button type="button" data-zoom="out" aria-label="Diminuir zoom">−</button><button type="button" data-zoom="fit">Ajustar</button><button type="button" data-zoom="in" aria-label="Aumentar zoom">+</button><button type="button" class="ascii-close">Fechar</button></div></div><div class="hd8-viewer-info" role="status" aria-live="polite"></div><div class="hd8-viewer-viewport" aria-label="Arte ampliada; utilize a rolagem para explorar"><pre></pre></div><p class="hd8-viewer-hint">Utilize os botões para ajustar o zoom e deslize para examinar os detalhes.</p>`;
 document.body.appendChild(dialog);
 const pre=dialog.querySelector('pre'),view=dialog.querySelector('.hd8-viewer-viewport'),status=dialog.querySelector('.hd8-viewer-info');
 function setSize(font){
  const oldWidth=pre.scrollWidth||1,oldHeight=pre.scrollHeight||1;
  const x=(view.scrollLeft+view.clientWidth/2)/oldWidth,y=(view.scrollTop+view.clientHeight/2)/oldHeight;
  pre.style.setProperty('--hd8-font',`${clampAsciiFont(font,{min:2,max:22})}px`);
  status.textContent=`${dialog.dataset.cols} colunas × ${dialog.dataset.rows} linhas · fonte ${parseFloat(pre.style.getPropertyValue('--hd8-font')).toFixed(1)} px`;
  view.scrollLeft=Math.max(0,x*pre.scrollWidth-view.clientWidth/2);
  view.scrollTop=Math.max(0,y*pre.scrollHeight-view.clientHeight/2);
 }
 function fit(){
  pre.style.setProperty('--hd8-font','12px');
  const size=fitAsciiFont({availableWidth:view.clientWidth-8,availableHeight:view.clientHeight-8,naturalWidth:pre.scrollWidth,naturalHeight:pre.scrollHeight,baseFont:12});
  setSize(Math.max(2,size));
  view.scrollTo(0,0);
 }
 dialog.addEventListener('click',e=>{
  const action=e.target.closest('button');if(!action)return;
  if(action.classList.contains('ascii-close'))return dialog.close();
  const size=parseFloat(pre.style.getPropertyValue('--hd8-font'))||12;
  if(action.dataset.zoom==='fit')fit();
  else if(action.dataset.zoom==='in')setSize(size*1.3);
  else if(action.dataset.zoom==='out')setSize(size/1.3);
 });
 // O visualizador é controlado exclusivamente por clique ou toque.
 dialog.querySelectorAll('button').forEach(button=>button.tabIndex=-1);
 dialog._setSize=setSize;
 dialog._fit=fit;
 currentDialog=dialog;return dialog;
}
export function openDetailedAsciiViewer(text,source=null){
 const dialog=setupViewer(),pre=dialog.querySelector('pre');
 const contents=String(text??'');
 // textContent impede que uma arte ASCII injete HTML.
 pre.textContent=contents;
 // Apenas spans de raridade criados pelo compositor são reconstruídos.
 // O texto das artes sempre entra com textContent, nunca via innerHTML.
 pre.className='';
 if(source?.classList?.contains('dynamic-hero')){
  pre.className='dynamic-hero';pre.replaceChildren();
  for(const child of source.childNodes){
   if(child.nodeType===3){pre.appendChild(document.createTextNode(child.textContent));continue;}
   if(child.nodeType!==1||child.tagName!=='SPAN'){
    pre.appendChild(document.createTextNode(child.textContent||''));continue;
   }
   const span=document.createElement('span');span.classList.add('avatar-ink');
   const match=[...child.classList].find(name=>/^avatar-(?:head|body|hands|feet|weapon|ring|amulet)-(?:common|uncommon|rare|epic|legendary)$/.test(name));
   if(match)span.classList.add(match);
   span.textContent=child.textContent;pre.appendChild(span);
  }
 }

 const {width,height}=asciiDimensions(contents);
 dialog.dataset.cols=String(width);dialog.dataset.rows=String(height);
 if(!dialog.open)dialog.showModal();
 dialog._fit();
 // Em telas pequenas, evitar que uma arte de 160 colunas fique ilegível.
 // O botão Ajustar continua disponível para mostrar a composição inteira.
 const fitted=parseFloat(pre.style.getPropertyValue('--hd8-font'))||12;
 if(fitted<7){
  dialog._setSize(7);
  const view=dialog.querySelector('.hd8-viewer-viewport');
  view.scrollLeft=Math.max(0,(pre.scrollWidth-view.clientWidth)/2);
  view.scrollTop=0;
 }
 return dialog;
}

// Preserva viewport e foco somente em atualizações da mesma tela.
const clamp=(value,max)=>Math.max(0,Math.min(value,Math.max(0,max)));
const pathFor=(root,node)=>{const path=[];while(node&&node!==root){const parent=node.parentElement;if(!parent)return null;path.unshift(Array.prototype.indexOf.call(parent.children,node));node=parent;}return node===root?path:null;};
const byPath=(root,path)=>path?.reduce((node,index)=>node?.children[index],root);
const keyFor=(node)=>node?.getAttribute('data-action')||node?.id||null;
export function captureViewport(root){
 const scrolling=[root,...root.querySelectorAll('*')].filter(el=>el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1).map(el=>({path:pathFor(root,el),top:el.scrollTop,left:el.scrollLeft}));
 const active=document.activeElement;
 const focus=active&&root.contains(active)?{path:pathFor(root,active),action:active.getAttribute('data-action'),id:active.id||null}:null;
 const doc=document.scrollingElement;
 return {scrolling,focus,pageTop:doc?.scrollTop||0,pageLeft:doc?.scrollLeft||0};
}
export function restoreViewport(root,snapshot){
 if(!snapshot)return;
 for(const {path,top,left} of snapshot.scrolling){const el=byPath(root,path);if(el){el.scrollTop=clamp(top,el.scrollHeight-el.clientHeight);el.scrollLeft=clamp(left,el.scrollWidth-el.clientWidth);}}
 const doc=document.scrollingElement;
 if(doc){doc.scrollTop=clamp(snapshot.pageTop,doc.scrollHeight-doc.clientHeight);doc.scrollLeft=clamp(snapshot.pageLeft,doc.scrollWidth-doc.clientWidth);}
 if(snapshot.focus){const {action,id,path}=snapshot.focus;let el=byPath(root,path);
  if(el?.getAttribute('data-action')!==action||el?.id!==(id||''))el=null;
  if(!el&&id)el=[...root.querySelectorAll('[id]')].find(candidate=>candidate.id===id);
  if(!el&&action)el=[...root.querySelectorAll('[data-action]')].find(candidate=>candidate.getAttribute('data-action')===action);
  if(el&&!el.disabled&&typeof el.focus==='function')el.focus({preventScroll:true});
 }
 // O foco não pode reposicionar a página.
 for(const {path,top,left} of snapshot.scrolling){const el=byPath(root,path);if(el){el.scrollTop=clamp(top,el.scrollHeight-el.clientHeight);el.scrollLeft=clamp(left,el.scrollWidth-el.clientWidth);}}
 if(doc){doc.scrollTop=clamp(snapshot.pageTop,doc.scrollHeight-doc.clientHeight);doc.scrollLeft=clamp(snapshot.pageLeft,doc.scrollWidth-doc.clientWidth);}
}
export function shouldPreserveViewport(previousScreen,nextScreen){return previousScreen===nextScreen;}

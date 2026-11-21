// Preserva viewport e foco somente em atualizações da mesma tela.
const clamp=(value,max)=>Math.max(0,Math.min(value,Math.max(0,max)));
const pathFor=(root,node)=>{const path=[];while(node&&node!==root){const parent=node.parentElement;if(!parent)return null;path.unshift(Array.prototype.indexOf.call(parent.children,node));node=parent;}return node===root?path:null;};
const byPath=(root,path)=>path?.reduce((node,index)=>node?.children[index],root);
export function captureViewport(root){
 const scrolling=[root,...root.querySelectorAll('*')].filter(el=>el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1).map(el=>({path:pathFor(root,el),top:el.scrollTop,left:el.scrollLeft}));
 const doc=document.scrollingElement;
 return {scrolling,pageTop:doc?.scrollTop||0,pageLeft:doc?.scrollLeft||0};
}
export function restoreViewport(root,snapshot){
 if(!snapshot)return;
 for(const {path,top,left} of snapshot.scrolling){const el=byPath(root,path);if(el){el.scrollTop=clamp(top,el.scrollHeight-el.clientHeight);el.scrollLeft=clamp(left,el.scrollWidth-el.clientWidth);}}
 const doc=document.scrollingElement;
 if(doc){doc.scrollTop=clamp(snapshot.pageTop,doc.scrollHeight-doc.clientHeight);doc.scrollLeft=clamp(snapshot.pageLeft,doc.scrollWidth-doc.clientWidth);}
 // Preserva a rolagem, sem restaurar foco de elementos antigos.
 for(const {path,top,left} of snapshot.scrolling){const el=byPath(root,path);if(el){el.scrollTop=clamp(top,el.scrollHeight-el.clientHeight);el.scrollLeft=clamp(left,el.scrollWidth-el.clientWidth);}}
 if(doc){doc.scrollTop=clamp(snapshot.pageTop,doc.scrollHeight-doc.clientHeight);doc.scrollLeft=clamp(snapshot.pageLeft,doc.scrollWidth-doc.clientWidth);}
}
export function shouldPreserveViewport(previousScreen,nextScreen){return previousScreen===nextScreen;}

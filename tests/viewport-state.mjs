import assert from 'node:assert/strict';
import {captureViewport,restoreViewport,shouldPreserveViewport} from '../js/viewport-state.js';
class Element {
 constructor({height=100,scrollHeight=100,top=0,action=null,id=''}={}){this.children=[];this.parentElement=null;this.clientHeight=height;this.scrollHeight=scrollHeight;this.clientWidth=100;this.scrollWidth=100;this.scrollTop=top;this.scrollLeft=0;this.action=action;this.id=id;this.disabled=false;}
 contains(node){while(node){if(node===this)return true;node=node.parentElement;}return false;}
 add(child){child.parentElement=this;this.children.push(child);return child;}
 querySelectorAll(selector){const result=[];function visit(el){for(const child of el.children){if(selector==='*'||selector==='[id]'&&child.id||selector==='[data-action]'&&child.action)result.push(child);visit(child);}}visit(this);return result;}
 getAttribute(name){return name==='data-action'?this.action:null;}
 focus(options){this.focusOptions=options;globalThis.document.activeElement=this;}
}
const doc=new Element({height:500,scrollHeight:2000,top:250});globalThis.document={scrollingElement:doc,activeElement:null};
const root=new Element({height:500,scrollHeight:500});const content=root.add(new Element({height:400,scrollHeight:1800,top:450}));const list=content.add(new Element({height:150,scrollHeight:700,top:220}));const button=list.add(new Element({action:'attrPlus:0'}));document.activeElement=button;
const snapshot=captureViewport(root);assert.equal(snapshot.scrolling.length,2);
const newRoot=new Element({height:500,scrollHeight:500});const newContent=newRoot.add(new Element({height:400,scrollHeight:1300}));const newList=newContent.add(new Element({height:150,scrollHeight:250}));const newButton=newList.add(new Element({action:'attrPlus:0'}));doc.scrollTop=0;restoreViewport(newRoot,snapshot);
assert.equal(newContent.scrollTop,450);assert.equal(newList.scrollTop,100);assert.equal(doc.scrollTop,250);assert.equal(document.activeElement,button);assert.equal(newButton.focusOptions,undefined);
assert.equal(shouldPreserveViewport('inventory','inventory'),true);assert.equal(shouldPreserveViewport('inventory','combat'),false);
newContent.scrollHeight=500;restoreViewport(newRoot,snapshot);assert.equal(newContent.scrollTop,100);
console.log('OK: rolagem principal, lista interna, limite, sem foco automatico e navegação por clique.');

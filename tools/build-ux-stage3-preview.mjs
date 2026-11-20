/** Prévia estática fiel às funções render() + CSS real. Não testa gameplay. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
const app={innerHTML:'',querySelector(){return null;},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[],scrollingElement:null};
globalThis.window={innerHeight:812,addEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
const {newGame}=await import('../js/player.js');
const {rt}=await import('../js/runtime.js');
const {render}=await import('../js/ui.js');
const index=readFileSync(resolve(root,'index.html'),'utf8');
const styles=[...index.matchAll(/href="(css\/[^\"]+\.css)"/g)].map(m=>readFileSync(resolve(root,m[1]),'utf8')).join('\n');
newGame('Aventureiro','guerreiro');
mkdirSync(resolve(root,'docs'),{recursive:true});
for(const [screen,label] of [['player','Personagem'],['diary','Diário'],['atlas','Mundo'],['world','Aventura']]){
 rt.screen=screen;render();
 const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ASCII REALMS | ${label}</title><style>${styles}</style></head><body><a class="ux-skip-link" href="#app">Ir ao conteúdo</a><main id="app">${app.innerHTML}</main></body></html>`;
 writeFileSync(resolve(root,`docs/ux-stage3-${screen}.html`),html);
}
console.log('Quatro prévias estáticas geradas de render() + CSS real.');

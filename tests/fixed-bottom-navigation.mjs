import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const storage = new Map(), listeners = {};
globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
const content={scrollTop:0,scrollLeft:0,scrollHeight:1400,clientHeight:420,scrollWidth:390,clientWidth:390,
 children:[],parentElement:null,querySelectorAll:()=>[],querySelector:()=>null};
const app={innerHTML:'',children:[content],scrollHeight:500,clientHeight:500,scrollWidth:390,clientWidth:390,scrollTop:0,scrollLeft:0,
 addEventListener(name,fn){listeners[name]=fn;},querySelector:sel=>sel==='.content'?content:null,
 querySelectorAll:sel=>sel==='*'?[content]:[]};
content.parentElement=app;
globalThis.document={querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[],scrollingElement:null};
globalThis.window={innerHeight:844,addEventListener(){} };
globalThis.requestAnimationFrame=fn=>fn();globalThis.setInterval=()=>0;globalThis.confirm=()=>true;
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {render}=await import('../js/ui.js');
const {sectionNavigation,sectionDestination}=await import('../js/navigation-sections.js');
await import('../js/main.js');
const click=action=>listeners.click({target:{closest(){return {disabled:false,dataset:{action}}}}});
newGame('Navegação fixa','arqueiro');
assert.match(app.innerHTML,/<\/div><nav class="ux-area-nav"/,'a barra deve ser irmã do conteúdo, não fazer parte da rolagem');
assert.match(app.innerHTML,/class="content [^"]*has-bottom-nav/);
assert.equal((sectionNavigation('world',rt.state).match(/tabindex="-1"/g)||[]).length,4,'sem navegação por Tab');

// O toque no próprio destino inicial sempre restaura o topo, mesmo que captureViewport
// normalmente preservasse a rolagem numa atualização de tela idêntica.
click('navArea:mundo');assert.equal(rt.screen,'atlas');
content.scrollTop=165;
click('navArea:mundo');assert.equal(rt.screen,'atlas');assert.equal(content.scrollTop,0,'mesma aba, primeiro clique, topo');
click('nav:tavern');assert.equal(rt.screen,'tavern');
click('navArea:mundo');assert.equal(rt.screen,'atlas','Mundo > Taverna > Mundo volta ao atlas');
click('navArea:personagem');assert.equal(rt.screen,'player');
click('nav:inventory');assert.equal(rt.screen,'inventory');
click('navArea:personagem');assert.equal(rt.screen,'player','Inventário > Personagem volta ao menu do herói');
click('navArea:diario');assert.equal(rt.screen,'diary');
click('nav:quests');assert.equal(rt.screen,'quests');
click('navArea:diario');assert.equal(rt.screen,'diary','Missões > Diário volta ao índice');
click('navArea:aventura');assert.equal(rt.screen,'world');
click('nav:player');assert.equal(rt.screen,'player');
click('navArea:aventura');assert.equal(rt.screen,'world','Personagem > Aventura volta ao início');

// Contexto ativo não pode ser perdido ao pressionar a aba inicial.
rt.state.journey={...rt.state.journey,path:'safe',area:rt.state.area};
assert.equal(sectionDestination('aventura',{currentScreen:'camp',state:rt.state}),'journey');
rt.state.dungeons.attempt={id:'dungeon-test',room:1};
assert.equal(sectionDestination('mundo',{currentScreen:'player',state:rt.state}),'dungeon');
rt.state.dungeons.attempt=null;
const css=readFileSync(new URL('../css/mobile-fixed-bottom-nav.css',import.meta.url),'utf8');
assert.match(css,/position:fixed/);assert.match(css,/transform:translateX\(-50%\)/);
assert.match(css,/safe-area-inset-bottom/);assert.match(css,/\.content\.has-bottom-nav/);
assert.match(css,/min-height:48px/);
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/mobile-fixed-bottom-nav\.css/);
console.log('OK: rodapé fixo, clique único, origem de quatro seções, mesmo botão volta ao topo, Tab desabilitado e expedição/masmorra preservadas.');

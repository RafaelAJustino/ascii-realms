/** Etapa 9: cobre telas que ainda não faziam parte das 112 medições da Etapa 8.
 * Conteúdo de tela é gerado por funções reais do jogo, sem modificar o salvamento.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const cache=new Map();
globalThis.localStorage={getItem:key=>cache.get(key)??null,setItem:(key,v)=>cache.set(key,String(v)),removeItem:key=>cache.delete(key)};
const app={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
globalThis.document={querySelector:s=>s==='#app'?app:null,scrollingElement:null,activeElement:null,querySelectorAll:()=>[]};
globalThis.window={innerHeight:844,addEventListener(){}};globalThis.requestAnimationFrame=callback=>callback();
const {newGame}=await import('../js/player.js');
const {rt}=await import('../js/runtime.js');
const {create,header,campUI,atlasHub,worldMap,forgeUI,dungeonUI,diaryHub,store,character,skills,inventory}=await import('../js/ui.js');
const {statisticsUI}=await import('../js/progression-ui.js');
const {sectionNavigation}=await import('../js/navigation-sections.js');
const {choosePath}=await import('../js/journey-paths.js');
const index=readFileSync(resolve(root,'index.html'),'utf8');
const cssFiles=[...index.matchAll(/href="(css\/[^"?]+\.css)"/g)].map(x=>x[1]);
const css=cssFiles.map(path=>readFileSync(resolve(root,path),'utf8')).join('\n');
const wrap=(name,screen,markup,{loggedIn=true}={})=>`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS | Etapa 9 | ${name}</title><style>${css}</style></head><body><a class="skip-link" href="#game-content">Pular para o jogo</a><main id="app"><header class="head">${loggedIn?header():'<div class="brand">ASCII REALMS</div>'}</header><div class="content" id="game-content" tabindex="-1" aria-label="Conteúdo: ${name}"><h2 class="ux8-screen-heading" tabindex="-1">${name}</h2>${loggedIn?sectionNavigation(screen,rt.state):''}${loggedIn?'<div class="menu-back-container"><button type="button" class="menu-back-button" data-action="menuBack">&lt; VOLTAR</button></div>':''}${markup}</div></main></body></html>`;
const renderFixture=(name,screen,fn)=>{rt.screen=screen;const html=wrap(name,screen,fn());writeFileSync(resolve(root,`docs/qa-ux9-${name}-fixture.html`),html);};
rt.state=null;rt.screen='create';writeFileSync(resolve(root,'docs/qa-ux9-criacao-fixture.html'),wrap('criacao','create',create(),{loggedIn:false}));
newGame('Aventureira','guerreiro');rt.state.lv=35;rt.state.points=6;rt.state.gold=1230;
renderFixture('atlas','atlas',atlasHub);
renderFixture('mapas','maps',worldMap);
renderFixture('diario','diary',diaryHub);
renderFixture('ferraria','forge',forgeUI);
renderFixture('masmorras','dungeons',dungeonUI);
renderFixture('mercante','merchant',store);
renderFixture('estatisticas','statistics',statisticsUI);
choosePath(rt.state,'safe');rt.state.journey.steps=7;
renderFixture('acampamento','camp',campUI);
console.log(`OK: Etapa 9, 9 estados adicionais renderizados por funções reais com ${cssFiles.length} folhas de estilo.`);

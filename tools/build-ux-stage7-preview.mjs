/** Preview fiel: markup produzido pelas funções reais e as folhas de estilo do jogo.
 * Só a inspeção visual é estática; ações e persistência são testadas em Node.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const app={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
globalThis.document={querySelector:s=>s==='#app'?app:null};
globalThis.window={innerHeight:844,addEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
const {newGame}=await import('../js/player.js');
const {rt}=await import('../js/runtime.js');
const {city,tavernUI}=await import('../js/ui.js');
const {questUI}=await import('../js/progression-ui.js');
const {sectionNavigation}=await import('../js/navigation-sections.js');
const {DYNAMIC_QUESTS}=await import('../js/dynamic-quests.js');
const {discoverAdventure,adventureEntry}=await import('../js/procedural-adventures.js');
const {maps}=await import('../js/data.js');
newGame('Aventureira','guerreiro');
rt.state.lv=30;rt.state.gold=260;
rt.state.cityLife.reputation[0]=36;
const story=DYNAMIC_QUESTS.find(x=>x.region===0&&x.stage===0);
rt.state.cityLife.tavern.guestsMet.push(story.source);
rt.state.dynamicQuests.active[story.id]={progress:2};
rt.state.quests.active['q0-kill0']={progress:2};
rt.state.quests.completed.push('q0-collect');
rt.state.quests.claimed.push('q0-explore');
const discovered=discoverAdventure(rt.state,0,'exploration');if(discovered){rt.state.adventure.entries[discovered.id].phase='investigate';rt.state.adventure.entries[discovered.id].clues=[0];}
const index=readFileSync(resolve(root,'index.html'),'utf8');
const cssPaths=[...index.matchAll(/href="(css\/[^"?]+\.css)"/g)].map(m=>m[1]);
const css=cssPaths.map(path=>readFileSync(resolve(root,path),'utf8')).join('\n');
const wrap=(name,screen,content)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Etapa 7: ${name}</title><style>${css}</style></head><body><main id="app"><header class="head"><div class="brand">ASCII REALMS</div><div class="small">Aventureira · Guerreiro · Nível 30 · 260 ouro</div></header><div class="content">${sectionNavigation(screen,rt.state)}<div class="menu-back-container"><button class="menu-back-button" data-action="menuBack">&lt; VOLTAR</button></div>${content}</div></main></body></html>`;
const fixtures={};
rt.screen='city';rt.citySection='services';fixtures['cidade']=wrap('cidade','city',city());
rt.citySection='market';rt.shop='materials';fixtures['mercado']=wrap('mercado','city',city());
rt.screen='tavern';fixtures['taverna']=wrap('taverna','tavern',tavernUI());
fixtures['contratos']=fixtures['taverna'].replace('data-ux7-key="tavern-people" open','data-ux7-key="tavern-people"').replace('data-ux7-key="tavern-contracts"','data-ux7-key="tavern-contracts" open');
rt.screen='quests';rt.questFilter='available';fixtures['missoes-disponiveis']=wrap('disponíveis','quests',questUI());
rt.questFilter='active';fixtures['missoes-ativas']=wrap('ativas','quests',questUI());
rt.questFilter='ready';fixtures['missoes-prontas']=wrap('prontas','quests',questUI());
for(const [name,html] of Object.entries(fixtures))writeFileSync(resolve(root,`docs/qa-ux7-${name}-fixture.html`),html);
console.log(`OK: Etapa 7, ${Object.keys(fixtures).length} telas renderizadas com ${cssPaths.length} folhas CSS reais.`);

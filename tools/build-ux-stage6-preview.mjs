/** Previews geradas pelas funções reais do jogo com os CSS reais.
 * Não simulam o fluxo completo de clicks do aplicativo; os testes de Node cobrem lógica.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:s=>s==='#app'?app:null};
globalThis.window={innerHeight:844,addEventListener(){}};
globalThis.requestAnimationFrame=f=>f();
const {newGame}=await import('../js/player.js');
const {rt}=await import('../js/runtime.js');
const {character,inventory,skills}=await import('../js/ui.js');
newGame('Aventureira','guerreiro');
rt.state.lv=30;rt.state.points=5;
rt.state.items.push(
 {uid:'equipped-sword',name:'Lâmina da Aurora',slot:'weapon',cls:'guerreiro',kind:'Espada',lv:5,rarity:1,attack:12,attrs:{for:1},upgrade:0,price:90},
 {uid:'better-sword',name:'Espada do Guardião',slot:'weapon',cls:'guerreiro',kind:'Espada',lv:24,rarity:3,attack:42,attrs:{for:4,vit:2},upgrade:2,price:270},
 {uid:'head-guard',name:'Elmo de Ferro',slot:'head',kind:'Elmo',lv:6,rarity:2,def:15,attrs:{vit:2},upgrade:0,price:120}
);
rt.state.equip.weapon='equipped-sword';rt.state.materials['Ferro Bruto']=4;
const index=readFileSync(resolve(root,'index.html'),'utf8');
const cssPaths=[...index.matchAll(/href="(css\/[^"?]+\.css)"/g)].map(m=>m[1]);
const css=cssPaths.map(p=>readFileSync(resolve(root,p),'utf8')).join('\n');
const wrap=(title,screen,markup)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><main id="app"><header class="head"><div class="brand">ASCII REALMS</div></header><div class="content"><div class="menu-back-container"><button class="menu-back-button" data-action="menuBack">&lt; VOLTAR</button></div>${markup}</div></main></body></html>`;
const fixtures={character:character()};
rt.inventoryTab='equipped';fixtures.inventory=inventory();
rt.inventoryTab='bag';rt.filter='all';fixtures.comparacao=inventory().replace('data-ux6-key="item-better-sword"','data-ux6-key="item-better-sword" open');
fixtures.skills=skills();
for(const [id,markup] of Object.entries(fixtures)){
 writeFileSync(resolve(root,`docs/qa-ux6-${id}-fixture.html`),wrap(`Etapa 6: ${id}`,id,markup));
}
console.log('OK: previews de herói, equipamento, comparação e habilidades. CSS:',cssPaths.length,'arquivos.');

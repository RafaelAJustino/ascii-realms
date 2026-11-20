import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classes} from '../js/data.js';
import {composeHighDensityHero,renderHighDensityHero,weaponProfile,HD_SLOTS,HD_RARITIES} from '../js/high-density-portraits.js';
import {renderHeroAvatar} from '../js/hero-avatar.js';
const weaponKinds={guerreiro:['Espada','Machado','Martelo'],mago:['Cajado','Varinha','Grimório'],arqueiro:['Arco','Besta'],ladino:['Adaga','Lâmina Curta']};
const stateFor=cls=>({cls,items:[],equip:{}});
const item=(slot,kind,armor=0,rarity=1,model='one')=>({uid:`id-${slot}`,catalogId:`ep6-test-${model}`,slot,kind,armor,rarity,name:`${kind} ${model}`});
const equip=(state,part)=>{state.items=[...state.items.filter(it=>it.slot!==part.slot),part];state.equip[part.slot]=part.uid;};
const remove=(state,slot)=>{state.equip[slot]=null;};
const bound=(art,slot)=>{const colors=art.ink.flat();return colors.filter(x=>x.startsWith(slot+'-')).length;};
const bbox=(art,slot)=>{const coords=[];for(let y=0;y<art.height;y++)for(let x=0;x<art.width;x++)if(art.ink[y][x].startsWith(slot+'-')&&art.rows[y][x]!==' ')coords.push([x,y]);return coords.length?{count:coords.length,minX:Math.min(...coords.map(c=>c[0])),maxX:Math.max(...coords.map(c=>c[0])),minY:Math.min(...coords.map(c=>c[1])),maxY:Math.max(...coords.map(c=>c[1]))}:null;};
let count=0;
for(const cls of Object.keys(classes)){
 const state=stateFor(cls),base=composeHighDensityHero(state);
 assert.equal(base.text,composeHighDensityHero(state).text,'composição determinística');
 const weights=[];
 for(const weight of [1,2,3]){
  equip(state,item('body','Armadura',weight,weight,'armor-'+weight));
  const art=composeHighDensityHero(state);weights.push(art.text);
  assert.ok(bound(art,'body')>100,`${cls} body ${weight} desenha peça`);
  assert.equal(art.height,103);assert.ok(art.rows.every(line=>line.length===160));
  assert.ok([...art.text].every(ch=>ch==='\n'||ch>=' '&&ch<='~'));
  remove(state,'body');assert.equal(composeHighDensityHero(state).text,base.text,`${cls} remove armadura sem deixar partes`);
  count++;
 }
 assert.equal(new Set(weights).size,3,`${cls} light/medium/heavy geometries differ`);
 // Os slots reais alteram a arte, sem pressupor escudo ou calças que não existem.
 for(const slot of HD_SLOTS){
  equip(state,item(slot,slot==='weapon'?weaponKinds[cls][0]:slot==='head'?'Elmo':'Armadura',3,4,slot));
  const art=composeHighDensityHero(state);
  assert.ok(bound(art,slot)>0,`${cls}/${slot}: tinta por peça`);
  assert.notEqual(art.text,base.text,`${cls}/${slot}: geometria ou sombreamento real`);
  assert.match(renderHighDensityHero(state),new RegExp(`avatar-${slot}-legendary`));
  const compact=composeHighDensityHero(state,{compact:true});
  assert.ok(compact.rows.every(line=>line.length===80));
  remove(state,slot);assert.equal(composeHighDensityHero(state).text,base.text,`${cls}/${slot} restauração`);
  count++;
 }
 const weapons=[];
 for(const kind of weaponKinds[cls]){
  equip(state,item('weapon',kind,0,3,kind));
  const art=composeHighDensityHero(state);weapons.push(art.text);
  assert.ok(bbox(art,'weapon').maxX>120,`${cls}/${kind}: arma fixada na mão`);
  assert.equal(art.weaponType,weaponProfile(state.items.find(x=>x.slot==='weapon')));
  remove(state,'weapon');assert.equal(composeHighDensityHero(state).text,base.text);
  count++;
 }
 assert.equal(new Set(weapons).size,weapons.length,`${cls}: classes de armas diferentes têm formas diferentes`);
 // O identificador do catálogo afeta uma gravação visual, não somente o nome da peça.
 equip(state,item('body','Armadura',3,2,'catalog-A'));
 const first=composeHighDensityHero(state).text;
 equip(state,item('body','Armadura',3,2,'catalog-B'));
 assert.notEqual(composeHighDensityHero(state).text,first,`${cls}: modelos diferentes não usam a mesma gravura`);
 // Raridades simultâneas, luvas e anel devem ser visíveis mesmo ao segurar uma arma.
 state.items=[];state.equip={};
 for(const [slot,i] of HD_SLOTS.map((slot,i)=>[slot,i])){
  equip(state,item(slot,slot==='weapon'?weaponKinds[cls][0]:slot,slot==='body'?3:1,i%5,'full-kit-'+slot));
 }
 const rendered=renderHeroAvatar(state);
 for(const part of state.items){
  assert.ok(rendered.includes(`avatar-${part.slot}-${HD_RARITIES[part.rarity]}`),`${cls}: raridade independente ${part.slot}`);
 }
 const full=composeHighDensityHero(state);assert.ok(bound(full,'ring')>0,`${cls}: anel sobreposto à arma permanece visível`);
 assert.ok(bound(full,'weapon')>0);
 // Salvos antigos e itens sem catalogId usam o tipo como fallback.
 state.items[0].catalogId=undefined;assert.ok(composeHighDensityHero(state).rows.every(line=>line.length===160));
}
assert.equal(HD_SLOTS.length,7);
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.match(ui,/renderHeroAvatar\(rt\.state,'compact-density'\)/);
assert.match(ui,/renderHeroAvatar\(rt\.state\)/);
const heroFile=readFileSync(new URL('../js/hero-avatar.js',import.meta.url),'utf8');
assert.ok(!heroFile.includes('renderReferenceRogue'),'o Ladino não utiliza mais a imagem de exemplo');
assert.equal(HD_RARITIES.length,5);
console.log(`OK: Etapa 3 ${count} cenários, 4 classes x 3 armaduras, 7 slots reais, 9 tipos de armas, anatomia, acessório por raridade, troca, remoção, cache, salvamentos antigos e combate compacto.`);

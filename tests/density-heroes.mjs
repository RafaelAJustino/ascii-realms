import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classes} from '../js/data.js';
import {AVATAR_HEIGHT,AVATAR_WIDTH,VISIBLE_SLOTS,RARITY_INK,composeHeroAvatar,composeCompactHeroAvatar,renderHeroAvatar} from '../js/hero-avatar.js';
const hero=cls=>({cls,items:[],equip:{}});
const weapon={guerreiro:'Espada',mago:'Cajado',arqueiro:'Arco',ladino:'Adaga'};
const portraits=new Set();
let variants=0;
for(const cls of Object.keys(classes)){
 const state=hero(cls),base=composeHeroAvatar(state);portraits.add(base.text);
 assert.equal(base.height,44);assert.equal(base.width,64);assert.equal(base.rows.length,AVATAR_HEIGHT);
 assert.ok(base.rows.every(row=>row.length===AVATAR_WIDTH),'columns never clipped');
 assert.match(base.text,/[.@%#*+:=-]/,'real density-based shading');
 assert.ok([...base.text].every(char=>char==='\n'||(char.charCodeAt(0)>=32&&char.charCodeAt(0)<=126)));
 const compact=composeCompactHeroAvatar(state);
 assert.equal(compact.height,22);assert.equal(compact.width,32);
 assert.ok(compact.rows.every(row=>row.length===32));
 assert.ok(renderHeroAvatar(state,'compact-density').includes('compact-density'));
 for(const weight of [1,2,3]){
  const item={uid:'armor',slot:'body',kind:'Armadura',armor:weight,rarity:2};
  state.items=[item];state.equip={body:item.uid};
  assert.notEqual(composeHeroAvatar(state).text,base.text,`${cls} armor grade ${weight}`);
  variants++;
 }
 const variantsOfArmor=new Set([1,2,3].map(armor=>{state.items=[{uid:'armor',slot:'body',armor,rarity:2}];return composeHeroAvatar(state).text;}));
 assert.equal(variantsOfArmor.size,3,`${cls} weight changes torso geometry`);
 for(const slot of VISIBLE_SLOTS){
  const item={uid:`piece-${slot}`,slot,kind:slot==='weapon'?weapon[cls]:'Armadura',armor:3,rarity:4};
  state.items=[item];state.equip={[slot]:item.uid};
  assert.notEqual(composeHeroAvatar(state).text,base.text,`${cls}: ${slot} changes pixels`);
  assert.match(renderHeroAvatar(state),new RegExp(`avatar-${slot}-${RARITY_INK[4]}`),`${cls}: rarity per slot`);
  state.equip={};assert.equal(composeHeroAvatar(state).text,base.text);
 }
}
assert.equal(portraits.size,4,'four class silhouettes');
const state=hero('guerreiro');
state.items=VISIBLE_SLOTS.map((slot,i)=>({uid:'piece-'+slot,slot,kind:slot==='weapon'?'Espada':'Armadura',armor:3,rarity:i%5}));
state.equip=Object.fromEntries(state.items.map(it=>[it.slot,it.uid]));
const all=renderHeroAvatar(state);
for(const slot of VISIBLE_SLOTS){const part=state.items.find(it=>it.slot===slot);assert.ok(all.includes(`avatar-${slot}-${RARITY_INK[part.rarity]}`));}
assert.equal(composeHeroAvatar(state).text,composeHeroAvatar(state).text,'stable cache');
const old=composeHeroAvatar(state).text;state.items.find(x=>x.slot==='weapon').kind='Machado';
assert.notEqual(composeHeroAvatar(state).text,old,'same ID but changed weapon shape invalidates cache');
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.ok(ui.includes("renderHeroAvatar(rt.state,'compact-density')"),'combat uses compact fresh composition');
assert.ok(ui.includes('renderHeroAvatar(rt.state)'),'hero details use high resolution');
const css=readFileSync(new URL('../css/density-art.css',import.meta.url),'utf8');
assert.ok(css.includes('font-variant-ligatures:none'));assert.ok(css.includes('white-space:pre'));
console.log(`OK: ${Object.keys(classes).length} distinct ASCII heroes 64x44, compact 32x22, ${variants} armor variants, 7 slots, 5 rarity palettes, equipment changes, cache and render wiring.`);

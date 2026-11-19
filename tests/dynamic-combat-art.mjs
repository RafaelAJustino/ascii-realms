import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classes,active} from '../js/data.js';
import {composeHeroAvatar,renderHeroAvatar,equippedVisuals,AVATAR_WIDTH,VISIBLE_SLOTS,RARITY_INK} from '../js/hero-avatar.js';
import {combatEffectFor,EFFECT_SYMBOLS,visualDuration} from '../js/combat-visuals.js';
import {initCombatSpeed,setCombatSpeed} from '../js/combat-speed.js';
const mock=cls=>({cls,items:[],equip:{head:null,body:null,hands:null,feet:null,ring:null,amulet:null,weapon:null}});
const portraits=[];
for(const cls of Object.keys(classes)){
 const s=mock(cls),base=composeHeroAvatar(s);
 portraits.push(base.text);
 assert.equal(base.height,22);
 assert.ok(base.rows.every(row=>row.length<=AVATAR_WIDTH));
 for(const c of base.text)assert.ok(c==='\n'||c.charCodeAt(0)>=32&&c.charCodeAt(0)<=126,`${cls}: only ASCII`);
 assert.ok(renderHeroAvatar(s).includes('data-ascii="true"'));
 for(let i=0;i<active[cls].length;i++){
  const kind=combatEffectFor({cls,kind:'skill',index:i});
  assert.ok(EFFECT_SYMBOLS[kind],`${cls}: animation for ${active[cls][i][0]}`);
 }
 const basic=combatEffectFor({cls,kind:'attack'});assert.ok(EFFECT_SYMBOLS[basic]);
}
assert.equal(new Set(portraits).size,4,'four distinct class portraits');
const s=mock('guerreiro');const original=composeHeroAvatar(s).text;
for(const [idx,slot] of VISIBLE_SLOTS.entries()){
 const item={uid:`eq-${slot}`,slot,kind:slot==='weapon'?'Machado':'Armadura',rarity:idx%5,armor:3};
 s.items.push(item);s.equip[slot]=item.uid;
 const enhanced=composeHeroAvatar(s),markup=renderHeroAvatar(s);
 assert.notEqual(enhanced.text,original,`${slot} changes geometry`);
 assert.ok(markup.includes(`avatar-${slot}-${RARITY_INK[item.rarity]}`),`${slot} has independent rarity color`);
 assert.ok(equippedVisuals(s)[slot]===item);
 s.equip[slot]=null;
 assert.equal(composeHeroAvatar(s).text,original,`${slot} removal restores portrait`);
}
// Same class/rarity, different weapon kind must produce different silhouettes.
s.items=[{uid:'w',slot:'weapon',kind:'Espada',rarity:4}];s.equip.weapon='w';const sword=composeHeroAvatar(s).text;s.items[0].kind='Machado';assert.notEqual(sword,composeHeroAvatar(s).text);
const mixed=mock('arqueiro');for(const [i,slot] of VISIBLE_SLOTS.entries()){
 const item={uid:`x${i}`,slot,kind:slot==='weapon'?'Arco':'Armadura',rarity:i%5};mixed.items.push(item);mixed.equip[slot]=item.uid;
}
const html=renderHeroAvatar(mixed);assert.ok(html.includes('avatar-head-'));assert.ok(html.includes('avatar-body-'));assert.ok(html.includes('avatar-weapon-'));
for(const [element,expected] of [['fire','fire'],['ice','ice'],['electric','electric'],['poison','poison']])assert.equal(combatEffectFor({side:'enemy',element,skill:{kind:'damage',element}}),expected);
for(const type of ['strike','heal','guard','debuff'])assert.ok(EFFECT_SYMBOLS[combatEffectFor({side:'enemy',skill:{kind:type,id:type,element:'physical'}})]);
const storage={getItem:()=>null,setItem:()=>{}};initCombatSpeed(storage);assert.equal(visualDuration(),1);
setCombatSpeed('normal',storage);assert.ok(visualDuration()>1);
setCombatSpeed('instant',storage);assert.equal(visualDuration(),0);setCombatSpeed('fast',storage);
const combat=readFileSync(new URL('../js/combat.js',import.meta.url),'utf8');const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');const css=readFileSync(new URL('../css/dynamic-combat-art.css',import.meta.url),'utf8');
assert.ok(ui.includes('renderHeroAvatar(rt.state)'));assert.ok(combat.includes('playCombatAction'));assert.ok(combat.includes('playCombatReaction'));
assert.ok(combat.includes('rt.busy=true'));assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('combat-fx-layer'));
assert.ok(!/companions/.test(combat),'no companions mechanics');
console.log('OK: classes, 7 slots, classes/rarities/colors, 16 skills, animations, action order, speed, reduced motion.');

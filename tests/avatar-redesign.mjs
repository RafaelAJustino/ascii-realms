import assert from 'node:assert/strict';
import {composeHeroAvatar,renderHeroAvatar,AVATAR_WIDTH,AVATAR_HEIGHT,VISIBLE_SLOTS,RARITY_INK} from '../js/hero-avatar.js';
const classes=['guerreiro','mago','arqueiro','ladino'];
const mock=cls=>({cls,items:[],equip:{}});
const unique=[];
for(const cls of classes){
 const s=mock(cls),base=composeHeroAvatar(s);unique.push(base.text);
 assert.equal(base.rows.length,22);assert.equal(base.height,AVATAR_HEIGHT);
 assert.ok(base.rows.every(r=>r.length<=AVATAR_WIDTH),'fit in 33 columns');
 assert.ok([...base.text].every(c=>c==='\n'||c.charCodeAt(0)>=32&&c.charCodeAt(0)<=126),'printable ascii');
 for(const slot of VISIBLE_SLOTS){
  const it={uid:`${cls}-${slot}`,slot,rarity:4,armor:3,kind:slot==='weapon'?({guerreiro:'Espada',mago:'Cajado',arqueiro:'Arco',ladino:'Adaga'}[cls]):'Armadura'};
  s.items.push(it);s.equip[slot]=it.uid;
  const avatar=composeHeroAvatar(s);
  assert.ok(avatar.rows.every(r=>r.length<=AVATAR_WIDTH));
  assert.ok(renderHeroAvatar(s).includes(`avatar-${slot}-${RARITY_INK[it.rarity]}`));
 }
 for(const slot of VISIBLE_SLOTS){s.equip[slot]=undefined;}
 assert.equal(composeHeroAvatar(s).text,base.text,'equipment removal reverses art');
}
assert.equal(new Set(unique).size,4);
const s=mock('guerreiro');
for(const kind of ['Espada','Machado','Martelo','Arco','Besta','Cajado','Varinha','Adaga']){
 s.items=[{uid:'w',slot:'weapon',kind,rarity:4}];s.equip.weapon='w';
 const a=composeHeroAvatar(s);assert.ok(a.rows.every(r=>r.length<=33),kind);
}
console.log('OK: four distinct anatomy grids, 22x33 ASCII, 7 slots, overlays, rarity colors, weapon models and removal.');

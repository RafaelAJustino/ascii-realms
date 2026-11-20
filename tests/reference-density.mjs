import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {composeReferenceRogue,renderReferenceRogue} from '../js/high-density-rogue.js';
import {ROGUE_REFERENCE_ROWS} from '../js/reference-rogue.js';
import {renderHeroAvatar} from '../js/hero-avatar.js';
const state={cls:'ladino',items:[],equip:{}};
assert.equal(ROGUE_REFERENCE_ROWS.length,103);
assert.ok(ROGUE_REFERENCE_ROWS.every(r=>r.length===160&&/^[ -~]+$/.test(r)));
const baseline=composeReferenceRogue(state);
assert.equal(baseline.text,ROGUE_REFERENCE_ROWS.join('\n'),'source text must be preserved pixel for character');
const compact=composeReferenceRogue(state,{compact:true});
assert.equal(compact.width,80);assert.equal(compact.height,52);
assert.ok(compact.rows.every(row=>row.length===80));
assert.match(renderHeroAvatar(state),/full-reference-density/);
assert.match(renderHeroAvatar(state,'compact-density'),/compact-density/) ;
for(const slot of ['head','body','hands','feet','weapon','ring','amulet']){
 const item={slot,uid:slot+'-01',armor:3,rarity:4,kind:slot==='weapon'?'Adaga':'Placas'};
 state.items=[item];state.equip={[slot]:item.uid};
 const changed=composeReferenceRogue(state);
 if(['head','body','hands','feet','weapon'].includes(slot))assert.notEqual(changed.text,baseline.text,slot+' changes actual characters');
 assert.match(renderReferenceRogue(state),new RegExp('avatar-'+slot+'-legendary'),slot+' separate rarity segment');
 state.equip={};assert.equal(composeReferenceRogue(state).text,baseline.text,slot+' removal');
}
const pdf=readFileSync(new URL('../css/density-art.css',import.meta.url),'utf8');
assert.ok(pdf.includes('reference-density')&&pdf.includes('white-space:pre'));
console.log('OK: user-reference high-density rogue 160x103, exact ASCII source, dynamic masks and individual rarity inks, compact 80x52, 7 slots, restoration.');

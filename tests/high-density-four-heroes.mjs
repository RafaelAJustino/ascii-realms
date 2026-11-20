import assert from 'node:assert/strict';
import {HIGH_DENSITY_HERO_ROWS} from '../js/high-density-hero-arts.js';
import {composeHighDensityHero,renderHighDensityHero,PORTRAIT_W,PORTRAIT_H} from '../js/high-density-portraits.js';
import {renderHeroAvatar} from '../js/hero-avatar.js';
const classes=['guerreiro','mago','arqueiro','ladino'];
const figures=new Set();
for(const cls of classes){
 const rows=HIGH_DENSITY_HERO_ROWS[cls];
 assert.equal(rows.length,PORTRAIT_H);
 assert.ok(rows.every(row=>row.length===PORTRAIT_W&&/^[ -~]*$/.test(row)));
 const state={cls,items:[],equip:{}};
 const base=composeHighDensityHero(state);
 assert.equal(base.text,rows.join('\n'));
 figures.add(base.text);
 const compact=composeHighDensityHero(state,{compact:true});
 assert.equal(compact.width,80);assert.equal(compact.height,52);
 assert.ok(compact.rows.every(row=>row.length===80));
 assert.match(renderHeroAvatar(state),/high-density-character/);
 assert.match(renderHeroAvatar(state,'compact-density'),/compact-density/);
 assert.match(renderHighDensityHero(state),new RegExp(`data-class="${cls}"`));
 assert.equal(base.weaponType,'none');
}
assert.equal(figures.size,4,'todos os retratos são originais e diferentes');
console.log('OK: 4 heróis redesenhados em 160x103, novo Ladino, nenhum retrato-base com arma equipada, 80x52 em combate.');

import {FORGE_MATERIALS} from './crafting.js';
import { progressQuest, statAdd } from './progression.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { stats } from './player.js';
import { save } from './storage.js';
import { combat } from './combat.js';
import { render } from './ui.js';
export function explore(){progressQuest('explore',mapId(rt.area));let r=Math.random();if(r<.8)return combat();if(r<.9){rt.screen='merchant';rt.shop='merchant';rt.log=['Um mercante viajante oferece seus produtos.'];}else if(r<.95){let d=Math.ceil(stats().maxhp*(.08+Math.random()*.12));rt.state.hp=Math.max(0,rt.state.hp-d);statAdd('damageTaken',d);rt.log=[`Armadilha! Você perdeu ${d} HP.`];if(rt.state.hp===0){let lost=Math.floor(rt.state.gold*.1);rt.state.gold-=lost;rt.state.hp=stats().maxhp;rt.state.mp=stats().maxmp;rt.log.unshift(`Você desmaiou e perdeu ${lost} ouro.`);}rt.screen='result';}else{let name=maps[mapId(rt.area)][6];rt.state.materials[name]=(rt.state.materials[name]||0)+1;const forgeMat=FORGE_MATERIALS[mapId(rt.area)];rt.state.materials[forgeMat]=(rt.state.materials[forgeMat]||0)+1;statAdd('itemsFound');rt.log=[`Você encontrou: ${name}.`];rt.screen='result';}save();render();}

export function changeArea(n){if(n>rt.state.lv||n<1||n>100||mapId(n)>0&&!rt.state.bosses.includes(mapId(n)-1))return;rt.area=n;rt.state.area=n;rt.screen='world';save();render();}

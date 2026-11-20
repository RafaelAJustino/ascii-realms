import {selectCatalog,createCatalogItem} from './equipment-catalog.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { stats } from './player.js';
import { save } from './storage.js';
import { render } from './ui.js';
/** Mantém a assinatura original para drops, crafting, chefes e salvamentos. */
export function makeItem(level,slot,cls=rt.state.cls,rarity=0,region=mapId(level)){
 region=Math.max(0,Math.min(9,region));
 const blueprint=selectCatalog(level,slot,cls,region);
 if(!blueprint)throw Error(`Equipamento não encontrado: ${slot} / ${region}`);
 return createCatalogItem(blueprint,rarity,level);
}

export function validEquip(it){return rt.state.lv>=it.lv&&(it.slot!=='weapon'||!it.cls||it.cls===rt.state.cls);}

export function equip(uid){let it=rt.state.items.find(x=>x.uid===uid);if(!it||!validEquip(it))return;rt.state.equip[it.slot]=uid;let s=stats();rt.state.hp=Math.min(rt.state.hp,s.maxhp);rt.state.mp=Math.min(rt.state.mp,s.maxmp);save();render();}

export function rollRarity(){let r=Math.random();return r<.6?0:r<.85?1:r<.96?2:r<.995?3:4;}

export function rarityName(n){return ['Comum','Incomum','Raro','Épico','Lendário'][n];}

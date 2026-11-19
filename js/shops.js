import { statAdd } from './progression.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { save } from './storage.js';
import { makeItem } from './equipment.js';
import { render } from './ui.js';
export function buyItem(slot,lv,cls=rt.state.cls){let item=makeItem(lv,slot,cls,0);if(rt.state.gold<item.price)return;rt.state.gold-=item.price;statAdd('goldSpent',item.price);rt.state.items.push(item);save();render();}

export function buyPotion(type){let price=potionPrice(type);if(rt.state.gold<price)return;rt.state.gold-=price;statAdd('goldSpent',price);rt.state.consumables[type]=(rt.state.consumables[type]||0)+1;save();render();}

export function potionPrice(t){return {hp:25,mp:25,elixir:110,antidote:20}[t]*(mapId(rt.area)+1);}

export function sell(uid){let i=rt.state.items.findIndex(x=>x.uid===uid);if(i<0||Object.values(rt.state.equip).includes(uid))return;const received=Math.floor(rt.state.items[i].price*.45);rt.state.gold+=received;statAdd('goldEarned',received);rt.state.items.splice(i,1);save();render();}

export function sellMaterial(name){if(!rt.state.materials[name])return;rt.state.materials[name]--;const received=10*(mapId(rt.area)+1);rt.state.gold+=received;statAdd('goldEarned',received);save();render();}

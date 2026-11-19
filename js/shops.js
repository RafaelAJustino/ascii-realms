import { statAdd } from './progression.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { save } from './storage.js';
import { makeItem } from './equipment.js';
import {cityPrice,cityOffer,canBuyOffer,markOfferBought,forgeOrder,canForgeOrder,markForgeOrder} from './city-life.js';
import { render } from './ui.js';
export function buyItem(slot,lv,cls=rt.state.cls){if(rt.state.combat)return false;let item=makeItem(lv,slot,cls,0);const price=rt.screen==='city'?cityPrice(rt.state,mapId(rt.area),item.price):item.price;if(rt.state.gold<price)return false;rt.state.gold-=price;statAdd('goldSpent',price);rt.state.items.push(item);save();render();return true;}

export function buyPotion(type){if(rt.state.combat)return false;let price=rt.screen==='city'?cityPrice(rt.state,mapId(rt.area),potionPrice(type)):potionPrice(type);if(rt.state.gold<price)return false;rt.state.gold-=price;statAdd('goldSpent',price);rt.state.consumables[type]=(rt.state.consumables[type]||0)+1;save();render();return true;}

export function potionPrice(t){return {hp:25,mp:25,elixir:110,antidote:20}[t]*(mapId(rt.area)+1);}

export function sell(uid){let i=rt.state.items.findIndex(x=>x.uid===uid);if(i<0||Object.values(rt.state.equip).includes(uid))return;const received=Math.floor(rt.state.items[i].price*.45);rt.state.gold+=received;statAdd('goldEarned',received);rt.state.items.splice(i,1);save();render();}

export function sellMaterial(name){if(!rt.state.materials[name])return;rt.state.materials[name]--;const received=10*(mapId(rt.area)+1);rt.state.gold+=received;statAdd('goldEarned',received);save();render();}

/** Estoque especial limitado, com preço igual ao anunciado na interface. */
export function buyCityOffer(){if(!rt.state||rt.screen!=='city')return false;
 const region=mapId(rt.area);if(!canBuyOffer(rt.state,region))return false;
 const offer=cityOffer(rt.state,region),item=makeItem(offer.lv,offer.slot,rt.state.cls,offer.rarity,region);
 if(item.price!==offer.basePrice||!markOfferBought(rt.state,offer))return false;
 rt.state.gold-=offer.price;statAdd('goldSpent',offer.price);rt.state.items.push(item);rt.cityFeedback=`Estoque especial adquirido: ${item.name} por ${offer.price} ouro.`;save();render();return true;
}
/** Encomenda única regional que reutiliza o gerador de equipamentos existente. */
export function orderFromForge(){if(!rt.state||rt.screen!=='forge')return false;
 const region=mapId(rt.area);if(!canForgeOrder(rt.state,region))return false;
 const order=forgeOrder(rt.state,region);if(!markForgeOrder(rt.state,region))return false;
 const item=makeItem(order.level,order.slot,rt.state.cls,order.rarity,region);
 rt.state.gold-=order.gold;rt.state.materials[order.material]-=order.required;
 statAdd('goldSpent',order.gold);rt.state.items.push(item);
 rt.cityFeedback=`Encomenda concluída: ${item.name}.`;save();render();return true;
}

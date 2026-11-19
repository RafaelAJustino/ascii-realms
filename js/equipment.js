import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { stats } from './player.js';
import { save } from './storage.js';
import { render } from './ui.js';
export function makeItem(level,slot,cls=rt.state.cls,rarity=0,region=mapId(level)){region=Math.max(0,Math.min(9,region));let names=['Comum','Incomum','Raro','Épico','Lendário'],types={head:'Capacete',body:'Armadura',hands:'Luvas',feet:'Botas',ring:'Anel',amulet:'Amuleto'};let c=classes[cls],kind=slot==='weapon'?c.weapons[rand(0,c.weapons.length-1)]:types[slot],armor=slot==='head'||slot==='body'||slot==='hands'||slot==='feet'?rand(1,c.armor):0;let attrs={};attrs[A[rand(0,5)]]=Math.max(1,Math.floor(level*(.12+rarity*.08)));return {uid:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`,name:`${kind} ${['do Viajante','do Caçador','Rúnico','Ancestral','Divino'][rarity]} ${['Silvestre','Escarlate','do Pântano','de Ferro','das Ruínas','Glacial','Amaldiçoado','Ígneo','Celestial','do Vazio'][region]}`,slot,kind,region,armor,cls:slot==='weapon'?cls:null,lv:level,rarity,attrs,attack:slot==='weapon'&&cls!=='mago'?Math.floor(level*(1.5+rarity*.6)+5):0,magic:slot==='weapon'&&cls==='mago'?Math.floor(level*(1.8+rarity*.7)+5):0,def:['head','body','hands','feet'].includes(slot)?Math.floor(level*(.6+rarity*.2)+(slot==='body'?8:2)):0,md:slot==='amulet'?Math.floor(level*.5):0,crit:slot==='ring'?rarity+1:0,leech:rarity>=3&&slot==='weapon'?rarity:0,regen:rarity>=3&&slot==='amulet'?rarity:0,exp:rarity>=3&&slot==='ring'?rarity*2:0,boss:rarity>=4?10:0,price:Math.floor((level*13+25)*(1+rarity*.8))};}

export function validEquip(it){return rt.state.lv>=it.lv&&(!it.cls||it.cls===rt.state.cls)&&(!it.armor||it.armor<=classes[rt.state.cls].armor);}

export function equip(uid){let it=rt.state.items.find(x=>x.uid===uid);if(!it||!validEquip(it))return;rt.state.equip[it.slot]=uid;let s=stats();rt.state.hp=Math.min(rt.state.hp,s.maxhp);rt.state.mp=Math.min(rt.state.mp,s.maxmp);save();render();}

export function rollRarity(){let r=Math.random();return r<.6?0:r<.85?1:r<.96?2:r<.995?3:4;}

export function rarityName(n){return ['Comum','Incomum','Raro','Épico','Lendário'][n];}

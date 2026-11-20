import {equipmentDropBonus} from './attribute-milestones.js';
import {FORGE_MATERIALS} from './crafting.js';
import {ARTISAN_CATALYSTS} from './artisan-economy.js';
import { maps } from './data.js';
import { mapId } from './utils.js';
import { makeItem } from './equipment.js';
import { monsterRarity } from './monster-rarity.js';

// Tabelas locais: criaturas não podem conceder itens de regiões futuras.
export const dropProfiles = [
 {materials:['Pele de Lobo','Teia Resistente','Casca Viva'],equipment:['head','hands','feet']},
 {materials:['Quitina de Escorpião','Escama Desértica','Tecido Nômade'],equipment:['weapon','feet','ring']},
 {materials:['Glândula Tóxica','Lodo Concentrado','Erva Sombria'],equipment:['amulet','hands','body']},
 {materials:['Couro de Troll','Pena de Harpia','Engrenagem Antiga'],equipment:['body','head','weapon']},
 {materials:['Osso Antigo','Essência Espectral','Fragmento de Sentinela'],equipment:['weapon','amulet','ring']},
 {materials:['Pelo de Yeti','Pele Polar','Núcleo de Gelo'],equipment:['body','feet','amulet']},
 {materials:['Garra de Carniçal','Lamento Etéreo','Aço Maldito'],equipment:['weapon','head','ring']},
 {materials:['Chifre de Diabrete','Escama Ígnea','Cinza Ritual'],equipment:['weapon','hands','amulet']},
 {materials:['Fragmento Sagrado','Escama Quimérica','Insígnia Celestial'],equipment:['body','ring','amulet']},
 {materials:['Poeira Sombria','Carne do Vazio','Eco Cristalizado'],equipment:['weapon','amulet','ring']}
];
export function rewardFor(enemy, playerClass, firstBoss=false, random=Math.random, investedStats=null){
 const region=mapId(enemy.lv), profile=dropProfiles[region], species=enemy.speciesIndex??Math.max(0,maps[region].slice(3,6).indexOf(enemy.baseName||enemy.name));
 const materials={}, items=[], consumables={};
 // Materiais são a recompensa comum. Equipamentos são excepcionais.
 if(random()<(enemy.boss?1:.43)) materials[enemy.boss?maps[region][6]:profile.materials[species]]=enemy.boss?3:1;
 if(random()<(enemy.boss?1:.24))materials[FORGE_MATERIALS[region]]=(materials[FORGE_MATERIALS[region]]||0)+(enemy.boss?3:1);
 if(random()<(enemy.boss?.65:.13)) consumables[random()<.65?'hp':'mp']=1;
 const baseChance=enemy.boss?(firstBoss?1:.20):Math.min(.18,.045*monsterRarity(enemy.rarityId).drop);
 // Sorte aumenta apenas a chance de equipamento. O prêmio garantido do primeiro chefe não muda.
 const chance=firstBoss&&enemy.boss?baseChance:Math.min(enemy.boss?.25:.23,baseChance+equipmentDropBonus(investedStats));
 if(random()<chance){
   const slot=enemy.boss?['weapon','body','amulet'][Math.floor(random()*3)]:profile.equipment[species];
   const rarity=firstBoss?2+ (random()<.08?1:0):enemy.boss?(random()<.12?3:random()<.5?2:1):(random()<.015?2:random()<.20?1:0);
   const item=makeItem(enemy.lv,slot,playerClass,rarity,region);
   items.push(item);
 }
 // O catalisador pode ser obtido sem depender da loja. Chefes garantem duas unidades.
 if(enemy.boss)materials[ARTISAN_CATALYSTS[region]]=(materials[ARTISAN_CATALYSTS[region]]||0)+2;
 else if(random()<.16)materials[ARTISAN_CATALYSTS[region]]=(materials[ARTISAN_CATALYSTS[region]]||0)+1;
 return {materials,items,consumables};
}

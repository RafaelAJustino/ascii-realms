/**
 * Expansão Épica 6: catálogo estável de 220 modelos.
 * Blueprints são dados imutáveis, nunca inventários persistidos.
 * 10 regiões x (8 armas + 9 armaduras + 5 acessórios).
 */
import {classes} from './data.js';

const THEMES=[
 ['das Raízes','do Musgo','Silvestre'],['das Dunas','do Rubro','Escarlate'],
 ['do Lodo','da Névoa','Sombrio'],['da Forja','de Ferro','Ferrífero'],
 ['dos Sepulcros','das Ruínas','Antigo'],['da Geada','da Aurora','Glacial'],
 ['do Lamento','da Maldição','Profano'],['das Brasas','do Inferno','Ígneo'],
 ['da Alvorada','do Firmamento','Celestial'],['do Eclipse','do Vazio','Abissal']
];
const WEAPONS=[
 ['guerreiro','Espada','Lâmina de Vigília','offense'],
 ['guerreiro','Machado','Gume Rompedor','precision'],
 ['mago','Cajado','Cetro das Runas','sorcery'],
 ['mago','Grimório','Tomo do Oráculo','focus'],
 ['arqueiro','Arco','Arco do Vigia','offense'],
 ['arqueiro','Besta','Besta de Caçada','precision'],
 ['ladino','Adaga','Punhal do Crepúsculo','offense'],
 ['ladino','Lâmina Curta','Lâmina do Sussurro','precision']
];
const ARMOR=[
 ['body',1,'Gibão de Couro','evasion'],
 ['body',2,'Cota de Malha','balanced'],
 ['body',3,'Couraça de Placas','bulwark'],
 ['head',1,'Capuz do Rastreador','evasion'],
 ['head',3,'Elmo do Bastião','bulwark'],
 ['hands',2,'Manoplas do Artífice','balanced'],
 ['hands',3,'Luvas de Ferro','bulwark'],
 ['feet',1,'Botas do Passo Leve','evasion'],
 ['feet',2,'Grevas do Caminhante','balanced']
];
const ACCESSORIES=[
 ['ring','Anel da Mira','precision'],
 ['ring','Anel do Feitiço','sorcery'],
 ['ring','Anel da Fortuna','fortune'],
 ['amulet','Amuleto do Vigor','bulwark'],
 ['amulet','Talismã dos Ecos','focus']
];

function blueprint(region,category,index,slot,kind,name,style,cls,armor,offset){
 const level=Math.min(100,region*10+offset);
 return Object.freeze({id:`ep6-r${region}-${category}-${index}`,region,category,slot,kind,name:`${name} ${THEMES[region][(index+region)%3]}`,style,cls:cls||null,armor:armor||0,level});
}
export const EQUIPMENT_CATALOG=Object.freeze(Array.from({length:10},(_,region)=>[
 ...WEAPONS.map(([cls,kind,name,style],index)=>blueprint(region,'weapon',index,'weapon',kind,name,style,cls,0,index%2?7:3)),
 ...ARMOR.map(([slot,armor,name,style],index)=>blueprint(region,'armor',index,slot,({head:'Capacete',body:'Armadura',hands:'Luvas',feet:'Botas'})[slot],name,style,null,armor,[2,5,8,3,7,4,8,2,6][index])),
 ...ACCESSORIES.map(([slot,name,style],index)=>blueprint(region,'accessory',index,slot,slot==='ring'?'Anel':'Amuleto',name,style,null,0,[3,5,7,4,8][index]))
]).flat());
export const CATALOG_BY_ID=new Map(EQUIPMENT_CATALOG.map(item=>[item.id,item]));

export function catalogInRegion(region,category=null,cls=null){
 return EQUIPMENT_CATALOG.filter(item=>item.region===region&&(!category||item.category===category)&&(!cls||item.slot!=='weapon'||item.cls===cls));
}
export function catalogForShop(region,cls,category){return catalogInRegion(region,category,cls);}
export function selectCatalog(level,slot,cls,region){
 const possibilities=catalogInRegion(region,null,cls).filter(item=>item.slot===slot);
 if(!possibilities.length)return null;
 const accessible=possibilities.filter(item=>item.level<=level);
 const choices=accessible.length?accessible:possibilities;
 // Seleção previsível, incluindo um segundo modelo quando apropriado.
 return choices[Math.abs(Math.floor(level+region*3+slot.length))%choices.length];
}

const ATTR_PRIMARY={offense:'for',precision:'des',sorcery:'int',focus:'int',evasion:'agi',balanced:'des',bulwark:'vit',fortune:'sor'};
const cost=(level,rarity)=>Math.floor((level*13+25)*(1+rarity*.8));
export function createCatalogItem(model,rarity=0,level=model?.level){
 if(!model||!Number.isFinite(level))return null;
 level=Math.max(1,Math.min(100,Math.floor(level)));
 rarity=Math.max(0,Math.min(4,Math.floor(rarity)));
 const growth=Math.max(1,Math.floor(level*(.12+rarity*.08)));
 const style=model.style,body=model.slot==='body',armor=model.armor;
 const bonus={attack:0,magic:0,def:0,md:0,crit:0,dodge:0,hit:0,hp:0,mp:0,leech:0,regen:0,exp:0,boss:0};
 const power=Math.max(1,Math.floor(level*.1)+1),guard=Math.floor(level*(.6+rarity*.2))+(body?8:2);
 if(model.slot==='weapon'){
  if(model.cls==='mago')bonus.magic=Math.floor(level*(1.8+rarity*.7)+5);else bonus.attack=Math.floor(level*(1.5+rarity*.6)+5);
  if(style==='precision'){if(model.cls==='mago')bonus.magic=Math.floor(bonus.magic*.91);else bonus.attack=Math.floor(bonus.attack*.91);bonus.hit=2;bonus.crit=1;}
  if(style==='focus'){bonus.magic=Math.floor(bonus.magic*.91);bonus.mp=4+Math.floor(level*.08);}
  if(style==='sorcery')bonus.md=Math.max(1,Math.floor(level*.12));
  if(rarity>=3)bonus.leech=rarity;
 }else if(armor){
  if(armor===1){bonus.def=Math.floor(guard*.72);bonus.dodge=2;bonus.hit=1;}
  if(armor===2){bonus.def=Math.floor(guard*.92);bonus.crit=1;bonus.md=Math.max(1,Math.floor(level*.11));}
  if(armor===3){bonus.def=Math.floor(guard*1.25);bonus.hp=5+Math.floor(level*.25);bonus.dodge=-1;}
  // Melhorias menores coerentes com cada peça. Todas as classes recebem os mesmos efeitos.
  if(model.slot==='head'&&armor===1)bonus.mp=power;
  if(model.slot==='hands'&&armor===2)bonus.attack=power;
  if(model.slot==='feet'&&armor===2)bonus.hit=2;
 }else if(model.slot==='ring'){
  bonus.crit=style==='precision'?2+rarity:rarity+1;
  if(style==='precision')bonus.hit=2;
  if(style==='sorcery')bonus.magic=power*2;
  if(style==='fortune')bonus.exp=Math.min(6,2+rarity);
 }else if(model.slot==='amulet'){
  bonus.md=Math.max(1,Math.floor(level*.5));
  if(style==='bulwark')bonus.hp=6+Math.floor(level*.30);
  if(style==='focus'){bonus.mp=4+Math.floor(level*.25);bonus.regen=rarity>=2?1:0;}
 }
 if(rarity===4)bonus.boss=10;
 const attrs={[ATTR_PRIMARY[style]]:growth};
 return {uid:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,catalogId:model.id,
  name:model.name,kind:model.kind,slot:model.slot,region:model.region,armor:model.armor,cls:model.slot==='weapon'?model.cls:null,
  lv:level,rarity,attrs,attack:bonus.attack,magic:bonus.magic,def:bonus.def,md:bonus.md,crit:bonus.crit,
  dodge:bonus.dodge,hit:bonus.hit,hp:bonus.hp,mp:bonus.mp,leech:bonus.leech,regen:bonus.regen,
  exp:bonus.exp,boss:bonus.boss,price:cost(level,rarity)};
}

export function itemBonusesLabel(item){
 const statNames={attack:'ATQ',magic:'MAG',def:'DEF',md:'RES MAG',crit:'CRÍT',dodge:'ESQ',hit:'PREC',hp:'HP',mp:'MP',regen:'REG',exp:'EXP'};
 const parts=Object.entries(item.attrs||{}).map(([key,n])=>`${key.toUpperCase()} +${n}`);
 for(const [key,label] of Object.entries(statNames)){const value=item[key]||0;if(value)parts.push(`${label} ${value>0?'+':''}${value}`);}
 return parts.join(' · ');
}

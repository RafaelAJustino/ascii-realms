import assert from 'node:assert/strict';
import {classes} from '../js/data.js';
import {EQUIPMENT_CATALOG,CATALOG_BY_ID,catalogForShop,selectCatalog,createCatalogItem,itemBonusesLabel} from '../js/equipment-catalog.js';

// Contrato estável: 220 itens distintos, distribuídos por origem, classe e região.
assert.equal(EQUIPMENT_CATALOG.length,220);
assert.equal(new Set(EQUIPMENT_CATALOG.map(x=>x.id)).size,220);
assert.equal(new Set(EQUIPMENT_CATALOG.map(x=>x.name)).size,220);
assert.equal(EQUIPMENT_CATALOG.filter(x=>x.category==='weapon').length,80);
assert.equal(EQUIPMENT_CATALOG.filter(x=>x.category==='armor').length,90);
assert.equal(EQUIPMENT_CATALOG.filter(x=>x.category==='accessory').length,50);
for(let r=0;r<10;r++){
 assert.equal(catalogForShop(r,'guerreiro','armor').length,9);
 assert.equal(catalogForShop(r,'mago','armor').length,9);
 assert.equal(catalogForShop(r,'ladino','accessory').length,5);
 for(const cls of Object.keys(classes)){
  assert.equal(catalogForShop(r,cls,'weapon').length,2);
  for(const slot of ['weapon','head','body','hands','feet','ring','amulet']){
   const selected=selectCatalog(r*10+8,slot,cls,r);
   assert.ok(selected,`r${r} ${cls} ${slot}`);
   if(slot==='weapon')assert.equal(selected.cls,cls);
  }
 }
 const armor=EQUIPMENT_CATALOG.filter(x=>x.region===r&&x.category==='armor');
 assert.deepEqual(new Set(armor.filter(x=>x.slot==='body').map(x=>x.armor)),new Set([1,2,3]));
}
for(const b of EQUIPMENT_CATALOG){
 assert.equal(CATALOG_BY_ID.get(b.id),b);
 assert.ok(b.level>=1&&b.level<=100);
 const a=createCatalogItem(b),c=createCatalogItem(b);
 assert.equal(a.catalogId,b.id);assert.equal(a.name,b.name);
 assert.equal(a.price,c.price);assert.deepEqual(a.attrs,c.attrs);
 assert.notEqual(a.uid,c.uid);
 assert.ok(itemBonusesLabel(a));
 for(const stat of ['attack','magic','def','md','crit','dodge','hit','hp','mp'])assert.ok(Number.isFinite(a[stat]));
}

// Grupo de atributos não é apenas cosmético: defesa elevada troca esquiva por HP.
const grades=[1,2,3].map(armor=>EQUIPMENT_CATALOG.find(x=>x.region===0&&x.slot==='body'&&x.armor===armor)).map(x=>createCatalogItem(x));
assert.ok(grades[0].dodge>grades[1].dodge);
assert.ok(grades[2].def>grades[0].def);
assert.ok(grades[2].hp>grades[0].hp);
assert.ok(grades[1].md>0&&grades[1].crit>0);

// Teste de integração com criação, loja, cálculo real, equipar e salvar.
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app={innerHTML:'',querySelector(){return null;},querySelectorAll(){return []},addEventListener(){}};
globalThis.document={querySelector:s=>s==='#app'?app:null,createElement(){return {style:{},getBoundingClientRect(){return {width:600}},remove(){}}}};
globalThis.window={addEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
const {rt}=await import('../js/runtime.js');
const {newGame,stats}=await import('../js/player.js');
const {validEquip,makeItem,equip}=await import('../js/equipment.js');
const {buyCatalogItem}=await import('../js/shops.js');
const {cityPrice}=await import('../js/city-life.js');
const {store:shopUI}=await import('../js/ui.js');
const {save,load}=await import('../js/storage.js');
const {renderHeroAvatar}=await import('../js/hero-avatar.js');

newGame('Catálogo Épico','mago');
rt.screen='city';rt.shop='armor';rt.area=1;rt.state.lv=100;rt.state.gold=100000;
rt.state.cityLife.reputation[0]=55;
const [light,medium,heavy]=grades;
for(const piece of [light,medium,heavy]){
 assert.equal(validEquip(piece),true,'magos podem usar qualquer armadura');
}
const weaponOther=createCatalogItem(catalogForShop(0,'guerreiro','weapon')[0]);
assert.equal(validEquip(weaponOther),false,'armas continuam restritas');
const mageWeapon=createCatalogItem(catalogForShop(0,'mago','weapon')[0]);
assert.equal(validEquip(mageWeapon),true);
const item=EQUIPMENT_CATALOG.find(x=>x.region===0&&x.slot==='body'&&x.armor===3);
const actual=createCatalogItem(item);
const expected=cityPrice(rt.state,0,actual.price);
assert.match(shopUI(),new RegExp(`buyCatalog:${item.id}`));
assert.match(shopUI(),new RegExp(`${expected} Ouro`));
const before=rt.state.gold;
assert.equal(buyCatalogItem(item.id),true);
assert.equal(rt.state.gold,before-expected);
const bought=rt.state.items.at(-1);
assert.equal(bought.catalogId,item.id);
assert.equal(bought.name,actual.name);
const unequipped=stats();equip(bought.uid);const equipped=stats();
assert.ok(equipped.maxhp>unequipped.maxhp&&equipped.def>unequipped.def);
assert.ok(equipped.dodge<unequipped.dodge);
const avatar=renderHeroAvatar(rt.state);
assert.match(avatar,/avatar-body-common/);
for(const grade of [1,2,3]){
 const b=createCatalogItem(EQUIPMENT_CATALOG.find(x=>x.region===0&&x.slot==='body'&&x.armor===grade),grade);
 rt.state.items.push(b);rt.state.equip.body=b.uid;
 const art=renderHeroAvatar(rt.state);
 assert.match(art,new RegExp(`avatar-body-${['common','uncommon','rare','epic','legendary'][grade]}`));
}
rt.state.equip.body=bought.uid;
assert.equal(buyCatalogItem('fabricated-identifier'),false);
assert.equal(buyCatalogItem(catalogForShop(1,'mago','armor')[0].id),false,'região futura não disponível');
assert.equal(buyCatalogItem(catalogForShop(0,'guerreiro','weapon')[0].id),false,'arma não permitida');
const preservedGold=rt.state.gold;
rt.state.lv=1;
assert.equal(buyCatalogItem(item.id),false,'nível insuficiente');
rt.state.lv=100;
rt.state.gold=0;assert.equal(buyCatalogItem(item.id),false,'ouro insuficiente');
assert.equal(rt.state.gold,0);
rt.state.gold=preservedGold;
rt.state.equip.body=bought.uid;
save();rt.state=null;
assert.equal(load(),true);
assert.equal(rt.state.items.find(x=>x.uid===bought.uid).catalogId,item.id);
assert.equal(rt.state.equip.body,bought.uid);
assert.ok(stats().maxhp>0);
// Migração: equipamentos antigos sem catalogId continuam utilizáveis.
const legacy={uid:'legacy-armor',name:'Armadura Original',slot:'body',armor:3,rarity:2,lv:1,attrs:{vit:2},def:8,price:40};
rt.state.items.push(legacy);
assert.equal(validEquip(legacy),true);
assert.ok(makeItem(15,'weapon','mago',2,1).catalogId);
console.log('OK: 220 modelos únicos, 4 classes x 3 armaduras, restrições de armas, categorias, atributos, preços reais, compra, avatar e salvamentos.');

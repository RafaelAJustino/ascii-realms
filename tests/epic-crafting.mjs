import assert from 'node:assert/strict';
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const app={innerHTML:'',querySelector(){return null},querySelectorAll(){return []}};
globalThis.document={querySelector:k=>k==='#app'?app:null};
globalThis.window={addEventListener(){}};
globalThis.requestAnimationFrame=f=>f();
const {rt}=await import('../js/runtime.js');
const {newGame}=await import('../js/player.js');
const {recipes,craft,refineMaterial,FORGE_MATERIALS}=await import('../js/crafting.js');
const {ARTISAN_CATALYSTS,artisanRecipes,refiningCost,materialMarket,materialBuyOffer,materialSaleValue}=await import('../js/artisan-economy.js');
const {CATALOG_BY_ID}=await import('../js/equipment-catalog.js');
const {maps,KEY}=await import('../js/data.js');
const {rewardFor}=await import('../js/loot.js');
const {buyMaterial,sellMaterial}=await import('../js/shops.js');
const {save,load}=await import('../js/storage.js');

const classes=['guerreiro','mago','arqueiro','ladino'];
assert.equal(ARTISAN_CATALYSTS.length,10);
assert.equal(new Set(ARTISAN_CATALYSTS).size,10);
for(const cls of classes){
 let count=0;
 for(let region=0;region<10;region++){
  const entries=artisanRecipes(region,cls),all=recipes(region,cls);
  assert.equal(entries.length,9);assert.equal(all.length,18);count+=all.length;
  assert.equal(new Set(all.map(x=>x.id)).size,18,'IDs únicos por região');
  assert.equal(entries.filter(x=>x.modelId).length,8);
  assert.equal(entries.filter(x=>x.slot==='weapon').length,2);
  assert.equal(entries.filter(x=>x.consumable).length,1);
  for(const recipe of entries){
   assert.ok(recipe.gold>0&&recipe.level>=1&&recipe.level<=100);
   if(!recipe.modelId)continue;
   const model=CATALOG_BY_ID.get(recipe.modelId);
   assert.ok(model);assert.equal(model.region,region);
   assert.equal(recipe.level,model.level);
   if(model.slot==='weapon')assert.equal(model.cls,cls);
   assert.ok(recipe.materials[ARTISAN_CATALYSTS[region]]>=1);
  }
  const stock=materialMarket(region),refine=refiningCost(region);
  assert.equal(stock.length,3);assert.equal(new Set(stock.map(x=>x.name)).size,3);
  for(const entry of stock){
   assert.deepEqual(materialBuyOffer(region,entry.name),entry);
   assert.equal(materialSaleValue(entry.name,region),entry.sell);
   assert.ok(Math.floor(entry.price*.85)>entry.sell,'sem arbitragem mesmo com reputação máxima');
  }
  assert.equal(refine.result,ARTISAN_CATALYSTS[region]);
 }
 assert.equal(count,180,`${cls}: 180 receitas por personagem em 10 regiões`);
}
assert.equal(artisanRecipes(-1,'mago').length,0);
assert.equal(materialMarket(10).length,0);

newGame('Alquimista','mago');
rt.state.gold=100000;rt.state.lv=100;rt.area=1;rt.screen='forge';
const [mat,forge,catalyst]=[maps[0][6],FORGE_MATERIALS[0],ARTISAN_CATALYSTS[0]];
rt.state.materials[mat]=100;rt.state.materials[forge]=100;
const refine=refiningCost(0),gold0=rt.state.gold;
assert.equal(refineMaterial(),true);
assert.equal(rt.state.gold,gold0-refine.gold);
assert.equal(rt.state.materials[catalyst],1);
assert.equal(rt.state.materials[forge],98);
assert.equal(rt.state.materials[mat],99);
const first=artisanRecipes(0,'mago')[0];assert.ok(first.modelId);
const gold1=rt.state.gold;
assert.equal(craft(first.id),true);
assert.equal(rt.state.gold,gold1-first.gold);
assert.equal(rt.state.items[0].catalogId,first.modelId);
assert.equal(rt.state.items[0].rarity,first.rarity);
assert.equal(rt.state.items[0].cls,'mago');
assert.equal(rt.state.materials[catalyst],0);
assert.equal(craft(first.id),false,'sem catalisador não deve fabricar');
assert.equal(craft(artisanRecipes(0,'guerreiro')[0].id),false,'armas de outra classe bloqueadas');
assert.equal(craft(artisanRecipes(1,'mago')[0].id),false,'receitas de outra região bloqueadas');
const provisions=artisanRecipes(0,'mago').at(-1),oldItems=rt.state.items.length;
const {hp,mp}=rt.state.consumables;
assert.equal(craft(provisions.id),true);
assert.equal(rt.state.consumables.hp,hp+2);
assert.equal(rt.state.consumables.mp,mp+1);
assert.equal(rt.state.items.length,oldItems);
rt.screen='world';assert.equal(refineMaterial(),false,'refino apenas na ferraria');
rt.screen='city';
const offer=materialBuyOffer(0,catalyst);const buyGold=rt.state.gold;
assert.equal(buyMaterial(catalyst),true);
assert.equal(rt.state.gold,buyGold-offer.price);
assert.equal(rt.state.materials[catalyst],1);
const saleGold=rt.state.gold;
assert.equal(sellMaterial(catalyst),true);
assert.equal(rt.state.gold,saleGold+offer.sell);
assert.ok(rt.state.gold<buyGold,'compra e revenda geram perda');
assert.equal(buyMaterial(ARTISAN_CATALYSTS[1]),false,'sem importação de regiões bloqueadas');
rt.state.gold=0;assert.equal(buyMaterial(catalyst),false,'saldo insuficiente');
const boss=rewardFor({lv:10,boss:true},'mago',true,()=>.99);
assert.equal(boss.materials[catalyst],2);
const regular=rewardFor({lv:1,boss:false,speciesIndex:1},'mago',false,()=>0);
assert.equal(regular.materials[catalyst],1);
const noDrop=rewardFor({lv:1,boss:false,speciesIndex:1},'mago',false,()=>.99);
assert.equal(noDrop.materials[catalyst],undefined);
save();rt.state=null;
assert.equal(load(),true);assert.equal(rt.state.version,14);
assert.equal(rt.state.items[0].catalogId,first.modelId);
assert.equal(rt.state.materials[catalyst],0);
assert.equal(JSON.parse(storage.get(KEY)).version,14);
console.log('OK: 180 receitas por classe, 10 catalisadores, fabricar modelo exato, refino, consumíveis, drops, comércio sem arbitragem, bloqueios e persistência v14.');

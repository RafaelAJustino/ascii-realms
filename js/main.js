import {rememberMenu,previousMenu,clearMenuHistory,fallbackMenu} from './menu-history.js';
import {setTitle,ACHIEVEMENT_BY_ID} from './achievements.js';
import {evolveWeapon as evolveSpecialWeapon} from './weapon-evolution.js';
import {selectSkillVariant} from './skill-variants.js';
import {enterDungeon,abandonDungeon,dungeonAction,advanceDungeon,dungeonState} from './dungeons.js';
import {chooseSpec} from './specializations.js';
import {craft,enhance} from './crafting.js';
import { acceptQuest,deliverQuest,claimQuest,statAdd } from './progression.js';
import { rt } from './runtime.js';
import { classes, KEY } from './data.js';
import { load, save } from './storage.js';
import { newGame, stats } from './player.js';
import { equip } from './equipment.js';
import { act, combat } from './combat.js';
import {setCombatSpeed} from './combat-speed.js';
import { explore, changeArea,openPaths,selectPath,returnToHome,chooseEventOption,openCamp,leaveCamp,campRest,campUsePotion } from './exploration.js';
import {activeJourney,endJourney,addJourneyLog} from './journey-paths.js';
import { buyItem, buyPotion, sell, sellMaterial, buyCityOffer, orderFromForge } from './shops.js';
import {talkToNpc,hearRumor,answerQuiz} from './city-life.js';
import {mapId} from './utils.js';
import { render, updateHeroDistribution } from './ui.js';
import { validateArtRegistry } from './ascii-validator.js';
import { perform } from './operations.js';
import {changeDraft,discardDraft,applyDraft,confirmLeave} from './hero-distribution.js';
const app=rt.app;const $=selector=>document.querySelector(selector);
app.addEventListener('click',ev=>{let b=ev.target.closest('button[data-action]');if(!b||b.disabled||rt.busy)return;let [action,p,q]=b.dataset.action.split(':');
if(action==='menuBack'){
  if(rt.screen==='paths'){rt.screen='world';render();return;}
  if(rt.screen==='journey'){returnToHome();return;}
  if(rt.screen==='camp'){leaveCamp();return;}
  if(rt.screen==='merchant'&&activeJourney(rt.state)){rt.screen='journey';render();return;}
  if(rt.screen==='character'&&!confirmLeave(confirm))return;
  const previous=previousMenu();
  const destination=previous?.screen||fallbackMenu(rt.screen);
  if(dungeonState(rt.state).attempt&&!['dungeon','dungeons','inventory','skills','character','specializations'].includes(destination))return;
  rt.screen=destination;
  if(previous?.shop)rt.shop=previous.shop;
  render();
  if(previous){const content=rt.app.querySelector('.content');if(content)content.scrollTop=Math.min(previous.scroll,Math.max(0,content.scrollHeight-content.clientHeight));}
  return;
}
if(['nav','world','city','maps','shop','create'].includes(action))rt.cityFeedback='';
if(['nav','world','city','maps','shop','create'].includes(action)){
  const destination=action==='nav'?p:action==='shop'?rt.screen:action==='create'?'create':action;
  if(destination!==rt.screen||action==='shop')rememberMenu(rt.screen,rt.shop,rt.app.querySelector('.content')?.scrollTop||0);
}
if(action==='create'){rt.screen='create';render();}else if(action==='continue'){if(load()){rt.returnScreen='world';render();}else alert('Salvamento inválido.');}else if(action==='delete'){if(confirm('Excluir todo o progresso?')){clearMenuHistory();localStorage.removeItem(KEY);rt.state=null;rt.screen='home';render();}}else if(action==='start'){let name=$('#hero-name').value.trim(),cls=$('#hero-class').value;if(name)newGame(name,cls);}else if(action==='craft'&&dungeonState(rt.state).attempt)return;else if(action==='craft')perform(()=>craft(p));else if(action==='enhance'&&dungeonState(rt.state).attempt)return;else if(action==='enhance')perform(()=>enhance(p));else if(action==='titleEquip')perform(()=>{if(setTitle(rt.state,p==='clear'?'':p)){save();render();}});else if(action==='skillVariant')perform(()=>{if(selectSkillVariant(rt.state,Number(p),q)){save();render();}});else if(action==='evolveWeapon')perform(()=>{if(evolveSpecialWeapon(rt.state,p)){rt.evolutionFeedback='Arma evoluída! O novo estágio já está ativo.';save();render();}});else if(action==='chooseSpec')perform(()=>{if(chooseSpec(rt.state,p)){save();render();}});else if(action==='dungeonEnter')perform(()=>enterDungeon(+p));else if(action==='dungeonAbandon')perform(()=>abandonDungeon());else if(action==='dungeonAction')perform(()=>dungeonAction());else if(action==='dungeonAdvance')perform(()=>advanceDungeon());else if(action==='questAccept')perform(()=>acceptQuest(p));else if(action==='questDeliver')perform(()=>deliverQuest(p));else if(action==='questClaim')perform(()=>claimQuest(p));else if(action==='nav'){if(rt.screen==='character'&&p!=='character'&&!confirmLeave(confirm))return;if(dungeonState(rt.state).attempt&&!['dungeon','dungeons','inventory','skills','character','specializations'].includes(p))return;rt.returnScreen=rt.screen==='city'?'city':rt.screen==='player'?'player':rt.screen==='world'?'world':(rt.returnScreen||'world');rt.screen=p==='dungeons'&&dungeonState(rt.state).attempt?'dungeon':p;render();}else if(action==='area'){if(!dungeonState(rt.state).attempt)changeArea(+p);}else if(action==='explore'){if(!dungeonState(rt.state).attempt)openPaths();}else if(action==='pathSelect'){if(!dungeonState(rt.state).attempt)selectPath(p);}else if(action==='journeyContinue'){if(!dungeonState(rt.state).attempt)explore();}else if(action==='journeyCity'){if(!dungeonState(rt.state).attempt)returnToHome();}else if(action==='journeyChoice'){chooseEventOption(p,q);}else if(action==='journeyCamp'){openCamp();}else if(action==='campLeave'){leaveCamp();}else if(action==='campRest')perform(()=>campRest());else if(action==='campPotion')perform(()=>campUsePotion(p));else if(action==='journeyReturn'){if(activeJourney(rt.state)){rt.screen='journey';render();}}else if(action==='boss'){if(!dungeonState(rt.state).attempt)combat(true);}else if(action==='world'||action==='city'||action==='maps'){if(rt.screen==='character'&&!confirmLeave(confirm))return;if(dungeonState(rt.state).attempt)return;rt.returnScreen=rt.screen==='city'?'city':'world';rt.screen=action;render();}else if(action==='attrPlus'||action==='attrMinus'){if(rt.screen==='character'&&changeDraft(rt.state,+p,action==='attrPlus'?1:-1)){rt.heroFeedback='Distribuição provisória. Nenhuma alteração foi salva.';updateHeroDistribution();}}else if(action==='attrDiscard'){discardDraft();rt.heroFeedback='Alterações provisórias descartadas.';updateHeroDistribution();}else if(action==='attrApply')perform(()=>{if(applyDraft(rt.state)){rt.heroFeedback='Pontos aplicados e salvos com sucesso.';render();}},()=>rt.screen==='character');else if(action==='filter'){rt.filter=p;render();}else if(action==='equip')perform(()=>equip(p));else if(action==='unequip')perform(()=>{rt.state.equip[p]=null;save();render();},()=>rt.state&&Object.hasOwn(rt.state.equip,p)&&rt.state.equip[p]!==null);else if(action==='sell'&&dungeonState(rt.state).attempt)return;else if(action==='sell')perform(()=>sell(p));else if(action==='material'&&dungeonState(rt.state).attempt)return;else if(action==='material')perform(()=>sellMaterial(decodeURIComponent(p)));else if(action==='tavernTalk')perform(()=>{if(rt.screen!=='tavern'||rt.state.combat)return;const outcome=talkToNpc(rt.state,mapId(rt.area),p);if(!outcome)return;rt.cityFeedback=outcome.message+(outcome.gold?` Recompensa única: ${outcome.gold} ouro.`:'')+(outcome.received?` Recompensa única: ${outcome.received} poção.`:'');if(outcome.gold)statAdd('goldEarned',outcome.gold);if(outcome.received)statAdd('itemsFound',outcome.received);save();render();});
 else if(action==='tavernRumor')perform(()=>{if(rt.screen!=='tavern'||rt.state.combat)return;const rumor=hearRumor(rt.state,mapId(rt.area));if(!rumor)return;rt.cityFeedback=rumor;save();render();});
 else if(action==='tavernQuiz')perform(()=>{if(rt.screen!=='tavern'||rt.state.combat)return;const result=answerQuiz(rt.state,mapId(rt.area),Number(p));if(!result)return;rt.cityFeedback=result.correct?'Acertou! Você recebeu 12 ouro e 3 pontos de reputação.':`Resposta: ${result.answer}. Você poderá tentar novamente em outra cidade.`;if(result.gold)statAdd('goldEarned',result.gold);save();render();});
 else if(action==='tavernContract')perform(()=>{if(rt.screen==='tavern'&&!rt.state.combat){const questBefore=rt.state.quests.active[p];if(!questBefore)rt.cityFeedback='Contrato disponível no registro de missões.';acceptQuest(p);}});
 else if(action==='cityOffer')perform(()=>buyCityOffer());
 else if(action==='forgeOrder')perform(()=>orderFromForge());
 else if(action==='shop'){if(dungeonState(rt.state).attempt)return;rt.shop=p;render();}else if(action==='buy'&&dungeonState(rt.state).attempt)return;else if(action==='buy')perform(()=>buyItem(p,+q));else if(action==='buyPotion'&&dungeonState(rt.state).attempt)return;else if(action==='buyPotion')perform(()=>buyPotion(p));else if(action==='rest'&&!dungeonState(rt.state).attempt&&rt.state.gold>=20){rt.state.gold-=20;statAdd('goldSpent',20);let s=stats();rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;save();render();}else if(action==='use'&&rt.state.consumables[p]>0){let s=stats();if(p==='hp')rt.state.hp=Math.min(s.maxhp,rt.state.hp+Math.ceil(s.maxhp*.45));else if(p==='mp')rt.state.mp=Math.min(s.maxmp,rt.state.mp+Math.ceil(s.maxmp*.45));else if(p==='elixir'){rt.state.hp=s.maxhp;rt.state.mp=s.maxmp;}else return;rt.state.consumables[p]--;save();render();}else if(action==='combatSpeed'){if(setCombatSpeed(p))render();}else if(action==='submenu'){rt.sub=p;render();}else if(action==='spec')act('spec',+p);else if(action==='attack'||action==='flee')act(action);else if(action==='skill'||action==='potion')act(action,action==='skill'?+p:p);});
if(typeof location!=='undefined' && (/^(localhost|127\.0\.0\.1)$/.test(location.hostname))) validateArtRegistry({warn:true});
render();

// Contabiliza somente tempo ativo e visível; não presume tempo anterior à atualização.
let lastTick=Date.now();setInterval(()=>{const now=Date.now();const elapsed=Math.min(5,Math.floor((now-lastTick)/1000));lastTick=now;if(rt.state&&document.visibilityState!=='hidden'&&elapsed>0){statAdd('playTimeSeconds',elapsed);save();}},1000);

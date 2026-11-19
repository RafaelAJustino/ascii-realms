// Etapa 1: eventos persistentes e decisões de exploração.
// Nenhuma recompensa de evento único pode ser obtida duas vezes.
import {rt} from './runtime.js';
import {stats} from './player.js';
import {save} from './storage.js';
import {render} from './ui.js';
import {combat} from './combat.js';
import {statAdd} from './progression.js';
import {maps} from './data.js';
import {mapId,escape} from './utils.js';
import {btn,panel} from './ui-helpers.js';

export const EVENTS=[
 {id:'traveler',title:'Viajante ferido',story:'Um viajante pede ajuda na estrada.',choices:[['help','Oferecer uma poção de vida'],['guide','Indicar o caminho seguro']]},
 {id:'altar',title:'Altar abandonado',story:'Inscrições antigas brilham entre as pedras.',choices:[['pray','Meditar diante do altar'],['leave','Não tocar no altar']]},
 {id:'chest',title:'Baú suspeito',story:'Um baú fechado repousa ao lado da trilha.',choices:[['open','Abrir com cautela'],['leave','Deixar o baú intacto']]},
 {id:'captive',title:'Criatura aprisionada',story:'Uma criatura indefesa está presa em uma armadilha.',choices:[['free','Libertar a criatura'],['leave','Seguir viagem']]},
 {id:'caravan',title:'Caravana atacada',story:'Carroças danificadas bloqueiam a estrada.',choices:[['search','Procurar suprimentos'],['leave','Evitar o local']]},
 {id:'ruins',title:'Ruínas antigas',story:'As ruínas escondem inscrições sobre esta região.',choices:[['study','Estudar as inscrições'],['leave','Continuar']]},
 {id:'bridge',title:'Ponte destruída',story:'Uma ponte caiu sobre um rio agitado.',choices:[['cross','Tentar atravessar'],['leave','Procurar outro caminho']]},
 {id:'spring',title:'Fonte misteriosa',story:'Uma nascente de águas claras surge entre as árvores.',choices:[['drink','Beber da fonte'],['leave','Ignorar a fonte']]},
 {id:'camp',title:'Acampamento abandonado',story:'Restos de uma fogueira indicam uma partida apressada.',choices:[['search','Investigar o acampamento'],['leave','Não se aproximar']]},
 {id:'merchant',title:'Mercador perdido',story:'Um mercador procura a estrada que leva à cidade.',choices:[['guide','Ajudar a encontrar a cidade'],['leave','Seguir sozinho']]}
];
export function journey(s=rt.state){if(!s)return null;s.journey??={step:0,seen:[],pending:null,campAt:-5,notes:[]};return s.journey;}
export function availableEvents(s=rt.state){const j=journey(s);return EVENTS.filter(e=>!j.seen.includes(e.id));}
export function startEvent(random=Math.random){const choices=availableEvents();if(!choices.length)return false;const event=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];journey().pending=event.id;rt.screen='event';save();render();return true;}
export function eventUI(){const j=journey(),event=EVENTS.find(e=>e.id===j.pending);if(!event)return panel('JORNADA','<p>Nenhum evento pendente.</p>'+btn('Voltar ao mapa','world'));return panel(event.title.toUpperCase(),`<p>${escape(event.story)}</p><p class="small muted">Escolha uma ação. Esta descoberta é única.</p><div class="journey-actions">${event.choices.map(([id,label])=>btn(escape(label),`eventChoice:${id}`)).join('')}</div>`);}
export function chooseEvent(choice){const j=journey(),e=EVENTS.find(x=>x.id===j?.pending);if(!e||j.seen.includes(e.id)||!e.choices.some(([id])=>id===choice))return false;
 const s=rt.state,st=stats();let message='Você prosseguiu sem interferir.';
 const gift=(amount)=>{s.gold+=amount;statAdd('goldEarned',amount);message=`Você recebeu ${amount} ouro.`;};
 const heal=(hp,mp=0)=>{const before=s.hp,oldMp=s.mp;s.hp=Math.min(st.maxhp,s.hp+hp);s.mp=Math.min(st.maxmp,s.mp+mp);message=`Recuperou ${s.hp-before} HP e ${s.mp-oldMp} MP.`;};
 const hurt=(ratio)=>{const damage=Math.max(1,Math.ceil(st.maxhp*ratio));s.hp=Math.max(1,s.hp-damage);statAdd('damageTaken',damage);message=`Você perdeu ${damage} HP.`;};
 const material=()=>{const name=maps[mapId(rt.area)][6];s.materials[name]=(s.materials[name]||0)+1;statAdd('itemsFound');message=`Você encontrou 1 ${name}.`;};
 switch(`${e.id}:${choice}`){
 case 'traveler:help':if(s.consumables.hp>0){s.consumables.hp--;gift(15);}else message='Você não possui poção de vida para oferecer.';break;
 case 'traveler:guide':case 'merchant:guide':gift(10);break;
 case 'altar:pray':case 'ruins:study':heal(0,Math.ceil(st.maxmp*.15));break;
 case 'chest:open':case 'caravan:search':case 'camp:search':material();break;
 case 'captive:free':heal(Math.ceil(st.maxhp*.12));break;
 case 'bridge:cross':hurt(.08);break;
 case 'spring:drink':heal(Math.ceil(st.maxhp*.2),Math.ceil(st.maxmp*.1));break;
 }
 j.seen.push(e.id);j.pending=null;j.notes.unshift(`${e.title}: ${message}`);j.notes=j.notes.slice(0,12);rt.log=[`${e.title}. ${message}`];rt.screen='result';save();render();return true;
}
export function pathsUI(){return panel('ESCOLHER CAMINHO',`<p class="muted">O caminho altera apenas o risco desta exploração. Não desbloqueia áreas.</p><div class="journey-actions">${btn('> CAMINHO SEGURO','path:safe')}${btn('> TRILHA DESCONHECIDA','path:normal')}${btn('> PASSAGEM PERIGOSA','path:risky')}</div>`);}
export function campUI(){const j=journey(),remaining=Math.max(0,5-(j.step-j.campAt));return panel('ACAMPAMENTO',`<p>Explorações realizadas: ${j.step}</p><p class="muted">Descansar custa 10 ouro e pode ser repetido após 5 explorações. Há 10% de chance de emboscada.</p>${btn('Descansar (10 ouro)','campRest',remaining>0||rt.state.gold<10||!!rt.state.combat)}<p class="small muted">${remaining?`Aguarde ${remaining} explorações para descansar novamente.`:'Descanso disponível.'}</p><div class="journey-actions">${btn('Usar poção de vida','campUse:hp',rt.state.consumables.hp<=0)}${btn('Usar poção de mana','campUse:mp',rt.state.consumables.mp<=0)}${btn('Usar elixir','campUse:elixir',rt.state.consumables.elixir<=0)}</div><h4>Diário da jornada</h4>${j.notes.map(n=>`<p class="small muted">${escape(n)}</p>`).join('')||'<p class="small muted">Nenhuma descoberta registrada.</p>'}`);}
export function restCamp(random=Math.random){const j=journey(),s=rt.state;if(!j||s.combat||s.gold<10||j.step-j.campAt<5)return false;const st=stats();s.gold-=10;statAdd('goldSpent',10);s.hp=Math.min(st.maxhp,s.hp+Math.ceil(st.maxhp*.25));s.mp=Math.min(st.maxmp,s.mp+Math.ceil(st.maxmp*.25));j.campAt=j.step;j.notes.unshift('Descanso no acampamento: HP e MP parcialmente recuperados.');save();if(random()<.1){rt.log=['Uma emboscada interrompe o descanso!'];combat();}else{render();}return true;}
export function useCampPotion(type){const s=rt.state;if(!['hp','mp','elixir'].includes(type)||!s||s.combat||!(s.consumables[type]>0))return false;const st=stats();if(type==='hp')s.hp=Math.min(st.maxhp,s.hp+Math.ceil(st.maxhp*.45));if(type==='mp')s.mp=Math.min(st.maxmp,s.mp+Math.ceil(st.maxmp*.45));if(type==='elixir'){s.hp=st.maxhp;s.mp=st.maxmp;}s.consumables[type]--;save();render();return true;}

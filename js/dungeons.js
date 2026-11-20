import { maps } from './data.js';
import { enemy } from './monsters.js';
import { makeItem } from './equipment.js';
import { stats, gainXp } from './player.js';
import { statAdd } from './progression.js';
import { rt } from './runtime.js';
import { save } from './storage.js';
import { render } from './ui.js';
import {resetCombatVisualState} from './combat-visual-state.js';
import {cancelCombatVisuals} from './combat-visuals.js';
import {stopCreatureAnimation} from './ascii-animation.js';

const NAMES=['Cripta das Raízes','Tumba Rubra','Covil das Toxinas','Forja Subterrânea','Catacumbas Perdidas','Caverna do Inverno','Sepulcro Maldito','Caldeira Infernal','Templo da Aurora','Fenda Primordial'];
const BOSSES=['Coração Enraizado','Matriarca de Areia','Devorador Tóxico','Colosso Ferrífero','Sentinela do Túmulo','Titã de Geada','Arauto das Cinzas Mortas','Fornalha Viva','Juiz da Aurora','Núcleo do Nada'];
export const DUNGEON_BOSS_ART=Object.fromEntries(BOSSES.map((name,i)=>[name,String.raw`          /\___/\
      ___/  ${['##','~~','++','^^','**'][i%5]}  \___
     /   (o)    (o)   \
    /  /\   /\   /\  \
   |  /  \_/  \_/  \  |
    \____/ |  | \____/
        /__|  |__\
       /___/  \___/`]));
export const DUNGEONS=maps.map((m,region)=>({id:`dungeon-${region}`,region,name:NAMES[region],description:`Uma expedição perigosa nas profundezas de ${m[0]}.`,level:region*10+8,boss:BOSSES[region],species:m.slice(3,6),art:`        /\\          /\\\n   ____/  \\________/  \\____\n  /  _    ${String(region+1).padStart(2,'0')}  [####]    _  \\\n /__/ \\___   ____   ___/ \\__\\\n |  | |   | |    | |   |  |\n |__|_|___|_|____|_|___|__|\n       /_/        \\_\\` }));
export const dungeonState=s=>{s.dungeons??={};s.dungeons.completed??=[];s.dungeons.rewards??=[];s.dungeons.best??={};s.dungeons.attempt??=null;return s.dungeons;};
export function dungeonAvailable(s,d){return s.lv>=d.level&&(d.region===0||s.bosses.includes(d.region-1));}
export function enterDungeon(region){const s=rt.state,d=DUNGEONS[region];if(!s||!d||s.combat||dungeonState(s).attempt||!dungeonAvailable(s,d))return false;dungeonState(s).attempt={id:d.id,room:1,roomResolved:false};rt.screen='dungeon';save();render();return true;}
export function abandonDungeon(){const s=rt.state;if(!s||s.combat||!dungeonState(s).attempt)return false;dungeonState(s).attempt=null;rt.screen='city';save();render();return true;}
export function dungeonEnemy(d,room){const level=Math.min(100,d.level+(room===5?1:0));const e=enemy(level,false);e.baseName=room===5?d.boss:d.species[e.speciesIndex%3];e.name=e.baseName;e.lv=level;e.dungeonBoss=room===5;e.dungeonElite=room===4;e.boss=false;e.bossPhase=undefined;e.telegraph=null;e.phaseHistory=undefined;if(room===4){e.maxhp=Math.ceil(e.maxhp*1.75);e.hp=e.maxhp;e.atk=Math.ceil(e.atk*1.3);e.rarityId='elite';}if(room===5){e.maxhp=Math.ceil(e.maxhp*3);e.hp=e.maxhp;e.atk=Math.ceil(e.atk*1.4);e.rarityId='champion';e.affinities={...e.affinities};e.dungeonSpecial=['Golpe das Raízes','Picada Carmesim','Névoa Tóxica','Impacto Ferrífero','Lamento Funerário','Nevasca Cortante','Toque Sepulcral','Explosão de Brasas','Julgamento Luminoso','Ruptura do Vazio'][d.region];}return e;}
export function dungeonAction(){const s=rt.state,a=dungeonState(s).attempt;if(!a||s.combat||a.roomResolved)return false;const d=DUNGEONS.find(x=>x.id===a.id);if(!d)return false;
 if(a.room===3){const p=stats();s.hp=Math.min(p.maxhp,s.hp+Math.ceil(p.maxhp*.35));s.mp=Math.min(p.maxmp,s.mp+Math.ceil(p.maxmp*.35));s.gold+=d.level*3;statAdd('goldEarned',d.level*3);a.roomResolved=true;rt.log=[`Santuário encontrado: HP e MP recuperados; +${d.level*3} ouro.`];rt.screen='dungeon';}
 else if(a.room===2&&Math.random()<.35){const dmg=Math.min(s.hp-1,Math.ceil(stats().maxhp*.13));s.hp-=Math.max(0,dmg);a.roomResolved=true;rt.log=[`Armadilha desarmada após causar ${Math.max(0,dmg)} de dano.`];rt.screen='dungeon';}
 else{cancelCombatVisuals(rt.app);stopCreatureAnimation();resetCombatVisualState(rt);rt.busy=false;const e=dungeonEnemy(d,a.room);s.combat={enemy:e,effects:[],turn:0,guard:0,dungeonRoom:a.room};rt.log=[`Sala ${a.room}: ${e.name} apareceu!`];rt.sub='attack';rt.screen='combat';}
 save();render();return true;}
export function advanceDungeon(){const s=rt.state,a=dungeonState(s).attempt;if(!a||s.combat||!a.roomResolved||a.room>=5)return false;a.room++;a.roomResolved=false;rt.screen='dungeon';save();render();return true;}
export function dungeonCombatEnd(win){const s=rt.state,a=dungeonState(s).attempt;if(!a)return;const d=DUNGEONS.find(x=>x.id===a.id);if(!win){dungeonState(s).attempt=null;return;}
 a.roomResolved=true;const ds=dungeonState(s);ds.best[d.id]=Math.max(ds.best[d.id]||0,a.room);
 if(a.room===5){const first=!ds.completed.includes(d.id);if(first){ds.completed.push(d.id);ds.rewards.push(d.id);const it=makeItem(d.level,'weapon',s.cls,2,d.region);it.name=`Relíquia de ${d.name}`;s.items.push(it);statAdd('itemsFound');rt.log.unshift(`Primeira conclusão: ${it.name}!`);}const gold=(first?11:4)*d.level,exp=(first?12:5)*d.level;s.gold+=gold;statAdd('goldEarned',gold);gainXp(exp);statAdd('dungeonsCompleted');rt.log.unshift(`Masmorra concluída! +${gold} ouro e +${exp} EXP.`);ds.attempt=null;}
}

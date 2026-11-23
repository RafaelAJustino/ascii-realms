/** Dez encontros exclusivos, sem reutilizar o chefe regional ou o chefe de masmorra. */
export const MINI_BOSSES=Object.freeze([
 {id:'mb-briar',name:'Vesper, o Cervo de Espinhos',biome:'Floresta Esquecida',intro:'Galhos se curvam. Um cervo de chifres retorcidos avança do bosque antigo.',defeat:'Os espinhos de Vesper se desfazem e a mata recupera o silêncio.',archetype:'wild',element:'physical',hp:2.45,atk:1.39,def:1.24,passives:[{id:'briar-hide',name:'Casca de Espinhos',kind:'armor',power:.09},{id:'forest-heart',name:'Coração da Mata',kind:'regen',power:.008}],skills:[['thorn-lunge','Investida de Galhos','physical',1.34,'damage'],['root-snare','Prisão de Raízes','physical',.95,'weaken'],['briar-rage','Rugido da Floresta','physical',1.62,'damage']]},
 {id:'mb-dune',name:'Safira, a Viúva das Dunas',biome:'Deserto Escarlate',intro:'A areia desliza como vidro. Uma escorpiã coroada emerge sob o sol rubro.',defeat:'O ferrão carmesim afunda nas dunas e o vento leva a última ameaça.',archetype:'opportunist',element:'poison',hp:2.36,atk:1.46,def:1.18,passives:[{id:'sand-shell',name:'Carapaça de Areia',kind:'armor',power:.08},{id:'venom-heart',name:'Peçonha Persistente',kind:'fury',power:.07}],skills:[['sand-sting','Ferrão Solar','poison',1.28,'poison'],['dune-burrow','Emboscada de Areia','physical',1.44,'damage'],['scarlet-venom','Névoa Escarlate','poison',1.51,'debuff']]},
 {id:'mb-mire',name:'Morghul, o Sapo dos Lamentos',biome:'Pântano Sombrio',intro:'Bolhas negras surgem na água imóvel. Um sapo colossal abre os olhos dourados.',defeat:'A última bolha venenosa estoura. Os lamentos cessam no pântano.',archetype:'strategic',element:'poison',hp:2.59,atk:1.35,def:1.22,passives:[{id:'mire-skin',name:'Muco Protetor',kind:'armor',power:.11},{id:'bog-renewal',name:'Regeneração do Brejo',kind:'regen',power:.007}],skills:[['bog-splash','Salto do Lodo','physical',1.35,'damage'],['toxic-song','Canto das Toxinas','poison',1.12,'poison'],['miasma','Miasma Profundo','poison',1.59,'debuff']]},
 {id:'mb-forge',name:'Rothgar, o Urso de Ferro',biome:'Montanhas de Ferro',intro:'A pedra vibra sob golpes pesados. Um urso revestido de ferro emerge da mina.',defeat:'A armadura de Rothgar se quebra e o eco dos golpes desaparece.',archetype:'defensive',element:'physical',hp:2.65,atk:1.38,def:1.38,passives:[{id:'iron-plates',name:'Placas Forjadas',kind:'armor',power:.13},{id:'forge-fury',name:'Fúria da Forja',kind:'fury',power:.08}],skills:[['iron-paw','Pata de Aço','physical',1.38,'damage'],['anvil-crush','Esmagamento','physical',1.55,'damage'],['iron-roar','Rugido Metálico','physical',1.14,'weaken']]},
 {id:'mb-crypt',name:'Eldric, o Cavaleiro Sem Rosto',biome:'Ruínas Perdidas',intro:'Entre colunas rachadas, armaduras vazias se movem. Eldric ergue uma espada apagada.',defeat:'O elmo de Eldric desmorona e as ruínas guardam sua memória.',archetype:'strategic',element:'dark',hp:2.48,atk:1.44,def:1.30,passives:[{id:'grave-guard',name:'Guarda Sepulcral',kind:'armor',power:.1},{id:'soul-leech',name:'Roubo de Almas',kind:'drain',power:.05}],skills:[['old-blade','Lâmina Esquecida','physical',1.37,'damage'],['grave-curse','Jura Fúnebre','dark',1.12,'weaken'],['spirit-cut','Corte Espectral','dark',1.68,'damage']]},
 {id:'mb-frost',name:'Skadi, a Coruja da Geada',biome:'Terras Congeladas',intro:'Uma sombra cobre o gelo. Uma coruja de asas cristalinas desce da tempestade.',defeat:'Penas de gelo se dissolvem na neve e a tempestade enfraquece.',archetype:'magical',element:'ice',hp:2.30,atk:1.52,def:1.14,passives:[{id:'frost-feathers',name:'Penas Geladas',kind:'resist',power:.12},{id:'cold-fury',name:'Inverno Interior',kind:'fury',power:.08}],skills:[['ice-talon','Garras do Inverno','ice',1.33,'damage'],['frost-veil','Véu da Nevasca','ice',1.08,'weaken'],['blizzard-dive','Mergulho Glacial','ice',1.74,'damage']]},
 {id:'mb-cursed',name:'Noxara, a Dama dos Corvos',biome:'Vale Amaldiçoado',intro:'Corvos circulam uma lápide aberta. A dama das sombras chama pelo seu nome.',defeat:'Os corvos se dispersam enquanto a última maldição perde a voz.',archetype:'magical',element:'dark',hp:2.40,atk:1.53,def:1.13,passives:[{id:'raven-mist',name:'Manto dos Corvos',kind:'resist',power:.09},{id:'night-drain',name:'Sussurros Vampíricos',kind:'drain',power:.07}],skills:[['raven-swarm','Bando Sombrio','dark',1.3,'damage'],['night-hex','Maldição dos Corvos','dark',1.05,'weaken'],['mourning','Lamento da Noite','dark',1.72,'damage']]},
 {id:'mb-ember',name:'Ignivar, o Basilisco de Brasas',biome:'Abismo Ardente',intro:'O magma se abre e um basilisco incandescente ergue suas escamas.',defeat:'Ignivar endurece como obsidiana. A lava volta a fluir lentamente.',archetype:'aggressive',element:'fire',hp:2.42,atk:1.56,def:1.20,passives:[{id:'ember-scales',name:'Escamas de Brasa',kind:'resist',power:.12},{id:'lava-fury',name:'Sangue em Fusão',kind:'fury',power:.09}],skills:[['ember-bite','Mordida Ígnea','fire',1.37,'damage'],['magma-breath','Sopro de Magma','fire',1.49,'burn'],['inferno-gaze','Olhar Incendiário','fire',1.72,'damage']]},
 {id:'mb-halo',name:'Aurelion, o Leão do Eclipse',biome:'Reino Celestial',intro:'Um eclipse cobre os altares. Um leão alado de crina luminosa ruge.',defeat:'A coroa de luz se apaga e a aurora retorna às muralhas.',archetype:'strategic',element:'holy',hp:2.55,atk:1.49,def:1.24,passives:[{id:'solar-mantle',name:'Manto Solar',kind:'resist',power:.1},{id:'sun-renewal',name:'Vigor da Aurora',kind:'regen',power:.008}],skills:[['sun-claw','Garras da Aurora','holy',1.34,'damage'],['eclipse-wing','Asas do Eclipse','physical',1.41,'weaken'],['judgment-ray','Raio do Julgamento','holy',1.74,'damage']]},
 {id:'mb-void',name:'Umbriel, a Aranha do Vazio',biome:'Vazio Eterno',intro:'O próprio espaço se fragmenta. Oito olhos vazios contemplam sua alma.',defeat:'Os fios de Umbriel se rompem e os ecos do vazio se calam.',archetype:'magical',element:'dark',hp:2.50,atk:1.57,def:1.27,passives:[{id:'void-web',name:'Teia Dimensional',kind:'armor',power:.1},{id:'abyss-drain',name:'Fome do Abismo',kind:'drain',power:.07}],skills:[['void-needle','Agulha do Nada','dark',1.39,'damage'],['space-web','Teia do Espaço','dark',1.18,'weaken'],['abyss-break','Ruptura Abissal','dark',1.82,'damage']]}
]);
/** Cada cena possui desenho exclusivo do monstro, não um sprite compartilhado. */
const SCENES=[
String.raw`       .:***:.  .:%%#@@%%#:.     .-***-.
  ^^^^  /\      /\_____/\   /\  ^^^^^
 /####\/  \____/##%%%%##\_/  \/####\
/%%%%%/\      /###@@@@###\     /\%%%%%\
 |\||/|     ___/###||###\___    |\||/|
  ||||     /  /######\  \  \    ||||
  ||||    /  / /\/\/\ \  \  \   ||||
 //||\\       / /\\ \       //||\\
  /\\       .| (oo) |.       /\\
 /#||#\     /  \--/  \     /#||#\
/#||||#\   /##/||||\##\   /#||||#\
  ||||    /##/ |||| \##\    ||||
  ||||   /__/  ||||  \__\   ||||
 __||__      _/ || \_      __||__
#%#%#%## _.-'   ||  '-._ ##%#%#%#
%%%%%##%%:.   ..||..  .:%%##%%%%%
#@@@@%##%##%%%%####%%%%##%##@@@@#`,
String.raw` .-. .:-.  ~~~~~...:::...~~~~~ .:-. .-.
 :..:   /\   /\_____/\   /\    :..:
  /\/\ /%%\ /%%%%%%%%%\ /%%\ /\/\
 _|__|_       .==.             _|__|_
 /\  /\    .-########-.       /\  /\
/##\/##\  /###########\     /##\/##\
 \_\/_/   /##/  @ @  \##\     \_\/_/
  ||||   |##|     V    |##|    ||||
  ||||    \##\   /|\  /##/     ||||
 /%%%%\    \##\_/ | \_/##/    /%%%%\
/%####%\   /%%%=---=%%%\    /%####%\
  /\/\    /##/  / \\  \##\     /\/\
 .::::.   /__/  /   \  \__\   .::::.
 /####\   ..:--/_____\--:..   /####\
 ###########:::::::::::::###########
%@@@@%%%%%%##%%%##%%%##%%%%%%@@@@%
:..:.....:-===++**++===-:.....:..:`,
String.raw` ~~.~~~..~~~.~~~~~~..~~~.~~~~~~.~~.
  /\/\/\  :::-..--:::  /\/\/\
 /%%##%%\/\   __   /\/%%##%%\
  ||  ||    .(%%%%).    ||  ||
  ||  ||  .-(@@##@@)-.  ||  ||
  ||  || /@@%#%%%%#%@@\ ||  ||
  /\/\   |#%  o  o  %#|   /\/\
 /####\  |%#  ____  #%|  /####\
/%%@@%%\ /##\ \__/ /##\ /%%@@%%\
  ||||  /%#%#\____/%#%#\  ||||
  |||| /@%###/    \###%@\ ||||
 _||||_/%%#/|  ::  |\#%%\_||||_
%%%%%%%%%/ | | :: | | \%%%%%%%%%
%%%###%%%  | | :: | |  %%%###%%%
####@@@@##  \|_||_|/  ##@@@@####
  ~~~~:--===|______|===--:~~~~
 :..~~:::...:~.....~:...:::~~..:`,
String.raw`     /\       /\  /\       /\
 /\ /%%%%\ /\ /%%\ /%%\ /\ /%%%%\ /\
/%%\######/%%\####/%%\######/%%\
 | | |  | | |  |  | | |  |  | | |
 |#|_|##|_|#|__|##|_|#|_|##|_|#|
 ##########.---..---.###########
    ||   .-/##%%%%##\-.   ||
    ||  /##/ [##] \##\  ||
   _||_ |##|  0 0  |##| _||_
  /####\ \##\  WW  /##/ /####\
 /%%##%%\ \##\____/##/ /%%##%%\
/@@%%%%@@\   /||||\   /@@%%%%@@\
  |#||#|    /##||##\    |#||#|
  |#||#|   /#%#||#%#\   |#||#|
  |#||#|   |##/  \##|   |#||#|
%#%##%#%##%#|    |#%##%#%##%#%
@@@@@@@@@%%%%====%%%%@@@@@@@@@@`,
String.raw`  +===+===+===+===+===+===+===+
  |:::|  |:.:|  |:::|  |:.:|
 /|###|\/|###|\/|###|\/|###|\
  |####|__|####|__|####|__|####|
  |#|  ...  .-////-. ...  |#|
  |#| .:%%: /######\ :%%:. |#|
  |#|  /\/\ | @  @ | /\/\  |#|
 _|#|_/%%##\|  __  |/%%##\_|#|_
/###%##@@%%#\ /##\ /#%%@@##%###\
 ||##  /\  ##\####/##  /\  ##||
 ||## /##\ ###|  |### /##\ ##||
 ||## \##/ #%%|  |%%# \##/ ##||
 ||###_____##%|  |%##_____###||
 |##/  /|  /%|  |%\  |\  \##|
 |#/__/ |_/%%/____\%%\_| \__\#|
%###@@%%%%%%...::...%%%%%%@@###%
####%%%%%%##====++====##%%%%%%###`,
String.raw`  .  *  .  *  .  *  .  *  .  *
  /\    /\   /\    /\   /\    /\
 /##\  /%%\ /##\  /%%\ /##\  /%%\
/%%%%\/####/%%%%\/####/%%%%\/####
   \ \   .----____----.  / /   
    \ \ /%##%####%##%\ / /
   _\_/%%#@########@#%%\/_
  /##/###   o  o   ###\##\
 /%%/####\   ^^   /####\%%\
/##/@@@@##\______ /##@@@@\##\
   /%%%%   /||||\   %%%%\
  /###/  _/ |  | \_  \###\
  ||||  /%%/|  |\%%\  ||||
  |||| /###/|  |\###\ ||||
   \  /__/ /____\ \__\  /
   ..::---=######=---::..
 ###%#%#%%@@%%%%@@%%#%#%###`,
String.raw`   -==--==--==--==--==--==--==-
 /^\ /\   /\     /\   /\ /\
/%%##%%##\#\  /##\  /#/#%%##%%\
 ######  .-.   .--.   .-.  ######
 |:::|  ( @ ) ( ## ) ( @ ) |:::|
 |:::|  /###\  \__/  /###\ |:::|
 /\/\  /##@##\______ /##@##\/\/\
/%%%%\/%%#%#%%  %%#%#%%\/%%%%\
  ||||  /#(0)  ||  (0)#\  ||||
  |||| /###\  (__)  /###\ ||||
 _||||_|%%%%\_####_/%%%%|_||||_
/#######\##/ ||  || \##/#######\
  /%%\   /##\ ||  || /##\   /%%\
 /####\ /####\||  ||/####\ /####\
/%%##%%\  || /____\ ||  /%%##%%\
===---===##%#%%%##%#==---===
%%%%##%%%%##::..::##%%%%##%%%%`,
String.raw`  *.  .::..  .:::..  .::..  .*
   /\  /\   /\  /\   /\  /\
  /%%\/%%\ /%%\/%%\ /%%\/%%\
  |##||##| |##||##| |##||##|
  |##| |#|  __  |#| |##| |##|
  |#| .###./%%\ .###. |#|
  |#| /####%%%%####\ |#|
  /\ /###(o)%%(o)###\ /\
 /%%\|%#### /\/\ ####%|/%%\
/####\##\##/____\##/##/####\
  ||   |#| |@@@@| |#|   ||
  ||  /%#\ |@@@@| /#%\  ||
 _||_/%##%\|####|/%##%\_||_
/####%%@@%%\####/%%@@%%####\
  | |##%##%##%##%##%##%##| |
 --====----::::----====--
 #@%##%%###%%%%%%%###%%##%@#`,
String.raw`  .-+-.  .-+-.  .-+-.  .-+-.
 /###\  /###\  /###\  /###\
/%@@%\/%%#%%\/%%#%%\/%%#%%\
 |##|::|##|::|##|::|##|::|##|
 |##|  __.---.--.__  |##|
 |##| /%%\%%%%%%%/%%\ |##|
 /\/\/@@%%\##%##/%%@@\/\/\
/####|###  @   @  ###|####\
 |##|\##\   --   /##/|##|
 |##| \##\_####_/##/ |##|
 |##|  \##\||||/##/  |##|
 |##| /####||||####\ |##|
  || /%%/\/||||\/\%%\ ||
 _||_%%%%%  ||  %%%%%_||_
 |%%%##%#%__||__%#%##%%%|
  || ||##@@%%%%@@##|| ||
 --====----::::----====--`,
String.raw`  :::::::----===----:::::::  
    /\ .:: /\    /\ ::. /\
   /##\   /##\  /##\   /##\
  /%%%%\/%%%%%\/%%%%%\/%%%%\
  |##| |##| :::: |##| |##|
  |#| .-####----####-. |#|
  |#| /######%%######\ |#|
  /\/|###(0)##(0)###|\/\
 /%%\|##%%\_==_/%%##|/%%\
/####\##/\/####\/\##/####\
 |##| /##|  ####  |##\ |##|
 |##|/##/|  ####  |\##\|##|
 _||/##/ | /####\ | \##\||_
/###%#/  |/%%%%%%\|  \#%###\
 |##|   /##/    \##\   |##|
 ::::::==--==@@==--==::::::
 ###%#%#%@%%%@%%%@%#%#%###`
];
export const miniBossFor=region=>MINI_BOSSES[region]||null;
// Molduras de horizonte exclusivas por bioma. A figura do guardião continua artesanal.
const LANDSCAPE_PATTERNS=[
 ['.:*%#*.','^/\#%'],['-:=*%%.','_\/%%'],['~.:~%#','/\~#%'],['/\##::','==#@@%'],['#%:.--','::#%%@'],['.*#*..','/\#**'],['~:##..','::/\#%'],['::+##*','~~####'],['++:%%#','/\*##'],['..::##','-=#%@#']
];
function texturedRow(fragment,region,row){
 const pattern=LANDSCAPE_PATTERNS[region]?.[row%2]||'.:#+*';const body=Array.from({length:50},(_,i)=>pattern[(i+row*3+region)%pattern.length]).join('');
 if(!fragment)return body;const text=String(fragment).slice(0,48);const x=Math.floor((50-text.length)/2);
 return body.slice(0,x)+text+body.slice(x+text.length);
}
export function miniBossArtwork(region){
 const scene=SCENES[region];if(!scene)return '';
 const lines=scene.split('\n');
 const top=[0,1,2,3].map(i=>texturedRow(i===1?'. . . : * : . . .':null,region,i));
 const middle=lines.map((line,i)=>texturedRow(line,region,i+4));
 const bottom=[0,1,2,3].map(i=>texturedRow(i===3?'_-=##%%@@%%##=-_':null,region,i+22));
 return [...top,...middle,...bottom].join('\n');
}
/** Mensagens diferentes por bioma para as três etapas de aproximação. */
export function warningFor(region,count){const b=miniBossFor(region);const label=b?.name||'a criatura';if(count===5)return `Você encontra vestígios de ${label} entre os sinais do território.`;if(count===10)return `Marcas recentes anunciam que ${label} se aproxima.`;if(count===14)return `O ar fica pesado. ${label} observa seus movimentos.`;return '';}
export function miniBossAttackFactor(e){const p=e.miniBossKit||miniBossFor(e.miniBossRegion);if(!p)return 1;return e.hp/e.maxhp<.35&&p.passives.some(x=>x.kind==='fury')?1+p.passives.find(x=>x.kind==='fury').power:1;}
export function miniBossDamageFactor(e,element){const p=e.miniBossKit||miniBossFor(e.miniBossRegion);if(!p)return 1;const arm=p.passives.find(x=>x.kind==='armor');const resist=p.passives.find(x=>x.kind==='resist');return element==='physical'&&arm?1-arm.power:element!=='physical'&&resist?1-resist.power:1;}
export function miniBossRegen(e){const p=e.miniBossKit||miniBossFor(e.miniBossRegion);const passive=p?.passives.find(x=>x.kind==='regen');return passive?Math.max(1,Math.floor(e.maxhp*passive.power)):0;}
export function miniBossDrain(e,damage){const p=e.miniBossKit||miniBossFor(e.miniBossRegion);const passive=p?.passives.find(x=>x.kind==='drain');return passive?Math.max(1,Math.floor(damage*passive.power)):0;}
export function miniBossSkills(e){const p=e.miniBossKit||miniBossFor(e.miniBossRegion);return p?p.skills.map(([id,name,element,power,kind],index)=>({id,name,element,power,kind,unlock:1,cost:index===2?18:9,cooldown:index===2?4:2,announce:index===2})):[];}
export function chooseMiniBossSkill(e,player){const skills=miniBossSkills(e).filter(x=>e.mp>=x.cost&&(e.cooldowns?.[x.id]||0)<=0);if(!skills.length)return {id:'strike',name:'Ataque',element:e.attackElement,power:1,kind:'damage',cost:0,cooldown:0};const ratio=e.hp/e.maxhp;const hasDebuff=player.effects?.some(x=>x.type==='weaken'||x.type==='poison');const viable=skills.filter(x=>!(['weaken','debuff','poison'].includes(x.kind)&&hasDebuff));const available=viable.length?viable:skills;const eligible=available.filter(s=>s.announce);if(eligible.length&&ratio<.64)return eligible[0];return available[(e.turn+Math.floor(ratio*5))%available.length];}

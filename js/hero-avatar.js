/** Retratos desenhados em uma grade anatômica compartilhada, sem imagens externas. */
import {escape} from './utils.js';
import {classes} from './data.js';

export const AVATAR_WIDTH=33, AVATAR_HEIGHT=22;
export const VISIBLE_SLOTS=Object.freeze(['head','body','hands','feet','weapon','ring','amulet']);
export const RARITY_INK=Object.freeze(['common','uncommon','rare','epic','legendary']);

export function equippedVisuals(state){
 const items=Array.isArray(state?.items)?state.items:[];
 const equipped=state?.equip||{};
 return Object.fromEntries(VISIBLE_SLOTS.map(slot=>[slot,items.find(it=>it.uid===equipped[slot]&&it.slot===slot)||null]));
}

/* Todas as classes compartilham: centro x=15, ombros y=7, cintura y=13,
   mãos y=11 e pés y=20. A arma toca obrigatoriamente a mão direita. */
const SILHOUETTES={
 guerreiro:[
 '             _______             ',
 '            /_______\\            ',
 '           /|  ___  |\\           ',
 '           || |o o| ||           ',
 '           || |_-_| ||           ',
 '            \\_____//            ',
 '         ___/  |_|  \\___         ',
 '       _/___\\_===_/___\\_       ',
 '      /|[###]|=====|[###]|\\      ',
 '      |||###||[===]||###|||      ',
 '      ||\\___||[+]||___//||      ',
 '      || [__] |===| [__] ||      ',
 '      \\|____/|___|\\____|/      ',
 '          /==/___\\==\\          ',
 '         /##/|   |\\##\\         ',
 '         |##||   ||##|          ',
 '         |##||   ||##|          ',
 '         |##||   ||##|          ',
 '         |__||   ||__|          ',
 '        _/==/     \\==\\_        ',
 '       /____|     |____\\       ',
 '       |____|     |____|       '
 ],
 mago:[
 '              /\\                ',
 '             /..\\               ',
 '            /::::\\              ',
 '           /| .--. |\\            ',
 '           || |o o| ||            ',
 '           ||  \\_/  ||            ',
 '            \\__|__//             ',
 '          __/  |  \\__            ',
 '        _/::\\_***_/::\\_          ',
 '       /::/::|:::|::\\::\\         ',
 '      /::/|::|:o:|::|\\::\\        ',
 '      |::|\\::|:::|::/|::|        ',
 '      \\::\\|::|:::|::|/::/        ',
 '       |::|==|:::|==|::|         ',
 '      /:::|::|:::|::|:::\\        ',
 '     /::::|::|:::|::|::::\\       ',
 '    /:::::|::|:::|::|:::::\\      ',
 '   /::::::|::|:::|::|::::::\\     ',
 '  /_______|__|___|__|_______\\    ',
 '      /__|       |__\\           ',
 '     /___|       |___\\          ',
 '     |___|       |___|          '
 ],
 arqueiro:[
 '             ______               ',
 '            /_/^^\\_              ',
 '           /_/    \\_\\            ',
 '           | |o  o| |             ',
 '           | | -- | |             ',
 '            \\____//              ',
 '           __/||\\__              ',
 '         _/..\\||/..\\_            ',
 '        /./|..||..|\\.\\           ',
 '       //  |..||..|  \\          ',
 '      //   |..||..|   \\         ',
 '      \\_  |==[]==|  _//         ',
 '       \\__|__||__|__//          ',
 '          /_||||_\\              ',
 '         /./|  |\\.\\             ',
 '         |.| |  | |.|             ',
 '         |.| |  | |.|             ',
 '         |.| |  | |.|             ',
 '         |_| |  | |_|             ',
 '        /_/_/    \\_\\_\\           ',
 '       /___|      |___\\          ',
 '       |___|      |___|          '
 ],
 ladino:[
 '             .----.               ',
 '           ./:####:\\.             ',
 '          /::/----\\::\\            ',
 '          |::|o  o|::|            ',
 '          |::|_==_|::|            ',
 '           \\::----::/             ',
 '            \\__||__/              ',
 '          __/..||..\\_             ',
 '        _/..\\.||./..\\_           ',
 '       /..//.||||.\\..\\          ',
 '      /_//|..||||..|\\_\\         ',
 '       || |..|##|..| ||          ',
 '       || \\__|##|__// ||          ',
 '        \\___[====]___//           ',
 '           /|..||..|\\             ',
 '          /.|..||..|.\\            ',
 '          |.|..||..|.|            ',
 '          |.|..||..|.|            ',
 '          |_|__||__|_|            ',
 '         _/__/    \\__\\_          ',
 '        /___/      \\___\\         ',
 '        |___|      |___|         '
 ]
};

function weaponType(cls,item){
 if(!item)return 'none';
 const kind=String(item?.kind||classes[cls]?.weapons?.[0]||'');
 if(/Arco/i.test(kind))return 'bow';
 if(/Besta/i.test(kind))return 'crossbow';
 if(/Cajado/i.test(kind))return 'staff';
 if(/Varinha|Grim[oó]rio/i.test(kind))return 'wand';
 if(/Machado/i.test(kind))return 'axe';
 if(/Martelo/i.test(kind))return 'hammer';
 if(/Adaga|L[aâ]mina/i.test(kind))return 'dagger';
 return 'sword';
}

/** Uma peça altera a mesma zona anatômica nas quatro classes. */
export function composeHeroAvatar(state){
 const cls=classes[state?.cls]?state.cls:'guerreiro',eq=equippedVisuals(state);
 const glyph=Array.from({length:AVATAR_HEIGHT},(_,y)=>Array.from({length:AVATAR_WIDTH},(_,x)=>SILHOUETTES[cls][y][x]||' '));
 const ink=Array.from({length:AVATAR_HEIGHT},()=>Array(AVATAR_WIDTH).fill('base'));
 const draw=(x,y,lines,slot='base')=>{
  const rarity=eq[slot]?RARITY_INK[Math.max(0,Math.min(4,Number(eq[slot].rarity)||0))]:'base';
  lines.forEach((line,dy)=>[...line].forEach((char,dx)=>{
   const xx=x+dx,yy=y+dy;
   if(xx<0||xx>=AVATAR_WIDTH||yy<0||yy>=AVATAR_HEIGHT)return;
   if(char===' ')return;
   glyph[yy][xx]=char;ink[yy][xx]=eq[slot]?`${slot}-${rarity}`:slot;
  }));
 };
 // Pontos de ancoragem fixos: cabeça 11..20, tórax 10..21,
 // mãos 8 e 23, calçados 8..13 e 19..24.
 if(eq.head){
  const heavy=(eq.head.armor||0)>=2;
  draw(11,1,heavy?['/========\\','|[======]|','||  o o ||','||  --  ||','\\|______|/']:['/^^^^^^^^\\','|/------\\|','|| o  o ||','||  --  ||','\\|______|/'],'head');
 }
 if(eq.body){
  const heavy=(eq.body.armor||0)>=2;
  draw(11,8,heavy?['|/======\\|','||[####]||','||[====]||','||[####]||','|\\======/|']:['|/------\\|','||/::::\\||','||:()():||','||\\::::/||','|\\------/|'],'body');
 }
 if(eq.hands){draw(7,10,['[==]','[==]'],'hands');draw(22,10,['[==]','[==]'],'hands');}
 if(eq.feet){draw(7,19,['/====\\','|____|','|____|'],'feet');draw(19,19,['/====\\','|____|','|____|'],'feet');}
 if(eq.amulet)draw(15,8,['*'],'amulet');
 if(eq.ring)draw(21,10,['o'],'ring');
 // Punho e objeto se unem à mão direita na linha y=11.
 const weapon=weaponType(cls,eq.weapon);
 const weaponModels={
  sword:{x:24,y:3,art:['   /\\','   ||','   ||','   ||','   ||','   ||','   ||','   ||','<==[]==','   ||','   ||']},
  axe:{x:24,y:4,art:[' /====\\',' |####|',' \\====/','    ||','    ||','    ||','    ||','<===[]','    ||']},
  hammer:{x:24,y:5,art:['[######]','[######]','   ||','   ||','   ||','   ||','<==[]==','   ||']},
  dagger:{x:24,y:7,art:['  /\\','  ||','  ||','<=[]==','  ||']},
  staff:{x:24,y:2,art:['  .*.',' (:::)', '  |:|','  |:|','  |:|','  |:|','  |:|','  |:|','  |:|','<==[]','  |:|','  |:|','  |:|']},
  wand:{x:24,y:6,art:['  <*>','   |','   |','   |','<==[]','   |']},
  bow:{x:24,y:4,art:['  /\\',' /  \\','|    |','|    |','|    |','|--->','|    |','|    |',' \\  /','  \\/']},
  crossbow:{x:24,y:7,art:['   /\\','--|===>','--|===>','  [==]','   ||']}
 };
 if(weapon!=='none'){
  const model=weaponModels[weapon];draw(model.x,model.y,model.art,'weapon');
  // Empunhadura sobre a mão existente, sem arma flutuante.
  draw(22,11,['===='],'weapon');
 }
 const rows=glyph.map(row=>row.join('').replace(/\s+$/,''));
 return {text:rows.join('\n'),rows,width:AVATAR_WIDTH,height:AVATAR_HEIGHT,ink,equipped:eq};
}

export function renderHeroAvatar(state,extraClass=''){
 const avatar=composeHeroAvatar(state),lines=avatar.rows.map((row,y)=>{
  let html='',start=0;
  while(start<row.length){const color=avatar.ink[y][start];let end=start+1;
   while(end<row.length&&avatar.ink[y][end]===color)end++;
   const segment=escape(row.slice(start,end));
   html+=color==='base'?segment:`<span class="avatar-ink avatar-${color}">${segment}</span>`;
   start=end;
  }
  return html;
 });
 return `<pre class="ascii-art hero-portrait dynamic-hero ${escape(extraClass)}" data-ascii="true" aria-label="Avatar do ${escape(classes[state?.cls]?.name||'Guerreiro')} com equipamentos equipados">${lines.join('\n')}</pre>`;
}

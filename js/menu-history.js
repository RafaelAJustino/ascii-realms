// UI-only navigation history. No character data or persistent save changes.
const history=[];
export function rememberMenu(screen,shop,scroll=0){
  if(!screen||screen==='combat'||screen==='result')return;
  const last=history.at(-1);
  if(last?.screen===screen&&last.shop===shop)return;
  history.push({screen,shop,scroll});
  if(history.length>40)history.shift();
}
export function peekMenu(){return history.at(-1)||null;}
export function previousMenu(){return history.pop()||null;}
export function clearMenuHistory(){history.length=0;}
export function fallbackMenu(screen){
  if(['shop','merchant','forge','dungeons','tavern'].includes(screen))return 'city';
  if(['maps','city','dungeon'].includes(screen))return 'atlas';
  if(['quests','bestiary','secrets'].includes(screen))return 'diary';
  if(['character','inventory','skills','statistics','specializations','achievements'].includes(screen))return 'player';
  return 'world';
}

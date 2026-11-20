// Conquistas são verificadas a partir de progresso real. Nenhum bônus de atributo é concedido.
export const ACHIEVEMENTS = [
 {id:'first-trail',group:'Exploração',name:'Primeiros Passos',title:'Explorador',description:'Conclua sua primeira exploração.',progress:s=>s.narrative?.explorations||0,goal:1},
 {id:'pathfinder',group:'Exploração',name:'Andarilho',title:'Andarilho',description:'Conclua 30 explorações.',progress:s=>s.narrative?.explorations||0,goal:30},
 {id:'first-victory',group:'Combate',name:'Primeira Vitória',title:'Combatente',description:'Derrote um monstro.',progress:s=>s.statistics?.monstersDefeated||0,goal:1},
 {id:'veteran',group:'Combate',name:'Veterano',title:'Veterano',description:'Derrote 50 monstros.',progress:s=>s.statistics?.monstersDefeated||0,goal:50},
 {id:'boss-hunter',group:'Chefes',name:'Rompendo Barreiras',title:'Caçador de Chefes',description:'Derrote um chefe de mapa.',progress:s=>s.bosses?.length||0,goal:1},
 {id:'boss-master',group:'Chefes',name:'Guardião das Fronteiras',title:'Guardião',description:'Libere cinco mapas derrotando chefes.',progress:s=>s.bosses?.length||0,goal:5},
 {id:'dungeon-first',group:'Masmorras',name:'Nas Profundezas',title:'Desbravador',description:'Conclua uma masmorra.',progress:s=>s.dungeons?.completed?.length||0,goal:1},
 {id:'dungeon-master',group:'Masmorras',name:'Sem Medo do Escuro',title:'Mestre das Masmorras',description:'Conclua cinco masmorras diferentes.',progress:s=>s.dungeons?.completed?.length||0,goal:5},
 {id:'quest-first',group:'Missões',name:'Palavra Cumprida',title:'Mensageiro',description:'Receba a recompensa por uma missão.',progress:s=>s.quests?.claimed?.length||0,goal:1},
 {id:'quest-five',group:'Missões',name:'Herói do Povo',title:'Herói do Povo',description:'Receba cinco recompensas de missões.',progress:s=>s.quests?.claimed?.length||0,goal:5},
 {id:'first-secret',group:'Descobertas',name:'Além da Trilha',title:'Curioso',description:'Conclua um evento narrativo.',progress:s=>s.narrative?.completed?.length||0,goal:1},
 {id:'five-secrets',group:'Descobertas',name:'Olhos Abertos',title:'Descobridor',description:'Conclua cinco eventos narrativos.',progress:s=>s.narrative?.completed?.length||0,goal:5},
 {id:'rare-equipment',group:'Equipamentos',name:'Achado Raro',title:'Colecionador',description:'Obtenha ou possua equipamento épico ou lendário.',progress:s=>s.items?.some(it=>it.rarity>=3)?1:0,goal:1},
 {id:'fine-forging',group:'Equipamentos',name:'Mestre da Forja',title:'Ferreiro',description:'Aprimore um equipamento até +5.',progress:s=>s.items?.some(it=>(it.upgrade||0)>=5)?1:0,goal:1},
 {id:'living-weapon',group:'Equipamentos',name:'Despertar de Aço',title:'Portador de Relíquia',description:'Evolua uma arma especial uma vez.',progress:s=>s.items?.some(it=>(it.evolution?.stage||0)>=1)?1:0,goal:1},
 {id:'trusted',group:'Cidades',name:'Amigo da Cidade',title:'Aliado',description:'Alcance 50 de reputação em uma cidade.',progress:s=>Math.max(0,...Object.values(s.cityLife?.reputation||{}).filter(Number.isFinite)),goal:50}
];
export const ACHIEVEMENT_BY_ID=Object.fromEntries(ACHIEVEMENTS.map(a=>[a.id,a]));
export function normalizeAchievements(value){
 const raw=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const unlocked=Array.isArray(raw.unlocked)?[...new Set(raw.unlocked.filter(id=>typeof id==='string'&&ACHIEVEMENT_BY_ID[id]))]:[];
 return {unlocked,title:typeof raw.title==='string'&&unlocked.includes(raw.title)?raw.title:null,recent:typeof raw.recent==='string'&&unlocked.includes(raw.recent)?raw.recent:null};
}
export function syncAchievements(state){
 if(!state)return [];
 state.achievements=normalizeAchievements(state.achievements);
 const newly=[];
 for(const a of ACHIEVEMENTS){if(!state.achievements.unlocked.includes(a.id)&&a.progress(state)>=a.goal){state.achievements.unlocked.push(a.id);newly.push(a.id);}}
 if(newly.length)state.achievements.recent=newly.at(-1);
 return newly;
}
export function setTitle(state,id){
 if(!state||state.combat)return false;
 const a=normalizeAchievements(state.achievements);
 if(id!==''&&(!ACHIEVEMENT_BY_ID[id]||!a.unlocked.includes(id)))return false;
 if(a.title===(id||null))return false;
 a.title=id||null;state.achievements=a;return true;
}
export function equippedTitle(state){const a=ACHIEVEMENT_BY_ID[state?.achievements?.title];return a&&state.achievements.unlocked.includes(a.id)?a.title:null;}

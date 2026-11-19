/** Descobertas raras e guardiões opcionais. Regras independentes do chefe principal. */
export const SECRET_EVENTS=Object.freeze([
 {id:'secret-moss-vault',region:0,title:'Cofre das Raízes',description:'Uma inscrição antiga brilha na casca de uma árvore oca.',choices:[{id:'open',label:'Decifrar a inscrição',effect:{material:2,gold:18,flag:'mossVault'},text:'Você abre um cofre escondido: 2 materiais regionais e 18 ouro.'},{id:'leave',label:'Registrar a inscrição',effect:{flag:'mossMarked'},text:'Você marca a localização do cofre no diário.'}]},
 {id:'secret-dune-mirror',region:1,title:'Espelho das Dunas',description:'Uma superfície polida reflete estrelas que ainda não nasceram.',choices:[{id:'touch',label:'Tocar o espelho',effect:{mpPercent:30,flag:'duneMirror'},text:'O reflexo restaura parte de sua mana.'},{id:'search',label:'Examinar a base',effect:{material:2},text:'Você encontra fragmentos úteis à fabricação.'}]},
 {id:'secret-bog-shrine',region:2,title:'Santuário Submerso',description:'Pedras rúnicas emergem lentamente da água escura.',choices:[{id:'purify',label:'Purificar as runas',effect:{hpPercent:20,flag:'bogShrine'},text:'Uma energia serena recupera sua vitalidade.'},{id:'gather',label:'Coletar fragmentos',effect:{material:2},text:'Você recolhe dois materiais regionais.'}]},
 {id:'secret-clockwork',region:3,title:'Oficina Esquecida',description:'Engrenagens antigas continuam trabalhando sob a terra.',choices:[{id:'repair',label:'Reparar o mecanismo',effect:{material:2,gold:25,flag:'clockwork'},text:'O mecanismo revela um compartimento de ouro e materiais.'},{id:'observe',label:'Estudar a maquinaria',effect:{mpPercent:20},text:'A descoberta inspira e restaura parte da sua mana.'}]},
 {id:'secret-ossuary',region:4,title:'Cripta Sem Nome',description:'Uma escadaria termina em uma porta sem fechadura.',choices:[{id:'enter',label:'Abrir a passagem',effect:{gold:38,damagePercent:8,flag:'ossuary'},text:'Você encontra ouro antigo, mas uma armadilha o fere.'},{id:'mark',label:'Marcar a passagem',effect:{flag:'ossuaryMarked'},text:'Você registra a passagem e segue adiante.'}]},
 {id:'secret-frozen-star',region:5,title:'Estrela Congelada',description:'Uma luz pulsa sob uma camada de gelo impossível de quebrar.',choices:[{id:'warm',label:'Aquecer a pedra',effect:{hpPercent:25,flag:'frozenStar'},text:'A estrela irradia calor e recupera parte de seu HP.'},{id:'chip',label:'Retirar cristais',effect:{material:2},text:'Você recolhe cristais de fabricação.'}]},
 {id:'secret-ember-font',region:7,title:'Fonte de Brasas',description:'Chamas silenciosas cercam uma fonte esquecida.',choices:[{id:'drink',label:'Beber da fonte',effect:{mpPercent:35,flag:'emberFont'},text:'Você recupera mana da fonte de brasas.'},{id:'harvest',label:'Coletar cinzas',effect:{material:2},text:'Você encontra materiais regionais entre as brasas.'}]},
 {id:'secret-void-archive',region:9,title:'Arquivo do Vazio',description:'Um pedestal contém registros de viajantes desaparecidos.',choices:[{id:'read',label:'Ler os registros',effect:{gold:55,flag:'voidArchive'},text:'Você decifra pistas e encontra 55 ouro.'},{id:'seal',label:'Selar os registros',effect:{potion:'elixir'},text:'Uma relíquia selada libera um elixir.'}]}
]);
export const SECRET_BY_ID=Object.freeze(Object.fromEntries(SECRET_EVENTS.map(e=>[e.id,e])));
export const SECRET_BOSS_REGIONS=Object.freeze([2,5,8]);
export function secretDefaults(){return {guardians:[],recent:[]};}
export function normalizeSecrets(value){const base=secretDefaults();if(!value||typeof value!=='object'||Array.isArray(value))return base;
 base.guardians=Array.isArray(value.guardians)?[...new Set(value.guardians.filter(n=>Number.isInteger(n)&&SECRET_BOSS_REGIONS.includes(n)))]:[];
 base.recent=Array.isArray(value.recent)?value.recent.filter(s=>typeof s==='string').slice(0,8).map(s=>s.slice(0,150)):[];
 return base;
}
export function availableSecrets(state,region){return SECRET_EVENTS.filter(e=>e.region===region&&!state.narrative.completed.includes(e.id));}
/** Descobertas somente na parte não-hostil da exploração; não substituem combates sorteados. */
export function secretDiscoveryChance(path,conditions){const base={safe:.025,unknown:.045,dangerous:.065}[path]||0;
 const boost=conditions?.event?.id==='discovery'?1.5:1;
 return Math.min(.10,base*boost);
}
export function selectSecret(state,region,rng=Math.random){const available=availableSecrets(state,region);return available.length?available[Math.min(available.length-1,Math.floor(rng()*available.length))]:null;}
export function secretGuardianChance(state,region,path){if(path!=='dangerous'||!SECRET_BOSS_REGIONS.includes(region)||state.secrets?.guardians?.includes(region))return 0;
 return .012; // apenas 1,2% das tentativas em caminhos perigosos
}
export function markGuardianVictory(state,region){if(!state?.secrets||!SECRET_BOSS_REGIONS.includes(region)||state.secrets.guardians.includes(region))return false;
 state.secrets.guardians.push(region);return true;}
export function recordSecret(state,text){if(!state?.secrets)return;state.secrets.recent=[text,...state.secrets.recent].slice(0,8);}

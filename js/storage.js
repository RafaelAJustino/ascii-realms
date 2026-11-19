import { rt } from './runtime.js';
import { KEY } from './data.js';
import { clamp } from './utils.js';
import { normalizeSave, SAVE_VERSION } from './state-schema.js';
import {activeJourney} from './journey-paths.js';
import {syncAchievements,ACHIEVEMENT_BY_ID} from './achievements.js';
export const BACKUP_KEY = `${KEY}-backup`;
export const MIGRATION_BACKUP_KEY = `${KEY}-pre-migration`;
export function save(){
 if(!rt.state)return false;
 const newAwards=syncAchievements(rt.state);
 if(newAwards.length)rt.achievementFeedback=`Conquista: ${ACHIEVEMENT_BY_ID[newAwards.at(-1)].name}`;
 rt.state.version=SAVE_VERSION;
 try {const encoded=JSON.stringify(rt.state);localStorage.setItem(KEY,encoded);localStorage.setItem(BACKUP_KEY,encoded);return true;}catch{return false;}
}
function parseValid(raw){if(!raw)return null;return normalizeSave(JSON.parse(raw));}
export function load(){
 let current;try{current=localStorage.getItem(KEY);}catch{return false;}
 let s=null,source='primary';
 try{s=parseValid(current);}catch{}
 if(!s){source='backup';try{s=parseValid(localStorage.getItem(BACKUP_KEY));}catch{}}
 if(!s){source='migration';try{s=parseValid(localStorage.getItem(MIGRATION_BACKUP_KEY));}catch{}}
 if(!s)return false;
 // Não alterar o estado em memória antes de confirmar a gravação da migração.
 try{
  if(source==='primary'&&JSON.parse(current).version<SAVE_VERSION){
   localStorage.setItem(MIGRATION_BACKUP_KEY,current);
  }
  // Uma falha de escrita impede a migração incompleta de sobrescrever a origem.
  const encoded=JSON.stringify(s);
  localStorage.setItem(KEY,encoded);
  localStorage.setItem(BACKUP_KEY,encoded);
 }catch{return false;}
 rt.state=s;rt.screen=s.dungeons?.attempt?'dungeon':activeJourney(s)?'journey':'world';rt.busy=false;rt.phase='idle';rt.area=clamp(s.area,1,100);
 return true;
}

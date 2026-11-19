import { maps } from './data.js';
import { detailedArtworks } from './artworks-detailed.js';
import { detailedCities } from './cities-detailed.js';
import { dungeonScenes, dungeonBossArt } from './dungeon-artworks.js';
import { heroArtworks } from './hero-artworks.js';
import { creatureFrames } from './ascii-animation.js';

// ASCII art: validacao independente do navegador e da logica de combate.
export const ART_LIMIT = 50;
export const canonicalSpecies = maps.flatMap(m => [m[3],m[4],m[5],m[2]]);
export const canonicalCities = maps.map(m => m[1]);
export const canonicalDungeons = ['Cripta das Raízes','Tumba Rubra','Covil das Toxinas','Forja Subterrânea','Catacumbas Perdidas','Caverna do Inverno','Sepulcro Maldito','Caldeira Infernal','Templo da Aurora','Fenda Primordial'];
export const canonicalDungeonBosses = ['Coração Enraizado','Matriarca de Areia','Devorador Tóxico','Colosso Ferrífero','Sentinela do Túmulo','Titã de Geada','Arauto das Cinzas Mortas','Fornalha Viva','Juiz da Aurora','Núcleo do Nada'];

export function validateArtwork(source,name,art,maxWidth=ART_LIMIT) {
  const issues=[];
  if(typeof art!=='string'||!art.length) return [`${source} :: ${name} :: arte ausente`];
  const lines=art.split('\n');
  for (let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(line.length>maxWidth)issues.push(`${source} :: ${name} :: linha ${i+1}: largura ${line.length} > ${maxWidth}`);
    for(let j=0;j<line.length;j++){
      const code=line.charCodeAt(j);
      if(code<32||code>126){issues.push(`${source} :: ${name} :: linha ${i+1}, coluna ${j+1}: caractere U+${code.toString(16).padStart(4,'0').toUpperCase()}`);}
    }
  }
  return issues;
}
export function validateFrames(source,name,frames) {
  const issues=[];
  if(!Array.isArray(frames)||frames.length<2)return [`${source} :: ${name}: sem quadros de animacao`];
  const original=frames[0].split('\n');
  frames.forEach((frame,i)=>{
    issues.push(...validateArtwork(source+` (quadro ${i+1})`,name,frame));
    const lines=frame.split('\n');
    if(lines.length!==original.length || lines.some((x,j)=>x.length!==original[j]?.length))
      issues.push(`${source} :: ${name} :: quadro ${i+1}: dimensoes e alinhamento incompativeis`);
  });
  return issues;
}
export function validateArtRegistry({warn=false}={}){
 const results=[];
 const groups=[
   ['js/artworks-detailed.js',detailedArtworks,canonicalSpecies],
   ['js/cities-detailed.js',detailedCities,canonicalCities],
   ['js/dungeon-artworks.js (cenarios)',dungeonScenes,canonicalDungeons],
   ['js/dungeon-artworks.js (chefes)',dungeonBossArt,canonicalDungeonBosses],
   ['js/hero-artworks.js',heroArtworks,['guerreiro','mago','arqueiro','ladino']]
 ];
 for(const [source,registry,ids] of groups){
   for(const id of ids){
     results.push(...validateArtwork(source,id,registry[id]));
     if(source==='js/artworks-detailed.js' && registry[id])results.push(...validateFrames(source,id,creatureFrames(registry[id])));
   }
   for(const id of Object.keys(registry))if(!ids.includes(id))results.push(`${source} :: ${id}: ID nao utilizado pelo jogo`);
 }
 if(warn&&results.length)results.forEach(item=>console.warn('[ASCII REALMS / ART]',item));
 return results;
}

// Uma estimativa independente de DOM para prevenir cortes em telas estreitas.
// A largura real em pixels e medida pelo navegador em fitAscii().
export function estimateAsciiFont({columns,rows,containerWidth,containerHeight,maxFont=18,aspect=.61,lineHeight=1.1}){
 if(!columns||!rows||containerWidth<=0||containerHeight<=0)return 0;
 const size=Math.min(maxFont,(containerWidth-8)/(columns*aspect),(containerHeight-8)/(rows*lineHeight));
 return Math.max(1,Math.floor(size*100)/100);
}

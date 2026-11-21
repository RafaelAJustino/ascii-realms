/** Species-specific deterministic kits, built from species IDs and compatible regional traits. */
import {REGION_SPECIES} from './expanded-species.js';
import {maps} from './data.js';
const pools={
 wild:[['bite','Mordida',1.06,'damage'],['lunge','Investida',1.35,'damage'],['rend','Corte Sangrento',1.02,'bleed'],['pack','Instinto Predatório',1.19,'damage']],
 aggressive:[['bite','Mordida Violenta',1.13,'damage'],['charge','Investida Selvagem',1.42,'damage'],['rend','Ferida Profunda',.98,'bleed'],['fury','Fúria Bestial',1.22,'damage']],
 opportunist:[['quick','Ataque Rápido',1.07,'damage'],['dirty','Golpe Sujo',.9,'weaken'],['venom','Ataque Tóxico',.94,'poison'],['ambush','Emboscada',1.36,'damage']],
 strategic:[['quick','Golpe Tático',1.09,'damage'],['dirty','Golpe Sujo',1.03,'weaken'],['guard','Postura Defensiva',0,'guard'],['ambush','Emboscada',1.34,'damage']],
 defensive:[['heavy','Golpe Pesado',1.38,'damage'],['guard','Defesa Reforçada',0,'guard'],['heal','Regeneração',0,'heal'],['charge','Carga Blindada',1.22,'damage']],
 magical:[['bolt','Projétil Elemental',1.14,'damage'],['blast','Explosão Mágica',1.49,'damage'],['ward','Barreira Arcana',0,'guard'],['curse','Maldição',.85,'weaken']]
};
const tagRules=[['venom',/aranha|escorpi|serpente|víbora|lodo|sapo|sanguessuga|veneno|tóxic|pestilent|á-cida|ácida|hidra/i],['undead',/esquelet|espectr|múmia|cadav|carniçal|sepul|funer|profano|morto|necro|ossu|banshee|vulto|assomb|lamento|espírito/i],['armored',/golem|autômat|armadura|sentinela|colosso|besouro|escaravelho|rocha|pedra|titã|estátua|guardião/i],['humanoid',/bandido|saqueador|capitão|ladrão|desertor|mercenário|cultista|cavaleiro|alquimista|feiticeiro|bruxa|nômade|paladino|arqueiro|caçador|inquisidor/i],['predator',/lobo|urso|chacal|fera|lince|cão|leão|hiena|predador|quimera|grifo|javali/i],['magical',/elemental|orbe|chama|sombra|eco|arconte|aurora|vazio|profeta|diabrete|brasa|serafim|dragão|espectro/i]];
function speciesTag(name,archetype){return tagRules.find(([,exp])=>exp.test(name))?.[0]||({strategic:'humanoid',opportunist:'predator',defensive:'armored',magical:'magical'}[archetype]||'predator');}
const passiveByTag={venom:{id:'toxic_blood',name:'Toxicidade Natural',description:'Veneno causa 15% mais dano, uma vez por aplicação.'},undead:{id:'profane',name:'Resistência Profana',description:'Resistência ao veneno e a golpes elementais sombrios.'},armored:{id:'carapace',name:'Carapaça',description:'Reduz em 6% ataques físicos não perfurantes.'},humanoid:{id:'tactics',name:'Experiência de Combate',description:'Adapta sua defesa ao HP, com limites.'},predator:{id:'ferocity',name:'Ferocidade',description:'+8% de dano com HP baixo.'},magical:{id:'arcane_skin',name:'Resistência Mágica',description:'Reduz em 7% o dano elemental não físico.'}};
const passivesExtra=[{id:'thick_skin',name:'Pele Grossa',description:'Reduz 4% de dano físico.'},{id:'regeneration',name:'Regeneração',description:'Recupera até 1% de HP quando ferido.'},{id:'survival',name:'Instinto de Sobrevivência',description:'Reduz ataques recebidos sob 30% de HP.'},{id:'menace',name:'Presença Aterrorizante',description:'Pode enfraquecer o primeiro ataque do herói.'}];
const hash=s=>[...s].reduce((h,c)=>((h*31+c.charCodeAt(0))>>>0),7);
function kit(species){const {name,id,profile,attackElement,humanoid}=species;const archetype=profile?.archetype||'wild',tag=speciesTag(name,archetype),n=hash(id),pool=pools[archetype]||pools.wild;const chosen=[pool[n%4],pool[(n+1)%4],pool[(n+2)%4]];
 if(tag==='venom')chosen[1]=['venom','Mordida Venenosa',1.01,'poison'];
 if(tag==='undead')chosen[1]=['drain','Toque Sombrio',.98,'drain'];
 if(tag==='armored')chosen[1]=['guard','Defesa Reforçada',0,'guard'];
 if(tag==='magical')chosen[1]=['bolt','Projétil Elemental',1.12,'damage'];
 const used=new Set();for(let i=0;i<chosen.length;i++){if(used.has(chosen[i][0]))chosen[i]=pool.find(row=>!used.has(row[0]))||['strike_alt','Ataque Concentrado',1.08,'damage'];used.add(chosen[i][0]);}
 const actions=chosen.map(([id,name,power,kind],i)=>({id:`${species.id}:${id}`,name,cost:i?Math.min(22,6+i*5):0,cooldown:i?2+i:0,power,element:kind==='poison'?'poison':kind==='drain'?'dark':(archetype==='magical'?attackElement||'fire':'physical'),kind,unlock:1,tag}));
 const second=passivesExtra[n%passivesExtra.length];return Object.freeze({id:species.id,name,archetype,tag,actions,passives:[passiveByTag[tag],second],element:attackElement||'physical'});
}
export const SPECIES_KITS=Object.freeze(Object.fromEntries(REGION_SPECIES.flat().map(species=>[species.id,kit(species)])));
export function monsterKit(enemy){return SPECIES_KITS[enemy?.speciesId]||null;}
export function monsterPassives(enemy){const kit=dungeonBossKit(enemy);return kit?[kit.passive]:monsterKit(enemy)?.passives||[];}
export const BOSS_KITS=Object.freeze(Object.fromEntries(maps.map((m,i)=>[m[2],{
 id:`boss:${i}`,name:m[2],passive:{id:`boss_passive_${i}`,name:['Coração do Bosque','Ferrão Imperial','Múltiplas Cabeças','Núcleo de Pedra','Coroa Maldita','Inverno Persistente','Reino dos Mortos','Coração Incandescente','Luz Corrompida','Ruptura Primordial'][i],description:['Recuperação moderada em fases avançadas.','Veneno mais intenso em golpes especiais.','Regeneração breve sob 50% de HP.','Carapaça física reforçada.','Sussurros reduzem resistência do alvo.','Proteção glacial reforçada.','Drenagem parcial de vida.','Chamas mais intensas ao perder HP.','Barreira contra elementos sagrados.','Adaptação elemental por fase.'][i],kind:['regen','poison','regen','armor','curse','ice','drain','fire','holy','chaos'][i]},
 phaseAttacks:[{id:`boss_${i}_phase2`,name:['Vinhas Aprisionadoras','Tempestade de Areia','Rajada Tóxica','Abalo Sísmico','Decreto das Sombras','Nevasca','Drenagem das Almas','Explosão de Cinzas','Luz Fraturada','Ruptura Elemental'][i],element:['physical','poison','poison','physical','dark','ice','dark','fire','holy','lightning'][i],power:1.42,effect:['root','poison','poison','stun','curse','freeze','drain','burn','curse','burn'][i]},
 {id:`boss_${i}_phase3`,name:['Coração da Floresta','Ferrão Mortal','Fúria das Cabeças','Martelo Ancestral','Último Decreto','Sopro do Inverno','Colheita Vital','Julgamento Ardente','Juízo da Luz','Colapso Primordial'][i],element:['physical','poison','poison','physical','dark','ice','dark','fire','holy','lightning'][i],power:1.65,effect:['root','poison','poison','stun','curse','freeze','drain','burn','curse','burn'][i]}]
}])));
export function bossKit(enemy){return BOSS_KITS[enemy?.baseName]||null;}
/** All monster reductions applied once; immunities stay in the elemental engine. */
export function monsterDamageFactor(enemy,element){const passives=monsterPassives(enemy).map(p=>p.id);let reduction=0;
 if(passives.includes('carapace')&&element==='physical')reduction+=.06;
 if(passives.includes('thick_skin')&&element==='physical')reduction+=.04;
 if(passives.includes('arcane_skin')&&element!=='physical')reduction+=.07;
 if(passives.includes('profane')&&['dark','poison'].includes(element))reduction+=.06;
 if(passives.includes('tactics')&&enemy.hp/enemy.maxhp<.5)reduction+=.03;
 if(passives.includes('survival')&&enemy.hp/enemy.maxhp<.3)reduction+=.06;
 if(enemy.boss){reduction+=Math.max(0,(enemy.bossPhase||1)-1)*.025;const kind=bossKit(enemy)?.passive?.kind;if(kind==='armor'&&element==='physical')reduction+=.055;if(kind==='ice'&&element==='ice')reduction+=.06;if(kind==='holy'&&element==='holy')reduction+=.05;if(kind==='chaos'&&element===enemy.attackElement)reduction+=.04;}
 if(enemy.dungeonBoss){reduction+=.02+(dungeonBossPhase(enemy)>1?.02:0);const kind=dungeonBossKit(enemy)?.passive?.kind;if(kind==='armor'&&element==='physical')reduction+=.055;if(kind==='poisonResist'&&element==='poison')reduction+=.06;if(kind==='ice'&&element==='ice')reduction+=.06;if(kind==='holy'&&element==='holy')reduction+=.06;if(kind==='dark'&&element==='dark')reduction+=.05;if(kind==='chaos'&&element===enemy.attackElement)reduction+=.04;}
 return Math.max(.78,1-reduction);
}

const DUNGEON_NAMES=['Coração Enraizado','Matriarca de Areia','Devorador Tóxico','Colosso Ferrífero','Sentinela do Túmulo','Titã de Geada','Arauto das Cinzas Mortas','Fornalha Viva','Juiz da Aurora','Núcleo do Nada'];
const DUNGEON_LABELS=['Semente Guardiã','Veneno das Areias','Secreção Ácida','Forja Viva','Maldição Funerária','Couraça Glacial','Fome Profana','Coração de Magma','Véu de Luz','Distorção do Vazio'];
export const DUNGEON_BOSS_KITS=Object.freeze(Object.fromEntries(DUNGEON_NAMES.map((name,i)=>[name,{
 name,id:`dungeon-boss:${i}`,region:i,passive:{id:`dungeon_passive_${i}`,name:DUNGEON_LABELS[i],description:['Regenera um pouco de vida quando ferido.','Veneno dos ataques especiais é reforçado.','O dano de veneno é parcialmente resistido.','Resiste melhor a golpes físicos.','A maldição protege parcialmente a criatura.','Resistência adicional a gelo.','Drena vida no terceiro turno.','Aumenta o dano de fogo em fases avançadas.','Resiste a ataques de luz.','Adapta-se ao elemento atacado.'][i],kind:['regen','poison','poisonResist','armor','dark','ice','drain','fire','holy','chaos'][i]},
 phaseAttacks:[{id:`dungeon_${i}_p1`,name:['Lança de Raízes','Mordida de Areia','Ácido Corrente','Martelo de Ferro','Grito da Cripta','Agulhas de Gelo','Grito das Cinzas','Rajada de Magma','Clarão Julgador','Ecos do Vazio'][i],element:['physical','poison','poison','physical','dark','ice','dark','fire','holy','dark'][i],power:1.3},
 {id:`dungeon_${i}_p2`,name:['Tronco Enraizado','Tempestade de Escorpiões','Névoa Corrosiva','Impacto Magnético','Condenação Antiga','Nevasca Letal','Sombra Devoradora','Erupção do Núcleo','Balança Celestial','Ruptura Total'][i],element:['physical','poison','poison','physical','dark','ice','dark','fire','holy','lightning'][i],power:1.55}]
}])));
export const dungeonBossKit=enemy=>DUNGEON_BOSS_KITS[enemy?.baseName]||null;
export const dungeonBossPhase=enemy=>enemy?.hp/Math.max(1,enemy.maxhp)>.5?1:2;

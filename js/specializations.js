// Especializações: dados e fórmulas isolados da interface e da persistência.
export const SPECIALIZATIONS = {
 guerreiro:[['berserker','Berserker','Fúria Sangrenta','Golpe Frenético','Instinto Carmesim','Ruptura Final','physical','damage'],['guardiao','Guardião','Muralha Viva','Escudo Protetor','Fortaleza Inabalável','Bastião Eterno','physical','guard']],
 mago:[['arquimago','Arquimago','Sintonia Arcana','Explosão Prismática','Fluxo Superior','Cataclismo Arcano','lightning','damage'],['feiticeiro','Feiticeiro','Maldição Persistente','Praga Arcana','Domínio das Aflições','Eclipse Maldito','dark','poison']],
 arqueiro:[['atirador','Atirador','Mira Absoluta','Disparo Cirúrgico','Precisão Letal','Tiro do Horizonte','physical','pierce'],['cacador','Caçador','Instinto Predador','Flecha Tóxica','Sangue na Trilha','Caçada Final','poison','poison']],
 ladino:[['assassino','Assassino','Ponto Fraco','Lâmina Fatal','Sede de Execução','Golpe do Carrasco','physical','execute'],['sombra','Sombra','Passo Fantasma','Corte Espectral','Véu das Sombras','Noite Sem Fim','dark','damage']]
};
export const specOptions=cls=>(SPECIALIZATIONS[cls]||[]).map(([id,name,passive,skill,improved,ultimate,element,type])=>({id,name,passive,skill,improved,ultimate,element,type}));
export function selectedSpec(state){return specOptions(state?.cls).find(s=>s.id===state?.specializations?.selected)||null;}
export function chooseSpec(state,id){if(!state||state.lv<50||state.combat||state.specializations?.selected||!specOptions(state.cls).some(x=>x.id===id))return false;state.specializations??={selected:null,unlocked:[]};state.specializations.selected=id;state.specializations.unlocked=[50];return true;}
export function specSkills(state){const s=selectedSpec(state);if(!s)return [];return [{level:60,name:s.skill,cost:22,mult:2.15,element:s.element,type:s.type},{level:90,name:s.ultimate,cost:45,mult:3.5,element:s.element,type:s.type}].filter(x=>state.lv>=x.level);}
export function specBonuses(state, hpRatio=1){const s=selectedSpec(state),b={attack:0,magic:0,def:0,md:0,crit:0,dodge:0,hit:0,regen:0,leech:0,damageReduction:0,elemental:0,extraAttack:0,statusDuration:0};if(!s)return b;const improved=state.lv>=75;
 switch(s.id){
 case 'berserker':b.attack=improved?.17:.09;b.crit=improved?9:5;if(hpRatio<.45)b.attack+=improved?.15:.08;break;
 case 'guardiao':b.def=improved?.23:.12;b.md=improved?.16:.08;b.damageReduction=improved?.12:.06;break;
 case 'arquimago':b.magic=improved?.18:.10;b.elemental=improved?.14:.07;b.regen=improved?5:2;break;
 case 'feiticeiro':b.magic=improved?.09:.05;b.statusDuration=improved?2:1;b.elemental=improved?.10:.05;break;
 case 'atirador':b.hit=improved?10:6;b.crit=improved?11:6;b.attack=improved?.10:.05;break;
 case 'cacador':b.attack=improved?.10:.05;b.extraAttack=improved?.16:.08;b.statusDuration=improved?2:1;break;
 case 'assassino':b.crit=improved?13:7;b.attack=improved?.14:.07;break;
 case 'sombra':b.dodge=improved?12:7;b.damageReduction=improved?.10:.05;b.leech=improved?5:2;break;
 }return b;}

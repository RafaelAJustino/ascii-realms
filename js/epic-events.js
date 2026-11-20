/** Encontros narrativos da Expansão Épica. Todos têm ID estável e recompensa única. */
export const EPIC_EVENTS = Object.freeze([
 {id:'road-toll',title:'Pedágio dos Saqueadores',description:'Homens armados bloqueiam a estrada. O capitão exige 35 moedas de ouro.',regions:[0,1,3,4],paths:['unknown','dangerous'],choices:[
  {id:'pay',label:'Pagar 35 ouro',requires:{gold:35},effect:{payGold:35,flag:'tollPaid'},text:'Os bandidos liberam a estrada, mas agora conhecem seu rosto.'},
  {id:'intimidate',label:'Intimidar o capitão (Força 8)',requires:{stat:0,min:8},effect:{gold:16,flag:'tollIntimidated'},text:'O capitão recua e abandona algumas moedas roubadas.'},
  {id:'fight',label:'Enfrentar os saqueadores',effect:{combat:true,enemyKind:'bandit',flag:'tollFought'},text:'Você desembainha a arma diante dos saqueadores.'},
  {id:'retreat',label:'Recuar pela mata',effect:{damagePercent:5},text:'Você escapa pelo mato, sofrendo alguns arranhões.'}]},
 {id:'caravan-ledger',title:'Livro de Contas Rasgado',description:'Uma carroça tombada esconde registros de pagamentos a uma quadrilha.',regions:[0,1,3,4],choices:[
  {id:'keep',label:'Guardar o livro',effect:{flag:'banditLedger',material:1},text:'Os nomes registrados poderão ajudá-lo a encontrar os responsáveis.'},
  {id:'sell',label:'Vender as páginas',effect:{gold:28,flag:'ledgerSold'},text:'Um comprador desconhecido paga pelo silêncio.'},
  {id:'burn',label:'Queimar os registros',effect:{},text:'As provas desaparecem entre as cinzas.'}]},
 {id:'bandit-hideout',title:'Esconderijo da Estrada Cinzenta',description:'Os registros indicam uma gruta protegida por sentinelas.',regions:[0,1,3,4],paths:['unknown','dangerous'],requires:{flag:'banditLedger'},choices:[
  {id:'assault',label:'Atacar o esconderijo',effect:{combat:true,enemyKind:'bandit',flag:'hideoutAssault'},text:'Você força passagem até o esconderijo.'},
  {id:'spy',label:'Observar as sentinelas (Destreza 8)',requires:{stat:3,min:8},effect:{gold:22,flag:'hideoutScouted'},text:'Você encontra um depósito de moedas sem alertar a guarda.'},
  {id:'warn',label:'Avisar a vila',effect:{flag:'hideoutReported'},text:'Os moradores recebem informações sobre o esconderijo.'}]},
 {id:'bandit-deserter',title:'Desertor Amedrontado',description:'Um antigo saqueador oferece informações em troca de proteção.',regions:[0,1,3,4],choices:[
  {id:'listen',label:'Ouvir a confissão',effect:{flag:'banditWitness',mpPercent:8},text:'Você descobre a rota usada pela quadrilha.'},
  {id:'demand',label:'Exigir sua bolsa',effect:{gold:18},text:'O desertor entrega o pouco ouro que lhe resta.'},
  {id:'turn-away',label:'Mandá-lo embora',effect:{},text:'Ele desaparece antes de contar sua história.'}]},
 {id:'witness-confrontation',title:'O Nome do Contratante',description:'A pista do desertor leva a um intermediário protegido por mercenários.',regions:[1,3,4],requires:{flag:'banditWitness'},choices:[
  {id:'confront',label:'Confrontar os mercenários',effect:{combat:true,enemyKind:'bandit',flag:'conspiracyFaced'},text:'As armas dos mercenários são sua resposta.'},
  {id:'record',label:'Registrar a prova',effect:{flag:'conspiracyEvidence',material:2},text:'Um documento revela uma rede de pagamentos.'},
  {id:'withdraw',label:'Abandonar a investigação',effect:{},text:'O intermediário permanece nas sombras.'}]},
 {id:'hungry-refugees',title:'Refugiados da Fronteira',description:'Famílias famintas procuram abrigo antes do anoitecer.',regions:[0,1,2,3,4],choices:[
  {id:'feed',label:'Oferecer 15 ouro em mantimentos',requires:{gold:15},effect:{payGold:15,flag:'refugeesHelped',hpPercent:5},text:'As famílias conseguem prosseguir em segurança.'},
  {id:'guide',label:'Indicar uma rota',effect:{flag:'refugeesGuided'},text:'Você aponta o caminho até o povoado.'},
  {id:'leave',label:'Seguir viagem',effect:{},text:'O grupo continua esperando socorro.'}]},
 {id:'watchtower-smoke',title:'Fumaça na Torre de Vigia',description:'Uma antiga torre emite sinais de fumaça entre os pinheiros.',regions:[0,3,4,6],choices:[
  {id:'investigate',label:'Investigar a torre',effect:{material:2,damagePercent:6},text:'Você encontra vestígios de um acampamento e sofre uma queda.'},
  {id:'signal',label:'Responder ao sinal',effect:{flag:'towerSignaled',mpPercent:10},text:'Uma figura distante responde com um sinal de paz.'},
  {id:'ignore',label:'Ignorar a torre',effect:{},text:'A fumaça some no horizonte.'}]},
 {id:'moonlit-shrine',title:'Santuário ao Luar',description:'A luz da lua revela símbolos sobre uma pedra esquecida.',regions:[2,4,6,8],choices:[
  {id:'decode',label:'Decifrar os símbolos (Inteligência 9)',requires:{stat:1,min:9},effect:{mpPercent:25,flag:'shrineDecoded'},text:'Uma antiga fórmula restaura sua concentração.'},
  {id:'search',label:'Buscar fragmentos',effect:{material:1},text:'Você recolhe um fragmento ritual.'},
  {id:'leave',label:'Respeitar o silêncio',effect:{},text:'Os símbolos desaparecem sob a neblina.'}]},
 {id:'venom-tracks',title:'Rastros de Veneno',description:'Marcas no solo conduzem a um ninho de predadores.',regions:[0,2,5,7],choices:[
  {id:'hunt',label:'Seguir os rastros',effect:{combat:true,enemyKind:'bandit',flag:'venomHunt'},text:'A vegetação se agita diante de sua aproximação.'},
  {id:'harvest',label:'Coletar ervas próximas',effect:{material:2,damagePercent:5},text:'Você colhe ervas, mas os espinhos o ferem.'},
  {id:'avoid',label:'Evitar o ninho',effect:{},text:'Os rastros desaparecem na trilha.'}]},
 {id:'forgotten-letter',title:'Carta Sem Destinatário',description:'Uma carta lacrada descansa junto a uma mochila abandonada.',regions:[0,1,4,5],choices:[
  {id:'read',label:'Ler a carta',effect:{flag:'letterRead'},text:'Você descobre o nome de um soldado desaparecido.'},
  {id:'keep',label:'Guardar a carta lacrada',effect:{flag:'letterKept'},text:'O selo intacto poderá ser reconhecido no futuro.'},
  {id:'discard',label:'Deixar a carta',effect:{},text:'A carta permanece entregue ao vento.'}]},
 {id:'fallen-soldier',title:'Armadura do Soldado Perdido',description:'Uma insígnia sobre uma armadura lembra o nome descrito na carta.',regions:[3,4,5,6],requires:{flag:'letterRead'},choices:[
  {id:'honor',label:'Enterrar os restos',effect:{flag:'soldierHonored',mpPercent:12},text:'O gesto parece aliviar a inquietação do local.'},
  {id:'recover',label:'Recolher os materiais',effect:{material:2},text:'Você recupera metal de uma armadura danificada.'},
  {id:'leave',label:'Não perturbar o lugar',effect:{},text:'O campo permanece silencioso.'}]},
 {id:'masked-pilgrim',title:'Peregrino Mascarado',description:'Um viajante silencioso carrega um medalhão com símbolos antigos.',regions:[3,4,6,8],choices:[
  {id:'trade',label:'Negociar por 20 ouro',requires:{gold:20},effect:{payGold:20,material:2,flag:'pilgrimTrade'},text:'O peregrino entrega fragmentos que guardava.'},
  {id:'ask',label:'Perguntar sobre os símbolos',effect:{flag:'pilgrimQuestioned'},text:'Ele menciona um selo enterrado nas antigas ruínas.'},
  {id:'ignore',label:'Deixar o peregrino partir',effect:{},text:'Ele desaparece na neblina.'}]},
 {id:'broken-bridge',title:'Ponte Destruída',description:'Um rio violento corta o único caminho visível.',regions:[0,1,3,5],choices:[
  {id:'cross',label:'Atravessar pelas pedras (Agilidade 8)',requires:{stat:2,min:8},effect:{gold:14},text:'Você alcança uma margem com moedas esquecidas.'},
  {id:'repair',label:'Improvisar uma travessia',effect:{material:1,damagePercent:6},text:'Sua travessia improvisada termina com um ferimento leve.'},
  {id:'detour',label:'Procurar outro caminho',effect:{},text:'Você encontra uma passagem mais longa.'}]},
 {id:'mining-dispute',title:'Disputa na Mina',description:'Dois mineiros discutem a posse de um veio recém-descoberto.',regions:[1,3,4,7],choices:[
  {id:'mediate',label:'Mediar o conflito (Inteligência 8)',requires:{stat:1,min:8},effect:{gold:12,flag:'minersReconciled'},text:'Os mineiros repartem o veio e agradecem pelo acordo.'},
  {id:'side',label:'Ajudar um dos lados',effect:{material:2},text:'Um mineiro lhe entrega parte de sua coleta.'},
  {id:'leave',label:'Não interferir',effect:{},text:'As vozes ficam para trás.'}]},
 {id:'frozen-camp',title:'Fogueira Sob a Neve',description:'Uma fogueira fraca revela caçadores perdidos em meio ao frio.',regions:[5],choices:[
  {id:'shelter',label:'Ajudar com um abrigo',effect:{flag:'huntersSheltered',hpPercent:15},text:'Os caçadores compartilham um chá restaurador.'},
  {id:'supplies',label:'Procurar provisões',effect:{material:2,damagePercent:5},text:'Você encontra suprimentos, mas sofre com o frio.'},
  {id:'pass',label:'Prosseguir',effect:{},text:'A tempestade encobre o acampamento.'}]},
 {id:'ashen-offering',title:'Oferenda nas Cinzas',description:'Uma taça de pedra fumega em um círculo de cinzas.',regions:[7],choices:[
  {id:'study',label:'Estudar a oferenda (Inteligência 11)',requires:{stat:1,min:11},effect:{mpPercent:20,flag:'ashesStudied'},text:'Você identifica a origem do ritual.'},
  {id:'take',label:'Recolher o material',effect:{material:2,damagePercent:8},text:'O calor o fere, mas um fragmento é recuperado.'},
  {id:'leave',label:'Não tocar nas cinzas',effect:{},text:'A taça continua fumegando.'}]},
 {id:'celestial-envoy',title:'Mensageiro da Aurora',description:'Uma figura encapuzada pede ajuda para proteger um relicário.',regions:[8],choices:[
  {id:'help',label:'Aceitar proteger o relicário',effect:{flag:'reliquaryGuarded',hpPercent:18},text:'O mensageiro compartilha sua bênção.'},
  {id:'refuse',label:'Recusar o pedido',effect:{},text:'O mensageiro parte em silêncio.'}]},
 {id:'void-whispers',title:'Sussurros do Vazio',description:'Uma voz antiga oferece respostas que nenhum mortal deveria ouvir.',regions:[9],choices:[
  {id:'listen',label:'Ouvir a voz',effect:{flag:'voidHeard',mpPercent:20,damagePercent:8},text:'Uma revelação atravessa sua mente e deixa marcas.'},
  {id:'seal',label:'Selar a fenda',effect:{material:2,flag:'voidSealed'},text:'A fenda se fecha e deixa dois fragmentos.'},
  {id:'run',label:'Recuar',effect:{},text:'Os sussurros desaparecem.'}]},
 {id:'stolen-medicine',title:'Remédios Roubados',description:'Um saqueador ferido carrega medicamentos marcados com o selo da cidade.',regions:[0,1,2,3,4],choices:[
  {id:'recover',label:'Recuperar os remédios',effect:{potion:'hp',flag:'medicinesRecovered'},text:'Você recupera uma poção de vida.'},
  {id:'spare',label:'Poupar o saqueador',effect:{flag:'banditSpared'},text:'Ele promete deixar as estradas.'},
  {id:'fight',label:'Atacar o saqueador',effect:{combat:true,enemyKind:'bandit'},text:'O saqueador tenta resistir.'}]},
 {id:'ambushed-messenger',title:'Mensageiro Encurralado',description:'Flechas prendem um mensageiro contra as ruínas de um muro.',regions:[0,1,3,4,6],paths:['unknown','dangerous'],choices:[
  {id:'defend',label:'Defender o mensageiro',effect:{combat:true,enemyKind:'bandit',flag:'messengerDefended'},text:'Você avança contra os arqueiros ocultos.'},
  {id:'divert',label:'Criar uma distração (Destreza 9)',requires:{stat:3,min:9},effect:{gold:20,flag:'messengerSaved'},text:'O mensageiro escapa e oferece sua bolsa como agradecimento.'},
  {id:'escape',label:'Deixar a emboscada',effect:{},text:'Você evita os projéteis e segue viagem.'}]}
]);

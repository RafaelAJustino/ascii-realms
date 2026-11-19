# ASCII REALMS

RPG ASCII de navegador, refatorado em módulos ES6, sem dependências externas de execução.

## Execução

Abra `index.html` em um servidor HTTP estático (por exemplo, Live Server do VS Code). Módulos ES6 não devem ser abertos diretamente com `file://`.

## Testes

Com Node.js 18 ou superior, execute `npm test`. Os testes verificam criação de personagem, combate assíncrono, renderização, persistência, comércio e acesso a áreas.

## Compatibilidade do salvamento

A chave `ascii-realms-save-v1` e o formato de salvamento versão 1 foram preservados. Um combate interrompido por atualização de página é descartado com segurança ao carregar.

## Organização

- `js/data.js` e `js/artworks.js`: conteúdo, classes, mapas, habilidades e artes.
- `js/player.js`, `js/combat.js`, `js/monsters.js`, `js/equipment.js`, `js/shops.js`, `js/exploration.js`, `js/storage.js`: sistemas do jogo.
- `js/runtime.js`, `js/ui.js`, `js/ui-helpers.js`, `js/main.js`: estado, interface e navegação.
- `css/`: variáveis, layout, componentes, combate, animações e responsividade.

## Observações

O combate agora possui bloqueio de ações simultâneas e um intervalo de 950 ms antes do turno inimigo. As artes são ajustadas à largura disponível. Os testes automatizados não substituem a verificação visual em navegadores e dispositivos reais.

## Atualização de criaturas, IA e recompensas
- 30 espécies base distribuídas em 10 biomas, com quatro categorias de encontro (Errante, Feroz, Veterano e Alfa) conforme o nível da área.
- IA inimiga com reserva de mana, chance de habilidade especial, veneno e cura de emergência para chefes.
- Monstros comuns: 4,5% de chance de equipamento, 43% de material temático e 13% de consumível. Itens comuns, incomuns e raros (raros muito excepcionais).
- Chefes: 100% de equipamento raro ou superior na primeira vitória; 20% nas seguintes. Materiais de chefes e poções possuem tabelas próprias.
- Equipamentos têm nomes vinculados ao bioma e nível do inimigo. A classe determina compatibilidade das armas; espécie determina o slot de equipamento.
- A chave do salvamento continua `ascii-realms-save-v1` e itens antigos permanecem utilizáveis.


## Atualização visual ASCII

- 30 monstros comuns e 10 chefes com desenhos ASCII exclusivos, com corpo inteiro e silhuetas distintas.
- 10 cidades com cenários próprios no mapa e na tela da cidade.
- `js/artworks.js` e `js/city-artworks.js` armazenam as ilustrações separadas da lógica.
- `fitAscii` calcula a fonte conforme a largura real da cena, sem quebra de linhas.
- O projeto continua sem dependências externas e mantém a chave original de LocalStorage.

## Etapa 1: arquitetura e persistência (v2)

- `js/state-schema.js`: versão atual, validação, migração aditiva e campos reservados para expansões.
- `js/storage.js`: migração v1→v2, backup anterior à migração (`ascii-realms-save-v1-pre-migration`), backup válido (`ascii-realms-save-v1-backup`) e recuperação automática.
- `js/operations.js`: serialização síncrona de operações da interface, com bloqueio de reentrada. O combate assíncrono mantém sua própria trava `rt.busy`.
- `js/main.js`: ações de atributos, equipamentos e comércio passam pela proteção de reentrada.
- `js/player.js`: criação de personagens já inicia na versão 2.
- `js/combat.js`: estatísticas básicas de vitórias, chefes e derrotas, sem mudar regras de combate.
- `tests/persistence.mjs`: testes de migração, backup, falha, restauração e operações.

A chave principal do LocalStorage não mudou: `ascii-realms-save-v1`. A versão dos dados dentro dela agora é `2`. Os novos campos são apenas estruturas de dados, sem novas mecânicas de jogo. A recarga durante combate restaura um estado seguro fora da batalha.

Execute `npm test` para verificar os testes automatizados. Testes visuais em navegadores e testes completos de campanha não estão incluídos.

## Etapa 2: inteligência e elementos

- `js/monster-ai.js`: seis arquétipos, pontuação de ações, MP e recargas. Comuns usam maior variação aleatória; raridades altas tomam decisões mais consistentes.
- `js/elements.js`: perfis temáticos das 30 espécies e 10 chefes, afinidades elementais, tipos das habilidades do jogador e multiplicadores de dano.
- `js/monsters.js`: atribui o perfil e o elemento à instância, sem alterar a distribuição de raridades ou o catálogo original.
- `js/combat.js`: IA, feedback elemental e cálculo do dano após uma única mitigação por defesa. Mantém o intervalo de 950 ms.
- `tests/elemental-ai.mjs`: testes de perfis, pontuação, MP, recargas, afinidades e raridades.

A versão do salvamento permanece v2. Campos adicionais de combate são transitórios, e o carregamento continua descartando combates interrompidos com segurança. As fraquezas do jogador são neutras por padrão; a estrutura `elementalAffinities` permite futuras resistências de equipamentos sem introduzir novas mecânicas agora.

## Etapa 3: fases dos chefes

Os 10 chefes têm três fases (HP >70%, 70% a 40%, <40%). As transições ocorrem uma única vez por encontro, mesmo quando um golpe atravessa dois limites. A partir da fase 2 podem preparar ataques exclusivos; a preparação consome a ação e o jogador recebe um turno para reagir. O golpe é executado na ação seguinte do chefe, sujeito a atordoamento. Os ataques especiais respeitam defesa, elementos e postura defensiva, com limite de 65% do HP máximo do jogador por golpe. Não altera HP, EXP, ouro ou recompensas base dos chefes. Testes: `npm test`.

## Etapa 4: Missões, bestiário e estatísticas

- 50 missões em `js/progression.js`: duas caçadas, uma coleta, uma exploração e um chefe por região. Aceitação e entrega na cidade, recompensas únicas.
- Bestiário em `js/progression-ui.js`, revelando dados aos 1, 5 e 10 triunfos por espécie; encontros e derrotas também são registrados.
- Estatísticas acumuladas a partir de eventos efetivos. Tempo de jogo contabilizado apenas enquanto a página permanece visível. Valores históricos desconhecidos não são estimados.
- Salvamento v3, com migração automática de v1/v2 e cópias de segurança pré-migração.
- `npm test` executa também `tests/progression.mjs`.


## Etapa 5: ferraria
Salvamento v4. Receitas por região, materiais de exploração e drops, aprimoramento +0 a +10 sem perda de níveis em falhas e dez conjuntos com bônus cumulativos. Os bônus de aprimoramento usam atributos originais e são calculados dinamicamente, sem mutar os atributos do item.

## Etapa 6: Masmorras e especializações

- Dez masmorras opcionais, uma por região. Cada tentativa possui cinco salas: combate, combate/armadilha, santuário, elite e chefe exclusivo. HP/MP são mantidos entre salas; não há lojas ou fuga de combate dentro da masmorra.
- É possível abandonar a tentativa entre combates. Em caso de derrota, a tentativa termina. A primeira conclusão concede uma relíquia rara regional; conclusões posteriores concedem EXP e ouro sem repetir a relíquia.
- O progresso e a recompensa única são registrados no salvamento v5. Se a página for recarregada durante um combate, o jogador volta ao início da mesma sala, sem recompensa duplicada.
- Oito especializações (duas por classe), escolhidas de forma definitiva no nível 50, com passiva inicial, habilidade ativa no nível 60, reforço no nível 75 e habilidade final no nível 90.
- Os bônus das especializações são derivados dinamicamente nos atributos; as habilidades originais continuam disponíveis.
- Execute `npm test` para os testes de regressão e os testes específicos de masmorras e especializações.

Limitações conhecidas: o balanceamento de todas as masmorras em uma campanha completa e a experiência visual em celulares ainda requerem testes manuais no navegador.

## Etapa 7: animações e revisão

- `js/ascii-animation.js`: quadros ASCII de deslocamento discreto, animação de respiração, preparação, ataque e impacto. Um único intervalo é utilizado no combate e cancelado ao sair da tela. Respeita `prefers-reduced-motion`.
- `css/visual-polish.css`: efeitos CSS de impacto, críticos, cura, fogo, gelo, veneno, fases dos chefes e melhorias de toque/responsividade. O jogo continua limitado a 720px de largura e 100dvh de altura.
- `tests/final-review.mjs`: verifica proporções dos quadros, níveis 1/10/25/50/75/100 nas quatro classes, atributos finitos, evolução de EXP até 100 e persistência, além de produzir **estimativas matemáticas** de dano e sobrevivência.
- `npm test`: executa a suíte de regressão de todas as etapas e o teste final.

### Limitações da validação

As estimativas de dano e sobrevivência não constituem simulação completa de combate: não incluem equipamento otimizado, habilidades ativas, IA, efeitos ou consumíveis. Não foram medidos consumo real de mana, tempo real de combate, economia completa nem dificuldade dos dez chefes em campanhas reais. A tentativa de capturar a interface em Chromium headless não produziu captura nesta execução. Assim, responsividade visual em navegadores e jogabilidade integral de nível 1 a 100 ainda precisam de validação manual. Os testes de nível 1 a 100 verificam a progressão de EXP, não uma campanha jogada.

## Reformulação visual de alta densidade (parcial)

Novas artes independentes em `js/artworks-detailed.js` (Lobo, Esqueleto, Guardião das Raízes, Dragão Glacial) e `js/cities-detailed.js` (Vila das Folhas, Fortaleza de Ferro, Vila da Neve). As demais artes mantêm a versão anterior. `fitAscii` ajusta largura e altura e permite ampliação em diálogo quando a arte fica muito pequena. A animação preserva todos os caracteres da arte. Nenhuma mecânica foi modificada.

**Pendente:** reformular as demais espécies, chefes e cidades; verificar manualmente telas de 320, 375 e 430 px em navegadores reais. Os testes automatizados de regressão passam, mas não substituem inspeção artística e responsiva.

## Reformulacao das artes em ASCII padrao

Esta atualizacao e **apenas visual**. O sistema de combate, a economia, a progressao e a chave e formato do LocalStorage continuam os mesmos (v5).

- `js/artworks-detailed.js`: 30 especies + 10 chefes principais, cada um com uma arte original, baseada no nome canonico.
- `js/cities-detailed.js`: dez cidades com arquitetura diferenciada.
- `js/dungeon-artworks.js`: dez cenarios subterraneos e dez chefes exclusivos opcionais.
- `js/hero-artworks.js`: quatro representacoes das classes.
- `js/ascii-animation.js`: quatro quadros por criatura com variacoes de detalhes de largura constante, mais os efeitos CSS de ataque e impacto existentes.
- `js/ascii-validator.js`: verifica largura ate 50 colunas, ASCII imprimivel (32-126), IDs, quadros e alinhamento. Em localhost, emite aviso no console quando encontrar problemas.
- `tests/ascii-art.mjs`: testes automatizados de cobertura de artes, sintaxe e estimativa de ajuste em 320, 375, 430 e 720 pixels. Executar com `npm test`.

As artes sao mostradas em `<pre>` com fonte monoespacada e sem quebra de linha. Se a arte ficar pequena, clicar nela permite visualiza-la ampliada. Os testes de tamanhos sao estimativas matematicas; a inspeção manual em navegadores reais continua recomendada.

## Padronização dos botões e navegação do combate

- Variáveis CSS em `css/variables.css`: `--button-height`, `--button-gap`, `--button-padding` e `--button-radius`.
- Regras centralizadas em `css/button-layout.css`; botões com área de toque mínima de 48px, estilo de foco visível e grades responsivas.
- O menu **Atacar** permanece aberto após ataques comuns, habilidades e turnos completos do monstro. O jogador usa **Voltar** para mudar de submenu. A navegação retorna ao menu principal somente ao iniciar/terminar o combate.
- Ataque comum com largura total e altura de 80px, quatro habilidades da classe sempre visíveis em grade 2x2 com altura uniforme de 80px. As habilidades da especialização aparecem em seção adicional separada, sem deslocar as quatro habilidades originais.
- O bloqueio assíncrono `rt.busy` agora também se reflete no atributo HTML `disabled` dos controles de combate. Cliques repetidos continuam ignorados pelo controlador de turnos.
- `tests/combat-layout.mjs` verifica navegação, bloqueio, grade, botões de habilidade, vitória e salvamento v5. Executar `npm test` para todos os testes.
- Verificação adicional realizada com Chromium via protocolo de depuração em 320, 375, 430 e 720px, utilizando documento de teste com os estilos reais. Essa verificação cobre o layout de ataques; não substitui a inspeção manual de todos os menus em dispositivos físicos.


## Layout compacto de combate

Durante o combate, o cabeçalho exibe apenas ASCII REALMS e a navegação principal não é renderizada. A grade de ataque comum + quatro habilidades mantém botões de 42px com espaçamento de 6px. As artes ASCII são ajustadas por largura e altura com limite superior de 6px; fora do combate, a navegação original permanece. O histórico usa rolagem interna. O submenu de ataques continua aberto entre turnos. A persistência v5 não foi alterada.

**Validação:** testes automatizados executados em Node. A validação visual real em navegador não foi concluída porque o ambiente bloqueou a navegação do Chromium para arquivos locais e localhost. A visibilidade simultânea de todos os elementos em cada resolução ainda precisa ser conferida manualmente.

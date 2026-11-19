**Versão atual: Jornada Contínua, Etapa 7 (reformulada, sem companheiros).**

## Etapa 7 reformulada: clima, ciclo do tempo e acontecimentos regionais

A base desta versão é a **Etapa 6**, não a versão antiga da Etapa 7. **Não há companheiros recrutáveis, habilidades de aliados ou turnos automáticos de companheiros.**

- `js/world-climate.js`: relógio interno (12 ações por dia), alternância de dia/noite, clima regional por períodos de quatro ações e acontecimentos regionais com duração limitada.
- O tempo avança após ações efetivas de exploração e descanso em acampamento, nunca durante a simples renderização ou o carregamento. O ciclo não depende do relógio do dispositivo.
- Condições regionais influenciam a chance de combate em até alguns pontos percentuais e a probabilidade de eventos narrativos no ramo não hostil. Todos os modificadores são limitados ao intervalo válido de probabilidade. As recompensas, o cálculo de dano e a progressão permanecem iguais.
- Clima e eventos aparecem na tela principal, na seleção e acompanhamento de caminhos, no acampamento, na cidade e na taverna. Não há bloqueios de serviços essenciais nem recompensas especiais repetíveis.
- Os acontecimentos regionais são verificados apenas a cada seis ações de avanço, com 20% de chance por verificação elegível. Duram sete ações de tempo de jogo. A tabela possui incursão de monstros, caravana desaparecida, festival, escassez e vestígios antigos.
- Salvamento **v10**, migrado de v1 a v9 e compatível com a versão v10 antiga de companheiros: a propriedade `companions` é removida no carregamento e novos personagens não a recebem. A chave de LocalStorage e os backups permanecem os mesmos.
- `tests/world-climate.mjs`: relógio, eventos, risco, persistência, normalização e ausência de companheiros.

**Histórico da versão: Jornada Contínua, Etapa 5 de 9.** Esta versão inclui todas as etapas 1 a 5 da sequência iniciada em Botão Voltar Sticky. As seções abaixo documentam a evolução histórica do projeto; menções a etapas futuras em seções anteriores referem-se ao momento daquela entrega.

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

## UX/UI compacta (novembro de 2026)
- Mercante viajante: preço real obtido de `potionPrice`, identificação de ouro insuficiente e compra bloqueada quando necessário. Catálogo de equipamentos exibe raridade, nível e preço.
- Criação: campos de nome e classe com 100% da largura útil, rótulos associados e foco visível.
- Padrão CSS compartilhado em `css/ux-unified.css`: espaçamento 8px, altura de botões 40px, máximo 50px, fonte monoespaçada, feedback de foco e estados desabilitados.
- Combate: medidores acessíveis e proporcionais de HP (herói/inimigo) e MP (herói), com valores numéricos. Nenhuma regra de dano, mana ou salvamento foi alterada.
- Testes: `npm test` inclui `tests/ux-unified.mjs`. São testes automatizados estruturais e funcionais já existentes; a inspeção visual real em todas as resoluções solicitadas permanece pendente, pois o Chromium não completou a inicialização no ambiente de testes.

## Aba Herói: distribuição provisória

Os seis atributos exibem descrições fundamentadas em `player.stats`. Os botões + e - alteram somente a distribuição temporária em memória (`js/hero-distribution.js`); a prévia utiliza a própria função `stats(atributosProvisorios)`, incluindo equipamentos, conjuntos, passivas e especialização. Apenas **Aplicar pontos** altera os atributos permanentes e grava no LocalStorage. **Descartar alterações** restaura a prévia sem salvar. Ao sair da aba com pontos pendentes, há confirmação.

## Navegação principal (atualização)

A barra inferior foi removida. A tela de mundo agora concentra Explorar, Selecionar Mapa, Visitar Cidade e Jogador, nesta ordem. Explorar e Jogador ocupam a largura completa; Mapa e Cidade dividem uma grade de duas colunas. O menu Jogador reúne Herói, Inventário, Equipamentos (acesso à seção de equipamentos do inventário), Habilidades, Missões, Bestiário, Estatísticas e Especialização. As missões podem ser abertas na cidade e acompanhadas no menu Jogador. Ferraria e Masmorras continuam na cidade.

A tela de entrada mostra Continuar, Novo Jogo e Excluir Jogo em coluna, com confirmação antes da exclusão. O menu anterior é preservado temporariamente para permitir retorno, sem alterar o formato do salvamento.

Teste adicional: `node tests/main-navigation.mjs`. Os testes estruturais de navegação não substituem inspeção visual em dispositivos físicos.

## Preservação de rolagem e foco

A função `render()` distingue atualizações na mesma tela de navegação real por meio de `lastRenderedScreen`. Para atualizações, `js/viewport-state.js` registra a rolagem do documento e dos contêineres internos e restaura suas posições com limites válidos, além do foco com `preventScroll`. Ao mudar de tela, a rolagem principal e do conteúdo é reiniciada. A distribuição provisória de atributos utiliza `updateHeroDistribution()` para atualizar apenas saldos, valores, botões e prévia, mantendo os elementos interativos existentes. Nenhum dado temporário é persistido por essa rotina.

Teste adicional: `node tests/viewport-state.mjs`. Os testes automatizados não substituem inspeção visual e interação manual em navegadores e tamanhos de tela reais.

### Navegação sticky (19/11/2026)
- `css/menu-sticky.css`: botão `< VOLTAR` com `position: sticky` no topo do contêiner `.content`, sem barra fixa.
- `js/menu-history.js`: histórico temporário de telas, loja e posição de rolagem; não é gravado no LocalStorage.
- `js/ui.js`: um único botão superior em menus secundários; remove botões de retorno redundantes, preservando o menu específico de combate.
- `js/main.js`: retorno pela hierarquia visitada, com confirmação de distribuição provisória de atributos e recuperação de rolagem.
- `tests/sticky-back.mjs`: testes de estrutura CSS e histórico. A inspeção visual real em dispositivos ainda deve ser realizada.

## Mundo Vivo: Etapa 1 de 9 (novo fluxo de exploração)

Base: **Botão Voltar Sticky**. Não inclui as antigas expansões Mundo Vivo.

- `Explorar` abre somente a seleção Seguro / Desconhecido / Perigoso.
- Depois da escolha, o caminho fica persistido em `journey` no salvamento v6.
- `Continuar explorando` gera o próximo resultado pelo sistema de exploração original.
- Ao vencer combates comuns, retorna à jornada com o resumo do resultado. Ao fugir, também retorna. Ao ser derrotado ou desmaiar, volta à cidade.
- Um mercante viajante retorna à jornada pelo botão Voltar.
- `Voltar para cidade` encerra o caminho e abre os serviços urbanos.
- Caminhos modificam SOMENTE a chance de combate: Seguro 72%, Desconhecido 80% (original), Perigoso 86%.
- O restante se distribui proporcionalmente: mercante 50%, armadilha 25%, materiais 25%. Inimigos, raridade, dano e recompensas continuam com as regras originais.
- A área é validada contra nível e desbloqueio. A jornada é invalidada ao trocar de área.
- Após recarga o caminho ativo reaparece sem gerar novo encontro. Salvamentos de v1 a v5 migram para v6 com backup.
- Esta entrega contempla **somente a Etapa 1**. Eventos narrativos, acampamentos, velocidades e os demais sistemas permanecem nas etapas seguintes.


## Mundo Vivo: Etapa 2 de 9 (eventos narrativos e acampamentos)

Base: **Jornada Contínua, Etapa 1**, originada da versão **Botão Voltar Sticky**. Não incorpora a antiga sequência Mundo Vivo.

- Dez eventos narrativos **únicos**, identificados por IDs persistentes, com duas a três escolhas cada. Algumas ações exigem consumíveis. As escolhas podem gerar ouro, materiais regionais, poções, cura, recuperação de mana, dano controlado, um combate ou sinais narrativos persistentes (`narrative.flags`).
- O evento é apresentado **no caminho selecionado** depois de `CONTINUAR EXPLORANDO`. Enquanto estiver pendente, não se pode gerar outro encontro nem abandonar o evento. O evento pendente volta após recarga, sem recompensas duplicadas. Depois da escolha, a jornada continua no mesmo caminho.
- A probabilidade de combate não foi alterada (Seguro 72%, Desconhecido 80%, Perigoso 86%). **Somente após um resultado não-hostil**, e enquanto houver eventos inéditos, é sorteado evento narrativo com probabilidade de 55% / 65% / 70% respectivamente. Caso não ocorra um evento, usa-se a distribuição não-hostil anterior: mercante 50%, armadilha 25% e materiais 25%.
- **Acampamento** acessível no caminho ativo, com recuperação de 25% do HP/MP máximo ao descansar; custo de 10 ouro; intervalo mínimo de 5 ações de exploração entre descansos (contagem persiste mesmo após encerrar o caminho); 10% de possibilidade de emboscada, que usa o combate normal. Após vencer ou fugir da emboscada, o jogador retorna ao caminho.
- É possível utilizar poções existentes de vida, mana e elixir no acampamento, sem duplicar inventário, efeitos ou preços. O acampamento não substitui serviços urbanos.
- Salvamento **v7**: acrescenta `narrative` e `journey.event`, preservando todos os demais campos. Migração de v1–v6 mantém os backups da estratégia já existente. O registro de escolhas permanece após retornar à cidade; dados de evento pendente só persistem enquanto a jornada estiver ativa.
- O layout continua mobile-first: controles de 42px, grade de uma coluna para escolhas, sem nova navegação inferior. Botão Voltar sticky do acampamento retorna ao caminho.
- Testes: `node tests/journey-events.mjs`, `node tests/journey-events-flow.mjs` e `npm test`. Ainda é necessária inspeção visual real em smartphone/desktop.
- **Etapa 3** (velocidades de combate) ainda não foi implementada.


## Jornada Contínua: Etapa 3 (velocidade do combate)

- O combate permite **Normal**, **Rápido** (padrão) e **Instantâneo**. A preferência fica em `ascii-realms-combat-speed`, separada do salvamento do personagem, e não altera estatísticas, dano ou turnos.
- Tempos visuais (feedback / impacto no inimigo / preparo inimigo / impacto no herói): Normal **100 / 230 / 350 / 240 ms**, Rápido **40 / 160 / 230 / 150 ms**, Instantâneo **0 / 0 / 0 / 0 ms**. Esses tempos substituem os antigos 220 / 350 / 950 / 350 ms. O modo Instantâneo mantém a mesma ordem de ações, mas omite esperas visuais.
- O botão de saída da jornada agora aparece como **< VOLTAR PARA INÍCIO**, encerra o caminho e abre a tela principal (`world`), sem encaminhar à cidade. Ele permanece indisponível durante eventos com escolhas pendentes.
- A **Etapa 4** (ataques anunciados adicionais, reações elementais e padrões de monstros) ainda não foi iniciada. Os anúncios dos chefes e a IA anteriores continuam intactos.
- Teste: `npm test` inclui `tests/combat-speed.mjs` e a regressão de jornada. Testes visuais móveis e execução manual em navegador continuam necessários.

## Jornada Contínua, Etapa 4: anúncios e aprendizado

- Monstros não-chefes de raridade Elite (18%), Campeão (24%) e Lendário (30%) podem anunciar uma habilidade especial **disponível** no turno anterior. A verificação ocorre apenas quando a criatura possui MP e uma técnica ofensiva potente desbloqueada. O anúncio consome o turno do inimigo, e o golpe só consome MP e inicia recarga quando executado no turno seguinte. Uma nova preparação exige um intervalo de quatro ações do inimigo. Chefes mantêm seus próprios anúncios e fases.
- Reações elementais sobre efeitos já existentes no inimigo: **Fogo + Veneno** consome veneno para causar até 20% de dano adicional; **Gelo + Queimadura** consome queimadura e acrescenta até 10%. O bônus é limitado pelo HP restante, não se repete sem reaplicação do efeito e não ativa quando o golpe não causa dano.
- Bestiário registra técnicas realmente executadas e afinidades realmente testadas, sem revelar espécies desconhecidas. Após dois encontros revela o padrão de arquétipo da criatura. Dados são campos aditivos no bestiário do salvamento v7; não há migração nem reinicialização do progresso.
- Não há posturas de combate novas nem mudanças nas fórmulas-base, nos níveis, nos drops, na economia ou no sistema de progressão.
- Validação: `npm test`, incluindo `tests/combat-tactics.mjs`. A verificação visual em navegador continua recomendada.

## Jornada Contínua, Etapa 5: cidades, NPCs, tavernas e reputação

Base: Etapa 4 da Jornada Contínua. As Etapas 6 a 9 ainda não estão incluídas. **Não** incorpora a sequência antiga Mundo Vivo.

- **Taverna** acessível a partir de `Visitar Cidade`, com 10 moradores fixos (um para cada região), personalidade, conversas, rumores, contratos e desafio regional. A navegação mantém o botão Voltar sticky e o histórico existente.
- **Dois NPCs recorrentes:** Élio aparece depois de ajudar o viajante ferido; Tomás aparece depois de ajudar o mercador perdido. Eles reconhecem as escolhas anteriores mesmo ao migrar salvamentos v7. Conversas e recompensas especiais são registradas por ID, evitando duplicação.
- **Contratos:** referências diretas às 50 missões já existentes (`QUESTS`, `acceptQuest`, `questStatus`), sem criar um segundo sistema de missões.
- **Rumores:** referências às criaturas, chefes e materiais reais do mapa, incluindo pistas de passagem secreta quando o jogador já a identificou. Rumores vistos são registrados por região.
- **Atividade da taverna:** escolha entre três criaturas de regiões diferentes, apenas uma pertence ao mapa local. Uma tentativa por cidade, com prêmio único de 12 ouro e 3 pontos de reputação para acertos.
- **Reputação por cidade:** intervalo entre -30 e 100. Decisões narrativas reais afetam a reputação apenas uma vez por evento. Faixas de desconto em lojas locais: 0%, 5% a partir de 20, 10% a partir de 50 e 15% a partir de 80 pontos. O cálculo é centralizado em `cityPrice()`, aplicado tanto na interface quanto ao debitar o ouro. **O mercante viajante não recebe esses descontos.** Reputação elevada também modifica falas dos moradores.
- **Mercadores urbanos:** lote especial de raridade Incomum, ou Raro após ajudar o mercador perdido, com preço calculado pela fórmula já existente de `makeItem`. Apenas uma compra por cidade e por janela de seis explorações. O equipamento é gerado pelo sistema existente na compra, com atributos aleatórios indicados antes da confirmação.
- **Ferraria:** encomenda exclusiva uma vez por região, após concluir pelo menos uma missão local. Consome dois materiais regionais e ouro indicado na interface. O item produzido utiliza `makeItem()` e não substitui fabricação ou aprimoramento existentes.
- **Salvamento v8:** extensão aditiva `cityLife` para reputações, conversas, presentes, rumores, desafios, compras de estoque, encomendas e créditos narrativos. `normalizeSave()` migra v1-v7 sem excluir equipamentos, jornadas, bestiário, chefes ou missões, mantendo os backups existentes. Reputação antiga não é inventada retroativamente, pois os mapas onde as escolhas passadas aconteceram não estão armazenados.
- **Testes:** `npm test` inclui `tests/city-life.mjs`, com casos de integração e prevenção de duplicação. Teste visual complementar com Chromium sobre *snapshots HTML renderizados com os estilos reais* em 320 × 568, 375 × 667, 390 × 844, 430 × 932, 720 × 1280 e 1366 × 768 para Cidade, Taverna e Ferraria. Essa verificação não equivale a testes manuais completos de gameplay no navegador.


## Etapa 6. Conquistas, títulos, evolução de armas e variações de habilidades (v9)

- Conquistas verificadas a partir de dados existentes (explorações, vitórias, chefes, masmorras, missões, eventos, equipamentos e reputação), sem recompensas de atributos. Títulos equipáveis em **Jogador > Conquistas** e exibidos em **Herói**. Recompensas idempotentes, inclusive em carregamento de salvamentos antigos.
- Armas especiais elegíveis: armas épicas/lendárias e relíquias da primeira conclusão de masmorras. Apenas vitórias enquanto **equipada** contam. Evolução por 3 marcos (8/25/50 vitórias, 0/1/2 chefes, 0/1/2 missões resgatadas, 2/3/4 unidades do material regional). Bônus **de 3% do poder base da arma por estágio**, no máximo 9%; não multiplica nem substitui +0...+10. Evolução consome somente materiais, conforme mostrado na Ferraria.
- As quatro habilidades ativas de cada classe aceitam os perfis Original, Potência (1,12x efeito com 1,25x MP, arredondado) e Economia (0,92x efeito com 0,75x MP, arredondado). Habilidades defensivas mudam de 3 para 4/2 turnos. Seleção somente após desbloqueio e fora de combate. Nenhuma mudança na especialização ou custo original quando usando perfil Original.
- Salvo v9, com migração aditiva v1 a v8, e novos campos `achievements`, `skillVariants` e `item.evolution`; o salvamento original é preservado em backup de migração.
- Teste: `npm test`. A revisão visual e interativa completa requer um navegador.


## Etapa 8: Segredos e polimento

- Novo diário **Jogador > Descobertas**, com oito locais secretos distribuídos entre regiões existentes. Nenhum local é exibido como descoberto antes de uma escolha concluída.
- Após ao menos um evento narrativo concluído, segredos aparecem exclusivamente no resultado não-hostil das explorações, com chances base de 2,5% (seguro), 4,5% (desconhecido) e 6,5% (perigoso); o evento regional Vestígios antigos aumenta essa chance em 50%, até 10%. Os encontros hostis originais são preservados.
- Três guardiões secretos opcionais (regiões 3, 6 e 9), com chance de 1,2% por encontro hostil em caminho perigoso enquanto não derrotados. São variantes dos monstros da área, com +35% de HP e +12% de ataque; não desbloqueiam mapas nem contam como chefes principais.
- Primeira vitória contra cada guardião concede **uma arma rara**, utilizando `makeItem()` do sistema existente, sem duplicação após recarga. Demais recompensas do combate seguem as regras já implementadas.
- Descobertas concluídas usam o sistema existente de eventos narrativos, com escolhas e recompensas únicas. Estado adicional mínimo é salvo em `secrets` (versão 11). Nenhuma mecânica de companheiros foi adicionada.
- Os efeitos narrativos, drops e feedback utilizam os sistemas de recursos, estatísticas, combate e histórico já existentes.

## Avatares dinâmicos e animações ASCII

- `js/hero-avatar.js`: monta, a partir de `state.cls`, `state.equip` e `state.items`, avatares diferentes de Guerreiro, Mago, Arqueiro e Ladino. O visual utiliza os slots reais `head`, `body`, `hands`, `feet`, `weapon`, `ring` e `amulet`, com cor independente para cada raridade. A aparência é derivada no momento da renderização, sem persistir artes ou modificar equipamentos.
- `js/combat-visuals.js`: sequenciador visual efêmero baseado em Web Animations API. Usa movimentos, símbolos ASCII e efeitos de preparo, projétil e impacto, com efeitos específicos por classe e por habilidade. As habilidades dos monstros são diferenciadas por tipo e elemento. Não modifica dano, crítico, precisão, esquiva ou a IA.
- `css/dynamic-combat-art.css`: tintas por raridade, efeitos sobrepostos sem ocupar espaço na grade e suporte a movimento reduzido.
- Velocidade visual usa os modos `Normal`, `Rápido` e `Instantâneo` já existentes. O modo Instantâneo ignora a sequência decorativa, mas a lógica dos turnos é mantida. Quando o navegador indica preferência por movimento reduzido, as sequências decorativas também são suprimidas.
- A ordem visual agora é: preparar e lançar no DOM existente, resolver o ataque lógico, exibir o impacto, mostrar o resultado e iniciar o turno inimigo. Os botões são desabilitados durante a sequência e não são duplicados.
- `tests/dynamic-combat-art.mjs`: valida as quatro classes, sete slots visuais, coloração individual, os 16 efeitos das habilidades de classe, os ataques básicos, os efeitos de monstros, os três modos de velocidade e a integração. Os testes de regressão existentes continuam sendo executados.

**Limitação de validação:** foram feitas verificações visuais isoladas das quatro composições de avatar em seis larguras, sem rolagem horizontal. Os ataques animados, a movimentação durante combates reais e fluxos completos no navegador precisam de inspeção manual adicional.

## Reformulação dos avatares ASCII

- Quatro silhuetas refeitas, com grade fixa de 33 colunas e 22 linhas.
- Composição baseada nos slots existentes: head, body, hands, feet, weapon, ring e amulet.
- Armas com empunhadura conectada à mão; avatar desarmado sem arma flutuante.
- Cores de raridade aplicadas individualmente por peça usando as classes CSS já existentes.
- Integração preservada em Herói e combate. Animações anteriores continuam usando a mesma classe `.dynamic-hero`.
- Teste: `node tests/avatar-redesign.mjs` (e regressão completa via `npm test`).

A revisão visual foi realizada em uma prévia de composição ASCII. Não substitui a validação manual de todos os efeitos animados nas resoluções móveis.

# ASCII REALMS | Alta Densidade, Etapa 7

Esta entrega acrescenta **337 artes ASCII detalhadas**: 220 equipamentos, 30 materiais, 5 consumíveis/objetos, 32 NPCs e 50 cenas de eventos. Usa a **Etapa 6** como base e preserva combate, progressão, equipamentos, economia e salvamentos v14.

A arte detalhada é renderizada em caracteres imprimíveis sob demanda. Os ícones de listas mantêm seu formato compacto. Para ver todos os desenhos em tamanho original, abra `docs/galeria-objetos-hd7.html`, `docs/galeria-npcs-hd7.html` e `docs/galeria-eventos-hd7.html` após extrair o projeto. O inventário está em `docs/inventario-alta-densidade-etapa7.json`. Os resultados e limites encontram-se em `docs/relatorio-alta-densidade-etapa7.md`.

> A integração técnica não equivale à aprovação estética individual. A revisão final de proporções, animações e testes manuais em dispositivos móveis permanece para a Etapa 8.

---

# ASCII REALMS: Alta Densidade, Etapa 6 (20/11/2026)

O mundo foi atualizado com **100 artes ASCII de alta densidade**: 10 cidades, 10 biomas, 10 masmorras (140 × 64) e 70 interiores de taverna, ferraria, lojas e mercado (124 × 54). As novas cenas se integram ao projeto da Etapa 5 e **não modificam regras nem salvamentos**. O renderizador preserva os caracteres e dimensiona o bloco; em telas estreitas, é possível ampliar o cenário. Os desenhos são gerados conforme o identificador real e armazenados em cache limitado, sem pré-gerar todos os mapas.

Consulte `docs/relatorio-alta-densidade-etapa6.md`, `docs/inventario-mundo-hd6.json` e `docs/galeria-cenarios-hd6.html`. Os testes `npm test` incluem a nova auditoria técnica, mas **a revisão artística individual e a validação interativa em celulares continuam pendentes**.

---

## Expansão Épica, Etapa 8: balanceamento e polimento final (20/11/2026)

A Etapa 8 parte diretamente da Etapa 7. **Não reinicia personagens nem altera a versão do salvamento (v14)**. Preserva todas as receitas, modelos, histórias, companheiros ausentes e restrições de armas.

- **Curva de dificuldade gradual:** HP de inimigos comuns cresce progressivamente após nível 20, até um fator de 1,80 no nível 100. Chefes recebem até 1,40x de HP base e 1,30x de ataque. Raridade, espécie, afinidades elementais, níveis, fases e drops são preservados. As regiões iniciais permanecem sem aumento de HP.
- **Armaduras fortes continuam úteis, mas não anulam golpes físicos:** defesa reduz dano pela fórmula de mitigação proporcional ao poder bruto do ataque, limitada a 62%. Magia inimiga e golpes anunciados utilizam a mesma regra, respeitando defesa mágica. A proteção ativa e a redução de dano também funcionam nos golpes especiais dos chefes.
- **Correção de atordoamento:** congelamento/atordoamento aplicado ao herói impede sua próxima ação, não o turno do inimigo. Não gasta mana, consumíveis ou recarga. Maldições reduzem a defesa em 25% no próximo ataque inimigo; não alteram os atributos permanentes.
- **Integridade de comércio:** parâmetros inválidos de poções, equipamento ou venda são rejeitados antes de movimentar ouro ou itens. Impede a criação de saldo `NaN` a partir de poção inexistente. A compra válida e os descontos existentes seguem iguais.
- **Feedback na interface:** risco de exploração baseado no nível, HP atual e área; efeitos nocivos ativos são listados no painel de ações do combate. Novos estilos são responsivos e não substituem as artes ASCII.
- **Testes:** `tests/epic8-balance.mjs` avalia as quatro classes em seis níveis com modelos de equipamentos do catálogo (24 cenários analíticos, sem simular uma campanha completa). `tests/epic8-combat-economy.mjs` cobre a mitigação real, as maldições, o atordoamento, os golpes especiais, a rejeição de compras inválidas e a persistência. A suíte completa `npm test` inclui todos os testes das etapas anteriores.

**Limitações honestas:** os cenários analíticos não reproduzem o uso efetivo de todas as habilidades, escolhas humanas, IA completa, equipamentos otimizados ou longas campanhas até o nível 100. A dificuldade subjetiva continua exigindo partidas de teste. O esquema de salvamento e a chave de LocalStorage são mantidos para preservar saves da Etapa 7.

Arquivos principais: `js/final-balance.js`, `js/monsters.js`, `js/combat.js`, `js/boss-phases.js`, `js/shops.js`, `js/ui.js`, `css/epic8-polish.css`.

---

## Expansão Épica, Etapa 7: fabricação e economia regional (20/11/2026)

A Etapa 7 parte diretamente da Etapa 6 e conserva os 220 modelos de equipamento, os sistemas narrativos, os salvamentos e as restrições de armas.

- **180 receitas acessíveis por personagem** distribuídas pelas dez regiões: 9 receitas clássicas preservadas e 9 receitas artesanais adicionais em cada região. As novas receitas oferecem 8 equipamentos de modelos exatos (incluindo 2 armas compatíveis com a classe, 4 armaduras e 2 acessórios) e 1 kit de suprimentos (2 poções de Vida e 1 de Mana). As 4 classes possuem seleção própria de armas nas receitas.
- **10 catalisadores regionais** com nomes próprios. Criaturas comuns da região têm 16% de chance de conceder uma unidade; chefes concedem duas unidades garantidas. Os drops anteriores permanecem ativos.
- **Refino determinístico:** na ferraria, converter 2 materiais de forja e 1 material de exploração da região, mediante 35 × (região + 1) de ouro, em 1 catalisador. Não há perda por sorte ou tentativa fracassada.
- **Mercado de insumos:** novo botão **Materiais** na cidade. Cada cidade oferece material de exploração, material de forja e catalisador local. Reputação concede os mesmos descontos das outras lojas. A compra utiliza o preço mostrado; a revenda retorna apenas uma parte, sem arbitragem de compra e venda.
- **Fabricar com previsibilidade:** novas receitas indicam modelo, raridade, nível, requisitos materiais com quantidades possuídas e preço. A entrega usa o `catalogId` do equipamento exibido, sem seleção aleatória do modelo.
- **UI responsiva:** novas seções de fabricação artesanal, receitas clássicas, mochila de materiais, refino e mercado de insumos em `css/epic7-crafting.css`.
- **Compatibilidade:** salvamento permanece na **versão 14**, com a mesma chave de LocalStorage. Catalisadores entram no mapa existente de materiais, sem migração de campos. Receitas e itens já existentes permanecem disponíveis.
- **Testes:** `tests/epic-crafting.mjs`, `tests/epic-crafting-actions.mjs` e suíte completa `npm test`. Testes de ações verificam cliques pelo handler real, cobranças, recompensas e persistência. A validação visual completa em navegador não foi possível neste ambiente.

Arquivos principais: `js/artisan-economy.js`, `js/crafting.js`, `js/loot.js`, `js/shops.js`, `js/main.js`, `js/ui.js`, `css/epic7-crafting.css`.

---

# Expansão Épica, Etapa 3: Tavernas vivas e NPCs recorrentes

Esta versão foi produzida a partir da **Expansão Épica, Etapa 2**, sem companheiros ou posturas de combate.

- Dez tavernas com identidade própria, 20 visitantes regionais e 20 acontecimentos narrativos escritos manualmente (dois por região).
- Um acontecimento é sorteado ocasionalmente (38% por visita elegível), utilizando o nome/classe do personagem, região e número de visitas. Reabrir a interface ou conversar com NPCs não executa novo sorteio.
- Cada acontecimento oferece investigar (pista e reputação +1), ajudar (custo de 5 ouro, reputação +4) ou não se envolver (reputação -1). Escolhas validadas são persistidas e não podem ser repetidas. A ajuda fica desabilitada quando o ouro não é suficiente.
- Novos visitantes podem conversar, alternando falas, e alguns reaparecem na região seguinte após a interação; suas falas reconhecem o desfecho encontrado.
- Os NPCs, rumores, desafios e contratos já existentes nas tavernas foram preservados. Eventos da taverna não bloqueiam missões principais nem geram recompensas infinitas.
- Estado adicional em `cityLife.tavern`, normalizado durante o carregamento de salvamentos anteriores. A chave e a versão 12 do salvamento são preservadas porque a migração é aditiva.
- Arquivos: `js/tavern-stories.js`, `js/city-life.js`, `js/ui.js`, `js/main.js`, `css/epic-taverns.css`, `index.html`, `tests/epic-taverns.mjs`.
- Testes: `npm test`. Os testes automatizados não substituem a validação visual real em dispositivos móveis nem fluxos manuais completos.

---

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

## Cooldowns exclusivamente por turnos

Todas as habilidades de combate possuem recargas independentes definidas em `js/turn-cooldowns.js`. Cada ação válida do herói reduz as recargas anteriores uma única vez. A habilidade usada recebe seu cooldown somente após essa redução. Por exemplo, cooldown 3 implica três oportunidades seguintes bloqueadas, tornando-se utilizável na quarta oportunidade. Ataque comum não possui recarga. Tentativas de habilidade indisponível são rejeitadas antes do consumo de MP ou do início de animações.

| Classe | Habilidade | Turnos | Motivo |
|---|---|---:|---|
| Guerreiro | Golpe Brutal | 2 | Dano físico elevado |
| Guerreiro | Postura Defensiva | 3 | Defesa reforçada por três turnos |
| Guerreiro | Fúria de Batalha | 3 | Multiplicador alto de dano |
| Guerreiro | Execução | 4 | Multiplicador alto e bônus contra alvo ferido |
| Mago | Bola de Fogo | 2 | Queimadura persistente |
| Mago | Barreira Arcana | 3 | Proteção por três turnos |
| Mago | Tempestade Arcana | 3 | Dano mágico alto |
| Mago | Meteoro | 5 | Maior multiplicador de dano e custo de MP elevado |
| Arqueiro | Tiro Preciso | 1 | Ataque relativamente leve, sem efeito contínuo |
| Arqueiro | Chuva de Flechas | 2 | Golpe de dano intermediário |
| Arqueiro | Flecha Perfurante | 3 | Ignora parte da proteção física |
| Arqueiro | Disparo Mortal | 4 | Ataque de dano muito elevado |
| Ladino | Ataque Furtivo | 1 | Ataque ágil sem efeito contínuo |
| Ladino | Lâmina Venenosa | 2 | Veneno aplicado por vários turnos |
| Ladino | Dança das Sombras | 3 | Multiplicador alto de dano |
| Ladino | Assassinato | 4 | Dano elevado com bônus contra alvo ferido |

### Especializações

| Especialização | Habilidade | Turnos | Motivo |
|---|---|---:|---|
| Berserker | Golpe Frenético | 2 | Ataque poderoso inicial |
| Berserker | Ruptura Final | 4 | Golpe supremo |
| Guardião | Escudo Protetor | 3 | Proteção reforçada |
| Guardião | Bastião Eterno | 4 | Defesa suprema |
| Arquimago | Explosão Prismática | 3 | Magia ofensiva forte |
| Arquimago | Cataclismo Arcano | 5 | Magia suprema |
| Feiticeiro | Praga Arcana | 2 | Aplicação de veneno |
| Feiticeiro | Eclipse Maldito | 4 | Habilidade suprema com veneno |
| Atirador | Disparo Cirúrgico | 2 | Dano com perfuração |
| Atirador | Tiro do Horizonte | 4 | Perfuração suprema |
| Caçador | Flecha Tóxica | 2 | Aplicação de veneno |
| Caçador | Caçada Final | 4 | Veneno com multiplicador elevado |
| Assassino | Lâmina Fatal | 2 | Finalização inicial |
| Assassino | Golpe do Carrasco | 4 | Finalização suprema |
| Sombra | Corte Espectral | 2 | Ataque mágico inicial |
| Sombra | Noite Sem Fim | 4 | Ataque supremo |

### Habilidades de monstros

| Técnica | Turnos | Motivo |
|---|---:|---|
| Ataque | 0 | Ataque comum sempre disponível |
| Golpe Devastador | 2 | Dano físico alto |
| Maldição | 3 | Efeito debilitante |
| Regeneração | 3 | Recuperação de HP |
| Explosão Elemental | 3 | Alto dano elemental |
| Postura Protetora | 3 | Defesa temporária já existente na IA |

Chefes conservam anúncios especiais e fases próprias. Anúncios e perdas de ação contam como oportunidades do monstro; não gastam MP de técnicas apenas preparadas. Os modos Normal, Rápido e Instantâneo não afetam cooldowns. O carregamento continua descartando combates interrompidos, preservando todas as informações permanentes anteriores sem alterar a versão do salvamento.

Teste adicional: `node tests/turn-cooldowns.mjs` (incluído em `npm test`).


## Marcos Evolutivos (salvamento v12)
A cada 5 pontos **confirmados manualmente** em Força, Inteligência, Agilidade, Destreza, Vitalidade e Sorte, um marco é desbloqueado. Pontos iniciais, ganhos automáticos por nível e equipamentos não contam. Salvamentos anteriores não contêm histórico confiável de investimentos; por segurança, sua contagem começa em zero e somente futuras aplicações são registradas.

| Atributo | Benefício por marco | Limite adicional |
|---|---:|---:|
| Força | +1% ataque físico | 20% |
| Inteligência | +1% ataque mágico | 20% |
| Agilidade | +0,5 ponto percentual de esquiva | 10 pp |
| Destreza | +0,5 ponto percentual de crítico | 10 pp |
| Vitalidade | +1% HP máximo | 20% |
| Sorte | +0,5 ponto percentual de equipamento em drop | 5 pp |

Limites gerais existentes preservados: esquiva 40%, crítico 65%, precisão 99%. O bônus de Sorte somente modifica o sorteio de **equipamento**, com teto total de 23% para monstros e 25% para chefes, sem modificar os materiais ou recompensas garantidas. Bônus de dano e HP incidem uma vez após os modificadores anteriores. A prévia usa `stats(attributeOverride,investedOverride)` e nunca grava pontos provisórios.

## Ajuste de dificuldade inicial e penalidade por morte

**Penalidade por derrota:** além da perda de 10% do ouro já existente, a derrota remove **20% da EXP acumulada dentro do nível atual**, arredondada para cima (`Math.ceil`). Por exemplo, um jogador no nível 12 com 250 EXP perde 50 EXP e permanece no nível 12 com 200 EXP. Quem possui zero EXP não perde nada. A operação não altera o nível, pontos de atributo, atributos, equipamentos, nem EXP de níveis já concluídos. A penalidade é aplicada na rotina única de encerramento de combate e salva pelo mesmo fluxo existente, inclusive em masmorras.

**Dificuldade para personagens novos:** os seis atributos iniciais de cada classe foram reduzidos, preservando o papel de cada classe e a progressão por nível. O HP/MP base, crescimento por nível, habilidades, custo de MP, monstros e equipamentos foram mantidos; a queda do HP/MP calculado vem apenas dos atributos iniciais menores.

| Classe | Atributos anteriores (FOR/INT/AGI/DES/VIT/SOR) | Novos atributos |
|---|---|---|
| Guerreiro | 8/2/3/4/8/3 | 6/2/2/3/6/2 |
| Mago | 2/9/4/4/3/4 | 2/7/3/3/3/3 |
| Arqueiro | 4/3/7/9/4/5 | 3/3/6/7/3/4 |
| Ladino | 5/3/9/6/4/8 | 4/3/7/5/3/6 |

**Compatibilidade:** `newGame` usa os novos atributos para personagens criados a partir desta atualização. Os personagens antigos continuam utilizando seus valores próprios de `state.stats`; nenhum recálculo substitui esses valores. A versão do salvamento permanece **v12**, pois não houve inclusão de campos permanentes.

Teste adicional: `node tests/death-balance.mjs` (incluído em `npm test`).


## Expansão Épica, etapa 1: fauna regional e inimigos humanoides

- **150 espécies comuns/especiais** distribuídas em dez mapas (12 encontros comuns e 3 espécies especiais por mapa). Isso inclui as 30 espécies originais; são **120 novas espécies**. Chefes existentes são preservados.
- Cada região possui pelo menos dois humanoides hostis, entre bandidos, saqueadores, desertores e mercenários. Eles utilizam os arquétipos existentes da IA.
- As espécies adicionais utilizam perfis de ataque, defesa e HP levemente distintos, além de afinidades coerentes com seus arquétipos.
- A probabilidade de escolher uma das três espécies especiais de uma região é **8%** dos encontros comuns; **92%** selecionam uma das doze espécies do grupo regular. A raridade Comum/Errante/Elite/Campeão/Lendário continua sendo sorteada **separadamente**, sem mudar sua distribuição.
- O gerador evita repetir a mesma espécie em encontros consecutivos e preserva o índice regional original para materiais e slots de equipamentos. Nenhum item de região futura é distribuído.
- O Bestiário registra as novas espécies após o encontro; criaturas não encontradas são resumidas para reduzir a extensão da tela.
- As **30 artes originais** permanecem. As espécies novas possuem representações ASCII compactas por arquétipo, que poderão receber artes exclusivas em uma etapa dedicada de polimento.
- Esta etapa **não** implementa ainda as exigências futuras de 60 eventos narrativos, missões ramificadas, NPCs adicionais, 220 equipamentos ou crafting expandido. Bandidos já aparecem como inimigos no combate, mas opções sociais (pagar, negociar, intimidar) são uma etapa posterior.
- Sem novos campos persistentes: salvamentos v12 continuam compatíveis. Sem companheiros.
- Testes: `npm test` inclui `expanded-species.mjs` e `expanded-integration.mjs` além dos testes anteriores.


## Expansão Épica, Etapa 2: encontros narrativos e bandidos

- 20 novos eventos escritos (além dos 10 eventos narrativos existentes e oito segredos), todos com IDs estáveis, duas a quatro escolhas e recompensas únicas por salvamento.
- Eventos elegíveis conforme região, caminho escolhido e decisões anteriores. O sorteio continua ocorrendo somente no subconjunto não hostil, preservando a chance base de combate em cada caminho.
- Cadeia da Estrada Cinzenta: registros de caravana > esconderijo; testemunha desertora > investigação do contratante.
- Bandidos podem exigir ouro, sofrer intimidação baseada em Força, ser enfrentados ou evitados. Quando uma escolha origina combate contra bandidos, usa uma espécie humanoide existente da região.
- Pagamentos são validados antes da escolha, nenhuma interação pode deixar ouro negativo. Requisitos de atributos usam os valores permanentes do personagem; equipamentos e bônus temporários não liberam automaticamente a intimidação.
- A reputação responde a escolhas específicas, uma única vez por evento; resoluções e decisões já persistem no formato de salvamento v12.
- **Escopo:** esta etapa não adiciona ainda 60 eventos, missões procedurais, novos NPCs ou equipamentos; estes permanecem para expansões seguintes.


## Expansão Épica, Etapa 4: missões narrativas encadeadas

- **20 missões** adicionadas: duas por mapa, em dez pequenas cadeias regionais.
- A primeira missão é descoberta ao conversar com um visitante da taverna ou resolver seu acontecimento local; não é imposta nem aparece como disponível antes do contato.
- A primeira etapa é uma investigação de três explorações válidas na região. A recompensa abre a segunda etapa, que exige quatro vitórias em encontros daquela região.
- Após concluir uma etapa, o jogador escolhe **Investigar e registrar provas** (mais ouro) ou **Proteger os envolvidos** (mais experiência e reputação). As duas decisões são registradas no salvamento.
- O menu **Jogador > Missões** exibe as descobertas, progresso e recompensas. As tavernas mostram ofertas descobertas.
- Os IDs `dq-<região>-<etapa>` são estáveis. O estado `dynamicQuests` guarda apenas progresso, escolhas e reivindicações; a recompensa só pode ser recebida uma vez.
- Novo formato **LocalStorage v13**, com migração preservando inventário, mapa, atributos e missões anteriores.
- Todas as missões são **opcionais** e não bloqueiam os dez mapas ou seus chefes. Nenhuma classe, companheiro ou postura de combate foi adicionada.
- Testes: `npm test`. Testes de jogabilidade manual em navegador e balanceamento de diferentes níveis ainda são recomendados.


## Expansão Épica, Etapa 5: aventuras procedurais controladas

Esta etapa parte diretamente da Etapa 4. Não modifica os 10 mapas, as 50 missões
originais, as 20 missões narrativas anteriores ou as regras de combate.

**Conteúdo adicionado:** 20 roteiros escritos, duas alternativas em cada uma das
10 regiões. Cada personagem recebe **uma história por região**, determinada pela
sua semente narrativa e, nas regiões posteriores, também pelas decisões anteriores.
São até **10 novas aventuras por personagem** e **20 roteiros diferentes no catálogo**.
Esses roteiros são opcionais e não são adicionados às missões originais.

**Fluxo de cada aventura:**

1. Descobrir um rumor na taverna, investigar seu acontecimento relacionado ou
   encontrar um indício raro durante a exploração não hostil (16% entre os
   resultados ainda disponíveis para a descoberta).
2. Aceitar a investigação em `Jogador > Missões` ou na taverna.
3. Encontrar **duas pistas distintas** durante explorações não hostis da região;
   cada oportunidade possui 38% de chance de revelar a próxima pista.
4. Cumprir a conclusão específica do roteiro. Histórias de confronto exigem
   **duas vitórias contra humanoides regionais**, sem contar chefes. Histórias
   de entrega exigem entregar a correspondência na taverna local.
5. Escolher entre **registrar as provas** ou **proteger as testemunhas**.
   A primeira opção concede mais ouro; a segunda concede mais experiência
   e reputação. Recompensas e escolhas só são aplicadas uma vez.

A aventura é retomada sem reiniciar pistas após recarga. Não há itens fictícios
no inventário: provas e correspondências fazem parte apenas do registro da
investigação. A interface mostra o estágio atual e um diário expansível dos
últimos oito registros, sem cobrir a área de combate.

**Arquitetura:** `js/procedural-adventures.js` contém dados estáticos, hash,
seleção, elegibilidade, transições e normalização. Não utiliza temporizadores
nem processamento por quadro. `js/exploration.js`, `js/combat.js`, `js/main.js`
e as telas existentes apenas consomem suas funções. A seleção utiliza os bits
superiores do hash, evitando uma escolha dependente apenas da paridade do
último caractere do texto.

**Persistência:** `LocalStorage v14`. A semente é criada uma única vez em
`newGame`, guardada em `state.adventure.seed` e permanece constante. Para
salvamentos v1-v13, é gerada uma semente estável a partir dos dados do
personagem durante a migração. São preservados níveis, equipamentos, XP,
marcos evolutivos, inventário, reputação e missões anteriores.

**Segurança:** eventos e ações aceitos uma vez, pistas não repetidas, contagem
única por inimigo, bloqueio de entrega/recebimento duplicado, verificação de
região e limites de registros ao carregar salvamentos. Não existem
companheiros nem posturas de combate.

**Escopo original da Etapa 5:** esta etapa não adicionava 220 equipamentos, novas receitas de
crafting ou 60 eventos narrativos independentes, que seguem como metas das
próximas etapas. Aventuras pessoais são cadeias narrativas e não devem ser
contadas como 20 novos eventos de exploração distintos.

**Testes:** `npm test` inclui `tests/procedural-adventures.mjs` e
`tests/procedural-flow.mjs`, além da suíte completa de regressão. Revisão
manual de gameplay e de acessibilidade em smartphones ainda recomendada.


## Expansão Épica, Etapa 6: Catálogo de equipamentos e builds

**Base:** Expansão Épica Etapa 5, preservando as 150 espécies, missões,
avatares dinâmicos, cooldowns, marcos evolutivos, penalidade de morte e
LocalStorage v14. Não existem companheiros nem posturas de combate.

**Catálogo de 220 modelos** em `js/equipment-catalog.js`:

- 80 armas: 8 por região, com 2 modelos para cada classe; armas continuam
  exclusivas de Guerreiro, Mago, Arqueiro ou Ladino.
- 90 armaduras: 9 por região, distribuídas entre corpo, cabeça, mãos e pés.
  Qualquer classe pode equipar armadura leve, média ou pesada, respeitando nível.
- 50 acessórios: 5 por região (anéis e amuletos).

Os IDs de modelo (`ep6-r{região}-{categoria}-{índice}`) são estáveis. Os itens
obtidos recebem `catalogId` e continuam usando `uid` exclusivo. A raridade
permanece entre Comum e Lendário. Itens antigos não precisam de `catalogId` e
continuam equipáveis normalmente. **Não foi criada uma migração de
salvamento**, pois o formato continua compatível com v14.

**Estilos de build e contrapartidas, aplicáveis igualmente às quatro classes:**

- Leve: menor defesa, +2 pontos percentuais de esquiva e +1 de precisão.
- Média: defesa equilibrada, +1 ponto percentual de crítico e resistência mágica.
- Pesada: maior defesa e HP adicional, -1 ponto percentual de esquiva.
- Armas: modelos ofensivos ou de precisão/foco, com escolhas entre dano,
  chance crítica, precisão e recursos mágicos.
- Acessórios: crítico, experiência, HP, MP, ataque mágico ou regeneração,
  de acordo com o modelo.

Os valores são obtidos diretamente por `stats()` e obedecem aos tetos já
existentes (esquiva, crítico, precisão). Os modificadores não dependem da
classe. As cores de raridade permanecem por peça, e o peitoral utiliza três
padrões ASCII distintos conforme a categoria da armadura.

**Integração:** loja apresenta modelo, nível, raridade, categoria, atributos,
preço final com reputação e estado de compra. O botão `Comprar` usa o ID real
do modelo exibido. Drops, crafting, relíquias, estoques especiais e encomendas
continuam utilizando `makeItem()`, agora vinculado a modelos regionais.
Preços-base e percentuais de desconto permanecem inalterados; nenhuma receita
foi removida.

**Testes:** `npm test` executa a suíte completa e
`tests/epic-equipment.mjs`, que verifica os 220 IDs, quantidade por região,
as 4 classes e 3 tipos de armadura, preços, compras, diferenças reais nas
estatísticas, raridades, avatares, bloqueios por nível e ouro, e salvamentos.
Também foi executada uma inspeção visual isolada do catálogo e do inventário
com Chromium nas larguras 320, 375, 390, 430, 720 e 1366 pixels. Fluxos
manuais de gameplay em navegadores reais continuam recomendados.

**Próxima etapa:** expansão das receitas e balanceamento da economia do crafting.


## Reformulação ASCII de alta definição: lote 1 (parcial)

**Base:** Expansão Épica, Etapa 8. Não inclui as alterações de Unicode Art feitas posteriormente.

O novo compositor em `js/hero-avatar.js` produz quatro retratos independentes de 64 colunas por 44 linhas, em ASCII 32..126, usando contornos, sombreamento por densidade e camadas anatômicas. Cada classe conserva sua silhueta e os sete slots do jogo (`head`, `body`, `hands`, `feet`, `weapon`, `ring`, `amulet`). Armaduras leves, médias e pesadas alteram ombros e torso; armas de famílias diferentes alteram a geometria; cores de raridade são aplicadas individualmente. O retrato de combate é uma versão compacta de 32 por 22, reconstruída do mesmo equipamento. O cache deriva apenas da classe e dos metadados dos itens, não é salvo no LocalStorage.

**Entrega parcial:** este lote substitui os quatro retratos principais dos heróis, não as artes de monstros, cidades, masmorras, objetos e demais elementos. Estas continuam na versão anterior, até receberem substituições de qualidade. O inventário detalhado em `docs/inventario-visual-densidade.json` registra 494 entidades principais de dez categorias, das quais 4 estão atualizadas. Ainda existem categorias adicionais (como ícones de materiais, instalações e partes decorativas) a inventariar antes da substituição integral.

Abra `docs/galeria-ascii-densidade.html` para comparar os 20 retratos. Rode `node scripts-density-audit.mjs` para atualizar o inventário e `node tests/density-heroes.mjs` para validar dimensões, composição por peças e raridades.

**Compatibilidade:** nenhuma alteração em níveis, atributos, combate, lojas, inventário ou estrutura do salvamento v14. O modo compacto de combate e os modos de velocidade existentes foram preservados. A verificação visual com Chromium não pôde ser concluída neste ambiente; use a galeria HTML para revisar alinhamento e legibilidade.

## ASCII de densidade: Lote 2, Bestiário

Base: versão Expansão Épica Etapa 8 + Lote 1 dos heróis, sem incorporar a reformulação Unicode posterior.

- `js/density-bestiary.js`: 150 retratos de espécies, 10 chefes regionais e 10 chefes de masmorra. Os desenhos são ASCII imprimível (32 a 126), sem PNG, Canvas ou SVG.
- Retratos comuns: 76 colunas × 52 linhas; chefes: 110 × 70. O renderizador do jogo redimensiona a arte para o espaço disponível.
- Cada criatura tem arte determinística. As anatomias foram desenvolvidas por famílias (humanoides, feras, aracnídeos, répteis, alados, criaturas dracônicas, vegetais, construtos, espíritos e mortos-vivos), recebendo marcas, texturas, acessórios e características adicionais.
- `js/ui.js` e `js/progression-ui.js` usam a nova arte como primeira opção no combate e bestiário; artes antigas são fallback somente para nomes ausentes da nova biblioteca.
- `docs/galeria-bestiario-densidade.html`: galeria navegável de todos os 170 desenhos.
- `tests/density-bestiary.mjs`: cobertura, dimensões, alfabeto ASCII, diferença entre arte de chefe e comum, duplicatas e integração.

**Escopo real:** 170 retratos procedurais compostos por famílias anatômicas, com variações identificadas por espécie. Não equivalem a 170 desenhos autorais completamente independentes feitos manualmente. Ainda é recomendável inspeção artística individual em navegador, especialmente nas composições de chefes. Nenhuma mecânica, item ou salvamento foi modificado. Cidades, mapas, estabelecimentos, objetos e eventos são escopo de próximos lotes.

## Reformulação artística em ASCII de densidade, Lote 3: cidades, biomas e masmorras

Esta entrega continua exclusivamente a partir da versão com os Lotes 1 e 2, baseada na Expansão Épica, Etapa 8. As ilustrações Unicode de fases anteriores não foram reintroduzidas.

- `js/density-world.js` contém 30 cenários ASCII determinísticos: dez cidades, dez biomas de exploração e dez masmorras (todos com 112 colunas e 42 linhas).
- Os cenários utilizam fachadas e relevos compostos com caracteres ASCII: torres, muralhas, casas, cúpulas, palafitas, ruínas, montanhas, florestas, lava, gelo e corredores de masmorra. Não há imagens externas ou sprites gráficos.
- `js/ui.js` utiliza as novas cenas nas telas de **Mapa**, **Exploração**, **Cidade** e **Masmorras**, mantendo os identificadores antigos e o escape seguro de texto. A cidade agora possui arte urbana diferente da paisagem exibida no mapa e na exploração.
- O ajuste responsivo `fitAscii()` e o visualizador de ampliação foram preservados. O jogo continua sem rolagem horizontal da página.
- `tests/density-world.mjs` verifica cobertura, alinhamento 112×42, caracteres ASCII imprimíveis, diferença entre cenas, determinismo, dimensões responsivas estimadas e integrações na UI.
- `docs/galeria-cenarios-densidade.html` contém as 30 cenas para revisão visual. Regerar com `node generate-density-world-gallery.mjs`.

**Escopo:** esta fase redesenha cidades, biomas e masmorras, mas não substitui todas as artes do jogo. Estabelecimentos, NPCs, equipamentos, eventos e interface ficam para os próximos lotes. As artes são composições procedurais com arquitetura e elementos por região; a qualidade visual de cada uma ainda merece revisão artística manual. Nenhum cálculo de combate, atributo, inventário, recompensa ou estrutura de salvamento foi alterado.

## Reformulação ASCII por densidade, Lote 4: NPCs e estabelecimentos

Esta etapa mantém a Expansão Épica 8 e os Lotes 1–3. Acrescenta `js/density-settlements.js` com **32 retratos individuais** de NPCs (10 moradores, 2 personagens recorrentes e 20 visitantes) no formato ASCII de 64 × 40 caracteres, além de **70 interiores** de 100 × 38, distribuídos pelas 10 regiões e 7 tipos de estabelecimento: taverna, ferraria, armas, armaduras, acessórios, poções e mercado de insumos. As cenas são composições determinísticas com arquitetura compartilhada, variação regional e objetos que diferenciam os tipos de loja. Os retratos variam de acordo com ocupação, vestuário e acessórios, mas não são 32 ilustrações criadas manualmente uma a uma.

A interface exibe interiores nas telas correspondentes e retratos nas fichas de diálogo dos NPCs, com expansão opcional para não tornar a taverna excessivamente longa. `fitAscii` recalcula a escala ao abrir um retrato. As artes são renderizadas como texto escapado em `<pre>`, sem imagens externas. Classes, combate, itens, missões e LocalStorage não foram alterados.

A galeria `docs/galeria-npcs-estabelecimentos.html` reúne as 102 cenas para revisão manual. Execute `node generate-density-settlements-gallery.mjs` para recriá-la e `node tests/density-settlements.mjs` para validar dimensões, caracteres ASCII, integridade e integração; `npm test` executa a suíte completa.

**Pendente:** inspeção artística individual das 102 composições e testes visuais interativos em navegadores móveis reais. Itens e materiais ainda serão abordados no Lote 5.

---

## Reformulação ASCII de densidade: Lote 5, equipamentos e objetos

Base: Lote 4, sem alterar regras de progressão, atributos, preços, crafting, formato de save ou combate.

- **220 modelos do catálogo** passam a ter ilustração ASCII de inspeção, 27 colunas × 21 linhas, com ícone compacto de 11 × 9. Silhuetas diferentes por família de armas, capacetes, peitorais, luvas, botas, anéis e amuletos; todos os identificadores de catálogo possuem arte detalhada distinta.
- **30 materiais regionais:** dez de exploração, dez materiais de forja e dez catalisadores possuem arte e ícone compacto. Quatro poções/consumíveis e um baú complementam a biblioteca, totalizando **255 desenhos e 255 ícones** nesta etapa.
- **Interface:** as novas artes aparecem no inventário, nos sete slots equipados, no catálogo das lojas, nas poções, no mercado de insumos e nas receitas de fabricação. O ícone compacto é visível nas listas; a versão detalhada abre somente ao selecionar **Ver arte ASCII**. A escala continua sendo calculada pelo renderizador existente, com preservação de alinhamento e escape HTML.
- **Equipamentos anteriores:** itens legados sem `catalogId` recebem uma ilustração compatível com seu slot e tipo. O LocalStorage não armazena arte e não precisa de migração.
- **Arquivos:** `js/density-objects.js`, `css/density-objects.css`, `tests/density-objects.mjs`, `docs/galeria-objetos-densidade.html`, `generate-density-objects-gallery.mjs`, além de alterações em `js/ui.js`, `index.html`, `package.json` e `docs/inventario-visual-densidade.json`.
- **Limitações:** artes procedurais determinísticas e não uma revisão manual de cada item. A galeria permite avaliação individual. Testes automatizados verificam caracteres, dimensões, unicidade e pontos de integração, mas não substituem a validação de todos os itens em navegador e telefone. Os 50 eventos narrativos continuam pendentes para o Lote 6.

## Reformulação ASCII de densidade: Lote 6, eventos e revisão

Base: Lote 5, preservando a Expansão Épica, Etapa 8 e o LocalStorage v14.

- **50 acontecimentos ilustrados:** 10 eventos da jornada original, 20 eventos da Expansão Épica e 20 eventos de taverna. Todas as ilustrações têm 84 colunas por 34 linhas, exclusivamente caracteres ASCII imprimíveis.
- **Desenhos temáticos:** acampamentos, caravanas, emboscadas, documentos, altares, portais, pontes, ruínas, cavernas, torres, baús e outros elementos de cena. As artes são composições procedurais determinísticas, com variações por identificador, não 50 ilustrações feitas manualmente uma a uma.
- **Interface:** a arte aparece nos encontros com escolhas, sem alterar resultados, atributos, recursos ou chances. A escala e o visualizador de ampliação continuam disponíveis; a representação textual é escapada antes de entrar no HTML.
- **Efeitos:** leves animações CSS de iluminação, respeitando `prefers-reduced-motion`. Ataques, magias, danos, velocidade Normal/Rápida/Instantânea e animações anteriores permanecem preservados.
- **Arquivos:** `js/density-events.js`, `css/density-events.css`, `tests/density-events.mjs`, `docs/galeria-eventos-densidade.html`, `generate-density-events-gallery.mjs`, além de `js/ui.js`, `index.html`, `package.json` e inventário.
- **Inventário de cobertura:** 611 elementos do inventário registrados como redesenhados, com 0 pendências **dentro das categorias inventariadas**. Isso não demonstra que todo elemento decorativo residual ou variante legada foi substituído, nem certifica qualidade visual.
- **Revisões pendentes:** revisão artística individual das 611 composições e testes de responsividade/interação em browsers e dispositivos móveis reais. Não se deve tratar a ausência de duplicatas e os testes automáticos como prova de qualidade estética.

Recrie a galeria com `node generate-density-events-gallery.mjs` e valide com `node tests/density-events.mjs` ou `npm test`.

## Novo padrão de alta densidade: início de revisão artística

A referência enviada do Ladino foi incorporada com **160 colunas × 103 linhas** de ASCII original, preservando o conteúdo do usuário. O Ladino usa essa referência nas telas de personagem e combate, com composição experimental de armaduras e cores de raridade por área. Veja `docs/galeria-ladino-referencia.html` e `docs/relatorio-referencia-alta-densidade.md`.

**Importante:** este é um primeiro piloto. A arte ainda inclui as armas da referência quando o slot de arma está vazio, e as outras classes, monstros e cenários não foram redesenhados com esse novo padrão nesta entrega. As máscaras de equipamentos ainda exigem refinamento visual. Os demais desenhos do Lote 6 foram preservados para evitar regressões.

## Reformulação definitiva em alta densidade: Etapa 2 (quatro heróis)

- Quatro retratos-base de 160 × 103 caracteres: Guerreiro, Mago e Arqueiro originais, Ladino fornecido pelo usuário e preservado integralmente.
- Arquivos `js/high-density-hero-arts.js` e `js/high-density-portraits.js`, galeria em `docs/galeria-quatro-herois-alta-densidade.html`.
- Apresentação compacta de 80 × 52 no combate; adaptação da escala pela função `fitAscii` existente.
- A composição de equipamentos ainda é **experimental**, com ajustes definitivos planejados para a etapa seguinte. Os demais elementos do jogo conservam as artes do Lote 6.
- Consulte `docs/relatorio-alta-densidade-etapa2.md` para limitações e testes.

## Alta Densidade, Etapa 3: Ladino próprio e equipamento anatômico

- Os quatro heróis agora utilizam **a mesma biblioteca ASCII 160 × 103**, com bases independentes; o Ladino não utiliza mais a imagem de exemplo do usuário.
- Os retratos-base **não carregam armas fixas**. Armas são renderizadas somente quando estão equipadas, com encaixe nas mãos, incluindo adagas duplas do Ladino.
- Capacete, armadura, luvas, botas, arma, anel e amuleto são as sete regiões visuais reais. Não foram inventados slots de calças ou escudo.
- Classes podem representar armaduras leves, médias e pesadas. As restrições de armas do gameplay permanecem inalteradas.
- O compositor `js/high-density-portraits.js` usa pontos de ancoragem, máscaras com geometria, gravação por modelo, cache, cores por peça e redução para **80 × 52** em combate.
- O navegador reaproveita o renderizador responsivo existente, e os salvamentos v14 permanecem compatíveis.
- Galeria: `docs/galeria-quatro-herois-alta-densidade.html`; documentação técnica e limitações: `docs/relatorio-alta-densidade-etapa3.md`.
- O script opcional `tools/generate-hero-bases.py` regenera as bases de texto (requer Python e Pillow somente na etapa de criação; **não** participa da execução do jogo).


## Reformulação definitiva em alta densidade: Etapa 4, 150 monstros

Esta entrega continua **exclusivamente a partir da Etapa 3** e mantém a Expansão Épica original como base.

- O atlas `js/high-density-monster-data.js` cobre **150 espécies**, conforme os identificadores reais de `REGION_SPECIES`, em imagens **textuais** ASCII 112 × 78. Não há PNG, SVG ou Canvas na interface do jogo.
- O gerador offline `tools/generate-monsters-hd.py` constrói corpos e detalhes por 26 grupos de anatomia (aracnídeos, répteis, canídeos, corvídeos, humanoides, construtos, criaturas espectrais, etc.). Cada espécie tem semente determinística, construção e texturas específicas. O resultado não é uma coleção de desenhos feitos manualmente um a um.
- O renderizador `js/high-density-monsters.js` **descompacta uma espécie apenas ao solicitá-la**, mantém até 14 retratos em cache e deriva a apresentação compacta de **76 × 52** para o combate. O bestiário usa a versão completa. Ambos preservam alinhamento e passam por `escape()` antes de integrar ao HTML.
- Os **20 chefes não foram modificados**: receberão ilustrações próprias na Etapa 5. Os sprites antigos de monstros ainda permanecem no código legado para compatibilidade, mas **os 150 monstros cadastrados são renderizados prioritariamente pelo novo atlas**.
- O conjunto possui 150 artes textuais diferentes e 150 apresentações compactas diferentes. Testes automatizados verificam dimensões, caracteres, cobertura das 10 regiões, unicidade, cache, integração, responsividade estimada e manutenção do salvamento **v14**.
- `docs/galeria-monstros-hd4.html` permite inspecionar individualmente as 150 artes sem servidor. `docs/inventario-monstros-hd4.json` contém a associação estável com os IDs reais das espécies.
- `tools/requirements-hd4.txt` registra as dependências **somente da ferramenta geradora offline** (Pillow, NumPy e SciPy). O jogo continua HTML, CSS e JS, sem backend obrigatório.

**Limitações e critérios de qualidade:** a exclusividade textual não garante exclusividade morfológica ou qualidade artística equivalente à referência de 160 × 103 enviada pelo usuário. Algumas espécies da mesma família ainda têm silhuetas parecidas. A revisão visual incluiu uma prévia de 12 criaturas e comparação automática entre pares; foram encontrados pares com alta sobreposição de silhueta, que devem receber ajustes manuais. A verificação responsiva executada é estimativa, não um teste interativo completo no Chromium ou em telefones.

**Como validar:** `node tests/high-density-monsters-stage4.mjs`, `npm test`. Para reconstruir o atlas, instalar dependências de `tools/requirements-hd4.txt` e executar `python tools/generate-monsters-hd.py`.

## Alta Densidade, Etapa 5: os 20 chefes

- **Dez chefes regionais** e **dez chefes exclusivos de masmorras** receberam retratos ASCII individuais de **128 × 88**. As artes são compostas por personagens, animais e estruturas próprios de cada chefe, não por recoloração de um modelo único.
- **Três fases visuais por chefe regional**, sincronizadas ao `bossPhase` já calculado pelo combate. Total: **40 composições ASCII distintas**, contando as fases.
- **Combate 76 × 52**, bestiário 128 × 88. O renderizador descompacta sob demanda e preserva escape HTML, proporções e cache LRU limitado.
- Bibliotecas `js/high-density-boss-data.js`, `js/high-density-bosses.js` e integração em `js/density-bestiary.js` e `js/ui.js`. Sem modificação das regras, atributos ou LocalStorage v14.
- Galeria `docs/galeria-chefes-hd5.html`, amostras `docs/previa-chefes-hd5.png` e `docs/previa-chefes-masmorras-hd5.png`, inventário `docs/inventario-chefes-hd5.json`.
- Para reproduzir o atlas: instalar dependências listadas em `tools/requirements-hd4.txt` e executar `python tools/generate_bosses_hd.py`; gerar prévias com `python tools/preview-bosses-hd.py`.
- Testes: `node tests/high-density-bosses-stage5.mjs` e `npm test`. A inspeção individual e a validação responsiva em dispositivos reais permanecem pendentes.

**Escopo seguinte:** cidades, mapas e estabelecimentos em alta densidade (Etapa 6).

## ASCII de Alta Densidade: Etapa 8, Revisão e Polimento

A Etapa 8 utiliza a Etapa 7 como base, sem alterar as mecânicas do jogo ou o `SAVE_VERSION = 14`.

- Visualizador ampliado de artes ASCII, acionado ao clicar no retrato quando houver pouco espaço. Teclas `+` e `-` ajustam o zoom, `F` adapta o desenho à janela e `Esc` fecha. As cores de raridade são preservadas quando a origem contém um avatar dinâmico.
- Redimensionamento diferenciado para combate compacto e retratos completos, reavaliado ao expandir os painéis e quando o tamanho de seus contêineres muda.
- Inventário final de **611 artes de entidades, mais 20 variantes de fase de chefes**, com verificação técnica de dimensões, caracteres ASCII, duplicatas e hashes.
- Galeria de revisão em `docs/galeria-revisao-final-hd8.html`, com links às galerias completas.

Comandos: `npm test` executa a regressão completa; `npm run audit:art` regenera a auditoria. `python tools/qa-browser-stage8.py` realiza um teste visual isolado com Chromium/Playwright, se estes estiverem instalados.

**Importante:** a auditoria automatizada não representa avaliação estética das 611 artes. O teste isolado do visualizador não substitui validação completa do jogo no navegador ou em celular. Consulte `docs/relatorio-alta-densidade-etapa8.md`.


## Arena de combate compartilhada e correção do dano transitório

- O combate usa uma **arena única em diagonal**: inimigo acima e à direita, herói abaixo e à esquerda, com barras de HP e MP nos quadrantes opostos. O ataque comum e as quatro habilidades ficam visíveis inicialmente, com acesso aos consumíveis e à fuga por **Voltar**.
- A causa do dano persistente era o campo efêmero `rt.float`: ele sobrevivia ao encerramento do combate e não era reiniciado na próxima batalha. Além disso, `markImpact` armazenava um resultado visual mesmo em ações com zero dano. O estado transitório passa a ser reiniciado na abertura e no fechamento de qualquer combate, incluindo masmorras e fuga.
- `js/combat-visual-state.js`: controla sessões e feedback visual com identificadores únicos. Valores flutuantes são emitidos apenas quando a diferença real de HP não é zero; cura usa sinal `+` e dano usa `-`.
- `js/combat-visuals.js`: efeitos e projéteis são posicionados **relativamente à arena**, direcionados entre os dois retratos. Animações em andamento são canceladas no encerramento, e callbacks antigos não afetam uma nova sessão. Erros e esquivas exibem mensagens específicas no alvo; ações defensivas não fabricam dano.
- `css/combat-arena.css`: CSS Grid diagonal responsivo, sem barras horizontais da página. Em telas baixas, painéis e conteúdo podem rolar verticalmente sem cortar permanentemente os controles. Arte ASCII detalhada e cores de raridade são preservadas.
- `tests/combat-arena-visuals.mjs`: verifica reinício, resultados de dano/cura, invalidade de sessões anteriores, disposição da arena e botões; a suíte anterior continua ativa. `npm test` executa o novo teste junto dos anteriores.
- **Inspeção isolada no Chromium:** foram verificadas larguras de 320, 375, 390, 430, 720 e 1366 pixels com a marcação e as folhas de estilo reais. As artes foram dimensionadas pelo mesmo algoritmo usado por `fitAscii`. Não houve rolagem horizontal e os botões de habilidade permaneceram com 42px de altura. O carregamento do jogo completo via HTTP foi bloqueado por `ERR_BLOCKED_BY_ADMINISTRATOR`; a validação visual isolada não substitui testes de gameplay reais.

O formato do salvamento continua em **v14**. Nenhum atributo, cálculo de dano, cooldown, recompensa ou regra de combate foi alterado.

## Reformulação UX/UI Mobile-First: Etapas 1 e 2

A auditoria das 25 rotas e a fundação do design system estão documentadas em:

- `docs/ux-auditoria-mobile-first.md`
- `docs/ux-inventario-telas.json`
- `docs/ux-design-system.md`
- `docs/ux-validacao-mobile.md`

A versão reorganiza a entrada, o resumo da aventura e o menu do jogador, além de acrescentar tokens, foco visível, safe areas e áreas de toque de 44px nas telas normais. A arena de combate e a compatibilidade com salvamentos v14 foram preservadas. As outras etapas de UX/UI ainda não estão concluídas.

## UX/UI Mobile-First | Etapa 3: Navegação (novembro de 2026)

- Quatro áreas: **Aventura, Personagem, Diário e Mundo**, com navegação contextual no topo do conteúdo. Não há barra fixa inferior e a navegação desaparece durante combates.
- Novas páginas `diary` e `atlas` agrupam missões/bestiário/descobertas e mapa/cidade/serviços, respectivamente; o menu Personagem não repete os registros do Diário.
- Navegação lembra última tela e rolagem de cada área na sessão. Expedições não são encerradas ao alternar; masmorras preservam bloqueios; distribuição provisória de atributos exige confirmação antes de sair.
- Testes de regressão: `npm test`; prévias HTML: `node tools/build-ux-stage3-preview.mjs`.
- Relatório e limites de validação: `docs/ux-etapa3-navegacao.md`.

Próxima etapa do plano: **Etapa 4, Aventura e exploração**. O esquema de salvamento permanece v14.

## UX/UI Mobile-First: Etapa 4 de 9 (Aventura e Exploração)

- Seleção de caminho com três cartões claros e percentuais estimados de hostilidade, calculados a partir das regras existentes de clima e região. O jogo não altera o risco ou recompensa do caminho.
- O painel de expedição exibe rota, área, contagem de explorações, HP/MP e estado do descanso, mantendo ações principais acima de ilustrações e do histórico.
- Eventos narrativos pendentes aparecem com prioridade, escolhas e alertas. Imagens da jornada e acontecimentos anteriores permanecem acessíveis em painéis expansíveis. O dimensionamento é recalculado quando uma imagem é aberta.
- O acampamento ganhou resumo de recursos, aviso de descanso e botões de consumíveis organizados. Custo, intervalo e chance de emboscada permanecem os mesmos.
- A ação **Voltar à cidade** encerra a expedição e entra diretamente na cidade. O botão contextual **Voltar** continua permitindo regressar ao painel Aventura.
- Sem alterações em combate, XP, loot, balanceamento ou estrutura de salvamentos (v14).
- Testes: `npm test` (71 scripts OK), `node tools/build-ux-stage4-preview.mjs` e `python tools/qa-mobile-stage4.py` (35 verificações isoladas no Chromium).
- Detalhes e limitações em `docs/ux-stage4-aventura.md`. A validação de gameplay completo e de dispositivos móveis reais permanece pendente.

## UX/UI Mobile-First | Etapa 6 de 9: Personagem e Inventário (novembro de 2026)

- A ficha do herói apresenta indicadores importantes, avatar ASCII expansível, seis atributos com marcos, distribuição provisória e prévia de estatísticas.
- O inventário possui quatro áreas (Equipados, Mochila, Consumíveis e Materiais), com filtros e detalhes de itens acessíveis sob demanda.
- A comparação utiliza o próprio cálculo de atributos do jogo para projetar, **sem equipar ou salvar**, os efeitos da troca de equipamento, inclusive aprimoramentos e conjuntos.
- A configuração de habilidades mostra custos, desbloqueios e as três variantes existentes; passivas aparecem em seção expansível.
- O formato de salvamento permanece em **v14** e todas as mecânicas anteriores foram preservadas.
- Testes: `npm test`; `node tools/build-ux-stage6-preview.mjs`; `python tools/qa-mobile-stage6.py` (28 medições de layout com 320 a 1366 px).
- Evidências, arquivos e limites da verificação: `docs/ux-etapa6-personagem-inventario.md`.

A próxima etapa é a **Etapa 7: Cidades e Missões**.

## UX/UI Mobile-First | Etapa 7: Cidades e Missões
A cidade passa a abrir em Serviços e permite alternar para Mercado, com categorias de itens e preços originais. A taverna agrupa NPCs, histórias, contratos e desafios em seções expansíveis. O Diário filtra missões por prontas, em andamento, disponíveis e concluídas, reunindo missões tradicionais, narrativas e pessoais sem perder progresso de outras regiões. Todas as mudanças são visuais e de navegação, com LocalStorage v14 mantido.

Consulte `docs/ux-etapa7-cidades-missoes.md` para especificação, arquivos, testes e limitações. Execute `npm test` e `npm run qa:ux-city-preview`; a verificação visual é `python tools/qa-mobile-stage7.py` (requer Playwright/Chromium).


## UX/UI Mobile-First | Etapa 8, Responsividade e Acessibilidade

A partir do pacote integral da Etapa 7, esta etapa reforça a navegação por teclado, a semântica de tela para leitores de tela, os rótulos das artes ASCII, as áreas de toque e o comportamento em telas estreitas. Preserva o jogo e os salvamentos v14.

Os controles de velocidade do combate agora possuem 44 px, o link "Ir para o conteúdo do jogo" aponta para uma área focável, e painéis expansíveis podem ser fechados com Escape. Foram adicionados ajustes para safe areas, movimento reduzido, alto contraste e cores forçadas. Nenhuma regra de gameplay foi alterada.

Ver `docs/RELATORIO-UX-ETAPA8.md` e executar `npm test` ou `npm run qa:ux-stage8` para conferir testes e prévias.

## UX/UI Mobile-First, Etapa 9: Revisão Final

Esta etapa consolida o trabalho das Etapas 1 a 8: seletor de mapas compacto com região atual expandida, cenas ASCII opcionais na ferraria e nas masmorras, normalização defensiva de tentativas inválidas e consistência de navegação pela taverna.

A exclusão de progresso remove agora as três cópias locais (principal, backup e pré-migração). A opção de continuar uma aventura é disponibilizada quando existe uma cópia recuperável. Uma nova partida salva descarta o backup de pré-migração obsoleto. **Não houve alteração do salvamento v14 nem do balanceamento.**

Validação: `npm test` (**77 testes OK**) e `npm run qa:ux-stage9` (**23 estados × 8 resoluções = 184 verificações visuais**). Leia `docs/RELATORIO-UX-ETAPA9.md` para resultados, limitações e instruções. A execução interativa integral em Chromium não pôde ser verificada neste ambiente por bloqueio da navegação HTTP local; os fluxos são testados em Node com DOM simulado, e a inspeção visual usa HTML e CSS reais.


## Correção de foco e duplo clique (21/11/2026)

O jogo passou a priorizar exclusivamente interação por toque e mouse. Removidas as
rotinas que focavam automaticamente o título, o painel e os botões reconstruídos
entre telas, o que gerava bordas amarelas e deslocamentos inesperados. Botões,
abas, painéis expansíveis e artes ampliáveis respondem ao primeiro clique/toque,
sem exigir um clique prévio para remover seleções. A restauração de rolagem
continua ativa, mas não restaura foco. Também foram removidos os atalhos manuais
de teclado; a entrada de nome continua funcionando com teclado após clicar no
campo. Nenhum dado de salvamento foi alterado. Para validar: `npm test`.

## Atualização: navegação inferior fixa (mobile-first)

A navegação pelas seções **Aventura, Personagem, Diário e Mundo** está fixa no rodapé e fora da área de rolagem. Clicar em uma aba, inclusive na já selecionada, sempre retorna à tela inicial da seção e ao topo da página. A expedição ativa e a masmorra ativa continuam sendo respeitadas; durante um combate, a barra fica oculta para não interromper o turno. Toque e mouse são os meios de navegação. A versão de salvamento permanece v14. Consulte [`docs/CORRECAO-NAVEGACAO-INFERIOR.md`](docs/CORRECAO-NAVEGACAO-INFERIOR.md) para arquivos alterados e testes.


## Reformulação UX/UI consolidada (21/11/2026)

Atualização mobile-first em entrega única, partindo da versão com navegação inferior fixa. Inclui Aventura em cartões compactos, cabeçalho e botões redesenhados, Configurações de apresentação, dicas contextuais descartáveis e missão acompanhada. Preserva a versão 14 do salvamento e as mecânicas de gameplay.

Para detalhes, arquivos modificados, limitações de validação e testes, consulte `docs/RELATORIO-REFORMULACAO-CONSOLIDADA.md`.

Testes: `npm test` e `npm run qa:ux-consolidated`.

# ASCII REALMS | Navegação inferior fixa

## Escopo

Atualização incremental aplicada à edição completa da Etapa 9 com a correção de foco/clique. Não modifica regras de jogo, inventário, combate, pontuação, economia nem o formato dos salvamentos LocalStorage (v14).

## Novo comportamento

- A barra com **Aventura, Personagem, Diário e Mundo** é fixa ao rodapé da janela (`position: fixed`), centralizada e limitada à largura de 720 px do jogo.
- A barra é renderizada **fora da região rolável**. A região de conteúdo possui espaço inferior adicional e respeita a área segura do dispositivo.
- Todos os botões retornam **diretamente à tela inicial da seção**, mesmo quando a seção já está selecionada. Não é mais recuperada a última subtela aberta em outra seção.
- Repetir o toque em uma aba já selecionada também reposiciona a tela no topo, sem exigir um segundo clique.
- Destinos: **Aventura** abre a tela principal `world`; **Personagem** abre `player`; **Diário** abre `diary`; **Mundo** abre `atlas`.
- Exemplo: `Mundo > Taverna > Mundo` abre novamente o atlas do Mundo. `Personagem > Inventário > Personagem` abre o menu de Personagem.
- Para não interromper estados em andamento, Aventura retorna à expedição `journey` quando ela está ativa; Mundo retorna à tentativa `dungeon` durante uma masmorra ativa. Abas bloqueadas durante masmorras permanecem bloqueadas.
- A barra não aparece nas telas de entrada e criação nem durante um combate ou seu resultado, para não interromper o turno de combate. Nessas telas o fluxo permanece o já existente.
- A navegação não depende de foco via teclado; os botões da barra têm `tabindex="-1"`, mantendo operação por toque e mouse.
- Navegação entre seções não adiciona entradas ao histórico de Voltar; o botão Voltar contextual continua disponível nas subtelas.

## Arquivos alterados

- `js/navigation-sections.js`: destinos das quatro seções e botões fora da navegação por teclado.
- `js/main.js`: clique sempre direciona à raiz e limpa o histórico contextual, inclusive se a aba atual já for a raiz.
- `js/ui.js`: barra movida para fora de `.content` e correção da rolagem após tocar na aba já selecionada.
- `css/mobile-fixed-bottom-nav.css`: estilo responsivo do rodapé fixo e espaço de conteúdo para não encobrir ações.
- `index.html`: importação da folha de estilo ao final, preservando a correção anterior de foco.
- `tests/mobile-navigation-stage3.mjs` e `tests/mobile-final-integration-stage9.mjs`: expectativas atualizadas para o novo fluxo.
- `tests/fixed-bottom-navigation.mjs`: nova bateria de regressão de interação e reposicionamento da tela.
- `package.json`: inclusão do novo teste na suíte.

## Testes

- **79 testes automatizados** da suíte (`npm test`), todos aprovados.
- **36 verificações visuais** por HTML e CSS estáticos em 6 estados de tela × 6 resoluções (320, 360, 390, 430, 720 e 1366 px): barra fixa, altura mínima de 48 px, alvos de toque, ausência de rolagem horizontal, controles finais acessíveis e posição correta no rodapé.
- Exemplos de prévias em `docs/qa-bottom-nav-atlas-390.png`, `docs/qa-bottom-nav-cidade-390.png` e `docs/qa-bottom-nav-aventura-390.png`.
- Limitação: o navegador automatizado bloqueou a navegação a `localhost` (`ERR_BLOCKED_BY_ADMINISTRATOR`), portanto o fluxo completo no jogo real não pôde ser executado via navegador. A lógica de navegação foi validada pelo manipulador real em testes Node com DOM simulado, e o layout foi validado com as prévias estáticas do HTML e CSS do jogo.

## Executar

Abra `index.html` por meio de um servidor estático HTTP (por exemplo, `npx serve`, `python -m http.server` ou Live Server). O jogo usa módulos JavaScript ES e o navegador pode limitar esses módulos quando aberto via `file://`.

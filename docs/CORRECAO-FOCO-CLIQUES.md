# ASCII REALMS: correção de foco e interação (21/11/2026)

## Problema

Um foco programático no título ou na área de conteúdo, introduzido na Etapa 8, mantinha um contorno amarelo visível. Em trocas de tela, a regra `:focus` também tornava visível um título originalmente oculto, movimentando os controles. O estado de foco ainda era restaurado automaticamente após a reconstrução da interface. Isso podia causar a impressão de que o primeiro clique apenas removia a seleção.

## Correções

- Remoção de todo foco automático após navegação e renderização (`js/ui.js`).
- Preservação da posição de rolagem sem tentar restaurar foco anterior (`js/viewport-state.js`).
- Remoção de atalhos de teclado para fechar painéis e dar zoom em artes (`js/main.js`, `js/ascii-presentation.js`, `js/ui.js`).
- Desativação da navegação sequencial por `Tab` nos controles do jogo. O clique e o toque continuam funcionando, bem como a digitação ao clicar em campos (`js/mobile-accessibility-stage8.js`).
- Eliminação de contornos e sombras de foco, inclusive os estilos de maior prioridade, e do comportamento do título oculto quando recebe foco (`css/pointer-only-focus-fix.css`).
- Remoção do link de atalho de teclado que precedia o jogo (`index.html`).
- Preservação da seleção **funcional** das abas e dos painéis, sem confundir seleção de estado com foco do navegador.

## Verificações

- `npm test`: suíte completa aprovada, incluindo o novo `tests/pointer-first-click.mjs`.
- Chromium com HTML/CSS real das prévias da Etapa 9: 12 combinações de quatro telas (Mapas, Criação, Ferraria, Masmorras) e três larguras (320, 390, 430 px). Em cada caso, confirmado: ausência de contorno amarelo, primeira interação do botão registrada sem clique prévio, expansão de painel com um toque e ausência de rolagem horizontal.
- **Limite do teste**: o navegador de QA não permitiu navegar até o servidor HTTP local para executar o jogo completo. A verificação de primeira interação utilizou o HTML/CSS das telas e uma contagem de eventos de clique, não o sistema completo de navegação. A suíte de testes do jogo foi executada normalmente via Node.js.

## Compatibilidade

Nenhuma modificação nas regras de combate, progressão, economia ou salvamento (continua a versão 14). O pacote é o projeto completo baseado na Etapa 9, pronto para substituir os arquivos da versão anterior. Salve uma cópia do projeto antes de substituir os arquivos.

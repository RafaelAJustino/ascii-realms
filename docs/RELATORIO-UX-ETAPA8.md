# ASCII REALMS | UX/UI Mobile-First, Etapa 8

## Escopo

Continuidade integral da Etapa 7. Auditoria transversal de **responsividade e acessibilidade**, sem alterações de regras, atributos, preço de itens, encontros, experiência, combate, progressão, eventos, missões ou formato de salvamento.

## Principais correções

1. **Foco e navegação por teclado**. Cabeçalho semântico de tela (`h2`), foco restaurado ao trocar de tela, manutenção do foco e da posição durante atualizações da mesma tela por meio do `viewport-state.js` preexistente. O link de salto agora aponta diretamente para o conteúdo focável (`#game-content`).
2. **Artes ASCII e leitores de tela**. O desenho continua intacto. O leitor de tela recebe um rótulo descritivo em seu contêiner em vez de ler cada símbolo individual. Artes ampliáveis continuam sendo acionadas com Enter ou Espaço. Nenhuma imagem externa foi adicionada.
3. **Ações acessíveis**. Atalhos de teclado para fechar painéis `<details>` com Escape, foco destacado, estados `aria-pressed` nos grupos de ações, mensagens de confirmação marcadas como status quando necessário.
4. **Áreas de toque**. Todos os controles importantes mantêm altura mínima de 44 px. Os seletores de velocidade de combate agora também têm 44 px.
5. **Responsividade**. Respeito aos `safe-area-inset-*`, ajuste de metadados muito pequenos, quebra controlada de texto sem quebrar a arte ASCII e medidas defensivas contra rolagem horizontal.
6. **Preferências de acessibilidade**. Estilos para movimento reduzido, contraste aumentado e cores forçadas. Os efeitos gráficos continuam para quem não solicitou redução de animações.

## Arquivos modificados e criados

- `index.html`: ligação da folha da Etapa 8 e correção do link de salto.
- `js/ui.js`: semântica e rótulo da tela, foco ao navegar, papel e descrição de arte ASCII.
- `js/main.js`: tratamento de Escape nos painéis expansíveis.
- `js/mobile-accessibility-stage8.js`: aprimoramentos semânticos após renderização, sem alterar o estado do jogo.
- `css/mobile-responsiveness-stage8.css`: medidas de toque, navegação e adaptações de acessibilidade.
- `tests/mobile-responsiveness-stage8.mjs`: teste de regressão estático e funções da etapa.
- `tools/qa-mobile-stage8.py`: auditoria visual com HTML gerado pelas funções reais e CSS completo.
- `package.json`: inclui o novo teste no `npm test` e o comando `npm run qa:ux-stage8`.

## Validação executada

- `npm test`: **75 resultados OK** (74 anteriores e 1 novo).
- `npm run qa:ux-stage8`: **14 estados de tela × 8 resoluções = 112 verificações** (320×568, 360×780, 375×667, 390×844, 430×932, 580×850, 720×1280, 1366×900).
- Critérios observados no navegador para essas prévias: sem scroll horizontal no documento ou no painel; controles visíveis dentro da largura; controles medidos com pelo menos 43 px por tolerância de arredondamento; controles com nome acessível; arte ASCII com texto oculto individualmente, descrição no contêiner e cabeçalho de tela presente.
- Prévias: `docs/qa-ux8-{aventura,combate,personagem,inventario,cidade,missoes}-390.png` e métricas em `docs/qa-ux8-browser-metrics.json`.

## Limites da validação

A navegação HTTP local do projeto no Chromium deste ambiente retorna `ERR_BLOCKED_BY_ADMINISTRATOR`. Portanto, **não foi possível executar o gameplay interativo ponta a ponta no navegador**. As capturas usam HTML produzido pelas funções do jogo e as 45 folhas CSS reais. Os cliques, a progressão, o combate e a persistência são cobertos pelos testes Node existentes. A auditoria não constitui certificação WCAG ou teste assistivo com leitores de tela reais.

## Como executar

1. Abra a pasta `ascii-realms-main`.
2. Execute `npm test`.
3. Execute `npm run qa:ux-stage8` com Python, Playwright e Chromium instalados para reproduzir a auditoria.
4. Para jogar, abra a página via um servidor estático, por exemplo `python -m http.server 8000`, em um ambiente de navegador local permitido.

**Persistência:** mantém as mesmas chaves e versão 14 do salvamento anterior. O pacote é o projeto completo, não um patch.

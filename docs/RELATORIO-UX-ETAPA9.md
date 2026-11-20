# ASCII REALMS | UX/UI Mobile-First, Etapa 9: Testes e Refinamento Final

## Objetivo e base

A Etapa 9 foi desenvolvida **sobre o ZIP completo da Etapa 8**, sem recriar o jogo. Consolida a navegação e a apresentação das telas menos revisadas, reforça o ciclo de recuperação/exclusão do salvamento e amplia os testes de regressão.

Preservados: universo, classes, conteúdo, artes ASCII em alta densidade, atributos, itens, raridades, missões, NPCs, economia, mecânicas de combate, progressão, eventos, jornadas e **salvamento v14**.

## Correções de integração

1. **Exclusão integral do progresso:** excluir o personagem agora remove as três cópias locais (`ascii-realms-save-v1`, backup e pré-migração). Antes só o arquivo principal era excluído, permitindo uma recuperação indesejada. A ação permanece protegida por confirmação, e uma falha de armazenamento gera aviso sem simular sucesso.
2. **Recuperação de dados:** a tela inicial oferece **Continuar aventura** quando uma cópia válida está disponível, ainda que a principal esteja danificada ou ausente. Arquivos inválidos não habilitam a continuação.
3. **Novo jogo após migração:** uma nova partida gravada com sucesso limpa um backup de pré-migração obsoleto, evitando reabrir acidentalmente um personagem antigo em caso de dano futuro às outras cópias.
4. **Entrada contextual na taverna:** retornar à taverna pelo menu global registra uma visita real, assim como a navegação normal. A renderização da tela, isoladamente, não registra visitas.
5. **Validação de masmorras:** IDs de tentativa inválidos são descartados durante a normalização, evitando travamento por referência a uma masmorra inexistente. Uma tentativa inválida em memória pode ser abandonada por uma ação visível.

## Refinamento visual Mobile-First

- **Seleção de mapas:** as 10 regiões têm informações resumidas, com áreas recolhidas por padrão, exceto a região atual. Os 100 botões de área continuam disponíveis e preservam seus bloqueios.
- **Ferraria:** a arte interior completa permanece disponível em uma seção expansível. Encomendas, materiais e fabricação aparecem mais cedo na rolagem.
- **Masmorras:** cada entrada apresenta descrição, nível, progresso e botão de entrada antes da arte ASCII expansível. Durante uma tentativa, os controles da sala também têm prioridade.
- **Acessibilidade:** essas novas seções usam `<details>/<summary>` nativos, com teclado, área de toque mínima de 44 px e ajuste da arte ao expandir. Mantêm o CSS da Etapa 8 para movimento reduzido e indicadores de foco.

Não foram removidas artes nem alterados cálculos de inimigos, preços, drops ou recompensas.

## Testes executados

### Suíte automatizada

`npm test`: **77 mensagens OK**, incluindo os 75 testes anteriores e dois testes novos:

- `tests/mobile-final-integration-stage9.mjs`: fluxo simulado de navegação, início da expedição, acampamento, vitória em combate, retorno ao caminho, ida à cidade, aceitação/entrega/recompensa de missão, proteção contra recompensa duplicada, taverna via navegação, bloqueios da masmorra e recuperação/exclusão/nova criação de personagem.
- `tests/mobile-final-polish-stage9.mjs`: 10 regiões recolhíveis, botões de área e bloqueios, ferraria e masmorras com cenas preservadas, tentativa em andamento, IDs inválidos e CSS da etapa.

### Auditoria visual

`npm run qa:ux-stage9`: **23 estados de tela × 8 resoluções = 184 verificações**, com Chromium e HTML produzido pelas funções reais da interface.

Resoluções: 320×568, 360×780, 375×667, 390×844, 430×932, 580×850, 720×1280 e 1366×900.

Critérios aprovados para as prévias: sem rolagem horizontal do documento ou do painel, sem controles fora da largura, sem controles abaixo de 43 px (tolerância de arredondamento para o mínimo de 44 px), sem controles sem rótulo e com descrição alternativa nas artes ASCII do HTML renderizado. A criação de personagem também foi verificada quanto à existência dos campos e labels.

Resultados detalhados em `docs/qa-ux9-browser-metrics.json`. Capturas em `docs/qa-ux9-*-390.png`.

## Limitações conhecidas

- A navegação HTTP do jogo completo no Chromium deste ambiente retorna **ERR_BLOCKED_BY_ADMINISTRATOR**. Por isso **não foi possível testar um gameplay interativo completo no navegador**.
- O teste de fluxo executa handlers e lógica reais em Node com DOM simulado. A auditoria visual usa HTML das funções reais e CSS real, mas não executa os handlers no navegador.
- As verificações automatizadas **não substituem testes manuais em aparelhos móveis reais ou certificação WCAG**.

## Arquivos alterados nesta etapa

- `js/storage.js`, `js/player.js`, `js/main.js`, `js/ui.js`, `js/state-schema.js`
- `css/mobile-final-stage9.css` (novo)
- `index.html`, `package.json`, `README.md`
- `tests/mobile-final-integration-stage9.mjs` e `tests/mobile-final-polish-stage9.mjs` (novos)
- `tools/build-ux-stage9-preview.mjs`, `tools/qa-mobile-stage9.py` (novos)
- `docs/qa-ux9-*-fixture.html`, `docs/qa-ux9-browser-metrics.json` e imagens de prévia (novos)

## Instruções

1. Extraia o ZIP. O conteúdo está dentro de `ascii-realms-main/`.
2. Para jogar, abra `index.html` através de um servidor estático local. Por exemplo, dentro dessa pasta: `python -m http.server 8000`.
3. Execute `npm test` para rodar os testes funcionais e de regressão.
4. Execute `npm run qa:ux-stage9` com Python, Playwright e Chromium para reproduzir a auditoria visual.

O formato do salvamento continua na **versão 14**. Para segurança, recomenda-se fazer uma cópia dos dados do navegador antes de testar uma alteração local em um personagem importante.

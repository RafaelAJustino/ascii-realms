# ASCII REALMS | UX/UI Mobile-First, Etapa 4: Aventura e Exploração

## Base de implementação

Continuidade direta de **UX/UI Etapa 3**, já baseada em **ASCII REALMS Alta Densidade 8** com arena de combate diagonal. Todas as mudanças desta etapa são de apresentação e navegação da expedição, exceto o destino do botão explícito **Voltar à cidade**, que agora abre o serviço urbano diretamente após concluir a jornada. O botão genérico de retorno mantém seu destino anterior, **Aventura**.

## Auditoria específica

| Situação anterior | Melhoria realizada |
|---|---|
| Rotas exibiam percentuais sem explicar claramente a escolha | Três cartões com riscos, resultados e orientação em linguagem simples |
| Arte extensa da região aparecia antes dos botões de exploração | Controles de continuar, acampamento e cidade aparecem antes da ilustração |
| Recompensas e risco não tinham contexto | Indicadores mostram a chance **estimada** de encontro hostil, com aviso sobre clima |
| Pouca visibilidade do progresso de expedição | Rota atual, região, número de explorações, HP e MP ficam no topo |
| Eventos pendentes competiam visualmente com outras ações | Decisões de eventos têm prioridade; ações incompatíveis ficam indisponíveis |
| Histórico de resultados ocupava espaço vertical | Últimos acontecimentos ficam num painel expansível, sem perder registros |
| Acampamento apresentava muitas informações em sequência | Status dos recursos, descanso disponível e consumíveis agrupados por função |
| Retorno à cidade exigia passar pelo painel de Aventura | A ação explícita **Voltar à cidade** encerra a rota e abre a cidade em um toque |
| Ilustrações ocultas podiam ser dimensionadas antes da abertura | A arte é redimensionada no evento `toggle` quando o painel é expandido |

## Regras preservadas

- Rota segura, desconhecida e perigosa continuam com chances-base de **72% / 80% / 86%** de encontro hostil, sujeitas a modificadores já existentes de tempo, clima e região.
- O clima avança antes do sorteio do próximo encontro. Por isso a interface identifica os percentuais como **estimativas das condições atuais**.
- O conteúdo dos eventos e as consequências das escolhas não foram alterados.
- Acampamento mantém **10 ouro**, recuperação de **25% do HP/MP máximo**, espera de **5 explorações** e **10% de emboscada**.
- Personagens preservam classe, atributos, equipamentos e salvamentos **v14**, sem novos campos persistentes.
- Combate, drops, XP, inimigos e fases de chefes permanecem inalterados.
- A expedição permanece ativa ao visitar outras áreas de navegação e é retomada quando o jogador retorna.

## Arquivos

**Criados:** `js/adventure-presentation.js`, `css/mobile-adventure-stage4.css`, `tests/mobile-adventure-stage4.mjs`, `tools/build-ux-stage4-preview.mjs`, `tools/qa-mobile-stage4.py` e este documento.

**Modificados:** `js/ui.js`, `js/main.js`, `js/exploration.js`, `index.html`, `package.json`, `README.md` e as asserções de retorno nos testes legados `tests/journey-flow.mjs`, `tests/journey-events-flow.mjs` e `tests/combat-speed.mjs`.

## Validação

1. `npm test`: **71 scripts com resultado OK**, incluindo teste específico de UI da Etapa 4 e regressões de combate, acampamento, eventos, missões, inventário e salvamentos.
2. `node tools/build-ux-stage4-preview.mjs`: cria cinco prévias estáticas a partir das funções reais de renderização e dos CSS reais.
3. `python tools/qa-mobile-stage4.py`: **35 verificações** no Chromium, abrangendo **rotas, expedição, decisão pendente, acampamento e aventura** em **320, 360, 375, 390, 430, 720 e 1366 px**. Sem erros de renderização, overflow horizontal, botões fora da tela ou botões com altura inferior a 44px nas páginas avaliadas.
4. O teste do clique `journeyCity` confirma abertura direta da cidade e impede fuga com decisão narrativa pendente.

**Limitação:** os testes visuais utilizaram prévias isoladas com o HTML gerado pelo jogo e seus estilos reais. Não substituem um teste completo e interativo do jogo no navegador ou um teste de toque em telefone físico. Também não demonstram equilíbrio de recompensas ou de dificuldade.

## Próxima etapa

**Etapa 5 de 9: Combate.** Polir a organização da arena, a leitura das ações e o feedback de efeitos e cooldowns, sem alterar as regras do combate.

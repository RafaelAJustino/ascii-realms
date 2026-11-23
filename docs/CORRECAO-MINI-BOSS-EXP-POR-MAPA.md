# ASCII REALMS | Correção do Mini Boss por mapa e barra de EXP

## Base

Aplicado ao ZIP completo `ascii-realms-mini-bosses-15-exploracoes.zip`, sem recriar o jogo e mantendo `SAVE_VERSION = 14`.

## Problema e correção

1. **Contador ativo após mudar de mapa**: a seleção da área atualizava `rt.area` e `state.area`, mas não sincronizava `explorationChallenge.currentMapId` e `consecutiveExplorations`. Agora `selectChallengeMap(state, region)` ajusta explicitamente ambos os valores ao entrar em outra região. A sequência é lida de `consecutiveByMap[region]`, ou começa em zero quando ainda não existe. O registro de Mini Boss derrotado em outro mapa permanece inalterado.
2. **Migração e leitura**: `normalizeChallenge` recalcula o contador ativo a partir do mapa efetivamente salvo, inclusive se um campo legado apontar para a região anterior. `challengeProgress` sempre consulta o identificador da região solicitada. Um Mini Boss vencido é apresentado como concluído com a barra em 100%, sem forçar o novo mapa a ser concluído.
3. **Identidade visual**: os indicadores mostram o nome específico do Mini Boss na região ativa, além de `Explorações consecutivas: n/15` ou estado de vitória.
4. **Barra de EXP**: o layout da Expedição usa HP e MP em duas colunas. A EXP é renderizada abaixo em um grupo independente com título à esquerda, valor à direita e trilho de 100% da largura útil. Utiliza `xpNeed(level)` e `state.xp`, sem fórmula paralela. No nível 100 exibe `MAX` e preenchimento total. O CSS foi limitado à Expedição para preservar os demais painéis.

## Arquivos alterados

- `js/exploration-challenge.js`: sincronização explícita de mapa, recuperação da contagem ativa, leitura independente por mapa.
- `js/exploration.js`: chamada de `selectChallengeMap` em `changeArea`.
- `js/ui.js`: nome correto do Mini Boss e HTML da linha de EXP.
- `css/mini-bosses.css`: disposição responsiva das barras e novo rótulo de Mini Boss.
- `tests/mini-boss-map-exp-fix.mjs`: teste funcional do caso relatado, preservação de vitória, troca de região, retorno, reset da cidade, LocalStorage, migração, EXP e nível máximo.
- `package.json`: adição do teste à suíte `npm test`.
- `tools/build-mini-boss-map-fix-preview.mjs`: criação de prévia estática da segunda região, com o HTML real do jogo.

## Testes e resultados

- **`npm test`: aprovado**, com 84 linhas de resultado `OK:` na suíte atual.
- **Teste de regressão específico:** primeira região vencida, segundo mapa começa em 0/15 com Safira, retorno mostra Vesper como derrotado e sequência independente de outro mapa. A navegação entre áreas da mesma região preserva a contagem. A cidade limpa somente a sequência pendente.
- **Persistência:** salvamento v14, recarga e migração com campo de contagem global obsoleto.
- **Experiência:** ganho de XP, mudança de nível e nível 100 (sem divisão por zero).
- **QA visual estático em Chromium:** 320, 360, 375, 390, 430 e 720 px. A barra de EXP ocupa a largura inteira do grupo, HP/MP permanecem na mesma linha e não há rolagem horizontal no conteúdo inspecionado.
- **Prévia de mapa 2:** render do estado `Deserto Escarlate`, Mini Boss `Safira, a Viúva das Dunas`, 0/15.

### Limitação da validação visual

O ambiente bloqueia a navegação direta por arquivo no Chromium. Foi utilizado o HTML estático gerado pelas funções reais de renderização e os estilos reais do projeto, inseridos com `page.set_content`. Isso verifica dimensões e aparência, mas não equivale à execução integral das interações em um navegador real.

## Compatibilidade

Não foram alteradas as regras de experiência, o combate, os prêmios, o custo dos serviços, os dados dos personagens ou o formato do LocalStorage. Os mapas já desbloqueados permanecem desbloqueados.

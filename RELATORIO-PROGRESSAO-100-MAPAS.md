# ASCII REALMS: Correção de Mini Bosses, Bosses e progressão

## Base e escopo

Base: `ascii-realms-correcao-mini-boss-exp.zip`. Esta atualização trabalha diretamente no código existente, sem substituir os sistemas de combate, arte, missões e inventário. Conserva o `LocalStorage` e `SAVE_VERSION = 14`.

## Problema encontrado

O desafio anterior tinha dez IDs regionais (índices 0 a 9) e usava `mapId(area)` para contar explorações, de modo que áreas 1 a 10 compartilhavam o mesmo mini boss, progresso e condições de liberação. O boss de fase podia ser acessado diretamente por um botão separado. Com essa estrutura, era impossível aplicar corretamente a regra de um desafio por cada uma das 100 áreas.

## Regras corrigidas

- **100 áreas (1 a 100)**, distribuídas em **10 fases de 10 áreas**.
- **90 Mini Bosses** nas áreas não múltiplas de 10, com nomes/IDs próprios, variações regionais de técnicas, passivas e arte textual. Preservadas as dez bases artísticas originais.
- **10 Bosses de Fase** nas áreas 10, 20, 30, ..., 100. Foram preservados seus sistemas existentes de fases, ataques anunciados e recompensas.
- **15 explorações realmente concluídas** acionam um único encontro obrigatório. A 15ª conclusão não pode acumular outro encontro, e cliques repetidos não contabilizam duas vezes.
- **Contador zerado após vitória ou derrota** no desafio obrigatório, após troca efetiva de área e após interação urbana, mas **não** por abrir a cidade ou menus.
- **Derrota comum não apaga o contador**. A etapa não é contabilizada como vitória se não houve conclusão.
- **Vitória permanente por área**. Uma revanche após outras 15 explorações é permitida e não duplica o troféu exclusivo da primeira vitória.
- **Bloqueio consecutivo**: para acessar uma área ainda não liberada, todos os desafios anteriores desde o ponto legado precisam estar vencidos. Vencer o Boss 10 libera a área 11; vencer o Boss 20 libera a área 21.
- **Experiência, ouro, níveis, equipamentos e outras regras** permanecem com as fórmulas existentes.

## Migração e compatibilidade

O objeto `explorationChallenge` recebeu `schemaVersion: 2`. Os registros agora são por número da área (1–100):

```js
{
  schemaVersion: 2,
  currentMapId: 11,
  consecutiveExplorations: 0,
  consecutiveByMap: {},
  miniBossEncounterPending: false,
  pendingMapId: null,
  defeatedMiniBosses: {1: true, 2: true},
  defeatedStageBosses: {10: true},
  unlockedThrough: 1
}
```

`unlockedThrough` existe para salvamentos legados. Como a versão anterior liberava regiões inteiras, a migração respeita **todas as áreas às quais a partida já tinha acesso**, sem apagá-las. Os novos jogos não recebem esse desbloqueio retroativo. Os registros de `bosses` (índices regionais 0 a 9) continuam disponíveis aos demais sistemas e são espelhados no desafio correspondente a 10, 20, ..., 100.

Se a página for recarregada com um desafio pendente, o jogador retorna à apresentação do confronto, sem receber vitória nem recompensa antecipada.

## Arquivos alterados e adicionados

- `js/exploration-challenge.js`: máquina de estado única, migração, contagem, reset, reabertura e progressão por área.
- `js/area-bosses.js`: identidades dos 90 Mini Bosses e seleção dos Bosses de Fase.
- `js/exploration.js`: atribuição de conclusões à área correta e reset ao mudar de mapa.
- `js/combat.js`: encontro obrigatório, vitórias/derrotas, revanches e recompensas únicas.
- `js/mini-bosses.js`: reaproveitamento dos kits de IA da área correta.
- `js/journey-paths.js`: verificação de acesso ao mapa por desafio concluído.
- `js/dungeons.js`: adaptação da disponibilidade de masmorras às áreas.
- `js/main.js`: interações urbanas e remoção do atalho que contornava o desafio do boss.
- `js/ui.js`: contador e status por área, seleção de mapas, apresentação apropriada de Boss de Fase.
- `js/progression-ui.js`: registros de minibosses identificados pelo nome exclusivo.
- `css/mini-bosses.css`: apresentação compacta de área e progresso.
- `tests/challenge-per-area.mjs`: integração real de combates, simulação de desbloqueio de todas as 100 áreas, derrotas, revanches, saves e migração.
- Testes preexistentes atualizados para a progressão por área: `smoke`, `journey-paths`, `mini-boss-challenge`, `mini-boss-map-exp-fix`, `density-bestiary`, `high-density-monsters-stage4`, `high-density-bosses-stage5`.
- `tools/run-all-tests.mjs` e `package.json`: possibilidade de executar os testes em processos isolados.

## Validação

Foram executados **81 arquivos de testes individualmente, com 81 aprovações**. A suíte inclui verificações de combate, IA, efeitos, fases dos bosses, masmorras, comércio, exploração, UI, LocalStorage, artes ASCII e progressão.

O novo `tests/challenge-per-area.mjs` verifica especificamente:

1. 90 Mini Bosses e 10 Bosses de Fase exclusivos por número de área.
2. 14/15 sem chefe; 15/15 com encontro obrigatório, sem incrementos extras.
3. Vitória, derrota, desbloqueio e revanches (inclusive ausência de troféu especial duplicado).
4. Derrota comum preservando a sequência.
5. Reinício ao trocar de área e ao usar serviços da cidade.
6. Recuperação do encontro pendente após recarregar o salvamento.
7. Desbloqueio sequencial de 1 a 100, incluindo transições 10→11 e 20→21.
8. Migração de salvamentos anteriores, sem perda de regiões já acessíveis.

**Limitação:** nesta execução não foi concluída uma sessão interativa completa em navegador móvel real. O funcionamento de toque, rolagem e animações deve ser validado manualmente antes de publicar. Uma execução monolítica do antigo comando de testes apresentou travamento do processo no ambiente; a execução individual de cada arquivo concluiu com sucesso.

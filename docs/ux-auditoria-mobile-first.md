# ASCII REALMS | Auditoria UX/UI Mobile-First

Base auditada: **ASCII REALMS: Arena de Combate Atualizada**, contendo a reformulação ASCII de alta densidade até a Etapa 8. Esta auditoria foi feita diretamente no código (`js/ui.js`, `js/main.js`, `js/progression-ui.js`, `js/viewport-state.js`, `js/menu-history.js`, `css/` e `index.html`). Não equivale a entrevistas ou testes com jogadores.

## Inventário das telas e fluxos

Existem **25 identificadores de tela** no roteamento principal, dos quais alguns compartilham o mesmo renderizador. A estrutura existente deve ser reorganizada, sem remover fluxos:

| Área proposta | Telas existentes | Ações principais |
|---|---|---|
| Aventura | `home`, `create`, `world`, `paths`, `journey`, `camp`, `merchant`, `combat`, `result` | Criar/continuar, explorar, escolher caminho, descansar, eventos, combate, retornar |
| Personagem | `player`, `character`, `inventory`, `skills`, `specializations`, `achievements`, `statistics` | Atributos, equipamentos, inventário, habilidades, especialização, títulos |
| Diário | `quests`, `bestiary`, `secrets` | Acompanhar missões e descobertas, consultar criaturas e relatos |
| Mundo | `maps`, `city`, `tavern`, `forge`, `dungeons`, `dungeon` | Mapas, cidade e serviços, NPCs, comércio, fabricação, masmorras |

A renderização principal reside em `js/ui.js`. Ações são tratadas por delegação em `js/main.js`. O estado e o salvamento v14 não são migrados nesta entrega.

## Problemas identificados

| ID | Severidade | Tela/fluxo | Evidência no código | Recomendação | Situação |
|---|---|---|---|---|---|
| UX-01 | Alta | Navegação | `playerMenu()` concentra missões, bestiário, atributos, habilidades e segredos | Organizar Aventura, Personagem, Diário e Mundo com histórico contextual | Etapa 3 |
| UX-02 | Média | Menu do jogador | Havia duas entradas, Inventário e Equipamentos, ambas `nav:inventory` | Unificar rótulos | **Corrigido** |
| UX-03 | Alta | Tela de aventura | A arte ASCII aparece antes de `Explorar`, empurrando a principal ação para fora da primeira dobra | Priorizar ação principal antes da arte no celular | **Corrigido** |
| UX-04 | Alta | Inventário | Filtros `consumable` e `material` não restringem os blocos finais. Controles e detalhes se repetem por item | Separar filtros, lista, detalhes e comparação | Etapa 6 |
| UX-05 | Alta | Equipamento | Lista de atributos de cada item exige interpretação manual, sem comparação direta | Exibir diferenças numéricas, estado equipado e prévia visual | Etapa 6 |
| UX-06 | Média | Interface geral | `--ui-button-height:40px`, botões em 42px e estilos definidos por módulos diversos | Definir tokens e áreas de toque consistentes, preservar exceção de combate até Etapa 5 | **Fundação integrada** |
| UX-07 | Média | Formulários e teclado | Foco existe, mas não havia link direto ao conteúdo e componentes não compartilhavam tokens de foco | Adicionar navegação por teclado, foco consistente e semântica | **Fundação integrada** |
| UX-08 | Média | Altura em celular | A barra superior mostra três medidores completos antes do conteúdo principal | Criar HUD compacto com detalhes progressivos | Etapa 4 |
| UX-09 | Média | Jornada | Status do caminho, clima, histórico, arte e opções podem produzir páginas extensas | Agrupar objetivo/ação atual e reduzir informação repetida | Etapa 4 |
| UX-10 | Média | Cidades | Muitos serviços por região e estabelecimentos com interfaces distintas | Tela de serviços por intenção, com descrições | Etapa 7 |
| UX-11 | Média | Missões | Quests clássicas, narrativas e procedurais são apresentadas em módulos separados | Unificar visualização por estado e objetivo acompanhado | Etapa 7 |
| UX-12 | Média | Combate | Arena diagonal está implementada, mas configuração e histórico ainda competem por altura | Preservar arena e refinar ações/feedback; não alterar regras | Etapa 5 |
| UX-13 | Média | Atualizações | `render()` recria a árvore HTML inteira, restaurando rolagem e foco quando a tela não muda | Introduzir atualizações parciais para interações frequentes | Etapas 6 a 9 |
| UX-14 | Média | Primeira partida | A interface não tem orientação contextual estruturada | Introduzir dicas curtas, descartáveis e não obrigatórias | Etapa 9 |
| UX-15 | Alta | Qualidade mobile | Testes unitários são predominantemente estruturais; jogo completo não pôde abrir no Chromium deste ambiente | Testar fluxos reais em 320, 360, 375, 390, 430 e desktop | Etapas 8 e 9 |
| UX-16 | Baixa | Entrada | Continuar aparecia como primeira ação mesmo quando desabilitado | Destacar Novo personagem quando não há salvamento | **Corrigido** |

## Decisões de design desta entrega

1. **Não reintroduzir barra inferior fixa** antes de concluir a análise de navegação. O layout anterior a removeu por motivos de espaço.
2. **Mostrar a próxima ação** no início da tela Aventura. Os controles aparecem antes de uma ilustração extensa.
3. **Priorizar texto legível**. A arte ASCII mantém sua escala independente da tipografia funcional.
4. **Padronizar a interação** por meio de tokens CSS, 44px de área de toque nas telas normais, 8px entre botões, foco visível, áreas seguras e cores sem excesso de decoração.
5. **Manter o combate intacto** nesta etapa. Seus controles compactos de 42px serão reavaliados especificamente na Etapa 5.
6. **Preservar saves e identificadores**. Nenhuma mudança nas regras, itens ou progresso.

## Restrições e critérios para próximas fases

- Não alterar estatísticas, cooldowns, navegação de eventos ou regras de combate.
- Preservar a barra `Voltar` sticky e a restauração de foco/rolagem.
- Garantir que nenhum conteúdo importante fique inacessível a 320px.
- Comparação de equipamento deve indicar diferenças com sinal e rótulo, não somente cor.
- Evitar substituição da arte ASCII por imagens.
- A auditoria será atualizada com problemas reais encontrados nos testes de cada etapa.

# ASCII REALMS | Reformulação UX/UI Mobile-First
## Etapa 7: Cidades, Tavernas, NPCs e Diário de Missões

**Base exata:** `ascii-realms-ux-mobile-etapa6.zip` (322 entradas verificadas, conteúdo do projeto igual ao pacote da etapa anterior).

### O que foi implementado

1. **Cidade orientada a tarefas:** os serviços urbanos são a vista inicial. Mercado, taverna, missões, ferraria, masmorras e descanso são acessíveis sem percorrer o catálogo de itens. Os indicadores de ouro, reputação, desconto e clima permanecem visíveis. A arte ASCII da cidade fica disponível em uma seção expansível.
2. **Mercado por categorias:** troca entre Armas, Armaduras, Acessórios, Poções e Materiais em botões grandes. O catálogo de cada categoria continua proveniente do motor de lojas existente, preservando preços, estoque, descontos e condições de compra. O catálogo permanece no DOM dentro de uma seção expansível, mas não alonga a tela inicial de serviços.
3. **Taverna organizada:** moradores/visitantes, acontecimentos, aventuras pessoais, contratos e desafio regional são grupos expansíveis. NPCs têm identificação, função, histórico de conversas e acesso ao diálogo, aos retratos ASCII e à ação Conversar. As escolhas, recompensas únicas, reputação e mecanismos de descoberta já existentes foram preservados.
4. **Diário filtrável:** quatro categorias, Prontas, Em andamento, Disponíveis e Concluídas. O diário mostra missões regionais, narrativas e pessoais, com progresso, recompensas, região e ações pertinentes. Missões ativas de outras regiões continuam acessíveis, com indicação de retornar ao local quando necessário. Missões de coleta com materiais suficientes são mostradas como prontas para entregar.
5. **Acessibilidade e mobile:** elementos interativos com altura mínima próxima de 44 px nas telas testadas, indicadores de filtro por texto e seleção, estados de foco, grade responsiva, ausência de barra fixa e preservação dos detalhes abertos ao atualizar a tela. Apoio à preferência de reduzir movimento.

### Arquivos alterados

- `js/ui.js`: apresentação da cidade/taverna e restauração de estado visual dos elementos expansíveis.
- `js/progression-ui.js`: encaminhamento do diário para a apresentação organizada, sem alterar as demais telas de progressão.
- `js/main.js`: novas ações visuais `citySection:*` e `questFilter:*`, manutenção de categorias de comércio e seleção do filtro adequado após aceitar, entregar ou resgatar missões.
- `js/runtime.js`: estado transitório da interface, somente em memória: `citySection` e `questFilter`.
- `index.html`: inclusão do CSS da etapa após os estilos anteriores.
- `package.json`: testes de regressão da nova etapa e comando para gerar as prévias.

### Arquivos novos

- `js/mobile-quests-stage7.js`: montagem das missões em cartões com leitura dos estados reais, sem alterar progresso ou emitir gravações.
- `css/mobile-city-quests-stage7.css`: estilos responsivos e controles touch.
- `tests/mobile-city-quests-stage7.mjs`: simulação de ações reais da aplicação, incluindo progressão, entrega, recompensa e persistência.
- `tools/build-ux-stage7-preview.mjs`: gera o HTML estático das telas usando as funções reais do projeto.
- `tools/qa-mobile-stage7.py`: inspeciona sete telas nas resoluções selecionadas.
- `docs/qa-ux7-*-fixture.html`, `docs/qa-ux7-*.png`, `docs/qa-ux7-browser-metrics.json`: prévias e métricas.

### Testes

- `npm test`: **74 mensagens de teste OK** (70 invocações Node na suíte; alguns scripts imprimem mais de uma linha OK). Suíte completa incluindo o novo teste.
- `node tools/build-ux-stage7-preview.mjs`: gera **sete estados** a partir das funções reais de cidade, taverna e diário.
- `python tools/qa-mobile-stage7.py`: **49 verificações visuais**, sete estados x sete tamanhos (320, 360, 375, 390, 430, 720 e 1366 px), sem rolagem horizontal, botões fora da área visível nem alvos abaixo do mínimo exigido nos estados testados.

**Limitação:** o navegador deste ambiente bloqueia o acesso a páginas locais via HTTP e `file://`. Por isso, a revisão visual usa documentos HTML autocontidos derivados do código real, enquanto os fluxos e cliques são validados nos testes JavaScript. É necessário verificar a experiência integrada no navegador de execução final antes da publicação.

### Compatibilidade

O salvamento continua na **versão 14**, com a mesma chave LocalStorage e sem novos campos persistentes. Não foram modificados regras de compra, drops, reputação, encontros, combate, habilidades, atributos, progressão ou recompensas. A tela de cidade preserva o catálogo original e o diário usa as mesmas ações reais da implementação anterior.

### Próxima etapa

**Etapa 8: Responsividade e Acessibilidade**, com revisão de todas as telas em dispositivos móveis, foco, leitura, toque, orientação, rolagem e consistência visual.

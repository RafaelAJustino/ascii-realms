# ASCII REALMS: Alta Densidade, Etapa 7

## Escopo entregue

Base: ZIP da Etapa 6. Esta etapa cobre os itens visuais ainda representados pelas bibliotecas compactas de densidade.

- **220 equipamentos**: armas, armaduras (cabeça, corpo, mãos, pés) e acessórios. Arte detalhada de 70 colunas por 54 linhas.
- **30 materiais**: recursos regionais, materiais de forja e catalisadores. Arte detalhada de 70 × 54.
- **5 consumíveis ou objetos**: HP, MP, elixir, antídoto e baú. Arte detalhada de 70 × 54.
- **32 NPCs**: 10 moradores locais, 2 recorrentes e 20 hóspedes das tavernas. Retratos de 96 × 68.
- **50 eventos**: 10 de exploração, 20 épicos e 20 de taverna. Cenas de 120 × 64.

**Total: 337 ilustrações ASCII detalhadas geradas e integradas neste lote.** Todas possuem IDs estáveis, dimensões verificadas e conteúdo distinto de outras artes da mesma categoria. A composição utiliza famílias de formas e detalhes determinísticos; não significa que as 337 artes tenham sido desenhadas e aprovadas individualmente por um artista.

## Integração

`js/ui.js` conecta ilustrações de eventos diretamente à jornada e tavernas. Os detalhes de objetos e NPCs são gerados pela nova biblioteca quando o jogador abre `Ver arte ASCII` ou `Ver retrato ASCII`, para evitar construir centenas de quadros invisíveis na renderização inicial. Os ícones compactos das listas são preservados da Etapa 5 porque já possuem a escala adequada.

A compatibilidade com itens legados é mantida por meio de uma representação gerada a partir do slot e tipo do equipamento, sem exigir alteração de dados persistidos. As cores dos itens continuam determinadas pela raridade. Nenhum atributo, drop, preço, requisito de equipamento ou evento foi modificado.

## Arquivos

- `js/high-density-objects.js`: arte detalhada de equipamentos, materiais, consumíveis e itens legados.
- `js/high-density-npcs.js`: retratos de moradores e viajantes.
- `js/high-density-events.js`: cenas narrativas com seleção por ID do evento.
- `js/ui.js`: uso das três bibliotecas e abertura sob demanda.
- `css/high-density-stage7.css`: fonte monoespaçada, limites de tamanho, cores por raridade, foco e movimento reduzido.
- `index.html`: inclusão do CSS.
- `tests/high-density-assets-stage7.mjs`: testes desta etapa.
- `generate-hd7-galleries.mjs`: gerador de galerias e inventário técnico.
- `docs/galeria-objetos-hd7.html`, `docs/galeria-npcs-hd7.html`, `docs/galeria-eventos-hd7.html`: galerias.
- `docs/inventario-alta-densidade-etapa7.json`: inventário dos 337 registros.
- `package.json`: inclusão dos testes da Etapa 7.

## Testes

- Cobertura de IDs reais, contagens, ASCII imprimível e dimensões.
- Ausência de duplicatas exatas no conteúdo final por categoria.
- Sombras presentes e estabilidade por identificador.
- Cache limitado e geração sob demanda.
- Compatibilidade com itens dos salvamentos antigos e associação pelo catálogo.
- Seleção visual de eventos, escape seguro de HTML e integração com os componentes da interface.
- CSS monoespaçado, overflow contido e preferência de movimento reduzido.
- Suíte de regressão completa do projeto, incluindo as etapas anteriores.

## Limitações

- As artes continuam procedurais e algumas têm anatomias ou desenhos semelhantes dentro de suas famílias. Ausência de cópia exata não é aprovação artística individual.
- As artes de objetos têm desenhos detalhados novos; os ícones compactos permanecem os da Etapa 5.
- A captura automatizada da interface em Chromium, incluindo localhost, foi bloqueada com `ERR_BLOCKED_BY_ADMINISTRATOR`. Portanto, não há aprovação de responsividade em navegador real.
- A **Etapa 8** ainda deve realizar refinamento artístico, inspeção manual dos desenhos, revisão de animações, testes completos de dispositivos móveis e fechamento visual.

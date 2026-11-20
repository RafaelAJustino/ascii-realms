# ASCII REALMS | Alta Densidade, Etapa 6

## Base e escopo

Base: ZIP **ascii-realms-alta-densidade-etapa5.zip**, sem recriar o jogo a partir da reformulação Unicode. Esta etapa é exclusivamente visual: cidades, biomas, masmorras e interiores regionais.

## Elementos entregues

| Categoria | Quantidade | Dimensões | Origem |
|---|---:|---:|---|
| Cidades cadastradas | 10 | 140 × 64 | `js/high-density-world.js` |
| Biomas cadastrados | 10 | 140 × 64 | `js/high-density-world.js` |
| Masmorras oficiais | 10 | 140 × 64 | `js/high-density-world.js` |
| Interiores (7 tipos em 10 cidades) | 70 | 124 × 54 | `js/high-density-interiors.js` |
| **Total** | **100** | | |

As artes são **ASCII de texto**, com gradações de densidade, preenchimentos, paredes, detalhes de arquitetura, vegetação, sombras e diferentes motivos regionais. Não existem sprites PNG/SVG ou imagens de terceiros em sua renderização.

## Integração

- `js/ui.js`: mapa e jornada mostram bioma HD; cidade mostra cidade HD; masmorras mostram entrada HD; taverna, loja, mercado e ferraria mostram interiores HD.
- Biblioteca anterior de `density-world.js`/`density-settlements.js` preservada como **fallback**, sem tornar-se a arte exibida normalmente.
- `js/hd-scene-engine.js` concentra operações de desenho ASCII (textura, sombra, arquitetura, elementos naturais). Os desenhos de cenário são construídos sob demanda e armazenados em caches LRU de 8 cenas exteriores e 10 interiores. `js/high-density-world.js` guarda as 30 composições paisagísticas; `js/high-density-interiors.js` guarda os 70 estabelecimentos por região.
- `css/high-density-world.css` preserva fonte monoespaçada, espaços, quebras de linha, centralização e acessibilidade. A interface `fitAscii` existente dimensiona as artes; telas pequenas oferecem ampliação ativável por clique/teclado. Não existe quebra automática nem rolagem horizontal da página.
- Nenhuma mudança na lógica de combate, no nível, atributos, preços, receitas, recompensas ou LocalStorage (salvamentos v14 preservados).

## Validação

- Testes novos: `tests/high-density-world-stage6.mjs`, `tests/high-density-interiors-stage6.mjs`.
- Suíte anterior e testes novos: `npm test`.
- Verificações de 100 desenhos: IDs oficiais, dimensões e largura fixa, ASCII imprimível (códigos 32 a 126), densidade mínima de traços/sombras, ausência de duplicatas exatas, cache, integração com escape HTML, responsividade estimada e acesso por teclado para ampliar.
- A galeria HTML independente `docs/galeria-cenarios-hd6.html` permite inspecionar as 100 artes em tamanho original ou ampliado. Inventário: `docs/inventario-mundo-hd6.json`.

## Limitações e próximos passos

As cenas são **composições geométricas de alta densidade**, elaboradas com figuras próprias para regiões e estabelecimentos, porém ainda utilizam uma infraestrutura comum e não foram pintadas artesanalmente, caractere por caractere, uma a uma. As composições não são idênticas, mas **ausência de duplicatas não assegura identidade visual plenamente exclusiva nem qualidade equivalente à referência de 160 × 103**. Ainda é necessária curadoria artística individual e teste manual em dispositivos, especialmente quanto à legibilidade em 320px. A visualização ampliada foi incluída para contornar o tamanho pequeno da arte na tela principal.

Etapa 7 do plano: **equipamentos, objetos, NPCs e eventos**. Etapa 8: **animações, testes interativos completos e revisão artística final**.

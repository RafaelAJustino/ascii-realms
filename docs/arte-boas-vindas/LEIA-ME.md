# ASCII REALMS: arte panorâmica da tela de boas-vindas

A ilustração foi recriada em caracteres ASCII a partir da composição fornecida pelo usuário (castelo central, montanhas, lua, floresta, ruínas, título ASCII REALMS e caminho).

## Integração

- `js/welcome-art.js`: contém duas matrizes ASCII de 148×42 (mobile) e 196×56 (desktop) e a função de ajuste automático ao contêiner.
- `css/welcome-art.css`: define o contêiner panorâmico, texto monoespaçado e responsividade.
- `tests/welcome-art.mjs`: valida as dimensões, caracteres e integração.
- `arte-mobile.txt` e `arte-desktop.txt`: cópias editáveis das matrizes.

A imagem de referência **não** é utilizada nem incorporada ao jogo como PNG, SVG, canvas ou background. Apenas as matrizes de caracteres são renderizadas na tela de boas-vindas. Os botões e os salvamentos não foram modificados.

## Verificações

- `npm test`: 82 testes aprovados.
- Prévia Chromium por `set_content`: 320, 360, 390, 430, 540 e 720 px sem rolagem horizontal ou arte fora do contêiner.
- A abertura do projeto completo por HTTP foi bloqueada pelo ambiente de navegação. A prévia visual renderizou HTML/CSS reais com as matrizes do código; não substitui um teste manual completo do jogo.

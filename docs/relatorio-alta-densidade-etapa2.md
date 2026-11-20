> Documento histórico da Etapa 2. O Ladino de referência foi substituído na Etapa 3 por desenho original no mesmo padrão dos outros heróis. Os módulos antigos foram retirados. Consulte `relatorio-alta-densidade-etapa3.md`.

# ASCII REALMS: Alta Densidade, Etapa 2

## Base e escopo

Continuação do Piloto 1. O desenho de referência do Ladino foi preservado byte a byte em `js/reference-rogue.js`. Nesta entrega foram criadas três novas composições ASCII originais para **Guerreiro, Mago e Arqueiro**, 160 × 103, com sombreamento pela densidade dos caracteres, anatomias e armamentos distintos.

**Total: quatro retratos-base em alta densidade integrados ao jogo, sendo três novos e um preservado da referência do usuário.** Os outros desenhos de monstros, chefes e cenários ainda são os do Lote 6 e não cumprem necessariamente o padrão visual novo.

## Arquivos

- `js/high-density-hero-arts.js`: três novas ilustrações-base em texto ASCII puro.
- `js/high-density-portraits.js`: composição, cache, tratamento por regiões equipadas e renderização segura de segmentos com cores de raridade; apresentação integral ou compacta.
- `js/hero-avatar.js`: roteamento da renderização de Guerreiro, Mago e Arqueiro à nova biblioteca e preservação do Ladino de referência.
- `tests/high-density-four-heroes.mjs`: dimensões, caracteres, identidade visual, equipa/retira item, cores individuais, versão de combate.
- `docs/galeria-quatro-herois-alta-densidade.html`: inspeção das quatro artes sem dependências externas.

## Limitações

- O sistema de equipamentos é **experimental**. As mudanças de material, texturas, relevos e limites localizados funcionam, mas ainda não representam integralmente cada item único do catálogo ou todos os tipos de arma com geometrias distintas. Esse refinamento é o foco da próxima etapa.
- Os avatares-base foram desenhados com equipamentos típicos das classes. Ainda é necessário reconstruir visualmente regiões vazias, como mãos desarmadas, e produzir variações anatômicas sem itens equipados.
- O escudo do Guerreiro é um detalhe da ilustração-base, não um slot de equipamento. Não foi adicionado slot de escudo ao jogo.
- A apresentação compacta reduz caracteres por blocos de 2 × 2 sem cortar o personagem. Essa versão precisa de revisão artística específica.
- A inspeção local da galeria não substitui a verificação integrada de todos os retratos em navegadores móveis.

Nenhuma regra de combate, equipamento, atributos ou salvamento foi modificada.

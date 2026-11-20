# Auditoria e protótipo: referência de alta densidade

## Fonte recebida

- `ascii-art(1).txt`: **160 colunas × 103 linhas**; caracteres ASCII imprimíveis; 16.480 células de texto.
- A descrição da imagem original foi recebida no documento de requisitos, mas **a imagem original não foi anexada nesta interação**. Portanto, não foi possível comparar a conversão com a imagem de origem.
- O arquivo de referência foi incorporado sem alteração de caracteres ou dimensões em `js/reference-rogue.js`.

## Implementado nesta entrega

- Retrato do **Ladino** apresentado em sua resolução original na tela de personagem e em composição reduzida (80 × 52) no combate.
- Máscaras experimentais para capacete, torso, luvas, botas e arma, com segmentos de cor individuais para raridade.
- Anel e amuleto com cor localizada; cache da composição de retratos e reversão ao estado sem equipamento.
- Galeria HTML com seis composições, incluindo a referência intocada.
- Teste automatizado do tamanho, fonte, slots, troca e remoção de equipamentos.

## Limitações de qualidade explicitamente pendentes

1. A referência original já inclui adagas no personagem; retirá-las da arte-base exige redesenho da região, ainda não implementado. A imagem base permanece armada quando não há item equipado.
2. As máscaras experimentais alteram texturas em regiões aproximadas, mas ainda não produzem um desenho anatômico individual para cada um dos 220 equipamentos.
3. As outras três classes e os demais elementos do jogo ainda usam o Lote 6; não foram redesenhados nesta entrega.
4. A redução de 160 × 103 para 80 × 52 não representa uma ilustração compacta revisada à mão. O enquadramento completo é mantido.
5. A qualidade visual em navegadores e dispositivos móveis não foi certificada.

## Status real

**1 referência de alta densidade incorporada, 1 retrato de personagem experimentalmente integrado.** Não declarar a reformulação completa ou qualquer catálogo existente como artisticamente aprovado pelo novo padrão.

Os demais elementos permanecem funcionais e preservados para substituição individual em futuras revisões. Nenhuma mecânica de combate, atributo, inventário ou esquema de salvamento foi alterado.

# Etapa 4: Bestiário de alta densidade

## Escopo e cobertura

- Base: ASCII REALMS Alta Densidade, Etapa 3.
- 150 espécies do cadastro original, em dez regiões.
- Arte ASCII detalhada: 112 colunas × 78 linhas, por espécie.
- Versão de combate: 76 × 52, derivada do mesmo retrato.
- 26 famílias anatômicas (um conjunto de regras técnicas, não um sprite final compartilhado).
- 20 chefes mantidos sem alteração, reservados para a Etapa 5.

## Método

As formas são geradas offline com máscaras geométricas e relevo tonal, convertidas para caracteres ASCII. O resultado compactado é incorporado ao código JavaScript. A composição utiliza variações de morfologia, material, luz, postura, ornamentos e características vinculadas aos nomes das espécies. A renderização do jogo é somente texto.

## Controle de duplicidade e revisão

As 150 artes de tamanho completo são distintas e suas 150 versões compactas também são distintas. Comparação de máscara de silhueta detectou 82 pares com sobreposição superior a 92% (de 11.175 pares possíveis), após correções de 299 pares detectados inicialmente. Isso evidencia que alguns animais e humanoides ainda precisam de refinamento individual. Essa etapa NÃO certifica qualidade equivalente à referência visual do usuário para cada criatura.

## Integração e segurança

A UI prioriza o novo retrato antes dos registros anteriores, sem mudar IDs ou dados persistidos. O renderizador expande sob demanda e mantém um cache LRU limitado; textos são escapados para HTML, inclusive backslash e caracteres especiais. O salvamento v14 não é alterado.

## Verificações

`node tests/high-density-monsters-stage4.mjs` e `npm test`. A prévia monoespaçada `docs/previa-12-monstros-hd4.png` foi inspecionada. Validação interativa de jogo completo e responsividade em celular ainda pendentes.

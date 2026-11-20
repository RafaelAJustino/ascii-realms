# ASCII REALMS: Etapa 5, chefes em alta densidade

## Escopo real

A partir da **Etapa 4**, 20 chefes cadastrados receberam novos retratos com silhuetas distintas: dez chefes regionais e dez exclusivos das masmorras. Foram preservados os identificadores do jogo e a migração de salvamento v14 não foi alterada.

- 20 artes principais, **128 colunas × 88 linhas**, somente ASCII imprimível.
- Dez chefes regionais possuem três versões visuais, correspondentes às fases de combate preexistentes. São **40 composições no total**.
- Apresentação compacta **76 × 52** no combate. Retrato detalhado no bestiário.
- Nenhum PNG, Canvas ou SVG é utilizado pela interface de jogo para representar os chefes. As prévias PNG dos docs são somente para revisão.

## Direção artística por chefe

| Regional | Direção visual | Masmorra | Direção visual |
|---|---|---|---|
| Guardião das Raízes | Gigante vegetal, galhos, tronco e raízes | Coração Enraizado | Coração vivo atravessado por raízes |
| Escorpião Imperial | Carapaça, pinças, pernas e ferrão | Matriarca de Areia | Aracnídeo monumental, quelíceras e coroa |
| Hidra Venenosa | Três cabeças reptilianas e tronco escamado | Devorador Tóxico | Corpo anfíbio, boca com presas e tentáculos |
| Golem Ancestral | Colosso de pedra e núcleo rúnico | Colosso Ferrífero | Gigante blindado com rebites e engrenagens |
| Rei Esquecido | Coroa, crânio, trono e manto | Sentinela do Túmulo | Sarcófago guardião, lança e marcas funerárias |
| Dragão Glacial | Asas, escamas, chifres e cristais gelados | Titã de Geada | Titã armado com machado de gelo |
| Senhor dos Mortos | Lich encapuzado, foice e espíritos | Arauto das Cinzas Mortas | Aparição encapuzada em nuvem de cinzas |
| Demônio das Chamas | Chifres, asas e fogo ao redor | Fornalha Viva | Autômato-fornalha com condutos e brasas |
| Serafim Corrompido | Seis asas, auréola partida e espada | Juiz da Aurora | Figura alada com balança e símbolos solares |
| Entidade Primordial | Núcleo mutável cercado por tentáculos e olhos | Núcleo do Nada | Vórtice com fragmentos e anéis concêntricos |

## Implementação

`tools/generate_bosses_hd.py` produz as composições ASCII offline a partir de máscaras anatômicas individuais e sombreado graduado, sem arquivos externos. `js/high-density-boss-data.js` armazena as artes compactadas sem perda. `js/high-density-bosses.js` descompacta sob demanda e mantém caches LRU separados (até 12 entradas cada). A interface usa os mesmos elementos `pre.ascii-art`, com ajuste automático de fonte e escape HTML.

`densityCreatureArtwork(nome, compacto, fase)` seleciona o novo atlas antes do antigo e dos 150 monstros da Etapa 4. No combate, o valor real de `e.bossPhase` ativa a variante correspondente para os chefes regionais. Chefes de masmorra permanecem na versão única, de acordo com suas regras de combate. Nenhum atributo, ataque, recompensa ou cooldown foi alterado.

## Testes executados

- Cobertura dos 20 identificadores existentes no jogo.
- Verificação das 40 artes ASCII, sem duplicatas exatas; comprimento, ASCII imprimível, densidade e cópias compactas.
- Seleção visual das fases, sem afetar mecânicas.
- Limite de cache, preservação de 150 monstros anteriores, compatibilidade do save v14.
- Suíte completa `npm test`.

As prévias `previa-chefes-hd5.png` e `previa-chefes-masmorras-hd5.png` foram inspecionadas em fonte monoespaçada. A galeria HTML contém as **40** representações em caracteres de texto para uma análise individual.

### Limitações

Os 20 desenhos foram elaborados com técnicas procedurais **específicas para cada chefe** e não correspondem a 20 ilustrações digitalmente pintadas e refinadas manualmente. A exclusividade textual está coberta por testes, mas a fidelidade anatômica e a qualidade final dependem de revisão visual individual. A captura responsiva no Chromium foi tentada e não concluiu dentro do limite do ambiente. Testes completos em navegadores e dispositivos móveis continuam pendentes.

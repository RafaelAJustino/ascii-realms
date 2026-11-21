# ASCII REALMS: Reformulação de Classes e Progressão

**Implementação única, integrada ao jogo consolidado (salvamento v14).**

## Escopo e compatibilidade

- Quatro classes, 16 habilidades ativas, 16 passivas automáticas e quatro recursos exclusivos.
- 150 espécies de monstros com kits determinísticos (3 técnicas e 2 passivas por espécie).
- 10 chefes regionais com fases 1/2/3 e 10 chefes de masmorra com fases adaptativas, habilidades e passivas próprias.
- 24 talentos especiais (quatro por atributo), além de bônus recorrentes a cada cinco pontos investidos.
- Limite nível 100, 3 pontos de atributos por nível (297 pontos até 100), sem alterar itens ou missões.
- Chaves dos salvamentos e versão 14 preservadas; habilidades antigas são mapeadas pela posição 0 a 3.
- Recursos exclusivos são temporários, criados em cada combate. Não geram duplicações de salvamento.

## Habilidades ativas (custo base; variações Potência/Economia continuam funcionando)

| Classe | Nível | Habilidade | MP | CD | Multiplicador | Recurso necessário |
|---|---|---|---|---|---|---|
| Guerreiro | 5 | Golpe Poderoso | 10 | 2 | 1.65 | Nenhum |
| Guerreiro | 10 | Golpe Desestabilizador | 12 | 3 | 1.1 | Nenhum |
| Guerreiro | 15 | Guarda de Ferro | 14 | 3 | 0 | Nenhum |
| Guerreiro | 20 | Investida Devastadora | 25 | 5 | 2.65 | 3 Determinação |
| Mago | 5 | Projétil Arcano | 7 | 1 | 1.35 | Nenhum |
| Mago | 10 | Chama Explosiva | 15 | 3 | 1.85 | Nenhum |
| Mago | 15 | Prisão Glacial | 19 | 4 | 1.05 | Nenhum |
| Mago | 20 | Tempestade Arcana | 33 | 5 | 2.9 | 3 Concentração Arcana |
| Arqueiro | 5 | Disparo Preciso | 8 | 1 | 1.55 | Nenhum |
| Arqueiro | 10 | Flecha Perfurante | 14 | 3 | 1.65 | Nenhum |
| Arqueiro | 15 | Marca do Caçador | 12 | 3 | 0.55 | Nenhum |
| Arqueiro | 20 | Chuva de Flechas | 26 | 5 | 2.65 | 3 Mira |
| Ladino | 5 | Golpe Duplo | 9 | 2 | 0.85 | Nenhum |
| Ladino | 10 | Lâmina Envenenada | 13 | 3 | 1.2 | Nenhum |
| Ladino | 15 | Passo Sombrio | 17 | 4 | 0 | Nenhum |
| Ladino | 20 | Execução | 25 | 5 | 2.5 | 3 Oportunidade |

Os recursos têm limite de 5. Ataques comuns geram 1 recurso. Ações específicas também geram recursos (Guarda de Ferro pode gerar 2). As habilidades finais gastam 3 recursos. Todos os CDs medem **turnos completos de ação** e não incluem o próprio turno de uso.

## Habilidades passivas (desbloqueio automático)

| Classe | Nível | Passiva | Benefício/condição |
|---|---|---|---|
| Guerreiro | 1 | Maestria Marcial | +4% de dano físico; aperfeiçoa-se nos níveis 50, 75 e 100. |
| Guerreiro | 10 | Tenacidade | Reduz em até 30% a duração de efeitos negativos. |
| Guerreiro | 25 | Contra-ataque | Após bloquear, pequena chance de revidar uma vez. |
| Guerreiro | 40 | Último Bastião | Uma vez por combate: resistência extra com HP baixo. |
| Mago | 1 | Afinidade Elemental | +5% de dano elemental; aperfeiçoa-se nos níveis 50, 75 e 100. |
| Mago | 10 | Fluxo Arcano | Ao usar magias, recupera MP limitado por turno. |
| Mago | 25 | Conhecimento Arcano | +7% de eficiência mágica. |
| Mago | 40 | Ressonância Elemental | Amplifica uma reação elemental existente, sem repeti-la. |
| Arqueiro | 1 | Olho de Águia | +4 pontos percentuais de acerto; aperfeiçoa-se nos níveis 50, 75 e 100. |
| Arqueiro | 10 | Instinto do Caçador | +10% de dano em inimigos marcados. |
| Arqueiro | 25 | Tiro Crítico | +6% de dano crítico, respeitando o teto de chance. |
| Arqueiro | 40 | Ritmo de Disparo | Cada ataque consecutivo eleva o dano em até 9%. |
| Ladino | 1 | Ataque Furtivo | +8% de dano em inimigos vulneráveis; aperfeiçoa-se nos níveis 50, 75 e 100. |
| Ladino | 10 | Reflexos Felinos | +3 pontos percentuais de esquiva até o teto. |
| Ladino | 25 | Mestre dos Venenos | +20% de eficiência de venenos aplicados. |
| Ladino | 40 | Predador Oportunista | +9% de dano sob debuff ou ferimento grave. |

A passiva essencial de cada classe recebe aperfeiçoamentos moderados nos níveis 50, 75 e 100. Passivas não consomem MP nem turno.

## Marcos evolutivos

Os bônus normais dos atributos continuam funcionando. Os bônus recorrentes usam **somente pontos confirmados** (não contam classe, nível, itens, conjuntos ou buffs).

| Atributo | Bônus por 5 investidos | Limite |
|---|---|---|
| Força | 1% Dano físico | 20% |
| Inteligência | 1% Dano mágico | 20% |
| Agilidade | 0.5pp Esquiva | 10pp |
| Destreza | 0.5pp Chance crítica | 10pp |
| Vitalidade | 1% HP máximo | 20% |
| Sorte | 0.5pp Chance de equipamento | 5pp |

| Atributo | Pontos | Talento especial | Efeito |
|---|---|---|---|
| Força | 15 | Golpe Impactante | 8% de chance de enfraquecer por um turno. |
| Força | 30 | Poder Brutal | +5% para ataques físicos de impacto. |
| Força | 50 | Força Implacável | +6% de dano contra armaduras elevadas. |
| Força | 75 | Titã | +4% de dano físico adicional. |
| Inteligência | 15 | Clareza Arcana | Recupera até 2 MP ao usar magia. |
| Inteligência | 30 | Canalização | +4% de dano mágico ao gastar concentração. |
| Inteligência | 50 | Mestre Elemental | +5% de dano elemental. |
| Inteligência | 75 | Arquimago | +4% de dano mágico. |
| Agilidade | 15 | Reflexos Rápidos | Ganha 1 recurso de classe ao esquivar, limitado. |
| Agilidade | 30 | Movimento Fluido | +2pp de esquiva por um turno após defesa. |
| Agilidade | 50 | Instinto de Sobrevivência | +3pp esquiva com HP abaixo de 30%. |
| Agilidade | 75 | Intocável | +2pp esquiva respeitando teto de 40%. |
| Destreza | 15 | Precisão Aprimorada | +3pp de precisão. |
| Destreza | 30 | Golpe Calculado | +5% no multiplicador crítico. |
| Destreza | 50 | Mestre da Técnica | +4% de dano em golpes precisos. |
| Destreza | 75 | Precisão Letal | +5% de dano crítico. |
| Vitalidade | 15 | Constituição Robusta | Reduz a duração de efeitos negativos. |
| Vitalidade | 30 | Recuperação Natural | Recupera 1% de HP após se proteger, limitado. |
| Vitalidade | 50 | Sobrevivente | Reduz 5% do dano sofrido com HP baixo. |
| Vitalidade | 75 | Fortaleza Viva | Reduz 3% do dano sofrido. |
| Sorte | 15 | Afortunado | Chance limitada de consumível extra após vitórias elegíveis. |
| Sorte | 30 | Descoberta Inesperada | Pequeno bônus em recompensas raras elegíveis. |
| Sorte | 50 | Destino Favorável | Recuperação ocasional e limitada ao fim do combate. |
| Sorte | 75 | Favor da Fortuna | Bônus limitado de chance de equipamento. |

## Monstros: 150 espécies

Cada espécie recebeu um trio determinístico de técnicas e um par de passivas, combinando comportamento, arquétipo, espécie e região. Ações respeitam MP, recargas e a IA já existente.

| Arquétipo | Identidade | Táticas |
|---|---|---|
| Predador/selvagem | Pressão física e sangramento | Mordida, investida, cortes |
| Oportunista | Explora janelas, veneno | Golpe sujo, emboscada |
| Estratégico/humanoide | Defesa, debuffs, escolhas | Golpe tático, postura |
| Defensivo/blindado | Sobrevivência e barreiras | Golpe pesado, escudo |
| Mágico | Ataques elementais e controle | Projeção, explosão, maldição |
| Morto-vivo/venenoso | Resistências e efeitos especiais | Drenagem, toxicidade, profanação |

O catálogo completo de **150 linhas com técnica e passivas por espécie** está em `docs/monstros-habilidades.csv`.

## Chefes regionais e de masmorra

| Tipo | Chefe | Passiva | Especial 1 | Especial 2 |
|---|---|---|---|---|
| Região | Guardião das Raízes | Coração do Bosque | Vinhas Aprisionadoras | Coração da Floresta |
| Região | Escorpião Imperial | Ferrão Imperial | Tempestade de Areia | Ferrão Mortal |
| Região | Hidra Venenosa | Múltiplas Cabeças | Rajada Tóxica | Fúria das Cabeças |
| Região | Golem Ancestral | Núcleo de Pedra | Abalo Sísmico | Martelo Ancestral |
| Região | Rei Esquecido | Coroa Maldita | Decreto das Sombras | Último Decreto |
| Região | Dragão Glacial | Inverno Persistente | Nevasca | Sopro do Inverno |
| Região | Senhor dos Mortos | Reino dos Mortos | Drenagem das Almas | Colheita Vital |
| Região | Demônio das Chamas | Coração Incandescente | Explosão de Cinzas | Julgamento Ardente |
| Região | Serafim Corrompido | Luz Corrompida | Luz Fraturada | Juízo da Luz |
| Região | Entidade Primordial | Ruptura Primordial | Ruptura Elemental | Colapso Primordial |
| Masmorra | Coração Enraizado | Semente Guardiã | Lança de Raízes | Tronco Enraizado |
| Masmorra | Matriarca de Areia | Veneno das Areias | Mordida de Areia | Tempestade de Escorpiões |
| Masmorra | Devorador Tóxico | Secreção Ácida | Ácido Corrente | Névoa Corrosiva |
| Masmorra | Colosso Ferrífero | Forja Viva | Martelo de Ferro | Impacto Magnético |
| Masmorra | Sentinela do Túmulo | Maldição Funerária | Grito da Cripta | Condenação Antiga |
| Masmorra | Titã de Geada | Couraça Glacial | Agulhas de Gelo | Nevasca Letal |
| Masmorra | Arauto das Cinzas Mortas | Fome Profana | Grito das Cinzas | Sombra Devoradora |
| Masmorra | Fornalha Viva | Coração de Magma | Rajada de Magma | Erupção do Núcleo |
| Masmorra | Juiz da Aurora | Véu de Luz | Clarão Julgador | Balança Celestial |
| Masmorra | Núcleo do Nada | Distorção do Vazio | Ecos do Vazio | Ruptura Total |

Chefes regionais anunciam golpes de fase antes da resolução. Chefes de masmorra apresentam técnicas distintas em duas fases de HP e continuam com as condições próprias de salas. O bestiário só mostra informações após o encontro e, para técnicas aprofundadas, após progressão nas vitórias.

## Ordem efetiva do cálculo

1. Validação de turno, nível, MP, recurso de classe e cooldown.
2. Cálculo de ATQ/MAG a partir de atributos, equipamento, conjuntos, especialização, bônus recorrentes e passivas.
3. Escolha do multiplicador, precisão, crítico, penetração e bônus condicionais.
4. Aplicação de defesa via `incomingDamage`, afinidades, proteção e reduções de passivas.
5. Atualização do HP, reações elementais, efeitos periódicos e ações de retorno.
6. Atualização de MP, recurso exclusivo, cooldowns e interface.
7. Inimigo executa sua ação e efeitos, com imunidades, telegráficos e fases.

## Fórmulas e limites

- ATQ = piso[(2·FOR + 0,8·DES + 1,6·nível + bônus de equipamento) × multiplicadores pertinentes].
- MAG = piso[(2,7·INT + 1,5·nível + bônus mágico) × multiplicadores pertinentes].
- Crítico = mínimo(65%, 4 + 0,32·SOR + extras e marcos).
- Precisão = limitada a 99%; esquiva = limitada a 40%.
- Mitigação da defesa = mínimo(62%, defesa/(defesa + ataque bruto·1,4)).
- Dano após defesa = piso[ataque bruto·(1−mitigação)], então afinidade elemental (0 a 1,5) e resistências situacionais.
- Defesa de Guerreiro e talentos de Vitalidade possuem ativações e reduções limitadas, sem invulnerabilidade.
- Efeitos negativos idênticos não acumulam cópias; renovam a duração dentro do limite de quatro turnos.
- Cooldowns especiais: 1 a 5 turnos; recursos exclusivos: 0 a 5; Ultimate: 3 pontos.

## Balanceamento: 216 cenários

Os resultados abaixo usam o **modelo de valor esperado** de 36 turnos com distribuição equilibrada, ofensiva ou híbrida; três perfis reais de armadura do catálogo; armas disponíveis no nível; inimigo neutro de nível correspondente; rotação de habilidades; e fórmulas reais de ATQ, MAG, HP, mitigação, CD e MP. Não são partidas completas com decisões do jogador, sorteios de raridade, terreno ou eventos aleatórios.

| Classe | Nv | Dano/turno médio | Turnos para derrota | Sobrevivência (turnos) | Chefes (turnos) |
|---|---|---|---|---|---|
| guerreiro | 1 | 13.3 | 3.7 | 27.5 | 23.1 |
| guerreiro | 10 | 64.9 | 2.9 | 20.7 | 18.1 |
| guerreiro | 25 | 163 | 2.8 | 19 | 17.1 |
| guerreiro | 50 | 423.6 | 2.7 | 22.1 | 14.8 |
| guerreiro | 75 | 867.7 | 2.3 | 26.2 | 12 |
| guerreiro | 100 | 1201.9 | 2.6 | 28.4 | 12.8 |
| mago | 1 | 17.4 | 2.8 | 13.9 | 17.6 |
| mago | 10 | 106.1 | 1.8 | 12.5 | 11.3 |
| mago | 25 | 329.2 | 1.5 | 11.8 | 8.8 |
| mago | 50 | 841.3 | 1.4 | 14.4 | 7.6 |
| mago | 75 | 1586 | 1.3 | 17.3 | 6.7 |
| mago | 100 | 2179.1 | 1.5 | 18.8 | 7.1 |
| arqueiro | 1 | 11.5 | 4.3 | 16.2 | 26.7 |
| arqueiro | 10 | 55 | 3.4 | 17.2 | 21.1 |
| arqueiro | 25 | 150.9 | 3 | 17.5 | 18.2 |
| arqueiro | 50 | 401.3 | 2.8 | 21.1 | 15.4 |
| arqueiro | 75 | 850.1 | 2.4 | 25.2 | 12.2 |
| arqueiro | 100 | 1062.9 | 3 | 26.9 | 14.5 |
| ladino | 1 | 10.9 | 4.5 | 16.4 | 28.2 |
| ladino | 10 | 45.8 | 4.1 | 16.5 | 25.5 |
| ladino | 25 | 112.2 | 4.1 | 17.1 | 24.9 |
| ladino | 50 | 301.9 | 3.8 | 22.6 | 21 |
| ladino | 75 | 642.6 | 3.2 | 27.9 | 16.5 |
| ladino | 100 | 811.5 | 4 | 29.8 | 19.5 |

A interpretação depende da composição do inimigo. Magos têm maior dano estimado e menor resistência; guerreiros possuem melhor proteção inicial; arqueiros priorizam acerto e marcação; ladinos ganham valor ao explorar debuffs e esquivas. As vitórias reais dependem também da gestão de MP, do uso de consumíveis, da habilidade do jogador e de afins elementais.

Planilhas completas: `docs/balanco-216-cenarios.csv` e `docs/balanceamento-resumo.json`.

## Arquivos de código alterados

- **Novos:** `js/class-combat.js`, `js/monster-identity.js`, `js/combat-effects.js`, `css/class-rebalance.css`, `tests/class-rebalance.mjs`, `tools/simulate-classes.mjs`, `tools/generate-class-report.mjs`.
- **Integrados:** `js/combat.js`, `js/data.js`, `js/player.js`, `js/monster-ai.js`, `js/boss-phases.js`, `js/dungeons.js`, `js/attribute-milestones.js`, `js/skill-variants.js`, `js/turn-cooldowns.js`, `js/loot.js`, `js/elements.js`, `js/progression-ui.js`, `js/ui.js`, `js/combat-tactics.js`, `index.html`, `package.json`.
- **Testes históricos adaptados:** `tests/combat-layout.mjs`, `tests/turn-cooldowns.mjs`, `tests/stage6-progression.mjs`, `tests/epic8-combat-economy.mjs`, substituindo somente hipóteses incompatíveis com os novos recursos/técnicas.

## Testes

- `npm test`: suíte completa + novos testes de turnos para as 16 habilidades, recursos, passivas e efeitos.
- `npm run qa:ux-consolidated`: 19 telas × 7 resoluções = 133 verificações de largura e área de toque.
- `npm run balance:classes`: reproduz os 216 cenários.
- A abertura interativa do jogo por localhost ficou bloqueada por política do navegador automatizado do ambiente. Portanto, os testes visuais usaram HTML/CSS gerados e o fluxo funcional foi testado em DOM simulado; validação manual em celulares reais continua recomendada.

## Orientação de instalação

Extraia o ZIP e execute o jogo da mesma forma que fazia anteriormente. Para rodar as verificações, na pasta que contém `package.json`, execute `npm test`. O ZIP inclui o projeto completo e não é um patch isolado.

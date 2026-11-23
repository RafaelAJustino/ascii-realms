# ASCII REALMS: Mini Bosses e 15 Explorações Consecutivas

## Resumo da entrega

Sistema completo de dez Mini Bosses, cada um vinculado a uma das dez regiões/mapas do jogo, implementado sobre a versão consolidada anterior. A implementação mantém as 100 áreas, combate original, chefes regionais, exploração, missões, economia, identidade ASCII e salvamentos existentes.

## Regras efetivamente implementadas

1. **Uma sequência por mapa:** o contador do desafio registra até 15 **explorações concluídas**, não cliques. Os contadores são independentes por região, e o histórico geral de expedição é separado.
2. **Crédito idempotente:** cada encontro ou evento possui estado de pendência e só pode incrementar o desafio uma vez após o resultado. Uma vitória em combate, a finalização da escolha narrativa, o término de uma interação com mercante viajante e resultados não hostis concluídos contribuem.
3. **Encontro garantido:** a décima quinta conclusão gera um Mini Boss obrigatório, com apresentação narrativa, ASCII exclusiva e ação para enfrentar. O inimigo não depende do sorteio de encontros e não pode ser ignorado por recarga.
4. **Avisos progressivos:** aos 5, 10 e 14 resultados surgem mensagens específicas da região. O indicador apresenta percentuais, estado pendente ou vitória.
5. **Progresso de mapas:** o próximo mapa exige simultaneamente vitória no Mini Boss **e** no chefe principal da região anterior. Os chefes existentes não foram removidos.
6. **Derrota e vitória:** perder contra o Mini Boss aplica a punição normal e reinicia a sequência; vencer registra a conquista permanente, encerra a pendência e concede recompensa única. Não há reentrada no encontro já vencido.
7. **Cidade:** o painel da cidade avisa que utilização de serviços reinicia a sequência. Abertura de mercado, taverna, forja, estalagem, comércio e outras ações urbanas relevantes usam o reset centralizado; consulta ao inventário, atributos, diário, mapa ou configurações não reinicia. Encontros obrigatórios já pendentes mantêm a prioridade, evitando a sua perda por ações externas.
8. **Persistência:** adição compatível ao LocalStorage atual, preservando a versão 14, equipamentos, nível, XP, missões e áreas liberadas. Regiões conquistadas por personagens antigos não são bloqueadas retroativamente.
9. **Interface:** o painel de expedição mostra HP, MP e uma barra EXP alimentada por `xpNeed`, além do contador 0/15, caminho, risco, região, passo histórico, cenário ASCII e botões originais.

## Os dez Mini Bosses

Referência de multiplicadores de HP e ataque: monstro comum do nível equivalente. Cada Mini Boss possui também defesa superior, três técnicas ativas, duas passivas e IA orientada à espécie. Esses multiplicadores são dados de configuração e não representam uma medição de dano por segundo.

| Região | Mapa | Mini Boss | Técnicas | Passivas | HP / ATQ |
|---:|---|---|---|---|---|
| 1 | Floresta Esquecida | **Vesper, o Cervo de Espinhos** | Investida de Galhos, Prisão de Raízes, Rugido da Floresta | Casca de Espinhos, Coração da Mata | 2.45x / 1.39x |
| 2 | Deserto Escarlate | **Safira, a Viúva das Dunas** | Ferrão Solar, Emboscada de Areia, Névoa Escarlate | Carapaça de Areia, Peçonha Persistente | 2.36x / 1.46x |
| 3 | Pântano Sombrio | **Morghul, o Sapo dos Lamentos** | Salto do Lodo, Canto das Toxinas, Miasma Profundo | Muco Protetor, Regeneração do Brejo | 2.59x / 1.35x |
| 4 | Montanhas de Ferro | **Rothgar, o Urso de Ferro** | Pata de Aço, Esmagamento, Rugido Metálico | Placas Forjadas, Fúria da Forja | 2.65x / 1.38x |
| 5 | Ruínas Perdidas | **Eldric, o Cavaleiro Sem Rosto** | Lâmina Esquecida, Jura Fúnebre, Corte Espectral | Guarda Sepulcral, Roubo de Almas | 2.48x / 1.44x |
| 6 | Terras Congeladas | **Skadi, a Coruja da Geada** | Garras do Inverno, Véu da Nevasca, Mergulho Glacial | Penas Geladas, Inverno Interior | 2.30x / 1.52x |
| 7 | Vale Amaldiçoado | **Noxara, a Dama dos Corvos** | Bando Sombrio, Maldição dos Corvos, Lamento da Noite | Manto dos Corvos, Sussurros Vampíricos | 2.40x / 1.53x |
| 8 | Abismo Ardente | **Ignivar, o Basilisco de Brasas** | Mordida Ígnea, Sopro de Magma, Olhar Incendiário | Escamas de Brasa, Sangue em Fusão | 2.42x / 1.56x |
| 9 | Reino Celestial | **Aurelion, o Leão do Eclipse** | Garras da Aurora, Asas do Eclipse, Raio do Julgamento | Manto Solar, Vigor da Aurora | 2.55x / 1.49x |
| 10 | Vazio Eterno | **Umbriel, a Aranha do Vazio** | Agulha do Nada, Teia do Espaço, Ruptura Abissal | Teia Dimensional, Fome do Abismo | 2.50x / 1.57x |

## Fluxo de exploração e salvamentos

- **Início:** selecionar uma rota Seguro, Desconhecido ou Perigoso, preservando os percentuais originais de encontros. A rota não modifica o contador por si só.
- **Evento pendente:** guardar `pendingKind` durante encontros narrativos, hostis ou com mercantes. A conclusão chama o registro central e incrementa uma única vez.
- **Atingir 15:** gravar `miniBossEncounterPending` e o ID do mapa, apresentar o encontro e bloquear novas explorações. O Mini Boss só começa após o jogador selecionar “Enfrentar Mini Boss”.
- **Ao carregar um combate interrompido:** descartar o combate transitório, mas restaurar a tela do encontro especial. Não duplicar ou saltar vitórias.
- **Depois da vitória:** registrar o Mini Boss derrotado, fornecer recompensa única, manter as condições do chefe regional original e recalcular o desbloqueio.
- **Depois de derrota:** aplicar a penalidade original e retornar à cidade, com sequência em 0/15.

Estrutura persistida em `explorationChallenge`:

```js
{
  currentMapId: 0,
  consecutiveExplorations: 0,
  consecutiveByMap: {},
  miniBossEncounterPending: false,
  pendingMapId: null,
  defeatedMiniBosses: {}
}
```

O campo `consecutiveByMap` armazena sequências separadas de cada região. A inicialização de legados leva em conta os chefes principais já vencidos e as áreas anteriormente alcançadas.

## Balanceamento e recompensas

- Vida entre **2,30x e 2,65x** a referência do monstro comum.
- Ataque entre **1,35x e 1,57x**, com três ações especiais temáticas e cooldown ou anúncio de golpe poderoso.
- Duas passivas por Mini Boss (armadura, resistência, regeneração, fúria ou drenagem), sem ciclos de recursão.
- Recompensa ao vencer: XP com multiplicador de referência **3,25x**, ouro **3,50x**, um troféu raro e três materiais regionais. Recompensas regulares de loot seguem o sistema já existente; nenhuma recompensa exclusiva pode ser repetida.
- O Mini Boss não substitui os chefes principais e tem estatísticas inferiores às definidas para o confronto principal, observando as diferenças entre níveis e equipamentos.

## Arquivos modificados

**Novos:** `js/mini-bosses.js`, `js/exploration-challenge.js`, `css/mini-bosses.css`, `tests/mini-boss-challenge.mjs`, `docs/MINI-BOSSES-15-EXPLORACOES.md`.

**Atualizados:** `index.html`, `package.json`, `js/combat.js`, `js/state-schema.js`, `js/journey-paths.js`, `js/navigation-sections.js`, `js/exploration.js`, `js/storage.js`, `js/dungeons.js`, `js/mobile-accessibility-stage8.js`, `js/progression-ui.js`, `js/main.js`, `js/ui.js` e testes estruturais legados dependentes da localização anterior do registro de exploração ou do desenho de monstros.

## Testes e limitações

- **79 de 79 testes automatizados** da suíte aprovados (`npm test` executa inclusive `tests/mini-boss-challenge.mjs`).
- Novas validações: progresso 0 a 15, resultado concluído único, luta obrigatória, atualização de XP, combate, 10 artes exclusivas, 10 conjuntos de habilidades/passivas, derrota e vitória, recompensa única, carga antes/depois da luta, migração de áreas desbloqueadas e eventos narrativos pendentes.
- Verificação de prévia estática com HTML/CSS do jogo em larguras **320, 360, 375, 390, 430, 540 e 720 px**. Não houve rolagem horizontal; o botão principal apresentou altura de 44 px.
- **Limitação:** não foi possível fazer uma partida completa no Chromium porque o navegador do ambiente bloqueia o acesso HTTP ao servidor local (`ERR_BLOCKED_BY_ADMINISTRATOR`). A prévia estática inspeciona o layout, mas não substitui um teste end-to-end por clique ou toque em um dispositivo real.

## Instalação

O ZIP contém o projeto completo da versão atualizada, não um patch. Substitua os arquivos do jogo pela pasta fornecida e preserve o LocalStorage do navegador para manter seu progresso. Para verificar a lógica, execute `npm test` na raiz do projeto.

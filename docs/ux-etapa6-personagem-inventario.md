# ASCII REALMS | Reformulação UX/UI Mobile-First
## Etapa 6: Personagem, Inventário e Habilidades

Base: `ascii-realms-ux-mobile-etapa5.zip`, projeto completo com as etapas anteriores.

### O que mudou

1. **Herói e atributos.** A ficha começa com nome, classe, nível, título, ouro e quatro resumos de HP, MP, ataque e defesa. A arte ASCII do personagem pode ser expandida sem alterar seu visual ou a personalização dos equipamentos. Os seis atributos mostram descrição, pontos base, contribuição do equipamento, marcos e progresso. A prévia de alteração e os comandos Aplicar/Descartar permanecem intactos.
2. **Inventário.** As seções Equipados, Mochila, Consumíveis e Materiais substituem uma única lista longa. Cada slot tem um rótulo legível e ações contextualizadas. A mochila tem filtros e cartões expansíveis, sem apresentar uma ficha extensa de todos os itens simultaneamente.
3. **Comparação real de equipamentos.** O cartão de cada equipamento simula os atributos da ficha antes e depois da substituição. A simulação reutiliza `stats()` e considera atributos, aprimoramentos, evolução da arma, conjuntos, passivas e especializações. Ela não equipa, não salva nem modifica o estado do jogo até o jogador pressionar Equipar. Diferenças positivas e negativas usam cores e sinal numérico, não apenas cor.
4. **Habilidades.** Quatro cartões descrevem custo em MP, poder ou duração e disponibilidade. As variações Original, Potência e Economia podem ser configuradas antes do combate. As passivas ficam em um grupo expansível.
5. **Mobile.** Áreas de toque mínimas de 44 px, grade 2 colunas em celulares, cartões sem largura fixa, indicadores de foco, compatibilidade com movimento reduzido, textos responsivos e ausência de rolagem horizontal nas telas verificadas.

### Arquivos alterados ou adicionados

- `js/ui.js`: novas interfaces para character/inventory/skills, estado de disclosures durante re-render e recalcular tamanho da arte ao expandir.
- `js/player.js`: parâmetro opcional **não persistente** para simular equipamento no cálculo de `stats()`.
- `js/equipment-comparison.js`: comparação pura baseada no motor existente.
- `js/main.js`: seleção de abas por eventos, mantendo as ações atuais de filtro, equipar, retirar, usar e vender.
- `js/runtime.js`: aba de inventário em memória de sessão.
- `css/mobile-character-stage6.css`: estilos da nova etapa, carregados após a Etapa 5.
- `index.html`: referência à nova folha de estilo.
- `package.json` e `tests/mobile-character-stage6.mjs`: novo teste integrado à suíte.
- `tools/build-ux-stage6-preview.mjs` e `tools/qa-mobile-stage6.py`: prévias e verificações visuais.

### Validação

- `npm test`: suíte completa da versão-base e novo conjunto de regressão.
- `node tools/build-ux-stage6-preview.mjs`: gera quatro telas estáticas a partir das funções reais do jogo.
- `python tools/qa-mobile-stage6.py`: testa quatro estados em 320, 360, 375, 390, 430, 720 e 1366 px (28 configurações). Sem rolagem horizontal, sobreposição de botões ou botões com altura abaixo do alvo especificado nos estados testados.
- A navegação a URLs locais foi bloqueada no ambiente do navegador automatizado, portanto a verificação visual usa documentos HTML autocontidos. Isso **não substitui** teste de interação integral em navegador real, como explorar, entrar em combate, equipar e continuar a aventura.

### Compatibilidade

O salvamento continua na **versão 14** e conserva a mesma chave e campos. Não são alterados inventário, ouro, custos, regras de habilidade, XP, loot, missões, combate, progressão ou artes. O parâmetro opcional do cálculo estatístico é usado apenas para a visualização da comparação.

### Próxima etapa

**Etapa 7: Cidades e Missões**, reorganizando serviços urbanos, NPCs, diálogos e diário sem remover conteúdo já existente.

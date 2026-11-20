# ASCII REALMS, Alta Densidade: Etapa 3

## Base de trabalho

Continuação direta do ZIP da Etapa 2, preservando as funcionalidades da Expansão Épica 8 e dos lotes ASCII anteriores. O retrato do Ladino de referência era apenas um exemplo e **não é mais usado como arte de classe**. A nova arte foi desenhada seguindo o mesmo pipeline, escala, iluminação e anatomia que os retratos de Guerreiro, Mago e Arqueiro.

## Artes de heróis

- **4** retratos-base originais, cada um com **160 × 103** caracteres ASCII imprimíveis; Guerreiro, Mago, Arqueiro e Ladino.
- **4** versões geradas de **80 × 52** para o combate, derivadas do mesmo desenho e dos mesmos itens, sem cortar membros e armas.
- Bases sem armas pré-desenhadas. O jogador sem arma equipada não carrega a arma anterior. O Guerreiro não tem escudo equipado porque esse slot não existe no sistema atual.
- Criado `tools/generate-hero-bases.py` como fonte regenerável das ilustrações-base. O pipeline de criação utiliza formas, luz e texturas para produzir texto ASCII final. O jogo **não** carrega imagens como sprites.

## Compositor dinâmico

`js/high-density-portraits.js` possui um compositor unificado para as quatro classes:

1. Determina os sete slots reais: `head`, `body`, `hands`, `feet`, `weapon`, `ring`, `amulet`.
2. Resolve os itens pelo identificador de equipamento salvo; oferece fallback para itens antigos sem `catalogId`.
3. Seleciona a espessura da armadura (leve, média, pesada) e o perfil da arma por `kind`.
4. Desenha máscaras anatômicas e detalhes sobre a arte-base nos pontos de ancoragem da classe.
5. Aplica tons e cores individuais de raridade apenas às células correspondentes à peça.
6. Compacta preservando as áreas do equipamento e renderiza segmentos sanitizados por cor.
7. Faz cache de até 128 composições, com invalidação natural pela assinatura dos itens, sem gravar arte no LocalStorage.

### O que muda efetivamente

- Capacete ou capuz altera o contorno da cabeça, a viseira e a textura.
- Armaduras leves, médias e pesadas apresentam superfícies, ombreiras e articulações com geometrias diferentes, inclusive para Mago e Ladino.
- Luvas têm relevo, largura e detalhes próprios, sobre as mãos conectadas aos braços.
- Botas redesenham solados e grevas.
- Armas aparecem ancoradas no punho direito, com tipos espada, machado, martelo, cajado, varinha, grimório, arco, besta e adaga. O Ladino com adaga recebe representação de duas adagas. Não foi adicionado slot secundário ou de escudo.
- O anel permanece sobre o punho após a arma ser desenhada; o amuleto aparece no peito.
- Cores e variantes de materiais seguem raridades próprias. Diferenças de modelos da mesma família são gravuras sutis, não 220 silhuetas totalmente exclusivas nesta etapa.

## Integração e testes

- A função pública `renderHeroAvatar` continua sendo usada nas telas do jogador e no combate, com atualização via fluxo de renderização já existente.
- Mantém tela compacta e o ajuste do tamanho do texto ao espaço disponível.
- Nenhuma alteração em atributos, cálculos de combate, inventário, slots ou formato de salvamento v14.
- Suíte `npm test`: testes de combate, exploração, itens, migrações, novas combinações, caracteres ASCII, dimensões, cache, remoção e renderização HTML.
- Galeria HTML: `docs/galeria-quatro-herois-alta-densidade.html`, com 22 composições para comparação.

## Limitações

- Algumas variações de modelos da mesma família diferem por textura e gravação; não são ilustrações manuais independentes.
- A arte é legível quando ampliada; a visualização em telefones depende do ajuste de fonte e do visualizador de arte já presente no jogo.
- A inspeção em imagem gerada a partir do texto foi realizada. A validação interativa em Chromium foi impedida pelo ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`); um teste manual no jogo continua recomendado.

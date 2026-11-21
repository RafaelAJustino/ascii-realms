# ASCII REALMS | Reformulação UX/UI consolidada

**Entrega:** 21/11/2026. **Estratégia:** uma única etapa integrada, a partir da versão que já possuía a navegação inferior fixa e a correção de foco e clique.

## Objetivo e referência

Aplicar a estética compacta da captura enviada: identidade ASCII REALMS discreta no cabeçalho; resumo do herói; cartão do local, ilustração ASCII e objetivo; botão de exploração prioritário; Mapa e Cidade como ações secundárias; barra fixa inferior com ícones e rótulos.

A solicitação complementar descreve 29 grupos de requisitos de UX/UI. A implementação reutiliza os sistemas existentes, evita dependências de frameworks e não reinventa combate, história ou progressão.

## Problemas revisados e melhorias

1. **Cabeçalho anterior excessivamente denso.** Substituído por cabeçalho compacto com nome da seção e acesso às preferências. HP, MP, EXP e ouro aparecem juntos no resumo do herói na Aventura.
2. **Aventura com muitas informações simultâneas.** Reorganizada em dois cartões principais, seguidos das ações. Informações adicionais de região, clima e perigo ficam em painel expansível. A arte de alta densidade original permanece preservada.
3. **Navegação visualmente pouco consistente.** Barra inferior fixa conserva os quatro destinos Aventura, Personagem, Diário e Mundo. Ícones vetoriais simples acompanham os nomes, sem substituir suas descrições. Tocar novamente na aba ativa volta ao início da seção e ao topo.
4. **Dificuldade para identificar objetivos prioritários.** Agora é possível marcar missões regionais, narrativas ou pessoais em andamento para acompanhá-las no cartão de Aventura e no Diário. Trata-se de uma preferência visual, não de uma nova regra de missão.
5. **Falta de opções leves de apresentação.** Acesso a texto maior, redução de animações e dicas contextuais. Preferências persistem separadas do progresso.
6. **Onboarding excessivamente implícito.** Dicas curtas e descartáveis em Exploração, Caminhos, Combate, Personagem, Atributos, Inventário e Missões. Podem ser reativadas nas Configurações.
7. **Início sem destaque narrativo.** Tela inicial com arte ASCII inédita, entrada direta no jogo e ação destrutiva mantida em segundo plano com confirmação.
8. **Controles pequenos em imagens de itens.** Alvos de toque de detalhes dos objetos e dos novos controles padronizados para 44 px ou mais.
9. **Inconsistências visuais entre sistemas.** Camada global de estilo unifica cartões, menus, botões, cores e espaçamentos, mantendo a arena diagonal e a interface especializada de cada recurso.

## Arquivos principais alterados

- `js/ui.js`: novo cabeçalho, home, Aventura, integração de dicas e configurações.
- `js/main.js`: ações de preferências, dicas e acompanhamento de missões.
- `js/navigation-sections.js`: ícones na barra inferior, mantendo comportamento das abas.
- `js/mobile-quests-stage7.js`: opção de acompanhar objetivos nas três categorias de missões.
- `js/ux-consolidated.js`: novo módulo de preferências, dicas e objetivo acompanhado.
- `css/ux-consolidated.css`: nova identidade visual mobile-first, carregada por último.
- `index.html`: inclusão da nova folha de estilo.
- `tests/ux-consolidated.mjs`: teste automatizado adicional.
- `tools/qa-ux-consolidated.py`: auditoria reproduzível de HTML real e CSS em diferentes resoluções.
- `package.json`: integração dos testes e comando de auditoria.

## Testes executados

- `npm test`: **80 resultados OK**, incluindo os testes herdados de combate, equipamentos, missões, expedições, economia, persistência, navegação e o novo teste de UI integrada.
- `npm run qa:ux-consolidated`: **19 estados de interface × 7 resoluções = 133 verificações visuais**, de 320 até 720 px. Sem rolagem horizontal, sem controles ultrapassando a largura e sem controles visíveis abaixo de 43 px nos cenários auditados.
- **Limitação:** o ambiente do Chromium bloqueou a navegação por URL, inclusive local. Por isso, a auditoria de layout utilizou `page.set_content` com HTML gerado pelas funções reais e CSS consolidado. Os eventos de gameplay foram cobertos por testes de lógica e DOM simulado. A navegação real e o toque devem passar por uma validação manual no navegador/dispositivo de publicação.

## Persistência e compatibilidade

- `SAVE_VERSION` mantida em **v14**.
- Campos de progresso existentes e chaves de backup não foram modificados.
- Preferências e missão acompanhada são armazenadas em chaves UI independentes, sem interferir em LocalStorage do personagem.
- Não houve modificação intencional em dano, probabilidades, drops, níveis, habilidades, economia ou conteúdos narrativos.
- Mantidas a correção da borda amarela, o clique único e a ausência de navegação por teclado, conforme decisão mais recente do projeto.

## Uso

1. Extraia o ZIP completo.
2. No diretório `ascii-realms-main`, execute um servidor estático, como `python -m http.server 8000` ou utilize o Live Server.
3. Acesse o endereço do servidor no navegador. O aplicativo usa módulos ES6 e requer uma origem HTTP válida.
4. Para preservar o salvamento armazenado em um navegador, publique na **mesma origem** da versão anterior. A chave de salvamento não foi renomeada.
5. Para repetir os testes, execute `npm test` e, com Python e Playwright disponíveis, `npm run qa:ux-consolidated`.

## Verificações manuais recomendadas antes de publicação

- Criar e continuar personagem; excluir apenas mediante confirmação.
- Iniciar e retomar uma expedição; escolher os três caminhos e concluir eventos pendentes.
- Executar ataque comum, quatro habilidades, cooldowns, consumíveis, fuga e vitória.
- Mudar abas e retornar das subtelas Mundo/Taverna, Personagem/Inventário e Diário/Missões com o primeiro toque.
- Marcar cada tipo de missão para acompanhamento e confirmar seu objetivo na Aventura.
- Equipar e comparar itens; testar retorno e rolagem após ações.
- Abrir Configurações, alternar preferências, dispensar e reexibir orientações.
- Verificar celulares reais, áreas seguras, teclado virtual durante criação do herói e mudanças de orientação.

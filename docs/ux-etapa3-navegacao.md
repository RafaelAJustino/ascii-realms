# ASCII REALMS | UX/UI Mobile-First, Etapa 3: Navegação

## Base e escopo

Implementado sobre `ascii-realms-ux-mobile-etapas1-2.zip`, que já incluía a arena única de combate e o salvamento v14. A Etapa 3 reorganiza apenas o acesso a telas existentes e cria duas páginas de entrada. **Não altera combate, IA, atributos, missões, compras, drops ou o esquema do LocalStorage.**

## Quatro áreas

| Área | Tela inicial | Telas reunidas |
|---|---|---|
| Aventura | `world` | Exploração, caminhos, expedições, acampamento e mercante de jornada |
| Personagem | `player` | Herói, atributos, inventário/equipamentos, habilidades, especialização, estatísticas e conquistas |
| Diário | `diary` (nova) | Missões tradicionais e narrativas, aventuras pessoais, bestiário, descobertas, acontecimentos recentes e NPCs conhecidos |
| Mundo | `atlas` (nova) | Regiões, mapas, cidade, tavernas, ferraria, masmorras e estabelecimentos |

A barra de quatro áreas é contextual, no início da área rolável, e não é fixa no rodapé. **Não aparece no combate, resultado de combate, tela inicial ou criação de personagem.** A aba atual usa `aria-current="page"`. As quatro opções cabem em uma linha nas larguras de 320px a 1366px, com alvos de pelo menos 44px.

## Comportamentos e segurança

- Cada área retém a última tela consultada na sessão. A aba correspondente permite retomá-la; tocar novamente na aba atual abre a página inicial daquela área.
- Um caminho/expedição ativo continua acessível por Aventura ao alternar para outra seção. A navegação **não encerra nem conclui automaticamente eventos**.
- Uma tentativa de masmorra bloqueia atalhos de Aventura e Diário. Mundo retorna ao painel da tentativa.
- O rascunho de atributos não é descartado silenciosamente: navegar para fora de Herói exige confirmação quando existem alterações provisórias.
- O botão Voltar utiliza o histórico da interface. Sem histórico, retorna à seção apropriada. Um retorno bloqueado pela masmorra não consome a entrada do histórico.
- A posição da área de leitura é guardada por tela, em memória da sessão, para voltar ao ponto anterior. A preservação da rolagem na mesma tela continua usando o mecanismo já existente.
- Nenhum desses dados de navegação é gravado no salvamento do jogo.

## Arquivos

**Criados:** `js/navigation-sections.js`, `css/mobile-navigation-stage3.css`, `tests/mobile-navigation-stage3.mjs`, `tools/build-ux-stage3-preview.mjs`, este relatório e quatro prévias `docs/ux-stage3-*.html`.

**Modificados:** `js/ui.js`, `js/main.js`, `js/runtime.js`, `js/menu-history.js`, `index.html`, `package.json`, `tests/main-navigation.mjs`, `README.md`.

## Testes

- `npm test`: **66 scripts aprovados**, incluindo regressão da arena, progressão, economia, equipagem, missões, salvamento e novo teste de navegação.
- `tests/mobile-navigation-stage3.mjs`: testa as quatro áreas, as seções e atalhos, retorno contextual, memória da tela, rolagem do inventário, confirmação de atributos, expedição ativa, proteção de masmorra e ocultação das abas no combate.
- Chromium, **teste visual isolado** usando HTML gerado pelas funções reais com folhas CSS reais: 4 telas (`world`, `player`, `diary`, `atlas`) × 7 larguras (320, 360, 375, 390, 430, 720, 1366) = **28 combinações**, sem rolagem horizontal ou botões de navegação com altura menor que 44px. Detalhes em `docs/ux-stage3-qa-results.json`.

**Limitações:** a captura de páginas estáticas não substitui a execução completa do aplicativo e nem o teste em celulares físicos. Inventário, exploração e combate ainda receberão mudanças específicas nas Etapas 4 a 9. O suporte a navegação por voz e leitores de tela precisa de testes com ferramentas assistivas reais.

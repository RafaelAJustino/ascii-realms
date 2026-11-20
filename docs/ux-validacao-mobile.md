# Validação da fundação UX/UI Mobile

## Suíte funcional

`npm test` executa os testes de regressão da versão Arena Única e o novo `tests/mobile-ux-foundation.mjs`. A suíte protege inventário, progressão, combate, mapas, equipamentos, salvamentos e integração da camada de apresentação.

## Verificação visual isolada

O ambiente não permitiu carregar o jogo completo pelo Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR` ao abrir localhost). Por isso foi criada uma **prévia estática** diretamente a partir do HTML gerado pelas funções `home()`, `world()` e `playerMenu()` e de todas as folhas CSS reais do projeto.

O Chromium executou `page.set_content` nessas três prévias nas larguras **320, 360, 375, 390, 430, 720 e 1366px**. Foram verificadas 21 combinações de tela e viewport:

- 21/21 sem rolagem horizontal da página ou contêiner principal.
- 21/21 com botões medidos em pelo menos 44px nas telas testadas.
- A tela Aventura apresenta o botão Explorar acima da arte ASCII.
- A tela inicial prioriza Criar novo personagem quando não existe salvamento.
- A avaliação visual da arena de combate e dos fluxos completos está pendente, pois requer o jogo executado.

Os arquivos estáticos `docs/ux-preview-home.html`, `docs/ux-preview-world.html` e `docs/ux-preview-player.html` podem ser abertos após extrair o ZIP. As prévias não aceitam ações de gameplay e não devem ser confundidas com o aplicativo.

## Pendências

- Testar instalação, carregamento, fluxo de combate e retorno à exploração em navegador real.
- Testar telas de inventário, crafting, diálogos e missões em dispositivos físicos.
- Reavaliar altura e legibilidade do HUD e ações durante combate (Etapa 5).
- Testar leitores de tela e orientação paisagem.

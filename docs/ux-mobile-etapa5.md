# ASCII REALMS: Reformulação UX/UI Mobile-First, Etapa 5

## Entrega

Este projeto completo foi atualizado **diretamente a partir do ZIP `ascii-realms-main.zip` fornecido pelo usuário**, que já continha as Etapas 1 a 4. Não é um patch separado. Preserva todos os arquivos existentes, artes ASCII de alta densidade, sistemas do jogo e salvamentos v14.

**Escopo:** usabilidade do combate. Nenhuma alteração nas fórmulas de dano, custos, cooldowns, inteligência dos inimigos, recompensas, equipamentos, progressão ou estrutura do LocalStorage.

## Problemas identificados e soluções

| Problema | Ajuste |
| --- | --- |
| Ataques exigiam navegação por submenu | Ataque comum de largura total, sempre visível |
| As habilidades poderiam desaparecer atrás de um menu | Quatro habilidades diretamente visíveis em grade 2×2 |
| Motivos de indisponibilidade pouco claros | Custo real de MP, falta de mana, nível necessário e recarga exibidos |
| Ações secundárias ocupavam espaço de combate | Consumíveis e habilidades de especialização em painéis expansíveis nativos |
| O histórico ocupava espaço continuamente | Resumo do último acontecimento e histórico completo expansível |
| O anúncio de ataque inimigo podia ficar pouco evidente | Aviso de ataque anunciado junto das ações, além do aviso da arena |
| UI compacta podia cortar controles em celulares baixos | Rolagem vertical interna, controles com alvos de toque de 44 px e sem rolagem horizontal |
| Dano de ações passadas poderia ser exibido | Mantido o mecanismo de limpeza da versão-base, com verificação de entrada e fim de turno |

A arena única e diagonal permanece: monstro na região superior direita, herói na região inferior esquerda, indicadores de HP/MP junto aos personagens, artes ASCII originais e animações existentes. As opções de velocidade permanecem operacionais.

## Arquivos modificados e criados

- `js/ui.js`: interface `combatQuickControls`, resumo de acontecimento, histórico expansível e preservação dos painéis abertos ao atualizar a tela.
- `css/mobile-combat-stage5.css`: apresentação do combate, tamanhos de toque, responsividade e acessibilidade.
- `index.html`: inclusão da folha de estilos da Etapa 5 após as folhas das etapas anteriores.
- `package.json`: inclusão do teste da Etapa 5 no comando `npm test`.
- `tests/mobile-combat-stage5.mjs`: testes funcionais e estruturais dos controles, regras preservadas, cooldown, custo, fuga, persistência e arena.
- `tools/qa-ux-stage5-preview.mjs`: gerador da prévia isolada usando o `combatUI()` real com o CSS do projeto.
- `docs/qa-ux5-combat-*.png`, `docs/qa-ux5-browser-metrics.json`, `docs/qa-ux5-fixture.html`: evidências visuais e métricas da prévia.

## Testes executados

- **72 testes automatizados com saída `OK:`** em `npm test`, incluindo os testes antigos e a Etapa 5.
- Teste de ataque direto que verifica avanço do turno e ausência de dano antigo ao fim da animação.
- Verificação da presença de quatro habilidades, cooldowns, custos, botões de consumível e bloqueio da fuga contra chefes.
- Prévia Chromium com a marcação produzida pela função real `combatUI()` e as 42 folhas CSS do jogo.
- Tamanhos verificados: **320×568, 360×780, 375×667, 390×844, 430×932, 720×1280 e 1366×900**. Nenhuma rolagem horizontal. Botões visíveis com altura mínima de 44 px. Em 320×568, as ações inferiores são acessíveis por rolagem vertical.
- Verificação da expansão nativa de consumíveis e histórico.

**Limitação declarada:** o navegador de testes bloqueou a navegação direta para servidores locais, inclusive a versão completa. Os screenshots são prévias isoladas renderizadas com o HTML gerado pelo próprio `combatUI()` e o CSS real. A execução funcional e a regressão foram testadas com Node.js. Não são capturas de um fluxo completo de jogo no navegador.

## Como executar

Na pasta `ascii-realms-main`, sirva o projeto com um servidor HTTP local, por exemplo:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` no navegador. Para executar os testes:

```bash
npm test
```

## Próxima etapa

**Etapa 6: Personagem e inventário.** Organizar atributos, equipamentos, comparação entre itens e habilidades sem alterar as mecânicas existentes.

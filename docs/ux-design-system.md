# Design system | ASCII REALMS Mobile

Arquivo de implementação: `css/mobile-design-system.css`, importado após os estilos anteriores para possibilitar integração gradual.

## Tokens principais

| Token | Papel |
|---|---|
| `--ux-bg`, `--ux-surface`, `--ux-surface-raised` | Fundo e superfícies em três níveis |
| `--ux-edge` | Contornos visíveis sem molduras excessivas |
| `--ux-ink`, `--ux-secondary` | Texto principal e auxiliar |
| `--ux-focus` | Indicador de foco por teclado |
| `--ux-important`, `--ux-danger` | Ação principal e decisões destrutivas |
| `--ux-space-1` a `--ux-space-5` | Escala de 4, 8, 12, 16, 20px |
| `--ux-radius` | Raio de painel |
| `--ux-touch` | Área mínima de toque 44px (exceto controles compactos de combate, etapa futura) |

A fonte da interface mantém os caracteres monoespaçados existentes; a escala de arte é controlada pelo renderizador ASCII, independentemente dos textos.

## Padrões implementados

- Ação principal: primeiro botão de `start-actions` e `main-actions`, identificado por texto e cor.
- Ação destrutiva: não concorre com a principal e tem confirmação na lógica existente.
- Resumo contextual: `ux-adventure-overview`, com localização e recomendação.
- Conteúdo secundário: `ux-disclosure`, com `details` e `summary` nativos.
- Acessibilidade: link Ir para o conteúdo, foco com contorno de contraste, `touch-action: manipulation`, respeito a `prefers-reduced-motion`, `safe-area-inset-*` e texto sem zoom forçado.
- Compatibilidade: tudo foi implementado com CSS e HTML existentes, sem framework.

## Próximas etapas (roteiro do usuário)

1. Auditoria: **concluída**.
2. Design System: **fundação implementada e aplicada à entrada, aventura e menu Personagem**.
3. Navegação: consolidar Aventura, Personagem, Diário e Mundo, com histórico.
4. Aventura e exploração: reorganizar jornada, caminhos e objetivo.
5. Combate: refinar arena, feedback, log e botões, sem alterar mecânicas.
6. Personagem e inventário: filtros reais, comparação e atualização parcial.
7. Cidades e missões: serviços, diálogo, bestiário e diário.
8. Responsividade e acessibilidade: revisão abrangente por tela.
9. Testes e refinamento: gameplay completo, correções e validação final.

Não considerar as Etapas 3 a 9 concluídas pelo fato de existir a nova folha de estilos.

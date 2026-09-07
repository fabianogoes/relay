# 20260907-010 - Acessibilidade e componentes remanescentes

## Problem

A seção 7 do design system nunca foi conferida contra nenhum componente
construído. Dois componentes documentados — painel "Gravado em disco" e as
variantes secundária/perigo do botão — ainda não existem, mesmo depois da UI
já estar consumindo dado real e a segunda visão existir.

## Scope

- Auditar todo componente existente (`StatusPill`, `HandoffCard`,
  `ChecklistList`, `RepairScreen`, `Header`, `EmptyState`, `MainScreen`, o
  seletor de harness e consentimento, as três colunas da segunda visão, o
  `PreflightModal`, a barra e os controles do modo de execução, e a faixa de
  execução em segundo plano)
  contra as cinco regras da seção 7: contraste AA, foco visível, alvos de
  32-36px, nunca só cor para status, hierarquia por tamanho e peso.
- Construir o painel "Gravado em disco": diff arquivo por arquivo do que
  mudou, antes e depois do handoff.
- Adicionar as variantes secundária e perigo ao botão (hoje só existe a
  primária, no `HandoffCard`).

## Non-goals

- **Nenhuma decisão visual nova** além do que a seção 7 e a descrição de
  botão da seção 6 já especificam — qualquer coisa não decidida volta para
  o `README.md` primeiro, mesma regra do refinamento contra o protótipo.
- **Nenhuma ferramenta automatizada de acessibilidade.** Auditoria manual
  contra as cinco regras é o escopo; automação é decisão separada se surgir.

## Decisions

**Achado de auditoria que exigir mudança de token ou componente vai para o
`README.md` primeiro**, pela própria governança da seção 9 — esta spec pode
terminar produzindo novas entradas de backlog em vez de fechar tudo numa
passada só.

## Acceptance criteria

- A-001 - todo componente existente tem um resultado documentado (passa/
  falha) contra cada uma das cinco regras da seção 7, com falhas corrigidas
  ou registradas como nova entrada de backlog
- A-002 - o painel "Gravado em disco" renderiza um diff real dos arquivos de
  `.orchestration/`, uma entrada por escrita e mais recente primeiro, cada
  uma com selo de tipo (`ATUALIZADO` / `LIMPO`), caminho, horário, a linha de
  prosa do significado e as colunas Antes e Depois; a entrada `LIMPO` de um
  handoff esvaziado aparece como qualquer outra
- A-003 - o componente de botão suporta as variantes primária, secundária e
  perigo, com a variante perigo usada por "Encerrar processo" e por nenhuma
  ação não destrutiva
- A-004 - o contador do painel e o da faixa de segundo plano mostram contagem
  verdadeira de arquivos, nunca percentual ou posição
- A-005 - todo controle das telas novas alcança foco visível pelo teclado, e
  a ordem de foco do `PreflightModal` fica contida no modal enquanto ele está
  aberto

## Backlog candidates

- B-016: Acessibilidade auditada e componentes remanescentes construídos
  (needs: B-012, B-013)

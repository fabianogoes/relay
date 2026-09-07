# Change log

## 2026-09-07 - T-001 - Contrato do estado derivado
- Backlog: B-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: ADR-0003 escrita, com o tipo do estado derivado e sete fixtures
  normativos (seis status mais `inconsistent`). Oito decisões, incluindo união
  discriminada para `inconsistent`, `available` derivado no core, e recusa
  explícita de percentual, posição, prioridade, tom e nome de tela.
- Evidence: seis seções obrigatórias do formato de ADR presentes; os dois blocos
  JSON parseiam; a afirmação "doze verificações de integridade" conferida contra
  `docs/PROTOCOL.md` (12). Spec atualizada de seis para sete fixtures.
- Decisions: o contrato carrega o que o protocolo determina; o design system
  determina como aquilo aparece. Tom e tela ficam fora do contrato para não
  inverter a governança do `docs/design-system/README.md`.

## 2026-09-07 - T-002 - Identificadores estaveis das verificacoes
- Backlog: B-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: decisao 9 acrescentada a ADR-0003, com as doze verificacoes de
  integridade nomeadas na ordem do protocolo. Conformidade 7 passou a apontar
  para a tabela e a exigir que verificacao nova acrescente linha na mesma
  mudanca.
- Evidence: nenhum `check` citado fora da tabela; os dois exemplos normativos
  validados por script — `completed`/`total` batem com o array de TODO,
  `available` bate com marcador mais `needs`, e o exemplo `inconsistent` nao
  carrega `status`, `handoff` nem `todo`.
- Decisions: dois identificadores citados na ADR nao existiam na tabela
  (`handoff-names-completed-todo`, `handoff-todo-mismatch`) e foram alinhados.
  O identificador e contrato: renomear exige supersedir a ADR.

## 2026-09-07 - T-003 - ADR-0003 no indice
- Backlog: B-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: ADR-0003 registrada no indice de ADRs do AGENTS.md.
- Evidence: o indice lista 0001, 0002 e 0003; o arquivo referenciado existe.
- Decisions: nenhuma.

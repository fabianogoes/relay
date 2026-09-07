# Handoff

- Status: in_progress
- Backlog: B-003
- TODO: T-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Harness: claude-code
- Updated: 2026-09-07T07:14:35Z

## Objective
Registrar a escolha de framework da `relay-ui` com o raciocinio completo,
incluindo o criterio que foi considerado e descartado.

## Next step
Escrever a ADR-0005. Ela precisa decidir tambem o modo de autoria, porque disso
depende existir ou nao um passo de build — e a ADR-0004 decisao 3 ficou na
dependencia dessa resposta.

## Context
A ADR-0001 nao decide framework: "HTML, CSS e JS comuns" aparece so no diagrama
do ponto 1 e contrasta com toolkit nativo. A secao 8 do design system diz
explicitamente "sem framework obrigatorio; se um framework entrar, os tokens
continuam sendo a fonte de estilo".

Custo de migracao foi considerado e descartado como criterio: a fronteira
HTTP+WS da ADR-0001 ponto 1 ja torna a UI substituivel barato, entao e seguro
que nao cobra contrapartida. Registrar isso importa porque foi erro cometido e
corrigido durante a discussao.

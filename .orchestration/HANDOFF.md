# Handoff

- Status: in_progress
- Backlog: B-002
- TODO: T-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Harness: claude-code
- Updated: 2026-09-07T07:05:09Z

## Objective
Decidir e registrar a fronteira do diretorio `app/`: onde a UI vive, e como ela
nao interfere na instalacao do pacote como funciona hoje, sem UI.

## Next step
Escrever a ADR-0004. A decisao durav é a contencao; a escolha de framework fica
fora, na ADR-0005, para que superar o framework nao arraste a estrutura.

## Context
Garantias a registrar e depois verificar: sem `package.json` na raiz; sem passo
de build; `skills/` intocado; `rm -rf app/` devolve o repositorio ao estado
anterior. A ADR-0002 estabeleceu duas camadas (superficie de pacote e ferramenta
de repositorio); `app/` e uma terceira — produto, distribuido por clone, como a
ADR-0001 decidiu.

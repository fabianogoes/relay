# Handoff

- Status: in_progress
- Backlog: B-001
- TODO: T-001
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Harness: claude-code
- Updated: 2026-09-07T06:49:14Z

## Objective
Definir o contrato do estado derivado que o `relay-core` produz e a
`relay-ui` consome, registrado como ADR-0003, cobrindo os seis status do
protocolo com um fixture cada.

## Next step
Ler `docs/PROTOCOL.md` inteiro para extrair que campos o estado precisa
carregar, e `docs/design-system/README.md` seção de componentes para saber o
que a tela consome. Depois redigir a ADR-0003.

## Context
Decidido em conversa: o contrato é durável e fica separado da escolha de
framework (ADR-0005, Vue), que é a mais provável de ser superada. O tipo e os
fixtures vivem dentro da própria ADR nesta subtarefa; virarão arquivos sob
`app/` em B-004, que declara `needs` sobre B-001, B-002 e B-003.

A UI nunca escreve registro do protocolo (ADR-0001 ponto 5), então o contrato é
somente de leitura: string entra, estado sai, sem `node:fs` no core.

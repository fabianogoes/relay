# 20260907-011 - Integridade do estado e da evidência

## Problem

O repositório está estruturalmente concluído, mas dois leitores oficiais não
derivam o mesmo estado final: `relay-core` retorna `done` quando o backlog
existe e está todo `[x]`, enquanto `relay-session` e `relay-status` tratam a
ausência de trabalho pendente como `idle` ou nem incluem `done` entre os
resultados possíveis.

A revisão também reproduziu uma quebra mais grave da integridade. Um handoff e
um TODO que concordam entre si sobre `B-999`, inexistente no backlog, são
aceitos como `kind: ok / in_progress`. A verificação atual compara handoff e
cabeçalho do TODO, mas não exige que o ID exista no backlog nem que seu caminho
de spec possa ser confrontado.

Por fim, critérios das specs 009 e 010 aparecem cobertos porque o changelog os
nomeia, embora a implementação atual contradiga parte da evidência registrada:
a PTY não executa no macOS atual, o handoff vazio não produz `LIMPO`, o cliente
pode anunciar `exited` antes do host e existem cores literais fora de
`tokens.css`. O mecanismo de cobertura está funcionando como desenhado — ele
verifica presença, não verdade —, mas a memória operacional precisa corrigir
essas afirmações sem reescrever o log append-only.

## Scope

- Explicitar no `docs/PROTOCOL.md` a derivação de `done` e `idle`: backlog não
  vazio integralmente `[x]` é `done`; ausência de backlog, TODO e handoff é
  `idle`.
- Fazer `relay-session`, `relay-status` e `relay-core` derivarem os seis estados
  pelas mesmas regras.
- Completar `backlog-id-mismatch` para exigir que o backlog ativo exista e seja
  o mesmo no handoff e no TODO.
- Completar `spec-path-mismatch` para rejeitar tarefa ativa sem entrada de
  backlog confrontável, sem spec ou com spec diferente do handoff.
- Acrescentar regressões para referências fantasmas, estados finais e todas as
  combinações de handoff/TODO/backlog relevantes.
- Registrar correções append-only no changelog durante a implementação,
  identificando a evidência anterior que deixou de ser verdadeira e a nova
  evidência observada.
- Manter a tabela de checks da ADR-0003 estável; se a implementação demonstrar
  que um novo identificador é indispensável, o protocolo e a ADR mudam antes
  do código e na mesma mudança.

## Non-goals

- Corrigir PTY, lançamento, WebSocket, disco ou componentes da UI; isso pertence
  às specs 012 e 013.
- Tornar mecanicamente verificável se prosa de `Evidence` demonstra um critério.
- Editar ou apagar registros antigos do changelog.
- Renumerar specs, critérios ou entradas já concluídas.
- Introduzir status novo.

## Decisions

**`done` e `idle` preservam a semântica normativa da ADR-0003.** O fixture
`done` já representa backlog não vazio integralmente `[x]`, e o fixture `idle`
representa ausência dos três registros de trabalho. A correção é alinhar as
skills e explicitar a regra no protocolo, não mudar o core para apagar a
distinção.

**Referência existente é parte de “concordar”.** Handoff e TODO apontarem o
mesmo ID inexistente não satisfaz a integridade. `backlog-id-mismatch` cobre
também ausência do ID no backlog; `spec-path-mismatch` cobre a impossibilidade
de confrontar o caminho da tarefa. Reutilizar os identificadores existentes
mantém o contrato estável e descreve melhor o erro do que criar checks
paralelos.

**A correção da memória é append-only.** Resultados antigos permanecem como
histórico. Novos registros dizem explicitamente qual afirmação anterior foi
refutada, qual é o comportamento real e qual evidência passou a demonstrar o
critério. Cobertura sintática nunca é apresentada como validação substantiva.

## Acceptance criteria

- A-001 - `docs/PROTOCOL.md`, ADR-0003, `relay-session`, `relay-status` e
  `relay-core` concordam que backlog não vazio todo `[x]` é `done` e ausência
  total de trabalho é `idle`
- A-002 - o repositório atual produz o mesmo estado final quando lido pela skill
  e por `deriveState`
- A-003 - handoff e TODO que apontam juntos para um backlog ID inexistente
  produzem `inconsistent` com `backlog-id-mismatch`
- A-004 - tarefa ativa sem spec confrontável ou com caminho divergente produz
  `inconsistent` com `spec-path-mismatch`
- A-005 - os sete fixtures normativos continuam passando sem mudança de forma,
  salvo mudança do próprio contrato registrada antes no protocolo e na ADR
- A-006 - testes cobrem ID de backlog ausente, caminho de spec ausente,
  divergência entre os três registros, backlog todo concluído e repositório
  realmente vazio
- A-007 - nenhuma entrada histórica do changelog é editada ou removida; as
  afirmações refutadas pela revisão recebem correção append-only com evidência
  nova e específica
- A-008 - a verificação de cobertura continua aceitando apenas critérios
  nomeados, sem alegar que validou semanticamente a prosa de `Evidence`

## Backlog candidates

- B-017: Contrato de estados finais e cruzamentos ativos explicitado
- B-018: relay-core e skills convergem no mesmo estado e nas mesmas violações
  (needs: B-017)
- B-019: Regressões de integridade e correções append-only da evidência
  (needs: B-018)

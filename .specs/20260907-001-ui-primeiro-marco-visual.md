# 20260907-001 - Primeiro marco visual da relay-ui

## Problem

O Relay tem protocolo, cinco skills e um design system, e nenhuma superfície
visual. Hoje só se conhece o estado de um repositório Relay lendo os arquivos à
mão. A ADR-0001 decidiu a arquitetura da UI e o `docs/design-system/README.md`
definiu tokens e componentes, mas nada foi construído — os dois documentos ainda
são hipóteses.

O primeiro marco precisa provar duas coisas ao mesmo tempo, porque cada uma
sozinha vale pouco:

1. que os tokens documentados produzem a tela pretendida;
2. que existe um formato de estado derivado que aguenta os seis status do
   protocolo.

Sem (2), a marcação é escrita contra um formato imaginado e o `relay-core`
contradiz depois. Sem (1), o design system continua sendo um documento que
ninguém exercitou.

## Scope

- Um diretório `app/` contido, que não interfere na instalação atual do pacote.
- O contrato do estado derivado: um tipo TypeScript mais um fixture por status,
  neutro de linguagem, que é o que o `relay-core` vai produzir e a `relay-ui`
  consumir.
- `relay-ui` em Vue renderizando a tela principal a partir de um fixture.
- Os seis status do protocolo — `backlog`, `ready`, `in_progress`, `blocked`,
  `done`, `idle` — mais o diagnóstico `inconsistent`, que tem tela própria no
  design system e é o caso que a ADR-0001 nomeia como pior.
- Um `tokens.css` único, derivado de `docs/design-system/README.md`.
- Três decisões registradas em ADR: contrato, estrutura, framework.

## Non-goals

- **Nenhuma execução.** Sem `relay-host`, sem servidor local, sem WebSocket,
  sem PTY, sem `xterm.js`, sem preflight, sem lançamento de harness.
- **Sem `relay-core`.** Este marco define o *formato* que ele vai produzir, não
  a implementação que o produz.
- Sem a segunda visão (specs, backlog, changelog) e sem navegação entre telas.
- Sem casca de aplicação: Tauri e Electron seguem adiados pela ADR-0001 ponto 4.
- A UI não escreve nada, neste marco e em nenhum outro (ADR-0001 ponto 5).

## Decisions

**Vue como framework da `relay-ui`.** Descartados Lit, Preact e React+Vite. O
critério decisivo é que o design system especifica CSS global com classe por
componente e um `tokens.css` único (seção 8), e o template do Vue mapeia isso
sem tradução. O critério de custo de migração foi considerado e **descartado**:
a fronteira HTTP+WS da ADR-0001 ponto 1 já torna a UI substituível barato, então
ela é seguro que não cobra contrapartida e não deve virar critério de escolha.

**`app/` como diretório único de contenção.** Sem `package.json` na raiz, sem
passo de build obrigatório, nada tocado em `skills/`. A garantia é verificável:
`rm -rf app/` devolve o repositório ao estado anterior.

**Contrato e framework em ADRs separadas.** O contrato é durável e sobrevive a
troca de framework, a Rust no core e a KMP; o framework é a decisão mais provável
de ser superada. Num documento só, superar o framework arrastaria o contrato.

**Os seis fixtures são a validação do contrato.** Renderizar um estado só provaria
tokens e layout, não o contrato. São os mesmos componentes com dado diferente.

## Acceptance criteria

- [ ] `claude --plugin-dir .` e os symlinks de `skills/` continuam funcionando
      sem `npm install`
- [ ] `rm -rf app/` devolve o repositório ao estado anterior, exceto o ponteiro
      no `AGENTS.md`
- [ ] Existe um tipo do estado derivado e sete fixtures: um por status e um
      para o diagnóstico `inconsistent`
- [ ] A tela principal renderiza os sete fixtures sem alterar componente algum,
      apenas o dado de entrada
- [ ] Toda cor, espaçamento e raio vêm de `var(--token)`; nenhum literal fora do
      `tokens.css`
- [ ] Nenhum arquivo de `app/` escreve em `.specs/` ou `.orchestration/`
- [ ] Três ADRs registradas: contrato do estado, estrutura do `app/`, framework
- [ ] O `AGENTS.md` ganha no máximo uma linha apontando para `app/`

## Backlog candidates

- B-001: Contrato do estado derivado registrado em ADR, com um fixture por status
- B-002: Fronteira e estrutura do `app/` registradas em ADR e criadas em disco
- B-003: Framework da `relay-ui` registrado em ADR
- B-004: Tela principal renderizando os sete fixtures (needs: B-001, B-002, B-003)

Os três primeiros são independentes entre si e podem ser feitos em qualquer
ordem. Só o quarto declara dependência, e ela é dado explícito, não posição.

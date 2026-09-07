# Rodando a UI do Relay

Este diretório é a interface do Relay. Leia `AGENTS.md` antes de mudar
qualquer coisa aqui — ele traz as regras de fronteira (ADR-0004) e o contrato
de dados (ADR-0003).

## Pré-requisito

Node ≥ 24 (`node --version`). Nada além disso.

## Instalar

```sh
cd app
npm install
```

Isso instala as dependências do workspace inteiro (`relay-ui` incluso, via
`workspaces` do `app/package.json`). Os binários (`vite`, `vue-tsc`) ficam em
`app/node_modules/.bin/` — não existem soltos no PATH nem dentro de
`app/relay-ui/`. Sempre rode pelos scripts do `npm`, nunca pelo binário cru.

## Rodar em desenvolvimento

```sh
cd app/relay-ui
npm run dev
```

Abre em `http://localhost:5173`. A barra no topo troca entre os sete estados
do protocolo (fixtures de `app/fixtures/`) — não é parte do design system, é
ferramenta de desenvolvimento para ver cada estado sem precisar de um
`relay-host` rodando.

## Verificar tipos

```sh
cd app/relay-ui
npm run typecheck
```

## Build de produção

```sh
cd app/relay-ui
npm run build
```

Gera `app/relay-ui/dist/`. Confirma que `vue-tsc --noEmit` passa antes de
buildar.

## Estrutura

```text
app/
  package.json       raiz do workspace (nunca publicada, "private": true)
  AGENTS.md           regras desta pasta
  fixtures/           os sete estados normativos do protocolo (ADR-0003)
  relay-ui/           a interface Vue 3 + Vite + TS
    src/
      types.ts        o contrato (ADR-0003): RelayState, UiPayload
      fixtures.ts      carrega os sete JSON
      components/      StatusPill, HandoffCard, ChecklistList, RepairScreen...
      styles/
        tokens.css      derivado de docs/design-system/README.md — nunca editar
                        sem mudar o README primeiro
        app.css         classes por componente, consumindo só var(--token)
```

## O que ainda não existe

Não há `relay-host` nem `relay-core` implementados — a UI hoje só mostra
fixtures estáticos, nunca estado real de um repositório. Não há execução,
WebSocket, nem lançamento de harness. Veja `app/TODO-BUILD.md` para o que
falta e as specs em `.specs/` para o trabalho já planejado.

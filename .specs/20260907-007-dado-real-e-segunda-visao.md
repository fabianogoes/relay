# 20260907-007 - Dado real na UI e segunda visão

## Problem

A `relay-ui` só mostra fixture estático via seletor manual. A segunda visão
(aba Trabalho) não existe: o protótipo mostra um painel de três colunas
simultâneas — Specs, Backlog da spec selecionada, Changelog — que a spec 001
nunca cobriu.

## Scope

- Trocar o seletor manual de `App.vue` por cliente WebSocket consumindo o
  `UiPayload` real do `relay-host`.
- Reconexão com backoff; ao reconectar, renderizar do zero a partir do
  estado fresco recebido, nunca supor que o estado local antigo continua
  válido.
- Aba **Trabalho**: três colunas.
  - **Specs**: lista vinda de uma rota do `relay-host` (spec 005),
    mostrando título e contagem de tarefas por spec.
  - **Backlog da spec selecionada**: reaproveita o array `backlog` que já
    vem no `UiPayload` (`RelayState.backlog`), filtrado pelo campo `spec` de
    cada entrada — nenhuma rota nova para isso.
  - **Changelog**: texto cru vindo de outra rota do `relay-host`.
- Selecionar uma spec na primeira coluna filtra a segunda; a terceira
  independe da seleção.
- Porta "+ nova spec" no cabeçalho da coluna Specs, abrindo o
  `PreflightModal` da spec 008 com a composição de `relay-spec` — a coluna
  continua sem escrever nada por conta própria.

## Non-goals

- **Nenhuma edição.** As três colunas são somente leitura (ADR-0001 ponto 5).
- **Nenhum roteamento client-side dedicado.** A alternância Agora/Trabalho é
  um `ref` local; biblioteca de rotas fica para quando a complexidade
  genuinamente pedir (ADR-0005 deixou em aberto de propósito).
- **Nenhum cache offline.** WS fora do ar mostra estado desconectado, claro.

## Decisions

**Backlog reaproveitado, não duplicado.** O `RelayState.backlog` da ADR-0003
já lista todas as entradas com o campo `spec` — não precisa de rota nova
para a coluna do meio, só filtro no cliente pelo ID da spec selecionada na
coluna da esquerda.

**Specs e changelog via rota de conteúdo bruto**, decidida na spec 005 —
texto cru renderizado, nunca um parser novo do protocolo na UI.

## Acceptance criteria

- A-001 - `relay-ui` conecta ao WebSocket do `relay-host` e renderiza o
  `UiPayload` real; o seletor de fixture não aparece por padrão
- A-002 - matar e religar o `relay-host` faz a UI reconectar e re-renderizar
  sem recarregar a página manualmente
- A-003 - a aba Trabalho mostra as três colunas simultâneas; selecionar uma
  spec filtra a coluna do meio
- A-004 - nenhum componente das três colunas emite requisição de escrita ao
  `relay-host`
- A-005 - o seletor de fixture continua existindo, alcançável só por rota de
  desenvolvimento, para trabalho de componente sem `relay-host` rodando
- A-006 - "+ nova spec" abre o `PreflightModal` e nada mais; a ação não
  escreve em `.specs/` nem em `.orchestration/` a partir da UI
- A-007 - concluída uma execução, as duas visões refletem o mesmo estado sem
  recarregar a página: a entrada do backlog muda de disponível para em curso,
  o changelog ganha o registro novo, e a aba Agora passa a mostrar o handoff
  com a proveniência do harness que rodou

## Backlog candidates

- B-013: relay-ui consumindo dado real com a segunda visão de três colunas
  (needs: B-011)

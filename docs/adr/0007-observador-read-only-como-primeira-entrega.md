# ADR-0007 — Observador read-only como primeira entrega

## Status

**Accepted** — 2026-09-10.

## Contexto

O Relay quer validar primeiro sua tese central: a memória operacional vive nos
cinco registros do repositório e pode ser acompanhada por qualquer harness. A
UI já lê, deriva e observa esses registros; também ganhou lançamento, preflight
e terminal antes de a execução integrada estar confiável no macOS. As specs 012
e 013 registram falhas reais nessa superfície, enquanto o caminho read-only do
host, do core e do WebSocket já funciona e é útil isoladamente.

O usuário precisa abrir a UI em uma tela, operar o harness manualmente em outra
e perceber as mudanças do workflow sem recarregar a página. Isso deve funcionar
em qualquer repositório Relay e preservar o investimento já feito na execução
integrada sem apresentá-la como parte pronta da primeira versão.

## Decisão

### 1. O host inicia read-only

Sem flag, `relay-host` inicia com `execEnabled: false` e não registra rotas de
lançamento. `--exec` habilita explicitamente a superfície experimental.
`--no-exec` continua aceito nesta versão como alias de compatibilidade e sempre
vence uma combinação contraditória, mantendo a escolha segura.

O código de launcher, preflight, PTY, terminal e descoberta de harness
permanece no repositório. O modo read-only simplesmente não o monta nem o
consulta.

### 2. Um host observa um workspace explícito

`--workspace=<path>` escolhe o repositório observado. Caminhos relativos são
resolvidos contra `process.cwd()` e o caminho absoluto resultante cruza o
`Environment`. Sem a opção, o comportamento permanece `process.cwd()`.

Não nasce um CLI do protocolo: este argumento pertence ao processo de produto
em `app/relay-host`, não lê nem escreve registros por conta própria.

### 3. A hierarquia Agora/Trabalho permanece

**Agora** continua mostrando handoff e TODO como projeção semântica do core.
**Trabalho** continua mostrando specs, backlog e changelog. Não há cinco abas
nem um segundo parser de Markdown na view.

> **Revisado pela decisão 6.** Esta decisão previa exibir o texto integral da
> spec selecionada na coluna do meio, via rota bruta. A validação visual
> mostrou que um documento inteiro em mono afoga os cartões de backlog, que
> são o objeto selecionável daquela coluna. A coluna passou a mostrar só os
> cartões; a rota bruta `GET /api/specs/<id>` permanece no host, sem uso pela
> UI, e o caminho do arquivo continua visível no cartão de spec.

### 4. Reatividade distingue transição de snapshot

O WebSocket pode sinalizar que os diretórios ficaram sujos antes de publicar o
próximo `UiPayload`. O watcher usa debounce trailing de 150 ms: cada novo evento
reinicia a janela; ao fim da quiescência o host relê todos os registros e envia
um snapshot inteiro. A UI mantém o último snapshot durante a transição.

Respostas HTTP auxiliares de specs e changelog pertencem à revisão que as
solicitou. Uma resposta anterior é cancelada ou ignorada, nunca substitui a
revisão mais nova.

### 5. Frescor é estado visível da interface

A UI distingue textualmente `Atualizado`, `Atualizando` e `Desatualizado`.
Queda de conexão não apaga um snapshot já recebido, mas o marca como antigo até
que a reconexão entregue outro. Uma inconsistência presente no snapshot estável
continua sendo derivada pelo core e leva à tela Reparar.

### 6. Changelog é servido também estruturado, em cascata com o backlog

**Revisão da decisão 3 quanto ao changelog**, mantendo o texto de spec como
estava. A validação visual desta entrega mostrou que "changelog como
documento global e texto cru" não sustenta a experiência decidida no design
system: selecionar um cartão de backlog deve filtrar o changelog daquele
`Backlog:`, e filtrar por um campo exige o campo — texto cru não pode ser
filtrado sem que a view o interprete, o que violaria o invariante real desta
ADR (nenhum parser do protocolo na UI), não a redação anterior sobre changelog
especificamente.

A solução mantém o invariante trocando onde o filtro acontece: `relay-core`
já possuía `parseChangelog` (usado internamente pelas verificações de
integridade) — ele passa a ser exportado e consumido por uma nova rota do
`relay-host`, `GET /api/changelog/entries`, que devolve os registros já
estruturados (data, subtarefa, título, backlog, evidência). A UI filtra essa
lista pelo `backlogId` do cartão selecionado; ela nunca lê `## ` nem `- Chave:`
do Markdown bruto. A rota `GET /api/changelog` (texto cru) permanece, sem uso
atual pela UI, caso outro cliente precise do documento completo.

Spec continua exclusivamente texto preservado nesta versão: nenhum parser de
spec foi criado, e nenhuma dependência de renderização de Markdown entrou no
projeto.

## Consequências

### Positivas

- A primeira versão valida o protocolo e o fluxo multi-harness sem depender da
  execução integrada.
- A superfície padrão perde rotas e controles capazes de criar processos.
- O produto existente é preservado e pode voltar por opt-in durante seu
  amadurecimento.
- Um snapshot estável evita alarmes transitórios durante escritas coordenadas.

### Negativas e custos assumidos

- Usuário opera duas janelas e inicia o harness manualmente.
- O sinal de transição acrescenta uma forma de mensagem ao canal WebSocket.
- A UI pode mostrar dados antigos deliberadamente, por isso o rótulo de frescor
  torna-se parte obrigatória da experiência.
- `fs.watch` não cria transações; 150 ms é uma janela de quiescência, não uma
  garantia de atomicidade entre processos arbitrários.

## Compliance

1. Sem flag, o payload informa `execEnabled: false` e rotas de lançamento
   autenticadas devolvem `404`; somente `--exec` pode habilitá-las.
2. `--workspace=<path>` e o fallback para `cwd` são cobertos por teste com
   caminhos resolvidos.
3. Em read-only, a UI não monta controles nem consulta dados de harness; a
   proveniência do handoff permanece.
4. Agora/Trabalho continuam sendo as duas visões e nenhum parser do protocolo
   entra na UI.
5. O watcher sinaliza transição e só publica novo snapshot após 150 ms sem
   eventos.
6. Atualização, desconexão e reconexão têm rótulos textuais; uma inconsistência
   estável continua chegando como `RelayState.kind: inconsistent`.
7. `GET /api/changelog/entries` devolve registros estruturados via
   `relay-core`; nenhum arquivo de `relay-ui` casa `## ` ou `- Chave:` contra
   o texto do changelog.

## Notes

Esta ADR complementa a ADR-0006. As garantias de loopback, token, same-origin,
rotas brutas e ausência da rota de lançamento quando `execEnabled` é falso
continuam válidas. A ADR-0007 decide o default do produto, a entrada de
workspace e a semântica de frescor que a ADR-0006 havia deixado em aberto.

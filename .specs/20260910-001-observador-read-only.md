# 20260910-001 - Observador read-only como primeira versao

## Problem

Quem trabalha com Relay precisa manter a interface aberta em uma tela e usar
Codex, Claude Code ou outro harness manualmente em outra, vendo o estado
duravel do workflow mudar sem recarregar a pagina. A infraestrutura de leitura,
derivacao e WebSocket ja existe, mas a experiencia padrao ainda se apresenta
como um launcher de harness, a spec selecionada nao e exibida e uma queda de
conexao pode deixar dados antigos na tela sem aviso.

## Scope

- Tornar o `relay-host` read-only por padrao e manter a execucao integrada como
  opt-in experimental explicito por `--exec`; aceitar `--no-exec` como alias de
  compatibilidade durante esta versao.
- Aceitar um workspace explicito no host, resolvido a partir do diretorio
  corrente, mantendo o proprio `cwd` como default.
- Preservar todo o codigo e as duas visoes existentes: **Agora** continua sendo
  a projecao operacional de handoff e TODO; **Trabalho** continua reunindo specs,
  backlog e changelog.
- Em modo read-only, remover da composicao visual seletores, modais, terminal,
  avisos e consultas de harness, preservando no handoff a proveniencia de qual
  harness escreveu o registro.
- Exibir na visao Trabalho o backlog da spec selecionada como cartoes
  selecionaveis, e o changelog filtrado pelo cartao de backlog selecionado
  (cascata spec -> backlog -> changelog), tambem em cartoes. O texto integral
  da spec nao e reproduzido na coluna; o caminho do arquivo fica no cartao de
  spec (ADR-0007 decisao 3, revisada).
- Recuperar deterministicamente a selecao quando uma spec for criada,
  renomeada ou removida e impedir que respostas HTTP antigas substituam dados
  de uma invalidacao mais recente.
- Tratar uma sequencia de escritas como uma transicao: indicar que os arquivos
  estao mudando, manter o ultimo snapshot estavel e publicar um novo snapshot
  apos um curto periodo de quiescencia. Inconsistencia que persistir nesse
  snapshot continua levando a tela Reparar.
- Mostrar conexao, reconexao e dados desatualizados com texto acessivel, sem
  comunicar estado apenas por cor.
- Cobrir o contrato do host e os comportamentos novos da UI e atualizar a
  documentacao de uso real em qualquer repositorio Relay.

## Non-goals

- Remover ou reescrever launcher, preflight, PTY, terminal ou descoberta de
  harness ja implementados.
- Corrigir os defeitos de execucao das specs 012 e 013.
- Alterar a gramatica dos cinco registros ou corrigir a integridade pendente da
  spec 011.
- Fazer a UI escrever em `.specs/` ou `.orchestration/`.
- Trocar Vue, criar roteador client-side, tema claro ou uma navegacao de cinco
  abas orientada a arquivos.
- Renderizar Markdown para HTML ou introduzir uma dependencia de renderer nesta
  primeira versao; a spec permanece texto preservado e legivel. O changelog e
  a excecao registrada na ADR-0007 decisao 6: passa a ser estruturado pelo
  parser ja existente do `relay-core`, nao por um renderer nem por um segundo
  parser na UI.

## Decisions

**Read-only e o produto padrao.** O host inicia com execucao desabilitada;
`--exec` reabre explicitamente a superficie experimental. `--no-exec` continua
aceito para nao quebrar comandos existentes, mas deixa de ser necessario.

**A UI expressa o workflow, nao o sistema de arquivos.** Handoff, TODO e backlog
continuam como projecoes semanticas produzidas pelo core. Spec continua
documento textual. Changelog tambem e projecao do core (ADR-0007 decisao 6):
`relay-core` ja fazia o parse para as verificacoes de integridade, e passa a
expor esse resultado por uma rota dedicada do host, filtravel por backlog na
UI sem que a UI reinterprete a gramatica do protocolo.

**As duas visoes existentes permanecem.** Agora responde "onde estou e qual e o
proximo passo"; Trabalho responde "qual e a intencao, o trabalho disponivel e o
historico". O conteudo da spec completa a segunda visao sem desfazer a hierarquia
ja implementada.

**Reatividade publica snapshots estaveis.** O watcher sinaliza imediatamente
uma transicao e reinicia um debounce trailing a cada evento. A UI conserva o
ultimo snapshot com o rotulo "Atualizando"; ao fim de 150 ms sem novos eventos,
o host rele e publica um snapshot inteiro. Respostas auxiliares carregadas por
HTTP sao canceladas ou ignoradas quando pertencem a uma revisao anterior.

**Desconectado nao parece atual.** Quando o WebSocket cai depois de um snapshot,
o conteudo permanece disponivel para consulta, mas recebe rotulo textual de
dado desatualizado ate a conexao entregar um snapshot novo.

**Workspace explicito e opcional.** `--workspace=<path>` observa qualquer repo
Relay; sem a opcao, o host observa `process.cwd()`. Caminho relativo e resolvido
contra o cwd e o header mostra o caminho resolvido.

## Acceptance criteria

- A-001 - iniciar o host sem flag produz `execEnabled: false`; `--exec` produz
  `execEnabled: true`; `--no-exec` continua aceito e nunca habilita execucao
- A-002 - `--workspace=<path>` observa o caminho resolvido informado e a ausencia
  da opcao preserva o comportamento baseado no cwd
- A-003 - em read-only nenhuma superficie de selecao, preflight, terminal,
  aviso ou consulta de harness e montada, mas a proveniencia do handoff continua
  visivel
- A-004 - as visoes Agora e Trabalho permanecem; selecionar uma spec mostra os
  cartoes de backlog dela, com o caminho do arquivo visivel no cartao de spec
- A-005 - criacao, rename e remocao de spec atualizam lista, conteudo e selecao
  sem recarregar a pagina nem deixar uma selecao orfa
- A-006 - uma mudanca sinaliza "Atualizando", conserva o ultimo snapshot e so
  publica o novo estado depois de 150 ms de quiescencia
- A-007 - respostas auxiliares de uma revisao anterior nunca substituem spec ou
  changelog da revisao mais recente
- A-008 - queda e reconexao ficam visiveis por texto; dados anteriores ficam
  marcados como desatualizados ate chegar um snapshot novo
- A-009 - uma inconsistencia persistente no snapshot estavel continua produzindo
  a tela Reparar, sem parser do protocolo na UI
- A-010 - testes cobrem defaults/flags/workspace do host, transicao e quiescencia
  do watcher, atualizacao dos dois diretorios, selecao de spec, resposta fora de
  ordem, desconexao e ausencia de controles de execucao no modo read-only
- A-011 - `app/README.md` descreve core, host, WebSocket e o comando para abrir
  qualquer workspace em read-only; `app/TODO-BUILD.md` deixa de descrever o
  marco inicial como estado atual
- A-012 - selecionar um cartao de backlog filtra o changelog exibido para os
  registros daquele `Backlog:`; o primeiro cartao de backlog e selecionado por
  padrao e a selecao nunca fica orfa quando a spec ou o backlog mudam

## Backlog candidates

- B-029: Contrato read-only padrao e entrada por workspace explicito
- B-030: WebSocket distingue transicao de snapshot estavel
- B-031: As cinco fontes do workflow ficam legiveis e reativas sem superficie
  de execucao (needs: B-029, B-030)
- B-032: Regressoes e documentacao validam a primeira versao observadora
  (needs: B-019, B-031)

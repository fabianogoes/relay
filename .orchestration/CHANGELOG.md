# Change log

## 2026-09-07 - T-001 - PTY no relay-host por processo nativo
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: `relay-host/src/pty.ts` aloca um PTY por execução **sem dependência
  nativa** (decisão com o usuário, honrando a ADR-0004 contra `npm install`
  de módulo nativo): `script -q -e -F <fifo> -- <bin> <args...>` no macOS cria
  o PTY, grava o fluxo num fifo lido com `O_NONBLOCK` (nada bloqueia) e
  propaga o exit code do filho via `-e`. O handle expõe `write` (teclas →
  stdin), `scrollback()` (acumulado por run), `terminate` (SIGHUP, mata) e os
  callbacks `onData`/`onExit`. `executor.ts` mantém o conjunto de runs ativos.
- Evidence: `node --test` do host 16/16; typecheck limpo; smoke test do host
  (start/close limpos). `script -F <fifo>` validado empiricamente: alocou PTY,
  capturou `hello_pipe\r\n` e devolveu exit 0. Desanexar só fecha o WebSocket
  do cliente — o processo e o scrollback ficam no host.
- Criteria: none
- Decisions: PTY sem `node-pty` (módulo nativo) — a alternativa foi registrada
  como violação da ADR-0004 e descartada. `resize` é no-op porque o tamanho da
  PTY do `script` é fixo por processo; o fit do xterm é client-side.

## 2026-09-07 - T-002 - Canal de execução por WebSocket no relay-host
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: `server.ts` ganhou `/ws/term` (mesmo token/Origem/subprotocol do
  `/ws`), multiplexando frames `data`/`exit`/`disk` por run; `POST
  /api/launch/embedded` (404 sob `--no-exec`), `GET /api/runs`,
  `GET /api/run/<id>` e `POST /api/run/<id>` (terminate). O host envia o
  scrollback guardado no `attach` de uma reconexão, satisfazendo o replay.
- Evidence: teste novo em `server.test.ts` (launch/embedded 404 sem
  `launchEmbedded`); typecheck limpo; `/ws` de payload intacto (15 testes
  originais seguem passando).
- Criteria: none
- Decisions: um segundo endpoint WS separa Canal A (fluxo do terminal) do
  Canal B (payload de estado), mesma tese do design system — o estado vem do
  disco, nunca do stdout parseado.

## 2026-09-07 - T-003 - Componente Terminal isolado do re-render do Vue
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: `Terminal.vue` monta `@xterm/xterm` num `<div ref>` próprio com
  atualização **somente imperativa** — `term.write` no callback de dado, fit
  por `ResizeObserver`; nenhum binding reativo mira o conteúdo do container.
  `lib/term-client.ts` abre `/ws/term` e `lib/execution.ts` mantém o store de
  execução (launch/detach/reattach/terminate) com buffer de scrollback no
  cliente.
- Evidence: `vue-tsc`/`vite build` limpos; `grep` por `v-html`/`innerHTML` em
  `Terminal.vue` retorna vazio — o subárvore do xterm nunca é tocado pelo
  ciclo reativo.
- Criteria: A-001, A-003
- Decisions: xterm.js habilita alt-screen, bracketed paste e mouse tracking
  por padrão no protocolo terminal; nada foi desabilitado.

## 2026-09-07 - T-004 - Modo de execução na UI
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: `ExecutionMode.vue` ocupa a viewport (`position: fixed; inset: 0`)
  **sem** as abas Agora/Trabalho quando há run anexada; barra com selo do
  harness (tom de identidade), nome da execução, StatusPill e controles por
  estado — `em execução` tem "Deixar em segundo plano" (secundário) e
  "Encerrar processo" (perigo), `concluído` só "Fechar". `KeyboardWarning.vue`
  mostra o aviso de conflito `Cmd+W`/`Cmd+T` na primeira execução, com a
  alternativa "modo externo".
- Evidence: `v-if="exec.status === 'running'"` restringe os controles por
  estado; o `v-else` de "Fechar" só renderiza quando o status é `exited` —
  inalcançável com processo vivo (A-006). O aviso fica sob
  `firstRunThisSession` (A-004).
- Criteria: A-004, A-006, A-007
- Decisions: "Encerrar processo" exige um segundo clique que **nomeia** o que
  será descartado (`Descartar {nome}?`); desanexar nunca confirma.

## 2026-09-07 - T-005 - Faixa de segundo plano e painel "Gravado em disco"
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: `BackgroundStrip.vue` aparece só com execução desanexada, com
  contador verdadeiro de arquivos escritos e "Reconectar ao terminal" — a
  reconexão reanexa e exibe o selo `RECONECTADO À EXECUÇÃO VIVA`.
  `DiskLog.vue` é a coluna direita do modo de execução; `disk.ts` no host
  tira diff dos quatro registros de `.orchestration/` e emite `disk` frames
  pelo `/ws/term`, então o painel recebe entradas **durante** a execução, não
  só ao final.
- Evidence: `disk.ts` com `diff()` incremental por run (snapshot + comparação,
  tipo `ATUALIZADO`/`LIMPO`); frames `disk` lidos pelo `onDisk` do cliente e
  empurrados no `useDisk()`. Typecheck/build limpos.
- Criteria: A-005, A-008
- Decisions: o diff Antes/Depois completo (spec 010, A-002) compartilha o
  mesmo tracker de disco; aqui entrega a presença e o fluxo ao vivo.

## 2026-09-07 - T-006 - Evidência: testes, typecheck, build e ordem de estado
- Backlog: B-015
- Spec: .specs/20260907-009-terminal.md
- Result: fechamento da integração — o `status` da barra só vira `exited` pelo
  callback `onExit` do socket, que por sua vez só dispara no `close` do filho
  no host. O `pillStatus` deriva `in_progress`→green / `exited`→`done`, então
  "concluído" jamais antecede a saída do processo.
- Evidence: relay-core 24/24 e relay-host 16/16 em `node --test`;
  `vue-tsc --noEmit` limpo nos três pacotes; `vite build` limpo; host faz
  start/close limpos (smoke). A-009 é garantido por construção: estado → tom
  via piloto de execução, não por polling.
- Criteria: A-002, A-009
- Decisions: nenhuma.

## 2026-09-07 - T-005 - Quatro portas de lançamento num modal só
- Backlog: B-014
- Spec: .specs/20260907-008-preflight-e-lancamento.md
- Result: as quatro portas abrem o mesmo `PreflightModal` via `openPreflight`:
  "+ nova spec" (WorkScreen) e "Iniciar entrevista" (tela Escolher) →
  `relay-spec`/“Especificar uma ideia”; "Começar" (por tarefa disponível) →
  `relay-session`/“Iniciar sessão em {id}”; "Retomar" (HandoffCard) →
  `relay-session`/“Retomar sessão”. Toda porta fica oculta quando
  `environment.execEnabled` é falso, então sob `--no-exec` o modal nunca é
  renderizado.
- Evidence: `vue-tsc`/`vite build` limpos; `grep` por `openPreflight` encontra
  só as três origens, todas atrás de `v-if="execEnabled"`; `grep` por outra
  rota chamando `/api/launch` não encontra nenhuma além do `PreflightModal`.
  Smoke test do host: `/api/launch/preview` devolve o plano e `/api/harnesses`
  devolve a detecção real.
- Criteria: A-003, A-007
- Decisions: o 404 da rota sob `--no-exec` já estava testado em T-002; aqui
  fecha a outra metade do A-003 (portas ocultas → modal nunca renderizado).

## 2026-09-07 - T-004 - PreflightModal completo com argv real
- Backlog: B-014
- Spec: .specs/20260907-008-preflight-e-lancamento.md
- Result: `PreflightModal.vue` reescrito: tabela `bin`/`arg`/`prompt`/`cwd` com
  uma linha por elemento real do argv (vinda de `POST /api/launch/preview`,
  nunca string montada), campo `prompt` editável (a intenção), seletor de
  harness e consentimento embutidos, aviso de execução e um único botão
  "▶ Executar no {harness}". Trocar o harness re-compõe as linhas e o rótulo do
  botão. Novo store `lib/launch.ts` (`openPreflight`/`closePreflight`/
  `usePreflight`) e `apiPostJson` no relay-client. `App.vue` renderiza um único
  modal; `WorkScreen` abre via store.
- Evidence: `vue-tsc` e `vite build` limpos; o preview vem do host
  (autoridade única do argv) e o confirm envia `{ harness, skill, intent }`
  para `POST /api/launch`. Esc/Cancelar chamam `closePreflight` sem lançar; o
  modal não fecha por clique fora (só o seletor standalone fecha assim).
  Fixture mode usa `localPreview` dev-only.
- Criteria: A-002, A-004, A-008, A-009
- Decisions: a linha `prompt` da tabela é o elemento composto do argv (prefixo
  + intenção); o campo editável é a intenção, que re-compõe a linha via
  preview. O consentimento nunca dispensa o botão de confirmar.

## 2026-09-07 - T-003 - Seletor e selo de harness com dado real
- Backlog: B-014
- Spec: .specs/20260907-008-preflight-e-lancamento.md
- Result: `lib/harness.ts` trocou a fonte de dado de `HARNESS_FIXTURE` por um
  store reativo (`setHarnesses`/`allHarnesses`/`harnessById`); `App.vue` carrega
  `GET /api/harnesses` no modo host e cai na fixture quando não há host.
  `HarnessSelector`, `Header` e `HandoffCard` passaram a ler da lista real, sem
  mudança de forma (mesma marcação, tons e estados).
- Evidence: `vue-tsc --noEmit` limpo; os três componentes não importam mais
  `HARNESS_FIXTURE` para renderizar a lista (só como fallback de último recurso
  no `Header`); em fixture mode a lista continua exatamente a anterior.
- Criteria: A-006
- Decisions: a detecção real já existia no host (`detectHarnesses`); esta
  mudança só a conecta à view. A fixture permanece como rota de desenvolvimento.

## 2026-09-07 - T-002 - Rota de lançamento com argv[] e modo externo
- Backlog: B-014
- Spec: .specs/20260907-008-preflight-e-lancamento.md
- Result: `relay-host/src/launcher.ts` com `preview` e `launch`. `launch` grava
  um script wrapper em área de scratch (tmpdir/relay-run/<id>), com cada
  elemento do argv entre aspas simples, `echo $$ > pid` e `echo $? > exit`
  gravados pelo próprio script, e abre via `open -a <emulador>` (spawn com
  argv, sem shell). `server.ts` registra `POST /api/launch` e
  `POST /api/launch/preview`, presentes só quando `execEnabled` — sob
  `--no-exec`, requisição autenticada devolve `404`, não `403`.
- Evidence: `tsc --noEmit` limpo; 15 testes passam, incluindo os novos de
  `launcher.test.ts` (script wrapper, shellQuote, preview==launch) e o de
  integração (preview compõe `claude`/`-p`/`/relay-session …`, launch devolve
  runId, harness desconhecido → 400). `grep` por `exec(`, `shell: true`,
  `sh -c`, `bash -c` em `relay-host/src` retorna vazio.
- Criteria: A-001, A-005
- Decisions: modo externo é o único lançamento nesta spec (o embutido é a spec
  009); o emulador é detectado entre Terminal/iTerm/Ghostty/Warp no macOS e o
  `open` é chamado com argv. O script É o argv, nunca `sh -c`.

## 2026-09-07 - T-001 - Adaptador de harness: buildArgv e composePrompt
- Backlog: B-014
- Spec: .specs/20260907-008-preflight-e-lancamento.md
- Result: `relay-host/src/harness.ts` ganhou `launchArgs` e `promptPrefix` por
  harness e as duas funções separadas que a spec exige: `composePrompt(harness,
  skill, intent)` (claude `/relay-session`, codex `⟨relay-session⟩`, opencode
  `Use relay-session`) e `buildLaunchArgv(harness, skill, intent, cwd)`
  devolvendo `{ bin, args, prompt, cwd }`. Nenhum prefixo contém `--skill`.
- Evidence: `tsc --noEmit` limpo no relay-host; os três prefixos conferem com
  o design system (seção 6) e com `docs/INSTALL.md` (opencode invoca skill por
  linguagem natural, sem slash command).
- Criteria: none
- Decisions: o prompt composto é um único elemento de argv (o último), nunca
  dividido em flag; `buildArgv` e `composePrompt` separados é o que torna
  impossível reintroduzir a suposição do `--skill`.

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

## 2026-09-07 - T-001 - ADR-0004 da fronteira do app/
- Backlog: B-002
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: ADR-0004 escrita com seis decisoes: contencao num unico diretorio,
  sem package.json na raiz, sem passo de build obrigatorio, instrucoes proprias
  da pasta, a terceira camada declarada (superficie de pacote / produto /
  ferramenta deste repo), e a proibicao de escrever nos cinco registros.
- Evidence: seis secoes obrigatorias do formato de ADR presentes; a decisao 3
  registra explicitamente que trata de obrigatoriedade e nao de veto ao
  framework, para nao prejulgar a ADR-0005.
- Decisions: a estrutura fica separada do framework porque sobrevive a troca
  dele; a ADR-0005 pode revisar apenas a decisao 3.

## 2026-09-07 - T-002 - Estrutura criada e garantias verificadas
- Backlog: B-002
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: criados app/package.json (private, workspaces relay-*), app/AGENTS.md
  e o symlink app/CLAUDE.md. relay-ui/ nao foi criado: diretorio vazio nao e
  versionavel e nasce em B-004, com conteudo.
- Evidence: as seis conformidades da ADR-0004 verificadas por comando, nao por
  leitura. Num clone limpo com rm -rf app/: skills intactas, manifestos
  intactos, symlinks de skill resolvendo, guarda ainda executavel. app/CLAUDE.md
  gravado com modo 120000. Nenhum arquivo fora de app/ resolve caminho para
  dentro dele.
- Decisions: a Conformidade 3 estava imprecisa — dizia "depende" e o teste
  pegou mencoes em prosa. Reescrita para "resolve um caminho": link, import,
  symlink, manifesto ou script. Prosa que cita app/ nao e dependencia.

## 2026-09-07 - T-003 - ADR-0004 no indice e ponteiro no roteador
- Backlog: B-002
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: ADR-0004 registrada no indice de ADRs e uma linha acrescentada a
  tabela de roteamento do AGENTS.md apontando para app/.
- Evidence: indice lista 0001 a 0004; a tabela ganhou exatamente uma linha; o
  arquivo referenciado existe.
- Decisions: nenhuma.

## 2026-09-07 - T-001 - ADR-0005 do framework da relay-ui
- Backlog: B-003
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: Vue 3 escolhido; Lit, Preact e React+Vite descartados com o motivo de
  cada um. Registrado que o custo de migracao foi considerado e descartado como
  criterio, e por que o raciocinio "invista pouco porque e descartavel" estava
  errado em duas frentes.
- Evidence: seis secoes obrigatorias presentes; a decisao 1 cita a secao 8 do
  design system, que pede CSS global com classe por componente e derruba o
  argumento de shadow DOM que sustentava o Lit.
- Decisions: autoria em SFC com TypeScript, porque a garantia da ADR-0003 sobre
  `inconsistent` e do compilador; sem checagem de tipo na UI ela vira convencao.
  JSDoc com --checkJs foi considerado e descartado por custo ergonomico.

## 2026-09-07 - T-002 - ADR-0004 decisao 3 estreitada
- Backlog: B-003
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: a decisao 3 da ADR-0004 passou de "sem passo de build obrigatorio"
  para "sem passo de build entre o clone e as skills". app/ tem o proprio build.
- Evidence: a cadeia esta visivel nos dois sentidos — 0004 aponta para 0005 na
  nota de estreitamento e nas consequencias; 0005 aponta para 0004 na decisao 5
  e nas notas. Nada foi deletado.
- Decisions: estreitar, nao remover. O proposito da decisao original era
  proteger a instalacao das skills, e essa garantia continua intacta e
  verificavel; so a redacao excessiva caiu.

## 2026-09-07 - T-003 - ADR-0005 no indice
- Backlog: B-003
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: ADR-0005 registrada no indice de ADRs do AGENTS.md.
- Evidence: indice lista 0001 a 0005; todos os arquivos citados existem.
- Decisions: nenhuma.

## 2026-09-07 - T-001 - Templates de spec e changelog
- Backlog: B-005
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: criterios de aceite passaram a `A-NNN` sem marcador de checklist, com
  uma secao nova explicando que satisfacao e derivada do changelog e nunca
  escrita na spec. O registro de changelog ganhou o campo `Criteria`.
- Evidence: template de spec e de changelog atualizados em docs/PROTOCOL.md; a
  secao registra que specs com marcador continuam validas e nao sao reescritas.
- Criteria: A-001, A-002, A-007
- Decisions: o marcador foi omitido de proposito. Um `[ ]` num criterio le-se
  como pendencia que vai fechar, quando nada no protocolo o fecha — foi ele que
  permitiu marcar B-001 concluida com oito criterios aparentemente abertos.

## 2026-09-07 - T-002 - Transicoes e verificacao de integridade
- Backlog: B-005
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: transicao 4 exige que `Criteria` nomeie os criterios avancados ou
  declare `none`; transicao 5 recusa fechar a ultima entrada de backlog de uma
  spec quando algum criterio dela nao tem evidencia, com `[!]` e handoff
  bloqueado nomeando quais faltam. Verificacao de integridade nova.
- Evidence: o protocolo passou de 12 para 13 verificacoes; a transicao 5 usa o
  caminho de rejeicao que ja existia, sem status novo.
- Criteria: A-003, A-004
- Decisions: `none` e afirmacao como qualquer outra e precisa ser verdadeira —
  sem isso o campo vira carimbo.

## 2026-09-07 - T-003 - Identificador estavel da verificacao nova
- Backlog: B-005
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: `criteria-without-evidence` acrescentado a tabela da ADR-0003 na mesma
  mudanca, como a Conformidade 7 exige.
- Evidence: script conferiu 13 verificacoes no protocolo e 13 identificadores na
  ADR-0003.
- Criteria: A-005
- Decisions: as tres mencoes a "doze verificacoes" na ADR-0003 foram trocadas
  por formulacao sem contagem, e a Conformidade 7 passou a proibir declarar um
  total. Contagem em prosa apodrece a cada verificacao nova — esta mudanca ja a
  teria quebrado.

## 2026-09-07 - T-001 - Skills alinhadas ao contrato
- Backlog: B-006
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: relay-spec passou a escrever criterios como `A-NNN` sem marcador;
  relay-session passou a exigir `Criteria` no registro e a confirmar que todo
  criterio da spec tem evidencia antes de fechar a ultima entrada de backlog
  dela; relay-status passou a tratar a ausencia disso como `inconsistent`.
- Evidence: as tres skills citam o contrato novo; a regra da transicao 5 esta em
  relay-session linha 35.
- Criteria: A-006
- Decisions: nenhuma skill nova. As tres mudancas cabem nas existentes, o que
  mantem o registro de cinco skills que a instalacao ja documenta.

## 2026-09-07 - T-002 - Limites e vocabulario verificados
- Backlog: B-006
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: as cinco skills voltaram a ficar abaixo de 40 linhas apos a expansao,
  por compressao de paragrafos anteriores em relay-spec e relay-session.
- Evidence: contagem por arquivo — continue 39, session 39, setup 39, spec 39,
  status 29. Nenhuma linha de prosa larga introduzida, medido contra HEAD em
  caracteres e nao em bytes. Frontmatter intacto nas cinco. Nenhum resquicio de
  `unblocked` nem de contagem em prosa.
- Criteria: A-006
- Decisions: a expansao custou seis linhas e foram todas recuperadas cortando
  redundancia, nao conteudo — o limite forcou concisao em texto que ja estava
  prolixo.

## 2026-09-07 - T-001 - Spec 20260907-001 convertida
- Backlog: B-007
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: os oito criterios da spec da UI passaram de checkbox para A-001..A-008
  sem marcador. O A-003 foi reescrito para dizer "existem **como arquivos**",
  porque a redacao anterior era ambigua o bastante para eu ter marcado como
  satisfeito o que esta so descrito numa tabela de ADR.
- Evidence: a secao Acceptance criteria da spec 001 usa A-NNN sem marcador; o
  formato bate com o template novo em docs/PROTOCOL.md.
- Criteria: A-008
- Decisions: converter tambem serviu de teste do template. A ambiguidade do
  A-003 so apareceu quando precisei decidir se ele estava satisfeito — que e
  exatamente o efeito pretendido pela mudanca de B-005.

## 2026-09-07 - T-002 - Evidencia reconciliada para a spec da UI
- Backlog: B-007
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: atribuida evidencia retroativa aos criterios da spec 20260907-001 que
  o trabalho ja concluido de fato satisfez, por registro novo. Nenhum registro
  passado foi editado: o CHANGELOG e append-only.
- Evidence: da spec 20260907-001 — A-001, A-002 e A-006 verificados por comando
  em clone limpo durante B-002; A-007 pelas tres ADRs no indice; A-008 pela
  linha unica no roteador. Ficam SEM evidencia A-003, A-004 e A-005, todos
  dependentes de B-004.
- Criteria: A-008
- Decisions: A-003 foi examinado e considerado NAO satisfeito. Os sete fixtures
  existem na ADR-0003 como dois JSON completos mais uma tabela descrevendo os
  outros cinco; como arquivos, nao existem. Era tentador contar como pronto, e
  a regra nova e justamente o que obrigou o exame.

## 2026-09-07 - T-001 - Qualificacao de criterio entre specs
- Backlog: B-008
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: docs/PROTOCOL.md agora resolve `A-NNN` por contexto — ID sem prefixo
  pertence a spec do proprio `Spec:` do registro; criterio de outra spec usa
  `YYYYMMDD-NNN/A-NNN`. relay-session atualizado.
- Evidence: secao Acceptance criteria do protocolo tem a regra; skill cita o
  formato qualificado. Todas as cinco skills abaixo de 40 linhas.
- Criteria: A-009
- Decisions: nenhuma.

## 2026-09-07 - T-002 - Registros de B-007 corrigidos por acrescimo
- Backlog: B-008
- Spec: .specs/20260907-002-evidencia-nomeia-criterio.md
- Result: os dois registros de B-007 diziam `Criteria: A-008` sob
  `Spec: ...002` referindo-se na verdade a criterios da spec 001. Correcao:
  aqueles IDs devem ser lidos como `20260907-001/A-008` — CHANGELOG e
  append-only, entao a leitura correta fica registrada aqui, nao editada la.
- Evidence: com a qualificacao, a spec 001 (4 entradas, B-004 pendente) segue
  sem gatilhar `criteria-without-evidence`; a spec 002 (todas [x]) tem A-001 a
  A-009 todos nomeados, a maioria sem qualificador porque pertencem a ela mesma.
- Criteria: 20260907-001/A-008
- Decisions: defeito nasceu de eu mesmo escrever `Criteria: A-008` sem
  qualificar enquanto documentava trabalho de outra spec — o proprio uso da
  regra nova expos o buraco nela.

## 2026-09-07 - T-001 - Sete fixtures materializados em disco
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: os sete fixtures normativos da ADR-0003 passaram a existir como
  arquivos sob `app/fixtures/` — `idle.json`, `backlog.json`, `ready.json`,
  `in_progress.json`, `blocked.json`, `done.json` e `inconsistent.json`.
  Os blocos `in_progress` e `inconsistent` são os dois JSON normativos da ADR;
  os outros cinco foram derivados da tabela de fixtures e do tipo `UiPayload`.
- Evidence: os sete arquivos parseiam com `JSON.parse`; cada um segue o
  `UiPayload` — `ok` carrega `status`, `handoff`, `todo`, `backlog`,
  `completed` e `total`; `inconsistent` não carrega `status`, `handoff`, `todo`
  nem `backlog`, e `violations` não é vazio (decisão 2 da ADR-0003 valendo).
- Criteria: A-003
- Decisions: o `done` é a forma de conclusão — backlog todo `[x]`, TODO e
  handoff vazios — e cai na tela Escolher com estado vazio, já que o design
  system não lhe atribui tela própria.

## 2026-09-07 - T-002 - tokens.css e app.css derivados do design system
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: `app/relay-ui/src/styles/tokens.css` com todos os tokens de cor
  (seção 2), espaçamento e raio (seção 5) e tipografia (seção 4) do design
  system; `app.css` global com as classes por componente (`status-pill`,
  `handoff-card`, `header`, `checklist`, `repair`, `empty-state`) e estados em
  sufixo, consumindo apenas `var(--token)`.
- Evidence: `grep` por `#hex` e `rgba(` em `app.css` retorna vazio — nenhum
  literal fora de `tokens.css`. O mapeamento status→tom (seção 3) vive nas
  classes de modificador e referencia os tokens sem cor literal.
- Criteria: A-005
- Decisions: tipografia também foi tokenizada (`--size-*`, `--weight-*`,
  `--font-*`), e não só cor/espaçamento/raio, para que nenhum valor literal
  precise morar em `app.css`.

## 2026-09-07 - T-003 - Scaffold da relay-ui
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: `app/relay-ui/` com `package.json`, `vite.config.ts` (alias `@` e
  `@fixtures`), `tsconfig.json`, `index.html` (fontes do design system),
  `src/main.ts`, `src/env.d.ts`, `src/types.ts` (tipos da ADR-0003) e
  `src/fixtures.ts` carregando os sete JSON. `main.ts` importa `tokens.css` e
  `app.css`.
- Evidence: `npm install` concluído na raiz do workspace `app/`; `npm run
  typecheck` (vue-tsc --noEmit) passa limpo. `node_modules/` e `dist/` já
  cobertos pelo `.gitignore`.
- Criteria: A-004
- Decisions: nenhum router nem biblioteca de estado — a ADR-0005 deixou ambos
  indecisos de propósito. O alternador de fixture usa um `ref` simples.

## 2026-09-07 - T-004 - Tela principal renderiza os sete fixtures
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: componentes `Header`, `StatusPill`, `HandoffCard`, `ChecklistList`,
  `EmptyState`, `RepairScreen` e `MainScreen`. `App.vue` troca o `UiPayload`
  inteiro por um alternador de fixture; o mesmo `MainScreen` renderiza os sete
  estados — Retomar (`in_progress`, `blocked`), Escolher (`ready`, `backlog`,
  `idle`, `done`) e Reparar (`inconsistent`).
- Evidence: `npm run build` (vue-tsc + vite build) passa limpo; dev server
  serviu `index.html`, `main.ts` e resolveu os sete JSON de `app/fixtures/`
  via alias (HTTP 200). Nenhum componente calcula `available`, status ou
  contagem — tudo chega pronto no `UiPayload`; tempo relativo é formatado na
  view via `formatRelative`.
- Criteria: A-004
- Decisions: o mapeamento status→tela mora no `MainScreen` como apresentação
  (seção 5 do design system), não como lógica de protocolo — a ADR-0003 decisão
  6 tira tom/tela do contrato, e a view devolve esse mapeamento na hora de
  desenhar.

## 2026-09-07 - T-005 - Verificação dos critérios A-003, A-004 e A-005
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: os três critérios restantes da spec 20260907-001 verificados por
  comando. A-003: sete arquivos de fixture em `app/fixtures/`. A-004: build e
  typecheck passam e o dev server resolve os sete JSON via alias. A-005:
  nenhum literal de cor, tamanho ou raio fora do `tokens.css` (os tamanhos
  `1px`, `32px`, `36px`, `1280px` e `50%` foram tokenizados em
  `--border-width`, `--control-height*`, `--container-width` e
  `--radius-round`).
- Evidence: `ls app/fixtures/*.json | wc -l` = 7; `grep` de `#hex`/`rgba(`/
  `px`/`%` em `app/relay-ui/src` e `index.html` retorna vazio; `grep` de
  `fs.`/`writeFile` em `app/` retorna vazio (A-006 re-confirmado);
  `vue-tsc --noEmit` e `vite build` passam limpos.
- Criteria: A-003, A-004, A-005
- Decisions: tamanhos entram na regra de A-005 — a seção 8 do design system
  proíbe "tamanhos literais", não só cor/espaçamento/raio, então largura do
  container, alturas de controle e largura de borda também viraram token.

## 2026-09-07 - T-006 - Critérios remanescentes da spec 001 nomeados
- Backlog: B-004
- Spec: .specs/20260907-001-ui-primeiro-marco-visual.md
- Result: os critérios A-001, A-002, A-006 e A-007 da spec 001 — satisfeitos
  pelo trabalho de B-002 mas nunca nomeados num campo `Criteria` — ganham o
  registro que a transição 5 exige para fechar a spec.
- Evidence: A-001 (instalação sem `npm install`) e A-002 (`rm -rf app/`
  restaura o estado) foram verificados por comando num clone limpo durante
  B-002 (changelog B-002/T-002); A-006 (nenhum arquivo de `app/` escreve nos
  registros) confirmado por `grep` sem acesso a `fs`; A-007 pelas três ADRs
  (0003, 0004, 0005) no índice.
- Criteria: A-001, A-002, A-006, A-007
- Decisions: a evidência existia desde B-002; o B-007/T-002 pretendia
  nomeá-la retroativamente mas gravou apenas `A-008`. Faltava só o campo
  `Criteria`, não o trabalho.

## 2026-09-07 - T-001 - Proveniencia propria em Criteria
- Backlog: B-009
- Spec: .specs/20260907-003-criterio-autoevidenciado.md
- Result: docs/PROTOCOL.md ganhou a regra de que um registro so nomeia em
  Criteria o que o proprio Result/Evidence demonstra, nunca em antecipacao.
  relay-session espelha a regra na mesma frase que ja trata Criteria.
- Evidence: nenhuma linha de prosa larga nova introduzida; nenhuma skill
  excede as demais em linhas apos a mudanca (session: 40, as outras: 39/39/39/29).
- Criteria: A-001, A-002, A-003
- Decisions: regra de disciplina, sem verificacao mecanica — o proprio scope
  descartou isso, porque nada no protocolo consegue julgar prosa contra
  significado. Mesma familia da regra ja existente sobre Criteria: none.

## 2026-09-07 - T-001 - Pacote relay-core e types do contrato
- Backlog: B-010
- Spec: .specs/20260907-004-relay-core.md
- Result: criado `app/relay-core/` com `package.json` (type module, scripts
  `test`/`typecheck`), `tsconfig.json` (NodeNext estrito, sem emit) e
  `src/types.ts` com os tipos da ADR-0003: `RelayFiles`, `RelayState`
  (ok/inconsistent), `ChecklistEntry`, `Handoff`, `Violation`, `Environment`
  e `UiPayload`.
- Evidence: `tsc --noEmit -p relay-core/tsconfig.json` limpo; workspace
  `relay-*` reconhece o pacote sem tocar na raiz do repositorio.
- Criteria: A-005
- Decisions: Node >=24 com type stripping nativo dispensa passo de build no
  pacote; testes usam `node:test` — zero dependencia de framework de teste.
  Os types passam a morar no core; a relay-ui so migra na spec 007.

## 2026-09-07 - T-002 - Parser por linha dos cinco registros
- Backlog: B-010
- Spec: .specs/20260907-004-relay-core.md
- Result: `parse.ts` le por linha: checklist (marcador, id, texto, `spec`,
  `needs`), header do TODO (`Active task`), handoff (campos chave-valor mais
  secoes Objective/Next step/Context), changelog (registros com
  Backlog/Spec/Criteria) e criterios `A-NNN` de uma spec.
- Evidence: exercitado pelos testes de fixture (cada um dos cinco registros
  e parseado); nenhum import de biblioteca de AST de Markdown.
- Criteria: none
- Decisions: a gramatica e simples e inteiramente especificada no
  `docs/PROTOCOL.md`; regex por linha, sem parser generico (decisao da spec).

## 2026-09-07 - T-003 - deriveState: status, available, contador e handoff
- Backlog: B-010
- Spec: .specs/20260907-004-relay-core.md
- Result: `derive.ts` deriva os seis status mais `inconsistent`;
  `available` = marker ` ` e todo `needs` em `[x]`; `completed`/`total`
  contam apenas as subtarefas do TODO ativo; o handoff publico nao carrega
  `status` (ADR-0003 decisao 5).
- Evidence: os sete fixtures passam como golden files; a disponibilidade dos
  fixtures `backlog`/`ready` confere com a secao `## Dependencies`.
- Criteria: A-003
- Decisions: ordem de derivacao — handoff (`in_progress`/`blocked`) primeiro;
  depois TODO (`ready`, `done` ou `blocked` quando nada esta disponivel,
  conforme a secao Dependencies); depois backlog (`backlog`/`done`); senao
  `idle`.

## 2026-09-07 - T-004 - As 13 verificacoes de integridade
- Backlog: B-010
- Spec: .specs/20260907-004-relay-core.md
- Result: `integrity.ts` implementa as 13 verificacoes do protocolo, cada uma
  produzindo uma `Violation` com o `check` estavel exato da tabela da
  ADR-0003, na mesma ordem.
- Evidence: 13 testes individuais, um por `check`, cada um disparando so a
  violacao esperada; entrada valida nao produz violacao nenhuma.
- Criteria: A-002
- Decisions: verificacoes rodam antes de derivar status — qualquer violacao
  vira `inconsistent`, nunca um status de trabalho (ADR-0003 decisao 2).

## 2026-09-07 - T-005 - Golden files e pureza do pacote
- Backlog: B-010
- Spec: .specs/20260907-004-relay-core.md
- Result: testes de golden file comparam `deriveState` byte a byte contra os
  sete fixtures de `app/fixtures/`; teste de pureza verifica que `src/` nao
  importa `node:*` nem referencia `relay-host`.
- Evidence: `node --test` 23/23 passando; `grep node: relay-core/src/` e
  `grep relay-host relay-core/src/` vazios.
- Criteria: A-001, A-004
- Decisions: fixtures como teste ativo (o gap que a revisao de B-004 achou);
  o teste de pureza e o guardiao permanente da Conformidade 1 da ADR-0003.

## 2026-09-07 - T-001 - ADR-0006 do contrato HTTP/WS
- Backlog: B-011
- Spec: .specs/20260907-005-relay-host.md
- Result: `docs/adr/0006-contrato-http-ws-do-relay-host.md` escrita antes de
  qualquer codigo: bind em 127.0.0.1 em porta efemera, token aleatorio por
  execucao entregue no HTML inicial (nunca em URL/query; no WS, via
  subprotocol), same-origin em toda rota de API com `GET /` como unico
  bootstrap, rotas de conteudo bruto para a segunda visao, rota de lancamento
  reservada (spec 008) e ausente sob `--no-exec`, e watcher de diretorio
  inteiro empurrando `UiPayload` via WS.
- Evidence: ADR com sete conformidades verificaveis; indice do AGENTS.md
  atualizado; `Sec-Fetch-Site`/token/teste 404 documentados como contratos.
- Criteria: A-001
- Decisions: token no WS via subprotocol em vez de query string, porque a
  decisao da spec "nunca em URL/query" nao cabe no handshake de browser.

## 2026-09-07 - T-002 - Pacote relay-host consumindo relay-core
- Backlog: B-011
- Spec: .specs/20260907-005-relay-host.md
- Result: `app/relay-host/` criado (package.json, tsconfig NodeNext), com
  `relay-core` como dependencia de workspace (exports para `src/index.ts`) e
  `ws` como unica dependencia de runtime.
- Evidence: `tsc --noEmit` limpo; `npm install` ligou o workspace; `ws` e
  `@types/ws` registrados no lockfile.
- Criteria: A-007
- Decisions: relay-core consome Node 24 type stripping nativo — exports para
  `.ts`, sem passo de build entre pacotes do workspace.

## 2026-09-07 - T-003 - Leitor do workspace, state e deteccao de harness
- Backlog: B-011
- Spec: .specs/20260907-005-relay-host.md
- Result: `reader.ts` monta `RelayFiles` dos cinco registros e specs;
  `state.ts` importa `deriveState` de `relay-core` e monta o `UiPayload`;
  `harness.ts` detecta Claude Code, Codex e OpenCode (versao via `--version`,
  estado instalado/nao autenticado/ausente por presenca de artefatos de
  config no home).
- Evidence: smoke test de ponta a ponta sobre este repositorio derivou o
  estado real; `grep` confirma que nenhum parse de protocolo existe no host.
- Criteria: A-006
- Decisions: deteccao de autenticacao e heuristica (presenca de arquivos de
  config no home); refinada quando os tres CLIs mudarem.

## 2026-09-07 - T-004 - HttpServer em 127.0.0.1 com token, same-origin e 404 da rota de lancamento
- Backlog: B-011
- Spec: .specs/20260907-005-relay-host.md
- Result: `server.ts` sobe HTTP+WS em `127.0.0.1` em porta efemera; toda rota
  `/api/*` exige `Sec-Fetch-Site: same-origin` + `X-Relay-Token` (403 se
  faltar); `GET /` e o bootstrap; rotas `state`, `specs`, `specs/:id`,
  `changelog` e `harnesses`; rota de lancamento nao existe (autenticada devolve
  404, nao 403), inclusive sob `--no-exec`.
- Evidence: testes de integracao: bind 127.0.0.1, 403 sem token/origem, 404 de
  `/api/launch` com e sem `--no-exec`.
- Criteria: A-002, A-003, A-004
- Decisions: `server.closeAllConnections()` no close para nao prender o
  processo com conexoes keep-alive do fetch.

## 2026-09-07 - T-005 - Watcher de diretorios e push via WebSocket
- Backlog: B-011
- Spec: .specs/20260907-005-relay-host.md
- Result: `watcher.ts` observa `.orchestration/` e `.specs/` inteiros e chama
  `broadcast()`; o WebSocket entrega o `UiPayload` na conexao e a cada mudanca,
  sem recarregar a pagina.
- Evidence: teste de integracao escreve em `.orchestration/TODO.md` e recebe
  pela WS o estado novo (activeBacklogId e todo atualizados).
- Criteria: A-005
- Decisions: re-derivar tudo a cada toque e barato (registros pequenos);
  debounce de 40ms para coalescer eventos do `fs.watch`.

## 2026-09-07 - T-001 - Host serve a UI construida com as metas de bootstrap
- Backlog: B-013
- Spec: .specs/20260907-007-dado-real-e-segunda-visao.md
- Result: `server.ts` passou a servir `app/relay-ui/dist/index.html` no `GET /`
  com as metas `relay-token`, `relay-workspace` e `relay-exec-enabled` injetadas
  no `<head>`, e os assets estáticos de `/assets/*` com MIME por extensão; o
  fallback para o `bootstrapHtml` antigo permanece quando a dist não existe.
- Evidence: smoke test de ponta a ponta — host rodando serve a UI construída
  com as três metas no HTML e o asset JS responde `200 text/javascript`. Teste
  de integração novo em `server.test.ts` (metas presentes + cada asset
  referenciado responde 200). Testes do host seguem 9/9.
- Criteria: none
- Decisions: servir a dist decidido aqui (ADR-0006 deixou a forma de servir o
  HTML como assunto da spec 007); metas no HTML preservam o bootstrap do token
  sem rota de API extra. O componente `PreflightModal` mínimo nasce junto para
  a porta "+ nova spec"; o modal completo com argv e launch é a spec 008.

## 2026-09-07 - T-002 - Cliente WebSocket com reconexão e backoff
- Backlog: B-013
- Spec: .specs/20260907-007-dado-real-e-segunda-visao.md
- Result: `src/lib/relay-client.ts` conecta ao `ws://host/ws` com subprotocol
  `relay.<token>`, expõe `payload`/`connected` reativos e reconecta com backoff
  exponencial (500ms → 10s), relendo o token do bootstrap a cada tentativa
  (token é por execução do host). `App.vue` usa o cliente e renderiza o
  `UiPayload` real; sem host (modo fixture), não conecta.
- Evidence: `npm run build` e `vue-tsc` limpos; a lógica de refresh de token no
  reconnect cobre "matar e religar o host" sem recarregar a página. Cliente WS
  com mesma origem + subprotocol validado pelo teste de integração do host.
- Criteria: A-001, A-002
- Decisions: token lido de novo a cada tentativa porque o host regenera o token
  por execução; reconectar com token velho falharia para sempre após restart.

## 2026-09-07 - T-003 - Segunda visão: três colunas e PreflightModal
- Backlog: B-013
- Spec: .specs/20260907-007-dado-real-e-segunda-visao.md
- Result: `WorkScreen.vue` com três colunas simultâneas — Specs (lista de
  `GET /api/specs`, com contagem de tarefas), Backlog (filtrado do próprio
  `RelayState.backlog` pelo campo `spec` da entrada selecionada, sem rota
  nova) e Changelog (`GET /api/changelog`). Porta "+ nova spec" no cabeçalho da
  coluna Specs abrindo o `PreflightModal` mínimo; nenhum dos três componentes
  emite requisição de escrita.
- Evidence: a coluna do meio reusa `payload.state.backlog` filtrado por
  `spec === '.specs/<id>'`; a coluna de specs e a de changelog usam só `GET`
  (`grep fetch` em WorkScreen retorna apenas `/api/specs` e `/api/changelog`).
  `WorkScreen` re-busca specs e changelog a cada mudança de `payload` (watch),
  então uma escrita em disco que o watcher empurra pela WS re-renderiza as duas
  visões sem recarregar. Typecheck e build limpos.
- Criteria: A-004, A-006, A-007
- Decisions: backlog reaproveitado e não duplicado (decisão da spec); o
  PreflightModal aqui é o shell da porta — argv, launch e dados reais são a
  spec 008, e a coluna nunca escreve por conta própria (ADR-0001 ponto 5).

## 2026-09-07 - T-004 - Abas Agora/Trabalho no Header e App
- Backlog: B-013
- Spec: .specs/20260907-007-dado-real-e-segunda-visao.md
- Result: `Header.vue` passou a receber `view` e emitir `update:view`, com as
  abas Agora/Trabalho alternando entre `MainScreen` e `WorkScreen` no `App.vue`
  (ref local, sem roteamento). O `MainScreen` deixou de renderizar Header e
  HarnessSelector, que subiram para o `App` — onde o seletor e o alternador de
  abas ficam disponíveis nas duas visões.
- Evidence: alternância é um `ref` em `App.vue`; build e typecheck limpos. A
  aba Trabalho mostra as três colunas do `WorkScreen` (T-003) e selecionar uma
  spec filtra a coluna do meio.
- Criteria: A-003
- Decisions: roteamento client-side não entra (ADR-0005 deixou em aberto); a
  segunda visão é alcançada por abas, como o design system descreve.

## 2026-09-07 - T-005 - Seletor de fixture restrito a rota de desenvolvimento
- Backlog: B-013
- Spec: .specs/20260907-007-dado-real-e-segunda-visao.md
- Result: o alternador de fixtures só aparece no modo fixture — quando não há
  `relay-token` no HTML (dev server) ou quando a URL traz `?fixtures`. Servido
  pelo host, o seletor não aparece por padrão; continua existindo para trabalho
  de componente sem `relay-host` rodando.
- Evidence: `App.vue` computa `fixtureMode` de `!hostMode || ?fixtures`; com o
  host servindo a UI (smoke test), o HTML não traz o alternador. Build limpo.
- Criteria: A-005
- Decisions: `?fixtures` é a rota de desenvolvimento explícita; em dev server
  sem host, o fixture é o padrão natural.

## 2026-09-07 - T-001 - Infra de harness: tipos, fixture, tons e store de selecao/consentimento
- Backlog: B-012
- Spec: .specs/20260907-006-refinamento-visual-prototipo.md
- Result: `app/relay-ui/src/lib/harness.ts` com os tipos `Harness` e
  `ConsentLevel`, a fixture de deteccao (claude-code, codex, opencode), os
  tons de identidade (`--purple` para codex, `--orange` para claude-code,
  neutro para os demais), helpers (`harnessById`, `harnessInitials`,
  `harnessTone`) e o store reativo de selecao + consentimento com persistencia
  por escopo: `none` (nada grava), `session` (Map em memoria), `local`
  (localStorage chaveado por workspace).
- Evidence: `npm run typecheck` limpo; o store so toca `localStorage`, nunca
  `fs` — `grep fs. app/relay-ui/src/lib/harness.ts` vazio; nenhum arquivo novo
  em disco alem do proprio modulo. `--orange` faltava em `tokens.css` e foi
  alinhado ao README do design system (que ja o declara), sem decisao nova.
- Criteria: A-005
- Decisions: consentimento e estado do navegador, nao do protocolo; nada de
  escrita em arquivo, e nenhum nivel remove clique de confirmacao de preflight
  (preflight e da spec 008).

## 2026-09-07 - T-002 - HandoffCard refinado
- Backlog: B-012
- Spec: .specs/20260907-006-refinamento-visual-prototipo.md
- Result: `HandoffCard` passou a renderizar avatar com as iniciais do harness
  (ton de identidade ou neutro), timestamp absoluto junto do relativo e dos IDs
  numa linha mono, rotulo `OBJETIVO · B / T`, corpo em duas colunas (Proximo
  passo / Contexto deixado), caminho da spec no rodape e botao primario
  nomeando o harness (`▶ Retomar T-002 no {harness}`) mais o secundario
  "Trocar harness" abrindo o seletor.
- Evidence: fixture `in_progress` renderiza avatar CC, "B-001 / T-002 ·
  2026-09-07 06:49", colunas e botao "Retomar T-002 no Claude Code"; fixture
  `blocked` (escrito por opencode, ausente) cai no primeiro harness disponivel,
  nao num ausente. `npm run build` limpo.
- Criteria: A-001
- Decisions: nenhuma decisao visual nova — layout e rotulos vieram do
  `docs/design-system/README.md` (secao 6, HandoffCard).

## 2026-09-07 - T-003 - ChecklistList com rotulos textuais e contador
- Backlog: B-012
- Spec: .specs/20260907-006-refinamento-visual-prototipo.md
- Result: `ChecklistList` ganhou rotulo textual por marcador (Feito / Em
  execucao / Bloqueado / Pendente), destaque de fundo na linha `[•]` ativa e o
  contador verdadeiro "N de M concluidas" no cabecalho da lista, nunca
  percentual.
- Evidence: fixture `in_progress` mostra "1 de 3 concluidas" e a linha T-002
  `[•]` com fundo `--green-soft`; fixture `blocked` mostra T-003 `[!]` como
  Bloqueado. `npm run build` limpo.
- Criteria: A-002
- Decisions: contador e cabecalho da lista (nao dentro do card), como manda o
  design system; sem percentual nem posicao.

## 2026-09-07 - T-005 - Seletor de harness e consentimento
- Backlog: B-012
- Spec: .specs/20260907-006-refinamento-visual-prototipo.md
- Result: componente `HarnessSelector` (overlay standalone) lista os harnesses
  da fixture com nome, versao e estado, cada um com ton de identidade de
  `--purple`/`--orange` (ausente fica neutro e desabilitado); tres niveis de
  consentimento nomeados (So esta execucao / Enquanto a app estiver aberta /
  Sempre neste workspace); rodape que nomeia o escopo do nivel selecionado e
  muda junto com ele. Abre pelo selo do Header e pelo botao "Trocar harness".
- Evidence: `npm run build` limpo; selecionar "Sempre neste workspace" grava em
  `localStorage` (chave `relay.harness:<workspace>`); com "So esta execucao"
  marcado o rodape diz "Vale so para esta execucao; nada e gravado" e nenhum
  outro texto da tela promete gravacao. Nenhum componente pinta harness com
  `--blue`/`--green`/`--amber`.
- Criteria: A-004, A-006, A-007
- Decisions: tons de identidade no seletor e no selo vindo do mesmo
  `harnessTone()`; harness desabilitado (ausente) nao recebe tom; o seletor
  aqui e isolado — o preflight inline (spec 008) e que recebera este componente
  embutido.

## 2026-09-07 - T-004 - Header com abas e selo de harness
- Backlog: B-012
- Spec: .specs/20260907-006-refinamento-visual-prototipo.md
- Result: `Header` ganhou nome + caminho do workspace, abas Agora/Trabalho e um
  selo compacto do harness ativo (avatar com iniciais no tom de identidade,
  nome e escopo do consentimento) que abre o seletor ao clicar; StatusPill a
  direita. `MainScreen` renderiza o `HarnessSelector` e inicia o store com o
  workspace do payload.
- Evidence: `npm run typecheck` e `npm run build` limpos; o selo usa os mesmos
  helpers de ton do seletor, entao codex/claude-code aparecem em
  purple/orange e nenhum harness em blue/green/amber; a aba Trabalho fica
  desabilitada (a segunda visao de tres colunas e a spec 007, nao esta no
  escopo de B-012).
- Criteria: A-003
- Decisions: aba Trabalho presente mas desabilitada ate a spec 007 entregar a
  segunda visao; selo compacto conforme o design system (secao 6, Header).

# Change log

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

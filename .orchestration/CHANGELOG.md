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

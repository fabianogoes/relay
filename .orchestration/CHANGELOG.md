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

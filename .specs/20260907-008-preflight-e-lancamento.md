# 20260907-008 - Preflight e lançamento

## Problem

Não existe hoje nenhuma forma de lançar um harness pela UI. A ADR-0001
dedica boa parte da sua Conformidade a como isso precisa ser feito com
segurança, e nada disso está implementado.

## Scope

- `relay-host`: rota de lançamento, presente só quando **não** `--no-exec`,
  que inicia o processo com `argv[]` (nunca string de shell).
- Modo externo: `relay-host` escreve um script wrapper e pede ao emulador
  detectado para abri-lo; PID e exit code gravados pelo próprio script.
- Detecção de harness real (spec 005) alimentando o **Seletor de harness e
  consentimento** já construído na spec 006, agora com dado de verdade em
  vez de fixture.
- `PreflightModal`: tabela rotulada `bin` / `arg` / `prompt` / `cwd`, cada
  linha um elemento real do `argv` a lançar; campo `prompt` editável antes
  de confirmar; seletor de harness e consentimento embutido; aviso de
  execução; botão único de confirmação nomeando o harness.
- As quatro portas de lançamento chegando ao mesmo modal, mudando só título e
  `prompt` pré-preenchido: "+ nova spec" e "Iniciar entrevista" →
  "Especificar uma ideia"; "Começar" → "Iniciar sessão em {backlogId}";
  "Retomar" → "Retomar sessão".
- `composePrompt` por harness alimentando a linha `prompt`, separado de
  `buildArgv`; trocar o harness reescreve `bin`, `arg`, `prompt` e o rótulo
  do botão de confirmar na mesma ação.
- Dispensa sem lançamento: `Esc` e "Cancelar" no modal, clique fora no
  seletor standalone.

## Non-goals

- **Nenhum terminal embutido** — spec 009.
- **Nenhuma seleção automática de "melhor" harness** — o usuário sempre
  escolhe explicitamente (ADR-0001: preferência não é autorização).
- **Nenhuma fila ou retry automático** de lançamento — falha aparece, o
  usuário tenta de novo manualmente.

## Decisions

**Esta é a superfície de maior risco do projeto inteiro** — execução
arbitrária de processo. Todo critério de aceite abaixo mapeia direto a um
ponto de Conformidade da ADR-0001; nenhum é negociável na implementação.

**O preflight é sempre obrigatório, em todas as três opções de
consentimento** — decisão já registrada na spec 006, reafirmada aqui porque
é esta spec que implementa o botão que de fato lança o processo. Ler o
protótipo como "consentimento pula a confirmação" seria violar a
Conformidade 6 da ADR-0001; a leitura correta está na spec 006.

**`composePrompt` é requisito, não detalhe de implementação.** A navegação do
protótipo v2 mostra a forma correta já desenhada: para a mesma intenção, o
Claude Code recebe `claude -p "/relay-session …"` e o Codex recebe
`codex exec "⟨relay-session⟩ …"` — mesmo texto de intenção, prefixo de skill
próprio de cada CLI, nenhuma flag `--skill` (que não existe em nenhum dos
três). O adaptador precisa das duas funções separadas; juntá-las é o que
produziu a suposição do `--skill` no v1 (`ui-proposal.md`, seção 1.5).

**Script wrapper vive em área de scratch do Relay**, nunca em
`.orchestration/` nem `.specs/` — essas pastas são do protocolo, o script é
artefato de execução.

## Acceptance criteria

- A-001 - a rota de lançamento gera processos só via `argv[]`; buscar por
  `exec(`, `spawn(..., { shell: true })` ou concatenação em string de shell
  na implementação não encontra nada (ADR-0001 Conformidade 4)
- A-002 - `PreflightModal` renderiza uma linha por elemento real do
  processo (`bin`/`arg`/`prompt`/`cwd`), nunca uma string montada
  (ADR-0001 Conformidade 5)
- A-003 - sob `--no-exec`, a rota não existe (404) e o `PreflightModal`
  nunca é renderizado
- A-004 - lançar sempre exige confirmar o preflight, em qualquer nível de
  consentimento armazenado (ADR-0001 Conformidade 6)
- A-005 - o modo externo escreve um script wrapper e registra PID/exit code
  a partir do próprio script, nunca fazendo parse de saída do emulador
- A-006 - o seletor de harness e consentimento da spec 006 passa a mostrar
  dado real de detecção, sem mudança de forma
- A-007 - as quatro portas de lançamento abrem o mesmo `PreflightModal`,
  variando só título e `prompt` pré-preenchido; buscar na implementação por
  outra rota que chame o lançamento não encontra nenhuma
- A-008 - a linha `prompt` é composta por harness a partir de
  `composePrompt`, com `bin`/`arg` vindos de `buildArgv`; trocar o harness
  reescreve as quatro linhas e o rótulo do botão; nenhum `argv` gerado contém
  `--skill`
- A-009 - `Esc` e "Cancelar" fecham o modal sem lançar, e o seletor
  standalone fecha por clique fora; nenhum caminho de fechamento dispara
  processo

## Backlog candidates

- B-014: Lançamento via argv, PreflightModal com dado real
  (needs: B-011, B-012)

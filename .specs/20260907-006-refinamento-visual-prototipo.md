# 20260907-006 - Refinamento visual dos componentes contra o protótipo

## Problem

A implementação de B-004 segue o `README.md` à risca, mas o `README.md` era
mais magro que o protótipo em detalhe visual — sem layout de duas colunas no
`HandoffCard`, sem rótulo textual na checklist, sem o selo de harness no
header. O usuário revisou o protótipo (`claude-design-prototype-v2.html`) e
apontou concretamente essas diferenças; elas foram traduzidas para decisões
no `docs/design-system/README.md` nesta mesma sessão. Esta spec implementa o
que já está decidido lá — nenhuma decisão nova acontece aqui.

## Scope

- `HandoffCard`: avatar com iniciais do harness, timestamp absoluto junto do
  relativo, layout de duas colunas ("Próximo passo" / "Contexto deixado"),
  caminho da spec no rodapé, botão primário nomeando o harness.
- `ChecklistList`: rótulo textual por marcador (Feito/Em execução/Bloqueado/
  Pendente), linha `[•]` ativa com fundo destacado, contador "N de M" como
  rótulo do cabeçalho.
- `Header`: abas Agora/Trabalho, selo compacto de harness ativo.
- Componente novo **Seletor de harness e consentimento**: lista de harnesses
  detectados (contra fixture, não dado real ainda) e os três níveis de
  consentimento nomeados. Aberto pelo selo do Header e pelo botão "Trocar
  harness" do `HandoffCard`.
- Tom de identidade por harness vindo dos tokens (`--purple` Codex,
  `--orange` Claude Code), no selo do Header e na lista de harnesses.
- Rodapé do seletor mostrando o escopo do nível de consentimento
  **selecionado**, e não um texto fixo.

## Non-goals

- **Nenhuma decisão visual nova.** Tudo aqui já está no `README.md`; se a
  implementação encontrar ambiguidade, a correção é no README primeiro
  (seção 9, governança), não uma escolha silenciosa no componente.
- **Nenhum dado real de harness.** O seletor lista harnesses de fixture; a
  detecção real é da spec 005 (relay-host) — a spec 008 troca o dado.
- **Nenhuma persistência real de consentimento** além do que este componente
  guarda no próprio estado local do navegador (ver Decisions).
- **O consentimento não pula o preflight.** Ver a decisão abaixo — é a
  correção de um conflito real com a ADR-0001, não uma escolha de escopo.

## Decisions

**Conflito com a ADR-0001, resolvido a favor da regra já aceita.** O
protótipo rotula o seletor "por quanto tempo lançar **sem perguntar de
novo**", o que lido ao pé da letra colidiria com a Conformidade 6 da
ADR-0001: *"A escolha de qual harness usar pode ser local ao workspace; ela
não é consentimento para executar. O preflight continua obrigatório em toda
execução."* A leitura adotada: o consentimento controla se a **escolha de
harness** é lembrada (pula a pergunta "qual harness usar", pré-seleciona um),
nunca se o **PreflightModal** aparece ou se o clique de confirmação é
dispensado. O modal e o clique final são obrigatórios sempre, nas três
opções de consentimento, sem exceção.

**Dois achados da navegação do protótipo v2 entram como requisito.** Primeiro,
o rodapé do seletor lá é fixo — diz "gravado local" mesmo com "Só esta
execução · não grava" marcado, prometendo o contrário do que foi escolhido;
como o rodapé é a única confirmação textual do que será lembrado, ele tem de
acompanhar a seleção. Segundo, o protótipo pinta o Codex com `--blue` (o tom
que a seção 3 do design system reserva para `ready`/`backlog`/seleção) e o
Claude Code com `#e0865f`, fora de token; a decisão do `README.md` vence, e é
dela que a implementação sai. Nenhuma decisão nova: as duas estão registradas
no `README.md` (seções 2 e 6).

**Consentimento é estado do navegador, não do protocolo.** Os três níveis
mapeiam para: "não grava" → estado do componente, perdido ao fechar o modal;
"sessão" → uma store em memória, viva enquanto a aba está aberta; "gravado
local" → `localStorage`, chaveado pelo caminho do workspace. Nenhum arquivo
novo em disco, nenhuma escrita fora do que a ADR-0001 já permite — o
navegador guarda a própria preferência, o `relay-host` nunca sabe disso.

## Acceptance criteria

- A-001 - `HandoffCard` renderiza avatar, timestamp absoluto + relativo,
  duas colunas, caminho da spec e botão nomeando o harness, todos a partir
  dos fixtures existentes
- A-002 - `ChecklistList` mostra rótulo textual por marcador e destaca a
  linha `[•]`
- A-003 - `Header` tem as abas e o selo de harness, abrindo o seletor ao
  clicar
- A-004 - o seletor de harness e consentimento existe, com os três níveis
  nomeados, e nenhum deles remove o clique de confirmação de um preflight —
  este componente não inclui o preflight ainda (spec 008), só a lista e o
  seletor de consentimento isolados
- A-005 - "gravado local" persiste em `localStorage`; nenhuma escrita nova
  em arquivo aparece em `app/relay-host` ou em qualquer lugar do disco
- A-006 - o rodapé do seletor nomeia o escopo do nível selecionado e muda
  junto com ele; com "Só esta execução" marcado, nenhum texto da tela promete
  gravação
- A-007 - o tom de identidade de cada harness vem de `--purple` e `--orange`;
  nenhum componente pinta harness com `--blue`, `--green` ou `--amber`, e o
  harness desabilitado não recebe tom de identidade

## Backlog candidates

- B-012: Componentes refinados conforme o protótipo, com o seletor de
  harness e consentimento

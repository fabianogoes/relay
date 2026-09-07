# Design System do Relay

**Data:** 2026-09-06
**Autor:** Claude Code
**Status:** vigente

Este documento é a **fonte de autoridade** para toda a interface do Relay. A
proposta ([`ui-proposal.md`](ui-proposal.md)) e os protótipos
([`prototypes/`](prototypes/)) permanecem no repositório como referência visual
e histórica, mas o que vale para implementação é o que está aqui. Uma mudança de
token ou de componente se faz primeiro neste documento, depois no código.

A decisão de arquitetura que emoldura a UI está na
[`../adr/0001-arquitetura-inicial-da-ui.md`](../adr/0001-arquitetura-inicial-da-ui.md).
Este documento não repete a arquitetura; ele padroniza o desenho da superfície.

## Índice desta pasta

| Arquivo | O que é | Como usar |
| --- | --- | --- |
| `README.md` (este) | fonte de verdade do design system: tokens, componentes e regras | ler antes de qualquer mudança de interface |
| [`ui-proposal.md`](ui-proposal.md) | análise exploratória e arquitetura da UI (raciocínio e alternativas descartadas) | ler só quando a decisão de desenho não estiver na ADR |
| [`design-system.html`](design-system.html) | exemplo visual **derivado** deste README | abrir no browser; nunca ler por agente |
| [`prototypes/`](prototypes/) | protótipos históricos, ~350 KB cada | **nunca abrir num agente**; só referência visual no browser |

> **Nunca leia os `.html`** (`design-system.html` e `prototypes/*.html`) num
> agente. O `design-system.html` duplica tokens deste README em CSS e o que há
> nos protótipos já foi extraído: o que foi **decidido** está na ADR-0001; o que
> foi **observado** está em `ui-proposal.md`. Ao mudar um token aqui, atualize o
> `design-system.html` junto — ele é derivado, não fonte.

---

## 1. Princípios

Toda decisão de interface decorre destas regras. Quando uma escolha de desenho
conflitar com um princípio, o princípio vence.

1. **O handoff é o produto; o backlog é navegação.** O objeto central de toda
   tela é o handoff corrente e a próxima decisão humana. Specs, backlog e
   changelog são trabalho de outra visão.
2. **A UI deriva do disco e nunca escreve.** O estado vem dos cinco registros do
   protocolo (Canal B); o stdout do harness nunca é parseado. A aplicação lê,
   deriva e lança — toda mutação passa por uma skill executada em um harness
   (ADR-0001, ponto 5).
3. **Três telas, não seis status.** Os seis status são leitura de máquina. Para
   quem decide existem três situações: **Retomar**, **Escolher** e **Reparar** —
   cada uma com uma ação primária única.
4. **"Gravado em disco" fecha toda execução.** Toda execução termina mostrando
   o que mudou no disco, arquivo por arquivo. Isso torna visível a tese do
   produto: a memória está no disco, não no chat.
5. **Preflight honesto.** O preflight mostra o `argv` elemento por elemento,
   nunca uma string com aspas montada para parecer comando de shell. Preflight
   que mente é pior que preflight nenhum.
6. **Preferência não é autorização.** A escolha do harness pode ser local ao
   workspace; não é consentimento para executar. O preflight é obrigatório em
   toda execução.
7. **Estado nunca é comunicado só por cor.** Todo marcador de status tem rótulo
   textual além do tom.
8. **Não afirmar o que o protocolo não define.** Sem fila numerada, sem rótulo
   `FIFO`, sem posição, sem barra de progresso percentual, sem pista com
   dependências. O `TODO.md` não define ordem, dependência ou esforço; o backlog
   é *independentemente selecionável*.
9. **Read-only existe como produto.** O modo `--no-exec` desliga a rota de
   lançamento por completo e é o mesmo produto com a superfície de execução
   removida — não um modo capado.

---

## 2. Tokens de cor

Tema escuro. Os valores abaixo são os adotados no protótipo v2 e aqui fixados.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#0b0d10` | fundo da aplicação |
| `--bg-deep` | `#070a0d` | fundo de modais e sobreposições |
| `--panel` | `#0f1318` | cartões e painéis |
| `--panel-2` | `#151a21` | painéis elevados, tabelas |
| `--raise` | `#1a2028` | estado de hover e superfícies destacadas |
| `--ink` | `#e9edf3` | texto primário |
| `--ink-2` | `#c6cfda` | texto secundário |
| `--meta` | `#9ba6b4` | metadados: caminhos, timestamps, IDs |
| `--line` | `rgba(255,255,255,.10)` | bordas padrão |
| `--line-2` | `rgba(255,255,255,.16)` | bordas de destaque e hover |

Acentos semânticos — cada um com três variantes (tinta, fundo suave, linha):

| Token | Valor | Uso |
| --- | --- | --- |
| `--green` / `--green-soft` / `--green-line` | `#5fe3b3` / `rgba(95,227,179,.10)` / `rgba(95,227,179,.34)` | `in_progress`, sucesso |
| `--amber` / `--amber-soft` / `--amber-line` | `#f7cd7a` / `rgba(247,205,122,.10)` / `rgba(247,205,122,.36)` | `blocked`, `inconsistent`, atenção |
| `--blue` / `--blue-soft` / `--blue-line` | `#93baff` / `rgba(147,186,255,.10)` / `rgba(147,186,255,.32)` | `ready`, `backlog`, seleção |
| `--purple` / `--purple-soft` / `--purple-line` | `#cfaaff` / `rgba(207,170,255,.10)` / `rgba(207,170,255,.32)` | harness, identidade |
| `--on-green` | `#05231a` | texto sobre fundo `--green` sólido |

### Contraste

Toda cor que carrega informação (texto, IDs, caminhos, timestamps) deve atingir
**AA** (4,5:1 para corpo, 3:1 para texto grande). O `--meta #9ba6b4` sobre
`#0b0d10` atinge ≈7:1 e é o mínimo permitido para metadados.

> **Proibido:** os cinzas `#4a5462` (≈2,4:1) e `#5d6675` (≈3,2:1) sobre o fundo
> atual, que não atingem AA e carregam informação real. Não reutilizá-los do
> protótipo v1.

---

## 3. Mapeamento de status → tom

| Status | Tom | Nota |
| --- | --- | --- |
| `in_progress` | green | ação primária: retomar |
| `blocked` | amber | requer `Context` com o bloqueio e a condição de retomada |
| `inconsistent` | amber | tela de reparo dura; restringe o resto |
| `ready` | blue | selecionável |
| `backlog` | blue | selecionável |
| `done` | green | conclusão |
| `idle` | meta (fundo transparente, linha `--line`) | sem trabalho ativo |

Todo marcador de status combina **tom + rótulo textual**. O `StatusPill` (seção
6) é o único componente autorizado a exibir status.

---

## 4. Tipografia

Famílias: **Space Grotesk** (sans) e **JetBrains Mono** (mono), carregadas via
Google Fonts. Mono para tudo que vem do disco: caminhos, IDs, timestamps,
comandos, `argv`.

| Papel | Fonte | Tamanho / altura de linha | Peso |
| --- | --- | --- | --- |
| Display (cabeçalho de tela) | sans | 26 / 1,2 | 600 |
| Título de seção | sans | 22 / 1,25 | 600 |
| Subtítulo | sans | 20 / 1,35 | 600 |
| Título operacional | sans | 16 / 1,4 | 600 |
| Título de cartão | sans | 15 / 1,4 | 600 |
| Corpo | sans | 14 / 1,5 | 400 |
| Corpo de destaque | sans | 14 / 1,5 | 500 |
| Corpo secundário | sans | 13 / 1,5 | 400 |
| Metadados | mono | 12 | 400 / 500 |
| Dados em linha | mono | 12 / 1,5 | 400 / 500 |
| Comando / `argv` | mono | 13 / 1,6 | 400 |

Regras:

- Corpo em **14 px** no mínimo; metadados em **12 px** no mínimo; títulos
  operacionais em **16 px**.
- Nunca abaixo de 12 px em texto que carrega informação.
- `letter-spacing` negativo (`-.2px` a `-.4px`) apenas em títulos grandes.
- **Metadados** e **Dados em linha** têm a mesma especificação numérica (mono,
  12 px, peso 400/500) e compartilham um único conjunto de tokens de
  tipografia no código; a tabela lista os dois papéis porque descrevem usos
  diferentes, não porque exigem valores diferentes.

---

## 5. Layout

### Grade e container

- Container de aplicação com `max-width: 1280px`, centralizado, com respiro
  lateral (`--space-8`).
- Layout em flexbox; grade `flex:1` para painéis iguais.
- Escala de espaçamento (base 4):

| Token | Valor |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |

### As três telas

| Tela | Quando | Ação primária única |
| --- | --- | --- |
| **Retomar** | `in_progress`, `blocked` | ▶ Retomar T-002 no Codex |
| **Escolher** | `ready`, `backlog`, `idle` | escolher o que começar |
| **Reparar** | `inconsistent` | mostrar o conflito e a correção determinística |

A tela **Reparar** é dura: quando o protocolo determina que ninguém avança com
estado inconsistente, a interface **desabilita** o resto — não apenas pinta um
aviso. Restrição por construção vale mais que restrição por texto.

A segunda visão (aba **Trabalho**, ao lado de **Agora**) é um painel de três
colunas simultâneas, não uma sequência de telas: **Specs** (lista, com
contagem de tarefas), **Backlog da spec selecionada** (filtrado pelo `spec`
da entrada, com ação `Retomar`/`Começar` por linha), **Changelog** (registros
mais recentes primeiro, com a evidência em rodapé mono). Selecionar uma spec
na primeira coluna filtra a segunda; a terceira não depende da seleção. O
handoff permanece o objeto central só da tela principal (aba **Agora**).

### Controles

- Altura de controles interativos: **32 a 36 px**.
- Raio padrão de cartão: `--radius-3` (12px); controles: `--radius-2` (10px);
  chips e pills: `--radius-1` (8px).
- Borda padrão: `1px solid var(--line)`; destaque: `var(--line-2)`.

---

## 6. Componentes

### StatusPill
Tom + rótulo textual (nunca só cor). Fundo `-soft`, borda `-line`, tinta do tom.
Ponto de status quando o espaço for mínimo, sempre acompanhado do rótulo.

### HandoffCard
O maior elemento da tela principal. Cabeçalho com **proveniência** — avatar
com as iniciais do harness, "escrito no {harness} · {tempo relativo}" — e o
timestamp absoluto (`YYYY-MM-DD HH:MM`) junto do IDs (`B-002 / T-002`) numa
linha mono logo abaixo. Título do objetivo em destaque
(`OBJETIVO · {backlogId} / {todoId}` como rótulo pequeno acima). Corpo em
**duas colunas lado a lado** — "Próximo passo" e "Contexto deixado" — nunca
um parágrafo único misturando os dois. Rodapé: **um** botão primário
("▶ Retomar {todoId} no {harness}", nomeando o harness), um botão secundário
("Trocar harness") e o caminho da spec em mono, alinhado à direita. O card
nunca mostra fila, posição ou percentual; mostra o contador verdadeiro
(`2 de 4`) quando houver subtarefas, num rótulo acima da lista de subtarefas
associada, não dentro do card.

### Botão primário
Uma ação primária por tela. Tom sólido (`--green` ou o tom da ação), texto
`--on-green` quando sobre o verde. Variantes: primária (sólida), secundária
(linha `--line-2`), perigo (amber). Estados de hover usam `--raise` ou o
equivalente do tom.

### PreflightModal
Mostra o `argv` **elemento por elemento**, cada um em célula separada (mono),
nunca concatenado com aspas — na prática, uma tabela rotulada de linhas
`bin` / `arg` / `prompt` / `cwd`, cada uma um elemento real do processo a
lançar, nunca uma string montada. O campo `prompt` é editável antes de
confirmar; a edição altera o elemento do `argv`, nunca gera concatenação de
shell. Inclui inline o **seletor de harness e consentimento** (ver
componente abaixo) e o aviso de execução ("Ao executar, esta janela fecha e
o harness assume..."). Rodapé: o escopo de consentimento vigente em texto
("escopo por workspace · gravado local"), um botão secundário ("Cancelar
Esc") e **um** botão primário que nomeia o harness selecionado
("▶ Executar no {harness}"). O botão de confirmar é a única rota de
lançamento. Em `--no-exec`, o modal não existe.

### Seletor de harness e consentimento
Componente compartilhado, usado standalone (atalho "Trocar harness" no
HandoffCard e no Header) e inline no PreflightModal. Lista os harnesses
detectados — nome, versão, estado — e um seletor de **consentimento para
executar sem perguntar de novo**, com três níveis nomeados: "Só esta
execução" (não grava), "Enquanto a app estiver aberta" (grava na sessão),
"Sempre neste workspace" (grava local, por workspace). Consentimento nunca é
selecionado por padrão silenciosamente — a preferência de harness pode ser
local ao workspace, mas não é autorização (ADR-0001 ponto 6): o preflight
continua obrigatório em toda execução, mesmo com consentimento "sempre".

### Painel "Gravado em disco"
Fechamento de toda execução: lista o que mudou, arquivo por arquivo, com o
antes e o depois do handoff. Expressa a regra read-only como qualidade visível:
"o app não escreveu nada disto; a skill escreveu."

### Lista de subtarefas (checklist)
Cada item combina **marcador + rótulo textual** à direita — `[x]` → "Feito",
`[•]` → "Em execução", `[!]` → "Bloqueado", `[ ]` → "Pendente" — nunca só o
glifo do marcador (mesma regra do StatusPill: tom + texto, nunca só cor). O
item `[•]` ativo tem fundo destacado (`--panel-2` ou tom sutil do status),
distinguindo-o visualmente sem depender só do rótulo. O cabeçalho da lista
mostra o contador verdadeiro ("N de M concluídas"), nunca percentual.

### Terminal
- **Embutido**: `xterm.js` sobre PTY via WebSocket; alt-screen, mouse tracking e
  bracketed paste habilitados; buffer de scrollback por run no host.
- **Externo**: lançado via script wrapper (o script é o contrato, não a linha de
  comando); PID e exit code gravados pelo próprio script.
- Fechar o painel **desanexa**, não mata; reabrir **reanexa** com replay.
- Na primeira execução, avisar do conflito de teclado (`Cmd+W`, `Cmd+T`) e
  oferecer o modo externo.

### Lista de harnesses
Um item por harness detectado: nome, versão, estado (instalado / não
autenticado / ausente). "Instalado mas não autenticado" é um estado distinto
de "não instalado".

**Proposto, não decidido:** um ícone com tom distinto por harness (visto no
protótipo: laranja para Claude Code, roxo/lavanda para Codex, cinza-neutro
para não instalado). Isso substituiria o tom único `--purple` que este
documento especificava antes. Valores de cor exatos não foram confirmados —
só a existência de tons distintos por identidade. Decisão pendente antes de
qualquer código usar cor por harness: usar `--purple` para Codex (já
compatível com a redação anterior) e decidir os tokens que faltam (Claude
Code, OpenCode) antes de implementar.

### Header
Logotipo "Relay" com nome do workspace e caminho completo, abas **Agora** /
**Trabalho** para alternar tela principal e segunda visão, um selo compacto do
harness ativo — iniciais coloridas, nome, "sessão"/escopo do consentimento —
que abre o **seletor de harness e consentimento** ao clicar, e o estado
derivado em StatusPill à direita. Não carrega ação primária.

### Empty states
Texto claro quando não há handoff, backlog ou especificação — nunca um painel
vazio sem explicação.

---

## 7. Acessibilidade

- **Contraste AA** em todo texto informativo (ver seção 2).
- **Estado por cor + rótulo** — nunca só por cor.
- **Foco visível** em todos os controles (anel `--blue-line` ou `--line-2`).
- **Alvos de interação** com 32 a 36 px de altura, sem dependência de hover.
- Hierarquia por tamanho e peso, não só por cor.

---

## 8. Implementação

- Tokens definidos como **CSS custom properties** em um arquivo `tokens.css`
  único, importado por todos os módulos de `relay-ui`.
- Componentes consomem apenas tokens; nunca cores ou tamanhos literais fora do
  `tokens.css`.
- Nomenclatura: classe por componente (`status-pill`, `handoff-card`,
  `preflight-modal`, `disk-log`), estados com sufixo (`-is-active`, `-is-muted`).
- A UI é HTML, CSS e JS comuns — sem framework obrigatório. Se um framework
  entrar, os tokens continuam sendo a fonte de estilo.
- O `xterm.js` e seus estilos de terminal ficam isolados no componente Terminal.

---

## 9. Governança

- **Autoridade:** este documento vence sobre protótipos e sobre código.
- **Ordem de mudança:** token ou componente muda primeiro aqui, depois no
  código. Um protótipo não vira token por existir; ele entra aqui por decisão.
- **Camada:** este documento vive em `docs/design-system/` com a proposta e os
  protótipos. A arquitetura vive na ADR; decisões de desenho e seu raciocínio
  ficam aqui e na proposta. Não duplicar conteúdo entre camadas.
- **Regra invariante da UI:** nada neste documento autoriza a aplicação a
  escrever nos cinco registros do protocolo. Ação de escrita, quando existir,
  é sempre por skill em harness (ADR-0001, ponto 5).

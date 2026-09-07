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

Tema escuro. Os valores abaixo são os adotados no protótipo v2 e aqui fixados,
com uma exceção registrada logo após a tabela de acentos: os tons de identidade
de harness, em que este documento diverge do protótipo de propósito.

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
| `--purple` / `--purple-soft` / `--purple-line` | `#cfaaff` / `rgba(207,170,255,.10)` / `rgba(207,170,255,.32)` | identidade de harness: Codex |
| `--orange` / `--orange-soft` / `--orange-line` | `#f5a878` / `rgba(245,168,120,.10)` / `rgba(245,168,120,.34)` | identidade de harness: Claude Code |
| `--on-green` | `#05231a` | texto sobre fundo `--green` sólido |

> **Divergência conhecida do protótipo v2, medida na navegação.** Lá o selo do
> Codex usa `#93baff` — o próprio `--blue`, que a seção 3 reserva para
> `ready`/`backlog`/seleção — e o do Claude Code usa `#e0865f`, valor que não
> existe como token; `--orange` sequer está declarado no protótipo. A decisão
> da seção 6 ("Lista de harnesses") vale contra isso, e a implementação segue
> este documento. A justificativa de que o roxo "acompanha o protótipo" era
> falsa quanto ao fato; a decisão continua de pé pelo argumento que importa —
> `--blue` já carrega significado de status e não pode carregar identidade
> também, que é exatamente a colisão que o protótipo produz.

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

A tela **Escolher** não é um aviso de vazio. Ela lista as tarefas de backlog
disponíveis, uma por linha, cada uma com o próprio ID, o caminho da spec em
mono e a própria ação primária nomeando o harness ("▶ Começar no {harness}"),
e fecha com um cartão para especificar uma ideia nova ("Iniciar entrevista").
O texto diz **por que** a escolha é do usuário — as tarefas do backlog são
independentes entre si, e `needs` é a única dependência real — em vez de
apenas constatar que o handoff está vazio. Não há ação primária única nesta
tela: há uma por linha, porque escolher é o trabalho.

Enquanto uma execução está anexada, a UI entra em **modo de execução** e ocupa
a viewport inteira: as abas Agora/Trabalho desaparecem e não há navegação
lateral. O modo tem dois estados, `em execução` e `concluído`, e é o único
lugar do app onde existe ação de perigo. Sair dele é sempre explícito —
desanexar para segundo plano, ou fechar depois de concluído — nunca por
navegação.

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

O mesmo modal serve às **quatro portas de lançamento**, mudando só o título e
o `prompt` pré-preenchido: "Especificar uma ideia" (botão "+ nova spec" da
coluna Specs e cartão "Iniciar entrevista" da tela Escolher), "Iniciar sessão
em {backlogId}" (ação "Começar" de uma tarefa disponível) e "Retomar sessão"
(ação "Retomar" do HandoffCard ou de uma tarefa em curso). Não existe rota de
lançamento que não passe por aqui.

As linhas `bin` e `arg` mudam com o harness selecionado, e a linha `prompt`
muda junto: a invocação da skill é **composta para aquele harness** —
`/relay-session` como comando de barra no Claude Code (`claude` `-p`),
`⟨relay-session⟩` como delimitador no Codex (`codex` `exec`) — e nunca uma
flag `--skill`, que não existe em nenhum dos CLIs (`ui-proposal.md`, seção
1.5). O texto da intenção depois do prefixo é o mesmo nos dois; só o prefixo e
o `argv` mudam. Trocar o harness reescreve as quatro linhas e o rótulo do
botão de confirmar na mesma ação.

O rodapé mostra o escopo de consentimento **vigente**, acompanhando a opção
selecionada. Um rodapé fixo dizendo "gravado local" enquanto "Só esta
execução" está marcado é defeito, não estilo: o rodapé é a única confirmação
textual do que será lembrado. O modal fecha por `Esc` e pelo botão "Cancelar";
o seletor standalone, aberto pelo selo do Header, fecha por clique fora.
Fechar nunca lança.

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
A prova de escrita, **ao vivo durante a execução** e não só no fechamento:
ocupa a coluna direita do modo de execução e recebe uma entrada assim que a
skill grava. Expressa a regra read-only como qualidade visível: "o app não
escreveu nada disto; a skill escreveu."

Cabeçalho com o contador verdadeiro de arquivos tocados ("N arquivos
alterados"), nunca percentual. Uma entrada por escrita, **mais recente
primeiro**, cada uma com: um selo de tipo — `ATUALIZADO` quando o registro
passou a ter conteúdo novo, `LIMPO` quando voltou ao estado vazio —, o caminho
do registro em mono, o horário, uma linha de prosa dizendo o que aquela
escrita significa, e as colunas **Antes** e **Depois** lado a lado com o
trecho cru.

A entrada `LIMPO` nunca é omitida por ser "só" um esvaziamento: mostra o
conteúdo anterior à esquerda e o registro vazio à direita, e é exatamente ali
que a invariante do handoff — limpo só depois do changelog — fica visível sem
que ninguém precise explicá-la.

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

O terminal nunca aparece sozinho. No modo de execução ele ocupa a coluna
esquerda e o painel "Gravado em disco" ocupa a direita — o Canal A e o Canal B
lado a lado, que é o argumento visual da regra "o estado vem do disco, nunca
do stdout". Acima das duas colunas, uma barra identifica a execução: selo do
harness com o tom de identidade, nome da execução, e o estado da execução em
StatusPill. Ao reanexar, a barra ganha o selo `RECONECTADO À EXECUÇÃO VIVA`,
para que reanexar nunca seja lido como execução nova. O rodapé do terminal
mostra `pid {n} · sessão viva` enquanto o processo vive.

Controles da barra, por estado da execução:

| Estado | Controles |
| --- | --- |
| `em execução` | "Deixar em segundo plano" (secundário) · "Encerrar processo" (perigo) |
| `concluído` | "Fechar" (secundário) |

"Deixar em segundo plano" desanexa e devolve a navegação. **"Encerrar
processo" exige confirmação** — é a única ação de perigo do app e descarta uma
execução que já gravou no disco, com o painel ao lado provando que gravou.
"Fechar" nunca aparece antes de o processo terminar: o rótulo do controle é a
única fonte de verdade sobre o que o clique faz, e o estado na barra nunca
pode dizer `concluído` enquanto a última linha do terminal ainda descreve
trabalho em curso.

### Faixa de execução em segundo plano
Aparece abaixo do Header quando existe execução desanexada, e só então. Ponto
de status, o texto "Rodando em segundo plano", o nome da execução e o harness,
o contador verdadeiro de arquivos já escritos, e um único controle secundário
à direita: "Reconectar ao terminal". A faixa é a prova de que desanexar não é
encerrar — sem ela, "Deixar em segundo plano" seria indistinguível de fechar.

### Lista de harnesses
Um item por harness detectado: nome, versão, estado (instalado / não
autenticado / ausente). "Instalado mas não autenticado" é um estado distinto
de "não instalado".

**Cor por identidade, decidido:** `--purple` para Codex, `--orange` para
Claude Code — nenhum dos dois é usado pelo mapeamento status→tom da seção 3,
então não há colisão de significado com `--green`/`--amber`/`--blue`.
OpenCode "não instalado" não recebe tom de identidade — usa `--meta` sobre
`--line`, mesmo tratamento de qualquer estado desabilitado. Um harness novo
que apareça no futuro entra sem tom próprio (neutro) até o design system
decidir um.

O protótipo v2 **não** implementa esta decisão (ver a divergência na seção 2):
pinta o Codex com `--blue` e o Claude Code com um valor solto, fora de token.
O estado desabilitado do OpenCode aparece lá como `#48525f`, vizinho dos
cinzas proibidos da seção 2 — ali é só o preenchimento de um quadrado, mas
nenhum texto informativo pode herdar esse valor.

### Header
Logotipo "Relay" com nome do workspace e caminho completo, abas **Agora** /
**Trabalho** para alternar tela principal e segunda visão, um selo compacto do
harness ativo — iniciais coloridas, nome, "sessão"/escopo do consentimento —
que abre o **seletor de harness e consentimento** ao clicar, e o estado
derivado em StatusPill à direita. Não carrega ação primária.

### Empty states
Texto claro quando não há handoff, backlog ou especificação — nunca um painel
vazio sem explicação. Handoff vazio **com** trabalho disponível não é empty
state: é a tela **Escolher** da seção 5, que explica por que a escolha é do
usuário e dá a cada tarefa a própria ação primária. Empty state de verdade é
só quando não há nem trabalho a escolher.

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

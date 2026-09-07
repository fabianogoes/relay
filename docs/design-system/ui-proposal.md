# Proposta de UI do Relay — arquitetura e desenho

**Data:** 2026-09-05
**Autor:** Claude Code
**Protótipo vigente:**
[`claude-design-prototype-v2.html`](prototypes/claude-design-prototype-v2.html)
**Insumo histórico analisado:**
[`claude-design-prototype-v1.html`](prototypes/claude-design-prototype-v1.html)

Este documento consolida a análise do primeiro protótipo e a proposta que
orientou sua revisão. O v2 é a versão final vigente; o v1 permanece no
repositório como registro histórico do que foi observado e corrigido. As
decisões abaixo substituem a análise intermediária, sem apagar os achados de
protocolo que ela revelou.

---

## Premissas

Estas são decisões dadas, não recomendações deste documento:

1. **A UI vai existir.** Não se discute mais se um painel se justifica.
2. **Ajustar a interface para expressar melhor o objetivo do projeto é
   permitido.**
3. **Ajustar o projeto — inclusive o `PROTOCOL.md` — é permitido.**
4. **A distribuição é por repositório:** clone, build se necessário, instalação
   e configuração locais. Sem App Store, sem loja de nenhum sistema. Imagem
   Docker é bem-vinda como facilitador, já que o projeto é público.
5. **macOS primeiro.** Windows e Linux entram depois que o produto estiver
   rodando e validado.

A quarta premissa muda a conta de forma relevante, e por um motivo mecânico:
**o custo de assinatura desaparece.** O atributo `com.apple.quarantine` do
macOS é aplicado por quem *baixa* o arquivo, não por quem o constrói. Um
binário gerado por build local a partir de um clone não o recebe e abre sem
passar pelo Gatekeeper. Notarização, certificado no Windows e infraestrutura de
auto-update saem inteiros da conta.

O que a premissa **não** remove: o app precisa lançar CLIs de agente **no
host**, com o `PATH` do usuário, as credenciais já autenticadas e acesso ao
diretório do projeto. Essa exigência restringe o desenho mais do que a escolha
de framework.

A quinta premissa tira do escopo imediato o ConPTY, a detecção de `PATH` no
Windows, as dependências de WebView do Linux e os três builds. Sobra
`node-pty` no Darwin, que é o caminho mais maduro que existe. Ela não muda a
arquitetura proposta — pelo contrário: a fronteira da seção 1.1 é justamente o
que torna a entrada de Windows e Linux depois um trabalho localizado no
`HarnessAdapter` e no `PtyRunner`, sem tocar em `relay-core` nem na UI.

---

# Parte 1 — Arquitetura

## 1.1 A decisão que não precisa ser tomada agora

A pergunta "Tauri ou Electron?" costuma ser tratada como decisão de entrada.
Ela não é. Com a fronteira certa, a casca vira detalhe adiável e reversível:

```text
relay-core   (TypeScript)   parser, derivação de estado, invariantes
                            puro, read-only, testável sem I/O

relay-host   (TypeScript)   watcher, detecção de harness, PTY,
                            servidor local
        ↕ HTTP + WebSocket em 127.0.0.1

relay-ui     (TypeScript)   a interface: HTML, CSS e JS comuns
```

Se a UI conversa com o host por HTTP e WebSocket em vez de um IPC proprietário,
então:

- **hoje** ela roda numa aba do navegador — `git clone && npm install && npm start`,
  sem empacotamento nenhum;
- **se um dia** você quiser janela de aplicação, o Tauri carrega **essa mesma
  UI** na WebView; o trabalho é de dias, não de reescrita;
- **o Electron** idem, se a preferência mudar;
- **uma TUI**, se voltar a fazer sentido, consome `relay-core` direto, sem
  passar pelo host (ver apêndice).

Você não escolhe a casca. Você escolhe a fronteira, e a casca passa a ser uma
decisão barata de rever.

Os componentes do host, todos independentes de stack:

```text
relay-host
  ├─ RelayCore          parser, derivação, validação de invariantes
  ├─ WorkspaceWatcher   observa .specs/ e .orchestration/
  ├─ HarnessRegistry    um adaptador por CLI de agente
  ├─ PtyRunner          lança e acompanha o processo
  └─ HttpServer         HTTP + WebSocket em loopback
```

## 1.2 A recomendação: servidor local + UI no navegador

TypeScript ponta a ponta.

Por que este formato, dadas as premissas acima:

| | Servidor local | Tauri | Electron |
| --- | --- | --- | --- |
| `git clone && build` exige | Node | Node + Rust + deps de WebView (webkit2gtk no Linux) | Node + ~200 MB de Chromium por clone + toolchain para `node-pty` |
| Empacotar por sistema | não empacota | 3 builds | 3 builds |
| `PATH` e credenciais do host | nativo | nativo | nativo |
| Modo Docker read-only | funciona | não | não |
| Vira aplicação depois? | sim, carregando a mesma UI | — | — |

O navegador do usuário já está instalado e já é a WebView — só que mantida por
outra pessoa. `xterm.js` roda igual numa aba; a PTY vive no processo Node e
chega por WebSocket, que é exatamente o que o processo main do Electron faria.

**Linguagem:** TypeScript também no core, não Rust. Uma linguagem, um
`npm install`, e a UI é TypeScript de qualquer forma. `node-pty` é a ligação de
PTY mais madura e cobre ConPTY no Windows. Rust passa a valer se um dia a
distribuição virar binário único — e aí `relay-core` é justamente a peça que se
reescreve com menos risco, porque é pura e tem testes.

## 1.3 Docker: onde funciona e onde é beco sem saída

**Lançar harness de dentro de um container não funciona.** Os CLIs não estão
instalados lá, não estão autenticados lá, e o `PATH` é outro. Bind-mount do
projeto resolve os arquivos e não resolve nada do resto. Vale registrar para
que ninguém gaste tempo tentando.

Onde Docker **é** bom, e vale oferecer: **modo visualizador read-only.**

```bash
docker run --rm -p 7373:7373 -v "$PWD:/ws:ro" relay/ui
```

Lê o estado, valida integridade, mostra tudo — sem rota de execução. Para um
projeto público isso é excelente como demonstração e como "olhar o estado de um
repositório sem instalar nada".

E não é um modo capado inventado para o Docker: **`--no-exec` deve existir
também fora dele.** É o mesmo produto com a superfície de execução desligada.

## 1.4 Segurança do servidor local

Um servidor em loopback é alcançável por **qualquer página que o usuário abrir
no navegador**. Sem isso resolvido, um site qualquer dispara execução de agente
na máquina dele. Isto precisa estar certo desde a primeira linha, não depois.

Contrato mínimo:

- bind **apenas** em `127.0.0.1`, em porta efêmera aleatória;
- token aleatório por execução, impresso no terminal e embutido na URL aberta,
  exigido em toda requisição e no handshake do WebSocket;
- rejeitar requisição sem `Sec-Fetch-Site: same-origin` (ou `Origin`
  correspondente);
- nenhuma origem adicional liberada, nenhum CORS permissivo;
- `--no-exec` desliga a rota de lançamento por completo.

A preferência de **qual harness usar** pode ser local ao workspace, mas não é
consentimento para **executar**. O protótipo misturava as duas coisas em
"manter esta seleção" e usava uma chave de `localStorage` sem identidade do
workspace, o que poderia vazar a escolha entre projetos. Preferência e
autorização precisam ser estados distintos; o preflight continua obrigatório
em toda execução.

### Execução e preflight

O processo é lançado com `argv[]`, nunca por `sh -c`, `bash -c` ou equivalente.
Um prompt de agente contém aspas, crase, ponto e vírgula e `$`, e o significado
de cada um desses caracteres muda entre PowerShell, `cmd.exe`, bash e zsh.
Concatenar em string de shell é injeção garantida.

Isso tem uma consequência direta no desenho do preflight, e ela é fácil de
perder: **o preflight mostra o argv elemento por elemento**, não uma string com
aspas montada para parecer um comando de shell. Uma string exibida é uma
*renderização* do argv, e as duas divergem quando o prompt contém aspas — o
usuário aprova uma coisa e o app executa outra.

Preflight que mente é pior que preflight nenhum, porque é exatamente ali que a
confiança é depositada.

## 1.5 Detecção de harness

É a parte mais simulada do protótipo — três harnesses fixos, versões escritas à
mão — e a de que todo o resto depende. Sem detecção honesta, o preflight exibe
um comando que pode não existir e o botão de executar vira promessa.

É genuinamente difícil, e merece ser tratada como componente e não como
utilitário:

- `PATH` difere entre shell interativo e não-interativo;
- instalações via npm, brew, asdf e outros shims;
- a flag de versão varia por CLI;
- o binário pode existir e **não estar autenticado** — estado que precisa ser
  distinguido de "não instalado", porque a ação do usuário é diferente em cada
  caso.

### A skill não é argumento de comando

O protótipo monta comandos na forma `codex exec --skill relay-status "prompt"`.
Essa flag não existe: **nenhum dos três CLIs** tem `--skill`, e nos três a
skill é solicitada dentro do próprio prompt.

Isso não se resolve traduzindo uma flag por harness. O adaptador precisa de uma
responsabilidade a mais na assinatura:

```text
HarnessAdapter
  detect()                          instalado? versão? autenticado?
  buildArgv(cwd, prompt)            como montar o processo
  composePrompt(skill, prompt)      como invocar a skill NAQUELE harness
  supportsInteractivePty()
```

`buildArgv` e `composePrompt` são coisas separadas. Juntá-las é justamente o
que produz a suposição de que existe um `--skill`.

**Corrigido no v2, e vale registrar como o alvo já existe desenhado.** A
navegação do `claude-design-prototype-v2.html` não mostra `--skill` em lugar
nenhum: o PreflightModal exibe quatro linhas rotuladas e as duas primeiras
mudam com o harness, enquanto a terceira recebe um prefixo próprio de cada um.
Medido, para a mesma intenção ("Selecionar B-002 e explodir em subtarefas"):

| | `bin` | `arg` | `prompt` |
| --- | --- | --- | --- |
| Claude Code | `claude` | `-p` | `/relay-session Selecionar B-002 e…` |
| Codex | `codex` | `exec` | `⟨relay-session⟩ Selecionar B-002 e…` |

O texto da intenção é idêntico nos dois; só o prefixo da skill e o `argv`
mudam. É exatamente a separação `buildArgv` / `composePrompt` descrita acima,
já visível na superfície — o que resta é implementá-la no adaptador em vez de
descrevê-la.

## 1.6 Os dois canais: como a UI lança o harness e recebe feedback

Este é o ponto que decide o produto, e ele começa por separar duas coisas que é
tentador juntar:

```text
Canal A — INTERAÇÃO              Canal B — VERDADE
PTY, bytes, ANSI                 .orchestration/*.md e .specs/
o humano conversa com o agente   o watcher observa
                                 o estado é derivado daqui
        │                                  │
        └──────────► WebSocket ◄───────────┘
                (dois streams distintos)
```

**A regra que resolve tudo: o Relay deriva estado apenas do Canal B. O stdout
do harness nunca é parseado.**

Três consequências:

**a) Fechar o terminal não perde nada.** O estado nunca esteve no terminal. Se
o usuário fecha, o Canal A morre e o Canal B continua — o agente segue
escrevendo, o watcher segue disparando, a UI segue atualizando.

**b) Terminal externo passa a ser viável.** Se o estado dependesse de parsear
stdout, terminal externo seria impossível, porque não há stdout para capturar.
Como não depende, lançar no terminal do usuário funciona igual. O que falta no
modo externo é apenas saber se o processo ainda vive, e isso se resolve sem
stdout: o host gera um script wrapper que grava PID e código de saída num
diretório de run, e observa esse diretório também.

```sh
# gerado pelo host para cada execução
echo $$ > "$RUN/pid"
"<bin>" "<argv...>"          # o script É o argv; nada de sh -c
echo $? > "$RUN/exit"
```

**c) Parsear stdout seria uma terceira implementação do protocolo** — frágil,
específica por harness, e divergindo das skills e do core. A regra "só o Canal
B" é a mesma regra da seção 2.4, vista do outro lado.

### O ciclo de vida da execução

| O usuário fecha… | O que acontece |
| --- | --- |
| o painel do terminal na UI | o processo **desanexa**, não morre; a UI mostra "rodando em segundo plano" |
| a aba do navegador | o host é um processo separado: a PTY continua viva e a execução segue |
| e depois reabre | **reanexa** à PTY viva, com replay do scrollback que o host guardou |

A última linha é o argumento mais forte a favor do servidor local: **o servidor
sobrevive à janela.** Em Electron ou Tauri, fechar a janela normalmente encerra
tudo, e essa sobrevivência teria de ser construída à mão. Aqui ela é
consequência do formato.

Detalhes que o `PtyRunner` precisa cobrir: propagar resize (SIGWINCH) quando o
painel muda de tamanho; habilitar alt-screen, mouse tracking e bracketed paste
no `xterm.js`, que os CLIs de agente usam; e manter um buffer de scrollback por
run no host, para o reattach ter o que replayar.

## 1.7 Embutido e externo: qual usar, e por quê os dois

**Embutido é o padrão**, porque é a experiência coerente com "o usuário começa
na UI". **Externo é opção**, para quem quer o próprio ambiente. Do ponto de
vista do Relay os dois são idênticos: o estado vem do disco nos dois casos.

| | Embutido (`xterm.js` + PTY) | Externo (Terminal do usuário) |
| --- | --- | --- |
| Experiência | uma janela só; terminal e prova de escrita lado a lado | duas janelas; o usuário alterna |
| Ciclo de vida | conhecido: PID, saída, desanexar, reanexar | só via wrapper com PID e exit code |
| Saída capturada | sim; scrollback e replay | não |
| Configuração do usuário | perde tema, fonte, keybindings, plugins | mantém tudo |
| Teclado | conflita com atalhos do navegador (`Cmd+W`, `Cmd+T`) | nativo |
| Custo de implementação | emulação, resize, sequências ANSI | lançar processo e observar arquivo |
| Agentes que abrem editor/pager | precisa de alt-screen configurado | funciona nativamente |

O conflito de teclado do modo embutido é real e não tem solução completa numa
aba: `Cmd+W` fecha a aba antes de chegar ao terminal. Mitiga-se avisando na
primeira execução e oferecendo o modo externo — e desaparece de vez no dia em
que a UI virar janela Tauri.

### Terminal configurável

Sim, e deve ser. O usuário escolhe qual emulador lançar, porque ele pode ter
vários instalados.

No macOS o mecanismo é uniforme: o host escreve o script wrapper da seção 1.6 e
pede ao sistema que o abra com o aplicativo escolhido.

```bash
open -a "Terminal"  "$RUN/launch.sh"
open -a "iTerm"     "$RUN/launch.sh"
open -a "Warp"      "$RUN/launch.sh"
open -a "Ghostty"   "$RUN/launch.sh"
```

O registro fica em preferência local, no mesmo formato dos harnesses — um
adaptador por emulador, detectado e não presumido:

```text
TerminalAdapter
  detect()                    o app existe em /Applications ou via bundle id?
  launch(scriptPath, cwd)     como abrir este script naquele emulador
  supportsNewWindow()         nova janela, nova aba, ou o que o app suportar
```

Detectar por **bundle id** (`com.apple.Terminal`, `com.googlecode.iterm2`,
`dev.warp.Warp-Stable`, `com.mitchellh.ghostty`) é mais confiável que por nome
de aplicativo, que o usuário pode renomear. `open -b <bundle-id>` aceita a
mesma chamada.

Dois cuidados:

- **o script é o contrato, não a linha de comando.** Passar o comando montado
  como argumento para o emulador reintroduz interpretação de shell e desfaz a
  garantia do `argv[]`. O host escreve o script, dá permissão de execução, e o
  emulador só o abre.
- **alguns emuladores não voltam o PID do processo filho.** Por isso o PID vem
  do próprio script (`echo $$`), não do `open`.

Quando Windows e Linux entrarem, é este adaptador que ganha implementações
(`wt.exe`, `powershell`, `gnome-terminal`, `konsole`, `x-terminal-emulator`) —
e nada mais muda.

---

# Parte 2 — UI/UX

O primeiro produto é um **verificador de estado com lançador seguro**, não um
dashboard de gestão. A interface existe para tornar legíveis a integridade do
estado, o handoff corrente e a próxima decisão humana; as demais coleções são
contexto e navegação.

## 2.1 A tese: o handoff é o produto, o backlog não

O protótipo é, visualmente, um **dashboard de gestão**: três painéis, fila
numerada, changelog em coluna. Isso comunica "gerenciador de projeto".

O objetivo do Relay é outro, e ele aparece na tela uma única vez, como um chip
pequeno dentro de um card:

> handoff escrito por Claude Code em 2026-09-04 23:41 → retomar em Codex

**Essa linha é o produto inteiro.** Ela deveria ser o maior elemento da tela.
Specs, backlog e changelog são navegação — trabalho de outro momento, e de
outra visão.

Concretamente:

- o handoff vira o objeto central da tela principal;
- a proveniência sobe para cabeçalho — "escrito no Claude Code · há 14 horas" —
  em vez de chip de rodapé;
- objetivo e próximo passo em corpo legível, não em 11,5 px;
- **um** botão primário;
- specs, backlog e changelog saem da tela principal e viram uma segunda visão.

## 2.2 Três telas, não seis status

Os seis status do protocolo são leitura de máquina. Do ponto de vista de quem
decide, existem três situações, e cada uma merece uma tela — em vez de um
dashboard único com uma barra de alerta competindo com todo o resto:

| Tela | Quando | Ação primária única |
| --- | --- | --- |
| **Retomar** | `in_progress`, `blocked` | ▶ Retomar T-002 no Codex |
| **Escolher** | `ready`, `backlog`, `idle` | escolher o que começar |
| **Reparar** | `inconsistent` | mostrar o conflito e a correção determinística |

A tela de reparo merece ser dura. Se o protocolo determina que ninguém avança
com estado inconsistente, a interface deve **desabilitar** o resto, não apenas
pintar um aviso amarelo. Restrição por construção vale mais que restrição por
texto — e o protótipo hoje mostra o alerta *e* mantém tudo clicável.

## 2.3 Promover "Gravado em disco"

O painel lateral que lista o que foi escrito é o que torna o protocolo visível
e prova que o app não é caixa-preta. Hoje é a coluna mais estreita da tela.

Ele deveria ser o **fechamento de toda execução**: rodou → *isto mudou no
disco*, arquivo por arquivo, com o antes e o depois do handoff.

Isso expressa literalmente a tese do produto — a memória está no disco, não no
chat — e transforma a regra do read-only em qualidade visível em vez de
limitação. A interface pode dizer, com todas as letras: *o app não escreveu
nada disto; a skill escreveu.*

## 2.4 A regra que sustenta o desenho: o app não escreve

A aplicação lê, deriva e lança. Ela nunca escreve nos cinco arquivos do
protocolo. Toda mutação passa por uma skill executada em um harness.

Isso não é cautela de MVP, é o que impede o Relay de acabar com **duas
implementações do mesmo protocolo** — uma em Markdown, interpretada pelas
skills, outra em código, dentro da UI. Com duas, a pergunta "qual das duas está
certa?" não tem resposta, e o caso que a expõe é o pior possível: o
`inconsistent`. Dois leitores independentes podem divergir, e divergência ali
trava o trabalho ou o deixa passar indevidamente.

Se a app precisar de um estado que não consegue derivar, a correção é no
protocolo — não num write da interface.

O v1 tornou esse risco concreto: sua lógica mantinha um estado próprio, criava
specs e backlog, avançava TODO e handoff, anexava changelog, reparava handoff
obsoleto e derivava `backlog`, `ready`, `in_progress` e `inconsistent`. Isso é
legítimo em uma demonstração funcional, mas não pode ser promovido a
implementação de produção. No produto, `relay-core` interpreta e valida; só as
skills, executadas no harness, mutam os registros.

## 2.5 O que remover

- **A barra de progresso percentual.** O protocolo não tem dimensionamento:
  quatro subtarefas podem ser 10% e 90% do trabalho. Trocar por contagem
  (`2 de 4`), que é verdadeira.
- **O rótulo `FIFO` e a numeração de posição na fila.** O `PROTOCOL.md` diz que
  as entradas do backlog são *independentemente selecionáveis*; uma fila
  numerada afirma o contrário.
- **A pista como widget operacional.** Ela é ótima para *explicar* o Relay —
  mantenha no README, na landing, no onboarding. Como leitura de estado, afirma
  ordem e dependência que o `TODO.md` não define, e não tem lugar para o
  marcador `[!]`.

## 2.6 Densidade e contraste

Alvo: 14 px para corpo, 12 px como mínimo para metadados, 16 px para títulos
operacionais, controles com 32 a 36 px de altura. O protótipo opera hoje entre
8,5 e 12 px na maior parte da tela, o que varia demais entre os mecanismos de
renderização de macOS, Linux e Windows.

Os cinzas `#4a5462` (~2,4:1) e `#5d6675` (~3,2:1) sobre o fundo atual não
atingem AA — e carregam informação real: caminhos de arquivo, timestamps, IDs.
Não é texto decorativo.

Estado nunca deve ser comunicado só por cor: cada marcador de status precisa de
rótulo textual além do tom.

---

## 2.7 Navegação do v2: o que foi exercitado e o que apareceu

Registro do que a navegação completa do `claude-design-prototype-v2.html`
exercitou de fato. É observação, não decisão: o que virou decisão está no
`README.md`, o que virou critério está nas specs 006 a 010.

**Carga.** Página autocontida, sem nenhuma requisição de rede;
`first-contentful-paint` em 136 ms, `load` em 196 ms, nenhuma mensagem de
console — nem erro, nem aviso. Os ~350 KB do arquivo não custam nada
perceptível.

**Superfícies percorridas.** Aba **Agora** com handoff ativo (proveniência,
duas colunas, checklist com rótulo por marcador, contador "1 de 4"); aba
**Trabalho** com as três colunas e a troca de spec refiltrando o backlog; o
PreflightModal pelas quatro portas de lançamento; o seletor de harness
standalone pelo selo do Header; o modo de execução com terminal e prova de
escrita ao vivo; desanexar, faixa de segundo plano, reanexar, encerrar e
fechar; e a tela **Escolher** com uma ação por tarefa e o cartão de entrevista.

**Coerência entre visões, verificada.** Depois de uma execução completa, a
tarefa passou de `DISPONÍVEL` a `EM CURSO` na aba Trabalho, o changelog ganhou
um registro, e a aba Agora passou a mostrar o handoff com a proveniência do
harness que rodou. As duas visões leem o mesmo estado, sem divergir.

**Três defeitos observados**, todos já convertidos em critério de aceite:

1. O rodapé do PreflightModal diz `escopo por workspace · gravado local` de
   forma fixa, sem acompanhar o nível de consentimento selecionado — com "Só
   esta execução · não grava" marcado, o rodapé continua prometendo gravação.
2. Ao terminar, a barra do modo de execução passa a `concluído` enquanto a
   última linha do terminal ainda diz "T-002 em execução — aguardando o
   harness". Dois estados contraditórios na mesma tela.
3. "Encerrar processo" descarta a execução sem confirmação, mesmo com o painel
   ao lado listando arquivos já gravados. A UI volta ao estado anterior ao
   lançamento sem qualquer vestígio do que foi escrito.

**Tons de identidade divergem do `README.md`.** Medido: Codex usa `#93baff`
(o `--blue` do mapeamento de status) e Claude Code usa `#e0865f`, valor fora
de token — `--orange` não está declarado no protótipo, e `--purple`, que está,
não é usado por harness nenhum. A decisão vigente é a do `README.md`, seção 2.

---

## 3. Lacunas reveladas e ajuste necessário no protocolo

O v1 revelou três pontos em que a representação visual precisou inventar uma
semântica que o contrato em disco não oferece:

| Lacuna | O que o protótipo presumiu | Tratamento na proposta vigente |
| --- | --- | --- |
| Prioridade do backlog | `FIFO`, escolhendo o primeiro item pendente | não desenhar fila nem posição; manter as entradas independentemente selecionáveis |
| Ordem do TODO | pista linear, dependências e percentual de avanço | mostrar marcadores e contagem, sem afirmar ordem, dependência ou estimativa |
| Proveniência do handoff | harness de origem e horário mantidos apenas no estado da UI | registrar ambos no protocolo, para que qualquer leitor veja a mesma informação |

As duas primeiras lacunas deixam de ser bloqueio para a UI quando ela para de
afirmar semânticas ausentes do protocolo. Elas continuam registradas como
dívida de contrato: `relay-continue` ainda fala em "maior prioridade" sem
campo correspondente, e o `TODO.md` não define ordem ou dependência. A proposta
não decide essas semânticas por conta própria.

A proveniência, por outro lado, sustenta a principal promessa da tela de
handoff e precisa existir na fonte da verdade. O ajuste mínimo é:

```diff
  # Handoff
  - Status: in_progress
  - Backlog: B-001
  - TODO: T-001
  - Spec: .specs/20260905-001-<slug>.md
+ - Harness: claude-code
- - Updated: 2026-09-05
+ - Updated: 2026-09-05 23:41
```

Sem isso, a proveniência — a melhor ideia da interface e a expressão mais
direta do objetivo do projeto — existe apenas dentro da interface e desaparece
para quem der `cat` no arquivo. Hoje o template do handoff não registra quem
escreveu, e o `Updated` é data pura, sem hora. Com a mudança, qualquer cliente
lê a proveniência: a skill, o terminal, a UI, e o que vier depois.

> **✅ Aplicado em 2026-09-06.** O `PROTOCOL.md` já registra `Harness` e
> `Updated` em RFC 3339 com fuso horário explícito no template do handoff
> (`docs/PROTOCOL.md:128-129`). As skills `relay-session`,
> `relay-continue` e `relay-status` já validam ambos, e a integridade
> trata handoff não vazio sem `Harness`/`Updated` válidos como
> `inconsistent` (`PROTOCOL.md:207-210`). A forma final adotou RFC 3339
> (`2026-09-05T23:41:00-03:00`), mais estrita que o `2026-09-05 23:41`
> do diff acima.

---

## 4. Sequência de construção

1. **Contrato em disco** — ✅ **feito (2026-09-06).** A proveniência do
   handoff (`Harness` + `Updated` em RFC 3339) foi acrescentada ao
   `PROTOCOL.md` e passou a ser validada pelas skills `relay-session`,
   `relay-continue` e `relay-status`; as lacunas ainda não decididas de
   prioridade e ordem permanecem explícitas como tal. O protocolo continua
   sendo validado em repositórios reais antes de se introduzir uma CLI
   própria do Relay.
2. **`relay-core`** — parser, derivação de estado, invariantes. Puro, com
   testes, sem I/O. É o que sobrevive a qualquer troca de casca, e o que uma
   eventual migração para Rust reescreve com menos risco.
3. **Detecção de harness de verdade** — instalado, versão, autenticado. Tudo o
   mais depende dela, e é a parte mais simulada do protótipo.
4. **Servidor local read-only + as três telas + watcher.** Já é útil sozinho, e
   é exatamente o modo Docker.
5. **PTY, preflight com argv real, e o painel "isto mudou no disco".**
6. **Se sentir falta de janela:** Tauri carregando a mesma UI.

---

## Apêndice — TUI: por que não

Uma TUI (Ink, Bubbletea, ratatui) elimina de uma vez PTY dentro de WebView,
empacotamento, assinatura e auto-update. É uma economia real, e por isso a
opção foi considerada.

O argumento aparente a favor dela era "o usuário do Relay já está no terminal".
**Esse argumento é falso**, e desfazê-lo é o que decide a questão.

Ele descreve a origem do projeto, não o produto. O Relay começou como uma ideia
de terminal — orquestrar contexto e memória entre harnesses a partir dali. A
proposta da UI inverte a relação: **o usuário começa pela interface, e o
terminal é lançado por ela durante a execução das skills.** O terminal deixa de
ser a casa e passa a ser superfície de execução transitória.

Com a relação invertida, uma TUI não é uma versão mais leve deste produto — ela
é outro produto, que responde a outra pergunta. Não há o que comparar.

E a economia que ela oferecia já não é economia: sem loja e com build local,
empacotamento, assinatura e auto-update saem da conta de qualquer forma (ver
premissas 4 e 5). O que sobrava a favor — leveza e ausência de navegador — é
preferência, não custo.

Uma consequência de desenho decorre disso e vale explicitar: **se a UI é o
ponto de entrada, ela precisa carregar sozinha a explicação do que o Relay é.**
Quem abre a aplicação pode nunca ter lido o `PROTOCOL.md`. O handoff no centro
da tela faz esse trabalho — mostra o que estava sendo feito, por qual harness,
e o que vem a seguir. Um dashboard de kanban não faz.

Vale notar que a arquitetura proposta **não fecha a porta**: `relay-core` é
puro e sem I/O, então uma TUI o consumiria diretamente, sem passar pelo host.
Se um dia a premissa mudar, o trabalho é de interface, não de fundação.

# 20260907-012 - Execução segura e ciclo de vida

## Problem

O principal fluxo de execução do Relay está coberto por build e testes de
servidor, mas não funciona ponta a ponta. O smoke da PTY no macOS atual fez
`/usr/bin/script` sair com código 1 e sem saída: a implementação usa a forma
GNU `script -q -e -F <fifo> -- ...`, incompatível com o binário BSD presente.
Mesmo que a PTY abrisse, `startExec` repassa `plan.args` sem o elemento
`plan.prompt`, de modo que o processo executado diverge do preflight.

O ciclo de vida também perde verdade. Desanexar fecha o WebSocket que recebe
diffs e reanexar recupera apenas scrollback; as rotas `GET /api/run/<id>` e
`/disk` retornam 404 por parsing incorreto. Runs saem do registro assim que o
processo termina, antes de garantir o último diff. O cliente marca `exited`
otimisticamente ao pedir término. O aviso de teclado aparece depois do spawn e
seu botão “modo externo” apenas apaga o estado local, deixando a execução
embutida viva e invisível.

No modo externo, o wrapper não muda para o `cwd` aprovado no preflight e a
rota pode retornar sucesso quando nenhum terminal foi aberto. Por fim, a
reconexão da spec 007 não sobrevive ao restart padrão: o host volta em outra
porta efêmera, enquanto a aba procura token e WebSocket apenas na origem antiga.

## Scope

- Substituir a emulação atual pela ligação de PTY decidida na ADR-0001 e na
  spec 009, ou supersedir formalmente essa decisão antes de qualquer alternativa.
- Executar exatamente `bin`, `args`, `prompt` e `cwd` aprovados no preflight,
  sem reconstrução divergente e sem shell intermediário.
- Fazer a escolha embutido/externo e o aviso de conflito ocorrerem antes de
  iniciar qualquer processo.
- Corrigir o wrapper externo para entrar no workspace aprovado, registrar
  PID/exit code, falhar de forma observável sem terminal e usar permissões
  restritas nos artefatos de scratch.
- Definir e implementar um ciclo de vida de run que preserve estado concluído,
  scrollback e histórico de diffs até o usuário fechar explicitamente.
- Corrigir e testar as rotas de info, disco, término e listagem por run.
- Entregar ao reattach o snapshot completo de scrollback e diffs acumulados,
  sem lacunas nem duplicação.
- Fazer o tracker reconhecer os estados vazios canônicos dos registros,
  incluindo `No active handoff.`, como `LIMPO`.
- Só anunciar `exited` depois da saída confirmada pelo host e depois do flush
  final do disco; falha de término permanece visível e não vira conclusão.
- Resolver a descoberta/reconexão após restart com porta efêmera; por alterar o
  contrato de transporte, registrar a decisão em ADR antes do código.
- Remover toda superfície de run/terminal quando `--no-exec` estiver ativo.
- Cobrir o fluxo real com testes de integração que iniciem um processo seguro
  e determinístico, desanexem, escrevam, reanexem, terminem e verifiquem saída.

## Non-goals

- Mudar tokens, layout ou aparência dos componentes.
- Parsear stdout do harness para derivar estado do Relay.
- Suportar múltiplos workspaces num processo.
- Multiplexar várias PTYs numa única execução.
- Introduzir retry automático de lançamento de harness.
- Esconder incompatibilidade de plataforma com fallback silencioso.

## Decisions

**O argv aprovado é o argv executado.** `LaunchPlan` é um valor completo; o
adaptador compõe uma vez e os modos embutido e externo consomem exatamente seus
elementos, incluindo `prompt` e `cwd`. O preflight nunca aprova uma
representação que outro caminho remonta depois.

**A decisão vigente de PTY continua valendo.** ADR-0001 e spec 009 nomeiam
`node-pty`. A troca por `/usr/bin/script` foi registrada apenas no changelog e
não supersedeu a decisão arquitetural; portanto não é autoridade. Se houver
razão para manter uma alternativa sem módulo nativo, uma ADR supersede a
decisão primeiro e a solução precisa provar resize, entrada interativa,
scrollback e compatibilidade macOS ponta a ponta.

**Run concluída continua endereçável.** Saída do processo encerra a execução,
mas não apaga imediatamente seus dados. Info, exit code, scrollback e diffs
permanecem disponíveis até o fechamento explícito ou política de limpeza
documentada. Isso permite reattach, flush final e fechamento honesto.

**Reconexão entre processos é contrato, não detalhe do cliente.** Porta
efêmera e token por execução continuam requisitos de segurança. A solução de
descoberta precisa preservar ambos e ser registrada como revisão da ADR-0006
antes da implementação.

## Acceptance criteria

- A-001 - um teste no macOS inicia uma PTY real, envia entrada, recebe saída e
  obtém o exit code correto sem depender da sintaxe GNU de `/usr/bin/script`
- A-002 - o processo embutido recebe o `prompt` como último elemento do argv e
  executa no `cwd` exibido no preflight
- A-003 - o modo externo executa o mesmo plano no workspace aprovado, registra
  PID/exit code pelo wrapper e retorna erro quando nenhum terminal é aberto
- A-004 - a escolha embutido/externo acontece antes do spawn; escolher externo
  não cria nem deixa uma execução embutida viva
- A-005 - `GET /api/run/<id>` e `GET /api/run/<id>/disk` retornam os dados da
  run existente, e uma run desconhecida retorna 404
- A-006 - desanexar não termina o processo; reanexar recupera todo scrollback e
  todos os diffs acumulados durante a ausência, uma vez cada
- A-007 - o último diff é capturado antes da run virar `exited`, e o handoff
  canônico vazio aparece como `LIMPO` com Antes/Depois corretos
- A-008 - pedir término só mostra conclusão depois de o host confirmar a saída;
  erro ou run inexistente não recebe resposta de sucesso nem estado `done`
- A-009 - fechar a aba e reabrir durante uma run viva reanexa à mesma execução
  enquanto o host permanecer ativo
- A-010 - matar e reiniciar o host com a configuração padrão de porta efêmera
  permite que a aba existente descubra a nova origem, obtenha o novo token e
  reconecte sem reload manual
- A-011 - sob `--no-exec`, launch, run e WebSocket de terminal não existem e
  requisições autenticadas recebem 404
- A-012 - os testes atravessam HTTP, WebSocket, executor, PTY e tracker de disco;
  uma suíte verde não depende apenas de doubles nas bordas críticas

## Backlog candidates

- B-020: PTY real executa o LaunchPlan completo e compatível com macOS
- B-021: Lançamento externo honra cwd, falha e artefatos de scratch
- B-022: Ciclo de vida preserva run, scrollback e diffs entre detach e exit
  (needs: B-020)
- B-023: Contrato e implementação de descoberta após restart do relay-host
- B-024: Fluxos de execução cobertos ponta a ponta
  (needs: B-020, B-021, B-022, B-023)

# 20260907-013 - UI, acessibilidade e conformidade

## Problem

A UI compila, mas a revisão encontrou divergências funcionais e visuais nas
superfícies em que o usuário deposita confiança. O PreflightModal atual pode
mostrar um plano antigo enquanto confirma harness ou intenção novos, pois o
preview é assíncrono e o botão não exige correspondência entre o plano exibido
e a revisão atual. O seletor mantém consentimento persistente ao voltar para
“Só esta execução”, usa fixtures de harness instalado como fallback em modo
host e pode deixar a confirmação habilitada quando todos estão ausentes.

A auditoria de acessibilidade registrada na spec 010 também não corresponde ao
comportamento atual. O trap instala `keydown` no overlay, mas não move o foco
para dentro dele; o primeiro Tab continua no conteúdo de trás. Os outros dois
diálogos não prendem nem restauram foco. Faltam landmark principal, `h1`, anúncio
de erros assíncronos e semântica de desconexão.

Na conformidade visual, `Terminal.vue` e o overlay trazem cores literais fora
de `tokens.css`, não existe adaptação das grades de duas/três colunas para
viewport estreita, e a aba Trabalho não oferece `Retomar`/`Começar` por linha
como o design system define. Em estado `ready`, botões de TODO diferentes
enviam a mesma intenção de backlog. `app/README.md` e `app/TODO-BUILD.md`
descrevem um marco anterior como estado atual, e não existe suíte de testes da
UI que impeça essas regressões.

## Scope

- Tornar preview e confirmação atômicos: cada plano carrega a revisão exata de
  harness, skill, intenção e cwd; confirmação fica bloqueada enquanto o plano
  correspondente não estiver disponível.
- Impedir respostas de preview fora de ordem de substituírem o plano vigente e
  mostrar estados de carregamento/erro de forma acessível.
- Extrair seletor de harness e consentimento compartilhado de verdade entre o
  modal e a superfície standalone, sem duplicar marcação e regras.
- Remover persistência local e de sessão ao reduzir o consentimento; validar o
  valor restaurado e nunca inventar harness instalado em modo host.
- Desabilitar confirmação quando nenhum harness executável estiver disponível.
- Implementar foco inicial, contenção, restauração, Escape e fundo inerte nos
  diálogos aplicáveis, mantendo clique fora apenas onde o design autoriza.
- Acrescentar `main`, hierarquia de headings, regiões `aria-live` para mudanças
  assíncronas e nomes/estados acessíveis para abas e seleções.
- Mostrar desconexão claramente, marcar dados antigos como stale e impedir
  ações de execução até o cliente receber estado fresco.
- Alinhar StatusPill e datas ao idioma da interface usando rótulos explícitos e
  `Intl`, sem colocar apresentação no `relay-core`.
- Levar qualquer token, breakpoint ou regra de componente primeiro ao
  `docs/design-system/README.md`, depois a `tokens.css`, ao HTML derivado e ao
  código.
- Remover literais visuais dos componentes, inclusive no tema do xterm, por uma
  ponte explícita de CSS custom properties.
- Definir comportamento responsivo e safe areas para header, handoff, Trabalho,
  modal e modo de execução.
- Entregar ações corretas por linha na aba Trabalho e preservar o ID realmente
  escolhido ao iniciar backlog ou TODO disponível.
- Criar testes de componente/interação para modal, foco, consentimento,
  desconexão, seleção de trabalho e execução; uma nova dependência de teste
  exige ADR antes de entrar.
- Atualizar `app/README.md`, remover ou encerrar `app/TODO-BUILD.md` e registrar
  a nova auditoria por componente com evidência reproduzível.

## Non-goals

- Alterar a gramática ou a derivação de estado do protocolo; isso é a spec 011.
- Implementar PTY, ciclo de vida de run ou descoberta do host; isso é a spec
  012.
- Fazer a UI escrever nos cinco registros Relay.
- Adicionar roteador client-side apenas para sincronizar as duas abas; query
  string ou solução menor continua suficiente enquanto houver só duas visões.
- Escolher silenciosamente um harness “melhor”.
- Criar tema claro ou redesenhar a identidade do produto.

## Decisions

**Preflight só confirma a revisão que está visível.** Alterar intenção ou
harness invalida imediatamente o plano anterior. O botão só volta quando a
resposta da mesma revisão chega; respostas antigas são descartadas. O host
continua autoridade do argv em modo real.

**Fallback de fixture é exclusivo do modo de desenvolvimento.** Falha na
detecção real vira estado de erro/desconectado. Mostrar Claude Code ou Codex
como instalados sem evidência pode induzir lançamento inválido e não é uma
degradação aceitável.

**Diálogo modal assume o foco por construção.** Ao abrir, salva o originador,
move foco para um alvo explícito, torna o restante inerte, prende Tab/Shift+Tab
e restaura foco ao fechar. `aria-modal` sem esse comportamento não conta como
contenção.

**A autoridade visual permanece no design system.** Responsive behavior,
safe-area e a ponte de cores do xterm entram primeiro no README porque hoje não
estão decididos em detalhe suficiente. O código não inventa breakpoint ou
exceção a tokens.

**A estratégia de teste é decisão de construção.** O resultado exigido é uma
suíte que exercite DOM e interações reais. Se isso introduzir Vitest,
Playwright, Testing Library ou equivalente, a escolha e seus custos são
registrados em ADR antes da dependência.

## Acceptance criteria

- A-001 - o botão de executar permanece desabilitado até que a tabela mostre o
  plano da revisão atual; digitar ou trocar harness e confirmar imediatamente
  nunca executa um argv diferente do exibido
- A-002 - respostas assíncronas de preview fora de ordem não substituem o plano
  mais recente, e loading/erro são anunciados por `aria-live`
- A-003 - seletor standalone e PreflightModal usam o mesmo componente de
  harness/consentimento e não duplicam suas regras de estado ou marcação
- A-004 - mudar de consentimento local ou de sessão para “Só esta execução”
  remove o valor persistido; reabrir a página não ressuscita a escolha antiga
- A-005 - em modo host, falha/ausência de detecção não usa fixtures e nenhum
  harness ausente pode ser confirmado para execução
- A-006 - PreflightModal, HarnessSelector e KeyboardWarning recebem foco
  inicial, contêm Tab/Shift+Tab, tornam o fundo inerte e restauram o foco ao
  originador; Escape fecha apenas as superfícies em que não dispara ação
- A-007 - a aplicação possui `main`, `h1`, headings hierárquicos, foco visível e
  nomes/estados acessíveis em todos os controles e abas
- A-008 - queda da conexão fica visível, dados anteriores são identificados
  como desatualizados e nenhuma ação de execução usa estado stale
- A-009 - datas usam `Intl`, statuses têm rótulo humano em português e nenhum
  campo de apresentação é acrescentado ao contrato do core
- A-010 - não há cor, espaçamento ou raio literal fora de `tokens.css`; o tema
  do xterm consome custom properties e overlays usam token documentado
- A-011 - header, handoff, Trabalho, modais e modo de execução permanecem
  legíveis e operáveis em viewport estreita e respeitam safe areas
- A-012 - cada linha acionável da aba Trabalho oferece `Retomar` ou `Começar`,
  e escolher entradas distintas de backlog ou TODO envia o ID correspondente
- A-013 - testes de UI reproduzem preview stale, foco escapando, downgrade de
  consentimento, harness ausente, desconexão e seleção de IDs; cada regressão
  falha sem sua correção
- A-014 - `app/README.md` descreve core, host, WebSocket, lançamento e terminal
  existentes; `app/TODO-BUILD.md` não anuncia tarefas concluídas como disponíveis
- A-015 - a auditoria final registra resultado por componente contra contraste,
  cor+rótulo, foco, alvo de interação, hierarquia, semântica e responsividade

## Backlog candidates

- B-025: Preflight, harness e consentimento representam somente estado real
- B-026: Diálogos e estrutura semântica cumprem acessibilidade por construção
- B-027: Componentes, ações e layouts convergem com o design system
- B-028: Regressões de UI, auditoria e documentação refletem o produto atual
  (needs: B-025, B-026, B-027)

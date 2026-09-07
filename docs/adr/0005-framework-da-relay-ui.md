# ADR-0005 — Framework da `relay-ui`

## Status

**Accepted** — 2026-09-07. Esta é a ADR com maior probabilidade de ser
superada; a seção Notas explica por que isso é aceitável.

## Contexto

A escolha de framework nunca foi decidida. É fácil supor o contrário: o diagrama
da ADR-0001 ponto 1 descreve `relay-ui` como "a interface: HTML, CSS e JS
comuns". Mas ali a frase contrasta com **toolkit nativo** — é a linha que diz
que a UI é web, em oposição a Tauri e Electron. Nenhum dos cinco pontos da
decisão menciona framework.

O `docs/design-system/README.md` seção 8 é explícito na direção oposta:

> A UI é HTML, CSS e JS comuns — **sem framework obrigatório**. Se um framework
> entrar, os tokens continuam sendo a fonte de estilo.

Então a decisão estava em aberto, e o design system já a antecipava.

O que a arquitetura de fato exige, e que restringe a escolha:

- **A UI é projeção de um objeto de estado, não um formulário.** O `relay-core`
  deriva e o `relay-host` empurra; a interface desenha o que chegou e não
  calcula nada (ADR-0003 decisão 3). Caso ideal para renderização declarativa.
- **A janela fecha e reabre; o servidor sobrevive.** A ADR-0001 ponto 3 diz que
  reabrir "reanexa à PTY viva com replay do scrollback". A UI remonta do zero a
  partir do estado com frequência, e reconciliação escrita à mão é onde esse
  tipo de bug mora.
- **O `xterm.js` é o contra-exemplo.** Widget imperativo grande que não pode ser
  re-renderizado; o design system manda isolá-lo no componente Terminal.
- **O estilo é CSS global com classe por componente.** A seção 8 pede um
  `tokens.css` único importado por todos os módulos e nomenclatura
  `status-pill`, `handoff-card`, com estados em sufixo `-is-active`.

## Decisão

### 1. Vue 3

Descartadas: Lit, Preact e React + Vite.

O critério que decide é o último da lista acima. O design system especifica CSS
global com classe por componente, e o template do Vue é HTML — a tradução de um
componente documentado para código é quase mecânica, o que mantém verificável a
regra de governança de que o `README.md` vence sobre o código. JSX fica um passo
mais longe, com `className`, objetos de estilo e a ponte para CSS-em-JS.

**Lit** foi a primeira recomendação e caiu por um motivo específico: seu
diferencial é o shadow DOM, e a seção 8 do design system pede exatamente o
oposto — CSS global com nomes de classe por componente. Dentro de shadow DOM
essa convenção vira vestigial: a classe já está isolada, o prefixo é redundante,
e nada de fora a alcança. Lit em light DOM continua defensável, mas aí é apenas
um renderizador pequeno, e o argumento que o sustentava tinha sumido.

**Preact** perde pelo mesmo motivo do React quanto ao mapeamento HTML, sem
ganhar familiaridade em troca.

**React + Vite** é o maior toolchain das quatro, aplicado à camada que a
arquitetura mais quer poder substituir, e briga com a convenção de CSS global
empurrando para CSS modules ou CSS-em-JS.

### 2. Custo de migração foi considerado e **descartado** como critério

Foi levantado explicitamente: e se um dia for Electron, Rust no host, ou Kotlin
Multiplatform? A análise:

| Migração | O que muda | Custo por framework escolhido |
| --- | --- | --- |
| → Tauri / Electron | a casca carrega a mesma UI na WebView | **zero** — as quatro são web |
| → Rust ou KMP no core/host | o servidor troca de linguagem, serve o mesmo JSON no mesmo WebSocket | **zero** — a UI não sabe quem serve |
| → Compose Multiplatform na UI | não há DOM nem CSS | **reescrita da view** — igual para as quatro |

Nenhuma linha discrimina. A fronteira HTTP+WS da ADR-0001 ponto 1 é o que
carrega esse peso, e ela já existe.

**Por que registrar isso:** durante a discussão o critério foi usado — "escolha
o menor, para que jogar fora não doa". O raciocínio está errado de duas formas.
Primeiro, valor de opção só vale o que custa mantê-lo: otimizar para descarte
barato paga custo certo e contínuo por um benefício incerto e talvez
inexistente. Segundo, a ADR-0001 nunca chamou a view de descartável; ela diz que
a *casca de aplicação* é adiada e reversível, que é outra coisa. A palavra
"descartável" foi introduzida na discussão, não no documento.

O que sobrevive a uma migração não depende do framework: depende de os tokens
morarem num documento (já é o caso), de o contrato ser neutro de linguagem
(ADR-0003) e de a view não conter lógica (decisão 3 abaixo).

### 3. A view não contém lógica

Nenhum componente recalcula `available`, deriva status, conta subtarefas ou
interpreta marcador de checklist. Tudo isso chega pronto no `UiPayload` da
ADR-0003.

**Por quê:** é a regra que faz o item anterior ser verdade, e é a mesma que a
ADR-0001 usa para evitar uma segunda implementação do protocolo. Uma view sem
lógica é barata de substituir porque não guarda nada que valha reter.

### 4. Autoria em SFC com TypeScript

Componentes em arquivos `.vue` com `<script setup lang="ts">`, compilados por
Vite dentro de `app/`.

**Por quê:** a ADR-0003 decisão 2 fez de `inconsistent` uma união discriminada
com o argumento de que "a interface **não consegue** ler `status`, `handoff` ou
`todo` num estado inconsistente — o compilador recusa". Essa garantia é do
TypeScript. Sem checagem de tipo na UI, ela deixa de ser garantia e volta a ser
convenção — exatamente o que a ADR-0002 argumenta contra.

Navegador não faz *type stripping*, então TypeScript no browser exige
compilação. Duas alternativas foram consideradas e descartadas:

- **Vue sem build** (distribuição ESM de navegador, template em string): elimina
  o passo de build, mas obriga JavaScript puro no browser e leva junto a
  garantia da ADR-0003.
- **JavaScript com anotações JSDoc e `tsc --checkJs`**: preserva a checagem sem
  build, e é opção legítima. Descartada pelo custo ergonômico contínuo numa base
  destinada a crescer, contra um benefício — ausência de build — que a decisão 5
  mostra ser menor do que parecia.

### 5. A decisão 3 da ADR-0004 é **estreitada**, não removida

A ADR-0004 decidiu "sem passo de build obrigatório" e previu que a ADR-0005
poderia revisá-la. A revisão é esta, e ela é menor do que parece porque o
propósito daquela decisão era proteger a **instalação das skills**, não proibir
compilação em qualquer lugar.

Passa a valer: nenhum passo de build entre `git clone` e usar as skills;
`app/` tem o próprio, que ninguém precisa executar para instalar ou usar o
Relay. A garantia que importava continua intacta e continua verificável.

## Consequências

### Positivas

- O componente documentado no design system vira template quase sem tradução, o
  que mantém a governança verificável na prática, não só no texto.
- A garantia de tipo da ADR-0003 chega até a interface.
- Ecossistema grande e material de aprendizado abundante, para uma camada que
  alguém vai manter por anos.
- O `xterm.js` fica isolado por `ref` mais a disciplina de não re-renderizar,
  que é convenção — ver o custo abaixo.

### Negativas e custos assumidos

- **Volta um passo de build**, com `node_modules` em `app/`. Mitigado pela
  decisão 5, não eliminado.
- **O isolamento do `xterm.js` é convenção, não estrutura.** Foi o argumento que
  sustentava o Lit, e ele se perde aqui. É a única perda real da escolha, e ela
  só cobra quando o Terminal existir — o que está fora do marco atual.
- Duas convenções de estilo passam a ser possíveis: CSS global, que o design
  system pede, e estilo com escopo do Vue, que ele não pede. A Conformidade
  abaixo fecha isso.
- Vue é dependência de terceiro com ciclo de vida próprio, ao contrário de
  HTML e CSS.

### Consequência descartada explicitamente

Adotar estilo com escopo (`<style scoped>`) por ser o padrão do Vue. O design
system decidiu CSS global com classe por componente, e ele é autoridade sobre o
código. Escolher a conveniência do framework aqui inverteria essa governança.

## Conformidade

1. Nenhum componente calcula o que o `relay-core` deriva: `available`, status,
   contagem de subtarefas e interpretação de marcador chegam prontos.
2. Estilo é CSS global consumindo `tokens.css`. `<style scoped>` não é usado, e
   nenhum valor de cor, espaçamento ou raio aparece literal fora do
   `tokens.css`.
3. Nomes de classe seguem a seção 8 do design system: classe por componente,
   estado em sufixo.
4. O build de `app/` nunca é pré-requisito para instalar ou usar as skills.
5. Nenhum componente escreve nos cinco registros do protocolo, direta ou
   indiretamente.

## Notas

**Esta ADR é a mais provável de ser superada, e isso está no desenho.** O
contrato (ADR-0003) e a estrutura (ADR-0004) foram deliberadamente escritos em
documentos separados e não dependem desta. Supersedir a ADR-0005 troca um
documento e o conteúdo de `app/relay-ui/`, sem tocar no contrato, na estrutura,
na fronteira HTTP+WS nem no design system. A única ligação em sentido inverso é
a decisão 5, que estreita a ADR-0004 decisão 3.

**O que não está decidido aqui.** Gerenciamento de estado no cliente,
roteamento entre as três telas e estratégia de testes de componente. São três
telas e um objeto de estado; decidir isso agora seria decidir sem informação.

**Origem.** A escolha inicial recomendada foi Lit, revista duas vezes durante a
discussão: primeiro quando a seção 8 do design system mostrou que a convenção de
CSS é de light DOM, depois quando o critério de custo de migração se revelou
não-discriminante. As duas revisões estão registradas na decisão 1 e na decisão
2 porque o raciocínio descartado é a resposta a "por que não a outra opção?".

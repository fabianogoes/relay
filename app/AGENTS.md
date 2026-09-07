# Instruções desta pasta

`app/` é a interface do Relay. Ela traz as próprias instruções para não ocupar
contexto no `AGENTS.md` da raiz: você só lê isto quando chega aqui.

A estrutura e a fronteira desta pasta estão em
[`../docs/adr/0004-fronteira-e-estrutura-do-app.md`](../docs/adr/0004-fronteira-e-estrutura-do-app.md).

## Ordem de leitura

1. `../docs/adr/0003-contrato-do-estado-derivado.md` — o formato que o
   `relay-core` produz e a `relay-ui` consome. Leia antes de tocar em qualquer
   dado que atravesse essa fronteira.
2. `../docs/adr/0004-fronteira-e-estrutura-do-app.md` — por que esta pasta
   existe e o que ela não pode fazer.
3. `../docs/design-system/` — autoridade sobre token e componente. A pasta traz
   as próprias instruções; existe a skill `relay-design-system`.
4. `../docs/adr/0001-arquitetura-inicial-da-ui.md` — a fronteira
   `relay-core` / `relay-host` / `relay-ui` e a regra de que a aplicação nunca
   escreve um registro do protocolo.

## O que esta pasta não pode fazer

- **Nunca escrever nos cinco registros.** Nenhum arquivo daqui escreve em
  `.specs/` ou `.orchestration/`, deste repositório ou de qualquer outro. Toda
  mutação passa por uma skill num harness (ADR-0001 ponto 5).
- **Nunca criar `package.json` na raiz do repositório.** A raiz do workspace é
  `app/package.json`. Instalar o Relay não pode exigir `npm install`.
- **Nunca fazer a raiz depender daqui.** `rm -rf app/` tem de devolver o
  repositório a um estado funcional; o único vínculo permitido é o ponteiro de
  uma linha no `AGENTS.md` da raiz.
- **Nunca calcular o que o `relay-core` deriva.** `available`, status e contagem
  chegam prontos. Recalcular na view cria uma segunda implementação do
  protocolo, que é o risco que a ADR-0001 nomeia como dominante.

## Camadas

`skills/` é superfície de pacote e vai pelos manifestos. `app/` é produto e vai
por clone. `.agents/`, `.claude/` e `.opencode/plugin/` são ferramenta deste
repositório e não vão a lugar nenhum.

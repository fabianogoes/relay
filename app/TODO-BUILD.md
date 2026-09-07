# O que falta para a UI do Relay

Documento temporário — não é registro do protocolo. As specs em `.specs/`
já cobrem tudo listado aqui com detalhe; esta é a visão de conjunto rápida.
Apagar quando não for mais necessário.

## Hoje existe

- [x] Contrato do estado derivado (ADR-0003) e tipos TypeScript
- [x] Sete fixtures normativos (`app/fixtures/`)
- [x] `tokens.css` derivado do design system, sem literal fora dele
- [x] Componentes básicos renderizando os sete fixtures

## Backlog e grafo de dependência

```text
B-010 relay-core                              B-012 refinamento visual
  |    (needs: nada)                            |    (needs: nada)
  v                                              |
B-011 relay-host                                |
  |    (needs: B-010)                            |
  +---------------------+                        |
  v                      v                        |
B-013 dado real       B-014 preflight+lançamento  |
  |    e segunda visão   |    (needs: B-011,      |
  |    (needs: B-011)    |     B-012) <-----------+
  |                      v
  |                   B-015 terminal
  |                      (needs: B-014)
  v
B-016 acessibilidade e remanescentes
  (needs: B-012, B-013)
```

`B-010` e `B-012` estão disponíveis agora, em paralelo — nenhuma depende da
outra. Rode `relay-continue` a qualquer momento, em qualquer harness, para
saber o próximo passo determinístico.

## Achado desta sessão: um conflito entre o protótipo e a ADR-0001

O protótipo rotula o seletor de harness como "por quanto tempo lançar **sem
perguntar de novo**". Lido ao pé da letra, isso violaria a Conformidade 6 da
ADR-0001 ("o preflight continua obrigatório em toda execução"). A resolução,
registrada na spec 006: o consentimento controla só se a **escolha de
harness** é lembrada — o `PreflightModal` e o clique de confirmação
continuam obrigatórios sempre, nas três opções. Ver spec 006 e spec 008 para
o detalhe.


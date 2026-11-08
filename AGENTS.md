# WinShell — índice técnico

## Estrutura rápida

| Caminho | Conteúdo |
|---|---|
| `extension.js`, `prefs.js` | entradas do runtime e preferências |
| `modules/` | componentes da extensão |
| `schemas/`, `stylesheet.css` | dados persistentes e apresentação |
| `scripts/`, `tests/` | operação e verificação |
| `docs/` | referência baseada no código |

## Comandos confirmados

```bash
./tests/check.sh
node tests/layouts.test.mjs
./scripts/doctor.sh
```

Todos passaram na geração dos documentos; versões e saídas estão em
`docs/build-and-run.md`. `install.sh` só foi confirmado com `XDG_DATA_HOME`
temporário. Não execute `uninstall.sh` sem conferir o destino: ele desabilita e
remove a extensão.

## Pergunta → documento

| Pergunta | Referência |
|---|---|
| O que existe no repositório? | `docs/repository-map.md` |
| Como os componentes se conectam? | `docs/architecture.md` |
| Como funciona o artefato implantável? | `docs/modules/winshell-extension.md` |
| Quais são os conceitos e estados? | `docs/domain.md` |
| Quais regras estão confirmadas ou abertas? | `docs/business-rules.md` |
| Quais são os fluxos felizes e de erro? | `docs/flows.md` |
| Quais dados existem e quem os usa? | `docs/data-model.md` |
| Como testar, instalar e executar? | `docs/build-and-run.md` |
| Onde estão os riscos? | `docs/technical-risks.md` |
| O que a auditoria confirmou ou deixou aberto? | `docs/open-questions.md` |

## Convenções observadas

- ES modules, quatro espaços e ponto e vírgula em JavaScript.
- Componentes visuais são classes; helpers puros são funções exportadas.
- Configuração persistente nasce no schema e é consumida por GSettings.
- IDs estáveis da documentação: `RN-xx`, `H-xx`, `UC-xx`, `R-xx`.

## Regras de ouro para alterações

- Preserve cleanup de sinais, timers e atores no lifecycle.
- Mudou chave GSettings: atualize schema, preferências, consumidores, testes e docs.
- Mudou contrato/função: atualize todos os chamadores e suas âncoras documentais.
- Mudou comportamento: atualize RN/UC/riscos sem renumerar IDs existentes.
- Afirmação ainda não verificada deve ser `TODO: validar`, nunca fato.
- Execute `./tests/check.sh`; só registre um comando como confirmado se rodou.

## Pendências

- TODO: manter este índice sincronizado quando novos documentos forem adicionados.


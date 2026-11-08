# Auditoria da documentação

Auditoria executada em 2026-11-08 sobre `AGENTS.md` e os nove documentos da
suíte `code-docs`. Foram extraídas 299 âncoras únicas `arquivo:linha`; todas foram
comparadas com o arquivo-fonte e nenhuma aponta para arquivo ausente ou intervalo
inválido. Não foram encontrados erros factuais 🔴 nem drift 🔵 entre documentos.

## Achados de precisão

### Q-01 — Semântica de rejeição do GSettings é inferida

**Classificação:** ⚪ inferência apresentada como fato.

O fluxo UC-10 afirma: “O schema rejeita tipo incorreto e restringe
`panel-height` a `40..88`” (`docs/flows.md:161`). O XML confirma o tipo e a faixa
declarados (`schemas/org.gnome.shell.extensions.winshell.gschema.xml:4`), mas os
testes apenas fazem parse do XML e validam a existência das chaves
(`tests/check.sh:5-10`); eles não tentam gravar tipo/valor inválido via GSettings.

**Onde mais aparece:** a faixa é corretamente descrita como declaração do schema
em `docs/data-model.md`; não há outra afirmação de rejeição executada.

**Ação pendente:** marcar a rejeição como inferência da plataforma ou adicionar
um teste isolado de GSettings antes de apresentá-la como comportamento confirmado.

### Q-02 — Matriz sugere teste de bindings mais forte do que o existente

**Classificação:** 🟡 imprecisão menor.

A matriz afirma: “✅ sintaxe/bindings estruturais” para Preferências
(`docs/build-and-run.md:130`). O teste confirmado valida a sintaxe de `prefs.js`
por `node --check` (`tests/check.sh:21-23`) e verifica um conjunto requerido de
chaves no XML (`tests/check.sh:7-10`), mas não extrai os nomes usados por
`settings.bind`/`get_*` para cruzá-los automaticamente com o schema.

**Onde mais aparece:** `docs/repository-map.md` descreve corretamente o teste como
estrutural/sintático, sem afirmar esse cruzamento.

**Ação pendente:** renomear o status para “sintaxe + chaves requeridas” ou ampliar
`tests/check.sh` para validar todos os bindings de `prefs.js`.

## Pendências de decisão humana

### Q-03 — Ordem e duplicatas em `pinned-apps`

**Classificação:** 🧑 exige decisão humana.

H-01 afirma: “Falta decidir se ordem e duplicatas devem ser preservadas,
normalizadas ou reordenadas” (`docs/business-rules.md:182-188`). O contexto remove
todas as ocorrências do ID selecionado e anexa um novo fixado ao fim
(`modules/contextMenu.js:22-25`), enquanto a preferência grava a sequência digitada
(`prefs.js:30-34`).

**Ação pendente:** definir o contrato de ordem/deduplicação e registrar a resposta
em H-01; se implementada, criar uma nova RN sem renumerar as atuais.

### Q-04 — Estado transitório sem monitores

**Classificação:** 🧑 exige decisão humana.

H-02 pergunta se o estado deve ser aceito ou impedir construção
(`docs/business-rules.md:190-195`). O gerenciador cria uma barra quando
`multi-monitor=false` (`modules/multiMonitor.js:17-22`), mas `_position()` retorna
se não houver monitor (`modules/taskbar.js:118-123`).

**Ação pendente:** decidir o lifecycle esperado durante transições de monitores.

### Q-05 — Tolerância geométrica

**Classificação:** 🧑 exige decisão humana.

H-03 pergunta se `1.000001` é contrato ou detalhe interno
(`docs/business-rules.md:197-202`). A tolerância existe literalmente na validação
(`modules/layoutGeometry.mjs:16`), mas não há comentário ou teste de fronteira que
registre sua intenção.

**Ação pendente:** decidir e testar a política de tolerância.

### Q-06 — Recência global de notificações

**Classificação:** 🧑 exige decisão humana.

H-04 observa que não há comparação de timestamps
(`docs/business-rules.md:204-209`). O código agrega por ordem de sources e aplica
`slice(-30).reverse()` (`modules/notificationCenter.js:14-23`).

**Ação pendente:** definir se “recentes” significa ordem técnica atual ou ordem
cronológica global.

### Q-07 — Escopo da ação “Fechar janelas”

**Classificação:** 🧑 exige decisão humana.

H-05 pergunta se deve haver confirmação ou limitação à janela atual
(`docs/business-rules.md:211-216`). A implementação chama `delete()` em todas as
janelas do app (`modules/contextMenu.js:27-31`).

**Ação pendente:** confirmar a UX desejada e registrar a decisão em H-05.

## Tabela de decisões humanas

| Achado | Decisão | Local para resposta |
|---|---|---|
| Q-03 | ordem e duplicatas de fixados | H-01 em `docs/business-rules.md` |
| Q-04 | comportamento sem monitor | H-02 e `docs/architecture.md` |
| Q-05 | tolerância como contrato | H-03 e teste de geometria |
| Q-06 | critério de recência | H-04 e módulo de notificações |
| Q-07 | confirmação/escopo de fechamento | H-05 e fluxo de UX |

## Confirmações da auditoria

| Item verificado | Resultado |
|---|---|
| 299 âncoras únicas | arquivos e intervalos válidos; conteúdo compatível com a afirmação |
| Identidade `winshell@iklav-tech`, versão 4 e Shell 46 | confirmado em `metadata.json:2-9` |
| Onze chaves do schema | confirmado em `schemas/org.gnome.shell.extensions.winshell.gschema.xml:4-14` |
| Doze módulos internos | confirmado por listagem real e `tests/check.sh:12-15` |
| Cinco templates de layout | confirmado em `modules/layoutGeometry.mjs:3-9` |
| Deduplicação visual por `Set` | confirmado em `modules/taskbar.js:131-139` |
| Limites de 100 apps, 12 previews e 30 notificações | confirmados em `modules/startMenu.js:67`, `modules/windowPreview.js:27` e `modules/notificationCenter.js:23` |
| Cleanup principal de sinais/timers/atores | confirmado em `extension.js:63-76`, `modules/taskbar.js:181-192` e `modules/popup.js:51-55` |
| `./tests/check.sh` | exit `0`; todas as mensagens `OK` registradas em `docs/build-and-run.md` |
| `node tests/layouts.test.mjs` | exit `0`; saída `OK: all graphical layout templates and pixel bounds` |
| `./scripts/doctor.sh` | exit `0`; GNOME 46.0/Wayland detectado |
| Instalação com XDG temporário | exit `0`; arquivos e `gschemas.compiled` presentes; temporário removido |
| Instalação real, enable, preferências e uninstall | explicitamente marcados como não testados, com motivo |
| Seção final de pendências | presente nos nove documentos auditados |
| IDs RN/H/UC/R | únicos e estáveis dentro de cada família |

## Comandos de auditoria

- `./tests/check.sh` — exit `0`.
- `node tests/layouts.test.mjs` — exit `0`.
- `./scripts/doctor.sh` — exit `0`.
- Extração por `rg` + validação de arquivo/faixa por shell —
  `ANCHORS_TOTAL=299`, `ANCHORS_INVALID=0`.
- Contagens por listagem/busca — 12 módulos, 11 chaves e 5 templates.
- `git diff --check` — sem erro em arquivos versionados modificados; os documentos
  novos ainda são untracked, portanto também foram inspecionados diretamente.

## Recomendações

1. Resolver Q-01 e Q-02 antes de tratar a suíte como especificação executável.
2. Priorizar Q-07 pelo potencial de impacto sobre trabalho não salvo.
3. Manter Q-03 a Q-07 com status aberto até decisão explícita; não convertê-las em
   regras confirmadas apenas por inferência.
4. Após qualquer correção, repetir a auditoria e preservar os IDs Q/RN/H/UC/R.

## Pendências

- TODO: aplicar correções somente em uma etapa posterior e rastreável.
- TODO: atualizar este registro quando Q-01 a Q-07 forem resolvidos.


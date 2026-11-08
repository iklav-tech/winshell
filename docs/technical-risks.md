# Riscos técnicos

## R-01 — Ausência de teste de integração com GNOME Shell

**Categoria:** testes. **Severidade:** 🔴 alta.

Os testes executam sintaxe, estrutura, schema e geometria, mas não carregam a
extensão (`tests/check.sh:4-35`). O README reconhece que não houve homologação em
sessão gráfica real e lista um checklist manual (`README.md:3-5`,
`README.md:106-116`). Consequência: regressões de APIs, sinais, layout, foco e
lifecycle podem passar pela suíte atual.

## R-02 — Dependência de superfícies de API do GNOME

**Categoria:** dependências/acoplamento. **Severidade:** 🔴 alta.

O runtime importa recursos do Shell e acessa objetos globais como
`Main.panel.statusArea`, `Main.messageTray.getSources`, `global.display` e atores
do compositor (`extension.js:1-2`, `modules/systemActions.js:32-38`,
`modules/notificationCenter.js:14-18`, `modules/windowPreview.js:27-31`). A própria
implementação classifica notificações como best-effort
(`modules/notificationCenter.js:7-8`). Consequência: pequenas mudanças no Shell
46.x ou em uma futura versão alvo podem quebrar recursos em runtime.

## R-03 — Instalação não transacional

**Categoria:** operações. **Severidade:** 🟡 média.

O instalador cria o destino e copia arquivos em etapas antes de compilar o schema
(`scripts/install.sh:16-19`). Com `set -e`, uma falha intermediária encerra o
script, mas não remove o conteúdo já copiado (`scripts/install.sh:2`,
`scripts/install.sh:16-19`). Consequência: uma instalação parcial pode permanecer
no perfil e ser detectada pelo Shell.

## R-04 — Desinstalação remove recursivamente sem validar conteúdo

**Categoria:** operações/higiene. **Severidade:** 🟡 média.

O destino deriva de XDG/HOME e, existindo como diretório, é removido por
`rm -rf -- "$DEST"` (`scripts/uninstall.sh:3-8`). O UUID é constante, o que limita
o escopo, mas não há validação de metadata/ownership antes da remoção.
Consequência: conteúdo colocado manualmente nesse diretório também será apagado.

## R-05 — Validação de Snap duplicada

**Categoria:** duplicação. **Severidade:** 🟢 baixa.

A condição de janela movível/redimensionável/não fullscreen existe na UI e em
`applyLayout` (`modules/snapLayouts.js:8-10`, `modules/snapLayouts.js:35-39`).
Consequência: uma futura mudança feita em apenas um local pode exibir regiões que
falham ao aplicar ou ocultar janelas que o executor aceitaria.

## R-06 — Ordenação de notificações não é cronológica global

**Categoria:** correção/UX. **Severidade:** 🟡 média.

Itens são agregados na ordem das sources e depois `slice(-30).reverse()`, sem ler
timestamp (`modules/notificationCenter.js:14-23`). Consequência: “últimas” pode
significar ordem de enumeração, não recência entre fontes; isso também é a
hipótese H-04 em `docs/business-rules.md`.

## R-07 — Trabalho síncrono a cada alteração da busca

**Categoria:** desempenho. **Severidade:** 🟡 média.

Cada `text-changed` chama `_populate()` (`modules/startMenu.js:38`), que busca,
filtra e ordena todos os apps instalados antes de limitar a renderização a 100
(`modules/startMenu.js:51-67`). Consequência: catálogos grandes ou metadados lentos
podem causar atraso por tecla na thread da UI.

## R-08 — Multiplicação de observadores e flyouts por monitor

**Categoria:** desempenho/acoplamento. **Severidade:** 🟡 média.

Com `multi-monitor`, cada monitor recebe uma `Taskbar` completa
(`modules/multiMonitor.js:17-22`). Cada barra cria cinco flyouts e um quick panel
que observa dois settings globais (`modules/taskbar.js:31-35`,
`modules/quickSettings.js:15-16`, `modules/systemActions.js:26-29`). Consequência:
uso de atores/sinais cresce com monitores, embora o conteúdo de apps seja igual.

## R-09 — Fechamento em lote sem confirmação

**Categoria:** UX/perda de trabalho. **Severidade:** 🔴 alta.

`Fechar janelas` chama `delete()` em todas as janelas do app imediatamente
(`modules/contextMenu.js:27-31`). A API pode permitir que cada aplicativo confirme
documentos não salvos, mas o projeto não fornece confirmação nem limita a ação à
janela atual. Consequência: um clique contextual tem impacto amplo e depende de
cada aplicativo evitar perda de dados.

## R-10 — Cobertura concentrada apenas na geometria pura

**Categoria:** testes/conhecimento. **Severidade:** 🟡 média.

O único arquivo de teste comportamental importa apenas `layoutGeometry.mjs`
(`tests/layouts.test.mjs:1-2`). Regras de apps, fixados, lifecycle, múltiplos
monitores, notificações e settings são apenas verificadas estruturalmente ou não
são exercitadas (`tests/check.sh:4-19`). Consequência: a maior parte das regras
RN-02 a RN-13 depende de revisão manual.

## Matriz consolidada

| Risco | Categoria | Severidade | Área principal |
|---|---|---|---|
| R-01 | testes | 🔴 | integração GNOME |
| R-02 | dependências/acoplamento | 🔴 | APIs Shell/GI |
| R-03 | operações | 🟡 | instalação |
| R-04 | operações/higiene | 🟡 | desinstalação |
| R-05 | duplicação | 🟢 | Snap Layouts |
| R-06 | correção/UX | 🟡 | notificações |
| R-07 | desempenho | 🟡 | pesquisa |
| R-08 | desempenho/acoplamento | 🟡 | multi-monitor |
| R-09 | UX/perda de trabalho | 🔴 | menu contextual |
| R-10 | testes/conhecimento | 🟡 | regras do runtime |

## Observações finais

Os riscos de maior severidade se concentram na fronteira com o GNOME e nas ações
sobre janelas. A geometria pura está isolada e testada, mas os componentes que
conectam essa geometria ao compositor ainda dependem de validação manual
(`modules/layoutGeometry.mjs:1-23`, `tests/layouts.test.mjs:1-31`,
`modules/snapLayouts.js:8-22`).

## Pendências

- TODO: reavaliar severidades após testes reais e dados de falhas.
- TODO: decidir H-04/H-05 antes de tratar R-06/R-09 como comportamento aceito.
- TODO: adicionar responsáveis e prazos somente quando houver processo de gestão
  de riscos definido para o projeto.


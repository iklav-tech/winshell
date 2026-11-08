# Modelo de dados e integrações

## GSettings da extensão

Schema persistente: `org.gnome.shell.extensions.winshell`, no caminho
`/org/gnome/shell/extensions/winshell/`
(`schemas/org.gnome.shell.extensions.winshell.gschema.xml:3`).

| Campo | Tipo/default | Produtores | Consumidores |
|---|---|---|---|
| `panel-height` | `i`, `54`, faixa `40..88` | schema; bind do spin (`prefs.js:27-29`) | posicionamento/âncora da barra (`modules/taskbar.js:77-81`, `modules/taskbar.js:118-123`) |
| `center-icons` | `b`, `true` | switch (`prefs.js:12-25`); contexto (`modules/contextMenu.js:38-39`) | alinhamento central/start (`modules/taskbar.js:111-113`) |
| `show-clock` | `b`, `true` | switch (`prefs.js:15`, `prefs.js:23-25`) | visibilidade do relógio (`modules/taskbar.js:108`) |
| `show-search` | `b`, `true` | switch (`prefs.js:14`, `prefs.js:23-25`); contexto (`modules/contextMenu.js:40-41`) | criação do botão de busca (`modules/taskbar.js:103-107`) |
| `show-notifications` | `b`, `true` | switch (`prefs.js:16`, `prefs.js:23-25`) | botão do centro de notificações (`modules/taskbar.js:109`) |
| `show-quick-settings` | `b`, `true` | switch (`prefs.js:17`, `prefs.js:23-25`) | botão de quick settings (`modules/taskbar.js:110`) |
| `show-activities-panel` | `b`, `true` | switch (`prefs.js:21`, `prefs.js:23-25`); contexto (`modules/contextMenu.js:42-43`) | painel nativo permanente/temporário (`extension.js:18-29`, `extension.js:58-60`) |
| `multi-monitor` | `b`, `false` | switch (`prefs.js:18`, `prefs.js:23-25`) | quantidade/índice de barras (`modules/multiMonitor.js:10-21`) |
| `snap-layouts` | `b`, `true` | switch (`prefs.js:19`, `prefs.js:23-25`) | ações de contexto e preview (`modules/taskbar.js:158-164`, `modules/windowPreview.js:40-50`) |
| `window-previews` | `b`, `true` | switch (`prefs.js:20`, `prefs.js:23-25`) | conexão dos eventos de hover (`modules/taskbar.js:162-171`) |
| `pinned-apps` | `as`, três IDs default | entry de preferências (`prefs.js:30-34`); menu contextual (`modules/contextMenu.js:20-25`) | ordem/prioridade de menu e barra (`modules/startMenu.js:53-65`, `modules/taskbar.js:131-139`) |

Tipos e defaults da tabela são literais do schema
(`schemas/org.gnome.shell.extensions.winshell.gschema.xml:4-14`). Não há campo
órfão: todos têm ao menos um consumidor no runtime.

## GSettings do desktop

| Schema/campo | Tipo observado | Produtor | Consumidor |
|---|---|---|---|
| `org.gnome.desktop.interface/color-scheme` | string `prefer-dark` ou `default` | `toggleDarkMode` (`modules/systemActions.js:17-19`) | `darkMode` e observador do painel (`modules/systemActions.js:13-14`, `modules/systemActions.js:26-29`) |
| `org.gnome.desktop.notifications/show-banners` | boolean | `toggleDoNotDisturb` (`modules/systemActions.js:21-24`) | `doNotDisturb` e observador (`modules/systemActions.js:21-29`) |

## Templates e regiões de layout

| Campo/posição | Tipo | Produtor | Consumidor |
|---|---|---|---|
| `template.id` | string única nos dados atuais | constante `TEMPLATES` (`modules/layoutGeometry.mjs:3-9`) | teste de unicidade (`tests/layouts.test.mjs:3-5`) |
| `template.label` | string de apresentação | constante `TEMPLATES` | label e acessibilidade do painel (`modules/snapLayouts.js:44-53`) |
| `template.regions` | array de regiões | constante `TEMPLATES` | UI, aplicação e testes (`modules/snapLayouts.js:50-61`, `tests/layouts.test.mjs:7-25`) |
| `region[0..3]` | números `[x,y,w,h]` normalizados | constante ou chamador de `regionToPixels` | validação/conversão (`modules/layoutGeometry.mjs:11-22`) e alocação visual (`modules/snapLayouts.js:72-81`) |
| retângulo | `{x,y,width,height}` em pixels | `regionToPixels` (`modules/layoutGeometry.mjs:17-22`) | `move_resize_frame` (`modules/snapLayouts.js:12-17`) |

As regiões compõem templates; elas não possuem ID próprio. A relação com uma
janela existe apenas durante o callback do botão (`modules/snapLayouts.js:50-58`).

## Projeções efêmeras do GNOME

| Estrutura | Campos lidos | Produtor | Consumidor |
|---|---|---|---|
| aplicativo | ID, nome, app info, janelas, estado | `Shell.AppSystem` (`modules/apps.js:3-18`) | Iniciar e barra (`modules/startMenu.js:51-82`, `modules/taskbar.js:131-153`) |
| app info | descrição, executável, keywords | `.desktop` via app (`modules/startMenu.js:57-60`) | filtro e descrição da busca (`modules/startMenu.js:56-76`) |
| janela | título, monitor, work area, flags, textura | GNOME/compositor | preview e snap (`modules/windowPreview.js:27-38`, `modules/snapLayouts.js:8-18`) |
| `{source, notification}` | `source.title`, `notification.title/body` | `Main.messageTray` (`modules/notificationCenter.js:14-23`) | cartões truncados (`modules/notificationCenter.js:38-45`) |
| monitor | `x`, `y`, `width`, `height` | `Main.layoutManager.monitors` | popup/barra (`modules/popup.js:28-40`, `modules/taskbar.js:118-123`) |

Essas estruturas não são serializadas pelo projeto; são referências efêmeras às
APIs do Shell.

## Relacionamentos

```text
GSettings.pinned-apps[] --ID .desktop--> Shell.App --possui--> Meta.Window[]
TEMPLATES[] --compõe--> region[] --converte--> rectangle --aplicado a--> Meta.Window
Taskbar --vinculada por índice--> monitor
messageTray --fornece--> source[] --contém--> notification[]
```

As relações são materializadas em `modules/taskbar.js:131-143`,
`modules/snapLayouts.js:11-17`, `modules/taskbar.js:77-81` e
`modules/notificationCenter.js:14-23`.

## Persistência e arquivos

Sobrevivem ao processo apenas os GSettings da extensão e os dois GSettings do
desktop alterados por quick settings (`prefs.js:23-33`,
`modules/systemActions.js:4-24`). A instalação também persiste uma cópia dos
arquivos do projeto e o binário `gschemas.compiled` no XDG data home
(`scripts/install.sh:5-19`).

A ausência de outra persistência foi verificada por busca por APIs/termos de
storage, banco, arquivos, rede e escrita em todos os `.js`, `.mjs` e `.sh`.
No runtime JS não há API de arquivo, banco, cache web, cookie ou rede. O script de
teste apenas lê arquivos do repositório (`tests/check.sh:4-18`); o diagnóstico lê
comandos e journal (`scripts/doctor.sh:4-12`).

## Contratos entre módulos

Não há DTO, HTTP, mensagem ou schema de serialização. Os contratos são chamadas
locais por referência:

- `TaskbarManager(settings, menu, panelController, index implícito na criação da barra)`
  constrói `Taskbar(settings, menu, panelController, index)`
  (`modules/multiMonitor.js:4-21`, `modules/taskbar.js:14-20`).
- `ContextMenu.forApp(app, anchorX, bottomY, openSnap)` recebe app e callback
  (`modules/contextMenu.js:18-33`).
- `SnapLayoutPanel.forWindow(win, anchorX, bottomY)` recebe uma janela
  (`modules/snapLayouts.js:30-39`).
- `regionToPixels(area, region, inset=0)` retorna retângulo ou `null`
  (`modules/layoutGeometry.mjs:11-23`).

## Dados sensíveis

A busca por `password`, `secret`, `token`, credenciais e chaves não encontrou
campos correspondentes no código. Títulos de janelas, nomes de apps, corpos de
notificação e logs recentes podem conter dados pessoais; eles são lidos e exibidos
localmente (`modules/windowPreview.js:18-38`, `modules/notificationCenter.js:38-45`,
`scripts/doctor.sh:10-12`). O código inspecionado não os transmite pela rede.

## Pendências

- TODO: confirmar onde o backend GSettings persiste esses schemas na distribuição
  alvo; isso é responsabilidade da plataforma, não definida no repositório.
- TODO: validar se títulos/corpos precisam de política adicional de privacidade em
  previews, notificações e diagnóstico.
- TODO: documentar campos adicionais caso novos contratos externos sejam criados.


# Domínio

## Conceitos centrais

| Termo do código | Definição observada | Evidência |
|---|---|---|
| `app` | Aplicativo conhecido por `Shell.AppSystem`, com ID, nome, janelas e ações de ativação/abertura | `modules/apps.js:3-25` |
| `window` / `win` | Janela de aplicativo que pode ser focada, minimizada, fechada ou reposicionada | `modules/taskbar.js:140-153`, `modules/snapLayouts.js:8-18` |
| `pinned-apps` / `favorites` | Lista persistida de IDs `.desktop`; determina apps fixados e prioridade no Iniciar | `schemas/org.gnome.shell.extensions.winshell.gschema.xml:14`, `modules/startMenu.js:53-65` |
| `Taskbar` / `bar` | Barra inferior vinculada a um índice de monitor, contendo áreas esquerda, central e direita | `modules/taskbar.js:14-30`, `modules/multiMonitor.js:9-22` |
| `PopupSurface` | Ator visual ocultável, posicionado acima da barra dentro do monitor que contém a âncora | `modules/popup.js:6-47` |
| `StartMenu` | Popup que pesquisa apps e oferece atalhos fixos para Configurações e Arquivos | `modules/startMenu.js:8-18`, `modules/startMenu.js:51-95` |
| `SnapLayoutPanel` | Popup que apresenta templates e aplica uma região à janela selecionada | `modules/snapLayouts.js:25-83` |
| `template` | Layout nomeado composto por regiões normalizadas | `modules/layoutGeometry.mjs:1-9` |
| `region` | Tupla `[x, y, width, height]` em coordenadas normalizadas, convertida para pixels | `modules/layoutGeometry.mjs:11-23` |
| `monitor` / `work area` | Área física escolhida pela barra ou área útil usada para posicionar uma janela | `modules/taskbar.js:77-81`, `modules/snapLayouts.js:11-12` |
| `settings` | GSettings da extensão, compartilhado por runtime, preferências e menus | `extension.js:41-49`, `prefs.js:7-33` |
| `native menu` | Menu do calendário ou quick settings pertencente ao painel GNOME | `modules/systemActions.js:32-38` |
| `notification` | Item somente lido de uma `source` do `Main.messageTray` | `modules/notificationCenter.js:7-23` |

## Relações

- Um `TaskbarManager` possui zero ou mais `Taskbar` em `_bars`; ele destrói as
  anteriores antes de reconstruir uma ou uma por monitor
  (`modules/multiMonitor.js:9-22`).
- Uma `Taskbar` compõe cinco superfícies: `ContextMenu`, `QuickSettingsPanel`,
  `SnapLayoutPanel`, `WindowPreview` e `NotificationCenter`
  (`modules/taskbar.js:31-35`).
- Uma `WindowPreview` referencia um `SnapLayoutPanel` e pode encaminhar uma `win`
  para ele (`modules/windowPreview.js:7-13`, `modules/windowPreview.js:40-49`).
- Um `template` contém `regions`; cada região vira um botão cuja ação chama
  `applyLayout(win, region)` (`modules/snapLayouts.js:44-61`).
- Um `app` possui janelas; o clique na barra minimiza a janela focada ou ativa o
  app (`modules/taskbar.js:141-153`).
- `pinned-apps` referencia apps por ID, não contém objetos de aplicativo
  (`modules/taskbar.js:131-139`).
- `settings` controla visibilidade, alinhamento, dimensões e features; a barra
  reage às mudanças relevantes (`modules/taskbar.js:62-65`,
  `modules/taskbar.js:93-115`).

## Vocabulário cruzado

| Conceito | Schema/preferências | Barra/menu | Apps/sistema | Snap/preview |
|---|---|---|---|---|
| aplicativo | `pinned-apps`, “Aplicativos fixados” (`prefs.js:30-33`) | `app`, `apps`, “Fixar na barra” (`modules/contextMenu.js:18-27`) | `app`, `AppSystem` (`modules/apps.js:3-25`) | `app` é o dono das `windows` (`modules/windowPreview.js:15-27`) |
| janela | não há chave própria | `windows`, `focus_window` (`modules/taskbar.js:140-152`) | `get_windows()` (`modules/apps.js:22-23`) | `win`, “Janela”, “Organizar janela” (`modules/snapLayouts.js:30-36`) |
| app fixado | “Aplicativos fixados” (`prefs.js:30-34`) | `pinned`, `pinned-apps` (`modules/contextMenu.js:20-25`) | identificado pelo ID (`modules/apps.js:5-6`) | não se aplica |
| área visual | `panel-height` (`prefs.js:27-29`) | `monitor`, `anchor`, `bottomY` (`modules/taskbar.js:77-81`) | não se aplica | `work_area`, `rectangle`, `region` (`modules/snapLayouts.js:11-16`) |
| popup | não se aplica | `_context`, `_quick`, `_snap`, `_preview`, `_notifications` (`modules/taskbar.js:31-35`) | `native menu` (`modules/systemActions.js:32-38`) | `SnapLayoutPanel`/`WindowPreview` herdam `PopupSurface` (`modules/snapLayouts.js:25`, `modules/windowPreview.js:7`) |

## Estados e ciclos de vida

### Extensão

O estado desabilitado não mantém atores: `disable()` destrói barra, menu e
controller e limpa referências (`extension.js:63-76`). No enable, o código
captura a visibilidade original do painel antes de criar os componentes
(`extension.js:41-50`). Uma falha durante a criação força o mesmo cleanup e é
relançada (`extension.js:51-55`).

### Aplicativo/janela na barra

Um botão pode estar sem janelas, `winshell-running` quando há janelas e
`winshell-active` quando a janela focada pertence ao app
(`modules/taskbar.js:140-148`). Ao clicar, a janela focada e não minimizada passa
a minimizada; nos demais estados o app é ativado (`modules/taskbar.js:149-153`).

### Popup e preview

`PopupSurface` alterna entre oculto/visível e fecha por clique externo ou Escape
(`modules/popup.js:10-25`, `modules/popup.js:44-49`). A pré-visualização tem um
estado intermediário pendente por 450 ms, cancelável antes de aparecer
(`modules/windowPreview.js:62-73`).

### Barra por monitor

O gerenciador reconstrói toda a coleção quando monitores ou `multi-monitor`
mudam (`modules/multiMonitor.js:10-22`), e desconecta ambos os sinais ao ser
destruído (`modules/multiMonitor.js:24-29`).

## Fora do domínio implementado

- O código não organiza automaticamente as outras janelas após aplicar uma região;
  `applyLayout` recebe e altera apenas uma `win` (`modules/snapLayouts.js:8-18`).
- O projeto não implementa rede, Bluetooth ou áudio; abre Settings ou o menu
  nativo (`modules/quickSettings.js:36-50`, `modules/systemActions.js:32-38`).
- O centro não persiste nem remove notificações; apenas lê até trinta itens das
  fontes atuais (`modules/notificationCenter.js:14-23`).
- A busca não lê documentos nem web; a coleção vem de `get_installed()`
  (`modules/apps.js:9-14`) e os campos pesquisados são metadados do app
  (`modules/startMenu.js:56-60`).
- Preferências não gerenciam instalação, atualização ou versão; apenas fazem
  bind nas chaves do schema (`prefs.js:7-37`).

## Pendências

- TODO: decidir se “fixado”, `pinned` e `favorites` devem ser uniformizados no
  código e na documentação futura.
- TODO: validar quais estados de janela o compositor pode introduzir além dos
  tratados (`fullscreen`, `minimized`, foco, move/resize permitido).
- TODO: confirmar a semântica de notificações exposta por cada source no GNOME 46.


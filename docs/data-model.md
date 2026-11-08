# Modelo de dados e integrações

## GSettings da extensão

O schema `org.gnome.shell.extensions.winshell` mantém 25 campos: treze legados preservados e doze visuais adicionados em v0.5.0.

| Campo | Tipo/default | Uso |
|---|---|---|
| `panel-height` | int 54, 40..88 | tamanho/âncoras |
| `center-icons` | bool true | alinhamento |
| `show-clock` | bool true | relógio |
| `show-search` | bool true | pesquisa |
| `show-notifications` | bool true | sino |
| `show-quick-settings` | bool true | botão de sistema |
| `show-activities-panel` | bool true | painel superior |
| `multi-monitor` | bool false | quantidade de barras |
| `snap-layouts` | bool true | ações Snap |
| `window-previews` | bool true | previews |
| `taskbar-conflict-handling` | string `automatic` | `automatic`, `warn-only` ou `disabled` |
| `managed-taskbar-extensions` | string array vazio | UUIDs desativados pelo WinShell, estado interno de restauração |
| `pinned-apps` | string array | IDs `.desktop` |
| `appearance-mode` | string `follow-system` | `follow-system`, `light`, `dark` |
| `visual-preset` | string `balanced` | contraste/transparência do Shell |
| `icon-theme` | string `WinShell` | tema aplicado explicitamente |
| `wallpaper-selection` | string `synchronized` | sync, light, dark ou custom |
| `custom-wallpaper-uri` | string vazia | URI escolhida pelo usuário |
| `background-style` | string `zoom` | posicionamento GNOME |
| `sync-system-appearance` | bool false | autorização para color scheme/GTK |
| `desktop-icons-enabled` | bool false | integração DING solicitada |
| `desktop-show-home` | bool true | Home no DING |
| `desktop-show-trash` | bool true | Lixeira no DING |
| `desktop-show-volumes` | bool true | volumes no DING |
| `nautilus-integration-enabled` | bool false | flag do plugin opcional |

A v0.4.2 adicionou as duas chaves de conflito sem remover ou renomear campos existentes. A v0.5.0 preserva todas elas e adiciona seleção de tema/preset, ícones, wallpaper/posição, sincronização explícita, controles DING e estado da integração Nautilus.

## Backup de aparência v1

`$XDG_CONFIG_HOME/winshell/appearance-backup-v1.json` contém `version`, mapas `original` e `applied`, lista `changed` e marcador `restored`. Os valores são representações GVariant retornadas por `gsettings`, evitando conversão de tipos. O helper ignora schemas/chaves ausentes e escreve atomicamente com permissão 0600.

O backup só contém `org.gnome.desktop.interface`, `org.gnome.desktop.background` e, se solicitado/disponível, `org.gnome.shell.extensions.ding`. Não contém credenciais, dados de aplicativos ou arquivos do usuário.

## Estado efêmero de sistema

| Projeção | Origem | Campos principais |
|---|---|---|
| Wi‑Fi | `NM.Client/DeviceWifi/AccessPoint` | disponibilidade, hardware, enable, SSID, força, conhecido, ativo |
| Bluetooth | gnome-bluetooth + rfkill | adapter, enable, bloqueio, alias, conectado/conectável |
| Áudio | GVC | sink default, volume, mudo, sinks disponíveis |
| Brilho | `org.gnome.SettingsDaemon.Power.Screen` | inteiro 0..100 ou indisponível |
| Bateria | `org.freedesktop.UPower.Device` | presença, percentual, state |
| Desktop | GSettings interface/notifications | tema escuro, show-banners |

`quickSettingsModel.mjs` normaliza percentuais e defaults. Objetos de ação (AP/device) ficam somente em maps efêmeros do adaptador.

## Calendário

`calendarModel.mjs` usa `{year, month, day, inMonth, key}`. `month` é zero-based. A grade sempre contém seis semanas de sete dias; não há persistência da seleção.

## Notificações

Cada projeção retém referência à `source` e `notification`, app ID/nome, título, corpo sanitizado e timestamp. `notificationModel.mjs` ordena globalmente e agrupa; nenhuma informação é escrita em arquivo ou banco.

## Apps, janelas e layouts

```text
GSettings.pinned-apps[] -> Shell.App -> Meta.Window[]
TEMPLATES[] -> region[x,y,w,h] -> rectangle -> Meta.Window
messageTray -> Source[] -> Notification[]
```

Metadados `.desktop` também fornecem ações específicas ao menu contextual.

## Persistência e privacidade

Persistem apenas GSettings, o backup de aparência, o flag Nautilus e os arquivos instalados. Corpos de notificação e títulos de janela podem conter dados pessoais, mas ficam no processo local e não são transmitidos pela extensão. Senhas/segredos não são coletados.

O registro `managed-taskbar-extensions` não representa todas as extensões instaladas: contém exclusivamente docks que a política Automatic assumiu como responsabilidade temporária. Entradas desinstaladas são descartadas; entradas não restauráveis permanecem para nova tentativa.

## Contratos

- `TaskbarManager(settings, menu)` compartilha `SystemControls` com `Taskbar(settings, menu, controls, monitorIndex)`.
- `ContextMenu.forApp(app, x, y, openSnap)`.
- `SnapLayoutPanel.forWindow(win, x, y)`.
- `calendarGrid`, `groupNotifications`, `windowCapabilities`, `normalizeQuickState`,
  `searchApplications`, `togglePinnedApp` e `taskbarPrimaryAction` são funções
  puras testadas.
- `planTaskbarConflicts`, `taskbarGeometry` e `taskbarMonitorIndexes` são funções puras testadas.

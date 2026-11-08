# Modelo de dados e integrações

## GSettings da extensão

O schema `org.gnome.shell.extensions.winshell` mantém onze campos:

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
| `pinned-apps` | string array | IDs `.desktop` |

Não houve mudança de schema na v0.4.1.

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

Persistem apenas GSettings e os arquivos instalados. Corpos de notificação e títulos de janela podem conter dados pessoais, mas ficam no processo local e não são transmitidos pela extensão. Senhas/segredos não são coletados.

## Contratos

- `TaskbarManager(settings, menu)` compartilha `SystemControls` com `Taskbar(settings, menu, controls, monitorIndex)`.
- `ContextMenu.forApp(app, x, y, openSnap)`.
- `SnapLayoutPanel.forWindow(win, x, y)`.
- `calendarGrid`, `groupNotifications`, `windowCapabilities` e `normalizeQuickState` são funções puras testadas.

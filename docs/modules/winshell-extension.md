# Módulo: extensão WinShell

## 1. Responsabilidade

Este é o único módulo implantável do repositório. Ele adiciona barra inferior,
menu de aplicativos, flyouts, visualização de janelas e Snap Layouts ao GNOME
Shell, e restaura seus recursos ao ser desabilitado (`extension.js:40-76`). A
compatibilidade declarada é GNOME Shell 46 (`metadata.json:5-9`).

## 2. Entradas

| Origem | Formato literal | Validação/tratamento |
|---|---|---|
| GNOME | chamadas `enable()` e `disable()` | Erros no enable geram ``[WinShell] Falha ao iniciar: ${error.stack ?? error}``, fazem cleanup e são relançados (`extension.js:41-55`) |
| GSettings da extensão | `i`, `b` e `as` nas onze chaves | `panel-height` tem faixa `40..88`; os demais tipos/defaults vêm do schema (`schemas/org.gnome.shell.extensions.winshell.gschema.xml:3-15`) |
| Catálogo de apps | `Shell.AppSystem` e metadados `.desktop` | Itens ocultos e apps nulos são removidos (`modules/apps.js:9-14`) |
| Pesquisa | texto livre da entrada | `trim()` + lowercase; busca em nome, descrição, executável e keywords (`modules/startMenu.js:51-65`) |
| Janela para snap | objeto `Meta.Window` + região `[x,y,w,h]` normalizada | Rejeita janela imóvel, não redimensionável/fullscreen e região inválida (`modules/snapLayouts.js:8-13`, `modules/layoutGeometry.mjs:11-21`) |
| Eventos de UI | clique, botão secundário, hover, Escape | Eventos são filtrados antes das ações (`modules/taskbar.js:52-60`, `modules/popup.js:18-25`) |

## 3. Saídas

Saídas de sucesso observáveis:

- relógio literal `HH:MM\nDD/MM/YYYY` (`modules/taskbar.js:176-179`);
- cabeçalho de busca `Resultados (${this._matches.length})` ou
  `Fixados e aplicativos` (`modules/startMenu.js:66`);
- instalação imprime `Instalado em: $DEST` e os próximos comandos
  (`scripts/install.sh:20-23`);
- remoção imprime `Extensão removida.` ou `Extensão não encontrada.`
  (`scripts/uninstall.sh:8`).

Saídas de erro/fallback literais:

- `ERRO: GNOME Shell não detectado. Execute no Ubuntu com GNOME.`
  (`scripts/install.sh:6-8`);
- `ERRO: Esta versão foi criada para GNOME 46 (detectado: ...).`
  (`scripts/install.sh:9-12`);
- `ERRO: instale libglib2.0-dev-bin.` (`scripts/install.sh:13-15`);
- `Aplicativo não encontrado: ${id}` (`modules/systemActions.js:7-10`);
- `Esta janela não pode ser reorganizada.` (`modules/snapLayouts.js:33-38`);
- `O aplicativo não aceitou o posicionamento solicitado.`
  (`modules/snapLayouts.js:54-58`);
- `Nenhum aplicativo encontrado` (`modules/startMenu.js:84-85`);
- `Nenhuma janela aberta` (`modules/windowPreview.js:19-22`).

## 4. Componentes e funções principais

| Componente | Papel |
|---|---|
| `WinShellExtension` | ciclo de vida e painel superior (`extension.js:40-76`) |
| `TaskbarManager` | topologia de monitores (`modules/multiMonitor.js:4-29`) |
| `Taskbar` | composição e interação principal (`modules/taskbar.js:14-193`) |
| `StartMenu` | pesquisa e lançamento (`modules/startMenu.js:13-100`) |
| `PopupSurface` | base comum de flyouts (`modules/popup.js:6-55`) |
| `applyLayout` / `regionToPixels` | aplicação no compositor e cálculo puro (`modules/snapLayouts.js:8-23`, `modules/layoutGeometry.mjs:11-23`) |
| `WinShellPreferences` | edição das configurações (`prefs.js:6-38`) |

## 5. Dependências internas e externas

```text
extension.js
├── StartMenu ── Apps / PopupSurface / SystemActions
└── TaskbarManager ── Taskbar
    ├── Apps / SystemActions
    └── ContextMenu / QuickSettings / NotificationCenter
        / WindowPreview ── SnapLayoutPanel ── layoutGeometry
```

As arestas correspondem aos imports em `extension.js:3-4`,
`modules/startMenu.js:4-6`, `modules/multiMonitor.js:2` e
`modules/taskbar.js:6-12`. As dependências externas efetivamente referenciadas são
GNOME Shell resources e GI (`St`, `Clutter`, `Gio`, `GLib`, `Shell`, `Meta`,
`Adw`, `Gtk`); a verificação por import/referência está detalhada em
`docs/repository-map.md`.

## 6. Dados manipulados

- Configuração persistente: onze chaves sob
  `/org/gnome/shell/extensions/winshell/` (`schemas/org.gnome.shell.extensions.winshell.gschema.xml:3-15`).
- Aplicativos: ID, nome, descrição, executável, palavras-chave e janelas
  (`modules/startMenu.js:53-80`, `modules/apps.js:5-25`).
- Janelas: foco, minimização, título, textura, monitor e work area
  (`modules/taskbar.js:140-152`, `modules/windowPreview.js:27-38`,
  `modules/snapLayouts.js:8-17`).
- Notificações: fonte, título e corpo sanitizado/truncado
  (`modules/notificationCenter.js:14-23`, `modules/notificationCenter.js:38-45`).
- Layouts: cinco templates de regiões normalizadas
  (`modules/layoutGeometry.mjs:3-9`).

## 7. Efeitos colaterais

- Adiciona atores ao chrome do Shell, incluindo strut da barra
  (`modules/taskbar.js:22-30`, `modules/popup.js:10-12`).
- Oculta/mostra o painel nativo (`extension.js:18-29`, `extension.js:58-60`).
- Altera GSettings da extensão e do desktop
  (`modules/contextMenu.js:20-25`, `modules/systemActions.js:17-24`).
- Lança aplicativos `.desktop`, ativa/minimiza/fecha/move/redimensiona janelas
  (`modules/systemActions.js:7-10`, `modules/taskbar.js:149-153`,
  `modules/snapLayouts.js:14-18`).
- A instalação escreve no diretório de extensões e compila schemas
  (`scripts/install.sh:5-19`); a desinstalação desabilita e remove esse diretório
  (`scripts/uninstall.sh:4-8`).
- Emite logs/notificações do Shell em falhas (`extension.js:51-54`,
  `modules/snapLayouts.js:19-21`, `modules/snapLayouts.js:54-58`).

## 8. Testes

`tests/check.sh` verifica identidade, chaves, módulos, versão do README, sintaxe
JS/Bash, geometria e schema quando as ferramentas estão disponíveis
(`tests/check.sh:4-35`). `tests/layouts.test.mjs` cobre quantidade/IDs, limites,
cobertura, não sobreposição e entradas inválidas (`tests/layouts.test.mjs:3-31`).
Resultados executados nesta sessão ficam em `docs/build-and-run.md`.

## 9. Configuração e execução

O runtime requer que `metadata.json`, fontes, módulos, stylesheet e schemas sejam
copiados para `${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/winshell@iklav-tech`
(`scripts/install.sh:3-19`). O instalador aceita somente GNOME major 46
(`scripts/install.sh:6-15`). Preferências são abertas por
`gnome-extensions prefs 'winshell@iklav-tech'` (`scripts/install.sh:23`).

## 10. Módulos relacionados

Não há outro artefato aplicativo no repositório. O módulo consome diretamente
GNOME Shell/GI. Em runtime, delega calendário e quick settings aos menus nativos
(`modules/systemActions.js:32-38`) e lança Settings, Nautilus, Wi-Fi, Bluetooth e
Extensions por IDs `.desktop` (`modules/startMenu.js:8-11`,
`modules/quickSettings.js:36-46`, `modules/contextMenu.js:32-44`). Node.js e Python
são consumidores apenas de teste, não dependências do runtime
(`tests/check.sh:4-26`).

## Pendências

- TODO: homologar as entradas, saídas e efeitos visuais em GNOME Shell 46 real.
- TODO: exercitar instalação e remoção em ambiente descartável antes de release.
- TODO: adicionar testes de lifecycle, sinais, GSettings e APIs privadas/best-effort.


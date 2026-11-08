# Build, testes e execução

## Ambiente observado em 2026-11-08

| Item | Valor |
|---|---|
| GNOME Shell | 46.0 |
| Sessão / desktop | Wayland / ubuntu:GNOME |
| GJS | 1.80.2 |
| Node.js | v22.23.1 |
| GLib schemas | disponível |

O ambiente tem a sessão alvo, mas a extensão do repositório não foi instalada no perfil real nem habilitada durante esta entrega; portanto não há homologação visual/runtime.

## Suíte confirmada

```bash
./tests/check.sh
```

Exit code 0:

```text
OK: metadata, GSettings XML, módulos, imports, lifecycle e versão
OK: sintaxe dos arquivos JavaScript
OK: calendar navigation, alignment, leap year and locale
OK: context menu window visibility, capabilities and state labels
OK: all graphical layout templates and pixel bounds
OK: notification grouping, sanitization and snapshot lifecycle
OK: quick settings normalization, bounds and external synchronization snapshots
OK: taskbar conflict detection, policies and reversible state
OK: taskbar bottom anchoring and unique monitor topology
OK: modelos, Snap Layouts, conflitos e geometria da barra de tarefas
OK: esquema GSettings validado
OK: sintaxe dos scripts Bash
```

O script executa `node --check` em entradas/módulos, todos os `*.test.mjs`, `glib-compile-schemas --strict --dry-run`, validação XML/metadata/imports/docs e `bash -n`.

## Instalação isolada confirmada

```bash
XDG_DATA_HOME=/tmp/winshell-v042-install.dYj9Qu ./scripts/install.sh
```

Exit code 0. Foram conferidos metadata, entradas, CSS, os 21 módulos, XML e `gschemas.compiled` no destino temporário, removido após a checagem. Isso valida o empacotamento por cópia e compilação, não o enable no Shell.

## Diagnóstico confirmado

```bash
./scripts/doctor.sh
```

Exit code 0; detectou `gnome-shell`, `gnome-extensions`, `glib-compile-schemas`, GNOME 46.0, Wayland e `ubuntu:GNOME`. A saída continha linhas históricas de stack de `PopupSurface` da instalação v0.4.1 já ativa no perfil; a v0.4.2 do repositório não foi instalada nessa sessão, portanto essas linhas não validam nem reprovam a alteração atual.

## Pacote GNOME confirmado

`gnome-extensions pack --force --extra-source=modules --schema=...` produziu `winshell@iklav-tech.shell-extension.zip` em `/tmp`. `unzip -l` confirmou metadata, entradas, CSS, os 21 módulos e o schema (28 entradas no total); o diretório temporário foi removido. Esse teste valida a composição do bundle, não sua ativação.

## Checagem GJS adicional

`calendar.js` pôde ser carregado por GJS com typelibs/resources do Shell pré-carregados. O carregamento standalone de `systemControls.js` chegou ao grafo interno do GNOME Shell, mas parou em `endSessionDialog.js` porque o processo `gjs` isolado não inicializa os globais de tradução do Shell (`C_`). Esse resultado não é classificado como falha da extensão nem como teste runtime aprovado; o módulo deve ser carregado dentro do processo GNOME Shell.

## Não executado

- instalação no `XDG_DATA_HOME` real;
- `gnome-extensions enable/disable`;
- janela de preferências;
- controles D-Bus/GVC em interação real;
- checklist visual multi-monitor/Wayland;
- os dez cenários runtime de conflito, restart, fullscreen e reativação manual;
- `uninstall.sh`, pois remove a instalação do usuário.

## Comandos para validação manual

```bash
./scripts/install.sh
# encerrar e entrar novamente na sessão Wayland
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
journalctl --user -f | grep -i winshell
```

Siga o checklist do README e desabilite a extensão antes de substituir arquivos durante novos testes.

# Build, testes e execução — v0.5.1

## Ambiente observado em 2026-11-08

| Item | Valor |
|---|---|
| GNOME Shell | 46.0 |
| Sessão / desktop | Wayland / ubuntu:GNOME |
| Node.js | disponível |
| GLib schemas | disponível |
| DING schema | disponível |
| Nautilus | disponível; plugin WinShell não instalado |

O perfil gráfico real não foi modificado. Temas, ícones e plugin aparecem como
ausentes no `doctor.sh` porque o artefato do repositório não foi instalado no
`XDG_DATA_HOME` real; isso é esperado e evita alterar a aparência do desenvolvedor.

## Suíte confirmada

```bash
./tests/check.sh
```

Exit code 0. A execução confirmou:

```text
OK: metadata v0.5.1, GSettings, imports, assets, licenses and lifecycle contracts
OK: generated visual assets match design tokens
OK: Shell API boundary, nonblocking contracts, explicit chrome cleanup and popup focus
OK: versioned appearance backup, conflicts, force, restore and idempotence
OK: appearance modes, wallpaper selection and optional integration detection
OK: calendar navigation, alignment, leap year and locale
OK: context menu window visibility, capabilities and state labels
OK: isolated idempotent install and clean uninstall
OK: all graphical layout templates and pixel bounds
OK: notification grouping, sanitization and snapshot lifecycle
OK: popup monitor selection, bounds, negative origins and fractional anchors
OK: quick settings normalization, bounds and external synchronization snapshots
OK: taskbar conflict detection, policies and reversible state
OK: taskbar bottom anchoring and unique monitor topology
OK: JavaScript syntax, generated assets and all Node test suites
OK: GSettings schema validated
OK: Bash and Python syntax
```

`check.sh` usa XDG temporário e backend JSON para aparência. Ele valida XML/SVG,
licenças, metadata do tema de ícones e fallback, CSS gerado, imports, schema,
sintaxe JS/Bash/Python, apply/restore, falha de permissão, dependência ausente e
dois ciclos de instalação antes do uninstall. Nenhum `gsettings set` real ocorre.

Também executado isoladamente:

```bash
node --test tests/*.test.mjs
./scripts/doctor.sh
```

Ambos terminaram com exit code 0; o runner registrou 12 testes, sem falhas ou
skips. O doctor detectou GNOME 46/Wayland,
`gsettings`, Nautilus, Python e schema DING; relatou corretamente os recursos
WinShell ainda não instalados e não encontrou logs recentes.

`gnome-extensions info winshell@iklav-tech` terminou com exit code 2 porque não
há cópia instalada neste perfil. Portanto, não conta como validação runtime do
artefato do repositório.

## Assets reproduzíveis

```bash
node scripts/generate-visual-assets.mjs
node scripts/generate-visual-assets.mjs --check
```

O primeiro comando atualiza CSS, temas, ícones e wallpapers a partir de
`themes/design-tokens.json`; o segundo apenas compara e falha em caso de drift.

## Instalação

```bash
./scripts/install.sh
# opcional, após instalar/revisar python3-nautilus:
./scripts/install.sh --with-nautilus
```

O teste automatizado usa `WINSHELL_SKIP_GNOME_CHECK=1` somente dentro de XDG
temporário. Instalação normal valida GNOME 46 e `glib-compile-schemas`.

## Restauração e remoção

```bash
./scripts/restore-appearance.sh
./scripts/uninstall.sh
```

Uninstall tenta restaurar primeiro. Divergência externa interrompe a remoção;
`--force-restore` requer decisão consciente e `--no-restore` mantém valores atuais.

## Não executado

- instalação, apply/restore ou uninstall no perfil real;
- enable/disable no processo GNOME Shell;
- abertura real de preferências GTK/Libadwaita;
- carregamento do plugin por Nautilus;
- interação DING, D-Bus/GVC, multi-monitor ou escala fracionária;
- homologação visual Light/Dark em Wayland e X11.

## Validação manual

```bash
./scripts/install.sh --with-nautilus
# encerrar e entrar novamente na sessão Wayland
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
journalctl --user -f | grep -i winshell
```

Seguir o checklist do README, especialmente foco por teclado, transições Light /
Dark / Follow System, conflito externo de wallpaper/tema, restauração, DING,
Nautilus, fullscreen, hotplug e ciclos repetidos de enable/disable.

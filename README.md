# WinShell for GNOME v0.5.3

WinShell is an experimental Windows 11-inspired visual and interaction layer for
**Ubuntu 24.04 LTS / GNOME Shell 46**. It adds a taskbar, Start menu, Quick
Settings, calendar, notification center, window previews and Snap Layouts, plus
reversible Light/Dark appearance packages. It does not replace GNOME Shell,
Mutter, Nautilus, NetworkManager or system libraries and is not affiliated with
Microsoft or the GNOME Foundation.

> **Pre-release status.** Static, unit, asset and isolated filesystem tests cover
> v0.5.3. Visual/runtime acceptance in a disposable GNOME 46 Wayland session is
> still required; target compatibility is not a claim of completed certification.

## What v0.5.3 provides

- A reconciled SPEC 0.1.0 shell foundation: pure/tested Start search, pinned-app
  ordering and taskbar click decisions, plus a visible and accessible running
  state in the Start application list.
- Historical acceptance evidence for the taskbar, Start, clock/calendar access,
  persistent preferences, native-panel coexistence and complete disable paths.

- A verified SPEC 0.0.1 development baseline: fixed UUID and GNOME 46 metadata,
  ES Module lifecycle cleanup, user-local install/rollback, contributor guidance
  and a dedicated automated bootstrap contract.
- Optional Nautilus requirements are checked before installation writes begin,
  so a rejected `--with-nautilus` request does not leave the core half-installed.

- A GNOME Shell 46 compatibility boundary for version-specific Shell, extension
  manager, MessageTray, GVC, Slider, panel and chrome APIs.
- Explicit chrome removal, rollback-safe taskbar construction/rebuild and popup
  focus restoration across Escape, outside-click and disable paths.
- Pure, tested popup geometry for negative monitor origins, fractional logical
  anchors, small displays and monitor-edge clamping.

- `WinShell Theme` in Light and Dark variants for GNOME Shell, GTK3 and GTK4,
  generated from shared color, typography, radius, elevation, opacity and spacing
  tokens. The extension applies the Shell variant without requiring User Themes.
- `WinShell Icons`, an original CC0 scalable SVG theme for common apps, folders,
  files, devices, actions and status indicators. Adwaita and hicolor provide safe
  fallback coverage for missing app and MIME icons.
- Original CC0 Light/Dark vector wallpapers, synchronized with the selected
  appearance or selectable independently, with preview and GNOME positioning.
- An Appearance preferences page with Light, Dark and Follow System modes,
  visual presets, icon theme, wallpaper, desktop-icon and Nautilus controls.
- A versioned appearance backup that records only settings changed by WinShell.
  Apply/restore is idempotent and detects changes made outside WinShell before
  replacing them.
- Optional integration with Desktop Icons NG (DING) through its public GSettings
  schema and optional Nautilus context actions through `Nautilus.MenuProvider`.
- All v0.4.x taskbar, Start, search, Quick Settings, calendar, notifications,
  previews, Snap Layouts, multi-monitor and conflict-management behavior remains.

## Compatibility and limits

The primary target is GNOME Shell 46 on Wayland; X11 uses the same supported
Shell/GTK paths where GNOME exposes them. GTK3 themes are broadly honored. GTK4
applications may honor the installed theme, while Libadwaita deliberately owns
parts of its application styling; WinShell does not inject CSS into applications
or manipulate Nautilus private widgets. The closest maintainable Nautilus
integration is the standard icon theme plus a separate supported Python plugin.

DING owns desktop rendering, context menus, drag-and-drop and shortcut support.
WinShell only detects compatible providers and configures Home, Trash and mounted
volumes when the user explicitly applies appearance. It does not promise Windows
desktop behavior that DING itself does not implement.

All artwork is original; no Microsoft icons, wallpapers or fonts are included.

## Requirements

- Ubuntu 24.04 LTS, GNOME Shell 46 and GJS 1.80.
- `glib-compile-schemas`, `gnome-extensions` and standard GNOME services.
- Node.js for the complete developer test suite.
- Optional: Desktop Icons NG for desktop icons.
- Optional: `python3-nautilus` and Nautilus 46 for context-menu integration.

Example Ubuntu dependencies:

```bash
sudo apt install gnome-shell-extension-prefs gjs libglib2.0-dev-bin nodejs
# Optional integrations:
sudo apt install gnome-shell-extension-desktop-icons-ng python3-nautilus
```

WinShell never installs packages or writes system-wide files itself.

## Install or upgrade

```bash
unzip winshell-for-gnome-v0.5.3.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
```

To install the optional Nautilus plugin after reviewing its dependency:

```bash
./scripts/install.sh --with-nautilus
nautilus -q
```

The installer is safe to rerun and preserves the existing GSettings path, so a
v0.4.x upgrade retains previous values. On Wayland, sign out and back in after a
new extension install, then run:

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

User-local installation paths:

| Component | Path |
|---|---|
| Extension | `$XDG_DATA_HOME/gnome-shell/extensions/winshell@iklav-tech` |
| GTK/Shell themes | `$XDG_DATA_HOME/themes/WinShell*` |
| Icon theme | `$XDG_DATA_HOME/icons/WinShell` |
| Wallpapers/helper | `$XDG_DATA_HOME/winshell` |
| Nautilus plugin | `$XDG_DATA_HOME/nautilus-python/extensions/winshell-nautilus.py` |
| Appearance backup | `$XDG_CONFIG_HOME/winshell/appearance-backup-v1.json` |

Defaults are `~/.local/share` and `~/.config` when the XDG variables are unset.
Metadata uses GNOME integer version **10** and `version-name` **0.5.3**.

## Appearance workflow

Open the **Appearance** page in extension preferences:

1. Choose Follow System, WinShell Light or WinShell Dark and a visual preset.
2. Choose `WinShell` icons and synchronized, fixed or custom wallpaper.
3. Optionally enable GNOME appearance synchronization. Until **Apply** is
   clicked, global GNOME settings are not changed.
4. Enable DING controls only when the page reports a compatible provider.
5. Click **Apply WinShell appearance**. The helper first captures color scheme,
   GTK/icon theme, wallpaper/options and DING keys it will actually change.

The original backup is not overwritten by later applies. If a theme, wallpaper
or another tracked value changes externally, apply and restore stop and ask for
confirmation. **Restore original appearance** is safe to repeat. **Reset visual
preferences** resets WinShell choices but does not silently change global state.

Command-line restoration is also available:

```bash
./scripts/restore-appearance.sh
# Only after reviewing detected external changes:
./scripts/restore-appearance.sh --force
```

Uninstall restores appearance by default and aborts on an external-change
conflict before deleting themes. Use `--force-restore` after review, or
`--no-restore` only when intentionally keeping current GNOME values:

```bash
./scripts/uninstall.sh
```

The backup is retained after uninstall for recovery; unrelated user data is not
removed.

## Existing Shell features

- Bottom taskbar with centered/left alignment, pinned/running apps, search,
  clock and per-monitor mode.
- Start search across application names, descriptions, executables and keywords,
  with pinned apps first and a visible/accessible running-app state.
- Five Snap Layout grids and previews with activate, close and arrange actions.
- Real Wi-Fi, Bluetooth, audio, brightness, battery and Do Not Disturb controls,
  with unavailable services isolated instead of failing extension startup.
- Locale-aware calendar and actionable notifications from `Main.messageTray`.
- Reversible conflict policy for Ubuntu Dock, Dash to Dock and Dash to Panel.

## Tests and development

```bash
./tests/check.sh
node --test tests/*.test.mjs
./scripts/doctor.sh
```

`check.sh` validates metadata, schemas, imports, JavaScript/Bash/Python syntax,
SVG integrity, theme/icon metadata, asset licensing, generated-token consistency,
pure behavior, backup/restore conflicts and isolated idempotent install/uninstall.
It uses temporary XDG directories and a JSON settings backend; it never changes
the developer's real GNOME appearance.

It also enforces that version-specific GNOME Shell JavaScript imports remain in
`modules/shellCompat.js`, checks for blocking Shell calls, and verifies explicit
chrome cleanup plus popup focus/geometry contracts.

Regenerate CSS, icons and wallpapers after changing design tokens:

```bash
node scripts/generate-visual-assets.mjs
node scripts/generate-visual-assets.mjs --check
```

## Troubleshooting

- Run `./scripts/doctor.sh` to inspect GNOME version, resources, DING and the
  optional Nautilus plugin.
- If Appearance reports DING unavailable, install/enable DING yourself; WinShell
  does not alter unrelated extensions to obtain desktop icons.
- If Nautilus actions are absent, install with `--with-nautilus`, enable the row
  in Appearance and restart Nautilus. The action opens WinShell preferences.
- If restore reports external changes, inspect the current theme/wallpaper first;
  use force only when replacing those newer values is intended.
- If a new GTK theme is not visible immediately, restart the affected app.
  Libadwaita applications may intentionally retain application-owned styling.
- For extension errors, inspect `journalctl --user -b | grep -i winshell`.
- On Wayland, extension code updates generally require signing out and back in.

## Known limitations and manual validation

- Visual fidelity, focus traversal, fractional scaling, contrast and lifecycle
  still need manual acceptance on real GNOME 46/Wayland hardware.
- The optional Nautilus plugin cannot restyle private navigation widgets and only
  exposes a supported preferences action; file/folder visuals come from icons.
- WinShell does not enable DING or disable unknown desktop providers.
- Snap Layouts do not automatically fill remaining regions, and previews can be
  absent for minimized/unmapped windows.
- GNOME Shell, MessageTray and GVC JavaScript APIs are version-specific.

Manual validation should cover Light/Dark/system transitions; keyboard focus and
screen scaling; apply, external edit, conflict and restore; wallpaper sync across
displays; DING Home/Trash/volumes and context menus; Nautilus icon/menu behavior;
Wayland/XWayland windows; enable/disable loops; fullscreen, hotplug and v0.4.x
settings migration.

The release evidence and rollback checklist are in
[`docs/verification/0.5.3.md`](docs/verification/0.5.3.md). Retrospective SPEC
evidence is in [`docs/verification/v0.0.1.md`](docs/verification/v0.0.1.md) and
[`docs/verification/v0.1.0.md`](docs/verification/v0.1.0.md).

## Repository layout

```text
extension.js, prefs.js, stylesheet.css
modules/                 Shell runtime and appearance controllers
themes/                  tokens plus WinShell / WinShell-Dark packages
icons/WinShell/           scalable icon theme and license
wallpapers/               original Light/Dark SVG artwork and license
integrations/appearance/  versioned apply/restore helper
integrations/desktop/     DING integration contract
integrations/nautilus/    optional Nautilus MenuProvider
schemas/ scripts/ tests/ docs/
```

See [CHANGELOG.md](CHANGELOG.md) and [docs/architecture.md](docs/architecture.md).
Code is MIT licensed; asset subdirectories contain their CC0 notices. Development
and validation conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

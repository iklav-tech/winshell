#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 - "$ROOT" <<'PY'
import configparser, json, pathlib, re, sys, xml.etree.ElementTree as ET
root=pathlib.Path(sys.argv[1]); data=json.loads((root/'metadata.json').read_text()); assert data['uuid']=='winshell@iklav-tech'
tree=ET.parse(root/'schemas/org.gnome.shell.extensions.winshell.gschema.xml'); assert tree.find('.//schema') is not None
keys={k.get('name') for k in tree.findall('.//key')}
required={'panel-height','center-icons','show-clock','show-search','show-notifications','show-quick-settings','show-activities-panel','pinned-apps','multi-monitor','window-previews','snap-layouts','taskbar-conflict-handling','managed-taskbar-extensions','appearance-mode','visual-preset','icon-theme','wallpaper-selection','custom-wallpaper-uri','background-style','sync-system-appearance','desktop-icons-enabled','desktop-show-home','desktop-show-trash','desktop-show-volumes','nautilus-integration-enabled'}
assert required <= keys, f'Missing GSettings keys: {required-keys}'
assert data['version']==10 and data['version-name']=='0.5.3'
required_modules={'popup.js','popupGeometry.mjs','shellCompat.js','quickSettings.js','quickSettingsModel.mjs','systemControls.js','calendar.js','calendarModel.mjs','contextMenu.js','windowActions.mjs','systemActions.js','taskbar.js','startMenu.js','apps.js','shellFoundationModel.mjs','snapLayouts.js','windowPreview.js','notificationCenter.js','notificationModel.mjs','multiMonitor.js','layoutGeometry.mjs','taskbarConflict.js','taskbarConflictModel.mjs','taskbarGeometry.mjs'}
assert required_modules <= {p.name for p in (root/'modules').iterdir() if p.suffix in ('.js', '.mjs')}
for item in ['themes/WinShell','themes/WinShell-Dark','icons/WinShell','wallpapers','integrations/desktop','integrations/nautilus','integrations/appearance','modules/appearance']:
    assert (root/item).is_dir(), item
for f in [root/'extension.js',root/'prefs.js',*sorted((root/'modules').rglob('*.js'))]: assert f.stat().st_size>0
readme=(root/'README.md').read_text(); assert 'v0.5.3' in readme and 'winshell-for-gnome-v0.5.3.zip' in readme
assert (root/'CHANGELOG.md').is_file() and 'v0.5.3' in (root/'CHANGELOG.md').read_text()
assert (root/'CONTRIBUTING.md').is_file()
for source in [root/'extension.js',root/'prefs.js',*sorted((root/'modules').rglob('*.js')), *sorted((root/'modules').rglob('*.mjs'))]:
    text=source.read_text()
    for match in re.finditer(r"from\s+['\"](\.[^'\"]+)['\"]", text):
        assert (source.parent/match.group(1)).resolve().is_file(), f'Broken relative import in {source}: {match.group(1)}'
system=(root/'modules/systemControls.js').read_text(); notifications=(root/'modules/notificationCenter.js').read_text()
assert 'destroy()' in system and 'safeDisconnect' in system and '_callbacks.clear()' in system
assert 'source-added' in notifications and 'notification-removed' in notifications and 'safeDisconnect' in notifications
for svg in [*root.glob('icons/**/*.svg'), *root.glob('wallpapers/*.svg')]: ET.parse(svg)
assert len(list(root.glob('icons/WinShell/**/*.svg'))) >= 20
index=configparser.ConfigParser(interpolation=None); index.read(root/'icons/WinShell/index.theme')
assert 'Adwaita' in index['Icon Theme']['Inherits'] and 'hicolor' in index['Icon Theme']['Inherits']
for theme in ['WinShell','WinShell-Dark']:
    assert (root/f'themes/{theme}/gtk-3.0/gtk.css').stat().st_size > 200
    assert (root/f'themes/{theme}/gtk-4.0/gtk.css').stat().st_size > 200
    assert (root/f'themes/{theme}/gnome-shell/gnome-shell.css').stat().st_size > 200
assert 'CC0' in (root/'icons/WinShell/LICENSE').read_text()
assert 'CC0' in (root/'wallpapers/LICENSE').read_text()
verification=root/'docs/verification/0.5.3.md'
assert verification.is_file() and 'runtime GNOME 46/Wayland: pending' in verification.read_text()
historical=root/'docs/verification/v0.0.1.md'
assert historical.is_file() and 'runtime GNOME 46/Wayland: pending' in historical.read_text()
shell_foundation=root/'docs/verification/v0.1.0.md'
assert shell_foundation.is_file() and 'runtime GNOME 46/Wayland: pending' in shell_foundation.read_text()
print('OK: metadata v0.5.3, GSettings, imports, assets, licenses and lifecycle contracts')
PY
if command -v node >/dev/null; then
  for file in "$ROOT/extension.js" "$ROOT/prefs.js" "$ROOT"/modules/*.js "$ROOT"/modules/*.mjs "$ROOT"/modules/appearance/*.js "$ROOT"/modules/appearance/*.mjs "$ROOT"/scripts/*.mjs; do node --check "$file"; done
  node "$ROOT/scripts/generate-visual-assets.mjs" --check
  for test in "$ROOT"/tests/*.test.mjs; do node "$test"; done
  echo 'OK: JavaScript syntax, generated assets and all Node test suites'
else echo 'WARNING: Node.js not found; JavaScript tests were not executed'; fi
if command -v glib-compile-schemas >/dev/null; then
  glib-compile-schemas --strict --dry-run "$ROOT/schemas"
  echo 'OK: GSettings schema validated'
else echo 'WARNING: glib-compile-schemas not found'; fi
for file in "$ROOT"/scripts/*.sh "$ROOT"/tests/*.sh; do bash -n "$file"; done
PYTHONPYCACHEPREFIX="${TMPDIR:-/tmp}/winshell-pycache" python3 -m py_compile \
  "$ROOT/integrations/appearance/winshell-appearance" "$ROOT/integrations/nautilus/winshell-nautilus.py"
echo 'OK: Bash and Python syntax'

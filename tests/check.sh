#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 - "$ROOT" <<'PY'
import json, sys, pathlib, xml.etree.ElementTree as ET
root=pathlib.Path(sys.argv[1]); data=json.loads((root/'metadata.json').read_text()); assert data['uuid']=='winshell@iklav-tech'
tree=ET.parse(root/'schemas/org.gnome.shell.extensions.winshell.gschema.xml'); assert tree.find('.//schema') is not None
keys={k.get('name') for k in tree.findall('.//key')}
required={'panel-height','center-icons','show-clock','show-search','show-notifications','show-quick-settings','show-activities-panel','pinned-apps','multi-monitor','window-previews','snap-layouts','taskbar-conflict-handling','managed-taskbar-extensions'}
assert required <= keys, f'Missing GSettings keys: {required-keys}'
assert data['version']==6 and data['version-name']=='0.4.2'
required_modules={'popup.js','quickSettings.js','quickSettingsModel.mjs','systemControls.js','calendar.js','calendarModel.mjs','contextMenu.js','windowActions.mjs','systemActions.js','taskbar.js','startMenu.js','apps.js','snapLayouts.js','windowPreview.js','notificationCenter.js','notificationModel.mjs','multiMonitor.js','layoutGeometry.mjs','taskbarConflict.js','taskbarConflictModel.mjs','taskbarGeometry.mjs'}
assert required_modules <= {p.name for p in (root/'modules').iterdir() if p.suffix in ('.js', '.mjs')}
for f in [root/'extension.js',root/'prefs.js',*sorted((root/'modules').glob('*.js'))]:
    assert f.stat().st_size>0
readme=(root/'README.md').read_text()
assert 'v0.4.2' in readme and 'winshell-for-gnome-v0.4.2.zip' in readme
assert (root/'CHANGELOG.md').is_file() and 'v0.4.2' in (root/'CHANGELOG.md').read_text()
for source in [root/'extension.js',root/'prefs.js',*sorted((root/'modules').glob('*.js')), *sorted((root/'modules').glob('*.mjs'))]:
    text=source.read_text()
    for match in __import__('re').finditer(r"from\s+['\"](\.[^'\"]+)['\"]", text):
        assert (source.parent/match.group(1)).resolve().is_file(), f'Broken relative import in {source}: {match.group(1)}'
system=(root/'modules/systemControls.js').read_text(); notifications=(root/'modules/notificationCenter.js').read_text()
assert 'destroy()' in system and 'safeDisconnect' in system and '_callbacks.clear()' in system
assert 'source-added' in notifications and 'notification-removed' in notifications and 'safeDisconnect' in notifications
print('OK: metadata, GSettings XML, módulos, imports, lifecycle e versão')
PY
if command -v node >/dev/null; then
  for file in "$ROOT/extension.js" "$ROOT/prefs.js" "$ROOT"/modules/*.js "$ROOT"/modules/*.mjs; do node --check "$file"; done
  echo 'OK: sintaxe dos arquivos JavaScript'
  for test in "$ROOT"/tests/*.test.mjs; do node "$test"; done
  echo 'OK: modelos, Snap Layouts, conflitos e geometria da barra de tarefas'
else echo 'AVISO: Node.js não encontrado; testes JavaScript e de geometria não executados'; fi
if command -v glib-compile-schemas >/dev/null; then
  glib-compile-schemas --strict --dry-run "$ROOT/schemas"
  echo 'OK: esquema GSettings validado'
else echo 'AVISO: glib-compile-schemas não encontrado; validação GSettings não executada'; fi

for file in "$ROOT"/scripts/*.sh "$ROOT"/tests/*.sh; do
  bash -n "$file"
done
echo 'OK: sintaxe dos scripts Bash'

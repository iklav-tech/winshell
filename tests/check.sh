#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 - "$ROOT" <<'PY'
import json, sys, pathlib, xml.etree.ElementTree as ET
root=pathlib.Path(sys.argv[1]); data=json.loads((root/'metadata.json').read_text()); assert data['uuid']=='winshell@iklav-tech'
tree=ET.parse(root/'schemas/org.gnome.shell.extensions.winshell.gschema.xml'); assert tree.find('.//schema') is not None
for f in [root/'extension.js',root/'prefs.js',*sorted((root/'modules').glob('*.js'))]:
    assert f.stat().st_size>0
print('OK: metadata, GSettings XML e módulos presentes')
PY
if command -v node >/dev/null; then
  for file in "$ROOT/extension.js" "$ROOT/prefs.js" "$ROOT"/modules/*.js; do node --check "$file"; done
  echo 'OK: sintaxe dos arquivos JavaScript'
else echo 'AVISO: Node.js não encontrado; teste estático JavaScript não executado'; fi
if command -v glib-compile-schemas >/dev/null; then
  glib-compile-schemas --strict --dry-run "$ROOT/schemas"
  echo 'OK: esquema GSettings validado'
else echo 'AVISO: glib-compile-schemas não encontrado; validação GSettings não executada'; fi

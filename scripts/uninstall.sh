#!/usr/bin/env bash
set -euo pipefail
UUID='winshell@iklav-tech'
DEST="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$UUID"
if command -v gnome-extensions >/dev/null 2>&1; then
  gnome-extensions disable "$UUID" 2>/dev/null || true
fi
if [[ -d "$DEST" ]]; then rm -rf -- "$DEST"; echo 'Extensão removida.'; else echo 'Extensão não encontrada.'; fi
echo 'Encerre a sessão e entre novamente para confirmar a remoção.'

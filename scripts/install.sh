#!/usr/bin/env bash
set -euo pipefail
UUID='winshell@iklav-tech'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$UUID"
if ! command -v gnome-shell >/dev/null 2>&1; then
  echo 'ERRO: GNOME Shell não detectado. Execute no Ubuntu com GNOME.' >&2; exit 1
fi
VERSION="$(gnome-shell --version | sed -nE 's/.* ([0-9]+)\..*/\1/p')"
if [[ "$VERSION" != '46' ]]; then
  echo "ERRO: Esta versão foi criada para GNOME 46 (detectado: ${VERSION:-desconhecido})." >&2; exit 1
fi
if ! command -v glib-compile-schemas >/dev/null 2>&1; then
  echo 'ERRO: instale libglib2.0-dev-bin.' >&2; exit 1
fi
mkdir -p "$DEST"
cp "$ROOT/metadata.json" "$ROOT/extension.js" "$ROOT/prefs.js" "$ROOT/stylesheet.css" "$DEST/"
cp -r "$ROOT/modules" "$ROOT/schemas" "$DEST/"
glib-compile-schemas --strict "$DEST/schemas"
echo "Instalado em: $DEST"
echo 'IMPORTANTE: encerre a sessão GNOME e entre novamente para detectar uma extensão nova (Wayland).'
echo "Depois execute: gnome-extensions enable '$UUID'"
echo "Preferências: gnome-extensions prefs '$UUID'"

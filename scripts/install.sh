#!/usr/bin/env bash
set -euo pipefail

UUID='winshell@iklav-tech'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
EXTENSION_DEST="$DATA_HOME/gnome-shell/extensions/$UUID"
THEME_DEST="$DATA_HOME/themes"
ICON_DEST="$DATA_HOME/icons"
RESOURCE_DEST="$DATA_HOME/winshell"
NAUTILUS_DEST="$DATA_HOME/nautilus-python/extensions"
WITH_NAUTILUS=false

usage() {
  echo 'Usage: ./scripts/install.sh [--with-nautilus|--without-nautilus]'
}

for argument in "$@"; do
  case "$argument" in
    --with-nautilus) WITH_NAUTILUS=true ;;
    --without-nautilus) WITH_NAUTILUS=false ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $argument" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ "${WINSHELL_SKIP_GNOME_CHECK:-0}" != '1' ]]; then
  if ! command -v gnome-shell >/dev/null 2>&1; then
    echo 'ERROR: GNOME Shell not detected. Run this on Ubuntu with GNOME.' >&2
    exit 1
  fi
  VERSION="$(gnome-shell --version | sed -nE 's/.* ([0-9]+)\..*/\1/p')"
  if [[ "$VERSION" != '46' ]]; then
    echo "ERROR: WinShell v0.5.3 targets GNOME 46 (detected: ${VERSION:-unknown})." >&2
    exit 1
  fi
fi
if ! command -v glib-compile-schemas >/dev/null 2>&1; then
  echo 'ERROR: glib-compile-schemas is required (libglib2.0-dev-bin on Ubuntu).' >&2
  exit 1
fi

# Validate optional dependencies before writing any destination. This keeps a
# rejected --with-nautilus request from leaving the main package half-installed.
if $WITH_NAUTILUS; then
  if ! command -v nautilus >/dev/null 2>&1; then
    echo 'ERROR: Nautilus is not installed; no WinShell files were installed.' >&2
    exit 1
  fi
  if ! command -v python3 >/dev/null 2>&1 || \
      ! python3 -c 'import gi; gi.require_version("Nautilus", "4.0"); from gi.repository import Nautilus' >/dev/null 2>&1; then
    echo 'ERROR: python3-nautilus with the Nautilus 4 API is required; no WinShell files were installed.' >&2
    exit 1
  fi
fi

install -d "$EXTENSION_DEST" "$THEME_DEST" "$ICON_DEST" "$RESOURCE_DEST/bin" "$RESOURCE_DEST/wallpapers"
cp "$ROOT/metadata.json" "$ROOT/extension.js" "$ROOT/prefs.js" "$ROOT/stylesheet.css" "$EXTENSION_DEST/"
for directory in modules schemas integrations wallpapers; do
  install -d "$EXTENSION_DEST/$directory"
  cp -a "$ROOT/$directory/." "$EXTENSION_DEST/$directory/"
done
glib-compile-schemas --strict "$EXTENSION_DEST/schemas"

for theme in WinShell WinShell-Dark; do
  install -d "$THEME_DEST/$theme"
  cp -a "$ROOT/themes/$theme/." "$THEME_DEST/$theme/"
done
install -d "$ICON_DEST/WinShell"
cp -a "$ROOT/icons/WinShell/." "$ICON_DEST/WinShell/"
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache --force "$ICON_DEST/WinShell" >/dev/null
fi
cp -a "$ROOT/wallpapers/." "$RESOURCE_DEST/wallpapers/"
install -m 0755 "$ROOT/integrations/appearance/winshell-appearance" "$RESOURCE_DEST/bin/winshell-appearance"

if $WITH_NAUTILUS; then
  install -d "$NAUTILUS_DEST"
  install -m 0644 "$ROOT/integrations/nautilus/winshell-nautilus.py" "$NAUTILUS_DEST/winshell-nautilus.py"
  echo 'Optional Nautilus integration installed; restart Nautilus to load it.'
else
  echo 'Optional Nautilus integration not requested. Use --with-nautilus to install it.'
fi

echo "WinShell v0.5.3 installed at: $EXTENSION_DEST"
echo "Themes: $THEME_DEST/WinShell and $THEME_DEST/WinShell-Dark"
echo "Icons: $ICON_DEST/WinShell"
echo "Wallpapers and appearance helper: $RESOURCE_DEST"
echo 'On Wayland, sign out and back in before enabling a newly installed extension.'
echo "Then run: gnome-extensions enable '$UUID'"
echo "Preferences: gnome-extensions prefs '$UUID'"

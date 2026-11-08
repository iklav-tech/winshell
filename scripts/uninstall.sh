#!/usr/bin/env bash
set -euo pipefail

UUID='winshell@iklav-tech'
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
EXTENSION_DEST="$DATA_HOME/gnome-shell/extensions/$UUID"
HELPER="$DATA_HOME/winshell/bin/winshell-appearance"
RESTORE=true
FORCE=false

for argument in "$@"; do
  case "$argument" in
    --no-restore) RESTORE=false ;;
    --force-restore) FORCE=true ;;
    -h|--help)
      echo 'Usage: ./scripts/uninstall.sh [--no-restore|--force-restore]'
      exit 0 ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done

if $RESTORE && [[ -x "$HELPER" ]]; then
  restore_args=(restore)
  $FORCE && restore_args+=(--force)
  if ! "$HELPER" "${restore_args[@]}"; then
    echo 'Appearance restoration stopped because external changes were detected.' >&2
    echo 'Review them, run with --force-restore, or explicitly choose --no-restore.' >&2
    exit 3
  fi
fi

if command -v gnome-extensions >/dev/null 2>&1; then
  gnome-extensions disable "$UUID" 2>/dev/null || true
fi

remove_owned_directory() {
  local target="$1"
  local expected_prefix="$2"
  if [[ "$target" != "$expected_prefix"* || "$target" == "$expected_prefix" ]]; then
    echo "Refusing unsafe removal target: $target" >&2
    exit 4
  fi
  if [[ -d "$target" ]]; then
    rm -rf -- "$target"
  fi
}

remove_owned_directory "$EXTENSION_DEST" "$DATA_HOME/gnome-shell/extensions/"
remove_owned_directory "$DATA_HOME/themes/WinShell" "$DATA_HOME/themes/"
remove_owned_directory "$DATA_HOME/themes/WinShell-Dark" "$DATA_HOME/themes/"
remove_owned_directory "$DATA_HOME/icons/WinShell" "$DATA_HOME/icons/"
remove_owned_directory "$DATA_HOME/winshell" "$DATA_HOME/"
rm -f -- "$DATA_HOME/nautilus-python/extensions/winshell-nautilus.py"
rm -f -- "$CONFIG_HOME/winshell/nautilus-enabled"

echo 'WinShell-owned extension, theme, icon, wallpaper and optional Nautilus files removed.'
echo 'The versioned appearance backup was retained under the user configuration directory.'
echo 'Sign out and back in to complete removal on Wayland.'

#!/usr/bin/env bash
set -u
printf '%s\n' '=== WinShell diagnostic ==='
for cmd in gnome-shell gnome-extensions glib-compile-schemas gsettings nautilus python3; do
  if command -v "$cmd" >/dev/null 2>&1; then echo "OK: $cmd"; else echo "AUSENTE: $cmd"; fi
done
command -v gnome-shell >/dev/null 2>&1 && gnome-shell --version || true
printf 'Sessão: %s\n' "${XDG_SESSION_TYPE:-não informada}"
printf 'Desktop: %s\n' "${XDG_CURRENT_DESKTOP:-não informado}"
gnome-extensions info winshell@iklav-tech 2>/dev/null || true
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
[[ -d "$DATA_HOME/themes/WinShell" ]] && echo 'OK: WinShell Light theme' || echo 'MISSING: WinShell Light theme'
[[ -d "$DATA_HOME/themes/WinShell-Dark" ]] && echo 'OK: WinShell Dark theme' || echo 'MISSING: WinShell Dark theme'
[[ -f "$DATA_HOME/icons/WinShell/index.theme" ]] && echo 'OK: WinShell Icons' || echo 'MISSING: WinShell Icons'
if gsettings list-schemas 2>/dev/null | grep -qx 'org.gnome.shell.extensions.ding'; then
  echo 'OK: DING schema'
else
  echo 'MISSING: DING schema (desktop icon integration unavailable)'
fi
[[ -f "$DATA_HOME/nautilus-python/extensions/winshell-nautilus.py" ]] && echo 'OK: Nautilus plugin' || echo 'OPTIONAL MISSING: Nautilus plugin'
echo 'Logs recentes:'
journalctl --user -b --no-pager -n 120 2>/dev/null | grep -iE 'winshell|gnome.shell.*extension' | tail -n 25 || true

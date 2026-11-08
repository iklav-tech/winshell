#!/usr/bin/env bash
set -u
printf '%s\n' '=== WinShell diagnostic ==='
for cmd in gnome-shell gnome-extensions glib-compile-schemas; do
  if command -v "$cmd" >/dev/null 2>&1; then echo "OK: $cmd"; else echo "AUSENTE: $cmd"; fi
done
command -v gnome-shell >/dev/null 2>&1 && gnome-shell --version || true
printf 'Sessão: %s\n' "${XDG_SESSION_TYPE:-não informada}"
printf 'Desktop: %s\n' "${XDG_CURRENT_DESKTOP:-não informado}"
gnome-extensions info winshell@iklav-tech 2>/dev/null || true
echo 'Logs recentes:'
journalctl --user -b --no-pager -n 120 2>/dev/null | grep -iE 'winshell|gnome.shell.*extension' | tail -n 25 || true

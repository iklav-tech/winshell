#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
HELPER="$DATA_HOME/winshell/bin/winshell-appearance"
if [[ ! -x "$HELPER" ]]; then
  HELPER="$ROOT/integrations/appearance/winshell-appearance"
fi
exec "$HELPER" restore "$@"

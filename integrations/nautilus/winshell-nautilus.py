"""Optional Nautilus-python actions for WinShell resources (GPL-3.0-or-later)."""

import os
from pathlib import Path

from gi.repository import Gio, GObject, Nautilus


class WinShellMenuProvider(GObject.GObject, Nautilus.MenuProvider):
    def _open_preferences(self, _item, _files):
        Gio.Subprocess.new(
            ["gnome-extensions", "prefs", "winshell@iklav-tech"],
            Gio.SubprocessFlags.NONE,
        )

    def _enabled(self):
        root = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
        return (root / "winshell" / "nautilus-enabled").is_file()

    def get_file_items(self, files):
        if not files or not self._enabled():
            return []
        item = Nautilus.MenuItem(
            name="WinShell::Appearance",
            label="WinShell Appearance…",
            tip="Open extension preferences to manage icons and wallpapers",
            icon="preferences-desktop-wallpaper-symbolic",
        )
        item.connect("activate", self._open_preferences, files)
        return [item]

    def get_background_items(self, current_folder):
        return self.get_file_items([current_folder])

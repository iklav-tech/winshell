import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export function openDesktop(id) {
    const info = Gio.DesktopAppInfo.new(id);
    if (info) info.launch([], null);
    else Main.notify('WinShell', `Aplicativo não encontrado: ${id}`);
}

export function openWinShellPreferences() {
    Gio.DBus.session.call('org.gnome.Shell', '/org/gnome/Shell',
        'org.gnome.Shell.Extensions', 'OpenExtensionPrefs',
        new GLib.Variant('(ssa{sv})', ['winshell@iklav-tech', '', {}]), null,
        Gio.DBusCallFlags.NONE, -1, null, (_connection, result) => {
            try { Gio.DBus.session.call_finish(result); }
            catch (error) {
                console.warn(`[WinShell] Preferências indisponíveis: ${error.message}`);
                openDesktop('org.gnome.Extensions.desktop');
            }
        });
}

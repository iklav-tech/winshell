import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const appearance = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});

export function openDesktop(id) {
    const info = Gio.DesktopAppInfo.new(id);
    if (info) info.launch([], null);
    else Main.notify('WinShell', `Aplicativo não encontrado: ${id}`);
}

export function darkMode() {
    return appearance.get_string('color-scheme') === 'prefer-dark';
}

export function toggleDarkMode() {
    appearance.set_string('color-scheme', darkMode() ? 'default' : 'prefer-dark');
}

export function doNotDisturb() { return !notifications.get_boolean('show-banners'); }
export function toggleDoNotDisturb() {
    notifications.set_boolean('show-banners', doNotDisturb());
}

export function observeSystem(callback) {
    const a = appearance.connect('changed::color-scheme', callback);
    const n = notifications.connect('changed::show-banners', callback);
    return () => { appearance.disconnect(a); notifications.disconnect(n); };
}

// Native GNOME menus remain responsible for network, volume, calendar and notifications.
export function openNativeMenu(name, panelVisibilityController) {
    const menu = name === 'calendar'
        ? Main.panel.statusArea.dateMenu?.menu
        : Main.panel.statusArea.quickSettings?.menu;
    if (!menu) return;
    panelVisibilityController?.open(menu);
}

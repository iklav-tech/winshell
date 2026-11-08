import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {activateApp, appById, runningApps} from './apps.js';

export class Taskbar {
    constructor(settings, menu) {
        this._settings = settings;
        this._menu = menu;
        this._signals = [];
        this._settingsSignals = [];
        this._timeout = 0;
        this.actor = new St.BoxLayout({
            style_class: 'winshell-taskbar',
            reactive: true,
            x_expand: true,
            track_hover: true,
        });
        this._left = new St.BoxLayout({style_class: 'winshell-taskbar-left'});
        this._center = new St.BoxLayout({style_class: 'winshell-taskbar-center'});
        this._right = new St.BoxLayout({style_class: 'winshell-taskbar-right'});
        this.actor.add_child(this._left);
        this.actor.add_child(this._center);
        this.actor.add_child(this._right);
        Main.layoutManager.addChrome(this.actor, {affectsStruts: true, trackFullscreen: true});
        this._clockButton = new St.Button({style_class: 'winshell-clock-button', can_focus: true});
        this._clock = new St.Label({style_class: 'winshell-clock', y_align: Clutter.ActorAlign.CENTER});
        this._clockButton.set_child(this._clock);
        this._clockButton.connect('clicked', () => {
            // Mantém o calendário/notificações nativos como fonte de verdade.
            Main.panel.statusArea.dateMenu?.menu.toggle();
        });
        this._right.add_child(this._clockButton);
        this._settingsSignals.push(settings.connect('changed', (_s, key) => {
            if (['panel-height', 'center-icons', 'show-clock', 'show-search', 'pinned-apps'].includes(key))
                this._render();
        }));
        const appSystem = Shell.AppSystem.get_default();
        this._signals.push([appSystem, appSystem.connect('app-state-changed', () => this._renderApps())]);
        this._signals.push([global.display, global.display.connect('notify::focus-window', () => this._renderApps())]);
        this._signals.push([Main.layoutManager, Main.layoutManager.connect('monitors-changed', () => this._position())]);
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
            this._updateClock();
            return GLib.SOURCE_CONTINUE;
        });
        this._render();
    }

    _render() {
        this._position();
        this._left.destroy_all_children();
        this._center.destroy_all_children();
        this._start = this._iconButton('view-app-grid-symbolic', 'Iniciar', () => {
            const [x] = this._start.get_transformed_position();
            const [width] = this._start.get_transformed_size();
            const monitor = Main.layoutManager.primaryMonitor;
            this._menu.toggle(x + width / 2, monitor.y + monitor.height - this._settings.get_int('panel-height'));
        });
        this._center.add_child(this._start);
        if (this._settings.get_boolean('show-search'))
            this._center.add_child(this._iconButton('system-search-symbolic', 'Pesquisar', () => {
                const [x] = this._start.get_transformed_position();
                const [w] = this._start.get_transformed_size();
                const m = Main.layoutManager.primaryMonitor;
                this._menu.show(x + w / 2, m.y + m.height - this._settings.get_int('panel-height'));
            }));
        this._clockButton.visible = this._settings.get_boolean('show-clock');
        this._center.x_expand = true;
        this._center.x_align = this._settings.get_boolean('center-icons')
            ? Clutter.ActorAlign.CENTER : Clutter.ActorAlign.START;
        this._left.x_expand = false;
        this._right.x_expand = false;
        this._renderApps();
        this._updateClock();
    }

    _position() {
        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor) return;
        const height = this._settings.get_int('panel-height');
        this.actor.set_position(monitor.x, monitor.y + monitor.height - height);
        this.actor.set_size(monitor.width, height);
    }

    _iconButton(iconName, tooltip, callback) {
        const button = new St.Button({style_class: 'winshell-task-icon', can_focus: true, reactive: true, track_hover: true});
        button.set_child(new St.Icon({icon_name: iconName, icon_size: 24}));
        button.set_accessible_name(tooltip);
        button.connect('clicked', callback);
        return button;
    }

    _renderApps() {
        if (!this._center || !this._start) return;
        // Preserva Iniciar/Pesquisa; remove apenas os ícones gerados de aplicativos.
        for (const item of [...this._center.get_children()]) {
            if (item._winshellAppButton) item.destroy();
        }
        const ordered = [];
        const seen = new Set();
        for (const id of this._settings.get_strv('pinned-apps')) {
            const app = appById(id);
            if (app && !seen.has(app.get_id())) { ordered.push(app); seen.add(app.get_id()); }
        }
        for (const app of runningApps()) {
            if (!seen.has(app.get_id())) { ordered.push(app); seen.add(app.get_id()); }
        }
        const focused = global.display.focus_window;
        for (const app of ordered) {
            const windows = app.get_windows();
            const active = focused && windows.includes(focused);
            const button = new St.Button({
                style_class: `winshell-task-icon ${windows.length ? 'winshell-running' : ''} ${active ? 'winshell-active' : ''}`,
                can_focus: true,
            });
            button._winshellAppButton = true;
            button.set_child(app.create_icon_texture(26));
            button.set_accessible_name(app.get_name());
            button.connect('clicked', () => {
                if (focused && windows.includes(focused) && !focused.minimized)
                    focused.minimize();
                else
                    activateApp(app);
            });
            this._center.add_child(button);
        }
    }

    _updateClock() {
        if (!this._clock) return;
        const now = GLib.DateTime.new_now_local();
        this._clock.set_text(`${now.format('%H:%M')}\n${now.format('%d/%m/%Y')}`);
    }

    destroy() {
        if (this._timeout) GLib.Source.remove(this._timeout);
        for (const [object, id] of this._signals) object.disconnect(id);
        for (const id of this._settingsSignals) this._settings.disconnect(id);
        this.actor.destroy();
        this._settings = null;
    }
}

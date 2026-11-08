import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Shell from 'gi://Shell';
import {activateApp, appById, runningApps} from './apps.js';
import {ContextMenu} from './contextMenu.js';
import {QuickSettingsPanel} from './quickSettings.js';
import {WindowPreview} from './windowPreview.js';
import {SnapLayoutPanel} from './snapLayouts.js';
import {NotificationCenter} from './notificationCenter.js';
import {taskbarPrimaryAction} from './shellFoundationModel.mjs';
import {taskbarGeometry} from './taskbarGeometry.mjs';
import {addChrome, layoutManager, removeChrome} from './shellCompat.js';

export class Taskbar {
    constructor(settings, menu, systemControls, monitorIndex = 0) {
        this._monitorIndex = monitorIndex;
        this._settings = settings;
        this._menu = menu;
        this._signals = [];
        this._settingsSignals = [];
        this._destroyed = false;
        this.actor = null;
        try {
            this._initialize(systemControls);
        } catch (error) {
            this.destroy();
            throw error;
        }
    }

    _initialize(systemControls) {
        const settings = this._settings;
        this.actor = new St.BoxLayout({name: `winshell-taskbar-${this._monitorIndex}`,
            style_class: 'winshell-taskbar', reactive: true,
            x_expand: true, track_hover: true});
        this._left = new St.BoxLayout({style_class: 'winshell-taskbar-left'});
        this._center = new St.BoxLayout({style_class: 'winshell-taskbar-center'});
        this._right = new St.BoxLayout({style_class: 'winshell-taskbar-right'});
        this.actor.add_child(this._left);
        this.actor.add_child(this._center);
        this.actor.add_child(this._right);
        addChrome(this.actor, {affectsStruts: true, trackFullscreen: true});
        this._context = new ContextMenu(settings);
        this._quick = new QuickSettingsPanel(systemControls);
        this._snap = new SnapLayoutPanel();
        this._preview = new WindowPreview(this._snap, settings);
        this._notifications = new NotificationCenter(systemControls);
        this._clockButton = this._iconButton('x-office-calendar-symbolic', 'Notificações e calendário',
            () => {
                const [x, y] = this._anchor(this._clockButton);
                this._notifications.toggle(x, y);
            });
        this._clock = new St.Label({style_class: 'winshell-clock', y_align: Clutter.ActorAlign.CENTER});
        this._clockButton.set_child(this._clock);
        this._quickButton = this._iconButton('emblem-system-symbolic', 'Configurações rápidas', () => {
            const [x, y] = this._anchor(this._quickButton);
            this._quick.toggle(x, y);
        });
        this._notificationButton = this._iconButton('preferences-system-notifications-symbolic',
            'Centro de notificações', () => {
                const [x, y] = this._anchor(this._notificationButton);
                this._notifications.toggle(x, y);
            });
        this._right.add_child(this._notificationButton);
        this._right.add_child(this._quickButton);
        this._right.add_child(this._clockButton);
        this.actor.connect('button-press-event', (_actor, event) => {
            if (event.get_button() !== Clutter.BUTTON_SECONDARY) return Clutter.EVENT_PROPAGATE;
            const source = event.get_source();
            if (source === this.actor || source === this._left || source === this._center) {
                const [x, y] = event.get_coords();
                this._context.forTaskbar(x, y);
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        this._settingsSignals.push(settings.connect('changed', (_s, key) => {
            if (['panel-height', 'center-icons', 'show-clock', 'show-search',
                'show-notifications', 'show-quick-settings', 'pinned-apps', 'window-previews', 'snap-layouts'].includes(key)) this._render();
        }));
        const appSystem = Shell.AppSystem.get_default();
        this._signals.push([appSystem, appSystem.connect('app-state-changed', () => this._renderApps())]);
        this._signals.push([global.display, global.display.connect('notify::focus-window', () => this._renderApps())]);
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
            this._updateClock();
            return GLib.SOURCE_CONTINUE;
        });
        this._render();
    }

    _anchor(button) {
        const [x] = button.get_transformed_position();
        const [w] = button.get_transformed_size();
        const manager = layoutManager();
        const monitor = manager.monitors[this._monitorIndex] ?? manager.primaryMonitor;
        const bottomY = monitor ? monitor.y + monitor.height - this._settings.get_int('panel-height') : 0;
        return [x + w / 2, bottomY];
    }

    _iconButton(iconName, name, callback) {
        const button = new St.Button({style_class: 'winshell-task-icon', can_focus: true,
            reactive: true, track_hover: true});
        button.set_child(new St.Icon({icon_name: iconName, icon_size: 22}));
        button.set_accessible_name(name);
        button.connect('clicked', callback);
        return button;
    }

    _render() {
        this._position();
        this._preview.dismiss();
        this._left.destroy_all_children();
        this._center.destroy_all_children();
        this._start = this._iconButton('view-app-grid-symbolic', 'Iniciar', () => {
            const [x, y] = this._anchor(this._start);
            this._menu.toggle(x, y);
        });
        this._center.add_child(this._start);
        if (this._settings.get_boolean('show-search'))
            this._center.add_child(this._iconButton('system-search-symbolic', 'Pesquisar', () => {
                const [x, y] = this._anchor(this._start);
                this._menu.focusSearch(x, y);
            }));
        this._clockButton.visible = this._settings.get_boolean('show-clock');
        this._notificationButton.visible = this._settings.get_boolean('show-notifications');
        this._quickButton.visible = this._settings.get_boolean('show-quick-settings');
        this._center.x_expand = true;
        this._center.x_align = this._settings.get_boolean('center-icons')
            ? Clutter.ActorAlign.CENTER : Clutter.ActorAlign.START;
        this._renderApps();
        this._updateClock();
    }

    _position() {
        const manager = layoutManager();
        const monitor = manager.monitors[this._monitorIndex] ?? manager.primaryMonitor;
        if (!monitor) return;
        const height = this._settings.get_int('panel-height');
        const geometry = taskbarGeometry(monitor, height);
        if (!geometry) return;
        this.actor.set_position(geometry.x, geometry.y);
        this.actor.set_size(geometry.width, geometry.height);
    }

    _renderApps() {
        if (!this._center || !this._start) return;
        this._preview.dismiss();
        for (const item of [...this._center.get_children()])
            if (item._winshellAppButton) item.destroy();
        const apps = [];
        const seen = new Set();
        for (const id of this._settings.get_strv('pinned-apps')) {
            const app = appById(id);
            if (app && !seen.has(app.get_id())) { apps.push(app); seen.add(app.get_id()); }
        }
        for (const app of runningApps()) {
            if (!seen.has(app.get_id())) { apps.push(app); seen.add(app.get_id()); }
        }
        const focused = global.display.focus_window;
        for (const app of apps) {
            const windows = app.get_windows();
            const active = focused && windows.includes(focused);
            const button = new St.Button({style_class: `winshell-task-icon ${windows.length ? 'winshell-running' : ''} ${active ? 'winshell-active' : ''}`,
                can_focus: true, reactive: true});
            button._winshellAppButton = true;
            button.set_child(app.create_icon_texture(26));
            button.set_accessible_name(app.get_name());
            button.connect('clicked', () => {
                const focusedWindow = global.display.focus_window;
                const action = taskbarPrimaryAction({
                    focusedWindowOwned: Boolean(focusedWindow && windows.includes(focusedWindow)),
                    focusedWindowMinimized: Boolean(focusedWindow?.minimized),
                });
                if (action === 'minimize') focusedWindow.minimize();
                else activateApp(app);
            });
            button.connect('button-press-event', (_actor, event) => {
                if (event.get_button() !== Clutter.BUTTON_SECONDARY)
                    return Clutter.EVENT_PROPAGATE;
                const [x, y] = this._anchor(button);
                this._context.forApp(app, x, y, this._settings.get_boolean('snap-layouts')
                    ? win => this._snap.forWindow(win, x, y) : null);
                return Clutter.EVENT_STOP;
            });
            if (this._settings.get_boolean('window-previews')) {
                button.connect('key-press-event', (_actor, event) => {
                    if (event.get_key_symbol() !== Clutter.KEY_Down || !app.get_windows().length)
                        return Clutter.EVENT_PROPAGATE;
                    this._preview.showFor(app, button, this._anchor(button)[1], true);
                    return Clutter.EVENT_STOP;
                });
                button.connect('enter-event', () => {
                    if (app.get_windows().length) this._preview.schedule(app, button, this._anchor(button)[1]);
                    return Clutter.EVENT_PROPAGATE;
                });
                button.connect('leave-event', () => {
                    this._preview.leaveButton(button);
                    return Clutter.EVENT_PROPAGATE;
                });
            }
            this._center.add_child(button);
        }
    }

    _updateClock() {
        const now = new Date();
        const time = new Intl.DateTimeFormat(undefined, {hour: '2-digit', minute: '2-digit'}).format(now);
        const date = new Intl.DateTimeFormat(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}).format(now);
        this._clock.set_text(`${time}\n${date}`);
    }

    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this._timeout) { GLib.Source.remove(this._timeout); this._timeout = 0; }
        for (const [object, id] of this._signals) {
            try { object.disconnect(id); } catch (_error) { /* Already disposed. */ }
        }
        for (const id of this._settingsSignals) {
            try { this._settings?.disconnect(id); } catch (_error) { /* Already disposed. */ }
        }
        this._preview?.destroy();
        this._snap?.destroy();
        this._notifications?.destroy();
        this._context?.destroy();
        this._quick?.destroy();
        removeChrome(this.actor);
        this.actor?.destroy();
        this.actor = null;
        this._settings = null;
    }
}

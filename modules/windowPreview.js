import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {PopupSurface} from './popup.js';

export class WindowPreview extends PopupSurface {
    constructor(snapPanel) {
        super('winshell-flyout winshell-preview', 342, 252);
        this._snapPanel = snapPanel;
        this._pending = 0;
        this._activeButton = null;
    }
    showFor(app, button, bottomY) {
        this._activeButton = button;
        this.actor.destroy_all_children();
        this.actor.add_child(new St.Label({text: app.get_name(), style_class: 'winshell-section-title'}));
        const windows = app.get_windows().filter(win => !win.is_skip_taskbar());
        if (!windows.length) {
            this.actor.add_child(new St.Label({text: 'Nenhuma janela aberta', style_class: 'winshell-empty'}));
        }
        const scroll = new St.ScrollView({x_expand: true, y_expand: true, style_class: 'winshell-preview-scroll'});
        const content = new St.BoxLayout({vertical: true, style_class: 'winshell-preview-list'});
        scroll.set_child(content);
        this.actor.add_child(scroll);
        for (const win of windows.slice(0, 12)) {
            const line = new St.BoxLayout({style_class: 'winshell-preview-line'});
            const actor = win.get_compositor_private();
            if (actor && actor.get_texture()) {
                const clone = new Clutter.Clone({source: actor, width: 90, height: 56});
                line.add_child(clone);
            } else {
                line.add_child(new St.Icon({icon_name: 'application-x-executable-symbolic', icon_size: 36}));
            }
            const title = new St.Button({label: (win.get_title() || app.get_name()).slice(0, 38),
                style_class: 'winshell-preview-title', x_expand: true, can_focus: true});
            title.connect('clicked', () => { this.hide(); win.activate(global.get_current_time()); });
            line.add_child(title);
            const snap = new St.Button({style_class: 'winshell-mini-action', can_focus: true});
            snap.set_child(new St.Icon({icon_name: 'view-grid-symbolic', icon_size: 16}));
            snap.set_accessible_name('Organizar janela');
            snap.connect('clicked', () => {
                this.hide();
                const [x] = snap.get_transformed_position();
                this._snapPanel.forWindow(win, x, bottomY);
            });
            line.add_child(snap);
            const close = new St.Button({style_class: 'winshell-mini-action', can_focus: true});
            close.set_child(new St.Icon({icon_name: 'window-close-symbolic', icon_size: 16}));
            close.set_accessible_name('Fechar janela');
            close.connect('clicked', () => { win.delete(global.get_current_time()); this.hide(); });
            line.add_child(close);
            content.add_child(line);
        }
        const [x] = button.get_transformed_position();
        const [w] = button.get_transformed_size();
        this.show(x + w / 2, bottomY);
    }
    schedule(app, button, bottomY) {
        this.cancelPending();
        this._pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 450, () => {
            this._pending = 0;
            if (button.get_stage()) this.showFor(app, button, bottomY);
            return GLib.SOURCE_REMOVE;
        });
    }
    cancelPending() {
        if (this._pending) { GLib.Source.remove(this._pending); this._pending = 0; }
    }
    destroy() { this.cancelPending(); super.destroy(); }
}

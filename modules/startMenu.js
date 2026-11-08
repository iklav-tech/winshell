import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {activateApp, installedApps} from './apps.js';

export class StartMenu {
    constructor(settings) {
        this._settings = settings;
        this.actor = new St.BoxLayout({
            style_class: 'winshell-start-menu',
            vertical: true,
            visible: false,
            reactive: true,
            can_focus: true,
        });
        this._title = new St.Label({text: 'Iniciar', style_class: 'winshell-menu-title'});
        this.actor.add_child(this._title);
        this._entry = new St.Entry({
            hint_text: 'Pesquisar aplicativos...',
            style_class: 'winshell-search-entry',
            can_focus: true,
            x_expand: true,
        });
        this.actor.add_child(this._entry);
        this._scroll = new St.ScrollView({style_class: 'winshell-app-scroll', x_expand: true, y_expand: true});
        this._grid = new St.BoxLayout({vertical: true, style_class: 'winshell-app-list'});
        this._scroll.set_child(this._grid);
        this.actor.add_child(this._scroll);
        this._footer = new St.Label({text: 'WinShell · GNOME 46', style_class: 'winshell-menu-footer'});
        this.actor.add_child(this._footer);
        Main.layoutManager.addChrome(this.actor, {affectsStruts: false, trackFullscreen: true});
        this._entrySignal = this._entry.clutter_text.connect('text-changed', () => this._populate());
        this._keySignal = this.actor.connect('key-press-event', (_actor, event) => {
            if (event.get_key_symbol() === Clutter.KEY_Escape) {
                this.hide();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        this._stageSignal = global.stage.connect('button-press-event', (_stage, event) => {
            if (!this.actor.visible)
                return Clutter.EVENT_PROPAGATE;
            const target = event.get_source();
            if (!this.actor.contains(target) && target !== this.actor) {
                this.hide();
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }

    _populate() {
        this._grid.destroy_all_children();
        const term = this._entry.get_text().trim().toLocaleLowerCase();
        const matches = installedApps().filter(app => app.get_name().toLocaleLowerCase().includes(term));
        for (const app of matches.slice(0, 80)) {
            const button = new St.Button({style_class: 'winshell-app-item', can_focus: true, x_expand: true});
            const row = new St.BoxLayout({vertical: false, x_expand: true});
            row.add_child(app.create_icon_texture(24));
            row.add_child(new St.Label({text: app.get_name(), y_align: Clutter.ActorAlign.CENTER, style_class: 'winshell-app-name'}));
            button.set_child(row);
            button.connect('clicked', () => {
                activateApp(app);
                this.hide();
            });
            this._grid.add_child(button);
        }
        if (matches.length === 0)
            this._grid.add_child(new St.Label({text: 'Nenhum aplicativo encontrado', style_class: 'winshell-empty'}));
    }

    show(anchorX, bottomY) {
        this._entry.set_text('');
        this._populate();
        const monitor = Main.layoutManager.primaryMonitor;
        const width = Math.min(450, monitor.width - 24);
        const height = Math.min(580, monitor.height - 100);
        this.actor.set_size(width, height);
        const x = Math.max(monitor.x + 12, Math.min(anchorX - width / 2, monitor.x + monitor.width - width - 12));
        const y = Math.max(monitor.y + 8, bottomY - height - 10);
        this.actor.set_position(Math.round(x), Math.round(y));
        this.actor.show();
        global.stage.set_key_focus(this._entry.clutter_text);
    }

    hide() {
        this.actor.hide();
    }

    toggle(anchorX, bottomY) {
        if (this.actor.visible)
            this.hide();
        else
            this.show(anchorX, bottomY);
    }

    destroy() {
        if (this._stageSignal) global.stage.disconnect(this._stageSignal);
        this.actor.destroy();
    }
}

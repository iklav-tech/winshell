import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {activateApp, installedApps} from './apps.js';
import {PopupSurface} from './popup.js';
import {openDesktop} from './systemActions.js';

const SHORTCUTS = [
    ['Configurações', 'org.gnome.Settings.desktop', 'emblem-system-symbolic'],
    ['Arquivos', 'org.gnome.Nautilus.desktop', 'folder-symbolic'],
];

export class StartMenu extends PopupSurface {
    constructor(settings) {
        super('winshell-start-menu', 520, 620);
        this._settings = settings;
        this.actor.add_child(new St.Label({text: 'Iniciar', style_class: 'winshell-menu-title'}));
        this._entry = new St.Entry({hint_text: 'Pesquisar aplicativos, descrições e configurações…',
            style_class: 'winshell-search-entry', can_focus: true, x_expand: true});
        this.actor.add_child(this._entry);
        this._header = new St.Label({text: 'Aplicativos', style_class: 'winshell-section-title'});
        this.actor.add_child(this._header);
        this._scroll = new St.ScrollView({style_class: 'winshell-app-scroll', x_expand: true, y_expand: true});
        this._grid = new St.BoxLayout({vertical: true, style_class: 'winshell-app-list'});
        this._scroll.set_child(this._grid);
        this.actor.add_child(this._scroll);
        const footer = new St.BoxLayout({style_class: 'winshell-menu-actions'});
        for (const [label, id, icon] of SHORTCUTS) {
            const button = new St.Button({style_class: 'winshell-footer-button', can_focus: true});
            const row = new St.BoxLayout({style_class: 'winshell-quick-item'});
            row.add_child(new St.Icon({icon_name: icon, icon_size: 16}));
            row.add_child(new St.Label({text: label}));
            button.set_child(row);
            button.connect('clicked', () => { this.hide(); openDesktop(id); });
            footer.add_child(button);
        }
        this.actor.add_child(footer);
        this._entryChanged = this._entry.clutter_text.connect('text-changed', () => this._populate());
        this._entryKey = this._entry.clutter_text.connect('key-press-event', (_actor, event) => {
            if (event.get_key_symbol() !== Clutter.KEY_Return && event.get_key_symbol() !== Clutter.KEY_KP_Enter)
                return Clutter.EVENT_PROPAGATE;
            const first = this._matches?.[0];
            if (first) { activateApp(first); this.hide(); }
            return Clutter.EVENT_STOP;
        });
        this._appsSignal = Gio.AppInfoMonitor.get().connect('changed', () => {
            if (this.actor.visible) this._populate();
        });
    }

    _populate() {
        this._grid.destroy_all_children();
        const term = this._entry.get_text().trim().toLocaleLowerCase();
        const favorites = this._settings.get_strv('pinned-apps');
        const apps = installedApps();
        this._matches = apps.filter(app => {
            const info = app.get_app_info();
            const searchable = [app.get_name(), info?.get_description() ?? '',
                info?.get_executable() ?? '', ...(info?.get_keywords() ?? [])].join(' ').toLocaleLowerCase();
            return searchable.includes(term);
        }).sort((a, b) => {
            const aFav = favorites.includes(a.get_id()) ? 0 : 1;
            const bFav = favorites.includes(b.get_id()) ? 0 : 1;
            return aFav - bFav || a.get_name().localeCompare(b.get_name());
        });
        this._header.set_text(term ? `Resultados (${this._matches.length})` : 'Fixados e aplicativos');
        for (const app of this._matches.slice(0, 100)) {
            const button = new St.Button({style_class: 'winshell-app-item', can_focus: true, x_expand: true});
            const row = new St.BoxLayout({style_class: 'winshell-app-row'});
            row.add_child(app.create_icon_texture(26));
            const text = new St.BoxLayout({vertical: true, x_expand: true});
            text.add_child(new St.Label({text: app.get_name(), y_align: Clutter.ActorAlign.CENTER,
                style_class: 'winshell-app-name'}));
            if (term && app.get_app_info()?.get_description())
                text.add_child(new St.Label({text: app.get_app_info().get_description().slice(0, 95),
                    style_class: 'winshell-app-description'}));
            row.add_child(text);
            if (favorites.includes(app.get_id()))
                row.add_child(new St.Icon({icon_name: 'starred-symbolic', icon_size: 14}));
            button.set_child(row);
            button.connect('clicked', () => { activateApp(app); this.hide(); });
            this._grid.add_child(button);
        }
        if (!this._matches.length)
            this._grid.add_child(new St.Label({text: 'Nenhum aplicativo encontrado', style_class: 'winshell-empty'}));
    }

    show(anchorX, bottomY) {
        this._entry.set_text('');
        this._populate();
        super.show(anchorX, bottomY);
        global.stage.set_key_focus(this._entry.clutter_text);
    }

    focusSearch(anchorX, bottomY) { this.show(anchorX, bottomY); }

    destroy() {
        Gio.AppInfoMonitor.get().disconnect(this._appsSignal);
        super.destroy();
    }
}

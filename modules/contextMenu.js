import St from 'gi://St';
import {PopupSurface} from './popup.js';
import {openDesktop} from './systemActions.js';

export class ContextMenu extends PopupSurface {
    constructor(settings) {
        super('winshell-flyout winshell-context-menu', 240, 220);
        this._settings = settings;
    }

    _item(text, action) {
        const button = new St.Button({label: text, style_class: 'winshell-context-item',
            can_focus: true, x_expand: true});
        button.connect('clicked', () => { this.hide(); action(); });
        this.actor.add_child(button);
    }

    forApp(app, anchorX, bottomY) {
        this.actor.destroy_all_children();
        const id = app.get_id();
        const pinned = this._settings.get_strv('pinned-apps').includes(id);
        this._item(pinned ? 'Desafixar da barra' : 'Fixar na barra', () => {
            const apps = this._settings.get_strv('pinned-apps').filter(x => x !== id);
            if (!pinned) apps.push(id);
            this._settings.set_strv('pinned-apps', apps);
        });
        this._item('Abrir nova janela', () => app.open_new_window(-1));
        if (app.get_windows().length)
            this._item('Fechar janelas', () => app.get_windows().forEach(win => win.delete(global.get_current_time())));
        this._item('Configurações do WinShell', () => openDesktop('org.gnome.Extensions.desktop'));
        this.show(anchorX, bottomY);
    }

    forTaskbar(anchorX, bottomY) {
        this.actor.destroy_all_children();
        this._item('Centralizar ícones', () => this._settings.set_boolean('center-icons',
            !this._settings.get_boolean('center-icons')));
        this._item('Mostrar pesquisa', () => this._settings.set_boolean('show-search',
            !this._settings.get_boolean('show-search')));
        this._item('Manter painel GNOME', () => this._settings.set_boolean('show-activities-panel',
            !this._settings.get_boolean('show-activities-panel')));
        this._item('Extensões', () => openDesktop('org.gnome.Extensions.desktop'));
        this.show(anchorX, bottomY);
    }
}

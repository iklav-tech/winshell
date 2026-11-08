import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {PopupSurface} from './popup.js';
import {openDesktop, openWinShellPreferences} from './systemActions.js';
import {togglePinnedApp} from './shellFoundationModel.mjs';
import {windowCapabilities} from './windowActions.mjs';

export class ContextMenu extends PopupSurface {
    constructor(settings) {
        super('winshell-flyout winshell-context-menu', 300, 280);
        this._settings = settings;
        this._appearance = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._items = 0;
    }

    _item(text, action, sensitive = true, styleClass = '') {
        const button = new St.Button({label: text,
            style_class: `winshell-context-item ${styleClass}`,
            can_focus: true, x_expand: true, reactive: sensitive});
        button.connect('clicked', () => { this.hide(); action(); });
        this.actor.add_child(button);
        this._items++;
    }

    _label(text) {
        this.actor.add_child(new St.Label({text, style_class: 'winshell-context-heading'}));
    }

    _separator() {
        this.actor.add_child(new St.Widget({style_class: 'winshell-context-separator', height: 1}));
    }

    _windowState(win) {
        return windowCapabilities({
            canActivate: true,
            canMinimize: win.can_minimize(),
            canMaximize: win.can_maximize(),
            canClose: win.can_close(),
            minimized: win.minimized,
            maximizedHorizontally: win.maximized_horizontally,
            maximizedVertically: win.maximized_vertically,
        });
    }

    _show(anchorX, bottomY) {
        if (this._appearance.get_string('color-scheme') === 'prefer-dark')
            this.actor.add_style_class_name('winshell-dark');
        else
            this.actor.remove_style_class_name('winshell-dark');
        this.height = Math.min(650, Math.max(180, this._items * 39 + 90));
        this.show(anchorX, bottomY);
    }

    forApp(app, anchorX, bottomY, openSnap = null) {
        this.actor.destroy_all_children();
        this._items = 0;
        const windows = app.get_windows().filter(win => !win.is_skip_taskbar());
        const focused = global.display.focus_window;
        const target = windows.includes(focused) ? focused : windows[0] ?? null;
        const id = app.get_id();
        const pinned = this._settings.get_strv('pinned-apps').includes(id);

        this._label(app.get_name());
        this._item(windows.length ? 'Abrir aplicativo' : 'Abrir', () => app.activate());
        if (app.can_open_new_window?.())
            this._item('Abrir nova janela', () => app.open_new_window(-1));
        this._item(pinned ? 'Desafixar da barra de tarefas' : 'Fixar na barra de tarefas', () => {
            this._settings.set_strv('pinned-apps',
                togglePinnedApp(this._settings.get_strv('pinned-apps'), id));
        });

        if (windows.length) {
            this._separator();
            this._label(windows.length === 1 ? 'Janela aberta' : `Janelas abertas (${windows.length})`);
            for (const [index, win] of windows.slice(0, 8).entries()) {
                const title = (win.get_title() || `Janela ${index + 1}`).slice(0, 54);
                this._item(`${win === focused ? '● ' : ''}${title}`,
                    () => win.activate(global.get_current_time()));
            }
        }

        if (target) {
            const state = this._windowState(target);
            this._separator();
            this._label('Ações da janela selecionada');
            if (state.canMinimize)
                this._item(state.minimizeLabel, () => {
                    if (target.minimized) target.unminimize();
                    else target.minimize();
                });
            if (state.canMaximize)
                this._item(state.maximizeLabel, () => {
                    if (state.maximized) target.unmaximize(Meta.MaximizeFlags.BOTH);
                    else target.maximize(Meta.MaximizeFlags.BOTH);
                });
            if (openSnap && target.allows_move() && target.allows_resize() && !target.is_fullscreen())
                this._item('Organizar janela (Snap Layouts)', () => openSnap(target));
            if (state.canClose)
                this._item('Fechar janela', () => target.delete(global.get_current_time()));
            const closable = windows.filter(win => win.can_close());
            if (closable.length > 1)
                this._item(`Fechar todas as ${closable.length} janelas`,
                    () => closable.forEach(win => win.delete(global.get_current_time())),
                    true, 'winshell-context-danger');
        }

        const info = app.get_app_info?.();
        const desktopActions = info?.list_actions?.() ?? [];
        if (desktopActions.length) {
            this._separator();
            this._label('Ações do aplicativo');
            for (const action of desktopActions.slice(0, 8)) {
                const label = info.get_action_name(action);
                if (label) this._item(label, () =>
                    app.launch_action(action, global.get_current_time(), -1));
            }
        }
        this._separator();
        this._item('Preferências da barra de tarefas', openWinShellPreferences);
        this._show(anchorX, bottomY);
    }

    forTaskbar(anchorX, bottomY) {
        this.actor.destroy_all_children();
        this._items = 0;
        this._label('Barra de tarefas');
        this._item(this._settings.get_boolean('center-icons') ? 'Alinhar ícones à esquerda' : 'Centralizar ícones',
            () => this._settings.set_boolean('center-icons', !this._settings.get_boolean('center-icons')));
        this._item(this._settings.get_boolean('show-search') ? 'Ocultar pesquisa' : 'Mostrar pesquisa',
            () => this._settings.set_boolean('show-search', !this._settings.get_boolean('show-search')));
        this._item(this._settings.get_boolean('show-activities-panel') ? 'Ocultar painel superior GNOME' : 'Mostrar painel superior GNOME',
            () => this._settings.set_boolean('show-activities-panel',
                !this._settings.get_boolean('show-activities-panel')));
        this._item(this._settings.get_boolean('multi-monitor') ? 'Usar apenas o monitor principal' : 'Mostrar em todos os monitores',
            () => this._settings.set_boolean('multi-monitor', !this._settings.get_boolean('multi-monitor')));
        this._separator();
        this._item('Preferências da barra de tarefas', openWinShellPreferences);
        this._item('Gerenciar extensões', () => openDesktop('org.gnome.Extensions.desktop'));
        this._show(anchorX, bottomY);
    }

    destroy() {
        this._appearance = null;
        this._settings = null;
        super.destroy();
    }
}

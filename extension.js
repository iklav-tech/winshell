import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Taskbar} from './modules/taskbar.js';
import {StartMenu} from './modules/startMenu.js';

// Restore the native panel after a native menu closes when in immersive mode.
class NativePanelController {
    constructor(settings) {
        this._settings = settings;
        this._menu = null;
        this._menuSignal = 0;
    }

    open(menu) {
        if (this._menu && this._menuSignal) this._menu.disconnect(this._menuSignal);
        this._menu = menu;
        this._menuSignal = 0;
        const temporary = !this._settings.get_boolean('show-activities-panel');
        if (temporary) Main.panel.show();
        menu.open();
        if (temporary) {
            this._menuSignal = menu.connect('open-state-changed', (_menu, isOpen) => {
                if (!isOpen) {
                    if (!this._settings.get_boolean('show-activities-panel')) Main.panel.hide();
                    menu.disconnect(this._menuSignal);
                    this._menuSignal = 0;
                    this._menu = null;
                }
            });
        }
    }

    destroy() {
        if (this._menu && this._menuSignal) this._menu.disconnect(this._menuSignal);
        this._menu = null;
        this._menuSignal = 0;
    }
}

export default class WinShellExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._nativePanelWasVisible = Main.panel.visible;
        try {
            this._panelController = new NativePanelController(this._settings);
            this._menu = new StartMenu(this._settings);
            this._taskbar = new Taskbar(this._settings, this._menu, this._panelController);
            this._settingsSignal = this._settings.connect('changed::show-activities-panel',
                () => this._updateNativePanel());
            this._updateNativePanel();
        } catch (error) {
            console.error(`[WinShell] Falha ao iniciar: ${error.stack ?? error}`);
            this.disable();
            throw error;
        }
    }

    _updateNativePanel() {
        if (!this._settings.get_boolean('show-activities-panel')) Main.panel.hide();
        else if (this._nativePanelWasVisible) Main.panel.show();
    }

    disable() {
        if (this._settingsSignal && this._settings) {
            this._settings.disconnect(this._settingsSignal);
            this._settingsSignal = 0;
        }
        this._taskbar?.destroy();
        this._taskbar = null;
        this._menu?.destroy();
        this._menu = null;
        this._panelController?.destroy();
        this._panelController = null;
        if (this._nativePanelWasVisible) Main.panel.show();
        this._settings = null;
    }
}

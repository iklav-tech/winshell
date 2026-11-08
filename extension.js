import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {ExtensionState} from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {TaskbarManager} from './modules/multiMonitor.js';
import {StartMenu} from './modules/startMenu.js';
import {TaskbarConflictManager} from './modules/taskbarConflict.js';

export default class WinShellExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        if (this._nativePanelWasVisible === undefined)
            this._nativePanelWasVisible = Main.panel.visible;
        try {
            this._menu = new StartMenu(this._settings);
            this._taskbar = new TaskbarManager(this._settings, this._menu);
            this._taskbarConflicts = new TaskbarConflictManager(this._settings);
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
        const ownState = Main.extensionManager.lookup(this.uuid)?.state;
        const isExtensionRebase = ownState === ExtensionState.ACTIVE;
        if (this._settingsSignal && this._settings) {
            this._settings.disconnect(this._settingsSignal);
            this._settingsSignal = 0;
        }
        this._taskbarConflicts?.destroy({restore: !isExtensionRebase});
        this._taskbarConflicts = null;
        this._taskbar?.destroy();
        this._taskbar = null;
        this._menu?.destroy();
        this._menu = null;
        if (this._nativePanelWasVisible) Main.panel.show();
        if (!isExtensionRebase)
            this._nativePanelWasVisible = undefined;
        this._settings = null;
    }
}

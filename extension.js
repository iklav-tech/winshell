import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {TaskbarManager} from './modules/multiMonitor.js';
import {StartMenu} from './modules/startMenu.js';
import {TaskbarConflictManager} from './modules/taskbarConflict.js';
import {ShellAppearanceController} from './modules/appearance/theme.js';
import {extensionManager, ExtensionState, shellPanel} from './modules/shellCompat.js';

export default class WinShellExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        if (this._nativePanelWasVisible === undefined)
            this._nativePanelWasVisible = shellPanel().visible;
        try {
            this._appearance = new ShellAppearanceController(this._settings);
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
        if (!this._settings.get_boolean('show-activities-panel')) shellPanel().hide();
        else if (this._nativePanelWasVisible) shellPanel().show();
    }

    disable() {
        const ownState = extensionManager().lookup(this.uuid)?.state;
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
        this._appearance?.destroy();
        this._appearance = null;
        if (this._nativePanelWasVisible) shellPanel().show();
        if (!isExtensionRebase)
            this._nativePanelWasVisible = undefined;
        this._settings = null;
    }
}

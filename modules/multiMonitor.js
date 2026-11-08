import {Taskbar} from './taskbar.js';
import {SystemControls} from './systemControls.js';
import {taskbarMonitorIndexes} from './taskbarGeometry.mjs';
import {layoutManager, notify} from './shellCompat.js';

export class TaskbarManager {
    constructor(settings, menu) {
        this._settings = settings;
        this._menu = menu;
        this._bars = [];
        this._monitorSignal = 0;
        this._settingSignal = 0;
        this._destroyed = false;
        try {
            this._systemControls = new SystemControls();
            this._monitorSignal = layoutManager().connect('monitors-changed', () => this._safeRebuild());
            this._settingSignal = settings.connect('changed::multi-monitor', () => this._safeRebuild());
            this._rebuild();
        } catch (error) {
            this.destroy();
            throw error;
        }
    }
    _safeRebuild() {
        if (this._destroyed)
            return;
        try {
            this._rebuild();
        } catch (error) {
            console.error(`[WinShell] Falha ao reconstruir barras: ${error.stack ?? error}`);
            notify('WinShell', 'Não foi possível reconstruir a barra após a mudança de monitores.');
        }
    }
    _rebuild() {
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
        const manager = layoutManager();
        const indexes = taskbarMonitorIndexes(manager.monitors,
            manager.primaryIndex, this._settings.get_boolean('multi-monitor'));
        try {
            for (const index of indexes)
                this._bars.push(new Taskbar(this._settings, this._menu, this._systemControls, index));
        } catch (error) {
            this._bars.forEach(bar => bar.destroy());
            this._bars = [];
            throw error;
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this._monitorSignal) {
            try { layoutManager().disconnect(this._monitorSignal); } catch (_error) { /* Disposed. */ }
        }
        if (this._settingSignal) {
            try { this._settings?.disconnect(this._settingSignal); } catch (_error) { /* Disposed. */ }
        }
        this._monitorSignal = 0;
        this._settingSignal = 0;
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
        this._systemControls?.destroy();
        this._systemControls = null;
        this._settings = null;
        this._menu = null;
    }
}

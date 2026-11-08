import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Taskbar} from './taskbar.js';
import {SystemControls} from './systemControls.js';

export class TaskbarManager {
    constructor(settings, menu) {
        this._settings = settings;
        this._menu = menu;
        this._bars = [];
        this._monitorSignal = 0;
        this._settingSignal = 0;
        try {
            this._systemControls = new SystemControls();
            this._monitorSignal = Main.layoutManager.connect('monitors-changed', () => this._rebuild());
            this._settingSignal = settings.connect('changed::multi-monitor', () => this._rebuild());
            this._rebuild();
        } catch (error) {
            this.destroy();
            throw error;
        }
    }
    _rebuild() {
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
        const count = this._settings.get_boolean('multi-monitor') ? Main.layoutManager.monitors.length : 1;
        const primary = Main.layoutManager.primaryIndex ?? 0;
        for (let i = 0; i < count; i++) {
            const index = this._settings.get_boolean('multi-monitor') ? i : primary;
            this._bars.push(new Taskbar(this._settings, this._menu, this._systemControls, index));
        }
    }
    destroy() {
        if (this._monitorSignal) Main.layoutManager.disconnect(this._monitorSignal);
        if (this._settingSignal) this._settings.disconnect(this._settingSignal);
        this._monitorSignal = 0;
        this._settingSignal = 0;
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
        this._systemControls?.destroy();
        this._systemControls = null;
    }
}

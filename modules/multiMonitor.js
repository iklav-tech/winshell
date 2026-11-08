import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Taskbar} from './taskbar.js';

export class TaskbarManager {
    constructor(settings, menu, panelController) {
        this._settings = settings;
        this._menu = menu;
        this._panelController = panelController;
        this._bars = [];
        this._monitorSignal = Main.layoutManager.connect('monitors-changed', () => this._rebuild());
        this._settingSignal = settings.connect('changed::multi-monitor', () => this._rebuild());
        this._rebuild();
    }
    _rebuild() {
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
        const count = this._settings.get_boolean('multi-monitor') ? Main.layoutManager.monitors.length : 1;
        const primary = Main.layoutManager.primaryIndex ?? 0;
        for (let i = 0; i < count; i++) {
            const index = this._settings.get_boolean('multi-monitor') ? i : primary;
            this._bars.push(new Taskbar(this._settings, this._menu, this._panelController, index));
        }
    }
    destroy() {
        Main.layoutManager.disconnect(this._monitorSignal);
        this._settings.disconnect(this._settingSignal);
        this._bars.forEach(bar => bar.destroy());
        this._bars = [];
    }
}

import Meta from 'gi://Meta';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {PopupSurface} from './popup.js';

// Pure layout calculations can be verified independently of GNOME Shell.
export const LAYOUTS = [
    ['Metade esquerda', [0, 0, .5, 1]],
    ['Metade direita', [.5, 0, .5, 1]],
    ['Terço esquerdo', [0, 0, 1 / 3, 1]],
    ['Terço central', [1 / 3, 0, 1 / 3, 1]],
    ['Terço direito', [2 / 3, 0, 1 / 3, 1]],
    ['Quadrante superior esquerdo', [0, 0, .5, .5]],
    ['Quadrante superior direito', [.5, 0, .5, .5]],
    ['Quadrante inferior esquerdo', [0, .5, .5, .5]],
    ['Quadrante inferior direito', [.5, .5, .5, .5]],
];

export function applyLayout(win, geometry) {
    if (!win || !win.allows_move() || !win.allows_resize() || win.is_fullscreen())
        return false;
    const monitor = win.get_monitor();
    const area = win.get_work_area_for_monitor(monitor);
    if (!area || area.width <= 0 || area.height <= 0) return false;
    const [x, y, w, h] = geometry;
    const left = area.x + Math.round(x * area.width);
    const top = area.y + Math.round(y * area.height);
    const right = area.x + Math.round((x + w) * area.width);
    const bottom = area.y + Math.round((y + h) * area.height);
    try {
        win.unmaximize(Meta.MaximizeFlags.BOTH);
        win.move_resize_frame(true, left, top, right - left, bottom - top);
        win.activate(global.get_current_time());
        return true;
    } catch (e) {
        console.warn(`[WinShell] Could not snap window: ${e}`);
        return false;
    }
}

export class SnapLayoutPanel extends PopupSurface {
    constructor() {
        super('winshell-flyout winshell-snap-panel', 330, 420);
        this._window = null;
    }
    forWindow(win, x, y) {
        this._window = win;
        this.actor.destroy_all_children();
        this.actor.add_child(new St.Label({text: 'Organizar janela', style_class: 'winshell-flyout-title'}));
        for (const [name, rect] of LAYOUTS) {
            const button = new St.Button({label: name, style_class: 'winshell-context-item', x_expand: true, can_focus: true});
            button.connect('clicked', () => {
                this.hide();
                if (!applyLayout(win, rect))
                    Main.notify('WinShell', 'Esta janela não permite esse layout.');
            });
            this.actor.add_child(button);
        }
        this.show(x, y);
    }
}

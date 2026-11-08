import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {PopupSurface} from './popup.js';
import {TEMPLATES, regionToPixels} from './layoutGeometry.mjs';

export function applyLayout(win, region) {
    if (!win || !win.allows_move() || !win.allows_resize() || win.is_fullscreen())
        return false;
    const monitor = win.get_monitor();
    const rectangle = regionToPixels(win.get_work_area_for_monitor(monitor), region);
    if (!rectangle) return false;
    try {
        win.unmaximize(Meta.MaximizeFlags.BOTH);
        win.move_resize_frame(true, rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        win.activate(global.get_current_time());
        return true;
    } catch (error) {
        console.warn(`[WinShell] Could not snap window: ${error}`);
        return false;
    }
}

export class SnapLayoutPanel extends PopupSurface {
    constructor() {
        super('winshell-flyout winshell-snap-panel', 420, 390);
    }

    forWindow(win, anchorX, bottomY) {
        this.actor.destroy_all_children();
        this.actor.add_child(new St.Label({text: 'Organizar janela', style_class: 'winshell-flyout-title'}));
        const title = win?.get_title?.() || 'Janela';
        this.actor.add_child(new St.Label({text: title.slice(0, 54), style_class: 'winshell-snap-subtitle'}));
        if (!win || !win.allows_move() || !win.allows_resize() || win.is_fullscreen()) {
            this.actor.add_child(new St.Label({text: 'Esta janela não pode ser reorganizada.', style_class: 'winshell-empty'}));
            super.show(anchorX, bottomY);
            return;
        }
        const scroll = new St.ScrollView({x_expand: true, y_expand: true, style_class: 'winshell-snap-scroll'});
        const content = new St.BoxLayout({vertical: true, style_class: 'winshell-snap-list'});
        scroll.set_child(content);
        this.actor.add_child(scroll);
        for (const template of TEMPLATES) {
            const wrapper = new St.BoxLayout({vertical: true, style_class: 'winshell-snap-template'});
            wrapper.add_child(new St.Label({text: template.label, style_class: 'winshell-snap-template-name'}));
            const canvas = new St.Widget({layout_manager: new Clutter.FixedLayout(),
                style_class: 'winshell-snap-canvas', x_expand: true, height: 52});
            // Position each segment proportionally, so the chosen region is unmistakable.
            for (const [index, region] of template.regions.entries()) {
                const button = new St.Button({style_class: 'winshell-snap-region',
                    reactive: true, can_focus: true, track_hover: true});
                button.set_accessible_name(`${template.label}: região ${index + 1}`);
                button.connect('clicked', () => {
                    this.hide();
                    if (!applyLayout(win, region))
                        Main.notify('WinShell', 'O aplicativo não aceitou o posicionamento solicitado.');
                });
                canvas.add_child(button);
                // Relative size is calculated when the canvas is allocated.
                button._winshellRegion = region;
            }
            const allocationId = canvas.connect('notify::allocation', () => this._allocateRegions(canvas));
            // The signal belongs to canvas and is automatically removed when destroyed.
            void allocationId;
            wrapper.add_child(canvas);
            content.add_child(wrapper);
        }
        super.show(anchorX, bottomY);
    }

    _allocateRegions(canvas) {
        const width = canvas.width;
        const height = canvas.height;
        if (width <= 0 || height <= 0) return;
        for (const button of canvas.get_children()) {
            const [rx, ry, rw, rh] = button._winshellRegion;
            const gap = 2;
            button.set_position(Math.round(rx * width) + gap, Math.round(ry * height) + gap);
            button.set_size(Math.max(1, Math.round(rw * width) - gap * 2),
                Math.max(1, Math.round(rh * height) - gap * 2));
        }
    }
}

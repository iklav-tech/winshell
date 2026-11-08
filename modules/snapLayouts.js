import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import {PopupSurface} from './popup.js';
import {constrainedPosition, rectangleWithinArea, rectanglesApproximatelyEqual,
    sizeConstraintFromResult, snapGeometry, snapTemplateGeometry,
    TEMPLATES} from './layoutGeometry.mjs';
import {notify} from './shellCompat.js';

function windowConstraint(win, method) {
    try {
        const value = win?.[method]?.();
        return sizeConstraintFromResult(value);
    } catch (error) {
        console.debug(`[WinShell] Restrição de janela indisponível (${method}): ${error.message}`);
        return [0, 0];
    }
}

function windowSnapContext(win) {
    try {
        if (!win || !win.allows_move() || !win.allows_resize() || win.is_fullscreen())
            return null;
        const monitor = win.get_monitor();
        return {
            area: win.get_work_area_for_monitor(monitor),
            constraints: {
                minimum: windowConstraint(win, 'get_min_size'),
                maximum: windowConstraint(win, 'get_max_size'),
            },
        };
    } catch (error) {
        console.debug(`[WinShell] Não foi possível consultar a janela para Snap: ${error.message}`);
        return null;
    }
}

export function applyLayout(win, region, onApplied = null) {
    const context = windowSnapContext(win);
    if (!context)
        return false;
    const {area, constraints} = context;
    const rectangle = snapGeometry(area, region, constraints);
    if (!rectangle) return false;
    try {
        if (win.minimized && typeof win.unminimize === 'function')
            win.unminimize();
        win.unmaximize(Meta.MaximizeFlags.BOTH);
        win.move_resize_frame(true, rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        win.activate(global.get_current_time());
        onApplied?.(area, rectangle);
        return true;
    } catch (error) {
        console.warn(`[WinShell] Could not snap window: ${error}`);
        return false;
    }
}

export class SnapLayoutPanel extends PopupSurface {
    constructor() {
        super('winshell-flyout winshell-snap-panel', 420, 390);
        this._verificationIds = new Set();
    }

    _verifyResult(win, area, requested) {
        const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 160, () => {
            this._verificationIds.delete(id);
            try {
                const actual = win.get_frame_rect();
                if (rectangleWithinArea(actual, area)) {
                    if (!rectanglesApproximatelyEqual(actual, requested)) {
                        console.debug(`[WinShell] Aplicativo ajustou a geometria Snap: ${JSON.stringify({requested, actual})}`);
                        notify('WinShell', 'O aplicativo aplicou seus próprios limites de tamanho ao layout.');
                    }
                    return GLib.SOURCE_REMOVE;
                }
                const position = constrainedPosition(actual, area);
                if (position && win.allows_move()) {
                    win.move_frame(true, position.x, position.y);
                    console.debug('[WinShell] Snap reposicionado após restrições do aplicativo.');
                } else {
                    console.warn(`[WinShell] Resultado do Snap fora da área útil: ${JSON.stringify({requested, actual, area})}`);
                    notify('WinShell', 'A restrição de tamanho do aplicativo não cabe nesta área útil.');
                }
            } catch (error) {
                console.debug(`[WinShell] Não foi possível verificar o resultado do Snap: ${error.message}`);
            }
            return GLib.SOURCE_REMOVE;
        });
        this._verificationIds.add(id);
    }

    forWindow(win, anchorX, bottomY) {
        this.actor.destroy_all_children();
        this.actor.add_child(new St.Label({text: 'Organizar janela', style_class: 'winshell-flyout-title'}));
        const title = win?.get_title?.() || 'Janela';
        this.actor.add_child(new St.Label({text: title.slice(0, 54), style_class: 'winshell-snap-subtitle'}));
        const context = windowSnapContext(win);
        if (!context) {
            this.actor.add_child(new St.Label({text: 'Esta janela não pode ser reorganizada.', style_class: 'winshell-empty'}));
            super.show(anchorX, bottomY);
            return;
        }
        const scroll = new St.ScrollView({x_expand: true, y_expand: true, style_class: 'winshell-snap-scroll'});
        const content = new St.BoxLayout({vertical: true, style_class: 'winshell-snap-list'});
        scroll.set_child(content);
        this.actor.add_child(scroll);
        let eligibleRegions = 0;
        for (const template of TEMPLATES) {
            const geometries = snapTemplateGeometry(template, context.area, context.constraints);
            const wrapper = new St.BoxLayout({vertical: true, style_class: 'winshell-snap-template'});
            wrapper.add_child(new St.Label({text: template.label, style_class: 'winshell-snap-template-name'}));
            const canvas = new St.Widget({layout_manager: new Clutter.FixedLayout(),
                style_class: 'winshell-snap-canvas', x_expand: true, height: 52});
            // Position each segment proportionally, so the chosen region is unmistakable.
            for (const [index, region] of template.regions.entries()) {
                const eligible = Boolean(geometries?.[index]);
                if (eligible)
                    eligibleRegions++;
                const button = new St.Button({
                    style_class: eligible
                        ? 'winshell-snap-region'
                        : 'winshell-snap-region winshell-snap-region-disabled',
                    reactive: eligible, can_focus: eligible, track_hover: eligible,
                });
                button.set_accessible_name(eligible
                    ? `${template.label}: região ${index + 1}`
                    : `${template.label}: região ${index + 1}, indisponível para o tamanho desta janela`);
                if (eligible) {
                    button.connect('clicked', () => {
                        this.hide();
                        if (!applyLayout(win, region,
                            (area, requested) => this._verifyResult(win, area, requested)))
                            notify('WinShell', 'O aplicativo não aceitou o posicionamento solicitado.');
                    });
                }
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
        if (!eligibleRegions) {
            content.insert_child_at_index(new St.Label({
                text: 'Nenhuma região comporta os limites de tamanho desta janela.',
                style_class: 'winshell-empty',
            }), 0);
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

    destroy() {
        for (const id of this._verificationIds)
            GLib.Source.remove(id);
        this._verificationIds.clear();
        super.destroy();
    }
}

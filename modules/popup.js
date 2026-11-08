import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {monitorAtPoint, popupGeometry} from './popupGeometry.mjs';
import {addChrome, layoutManager, removeChrome} from './shellCompat.js';

// Popup surfaces are regular Shell actors, avoiding private popup-menu internals.
export class PopupSurface {
    constructor(styleClass, width, height) {
        this.width = width;
        this.height = height;
        this.actor = new St.BoxLayout({style_class: styleClass, vertical: true,
            visible: false, reactive: true, can_focus: true});
        addChrome(this.actor, {affectsStruts: false, trackFullscreen: true});
        this._previousFocus = null;
        this._focusCaptured = false;
        this._destroyed = false;
        this._outsideId = 0;
        this._escapeId = 0;
        try {
            this._outsideId = global.stage.connect('button-press-event', (_stage, event) => {
                const source = event.get_source();
                if (this.actor.visible && (!source || !this.actor.contains(source)))
                    this.hide();
                return Clutter.EVENT_PROPAGATE;
            });
            this._escapeId = global.stage.connect('captured-event', (_stage, event) => {
                if (this.actor.visible && event.type() === Clutter.EventType.KEY_PRESS &&
                    event.get_key_symbol() === Clutter.KEY_Escape) {
                    this.hide();
                    return Clutter.EVENT_STOP;
                }
                return Clutter.EVENT_PROPAGATE;
            });
        } catch (error) {
            if (this._outsideId)
                global.stage.disconnect(this._outsideId);
            removeChrome(this.actor);
            this.actor.destroy();
            throw error;
        }
    }

    show(anchorX, bottomY, {takeFocus = true} = {}) {
        if (this._destroyed)
            return false;
        const manager = layoutManager();
        const monitor = monitorAtPoint(manager.monitors, anchorX, bottomY,
            manager.primaryMonitor);
        const geometry = popupGeometry(monitor, anchorX, bottomY, this.width, this.height);
        if (!geometry)
            return false;
        if (takeFocus && !this._focusCaptured) {
            this._previousFocus = global.stage.key_focus;
            this._focusCaptured = true;
        }
        this.actor.set_size(geometry.width, geometry.height);
        this.actor.set_position(geometry.x, geometry.y);
        this.actor.show();
        if (takeFocus && !this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false))
            global.stage.set_key_focus(this.actor);
        return true;
    }

    toggle(x, bottomY) {
        if (this.actor.visible) this.hide();
        else this.show(x, bottomY);
    }

    hide() {
        if (!this.actor?.visible)
            return;
        this.actor.hide();
        if (this._previousFocus?.get_stage?.())
            global.stage.set_key_focus(this._previousFocus);
        this._previousFocus = null;
        this._focusCaptured = false;
    }

    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.hide();
        if (this._outsideId) global.stage.disconnect(this._outsideId);
        if (this._escapeId) global.stage.disconnect(this._escapeId);
        this._outsideId = 0;
        this._escapeId = 0;
        removeChrome(this.actor);
        this.actor?.destroy();
        this.actor = null;
        this._previousFocus = null;
        this._focusCaptured = false;
    }
}

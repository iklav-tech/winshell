import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// Popup surfaces are regular Shell actors, avoiding private popup-menu internals.
export class PopupSurface {
    constructor(styleClass, width, height) {
        this.width = width;
        this.height = height;
        this.actor = new St.BoxLayout({style_class: styleClass, vertical: true,
            visible: false, reactive: true, can_focus: true});
        Main.layoutManager.addChrome(this.actor, {affectsStruts: false, trackFullscreen: true});
        this._outsideId = global.stage.connect('button-press-event', (_stage, event) => {
            if (this.actor.visible && !this.actor.contains(event.get_source()))
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
    }

    show(anchorX, bottomY) {
        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor) return;
        const width = Math.min(this.width, monitor.width - 24);
        const height = Math.min(this.height, monitor.height - 32);
        const x = Math.max(monitor.x + 12,
            Math.min(Math.round(anchorX - width / 2), monitor.x + monitor.width - width - 12));
        const y = Math.max(monitor.y + 12, bottomY - height - 10);
        this.actor.set_size(width, height);
        this.actor.set_position(x, y);
        this.actor.show();
        global.stage.set_key_focus(this.actor);
    }

    toggle(x, bottomY) {
        if (this.actor.visible) this.hide();
        else this.show(x, bottomY);
    }

    hide() { this.actor.hide(); }

    destroy() {
        if (this._outsideId) global.stage.disconnect(this._outsideId);
        if (this._escapeId) global.stage.disconnect(this._escapeId);
        this.actor.destroy();
    }
}

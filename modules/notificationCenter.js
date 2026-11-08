import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {PopupSurface} from './popup.js';
import {openNativeMenu} from './systemActions.js';

// Best-effort read-only presentation of notifications exposed by the Shell.
// GNOME remains the authoritative store, presentation and dismissal service.
export class NotificationCenter extends PopupSurface {
    constructor(panelController) {
        super('winshell-flyout winshell-notification-center', 380, 440);
        this._panelController = panelController;
    }
    _notifications() {
        const result = [];
        const sources = Main.messageTray.getSources?.() ?? [];
        for (const source of sources) {
            const notifications = Array.isArray(source.notifications) ? source.notifications : [];
            for (const notification of notifications) {
                result.push({source, notification});
            }
        }
        return result.slice(-30).reverse();
    }
    show(x, y) {
        this.actor.destroy_all_children();
        const heading = new St.BoxLayout({style_class: 'winshell-notification-heading'});
        heading.add_child(new St.Label({text: 'Notificações', style_class: 'winshell-flyout-title', x_expand: true}));
        const native = new St.Button({label: 'Calendário', style_class: 'winshell-footer-button'});
        native.connect('clicked', () => { this.hide(); openNativeMenu('calendar', this._panelController); });
        heading.add_child(native);
        this.actor.add_child(heading);
        const scroll = new St.ScrollView({style_class: 'winshell-notifications-scroll', y_expand: true});
        const list = new St.BoxLayout({vertical: true, style_class: 'winshell-notifications-list'});
        scroll.set_child(list);
        this.actor.add_child(scroll);
        const items = this._notifications();
        for (const {source, notification} of items) {
            const card = new St.BoxLayout({vertical: true, style_class: 'winshell-notification-card'});
            card.add_child(new St.Label({text: String(notification.title || source.title || 'Notificação').slice(0, 100),
                style_class: 'winshell-section-title'}));
            const body = notification.body || '';
            if (body) card.add_child(new St.Label({text: String(body).replace(/<[^>]*>/g, '').slice(0, 240),
                style_class: 'winshell-notification-body'}));
            list.add_child(card);
        }
        if (!items.length) list.add_child(new St.Label({text: 'Nenhuma notificação disponível. Abra o calendário para ver o histórico nativo.',
            style_class: 'winshell-empty'}));
        super.show(x, y);
    }
}

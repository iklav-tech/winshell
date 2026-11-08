import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {WinShellCalendar} from './calendar.js';
import {groupNotifications, notificationCapabilities} from './notificationModel.mjs';
import {PopupSurface} from './popup.js';
import {messageSources, messageSourcesSupported, messageTray} from './shellCompat.js';

function safeDisconnect(object, id) {
    if (!object || !id) return;
    try { object.disconnect(id); } catch (_error) { /* Source may already be disposed. */ }
}

function safeConnect(object, signal, callback) {
    if (!object?.connect) return 0;
    try {
        return object.connect(signal, callback);
    } catch (error) {
        console.debug(`[WinShell] Sinal de notificação indisponível (${signal}): ${error.message}`);
        return 0;
    }
}

function safeInvoke(label, callback) {
    try {
        callback();
        return true;
    } catch (error) {
        console.warn(`[WinShell] Falha ao ${label}: ${error.message}`);
        return false;
    }
}

export class NotificationCenter extends PopupSurface {
    constructor(systemControls) {
        super('winshell-flyout winshell-notification-center', 430, 760);
        this._controls = systemControls;
        this._calendar = new WinShellCalendar();
        this._sourceSignals = new Map();
        this._notificationSignals = new Map();
        this._renderId = 0;
        this._tray = messageTray();
        this._sourceApiAvailable = messageSourcesSupported();
        this._traySignals = [
            safeConnect(this._tray, 'source-added', () => this._syncSources()),
            safeConnect(this._tray, 'source-removed', () => this._syncSources()),
        ].filter(Boolean);
        this._state = systemControls.getState();
        this._unsubscribe = systemControls.subscribe(state => {
            this._state = state;
            if (this.actor.visible) this._render();
        });
        this._syncSources();
    }

    _scheduleRender() {
        this._syncNotifications();
        this._queueRender();
    }

    _queueRender() {
        if (!this.actor.visible || this._renderId) return;
        this._renderId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._renderId = 0;
            if (this.actor.visible) this._render();
            return GLib.SOURCE_REMOVE;
        });
    }

    _syncSources() {
        const current = new Set(messageSources());
        for (const [source, ids] of this._sourceSignals) {
            if (current.has(source)) continue;
            for (const id of ids) safeDisconnect(source, id);
            this._sourceSignals.delete(source);
        }
        for (const source of current) {
            if (this._sourceSignals.has(source)) continue;
            const ids = [];
            for (const signal of ['notification-added', 'notification-removed']) {
                const id = safeConnect(source, signal, () => this._scheduleRender());
                if (id) ids.push(id);
            }
            const destroyId = safeConnect(source, 'destroy', () => {
                this._sourceSignals.delete(source);
                this._scheduleRender();
            });
            if (destroyId) ids.push(destroyId);
            this._sourceSignals.set(source, ids);
        }
        this._syncNotifications();
        this._queueRender();
    }

    _syncNotifications() {
        const current = new Set();
        for (const source of messageSources())
            for (const notification of source.notifications ?? []) current.add(notification);
        for (const notification of current) {
            if (this._notificationSignals.has(notification)) continue;
            const ids = [];
            for (const signal of ['notify', 'action-added', 'action-removed']) {
                const id = safeConnect(notification, signal, () => {
                    this._queueRender();
                });
                if (id) ids.push(id);
            }
            const destroyId = safeConnect(notification, 'destroy', () => {
                this._notificationSignals.delete(notification);
                this._queueRender();
            });
            if (destroyId) ids.push(destroyId);
            this._notificationSignals.set(notification, ids);
        }
        for (const [notification, ids] of this._notificationSignals) {
            if (current.has(notification)) continue;
            for (const id of ids) safeDisconnect(notification, id);
            this._notificationSignals.delete(notification);
        }
    }

    _notifications() {
        const result = [];
        for (const source of messageSources()) {
            const app = source.app ?? source._app ?? null;
            for (const notification of source.notifications ?? []) {
                result.push({
                    source, notification, app,
                    appId: app?.get_id?.() ?? source.title ?? 'unknown',
                    appName: app?.get_name?.() ?? source.title ?? 'Aplicativo',
                    title: notification.title,
                    body: notification.body,
                    timestamp: notification.datetime,
                });
            }
        }
        return result;
    }

    _appIcon(item) {
        if (item.notification.gicon)
            return new St.Icon({gicon: item.notification.gicon, icon_size: 18});
        if (item.app?.create_icon_texture) return item.app.create_icon_texture(18);
        if (item.source.icon)
            return new St.Icon({gicon: item.source.icon, icon_size: 18});
        return new St.Icon({icon_name: 'application-x-executable-symbolic', icon_size: 18});
    }

    _timestamp(item) {
        const datetime = item.notification.datetime;
        if (datetime?.format) return datetime.format('%H:%M');
        if (item.timestamp) return new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
        });
        return '';
    }

    _notificationCard(item) {
        const capabilities = notificationCapabilities(item.notification);
        const card = new St.BoxLayout({vertical: true, style_class: 'winshell-notification-card'});
        const top = new St.BoxLayout({style_class: 'winshell-notification-top'});
        top.add_child(new St.Label({text: item.title, style_class: 'winshell-notification-title',
            x_expand: true, y_align: Clutter.ActorAlign.CENTER}));
        top.add_child(new St.Label({text: this._timestamp(item), style_class: 'winshell-notification-time',
            y_align: Clutter.ActorAlign.CENTER}));
        const dismiss = new St.Button({style_class: 'winshell-mini-action', icon_name: 'window-close-symbolic',
            can_focus: capabilities.canDismiss, reactive: capabilities.canDismiss,
            accessible_name: capabilities.canDismiss ? 'Dispensar notificação' : 'Dispensa indisponível'});
        if (capabilities.canDismiss)
            dismiss.connect('clicked', () => safeInvoke('dispensar notificação',
                () => item.notification.destroy()));
        top.add_child(dismiss);
        card.add_child(top);
        const content = new St.Button({style_class: 'winshell-notification-content',
            can_focus: capabilities.canActivate, reactive: capabilities.canActivate, x_expand: true});
        const body = new St.BoxLayout({vertical: true});
        if (item.body) {
            const bodyLabel = new St.Label({text: item.body, style_class: 'winshell-notification-body',
                x_expand: true});
            bodyLabel.clutter_text.line_wrap = true;
            body.add_child(bodyLabel);
        }
        if (capabilities.canActivate)
            body.add_child(new St.Label({text: 'Abrir', style_class: 'winshell-notification-open'}));
        content.set_child(body);
        if (capabilities.canActivate) {
            content.connect('clicked', () => {
                if (safeInvoke('ativar notificação', () => item.notification.activate()))
                    this.hide();
            });
        }
        card.add_child(content);
        if (capabilities.actions.length) {
            const actions = new St.BoxLayout({style_class: 'winshell-notification-actions'});
            for (const action of capabilities.actions.slice(0, 3)) {
                const button = new St.Button({label: action.label, style_class: 'winshell-footer-button',
                    can_focus: true, x_expand: true});
                button.connect('clicked', () => safeInvoke('executar ação de notificação',
                    () => action.activate()));
                actions.add_child(button);
            }
            card.add_child(actions);
        }
        return card;
    }

    _clearAll() {
        const notifications = this._notifications().map(item => item.notification)
            .filter(notification => notificationCapabilities(notification).canDismiss);
        for (const notification of notifications) {
            try { notification.destroy(); } catch (error) {
                console.debug(`[WinShell] Notificação não pôde ser dispensada: ${error.message}`);
            }
        }
    }

    _render() {
        const calendarActor = this._calendar.actor;
        calendarActor.get_parent()?.remove_child(calendarActor);
        this.actor.destroy_all_children();
        if (this._state.dark) this.actor.add_style_class_name('winshell-dark');
        else this.actor.remove_style_class_name('winshell-dark');

        const heading = new St.BoxLayout({style_class: 'winshell-notification-heading'});
        heading.add_child(new St.Label({text: 'Notificações', style_class: 'winshell-flyout-title',
            x_expand: true}));
        const dnd = new St.Button({label: this._state.dnd ? 'Não perturbe: ligado' : 'Não perturbe: desligado',
            style_class: `winshell-footer-button ${this._state.dnd ? 'winshell-tile-on' : ''}`,
            can_focus: true});
        dnd.connect('clicked', () => this._controls.toggleDoNotDisturb());
        heading.add_child(dnd);
        this.actor.add_child(heading);

        this.actor.add_child(calendarActor);

        const notificationHeader = new St.BoxLayout({style_class: 'winshell-notification-list-heading'});
        notificationHeader.add_child(new St.Label({text: 'Atividade recente',
            style_class: 'winshell-section-title', x_expand: true}));
        const allItems = this._notifications();
        const canClear = allItems.some(item =>
            notificationCapabilities(item.notification).canDismiss);
        const clear = new St.Button({label: 'Limpar tudo', style_class: 'winshell-footer-button',
            can_focus: canClear, reactive: canClear});
        clear.connect('clicked', () => this._clearAll());
        notificationHeader.add_child(clear);
        this.actor.add_child(notificationHeader);

        const scroll = new St.ScrollView({style_class: 'winshell-notifications-scroll',
            y_expand: true, x_expand: true, overlay_scrollbars: true});
        const list = new St.BoxLayout({vertical: true, style_class: 'winshell-notifications-list'});
        scroll.set_child(list);
        this.actor.add_child(scroll);
        const groups = groupNotifications(allItems);
        for (const group of groups) {
            const first = group.items[0];
            const groupHeader = new St.BoxLayout({style_class: 'winshell-notification-group-heading'});
            groupHeader.add_child(this._appIcon(first));
            groupHeader.add_child(new St.Label({text: group.appName, x_expand: true,
                y_align: Clutter.ActorAlign.CENTER}));
            if (group.items.length > 1)
                groupHeader.add_child(new St.Label({text: String(group.items.length),
                    style_class: 'winshell-notification-count'}));
            list.add_child(groupHeader);
            for (const item of group.items) list.add_child(this._notificationCard(item));
        }
        if (!groups.length) {
            const empty = new St.BoxLayout({vertical: true, style_class: 'winshell-notification-empty'});
            empty.add_child(new St.Icon({icon_name: 'no-notifications-symbolic', icon_size: 36}));
            empty.add_child(new St.Label({text: this._sourceApiAvailable ? 'Nenhuma notificação' :
                'Notificações indisponíveis nesta versão do GNOME'}));
            list.add_child(empty);
        }
    }

    show(x, y) {
        this._state = this._controls.getState();
        this._calendar.goToday();
        this._syncSources();
        this._render();
        super.show(x, y);
    }

    destroy() {
        this._unsubscribe?.();
        if (this._renderId) { GLib.Source.remove(this._renderId); this._renderId = 0; }
        for (const id of this._traySignals) safeDisconnect(this._tray, id);
        for (const [source, ids] of this._sourceSignals)
            for (const id of ids) safeDisconnect(source, id);
        for (const [notification, ids] of this._notificationSignals)
            for (const id of ids) safeDisconnect(notification, id);
        this._sourceSignals.clear();
        this._notificationSignals.clear();
        this._calendar.destroy();
        this._controls = null;
        this._tray = null;
        super.destroy();
    }
}

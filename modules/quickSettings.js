import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {PopupSurface} from './popup.js';
import {darkMode, doNotDisturb, toggleDarkMode, toggleDoNotDisturb, observeSystem, openDesktop, openNativeMenu} from './systemActions.js';

export class QuickSettingsPanel extends PopupSurface {
    constructor(panelController) {
        super('winshell-flyout winshell-quick-panel', 352, 318);
        this._panelController = panelController;
        this.actor.add_child(new St.Label({text: 'Configurações rápidas', style_class: 'winshell-flyout-title'}));
        this._tiles = new St.BoxLayout({vertical: true, style_class: 'winshell-quick-tiles'});
        this.actor.add_child(this._tiles);
        this._footer = new St.BoxLayout({style_class: 'winshell-quick-footer'});
        this.actor.add_child(this._footer);
        this._unobserve = observeSystem(() => this._render());
        this._render();
    }

    _button(label, icon, callback, enabled = false) {
        const button = new St.Button({style_class: `winshell-quick-tile ${enabled ? 'winshell-tile-on' : ''}`,
            can_focus: true, x_expand: true});
        const row = new St.BoxLayout({style_class: 'winshell-quick-item'});
        row.add_child(new St.Icon({icon_name: icon, icon_size: 20}));
        row.add_child(new St.Label({text: label, y_align: Clutter.ActorAlign.CENTER}));
        button.set_child(row);
        button.connect('clicked', callback);
        return button;
    }

    _render() {
        this._tiles.destroy_all_children();
        const first = new St.BoxLayout({style_class: 'winshell-quick-row'});
        first.add_child(this._button('Tema escuro', 'weather-clear-night-symbolic', toggleDarkMode, darkMode()));
        first.add_child(this._button('Não perturbe', 'notifications-disabled-symbolic', toggleDoNotDisturb, doNotDisturb()));
        this._tiles.add_child(first);
        const second = new St.BoxLayout({style_class: 'winshell-quick-row'});
        second.add_child(this._button('Wi-Fi / Rede', 'network-wireless-symbolic', () => this._openSettings('gnome-wifi-panel.desktop')));
        second.add_child(this._button('Bluetooth', 'bluetooth-symbolic', () => this._openSettings('gnome-bluetooth-panel.desktop')));
        this._tiles.add_child(second);
        const third = new St.BoxLayout({style_class: 'winshell-quick-row'});
        third.add_child(this._button('Som', 'audio-volume-high-symbolic', () => this._openNative()));
        third.add_child(this._button('Sistema', 'preferences-system-symbolic', () => this._openSettings('org.gnome.Settings.desktop')));
        this._tiles.add_child(third);
        this._footer.destroy_all_children();
        const action = this._button('Controles completos do GNOME', 'view-more-symbolic', () => this._openNative());
        this._footer.add_child(action);
    }

    _openSettings(desktopId) { this.hide(); openDesktop(desktopId); }
    _openNative() { this.hide(); openNativeMenu('quick', this._panelController); }
    destroy() { this._unobserve?.(); super.destroy(); }
}

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {Slider} from 'resource:///org/gnome/shell/ui/slider.js';
import {PopupSurface} from './popup.js';
import {openDesktop} from './systemActions.js';

export class QuickSettingsPanel extends PopupSurface {
    constructor(systemControls) {
        super('winshell-flyout winshell-quick-panel', 430, 650);
        this._controls = systemControls;
        this._state = systemControls.getState();
        this._unsubscribe = systemControls.subscribe(state => {
            this._state = state;
            if (this.actor.visible) this._render();
        });
    }

    _button(label, icon, callback, enabled = false, sensitive = true) {
        const button = new St.Button({
            style_class: `winshell-quick-tile ${enabled ? 'winshell-tile-on' : ''}`,
            can_focus: true, x_expand: true, reactive: sensitive,
        });
        const row = new St.BoxLayout({style_class: 'winshell-quick-item'});
        row.add_child(new St.Icon({icon_name: icon, icon_size: 19}));
        row.add_child(new St.Label({text: label, y_align: Clutter.ActorAlign.CENTER, x_expand: true}));
        button.set_child(row);
        button.connect('clicked', callback);
        return button;
    }

    _section(title, subtitle = '') {
        const box = new St.BoxLayout({vertical: true, style_class: 'winshell-quick-section'});
        const heading = new St.BoxLayout();
        heading.add_child(new St.Label({text: title, style_class: 'winshell-section-title', x_expand: true}));
        if (subtitle)
            heading.add_child(new St.Label({text: subtitle, style_class: 'winshell-quick-status',
                y_align: Clutter.ActorAlign.CENTER}));
        box.add_child(heading);
        return box;
    }

    _actionRow(icon, label, status, callback, sensitive = true) {
        const button = new St.Button({style_class: 'winshell-quick-list-item', can_focus: true,
            x_expand: true, reactive: sensitive});
        const row = new St.BoxLayout({style_class: 'winshell-quick-item'});
        row.add_child(new St.Icon({icon_name: icon, icon_size: 17}));
        row.add_child(new St.Label({text: label, x_expand: true, y_align: Clutter.ActorAlign.CENTER}));
        if (status) row.add_child(new St.Label({text: status, style_class: 'winshell-quick-status',
            y_align: Clutter.ActorAlign.CENTER}));
        button.set_child(row);
        button.connect('clicked', callback);
        return button;
    }

    _sliderRow(icon, label, value, callback, sensitive = true) {
        const row = new St.BoxLayout({style_class: 'winshell-slider-row'});
        const action = new St.Button({style_class: 'winshell-mini-action', can_focus: true,
            reactive: sensitive});
        action.set_child(new St.Icon({icon_name: icon, icon_size: 18}));
        action.set_accessible_name(label);
        row.add_child(action);
        const slider = new Slider(value);
        slider.reactive = sensitive;
        slider.accessible_name = label;
        slider.connect('drag-end', () => callback(slider.value));
        slider.connect('key-release-event', (_actor, event) => {
            if (![Clutter.KEY_Left, Clutter.KEY_Right].includes(event.get_key_symbol()))
                return Clutter.EVENT_PROPAGATE;
            callback(slider.value);
            return Clutter.EVENT_PROPAGATE;
        });
        row.add_child(slider);
        row.add_child(new St.Label({text: `${Math.round(value * 100)}%`,
            style_class: 'winshell-slider-value', y_align: Clutter.ActorAlign.CENTER}));
        return {row, iconButton: action};
    }

    _render() {
        this.actor.destroy_all_children();
        if (this._state.dark) this.actor.add_style_class_name('winshell-dark');
        else this.actor.remove_style_class_name('winshell-dark');
        this.actor.add_child(new St.Label({text: 'Configurações rápidas',
            style_class: 'winshell-flyout-title'}));

        const tiles = new St.BoxLayout({vertical: true, style_class: 'winshell-quick-tiles'});
        const first = new St.BoxLayout({style_class: 'winshell-quick-row'});
        const wifi = this._state.wifi;
        first.add_child(this._button(wifi.connected ? wifi.name : 'Wi‑Fi',
            wifi.enabled ? 'network-wireless-symbolic' : 'network-wireless-disabled-symbolic',
            () => this._controls.setWifiEnabled(!wifi.enabled), wifi.enabled,
            wifi.available && wifi.hardwareEnabled));
        const bluetooth = this._state.bluetooth;
        first.add_child(this._button('Bluetooth', bluetooth.enabled ? 'bluetooth-active-symbolic' : 'bluetooth-symbolic',
            () => this._controls.setBluetoothEnabled(!bluetooth.enabled), bluetooth.enabled,
            bluetooth.available || bluetooth.enabled));
        tiles.add_child(first);
        const second = new St.BoxLayout({style_class: 'winshell-quick-row'});
        second.add_child(this._button('Não perturbe', 'notifications-disabled-symbolic',
            () => this._controls.toggleDoNotDisturb(), this._state.dnd));
        second.add_child(this._button('Tema escuro', 'weather-clear-night-symbolic',
            () => this._controls.toggleDarkMode(), this._state.dark));
        tiles.add_child(second);
        this.actor.add_child(tiles);

        const scroll = new St.ScrollView({style_class: 'winshell-quick-scroll', y_expand: true,
            x_expand: true, overlay_scrollbars: true});
        const content = new St.BoxLayout({vertical: true, style_class: 'winshell-quick-details'});
        scroll.set_child(content);
        this.actor.add_child(scroll);

        const audio = this._state.audio;
        const audioSection = this._section('Áudio', audio.available ? (audio.muted ? 'Mudo' : `${Math.round(audio.volume * 100)}%`) : 'Indisponível');
        const volume = this._sliderRow(audio.muted ? 'audio-volume-muted-symbolic' : 'audio-volume-high-symbolic',
            audio.muted ? 'Ativar som' : 'Silenciar', audio.volume,
            value => this._controls.setVolume(value), audio.available);
        volume.iconButton.connect('clicked', () => this._controls.toggleMute());
        audioSection.add_child(volume.row);
        for (const output of audio.outputs)
            audioSection.add_child(this._actionRow(output.active ? 'object-select-symbolic' : 'audio-speakers-symbolic',
                output.name, output.active ? 'Em uso' : '', () => this._controls.selectOutput(output.id)));
        content.add_child(audioSection);

        const brightness = this._state.brightness;
        const brightnessSection = this._section('Brilho', brightness.available ? `${Math.round(brightness.value * 100)}%` : 'Não suportado');
        const brightnessSlider = this._sliderRow('display-brightness-symbolic', 'Brilho da tela', brightness.value,
            value => this._controls.setBrightness(value), brightness.available);
        brightnessSlider.iconButton.reactive = false;
        brightnessSection.add_child(brightnessSlider.row);
        content.add_child(brightnessSection);

        const wifiSection = this._section('Redes Wi‑Fi', wifi.error ? 'Operação indisponível' : wifi.available ?
            (wifi.enabled ? (wifi.connected ? `Conectado a ${wifi.name}` : 'Disponíveis') : 'Desativado') : 'Sem adaptador');
        if (wifi.enabled) {
            for (const network of wifi.networks)
                wifiSection.add_child(this._actionRow(network.active ? 'object-select-symbolic' : 'network-wireless-symbolic',
                    network.name, network.active ? 'Conectada' : network.known ? `${network.strength}%` : 'Senha necessária',
                    () => this._controls.connectKnownWifi(network.id), network.known && !network.active));
            if (!wifi.networks.length)
                wifiSection.add_child(new St.Label({text: 'Nenhuma rede encontrada.', style_class: 'winshell-empty'}));
        }
        wifiSection.add_child(this._actionRow('emblem-system-symbolic', 'Todas as redes', '',
            () => { this.hide(); openDesktop('gnome-wifi-panel.desktop'); }));
        content.add_child(wifiSection);

        const btSection = this._section('Dispositivos Bluetooth', bluetooth.error ? 'Operação indisponível' : bluetooth.available ?
            (bluetooth.enabled ? 'Pareados' : 'Desativado') : bluetooth.hardwareBlocked ? 'Bloqueado por hardware' : 'Sem adaptador');
        if (bluetooth.enabled) {
            for (const device of bluetooth.devices)
                btSection.add_child(this._actionRow(device.icon, device.name,
                    device.connected ? 'Desconectar' : 'Conectar',
                    () => this._controls.toggleBluetoothDevice(device.id), device.connectable));
            if (!bluetooth.devices.length)
                btSection.add_child(new St.Label({text: 'Nenhum dispositivo pareado.', style_class: 'winshell-empty'}));
        }
        btSection.add_child(this._actionRow('emblem-system-symbolic', 'Configurações Bluetooth', '',
            () => { this.hide(); openDesktop('gnome-bluetooth-panel.desktop'); }));
        content.add_child(btSection);

        const battery = this._state.battery;
        const footer = new St.BoxLayout({style_class: 'winshell-quick-footer'});
        footer.add_child(new St.Icon({icon_name: battery.charging ? 'battery-good-charging-symbolic' :
            'battery-good-symbolic', icon_size: 18}));
        footer.add_child(new St.Label({text: battery.available ?
            `${battery.percentage}%${battery.charging ? ' · carregando' : battery.fullyCharged ? ' · carregada' : ''}` :
            'Bateria não detectada', x_expand: true, y_align: Clutter.ActorAlign.CENTER}));
        footer.add_child(this._actionRow('emblem-system-symbolic', 'Configurações', '',
            () => { this.hide(); openDesktop('org.gnome.Settings.desktop'); }));
        this.actor.add_child(footer);
    }

    show(x, y) {
        this._state = this._controls.getState();
        this._render();
        this._controls.scanWifi().catch(error => console.debug(error.message));
        super.show(x, y);
    }

    destroy() {
        this._unsubscribe?.();
        this._controls = null;
        super.destroy();
    }
}

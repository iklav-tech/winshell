import 'gi://GnomeBluetooth?version=3.0';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GnomeBluetooth from 'gi://GnomeBluetooth';
import NM from 'gi://NM';
import {clampUnit, normalizeQuickState} from './quickSettingsModel.mjs';
import {mixerControl} from './shellCompat.js';

const BRIGHTNESS_XML = `<node><interface name="org.gnome.SettingsDaemon.Power.Screen">
  <property name="Brightness" type="i" access="readwrite"/>
</interface></node>`;
const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(BRIGHTNESS_XML);

const UPOWER_XML = `<node><interface name="org.freedesktop.UPower.Device">
  <property name="IsPresent" type="b" access="read"/>
  <property name="Percentage" type="d" access="read"/>
  <property name="State" type="u" access="read"/>
</interface></node>`;
const UPowerProxy = Gio.DBusProxy.makeProxyWrapper(UPOWER_XML);

const RFKILL_XML = `<node><interface name="org.gnome.SettingsDaemon.Rfkill">
  <property name="BluetoothAirplaneMode" type="b" access="readwrite"/>
  <property name="BluetoothHardwareAirplaneMode" type="b" access="read"/>
  <property name="BluetoothHasAirplaneMode" type="b" access="read"/>
</interface></node>`;
const RfkillProxy = Gio.DBusProxy.makeProxyWrapper(RFKILL_XML);

Gio._promisify(NM.Client, 'new_async');
Gio._promisify(NM.DeviceWifi.prototype, 'request_scan_async');
Gio._promisify(GnomeBluetooth.Client.prototype, 'connect_service');

function safeDisconnect(object, id) {
    if (!object || !id) return;
    try { object.disconnect(id); } catch (_error) { /* Object may already be disposed. */ }
}

function wifiDevices(client) {
    return client?.get_devices().filter(device => device.get_device_type() === NM.DeviceType.WIFI) ?? [];
}

function ssidLabel(ap) {
    const ssid = ap?.get_ssid();
    return ssid ? NM.utils_ssid_to_utf8(ssid.get_data()) || 'Rede sem nome' : '';
}

export class SystemControls {
    constructor() {
        this._callbacks = new Set();
        this._signals = [];
        this._networkSignals = [];
        this._bluetoothSignals = [];
        this._audioStreamSignals = [];
        this._wifiActions = new Map();
        this._bluetoothActions = new Map();
        this._audioActions = new Map();
        this._destroyed = false;
        this._changedId = 0;

        this._appearance = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
        this._connect(this._appearance, 'changed::color-scheme', () => this._queueChanged());
        this._connect(this._notifications, 'changed::show-banners', () => this._queueChanged());

        this._initBrightness();
        this._initBattery();
        this._initBluetooth();
        this._initAudio();
        this._initNetwork();
    }

    _connect(object, signal, callback, bucket = this._signals) {
        try {
            const id = object.connect(signal, callback);
            bucket.push([object, id]);
            return id;
        } catch (error) {
            console.debug(`[WinShell] Signal indisponível (${signal}): ${error.message}`);
            return 0;
        }
    }

    _queueChanged() {
        if (this._destroyed || this._changedId) return;
        this._changedId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._changedId = 0;
            const state = this.getState();
            for (const callback of this._callbacks) {
                try { callback(state); } catch (error) { console.error(error); }
            }
            return GLib.SOURCE_REMOVE;
        });
    }

    subscribe(callback) {
        this._callbacks.add(callback);
        callback(this.getState());
        return () => this._callbacks.delete(callback);
    }

    _initBrightness() {
        this._brightness = new BrightnessProxy(Gio.DBus.session,
            'org.gnome.SettingsDaemon.Power', '/org/gnome/SettingsDaemon/Power',
            (proxy, error) => {
                if (this._destroyed) return;
                this._brightnessReady = !error;
                if (!error)
                    this._connect(proxy, 'g-properties-changed', () => this._queueChanged());
                this._queueChanged();
            });
    }

    _initBattery() {
        this._battery = new UPowerProxy(Gio.DBus.system, 'org.freedesktop.UPower',
            '/org/freedesktop/UPower/devices/DisplayDevice', (proxy, error) => {
                if (this._destroyed) return;
                this._batteryReady = !error;
                if (!error)
                    this._connect(proxy, 'g-properties-changed', () => this._queueChanged());
                this._queueChanged();
            });
    }

    _initBluetooth() {
        try {
            this._bluetooth = new GnomeBluetooth.Client();
            this._rfkill = new RfkillProxy(Gio.DBus.session,
                'org.gnome.SettingsDaemon.Rfkill', '/org/gnome/SettingsDaemon/Rfkill',
                (proxy, error) => {
                    if (this._destroyed) return;
                    this._rfkillReady = !error;
                    if (!error)
                        this._connect(proxy, 'g-properties-changed', () => this._queueChanged());
                    this._queueChanged();
                });
            for (const signal of ['notify::default-adapter', 'notify::default-adapter-powered',
                'notify::default-adapter-state', 'device-added', 'device-removed']) {
                this._connect(this._bluetooth, signal, () => {
                    this._rewireBluetoothDevices();
                    this._queueChanged();
                });
            }
            this._rewireBluetoothDevices();
        } catch (error) {
            console.warn(`[WinShell] Bluetooth indisponível: ${error.message}`);
            this._bluetooth = null;
        }
    }

    _rewireBluetoothDevices() {
        for (const [object, id] of this._bluetoothSignals) safeDisconnect(object, id);
        this._bluetoothSignals = [];
        const store = this._bluetooth?.get_devices();
        for (let index = 0; store && index < store.get_n_items(); index++) {
            const device = store.get_item(index);
            for (const signal of ['notify::alias', 'notify::paired', 'notify::trusted',
                'notify::connected', 'notify::connectable'])
                this._connect(device, signal, () => this._queueChanged(), this._bluetoothSignals);
        }
    }

    _initAudio() {
        try {
            this._mixer = mixerControl();
            for (const signal of ['state-changed', 'default-sink-changed', 'stream-added',
                'stream-changed', 'stream-removed', 'output-added', 'output-removed',
                'active-output-update'])
                this._connect(this._mixer, signal, () => {
                    this._rewireAudioStream();
                    this._queueChanged();
                });
            this._rewireAudioStream();
        } catch (error) {
            console.warn(`[WinShell] Áudio indisponível: ${error.message}`);
            this._mixer = null;
        }
    }

    _rewireAudioStream() {
        for (const [object, id] of this._audioStreamSignals) safeDisconnect(object, id);
        this._audioStreamSignals = [];
        const sink = this._mixer?.get_default_sink();
        if (!sink) return;
        for (const signal of ['notify::volume', 'notify::is-muted', 'notify::description'])
            this._connect(sink, signal, () => this._queueChanged(), this._audioStreamSignals);
    }

    async _initNetwork() {
        try {
            const client = await NM.Client.new_async(null);
            if (this._destroyed) return;
            this._network = client;
            for (const signal of ['notify::wireless-enabled', 'notify::wireless-hardware-enabled',
                'notify::active-connections', 'notify::connectivity', 'device-added',
                'device-removed', 'connection-added', 'connection-removed']) {
                this._connect(client, signal, () => {
                    this._rewireNetworkDevices();
                    this._queueChanged();
                });
            }
            this._rewireNetworkDevices();
            this._queueChanged();
        } catch (error) {
            console.warn(`[WinShell] NetworkManager indisponível: ${error.message}`);
            this._networkError = error.message;
            this._queueChanged();
        }
    }

    _rewireNetworkDevices() {
        for (const [object, id] of this._networkSignals) safeDisconnect(object, id);
        this._networkSignals = [];
        for (const device of wifiDevices(this._network)) {
            for (const signal of ['notify::active-access-point', 'notify::active-connection',
                'notify::available-connections', 'state-changed'])
                this._connect(device, signal, () => this._queueChanged(), this._networkSignals);
            for (const signal of ['access-point-added', 'access-point-removed'])
                this._connect(device, signal, () => {
                    this._rewireNetworkDevices();
                    this._queueChanged();
                }, this._networkSignals);
            for (const ap of device.get_access_points()) {
                for (const signal of ['notify::strength', 'notify::ssid'])
                    this._connect(ap, signal, () => this._queueChanged(), this._networkSignals);
            }
        }
    }

    _wifiState() {
        this._wifiActions.clear();
        const devices = wifiDevices(this._network);
        const networks = new Map();
        let activeName = '';
        for (const [deviceIndex, device] of devices.entries()) {
            const connections = device.get_available_connections();
            for (const [apIndex, ap] of device.get_access_points().entries()) {
                const name = ssidLabel(ap);
                if (!name) continue;
                const connection = connections.find(candidate => ap.connection_valid(candidate)) ?? null;
                const active = device.active_access_point === ap;
                if (active) activeName = name;
                const actionId = `${deviceIndex}:${apIndex}:${name}`;
                this._wifiActions.set(actionId, {device, ap, connection});
                const candidate = {id: actionId, name, strength: ap.strength ?? 0,
                    known: connection !== null, active};
                const previous = networks.get(name);
                if (!previous || candidate.active || (!previous.active && candidate.strength > previous.strength))
                    networks.set(name, candidate);
            }
            if (!activeName && device.active_connection)
                activeName = device.active_connection.connection?.get_id?.() || 'Rede oculta';
        }
        return {
            available: devices.length > 0,
            enabled: Boolean(this._network?.wireless_enabled),
            hardwareEnabled: Boolean(this._network?.wireless_hardware_enabled),
            connected: Boolean(activeName),
            name: activeName,
            error: this._networkError ?? '',
            networks: [...networks.values()].sort((a, b) =>
                Number(b.active) - Number(a.active) || Number(b.known) - Number(a.known) ||
                b.strength - a.strength || a.name.localeCompare(b.name)).slice(0, 12),
        };
    }

    _bluetoothState() {
        this._bluetoothActions.clear();
        const devices = [];
        const store = this._bluetooth?.get_devices();
        for (let index = 0; store && index < store.get_n_items(); index++) {
            const device = store.get_item(index);
            if (!device.paired && !device.trusted) continue;
            const id = device.get_object_path();
            this._bluetoothActions.set(id, device);
            devices.push({id, name: device.alias || device.name || 'Dispositivo Bluetooth',
                connected: Boolean(device.connected), connectable: device.connectable !== false,
                icon: device.icon || 'bluetooth-symbolic'});
        }
        const hardwareBlocked = Boolean(this._rfkill?.BluetoothHardwareAirplaneMode);
        return {
            available: Boolean(this._bluetooth?.default_adapter) && !hardwareBlocked,
            enabled: Boolean(this._bluetooth?.default_adapter_powered),
            hardwareBlocked,
            error: this._bluetoothError ?? '',
            devices: devices.sort((a, b) => Number(b.connected) - Number(a.connected) ||
                a.name.localeCompare(b.name)),
        };
    }

    _audioState() {
        this._audioActions.clear();
        const sink = this._mixer?.get_default_sink();
        const normal = this._mixer?.get_vol_max_norm() || 1;
        const outputs = [];
        const seen = new Set();
        for (const candidate of this._mixer?.get_sinks() ?? []) {
            const device = this._mixer.lookup_device_from_stream(candidate);
            const id = device ? `device:${device.get_id()}` : `sink:${candidate.get_id()}`;
            if (seen.has(id)) continue;
            seen.add(id);
            this._audioActions.set(id, {device, sink: candidate});
            const origin = device?.get_origin?.();
            const description = device?.get_description?.() || candidate.get_description() ||
                candidate.get_name() || 'Saída de áudio';
            outputs.push({id, name: origin ? `${description} – ${origin}` : description,
                active: candidate === sink});
        }
        return {available: Boolean(sink), muted: Boolean(sink?.is_muted),
            volume: sink ? clampUnit(sink.volume / normal) : 0, outputs};
    }

    getState() {
        const brightness = this._brightness?.Brightness;
        const batteryState = this._battery?.State ?? 0;
        return normalizeQuickState({
            wifi: this._wifiState(),
            bluetooth: this._bluetoothState(),
            audio: this._audioState(),
            brightness: {available: this._brightnessReady && Number.isInteger(brightness) && brightness >= 0,
                value: Number.isInteger(brightness) ? brightness / 100 : 0},
            battery: {available: this._batteryReady && Boolean(this._battery?.IsPresent),
                percentage: Math.round(this._battery?.Percentage ?? 0),
                charging: batteryState === 1 || batteryState === 5,
                fullyCharged: batteryState === 4},
            dnd: !this._notifications.get_boolean('show-banners'),
            dark: this._appearance.get_string('color-scheme') === 'prefer-dark',
        });
    }

    setWifiEnabled(enabled) {
        if (!this._network || !this._network.wireless_hardware_enabled) return false;
        try {
            this._network.wireless_enabled = Boolean(enabled);
            return true;
        } catch (error) {
            this._networkError = error.message;
            this._queueChanged();
            return false;
        }
    }

    async scanWifi() {
        if (!this._network?.wireless_enabled) return;
        const results = await Promise.allSettled(wifiDevices(this._network)
            .map(device => device.request_scan_async(null)));
        const failed = results.find(result => result.status === 'rejected');
        this._networkError = failed ? String(failed.reason) : '';
        if (failed) console.debug(`[WinShell] Varredura Wi-Fi incompleta: ${failed.reason}`);
        this._queueChanged();
    }

    connectKnownWifi(id) {
        const action = this._wifiActions.get(id);
        if (!action?.connection || !this._network) return false;
        this._network.activate_connection_async(action.connection, action.device,
            action.ap.get_path(), null, (client, result) => {
                try {
                    client.activate_connection_finish(result);
                    this._networkError = '';
                } catch (error) {
                    this._networkError = error.message;
                    console.warn(`[WinShell] Falha ao conectar Wi-Fi: ${error.message}`);
                }
                this._queueChanged();
            });
        return true;
    }

    setBluetoothEnabled(enabled) {
        if (!this._bluetooth || !this._rfkillReady || this._rfkill?.BluetoothHardwareAirplaneMode)
            return false;
        try {
            this._rfkill.BluetoothAirplaneMode = !enabled;
            if (enabled && !this._bluetooth.default_adapter_powered)
                this._bluetooth.default_adapter_powered = true;
            return true;
        } catch (error) {
            this._bluetoothError = error.message;
            this._queueChanged();
            return false;
        }
    }

    async toggleBluetoothDevice(id) {
        const device = this._bluetoothActions.get(id);
        if (!device || device.connectable === false) return false;
        try {
            await this._bluetooth.connect_service(device.get_object_path(), !device.connected, null);
            this._bluetoothError = '';
            this._queueChanged();
            return true;
        } catch (error) {
            this._bluetoothError = error.message;
            console.warn(`[WinShell] Falha no dispositivo Bluetooth: ${error.message}`);
            this._queueChanged();
            return false;
        }
    }

    setVolume(value) {
        const sink = this._mixer?.get_default_sink();
        if (!sink) return false;
        try {
            sink.volume = Math.round(clampUnit(value) * this._mixer.get_vol_max_norm());
            sink.push_volume();
            if (sink.is_muted && sink.volume > 0) sink.change_is_muted(false);
            return true;
        } catch (error) {
            console.warn(`[WinShell] Falha ao alterar volume: ${error.message}`);
            return false;
        }
    }

    toggleMute() {
        const sink = this._mixer?.get_default_sink();
        if (!sink) return false;
        try {
            if (sink.is_muted && sink.volume === 0) {
                sink.volume = Math.round(0.25 * this._mixer.get_vol_max_norm());
                sink.push_volume();
            }
            sink.change_is_muted(!sink.is_muted);
            return true;
        } catch (error) {
            console.warn(`[WinShell] Falha ao alternar mudo: ${error.message}`);
            return false;
        }
    }

    selectOutput(id) {
        const output = this._audioActions.get(id);
        if (!output || !this._mixer) return false;
        try {
            return output.device ? (this._mixer.change_output(output.device), true) :
                this._mixer.set_default_sink(output.sink);
        } catch (error) {
            console.warn(`[WinShell] Falha ao selecionar saída: ${error.message}`);
            return false;
        }
    }

    setBrightness(value) {
        if (!this._brightnessReady || !Number.isInteger(this._brightness?.Brightness) ||
            this._brightness.Brightness < 0) return false;
        try {
            this._brightness.Brightness = Math.round(clampUnit(value) * 100);
            return true;
        } catch (error) {
            console.warn(`[WinShell] Falha ao alterar brilho: ${error.message}`);
            return false;
        }
    }

    toggleDoNotDisturb() {
        this._notifications.set_boolean('show-banners',
            !this._notifications.get_boolean('show-banners'));
    }

    toggleDarkMode() {
        this._appearance.set_string('color-scheme',
            this._appearance.get_string('color-scheme') === 'prefer-dark' ? 'default' : 'prefer-dark');
    }

    destroy() {
        this._destroyed = true;
        if (this._changedId) GLib.Source.remove(this._changedId);
        for (const bucket of [this._audioStreamSignals, this._bluetoothSignals,
            this._networkSignals, this._signals])
            for (const [object, id] of bucket) safeDisconnect(object, id);
        this._callbacks.clear();
        this._wifiActions.clear();
        this._bluetoothActions.clear();
        this._audioActions.clear();
        this._network = null;
        this._bluetooth = null;
        this._mixer = null;
        this._brightness = null;
        this._battery = null;
        this._rfkill = null;
    }
}

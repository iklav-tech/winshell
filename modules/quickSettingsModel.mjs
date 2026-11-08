export function clampUnit(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(1, number));
}

export function normalizeQuickState(state = {}) {
    return {
        wifi: {available: false, enabled: false, connected: false, name: '', networks: [], ...state.wifi},
        bluetooth: {available: false, enabled: false, devices: [], ...state.bluetooth},
        audio: {available: false, muted: false, volume: 0, outputs: [], ...state.audio,
            volume: clampUnit(state.audio?.volume)},
        brightness: {available: false, value: 0, ...state.brightness,
            value: clampUnit(state.brightness?.value)},
        battery: {available: false, percentage: 0, charging: false, ...state.battery},
        dnd: Boolean(state.dnd),
        dark: Boolean(state.dark),
    };
}

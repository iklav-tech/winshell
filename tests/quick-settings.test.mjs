import assert from 'node:assert/strict';
import {clampUnit, normalizeQuickState} from '../modules/quickSettingsModel.mjs';

assert.equal(clampUnit(-1), 0);
assert.equal(clampUnit(2), 1);
assert.equal(clampUnit(Number.NaN), 0);
assert.equal(clampUnit(0.42), 0.42);

const first = normalizeQuickState({audio: {available: true, volume: 1.4},
    brightness: {available: true, value: -0.2}, dnd: true});
assert.equal(first.audio.volume, 1);
assert.equal(first.brightness.value, 0);
assert.equal(first.dnd, true);
assert.deepEqual(first.wifi.networks, []);

// Normalizing a later external snapshot must replace state instead of retaining old values.
const external = normalizeQuickState({audio: {available: true, muted: true, volume: 0.25},
    wifi: {available: true, enabled: true, connected: true, name: 'Office'}});
assert.equal(external.audio.muted, true);
assert.equal(external.audio.volume, 0.25);
assert.equal(external.wifi.name, 'Office');
assert.equal(external.dnd, false);
console.log('OK: quick settings normalization, bounds and external synchronization snapshots');

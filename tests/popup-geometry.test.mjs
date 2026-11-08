import assert from 'node:assert/strict';
import {monitorAtPoint, popupGeometry} from '../modules/popupGeometry.mjs';

const left = {x: -1920, y: -120, width: 1920, height: 1080};
const primary = {x: 0, y: 0, width: 2560, height: 1440};
assert.equal(monitorAtPoint([left, primary], -1, 0), left);
assert.equal(monitorAtPoint([left, primary], 0, 0), primary);
assert.equal(monitorAtPoint([left, primary], 9000, 9000, primary), primary);

assert.deepEqual(popupGeometry(left, -960.5, 906.5, 430, 760),
    {x: -1175, y: 137, width: 430, height: 760});
assert.deepEqual(popupGeometry(primary, 10, 1400, 3000, 2000),
    {x: 12, y: 12, width: 2536, height: 1416});
assert.equal(popupGeometry({x: 0, y: 0, width: 20, height: 20}, 10, 10, 100, 100), null);
assert.equal(popupGeometry(primary, Number.NaN, 100, 100, 100), null);

console.log('OK: popup monitor selection, bounds, negative origins and fractional anchors');

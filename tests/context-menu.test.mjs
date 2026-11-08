import assert from 'node:assert/strict';
import {visibleWindows, windowCapabilities} from '../modules/windowActions.mjs';

assert.deepEqual(visibleWindows([
    {id: 1, skipTaskbar: false}, {id: 2, skipTaskbar: true}, {id: 3, skipTaskbar: false},
]).map(window => window.id), [1, 3]);

const normal = windowCapabilities({canMinimize: true, canMaximize: true, canClose: true});
assert.equal(normal.minimizeLabel, 'Minimizar');
assert.equal(normal.maximizeLabel, 'Maximizar');
assert.equal(normal.canClose, true);
const minimized = windowCapabilities({canMinimize: true, minimized: true});
assert.equal(minimized.minimizeLabel, 'Restaurar');
const maximized = windowCapabilities({canMaximize: true,
    maximizedHorizontally: true, maximizedVertically: true});
assert.equal(maximized.maximizeLabel, 'Restaurar tamanho');
assert.equal(maximized.maximized, true);
console.log('OK: context menu window visibility, capabilities and state labels');

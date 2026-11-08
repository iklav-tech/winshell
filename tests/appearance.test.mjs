import assert from 'node:assert/strict';
import {APPEARANCE_MODES, detectDesktopProvider, effectiveAppearanceMode,
    effectiveWallpaper, nautilusIntegrationAvailable} from '../modules/appearance/appearanceModel.mjs';

assert.deepEqual(APPEARANCE_MODES, ['follow-system', 'light', 'dark']);
assert.equal(effectiveAppearanceMode('follow-system', 'prefer-dark'), 'dark');
assert.equal(effectiveAppearanceMode('follow-system', 'default'), 'light');
assert.equal(effectiveAppearanceMode('light', 'prefer-dark'), 'light');
const paths = {light: 'file:///light.svg', dark: 'file:///dark.svg'};
assert.equal(effectiveWallpaper('synchronized', 'dark', paths), paths.dark);
assert.equal(effectiveWallpaper('synchronized', 'light', paths), paths.light);
assert.equal(effectiveWallpaper('custom', 'dark', paths, 'file:///custom.jpg'), 'file:///custom.jpg');
assert.equal(effectiveWallpaper('custom', 'dark', paths, ''), paths.light);
assert.equal(detectDesktopProvider(['org.gnome.shell.extensions.ding'], ['ding@rastersoft.com']).id, 'ding');
assert.equal(detectDesktopProvider([], ['ding@rastersoft.com']), null);
assert.equal(detectDesktopProvider(['org.gnome.shell.extensions.ding'], []), null);
assert.equal(nautilusIntegrationAvailable({pythonNautilus: true, pluginInstalled: true}), true);
assert.equal(nautilusIntegrationAvailable({pythonNautilus: false, pluginInstalled: true}), false);
console.log('OK: appearance modes, wallpaper selection and optional integration detection');

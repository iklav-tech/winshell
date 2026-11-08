import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');

const quick = read('modules/quickSettings.js');
const controls = read('modules/systemControls.js');
for (const action of ['setWifiEnabled', 'setBluetoothEnabled', 'setVolume',
    'toggleMute', 'setBrightness', 'toggleDoNotDisturb', 'toggleDarkMode'])
    assert.match(quick, new RegExp(`this\\._controls\\.${action}\\(`));
assert.match(controls, /NM\.Client\.new_async/);
assert.match(controls, /activate_connection_async/);
assert.match(controls, /connect_service/);
assert.match(controls, /push_volume/);
assert.match(controls, /this\._brightness\.Brightness =/);
assert.doesNotMatch(controls, /\b(?:call_sync|spawn_command_line_sync)\b/);

const calendar = read('modules/calendar.js');
assert.match(calendar, /shiftMonth/);
assert.match(calendar, /calendarGrid/);
assert.match(calendar, /localeFirstDay/);
assert.match(calendar, /this\._selected =/);

const context = read('modules/contextMenu.js');
assert.match(context, /togglePinnedApp/);
assert.match(context, /open_new_window/);
assert.match(context, /win\.activate/);
assert.match(context, /target\.delete/);
assert.match(context, /can_close\(\)/);

const notifications = read('modules/notificationCenter.js');
assert.match(notifications, /safeConnect/);
assert.match(notifications, /safeInvoke/);
assert.match(notifications, /notificationCapabilities/);
assert.match(notifications, /notification-added/);
assert.match(notifications, /notification-removed/);
assert.match(notifications, /Notificações indisponíveis nesta versão do GNOME/);
assert.match(notifications, /GLib\.Source\.remove\(this\._renderId\)/);

const taskbar = read('modules/taskbar.js');
assert.match(taskbar, /new QuickSettingsPanel/);
assert.match(taskbar, /new NotificationCenter/);
assert.match(taskbar, /this\._monitorIndex/);
assert.match(taskbar, /this\._quick\?\.destroy\(\)/);
assert.match(taskbar, /this\._notifications\?\.destroy\(\)/);

const preferences = read('prefs.js');
for (const key of ['show-notifications', 'show-quick-settings', 'multi-monitor'])
    assert.ok(preferences.includes(`['${key}'`), `${key} must remain exposed in preferences`);

console.log('OK: SPEC 0.2.0 real system actions, calendar, context, notification fallbacks and cleanup');

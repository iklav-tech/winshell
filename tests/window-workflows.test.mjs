import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');

const snap = read('modules/snapLayouts.js');
assert.match(snap, /get_min_size/);
assert.match(snap, /get_max_size/);
assert.match(snap, /get_work_area_for_monitor/);
assert.match(snap, /rectangleWithinArea/);
assert.match(snap, /move_resize_frame/);
assert.match(snap, /move_frame/);
assert.match(snap, /win\.unminimize\(\)/);
assert.match(snap, /GLib\.Source\.remove\(id\)/);

const preview = read('modules/windowPreview.js');
assert.match(preview, /\{takeFocus\}/);
assert.match(preview, /minimizada/);
assert.match(preview, /win\.can_close\(\)/);
assert.match(preview, /leaveButton/);
assert.match(preview, /this\._cancelHide\(\)/);

const popup = read('modules/popup.js');
assert.match(popup, /\{takeFocus = true\}/);
assert.match(popup, /if \(takeFocus && !this\._focusCaptured\)/);
assert.match(popup, /this\._focusCaptured = false/);

const monitors = read('modules/multiMonitor.js');
assert.match(monitors, /monitors-changed/);
assert.match(monitors, /changed::multi-monitor/);
assert.match(monitors, /this\._bars\.forEach\(bar => bar\.destroy\(\)\)/);

const notifications = read('modules/notificationCenter.js');
assert.match(notifications, /messageSources\(\)/);
assert.match(notifications, /source-added/);
assert.match(notifications, /source-removed/);
assert.doesNotMatch(notifications, /localStorage|writeFile|Json/);

console.log('OK: SPEC 0.3.0 constrained Snap, non-focusing previews, hotplug and native notifications');

import assert from 'node:assert/strict';
import {taskbarGeometry, taskbarMonitorIndexes} from '../modules/taskbarGeometry.mjs';

assert.deepEqual(taskbarGeometry({x: -1920, y: -120, width: 1920, height: 1080}, 54),
    {x: -1920, y: 906, width: 1920, height: 54});
assert.deepEqual(taskbarGeometry({x: 2560, y: 180, width: 1920, height: 1080}, 64),
    {x: 2560, y: 1196, width: 1920, height: 64});
assert.equal(taskbarGeometry({x: 0, y: 0, width: 0, height: 1080}, 54), null);
assert.deepEqual(taskbarMonitorIndexes([{}, {}, {}], 2, false), [2]);
assert.deepEqual(taskbarMonitorIndexes([{}, {}, {}], 5, false), [0]);
assert.deepEqual(taskbarMonitorIndexes([{}, {}, {}], 1, true), [0, 1, 2]);
assert.deepEqual(taskbarMonitorIndexes([], 0, true), []);
assert.deepEqual([
    taskbarMonitorIndexes([{}], 0, true),
    taskbarMonitorIndexes([{}, {}], 0, true),
    taskbarMonitorIndexes([{}, {}], 1, false),
    taskbarMonitorIndexes([{}], 0, true),
], [[0], [0, 1], [1], [0]]);
console.log('OK: taskbar bottom anchoring, hotplug transitions and unique monitor topology');

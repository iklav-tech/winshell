import assert from 'node:assert/strict';
import {
    TASKBAR_CONFLICT_EXTENSIONS,
    TaskbarConflictPolicy,
    installedManagedExtensions,
    normalizeTaskbarConflictPolicy,
    planTaskbarConflicts,
} from '../modules/taskbarConflictModel.mjs';

const active = (uuid, canChange = true) => ({uuid, installed: true, active: true, canChange});
const ubuntu = TASKBAR_CONFLICT_EXTENSIONS[0].uuid;
const dock = TASKBAR_CONFLICT_EXTENSIONS[1].uuid;
const panel = TASKBAR_CONFLICT_EXTENSIONS[2].uuid;

assert.deepEqual(planTaskbarConflicts(TaskbarConflictPolicy.AUTOMATIC,
    [active(ubuntu), active(dock, false), {uuid: panel, installed: true, active: false, canChange: true}]),
{disable: [ubuntu], warn: [dock]});
assert.deepEqual(planTaskbarConflicts(TaskbarConflictPolicy.WARN_ONLY,
    [active(ubuntu), active(panel)]), {disable: [], warn: [ubuntu, panel]});
assert.deepEqual(planTaskbarConflicts(TaskbarConflictPolicy.DISABLED,
    [active(ubuntu)]), {disable: [], warn: []});
assert.equal(normalizeTaskbarConflictPolicy('invalid'), TaskbarConflictPolicy.WARN_ONLY);
assert.deepEqual(installedManagedExtensions([ubuntu, ubuntu, panel], [ubuntu, dock]), [ubuntu]);
console.log('OK: taskbar conflict detection, policies and reversible state');

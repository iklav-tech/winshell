import assert from 'node:assert/strict';
import {groupNotifications, notificationCapabilities, notificationTimestamp,
    plainText} from '../modules/notificationModel.mjs';

assert.equal(plainText('<b>Hello</b>   world'), 'Hello world');
assert.equal(notificationTimestamp({to_unix: () => 123}), 123000);

const activate = () => {};
const destroy = () => {};
const validAction = {label: 'Responder', activate};
assert.deepEqual(notificationCapabilities({activate, destroy,
    actions: [validAction, {label: 'Sem callback'}]}), {
    canActivate: true,
    canDismiss: true,
    actions: [validAction],
});
assert.deepEqual(notificationCapabilities({actions: null}), {
    canActivate: false,
    canDismiss: false,
    actions: [],
});

const initial = groupNotifications([
    {appId: 'mail', appName: 'Mail', title: 'Old', body: '<i>one</i>', timestamp: 100},
    {appId: 'chat', appName: 'Chat', title: 'Message', body: 'hi', timestamp: 300},
    {appId: 'mail', appName: 'Mail', title: 'New', body: 'two', timestamp: 200},
]);
assert.deepEqual(initial.map(group => group.key), ['chat', 'mail']);
assert.deepEqual(initial[1].items.map(item => item.title), ['New', 'Old']);
assert.equal(initial[1].items[1].body, 'one');

// A second snapshot models one dismissal and one arrival; grouping must not retain stale state.
const changed = groupNotifications([
    {appId: 'mail', appName: 'Mail', title: 'New', timestamp: 200},
    {appId: 'files', appName: 'Files', title: 'Done', timestamp: 400},
]);
assert.deepEqual(changed.map(group => group.key), ['files', 'mail']);
assert.equal(changed.some(group => group.key === 'chat'), false);
console.log('OK: notification grouping, sanitization and snapshot lifecycle');

import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const modules = path.join(root, 'modules');
const sources = readdirSync(modules, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile() && /\.(?:js|mjs)$/.test(entry.name))
    .map(entry => path.join(entry.parentPath, entry.name));

for (const source of sources) {
    const relative = path.relative(root, source);
    const text = readFileSync(source, 'utf8');
    if (relative !== 'modules/shellCompat.js') {
        assert.doesNotMatch(text, /resource:\/\/\/org\/gnome\/shell\/(?:ui|misc)\//,
            `${relative} bypasses the GNOME Shell compatibility boundary`);
    }
    assert.doesNotMatch(text, /\b(?:call_sync|spawn_command_line_sync)\b/,
        `${relative} contains a blocking Shell operation`);
}

const popup = readFileSync(path.join(modules, 'popup.js'), 'utf8');
const taskbar = readFileSync(path.join(modules, 'taskbar.js'), 'utf8');
assert.match(popup, /removeChrome\(this\.actor\)/);
assert.match(taskbar, /removeChrome\(this\.actor\)/);
assert.match(popup, /navigate_focus/);
assert.match(popup, /_previousFocus/);

console.log('OK: Shell API boundary, nonblocking contracts, explicit chrome cleanup and popup focus');

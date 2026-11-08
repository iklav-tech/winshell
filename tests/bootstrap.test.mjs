import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');
const metadata = JSON.parse(read('metadata.json'));

assert.equal(metadata.uuid, 'winshell@iklav-tech');
assert.deepEqual(metadata['shell-version'], ['46']);
assert.equal(metadata['settings-schema'], 'org.gnome.shell.extensions.winshell');
assert.equal(Number.isInteger(metadata.version), true);

const extension = read('extension.js');
assert.match(extension, /resource:\/\/\/org\/gnome\/shell\/extensions\/extension\.js/);
assert.match(extension, /export default class WinShellExtension extends Extension/);
assert.match(extension, /\benable\(\)/);
assert.match(extension, /\bdisable\(\)/);
assert.match(extension, /this\._settings\.disconnect\(this\._settingsSignal\)/);
for (const owned of ['_taskbarConflicts', '_taskbar', '_menu', '_appearance'])
    assert.match(extension, new RegExp(`this\\.${owned}\\?\\.destroy`));

const installer = read('scripts/install.sh');
const uninstaller = read('scripts/uninstall.sh');
assert.match(installer, /XDG_DATA_HOME/);
assert.match(uninstaller, /XDG_DATA_HOME/);
assert.doesNotMatch(installer, /\bsudo\b|['"]\/usr\//);
assert.doesNotMatch(uninstaller, /\bsudo\b|['"]\/usr\//);
assert.ok(installer.indexOf('if $WITH_NAUTILUS; then') < installer.indexOf('install -d "$EXTENSION_DEST"'),
    'optional integration must be validated before installation writes');
assert.match(uninstaller, /Refusing unsafe removal target/);

for (const required of ['LICENSE', 'CONTRIBUTING.md', 'README.md', 'CHANGELOG.md'])
    assert.ok(read(required).trim().length > 0, `${required} must not be empty`);

const readme = read('README.md');
assert.match(readme, /\.\/scripts\/install\.sh/);
assert.match(readme, /\.\/scripts\/uninstall\.sh/);
assert.match(readme, /GNOME Shell 46/);
assert.match(readme, /Wayland/);

console.log('OK: SPEC 0.0.1 metadata, ESM lifecycle, local install, rollback and project baseline');

import assert from 'node:assert/strict';
import {existsSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const directory = mkdtempSync(path.join(tmpdir(), 'winshell-install-'));
const data = path.join(directory, 'data');
const config = path.join(directory, 'config');
const env = {...process.env, XDG_DATA_HOME: data, XDG_CONFIG_HOME: config, WINSHELL_SKIP_GNOME_CHECK: '1'};
const run = (script, args = []) => spawnSync(path.join(root, 'scripts', script), args,
    {cwd: root, env, encoding: 'utf8'});
for (let iteration = 0; iteration < 2; iteration++) {
    const installed = run('install.sh', ['--without-nautilus']);
    assert.equal(installed.status, 0, installed.stderr);
}
assert.ok(existsSync(path.join(data, 'gnome-shell/extensions/winshell@iklav-tech/metadata.json')));
assert.ok(existsSync(path.join(data, 'themes/WinShell/gtk-4.0/gtk.css')));
assert.ok(existsSync(path.join(data, 'themes/WinShell-Dark/gtk-3.0/gtk.css')));
assert.ok(existsSync(path.join(data, 'icons/WinShell/index.theme')));
assert.ok(existsSync(path.join(data, 'winshell/wallpapers/winshell-bloom-dark.svg')));
assert.equal(existsSync(path.join(data, 'nautilus-python/extensions/winshell-nautilus.py')), false);
const removed = run('uninstall.sh', ['--no-restore']);
assert.equal(removed.status, 0, removed.stderr);
assert.equal(existsSync(path.join(data, 'gnome-shell/extensions/winshell@iklav-tech')), false);
assert.equal(existsSync(path.join(data, 'themes/WinShell')), false);
assert.equal(existsSync(path.join(data, 'icons/WinShell')), false);
console.log('OK: isolated idempotent install and clean uninstall');

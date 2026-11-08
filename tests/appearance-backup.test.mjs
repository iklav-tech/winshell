import assert from 'node:assert/strict';
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const directory = mkdtempSync(path.join(tmpdir(), 'winshell-appearance-'));
const statePath = path.join(directory, 'state.json');
const backupPath = path.join(directory, 'config', 'winshell', 'appearance-backup-v1.json');
const initial = {
    'org.gnome.desktop.interface/icon-theme': "'Yaru'", 'org.gnome.desktop.interface/gtk-theme': "'Yaru'",
    'org.gnome.desktop.interface/color-scheme': "'default'",
    'org.gnome.desktop.background/picture-uri': "'file:///old-light.jpg'",
    'org.gnome.desktop.background/picture-uri-dark': "'file:///old-dark.jpg'",
    'org.gnome.desktop.background/picture-options': "'zoom'",
    'org.gnome.shell.extensions.ding/show-home': 'false',
    'org.gnome.shell.extensions.ding/show-trash': 'false',
    'org.gnome.shell.extensions.ding/show-volumes': 'true',
};
writeFileSync(statePath, JSON.stringify(initial));
const helper = path.join(root, 'integrations/appearance/winshell-appearance');
const run = (...args) => spawnSync(helper, args, {encoding: 'utf8', env: {
    ...process.env, WINSHELL_TEST_STATE: statePath, XDG_CONFIG_HOME: path.join(directory, 'config')}});
const applyArgs = ['apply', '--backup', backupPath, '--mode', 'dark', '--sync-system',
    '--icon-theme', 'WinShell', '--wallpaper', 'file:///light.svg', '--wallpaper-dark', 'file:///dark.svg',
    '--background-style', 'scaled', '--desktop', '--show-home', '--show-trash', '--no-show-volumes'];
assert.equal(run(...applyArgs).status, 0);
assert.equal(run(...applyArgs).status, 0, 'apply must be idempotent');
let state = JSON.parse(readFileSync(statePath));
assert.equal(state['org.gnome.desktop.interface/gtk-theme'], "'WinShell-Dark'");
assert.equal(state['org.gnome.shell.extensions.ding/show-volumes'], 'false');
const backup = JSON.parse(readFileSync(backupPath));
assert.equal(backup.version, 1);
assert.equal(backup.original['org.gnome.desktop.interface/gtk-theme'], "'Yaru'");
state['org.gnome.desktop.interface/icon-theme'] = "'ExternalTheme'";
writeFileSync(statePath, JSON.stringify(state));
assert.equal(run(...applyArgs).status, 3, 'external modifications must block apply');
assert.equal(run(...applyArgs, '--force').status, 0);
state = JSON.parse(readFileSync(statePath));
state['org.gnome.desktop.background/picture-options'] = "'centered'";
writeFileSync(statePath, JSON.stringify(state));
assert.equal(run('restore', '--backup', backupPath).status, 3, 'external modifications must block restore');
assert.equal(run('restore', '--backup', backupPath, '--force').status, 0);
assert.equal(run('restore', '--backup', backupPath).status, 0, 'restore must be idempotent');
assert.deepEqual(JSON.parse(readFileSync(statePath)), initial);
assert.equal(run('status', '--backup', path.join(directory, 'missing.json')).status, 0);

const deniedDirectory = path.join(directory, 'denied');
mkdirSync(deniedDirectory);
const deniedState = path.join(deniedDirectory, 'state.json');
writeFileSync(deniedState, JSON.stringify(initial));
chmodSync(deniedDirectory, 0o500);
const denied = spawnSync(helper, applyArgs, {encoding: 'utf8', env: {
    ...process.env, WINSHELL_TEST_STATE: deniedState, XDG_CONFIG_HOME: path.join(directory, 'denied-config')}});
chmodSync(deniedDirectory, 0o700);
assert.equal(denied.status, 2, 'permission failure must be reported without partial success');
const missingDependency = spawnSync('/usr/bin/python3', [helper, 'status'], {encoding: 'utf8',
    env: {...process.env, PATH: '/nonexistent', XDG_CONFIG_HOME: path.join(directory, 'empty-config')}});
assert.equal(missingDependency.status, 2, 'missing gsettings must fail gracefully');
console.log('OK: versioned appearance backup, conflicts, force, restore and idempotence');

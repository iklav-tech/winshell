import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {searchApplications, taskbarPrimaryAction,
    togglePinnedApp} from '../modules/shellFoundationModel.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');

const applications = [
    {id: 'terminal.desktop', name: 'Terminal', description: 'Linha de comando',
        executable: 'kgx', keywords: ['shell']},
    {id: 'files.desktop', name: 'Arquivos', description: 'Gerenciador de arquivos',
        executable: 'nautilus', keywords: ['pastas']},
    {id: 'settings.desktop', name: 'Configurações', description: 'Preferências do sistema',
        executable: 'gnome-control-center', keywords: ['hardware', 'rede']},
];

assert.deepEqual(searchApplications(applications, '', ['terminal.desktop'])
    .map(application => application.id), ['terminal.desktop', 'files.desktop', 'settings.desktop']);
assert.deepEqual(searchApplications(applications, 'LINHA').map(application => application.id),
    ['terminal.desktop']);
assert.deepEqual(searchApplications(applications, 'nautilus').map(application => application.id),
    ['files.desktop']);
assert.deepEqual(searchApplications(applications, 'rede').map(application => application.id),
    ['settings.desktop']);
assert.deepEqual(searchApplications(applications, 'inexistente'), []);

assert.deepEqual(togglePinnedApp(['files.desktop'], 'terminal.desktop'),
    ['files.desktop', 'terminal.desktop']);
assert.deepEqual(togglePinnedApp(['files.desktop', 'terminal.desktop'], 'files.desktop'),
    ['terminal.desktop']);
assert.deepEqual(togglePinnedApp(['files.desktop', 'files.desktop'], 'files.desktop'), []);

assert.equal(taskbarPrimaryAction(), 'activate');
assert.equal(taskbarPrimaryAction({focusedWindowOwned: true}), 'minimize');
assert.equal(taskbarPrimaryAction({focusedWindowOwned: true,
    focusedWindowMinimized: true}), 'activate');
assert.equal(taskbarPrimaryAction({focusedWindowOwned: false,
    focusedWindowMinimized: false}), 'activate');

const startMenu = read('modules/startMenu.js');
const taskbar = read('modules/taskbar.js');
const contextMenu = read('modules/contextMenu.js');
const preferences = read('prefs.js');
const extension = read('extension.js');
assert.match(startMenu, /searchApplications\(apps, term, favorites\)/);
assert.match(startMenu, /activateApp\(first\)/);
assert.match(startMenu, /Em execução/);
assert.match(taskbar, /taskbarPrimaryAction/);
assert.match(taskbar, /focusedWindow\.minimize\(\)/);
assert.match(taskbar, /activateApp\(app\)/);
assert.match(contextMenu, /togglePinnedApp/);
assert.match(contextMenu, /set_strv\('pinned-apps'/);
assert.match(preferences, /settings\.bind\(/);
assert.match(extension, /if \(this\._nativePanelWasVisible\) shellPanel\(\)\.show\(\)/);

console.log('OK: SPEC 0.1.0 search, pinning, real app/window wiring, preferences and panel restore');

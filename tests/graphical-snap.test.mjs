import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {TEMPLATES, validateLayoutTemplates} from '../modules/layoutGeometry.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');

assert.deepEqual(TEMPLATES.map(template => template.id),
    ['halves', 'thirds', 'large-left', 'large-right', 'quarters']);
assert.equal(validateLayoutTemplates(TEMPLATES), true);
assert.ok(TEMPLATES.every(template => template.regions.length >= 2));

const snap = read('modules/snapLayouts.js');
assert.match(snap, /snapTemplateGeometry\(template, context\.area, context\.constraints\)/);
assert.match(snap, /reactive: eligible, can_focus: eligible, track_hover: eligible/);
assert.match(snap, /winshell-snap-region-disabled/);
assert.match(snap, /button\.connect\('clicked'/);
assert.match(snap, /applyLayout\(win, region/);
assert.match(snap, /set_accessible_name/);
assert.match(snap, /Nenhuma região comporta os limites de tamanho desta janela/);

const preferences = read('prefs.js');
const schema = read('schemas/org.gnome.shell.extensions.winshell.gschema.xml');
const taskbar = read('modules/taskbar.js');
assert.match(preferences, /\['snap-layouts', 'Snap Layouts gráficos'/);
assert.match(schema, /<key name="snap-layouts" type="b"><default>true<\/default>/);
assert.match(taskbar, /get_boolean\('snap-layouts'\)/);

const css = read('stylesheet.css');
assert.match(css, /\.winshell-snap-region:hover/);
assert.match(css, /\.winshell-snap-region:focus/);
assert.match(css, /\.winshell-snap-region-disabled/);
assert.match(css, /\.winshell-preview-title:focus/);
assert.match(css, /\.winshell-mini-action:focus/);

const popup = read('modules/popup.js');
assert.match(popup, /const source = event\.get_source\(\)/);
assert.match(popup, /!source \|\| !this\.actor\.contains\(source\)/);
assert.doesNotMatch(popup, /contains\(event\.get_source\(\)\)/);

console.log('OK: SPEC 0.4.0 five graphical layouts, eligibility, controls and interaction states');

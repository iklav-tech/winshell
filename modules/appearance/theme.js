import Gio from 'gi://Gio';
import {effectiveAppearanceMode, VISUAL_PRESETS} from './appearanceModel.mjs';
import {layoutManager} from '../shellCompat.js';

const THEME_CLASSES = ['winshell-theme-light', 'winshell-theme-dark',
    ...VISUAL_PRESETS.map(name => `winshell-preset-${name}`)];

export class ShellAppearanceController {
    constructor(settings) {
        this._settings = settings;
        this._desktop = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._settingsSignal = settings.connect('changed', (_settings, key) => {
            if (key === 'appearance-mode' || key === 'visual-preset')
                this._sync();
        });
        this._desktopSignal = this._desktop.connect('changed::color-scheme', () => this._sync());
        this._sync();
    }

    _sync() {
        const group = layoutManager().uiGroup;
        for (const name of THEME_CLASSES)
            group.remove_style_class_name(name);
        const mode = effectiveAppearanceMode(this._settings.get_string('appearance-mode'),
            this._desktop.get_string('color-scheme'));
        const preset = this._settings.get_string('visual-preset');
        group.add_style_class_name(`winshell-theme-${mode}`);
        group.add_style_class_name(`winshell-preset-${VISUAL_PRESETS.includes(preset) ? preset : 'balanced'}`);
    }

    destroy() {
        if (this._settingsSignal)
            this._settings.disconnect(this._settingsSignal);
        if (this._desktopSignal)
            this._desktop.disconnect(this._desktopSignal);
        for (const name of THEME_CLASSES)
            layoutManager().uiGroup.remove_style_class_name(name);
        this._settingsSignal = 0;
        this._desktopSignal = 0;
        this._desktop = null;
        this._settings = null;
    }
}

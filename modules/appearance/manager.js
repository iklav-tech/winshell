import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {effectiveWallpaper} from './appearanceModel.mjs';

function exists(path) {
    return GLib.file_test(path, GLib.FileTest.EXISTS);
}

export class AppearanceManager {
    constructor(extensionPath, settings) {
        this._extensionPath = extensionPath;
        this._settings = settings;
        const installedRoot = GLib.build_filenamev([GLib.get_user_data_dir(), 'winshell']);
        const installedHelper = GLib.build_filenamev([installedRoot, 'bin', 'winshell-appearance']);
        this._helper = exists(installedHelper) ? installedHelper :
            GLib.build_filenamev([extensionPath, 'integrations', 'appearance', 'winshell-appearance']);
        const installedWallpapers = GLib.build_filenamev([installedRoot, 'wallpapers']);
        this._wallpaperRoot = exists(installedWallpapers) ? installedWallpapers :
            GLib.build_filenamev([extensionPath, 'wallpapers']);
    }

    get wallpaperPaths() {
        return {
            light: GLib.build_filenamev([this._wallpaperRoot, 'winshell-bloom-light.svg']),
            dark: GLib.build_filenamev([this._wallpaperRoot, 'winshell-bloom-dark.svg']),
        };
    }

    previewPath() {
        const paths = this.wallpaperPaths;
        const uris = {light: Gio.File.new_for_path(paths.light).get_uri(),
            dark: Gio.File.new_for_path(paths.dark).get_uri()};
        const mode = this._settings.get_string('appearance-mode') === 'dark' ? 'dark' : 'light';
        const uri = effectiveWallpaper(this._settings.get_string('wallpaper-selection'), mode,
            uris, this._settings.get_string('custom-wallpaper-uri'));
        return Gio.File.new_for_uri(uri).get_path() ?? paths.light;
    }

    desktopProviderStatus() {
        const source = Gio.SettingsSchemaSource.get_default();
        const hasSchema = Boolean(source?.lookup('org.gnome.shell.extensions.ding', true));
        const roots = [GLib.get_user_data_dir(), '/usr/share'];
        const uuids = ['ding@rastersoft.com', 'gtk4-ding@smedius.gitlab.com'];
        const installed = roots.some(root => uuids.some(uuid => exists(
            GLib.build_filenamev([root, 'gnome-shell', 'extensions', uuid]))));
        return {available: hasSchema && installed,
            label: hasSchema && installed ? 'Desktop Icons NG detectado' : 'DING não detectado'};
    }

    nautilusStatus() {
        const plugin = GLib.build_filenamev([GLib.get_user_data_dir(), 'nautilus-python',
            'extensions', 'winshell-nautilus.py']);
        const available = exists(plugin) && Boolean(GLib.find_program_in_path('nautilus'));
        return {available, label: available ? 'Plugin Nautilus instalado' :
            'Instale com scripts/install.sh --with-nautilus'};
    }

    setNautilusEnabled(enabled) {
        const directory = GLib.build_filenamev([GLib.get_user_config_dir(), 'winshell']);
        const path = GLib.build_filenamev([directory, 'nautilus-enabled']);
        if (enabled) {
            GLib.mkdir_with_parents(directory, 0o700);
            GLib.file_set_contents(path, 'enabled\n');
        } else if (exists(path)) {
            Gio.File.new_for_path(path).delete(null);
        }
    }

    _applyArguments() {
        const paths = this.wallpaperPaths;
        const packaged = {light: Gio.File.new_for_path(paths.light).get_uri(),
            dark: Gio.File.new_for_path(paths.dark).get_uri()};
        const selection = this._settings.get_string('wallpaper-selection');
        const custom = this._settings.get_string('custom-wallpaper-uri');
        let light = effectiveWallpaper(selection, 'light', packaged, custom);
        let dark = effectiveWallpaper(selection, 'dark', packaged, custom);
        if (selection === 'light') dark = light;
        if (selection === 'dark') light = dark;
        const args = ['--mode', this._settings.get_string('appearance-mode'),
            '--icon-theme', this._settings.get_string('icon-theme'),
            '--wallpaper', light, '--wallpaper-dark', dark,
            '--background-style', this._settings.get_string('background-style')];
        if (this._settings.get_boolean('sync-system-appearance'))
            args.push('--sync-system');
        if (this._settings.get_boolean('desktop-icons-enabled')) {
            args.push('--desktop');
            for (const [key, option] of [['desktop-show-home', 'home'],
                ['desktop-show-trash', 'trash'], ['desktop-show-volumes', 'volumes']])
                args.push(this._settings.get_boolean(key) ? `--show-${option}` : `--no-show-${option}`);
        }
        return args;
    }

    run(command, force, callback) {
        const argv = [this._helper, command];
        if (force) argv.push('--force');
        if (command === 'apply') argv.push(...this._applyArguments());
        try {
            const process = Gio.Subprocess.new(argv,
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
            process.communicate_utf8_async(null, null, (source, result) => {
                try {
                    const [, stdout, stderr] = source.communicate_utf8_finish(result);
                    const status = source.get_exit_status();
                    let payload = {};
                    try { payload = JSON.parse(stdout || '{}'); } catch (_error) { payload = {}; }
                    callback(status, payload, stderr || '');
                } catch (error) {
                    callback(2, {message: error.message}, '');
                }
            });
        } catch (error) {
            callback(2, {message: error.message}, '');
        }
    }
}

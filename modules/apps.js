import Shell from 'gi://Shell';

const appSystem = Shell.AppSystem.get_default();

export function appById(id) {
    return appSystem.lookup_app(id);
}

export function installedApps() {
    return appSystem.get_installed()
        .filter(info => info.should_show())
        .map(info => appById(info.get_id()))
        .filter(app => app !== null)
        .sort((a, b) => a.get_name().localeCompare(b.get_name()));
}

export function runningApps() {
    return appSystem.get_running();
}

export function activateApp(app) {
    if (app.get_n_windows() > 0)
        app.activate_window(app.get_windows()[0], global.get_current_time());
    else
        app.activate();
}

export function windowCapabilities(state = {}) {
    const maximized = Boolean(state.maximizedHorizontally && state.maximizedVertically);
    return {
        canActivate: state.canActivate !== false,
        canMinimize: Boolean(state.canMinimize),
        canMaximize: Boolean(state.canMaximize),
        canClose: Boolean(state.canClose),
        minimized: Boolean(state.minimized),
        maximized,
        minimizeLabel: state.minimized ? 'Restaurar' : 'Minimizar',
        maximizeLabel: maximized ? 'Restaurar tamanho' : 'Maximizar',
    };
}

export function visibleWindows(windows = []) {
    return windows.filter(window => !window.skipTaskbar);
}

export const APPEARANCE_MODES = Object.freeze(['follow-system', 'light', 'dark']);
export const VISUAL_PRESETS = Object.freeze(['balanced', 'subtle', 'high-contrast']);
export const WALLPAPER_SELECTIONS = Object.freeze(['synchronized', 'light', 'dark', 'custom']);

export function effectiveAppearanceMode(mode, systemColorScheme = 'default') {
    if (mode === 'light' || mode === 'dark')
        return mode;
    return systemColorScheme === 'prefer-dark' ? 'dark' : 'light';
}

export function effectiveWallpaper(selection, appearanceMode, paths, customUri = '') {
    if (selection === 'custom' && customUri)
        return customUri;
    if (selection === 'dark' || (selection === 'synchronized' && appearanceMode === 'dark'))
        return paths.dark;
    return paths.light;
}

export const DESKTOP_PROVIDERS = Object.freeze([
    Object.freeze({id: 'ding', name: 'Desktop Icons NG (DING)',
        schemas: ['org.gnome.shell.extensions.ding'],
        extensions: ['ding@rastersoft.com']}),
    Object.freeze({id: 'gtk4-ding', name: 'Desktop Icons NG (GTK4)',
        schemas: ['org.gnome.shell.extensions.ding'],
        extensions: ['gtk4-ding@smedius.gitlab.com']}),
]);

export function detectDesktopProvider(availableSchemas = [], installedExtensions = []) {
    const schemas = new Set(availableSchemas);
    const extensions = new Set(installedExtensions);
    return DESKTOP_PROVIDERS.find(provider =>
        provider.schemas.some(schema => schemas.has(schema)) &&
        provider.extensions.some(extension => extensions.has(extension))) ?? null;
}

export function nautilusIntegrationAvailable({pythonNautilus = false, pluginInstalled = false} = {}) {
    return Boolean(pythonNautilus && pluginInstalled);
}

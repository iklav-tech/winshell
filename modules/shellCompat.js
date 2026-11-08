// GNOME Shell 46 compatibility boundary.
//
// Keep access to Shell-owned JavaScript singletons and private implementation
// modules here. Callers still feature-detect optional methods because these APIs
// are version-specific even though metadata currently limits WinShell to 46.
import {ExtensionState} from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Slider} from 'resource:///org/gnome/shell/ui/slider.js';
import {getMixerControl} from 'resource:///org/gnome/shell/ui/status/volume.js';

export {ExtensionState, Slider};

export function layoutManager() {
    return Main.layoutManager;
}

export function shellPanel() {
    return Main.panel;
}

export function extensionManager() {
    return Main.extensionManager;
}

export function messageTray() {
    return Main.messageTray;
}

export function messageSources() {
    return Main.messageTray.getSources?.() ?? [];
}

export function mixerControl() {
    return getMixerControl();
}

export function notify(title, body) {
    Main.notify(title, body);
}

export function addChrome(actor, options) {
    Main.layoutManager.addChrome(actor, options);
}

export function removeChrome(actor) {
    if (!actor)
        return;
    try {
        Main.layoutManager.removeChrome(actor);
    } catch (error) {
        // A failed constructor or Shell teardown can already have detached it.
        console.debug(`[WinShell] Chrome já removido: ${error.message}`);
    }
}

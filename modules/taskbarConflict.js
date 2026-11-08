import GLib from 'gi://GLib';
import {
    TASKBAR_CONFLICT_EXTENSIONS,
    TaskbarConflictPolicy,
    installedManagedExtensions,
    planTaskbarConflicts,
} from './taskbarConflictModel.mjs';
import {extensionManager, ExtensionState, notify} from './shellCompat.js';

const MANAGED_KEY = 'managed-taskbar-extensions';

export class TaskbarConflictManager {
    constructor(settings) {
        this._settings = settings;
        this._extensionManager = extensionManager();
        this._idle = 0;
        this._destroyed = false;
        this._notified = new Set();
        this._disabling = new Set();
        this._verificationSources = new Map();
        this._managerSignal = this._extensionManager.connect('extension-state-changed',
            (_manager, extension) => {
                if (TASKBAR_CONFLICT_EXTENSIONS.some(item => item.uuid === extension?.uuid)) {
                    if (extension.state === ExtensionState.INACTIVE ||
                        extension.state === ExtensionState.ERROR) {
                        this._disabling.delete(extension.uuid);
                        this._clearVerification(extension.uuid);
                    }
                    this._scheduleSync();
                }
            });
        this._settingsSignal = settings.connect('changed::taskbar-conflict-handling', () => {
            this._notified.clear();
            this._scheduleSync();
        });
        this._scheduleSync();
    }

    _scheduleSync() {
        if (this._destroyed || this._idle)
            return;
        this._idle = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._idle = 0;
            try {
                this._sync();
            } catch (error) {
                console.error(`[WinShell] Falha ao verificar conflitos de barra: ${error.stack ?? error}`);
                notify('WinShell: verificação de compatibilidade falhou',
                    'Nenhuma barra de terceiros será manipulada até a próxima mudança de estado. Consulte o journal do GNOME Shell.');
            }
            return GLib.SOURCE_REMOVE;
        });
    }

    _candidates() {
        return TASKBAR_CONFLICT_EXTENSIONS.map(item => {
            const extension = this._extensionManager.lookup(item.uuid);
            return {
                ...item,
                installed: Boolean(extension),
                active: extension?.state === ExtensionState.ACTIVE,
                canChange: extension?.canChange === true,
            };
        });
    }

    _sync() {
        if (this._destroyed)
            return;
        const policy = this._settings.get_string('taskbar-conflict-handling');
        if (policy !== TaskbarConflictPolicy.AUTOMATIC)
            this._restoreManaged();

        const candidates = this._candidates();
        const plan = planTaskbarConflicts(policy, candidates);
        for (const uuid of plan.disable)
            this._disable(uuid);
        for (const uuid of plan.warn)
            this._warn(uuid, candidates, policy === TaskbarConflictPolicy.AUTOMATIC);
    }

    _disable(uuid) {
        if (this._disabling.has(uuid))
            return;
        this._disabling.add(uuid);
        const managed = new Set(this._settings.get_strv(MANAGED_KEY));
        managed.add(uuid);
        if (!this._settings.set_strv(MANAGED_KEY, [...managed])) {
            this._disabling.delete(uuid);
            this._warn(uuid, this._candidates(), true);
            return;
        }
        let disabled = false;
        try {
            disabled = this._extensionManager.disableExtension(uuid);
        } catch (error) {
            console.error(`[WinShell] Falha ao desativar ${uuid}: ${error.stack ?? error}`);
            this._disabling.delete(uuid);
            this._warn(uuid, this._candidates(), true);
            return;
        }
        if (!disabled) {
            this._disabling.delete(uuid);
            managed.delete(uuid);
            this._settings.set_strv(MANAGED_KEY, [...managed]);
            this._warn(uuid, this._candidates(), true);
            return;
        }
        this._verifyDisabled(uuid);
    }

    _verifyDisabled(uuid) {
        this._clearVerification(uuid);
        const source = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._verificationSources.delete(uuid);
            if (this._destroyed)
                return GLib.SOURCE_REMOVE;
            const extension = this._extensionManager.lookup(uuid);
            if (extension?.state === ExtensionState.ACTIVE) {
                this._disabling.delete(uuid);
                const managed = new Set(this._settings.get_strv(MANAGED_KEY));
                managed.delete(uuid);
                this._settings.set_strv(MANAGED_KEY, [...managed]);
                this._warn(uuid, this._candidates(), true);
            }
            return GLib.SOURCE_REMOVE;
        });
        this._verificationSources.set(uuid, source);
    }

    _clearVerification(uuid) {
        const source = this._verificationSources.get(uuid);
        if (source)
            GLib.Source.remove(source);
        this._verificationSources.delete(uuid);
    }

    _restoreManaged() {
        const installed = TASKBAR_CONFLICT_EXTENSIONS
            .filter(item => this._extensionManager.lookup(item.uuid))
            .map(item => item.uuid);
        const managed = installedManagedExtensions(this._settings.get_strv(MANAGED_KEY), installed);
        const pending = [];
        for (const uuid of managed) {
            const extension = this._extensionManager.lookup(uuid);
            let restored = false;
            try {
                restored = extension?.canChange !== false && this._extensionManager.enableExtension(uuid);
            } catch (error) {
                console.error(`[WinShell] Falha ao restaurar ${uuid}: ${error.stack ?? error}`);
            }
            if (!restored) {
                pending.push(uuid);
                this._warn(uuid, this._candidates(), true);
            }
        }
        this._settings.set_strv(MANAGED_KEY, pending);
    }

    _warn(uuid, candidates, failed = false) {
        const key = `${uuid}:${failed}`;
        if (this._notified.has(key))
            return;
        this._notified.add(key);
        const conflict = candidates.find(item => item.uuid === uuid);
        const name = conflict?.name ?? uuid;
        const detail = failed
            ? `${name} não pôde ser alterado com segurança pelo GNOME.`
            : `${name} está ativo e a política atual não altera outras extensões.`;
        notify('WinShell: barra de tarefas concorrente',
            `${detail} Use o aplicativo Extensões ou selecione “Automático” nas preferências do WinShell.`);
    }

    destroy({restore = true} = {}) {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this._idle) {
            GLib.Source.remove(this._idle);
            this._idle = 0;
        }
        for (const source of this._verificationSources.values())
            GLib.Source.remove(source);
        this._verificationSources.clear();
        if (this._managerSignal)
            this._extensionManager.disconnect(this._managerSignal);
        if (this._settingsSignal)
            this._settings.disconnect(this._settingsSignal);
        this._managerSignal = 0;
        this._settingsSignal = 0;
        if (restore)
            this._restoreManaged();
        this._settings = null;
        this._extensionManager = null;
    }
}

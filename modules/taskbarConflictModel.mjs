export const TaskbarConflictPolicy = Object.freeze({
    AUTOMATIC: 'automatic',
    WARN_ONLY: 'warn-only',
    DISABLED: 'disabled',
});

export const TASKBAR_CONFLICT_EXTENSIONS = Object.freeze([
    Object.freeze({uuid: 'ubuntu-dock@ubuntu.com', name: 'Ubuntu Dock'}),
    Object.freeze({uuid: 'dash-to-dock@micxgx.gmail.com', name: 'Dash to Dock'}),
    Object.freeze({uuid: 'dash-to-panel@jderose9.github.com', name: 'Dash to Panel'}),
]);

const KNOWN_POLICIES = new Set(Object.values(TaskbarConflictPolicy));

export function normalizeTaskbarConflictPolicy(policy) {
    return KNOWN_POLICIES.has(policy) ? policy : TaskbarConflictPolicy.WARN_ONLY;
}

export function planTaskbarConflicts(policy, extensions) {
    const normalized = normalizeTaskbarConflictPolicy(policy);
    const plan = {disable: [], warn: []};
    if (normalized === TaskbarConflictPolicy.DISABLED)
        return plan;

    for (const extension of extensions) {
        if (!extension?.installed || !extension.active)
            continue;
        if (normalized === TaskbarConflictPolicy.AUTOMATIC && extension.canChange)
            plan.disable.push(extension.uuid);
        else
            plan.warn.push(extension.uuid);
    }
    return plan;
}

export function installedManagedExtensions(managedUuids, installedUuids) {
    const installed = new Set(installedUuids);
    return [...new Set(managedUuids)].filter(uuid => installed.has(uuid));
}

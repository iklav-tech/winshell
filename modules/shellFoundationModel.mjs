function normalize(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
}

export function searchApplications(applications = [], query = '', pinnedIds = []) {
    const term = normalize(query);
    const pinned = new Set(pinnedIds);
    return applications.filter(application => {
        const searchable = [application.name, application.description,
            application.executable, ...(application.keywords ?? [])]
            .map(normalize).join(' ');
        return searchable.includes(term);
    }).sort((left, right) => {
        const leftPinned = pinned.has(left.id) ? 0 : 1;
        const rightPinned = pinned.has(right.id) ? 0 : 1;
        return leftPinned - rightPinned || String(left.name).localeCompare(String(right.name));
    });
}

export function togglePinnedApp(pinnedIds = [], appId) {
    const filtered = pinnedIds.filter(id => id !== appId);
    return filtered.length === pinnedIds.length ? [...filtered, appId] : filtered;
}

export function taskbarPrimaryAction({focusedWindowOwned = false,
    focusedWindowMinimized = false} = {}) {
    return focusedWindowOwned && !focusedWindowMinimized ? 'minimize' : 'activate';
}

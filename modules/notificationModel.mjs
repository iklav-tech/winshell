export function plainText(value, limit = 240) {
    return String(value ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
}

export function notificationTimestamp(value) {
    if (Number.isFinite(value)) return value;
    if (value instanceof Date) return value.getTime();
    if (value?.to_unix) return value.to_unix() * 1000;
    return 0;
}

export function notificationCapabilities(notification = {}) {
    let actions = [];
    try {
        actions = Array.from(notification.actions ?? [])
            .filter(action => typeof action?.activate === 'function');
    } catch (_error) {
        // An internal Shell collection can become unavailable during teardown.
    }
    return {
        canActivate: typeof notification.activate === 'function',
        canDismiss: typeof notification.destroy === 'function',
        actions,
    };
}

export function groupNotifications(items, limit = Number.POSITIVE_INFINITY) {
    const groups = new Map();
    const normalized = items.map((item, index) => ({
        ...item,
        appName: plainText(item.appName || 'Aplicativo', 80),
        title: plainText(item.title || 'Notificação', 120),
        body: plainText(item.body, 400),
        timestamp: notificationTimestamp(item.timestamp),
        _order: index,
    })).sort((a, b) => b.timestamp - a.timestamp || a._order - b._order).slice(0, limit);

    for (const item of normalized) {
        const key = item.appId || item.appName;
        if (!groups.has(key)) groups.set(key, {key, appName: item.appName, items: []});
        groups.get(key).items.push(item);
    }
    return [...groups.values()];
}

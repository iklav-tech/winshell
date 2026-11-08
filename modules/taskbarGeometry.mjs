export function taskbarGeometry(monitor, height) {
    if (!monitor || ![monitor.x, monitor.y, monitor.width, monitor.height, height].every(Number.isFinite) ||
        monitor.width <= 0 || monitor.height <= 0 || height <= 0 || height > monitor.height)
        return null;
    return {
        x: monitor.x,
        y: monitor.y + monitor.height - height,
        width: monitor.width,
        height,
    };
}

export function taskbarMonitorIndexes(monitors, primaryIndex, multiMonitor) {
    if (!Array.isArray(monitors) || monitors.length === 0)
        return [];
    if (!multiMonitor) {
        const primary = Number.isInteger(primaryIndex) && primaryIndex >= 0 && primaryIndex < monitors.length
            ? primaryIndex : 0;
        return [primary];
    }
    return monitors.map((_monitor, index) => index);
}

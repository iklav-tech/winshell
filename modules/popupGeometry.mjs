function finitePositive(value) {
    return Number.isFinite(value) && value > 0;
}

export function monitorAtPoint(monitors, x, y, fallback = null) {
    if (!Array.isArray(monitors) || !Number.isFinite(x) || !Number.isFinite(y))
        return fallback;
    return monitors.find(monitor => monitor &&
        [monitor.x, monitor.y, monitor.width, monitor.height].every(Number.isFinite) &&
        monitor.width > 0 && monitor.height > 0 &&
        x >= monitor.x && x < monitor.x + monitor.width &&
        y >= monitor.y && y < monitor.y + monitor.height) ?? fallback;
}

export function popupGeometry(monitor, anchorX, bottomY, preferredWidth, preferredHeight,
    margin = 12, gap = 10) {
    if (!monitor || ![monitor.x, monitor.y, monitor.width, monitor.height, anchorX, bottomY,
        preferredWidth, preferredHeight, margin, gap].every(Number.isFinite) ||
        !finitePositive(monitor.width) || !finitePositive(monitor.height) ||
        !finitePositive(preferredWidth) || !finitePositive(preferredHeight) ||
        margin < 0 || gap < 0 || monitor.width <= margin * 2 || monitor.height <= margin * 2)
        return null;

    const width = Math.floor(Math.min(preferredWidth, monitor.width - margin * 2));
    const height = Math.floor(Math.min(preferredHeight, monitor.height - margin * 2));
    if (!finitePositive(width) || !finitePositive(height))
        return null;

    const minX = monitor.x + margin;
    const maxX = monitor.x + monitor.width - width - margin;
    const minY = monitor.y + margin;
    const maxY = monitor.y + monitor.height - height - margin;
    const x = Math.round(Math.max(minX, Math.min(anchorX - width / 2, maxX)));
    const y = Math.round(Math.max(minY, Math.min(bottomY - height - gap, maxY)));
    return {x, y, width, height};
}

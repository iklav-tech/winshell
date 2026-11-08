// GNOME-independent Snap Layout geometry: testable with Node.js.
// Each template is a set of normalized regions in screen coordinates.
export const TEMPLATES = Object.freeze([
    {id: 'halves', label: 'Duas metades', regions: [[0,0,.5,1],[.5,0,.5,1]]},
    {id: 'thirds', label: 'Três colunas', regions: [[0,0,1/3,1],[1/3,0,1/3,1],[2/3,0,1/3,1]]},
    {id: 'large-left', label: 'Principal à esquerda', regions: [[0,0,2/3,1],[2/3,0,1/3,1]]},
    {id: 'large-right', label: 'Principal à direita', regions: [[0,0,1/3,1],[1/3,0,2/3,1]]},
    {id: 'quarters', label: 'Quatro quadrantes', regions: [[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
]);

export function regionToPixels(area, region, inset = 0) {
    if (!area || !Array.isArray(region) || region.length !== 4 ||
        ![area.x, area.y, area.width, area.height, ...region].every(Number.isFinite) ||
        area.width <= 0 || area.height <= 0 || inset < 0) return null;
    const [x, y, w, h] = region;
    if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1.000001 || y + h > 1.000001) return null;
    const left = area.x + Math.round(x * area.width) + inset;
    const top = area.y + Math.round(y * area.height) + inset;
    const right = area.x + Math.round((x + w) * area.width) - inset;
    const bottom = area.y + Math.round((y + h) * area.height) - inset;
    if (right - left < 80 || bottom - top < 70) return null;
    return {x: left, y: top, width: right - left, height: bottom - top};
}

function normalizedSize(size) {
    if (Array.isArray(size)) {
        const [width = 0, height = 0] = size;
        return Number.isFinite(width) && Number.isFinite(height) && width >= 0 && height >= 0
            ? {width, height} : null;
    }
    if (!size || !Number.isFinite(size.width) || !Number.isFinite(size.height) ||
        size.width < 0 || size.height < 0)
        return null;
    return {width: size.width, height: size.height};
}

export function sizeConstraintFromResult(result) {
    if (!Array.isArray(result))
        return [0, 0];
    if (typeof result[0] === 'boolean') {
        if (!result[0] || result.length < 3)
            return [0, 0];
        const size = normalizedSize(result.slice(1, 3));
        return size ? [size.width, size.height] : [0, 0];
    }
    const size = normalizedSize(result.slice(0, 2));
    return size ? [size.width, size.height] : [0, 0];
}

export function snapGeometry(area, region, {minimum = [0, 0], maximum = [0, 0]} = {}) {
    const rectangle = regionToPixels(area, region);
    const min = normalizedSize(minimum);
    const max = normalizedSize(maximum);
    if (!rectangle || !min || !max)
        return null;
    if (rectangle.width < min.width || rectangle.height < min.height)
        return null;
    if ((max.width > 0 && rectangle.width > max.width) ||
        (max.height > 0 && rectangle.height > max.height))
        return null;
    return rectangle;
}

export function rectangleWithinArea(rectangle, area, tolerance = 1) {
    if (!rectangle || !area || !Number.isFinite(tolerance) || tolerance < 0 ||
        ![rectangle.x, rectangle.y, rectangle.width, rectangle.height,
            area.x, area.y, area.width, area.height].every(Number.isFinite) ||
        rectangle.width <= 0 || rectangle.height <= 0 || area.width <= 0 || area.height <= 0)
        return false;
    return rectangle.x >= area.x - tolerance && rectangle.y >= area.y - tolerance &&
        rectangle.x + rectangle.width <= area.x + area.width + tolerance &&
        rectangle.y + rectangle.height <= area.y + area.height + tolerance;
}

export function rectanglesApproximatelyEqual(first, second, tolerance = 2) {
    if (!first || !second || !Number.isFinite(tolerance) || tolerance < 0 ||
        ![first.x, first.y, first.width, first.height,
            second.x, second.y, second.width, second.height].every(Number.isFinite))
        return false;
    return Math.abs(first.x - second.x) <= tolerance &&
        Math.abs(first.y - second.y) <= tolerance &&
        Math.abs(first.width - second.width) <= tolerance &&
        Math.abs(first.height - second.height) <= tolerance;
}

export function constrainedPosition(rectangle, area) {
    if (!rectangle || !area ||
        ![rectangle.x, rectangle.y, rectangle.width, rectangle.height,
            area.x, area.y, area.width, area.height].every(Number.isFinite) ||
        rectangle.width <= 0 || rectangle.height <= 0 || area.width <= 0 || area.height <= 0 ||
        rectangle.width > area.width || rectangle.height > area.height)
        return null;
    return {
        x: Math.min(Math.max(rectangle.x, area.x), area.x + area.width - rectangle.width),
        y: Math.min(Math.max(rectangle.y, area.y), area.y + area.height - rectangle.height),
    };
}

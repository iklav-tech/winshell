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

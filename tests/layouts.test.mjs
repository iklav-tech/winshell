import assert from 'node:assert/strict';
import {TEMPLATES, regionToPixels} from '../modules/layoutGeometry.mjs';
assert.equal(TEMPLATES.length, 5);
const ids = TEMPLATES.map(t => t.id);
assert.equal(new Set(ids).size, ids.length);
const area = {x: 1920, y: 25, width: 1920, height: 1000};
for (const template of TEMPLATES) {
    let total = 0;
    for (const region of template.regions) {
        const rect = regionToPixels(area, region);
        assert.ok(rect, `${template.id}: invalid region`);
        assert.ok(rect.x >= area.x && rect.y >= area.y);
        assert.ok(rect.x + rect.width <= area.x + area.width);
        assert.ok(rect.y + rect.height <= area.y + area.height);
        total += region[2] * region[3];
    }
    assert.ok(Math.abs(total - 1) < 1e-8, `${template.id}: should cover screen exactly`);
    // All regions must be disjoint (modulo coordinate rounding).
    for (let i = 0; i < template.regions.length; ++i)
        for (let j = i + 1; j < template.regions.length; ++j) {
            const a = template.regions[i], b = template.regions[j];
            const overlap = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0],b[0])) *
                Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
            assert.ok(overlap < 1e-8, `${template.id}: overlapping regions`);
        }
}
assert.deepEqual(regionToPixels({x: 0,y: 0,width: 1000,height: 800}, [0,0,.5,1]),
    {x: 0,y: 0,width: 500,height: 800});
assert.equal(regionToPixels(area, [-1,0,1,1]), null);
assert.equal(regionToPixels(area, [0,0,0,1]), null);
assert.equal(regionToPixels(null, [0,0,1,1]), null);
console.log('OK: all graphical layout templates and pixel bounds');

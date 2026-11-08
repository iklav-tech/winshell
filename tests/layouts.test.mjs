import assert from 'node:assert/strict';
import {constrainedPosition, rectangleWithinArea, rectanglesApproximatelyEqual,
    sizeConstraintFromResult, snapGeometry, snapTemplateGeometry, TEMPLATES,
    regionToPixels, validateLayoutTemplate,
    validateLayoutTemplates} from '../modules/layoutGeometry.mjs';
assert.equal(TEMPLATES.length, 5);
const ids = TEMPLATES.map(t => t.id);
assert.equal(new Set(ids).size, ids.length);
assert.equal(validateLayoutTemplates(TEMPLATES), true);
assert.equal(Object.isFrozen(TEMPLATES), true);
assert.equal(Object.isFrozen(TEMPLATES[0].regions[0]), true);
const area = {x: 1920, y: 25, width: 1920, height: 1000};
for (const template of TEMPLATES) {
    let total = 0;
    let pixelCoverage = 0;
    assert.equal(validateLayoutTemplate(template), true, `${template.id}: invalid template`);
    for (const region of template.regions) {
        const rect = regionToPixels(area, region);
        assert.ok(rect, `${template.id}: invalid region`);
        assert.ok(rect.x >= area.x && rect.y >= area.y);
        assert.ok(rect.x + rect.width <= area.x + area.width);
        assert.ok(rect.y + rect.height <= area.y + area.height);
        total += region[2] * region[3];
        pixelCoverage += rect.width * rect.height;
    }
    assert.ok(Math.abs(total - 1) < 1e-8, `${template.id}: should cover screen exactly`);
    assert.equal(pixelCoverage, area.width * area.height,
        `${template.id}: rounded pixels should cover work area exactly`);
    // All regions must be disjoint (modulo coordinate rounding).
    for (let i = 0; i < template.regions.length; ++i)
        for (let j = i + 1; j < template.regions.length; ++j) {
            const a = template.regions[i], b = template.regions[j];
            const overlap = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0],b[0])) *
                Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
            assert.ok(overlap < 1e-8, `${template.id}: overlapping regions`);
        }
}
assert.equal(validateLayoutTemplate({id: 'gap', label: 'Gap',
    regions: [[0, 0, .4, 1], [.5, 0, .5, 1]]}), false);
assert.equal(validateLayoutTemplate({id: 'overlap', label: 'Overlap',
    regions: [[0, 0, .6, 1], [.4, 0, .4, 1]]}), false);
assert.equal(validateLayoutTemplate({id: 'outside', label: 'Outside',
    regions: [[0, 0, 1.1, 1]]}), false);
assert.equal(validateLayoutTemplates([TEMPLATES[0], {...TEMPLATES[1], id: TEMPLATES[0].id}]), false);
assert.deepEqual(regionToPixels({x: 0,y: 0,width: 1000,height: 800}, [0,0,.5,1]),
    {x: 0,y: 0,width: 500,height: 800});
assert.equal(regionToPixels(area, [-1,0,1,1]), null);
assert.equal(regionToPixels(area, [0,0,0,1]), null);
assert.equal(regionToPixels(null, [0,0,1,1]), null);
assert.deepEqual(sizeConstraintFromResult([true, 640, 480]), [640, 480]);
assert.deepEqual(sizeConstraintFromResult([false, 640, 480]), [0, 0]);
assert.deepEqual(sizeConstraintFromResult([800, 600]), [800, 600]);
assert.deepEqual(sizeConstraintFromResult([true, -1, 480]), [0, 0]);
assert.deepEqual(sizeConstraintFromResult(null), [0, 0]);
assert.deepEqual(snapGeometry({x: -1920, y: -120, width: 1920, height: 1026},
    [0, 0, .5, 1], {minimum: [640, 480], maximum: [0, 0]}),
{x: -1920, y: -120, width: 960, height: 1026});
assert.equal(snapGeometry(area, [0, 0, 1 / 3, 1], {minimum: [700, 200]}), null);
assert.equal(snapGeometry(area, [0, 0, .5, 1], {maximum: [800, 0]}), null);
assert.equal(snapGeometry(area, [0, 0, .5, 1], {minimum: [-1, 0]}), null);
const thirds = snapTemplateGeometry(TEMPLATES.find(template => template.id === 'thirds'), area,
    {minimum: [700, 200]});
assert.deepEqual(thirds, [null, null, null]);
const offsetHalves = snapTemplateGeometry(TEMPLATES.find(template => template.id === 'halves'),
    {x: -1920, y: -120, width: 1920, height: 1026}, {minimum: [640, 480]});
assert.deepEqual(offsetHalves, [
    {x: -1920, y: -120, width: 960, height: 1026},
    {x: -960, y: -120, width: 960, height: 1026},
]);
assert.equal(snapTemplateGeometry({id: 'bad', label: 'Bad', regions: [[0, 0, .5, 1]]}, area), null);
assert.equal(rectangleWithinArea({x: -1920, y: -120, width: 960, height: 1026},
    {x: -1920, y: -120, width: 1920, height: 1026}), true);
assert.equal(rectangleWithinArea({x: -1921, y: -120, width: 960, height: 1026},
    {x: -1920, y: -120, width: 1920, height: 1026}, 0), false);
assert.equal(rectanglesApproximatelyEqual({x: 0, y: 0, width: 960, height: 1026},
    {x: 1, y: -1, width: 959, height: 1027}), true);
assert.equal(rectanglesApproximatelyEqual({x: 0, y: 0, width: 960, height: 1026},
    {x: 4, y: 0, width: 960, height: 1026}), false);
assert.deepEqual(constrainedPosition({x: -2000, y: -200, width: 960, height: 900},
    {x: -1920, y: -120, width: 1920, height: 1026}), {x: -1920, y: -120});
assert.equal(constrainedPosition({x: 0, y: 0, width: 2000, height: 900},
    {x: 0, y: 0, width: 1920, height: 1026}), null);
console.log('OK: Snap templates, constraints, work-area bounds and negative origins');

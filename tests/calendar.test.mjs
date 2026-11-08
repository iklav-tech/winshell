import assert from 'node:assert/strict';
import {calendarGrid, localeFirstDay, monthLabel, shiftMonth,
    weekdayLabels} from '../modules/calendarModel.mjs';

assert.deepEqual(shiftMonth(2024, 0, -1), {year: 2023, month: 11});
assert.deepEqual(shiftMonth(2024, 11, 1), {year: 2025, month: 0});
assert.equal(shiftMonth(2024, 12, 1), null);

const february = calendarGrid(2024, 1, 1);
assert.equal(february.length, 6);
assert.ok(february.every(week => week.length === 7));
assert.equal(february.flat().filter(day => day.inMonth).length, 29);
assert.deepEqual(february[0][0], {
    year: 2024, month: 0, day: 29, inMonth: false, key: '2024-01-29',
});
assert.equal(february.flat().find(day => day.key === '2024-02-29').inMonth, true);

assert.equal(localeFirstDay('en-US'), 0);
assert.equal(localeFirstDay('en-GB'), 1);
assert.equal(weekdayLabels('en-US', 0)[0].toLowerCase().startsWith('sun'), true);
assert.equal(weekdayLabels('en-GB', 1, 'short')[0].toLowerCase().startsWith('mon'), true);
assert.match(monthLabel(2024, 1, 'pt-BR').toLowerCase(), /fevereiro/);
console.log('OK: calendar navigation, alignment, leap year and locale');

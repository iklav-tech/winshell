const DAYS_PER_WEEK = 7;
const GRID_WEEKS = 6;

function validYearMonth(year, month) {
    return Number.isInteger(year) && Number.isInteger(month) && month >= 0 && month < 12;
}

export function localeFirstDay(locale = undefined) {
    try {
        const firstDay = new Intl.Locale(locale).weekInfo?.firstDay ??
            new Intl.Locale(locale).getWeekInfo?.().firstDay;
        if (Number.isInteger(firstDay)) return firstDay % DAYS_PER_WEEK;
    } catch (_error) {
        // Fall through to the conservative Sunday default.
    }
    return 0;
}

export function shiftMonth(year, month, delta) {
    if (!validYearMonth(year, month) || !Number.isInteger(delta)) return null;
    const date = new Date(Date.UTC(year, month + delta, 1, 12));
    return {year: date.getUTCFullYear(), month: date.getUTCMonth()};
}

export function calendarGrid(year, month, firstDay = 0) {
    if (!validYearMonth(year, month) || !Number.isInteger(firstDay) ||
        firstDay < 0 || firstDay >= DAYS_PER_WEEK) return [];
    const first = new Date(Date.UTC(year, month, 1, 12));
    const offset = (first.getUTCDay() - firstDay + DAYS_PER_WEEK) % DAYS_PER_WEEK;
    const start = new Date(Date.UTC(year, month, 1 - offset, 12));
    return Array.from({length: GRID_WEEKS}, (_unused, week) =>
        Array.from({length: DAYS_PER_WEEK}, (_ignored, day) => {
            const date = new Date(start);
            date.setUTCDate(start.getUTCDate() + week * DAYS_PER_WEEK + day);
            return {
                year: date.getUTCFullYear(),
                month: date.getUTCMonth(),
                day: date.getUTCDate(),
                inMonth: date.getUTCMonth() === month,
                key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`,
            };
        }));
}

export function weekdayLabels(locale = undefined, firstDay = localeFirstDay(locale), width = 'short') {
    const formatter = new Intl.DateTimeFormat(locale, {weekday: width, timeZone: 'UTC'});
    const sunday = new Date(Date.UTC(2024, 0, 7, 12));
    return Array.from({length: DAYS_PER_WEEK}, (_unused, index) => {
        const date = new Date(sunday);
        date.setUTCDate(sunday.getUTCDate() + (firstDay + index) % DAYS_PER_WEEK);
        return formatter.format(date);
    });
}

export function monthLabel(year, month, locale = undefined) {
    if (!validYearMonth(year, month)) return '';
    return new Intl.DateTimeFormat(locale, {
        month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month, 1, 12)));
}

export function sameCalendarDay(one, two) {
    return one?.year === two?.year && one?.month === two?.month && one?.day === two?.day;
}

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {calendarGrid, localeFirstDay, monthLabel, sameCalendarDay,
    shiftMonth, weekdayLabels} from './calendarModel.mjs';

export class WinShellCalendar {
    constructor() {
        const today = new Date();
        this._locale = Intl.DateTimeFormat().resolvedOptions().locale;
        this._firstDay = localeFirstDay(this._locale);
        this._today = {year: today.getFullYear(), month: today.getMonth(), day: today.getDate()};
        this._selected = {...this._today};
        this._view = {year: this._today.year, month: this._today.month};
        this.actor = new St.BoxLayout({vertical: true, style_class: 'winshell-calendar'});
        this._render();
    }

    _navButton(iconName, accessibleName, delta) {
        const button = new St.Button({style_class: 'winshell-calendar-nav', icon_name: iconName,
            can_focus: true, accessible_name: accessibleName});
        button.connect('clicked', () => {
            const next = shiftMonth(this._view.year, this._view.month, delta);
            if (next) { this._view = next; this._render(); }
        });
        return button;
    }

    _render() {
        this.actor.destroy_all_children();
        const header = new St.BoxLayout({style_class: 'winshell-calendar-header'});
        header.add_child(this._navButton('pan-start-symbolic', 'Mês anterior', -1));
        const title = new St.Button({label: monthLabel(this._view.year, this._view.month, this._locale),
            style_class: 'winshell-calendar-month', x_expand: true, can_focus: true});
        title.connect('clicked', () => this.goToday());
        header.add_child(title);
        header.add_child(this._navButton('pan-end-symbolic', 'Próximo mês', 1));
        this.actor.add_child(header);

        const layout = new Clutter.GridLayout({column_homogeneous: true, row_homogeneous: true});
        const grid = new St.Widget({layout_manager: layout, style_class: 'winshell-calendar-grid',
            x_expand: true});
        for (const [column, label] of weekdayLabels(this._locale, this._firstDay, 'narrow').entries())
            layout.attach(new St.Label({text: label, style_class: 'winshell-calendar-weekday',
                x_align: Clutter.ActorAlign.CENTER}), column, 0, 1, 1);

        const weeks = calendarGrid(this._view.year, this._view.month, this._firstDay);
        for (const [weekIndex, week] of weeks.entries()) {
            for (const [column, date] of week.entries()) {
                const classes = ['winshell-calendar-day'];
                if (!date.inMonth) classes.push('winshell-calendar-outside');
                if (sameCalendarDay(date, this._today)) classes.push('winshell-calendar-today');
                if (sameCalendarDay(date, this._selected)) classes.push('winshell-calendar-selected');
                const button = new St.Button({label: String(date.day), style_class: classes.join(' '),
                    can_focus: true, accessible_name: new Intl.DateTimeFormat(this._locale, {
                        dateStyle: 'full', timeZone: 'UTC',
                    }).format(new Date(Date.UTC(date.year, date.month, date.day, 12)))});
                button.connect('clicked', () => {
                    this._selected = {year: date.year, month: date.month, day: date.day};
                    if (!date.inMonth) this._view = {year: date.year, month: date.month};
                    this._render();
                });
                layout.attach(button, column, weekIndex + 1, 1, 1);
            }
        }
        this.actor.add_child(grid);
        const selectedText = new Intl.DateTimeFormat(this._locale, {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
        }).format(new Date(Date.UTC(this._selected.year, this._selected.month, this._selected.day, 12)));
        this.actor.add_child(new St.Label({text: selectedText, style_class: 'winshell-calendar-selected-label'}));
    }

    goToday() {
        const now = new Date();
        this._today = {year: now.getFullYear(), month: now.getMonth(), day: now.getDate()};
        this._selected = {...this._today};
        this._view = {year: this._today.year, month: this._today.month};
        this._render();
    }

    destroy() { this.actor.destroy(); }
}

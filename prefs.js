import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import {addAppearancePage} from './modules/appearance/preferences.js';

export default class WinShellPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage({title: 'WinShell', icon_name: 'preferences-desktop-symbolic'});
        const group = new Adw.PreferencesGroup({title: 'Barra de tarefas', description: 'Configurações aplicadas imediatamente'});
        page.add(group);
        for (const [key, title, subtitle] of [
            ['center-icons', 'Centralizar ícones', 'Estilo Windows 11'],
            ['show-search', 'Mostrar pesquisa', 'Atalho de pesquisa ao lado do Iniciar'],
            ['show-clock', 'Mostrar relógio', 'Data e hora na área direita'],
            ['show-notifications', 'Mostrar notificações', 'Centro WinShell com agrupamento e ações'],
            ['show-quick-settings', 'Mostrar configurações rápidas', 'Wi-Fi, Bluetooth, áudio, brilho, bateria e Não Perturbe'],
            ['multi-monitor', 'Barra em todos os monitores', 'Mostra uma barra em cada monitor conectado'],
            ['snap-layouts', 'Snap Layouts gráficos', 'Organize janelas em modelos visuais pelo menu contextual e pré-visualizações'],
            ['window-previews', 'Pré-visualização de janelas', 'Miniaturas e ações ao passar o mouse'],
            ['show-activities-panel', 'Manter painel superior GNOME', 'Preserva o painel nativo sem interferir em seus controles'],
        ]) {
            const row = new Adw.SwitchRow({title, subtitle});
            settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
            group.add(row);
        }
        const height = new Adw.SpinRow({title: 'Altura da barra (px)', adjustment: new Gtk.Adjustment({lower: 40, upper: 88, step_increment: 2, page_increment: 8, value: settings.get_int('panel-height')})});
        settings.bind('panel-height', height, 'value', Gio.SettingsBindFlags.DEFAULT);
        group.add(height);
        const conflict = new Adw.ComboRow({
            title: 'Tratamento de conflitos da barra de tarefas',
            subtitle: 'Coordena Ubuntu Dock, Dash to Dock e Dash to Panel',
            model: Gtk.StringList.new(['Automático (recomendado)', 'Apenas avisar', 'Desativado']),
        });
        const conflictValues = ['automatic', 'warn-only', 'disabled'];
        const updateConflictRow = () => {
            const index = conflictValues.indexOf(settings.get_string('taskbar-conflict-handling'));
            conflict.selected = index >= 0 ? index : 1;
        };
        updateConflictRow();
        conflict.connect('notify::selected', () => {
            const value = conflictValues[conflict.selected];
            if (value && value !== settings.get_string('taskbar-conflict-handling'))
                settings.set_string('taskbar-conflict-handling', value);
        });
        settings.connectObject('changed::taskbar-conflict-handling', updateConflictRow, window);
        group.add(conflict);
        const apps = new Adw.PreferencesGroup({title: 'Aplicativos fixados', description: 'IDs .desktop separados por vírgula. Ex.: firefox.desktop,org.gnome.Nautilus.desktop'});
        const row = new Adw.EntryRow({title: 'Aplicativos'});
        row.text = settings.get_strv('pinned-apps').join(', ');
        row.connect('apply', () => settings.set_strv('pinned-apps', row.text.split(',').map(x => x.trim()).filter(Boolean)));
        row.show_apply_button = true;
        apps.add(row);
        page.add(apps);
        window.add(page);
        addAppearancePage(window, settings, this.path);
    }
}

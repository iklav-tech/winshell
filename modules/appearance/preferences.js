import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {AppearanceManager} from './manager.js';

const VISUAL_KEYS = ['appearance-mode', 'visual-preset', 'icon-theme', 'wallpaper-selection',
    'custom-wallpaper-uri', 'background-style', 'sync-system-appearance',
    'desktop-icons-enabled', 'desktop-show-home', 'desktop-show-trash',
    'desktop-show-volumes', 'nautilus-integration-enabled'];

function combo(settings, key, title, subtitle, labels, values) {
    const row = new Adw.ComboRow({title, subtitle, model: Gtk.StringList.new(labels)});
    const sync = () => {
        const index = values.indexOf(settings.get_string(key));
        row.selected = index < 0 ? 0 : index;
    };
    sync();
    row.connect('notify::selected', () => {
        const value = values[row.selected];
        if (value && settings.get_string(key) !== value)
            settings.set_string(key, value);
    });
    settings.connectObject(`changed::${key}`, sync, row);
    return row;
}

function message(window, heading, body) {
    const dialog = new Adw.MessageDialog({transient_for: window, heading, body});
    dialog.add_response('close', 'Fechar');
    dialog.present();
}

function confirmExternalChanges(window, manager, command) {
    const dialog = new Adw.MessageDialog({transient_for: window,
        heading: 'Alterações externas detectadas',
        body: 'Algumas configurações foram alteradas fora do WinShell. Continuar substituirá somente as configurações registradas no backup.'});
    dialog.add_response('cancel', 'Cancelar');
    dialog.add_response('continue', 'Continuar');
    dialog.set_response_appearance('continue', Adw.ResponseAppearance.DESTRUCTIVE);
    dialog.connect('response', (_dialog, response) => {
        if (response === 'continue')
            manager.run(command, true, (status, payload, error) => message(window,
                status === 0 ? 'Operação concluída' : 'Não foi possível concluir',
                status === 0 ? 'A aparência foi atualizada com backup reversível.' :
                    payload.message ?? error ?? 'Falha desconhecida.'));
    });
    dialog.present();
}

function runAppearance(window, manager, command) {
    manager.run(command, false, (status, payload, error) => {
        if (status === 3) {
            confirmExternalChanges(window, manager, command);
            return;
        }
        message(window, status === 0 ? 'Operação concluída' : 'Não foi possível concluir',
            status === 0 ? (command === 'apply' ?
                'O preset foi aplicado e a configuração anterior permanece disponível para restauração.' :
                'A aparência original foi restaurada de forma segura.') :
                payload.message ?? error ?? 'Verifique as dependências e permissões.');
    });
}

export function addAppearancePage(window, settings, extensionPath) {
    const manager = new AppearanceManager(extensionPath, settings);
    const page = new Adw.PreferencesPage({title: 'Aparência', icon_name: 'preferences-desktop-wallpaper-symbolic'});

    const visual = new Adw.PreferencesGroup({title: 'WinShell Theme',
        description: 'A variante do Shell é imediata. Alterações no GNOME só ocorrem ao clicar em Aplicar.'});
    visual.add(combo(settings, 'appearance-mode', 'Tema', 'Light, Dark ou conforme o sistema',
        ['Seguir o sistema', 'WinShell Light', 'WinShell Dark'], ['follow-system', 'light', 'dark']));
    visual.add(combo(settings, 'visual-preset', 'Preset visual', 'Ajusta transparência e contraste no Shell',
        ['Equilibrado', 'Sutil', 'Alto contraste'], ['balanced', 'subtle', 'high-contrast']));
    const icons = new Adw.EntryRow({title: 'Tema de ícones'});
    icons.text = settings.get_string('icon-theme');
    icons.show_apply_button = true;
    icons.connect('apply', () => settings.set_string('icon-theme', icons.text.trim() || 'WinShell'));
    visual.add(icons);
    const sync = new Adw.SwitchRow({title: 'Sincronizar aparência do GNOME',
        subtitle: 'Ao aplicar, altera também color-scheme e tema GTK do usuário'});
    settings.bind('sync-system-appearance', sync, 'active', Gio.SettingsBindFlags.DEFAULT);
    visual.add(sync);
    page.add(visual);

    const wallpaper = new Adw.PreferencesGroup({title: 'Papel de parede',
        description: 'Originais vetoriais para qualquer resolução e proporção'});
    wallpaper.add(combo(settings, 'wallpaper-selection', 'Seleção', 'Sincronize Light/Dark ou escolha uma imagem',
        ['Sincronizar com o tema', 'Sempre claro', 'Sempre escuro', 'Personalizado'],
        ['synchronized', 'light', 'dark', 'custom']));
    wallpaper.add(combo(settings, 'background-style', 'Posicionamento', 'Opções suportadas pelo GNOME',
        ['Preencher', 'Ajustar', 'Centralizar', 'Abranger monitores', 'Mosaico'],
        ['zoom', 'scaled', 'centered', 'spanned', 'wallpaper']));
    const choose = new Adw.ActionRow({title: 'Imagem personalizada', subtitle: 'Nenhuma imagem selecionada'});
    const chooseButton = new Gtk.Button({label: 'Escolher…', valign: Gtk.Align.CENTER});
    choose.add_suffix(chooseButton);
    chooseButton.connect('clicked', () => {
        const dialog = new Gtk.FileChooserNative({title: 'Escolher papel de parede', transient_for: window,
            action: Gtk.FileChooserAction.OPEN, accept_label: 'Escolher', cancel_label: 'Cancelar'});
        const filter = new Gtk.FileFilter();
        filter.set_name('Imagens');
        filter.add_mime_type('image/*');
        dialog.add_filter(filter);
        dialog.connect('response', (_dialog, response) => {
            if (response === Gtk.ResponseType.ACCEPT) {
                const uri = dialog.get_file().get_uri();
                settings.set_string('custom-wallpaper-uri', uri);
                settings.set_string('wallpaper-selection', 'custom');
                choose.subtitle = uri;
            }
            dialog.destroy();
        });
        dialog.show();
    });
    wallpaper.add(choose);
    const picture = Gtk.Picture.new_for_filename(manager.previewPath());
    picture.content_fit = Gtk.ContentFit.COVER;
    picture.height_request = 180;
    const updatePreview = () => picture.set_filename(manager.previewPath());
    settings.connectObject('changed::wallpaper-selection', updatePreview, window);
    settings.connectObject('changed::custom-wallpaper-uri', updatePreview, window);
    settings.connectObject('changed::appearance-mode', updatePreview, window);
    wallpaper.add(picture);
    page.add(wallpaper);

    const desktopStatus = manager.desktopProviderStatus();
    const desktop = new Adw.PreferencesGroup({title: 'Ícones da área de trabalho',
        description: desktopStatus.label});
    const desktopEnabled = new Adw.SwitchRow({title: 'Integrar com DING',
        subtitle: desktopStatus.available ? 'Usa apenas o schema público do provedor' : 'Recurso indisponível'});
    desktopEnabled.sensitive = desktopStatus.available;
    settings.bind('desktop-icons-enabled', desktopEnabled, 'active', Gio.SettingsBindFlags.DEFAULT);
    desktop.add(desktopEnabled);
    for (const [key, title] of [['desktop-show-home', 'Mostrar pasta pessoal'],
        ['desktop-show-trash', 'Mostrar lixeira'], ['desktop-show-volumes', 'Mostrar volumes montados']]) {
        const row = new Adw.SwitchRow({title});
        row.sensitive = desktopStatus.available;
        settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
        desktop.add(row);
    }
    page.add(desktop);

    const nautilusStatus = manager.nautilusStatus();
    const integrations = new Adw.PreferencesGroup({title: 'Nautilus', description: nautilusStatus.label});
    const nautilus = new Adw.SwitchRow({title: 'Ações WinShell no menu de contexto',
        subtitle: nautilusStatus.available ? 'Reinicie o Nautilus após alterar' : 'Dependência ou plugin ausente'});
    nautilus.sensitive = nautilusStatus.available;
    settings.bind('nautilus-integration-enabled', nautilus, 'active', Gio.SettingsBindFlags.DEFAULT);
    nautilus.connect('notify::active', () => manager.setNautilusEnabled(nautilus.active));
    if (nautilusStatus.available)
        manager.setNautilusEnabled(nautilus.active);
    integrations.add(nautilus);
    page.add(integrations);

    const actions = new Adw.PreferencesGroup({title: 'Aplicar e restaurar',
        description: 'Backup versionado em $XDG_CONFIG_HOME/winshell; alterações externas exigem confirmação'});
    const apply = new Adw.ActionRow({title: 'Aplicar aparência WinShell'});
    const applyButton = new Gtk.Button({label: 'Aplicar', valign: Gtk.Align.CENTER,
        css_classes: ['suggested-action']});
    applyButton.connect('clicked', () => runAppearance(window, manager, 'apply'));
    apply.add_suffix(applyButton);
    actions.add(apply);
    const restore = new Adw.ActionRow({title: 'Restaurar aparência original'});
    const restoreButton = new Gtk.Button({label: 'Restaurar', valign: Gtk.Align.CENTER});
    restoreButton.connect('clicked', () => runAppearance(window, manager, 'restore'));
    restore.add_suffix(restoreButton);
    actions.add(restore);
    const reset = new Adw.ActionRow({title: 'Redefinir preferências visuais do WinShell',
        subtitle: 'Não modifica a aparência global até Aplicar'});
    const resetButton = new Gtk.Button({label: 'Redefinir', valign: Gtk.Align.CENTER});
    resetButton.connect('clicked', () => VISUAL_KEYS.forEach(key => settings.reset(key)));
    reset.add_suffix(resetButton);
    actions.add(reset);
    page.add(actions);
    window.add(page);
}

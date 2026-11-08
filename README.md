# WinShell for GNOME v0.3.0

Extensão GNOME Shell 46 para Ubuntu 24.04, com uma interface inspirada no Windows 11.
Projeto experimental, sem vínculo com Microsoft ou GNOME Foundation.

## Funcionalidades herdadas da v0.2.0

- Painel de configurações rápidas no canto inferior: alternar modo escuro e Não Perturbe; atalhos de Rede/Wi-Fi, Bluetooth, Som e Configurações.
- Atalhos para o centro nativo de notificações/calendário e para o menu nativo de controles completos do GNOME.
- Quando a barra superior está oculta, ela aparece temporariamente para apresentar o menu nativo do GNOME e depois é ocultada novamente.
- Menu contextual com botão direito nos aplicativos: fixar/desafixar, abrir nova janela, fechar as janelas abertas.
- Menu contextual na área vazia da barra: centralizar ícones, mostrar pesquisa, mostrar barra GNOME e abrir Extensões.
- Menu Iniciar renovado, com aplicativos favoritos em primeiro lugar; pesquisa por nome, descrição, comando e palavras-chave dos arquivos .desktop; Enter ativa o primeiro resultado.
- Atalhos para Configurações e Arquivos no Menu Iniciar.
- Novas opções de preferências para os botões de notificações e configurações rápidas.

## Resumo da v0.3.0

- **Snap Layouts:** nove regiões de posicionamento via menu contextual de aplicativos em execução.
- **Pré-visualizações:** ao posicionar o cursor sobre aplicativos abertos, exibe janelas disponíveis e ações de gerenciamento.
- **Multimonitor:** opção de barra por monitor, desabilitada por padrão.
- **Centro de notificações:** painel próprio de leitura das notificações expostas pelo GNOME, com acesso ao histórico nativo.
- **Novas preferências:** controles das pré-visualizações e da barra em vários monitores.

## Limitações conhecidas

- O novo painel exibe notificações disponíveis via fontes do GNOME, mas não substitui seu histórico completo. Os controles avançados de som e rede continuam nos **menus originais** do GNOME.
- Busca limitada aos aplicativos instalados (metadados de .desktop); **não busca documentos, Internet ou conteúdo de arquivos**.
- Os atalhos Wi-Fi/Bluetooth dependem dos arquivos .desktop disponibilizados pelo GNOME Control Center na distribuição. Quando não existirem, aparecerá uma mensagem de aplicativo não encontrado.
- A barra aparece no monitor principal por padrão; a exibição nos demais monitores é opcional. A substituição do Nautilus ainda não foi implementada.
- Sem teste em sessão real nesta entrega; testes de sintaxe/estrutura não substituem teste no GNOME 46.
- Se o painel superior GNOME estiver oculto, usar seus menus nativos provoca o aparecimento temporário do painel superior.

## Dependências

Ubuntu 24.04 em GNOME Shell **46**, GNOME Extensions, glib-compile-schemas, GJS; Node.js é opcional para checagem estática.

```bash
sudo apt update
sudo apt install gnome-shell-extensions gnome-shell-extension-prefs \
  gnome-tweaks gjs libglib2.0-dev-bin unzip
```

## Instalar

```bash
unzip winshell-for-gnome-v0.3.0.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
```

**IMPORTANTE:** saia da sessão GNOME e entre novamente para o Shell reconhecer a extensão (Wayland). Então:

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

Para atualizar uma extensão já habilitada, desative-a antes de instalar, depois encerre e reabra a sessão:

```bash
gnome-extensions disable winshell@iklav-tech
./scripts/install.sh
# Terminar a sessão e entrar de novo
gnome-extensions enable winshell@iklav-tech
```

## Testes manuais

1. Verifique a barra inferior, Menu Iniciar e pesquisa de nomes, descrições e palavras-chave.
2. Execute um aplicativo e teste foco/minimização.
3. Clique com o botão **direito no ícone** de um aplicativo. Fixe/desafixe e confirme que o estado persiste após reiniciar a extensão.
4. Clique com botão **direito no espaço vazio** da barra e altere o alinhamento.
5. Abra Configurações rápidas; alterne Tema escuro e Não Perturbe. Confirme em Configurações do GNOME.
6. Abra o menu de notificações/calendário pelo ícone e pelo relógio.
7. Nas preferências, oculte o painel GNOME; abra novamente os controles nativos e verifique a restauração do estado ao fechar.
8. Desative a extensão e confirme a restauração da barra superior.

## Diagnóstico e reversão

```bash
./scripts/doctor.sh
gnome-extensions disable winshell@iklav-tech
./scripts/uninstall.sh
```

Se a interface parar de responder, use `Ctrl+Alt+F3`, autentique-se e execute:

```bash
mv ~/.local/share/gnome-shell/extensions/winshell@iklav-tech \
   ~/.local/share/gnome-shell/extensions/winshell@iklav-tech.disabled
```

Então encerre a sessão gráfica ou reinicie o computador. Se necessário, restaure a extensão mais tarde.

## Estrutura

- `modules/snapLayouts.js`: opções de organização e redimensionamento de janelas.
- `modules/windowPreview.js`: pré-visualizações de janelas.
- `modules/multiMonitor.js`: criação e atualização das barras por monitor.
- `modules/notificationCenter.js`: painel próprio para notificações disponíveis.

- `extension.js`: ativação e restauração da interface nativa.
- `modules/taskbar.js`: barra, aplicativos, relógio e botões.
- `modules/startMenu.js`: menu e pesquisa.
- `modules/popup.js`: infraestrutura de popups.
- `modules/quickSettings.js`: controles rápidos próprios.
- `modules/systemActions.js`: integração com configurações do sistema.
- `modules/contextMenu.js`: opções de clique direito.
- `prefs.js`: preferências GTK4/Libadwaita.
- `schemas/`: configurações GSettings.
- `scripts/`: instalação, diagnóstico e desinstalação.
- `tests/`: validações estáticas.

## Licença

MIT. Consulte `LICENSE`.

## Novidades da v0.3.0 (versão de desenvolvimento)

- **Snap Layouts:** right-click an application icon, choose *Organizar janela*, and select one of nine tiling regions. A snap action requires a movable, resizable, non-fullscreen window; compositor/client constraints may limit the resulting frame, particularly on Wayland.
- **Window previews:** hover over an application icon for roughly 450 ms to open a flyout showing currently known windows, window activation, close action and Snap Layout shortcut. Previews clone the compositor's current window actor; they are not a separate screen-capture API, so unmapped/minimized windows may lack a live image.
- **Multi-monitor taskbars:** enable *Barra em todos os monitores* in the preferences to show one taskbar per monitor. It defaults to disabled, allowing compatibility testing before turning it on. Each taskbar currently lists the same pinned/running apps; per-monitor filtering is not included.
- **Notification center:** the notification button opens a WinShell flyout with a best-effort, read-only list of notifications currently exposed by GNOME message sources. Its Calendar button opens GNOME's authoritative native notifications/calendar panel. This is **not** a full replacement for GNOME's notification history or service.

### Atualização a partir da v0.2.0

```bash
# Back up settings if desired: dconf dump /org/gnome/shell/extensions/winshell/ > winshell-settings.ini
gnome-extensions disable winshell@iklav-tech
unzip winshell-for-gnome-v0.3.0.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
# On Wayland, log out and log back in before enabling a new extension version.
gnome-extensions enable winshell@iklav-tech
```

### Verificação dos novos recursos

1. Check `gnome-shell --version` shows GNOME 46.
2. Launch two normal, resizable application windows; right-click their taskbar icons and apply left/right Snap Layouts. Verify both windows remain usable.
3. Hover over a running app with one or more windows; check title, activation, close and arrangement actions.
4. Enable *Barra em todos os monitores*, add/remove a monitor and verify taskbars are properly recreated. Switch this setting off if you encounter GNOME Shell conflicts.
5. Open the notification icon and verify the panel opens even without any notifications; use *Calendário* to reach native GNOME history.
6. Disable/enable the extension and confirm the original GNOME top panel returns with no orphan WinShell actors.

**Validação:** as verificações de sintaxe e estrutura não substituem testes no GNOME Shell. Esta versão **não foi testada em uma sessão GNOME 46 / Wayland real** durante a geração. Recomenda-se publicar como *Pre-release* até homologação.

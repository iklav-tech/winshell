# Módulo implantável: WinShell

## Responsabilidade

Extensão GNOME Shell 46 que adiciona barra, Start, Snap Layouts, previews, Quick Settings, calendário, notificações, menus de app/janela, multi-monitor e variante visual Light/Dark. Não instala daemon e não substitui serviços do GNOME.

## Entradas

- Lifecycle `enable()/disable()`.
- Vinte e cinco chaves do schema: treze legadas e doze preferências visuais.
- Apps e janelas do Shell/Mutter.
- Sinais de monitor, foco, apps e MessageTray.
- NM, gnome-bluetooth/rfkill, GVC, Settings Daemon, UPower e GSettings desktop.
- Eventos de mouse/teclado sobre atores `St`.

## Saídas/efeitos

- Atores no chrome do Shell; a barra cria strut inferior e barras/popups removem o registro explicitamente no destroy.
- `shellCompat.js` concentra imports e singletons JavaScript específicos do GNOME Shell 46; `popupGeometry.mjs` mantém seleção/limites de monitor testáveis fora do GJS.
- Ativação/abertura de apps e ações `.desktop`.
- Foco, minimizar, maximizar, fechar, mover/redimensionar janelas.
- Mudanças de Wi‑Fi/Bluetooth/áudio/brilho/Não Perturbe/tema solicitadas aos serviços.
- Ativação e descarte de notificações pela API do Shell.
- O runtime do Shell escreve apenas em GSettings; apply/restore global ocorre no helper separado iniciado pelas preferências.
- Alteração reversível do estado de docks conhecidos pela API pública do gerenciador de extensões.

## Erros/fallbacks

Falha geral de enable gera log, cleanup e relançamento. Serviços/hardware ausentes produzem estados indisponíveis e logs locais. Redes novas e configuração avançada abrem GNOME Settings. Snap informa quando o compositor rejeita a operação.

## Lifecycle

`TaskbarManager` compartilha um `SystemControls`, cria/destrói uma barra por índice de monitor em mudanças de topologia e faz rollback de construção. `TaskbarConflictManager` remove seu idle/sinais e restaura somente UUIDs registrados. Popups desconectam stage; controles removem sinais/idles; notificações removem observadores; preview remove timer; extensão restaura o painel superior.

`ShellAppearanceController` remove todas as classes que adicionou no disable. Nautilus e o helper de aparência não são carregados no processo GNOME Shell.

## Testes

`tests/check.sh` cobre metadata/docs, imports, sintaxe, schema, Bash e executa:

- `calendar.test.mjs`;
- `notifications.test.mjs`;
- `context-menu.test.mjs`;
- `quick-settings.test.mjs`;
- `layouts.test.mjs`;
- `taskbar-conflicts.test.mjs`;
- `taskbar-geometry.test.mjs`.
- `appearance.test.mjs`;
- `appearance-backup.test.mjs`;
- `install.test.mjs`.

Testes gráficos e D-Bus reais permanecem manuais.


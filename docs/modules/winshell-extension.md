# Módulo implantável: WinShell

## Responsabilidade

Extensão GNOME Shell 46 que adiciona barra, Start, Snap Layouts, previews, Quick Settings, calendário, notificações, menus de app/janela e multi-monitor. Não instala daemon e não substitui serviços do GNOME.

## Entradas

- Lifecycle `enable()/disable()`.
- Onze chaves do schema da extensão.
- Apps e janelas do Shell/Mutter.
- Sinais de monitor, foco, apps e MessageTray.
- NM, gnome-bluetooth/rfkill, GVC, Settings Daemon, UPower e GSettings desktop.
- Eventos de mouse/teclado sobre atores `St`.

## Saídas/efeitos

- Atores no chrome do Shell; a barra cria strut inferior.
- Ativação/abertura de apps e ações `.desktop`.
- Foco, minimizar, maximizar, fechar, mover/redimensionar janelas.
- Mudanças de Wi‑Fi/Bluetooth/áudio/brilho/Não Perturbe/tema solicitadas aos serviços.
- Ativação e descarte de notificações pela API do Shell.
- Escrita apenas em GSettings; nenhum histórico/credencial próprio.

## Erros/fallbacks

Falha geral de enable gera log, cleanup e relançamento. Serviços/hardware ausentes produzem estados indisponíveis e logs locais. Redes novas e configuração avançada abrem GNOME Settings. Snap informa quando o compositor rejeita a operação.

## Lifecycle

`TaskbarManager` compartilha um `SystemControls`, cria/destrói barras em mudanças de monitor e faz rollback de construção. Popups desconectam stage; controles removem sinais/idles; notificações removem observadores; preview remove timer; extensão restaura o painel superior.

## Testes

`tests/check.sh` cobre metadata/docs, imports, sintaxe, schema, Bash e executa:

- `calendar.test.mjs`;
- `notifications.test.mjs`;
- `context-menu.test.mjs`;
- `quick-settings.test.mjs`;
- `layouts.test.mjs`.

Testes gráficos e D-Bus reais permanecem manuais.


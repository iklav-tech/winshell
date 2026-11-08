# Fluxos e casos de uso

## UC-01 — Habilitar/desabilitar

O Shell chama `enable()`; a extensão obtém GSettings, cria Start, gerenciador, controles compartilhados, barras e gerenciador de conflitos. Falha dispara cleanup e relança o erro. No `disable()` real, sinais, timers, atores e serviços são liberados, docks gerenciados são restaurados e o painel superior recupera a visibilidade anterior. No rebase transitório do ExtensionManager, o registro é preservado até o novo `enable()`.

## UC-02 — Pesquisar/abrir app

Start consulta `Shell.AppSystem`, filtra metadados e ativa o item clicado ou o primeiro resultado com Enter. Sem resultado, mostra estado vazio.

## UC-03 — Fixar/desafixar

O menu contextual altera `pinned-apps`; o sinal GSettings renderiza novamente as barras.

## UC-04 — Operar janelas

O menu lista até oito janelas para ativação. Para a janela selecionada, consulta `can_minimize`, `can_maximize`, `can_close`, flags e fullscreen antes de exibir minimizar/restaurar, maximizar/restaurar, fechar e Snap. “Fechar todas” atua apenas nas janelas fecháveis.

## UC-05 — Aplicar Snap

O painel valida a janela/região, converte a work area, desmaximiza, move/redimensiona e ativa. Falhas são registradas e informadas ao usuário.

## UC-06 — Controlar Wi‑Fi

Quick Settings observa `NM.Client`, mostra adaptador/conexão/access points e solicita varredura assíncrona ao abrir. O toggle escreve `wireless_enabled`. Um item conhecido chama `activate_connection_async`; rede nova abre o painel Wi‑Fi.

## UC-07 — Controlar Bluetooth

O toggle usa o proxy rfkill e o adapter do gnome-bluetooth. Dispositivos pareados/confiáveis chamam `connect_service` de forma assíncrona. Bloqueio físico torna a ação indisponível.

## UC-08 — Áudio, brilho e bateria

GVC fornece sink, volume, mudo e saídas. O proxy Screen recebe brilho percentual quando disponível. UPower fornece presença, percentual e estado de carga. Sinais externos reconstroem a projeção.

## UC-09 — Calendário

Clique no relógio/sino abre o centro WinShell. O calendário calcula 42 células, respeita primeiro dia da semana/locale, navega meses/anos, seleciona dias e destaca hoje. `PopupSurface` restringe posição/tamanho ao monitor, foca o primeiro controle interativo e devolve o foco ao fechar.

## UC-10 — Notificações

O centro acompanha sources e notification-added/removed/notify/destroy. Agrupa e ordena, ativa a notificação ou uma action, descarta individualmente e limpa itens ativos. Não Perturbe altera `show-banners`, mas não apaga itens.

## UC-11 — Preferências

GTK/Libadwaita expõe preferências de taskbar e uma página Aparência. Mudanças do tema do Shell são imediatas; configurações globais só são enviadas ao helper assíncrono por Aplicar.

## UC-12 — Instalação/diagnóstico

`install.sh` valida GNOME 46 e `glib-compile-schemas`, copia o artefato e compila o schema. `doctor.sh` relata ferramentas, sessão, extensão e logs; não corrige estado.

## UC-13 — Resolver conflito de barra

Após o enable terminar, um idle consulta os UUIDs conhecidos no ExtensionManager. Automatic registra e desativa os candidatos ativos/mutáveis; Warn Only notifica sem mudar estado; Disabled não age. Sinais de estado reavaliam uma reativação manual sem chamadas recursivas. Troca de política, disable ou uninstall normal restaura os UUIDs registrados.

## UC-14 — Aplicar e restaurar aparência

Preferências resolvem wallpapers instalados, iniciam `winshell-appearance` sem bloquear a UI e apresentam o resultado. Apply captura valores ainda sem original, detecta divergências, altera somente chaves disponíveis e atualiza `applied`. Restore reverte somente `changed`; divergência exige confirmação e repetição com `--force`.

## UC-15 — Desktop e Nautilus

A página habilita controles DING somente quando schema e extensão compatíveis existem. O helper aplica visibilidade de Home/Trash/volumes. O plugin Nautilus, instalado opcionalmente, verifica o flag do usuário e abre as preferências pela API pública de subprocesso; ícones vêm do tema padrão selecionado.

## Pendências

- TODO: executar UC-01, UC-04 a UC-10 e UC-13 em GNOME Shell 46/Wayland.
- TODO: validar recuperação de falha parcial de cópia/compilação no instalador.

# Regras de negócio

## Regras confirmadas

- **RN-01 — alvo de instalação:** `scripts/install.sh` aceita somente GNOME Shell major 46; testes puros não dependem da sessão gráfica.
- **RN-02 — barras por monitor:** `multi-monitor=false` cria somente a barra do monitor primário; `true` cria uma por monitor (`modules/multiMonitor.js`).
- **RN-03 — unicidade de apps:** fixados vêm antes dos em execução e cada ID aparece uma vez (`modules/taskbar.js::_renderApps`).
- **RN-04 — clique no app:** minimiza a janela focada do app; nos demais estados ativa/inicia o app.
- **RN-05 — pesquisa:** nome, descrição, executável e keywords são pesquisados; a UI limita a 100 resultados (`modules/startMenu.js`).
- **RN-06 — Enter:** ativa o primeiro resultado da pesquisa, quando houver.
- **RN-07 — fixação:** desafixar remove o ID; fixar anexa um ID ausente a `pinned-apps`.
- **RN-08 — Snap:** exige janela movível, redimensionável e não fullscreen.
- **RN-09 — região:** `regionToPixels` aceita somente coordenadas normalizadas finitas, positivas e internas à unidade.
- **RN-10 — work area:** Snap usa a área útil do monitor da janela, valida limites mínimo/máximo do cliente e verifica o frame resultante do compositor.
- **RN-11 — preview:** espera 450 ms e mostra no máximo doze janelas; hover não toma foco, Down Arrow abre o fluxo por teclado e todos os timers são removidos em cancelamento/destroy.
- **RN-12 — notificações:** todos os itens ativos expostos pelas sources são ordenados por timestamp e agrupados por identidade do app/fonte (`notificationModel.mjs`).
- **RN-13 — painel nativo:** `show-activities-panel` controla apenas a visibilidade do painel superior; o estado anterior é restaurado no disable. WinShell não desativa o calendário nativo.
- **RN-14 — Wi‑Fi seguro:** a extensão conecta diretamente somente perfis conhecidos válidos para o access point; credencial nova/802.1x fica no GNOME Settings.
- **RN-15 — capacidade real:** controles e ações de janela ausentes, bloqueados por hardware ou não suportados não ficam acionáveis.
- **RN-16 — notificações autoritativas:** WinShell não persiste cópia; ativação e descarte chamam a API da notificação do Shell.
- **RN-17 — sincronização externa:** serviços, GSettings, fontes/notificações e janelas emitem sinais que atualizam a projeção WinShell.
- **RN-18 — versão:** release v0.5.5 usa `metadata.version=12` e `version-name=0.5.5`.
- **RN-19 — consentimento visual:** nenhuma aparência global é alterada antes de Aplicar; sincronização de color scheme/GTK requer opção explícita.
- **RN-20 — backup:** o primeiro valor observado de cada chave alterada é preservado no backup v1 e não é substituído por reaplicações.
- **RN-21 — conflito externo:** valores atuais diferentes do original e do último aplicado interrompem apply/restore sem confirmação forçada.
- **RN-22 — integrações:** DING e Nautilus são opcionais, detectados e nunca substituídos/reimplementados dentro do Shell.
- **RN-23 — assets:** ícones e wallpapers distribuídos são originais CC0; fallbacks pertencem aos temas herdados.
- **RN-24 — capacidade de notificação:** abrir, dispensar, executar ações e
  limpar só ficam interativos quando o objeto do Shell expõe o callback real;
  ausência da API de sources é mostrada como indisponibilidade, não lista vazia.
- **RN-19 — conflito automático:** somente Ubuntu Dock, Dash to Dock e Dash to Panel ativos e mutáveis são desativados pela API pública do Shell.
- **RN-20 — restauração:** somente UUIDs que o WinShell registrou em `managed-taskbar-extensions` são reabilitados em disable real ou saída do modo Automático.
- **RN-21 — fallback seguro:** Warn Only apenas notifica; Disabled não detecta nem altera; extensão bloqueada por política administrativa recebe aviso em vez de manipulação de atores.
- **RN-22 — chrome:** cada barra usa `addChrome` com strut e tracking de fullscreen, ficando abaixo de janelas e diálogos do sistema; barras e popups chamam `removeChrome` no destroy.
- **RN-23 — geometria:** a barra ocupa a largura e borda inferior lógicas do monitor correspondente; origens não zero/negativas são preservadas e cada índice recebe no máximo uma barra.
- **RN-25 — resultado Snap:** se restrições do cliente deslocarem o frame para fora da work area, uma correção de posição é tentada somente quando o frame cabe; caso contrário a operação é informada como incompatível.
- **RN-26 — janela minimizada:** preview usa fallback explícito, identifica o estado e chama `unminimize()` antes de ativar ou aplicar Snap.
- **RN-27 — fechar em preview:** a ação só existe quando `Meta.Window.can_close()` retorna verdadeiro.
- **RN-28 — autoridade de notificações:** hotplug/rebuild pode recriar a projeção visual, mas não cria armazenamento ou infraestrutura de notificação paralela ao MessageTray.

## Hipóteses abertas

- **H-01:** decidir se a ordem de fixados deve ser reordenável graficamente.
- **H-02:** definir comportamento durante o estado transitório de zero monitores.
- **H-03:** decidir se a tolerância `1.000001` da geometria é contrato público.
- **H-04:** resolvida na v0.4.1 — recência é timestamp global decrescente.
- **H-05:** a ação “Fechar todas” permanece imediata; cada aplicativo ainda pode interceptar `delete()` para confirmar trabalho não salvo.
- **H-06:** confirmar em GNOME 46 real quais notificações residentes são recriadas após descarte.
- **H-07:** validar se todas as combinações PipeWire/PulseAudio expõem saídas suficientes via GVC.

## Pendências

- TODO: validar RN-02, RN-04, RN-10, RN-11, RN-13 a RN-17 e RN-19 a RN-28 numa sessão GNOME 46/Wayland.
- TODO: reavaliar H-02, H-05, H-06 e H-07 após o checklist manual.

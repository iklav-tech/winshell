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
- **RN-10 — work area:** Snap usa a área útil do monitor da janela e respeita a decisão do compositor.
- **RN-11 — preview:** espera 450 ms e mostra no máximo doze janelas; o timer é removido em cancelamento/destroy.
- **RN-12 — notificações:** todos os itens ativos expostos pelas sources são ordenados por timestamp e agrupados por identidade do app/fonte (`notificationModel.mjs`).
- **RN-13 — painel nativo:** `show-activities-panel` controla apenas a visibilidade do painel superior; o estado anterior é restaurado no disable. WinShell não desativa o calendário nativo.
- **RN-14 — Wi‑Fi seguro:** a extensão conecta diretamente somente perfis conhecidos válidos para o access point; credencial nova/802.1x fica no GNOME Settings.
- **RN-15 — capacidade real:** controles e ações de janela ausentes, bloqueados por hardware ou não suportados não ficam acionáveis.
- **RN-16 — notificações autoritativas:** WinShell não persiste cópia; ativação e descarte chamam a API da notificação do Shell.
- **RN-17 — sincronização externa:** serviços, GSettings, fontes/notificações e janelas emitem sinais que atualizam a projeção WinShell.
- **RN-18 — versão:** release v0.4.1 usa `metadata.version=5` e `version-name=0.4.1`.

## Hipóteses abertas

- **H-01:** decidir se a ordem de fixados deve ser reordenável graficamente.
- **H-02:** definir comportamento durante o estado transitório de zero monitores.
- **H-03:** decidir se a tolerância `1.000001` da geometria é contrato público.
- **H-04:** resolvida na v0.4.1 — recência é timestamp global decrescente.
- **H-05:** a ação “Fechar todas” permanece imediata; cada aplicativo ainda pode interceptar `delete()` para confirmar trabalho não salvo.
- **H-06:** confirmar em GNOME 46 real quais notificações residentes são recriadas após descarte.
- **H-07:** validar se todas as combinações PipeWire/PulseAudio expõem saídas suficientes via GVC.

## Pendências

- TODO: validar RN-02, RN-04, RN-13 a RN-17 numa sessão GNOME 46/Wayland.
- TODO: reavaliar H-02, H-05, H-06 e H-07 após o checklist manual.

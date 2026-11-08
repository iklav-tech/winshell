# Riscos técnicos

| ID | Severidade | Risco e mitigação atual |
|---|---|---|
| R-01 | alta | Sem teste de integração gráfico; suíte atual é estática/unitária e há checklist manual |
| R-02 | alta | APIs JS do Shell/GVC/MessageTray são específicas do GNOME 46; metadata limita a versão |
| R-03 | média | Instalação não é transacional; falha depois da cópia pode deixar artefato parcial |
| R-04 | média | Uninstall remove recursivamente o destino; usuário deve conferir o caminho |
| R-05 | baixa | Validação Snap existe na UI e executor; manter contratos alinhados |
| R-06 | média | Sources podem omitir app/icon/action/timestamp; UI usa fallbacks sem inventar histórico |
| R-07 | média | Busca do Start filtra/ordena tudo por tecla; catálogos grandes podem causar atraso |
| R-08 | média | Barras/flyouts ainda multiplicam por monitor, embora `SystemControls` seja compartilhado |
| R-09 | alta | “Fechar todas” é ação ampla; apps devem interceptar `delete()` para trabalho não salvo |
| R-10 | média | APIs de hardware variam; ausência/permissão precisa ser validada em máquinas reais |
| R-11 | média | Re-render de flyouts por sinais intensos pode afetar interação/desempenho |
| R-12 | média | Notificações residentes podem reaparecer por decisão do aplicativo |

## Melhorias da v0.4.1

- Ordenação cronológica global substituiu a ordem de iteração antiga.
- Adaptadores por monitor foram consolidados num único `SystemControls`.
- Modelos de calendário, notificações, janela e Quick Settings ganharam testes.
- Idles, sinais, callbacks e atores têm caminhos explícitos de cleanup.
- Operações de D-Bus e NetworkManager usadas pela extensão são assíncronas.

## Validação pendente

- TODO: medir sinais/renderizações com Wi‑Fi e Bluetooth movimentados.
- TODO: repetir enable/disable/hotplug e inspecionar logs/atores.
- TODO: exercitar indisponibilidade e permission denied de cada serviço.
- TODO: verificar notificações normais, críticas, residentes e com ações.


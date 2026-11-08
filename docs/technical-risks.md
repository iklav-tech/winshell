# Riscos técnicos

| ID | Severidade | Risco e mitigação atual |
|---|---|---|
| R-01 | alta | Sem teste de integração gráfico; suíte atual é estática/unitária e há checklist manual |
| R-02 | alta | APIs JS do Shell/GVC/MessageTray são específicas do GNOME 46; metadata limita a versão, `shellCompat.js` concentra a superfície instável e notificações detectam sinais/callbacks opcionais |
| R-03 | média | Cópias do pacote principal não são transacionais; dependências e versão do ambiente são validadas antes da primeira escrita, mas falha de I/O durante cópia ainda pode deixar artefato parcial |
| R-04 | média | Uninstall remove recursivamente o destino; usuário deve conferir o caminho |
| R-05 | baixa | Validação Snap existe na UI e executor; manter contratos alinhados |
| R-06 | média | Sources podem omitir app/icon/action/timestamp; UI usa fallbacks sem inventar histórico |
| R-07 | média | Busca do Start filtra/ordena tudo por tecla; catálogos grandes podem causar atraso |
| R-08 | média | Barras/flyouts ainda multiplicam por monitor, embora `SystemControls` seja compartilhado |
| R-09 | alta | “Fechar todas” é ação ampla; apps devem interceptar `delete()` para trabalho não salvo |
| R-10 | média | APIs de hardware variam; ausência/permissão precisa ser validada em máquinas reais |
| R-11 | média | Re-render de flyouts por sinais intensos pode afetar interação/desempenho |
| R-12 | média | Notificações residentes podem reaparecer por decisão do aplicativo |
| R-13 | média | Painéis de terceiros fora dos três UUIDs suportados não podem ser administrados com segurança; política Warn Only e troubleshooting evitam workaround frágil |
| R-14 | média | Queda abrupta do Shell pode adiar a restauração de um dock persistente; registro interno e comandos documentados permitem recuperação |
| R-15 | alta | GTK4/Libadwaita não garante tema global; pacote usa mecanismos suportados e documenta diferenças sem injeção |
| R-16 | média | Remover tema ainda selecionado deixaria fallback inconsistente; uninstall restaura antes de remover e aborta em conflito externo |
| R-17 | média | Schemas/versões DING e Nautilus variam; detecção desabilita controles e integração é processo opcional separado |
| R-18 | média | Assets gerados podem divergir dos tokens; `generate-visual-assets.mjs --check` bloqueia drift na suíte |

## Melhorias da v0.4.1

- Ordenação cronológica global substituiu a ordem de iteração antiga.
- Adaptadores por monitor foram consolidados num único `SystemControls`.
- Modelos de calendário, notificações, janela e Quick Settings ganharam testes.
- Idles, sinais, callbacks e atores têm caminhos explícitos de cleanup.
- Operações de D-Bus e NetworkManager usadas pela extensão são assíncronas.

## Melhorias da v0.4.2

- Conflitos conhecidos usam somente lookup/enable/disable do ExtensionManager e restauração por propriedade registrada.
- Geometria negativa/não zero e unicidade por monitor ganharam funções puras e testes.
- A barra usa a camada de chrome normal, strut inferior e tracking de fullscreen em vez de elevar Z-index.
- O rebase de ordem do GNOME 46 é distinguido do disable real para evitar ciclos e restauração prematura.

## Melhorias da v0.5.0

- Alterações globais exigem Apply, backup atômico e conflito explícito antes de sobrescrever estado externo.
- Temas, ícones, wallpapers, integração desktop/Nautilus e extensão têm limites de processo/diretório claros.
- Instalador e desinstalador idempotentes foram exercitados somente em XDG temporário.
- SVGs, licenças, fallbacks e CSS gerado ganharam validação automatizada.

## Melhorias da v0.5.1

- Imports JavaScript específicos do Shell foram concentrados numa fronteira de compatibilidade e protegidos por teste arquitetural.
- Barras e popups removem chrome explicitamente; construção/rebuild parcial das barras faz rollback.
- Popups ganharam foco inicial/restauração e geometria pura testada para origens negativas, âncoras fracionárias e limites do monitor.
- A evidência da SPEC 00 separa testes automatizados de homologação GNOME 46/Wayland ainda pendente.

## Melhorias da v0.5.2

- A baseline histórica SPEC 0.0.1 ganhou contrato automatizado, evidência dedicada e guia de contribuição.
- Dependências opcionais do Nautilus são validadas antes de qualquer escrita do instalador.
- Metadata, instalador, README, changelog e documentação foram sincronizados sem rebaixar a release atual.

## Melhorias da v0.5.3

- Busca, ordenação de fixados, fixar/desafixar e decisão ativar/minimizar foram
  extraídas para um modelo puro e ganharam contrato da SPEC 0.1.0.
- O Start passou a identificar aplicativos em execução visualmente e por
  acessibilidade.

## Melhorias da v0.5.4

- Conexões com sinais internos do MessageTray, sources e notifications agora
  toleram ausência sem derrubar a construção da barra.
- Abrir, dispensar, ações específicas e limpar são exibidos como interativos
  somente quando o objeto autoritativo fornece o callback correspondente.
- Ausência da enumeração de sources é diferenciada de uma lista realmente vazia.
- A SPEC 0.2.0 ganhou contrato e evidência separados da homologação gráfica.

## Validação pendente

- TODO: medir sinais/renderizações com Wi‑Fi e Bluetooth movimentados.
- TODO: repetir enable/disable/hotplug e inspecionar logs/atores.
- TODO: exercitar indisponibilidade e permission denied de cada serviço.
- TODO: verificar notificações normais, críticas, residentes e com ações.
- TODO: executar os dez cenários de aceitação de docks, restart, multi-monitor, escala, fullscreen e reativação manual.


# WinShell for GNOME v0.4.1

Extensão experimental para **Ubuntu 24.04 LTS / GNOME Shell 46**, inspirada na experiência do Windows 11 sem substituir o GNOME, Mutter, NetworkManager ou os serviços do sistema. O projeto é independente e não tem vínculo com Microsoft ou GNOME Foundation.

> **Status: pré-lançamento.** A v0.4.1 foi validada com testes estáticos e unitários no ambiente de desenvolvimento. A integração visual e o ciclo completo em uma sessão GNOME Shell 46/Wayland ainda exigem validação manual; “compatível” abaixo descreve o alvo do código, não uma homologação concluída.

## Destaques da v0.4.1

- Configurações rápidas reais e sincronizadas: Wi‑Fi via NetworkManager, Bluetooth via gnome-bluetooth/rfkill, volume e saídas via GVC, brilho via GNOME Settings Daemon, bateria via UPower e Não Perturbe via GSettings.
- Calendário mensal próprio, ligado ao relógio e ao centro de notificações, com navegação, seleção, destaque do dia atual, primeira semana/formatação conforme locale e posicionamento restrito ao monitor.
- Menus contextuais com abrir/nova janela, fixar, listar e ativar janelas, minimizar/restaurar, maximizar/restaurar tamanho, fechar, fechar todas, ações do arquivo `.desktop`, Snap Layouts e preferências da barra.
- Centro de notificações sincronizado com `Main.messageTray`, agrupado por aplicativo, com ícone, horário, título, corpo, ações, ativação, descarte individual, limpar tudo, estado vazio e Não Perturbe.
- Modelos puros e testes para calendário, agrupamento de notificações, estado de janelas e normalização de Quick Settings.

Consulte [CHANGELOG.md](CHANGELOG.md) para o histórico completo.

## Funcionalidades

- Barra inferior com alinhamento central/esquerdo, aplicativos fixados/em execução, relógio, pesquisa e opção multi-monitor.
- Menu Iniciar com busca por nome, descrição, executável e palavras-chave dos aplicativos instalados.
- Snap Layouts com cinco grades clicáveis e cálculo por área útil do monitor.
- Pré-visualizações de janelas com ativação, fechamento e acesso aos Snap Layouts.
- Quick Settings WinShell:
  - liga/desliga Wi‑Fi, mostra conexão e redes visíveis e conecta perfis já conhecidos;
  - liga/desliga Bluetooth e conecta/desconecta dispositivos pareados;
  - controla volume, mudo e saída de áudio;
  - controla brilho quando o serviço/tela expõe essa capacidade;
  - mostra porcentagem e carga da bateria;
  - alterna Não Perturbe e tema escuro.
- Calendário WinShell e notificações ativas sem desabilitar o calendário/centro nativo do GNOME.
- Preferências GTK4/Libadwaita persistidas em GSettings.

Todos os adaptadores de serviço usam operações assíncronas ou propriedades/proxies que não bloqueiam a thread da interface. A ausência de hardware, serviço ou permissão desabilita apenas o controle afetado.

## Requisitos

- Ubuntu 24.04 LTS com GNOME Shell 46 (alvo primário Wayland).
- Serviços padrão da distribuição: NetworkManager, GNOME Settings Daemon, UPower, gnome-bluetooth e o mixer GVC do GNOME Shell.
- `glib-compile-schemas` e `gnome-extensions` para instalar.
- Node.js opcional, mas recomendado para executar todos os testes.

```bash
sudo apt update
sudo apt install gnome-shell-extensions gnome-shell-extension-prefs \
  gnome-tweaks gjs libglib2.0-dev-bin unzip
# Opcional para a suíte unitária:
sudo apt install nodejs
```

## Instalação

```bash
unzip winshell-for-gnome-v0.4.1.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
```

Em Wayland, encerre a sessão e entre novamente. Depois:

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

O instalador aceita somente GNOME 46, copia o código para o diretório de extensões do usuário e compila o schema. Ele não usa `sudo`.

## Atualização da v0.4.0

```bash
dconf dump /org/gnome/shell/extensions/winshell/ > winshell-settings-backup.ini
gnome-extensions disable winshell@iklav-tech
unzip winshell-for-gnome-v0.4.1.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
# encerre a sessão e entre novamente no Wayland
gnome-extensions enable winshell@iklav-tech
```

Não há migração de schema na v0.4.1: as preferências da v0.4.0 são preservadas. O `metadata.json` usa versão inteira **5** e `version-name` **0.4.1**.

## Configuração e uso

Abra `gnome-extensions prefs winshell@iklav-tech` ou clique com o botão direito na barra e escolha **Preferências da barra de tarefas**. É possível configurar altura, alinhamento, pesquisa, relógio, notificações, Quick Settings, múltiplos monitores, Snap Layouts, pré-visualizações, painel superior e IDs `.desktop` fixados.

- Clique no relógio ou no sino para abrir calendário/notificações.
- Clique no botão de sistema para Quick Settings. Redes com perfil conhecido podem ser conectadas ali; redes novas ou 802.1x devem ser configuradas em **Todas as redes**.
- Clique com o botão direito num aplicativo para operações de app/janela. As ações indisponíveis para a janela não são exibidas.
- Clique com o botão direito numa área vazia da barra para personalização rápida.

## Testes

```bash
./tests/check.sh

# Casos isolados
node tests/calendar.test.mjs
node tests/notifications.test.mjs
node tests/context-menu.test.mjs
node tests/quick-settings.test.mjs
node tests/layouts.test.mjs

# Diagnóstico do host
./scripts/doctor.sh
```

`check.sh` verifica metadata, versão, README/CHANGELOG, schema e compilação GSettings, imports relativos, contratos básicos de cleanup, sintaxe JavaScript/Bash e todos os testes Node. Isso não substitui teste visual no GNOME Shell.

## Solução de problemas

- Controle ausente ou desabilitado: confirme o hardware e o serviço correspondente; o WinShell não tenta iniciar serviços nem elevar privilégios.
- Wi‑Fi novo solicita senha: use **Todas as redes**. A extensão deliberadamente não coleta nem armazena credenciais.
- Brilho indisponível: comum em desktops e monitores sem suporte do GNOME Settings Daemon.
- Sem histórico antigo de notificações: o centro mostra apenas notificações ativas expostas pelo Shell.
- Erro ao habilitar: execute `./scripts/doctor.sh` e consulte `journalctl --user -b | grep -i winshell`.
- Em Wayland, mudanças de código normalmente exigem encerrar e reabrir a sessão.

Para recuperar uma sessão problemática:

```bash
gnome-extensions disable winshell@iklav-tech
# se necessário em um TTY:
mv ~/.local/share/gnome-shell/extensions/winshell@iklav-tech \
   ~/.local/share/gnome-shell/extensions/winshell@iklav-tech.disabled
```

`scripts/uninstall.sh` desabilita e remove o diretório da extensão; confira o destino antes de executá-lo.

## Limitações conhecidas

- A v0.4.1 ainda não foi homologada visualmente numa sessão descartável Ubuntu 24.04/GNOME 46/Wayland.
- APIs JavaScript do GNOME Shell, `Main.messageTray` e GVC são específicas da versão alvo; uma futura versão do Shell pode exigir adaptação.
- O centro respeita a fonte autoritativa do GNOME: não cria armazenamento próprio e só mostra/descarta notificações ainda ativas.
- O botão **Limpar tudo** chama o descarte suportado de cada notificação; aplicativos podem recriar notificações residentes.
- Notificações são agrupadas quando a fonte fornece identidade de aplicativo; caso contrário, usam o título da fonte.
- Somente redes Wi‑Fi conhecidas são conectadas diretamente. Autenticação nova, portal cativo e 802.1x ficam nas Configurações do GNOME.
- A lista Bluetooth contém dispositivos pareados/confiáveis; pareamento novo fica nas Configurações.
- Saídas de áudio dependem das sinks expostas por GVC/PulseAudio-PipeWire.
- Snap Layouts não preenche automaticamente as demais regiões e respeita restrições de tamanho/compositor.
- Pré-visualizações podem faltar para janelas minimizadas/desmapeadas.
- O menu lista no máximo oito janelas e oito ações `.desktop` por aplicativo para permanecer utilizável.
- A barra multi-monitor replica a lista de apps; não filtra por monitor.

## Validação manual pendente

Em Ubuntu 24.04 / GNOME Shell 46 / Wayland:

1. Habilitar/desabilitar/recarregar a extensão repetidamente e procurar atores, timers ou sinais remanescentes.
2. Alterar Wi‑Fi, Bluetooth, volume, saída, brilho, bateria e Não Perturbe dentro e fora do WinShell e confirmar sincronização.
3. Testar falha/ausência de NetworkManager, BlueZ/gnome-bluetooth, UPower, GVC e brilho.
4. Conferir calendário em locales com domingo e segunda como primeiro dia, virada de mês/ano e múltiplos monitores.
5. Gerar, atualizar, ativar, dispensar e limpar notificações normais, residentes e com ações.
6. Exercitar menus em janelas não minimizáveis, não maximizáveis, fullscreen, Wayland nativo e XWayland.
7. Revalidar Start, Snap Layouts, previews, painel superior e hotplug de monitores.

## Estrutura

```text
extension.js / prefs.js
modules/
  apps.js, startMenu.js, taskbar.js, multiMonitor.js
  quickSettings.js, systemControls.js, quickSettingsModel.mjs
  calendar.js, calendarModel.mjs
  notificationCenter.js, notificationModel.mjs
  contextMenu.js, windowActions.mjs
  popup.js, systemActions.js, windowPreview.js
  snapLayouts.js, layoutGeometry.mjs
schemas/  scripts/  tests/  docs/
```

Licença MIT. Consulte [LICENSE](LICENSE).

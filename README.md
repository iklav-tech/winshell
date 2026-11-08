# WinShell for GNOME 0.2.0

Extensão GNOME Shell 46 para Ubuntu 24.04, com uma interface inspirada no Windows 11.
Projeto experimental, sem vínculo com Microsoft ou GNOME Foundation.

## Novidades 0.2.0

- Painel de configurações rápidas no canto inferior: alternar modo escuro e Não Perturbe; atalhos de Rede/Wi-Fi, Bluetooth, Som e Configurações.
- Atalhos para o centro nativo de notificações/calendário e para o menu nativo de controles completos do GNOME.
- Quando a barra superior está oculta, ela aparece temporariamente para apresentar o menu nativo do GNOME e depois é ocultada novamente.
- Menu contextual com botão direito nos aplicativos: fixar/desafixar, abrir nova janela, fechar as janelas abertas.
- Menu contextual na área vazia da barra: centralizar ícones, mostrar pesquisa, mostrar barra GNOME e abrir Extensões.
- Menu Iniciar renovado, com aplicativos favoritos em primeiro lugar; pesquisa por nome, descrição, comando e palavras-chave dos arquivos .desktop; Enter ativa o primeiro resultado.
- Atalhos para Configurações e Arquivos no Menu Iniciar.
- Novas opções de preferências para os botões de notificações e configurações rápidas.

## Limitações conhecidas

- O conteúdo de notificações e as opções completas de som/rede continuam sendo fornecidos pelos **menus originais** do GNOME, não por uma recriação fiel do Windows. A interface rápida própria oferece ações e atalhos.
- Busca limitada aos aplicativos instalados (metadados de .desktop); **não busca documentos, Internet ou conteúdo de arquivos**.
- Os atalhos Wi-Fi/Bluetooth dependem dos arquivos .desktop disponibilizados pelo GNOME Control Center na distribuição. Quando não existirem, aparecerá uma mensagem de aplicativo não encontrado.
- Somente o monitor primário recebe a barra. Sem Snap Layouts do Windows 11 nem substituição do Nautilus.
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
unzip winshell-for-gnome-v0.2.0.zip
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

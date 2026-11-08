# WinShell for GNOME — MVP 0.1.0

Extensão experimental para GNOME Shell 46 / Ubuntu 24.04 com uma interface inspirada no Windows 11.

## O que funciona nesta versão

- Barra de tarefas inferior no monitor principal com espaço reservado pelo GNOME Shell.
- Menu Iniciar próprio com lista de aplicativos instalados e busca por nome.
- Aplicativos fixados (editáveis nas preferências) e aplicativos em execução.
- Indicador de aplicativo aberto e em primeiro plano; clique para ativar, restaurar ou minimizar.
- Relógio e data locais; clique abre o calendário nativo do GNOME.
- Preferências gráficas: altura, centralização, pesquisa, relógio, painel superior e fixados.
- O painel GNOME superior permanece ativo por padrão para manter rede, som, notificações e Quick Settings acessíveis.
- Restabelecimento do painel original ao desativar a extensão.

## Limitações

Este é um **MVP**, não uma clonagem completa do Windows 11. O menu mostra aplicativos (não arquivos nem resultados web). A pesquisa não é global. Área de notificação e Quick Settings são os componentes nativos do GNOME, acessíveis pelo painel superior. Sem Snap Layouts, desktop icons próprios, thumbnails, integração profunda com Nautilus, barra por monitor, applets de terceiros ou alteração de Mutter. Não foram realizados testes em uma sessão GNOME Shell real neste ambiente de geração.

## Requisitos

- Ubuntu 24.04 em sessão GNOME Shell **46.x** (Wayland ou Xorg).
- `gnome-extensions`, `gjs`, `glib-compile-schemas`.
- Backup da sessão e possibilidade de entrar novamente com a extensão desativada.

```bash
sudo apt update
sudo apt install gnome-shell-extensions gnome-shell-extension-prefs gnome-tweaks gjs libglib2.0-dev-bin
```

## Instalar

Descompacte o ZIP e, no diretório do projeto:

```bash
./tests/check.sh
./scripts/install.sh
```

**É necessário terminar a sessão e entrar novamente** para o GNOME detectar uma nova extensão sob Wayland. Depois:

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

## Testar

1. Clique no botão Iniciar e pesquise por um aplicativo.
2. Abra um aplicativo pelo menu e veja seu ícone aparecer na barra inferior.
3. Clique no ícone para minimizar; clique outra vez para ativar.
4. Clique no relógio para abrir o calendário GNOME.
5. Em Preferências, mude a altura, centralização e aplicativos fixados.
6. Desative a extensão e verifique se o painel original permanece disponível.

```bash
./scripts/doctor.sh
journalctl --user -b -f | grep -i winshell
```

## Remover / recuperar sessão

Se a interface continuar acessível:

```bash
gnome-extensions disable winshell@iklav-tech
./scripts/uninstall.sh
```

Se a sessão ficar inutilizável, entre em um TTY com `Ctrl+Alt+F3` e remova a extensão do seu usuário:

```bash
rm -rf ~/.local/share/gnome-shell/extensions/winshell@iklav-tech
```

Em seguida, reinicie ou volte para a sessão gráfica. A opção **Manter painel superior GNOME** vem ligada por segurança; só desative depois de confirmar que todos os controles de que precisa ainda estão acessíveis.

## Arquitetura

- `extension.js`: ciclo de vida da extensão.
- `modules/taskbar.js`: barra, apps fixados/rodando, relógio.
- `modules/startMenu.js`: pesquisa e lançador.
- `modules/apps.js`: acesso ao catálogo de aplicativos.
- `prefs.js`: painel GTK4/Libadwaita.
- `schemas/`: configuração persistente GSettings.
- `stylesheet.css`: aparência.
- `scripts/`: instalação, remoção, diagnóstico.
- `tests/`: verificação estática.

## Roadmap

0.2: painel de sistema, calendário próprio, menus contextuais e notificações. 0.3: integração de desktop, Snap Layouts/atalhos e suporte multimonitor. 0.4: tema GTK/ícones e melhorias do Nautilus. Cada etapa exige testes GNOME 46 em Wayland.

## Licença

MIT (consulte `LICENSE`). Identidade visual original inspirada em padrões gerais de interface, sem distribuição de ativos proprietários da Microsoft.

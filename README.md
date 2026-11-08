# WinShell for GNOME v0.4.0

Uma extensão experimental para **GNOME Shell 46 / Ubuntu 24.04 LTS** que adiciona uma interface inspirada no Windows 11, preservando o GNOME como ambiente gráfico. Projeto independente, sem vínculo com a Microsoft ou a GNOME Foundation.

> **Status: pré-lançamento.** A v0.4.0 foi validada por verificações estáticas e testes de geometria. Não foi homologada em sessão gráfica real GNOME 46/Wayland neste ambiente. Faça backup dos seus dados e mantenha acesso a um TTY antes de testar extensões de interface.

## Novidades da v0.4.0

- **Snap Layouts gráficos:** cinco modelos visuais clicáveis (duas metades, três colunas, principal à esquerda, principal à direita, quatro quadrantes). Selecione diretamente uma região do desenho para mover/redimensionar a janela.
- **Acesso ao Snap Layouts:** menu de contexto do aplicativo em execução ou botão de organizar na pré-visualização de janela.
- **Preferência de ativação:** novo controle `snap-layouts` em `prefs.js`/GSettings para habilitar ou ocultar as ações de organização.
- **Acabamento visual:** botões com realce no hover/foco, painéis de layouts com divisões proporcionais, melhor contraste e espaçamento.
- **Testabilidade:** funções puras para cálculo de retângulos (`modules/layoutGeometry.mjs`) e testes automatizados para limites, cobertura e sobreposição das regiões.
- **Consistência de estado:** cancelamento de temporizadores pendentes de pré-visualização durante atualizações da barra.
- **Documentação revisada integralmente:** instruções, limitações, checklist e referências agora correspondem à v0.4.0.

## Funcionalidades disponíveis (v0.1.0–v0.4.0)

- Barra de tarefas inferior com ícones centralizados ou alinhados à esquerda; aplicativos fixados e em execução.
- Menu Iniciar com pesquisa por aplicativos instalados (nome, descrição, comando e palavras-chave `.desktop`).
- Clique em um aplicativo para abrir, ativar ou minimizar; menu com ações de fixar, abrir e fechar.
- Configurações rápidas: alternância entre modo escuro/Não Perturbe e atalhos para controles nativos de rede, Bluetooth e áudio.
- Relógio, data, calendário nativo e centro de notificações de leitura **best-effort**.
- Pré-visualizações de janelas via compositor, com ações de ativar, fechar e abrir Snap Layouts.
- Barra opcional em todos os monitores conectados, com atualização em mudanças de monitor.
- Preferências GTK4/Libadwaita persistentes via GSettings e painel superior GNOME opcional.

## Limitações conhecidas

- A compatibilidade real com **GNOME 46 e Wayland/X11 depende de testes na máquina de destino**. Algumas APIs do Shell não são estáveis entre versões.
- Snap Layouts atuam sobre a janela selecionada, **não organizam automaticamente todas as demais janelas**. O compositor, o tamanho mínimo do aplicativo e o Wayland podem impor restrições ao redimensionamento. A grade gráfica não surge ao passar o mouse no botão maximizar da janela, diferentemente do Windows 11.
- Sem captura de janela exclusiva: pré-visualizações usam atores do compositor e podem não aparecer para janelas minimizadas/desmapeadas.
- O centro de notificações é somente leitura das fontes atualmente disponíveis: não substitui o histórico nativo nem permite apagar todas as notificações.
- Busca apenas aplicativos instalados; não indexa documentos, arquivos ou a web.
- A barra em monitores adicionais lista os mesmos aplicativos em todas as telas; não filtra janelas por monitor.
- Configurações avançadas de rede, Bluetooth e som continuam no GNOME nativo; Nautilus e Mutter não são substituídos.
- A ocultação do painel superior é opcional; ele pode reaparecer temporariamente ao utilizar menus nativos.

## Requisitos e dependências

- Ubuntu 24.04 LTS com GNOME Shell **46**.
- Acesso à sessão gráfica GNOME; recomenda-se testar com o painel superior visível primeiro.
- `glib-compile-schemas` e `gnome-extensions` para instalação.
- Node.js é **opcional** para testes estáticos de JavaScript e testes de geometria.

```bash
sudo apt update
sudo apt install gnome-shell-extensions gnome-shell-extension-prefs \
  gnome-tweaks gjs libglib2.0-dev-bin unzip
# Opcional para testes estáticos:
sudo apt install nodejs
```

## Instalação limpa

```bash
unzip winshell-for-gnome-v0.4.0.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
```

**Wayland:** encerre a sessão do GNOME e entre novamente. Em seguida:

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

## Atualização da v0.3.0

```bash
# Opcional: exporte suas preferências antes de atualizar
dconf dump /org/gnome/shell/extensions/winshell/ > winshell-settings-backup.ini

gnome-extensions disable winshell@iklav-tech
unzip winshell-for-gnome-v0.4.0.zip
cd winshell-for-gnome
./tests/check.sh
./scripts/install.sh
# Saia da sessão e entre novamente, principalmente em Wayland
gnome-extensions enable winshell@iklav-tech
```

As configurações existentes são mantidas; `snap-layouts` começa habilitado por padrão.

## Como usar os Snap Layouts gráficos

1. Abra pelo menos duas janelas redimensionáveis (ex.: Arquivos e Terminal).
2. Clique com o botão direito no ícone do aplicativo em execução na barra inferior.
3. Escolha **Organizar janela (Snap Layouts)**.
4. No painel gráfico, selecione um dos cinco modelos e **clique na região que deseja ocupar**.
5. Repita com uma segunda janela, selecionando outra região.
6. Alternativamente, use o ícone de grade na pré-visualização da janela.
7. Em Preferências do WinShell, desligue **Snap Layouts gráficos** para ocultar essas opções.

## Testes automatizados

```bash
./tests/check.sh
node tests/layouts.test.mjs
```

O script valida metadados da versão 4, estrutura e chaves GSettings, conteúdo do README, JavaScript (se Node estiver instalado), geometria, schemas (se `glib-compile-schemas` estiver instalado) e Bash. **Testes estáticos não validam o funcionamento visual do GNOME Shell**.

## Checklist manual no Ubuntu 24.04

1. Confirme `gnome-shell --version` (esperado: `GNOME Shell 46.x`) e `echo "$XDG_SESSION_TYPE"`.
2. Habilite a extensão e confirme barra inferior, Iniciar e pesquisa de aplicativos.
3. Abra dois aplicativos; confira foco, minimização, menu contextual e persistência de fixados.
4. Abra Snap Layouts: confirme cinco modelos visuais e que clicar em regiões distintas posiciona janelas corretamente.
5. Teste janelas com limites mínimos, maximizadas, não redimensionáveis e em um segundo monitor.
6. Teste pré-visualizações e o botão de organização, incluindo alternar `snap-layouts` nas preferências.
7. Abra Notificações e Configurações rápidas e confira os atalhos nativos.
8. Conecte/desconecte um segundo monitor com `multi-monitor` habilitado.
9. Desabilite a extensão e confirme que o painel superior GNOME reaparece, sem elementos WinShell remanescentes.

## Diagnóstico, desativação e recuperação

```bash
./scripts/doctor.sh
gnome-extensions disable winshell@iklav-tech
# Opcional: remover os arquivos instalados
./scripts/uninstall.sh
```

Se o GNOME não responder, abra um TTY com `Ctrl+Alt+F3` e desabilite a extensão manualmente:

```bash
mv ~/.local/share/gnome-shell/extensions/winshell@iklav-tech \
   ~/.local/share/gnome-shell/extensions/winshell@iklav-tech.disabled
```

Reinicie a sessão gráfica ou o computador. O diretório renomeado poderá ser restaurado depois.

## Estrutura do projeto

```text
winshell-for-gnome/
├── extension.js
├── prefs.js
├── metadata.json
├── stylesheet.css
├── modules/
│   ├── apps.js
│   ├── contextMenu.js
│   ├── layoutGeometry.mjs       # NOVO: geometria pura de layouts
│   ├── multiMonitor.js
│   ├── notificationCenter.js
│   ├── popup.js
│   ├── quickSettings.js
│   ├── snapLayouts.js           # ATUALIZADO: grade gráfica interativa
│   ├── startMenu.js
│   ├── systemActions.js
│   ├── taskbar.js
│   └── windowPreview.js
├── schemas/
│   └── org.gnome.shell.extensions.winshell.gschema.xml
├── scripts/
│   ├── doctor.sh
│   ├── install.sh
│   └── uninstall.sh
└── tests/
    ├── check.sh
    └── layouts.test.mjs         # NOVO: testes de geometria
```

## Segurança e licença

Não exige `sudo` para instalação no diretório do usuário; utiliza APIs locais do GNOME Shell. Código-fonte sob licença MIT (`LICENSE`). Antes de divulgar como versão estável, valide os recursos em uma sessão GNOME Shell 46 real.

## Próximos passos

Testes de integração reais no GNOME 46/Wayland, ajuste das interações com popups e menus, acessibilidade, navegação por teclado e possível expansão para preenchimento de layouts com múltiplas janelas.

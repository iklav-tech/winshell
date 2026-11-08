# Domínio

## Conceitos

| Termo | Papel |
|---|---|
| `TaskbarManager` | Possui o `SystemControls` compartilhado e uma ou mais barras |
| `Taskbar` | Barra inferior vinculada a um monitor |
| `TaskbarConflictManager` | Detecta/coordena docks conhecidos e possui o registro reversível |
| `PopupSurface` | Base de flyouts com geometria pura por monitor, foco inicial/restaurado e chrome explicitamente removido |
| `ShellCompat` | Fronteira das APIs JavaScript específicas do GNOME Shell 46 |
| `SystemControls` | Adaptador assíncrono para NM, Bluetooth/rfkill, GVC, brilho, UPower e GSettings |
| `QuickSettingsPanel` | Projeção/ações dos controles de sistema |
| `WinShellCalendar` | Calendário mensal local, sem alterar o calendário GNOME |
| `NotificationCenter` | Projeção reativa das sources e notifications de `Main.messageTray` |
| `ContextMenu` | Ações suportadas de app, janela e barra |
| `ShellFoundationModel` | Busca/ordenação de apps, fixação e decisão ativar/minimizar sem dependência GJS |
| `app` | `Shell.App` identificado por ID `.desktop` |
| `win` | `Meta.Window` com capacidades consultadas antes de mostrar ações |
| `template/region` | Modelo Snap e tupla normalizada convertida para pixels |
| `ShellAppearanceController` | Resolve Follow System e mantém classes Light/Dark/preset no `uiGroup` |
| `AppearanceManager` | Cliente assíncrono das preferências e resolvedor de recursos instalados |
| backup de aparência | Registro v1 de original/applied/changed para restauração segura |

## Relações e lifecycle

```text
WinShellExtension
├── ShellAppearanceController
├── StartMenu
├── TaskbarConflictManager ── GNOME ExtensionManager
└── TaskbarManager
    ├── SystemControls (um por extensão)
    └── Taskbar[] (uma ou várias)
        ├── QuickSettingsPanel ─┐
        ├── NotificationCenter ├── assinam SystemControls
        │   └── WinShellCalendar
        ├── ContextMenu
        ├── WindowPreview
        └── SnapLayoutPanel
```

`TaskbarManager.destroy()` destrói primeiro as barras/assinaturas e depois o adaptador compartilhado. `SystemControls.destroy()` remove idles, sinais e callbacks. O centro remove sinais do tray, sources e notificações; previews removem timers. Atores filhos removem seus próprios sinais quando destruídos.

## Estados externos

- Wi‑Fi: ausente, bloqueado por hardware, desligado, ligado/desconectado ou conectado; redes podem ser conhecidas ou exigir configuração.
- Bluetooth: ausente/bloqueado, desligado ou ligado; dispositivos listados são pareados/confiáveis e conectáveis quando suportado.
- Áudio/brilho/bateria: disponíveis somente quando os serviços expõem dados válidos.
- Notificação: criada, atualizada, ativada ou destruída pela fonte autoritativa do Shell.
- Janela: normal, minimizada, maximizada ou sem capacidade específica.
- Conflito de barra: ausente, ativo/mutável, ativo/bloqueado ou gerenciado aguardando restauração.
- Aparência: não aplicada, aplicada, restaurada ou com divergência externa.
- Integração: DING/Nautilus disponível, ausente ou habilitado pelo usuário.

## Fora do domínio

- Armazenar senhas Wi‑Fi, parear dispositivos ou substituir painéis avançados do GNOME.
- Persistir histórico próprio de notificações.
- Organizar automaticamente todas as janelas depois de escolher uma região Snap.
- Pesquisar documentos ou web no menu Iniciar.
- Destruir atores ou reconfigurar opções privadas de extensões de terceiros.
- Injetar CSS em Libadwaita, desenhar desktop próprio ou modificar fontes/bibliotecas do sistema.

## Pendências

- TODO: confirmar estados transitórios dos serviços e do compositor em GNOME 46/Wayland real.

# Mapa do repositório

| Caminho | Responsabilidade |
|---|---|
| `extension.js` | enable/disable e painel superior |
| `prefs.js` | preferências GTK/Libadwaita |
| `metadata.json` | UUID, Shell 46, versão inteira 9 / 0.5.2 |
| `stylesheet.css` | barra, flyouts, claro/escuro |
| `modules/taskbar.js` | composição e eventos da barra |
| `modules/multiMonitor.js` | topologia e controles compartilhados |
| `modules/taskbarConflict.js` | detecção, política e restauração de docks concorrentes |
| `modules/systemControls.js` | NM, Bluetooth, GVC, brilho, UPower e desktop |
| `modules/quickSettings.js` | UI de controles reais |
| `modules/calendar.js` | calendário mensal |
| `modules/notificationCenter.js` | agrupamento e gestão de notificações |
| `modules/contextMenu.js` | apps, janelas e barra |
| `modules/startMenu.js`, `apps.js` | catálogo/pesquisa/ativação |
| `modules/windowPreview.js` | miniaturas e ações |
| `modules/snapLayouts.js` | UI/aplicação de layouts |
| `modules/popup.js`, `popupGeometry.mjs` | lifecycle/foco e geometria pura de flyouts |
| `modules/shellCompat.js` | fronteira de APIs JavaScript específicas do GNOME Shell 46 |
| `modules/*Model.mjs`, `windowActions.mjs`, `layoutGeometry.mjs`, `taskbarGeometry.mjs` | lógica pura testável |
| `modules/appearance/` | modo efetivo, classes do Shell, preferências e cliente assíncrono |
| `themes/` | tokens e pacotes WinShell Light/Dark para GTK3, GTK4 e Shell |
| `icons/WinShell/` | tema SVG original com fallback e licença |
| `wallpapers/` | arte original Light/Dark vetorial e licença |
| `integrations/appearance/` | apply/restore versionado e testável |
| `integrations/desktop/`, `integrations/nautilus/` | DING e plugin Nautilus opcional |
| `schemas/` | valores legados, visuais e registros internos persistentes |
| `tests/` | estrutura, assets, sintaxe, schema e suítes unitárias/isoladas |
| `scripts/` | geração, instalação, restauração, remoção e diagnóstico |
| `docs/` | referência alinhada à v0.5.2 e evidência em `verification/` |

## Dependências de runtime

GNOME Shell resources; GI `St`, `Clutter`, `Gio`, `GLib`, `Shell`, `Meta`, `NM`, `GnomeBluetooth` e GVC; serviços NetworkManager, Settings Daemon e UPower. Não há pacote JavaScript externo, lockfile, servidor, telemetria ou dependência X11 adicionada.

## Artefato

`scripts/install.sh` copia o artefato da extensão e instala temas, ícones, wallpapers e helper em caminhos XDG do usuário. `--with-nautilus` valida a API Nautilus 4 antes de copiar o plugin. O schema é compilado com `--strict`.

## Ausências

Não há pipeline CI, empacotador ZIP, teste visual automatizado ou fixture do Shell. O ZIP citado no README é o nome esperado do artefato de release, não um arquivo gerado pelo repositório.


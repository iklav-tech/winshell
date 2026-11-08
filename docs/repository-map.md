# Mapa do repositório

| Caminho | Responsabilidade |
|---|---|
| `extension.js` | enable/disable e painel superior |
| `prefs.js` | preferências GTK/Libadwaita |
| `metadata.json` | UUID, Shell 46, versão inteira 6 / 0.4.2 |
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
| `modules/popup.js` | base/posicionamento de flyouts |
| `modules/*Model.mjs`, `windowActions.mjs`, `layoutGeometry.mjs`, `taskbarGeometry.mjs` | lógica pura testável |
| `schemas/` | doze valores de usuário e um registro interno persistente |
| `tests/` | estrutura, sintaxe, schema e sete suítes unitárias |
| `scripts/` | instalação, remoção e diagnóstico |
| `docs/` | referência alinhada à v0.4.2 |

## Dependências de runtime

GNOME Shell resources; GI `St`, `Clutter`, `Gio`, `GLib`, `Shell`, `Meta`, `NM`, `GnomeBluetooth` e GVC; serviços NetworkManager, Settings Daemon e UPower. Não há pacote JavaScript externo, lockfile, servidor, telemetria ou dependência X11 adicionada.

## Artefato

`scripts/install.sh` copia metadata, entradas, CSS, todo `modules/` e `schemas/`, depois executa `glib-compile-schemas --strict`. Testes/docs não são necessários no diretório instalado.

## Ausências

Não há pipeline CI, empacotador ZIP, teste visual automatizado ou fixture do Shell. O ZIP citado no README é o nome esperado do artefato de release, não um arquivo gerado pelo repositório.


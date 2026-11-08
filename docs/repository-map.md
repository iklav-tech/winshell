# Mapa do repositório

## Visão geral

O repositório contém um único artefato implantável: a extensão GNOME Shell
`winshell@iklav-tech`, declarada para o Shell 46 (`metadata.json:2-9`). O ponto de
entrada da extensão cria o menu Iniciar e o gerenciador de barras
(`extension.js:40-50`); as preferências são um processo separado do GNOME que
edita o mesmo schema GSettings (`prefs.js:6-37`). Não há manifesto de gerenciador
de pacotes nem etapa de empacotamento no repositório; a instalação copia os
arquivos diretamente para o diretório de extensões do usuário
(`scripts/install.sh:3-19`).

## Árvore observada

Listagem obtida da árvore de trabalho com `find` e `rg --files` em 2026-11-08:

```text
.
├── extension.js              # entrada do runtime GNOME Shell
├── prefs.js                  # janela GTK4/Libadwaita de preferências
├── metadata.json             # identidade, versão e compatibilidade
├── stylesheet.css            # estilos dos atores do Shell
├── modules/                  # componentes internos do runtime
├── schemas/                  # schema GSettings da extensão
├── scripts/                  # diagnóstico, instalação e remoção
├── tests/                    # verificação estática e geometria pura
├── README.md                 # guia voltado ao usuário
├── LICENSE                   # licença MIT
└── .github/skills/           # skills locais de documentação/manutenção
```

Não foram encontrados `dist/`, `node_modules/`, `target/` ou outros diretórios de
build. `git ls-files` confirmou que os arquivos de runtime, scripts, testes,
README, licença e `.gitignore` estavam versionados; `.github/` estava presente na
árvore de trabalho, mas não versionado no momento da inspeção. Os documentos sob
`docs/` são gerados por esta documentação.

## Componentes do artefato

| Arquivo | Responsabilidade observada |
|---|---|
| `extension.js` | Ciclo de vida, painel nativo, criação e destruição dos componentes (`extension.js:40-76`) |
| `prefs.js` | Controles para as dez chaves booleanas/inteira e lista de fixados (`prefs.js:7-37`) |
| `modules/apps.js` | Consulta, ordenação e ativação de aplicativos GNOME (`modules/apps.js:3-25`) |
| `modules/taskbar.js` | Montagem, posicionamento, eventos e renderização da barra (`modules/taskbar.js:14-74`, `modules/taskbar.js:93-179`) |
| `modules/multiMonitor.js` | Uma barra primária ou uma por monitor (`modules/multiMonitor.js:4-29`) |
| `modules/startMenu.js` | Pesquisa e lançamento de aplicativos (`modules/startMenu.js:13-100`) |
| `modules/popup.js` | Superfície base, posicionamento e fechamento dos flyouts (`modules/popup.js:6-55`) |
| `modules/contextMenu.js` | Ações contextuais de aplicativo e barra (`modules/contextMenu.js:5-46`) |
| `modules/quickSettings.js` | Alternadores e atalhos rápidos (`modules/quickSettings.js:6-51`) |
| `modules/systemActions.js` | GSettings do desktop, lançamento de `.desktop` e menus nativos (`modules/systemActions.js:4-38`) |
| `modules/notificationCenter.js` | Leitura best-effort das fontes de notificações (`modules/notificationCenter.js:7-50`) |
| `modules/windowPreview.js` | Miniaturas e ações para até doze janelas (`modules/windowPreview.js:7-73`) |
| `modules/snapLayouts.js` | UI e aplicação dos Snap Layouts (`modules/snapLayouts.js:8-83`) |
| `modules/layoutGeometry.mjs` | Modelos normalizados e conversão para pixels (`modules/layoutGeometry.mjs:1-23`) |
| `schemas/*.xml` | Defaults, tipos e limites persistidos (`schemas/org.gnome.shell.extensions.winshell.gschema.xml:3-15`) |
| `scripts/*.sh` | Diagnóstico, cópia/compilação e remoção (`scripts/doctor.sh:1-12`, `scripts/install.sh:1-23`, `scripts/uninstall.sh:1-9`) |
| `tests/*` | Contratos estruturais/sintáticos e geometria (`tests/check.sh:1-35`, `tests/layouts.test.mjs:1-32`) |

## Dependências externas

Método de verificação: imports foram levantados com `rg` e cada nome importado foi
procurado no arquivo importador; comandos foram conferidos nas invocações dos
scripts. “Usada” significa referência textual e fluxo alcançável no código, não
homologação em sessão GNOME real.

| Dependência declarada | Onde | Uso verificado |
|---|---|---|
| GNOME Shell `Extension`/`ExtensionPreferences` | imports `resource:///` | Sim — subclasses em `extension.js:40` e `prefs.js:6` |
| GNOME Shell `Main` | runtime | Sim — painel, chrome, menus e notificações (`extension.js:18-24`, `modules/popup.js:12`, `modules/systemActions.js:10`) |
| GI `St` e `Clutter` | módulos visuais | Sim — atores, eventos e alinhamento (`modules/taskbar.js:22-30`, `modules/popup.js:13-25`) |
| GI `Gio` | preferências e ações | Sim — bindings, apps e settings (`prefs.js:24-33`, `modules/systemActions.js:4-10`) |
| GI `GLib` | barra e preview | Sim — relógio e timeouts (`modules/taskbar.js:70-73`, `modules/windowPreview.js:62-71`) |
| GI `Shell` | catálogo de apps | Sim — `AppSystem` (`modules/apps.js:1-18`, `modules/taskbar.js:66-68`) |
| GI `Meta` | snap | Sim — desmaximização (`modules/snapLayouts.js:14-17`) |
| GI `Adw` e `Gtk` | preferências | Sim — páginas, linhas e ajuste (`prefs.js:9-35`) |
| Node.js `node:assert/strict` | teste de geometria | Sim — todas as asserções do teste (`tests/layouts.test.mjs:1-31`) |
| Python 3 (stdlib `json`, `pathlib`, `ElementTree`) | verificação estática | Sim — metadados e XML (`tests/check.sh:4-20`) |
| `glib-compile-schemas` | instalação/teste | Sim — compilação e validação (`scripts/install.sh:13-19`, `tests/check.sh:27-30`) |
| `gnome-shell`, `gnome-extensions`, `journalctl` | scripts operacionais | Sim — pré-condição, controle e diagnóstico (`scripts/install.sh:6-11`, `scripts/uninstall.sh:5-6`, `scripts/doctor.sh:4-12`) |

Não há dependência declarada em manifesto para classificar como não usada; as
dependências do runtime são fornecidas pela plataforma GNOME.

## Configuração consolidada

| Arquivo | Escopo | Função |
|---|---|---|
| `metadata.json` | GNOME Shell | UUID, nome, versão 4, Shell 46 e schema (`metadata.json:2-10`) |
| `schemas/org.gnome.shell.extensions.winshell.gschema.xml` | runtime e preferências | Onze chaves persistentes e defaults (`schemas/org.gnome.shell.extensions.winshell.gschema.xml:3-15`) |
| `stylesheet.css` | runtime | Classes consumidas pelos atores, inclusive barra e Snap Layouts (`stylesheet.css:1-18`, `stylesheet.css:87-98`) |
| `.gitignore` | repositório | Exclusões locais; seu conteúdo tinha alteração preexistente durante esta geração |

## Testes e automação

Há um orquestrador de verificações estáticas (`tests/check.sh:1-35`) e um teste
Node para os cinco layouts, limites, cobertura e sobreposição
(`tests/layouts.test.mjs:3-31`). Não foi encontrada configuração de CI/CD, teste
visual automatizado, fixture de GNOME Shell nem relatório de cobertura. Os
comandos efetivamente executados estão registrados em `docs/build-and-run.md`.

## Ausências relevantes

- Não há manifesto `package.json`, lockfile ou configuração de empacotamento.
- Não há `.env.example`; o código não lê variáveis de segredo, mas os scripts usam
  `HOME`, `XDG_DATA_HOME`, `XDG_SESSION_TYPE` e `XDG_CURRENT_DESKTOP`
  (`scripts/install.sh:5`, `scripts/doctor.sh:8-9`).
- Não há workflow de CI/CD na árvore inspecionada.
- Não há teste de integração em GNOME 46; o próprio README declara essa lacuna
  (`README.md:3-5`, `README.md:104-116`).

## Pendências

- TODO: validar em uma sessão GNOME Shell 46 quais imports `resource:///` e APIs
  GI usados continuam compatíveis em Wayland e X11.
- TODO: validar se `.github/skills/` deve ser versionado junto com a documentação.
- TODO: definir se um artefato ZIP de release deve ser produzido e por qual fluxo.


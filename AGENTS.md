# WinShell — repository instructions for Codex

## Mission
Build an independent, maintainable, Windows 11-inspired GNOME Shell experience for Ubuntu 24.04 LTS / GNOME Shell 46. Prefer correct native integration to superficial mockups. This is **not** a Windows emulator.

## Required workflow
1. Read `specs/INDEX.md`, `specs/00-architecture-and-quality.md`, and the requested version spec(s). Inspect the actual repository before editing.
2. Record existing functionality, gaps, and potential regressions. Do not assume a feature or module exists because it appears in a roadmap.
3. Implement code, configuration, tests, and documentation. Use small cohesive modules; no stubs or decorative nonfunctional controls counted as complete.
4. Test what is possible and explicitly distinguish static checks from GNOME 46/Wayland runtime validation.
5. Update `README.md` **throughout** for each release, update `CHANGELOG.md`, installer/uninstaller, GSettings, and integer `metadata.json` version consistently.
6. Finish with changed files, acceptance status, tests run, evidence, unresolved issues and manual validation steps.
7. **Never commit, tag, or publish automatically.** Wait for an explicit user request.

## Hard requirements
- Target: Ubuntu 24.04, GNOME Shell 46, Wayland first, X11 where feasible. GJS ES Modules.
- Extension UUID: `winshell@iklav-tech` unless existing project differs; do not silently change it.
- Free resources on disable: actors, timeouts, signals, D-Bus proxies, keybindings, monitors, shell chrome.
- Do not block shell main loop. Prefer async D-Bus; handle missing services/hardware and error paths.
- Prefer documented GNOME interfaces and isolate any internal GNOME API use behind compatibility modules.
- Do not write to `/usr`, override system libraries, patch Mutter/Nautilus, or require root for preference changes.
- For conflicting dock extensions, never destroy another extension's actors or irreversibly disable an extension. Restore changes after errors/restarts.
- Theme/app integration separate from shell extension; respect GTK4/Libadwaita limitations.
- Icons/wallpapers: original or redistributable with tracked license; no proprietary Microsoft assets.
- Windows app compatibility, full Nautilus UI replacement, and 99% functional identity are NOT acceptance criteria.

## Test baseline
Where available: `bash tests/check.sh`, `node --test tests/*.test.mjs`, `bash -n scripts/*.sh`, `glib-compile-schemas --strict --dry-run schemas`, `gnome-extensions info winshell@iklav-tech`, plus live GNOME 46 checks. Adapt to actual repo.

## Multi-agent safety
- Different implementation branches/worktrees for concurrent feature work.
- Do not run two agents changing `extension.js`, `prefs.js`, `metadata.json`, `README.md`, `CHANGELOG.md`, or GSettings simultaneously on the same branch.
- Merge/integrate one branch at a time; one integration owner handles shared files, release version and regression suite.
- Never mark a release as stable without manual runtime evidence.


# WinShell — índice técnico

## Estrutura rápida

| Caminho | Conteúdo |
|---|---|
| `extension.js`, `prefs.js` | entradas do runtime e preferências |
| `modules/` | componentes da extensão |
| `schemas/`, `stylesheet.css` | dados persistentes e apresentação |
| `scripts/`, `tests/` | operação e verificação |
| `docs/` | referência baseada no código |

## Comandos confirmados

```bash
./tests/check.sh
node tests/layouts.test.mjs
./scripts/doctor.sh
```

Todos passaram na geração dos documentos; versões e saídas estão em
`docs/build-and-run.md`. `install.sh` só foi confirmado com `XDG_DATA_HOME`
temporário. Não execute `uninstall.sh` sem conferir o destino: ele desabilita e
remove a extensão.

## Pergunta → documento

| Pergunta | Referência |
|---|---|
| O que existe no repositório? | `docs/repository-map.md` |
| Como os componentes se conectam? | `docs/architecture.md` |
| Como funciona o artefato implantável? | `docs/modules/winshell-extension.md` |
| Quais são os conceitos e estados? | `docs/domain.md` |
| Quais regras estão confirmadas ou abertas? | `docs/business-rules.md` |
| Quais são os fluxos felizes e de erro? | `docs/flows.md` |
| Quais dados existem e quem os usa? | `docs/data-model.md` |
| Como testar, instalar e executar? | `docs/build-and-run.md` |
| Onde estão os riscos? | `docs/technical-risks.md` |
| O que a auditoria confirmou ou deixou aberto? | `docs/open-questions.md` |

## Convenções observadas

- ES modules, quatro espaços e ponto e vírgula em JavaScript.
- Componentes visuais são classes; helpers puros são funções exportadas.
- Configuração persistente nasce no schema e é consumida por GSettings.
- IDs estáveis da documentação: `RN-xx`, `H-xx`, `UC-xx`, `R-xx`.

## Regras de ouro para alterações

- Preserve cleanup de sinais, timers e atores no lifecycle.
- Mudou chave GSettings: atualize schema, preferências, consumidores, testes e docs.
- Mudou contrato/função: atualize todos os chamadores e suas âncoras documentais.
- Mudou comportamento: atualize RN/UC/riscos sem renumerar IDs existentes.
- Afirmação ainda não verificada deve ser `TODO: validar`, nunca fato.
- Execute `./tests/check.sh`; só registre um comando como confirmado se rodou.

## Pendências

- TODO: manter este índice sincronizado quando novos documentos forem adicionados.


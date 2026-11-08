# Build, testes e execução

## Ambiente detectado

Versões obtidas em 2026-11-08 (America/Sao_Paulo):

| Ferramenta/ambiente | Detectado |
|---|---|
| GNOME Shell | `GNOME Shell 46.0` |
| Sessão / desktop | `wayland` / `ubuntu:GNOME` |
| Node.js | `v22.23.1` |
| Python | `Python 3.12.3` |
| GLib schemas | `2.80.0` |
| Bash | `5.2.21(1)-release` |
| `gnome-extensions` | `/usr/bin/gnome-extensions` |

O alvo declarado é Shell 46 (`metadata.json:5-9`) e o instalador impõe a mesma
major (`scripts/install.sh:6-15`).

## Build

Não há compilação do JavaScript ou CSS. A única etapa gerada é
`gschemas.compiled`, criada pelo instalador (`scripts/install.sh:16-19`).

### ✅ Instalação isolada confirmada

```bash
XDG_DATA_HOME=/tmp/winshell-docs-install.l6YtJJ ./scripts/install.sh
```

Exit code `0`. Saída essencial:

```text
Instalado em: /tmp/winshell-docs-install.l6YtJJ/gnome-shell/extensions/winshell@iklav-tech
IMPORTANTE: encerre a sessão GNOME e entre novamente para detectar uma extensão nova (Wayland).
Depois execute: gnome-extensions enable 'winshell@iklav-tech'
Preferências: gnome-extensions prefs 'winshell@iklav-tech'
```

Foi verificada a presença dos quatro arquivos raiz, dos doze módulos, do XML e de
`schemas/gschemas.compiled`. O diretório temporário foi removido ao final. O
script copiado/testado é `scripts/install.sh:1-23`.

## Testes

### ✅ Suíte estática confirmada

```bash
./tests/check.sh
```

Exit code `0`:

```text
OK: metadata, GSettings XML, módulos e versão README
OK: sintaxe dos arquivos JavaScript
OK: all graphical layout templates and pixel bounds
OK: cálculo e integridade das regiões Snap Layouts
OK: esquema GSettings validado
OK: sintaxe dos scripts Bash
```

O comando orquestra Python, `node --check`, geometria, validação GSettings e
`bash -n` (`tests/check.sh:4-35`).

### ✅ Geometria isolada confirmada

```bash
node tests/layouts.test.mjs
```

Exit code `0`; saída literal:

```text
OK: all graphical layout templates and pixel bounds
```

Os casos estão em `tests/layouts.test.mjs:3-31`.

## Diagnóstico e execução

### ✅ Diagnóstico confirmado

```bash
./scripts/doctor.sh
```

Exit code `0`; detectou `gnome-shell`, `gnome-extensions` e
`glib-compile-schemas`, reportou GNOME 46.0, Wayland e `ubuntu:GNOME`. Não havia
linhas recentes de log WinShell na saída. O script consultado está em
`scripts/doctor.sh:1-12`.

### ⚠️ Ativação da extensão inferida, não executada

```bash
gnome-extensions enable winshell@iklav-tech
gnome-extensions prefs winshell@iklav-tech
```

Os comandos são emitidos pelo instalador (`scripts/install.sh:20-23`) e aparecem
no README (`README.md:63-68`). Não foram executados porque alterariam o estado da
sessão gráfica do usuário; portanto não há homologação visual nesta sessão.

### ⚠️ Desinstalação inferida, não executada

```bash
./scripts/uninstall.sh
```

O script desabilita a extensão e remove recursivamente seu diretório
(`scripts/uninstall.sh:3-9`). Não foi executado porque poderia desabilitar/remover
uma instalação real do usuário.

### ⚠️ Instalação no destino real não executada

```bash
./scripts/install.sh
```

Somente a variante com `XDG_DATA_HOME` temporário foi confirmada. Sem a variável,
o destino é `$HOME/.local/share/...` (`scripts/install.sh:5`), então o comando
acima não foi executado contra o perfil real.

## Matriz de status

| Módulo/atividade | Build | Testes | Execução |
|---|---|---|---|
| Extensão GNOME | ✅ cópia/schema em `/tmp` | ✅ estático; ⚠️ sem integração visual | ⚠️ não habilitada |
| Geometria pura | não se aplica | ✅ Node | ✅ exercitada pelos testes |
| Preferências | não se aplica | ✅ sintaxe/bindings estruturais | ⚠️ janela não aberta |
| Scripts operacionais | não se aplica | ✅ `bash -n`; instalador isolado | ✅ doctor; ⚠️ uninstall não executado |

## README versus realidade observada

- O README afirma validação estática e de geometria, mas não homologação gráfica
  (`README.md:3-5`); isso coincide com esta sessão.
- Os comandos `./tests/check.sh` e `node tests/layouts.test.mjs` documentados
  (`README.md:97-104`) passaram sem divergência.
- A instalação limpa começa com um ZIP chamado
  `winshell-for-gnome-v0.4.0.zip` (`README.md:54-61`), mas nenhum ZIP ou processo
  de empacotamento existe na árvore inspecionada; essa etapa não pôde ser testada.
- O README chama Node opcional (`README.md:39-44`), e `check.sh` realmente pula
  as verificações JS se ele não estiver instalado (`tests/check.sh:21-26`).
- A estrutura mostrada no README não inclui `.github/skills/` nem os documentos
  gerados (`README.md:136-166`); não afeta o artefato, mas ficará desatualizada se
  a intenção for representar toda a árvore.

## Pendências

- TODO: executar checklist visual do README em GNOME 46/Wayland e X11 descartáveis.
- TODO: testar `uninstall.sh` em uma sessão/usuário isolado, inclusive ausência e
  presença da extensão.
- TODO: definir e testar o processo que produz o ZIP citado pelo README.
- TODO: registrar versões mínimas suportadas de Node, Python, Bash e GLib.


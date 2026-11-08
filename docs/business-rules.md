# Regras de negócio

## Regras confirmadas

### RN-01 — Compatibilidade de instalação restrita ao GNOME 46

O instalador termina com erro se não detectar GNOME Shell ou se a versão major
for diferente de `46` (`scripts/install.sh:6-15`).

```bash
if ! command -v gnome-shell >/dev/null 2>&1; then
  echo 'ERRO: GNOME Shell não detectado. Execute no Ubuntu com GNOME.' >&2; exit 1
fi
if [[ "$VERSION" != '46' ]]; then
```

Exceção: os testes puros podem rodar sem uma sessão GNOME; esta regra pertence ao
instalador, não ao cálculo geométrico (`tests/check.sh:21-26`).

### RN-02 — Quantidade de barras segue `multi-monitor`

Desabilitada, existe uma barra no monitor primário; habilitada, existe uma barra
para cada monitor (`modules/multiMonitor.js:14-22`).

```js
const count = this._settings.get_boolean('multi-monitor') ? Main.layoutManager.monitors.length : 1;
const index = this._settings.get_boolean('multi-monitor') ? i : primary;
```

Exceção: se o índice não resolver na hora de posicionar, a barra usa
`primaryMonitor` (`modules/taskbar.js:118-123`).

### RN-03 — Um aplicativo aparece uma única vez na barra

Fixados são adicionados primeiro e apps em execução depois; IDs já vistos são
ignorados (`modules/taskbar.js:131-139`).

```js
if (app && !seen.has(app.get_id())) { apps.push(app); seen.add(app.get_id()); }
if (!seen.has(app.get_id())) { apps.push(app); seen.add(app.get_id()); }
```

Exceção: IDs fixados que não resolvem para um app são omitidos
(`modules/taskbar.js:133-136`).

### RN-04 — Clique no app alterna minimizar e ativar

Se a janela focada pertence ao app e não está minimizada, ela é minimizada; caso
contrário, o app é ativado (`modules/taskbar.js:149-153`).

```js
if (global.display.focus_window && windows.includes(global.display.focus_window) &&
    !global.display.focus_window.minimized) global.display.focus_window.minimize();
else activateApp(app);
```

Quando o app não tem janelas, `activateApp` chama `app.activate()`
(`modules/apps.js:21-25`).

### RN-05 — Pesquisa usa quatro grupos de metadados

O termo normalizado é procurado em nome, descrição, executável e keywords; a
lista mostra no máximo 100 resultados (`modules/startMenu.js:51-67`).

```js
const searchable = [app.get_name(), info?.get_description() ?? '',
    info?.get_executable() ?? '', ...(info?.get_keywords() ?? [])].join(' ').toLocaleLowerCase();
return searchable.includes(term);
```

Fixados precedem não fixados, e empates são ordenados pelo nome
(`modules/startMenu.js:61-65`).

### RN-06 — Enter ativa o primeiro resultado

Somente Return/KP Enter é consumido; havendo primeiro match, ele é ativado e o
menu fecha (`modules/startMenu.js:38-45`).

```js
const first = this._matches?.[0];
if (first) { activateApp(first); this.hide(); }
```

Exceção: sem match, o evento ainda retorna `EVENT_STOP`, sem ativar app.

### RN-07 — Fixar/desafixar é determinado pelo estado na abertura do menu

O menu remove todas as ocorrências do ID e, se o app não estava fixado, adiciona
uma ocorrência ao fim (`modules/contextMenu.js:18-26`).

```js
const pinned = this._settings.get_strv('pinned-apps').includes(id);
const apps = this._settings.get_strv('pinned-apps').filter(x => x !== id);
if (!pinned) apps.push(id);
this._settings.set_strv('pinned-apps', apps);
```

Não há limite de fixados implementado.

### RN-08 — Snap exige janela movível, redimensionável e não fullscreen

Qualquer falha nessas pré-condições retorna `false` sem mover a janela
(`modules/snapLayouts.js:8-13`).

```js
if (!win || !win.allows_move() || !win.allows_resize() || win.is_fullscreen())
    return false;
```

A UI repete a mesma validação para exibir a mensagem literal de indisponibilidade
(`modules/snapLayouts.js:30-38`).

### RN-09 — Região normalizada deve ser finita, positiva e interna à unidade

Área/região inválida, inset negativo, dimensões não positivas ou coordenadas fora
de `[0,1]` retornam `null` (`modules/layoutGeometry.mjs:11-16`).

```js
if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1.000001 || y + h > 1.000001) return null;
```

Depois da conversão, o retângulo precisa ter pelo menos 80×70 pixels
(`modules/layoutGeometry.mjs:17-22`).

### RN-10 — Snap aplica a região na work area do monitor da janela

O cálculo usa `get_work_area_for_monitor`, desmaximiza, move/redimensiona e ativa
a janela (`modules/snapLayouts.js:11-18`).

```js
const rectangle = regionToPixels(win.get_work_area_for_monitor(monitor), region);
win.unmaximize(Meta.MaximizeFlags.BOTH);
win.move_resize_frame(true, rectangle.x, rectangle.y, rectangle.width, rectangle.height);
win.activate(global.get_current_time());
```

Exceção: qualquer exceção é capturada, registrada e resulta em `false`
(`modules/snapLayouts.js:19-22`).

### RN-11 — Preview espera 450 ms e limita-se a doze janelas

O preview é agendado com 450 ms e renderiza `windows.slice(0, 12)`
(`modules/windowPreview.js:27`, `modules/windowPreview.js:62-68`).

```js
for (const win of windows.slice(0, 12)) {
this._pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 450, () => {
```

O timer é cancelado em leave, rerender e destroy
(`modules/taskbar.js:95`, `modules/taskbar.js:167-169`,
`modules/windowPreview.js:70-73`).

### RN-12 — Centro mostra no máximo trinta notificações recentes

Itens de todas as fontes disponíveis são concatenados, recortados nos últimos 30
e invertidos (`modules/notificationCenter.js:14-23`).

```js
return result.slice(-30).reverse();
```

Título é truncado em 100 caracteres e corpo sem tags em 240
(`modules/notificationCenter.js:38-44`).

### RN-13 — Painel nativo respeita preferência e visibilidade anterior

Com `show-activities-panel=false`, o painel é ocultado; com a chave verdadeira,
ele só é mostrado automaticamente se estava visível antes do enable
(`extension.js:43`, `extension.js:58-60`).

```js
if (!this._settings.get_boolean('show-activities-panel')) Main.panel.hide();
else if (this._nativePanelWasVisible) Main.panel.show();
```

Menus nativos tornam o painel temporariamente visível e o escondem ao fechar se a
preferência continuar falsa (`extension.js:14-29`).

## Hipóteses abertas

### H-01 — Ordem esperada de apps fixados

Observação: novos fixados são anexados ao fim (`modules/contextMenu.js:22-25`) e a
UI de preferências aceita qualquer lista separada por vírgulas (`prefs.js:30-34`).
Falta decidir se ordem e duplicatas devem ser preservadas, normalizadas ou
reordenadas. Registrar a decisão nesta seção e, se implementada, convertê-la em
nova RN sem renumerar as existentes.

### H-02 — Comportamento pretendido com zero monitores

Observação: `multiMonitor=false` tenta criar uma barra para `primaryIndex`, mas o
posicionamento retorna sem monitor (`modules/multiMonitor.js:17-22`,
`modules/taskbar.js:118-123`). Falta decidir se esse estado transitório é aceito
ou deve impedir a construção da barra. Registrar a decisão na arquitetura e aqui.

### H-03 — Tolerância `1.000001` da geometria

Observação: bordas aceitam soma até `1.000001` (`modules/layoutGeometry.mjs:16`).
Falta decidir se essa tolerância é contrato deliberado para ponto flutuante ou
detalhe interno substituível. Registrar a decisão perto dos testes de geometria e
converter em RN somente se for contrato.

### H-04 — Definição de “notificação recente”

Observação: o código usa a ordem devolvida pelas sources e a ordem de iteração,
sem comparar timestamps (`modules/notificationCenter.js:14-23`). Falta decidir se
“últimas 30” significa essa ordem técnica ou ordem cronológica global. Registrar a
decisão no módulo de notificações e nesta documentação.

### H-05 — Semântica de “Fechar janelas”

Observação: a ação chama `delete()` para todas as janelas do app sem confirmação
(`modules/contextMenu.js:27-31`). Falta decidir se o produto deve confirmar,
limitar-se à janela atual ou manter o fechamento em lote. Registrar a decisão no
fluxo de UX e converter em RN caso confirmado.

## Status das hipóteses

| Hipótese | Status | Decisão necessária |
|---|---|---|
| H-01 | aberta | ordem/deduplicação de fixados |
| H-02 | aberta | lifecycle sem monitor disponível |
| H-03 | aberta | tolerância como contrato ou implementação |
| H-04 | aberta | critério global de recência |
| H-05 | aberta | confirmação e escopo do fechamento |

## Pendências

- TODO: obter decisões humanas para H-01 a H-05.
- TODO: revisar RN-01 em cada expansão de compatibilidade do `metadata.json`.
- TODO: adicionar testes automatizados para RN-02 a RN-08 e RN-10 a RN-13.


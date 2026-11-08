---
name: code-docs
description: 'Gera suíte de documentação técnica baseada em evidências para qualquer codebase — mapa do repositório, arquitetura, módulos, domínio, regras de negócio, fluxos, dados, build e riscos. Use quando precisar documentar um projeto do zero, criar docs de referência, ou estruturar o conhecimento de um repositório desconhecido.'
argument-hint: '[escopo-opcional]'
user-invocable: true
---

# Documentação de codebase com evidências

## Quando usar

- Projeto sem documentação (ou com docs esparsas/confiáveis) que precisa de referência
- Onboarding em um repositório desconhecido
- Antes de uma auditoria ou de um processo de correção guiada (ver skills
  `docs-audit` e `guided-fix`)

## Objetivo

Produzir uma suíte de documentos de referência em que **toda afirmação é verificável**:
comportamentos citam `arquivo:linha`, comandos são classificados como testados ou
inferidos, e o que não pôde ser confirmado vira pendência explícita — nunca fato.

A documentação descreve o código **como ele é**, não como deveria ser.

## Estrutura da skill

- **Este arquivo** — regras globais, pipeline e critérios de aceitação. Sempre lido.
- **Guias por fase** (em `references/`) — carregados sob demanda, um por vez:
  - [`references/structure.md`](./references/structure.md) — Fase 1: Estrutura
  - [`references/behavior.md`](./references/behavior.md) — Fase 2: Comportamento
  - [`references/operations.md`](./references/operations.md) — Fase 3: Operações

## Pipeline

```text
Fase 1 — Estrutura (o que existe?)     Fase 2 — Comportamento (o que faz?)
  1. repository-map                      4. domain
  2. architecture                        5. business-rules (RN/H)
  3. modules/<modulo>                    6. flows (UC)

Fase 3 — Operações (como roda?)         Fecho
  7. data-model                         10. AGENTS.md (índice raiz)
  8. build-and-run                      11. Revisão (skill docs-audit)
  9. technical-risks
```

Execução na ordem; cada número é um documento (detalhes no guia da fase).

**Modos de execução**:

- **Suíte completa** — projeto sem docs: percorra as 3 fases na ordem.
- **Documento único** — escopo informado (ex.: "só o build-and-run"): execute a fase
  correspondente; pré-requisitos de fases anteriores viram `TODO: validar` se não
  existirem.
- **Incremental** — docs existentes: mapeie os artefatos à estrutura atual do
  projeto em vez de criar suíte paralela; preencha lacunas.

## Regras globais (valem para todos os documentos)

- **Âncora obrigatória**: toda afirmação sobre comportamento cita `arquivo:linha`.
  Não consegue verificar? Marque `TODO: validar` — não afirme.
- **Inferência ≠ fato**: conhecimento externo (framework, ecossistema) é apresentado
  como inferência quando não evidenciado por arquivo do repositório.
- **Comandos**: só marque ✅ depois de executar; registre a saída relevante. Processo
  iniciado para teste (servidor) deve ser encerrado ao final da verificação.
- **Numeração estável**: RN-xx, UC-xx, R-xx, H-xx — nunca renumerar itens existentes.
- **Read-only**: não altere código-fonte para documentar; se algo no código confunde,
  vira pendência.
- **Idioma**: siga o idioma das mensagens e docs existentes do projeto.
- **Stack-agnostic**: não presuma ferramentas — descubra os comandos de build/teste
  lendo manifestos, READMEs e configs de CI do próprio projeto.
- **Literal > paráfrase**: mensagens, payloads e saídas de erro são registrados como
  literais.

## Artefatos

| Documento | Fase | Guia |
|---|---|---|
| `docs/repository-map.md` | 1 | structure |
| `docs/architecture.md` | 1 | structure |
| `docs/modules/<modulo>.md` | 1 | structure |
| `docs/domain.md` | 2 | behavior |
| `docs/business-rules.md` | 2 | behavior |
| `docs/flows.md` | 2 | behavior |
| `docs/data-model.md` | 3 | operations |
| `docs/build-and-run.md` | 3 | operations |
| `docs/technical-risks.md` | 3 | operations |
| `AGENTS.md` (raiz) | 3 | operations |

(Nomes canônicos; adapte se o projeto já tem convenção própria.)

## Critérios de qualidade

1. Amostragem final: verificar aleatoriamente ≥10 âncoras — 100% devem apontar para
   o conteúdo afirmado.
2. Zero afirmações de comportamento sem âncora ou sem `TODO: validar`.
3. Toda regra RN-xx cita trecho literal de código; toda H-xx diz o que falta decidir.
4. Todo comando marcado ✅ foi executado nesta sessão.
5. Todo documento termina com seção de pendências.
6. O índice da raiz cobre 100% dos documentos gerados.
7. Critérios específicos de cada fase (no guia correspondente) foram aplicados.

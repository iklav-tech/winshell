# doc-pipeline-skills

Quatro skills stack-agnostic para o ciclo de vida de documentação técnica:
**gerar → auditar → corrigir → re-ancorar**.

| Skill | Faz o quê | Gatilho |
|---|---|---|
| `code-docs` | Gera suíte de docs com evidências (âncoras `arquivo:linha`, RN/UC/R) | Documentar projeto do zero, onboarding |
| `docs-audit` | Audita docs vs código/execução, achados Q-xx **sem corrigir** | Suspeita de drift, docs herdadas |
| `guided-fix` | Entrevista D-xx → TODO faseado → código → validação → docs | Auditoria pronta, time quer resolver |
| `docs-reanchor` | Re-ancora docs após mudanças de código | Pós-refactor/feature/fix |

## Instalação

```bash
# no repositório alvo (workspace aberto no VS Code):
cd .github/skills/
unzip /caminho/para/doc-pipeline-skills.zip
```

Recarregue o VS Code. As skills passam a responder a slash commands
(`/code-docs`, `/docs-audit`, `/docs-reanchor`, `/guided-fix`) e a linguagem
natural (a `description` do frontmatter é a superfície de descoberta).

Requisitos: nenhuma dependência, script ou configuração — Markdown puro.

## Prompts de uso

### 1. Suíte completa (projeto sem docs)

```text
Documente este repositório do zero usando a skill code-docs.

Escopo: todo o código-fonte (ignore dependências e artefatos de build).
Idioma: docs em português; identificadores e mensagens citados como estão no código.
Saída: suíte em docs/ + AGENTS.md na raiz como índice.

Não abra mão de:
- toda afirmação de comportamento com âncora arquivo:linha; o não-verificável
  vira "TODO: validar", nunca fato
- comandos marcados ✅ só depois de executados de verdade (e processos de servidor
  derrubados ao final do teste)
- regras confirmadas (RN-xx) separadas de hipóteses (H-xx)
- ao terminar, executar a revisão da docs-audit e corrigir os erros factuais
  antes de me entregar

Comece pelo mapa do repositório e me mostre o plano de documentos antes de gerar.
```

### 2. Documento único

```text
Use a skill code-docs para gerar apenas o docs/build-and-run.md deste projeto.
Pré-requisitos de fases anteriores que não existirem viram TODO: validar.
```

### 3. Incremental (docs existentes)

```text
Use a skill code-docs em modo incremental: docs/ já existe — mapeie os artefatos
à estrutura atual, preencha lacunas e re-ancore o que estiver desatualizado
(docs-reanchor), sem criar suíte paralela.
```

### 4. Auditoria de docs

```text
Use a skill docs-audit: verifique as docs de docs/ contra o código e execuções
reais. Registre achados em docs/open-questions.md sem corrigir nada.
```

### 5. Correção guiada (após auditoria)

```text
Use a skill guided-fix a partir de docs/open-questions.md: entreviste-me para
transformar hipóteses e achados em decisões D-xx, gere o TODO.md faseado,
execute código+testes com validação real e sincronize a documentação.
```

### 6. Re-ancoragem pós-mudança

```text
Acabei de alterar <arquivos ou módulos>. Use a skill docs-reanchor para
atualizar âncoras, contagens e pendências nos docs que referenciam o que mudou.
```

### 7. Manutenção de rotina (pós-merge)

```text
Use a skill docs-reanchor sobre o delta do último merge: verifique âncoras
deslocadas, contagens de testes e pendências resolvidas; risque o que foi
resolvido com data, sem apagar histórico.
```

### 8. Pipeline completo (docs + auditoria + correção)

```text
Neste repositório: (1) gere a suíte de documentação com a skill code-docs;
(2) audite o resultado com a docs-audit; (3) apresente-me os achados e me
entreviste sobre as decisões (guided-fix) antes de qualquer mudança de código.
```

## Anatomia do prompt ideal

| Bloco | Função |
|---|---|
| 1ª linha | Dispara a descoberta da skill (bate na `description`) |
| Escopo/Idioma/Saída | Preferências que a skill não decide sozinha |
| "Não abra mão de" | Reforça as regras globais (piso de qualidade mesmo sem `references/` carregados) |
| Ponto de controle | "me mostre o plano antes de gerar" — valida antes de pagar o custo |

## Estrutura do pacote

```text
code-docs/SKILL.md              # regras globais + pipeline + modos de execução
code-docs/references/           # guias por fase (carregados sob demanda)
  structure.md                  #   Fase 1: repository-map, architecture, modules
  behavior.md                   #   Fase 2: domain, business-rules, flows
  operations.md                 #   Fase 3: data-model, build-and-run, risks, índice
docs-audit/SKILL.md
docs-reanchor/SKILL.md
guided-fix/SKILL.md
README.md                       # este arquivo
```

## Origem

Skills extraídas de um processo real de documentação → auditoria → correção
guiada → re-ancoragem (projeto calculadora, 2026-09-22). O histórico de prompts
que as originou está em `docs/prompts-history.md` do projeto de origem.

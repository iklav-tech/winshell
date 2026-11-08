---
name: guided-fix
description: 'Orquestra correção guiada de codebase: entrevista o mantenedor para transformar hipóteses e achados de auditoria em decisões numeradas (D-xx), gera TODO faseado, executa código+testes com validação real e sincroniza a documentação. Use quando há auditoria/pendências acumuladas e o time decidiu (ou quer decidir) como resolvê-las.'
argument-hint: '[caminho-do-registro-de-pendencias]'
user-invocable: true
---

# Correção guiada por decisões

## Quando usar

- Auditoria concluída (skill `docs-audit`) com achados e pendências humanas
- Hipóteses H-xx acumuladas que alguém precisa decidir
- Dívida técnica mapeada esperando execução coordenada

## Objetivo

Transformar **decisões humanas** em **mudanças de código validadas** e
**documentação sincronizada**, com rastreabilidade ponta a ponta: cada mudança de
código referencia a decisão que a habilitou; cada decisão referencia a hipótese ou
achado que a originou.

## Etapas

### Fase 0 — Entrevista (bloqueante)

1. Leia o registro de pendências (ex.: `docs/open-questions.md`) e o TODO existente.
2. Formule **uma pergunta por decisão**, numerada (D-01, D-02, …), cada uma com:
   - contexto mínimo (o que o código faz hoje, com âncora)
   - opções concretas (2–3, com trade-off)
   - recomendação explícita (o agente recomenda; o humano decide)
3. Registre as respostas verbatim no TODO. **Nenhuma mudança de código antes de
   todas as decisões estarem registradas.**
4. Decisões podem incluir "adiar" — adiar também é registrado e vira pendência.

### Fase 1 — Correções de documentação

Achados factuais da auditoria (Q-xx) que não dependem de decisões: corrija
diretamente nos docs (âncoras, literais, drift). Cada correção referencia o Q-xx.

### Fase 2 — Mudanças de código

Para cada tarefa C-xx habilitada por uma decisão D-xx:

1. Edite o código respeitando as convenções do projeto (idioma das mensagens,
   camadas, restrições de dependência — leia o índice raiz, ex.: `AGENTS.md`).
2. **Contrato de API mudou?** Atualize todos os clientes no mesmo conjunto de
   mudanças (não há teste de contrato que detecte a quebra por você).
3. Tarefa de código só é marcada concluída com validação real (ver Fase 2b).

### Fase 2b — Testes

- Todo comportamento decidido em D-xx ganha teste que o registra (o teste é a
  memória executável da decisão).
- Testes seguem as convenções do projeto; sem dependências novas salvo necessidade
  real.
- Rede externa em teste unitário → mock.

### Validação (obrigatória antes da Fase 3)

Executar a suíte completa do projeto: build, testes, execução real dos fluxos
principais **e dos fluxos de erro decididos** (ex.: chamadas reais aos endpoints,
CLI com entrada inválida). Registrar saídas literais. Qualquer falha → corrigir
antes de prosseguir; não avance para documentação com validação vermelha.

### Fase 3 — Sincronização de documentação

1. Re-ancore tudo que mudou (delegue à skill `docs-reanchor` se disponível).
2. Hipóteses resolvidas → riscadas com referência à decisão (H-xx → D-xx).
3. Novos comportamentos → novas regras RN-xx / fluxos UC-xx com evidência.
4. Matriz de riscos: riscos mitigados → riscados com data.
5. Registro de pendências: marque resolvidos **com data, sem apagar histórico**.
6. TODO: marque as caixas concluídas e anexe um registro de execução (o que rodou,
   o que passou, o que ficou pendente).

## Regras

- **Decisão antes de código**: sem D-xx registrada, a mudança correspondente não
  acontece. Dúvida nova descoberta no meio? Nova pendência, nova pergunta — não
  decida pelo mantenedor.
- **Não reabra decisões**: D-xx registrada é final nesta execução.
- **Validação real, não assumida**: "deve funcionar" não conta; executou e passou
  conta. Saída literal registrada.
- **Escopo mínimo por mudança**: uma decisão = um conjunto coerente de edições;
  não misture decisões no mesmo edit.
- **Convenções do projeto prevalecem**: idioma, camadas, restrições de dependência,
  formato de commits — leia antes de editar.
- **Stack-agnostic**: os comandos de validação são os do próprio projeto
  (descobertos via manifestos/README/CI), não um conjunto fixo.

## Artefatos

| Artefato | Papel |
|---|---|
| `TODO.md` (raiz) | Decisões D-xx + tarefas C-xx/M-xx faseadas + prompt reutilizável + registro de execução |
| Código alterado | Cada mudança referenciando sua D-xx |
| Testes novos | Um por comportamento decidido |
| Docs sincronizados | Âncoras, regras, matrizes, pendências (via `docs-reanchor`) |
| Registro de pendências atualizado | Resolvidos riscados com data, histórico preservado |

## Critérios de qualidade

1. 100% das decisões D-xx têm resposta registrada verbatim antes da Fase 2.
2. Toda mudança de código rastreia: achado/hipótese → decisão → tarefa → teste.
3. Validação executada de ponta a ponta com saídas registradas; zero falhas.
4. Documentação re-ancorada e consistente com o código pós-mudança.
5. Histórico preservado em todos os registros (nada apagado, tudo riscado com data).
6. TODO final: caixas marcadas + registro de execução + pendências remanescentes
   listadas.

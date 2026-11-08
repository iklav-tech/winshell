---
name: docs-audit
description: 'Audita documentação técnica contra o código-fonte e execuções reais, registrando achados classificados (erros factuais, imprecisões, drift entre docs, inferências) sem corrigir nada. Use quando suspeitar de docs desatualizadas, antes de confiar em docs herdadas, ou como preparação para uma correção guiada.'
argument-hint: '[caminho-dos-docs-opcional]'
user-invocable: true
---

# Auditoria de documentação vs código

## Quando usar

- Docs que podem ter ficado desatualizadas após mudanças de código
- Docs herdadas de outro time/geradas por ferramenta, antes de confiar nelas
- Como etapa final (**Revisão**) do fluxo de construção de documentação
  (skill `code-docs`) — nenhuma suíte de docs deve ser entregue sem esta passada
- Preparação de um plano de correção (a saída alimenta a skill `guided-fix`)

## Objetivo

Verificar cada afirmação verificável da documentação contra o código e o ambiente
real, produzindo um **registro completo e classificado de achados** — sem corrigir
nada silenciosamente. A auditoria separa o papel de quem **verifica** do de quem
**decide**.

## Etapas

1. **Extrair afirmações**: leia todos os documentos e liste o que é verificável —
   âncoras `arquivo:linha`, comportamentos descritos, comandos, contagens, relações
   entre documentos.
2. **Verificar âncoras**: para cada `arquivo:linha`, confirme no código (leitura ou
   busca). Todas — verificação de âncora não é amostral.
3. **Verificar comportamentos**: execute o que for executável (testes, comandos,
   interfaces do sistema) e compare com o descrito; registre a saída literal quando
   divergir.
4. **Verificar consistência interna**: procure drift — o mesmo fato afirmado
   diferentemente em dois documentos, ou pendência já respondida por outro doc.
5. **Classificar cada achado**:
   - 🔴 erro factual confirmado (doc contradiz código/execução)
   - 🟡 imprecisão menor (paráfrase, âncora fora por 1 linha)
   - 🔵 drift entre documentos
   - ⚪ inferência apresentada como fato
   - 🧑 exige decisão humana (intenção, requisito)
6. **Registrar**: um achado = um item Q-xx com (a) o que o doc afirma, em citação
   literal; (b) o que a realidade mostra, com evidência; (c) onde mais o erro
   aparece; (d) ação pendente.
7. **Registrar confirmações**: liste uma amostra das verificações que **passaram** —
   dá confiança à auditoria e delimita o que foi coberto.
8. **Recomendar** próximos passos (sem executar): o que corrigir, o que decidir.

## Regras

- **Nenhuma correção durante a auditoria** — achados são registrados, não aplicados.
- Cada Q-xx precisa de evidência reproduzível (comando, busca, leitura de linha).
- Distinga "não verifiquei" de "verifiquei e está errado".
- Execuções devem ser seguras e reversíveis; nada de comandos destrutivos.
- Comandos executados ficam registrados com o resultado observado.
- Suíte de docs grande? Audite por documento e consolide no final.
- Stack-agnostic: use os comandos do próprio projeto (manifestos, README, CI).

## Artefatos

- `docs/open-questions.md` — achados Q-xx agrupados por severidade + tabela de
  pendências humanas (🧑) + amostra de verificações corretas + recomendações.

## Critérios de qualidade

1. 100% das âncoras dos docs verificadas (nenhuma por amostragem).
2. Todo comportamento executável foi testado ou explicitamente marcado como não
   testado (com motivo).
3. Todo Q-xx cita o doc (literal) **e** a evidência contrária (literal).
4. Nenhuma correção foi aplicada a docs ou código.
5. A tabela de pendências humanas cobre todos os 🧑 sem sobreposição.

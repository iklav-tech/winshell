# Fase 2 — Comportamento: o que faz?

> Guia detalhado da fase 2 da skill `code-docs`. As regras globais e os modos de
> execução estão no [SKILL.md](../SKILL.md). Pré-requisito: fase 1 — o vocabulário
> de módulos e componentes vem de lá.

## 2.1 `docs/domain.md` — Domínio

**Propósito**: vocabulário e conceitos do negócio, nos termos do código.

**Onde procurar** (checklist de caça): nomes de classes/funções/variáveis,
estruturas de dados, validações, cálculos e fluxos — os conceitos de domínio
vivem nesses cinco lugares.

**Seções sugeridas**:

1. Conceitos centrais (entidade, operação, sessão, o que for) — definição de 1-2
   linhas + onde vive no código
2. Relações entre conceitos (composição, pertencimento, referência — com âncora
   da relação no código)
3. Vocabulário cruzado: como cada módulo chama o mesmo conceito (mesmo nome?
   tradução? sinônimo?)
4. Estados e ciclos de vida (se houver)
5. O que está fora do domínio (explícito)
6. Pendências

**Evidência específica**:

- Termos tal como aparecem no código (incluindo o idioma do código) — o doc de
  domínio registra, não traduz.

**Armadilhas**:

- Inventar termos "mais corretos" que o código não usa — isso vira regra falsa na
  seção seguinte.

**Critério de qualidade**: cada conceito tem âncora; a tabela de vocabulário cruzado
cobre todos os módulos que tocam o conceito.

## 2.2 `docs/business-rules.md` — Regras de negócio

**Propósito**: separar o **confirmado** do **hipotético**.

**Onde procurar** (checklist de caça): validações, condições, fórmulas, limites,
estados e decisões — toda regra de negócio implementada aparece em pelo menos um
desses seis lugares.

**Seções sugeridas**:

1. Regras confirmadas RN-xx — descrição + localização (`arquivo:linha`) + evidência
   literal (trecho de código) + exceções
2. Hipóteses H-xx — comportamento ambíguo que exige decisão humana: o que se
   observa, quais interpretações são possíveis, onde registrar a resposta
3. Tabela de status das hipóteses (aberta / resolvida → vira RN ou é descartada)
4. Pendências

**Evidência específica**:

- RN sem trecho literal de código não é RN — é hipótese.
- Regra implementada em N lugares (clientes duplicando validação)? Registre as N
  âncoras — isso é risco, não conforto.

**Armadilhas**:

- Regra de framework/infra ≠ regra de negócio (roteamento, serialização) — se
  incluir, marque a diferença.
- Documentar intenção: o doc registra o comportamento; a intenção é hipótese.

**Critério de qualidade**: 100% das RN têm evidência literal; toda H diz
explicitamente o que falta decidir.

## 2.3 `docs/flows.md` — Fluxos (casos de uso)

**Propósito**: entrada → saída, passo a passo, incluindo caminhos de erro.

**Seções sugeridas**:

1. Catálogo de atores (usuário, cliente HTTP, agendador…)
2. UC-xx por fluxo: ator, entrada, processamento (passos numerados com âncoras),
   dependências, persistência (ou sua ausência explícita), saída
3. **Fluxos de erro como UC de primeira classe** — mesmo rigor do fluxo feliz
4. Diagrama de sequência por fluxo principal (Mermaid, se suportado)
5. Matriz resumo (UC × ator × persistência × rede)
6. Pendências

**Evidência específica**:

- Cada passo do processamento cita `arquivo:linha`.
- Mensagens de erro em literal, não paráfrase.

**Armadilhas**:

- Só o caminho feliz — o fluxo de erro é onde os docs costumam mentir.
- Diagrama bonito que não corresponde aos passos ancorados — o diagrama é resumo
  dos passos, não fonte.

**Critério de qualidade**: para todo UC existe o UC de erro correspondente (ou "não
há erro possível — porque…"); a matriz resumo é coerente com os UC descritos.

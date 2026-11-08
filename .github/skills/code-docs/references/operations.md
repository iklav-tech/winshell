# Fase 3 — Operações: como roda?

> Guia detalhado da fase 3 da skill `code-docs`. As regras globais e os modos de
> execução estão no [SKILL.md](../SKILL.md). Pré-requisitos: fases 1 e 2.

## 3.1 `docs/data-model.md` — Dados e integrações

**Propósito**: estruturas de dados, seus relacionamentos e quem lê/escreve cada
campo.

**Onde procurar** (checklist de caça): entidades/modelos, tabelas e schemas,
arquivos lidos/escritos em runtime, DTOs, estruturas persistidas (banco, cache,
storage de browser).

**Seções sugeridas**:

1. Estruturas de dados (campos, tipos, produtores, consumidores) — uma tabela por
   estrutura
2. Relacionamentos entre estruturas (referências, chaves, composição — com âncora)
3. Persistência: o que sobrevive ao processo (banco, arquivo, localStorage, cookies)
   — ou declaração explícita de que nada sobrevive
4. Contratos entre módulos (payloads, schemas — ou sua ausência)
5. Dados sensíveis (há? trafegam?)
6. Pendências

**Evidência específica**:

- "Quem consome" exige busca de usos do campo, não suposição.
- Persistência declarada ausente deve dizer como foi verificada (busca por
   storage/DB/file no código).

**Armadilhas**:

- Persistência escondida (cache de browser, arquivo escrito em runtime).
- DTO/estrutura órfã — existe mas ninguém usa; registre como fato + pendência.

**Critério de qualidade**: todo campo tem produtor e consumidor (ou "órfão —
pendência"); a seção de persistência afirma algo verificável.

## 3.2 `docs/build-and-run.md` — Build e testes

**Propósito**: como compilar, testar e executar — com status de verificação.

**Seções sugeridas**:

1. Pré-requisitos de ambiente (versões **detectadas**, não as declaradas)
2. Por módulo: build, testes, execução — cada comando com status:
   - ✅ confirmado (executado nesta sessão; registrar saída essencial)
   - ⚠️ inferido (lido de README/manifesto; não executado — dizer por quê)
3. Exemplos de uso real (chamadas de API, comandos de CLI com saída literal)
4. Matriz de status por módulo (build / testes / execução)
5. Diferenças entre documentação existente (READMEs) e realidade
6. Pendências

**Evidência específica**:

- ✅ só depois de executar de verdade; registre exit code / saída-chave.
- Comando interativo/de servidor: execute, verifique porta/resposta e **derrube o
  processo** — não deixe nada rodando ao sair.

**Armadilhas**:

- Copiar comando do README sem testar e marcar ✅.
- Teste que "deveria" passar: registre o resultado real, inclusive a falha — falha
  é achado, não empecilho.

**Critério de qualidade**: nenhum comando sem status; toda falha observada está na
seção de diferenças.

## 3.3 `docs/technical-risks.md` — Riscos técnicos

**Propósito**: o que evitar e onde o projeto pode morder.

**Onde procurar** (checklist de caça): dependências circulares, código duplicado,
componentes excessivamente acoplados, módulos críticos sem testes, dependências
antigas/EOL e pontos únicos de conhecimento.

**Seções sugeridas**:

1. Riscos R-xx, cada um: descrição, categoria (duplicação, acoplamento, testes,
   dependências, conhecimento, higiene…), severidade (🔴🟡🟢), evidência (âncoras)
2. Matriz consolidada no final
3. Observações finais (padrões entre riscos)
4. Pendências

**Evidência específica**:

- Risco sem evidência é opinião — ou ancora, ou marca como inferência.
- Severidade que depende de fato externo (EOL, data de release) → marque a
  dependência explicitamente.

**Armadilhas**:

- Lista de desejos disfarçada de riscos ("falta X" sem consequência concreta).
- Riscos genéricos aplicáveis a qualquer projeto — o valor está no específico.

**Critério de qualidade**: todo R-xx tem categoria, severidade e ≥1 âncora; a matriz
cobre 100% dos riscos descritos.

## 3.4 Índice raiz (`AGENTS.md` ou equivalente)

**Propósito**: porta de entrada — pergunta → documento.

**Seções sugeridas**:

1. Estrutura do repo (tabela curta)
2. Comandos essenciais **confirmados** (com armadilhas conhecidas)
3. Tabela pergunta → documento (cobrindo 100% da suíte)
4. Convenções observadas no código
5. Regras de ouro para alterações (incluindo: mudou API → atualizar clientes;
   pendências novas → `TODO: validar` no doc correspondente)

**Armadilhas**:

- Duplicar conteúdo dos docs — o índice aponta, não repete (drift garantido).
- Comandos não verificados apresentados como fato.

**Critério de qualidade**: curto (é lido a cada sessão); toda linha de comando tem
origem no `build-and-run.md`; a tabela cobre todos os docs da suíte.

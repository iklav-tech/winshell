# Fase 1 — Estrutura: o que existe?

> Guia detalhado da fase 1 da skill `code-docs`. As regras globais e os modos de
> execução estão no [SKILL.md](../SKILL.md). Pré-requisito: nenhum.

## 1.1 `docs/repository-map.md` — Inventário

**Propósito**: responder "o que existe onde" sem precisar ler o código todo.

**Seções sugeridas**:

1. Visão geral — quantos módulos, há build/orquestração na raiz?
2. Árvore de diretórios — anote o que é fonte vs artefato de build
   (`target/`, `node_modules/`, `dist/`, `__pycache__/`…)
3. Por módulo: identificação, dependências externas **declaradas vs efetivamente
   usadas**, componentes internos (tabela arquivo → responsabilidade), configuração,
   testes (arquivos, contagem, comando)
4. Arquivos de configuração consolidados (tabela: arquivo → módulo → função)
5. Ausências relevantes — CI/CD, ignore files, `.env.example`, testes
6. Pendências (`TODO: validar`)

**Evidência específica**:

- "Dependência declarada mas não usada" exige busca de usos (imports, referências);
  registre o método da busca junto ao veredito.
- Árvore vem de listagem real do diretório, nunca de memória.

**Armadilhas**:

- "Presente na árvore de trabalho" ≠ "versionado" — sem acesso ao VCS são coisas
  diferentes; diga qual das duas você verificou.
- README descreve comandos ideais, não reais — aponte a divergência como pendência
  (a verificação executável é da fase 3).

**Critério de qualidade**: toda dependência da tabela tem veredito de uso
(sim/não/parcial) com o método de verificação anotado.

## 1.2 `docs/architecture.md` — Arquitetura

**Propósito**: como os módulos se conectam e por quê.

**Seções sugeridas**:

1. Estilo geral (monólito + clientes? bibliotecas? serviços?) com evidências
2. Módulos e responsabilidades (uma linha cada)
3. Como se conectam: chamadas locais, rede, contratos (API/mensagens), quem depende
   de quem
4. Camadas internas de cada módulo (se houver)
5. Diagrama de dependências (Mermaid ou texto)
6. Decisões observáveis no código (stateless, sem persistência, sync/async…)
7. Pendências

**Evidência específica**:

- Cada seta do diagrama corresponde a um ponto real do código (import, chamada HTTP,
  config de porta) — ancore pelo menos uma vez por seta.

**Armadilhas**:

- Desenhar a arquitetura *pretendida*: se o código diverge do óbvio, registre a
  divergência em vez de "corrigir" o desenho.

**Critério de qualidade**: o diagrama é derivável das âncoras citadas; nenhuma seta
sem evidência.

## 1.3 `docs/modules/<modulo>.md` — um por módulo

**Propósito**: detalhe de um módulo para quem vai mexer nele.

**Seções sugeridas** (template fixo — facilita comparação entre módulos):

1. Responsabilidade (com evidências)
2. Entradas (tabela: origem, formato, validação)
3. Saídas (sucesso **e** erro — em formato literal)
4. Componentes/funções principais
5. Dependências internas (diagrama pequeno) e externas (declaradas vs usadas)
6. Dados manipulados
7. Efeitos colaterais (rede, disco, saída de processo, armazenamento de browser…)
8. Testes (arquivos, casos, comando)
9. Configuração e execução
10. Módulos relacionados (quem consome este módulo / o que ele consome; relação
    direta vs apenas runtime)
11. Pendências

**Evidência específica**:

- Entradas/saídas em literal (o JSON exato, a mensagem exata), não paráfrase —
  paráfrase esconde divergência.

**Armadilhas**:

- Efeitos colaterais esquecidos: localStorage, variáveis de ambiente lidas, códigos
  de saída, logs.
- Documentar o módulo ideal: se falta validação, isso é fato a registrar (ou
  pendência), não silêncio.

**Critério de qualidade**: as 10 seções existem (mesmo que algumas digam "não se
aplica — porque…"); saídas de erro têm exemplo literal.

---
name: docs-reanchor
description: 'Re-ancora documentação técnica após mudanças de código — atualiza referências arquivo:linha deslocadas, contagens, tabelas de status e pendências resolvidas. Use depois de qualquer edição de código em projeto com docs ancoradas, ou ao notar âncoras apontando para linhas erradas.'
argument-hint: '[arquivos-de-código-alterados]'
user-invocable: true
---

# Re-ancoragem de documentação após mudanças

## Quando usar

- Qualquer mudança de código em projeto com docs ancoradas (refactor, feature, fix)
- Docs que citam linhas/contagens que sabidamente mudaram
- Manutenção de rotina pós-merge

## Objetivo

Sincronizar a documentação com o novo estado do código, **sem perder histórico**:
âncoras atualizadas, itens resolvidos riscados (não apagados), pendências novas
registradas.

## Etapas

1. **Coletar o delta**: identifique exatamente o que mudou no código — arquivos
   tocados, linhas adicionadas/removidas por arquivo, novos arquivos, arquivos
   removidos.
2. **Mapear o impacto**: para cada arquivo alterado, busque em TODOS os docs as
   referências a ele (`grep` por `nome-do-arquivo` e por `nome-do-arquivo:NN`).
   Referências a arquivos não alterados não precisam de revisão.
3. **Recalcular âncoras**: para cada referência atingida, leia o arquivo novo e
   localize o conteúdo referenciado (não apenas a linha — confirme que o conteúdo
   ainda existe; se não existe, a afirmação inteira precisa de revisão).
4. **Atualizar contagens e tabelas**: número de testes, matrizes de status/risco,
   listas de arquivos, árvores de diretórios.
5. **Resolver pendências atingidas**: pendência que a mudança resolveu → riscar com
   data e referência à decisão/mudança. Pendência que a mudança **cria** → registrar
   como `TODO: validar` no documento correspondente.
6. **Atualizar o índice raiz** (ex.: `AGENTS.md`) se comandos, contagens ou
   armadilhas mudaram.
7. **Verificação final**: re-busque as âncoras antigas — nenhuma referência ao
   estado pré-mudança pode ter sobrado sem nota histórica.

## Regras

- **Histórico é preservado**: item resolvido é riscado com data, nunca removido.
- **Conteúdo > número de linha**: ao re-ancorar, confirme que o conteúdo na nova
  linha é o mesmo afirmado; se o conteúdo mudou, a afirmação muda, não só a âncora.
- **Sem escopo silencioso**: docs não relacionados ao delta não são tocados.
- **Sem invenção**: comportamento novo sem evidência → `TODO: validar`.
- **Edição em lote**: agrupe as edições por arquivo de doc; ao final, verifique que
  não criou duplicatas de seção/tabela (erro comum em edições grandes).
- **Stack-agnostic**: o delta vem de qualquer VCS ou até de sessão de edição; o que
  importa é o estado final dos arquivos.

## Artefatos

- Docs atualizados in-place (âncoras, contagens, matrizes, pendências)
- Opcional: nota de re-ancoragem na seção de pendências de cada doc tocado
  (data + motivo)

## Critérios de qualidade

1. Zero referências a âncoras antigas sem nota histórica explícita.
2. Toda âncora nova aponta para o conteúdo afirmado (verificar por amostragem ≥10).
3. Contagens (testes, arquivos, itens) conferem com o estado atual do código.
4. Pendências resolvidas riscadas com data; novas pendências registradas.
5. Nenhuma seção/tabela duplicada nos docs editados.

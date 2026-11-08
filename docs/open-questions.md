# Questões abertas e auditoria

## Confirmado pelo código/testes

- UUID `winshell@iklav-tech`, Shell 46, integer version 5 e version-name 0.4.1.
- Onze chaves GSettings, sem migração na v0.4.1.
- Cinco modelos Snap e geometria pura.
- Calendário com grade fixa 6×7, navegação e locale.
- Agrupamento/ordenação/sanitização de notificações.
- Capacidade/labels de janelas e normalização de controles.
- Imports relativos, sintaxe JS/Bash e schema válidos quando `check.sh` passa.

## Não confirmado neste ambiente

- Renderização e interação reais dentro do processo GNOME Shell 46.
- Compatibilidade de todas as variantes de hardware/driver e políticas D-Bus.
- Resultado visual claro/escuro e escalas fracionárias.
- Ausência de leaks após ciclos longos de enable/disable/hotplug.
- GVC com cada combinação PulseAudio/PipeWire.
- Comportamento de notificações residentes/críticas de aplicativos reais.

## Decisões de produto abertas

- H-01: reordenação gráfica de fixados.
- H-02: estado sem monitor durante hotplug.
- H-05: confirmação antes de “Fechar todas”.
- H-06: política visual para notificações residentes recriadas.
- H-07: fallback de áudio caso GVC deixe de ser acessível numa futura versão.

Qualquer resposta ainda não exercitada em sessão real deve permanecer marcada como `TODO: validar`.


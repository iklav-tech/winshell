# Questões abertas e auditoria

## Confirmado pelo código/testes

- UUID `winshell@iklav-tech`, Shell 46, integer version 10 e version-name 0.5.3.
- Vinte e cinco chaves GSettings; as chaves v0.4.x foram preservadas.
- Assets SVG parseáveis, metadata de fallback, licenças, geração por tokens e instalação XDG isolada.
- Backup v1 idempotente, detecção de divergência e restauração sob backend de teste.
- Cinco modelos Snap e geometria pura.
- Calendário com grade fixa 6×7, navegação e locale.
- Agrupamento/ordenação/sanitização de notificações.
- Capacidade/labels de janelas e normalização de controles.
- Imports relativos, sintaxe JS/Bash e schema válidos quando `check.sh` passa.
- Imports internos do Shell isolados em `shellCompat.js`, geometria de popup com origens negativas testada e chrome removido explicitamente.
- Busca do Start, prioridade de fixados, transições de fixação e decisão
  ativar/minimizar cobertas pelo modelo puro `shellFoundationModel.mjs`.

## Não confirmado neste ambiente

- Renderização e interação reais dentro do processo GNOME Shell 46.
- Compatibilidade de todas as variantes de hardware/driver e políticas D-Bus.
- Resultado visual claro/escuro e escalas fracionárias.
- Resultado GTK3/GTK4 por aplicativo e limites específicos de Libadwaita.
- DING e Nautilus-python no perfil gráfico real.
- Ausência de leaks após ciclos longos de enable/disable/hotplug.
- Restauração runtime após disable, restart/crash e reativação manual de cada dock suportado.
- GVC com cada combinação PulseAudio/PipeWire.
- Comportamento de notificações residentes/críticas de aplicativos reais.

## Decisões de produto abertas

- H-01: reordenação gráfica de fixados.
- H-02: estado sem monitor durante hotplug.
- H-05: confirmação antes de “Fechar todas”.
- H-06: política visual para notificações residentes recriadas.
- H-07: fallback de áudio caso GVC deixe de ser acessível numa futura versão.

Qualquer resposta ainda não exercitada em sessão real deve permanecer marcada como `TODO: validar`.


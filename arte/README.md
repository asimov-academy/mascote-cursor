# Fontes das poses

Estas oito folhas foram geradas com IA para este projeto, usando como referência
somente os nossos personagens originais. Cada arquivo contém 12 bustos completos,
em 3 colunas e 4 linhas, sobre fundo magenta (verde no Novelo). O fundo é técnico e
não aparece no site. Breu e Bolota não têm folha gerada: são os SVGs de exemplo da
skill (`skills/mascote-cursor/references/`), exportados para PNG pelo revisor de poses.

O [guia de criação](../skills/mascote-cursor/references/criar.md) registra o prompt
reutilizável e os critérios de revisão. A [autoria](../docs/autoria.md) registra a
descrição de cada personagem. A versão 1, no histórico do Git, preserva as bases iniciais.
As folhas finais podem resultar de correções de geração; o resultado visual não é
reproduzível por uma seed, mas a exportação dos PNGs distribuídos é determinística.

Para reconstruir os oito atlas gerados a partir destas fontes:

```bash
node scripts/reconstruir-artes.mjs
```

O comando substitui as saídas canônicas em `skills/mascote-cursor/assets/mascotes/`.
`manifesto.json` registra a cor de fundo e a correção de ordem dos lados de cada folha.
Todas as oito seguem a ordem padrão. Pingo, Broto, Faísca, Nimbo e Grão saíram na
versão 3; as fontes deles continuam no histórico do Git.

Estas fontes não são copiadas para o site do usuário. A skill leva os dez atlas já
preparados; o instalador copia somente o personagem escolhido.

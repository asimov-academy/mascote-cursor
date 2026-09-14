# Fontes das poses

Estas dez folhas foram geradas com IA para este projeto, usando como referência
somente os nossos personagens originais. Cada arquivo contém 12 bustos completos,
em 3 colunas e 4 linhas, sobre fundo magenta. O fundo é técnico e não aparece no site.

O [guia de criação](../skills/mascote-cursor/references/criar.md) registra o prompt
reutilizável e os critérios de revisão. A [autoria](../docs/autoria.md) registra a
descrição de cada personagem. A versão 1, no histórico do Git, preserva as bases iniciais.
As folhas finais podem resultar de correções de geração; o resultado visual não é
reproduzível por uma seed, mas a exportação dos PNGs distribuídos é determinística.

Para reconstruir exatamente os dez atlas a partir destas fontes:

```bash
node scripts/reconstruir-artes.mjs
```

O comando substitui as saídas canônicas em `skills/mascote-cursor/assets/mascotes/`.
`manifesto.json` registra a cor de fundo e a correção de ordem dos lados. Broto foi
gerado com esquerda e direita invertidas: a preparação troca as células, sem espelhar
folhas, luz ou traços do personagem. As outras nove folhas seguem a ordem padrão.

Estas fontes não são copiadas para o site do usuário. A skill leva os dez atlas já
preparados; o instalador copia somente o personagem escolhido.

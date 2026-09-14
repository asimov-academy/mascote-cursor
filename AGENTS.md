# Para agentes que trabalham neste repositório

Este projeto distribui uma skill em português, um Web Component sem dependências
de execução e exatamente dez mascotes originais. O objetivo é facilitar a vida de
quem não programa. Não transforme o fluxo padrão em uma cadeia de geração de imagens.

## Onde trabalhar

- `skills/mascote-cursor/SKILL.md`: contrato de execução para agentes consumidores.
- `skills/mascote-cursor/assets/`: fonte canônica do motor, catálogo e artes.
- `skills/mascote-cursor/scripts/instalar.mjs`: instalador local, sem rede.
- `skills/mascote-cursor/references/`: integração e criação personalizada.
- `index.html` e `demo/`: demonstração pública em português.
- `docs/`: explicação do processo, autoria e contribuição.
- `testes/`: testes de comportamento e distribuição.

## Regras de manutenção

1. Preserve a quantidade de dez mascotes prontos. Personagens de usuários entram via
   `atlas`, não por expansão do catálogo oficial.
2. Não use código, prompts, textos ou imagens da referência. A inspiração conceitual
   está documentada em `docs/processo.md`; não há dependência dela.
3. Não duplique o motor em `src/`, `dist/` ou na demonstração. Todos usam a fonte na skill.
4. Interface, documentação, mensagens de erro e comentários novos ficam em português.
   Nomes exigidos por ferramentas, como `SKILL.md` e `package.json`, permanecem como são.
5. Não sobrescreva arquivos divergentes na instalação. Verifique conflitos antes de copiar.
6. Preserve teclado, toque, movimento reduzido, pausa e limpeza de recursos ao desmontar.
   Não introduza loop de animação permanente, telemetria ou requisições externas.
7. Não presuma que existe um pacote npm publicado. A distribuição é pelo repositório/skill.
8. Atualize README e referências quando alterar comandos ou atributos públicos.

## Verificação

Para abrir a demonstração: `npm run dev` (Node 22 ou superior; não precisa npm install).
Para os testes: `npm ci`, `npx playwright install chromium webkit`, `npm run verificar`.
O Playwright só é dependência de desenvolvimento. Confira a demo em desktop e celular
após mudanças visuais e confira as nove direções da cabeça no personagem montado. Cada PNG é uma grade 3 × 4 com rosto completo.

Ao entregar, relate o resultado, os testes executados e qualquer limitação real.
Não anuncie publicação no npm, GitHub Pages ou hospedagem que não tenha ocorrido.

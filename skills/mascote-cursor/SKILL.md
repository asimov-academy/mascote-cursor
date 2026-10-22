---
name: mascote-cursor
description: Adiciona um mascote interativo a sites, acompanhando o mouse e reagindo ao toque. Use quando a pessoa pedir um personagem no site, um mascote que olha para o cursor, um dos dez mascotes desta coleção ou uma versão personalizada. Integra HTML, React, Next.js, Vue, Svelte e Astro sem dependências de execução. Não é um aplicativo de mascote para a área de trabalho nem uma troca do cursor do sistema.
---

# Mascote Cursor

Transforme um pedido em português em um mascote funcionando na página real do usuário.
O pacote é autocontido: `assets/` guarda o componente, o catálogo e os dez PNGs.
Não precisa buscar imagens externas, instalar um pacote npm no site ou gerar novas poses.

## Caminho padrão: escolher → integrar → conferir

1. Leia as instruções do projeto e identifique a página desejada, a tecnologia e a pasta pública. Respeite o lugar e o personagem pedidos. Na ausência de escolha, use **Capi**, ao lado do título principal, sem cobrir texto ou controles. Informe essa decisão em uma frase.
2. Consulte o catálogo com `node "<pasta-da-skill>/scripts/instalar.mjs" --listar --json`. Nomes: `capi`, `pingo`, `broto`, `faisca`, `lume`, `caju`, `bento`, `nimbo`, `tico`, `grao`. A pasta da skill é a que contém este arquivo; não suponha que fica dentro do projeto do usuário.
3. Execute `node "<pasta-da-skill>/scripts/instalar.mjs" --mascote capi --dest "<pasta-publica>/mascote-cursor" --json`, substituindo nome e destino. O script copia somente a arte escolhida e o motor compartilhado. É seguro repetir com os mesmos arquivos. Se houver conflito, compare as versões ou use outro destino; o script não tem modo de sobrescrita forçada. Se Node não estiver disponível, copie os três módulos JS, `LICENCA.txt` e o PNG selecionado, preservando os caminhos relativos de `assets/`.
4. Leia [integração](references/integracao.md) apenas na seção da tecnologia encontrada. Edite o componente ou a página real. Uma pasta de disco não é uma URL: `public/mascote-cursor/mascote.js` normalmente é servido como `/mascote-cursor/mascote.js`. Considere o prefixo de deploy do projeto. Carregue o módulo uma vez. Para projetos existentes, preserve layout, estilos e convenções.
5. Abra a página pelo servidor do projeto. Verifique imagem carregada, cabeça nas oito direções e no centro, reação ao clique e ao teclado, largura de celular e movimento reduzido. Execute os checks existentes pertinentes. Corrija problemas de integração; não encerre apenas com arquivos copiados ou um trecho de exemplo. Se não houver navegador disponível, conclua as verificações possíveis e diga precisamente que a checagem visual ficou pendente.

Ao entregar, diga qual mascote entrou, em qual página, quais arquivos mudaram e o que foi verificado. Fale em português. Não publique o site ou envie mensagens a terceiros como parte da instalação.

## Quando o pedido for diferente

- **Outro dos dez:** execute o instalador com o novo nome e altere `mascote`. Não copie a coleção inteira sem necessidade.
- **Tamanho, posição ou pausa:** use os atributos e o CSS documentados em [integração](references/integracao.md). Não edite os pixels para isso.
- **Personagem autoral ou foto de referência:** leia [criar um mascote](references/criar.md). O resultado é uma folha 3 × 4 com nove direções da cabeça e três expressões. Comece pelo passo 0: veja quais ferramentas existem nesta sessão e escolha, ou pergunte, entre quatro caminhos: (a) gerador de imagem do próprio agente, (b) MCP de imagem conectado, (c) a pessoa gera em outro serviço com o pedido pronto, (d) você desenha um SVG seguindo [mascote em SVG](references/svg.md). Folhas geradas em PNG, JPG ou WebP passam pelo preparo (`scripts/preparar.mjs` ou o revisor no navegador); o SVG já sai pronto. Confira sempre no revisor de poses. Não diga que gerou uma imagem que não foi gerada.
- **Site ainda não existe:** monte uma página mínima na tecnologia escolhida pela pessoa. Não inicie uma reconstrução completa de produto para adicionar o mascote.

## Contrato do componente

`<mascote-cursor mascote="capi" tamanho="160"></mascote-cursor>` é um Web Component com estilos isolados. O CSS da página não altera as poses internas. O motor já oferece teclado, toque, pausa, movimento reduzido e descarte de listeners ao remover a instância. Preserve essas propriedades ao adaptar. Cada PNG contém as doze poses completas. Não substitua a rotação da cabeça por pupilas móveis ou inclinação do corpo.

Arquivos canônicos: `assets/mascote.js`, `assets/movimento.js`, `assets/catalogo.js` e `assets/mascotes/`. O preparo de folhas próprias fica em `scripts/atlas.js`, usado pelo comando e pelo revisor. Não invente um pacote publicado ou uma CDN. Use estes arquivos locais. O conjunto pronto continua com exatamente dez personagens; criações do usuário ficam no projeto dele, fora deste catálogo.

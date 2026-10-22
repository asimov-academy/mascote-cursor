# Mascote em SVG, desenhado pelo agente

Use este caminho quando não houver gerador de imagem, ou quando a pessoa preferir
um traço simples e sem custo. Qualquer agente que escreve código consegue fazer.
O resultado é **vetorial e flat**: formas lisas, cores chapadas. Não fica com cara
de argila como os dez prontos. Diga isso à pessoa antes de começar.

O SVG **não passa** pelo `preparar.mjs`. Ele já sai alinhado, com fundo transparente,
e vai direto no atributo `atlas`. Comece por um dos exemplos, copie para o projeto,
troque formas e cores e mantenha a estrutura:

- [exemplo-atlas.svg](exemplo-atlas.svg) (Bolota): flat, com orelhas, focinho e bochechas.
- [exemplo-minimalista.svg](exemplo-minimalista.svg) (Breu): cabeça lisa e olhos em
  pílula. Sem focinho, o giro aparece nos olhos atravessando o rosto e estreitando
  perto da borda. O contorno claro mantém o personagem escuro visível em fundo escuro.

## Regras da grade

- Raiz com `width="1536" height="2048" viewBox="0 0 1536 2048"`. Sem `width` e
  `height`, o navegador não informa o tamanho e o componente recusa o atlas.
- 12 células de 512 × 512: 3 colunas e 4 linhas. A célula `i` começa em
  `x = (i % 3) * 512` e `y = floor(i / 3) * 512`.
- Ordem das células:
  - Linha 1: cima e esquerda, cima, cima e direita.
  - Linha 2: esquerda, frente neutra, direita.
  - Linha 3: baixo e esquerda, baixo, baixo e direita.
  - Linha 4: piscando, sorrindo de olhos fechados, alegre de olhos abertos.
- Esquerda e direita são os lados de quem vê a tela.
- Fundo transparente. Não desenhe retângulo de fundo nem quadriculado.
- Mesma base dos ombros em todas as células. No exemplo, `y = 470`. Os ombros
  não se mexem; só a cabeça gira.
- Cada busto ocupa no máximo 78% da célula. Deixe pelo menos 24 pixels de folga
  em todas as bordas, inclusive para orelhas e antenas nas poses viradas.
- Arquivo autocontido: sem `<script>`, `<image>`, `<foreignObject>`, fontes ou
  links externos. Uma imagem carregada por `<img>` ignora tudo isso. Use só formas.
  Referências internas, como `<use href="#cabeca" />`, funcionam.

## Como simular o giro

Uma folha gerada mostra a cabeça girando de verdade. No SVG, você simula com
deslocamento: as peças mais à frente do rosto andam mais que as de trás.
Isso dá a sensação de um giro de cerca de 40° na horizontal e 22° na vertical.

Considere `h` e `v` de −1 a 1 (esquerda/cima = −1, centro = 0, direita/baixo = 1).
Valores do exemplo, para uma cabeça de raio 118:

| Peça                           | Deslocamento   | Escala quando vira                  |
| ------------------------------ | -------------- | ----------------------------------- |
| Orelhas (atrás)                | `6·h`, `2·v`   | nenhuma                             |
| Contorno da cabeça             | `16·h`, `10·v` | nenhuma                             |
| Olhos e bochechas              | `48·h`, `30·v` | 0,86 na horizontal, 0,9 na vertical |
| Focinho, nariz e boca (frente) | `62·h`, `38·v` | 0,86 na horizontal, 0,9 na vertical |

Mova cabeça, olhos, focinho e orelhas **juntos**, na mesma direção. Não mexa só as
pupilas e não incline o desenho inteiro. Para outra cabeça, ajuste os números na
proporção do raio. Confira se nada sai do contorno da cabeça nas diagonais.

As expressões (linha 4) usam a cabeça de frente, sem deslocamento. Troque só olhos
e boca: olhos fechados em arco para piscar, arcos para cima para sorrir, boca aberta
para alegria.

## Modelo mínimo

Defina cada peça uma vez em `<defs>`, com a cabeça centrada em `(0, 0)`. Em cada
célula, posicione a cabeça em `(256, 250)` e aplique o deslocamento da tabela.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="2048" viewBox="0 0 1536 2048">
  <defs>
    <path id="ombros" d="M132 470C132 402 184 362 256 362S380 402 380 470Z" fill="#f4a259" />
    <g id="orelhas"><!-- desenhadas atrás da cabeça --></g>
    <circle id="cabeca" r="118" fill="#f4a259" />
    <g id="olhos"><!-- olhos abertos e bochechas --></g>
    <g id="focinho"><!-- focinho e nariz --></g>
    <path id="boca" d="M-14 32Q-7 42 0 34Q7 42 14 32" fill="none" stroke="#2b2321" stroke-width="4" />
  </defs>

  <!-- 0. acima-esquerda: h = -1, v = -1 -->
  <g transform="translate(0 0)">
    <use href="#ombros" />
    <g transform="translate(256 250)">
      <use href="#orelhas" transform="translate(-6 -2)" />
      <use href="#cabeca" transform="translate(-16 -10)" />
      <use href="#olhos" transform="translate(-48 -30) scale(0.86 0.9)" />
      <use href="#focinho" transform="translate(-62 -38) scale(0.86 0.9)" />
      <use href="#boca" transform="translate(-62 -38) scale(0.86 0.9)" />
    </g>
  </g>

  <!-- 1. acima: translate(512 0), h = 0, v = -1 ... até 11. alegria: translate(1024 1536) -->
</svg>
```

Repita o bloco para as 12 células, trocando o `translate` da célula e os
deslocamentos. O comentário com número e nome de cada pose ajuda a revisar.

## Confira e integre

1. Abra o SVG no revisor de poses (`assets/editor/index.html`, servido por HTTP).
   O revisor aceita SVG direto e já sugere o caminho `.svg` na configuração.
2. Confira as 12 poses nos botões e ative **Testar movimento**. Veja nos fundos
   claro e escuro.
3. Salve o arquivo na pasta pública do site e use:

```html
<mascote-cursor
  atlas="/mascote-cursor/mascotes/meu-personagem.svg"
  rotulo="Fazer carinho no meu mascote"
></mascote-cursor>
```

O servidor precisa entregar o arquivo como `image/svg+xml`, o padrão na maioria
dos servidores. Se a pessoa pedir PNG, abra o SVG no revisor, use **Preparar folha**
com **O fundo já é transparente** marcado e baixe o PNG.

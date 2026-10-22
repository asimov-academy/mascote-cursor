# Seu personagem, olhando para o mouse

O mascote usa uma **folha de poses**: uma imagem PNG ou SVG com 3 colunas e 4 linhas. As nove primeiras
imagens mostram a cabeça em direções diferentes; as três últimas são expressões.
Olhos, focinho, orelhas e perspectiva fazem parte da arte. O corpo mantém a posição.
Para usar um dos dez prontos, pule este processo e execute o instalador.

## 0. Escolha o caminho

Antes de gerar, veja o que existe nesta sessão. Confira suas próprias ferramentas:
há geração de imagem nativa? Há um servidor MCP conectado com uma ferramenta de
imagem? Não presuma pelo nome do agente. Existem quatro caminhos:

| Caminho              | Quando usar                                                 | Estilos                 | Passos                    |
| -------------------- | ----------------------------------------------------------- | ----------------------- | ------------------------- |
| a) Gerador do agente | Você gera imagens nesta sessão.                             | Qualquer um do cardápio | 1 → 2 → 3 → 4 → 5         |
| b) MCP de imagem     | Há um MCP de imagem conectado, como Magnific ou Higgsfield. | Qualquer um do cardápio | 1 → 2 → 3 → 4 → 5         |
| c) Manual            | A pessoa gera no ChatGPT, Gemini, Midjourney ou outro.      | Qualquer um do cardápio | 1 → 2 → 3 → 4 → 5         |
| d) SVG               | Sem gerador, ou a pessoa quer algo simples e sem custo.     | Minimalista ou flat     | 1 → [SVG](svg.md) → 4 → 5 |

Se só um caminho for possível, siga com ele e diga qual em uma frase. Se houver mais
de um, pergunte à pessoa em uma pergunta curta, com estilo e custo de cada opção.
Gerar imagem pode consumir créditos: avise antes. Respeite a escolha. Os caminhos
c e d funcionam em qualquer agente. Nunca diga que gerou uma imagem que não foi gerada.

### a) Gerador de imagem do agente

Use o pedido do passo 2. Se a pessoa trouxe uma referência, envie junto. Salve o
resultado no projeto, fora da pasta pública, por exemplo `arte/minha-folha.png`.
Siga para o passo 3.

### b) MCP de imagem

1. Liste as ferramentas do servidor. Procure as de gerar imagem, enviar uma imagem
   de referência e acompanhar o resultado. Os nomes mudam entre servidores: leia a
   descrição e os parâmetros antes de chamar.
2. Se a pessoa tiver referência, envie pela ferramenta de upload do servidor e use
   como imagem de referência na geração.
3. Gere com o pedido do passo 2. Escolha proporção 3:4 e a maior resolução
   disponível. Prefira um modelo que respeita grade e instruções longas.
4. Se a geração for assíncrona, aguarde com a ferramenta de status do servidor.
   Se o modelo recusar fundo transparente, mesmo anunciando suporte, gere de novo
   com fundo de cor.
5. Baixe o arquivo pela URL do resultado, por exemplo
   `curl -L -o arte/minha-folha.png "<url>"`, ou pela ferramenta de download do
   servidor. Confira o formato real: muitos servidores entregam JPG ou WebP.
6. Siga para o passo 3.

### c) Manual

Preencha o pedido do passo 2 e entregue pronto para copiar. Explique: abra o
gerador preferido, cole o pedido, anexe a referência se houver e baixe a imagem.
Peça para a pessoa colocar o arquivo no projeto ou informar onde salvou.
Aceite PNG, JPG ou WebP. Siga para o passo 3 quando o arquivo chegar.

### d) SVG desenhado por você

Leia [mascote em SVG](svg.md). Você escreve o atlas em código, sem gerar imagem.
Funciona em agentes que não geram imagens. Faça o briefing do passo 1 e pule os
passos 2 e 3: o SVG já sai pronto. Vá direto para o passo 4.

## 1. Combine a ideia e o estilo

Antes de gerar ou desenhar, combine duas coisas: de onde o personagem vem e como ele
vai parecer. Use o que a pessoa já disse e faça no máximo duas perguntas curtas.

**De onde ele vem.** A pessoa pode trazer qualquer um destes pontos de partida:

| Ela traz                         | O que fazer                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Uma ideia em palavras            | Transforme em uma ou duas frases concretas: o que é, cores, um traço marcante e, se houver, um acessório.         |
| Foto de pet, objeto ou pessoa    | Mantenha o que torna reconhecível: cores, manchas, formato. Simplifique o resto. Pessoa real, só com autorização. |
| Logo ou identidade de uma marca  | Crie um personagem com as cores e formas da marca. Não escreva texto nem cole o logo no personagem.               |
| Desenho ou personagem próprio    | Preserve traço, proporções e cores. O estilo passa a ser o da referência.                                         |
| Arte ou mascote de outra empresa | Não copie. Ofereça algo inspirado no estilo, com nome, forma e cores próprias.                                    |

Envie a imagem de referência junto com o pedido nas rotas a e b, ou peça para a
pessoa anexar na rota c. Descreva a referência também em palavras: alguns geradores
ignoram parte da imagem.

**Como ele vai parecer.** Ofereça o cardápio abaixo ou use o estilo da referência.
Sem preferência, use argila, o estilo mais comum da coleção. Copie a linha do estilo para o pedido.

| Estilo           | Linha para o pedido                                                                                                                                                                                                   | Cuidado                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Argila (padrão)  | miniatura de argila fosca, expressiva e acolhedora, olhos grandes com brilho                                                                                                                                          | —                                                                             |
| Pixel art        | pixel art, cada pose como um sprite de cerca de 48 × 48 pixels ampliado com pixels nítidos e quadrados, paleta limitada de 16 cores, contorno escuro de 1 pixel, sem antisserrilhado, sem desfoque e sem sombra suave | Pelos espetados prendem fundo entre os tufos; o preparo remove esses bolsões. |
| Crochê amigurumi | boneco de crochê amigurumi fotografado em estúdio, fio de lã macio com pontos visíveis, olhos de botão pretos e brilhantes, luz suave e uniforme, contorno da lã bem definido                                         | Lã branca ou rosa perto do magenta: use fundo verde `#00ff00`.                |
| Papercraft       | papercraft, papel colorido recortado e dobrado em camadas, bordas nítidas, pequenas sombras internas entre as camadas, textura leve de papel                                                                          | Bico, orelhas ou chifres longos ocupam espaço nas poses viradas.              |
| Minimalista      | ícone minimalista e geométrico, formas lisas, duas ou três cores chapadas, olhos simples em pílula ou ponto, sem textura                                                                                              | Fica melhor como SVG (rota d). Personagem escuro precisa de contorno claro.   |
| Flat vetorial    | ilustração vetorial flat, cores chapadas, formas arredondadas, sem gradiente                                                                                                                                          | Também funciona como SVG.                                                     |
| Anime chibi      | personagem chibi de anime, cel shading com duas sombras, contorno limpo                                                                                                                                               | —                                                                             |
| Aquarela         | ilustração em aquarela com contorno de nanquim fechado, manchas de tinta só dentro do contorno                                                                                                                        | Borda difusa deixa resto de fundo: peça contorno fechado.                     |
| 3D de animação   | personagem 3D de animação, materiais macios, iluminação de estúdio suave                                                                                                                                              | —                                                                             |

A própria coleção mostra o cardápio: Guará (pixel art), Novelo (crochê) e Tucano
(papercraft) foram gerados com este passo a passo; Breu (minimalista) e Bolota (flat)
foram desenhados em SVG.

## 2. Gere a folha (caminhos a, b e c)

Se a pessoa forneceu uma referência, inspecione a imagem e preserve a identidade.
Não use artes de terceiros sem autorização.

Pedido base — substitua `[PERSONAGEM]` pelo resultado do briefing e `[ESTILO]` pela
linha do cardápio:

> Crie uma folha de animação de [PERSONAGEM]. Estilo: [ESTILO]. Um único personagem
> consistente, rosto completo, cabeça e ombros apenas. Exatamente 3 colunas por 4 linhas,
> 12 células quadradas, tela na proporção 3:4. Mantenha escala, luz, cores e acessórios.
> Ombros sempre de frente, mesma base e mesmo ponto de apoio. Só a cabeça gira de
> verdade: focinho, orelhas e perspectiva mudam juntos. Não basta deslocar as pupilas
> ou inclinar a ilustração inteira. Esquerda e direita são os lados de quem vê a tela.
> Linha 1: cabeça para cima e esquerda, cima, cima e direita.
> Linha 2: esquerda, frente neutra, direita.
> Linha 3: baixo e esquerda, baixo, baixo e direita.
> Linha 4: frente piscando, frente sorrindo de olhos fechados, frente alegre de olhos abertos.
> Giros horizontais de aproximadamente 40 graus e verticais de 22 graus.
> Cada busto ocupa no máximo 78% de sua célula, com folga entre todas as poses.
> Fundo uniforme magenta puro #ff00ff, sem gradiente, sombra, textura ou quadriculado.
> Não inclua texto, números, guias, acessórios novos, mãos, pés ou corpo inteiro.

Escolha outra cor de fundo se o personagem contiver magenta e ajuste a cor no passo 3.
Troque `magenta puro #ff00ff` no pedido, por exemplo, por `verde puro #00ff00`.
Também é possível gerar transparência real e pular a remoção de fundo. Um desenho
quadriculado não é transparência. PNG, JPG e WebP servem; veja o passo 3.

## 3. Prepare

Há duas formas. As duas usam o mesmo código e geram o mesmo atlas.

**No navegador (PNG, JPG ou WebP, sem Node):** abra o revisor do passo 4 e carregue
a folha. Em **Precisa preparar?**, informe a cor do fundo ou marque **O fundo já é
transparente**. Clique em **Preparar folha**, confira as poses e use **Baixar PNG
preparado**. Salve o arquivo na pasta pública do site.

**Por comando (PNG):** requer Node 22 ou superior. JPG e WebP não são lidos pelo
comando: prepare no navegador ou converta antes para PNG de 8 bits. No macOS, por
exemplo: `sips -s format png minha-folha.jpg --out minha-folha.png`. Use os scripts
da pasta onde esta skill está instalada:

```bash
node "<pasta-da-skill>/scripts/preparar.mjs" \
  --entrada "minha-folha.png" \
  --saida "<pasta-publica>/mascote-cursor/mascotes/meu-personagem.png" \
  --fundo '#ff00ff' --json
```

O preparador remove a cor de fundo conectada às bordas e os bolsões fechados quase da
mesma cor, encontra o espaço entre poses,
alinha a base dos ombros e aplica uma escala única. Exporta um atlas transparente de
1536 × 2048, com 12 quadros de 512 × 512. Não usa serviços externos nem pacotes adicionais.
Recusa poses sobrepostas, poses cortadas no topo ou nas laterais, arquivo vazio e
saída já existente. Ombros que tocam a borda de baixo são aceitos. `--substituir` permite
atualizar uma saída deliberadamente; a entrada é preservada. `--inverter-lados` troca
as colunas esquerda/direita das nove direções, sem espelhar o personagem, se o gerador
entendeu os lados ao contrário. Não use isso sem conferir a imagem.

## 4. Confira no revisor

Sirva a pasta da skill inteira por HTTP e abra `/assets/editor/`. Por exemplo, rode
`python3 -m http.server 8000` dentro da pasta da skill e abra
http://localhost:8000/assets/editor/. Arquivo aberto com dois cliques não funciona.
Neste repositório: `npm run dev` e http://localhost:4173/demo/personalizar.html.
Carregue o PNG preparado ou o SVG. O arquivo fica apenas no navegador.

Confira as doze poses nos botões, depois ative **Testar movimento**. Verifique:

- A cabeça olha para o lado indicado, incluindo diagonais e cima/baixo.
- Ombros, acessórios e tamanho permanecem consistentes, sem saltos visíveis.
- Contorno limpo em fundo claro e escuro, sem magenta ou quadrados desenhados.
- Orelhas, antenas e folhas inteiras, sem invadir a célula vizinha.

O preparo verifica pixels e formato, não anatomia. Se alguma pose estiver errada,
peça uma correção ao gerador preservando todas as demais poses e a grade. No caminho
manual, entregue esse pedido de correção à pessoa. No SVG, corrija o código você mesmo.
Não aprove uma arte só porque o comando terminou. Após duas tentativas sem resolver,
explique o problema e apresente a melhor prévia para a pessoa decidir o próximo ajuste.

## 5. Integre

Instale o motor conforme [integração](integracao.md), copie a configuração do revisor
ou use o exemplo abaixo. O `atlas` pode ser `.png` ou `.svg`:

```html
<mascote-cursor
  atlas="/mascote-cursor/mascotes/meu-personagem.png"
  rotulo="Fazer carinho no meu mascote"
></mascote-cursor>
```

Carregue `mascote.js` uma vez. Confira na página final com mouse, toque, teclado e
movimento reduzido. No celular, o toque aciona a expressão; não existe acompanhamento
contínuo do dedo. Prefira tamanho de 160 a 168 pixels para nitidez em telas de alta densidade.
As células têm 512 pixels; a preparação preserva o detalhe da fonte e não amplia a arte artificialmente. Uma fonte pequena continua limitada pela sua resolução.

## Migração da versão 1

Os dez nomes prontos continuam iguais. Atualize motor, catálogo, movimento e PNG juntos,
em uma pasta nova se houver arquivos personalizados. Para arte própria, substitua
`imagem` + `olhos` por `atlas` e gere uma folha de poses: uma única imagem frontal não
contém as perspectivas necessárias. O componente mostra uma mensagem para atributos antigos.

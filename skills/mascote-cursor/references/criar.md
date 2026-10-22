# Seu personagem, olhando para o mouse

O mascote usa uma **folha de poses**: uma imagem PNG ou SVG com 3 colunas e 4 linhas. As nove primeiras
imagens mostram a cabeça em direções diferentes; as três últimas são expressões.
Olhos, focinho, orelhas e perspectiva fazem parte da arte. O corpo mantém a posição.
Para usar um dos dez prontos, pule este processo e execute o instalador.

## 0. Escolha o caminho

Antes de gerar, veja o que existe nesta sessão. Confira suas próprias ferramentas:
há geração de imagem nativa? Há um servidor MCP conectado com uma ferramenta de
imagem? Não presuma pelo nome do agente. Existem quatro caminhos:

| Caminho              | Quando usar                                             | Estilo             | Passos                |
| -------------------- | ------------------------------------------------------- | ------------------ | --------------------- |
| a) Gerador do agente | Você gera imagens nesta sessão.                         | Argila, como os 10 | 1 → 2 → 3 → 4         |
| b) MCP de imagem     | Há um MCP de imagem conectado, como o Higgsfield.       | Argila             | 1 → 2 → 3 → 4         |
| c) Manual            | A pessoa gera no ChatGPT, Gemini, Midjourney ou outro.  | Argila             | 1 → 2 → 3 → 4         |
| d) SVG               | Sem gerador, ou a pessoa quer algo simples e sem custo. | Vetorial, flat     | [SVG](svg.md) → 3 → 4 |

Se só um caminho for possível, siga com ele e diga qual em uma frase. Se houver mais
de um, pergunte à pessoa em uma pergunta curta, com estilo e custo de cada opção.
Gerar imagem pode consumir créditos: avise antes. Respeite a escolha. Os caminhos
c e d funcionam em qualquer agente. Nunca diga que gerou uma imagem que não foi gerada.

### a) Gerador de imagem do agente

Use o pedido do passo 1. Se a pessoa trouxe uma referência, envie junto. Salve o
resultado no projeto, fora da pasta pública, por exemplo `arte/minha-folha.png`.
Siga para o passo 2.

### b) MCP de imagem

1. Liste as ferramentas do servidor. Procure as de gerar imagem, enviar uma imagem
   de referência e acompanhar o resultado. Os nomes mudam entre servidores: leia a
   descrição e os parâmetros antes de chamar.
2. Se a pessoa tiver referência, envie pela ferramenta de upload do servidor e use
   como imagem de referência na geração.
3. Gere com o pedido do passo 1. Escolha proporção 3:4 e a maior resolução
   disponível. Prefira um modelo que respeita grade e instruções longas.
4. Se a geração for assíncrona, aguarde com a ferramenta de status do servidor.
5. Baixe o arquivo pela URL do resultado, por exemplo
   `curl -L -o arte/minha-folha.png "<url>"`, ou pela ferramenta de download do
   servidor. Confira o formato real: muitos servidores entregam JPG ou WebP.
6. Siga para o passo 2.

### c) Manual

Preencha o pedido do passo 1 e entregue pronto para copiar. Explique: abra o
gerador preferido, cole o pedido, anexe a referência se houver e baixe a imagem.
Peça para a pessoa colocar o arquivo no projeto ou informar onde salvou.
Aceite PNG, JPG ou WebP. Siga para o passo 2 quando o arquivo chegar.

### d) SVG desenhado por você

Leia [mascote em SVG](svg.md). Você escreve o atlas em código, sem gerar imagem.
Funciona em agentes que não geram imagens. O SVG pula os passos 1 e 2: vá direto
para o passo 3.

## 1. Gere a folha (caminhos a, b e c)

Se a pessoa já forneceu um personagem, inspecione a referência e preserve a
identidade. Não use artes de terceiros sem autorização.

Prompt autoral — substitua a descrição entre colchetes:

> Crie uma folha de animação de [DESCRIÇÃO DO PERSONAGEM], em estilo de miniatura de
> argila fosca, expressiva e acolhedora. Um único personagem consistente, rosto completo,
> olhos grandes com brilho, cabeça e ombros apenas. Exatamente 3 colunas por 4 linhas,
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

Escolha outra cor de fundo se o personagem contiver magenta e ajuste a cor no passo 2.
Também é possível gerar transparência real e pular a remoção de fundo. Um desenho
quadriculado não é transparência. PNG, JPG e WebP servem; veja o passo 2.

## 2. Prepare

Há duas formas. As duas usam o mesmo código e geram o mesmo atlas.

**No navegador (PNG, JPG ou WebP, sem Node):** abra o revisor do passo 3 e carregue
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

O preparador remove a cor de fundo conectada às bordas, encontra o espaço entre poses,
alinha a base dos ombros e aplica uma escala única. Exporta um atlas transparente de
1536 × 2048, com 12 quadros de 512 × 512. Não usa serviços externos nem pacotes adicionais.
Recusa poses sobrepostas, arquivo vazio e saída já existente. `--substituir` permite
atualizar uma saída deliberadamente; a entrada é preservada. `--inverter-lados` troca
as colunas esquerda/direita das nove direções, sem espelhar o personagem, se o gerador
entendeu os lados ao contrário. Não use isso sem conferir a imagem.

## 3. Confira no revisor

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

## 4. Integre

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

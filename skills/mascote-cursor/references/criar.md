# Seu personagem, olhando para o mouse

O mascote usa uma **folha de poses**: um PNG com 3 colunas e 4 linhas. As nove primeiras
imagens mostram a cabeça em direções diferentes; as três últimas são expressões.
Olhos, focinho, orelhas e perspectiva fazem parte da arte. O corpo mantém a posição.
Para usar um dos dez prontos, pule este processo e execute o instalador.

## 1. Gere a folha

Use a ferramenta de imagem disponível, respeitando a escolha da pessoa. Se ela já
forneceu um personagem, inspecione a referência e preserve a identidade. Não use artes
de terceiros sem autorização. Sem ferramenta de imagem, forneça o pedido abaixo e
permita que a pessoa traga a folha pronta; não invente uma geração bem-sucedida.

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

Escolha outra cor de fundo se o personagem contiver magenta e ajuste `--fundo` abaixo.
Também é possível gerar transparência real e omitir `--fundo`. Um desenho quadriculado
não é transparência. PNG precisa ser RGB/RGBA de 8 bits, sem entrelaçamento; exporte
nesse formato se o gerador entregar outro.

## 2. Prepare com um comando

Requer Node 22 ou superior. Use os scripts da pasta onde esta skill está instalada:

```bash
node "<pasta-da-skill>/scripts/preparar.mjs" \
  --entrada "minha-folha.png" \
  --saida "<pasta-publica>/mascote-cursor/mascotes/meu-personagem.png" \
  --fundo '#ff00ff' --json
```

O preparador remove a cor de fundo conectada às bordas, encontra o espaço entre poses,
alinha a base dos ombros e aplica uma escala única. Exporta um atlas transparente de
768 × 1024, com 12 quadros de 256 × 256. Não usa serviços externos nem pacotes adicionais.
Recusa poses sobrepostas, arquivo vazio e saída já existente. `--substituir` permite
atualizar uma saída deliberadamente; a entrada é preservada. `--inverter-lados` troca
as colunas esquerda/direita das nove direções, sem espelhar o personagem, se o gerador
entendeu os lados ao contrário. Não use isso sem conferir a imagem.

## 3. Confira no revisor

Abra `assets/editor/index.html` pelo servidor estático que estiver servindo a skill.
Neste repositório: `npm run dev` e http://localhost:4173/demo/personalizar.html.
Carregue o PNG preparado. O arquivo fica apenas no navegador.

Confira as doze poses nos botões, depois ative **Testar movimento**. Verifique:

- A cabeça olha para o lado indicado, incluindo diagonais e cima/baixo.
- Ombros, acessórios e tamanho permanecem consistentes, sem saltos visíveis.
- Contorno limpo em fundo claro e escuro, sem magenta ou quadrados desenhados.
- Orelhas, antenas e folhas inteiras, sem invadir a célula vizinha.

O script verifica pixels e formato, não anatomia. Se alguma pose estiver errada,
peça uma correção à ferramenta de imagem preservando todas as demais poses e a grade.
Não aprove uma arte só porque o comando terminou. Após duas tentativas sem resolver,
explique o problema e apresente a melhor prévia para a pessoa decidir o próximo ajuste.

## 4. Integre

Instale o motor conforme [integração](integracao.md), copie a configuração do revisor
ou use:

```html
<mascote-cursor
  atlas="/mascote-cursor/mascotes/meu-personagem.png"
  rotulo="Fazer carinho no meu mascote"
></mascote-cursor>
```

Carregue `mascote.js` uma vez. Confira na página final com mouse, toque, teclado e
movimento reduzido. No celular, o toque aciona a expressão; não existe acompanhamento
contínuo do dedo. Use tamanho de até 256 pixels para manter a nitidez nativa.

## Migração da versão 1

Os dez nomes prontos continuam iguais. Atualize motor, catálogo, movimento e PNG juntos,
em uma pasta nova se houver arquivos personalizados. Para arte própria, substitua
`imagem` + `olhos` por `atlas` e gere uma folha de poses: uma única imagem frontal não
contém as perspectivas necessárias. O componente mostra uma mensagem para atributos antigos.

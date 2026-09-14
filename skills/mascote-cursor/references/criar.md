# Um personagem só seu

Uma arte, dois olhos animados. O rosto é montado no navegador, então o arquivo base
precisa estar sem olhos. Isso evita redesenhar o personagem a cada reação.

## 1. Descreva e gere a base

Pergunte só o que faltar para uma escolha importante. Se a pessoa pediu um personagem
concreto, desenvolva cores e detalhes coerentes sem pedir um briefing longo.
Use uma ferramenta de geração de imagem disponível; não escolha uma API paga ou
envie uma foto para um serviço diferente sem autorização. Sem ferramenta disponível,
entregue este pedido para a pessoa usar no gerador de sua preferência:

> Crie um único mascote original: [DESCRIÇÃO]. Miniatura de argila fosca, formas
> arredondadas, textura delicada e luz suave. Vista frontal, corpo inteiro, composição
> quadrada e espaço transparente ao redor. Deixe o rosto liso e SEM OLHOS, pálpebras,
> sobrancelhas ou cavidades: os olhos serão colocados pelo código. Reserve uma área
> livre e simétrica no rosto para eles. Desenhe apenas nariz, se fizer sentido, e
> uma boca pequena abaixo dessa área. Sem chão, texto, moldura ou outros personagens.
> Exporte PNG com transparência real, não um fundo quadriculado desenhado.

Para imagem de referência, preserve apenas os traços escolhidos pela pessoa e adapte
ao estilo. Não diga que foi desenhado à mão: artes geradas devem ser identificadas como tal.

## 2. Confira a arte

Abra a imagem. Verifique silhueta inteira, ausência de olhos, área livre para o rosto,
um personagem somente e transparência real. Confira sobre um fundo claro e outro
escuro. Se a arte não atende, ajuste uma vez o pedido com o erro observado. Se ainda
falhar, explique a limitação e proponha outra descrição, sem entrar em repetição de gerações.

Para uma exibição de até 256 pixels, PNG quadrado de 512 × 512 é suficiente na maioria
das telas. Redimensionar preservando alpha é uma otimização de entrega, não uma nova arte.
Não corte automaticamente a imagem depois de definir as coordenadas dos olhos.

## 3. Posicione os olhos

Com o repositório aberto, execute `npm run dev` e visite `/demo/personalizar.html`.
O editor também está em `assets/editor/` nesta skill: pode ser servido junto dos
arquivos do componente, em uma pasta de trabalho, sem colocá-lo em produção.
O arquivo escolhido fica só no navegador; não é enviado a servidor algum.
Carregue a imagem, ajuste os seis campos e confira a reação. Copie a configuração.

Sem editor, identifique o centro de cada olho e o tamanho na imagem: cada coordenada
é `100 × posição_em_pixels / dimensão_da_imagem`. A ordem é centro X e Y do olho
esquerdo do espectador, centro X e Y do direito, largura e altura de cada olho.
Use valores entre 0 e 100 e mantenha os olhos inteiros dentro da imagem.

## 4. Integre e valide

Instale o motor pelo mesmo script dos mascotes prontos. Salve a arte própria junto
das imagens do projeto. Use `imagem`, `olhos` e um `rotulo` explícito:

```html
<mascote-cursor
  imagem="/mascote-cursor/mascotes/meu-personagem.png"
  olhos="41,47,59,47,9,11"
  rotulo="Fazer carinho em Pipoca"
  tamanho="180"
></mascote-cursor>
```

O exemplo de coordenadas é só ponto de partida. Valide no tamanho final, olhando
para os quatro cantos e reagindo ao clique. Faça captura da versão montada para
apresentar: mostrar somente o PNG sem olhos não representa o resultado.

Personagens próprios não precisam entrar no catálogo. Não aumente a coleção oficial
de dez nem altere o comportamento dos outros mascotes para acomodar um novo.

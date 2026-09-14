# Do conceito a um processo mais simples

## O que foi analisado

A [referência page-mascot](https://github.com/nilbuild/page-mascot) foi consultada em
14 de setembro de 2026: README, skill, componente, instruções de arte e scripts de
geração, construção e verificação. Os arquivos de referência ficaram fora deste projeto.

O fluxo de criação analisado usa duas imagens em grade por personagem: direções e
expressões. Há preparação da arte, checagem de transparência, montagem das imagens,
comparação de alinhamento e novas tentativas quando o resultado não passa. Depois,
o componente é integrado ao site. Para personagens existentes, o caminho já é menor:
obter os arquivos e integrar o componente React.

Essa abordagem permite mostrar poses desenhadas da cabeça. Seu custo de manutenção
é fazer desenhos independentes parecerem o mesmo personagem imóvel entre trocas.

## A decisão deste projeto

Aqui a unidade do personagem é **uma imagem frontal + a posição de dois olhos**.
O corpo não muda de desenho quando alguém interage. As pupilas seguem o ponteiro;
o conjunto ganha uma inclinação discreta; o carinho fecha os olhos e mostra um coração.

Essa escolha troca poses desenhadas por movimento contínuo de camadas. Não é um
substituto de animação 3D, mas reduz substancialmente os artefatos que precisam ser
gerados, revisados, transportados e mantidos.

| Decisão | Consequência prática |
| --- | --- |
| Uma imagem por mascote | Uma geração de base e uma verificação visual. |
| Olhos fora da arte | Coordenadas simples, ajustáveis no editor; expressão sem redesenho. |
| Web Component | Mesmo motor para sites de diferentes tecnologias. |
| Fonte dentro da skill | O pacote instalado já contém os recursos necessários. |
| Copiar somente a arte escolhida | O projeto consumidor recebe apenas o que vai usar. |
| Instalador sem rede | A cópia não depende de serviços de imagem, CDN ou chave de API. |
| Falha em conflitos antes de escrever | Repetir a instalação não apaga personalizações. |
| Português na interface e na skill | O mesmo vocabulário acompanha usuário e agente. |
| Dez nomes estáveis | Catálogo curto, fácil de comparar e testar. |

## O caminho de quem usa

1. Instalar a skill no assistente.
2. Pedir um mascote em uma parte do site.
3. Conferir a página integrada pelo agente.

O agente resolve onde copiar, como carregar o módulo e como conferir o resultado.
Essas decisões não ficam como uma lista de tarefas técnicas para a pessoa iniciante.

## O caminho de quem cria

1. Definir personagem e gerar uma base sem olhos, com fundo transparente.
2. Abrir no editor, ajustar seis valores e conferir claro/escuro.
3. Salvar a arte no projeto e usar os atributos `imagem` e `olhos`.
4. Verificar o resultado no tamanho em que será exibido.

Sem configuração de modelo fixa, execução de API escondida ou promessa de que toda
imagem fica correta na primeira tentativa. O guia inclui critério de aceitação e
limite de repetição para a etapa criativa.

## Desempenho e limites

Há um único conjunto de listeners de ponteiro por página. Um loop de quadros é
agendado quando necessário e termina quando a mola repousa. Instâncias fora da tela
não animam; esconder a aba ou remover os elementos limpa os recursos correspondentes.

As imagens distribuídas são PNGs de 512 × 512 com alpha. O tamanho de referência é
160 pixels. Ampliações muito grandes podem revelar os limites da imagem raster.
Os testes usam Chromium e WebKit, além de uma configuração móvel; integração em
projetos de frameworks específicos ainda precisa dos checks daquele projeto.

Não há pacote npm publicado nem hospedagem de produção presumida. A demonstração
é estática e pode ser hospedada mantendo seus caminhos relativos. O repositório é
o canal de distribuição da skill.

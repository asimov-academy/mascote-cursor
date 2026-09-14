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

Cada personagem usa **uma folha de 12 poses completas**: nove direções e três
expressões. A cabeça muda de perspectiva, enquanto os ombros mantêm o apoio. O motor
escolhe a direção pelo ângulo do mouse, com uma margem que evita alternância nervosa.

A primeira versão simplificava o efeito para pupilas móveis e inclinação. Isso
não reproduzia o acompanhamento da cabeça desejado. A versão 2 simplifica a instalação
e a preparação, preservando as poses que dão identidade ao movimento.

| Decisão                                 | Consequência prática                                            |
| --------------------------------------- | --------------------------------------------------------------- |
| Um atlas 3 × 4                          | Direções e expressões no mesmo PNG.                             |
| Preparação com Node                     | Transparência, recorte e alinhamento em um comando, sem Python. |
| Revisor de doze poses                   | Conferência visual antes da integração.                         |
| Web Component                           | Mesmo motor para sites de diferentes tecnologias.               |
| Fonte dentro da skill                   | O pacote instalado já contém todos os recursos de uso.          |
| Copiar somente a arte escolhida         | O site recebe apenas o que usa.                                 |
| Instalador sem rede                     | A cópia não depende de CDN, serviço de imagem ou API.           |
| Conflitos verificados antes de escrever | Repetir não apaga personalizações.                              |
| Português do pedido à entrega           | Menos decisões técnicas para quem está começando.               |
| Dez nomes estáveis                      | Catálogo curto, fácil de comparar e testar.                     |

## O caminho de quem usa

1. Instalar a skill no assistente.
2. Pedir um mascote em uma parte do site.
3. Conferir a página integrada pelo agente.

O agente resolve onde copiar, como carregar o módulo e como conferir o resultado.
Essas decisões não ficam como uma lista de tarefas técnicas para a pessoa iniciante.

## O caminho de quem cria

1. Descrever o personagem e gerar uma folha 3 × 4 com rosto completo.
2. Preparar o PNG com `scripts/preparar.mjs`: remover fundo, recortar e alinhar.
3. Conferir as doze poses e o movimento em fundos claro e escuro no revisor.
4. Usar o atributo `atlas` e verificar o resultado na página real.

Não há configuração fixa de modelo nem execução de API escondida. A geração pode
precisar de correções. O preparador não verifica anatomia; essa revisão é explícita
no processo. Fontes e opções de reconstrução estão em [arte](../arte/README.md).

## Desempenho e limites

Há um único conjunto de listeners de ponteiro por página. Um único quadro é
agendado por lote de eventos; não há loop permanente. Instâncias fora da tela
não animam; esconder a aba ou remover os elementos limpa os recursos correspondentes.

As imagens distribuídas são atlas PNG de 768 × 1024 com alpha, cada pose de 256 × 256. O tamanho de referência é
160 pixels. Ampliações muito grandes podem revelar os limites da imagem raster.
Os testes usam Chromium e WebKit, além de uma configuração móvel; integração em
projetos de frameworks específicos ainda precisa dos checks daquele projeto.

Não há pacote npm publicado nem hospedagem de produção presumida. A demonstração
é estática e pode ser hospedada mantendo seus caminhos relativos. O repositório é
o canal de distribuição da skill.

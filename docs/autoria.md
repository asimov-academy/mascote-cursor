# Autoria e origem dos arquivos

Este projeto foi criado para a Asimov Academy em setembro de 2026. O conceito geral
de um personagem reagindo ao ponteiro foi estudado a partir do
[page-mascot](https://github.com/nilbuild/page-mascot), sem incorporar arquivos dele.

## O que foi criado aqui

- Implementação em JavaScript nativo, com Web Component e seleção de poses.
- Comportamento de acompanhamento, reação, pausa e ciclo de vida.
- Instalador local com verificação de conflitos e saída JSON.
- Skill em português, documentação e exemplos de integração.
- Demonstração e revisor de poses e preparador de atlas.
- Direção visual, nomes, descrições e dez artes desta coleção.

A coleção mistura seis estilos de propósito: mostra que um mascote próprio pode ter
qualquer cara. Oito personagens foram **gerados com IA para este projeto**, a partir de
descrições próprias, sem usar imagens do repositório de referência como entrada. Dois
foram **desenhados em código** pelo agente, em SVG. Nenhum usou arte de terceiros.

Os cinco de argila (Capi, Lume, Caju, Bento e Tico) vêm das bases autorais da versão 1,
usadas como referência para novas folhas com rosto completo, nove direções da cabeça e
três expressões. O tigre da referência não foi usado como entrada de geração. Guará,
Novelo e Tucano foram gerados na versão 3 com o passo a passo de `criar.md`, usando o
modelo GPT 2 pelo MCP do Magnific e a linha de estilo do cardápio. Breu e Bolota são os
exemplos de SVG da skill, exportados para PNG pelo revisor de poses.

As folhas-fonte geradas estão em `arte/fontes/`. O preparador próprio remove o fundo
(magenta, ou verde no Novelo), recorta as células, normaliza a escala e alinha a base dos
ombros. A saída é um PNG transparente de 1536 × 2048 por personagem. As poses foram
conferidas visualmente. Código, arte e documentação são distribuídos com a licença do projeto.

## Registro da direção de arte

| Arquivo      | Estilo      | Descrição criada para a geração ou o desenho                                          |
| ------------ | ----------- | ------------------------------------------------------------------------------------- |
| `capi.png`   | Argila      | Capivara cor de canela, focinho largo, orelhas pequenas e lenço verde-petróleo.       |
| `guara.png`  | Pixel art   | Filhote de lobo-guará laranja-avermelhado, orelhas grandes, focinho e crina pretos.   |
| `breu.png`   | Minimalista | Cabeça redonda quase preta, olhos em pílula e contorno claro. SVG em código.          |
| `novelo.png` | Crochê      | Ovelhinha de lã branca, rosto cinza-escuro, orelhas rosadas e cachecol mostarda.      |
| `lume.png`   | Argila      | Mariposa lavanda e ameixa, antenas curvas e asas com detalhes de lua em pêssego.      |
| `caju.png`   | Argila      | Caju dourado-alaranjado com castanha bordô, folha verde-petróleo e busto dourado.     |
| `tucano.png` | Papercraft  | Tucano de papel, bico laranja e amarelo de ponta preta, peito branco, olhos azuis.    |
| `bento.png`  | Argila      | Cachorrinho caramelo, orelhas caídas, focinho claro e coleira turquesa.               |
| `bolota.png` | Flat        | Ursinha laranja com focinho creme, bochechas rosadas e lenço turquesa. SVG em código. |
| `tico.png`   | Argila      | Robô turquesa arredondado, placa facial marfim e antena laranja.                      |

Pingo, Broto, Faísca, Nimbo e Grão fizeram parte das versões 1 e 2. Saíram na versão 3
para abrir espaço aos novos estilos e continuam disponíveis no histórico do Git.

O [guia de criação](../skills/mascote-cursor/references/criar.md) contém um prompt
autoral reutilizável. Gerações futuras podem variar; os arquivos versionados aqui
são a versão pronta da coleção.

## Dependências e nomes de ferramentas

O componente não tem dependências externas de execução. Playwright é dependência
de desenvolvimento e mantém sua própria licença. GitHub, Node.js e os assistentes
citados são ferramentas de seus respectivos responsáveis, sem afiliação implícita.

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

As imagens foram **geradas com IA para este projeto**, a partir de descrições
próprias, sem usar imagens do repositório de referência como entrada. Não são
ilustrações feitas à mão. O estilo pedido foi uma coleção de miniaturas de argila
fosca, formas arredondadas e identidade própria. Na versão 2, as bases autorais foram
usadas como referência para novas folhas com rosto completo, nove direções da cabeça
e três expressões. O tigre da referência não foi usado como entrada de geração.

As folhas-fonte estão em `arte/fontes/`. O preparador próprio remove o fundo magenta,
recorta as células, normaliza a escala e alinha a base dos ombros. A saída é um PNG
transparente de 768 × 1024 por personagem. Broto teve as colunas direcionais invertidas
para corresponder aos lados do observador. As poses foram conferidas visualmente.
Código, arte e documentação são distribuídos com a licença do projeto.

## Registro da direção de arte

| Arquivo      | Descrição criada para a geração                                                    |
| ------------ | ---------------------------------------------------------------------------------- |
| `capi.png`   | Capivara cor de canela, focinho largo, orelhas pequenas e lenço verde-petróleo.    |
| `pingo.png`  | Gota azul-céu, ponta inclinada, busto com pequena base frontal.                    |
| `broto.png`  | Criatura verde-sálvia com duas folhas largas, corpo de semente e sorriso delicado. |
| `faisca.png` | Chama dourada com três pontas alaranjadas suaves e busto pequeno.                  |
| `lume.png`   | Mariposa lavanda e ameixa, antenas curvas e asas com detalhes de lua em pêssego.   |
| `caju.png`   | Caju dourado-alaranjado com castanha bordô, folha verde-petróleo e busto dourado.  |
| `bento.png`  | Cachorrinho caramelo, orelhas caídas, focinho claro e coleira turquesa.            |
| `nimbo.png`  | Nuvem marfim de contorno macio, pequeno busto lavanda.                             |
| `tico.png`   | Robô turquesa arredondado, placa facial marfim e antena laranja.                   |
| `grao.png`   | Grão de café castanho, sulco lateral curvo e pequeno lenço creme.                  |

O [guia de criação](../skills/mascote-cursor/references/criar.md) contém um prompt
autoral reutilizável. Gerações futuras podem variar; os arquivos versionados aqui
são a versão pronta da coleção.

## Dependências e nomes de ferramentas

O componente não tem dependências externas de execução. Playwright é dependência
de desenvolvimento e mantém sua própria licença. GitHub, Node.js e os assistentes
citados são ferramentas de seus respectivos responsáveis, sem afiliação implícita.

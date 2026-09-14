# Como contribuir

Abra uma issue com o problema, a tecnologia do site e os passos para reproduzir.
Uma captura da página montada ajuda mais que o PNG sem olhos. Para bugs de movimento,
informe navegador, mouse ou toque e se movimento reduzido está ativado.

## Desenvolver

1. Clone o repositório e use Node.js 22 ou superior.
2. Execute `npm ci` e `npx playwright install chromium webkit`.
3. Abra a demonstração com `npm run dev`.
4. Faça uma mudança com escopo claro e rode `npm run verificar`.
5. Abra um pull request explicando o problema, a mudança e o que foi testado.

Os testes do instalador usam diretórios temporários, não projetos pessoais.
O servidor da demo escuta só em `127.0.0.1`. É para desenvolvimento local.

## Onde fazer a mudança

O motor e os arquivos distribuídos ficam em `skills/mascote-cursor/assets/`.
Não crie outra cópia do componente para a demo. O instalador precisa continuar
funcionando quando a pasta da skill for copiada para fora deste repositório.

Mantenha exatamente dez personagens no catálogo. Para personagens personalizados,
melhore a rota `imagem` + `olhos` e o editor. Novas artes da coleção precisam de origem
documentada, fundo transparente e verificação visual nos dois temas do editor.

## Antes de enviar

- Comandos e atributos públicos atualizados no README e nas referências da skill.
- Mensagens e textos em português, com linguagem acessível.
- Testes proporcionais à mudança, incluindo conflitos de instalação quando pertinente.
- Prévia desktop e celular para mudanças visuais.
- Sem segredos, credenciais, dependências de execução desnecessárias ou arquivos de referência copiados.

Uma mudança de API deve explicar como migrar projetos já integrados. O instalador
preserva arquivos divergentes de propósito; não crie uma atualização que apague alterações.

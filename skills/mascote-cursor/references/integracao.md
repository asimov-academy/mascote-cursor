# Integração

Os três módulos JS precisam ficar juntos. As imagens vão em `mascotes/` ao lado deles.
O catálogo contém metadados dos dez, mas cada instância carrega apenas seu PNG.
Não há rastreamento, cookies ou chamadas a APIs no componente.

## HTML, Astro e páginas estáticas

Depois de copiar os arquivos para a pasta pública:

```html
<script type="module" src="/mascote-cursor/mascote.js"></script>
<mascote-cursor mascote="capi" tamanho="160"></mascote-cursor>
```

Use a tag de fechamento, mesmo em exemplos. Não abra HTML por `file://`: módulos
precisam de um servidor HTTP. Em Astro, para manter o arquivo da pasta pública sem
transformação, use `<script is:inline type="module" src="/mascote-cursor/mascote.js"></script>`.

Se o site usa `/meu-site/` como prefixo público, inclua esse prefixo no `src` do módulo.
As imagens do catálogo são resolvidas em relação ao módulo, automaticamente.

## React e Next.js

Use um componente cliente pequeno. `createElement` evita exigir alterações globais
nos tipos JSX. O exemplo aceita uma URL pública no `modulo`, que pode incluir o prefixo
do deploy. Não transforme o layout inteiro em componente cliente.

```tsx
'use client';

import { createElement, useEffect, useState } from 'react';

export function Mascote({
  nome = 'capi', tamanho = 160,
  modulo = '/mascote-cursor/mascote.js',
}: { nome?: string; tamanho?: number; modulo?: string }) {
  const [erro, setErro] = useState(false);
  useEffect(() => {
    let ativo = true;
    setErro(false);
    // URL em public: carrega no navegador, sem empacotar como código-fonte.
    import(/* webpackIgnore: true */ /* @vite-ignore */ modulo)
      .catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [modulo]);

  if (erro) return <p>Não consegui carregar o mascote. Confira o caminho do módulo.</p>;
  return createElement('mascote-cursor', {
    mascote: nome, tamanho: String(tamanho),
    style: { display: 'inline-block', width: tamanho, maxWidth: '100%', aspectRatio: '1' },
  });
}
```

Inclua `<Mascote nome="capi" />` na seção real. Rode o build do projeto: o tratamento
de imports dinâmicos depende do empacotador. Se ele reescrever a URL, carregue o módulo
com o mecanismo de scripts do framework e mantenha apenas a renderização da tag no wrapper.

## Vue

Carregue o módulo com `<script type="module" src="/mascote-cursor/mascote.js"></script>`
no HTML de entrada. Configure `compilerOptions.isCustomElement` para reconhecer apenas
`mascote-cursor`, preservando as regras existentes. No Vite com plugin Vue, essa opção
fica dentro de `vue({ template: { compilerOptions: { isCustomElement: tag => tag === 'mascote-cursor' } } })`.
Depois use `<mascote-cursor mascote="capi" tamanho="160"></mascote-cursor>` no template.
Em Nuxt, use o mecanismo cliente de scripts e a pasta `public/` do próprio projeto.

## Svelte / SvelteKit

A pasta pública do SvelteKit é `static/`. Copie para `static/mascote-cursor` e carregue
o módulo no navegador (por exemplo, `onMount` com import dinâmico e `/* @vite-ignore */`).
Trate a rejeição do import com uma mensagem visível. A marcação é a mesma tag HTML.
Não carregue recursos do DOM durante SSR.

## Atributos

| Atributo | Padrão | Uso |
| --- | --- | --- |
| `mascote` | `capi` | Identificador do catálogo, sem acento. |
| `tamanho` | `160` | Largura em pixels, de 48 a 800. Altura proporcional. |
| `rotulo` | Fazer carinho em + nome | Nome acessível do botão. |
| `pausado` | ausente | Presença pausa acompanhamento; o carinho continua disponível sem transição. |
| `imagem` | ausente | Caminho de uma imagem própria; substitui a arte do catálogo. |
| `olhos` | configuração do mascote | `x1,y1,x2,y2,largura,altura`, em porcentagem da imagem inteira. |

`pausado="false"` também pausa: atributos booleanos dependem da presença. Remova-o
para retomar. Em JS use `elemento.toggleAttribute('pausado', devePausar)`.

Sem `tamanho`, CSS pode definir `--mascote-tamanho`. Para foco, use `--mascote-foco`.
O componente respeita `max-width:100%`. O botão é acessível por Tab, Enter e Espaço.
Não o coloque dentro de outro botão ou link.

## Eventos

- `mascote-carinho`: `event.detail.mascote` identifica o personagem.
- `mascote-erro`: `event.detail.mensagem` explica imagem ausente ou configuração inválida.

Ambos propagam pela página. Não anuncie cada movimento do mouse a leitores de tela.
Uma imagem ou configuração inválida exibe texto e desabilita o botão até corrigir.

## Se algo não aparecer

1. Abra a URL de `mascote.js` no navegador: precisa retornar JavaScript, não o HTML de erro do servidor.
2. Confira `catalogo.js`, `movimento.js` e `mascotes/<nome>.png` ao lado do módulo.
3. Confira erros no console, prefixo público, maiúsculas e extensões.
4. Com touch ou preferência por movimento reduzido, não seguir o cursor é intencional.
5. Se a imagem própria tem olhos desenhados, eles se duplicam. Gere uma base sem olhos.

Navegadores modernos com Custom Elements e Shadow DOM são necessários.
O componente injeta CSS em seu Shadow DOM; sites com CSP que proíbe estilos inline
precisam adaptar essa estratégia às regras existentes, sem desativar a CSP global.

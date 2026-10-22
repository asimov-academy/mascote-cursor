import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("o exemplo SVG segue a grade e não depende de arquivos externos", async () => {
  const svg = await readFile(
    resolve("skills/mascote-cursor/references/exemplo-atlas.svg"),
    "utf8",
  );
  const raiz = svg.match(/<svg\b[^>]*>/)[0];
  // Sem width/height, o navegador não informa 1536 × 2048 ao componente.
  assert.match(raiz, /\bwidth="1536"/);
  assert.match(raiz, /\bheight="2048"/);
  assert.match(raiz, /viewBox="0 0 1536 2048"/);
  // Imagens carregadas por <img> ignoram recursos externos e scripts.
  assert.doesNotMatch(svg, /<(script|image|foreignObject|style)\b/i);
  assert.doesNotMatch(svg, /href="(?!#)/);
  assert.doesNotMatch(svg, /@import|url\(\s*["']?(?!#)/);
  // Cada célula começa com o comentário da pose, como no modelo de svg.md.
  const celulas = [
    ...svg.matchAll(/-->\s*<g transform="translate\((\d+) (\d+)\)">/g),
  ];
  assert.deepEqual(
    celulas.map(([, x, y]) => [Number(x), Number(y)]),
    Array.from({ length: 12 }, (_, i) => [
      (i % 3) * 512,
      Math.floor(i / 3) * 512,
    ]),
  );
});

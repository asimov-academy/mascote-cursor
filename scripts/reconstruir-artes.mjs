import { readFile, writeFile } from "node:fs/promises";
import {
  lerPNG,
  escreverPNG,
  aplicarChroma,
} from "../skills/mascote-cursor/scripts/png.mjs";
import { preparar } from "../skills/mascote-cursor/scripts/preparar.mjs";
const raiz = new URL("../", import.meta.url);
const manifesto = JSON.parse(
  await readFile(new URL("arte/manifesto.json", raiz), "utf8"),
);
for (const item of manifesto) {
  const fonte = lerPNG(
    await readFile(new URL(`arte/fontes/${item.id}.png`, raiz)),
  );
  const { imagem } = preparar(
    aplicarChroma(fonte, item.fundo),
    512,
    item.inverterLados,
  );
  await writeFile(
    new URL(`skills/mascote-cursor/assets/mascotes/${item.id}.png`, raiz),
    escreverPNG(imagem),
  );
  console.log(`${item.id}: 12 poses prontas.`);
}

import test from "node:test";
import assert from "node:assert/strict";
import {
  lerPNG,
  escreverPNG,
  aplicarChroma,
} from "../skills/mascote-cursor/scripts/png.mjs";
import { preparar } from "../skills/mascote-cursor/scripts/preparar.mjs";
function fonte() {
  const imagem = {
    largura: 120,
    altura: 160,
    pixels: new Uint8Array(120 * 160 * 4),
  };
  for (let y = 0; y < 160; y++)
    for (let x = 0; x < 120; x++) {
      const dentro = x % 40 > 8 && x % 40 < 31 && y % 40 > 8 && y % 40 < 33;
      imagem.pixels.set(
        dentro
          ? [40 + Math.floor(x / 40) * 50, 140, 30, 255]
          : [255, 0, 255, 255],
        (y * 120 + x) * 4,
      );
    }
  return imagem;
}
test("PNG mantém pixels e rejeita arquivos não PNG", () => {
  const original = fonte(),
    decodificado = lerPNG(escreverPNG(original));
  assert.deepEqual(decodificado, original);
  assert.throws(() => lerPNG(Buffer.from("inválido")));
});
test("preparação remove fundo, preserva cor interior e alinha doze quadros", () => {
  const recortado = aplicarChroma(fonte(), "#ff00ff");
  assert.equal(recortado.pixels[3], 0);
  assert.deepEqual(
    [...recortado.pixels.slice((20 * 120 + 20) * 4, (20 * 120 + 20) * 4 + 4)],
    [40, 140, 30, 255],
  );
  const { imagem, relatorio } = preparar(recortado, 40);
  assert.equal(relatorio.quadros, 12);
  for (let i = 0; i < 12; i++) {
    const centro =
      ((Math.floor(i / 3) * 40 + 22) * 120 + (i % 3) * 40 + 20) * 4;
    assert.equal(imagem.pixels[centro], 40 + (i % 3) * 50);
  }
  const invertido = preparar(recortado, 40, true).imagem;
  assert.equal(invertido.pixels[(22 * 120 + 20) * 4], 140);
  assert.equal(invertido.pixels[((120 + 22) * 120 + 20) * 4], 40);
  assert.throws(() => preparar(fonte()), /sobrepõem/);
  assert.throws(() => aplicarChroma(fonte(), "#000000"), /fundo/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  poseCabeca,
  deslocamentoQuadro,
  validarDimensoes,
} from "../skills/mascote-cursor/assets/movimento.js";
test("nove direções seguem as coordenadas do observador", () => {
  for (let i = 0; i < 9; i++)
    assert.equal(
      poseCabeca(((i % 3) - 1) * 200, (Math.floor(i / 3) - 1) * 200),
      i,
    );
  assert.equal(poseCabeca(NaN, 10), 4);
});
test("zona central e histerese evitam tremor nas fronteiras", () => {
  assert.equal(poseCabeca(30, 0, 4, 28), 4);
  assert.equal(poseCabeca(30, 0, 5, 28), 5);
  assert.equal(poseCabeca(20, 0, 5, 28), 4);
  assert.equal(poseCabeca(100, 43, 5), 5);
  assert.equal(poseCabeca(100, 75, 5), 8);
});
test("atlas recorta as doze células sem aceitar índices fora da grade", () => {
  assert.equal(deslocamentoQuadro(4), "translate(-33.333333333333336%,-25%)");
  assert.equal(deslocamentoQuadro(9), "translate(0%,-75%)");
  for (const i of [-1, 12, 1.5, NaN])
    assert.throws(() => deslocamentoQuadro(i));
  assert.ok(validarDimensoes(768, 1024));
  assert.equal(validarDimensoes(512, 512), false);
});

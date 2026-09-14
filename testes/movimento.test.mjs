import test from "node:test";
import assert from "node:assert/strict";
import {
  direcao,
  passo,
  lerOlhos,
} from "../skills/mascote-cursor/assets/movimento.js";

test("o olhar mantém a direção e fica dentro do círculo mesmo longe da página", () => {
  for (const [x, y] of [
    [1e6, 2e6],
    [-3, 4],
    [0, -999],
    [0, 0],
  ]) {
    const olhar = direcao(x, y, 120);
    assert.ok(Math.hypot(...olhar) <= 1 + 1e-10);
    if (x) assert.equal(Math.sign(olhar[0]), Math.sign(x));
    if (y) assert.equal(Math.sign(olhar[1]), Math.sign(y));
  }
  assert.deepEqual(direcao(NaN, 1, 100), [0, 0]);
  assert.deepEqual(direcao(10, 10, 0), [0, 0]);
});

test("a mola converge e aceita reversão sem pular para o destino", () => {
  let p = 0,
    v = 0;
  for (let i = 0; i < 120; i++) [p, v] = passo(p, v, 1, 1 / 60);
  assert.ok(Math.abs(p - 1) < 0.001);
  const anterior = p;
  [p, v] = passo(p, v, -1, 1 / 60);
  assert.ok(Math.abs(p - anterior) < 0.1);
  for (let i = 0; i < 180; i++) [p, v] = passo(p, v, -1, 1 / 60);
  assert.ok(Math.abs(p + 1) < 0.001);
});

test("voltar de uma aba suspensa não provoca salto numérico", () => {
  const [p, v] = passo(0, 0, 1, 10000);
  assert.ok(p >= 0 && p < 1.3 && Number.isFinite(v));
});

test("o movimento leva o mesmo tempo a 60, 30 e 10 quadros por segundo", () => {
  const resultados = [60, 30, 10].map((fps) => {
    let p = 0,
      v = 0;
    for (let i = 0; i < fps; i++) [p, v] = passo(p, v, 1, 1 / fps);
    return [p, v];
  });
  for (const [p, v] of resultados) {
    assert.ok(Math.abs(p - resultados[0][0]) < 1e-10);
    assert.ok(Math.abs(v - resultados[0][1]) < 1e-10);
  }
});

test("coordenadas inválidas ou olhos fora da imagem não são aceitos", () => {
  const padrao = [41, 47, 59, 47, 9, 11];
  assert.deepEqual(lerOlhos(null, padrao), padrao);
  assert.deepEqual(lerOlhos(padrao.join(","), padrao), padrao);
  for (const entrada of [
    "1,2",
    "a,2,3,4,5,6",
    "0,1,2,3,4,5",
    "1,20,50,20,10,10",
    "50,99,70,50,9,11",
  ]) {
    assert.throws(() => lerOlhos(entrada, padrao));
  }
});

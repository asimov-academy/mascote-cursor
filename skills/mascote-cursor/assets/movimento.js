/** Vetor limitado a um círculo: a pupila nunca escapa do olho. */
export function direcao(x, y, raio) {
  if (![x, y, raio].every(Number.isFinite) || raio <= 0) return [0, 0];
  const distancia = Math.hypot(x, y);
  const divisor = Math.max(raio, distancia);
  return [x / divisor, y / divisor];
}

/** Mola amortecida: massa 1, rigidez 100, amortecimento 10. */
export function passo(posicao, velocidade, destino, segundos) {
  const dt = Math.min(Math.max(segundos, 0), 1 / 60);
  const v = velocidade + ((destino - posicao) * 100 - velocidade * 10) * dt;
  return [posicao + v * dt, v];
}

export function lerOlhos(valor, padrao) {
  if (!valor) return padrao;
  const numeros = valor.split(",").map(Number);
  if (
    numeros.length !== 6 ||
    numeros.some((n) => !Number.isFinite(n) || n <= 0 || n >= 100)
  ) {
    throw new Error(
      'Use olhos="41,47,59,47,9,11": x e y de cada olho, largura e altura, em porcentagem.',
    );
  }
  const [x1, y1, x2, y2, largura, altura] = numeros;
  if (
    [x1, x2].some((x) => x < largura / 2 || x > 100 - largura / 2) ||
    [y1, y2].some((y) => y < altura / 2 || y > 100 - altura / 2)
  ) {
    throw new Error("Os olhos precisam caber inteiros dentro da imagem.");
  }
  return numeros;
}

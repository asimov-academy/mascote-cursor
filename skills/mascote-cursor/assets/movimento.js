/** Ordem da folha: três colunas, quatro linhas. As três últimas são expressões. */
export const poses = [
  "acima-esquerda",
  "acima",
  "acima-direita",
  "esquerda",
  "frente",
  "direita",
  "abaixo-esquerda",
  "abaixo",
  "abaixo-direita",
  "piscar",
  "sorrir",
  "alegria",
];

const vetores = poses.slice(0, 9).map((_, i) => {
  const x = (i % 3) - 1,
    y = Math.floor(i / 3) - 1;
  const comprimento = Math.hypot(x, y) || 1;
  return [x / comprimento, y / comprimento];
});

/** Escolhe a perspectiva da cabeça; uma margem impede tremor entre duas poses. */
export function poseCabeca(x, y, atual = 4, raio = 28) {
  if (![x, y, raio].every(Number.isFinite) || raio <= 0) return 4;
  const distancia = Math.hypot(x, y);
  if (distancia < raio * (atual === 4 ? 1.15 : 1)) return 4;
  const notas = vetores.map(([vx, vy], i) =>
    i === 4 ? -2 : (vx * x + vy * y) / distancia,
  );
  const melhor = notas.indexOf(Math.max(...notas));
  if (atual !== 4 && notas[atual] >= notas[melhor] - 0.055) return atual;
  return melhor;
}

export function deslocamentoQuadro(indice) {
  if (!Number.isInteger(indice) || indice < 0 || indice > 11)
    throw new Error("O quadro precisa ser um número inteiro de 0 a 11.");
  return `translate(${(-(indice % 3) * 100) / 3}%,${-Math.floor(indice / 3) * 25}%)`;
}

export function validarDimensoes(largura, altura) {
  return (
    largura >= 96 && altura >= 128 && Math.abs(largura / 3 - altura / 4) <= 2
  );
}

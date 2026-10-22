/**
 * Preparação do atlas sem dependências de Node.
 * Usada pelo comando `preparar.mjs` e pelo revisor de poses no navegador.
 * As imagens são objetos { largura, altura, pixels } com pixels RGBA de 8 bits.
 */

/** Recorta doze quadros e registra todos pela base dos ombros, com uma escala única. */
export function preparar(imagem, tamanho = 512, inverterLados = false) {
  const { largura, altura, pixels } = imagem;
  const celula = largura / 3;
  if (Math.abs(celula - altura / 4) > 2)
    throw new Error(
      "Use uma grade de 3 colunas × 4 linhas, com células quadradas (por exemplo, 1536 × 2048).",
    );
  // Geradores nem sempre respeitam espaçamento exato: encontre os corredores vazios.
  function cortes(
    eixo,
    quantidade,
    inicio = 0,
    fim = eixo === "x" ? altura : largura,
  ) {
    const comprimento = eixo === "x" ? largura : altura;
    const resultado = [0];
    for (let n = 1; n < quantidade; n++) {
      const centro = (comprimento * n) / quantidade,
        margem = (comprimento / quantidade) * 0.18;
      const livres = [];
      for (
        let v = Math.round(centro - margem);
        v <= Math.round(centro + margem);
        v++
      ) {
        let ocupados = 0;
        for (let t = inicio; t < fim; t++) {
          const i = eixo === "x" ? t * largura + v : v * largura + t;
          if (pixels[i * 4 + 3] >= 48) ocupados++;
        }
        if (!ocupados) livres.push(v);
      }
      if (!livres.length)
        throw new Error(
          "As poses se sobrepõem: gere novamente com espaço entre elas.",
        );
      resultado.push(livres[Math.floor(livres.length / 2)]);
    }
    return [...resultado, comprimento];
  }
  const linhas = cortes("y", 4);
  const colunasPorLinha = Array.from({ length: 4 }, (_, i) =>
    cortes("x", 3, linhas[i], linhas[i + 1]),
  );
  const quadros = [];
  for (let indice = 0; indice < 12; indice++) {
    const colunas = colunasPorLinha[Math.floor(indice / 3)];
    const coluna = inverterLados && indice < 9 ? 2 - (indice % 3) : indice % 3;
    const x0 = colunas[coluna],
      x1 = colunas[coluna + 1];
    const y0 = linhas[Math.floor(indice / 3)],
      y1 = linhas[Math.floor(indice / 3) + 1];
    let esquerda = x1,
      direita = x0,
      topo = y1,
      base = y0,
      opacos = 0,
      vazios = 0;
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const a = pixels[(y * largura + x) * 4 + 3];
        if (a < 16) vazios++;
        if (a < 48) continue;
        opacos++;
        esquerda = Math.min(esquerda, x);
        direita = Math.max(direita, x);
        topo = Math.min(topo, y);
        base = Math.max(base, y);
      }
    if (opacos < celula * celula * 0.04)
      throw new Error(`Quadro ${indice + 1} vazio ou pequeno demais.`);
    if (vazios < celula * celula * 0.08)
      throw new Error(
        `Quadro ${indice + 1} sem transparência suficiente. Gere um PNG com alpha real.`,
      );
    if (esquerda <= x0 || direita >= x1 - 1 || topo <= y0 || base >= y1 - 1)
      throw new Error(
        `Quadro ${indice + 1} encosta na borda. Gere novamente com mais margem.`,
      );
    let soma = 0,
      peso = 0;
    const inicio = base - Math.max(2, Math.round((base - topo) * 0.1));
    for (let y = inicio; y <= base; y++)
      for (let x = esquerda; x <= direita; x++) {
        const a = pixels[(y * largura + x) * 4 + 3] / 255;
        soma += x * a;
        peso += a;
      }
    quadros.push({
      indice,
      x0,
      x1,
      y0,
      y1,
      esquerda,
      direita,
      topo,
      base,
      ancora: soma / peso,
    });
  }
  const alturaMaxima = Math.max(...quadros.map((q) => q.base - q.topo + 1));
  const larguraMaxima = Math.max(
    ...quadros.map(
      (q) => 2 * Math.max(q.ancora - q.esquerda, q.direita - q.ancora),
    ),
  );
  const escala = Math.min(
    1,
    (tamanho * 0.82) / alturaMaxima,
    (tamanho * 0.86) / larguraMaxima,
  );
  const resultado = {
    largura: tamanho * 3,
    altura: tamanho * 4,
    pixels: new Uint8Array(tamanho * tamanho * 12 * 4),
  };
  for (const q of quadros) {
    for (let y = 0; y < tamanho; y++)
      for (let x = 0; x < tamanho; x++) {
        const origemX = (x - tamanho / 2) / escala + q.ancora;
        const origemY = (y - tamanho * 0.91) / escala + q.base;
        // Em escala nativa, preserve os pixels sem suavização por deslocamento fracionário.
        const sx = escala === 1 ? Math.round(origemX) : origemX;
        const sy = escala === 1 ? Math.round(origemY) : origemY;
        const ix = Math.floor(sx),
          iy = Math.floor(sy);
        const fx = sx - ix,
          fy = sy - iy;
        const cor = [0, 0, 0];
        let alpha = 0;
        for (let dy = 0; dy < 2; dy++)
          for (let dx = 0; dx < 2; dx++) {
            const xx = ix + dx,
              yy = iy + dy;
            if (xx < q.x0 || xx >= q.x1 || yy < q.y0 || yy >= q.y1) continue;
            const i = (yy * largura + xx) * 4;
            const peso = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy);
            const a = (pixels[i + 3] / 255) * peso;
            alpha += a;
            for (let c = 0; c < 3; c++) cor[c] += pixels[i + c] * a;
          }
        const destino =
          ((Math.floor(q.indice / 3) * tamanho + y) * resultado.largura +
            (q.indice % 3) * tamanho +
            x) *
          4;
        if (alpha > 0)
          for (let c = 0; c < 3; c++)
            resultado.pixels[destino + c] = Math.round(cor[c] / alpha);
        resultado.pixels[destino + 3] = Math.round(alpha * 255);
      }
  }
  return {
    imagem: resultado,
    relatorio: {
      quadros: 12,
      largura: resultado.largura,
      altura: resultado.altura,
      escala,
      revisao:
        "Confira visualmente a direção de cada cabeça e a consistência dos ombros; a análise de pixels não confirma anatomia.",
    },
  };
}

export function aplicarChroma(imagem, hexadecimal) {
  if (!/^#[\da-f]{6}$/i.test(hexadecimal))
    throw new Error("A cor de fundo precisa estar no formato #ff00ff.");
  const fundo = [1, 3, 5].map((i) => parseInt(hexadecimal.slice(i, i + 2), 16));
  const { largura, altura } = imagem;
  const pixels = new Uint8Array(imagem.pixels);
  const total = largura * altura;
  const visitados = new Uint8Array(total),
    fila = new Int32Array(total);
  let inicio = 0,
    fim = 0;
  function perto(i) {
    const p = i * 4;
    return (
      Math.max(...fundo.map((cor, c) => Math.abs(cor - pixels[p + c]))) < 75
    );
  }
  function incluir(i) {
    if (visitados[i] || !perto(i)) return;
    visitados[i] = 1;
    fila[fim++] = i;
  }
  for (let x = 0; x < largura; x++) {
    incluir(x);
    incluir((altura - 1) * largura + x);
  }
  for (let y = 0; y < altura; y++) {
    incluir(y * largura);
    incluir(y * largura + largura - 1);
  }
  while (inicio < fim) {
    const i = fila[inicio++],
      x = i % largura;
    if (x) incluir(i - 1);
    if (x < largura - 1) incluir(i + 1);
    if (i >= largura) incluir(i - largura);
    if (i < total - largura) incluir(i + largura);
  }
  if (fim < total * 0.08)
    throw new Error(
      "O fundo não corresponde à cor informada ou não chega às bordas.",
    );
  // Nos pixels de contorno, estima a cobertura usando a cor do vizinho interior.
  const original = imagem.pixels;
  for (let i = 0; i < total; i++) {
    if (visitados[i]) {
      pixels[i * 4 + 3] = 0;
      continue;
    }
    const x = i % largura,
      y = Math.floor(i / largura);
    let borda = false;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx,
          yy = y + dy;
        if (
          xx >= 0 &&
          xx < largura &&
          yy >= 0 &&
          yy < altura &&
          visitados[yy * largura + xx]
        )
          borda = true;
      }
    if (!borda) continue;
    let melhor = -1,
      distancia = -1;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx,
          yy = y + dy;
        if (xx < 0 || xx >= largura || yy < 0 || yy >= altura) continue;
        const n = yy * largura + xx;
        if (visitados[n]) continue;
        const d = fundo.reduce(
          (s, c, k) => s + (original[n * 4 + k] - c) ** 2,
          0,
        );
        if (d > distancia) {
          distancia = d;
          melhor = n;
        }
      }
    if (melhor < 0 || distancia === 0) continue;
    let produto = 0;
    for (let c = 0; c < 3; c++)
      produto +=
        (original[i * 4 + c] - fundo[c]) *
        (original[melhor * 4 + c] - fundo[c]);
    const alpha = Math.max(0, Math.min(1, produto / distancia));
    for (let c = 0; c < 3; c++)
      pixels[i * 4 + c] = Math.max(
        0,
        Math.min(
          255,
          Math.round(
            (original[i * 4 + c] - (1 - alpha) * fundo[c]) /
              Math.max(alpha, 0.001),
          ),
        ),
      );
    pixels[i * 4 + 3] = Math.round(alpha * original[i * 4 + 3]);
  }
  return { largura, altura, pixels };
}

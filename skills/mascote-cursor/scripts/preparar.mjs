#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { lerPNG, escreverPNG, aplicarChroma } from "./png.mjs";

/** Recorta doze quadros e registra todos pela base dos ombros, com uma escala única. */
export function preparar(imagem, tamanho = 256, inverterLados = false) {
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
        const sx = (x - tamanho / 2) / escala + q.ancora;
        const sy = (y - tamanho * 0.91) / escala + q.base;
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

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const json = process.argv.includes("--json");
  try {
    const { values } = parseArgs({
      options: {
        entrada: { type: "string" },
        saida: { type: "string" },
        json: { type: "boolean" },
        substituir: { type: "boolean" },
        fundo: { type: "string" },
        "inverter-lados": { type: "boolean" },
      },
    });
    if (!values.entrada || !values.saida)
      throw new Error("Use --entrada arte.png --saida meu-atlas.png [--json].");
    if (resolve(values.entrada) === resolve(values.saida))
      throw new Error(
        "Mantenha a fonte: entrada e saída precisam ser arquivos diferentes.",
      );
    let fonte = lerPNG(await readFile(values.entrada));
    if (values.fundo) fonte = aplicarChroma(fonte, values.fundo);
    const { imagem, relatorio } = preparar(
      fonte,
      256,
      values["inverter-lados"],
    );
    await mkdir(dirname(resolve(values.saida)), { recursive: true });
    await writeFile(values.saida, escreverPNG(imagem), {
      flag: values.substituir ? "w" : "wx",
    });
    console.log(
      json
        ? JSON.stringify({
            ok: true,
            arquivo: resolve(values.saida),
            ...relatorio,
          })
        : `Atlas pronto em ${values.saida}. ${relatorio.revisao}`,
    );
  } catch (erro) {
    const mensagem =
      erro.code === "EEXIST"
        ? "A saída já existe. Escolha outro arquivo ou use --substituir conscientemente."
        : erro.message;
    console.error(
      json ? JSON.stringify({ ok: false, erro: mensagem }) : mensagem,
    );
    process.exitCode = 1;
  }
}

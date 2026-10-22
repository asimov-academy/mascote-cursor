import { inflateSync, deflateSync } from "node:zlib";

const assinatura = Buffer.from("89504e470d0a1a0a", "hex");

export function lerPNG(buffer) {
  if (!buffer.subarray(0, 8).equals(assinatura))
    throw new Error("O arquivo precisa ser PNG.");
  let largura, altura, canais;
  const partes = [];
  for (let pos = 8; pos + 12 <= buffer.length;) {
    const tamanho = buffer.readUInt32BE(pos);
    const tipo = buffer.toString("ascii", pos + 4, pos + 8);
    if (pos + tamanho + 12 > buffer.length) throw new Error("PNG incompleto.");
    const dados = buffer.subarray(pos + 8, pos + 8 + tamanho);
    if (tipo === "IHDR") {
      largura = dados.readUInt32BE(0);
      altura = dados.readUInt32BE(4);
      if (!largura || !altura || largura * altura > 24000000)
        throw new Error("A imagem precisa ter até 24 milhões de pixels.");
      if (dados[8] !== 8 || ![2, 6].includes(dados[9]) || dados[12] !== 0) {
        throw new Error(
          "Exporte um PNG RGB ou RGBA de 8 bits, sem entrelaçamento.",
        );
      }
      canais = dados[9] === 6 ? 4 : 3;
    }
    if (tipo === "IDAT") partes.push(dados);
    if (tipo === "IEND") break;
    pos += tamanho + 12;
  }
  if (!canais || !partes.length)
    throw new Error("PNG sem cabeçalho ou pixels.");
  const linha = largura * canais;
  const bruto = inflateSync(Buffer.concat(partes), {
    maxOutputLength: (linha + 1) * altura,
  });
  if (bruto.length !== (linha + 1) * altura)
    throw new Error("Dimensões e dados do PNG não coincidem.");
  const decodificado = new Uint8Array(linha * altura);
  for (let y = 0; y < altura; y++) {
    const filtro = bruto[y * (linha + 1)];
    if (filtro > 4) throw new Error("Filtro PNG inválido.");
    for (let x = 0; x < linha; x++) {
      const indice = y * linha + x;
      const esquerda = x >= canais ? decodificado[indice - canais] : 0;
      const acima = y ? decodificado[indice - linha] : 0;
      const diagonal =
        y && x >= canais ? decodificado[indice - linha - canais] : 0;
      let previsao = 0;
      if (filtro === 1) previsao = esquerda;
      if (filtro === 2) previsao = acima;
      if (filtro === 3) previsao = Math.floor((esquerda + acima) / 2);
      if (filtro === 4) {
        const p = esquerda + acima - diagonal;
        const a = Math.abs(p - esquerda),
          b = Math.abs(p - acima),
          c = Math.abs(p - diagonal);
        previsao = a <= b && a <= c ? esquerda : b <= c ? acima : diagonal;
      }
      decodificado[indice] = bruto[y * (linha + 1) + x + 1] + previsao;
    }
  }
  const pixels = new Uint8Array(largura * altura * 4);
  for (let i = 0; i < largura * altura; i++) {
    pixels.set(decodificado.subarray(i * canais, i * canais + 3), i * 4);
    pixels[i * 4 + 3] = canais === 4 ? decodificado[i * 4 + 3] : 255;
  }
  return { largura, altura, pixels };
}

const tabela = Uint32Array.from({ length: 256 }, (_, numero) => {
  let c = numero;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function bloco(tipo, dados) {
  const nome = Buffer.from(tipo);
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([nome, dados]))
    crc = tabela[(crc ^ byte) & 255] ^ (crc >>> 8);
  const saida = Buffer.alloc(dados.length + 12);
  saida.writeUInt32BE(dados.length);
  nome.copy(saida, 4);
  dados.copy(saida, 8);
  saida.writeUInt32BE((crc ^ 0xffffffff) >>> 0, saida.length - 4);
  return saida;
}
export function escreverPNG({ largura, altura, pixels }) {
  const cabecalho = Buffer.alloc(13);
  cabecalho.writeUInt32BE(largura);
  cabecalho.writeUInt32BE(altura, 4);
  cabecalho[8] = 8;
  cabecalho[9] = 6;
  const linha = largura * 4;
  const bruto = Buffer.alloc((linha + 1) * altura);
  for (let y = 0; y < altura; y++) {
    // Sub melhora a compressão de ilustrações sem perder nenhum pixel.
    bruto[y * (linha + 1)] = 1;
    for (let x = 0; x < linha; x++) {
      const i = y * linha + x;
      bruto[y * (linha + 1) + x + 1] =
        (pixels[i] - (x >= 4 ? pixels[i - 4] : 0)) & 255;
    }
  }
  return Buffer.concat([
    assinatura,
    bloco("IHDR", cabecalho),
    bloco("IDAT", deflateSync(bruto, { level: 9 })),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}

/** Exportação de chroma key: só a região conectada à borda é fundo. */

// A remoção de fundo não depende de Node; o revisor no navegador usa a mesma função.
export { aplicarChroma } from "./atlas.js";

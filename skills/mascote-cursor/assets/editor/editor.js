import "../mascote.js";
import { poses, validarDimensoes } from "../movimento.js";
import { preparar, aplicarChroma } from "../../scripts/atlas.js";
const $ = (id) => document.getElementById(id);
// arquivo: URL do arquivo escolhido; fonte: imagem original; saida: PNG preparado.
let arquivo, fonte, saida;
const escapar = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
function resultado() {
  $("resultado").textContent =
    `<mascote-cursor atlas="${escapar($("caminho").value)}" rotulo="${escapar($("rotulo").value)}"></mascote-cursor>`;
}
function selecionar(i) {
  $("previa").setAttribute("quadro", i);
  $("movimento").setAttribute("aria-pressed", "false");
  $("movimento").textContent = "Testar movimento";
  for (const b of $("campos").children)
    b.setAttribute("aria-pressed", String(Number(b.dataset.indice) === i));
}
poses.forEach((nome, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = `${i}. ${nome.replaceAll("-", " ")}`;
  b.dataset.indice = i;
  b.addEventListener("click", () => selecionar(i));
  $("campos").append(b);
});
function exibir(url, extensao) {
  $("previa").setAttribute("atlas", url);
  $("caminho").value = $("caminho").value.replace(
    /\.(png|svg)$/i,
    "." + extensao,
  );
  resultado();
  selecionar(4);
}
$("arquivo").addEventListener("change", async () => {
  const escolhido = $("arquivo").files[0];
  if (!escolhido) return;
  const url = URL.createObjectURL(escolhido),
    img = new Image();
  try {
    img.src = url;
    await img.decode();
    if (!validarDimensoes(img.naturalWidth, img.naturalHeight))
      throw new Error(
        "Use uma folha de 3 colunas × 4 linhas, com células quadradas.",
      );
    const svg =
      escolhido.type === "image/svg+xml" || /\.svg$/i.test(escolhido.name);
    const semAlpha =
      /jpe?g$/i.test(escolhido.type) || /\.jpe?g$/i.test(escolhido.name);
    for (const antigo of [arquivo, saida])
      if (antigo) URL.revokeObjectURL(antigo);
    arquivo = url;
    saida = undefined;
    fonte = img;
    $("preparo").disabled = false;
    $("transparente").checked = svg;
    $("baixar").hidden = true;
    exibir(url, svg ? "svg" : "png");
    $("status").textContent =
      `${escolhido.name} — ${img.naturalWidth} × ${img.naturalHeight}. ` +
      (svg
        ? "SVG vai direto para o site. Confira as 12 poses. Se precisar de PNG, use Preparar folha."
        : semAlpha
          ? "JPG não tem transparência: use Preparar folha antes de levar ao site."
          : "Se o fundo aparecer, use Preparar folha. Confira as 12 poses.") +
      " Arquivo apenas neste navegador.";
  } catch (e) {
    URL.revokeObjectURL(url);
    $("status").textContent = `Não foi possível abrir: ${e.message}`;
  }
});
$("preparar").addEventListener("click", async () => {
  if (!fonte) return;
  $("preparar").disabled = true;
  $("status").textContent = "Preparando a folha…";
  // Deixa o navegador mostrar o aviso antes do cálculo, que leva alguns instantes.
  await new Promise((r) => setTimeout(r, 30));
  try {
    const tela = document.createElement("canvas");
    tela.width = fonte.naturalWidth;
    tela.height = fonte.naturalHeight;
    const ctx = tela.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(fonte, 0, 0);
    let imagem = {
      largura: tela.width,
      altura: tela.height,
      pixels: new Uint8Array(
        ctx.getImageData(0, 0, tela.width, tela.height).data.buffer,
      ),
    };
    if (!$("transparente").checked)
      imagem = aplicarChroma(imagem, $("cor").value.trim());
    const { imagem: atlas, relatorio } = preparar(
      imagem,
      512,
      $("inverter").checked,
    );
    tela.width = atlas.largura;
    tela.height = atlas.altura;
    ctx.putImageData(
      new ImageData(
        new Uint8ClampedArray(atlas.pixels.buffer),
        atlas.largura,
        atlas.altura,
      ),
      0,
      0,
    );
    const blob = await new Promise((r) => tela.toBlob(r, "image/png"));
    if (!blob) throw new Error("O navegador não conseguiu gerar o PNG.");
    if (saida) URL.revokeObjectURL(saida);
    saida = URL.createObjectURL(blob);
    exibir(saida, "png");
    $("baixar").href = saida;
    $("baixar").download =
      $("caminho").value.split("/").pop() || "meu-personagem.png";
    $("baixar").hidden = false;
    $("status").textContent =
      `Folha preparada: ${relatorio.largura} × ${relatorio.altura}, fundo transparente. ` +
      "Confira as 12 poses e baixe o PNG. " +
      relatorio.revisao;
  } catch (e) {
    $("status").textContent = `Não foi possível preparar: ${e.message}`;
  } finally {
    $("preparar").disabled = false;
  }
});
$("tema").addEventListener("click", () => {
  const escuro = $("fundo").classList.toggle("escuro");
  $("tema").textContent = escuro ? "Ver em fundo claro" : "Ver em fundo escuro";
});
$("movimento").addEventListener("click", () => {
  if (!$("previa").hasAttribute("quadro")) return selecionar(4);
  $("previa").removeAttribute("quadro");
  $("movimento").setAttribute("aria-pressed", "true");
  $("movimento").textContent = "Parar movimento";
  for (const b of $("campos").children) b.setAttribute("aria-pressed", "false");
});
for (const id of ["caminho", "rotulo"])
  $(id).addEventListener("input", resultado);
$("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("resultado").textContent);
    $("status").textContent =
      "HTML copiado. Coloque o atlas no caminho informado e carregue mascote.js.";
  } catch {
    $("status").textContent = "Selecione e copie o HTML abaixo manualmente.";
  }
});
window.addEventListener("pagehide", () => {
  for (const url of [arquivo, saida]) if (url) URL.revokeObjectURL(url);
});
selecionar(4);
resultado();

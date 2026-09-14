import "../mascote.js";
import { poses, validarDimensoes } from "../movimento.js";
const $ = (id) => document.getElementById(id);
let local;
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
$("arquivo").addEventListener("change", async () => {
  const arquivo = $("arquivo").files[0];
  if (!arquivo) return;
  const url = URL.createObjectURL(arquivo),
    img = new Image();
  try {
    img.src = url;
    await img.decode();
    if (!validarDimensoes(img.naturalWidth, img.naturalHeight))
      throw new Error(
        "Use uma folha de 3 colunas × 4 linhas, com células quadradas.",
      );
    if (local) URL.revokeObjectURL(local);
    local = url;
    $("previa").setAttribute("atlas", url);
    selecionar(4);
    $("status").textContent =
      `${arquivo.name} — ${img.naturalWidth} × ${img.naturalHeight}. Confira as 12 poses. Arquivo apenas neste navegador.`;
  } catch (e) {
    URL.revokeObjectURL(url);
    $("status").textContent = `Não foi possível abrir: ${e.message}`;
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
  if (local) URL.revokeObjectURL(local);
});
selecionar(4);
resultado();

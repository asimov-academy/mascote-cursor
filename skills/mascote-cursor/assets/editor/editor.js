import "../mascote.js";
import { mascotes } from "../catalogo.js";

const previa = document.querySelector("#previa");
const status = document.querySelector("#status");
const inicio = [...mascotes[0].olhos];
const pontos = [...inicio];
const descricoes = [
  "Olho esquerdo: posição horizontal",
  "Olho esquerdo: posição vertical",
  "Olho direito: posição horizontal",
  "Olho direito: posição vertical",
  "Largura dos olhos",
  "Altura dos olhos",
];
const sliders = [];
let arquivoURL;
let versao = 0;

for (const [indice, descricao] of descricoes.entries()) {
  const label = document.createElement("label");
  label.textContent = descricao;
  const valor = document.createElement("output");
  valor.className = "valor";
  const input = document.createElement("input");
  input.type = "range";
  input.min = indice < 4 ? "10" : "3";
  input.max = indice < 4 ? "90" : "18";
  input.step = ".5";
  input.value = pontos[indice];
  input.setAttribute("aria-label", descricao);
  valor.value = `${pontos[indice]}%`;
  input.addEventListener("input", () => {
    pontos[indice] = Number(input.value);
    valor.value = `${input.value}%`;
    atualizar();
  });
  label.append(valor, input);
  document.querySelector("#campos").append(label);
  sliders.push({ input, valor });
}

function escapar(texto) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function atualizar() {
  previa.setAttribute("olhos", pontos.join(","));
  document.querySelector("#resultado").textContent =
    `<mascote-cursor\n  imagem="${escapar(document.querySelector("#caminho").value)}"\n  olhos="${pontos.join(",")}"\n  rotulo="${escapar(document.querySelector("#rotulo").value)}"\n  tamanho="180"\n></mascote-cursor>`;
}

document
  .querySelector("#arquivo")
  .addEventListener("change", async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const atual = ++versao;
    if (!["image/png", "image/webp"].includes(arquivo.type)) {
      status.textContent = "Escolha uma imagem PNG ou WebP.";
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      status.textContent =
        "A imagem está grande. Exporte uma versão abaixo de 10 MB.";
      return;
    }
    let url;
    try {
      url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.src = url;
      await img.decode();
      if (atual !== versao) {
        URL.revokeObjectURL(url);
        return;
      }
      if (img.width !== img.height)
        throw new Error(
          "Use uma imagem quadrada para as coordenadas coincidirem com a prévia.",
        );
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const contexto = canvas.getContext("2d", { willReadFrequently: true });
      contexto.drawImage(img, 0, 0, 128, 128);
      const pixels = contexto.getImageData(0, 0, 128, 128).data;
      let transparentes = 0;
      for (let i = 3; i < pixels.length; i += 4)
        if (pixels[i] < 16) transparentes++;
      if (transparentes < 128 * 128 * 0.02)
        throw new Error(
          "Não encontrei transparência suficiente. Exporte a arte com fundo transparente real.",
        );
      if (arquivoURL) URL.revokeObjectURL(arquivoURL);
      arquivoURL = url;
      previa.setAttribute("imagem", arquivoURL);
      status.textContent = `${arquivo.name}: ${img.width} × ${img.height}. Ajuste os olhos e teste nos dois fundos.`;
      atualizar();
    } catch (erro) {
      if (url) URL.revokeObjectURL(url);
      if (atual === versao)
        status.textContent = erro.message || "Não consegui abrir a imagem.";
    }
  });
document.querySelector("#tema").addEventListener("click", (evento) => {
  const escuro = document.querySelector("#fundo").classList.toggle("escuro");
  evento.currentTarget.textContent = escuro
    ? "Ver em fundo claro"
    : "Ver em fundo escuro";
});
document.querySelector("#movimento").addEventListener("click", (evento) => {
  const pausado = previa.toggleAttribute("pausado");
  evento.currentTarget.textContent = pausado
    ? "Testar movimento"
    : "Pausar movimento";
  evento.currentTarget.setAttribute("aria-pressed", String(!pausado));
});
document.querySelector("#restaurar").addEventListener("click", () => {
  inicio.forEach((numero, i) => {
    pontos[i] = numero;
    sliders[i].input.value = numero;
    sliders[i].valor.value = `${numero}%`;
  });
  atualizar();
});
for (const id of ["caminho", "rotulo"])
  document.getElementById(id).addEventListener("input", atualizar);
document.querySelector("#copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      document.querySelector("#resultado").textContent,
    );
    status.textContent =
      "Configuração copiada. Salve também a imagem no seu projeto.";
  } catch {
    status.textContent =
      "Selecione o código abaixo e copie manualmente; o navegador bloqueou a cópia automática.";
  }
});
window.addEventListener("pagehide", () => {
  if (arquivoURL) URL.revokeObjectURL(arquivoURL);
});
atualizar();

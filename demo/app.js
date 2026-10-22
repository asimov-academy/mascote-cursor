import "../skills/mascote-cursor/assets/mascote.js";
import { mascotes } from "../skills/mascote-cursor/assets/catalogo.js";
import { criacoes } from "./criacoes.js";
const grade = document.querySelector("#grade");
let pausa = false;
function escolher(item) {
  for (const cartao of grade.children) {
    const selecionado = cartao.dataset.id === item.id;
    cartao.dataset.escolhido = String(selecionado);
    cartao
      .querySelector(".selecionar")
      .setAttribute("aria-pressed", String(selecionado));
  }
  document.querySelector("#principal").setAttribute("mascote", item.id);
  document.querySelector("#nome-escolhido").textContent = item.nome;
  document.querySelector("#frase-escolhida").textContent = item.personalidade;
  document.querySelector("#pedido").textContent =
    `Já instalei a skill mascote-cursor deste repositório: https://github.com/asimov-academy/mascote-cursor. Use essa skill para colocar ${item.nome} (${item.id}) ao lado do título do meu site. Integre os arquivos e confira o movimento da cabeça e a reação ao clique no navegador. Se a skill não estiver disponível, me oriente a concluir a instalação antes de continuar.`;
}
for (const item of mascotes) {
  const cartao = document.createElement("article");
  cartao.className = "cartao";
  cartao.dataset.id = item.id;
  // Os valores vêm exclusivamente do catálogo local versionado.
  cartao.innerHTML = `<div class="imagem-cartao"><mascote-cursor mascote="${item.id}"></mascote-cursor></div><button class="selecionar" aria-label="Escolher ${item.nome}" aria-pressed="false">${item.nome}</button>`;
  cartao
    .querySelector(".selecionar")
    .addEventListener("click", () => escolher(item));
  grade.append(cartao);
}
escolher(mascotes[0]);
const galeria = document.querySelector("#galeria");
for (const item of criacoes) {
  const cartao = document.createElement("figure");
  cartao.className = "criacao";
  // Os valores vêm exclusivamente da lista local versionada.
  cartao.innerHTML = `<div class="imagem-cartao"></div><figcaption><strong>${item.nome}</strong><span>${item.estilo}</span><small>${item.origem}</small></figcaption>`;
  cartao.dataset.atlas = item.atlas;
  cartao.dataset.nome = item.nome;
  galeria.append(cartao);
}
// As criações só baixam suas imagens quando a galeria se aproxima da tela.
new IntersectionObserver(
  (entradas, observador) => {
    if (!entradas.some((e) => e.isIntersecting)) return;
    observador.disconnect();
    for (const cartao of galeria.children) {
      const m = document.createElement("mascote-cursor");
      m.setAttribute("atlas", cartao.dataset.atlas);
      m.setAttribute("rotulo", `Fazer carinho em ${cartao.dataset.nome}`);
      m.toggleAttribute("pausado", pausa);
      cartao.querySelector(".imagem-cartao").append(m);
    }
  },
  { rootMargin: "400px" },
).observe(galeria);
document.querySelector("#pausar").addEventListener("click", (evento) => {
  pausa = !pausa;
  document
    .querySelectorAll("mascote-cursor")
    .forEach((m) => m.toggleAttribute("pausado", pausa));
  evento.currentTarget.textContent = pausa
    ? "Retomar movimento"
    : "Pausar movimento";
  evento.currentTarget.setAttribute("aria-pressed", String(pausa));
});

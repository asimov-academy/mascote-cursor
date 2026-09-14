import "../skills/mascote-cursor/assets/mascote.js";
import { mascotes } from "../skills/mascote-cursor/assets/catalogo.js";

const grade = document.querySelector("#grade");
let escolhido = mascotes[0];
let pausa = false;
let avisoTimer;
for (const item of mascotes) {
  const cartao = document.createElement("article");
  cartao.className = "cartao";
  cartao.dataset.id = item.id;
  cartao.dataset.escolhido = String(item.id === escolhido.id);
  // Todos os valores deste template vêm do catálogo local versionado.
  cartao.innerHTML = `<div class="imagem-cartao"><mascote-cursor mascote="${item.id}"></mascote-cursor></div>
    <button class="selecionar" aria-pressed="${item.id === escolhido.id}" aria-label="Escolher ${item.nome}"><strong>${item.nome}</strong></button>`;
  cartao
    .querySelector(".selecionar")
    .addEventListener("click", () => escolher(item));
  grade.append(cartao);
}

function escolher(item) {
  escolhido = item;
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
  document.querySelector("#pedido").textContent = pedido();
}

function pedido() {
  return `Use a skill mascote-cursor para colocar ${escolhido.nome} (${escolhido.id}) ao lado do título do meu site. Integre os arquivos e confira o resultado no navegador.`;
}

async function copiar(texto) {
  const aviso = document.querySelector("#aviso");
  try {
    await navigator.clipboard.writeText(texto);
    aviso.textContent = "Copiado! Agora é só colar no seu assistente.";
  } catch {
    aviso.textContent =
      "Não foi possível copiar automaticamente. Selecione o texto na seção Como usar e copie.";
    document.querySelector("#comecar").scrollIntoView({ behavior: "instant" });
  }
  clearTimeout(avisoTimer);
  aviso.hidden = false;
  avisoTimer = setTimeout(() => {
    aviso.hidden = true;
  }, 4500);
}

document
  .querySelector("#copiar-personagem")
  .addEventListener("click", () => copiar(pedido()));
for (const botao of document.querySelectorAll("[data-copiar]"))
  botao.addEventListener("click", () =>
    copiar(document.getElementById(botao.dataset.copiar).textContent),
  );
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

import { mascotes } from "./catalogo.js";
import { direcao, passo, lerOlhos } from "./movimento.js";

// Uma assinatura de mouse para toda a página. Nenhum loop roda quando tudo repousa.
const presentes = new Set();
let assinatura;
let quadro = 0;
let anterior = 0;
let ponteiro = null;

function acordar() {
  if (!quadro && !document.hidden && presentes.size) {
    anterior = performance.now();
    quadro = requestAnimationFrame(atualizar);
  }
}

function atualizar(agora) {
  quadro = 0;
  let continuar = false;
  for (const mascote of presentes)
    continuar = mascote.avancar((agora - anterior) / 1000) || continuar;
  anterior = agora;
  if (continuar && !document.hidden) quadro = requestAnimationFrame(atualizar);
}

function mirar() {
  for (const mascote of presentes) mascote.mirar(ponteiro);
  acordar();
}

function registrar(mascote) {
  presentes.add(mascote);
  if (!assinatura) {
    assinatura = new AbortController();
    const opcoes = { signal: assinatura.signal, passive: true };
    window.addEventListener(
      "pointermove",
      (evento) => {
        if (evento.pointerType === "touch") return;
        ponteiro = [evento.clientX, evento.clientY];
        mirar();
      },
      opcoes,
    );
    window.addEventListener("scroll", mirar, { ...opcoes, capture: true });
    window.addEventListener("resize", mirar, opcoes);
    const voltar = () => {
      ponteiro = null;
      mirar();
    };
    window.addEventListener("blur", voltar, opcoes);
    document.documentElement.addEventListener("pointerleave", voltar, opcoes);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          cancelAnimationFrame(quadro);
          quadro = 0;
          ponteiro = null;
          for (const item of presentes) item.repousar();
        } else mirar();
      },
      opcoes,
    );
  }
  mascote.mirar(ponteiro);
  acordar();
}

function retirar(mascote) {
  presentes.delete(mascote);
  if (!presentes.size) {
    assinatura?.abort();
    assinatura = null;
    cancelAnimationFrame(quadro);
    quadro = 0;
    ponteiro = null;
  }
}

const estilo = `
  :host { display:inline-block; width:var(--mascote-tamanho,160px); max-width:100%; vertical-align:middle; }
  *, *::before, *::after { box-sizing:border-box; }
  button { appearance:none; display:block; position:relative; width:100%; aspect-ratio:1;
    border:0; padding:0; background:transparent; color:#302722; cursor:pointer; touch-action:manipulation; }
  button:focus-visible { outline:3px solid var(--mascote-foco,#286958); outline-offset:2px; border-radius:24%; }
  .corpo { position:absolute; inset:0; transform-origin:50% 82%; }
  img { display:block; width:100%; height:100%; object-fit:contain; user-select:none; pointer-events:none; }
  .olho { position:absolute; overflow:hidden; border-radius:50%; background:#fff8ea;
    box-shadow:inset 0 -1px 2px #54372220,0 1px 2px #54372220;
    transition:transform 120ms cubic-bezier(.23,1,.32,1); }
  .pupila { position:absolute; width:56%; height:66%; left:22%; top:17%; border-radius:50%; background:#302722; }
  .pupila::after { content:''; position:absolute; width:26%; height:23%; background:#fffdf6;
    left:17%; top:15%; border-radius:50%; }
  .feliz .olho { transform:scaleY(.12); }
  .feliz .pupila { opacity:0; }
  .carinho { position:absolute; right:18%; top:10%; color:#c45c4a; font:700 26px/1 system-ui;
    opacity:0; transition:opacity 120ms ease; pointer-events:none; }
  .feliz .carinho { opacity:1; }
  .erro { display:block; padding:16px; font:13px/1.5 system-ui; }
  [hidden] { display:none!important; }
  .instantaneo .olho, .instantaneo .carinho { transition:none; }
  @media (prefers-reduced-motion:reduce) { .olho,.carinho { transition:none; } }
`;

export class MascoteCursor extends (globalThis.HTMLElement ?? class {}) {
  static observedAttributes = [
    "mascote",
    "tamanho",
    "rotulo",
    "pausado",
    "imagem",
    "olhos",
  ];

  constructor() {
    super();
    if (!this.attachShadow) return;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${estilo}</style>
      <button type="button"><span class="corpo" aria-hidden="true">
        <img alt="" draggable="false" width="512" height="512">
        <span class="olho"><span class="pupila"></span></span>
        <span class="olho"><span class="pupila"></span></span>
        <span class="carinho">♥</span>
      </span><span class="erro" hidden></span></button>`;
    this.botao = this.shadowRoot.querySelector("button");
    this.corpo = this.shadowRoot.querySelector(".corpo");
    this.foto = this.shadowRoot.querySelector("img");
    this.olhos = [...this.shadowRoot.querySelectorAll(".olho")];
    this.pupilas = [...this.shadowRoot.querySelectorAll(".pupila")];
    this.posicao = [0, 0];
    this.velocidade = [0, 0];
    this.destino = [0, 0];
    this.visivel = false;
    this.carregado = false;
  }

  connectedCallback() {
    this.eventos?.abort();
    this.eventos = new AbortController();
    const signal = this.eventos.signal;
    this.reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    this.preciso = matchMedia("(hover: hover) and (pointer: fine)");
    for (const media of [this.reduzir, this.preciso]) {
      media.addEventListener(
        "change",
        () => {
          this.repousar();
          this.mirar(ponteiro);
          acordar();
        },
        { signal },
      );
    }
    this.botao.addEventListener(
      "click",
      (evento) => this.reagir(evento.detail === 0),
      { signal },
    );
    this.foto.addEventListener(
      "load",
      () => {
        if (!this.configuracaoValida) return;
        this.carregado = true;
        this.corpo.hidden = false;
        this.shadowRoot.querySelector(".erro").hidden = true;
        this.mirar(ponteiro);
        acordar();
      },
      { signal },
    );
    this.foto.addEventListener(
      "error",
      () =>
        this.falhar(
          "Não consegui abrir a imagem do mascote. Confira o caminho e a instalação.",
        ),
      { signal },
    );
    this.observador = new IntersectionObserver(([entrada]) => {
      this.visivel = entrada.isIntersecting;
      if (!this.visivel) this.repousar();
      this.mirar(ponteiro);
      acordar();
    });
    this.observador.observe(this);
    this.configurar();
    registrar(this);
  }

  disconnectedCallback() {
    this.eventos?.abort();
    this.observador?.disconnect();
    clearTimeout(this.temporizador);
    this.repousar();
    retirar(this);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.configurar();
  }

  configurar() {
    this.configuracaoValida = false;
    const id = this.getAttribute("mascote") || "capi";
    const item = mascotes.find((m) => m.id === id);
    const imagem = this.getAttribute("imagem");
    if (!item && !imagem)
      return this.falhar(
        `Mascote “${id}” não encontrado. Escolha um nome do catálogo.`,
      );
    let pontos;
    try {
      pontos = lerOlhos(
        this.getAttribute("olhos"),
        item?.olhos ?? [41, 47, 59, 47, 9, 11],
      );
    } catch (erro) {
      return this.falhar(erro.message);
    }
    const tamanho = Number(this.getAttribute("tamanho"));
    if (
      this.hasAttribute("tamanho") &&
      (!Number.isFinite(tamanho) || tamanho < 48 || tamanho > 800)
    ) {
      return this.falhar(
        "O tamanho precisa ser um número entre 48 e 800 pixels.",
      );
    }
    if (this.hasAttribute("tamanho"))
      this.style.setProperty("--mascote-tamanho", `${tamanho}px`);
    else this.style.removeProperty("--mascote-tamanho");
    this.botao.setAttribute(
      "aria-label",
      this.getAttribute("rotulo") ||
        `Fazer carinho em ${item?.nome ?? "meu mascote"}`,
    );
    this.botao.disabled = false;
    this.shadowRoot.querySelector(".erro").hidden = true;
    let origem;
    try {
      const url = imagem
        ? new URL(imagem, document.baseURI)
        : new URL(`./mascotes/${id}.png`, import.meta.url);
      if (!["http:", "https:", "blob:", "data:"].includes(url.protocol))
        throw new Error();
      origem = url.href;
    } catch {
      return this.falhar(
        "O caminho da imagem é inválido. Use uma URL de imagem ou um caminho público.",
      );
    }
    this.configuracaoValida = true;
    this.corpo.hidden = true;
    this.carregado = false;
    if (this.foto.src !== origem) this.foto.src = origem;
    else if (this.foto.complete && this.foto.naturalWidth) {
      this.carregado = true;
      this.corpo.hidden = false;
    } else if (this.foto.complete) {
      return this.falhar(
        "Não consegui abrir a imagem do mascote. Confira o caminho e a instalação.",
      );
    }
    this.olhos.forEach((olho, indice) => {
      olho.style.left = `${pontos[indice * 2] - pontos[4] / 2}%`;
      olho.style.top = `${pontos[indice * 2 + 1] - pontos[5] / 2}%`;
      olho.style.width = `${pontos[4]}%`;
      olho.style.height = `${pontos[5]}%`;
    });
    this.repousar();
    this.mirar(ponteiro);
    acordar();
  }

  falhar(mensagem) {
    this.configuracaoValida = false;
    this.carregado = false;
    this.repousar();
    this.corpo.hidden = true;
    this.botao.disabled = true;
    const erro = this.shadowRoot.querySelector(".erro");
    erro.textContent = mensagem;
    erro.hidden = false;
    this.dispatchEvent(
      new CustomEvent("mascote-erro", {
        detail: { mensagem },
        bubbles: true,
        composed: true,
      }),
    );
  }

  get podeMover() {
    return (
      this.carregado &&
      this.visivel &&
      !this.reduzir?.matches &&
      !this.hasAttribute("pausado") &&
      !document.hidden
    );
  }

  mirar(ponto) {
    if (!this.podeMover || !this.preciso?.matches || !ponto) {
      this.destino = [0, 0];
      return;
    }
    const caixa = this.getBoundingClientRect();
    this.destino = direcao(
      ponto[0] - caixa.left - caixa.width / 2,
      ponto[1] - caixa.top - caixa.height * 0.47,
      Math.max(120, caixa.width * 1.4),
    );
  }

  avancar(dt) {
    if (!this.podeMover) return false;
    let movendo = false;
    for (let eixo = 0; eixo < 2; eixo++) {
      [this.posicao[eixo], this.velocidade[eixo]] = passo(
        this.posicao[eixo],
        this.velocidade[eixo],
        this.destino[eixo],
        dt,
      );
      if (
        Math.abs(this.posicao[eixo] - this.destino[eixo]) > 0.001 ||
        Math.abs(this.velocidade[eixo]) > 0.001
      )
        movendo = true;
    }
    if (!movendo) {
      this.posicao = [...this.destino];
      this.velocidade = [0, 0];
    }
    this.desenhar();
    return movendo;
  }

  desenhar() {
    const [x, y] = this.posicao;
    this.corpo.style.transform = `rotate(${x * 3}deg) translateY(${y}%)`;
    // Limita também a ultrapassagem da mola para manter as pupilas dentro dos olhos.
    const [px, py] = direcao(x, y, 1);
    for (const pupila of this.pupilas)
      pupila.style.transform = `translate(${px * 28}%,${py * 20}%)`;
  }

  repousar() {
    clearTimeout(this.temporizador);
    this.corpo?.classList.remove("feliz", "instantaneo");
    this.posicao = [0, 0];
    this.velocidade = [0, 0];
    this.destino = [0, 0];
    if (this.corpo) this.desenhar();
  }

  reagir(teclado = false) {
    if (!this.carregado) return;
    clearTimeout(this.temporizador);
    this.corpo.classList.toggle("instantaneo", teclado || !this.podeMover);
    this.corpo.classList.add("feliz");
    this.temporizador = setTimeout(
      () => this.corpo.classList.remove("feliz"),
      700,
    );
    this.dispatchEvent(
      new CustomEvent("mascote-carinho", {
        detail: { mascote: this.getAttribute("mascote") || "capi" },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (globalThis.customElements && !customElements.get("mascote-cursor"))
  customElements.define("mascote-cursor", MascoteCursor);

import { mascotes } from "./catalogo.js";
import {
  poseCabeca,
  deslocamentoQuadro,
  validarDimensoes,
  poses,
} from "./movimento.js";

// Os eventos da página compartilham um único quadro; sem loop de animação contínuo.
const presentes = new Set();
let assinatura,
  pendente = 0,
  ponteiro = null;
function agendar() {
  if (pendente || document.hidden || !presentes.size) return;
  pendente = requestAnimationFrame(() => {
    pendente = 0;
    for (const item of presentes) item.mirar(ponteiro);
  });
}
function registrar(item) {
  presentes.add(item);
  if (!assinatura) {
    assinatura = new AbortController();
    const opcoes = { signal: assinatura.signal, passive: true };
    window.addEventListener(
      "pointermove",
      (evento) => {
        if (evento.pointerType === "touch") return;
        ponteiro = [evento.clientX, evento.clientY];
        agendar();
      },
      opcoes,
    );
    window.addEventListener("scroll", agendar, { ...opcoes, capture: true });
    window.addEventListener("resize", agendar, opcoes);
    const voltar = () => {
      ponteiro = null;
      agendar();
    };
    window.addEventListener("blur", voltar, opcoes);
    document.documentElement.addEventListener("pointerleave", voltar, opcoes);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          cancelAnimationFrame(pendente);
          pendente = 0;
          ponteiro = null;
          for (const mascote of presentes) mascote.repousar();
        } else agendar();
      },
      opcoes,
    );
  }
  agendar();
}
function retirar(item) {
  presentes.delete(item);
  if (!presentes.size) {
    assinatura?.abort();
    assinatura = null;
    ponteiro = null;
    cancelAnimationFrame(pendente);
    pendente = 0;
  }
}

const estilo = `
  :host { display:inline-block; width:var(--mascote-tamanho,160px); max-width:100%; vertical-align:middle; }
  *,*::before,*::after { box-sizing:border-box; }
  button { appearance:none; position:relative; display:block; width:100%; aspect-ratio:1;
    border:0; padding:0; background:transparent; color:#302722; cursor:pointer; touch-action:manipulation; }
  button:focus-visible { outline:3px solid var(--mascote-foco,#286958); outline-offset:2px; border-radius:24%; }
  .corpo,.recorte { position:absolute; inset:0; }
  .recorte { overflow:hidden; }
  img { position:absolute; inset:0 auto auto 0; display:block; width:300%; height:400%; max-width:none;
    user-select:none; pointer-events:none; }
  .carinho { position:absolute; right:15%; top:5%; color:#c45c4a; font:700 26px/1 system-ui;
    opacity:0; transition:opacity 120ms ease; pointer-events:none; }
  .feliz .carinho { opacity:1; }
  .erro { display:block; padding:16px; font:13px/1.5 system-ui; }
  [hidden] { display:none!important; }
  .instantaneo .carinho { transition:none; }
  @media(prefers-reduced-motion:reduce) { .carinho { transition:none; } }
`;

export class MascoteCursor extends (globalThis.HTMLElement ?? class {}) {
  static observedAttributes = [
    "mascote",
    "tamanho",
    "rotulo",
    "pausado",
    "atlas",
    "quadro",
    "imagem",
    "olhos",
  ];
  constructor() {
    super();
    if (!this.attachShadow) return;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${estilo}</style><button type="button">
      <span class="corpo" aria-hidden="true"><span class="recorte"><img alt="" draggable="false"></span>
      <span class="carinho">♥</span></span><span class="erro" hidden></span></button>`;
    this.botao = this.shadowRoot.querySelector("button");
    this.corpo = this.shadowRoot.querySelector(".corpo");
    this.foto = this.shadowRoot.querySelector("img");
    this.pose = 4;
    this.visivel = false;
    this.carregado = false;
    this.temporizadores = [];
    this.reagindo = false;
  }
  connectedCallback() {
    this.eventos?.abort();
    this.eventos = new AbortController();
    const signal = this.eventos.signal;
    this.reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    this.preciso = matchMedia("(hover: hover) and (pointer: fine)");
    for (const media of [this.reduzir, this.preciso])
      media.addEventListener(
        "change",
        () => {
          this.repousar();
          agendar();
        },
        { signal },
      );
    this.botao.addEventListener(
      "click",
      (evento) => this.reagir(evento.detail === 0),
      { signal },
    );
    this.foto.addEventListener("load", () => this.pronto(), { signal });
    this.foto.addEventListener(
      "error",
      () =>
        this.falhar(
          "Não consegui abrir o atlas do mascote. Confira o caminho e a instalação.",
        ),
      { signal },
    );
    this.observador = new IntersectionObserver(([entrada]) => {
      this.visivel = entrada.isIntersecting;
      if (!this.visivel) this.repousar();
      agendar();
    });
    this.observador.observe(this);
    this.configurar();
    registrar(this);
  }
  disconnectedCallback() {
    this.eventos?.abort();
    this.observador?.disconnect();
    this.repousar();
    retirar(this);
  }
  attributeChangedCallback() {
    if (this.isConnected) this.configurar();
  }

  configurar() {
    this.configuracaoValida = false;
    if (this.hasAttribute("imagem") || this.hasAttribute("olhos"))
      return this.falhar(
        'A versão 2 usa poses completas. Troque imagem/olhos por atlas="/caminho/folha.png", em grade 3 × 4.',
      );
    const id = this.getAttribute("mascote") || "capi";
    const item = mascotes.find((m) => m.id === id),
      atlas = this.getAttribute("atlas");
    if (!item && !atlas)
      return this.falhar(
        `Mascote “${id}” não encontrado. Escolha um nome do catálogo.`,
      );
    const tamanho = Number(this.getAttribute("tamanho"));
    if (
      this.hasAttribute("tamanho") &&
      (!Number.isFinite(tamanho) || tamanho < 48 || tamanho > 800)
    )
      return this.falhar(
        "O tamanho precisa ser um número entre 48 e 800 pixels.",
      );
    if (this.hasAttribute("quadro")) {
      const valor = this.getAttribute("quadro");
      if (!/^(?:[0-9]|1[01])$/.test(valor))
        return this.falhar("O quadro precisa ser um número inteiro de 0 a 11.");
    }
    if (this.hasAttribute("tamanho"))
      this.style.setProperty("--mascote-tamanho", `${tamanho}px`);
    else this.style.removeProperty("--mascote-tamanho");
    this.botao.setAttribute(
      "aria-label",
      this.getAttribute("rotulo") ||
        `Fazer carinho em ${item?.nome ?? "meu mascote"}`,
    );
    let origem;
    try {
      const url = atlas
        ? new URL(atlas, document.baseURI)
        : new URL(`./mascotes/${id}.png`, import.meta.url);
      if (!["http:", "https:", "blob:", "data:"].includes(url.protocol))
        throw new Error();
      origem = url.href;
    } catch {
      return this.falhar(
        "O caminho do atlas é inválido. Use uma URL de imagem ou um caminho público.",
      );
    }
    this.configuracaoValida = true;
    this.carregado = false;
    this.corpo.hidden = true;
    this.botao.disabled = false;
    this.shadowRoot.querySelector(".erro").hidden = true;
    this.repousar();
    if (this.foto.src !== origem) this.foto.src = origem;
    else if (this.foto.complete) this.pronto();
  }
  pronto() {
    if (!this.configuracaoValida) return;
    if (!this.foto.naturalWidth)
      return this.falhar(
        "Não consegui abrir o atlas do mascote. Confira o caminho e a instalação.",
      );
    if (!validarDimensoes(this.foto.naturalWidth, this.foto.naturalHeight))
      return this.falhar(
        "O atlas precisa de 3 colunas × 4 linhas, com células quadradas. Use o preparador da skill.",
      );
    this.carregado = true;
    this.corpo.hidden = false;
    this.shadowRoot.querySelector(".erro").hidden = true;
    this.exibir(this.quadroEmRepouso);
    agendar();
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
      !this.hasAttribute("quadro") &&
      !document.hidden
    );
  }
  get quadroEmRepouso() {
    const valor = this.getAttribute("quadro");
    return valor !== null && /^(?:[0-9]|1[01])$/.test(valor)
      ? Number(valor)
      : this.pose;
  }
  mirar(ponto) {
    if (!this.podeMover || !this.preciso?.matches || !ponto) this.pose = 4;
    else {
      const caixa = this.getBoundingClientRect();
      this.pose = poseCabeca(
        ponto[0] - caixa.left - caixa.width / 2,
        ponto[1] - caixa.top - caixa.height * 0.45,
        this.pose,
        Math.max(18, caixa.width * 0.16),
      );
    }
    if (!this.reagindo) this.exibir(this.quadroEmRepouso);
  }
  exibir(indice) {
    this.foto.style.transform = deslocamentoQuadro(indice);
    this.corpo.dataset.pose = poses[indice];
    this.quadroAtual = indice;
  }
  repousar() {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
    this.reagindo = false;
    this.pose = 4;
    this.corpo?.classList.remove("feliz", "instantaneo");
    if (this.foto) this.exibir(this.quadroEmRepouso);
  }
  reagir(teclado = false) {
    if (!this.carregado) return;
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
    this.reagindo = true;
    const instantaneo = teclado || !this.podeMover;
    this.corpo.classList.toggle("instantaneo", instantaneo);
    this.corpo.classList.add("feliz");
    this.exibir(instantaneo ? 10 : 9);
    if (!instantaneo)
      this.temporizadores.push(setTimeout(() => this.exibir(10), 150));
    this.temporizadores.push(
      setTimeout(() => {
        this.reagindo = false;
        this.corpo.classList.remove("feliz");
        this.mirar(ponteiro);
      }, 700),
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

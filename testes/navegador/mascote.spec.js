import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { lerPNG } from "../../skills/mascote-cursor/scripts/png.mjs";

async function abrir(page) {
  await page.goto("/");
  await expect
    .poll(() => page.locator("#principal").evaluate((m) => m.carregado))
    .toBe(true);
}

test("as dez artes carregam e têm transparência de verdade", async ({
  page,
}) => {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await abrir(page);
  await expect(page.locator(".grade mascote-cursor")).toHaveCount(10);
  await expect
    .poll(() =>
      page
        .locator(".grade mascote-cursor")
        .evaluateAll((ms) => ms.every((m) => m.carregado)),
    )
    .toBe(true);
  const alphas = await page.locator(".grade mascote-cursor").evaluateAll((ms) =>
    ms.map((m) => {
      const img = m.shadowRoot.querySelector("img");
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
      let vazios = 0;
      let opacos = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) vazios++;
        if (pixels[i] > 250) opacos++;
      }
      return { vazios, opacos };
    }),
  );
  expect(alphas.every((a) => a.vazios > 10000 && a.opacos > 10000)).toBe(true);
  const nitidez = await page.locator("#principal").evaluate((m) => ({
    disponiveis: m.foto.naturalWidth / 3,
    necessarios: m.getBoundingClientRect().width * devicePixelRatio,
  }));
  expect(nitidez.disponiveis).toBeGreaterThanOrEqual(nitidez.necessarios);
  expect(erros).toEqual([]);
});

test("a cabeça acompanha as oito direções e retorna ao centro", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Toque não acompanha movimento.");
  await abrir(page);
  const m = page.locator("#principal");
  await m.evaluate((m) => {
    m.style.position = "fixed";
    m.style.left = "350px";
    m.style.top = "250px";
    m.setAttribute("tamanho", "160");
  });
  const b = await m.boundingBox();
  for (let i = 0; i < 9; i++) {
    await page.mouse.move(
      b.x + b.width / 2 + ((i % 3) - 1) * 180,
      b.y + b.height * 0.45 + (Math.floor(i / 3) - 1) * 180,
    );
    await expect.poll(() => m.evaluate((m) => m.quadroAtual)).toBe(i);
  }
  await expect(m.locator(".corpo")).toHaveCSS("transform", "none");
});

test("clique ou toque faz carinho e termina a reação", async ({
  page,
  isMobile,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await abrir(page);
  await page.clock.pauseAt(new Date("2026-01-01T00:01:00Z"));
  const m = page.locator("#principal");
  if (isMobile) await m.locator("button").tap();
  else await m.locator("button").click();
  await page.clock.runFor(200);
  await expect(m.locator(".corpo")).toHaveClass(/feliz/);
  await expect(m.locator(".carinho")).toHaveCSS("opacity", "1");
  await expect.poll(() => m.evaluate((m) => m.quadroAtual)).toBe(10);
  await page.clock.runFor(800);
  await expect(m.locator(".corpo")).not.toHaveClass(/feliz/);
});

test("Enter e Espaço oferecem a mesma interação acessível", async ({
  page,
}) => {
  await abrir(page);
  const m = page.locator("#principal");
  const botao = m.getByRole("button", { name: "Fazer carinho em Capi" });
  await botao.focus();
  await page.keyboard.press("Enter");
  await expect(m.locator(".corpo")).toHaveClass(/feliz/);
  await expect(m.locator(".corpo")).toHaveClass(/instantaneo/);
  await expect(m.locator(".corpo")).not.toHaveClass(/feliz/, { timeout: 2500 });
  await page.keyboard.press("Space");
  await expect(m.locator(".corpo")).toHaveClass(/feliz/);
});

test("reduzir movimento desliga o acompanhamento, mas mantém carinho", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page);
  const m = page.locator("#principal");
  await page.mouse.move(10, 10);
  await expect(m.locator(".corpo")).toHaveCSS("transform", "none");
  await m.locator("button").click();
  await expect(m.locator(".carinho")).toHaveCSS("opacity", "1");
  expect(await m.evaluate((m) => m.podeMover)).toBe(false);
});

test("pausar e trocar personagem mantém a escolha acessível", async ({
  page,
}) => {
  await abrir(page);
  await page
    .getByRole("button", { name: "Pausar movimento", exact: true })
    .click();
  await expect(page.locator("#principal")).toHaveAttribute("pausado", "");
  await page
    .getByRole("button", { name: "Escolher Bento", exact: true })
    .click();
  await expect(page.locator("#principal")).toHaveAttribute("mascote", "bento");
  await expect(page.locator("#principal")).toHaveAttribute("pausado", "");
  await expect(
    page.getByRole("button", { name: "Escolher Bento", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#pedido")).toContainText("Bento");
  await expect
    .poll(() => page.locator("#principal").evaluate((m) => m.carregado))
    .toBe(true);
});

test("configuração e imagem inválidas mostram mensagem e permitem recuperação", async ({
  page,
}) => {
  await abrir(page);
  const m = page.locator("#principal");
  await m.evaluate((m) => m.setAttribute("mascote", "inexistente"));
  await expect(m.locator("button")).toBeDisabled();
  await expect(m.locator(".erro")).toContainText("não encontrado");
  await m.evaluate((m) => m.setAttribute("mascote", "tico"));
  await expect.poll(() => m.evaluate((m) => m.carregado)).toBe(true);
  await m.evaluate((m) => m.setAttribute("olhos", "NaN,1,2"));
  await expect(m.locator(".erro")).toContainText("versão 2");
  await m.evaluate((m) => {
    m.removeAttribute("olhos");
    m.setAttribute("atlas", "/nao-existe.png");
  });
  await expect(m.locator(".erro")).toContainText("Não consegui abrir");
  await m.evaluate((m) => m.setAttribute("tamanho", "180"));
  await expect(m.locator(".erro")).toBeVisible();
  await expect(m.locator("button")).toBeDisabled();
  await m.evaluate((m) => m.removeAttribute("atlas"));
  await expect.poll(() => m.evaluate((m) => m.carregado)).toBe(true);
  await expect(m.locator("button")).toBeEnabled();
});

test("desmontar e remontar não duplica a reação nem mantém recursos ativos", async ({
  page,
}) => {
  await abrir(page);
  await page.evaluate(() => {
    const m = document.querySelector("#principal");
    const pai = m.parentElement;
    for (let i = 0; i < 5; i++) {
      m.remove();
      pai.append(m);
    }
    window.carinhos = 0;
    m.addEventListener("mascote-carinho", () => window.carinhos++);
  });
  await page.locator("#principal button").click();
  expect(await page.evaluate(() => window.carinhos)).toBe(1);
  const resultado = await page.locator("#principal").evaluate((m) => {
    m.remove();
    return { abortado: m.eventos.signal.aborted, pose: m.pose };
  });
  expect(resultado).toEqual({ abortado: true, pose: 4 });
});

test("não há rolagem horizontal no celular", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await abrir(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("revisor aceita atlas local e permite conferir todas as poses", async ({
  page,
}) => {
  await page.goto("/skills/mascote-cursor/assets/editor/");
  await page
    .locator("#arquivo")
    .setInputFiles(resolve("skills/mascote-cursor/assets/mascotes/capi.png"));
  await expect(page.locator("#status")).toContainText("1536 × 2048");
  const m = page.locator("#previa");
  await expect(m).toHaveAttribute("atlas", /^blob:/);
  for (let i = 0; i < 12; i++) {
    await page.locator(`#campos button[data-indice="${i}"]`).click();
    await expect.poll(() => m.evaluate((m) => m.quadroAtual)).toBe(i);
  }
  await expect(page.locator("#resultado")).toContainText('atlas="');
  await page.getByRole("button", { name: "Ver em fundo escuro" }).click();
  await expect(page.locator("#fundo")).toHaveClass("escuro");
});

test("divulgação encaminha ao GitHub e explica a instalação antes do pedido", async ({
  page,
}) => {
  await abrir(page);
  await expect(page.locator("main a")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Baixar a skill no GitHub" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/asimov-academy/mascote-cursor#comece-por-aqui",
  );
  await expect(page.getByRole("button", { name: /copiar/i })).toHaveCount(0);
  await expect(page.locator(".passos li")).toHaveCount(3);
  await expect(page.locator(".passos li").nth(1)).toContainText(
    "npx skills add asimov-academy/mascote-cursor",
  );
  await expect(page.locator("#pedido")).toContainText("Já instalei a skill");
  await page
    .getByRole("button", { name: "Escolher Bento", exact: true })
    .click();
  await expect(page.locator("#pedido")).toContainText("Bento (bento)");
  await expect(page.locator("#pedido")).toContainText(
    "https://github.com/asimov-academy/mascote-cursor",
  );
});

test("atlas em SVG carrega sem preparo e acompanha as nove direções", async ({
  page,
  isMobile,
}) => {
  await abrir(page);
  const m = page.locator("#principal");
  await m.evaluate((m) => {
    m.style.position = "fixed";
    m.style.left = "350px";
    m.style.top = "250px";
    m.setAttribute("tamanho", "160");
    m.setAttribute(
      "atlas",
      "/skills/mascote-cursor/references/exemplo-atlas.svg",
    );
  });
  await expect.poll(() => m.evaluate((m) => m.carregado)).toBe(true);
  // Cantos das células transparentes e cabeça opaca no centro de cada pose.
  // Uma imagem nova evita que o WebKit rasterize só o trecho visível do atlas.
  const grade = await m.evaluate(async (m) => {
    const img = new Image();
    img.src = m.foto.src;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const alpha = (x, y) => ctx.getImageData(x, y, 1, 1).data[3];
    return Array.from({ length: 12 }, (_, i) => {
      const x = (i % 3) * 512,
        y = Math.floor(i / 3) * 512;
      return { canto: alpha(x + 8, y + 8), cabeca: alpha(x + 256, y + 250) };
    }).concat({ largura: c.width, altura: c.height });
  });
  expect(grade.pop()).toEqual({ largura: 1536, altura: 2048 });
  expect(grade).toEqual(Array(12).fill({ canto: 0, cabeca: 255 }));
  test.skip(isMobile, "Toque não acompanha movimento.");
  const b = await m.boundingBox();
  for (let i = 0; i < 9; i++) {
    await page.mouse.move(
      b.x + b.width / 2 + ((i % 3) - 1) * 180,
      b.y + b.height * 0.45 + (Math.floor(i / 3) - 1) * 180,
    );
    await expect.poll(() => m.evaluate((m) => m.quadroAtual)).toBe(i);
  }
});

test("revisor aceita SVG direto e também o converte em PNG", async ({
  page,
}) => {
  await page.goto("/skills/mascote-cursor/assets/editor/");
  await page
    .locator("#arquivo")
    .setInputFiles(
      resolve("skills/mascote-cursor/references/exemplo-atlas.svg"),
    );
  await expect(page.locator("#status")).toContainText("SVG vai direto");
  await expect(page.locator("#transparente")).toBeChecked();
  await expect
    .poll(() => page.locator("#previa").evaluate((m) => m.carregado))
    .toBe(true);
  await expect(page.locator("#resultado")).toContainText("meu-personagem.svg");
  // Quem preferir PNG converte o mesmo SVG, já transparente, no revisor.
  await page.getByRole("button", { name: "Preparar folha" }).click();
  await expect(page.locator("#status")).toContainText("Folha preparada");
  await expect(page.locator("#resultado")).toContainText("meu-personagem.png");
});

test("revisor prepara uma folha JPG e entrega PNG transparente", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Download coberto nos navegadores de mesa.");
  await page.goto("/skills/mascote-cursor/assets/editor/");
  // Folha sintética 3 × 4 com fundo magenta, como sai de um gerador sem alpha.
  const jpg = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 384;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(0, 0, 384, 512);
    for (let i = 0; i < 12; i++) {
      const x = (i % 3) * 128,
        y = Math.floor(i / 3) * 128;
      ctx.fillStyle = `rgb(${40 + (i % 3) * 60},140,60)`;
      ctx.beginPath();
      ctx.arc(x + 64, y + 56, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 34, y + 70, 60, 40);
    }
    return c.toDataURL("image/jpeg", 0.9).split(",")[1];
  });
  await page.locator("#arquivo").setInputFiles({
    name: "folha.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(jpg, "base64"),
  });
  await expect(page.locator("#status")).toContainText(
    "JPG não tem transparência",
  );
  await page.getByRole("button", { name: "Preparar folha" }).click();
  await expect(page.locator("#status")).toContainText(
    "Folha preparada: 1536 × 2048",
  );
  const m = page.locator("#previa");
  await expect.poll(() => m.evaluate((m) => m.carregado)).toBe(true);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Baixar PNG preparado" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("meu-personagem.png");
  // O PNG baixado é lido pelo mesmo leitor do preparador de linha de comando.
  const png = lerPNG(await readFile(await download.path()));
  expect([png.largura, png.altura]).toEqual([1536, 2048]);
  expect(png.pixels[3]).toBe(0);
  // A base dos ombros fica a 91% da célula; logo acima dela há corpo opaco.
  const corpo = ((512 + 446) * 1536 + 256) * 4;
  expect(png.pixels[corpo + 3]).toBe(255);
});

test("a coleção mistura estilos e mostra o estilo escolhido", async ({
  page,
}) => {
  await abrir(page);
  await expect(page.locator("#estilo-escolhido")).toHaveText("Argila");
  for (const [nome, estilo] of [
    ["Guará", "Pixel art"],
    ["Breu", "Minimalista"],
    ["Novelo", "Crochê"],
    ["Tucano", "Papercraft"],
    ["Bolota", "Flat"],
  ]) {
    await page
      .getByRole("button", { name: `Escolher ${nome}`, exact: true })
      .click();
    await expect(page.locator("#estilo-escolhido")).toHaveText(estilo);
    await expect
      .poll(() => page.locator("#principal").evaluate((m) => m.carregado))
      .toBe(true);
  }
});

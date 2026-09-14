import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

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
        .locator("mascote-cursor")
        .evaluateAll((ms) => ms.every((m) => m.carregado)),
    )
    .toBe(true);
  const alphas = await page.locator(".grade mascote-cursor").evaluateAll((ms) =>
    ms.map((m) => {
      const img = m.shadowRoot.querySelector("img");
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, 512, 512).data;
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
  expect(erros).toEqual([]);
});

test("o olhar acompanha ambos os lados e se acomoda", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Ponteiro de toque não acompanha movimento.");
  await abrir(page);
  const mascote = page.locator("#principal");
  const caixa = await mascote.boundingBox();
  await page.mouse.move(caixa.x + caixa.width + 80, caixa.y + 100);
  await expect
    .poll(() => mascote.evaluate((m) => m.posicao[0]))
    .toBeGreaterThan(0.3);
  await page.mouse.move(caixa.x - 100, caixa.y + 100);
  await expect
    .poll(() => mascote.evaluate((m) => m.posicao[0]))
    .toBeLessThan(-0.3);
  await expect
    .poll(() => mascote.evaluate((m) => Math.abs(m.velocidade[0])))
    .toBeLessThan(0.002);
});

test("clique ou toque faz carinho e termina a reação", async ({
  page,
  isMobile,
}) => {
  await abrir(page);
  const m = page.locator("#principal");
  if (isMobile) await m.locator("button").tap();
  else await m.locator("button").click();
  await expect(m.locator(".corpo")).toHaveClass(/feliz/);
  await expect(m.locator(".carinho")).toHaveCSS("opacity", "1");
  await expect(m.locator(".corpo")).not.toHaveClass(/feliz/, { timeout: 2500 });
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
  await expect(m.locator(".corpo")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
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
  await expect(m.locator(".erro")).toContainText("Use olhos");
  await m.evaluate((m) => {
    m.removeAttribute("olhos");
    m.setAttribute("imagem", "/nao-existe.png");
  });
  await expect(m.locator(".erro")).toContainText("Não consegui abrir");
  await m.evaluate((m) => m.setAttribute("tamanho", "180"));
  await expect(m.locator(".erro")).toBeVisible();
  await expect(m.locator("button")).toBeDisabled();
  await m.evaluate((m) => m.removeAttribute("imagem"));
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
    return { abortado: m.eventos.signal.aborted, posicao: m.posicao };
  });
  expect(resultado).toEqual({ abortado: true, posicao: [0, 0] });
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

test("editor aceita arte local, atualiza coordenadas e mantém o arquivo local", async ({
  page,
}) => {
  await page.goto("/skills/mascote-cursor/assets/editor/");
  await page
    .locator("#arquivo")
    .setInputFiles(resolve("skills/mascote-cursor/assets/mascotes/capi.png"));
  await expect(page.locator("#status")).toContainText("512 × 512");
  await expect(page.locator("#previa")).toHaveAttribute("imagem", /^blob:/);
  const slider = page.getByRole("slider", {
    name: "Olho esquerdo: posição horizontal",
    exact: true,
  });
  await slider.fill("42");
  await slider.dispatchEvent("input");
  await expect(page.locator("#resultado")).toContainText('olhos="42,');
  await page.getByRole("button", { name: "Ver em fundo escuro" }).click();
  await expect(page.locator("#fundo")).toHaveClass("escuro");
});

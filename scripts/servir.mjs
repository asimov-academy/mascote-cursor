import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const porta = Number(process.env.PORT || 4173);
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8",
};
const servidor = createServer(async (pedido, resposta) => {
  try {
    const url = new URL(pedido.url, "http://localhost");
    const partes = decodeURIComponent(url.pathname).split("/");
    if (partes.some((p) => p.startsWith(".") || p === "node_modules"))
      throw new Error("Acesso negado");
    let caminho = resolve(raiz, "." + decodeURIComponent(url.pathname));
    if ((await stat(caminho)).isDirectory())
      caminho = resolve(caminho, "index.html");
    caminho = await realpath(caminho);
    if (!caminho.startsWith(raiz + sep)) throw new Error("Acesso negado");
    const dados = await readFile(caminho);
    resposta.writeHead(200, {
      "Content-Type": tipos[extname(caminho)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    resposta.end(dados);
  } catch {
    resposta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    resposta.end("Arquivo não encontrado.");
  }
});
servidor.on("error", (erro) => {
  console.error(
    erro.code === "EADDRINUSE"
      ? `A porta ${porta} já está ocupada. Feche o outro servidor ou defina PORT=4174.`
      : erro.message,
  );
  process.exitCode = 1;
});
servidor.listen(porta, "127.0.0.1", () =>
  console.log(
    `Mascote Cursor está em http://localhost:${porta}\nPara encerrar, pressione Ctrl+C.`,
  ),
);

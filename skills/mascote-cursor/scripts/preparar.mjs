#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { lerPNG, escreverPNG } from "./png.mjs";
import { preparar, aplicarChroma } from "./atlas.js";

export { preparar };

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const json = process.argv.includes("--json");
  try {
    const { values } = parseArgs({
      options: {
        entrada: { type: "string" },
        saida: { type: "string" },
        json: { type: "boolean" },
        substituir: { type: "boolean" },
        fundo: { type: "string" },
        "inverter-lados": { type: "boolean" },
      },
    });
    if (!values.entrada || !values.saida)
      throw new Error("Use --entrada arte.png --saida meu-atlas.png [--json].");
    if (resolve(values.entrada) === resolve(values.saida))
      throw new Error(
        "Mantenha a fonte: entrada e saída precisam ser arquivos diferentes.",
      );
    let fonte = lerPNG(await readFile(values.entrada));
    if (values.fundo) fonte = aplicarChroma(fonte, values.fundo);
    const { imagem, relatorio } = preparar(
      fonte,
      512,
      values["inverter-lados"],
    );
    await mkdir(dirname(resolve(values.saida)), { recursive: true });
    await writeFile(values.saida, escreverPNG(imagem), {
      flag: values.substituir ? "w" : "wx",
    });
    console.log(
      json
        ? JSON.stringify({
            ok: true,
            arquivo: resolve(values.saida),
            ...relatorio,
          })
        : `Atlas pronto em ${values.saida}. ${relatorio.revisao}`,
    );
  } catch (erro) {
    const mensagem =
      erro.code === "EEXIST"
        ? "A saída já existe. Escolha outro arquivo ou use --substituir conscientemente."
        : erro.message;
    console.error(
      json ? JSON.stringify({ ok: false, erro: mensagem }) : mensagem,
    );
    process.exitCode = 1;
  }
}

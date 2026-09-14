#!/usr/bin/env node
import { readFile, mkdir, writeFile, lstat } from "node:fs/promises";
import { resolve, dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { mascotes } from "../assets/catalogo.js";

const ajuda = `Mascote Cursor — leve um personagem para seu site.

node instalar.mjs --mascote capi --dest public/mascote-cursor
node instalar.mjs --listar

--mascote  Nome do catálogo (padrão: capi); use todos para levar os 10.
--dest     Pasta de destino obrigatória. Não alteramos as páginas do projeto.
--json     Resposta estruturada para agentes.
--listar   Mostra os 10 personagens disponíveis.
--ajuda    Mostra estas instruções.

Uma nova execução preserva arquivos iguais e não sobrescreve arquivos diferentes.`;

async function semLinks(caminho) {
  const absoluto = resolve(caminho);
  const raiz = parse(absoluto).root;
  let atual = raiz;
  for (const parte of absoluto
    .slice(raiz.length)
    .split(/[\\/]/)
    .filter(Boolean)) {
    atual = join(atual, parte);
    try {
      if ((await lstat(atual)).isSymbolicLink())
        throw new Error(
          `O destino contém um link simbólico: ${atual}. Use uma pasta real.`,
        );
    } catch (erro) {
      if (erro.code !== "ENOENT") throw erro;
    }
  }
}

let json = process.argv.includes("--json");
try {
  const { values } = parseArgs({
    options: {
      mascote: { type: "string", default: "capi" },
      dest: { type: "string" },
      listar: { type: "boolean" },
      json: { type: "boolean" },
      ajuda: { type: "boolean" },
    },
  });
  json = values.json;
  if (values.ajuda) {
    console.log(ajuda);
    process.exit(0);
  }
  if (values.listar) {
    console.log(
      json
        ? JSON.stringify({ mascotes })
        : mascotes
            .map((m) => `${m.id.padEnd(9)} ${m.nome} — ${m.especie}`)
            .join("\n"),
    );
    process.exit(0);
  }
  if (!values.dest)
    throw new Error(
      "Informe --dest com a pasta pública de destino. Use --ajuda para ver um exemplo.",
    );
  const escolhidos =
    values.mascote === "todos"
      ? mascotes
      : mascotes.filter((m) => m.id === values.mascote);
  if (!escolhidos.length)
    throw new Error(
      `Mascote desconhecido: ${values.mascote}. Use --listar para escolher.`,
    );
  const destino = resolve(values.dest);
  const origem = fileURLToPath(new URL("../assets/", import.meta.url));
  const nomes = [
    "mascote.js",
    "catalogo.js",
    "movimento.js",
    "LICENCA.txt",
    ...escolhidos.map((m) => `mascotes/${m.id}.png`),
  ];
  const arquivos = [];
  // Primeiro verifica TODOS os conflitos. Só depois começa a escrever.
  for (const nome of nomes) {
    const fonte = await readFile(join(origem, nome));
    const alvo = join(destino, nome);
    await semLinks(alvo);
    let existe = false;
    try {
      const atual = await readFile(alvo);
      if (!atual.equals(fonte))
        throw new Error(
          `Arquivo diferente já existe: ${alvo}. Escolha outro destino ou compare as versões antes de atualizar.`,
        );
      existe = true;
    } catch (erro) {
      if (erro.code !== "ENOENT") throw erro;
    }
    arquivos.push({ nome, alvo, fonte, existe });
  }
  for (const arquivo of arquivos) {
    if (arquivo.existe) continue;
    await mkdir(dirname(arquivo.alvo), { recursive: true });
    await writeFile(arquivo.alvo, arquivo.fonte, { flag: "wx" });
  }
  const resultado = {
    ok: true,
    destino,
    mascotes: escolhidos.map((m) => m.id),
    criados: arquivos.filter((a) => !a.existe).map((a) => a.alvo),
    preservados: arquivos.filter((a) => a.existe).map((a) => a.alvo),
    proximoPasso:
      'Carregue mascote.js como módulo na página e adicione <mascote-cursor mascote="' +
      escolhidos[0].id +
      '"></mascote-cursor>. O caminho público depende do seu projeto.',
  };
  console.log(
    json
      ? JSON.stringify(resultado)
      : `Pronto! ${escolhidos.length} mascote(s) em ${destino}.\n${resultado.proximoPasso}`,
  );
} catch (erro) {
  const mensagem = erro.code?.startsWith("ERR_PARSE_ARGS")
    ? "Argumentos inválidos. Use --ajuda para consultar as opções e seus valores."
    : erro.message;
  if (json) console.log(JSON.stringify({ ok: false, erro: mensagem }));
  else console.error(`Não foi possível instalar: ${mensagem}`);
  process.exitCode = 1;
}

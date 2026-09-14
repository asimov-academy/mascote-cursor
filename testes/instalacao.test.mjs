import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  readdir,
  writeFile,
  rm,
  cp,
  realpath,
  symlink,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { mascotes } from "../skills/mascote-cursor/assets/catalogo.js";

const script = resolve("skills/mascote-cursor/scripts/instalar.mjs");
async function temporario(t) {
  const caminho = await mkdtemp(
    join(await realpath(tmpdir()), "mascote-teste-"),
  );
  t.after(() => rm(caminho, { recursive: true, force: true }));
  return caminho;
}
function executar(args, arquivo = script, cwd = process.cwd()) {
  const r = spawnSync(process.execPath, [arquivo, ...args, "--json"], {
    cwd,
    encoding: "utf8",
  });
  return { status: r.status, dados: JSON.parse(r.stdout) };
}

test("o catálogo possui exatamente dez atlas transparentes de 1536 × 2048 pixels", async () => {
  assert.equal(mascotes.length, 10);
  assert.equal(new Set(mascotes.map((m) => m.id)).size, 10);
  const pasta = resolve("skills/mascote-cursor/assets/mascotes");
  assert.deepEqual(
    (await readdir(pasta)).sort(),
    mascotes.map((m) => m.id + ".png").sort(),
  );
  for (const m of mascotes) {
    const png = await readFile(join(pasta, m.id + ".png"));
    assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 1536);
    assert.equal(png.readUInt32BE(20), 2048);
    assert.equal(png[25], 6, "PNG precisa ter canal alpha");
    assert.ok(png.length < 2500000, "Arte acima do orçamento de 2,5 MB");
  }
});

test("instala somente o escolhido e repetir não altera os arquivos", async (t) => {
  const pasta = await temporario(t);
  const destino = join(pasta, "site com espaço");
  const primeira = executar(["--mascote", "bento", "--dest", destino]);
  assert.equal(primeira.status, 0);
  assert.equal(primeira.dados.criados.length, 5);
  assert.deepEqual(await readdir(join(destino, "mascotes")), ["bento.png"]);
  const segunda = executar(["--mascote", "bento", "--dest", destino]);
  assert.equal(segunda.status, 0);
  assert.equal(segunda.dados.criados.length, 0);
  assert.equal(segunda.dados.preservados.length, 5);
});

test("um conflito impede também a cópia de novos arquivos", async (t) => {
  const destino = await temporario(t);
  executar(["--dest", destino]);
  await writeFile(join(destino, "mascote.js"), "minha personalização");
  const r = executar(["--mascote", "bento", "--dest", destino]);
  assert.equal(r.status, 1);
  assert.equal(r.dados.ok, false);
  assert.equal(
    await readFile(join(destino, "mascote.js"), "utf8"),
    "minha personalização",
  );
  assert.deepEqual(await readdir(join(destino, "mascotes")), ["capi.png"]);
});

test("rejeita nome desconhecido e destino ausente com saída legível por agentes", () => {
  assert.equal(
    executar(["--mascote", "nao-existe", "--dest", "inexistente"]).status,
    1,
  );
  assert.equal(executar([]).status, 1);
  assert.equal(executar(["--listar"]).dados.mascotes.length, 10);
});

test("a skill funciona sozinha fora do repositório e instala a coleção completa", async (t) => {
  const pasta = await temporario(t);
  const skill = join(pasta, "skill");
  await cp(resolve("skills/mascote-cursor"), skill, { recursive: true });
  const r = executar(
    ["--mascote", "todos", "--dest", join(pasta, "saida")],
    join(skill, "scripts/instalar.mjs"),
    pasta,
  );
  assert.equal(r.status, 0);
  assert.equal(r.dados.mascotes.length, 10);
  assert.equal((await readdir(join(pasta, "saida/mascotes"))).length, 10);
});

test("não escreve atravessando links simbólicos do destino", async (t) => {
  const pasta = await temporario(t);
  const real = join(pasta, "real");
  await mkdir(real);
  await symlink(real, join(pasta, "atalho"), "dir");
  const r = executar(["--dest", join(pasta, "atalho")]);
  assert.equal(r.status, 1);
  assert.deepEqual(await readdir(real), []);
});

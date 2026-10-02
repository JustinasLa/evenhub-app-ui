import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const installer = resolve(repoRoot, "bin/install.js");
export const converter = resolve(repoRoot, "skills/evenhub-pixel-icons/scripts/grid2svg.mjs");

export function temporaryDirectory(t) {
  const directory = mkdtempSync(resolve(tmpdir(), "evenhub tests "));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

export function runNode(script, args = [], { nodeArgs = [], ...options } = {}) {
  const result = spawnSync(process.execPath, [...nodeArgs, script, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 15_000,
    ...options,
  });
  if (result.error) throw result.error;
  return result;
}

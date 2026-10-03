import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { installer, repoRoot, runNode, temporaryDirectory } from "../test-support/cli.js";

const agents = [
  ["claude-code", "Claude Code", "claude", ".claude"],
  ["codex", "Codex", "codex", ".codex"],
  ["cursor", "Cursor", "cursor", ".cursor"],
  ["windsurf", "Windsurf", "windsurf", ".windsurf"],
  ["cline", "Cline", null, ".cline"],
  ["gemini-cli", "Gemini CLI", "gemini", ".gemini"],
  ["opencode", "OpenCode", "opencode", ".config/opencode"],
  ["github-copilot", "GitHub Copilot", "github-copilot", ".copilot"],
  ["continue", "Continue", "cn", ".continue"],
  ["roo", "Roo Code", null, ".roo"],
  ["kilo", "Kilo Code", "kilocode", ".kilocode"],
  ["aider-desk", "AiderDesk", "aider-desk", ".aider-desk"],
  ["amp", "Amp", "amp", ".config/amp"],
  ["openclaw", "OpenClaw", "openclaw", ".openclaw"],
  ["goose", "Goose", "goose", ".config/goose"],
  ["crush", "Crush", "crush", ".config/crush"],
];

function runInstaller(t, args = [], overrides = {}) {
  const directory = temporaryDirectory(t);
  const config = {
    platform: "linux",
    home: join(directory, "home"),
    existingPaths: [],
    commands: [],
    responses: [],
    callsFile: join(directory, "calls.jsonl"),
    probesFile: join(directory, "probes.jsonl"),
    ...overrides,
  };
  if (overrides.agentPaths) {
    config.existingPaths.push(...overrides.agentPaths.map((path) => join(config.home, path)));
  }
  const result = runNode(installer, args, {
    nodeArgs: ["--require", join(repoRoot, "test-support/install-runtime.cjs")],
    env: { ...process.env, EVENHUB_INSTALL_TEST: JSON.stringify(config) },
  });
  const readLog = (path) => existsSync(path)
    ? readFileSync(path, "utf8").trim().split("\n").map((line) => JSON.parse(line))
    : [];
  return { ...result, calls: readLog(config.callsFile), probes: readLog(config.probesFile) };
}

function expectSuccess(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
}

const agentArgs = (ids) => ids.flatMap((id) => ["--agent", id]);
const addArgs = (ids) => ["-y", "skills", "add", repoRoot, "--skill", "*", "--global", ...agentArgs(ids), "--copy", "--yes"];
const removeArgs = (ids) => ["-y", "skills", "remove", "evenhub-app-ui", "evenhub-pixel-icons", "--global", ...agentArgs(ids), "--yes"];
const listArgs = (ids) => ["-y", "skills", "list", "--global", ...agentArgs(ids)];

for (const flag of ["--help", "-h"]) {
  test(`installer ${flag} explains every option without invoking commands`, (t) => {
    const result = runInstaller(t, [flag]);
    expectSuccess(result);
    for (const option of ["--all", "--dry-run", "--force", "--list", "--uninstall", "--only", "--help"]) {
      assert.ok(result.stdout.includes(option));
    }
    assert.deepEqual(result.calls, []);
    assert.deepEqual(result.probes, []);
  });
}

test("installer lists every supported agent without installing", (t) => {
  const result = runInstaller(t, ["--list"]);
  expectSuccess(result);
  const lines = result.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, agents.length);
  agents.forEach(([id, label], index) => assert.match(lines[index], new RegExp(`^${id}\\s+not detected\\s+${label}$`)));
  assert.equal(result.probes.length, agents.filter((agent) => agent[2]).length);
  assert.deepEqual(result.calls, []);
});

test("installer detects every agent by its configuration directory", (t) => {
  const result = runInstaller(t, ["--list"], { agentPaths: agents.map((agent) => agent[3]) });
  expectSuccess(result);
  for (const line of result.stdout.trim().split(/\r?\n/)) assert.match(line, /\s+detected\s+/);
  assert.deepEqual(result.calls, []);
});

for (const platform of ["linux", "win32"]) {
  test(`installer probes commands correctly on ${platform}`, (t) => {
    const result = runInstaller(t, ["--list"], { platform, commands: ["codex"] });
    expectSuccess(result);
    assert.match(result.stdout, /^codex\s+detected\s+Codex$/m);
    assert.match(result.stdout, /^cline\s+not detected\s+Cline$/m);
    const probe = result.probes.find((call) => call.command === "codex");
    assert.deepEqual(probe, {
      executable: platform === "win32" ? "where.exe" : "sh",
      args: platform === "win32" ? ["codex"] : ["-c", 'command -v "codex" >/dev/null 2>&1'],
      options: { stdio: "ignore" },
      command: "codex",
    });
  });
}

test("installer selects only detected agents and verifies the installed registrations", (t) => {
  const result = runInstaller(t, [], { commands: ["codex"], agentPaths: [".cline"] });
  expectSuccess(result);
  assert.match(result.stdout, /Installing for: Codex, Cline/);
  assert.match(result.stdout, /Installed evenhub-app-ui and evenhub-pixel-icons\./);
  assert.match(result.stdout, /Verifying global skill registrations:/);
  assert.match(result.stdout, /Restart each agent/);
  assert.deepEqual(result.calls, [
    { executable: "npx", args: addArgs(["codex", "cline"]), options: { stdio: "inherit" } },
    { executable: "npx", args: listArgs(["codex", "cline"]), options: { stdio: "inherit" } },
  ]);
});

test("installer --all selects all supported agents", (t) => {
  const result = runInstaller(t, ["--all"]);
  expectSuccess(result);
  assert.deepEqual(result.calls.map((call) => call.args), [addArgs(agents.map((agent) => agent[0])), listArgs(agents.map((agent) => agent[0]))]);
  assert.deepEqual(result.probes, []);
});

test("installer --only takes precedence over --all, deduplicates agents, and preserves provider order", (t) => {
  const result = runInstaller(t, ["--all", "--only", "roo", "--only", "codex", "--only", "codex"]);
  expectSuccess(result);
  assert.deepEqual(result.calls.map((call) => call.args), [addArgs(["codex", "roo"]), listArgs(["codex", "roo"])]);
  assert.deepEqual(result.probes, []);
});

test("installer dry run previews addition without invoking npx", (t) => {
  const result = runInstaller(t, ["--only", "codex", "--dry-run"]);
  expectSuccess(result);
  assert.match(result.stdout, /> npx -y skills add /);
  assert.match(result.stdout, /Dry run complete; no files were changed\./);
  assert.doesNotMatch(result.stdout, /Verifying/);
  assert.deepEqual(result.calls, []);
});

test("installer quotes repository paths containing spaces in previews and passes them as one argument", (t) => {
  const root = join(temporaryDirectory(t), "repository with spaces");
  const result = runInstaller(t, ["--only", "codex"], { repoRoot: root });
  expectSuccess(result);
  assert.ok(result.stdout.includes(`> npx -y skills add ${JSON.stringify(root)} --skill *`));
  assert.equal(result.calls[0].args[3], root);
});

test("installer --force removes both skills before adding and verifying", (t) => {
  const result = runInstaller(t, ["--only", "cursor", "--force"]);
  expectSuccess(result);
  assert.deepEqual(result.calls.map((call) => call.args), [removeArgs(["cursor"]), addArgs(["cursor"]), listArgs(["cursor"])]);
});

test("installer --uninstall removes both skills without adding or verifying", (t) => {
  const result = runInstaller(t, ["--only", "codex", "--uninstall", "--force"]);
  expectSuccess(result);
  assert.match(result.stdout, /Removing from: Codex/);
  assert.deepEqual(result.calls.map((call) => call.args), [removeArgs(["codex"])]);
  assert.doesNotMatch(result.stdout, /Installed|Restart|Verifying/);
});

for (const flag of ["--force", "--uninstall"]) {
  test(`installer ${flag} --dry-run previews removal without invoking npx`, (t) => {
    const result = runInstaller(t, ["--only", "codex", flag, "--dry-run"]);
    expectSuccess(result);
    assert.match(result.stdout, /> npx -y skills remove evenhub-app-ui evenhub-pixel-icons /);
    assert.equal(result.stdout.includes("> npx -y skills add"), flag === "--force");
    assert.deepEqual(result.calls, []);
  });
}

for (const [args, message] of [
  [["--only"], "--only requires an agent id"],
  [["--unknown"], "unknown option: --unknown"],
  [["unexpected"], "unknown option: unexpected"],
  [["--only", "missing", "--only", "other"], "unknown agent id: missing, other"],
  [[], "no supported agents detected; use --list, --only <agent>, or --all"],
]) {
  test(`installer rejects ${JSON.stringify(args)} without running installation`, (t) => {
    const result = runInstaller(t, args);
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), `evenhub-app-ui: ${message}`);
    assert.deepEqual(result.calls, []);
  });
}

for (const [responses, expectedCalls, message] of [
  [[{ status: 7 }], 1, "skills CLI exited with status 7"],
  [[{ status: null }], 1, "skills CLI exited with status null"],
  [[{ error: "spawn ENOENT" }], 1, "spawn ENOENT"],
  [[{ status: 0 }, { status: 2 }], 2, "skills CLI exited with status 2"],
]) {
  test(`installer reports failure: ${message}`, (t) => {
    const result = runInstaller(t, ["--only", "codex"], { responses });
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), `evenhub-app-ui: ${message}`);
    assert.equal(result.calls.length, expectedCalls);
    assert.doesNotMatch(result.stdout, /Restart each agent/);
  });
}

test("installer stops a forced install if removal fails", (t) => {
  const result = runInstaller(t, ["--only", "codex", "--force"], { responses: [{ status: 3 }] });
  assert.equal(result.status, 1);
  assert.deepEqual(result.calls.map((call) => call.args), [removeArgs(["codex"])]);
  assert.match(result.stderr, /skills CLI exited with status 3/);
});

const bundledNpx = join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
test("Windows installer invokes the bundled npx CLI through Node", (t) => {
  const result = runInstaller(t, ["--only", "codex"], { platform: "win32", existingPaths: [bundledNpx] });
  expectSuccess(result);
  assert.deepEqual(result.calls, [
    { executable: process.execPath, args: [bundledNpx, ...addArgs(["codex"])], options: { stdio: "inherit" } },
    { executable: process.execPath, args: [bundledNpx, ...listArgs(["codex"])], options: { stdio: "inherit" } },
  ]);
});

test("Windows installer falls back to the npm installation in APPDATA with spaces", (t) => {
  const appData = join(temporaryDirectory(t), "Roaming with spaces");
  const userNpx = join(appData, "npm", "node_modules", "npm", "bin", "npx-cli.js");
  const result = runInstaller(t, ["--only", "codex"], { platform: "win32", appData, existingPaths: [userNpx] });
  expectSuccess(result);
  assert.deepEqual(result.calls.map((call) => call.args), [[userNpx, ...addArgs(["codex"])], [userNpx, ...listArgs(["codex"])]]);
});

test("Windows installer prefers bundled npm when both npm locations exist", (t) => {
  const appData = join(temporaryDirectory(t), "Roaming");
  const userNpx = join(appData, "npm", "node_modules", "npm", "bin", "npx-cli.js");
  const result = runInstaller(t, ["--only", "codex", "--uninstall"], { platform: "win32", appData, existingPaths: [bundledNpx, userNpx] });
  expectSuccess(result);
  assert.equal(result.calls[0].args[0], bundledNpx);
});

for (const appData of [undefined, "missing npm directory"]) {
  test(`Windows installer reports missing npm (${appData ?? "no APPDATA"})`, (t) => {
    const result = runInstaller(t, ["--only", "codex"], { platform: "win32", appData });
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), "evenhub-app-ui: cannot locate npm's npx-cli.js");
    assert.deepEqual(result.calls, []);
  });
}

test("Windows dry run resolves npm but never executes it", (t) => {
  const result = runInstaller(t, ["--only", "codex", "--dry-run"], { platform: "win32", existingPaths: [bundledNpx] });
  expectSuccess(result);
  assert.deepEqual(result.calls, []);
});

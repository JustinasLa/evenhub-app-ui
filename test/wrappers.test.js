import assert from "node:assert/strict";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { repoRoot, temporaryDirectory } from "../test-support/cli.js";

function findExecutable(candidates) {
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { encoding: "utf8", timeout: 10_000 });
    if (!result.error && result.status === 0) return candidate;
  }
}

const bash = findExecutable(process.platform === "win32"
  ? [join(process.env.ProgramFiles || "C:/Program Files", "Git/bin/bash.exe")]
  : ["bash"]);
// Windows PowerShell 5.1 uses a different version flag from pwsh.
const powershellCandidates = process.platform === "win32" ? ["pwsh", "powershell.exe"] : ["pwsh"];
const powershells = powershellCandidates.filter((command) => {
  const probe = spawnSync(command, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8", timeout: 10_000 });
  return !probe.error && probe.status === 0;
});

if (process.env.CI) {
  assert.ok(bash, "CI must provide Bash to test install.sh");
  if (process.platform === "win32") {
    for (const command of powershellCandidates) {
      assert.ok(powershells.includes(command), `Windows CI must provide ${command} to test install.ps1`);
    }
  }
}

const shellPath = (path) => process.platform === "win32"
  ? path.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`)
  : path;

function runBash(t, { node = true, npx = true, version = "24.0.0", status = 0, local = false, bare = false, downloaded = false, args = [] } = {}) {
  const directory = temporaryDirectory(t);
  const commands = join(directory, "mock commands");
  const callsFile = join(directory, "calls.log");
  mkdirSync(commands);
  for (const [command, enabled] of [["node", node], ["npx", npx]]) {
    if (!enabled) continue;
    const path = join(commands, command);
    writeFileSync(path, `#!/bin/bash\nif [ "$1" = "-p" ]; then\n  printf '%s\\n' "$EVENHUB_NODE_VERSION"\n  exit 0\nfi\nprintf '%s\\0' '${command}' "$@" >> "$EVENHUB_WRAPPER_CALLS"\nexit "$EVENHUB_WRAPPER_STATUS"\n`);
    chmodSync(path, 0o755);
  }
  const wrapper = join(directory, "install.sh");
  copyFileSync(join(repoRoot, "install.sh"), wrapper);
  if (local) {
    mkdirSync(join(directory, "bin"));
    writeFileSync(join(directory, "bin/install.js"), "// The mock node command only records this path.\n");
  }
  const runner = 'PATH="$EVENHUB_WRAPPER_BIN"; export PATH; ' + (downloaded
    ? 'eval "$EVENHUB_WRAPPER_SOURCE"'
    : 'source "$EVENHUB_WRAPPER_SCRIPT" "$@"');
  const result = spawnSync(bash, ["--noprofile", "--norc", "-c", runner, "evenhub-test", ...args], {
    cwd: directory,
    encoding: "utf8",
    timeout: 15_000,
    env: {
      ...process.env,
      EVENHUB_WRAPPER_BIN: shellPath(commands),
      EVENHUB_WRAPPER_SCRIPT: bare ? "install.sh" : shellPath(wrapper),
      EVENHUB_WRAPPER_SOURCE: readFileSync(wrapper, "utf8"),
      EVENHUB_WRAPPER_CALLS: shellPath(callsFile),
      EVENHUB_NODE_VERSION: version,
      EVENHUB_WRAPPER_STATUS: String(status),
    },
  });
  if (result.error) throw result.error;
  const calls = existsSync(callsFile) ? readFileSync(callsFile, "utf8").split("\0").slice(0, -1) : [];
  return { ...result, calls, wrapper };
}

const bashTest = (name, fn) => test(name, { skip: !bash && "Bash is unavailable" }, fn);

bashTest("Bash wrapper reports missing Node without invoking npx", (t) => {
  const result = runBash(t, { node: false });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Node\.js 22\.20\.0 or newer is required\./);
  assert.deepEqual(result.calls, []);
});

for (const version of ["18.20.8", "22.19.0"]) {
  bashTest(`Bash wrapper rejects Node ${version}`, (t) => {
    const result = runBash(t, { version });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(`Node.js 22.20.0 or newer is required; found ${version}.`));
    assert.deepEqual(result.calls, []);
  });
}

for (const bare of [false, true]) {
  bashTest(`Bash wrapper uses the local installer (${bare ? "bare" : "absolute"} script path) and forwards arguments`, (t) => {
    const args = ["--only", "codex", "argument with spaces", "--dry-run"];
    const result = runBash(t, { local: true, bare, version: "22.20.0", npx: false, args });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    const localPath = bare ? "./bin/install.js" : shellPath(result.wrapper).replace(/install\.sh$/, "bin/install.js");
    assert.deepEqual(result.calls, ["node", localPath, ...args]);
  });
}

for (const downloaded of [false, true]) {
  bashTest(`Bash wrapper falls back to GitHub (${downloaded ? "downloaded" : "file without local installer"})`, (t) => {
    const args = ["--only", "codex", "argument with spaces", "--dry-run"];
    const result = runBash(t, { downloaded, args });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(result.calls, ["npx", "-y", "github:JustinasLa/evenhub-app-ui", ...args]);
  });
}

bashTest("Bash wrapper reports missing npx for remote installation", (t) => {
  const result = runBash(t, { npx: false });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /npx is required and normally ships with Node\.js\./);
  assert.deepEqual(result.calls, []);
});

for (const local of [false, true]) {
  bashTest(`Bash wrapper propagates ${local ? "local" : "remote"} installer failure`, (t) => {
    const result = runBash(t, { local, status: 7 });
    assert.equal(result.status, 7);
    assert.equal(result.calls[0], local ? "node" : "npx");
  });
}

function runPowerShell(powershell, t, overrides = {}) {
  const directory = temporaryDirectory(t);
  const callsFile = join(directory, "calls.jsonl");
  const config = {
    wrapper: join(repoRoot, "install.ps1"),
    callsFile,
    node: true,
    npx: "cmd",
    version: "24.0.0",
    status: 0,
    local: false,
    downloaded: false,
    args: [],
    ...overrides,
  };
  const result = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(repoRoot, "test-support/powershell-runtime.ps1")], {
    cwd: directory,
    encoding: "utf8",
    timeout: 20_000,
    env: { ...process.env, EVENHUB_WRAPPER_TEST: JSON.stringify(config) },
  });
  if (result.error) throw result.error;
  const calls = existsSync(callsFile) ? readFileSync(callsFile, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)) : [];
  return { ...result, calls };
}

const psTest = (name, fn) => {
  for (const powershell of powershellCandidates) {
    test(`${name} (${powershell})`, { skip: !powershells.includes(powershell) && `${powershell} is unavailable` }, (t) => fn(t, powershell));
  }
};

psTest("PowerShell wrapper reports missing Node without invoking npx", (t, powershell) => {
  const result = runPowerShell(powershell, t, { node: false });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Node\.js 22\.20\.0 or newer is required\./);
  assert.deepEqual(result.calls, []);
});

for (const version of ["18.20.8", "22.19.0"]) {
  psTest(`PowerShell wrapper rejects Node ${version}`, (t, powershell) => {
    const result = runPowerShell(powershell, t, { version });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(`Node.js 22.20.0 or newer is required; found ${version}.`));
    assert.deepEqual(result.calls, []);
  });
}

psTest("PowerShell wrapper uses the local installer and forwards arguments without requiring npx", (t, powershell) => {
  const args = ["--only", "codex", "argument with spaces", "--dry-run"];
  const result = runPowerShell(powershell, t, { local: true, version: "22.20.0", npx: null, args });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.deepEqual(result.calls, [{ command: "node", args: [join(repoRoot, "bin/install.js"), ...args] }]);
});

for (const downloaded of [false, true]) {
  for (const npx of ["cmd", "plain"]) {
    psTest(`PowerShell wrapper invokes ${npx === "cmd" ? "npx.cmd" : "npx"} (${downloaded ? "downloaded" : "file without local installer"})`, (t, powershell) => {
      const args = ["--only", "codex", "argument with spaces", "--dry-run"];
      const result = runPowerShell(powershell, t, { npx, downloaded, args });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(result.calls, [{ command: npx === "cmd" ? "npx.cmd" : "npx", args: ["-y", "github:JustinasLa/evenhub-app-ui", ...args] }]);
    });
  }
}

psTest("PowerShell wrapper reports missing npx for remote installation", (t, powershell) => {
  const result = runPowerShell(powershell, t, { npx: null });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /npx is required and normally ships with Node\.js\./);
  assert.deepEqual(result.calls, []);
});

psTest("PowerShell wrapper prefers npx.cmd when both npm commands exist", (t, powershell) => {
  const result = runPowerShell(powershell, t, { npx: "both" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [{ command: "npx.cmd", args: ["-y", "github:JustinasLa/evenhub-app-ui"] }]);
});

for (const local of [false, true]) {
  psTest(`PowerShell wrapper reports ${local ? "local" : "remote"} installer failure`, (t, powershell) => {
    const result = runPowerShell(powershell, t, { local, status: 7 });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /installer exited with status 7/);
    assert.equal(result.calls.length, 1);
  });
}

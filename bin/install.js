#!/usr/bin/env node

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillNames = ["evenhub-app-ui", "evenhub-pixel-icons"];
const skillsPackage = "skills@1.7.0";
// Match the configuration roots used by the skills CLI.
const home = homedir();
const claudeHome = process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");
const codexHome = process.env.CODEX_HOME?.trim() || join(home, ".codex");
const configHome = process.env.XDG_CONFIG_HOME || join(home, ".config");

const providers = [
  { id: "claude-code", label: "Claude Code", commands: ["claude"], paths: [claudeHome] },
  { id: "codex", label: "Codex", commands: ["codex"], paths: [codexHome] },
  { id: "cursor", label: "Cursor", commands: ["cursor"], paths: [join(home, ".cursor")] },
  { id: "windsurf", label: "Windsurf", commands: ["windsurf"], paths: [join(home, ".codeium/windsurf"), join(home, ".windsurf")] },
  { id: "cline", label: "Cline", commands: [], paths: [join(home, ".cline")] },
  { id: "gemini-cli", label: "Gemini CLI", commands: ["gemini"], paths: [join(home, ".gemini")] },
  { id: "opencode", label: "OpenCode", commands: ["opencode"], paths: [join(configHome, "opencode")] },
  { id: "github-copilot", label: "GitHub Copilot", commands: ["copilot"], paths: [join(home, ".copilot")] },
  { id: "continue", label: "Continue", commands: ["cn"], paths: [join(home, ".continue")] },
  { id: "roo", label: "Roo Code", commands: [], paths: [join(home, ".roo")] },
  { id: "kilo", label: "Kilo Code", commands: ["kilo", "kilocode"], paths: [join(home, ".kilo"), join(home, ".kilocode")] },
  { id: "aider-desk", label: "AiderDesk", commands: ["aider-desk"], paths: [join(home, ".aider-desk")] },
  { id: "amp", label: "Amp", commands: ["amp"], paths: [join(configHome, "amp")] },
  { id: "openclaw", label: "OpenClaw", commands: ["openclaw"], paths: [join(home, ".openclaw")] },
  { id: "goose", label: "Goose", commands: ["goose"], paths: [join(configHome, "goose")] },
  { id: "crush", label: "Crush", commands: ["crush"], paths: [join(home, ".config/crush")] },
];

function commandExists(command) {
  const probe = process.platform === "win32" ? "where.exe" : "sh";
  const args =
    process.platform === "win32"
      ? [command]
      : ["-c", `command -v "${command}" >/dev/null 2>&1`];
  return spawnSync(probe, args, { stdio: "ignore" }).status === 0;
}

function isDetected(provider) {
  return (
    provider.commands.some(commandExists) ||
    provider.paths.some(existsSync)
  );
}

function parseArgs(argv) {
  const options = {
    all: false,
    dryRun: false,
    force: false,
    list: false,
    uninstall: false,
    only: [],
  };

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === "--all") options.all = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--list") options.list = true;
    else if (argument === "--uninstall") options.uninstall = true;
    else if (argument === "--only") {
      const id = argv[++index];
      if (!id) throw new Error("--only requires an agent id");
      options.only.push(id);
    } else if (argument === "--help" || argument === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`Install Even Hub skills for detected AI coding agents.

Usage: node bin/install.js [options]

Options:
  --list             Show supported agents and detection state
  --dry-run          Print the command without changing files
  --all              Install for every supported agent
  --only <agent>     Install for one agent; repeatable
  --force            Remove existing copies before installing
  --uninstall        Remove both skills from selected agents
  -h, --help         Show this help`);
}

function printProviders() {
  const width = Math.max(...providers.map(({ id }) => id.length));
  for (const provider of providers) {
    const state = isDetected(provider) ? "detected" : "not detected";
    console.log(`${provider.id.padEnd(width)}  ${state.padEnd(12)}  ${provider.label}`);
  }
}

function selectProviders(options) {
  if (options.only.length) {
    const unknown = options.only.filter(
      (id) => !providers.some((provider) => provider.id === id),
    );
    if (unknown.length) throw new Error(`unknown agent id: ${unknown.join(", ")}`);
    return providers.filter((provider) => options.only.includes(provider.id));
  }
  if (options.all) return providers;
  return providers.filter(isDetected);
}

function quote(value) {
  if (/^[a-zA-Z0-9_./:-][a-zA-Z0-9_./:@-]*$/.test(value)) return value;
  // Previews use POSIX shell syntax on Unix and PowerShell syntax on Windows.
  return process.platform === "win32"
    ? `'${value.replace(/'/g, "''")}'`
    : `'${value.replace(/'/g, "'\\''")}'`;
}

function requireSupportedNode() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 20)) {
    throw new Error(`Node.js 22.20.0 or newer is required; found ${process.versions.node}.`);
  }
}

function validateInstallation(output, selected) {
  let results;
  try {
    results = JSON.parse(output);
  } catch {
    throw new Error("skills CLI returned invalid installation results");
  }
  if (!Array.isArray(results)) {
    throw new Error("skills CLI returned invalid installation results");
  }

  for (const name of skillNames) {
    const outcome = results.find((result) => result?.name === name);
    if (outcome?.status !== "installed") {
      throw new Error(`failed to install ${name}: ${outcome?.error ?? "missing successful installation result"}`);
    }
    const missingAgents = selected.filter(
      ({ label }) => !Array.isArray(outcome.agents) || !outcome.agents.includes(label),
    );
    if (missingAgents.length) {
      throw new Error(`failed to install ${name} for: ${missingAgents.map(({ label }) => label).join(", ")}`);
    }
  }
}

function runNpx(args, dryRun, installationAgents) {
  console.log(`> npx ${args.map(quote).join(" ")}`);
  if (dryRun) return;

  let executable = "npx";
  let executableArgs = args;

  if (process.platform === "win32") {
    const candidates = [
      join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js"),
      process.env.APPDATA
        ? join(process.env.APPDATA, "npm", "node_modules", "npm", "bin", "npx-cli.js")
        : "",
      ...(process.env.PATH || "").split(";").filter(Boolean).map((path) =>
        join(path.replace(/^"(.*)"$/, "$1"), "node_modules", "npm", "bin", "npx-cli.js"),
      ),
    ].filter(Boolean);
    const npxCli = candidates.find(existsSync);
    if (!npxCli) {
      throw new Error("cannot locate npm's npx-cli.js");
    }
    executable = process.execPath;
    executableArgs = [npxCli, ...args];
  }

  // Invoke npx-cli.js through Node on Windows. This avoids both the EINVAL
  // raised by direct .cmd execution and cmd.exe splitting paths at spaces.
  const removing = args.includes("remove");
  const result = spawnSync(executable, executableArgs, installationAgents
    ? { stdio: ["inherit", "pipe", "inherit"], encoding: "utf8" }
    : removing
      ? { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" }
      : { stdio: "inherit" });
  if (result.error) throw result.error;
  if (removing) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    // skills@1.7.0 reports per-agent removal failures without setting its exit code.
    const failure = stripVTControlCharacters((result.stdout ?? "") + (result.stderr ?? ""))
      .match(/(?:Could not remove skill from|Failed to remove)[^\r\n]*/);
    if (failure) throw new Error(failure[0]);
  }
  if (installationAgents && (result.status === 0 || result.stdout)) {
    validateInstallation(result.stdout, installationAgents);
  }
  if (result.status !== 0) {
    throw new Error(`skills CLI exited with status ${result.status}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.list) {
    printProviders();
    return;
  }
  requireSupportedNode();

  const selected = selectProviders(options);
  if (!selected.length) {
    throw new Error(
      "no supported agents detected; use --list, --only <agent>, or --all",
    );
  }

  const agentArgs = selected.flatMap(({ id }) => ["--agent", id]);
  console.log(
    `${options.uninstall ? "Removing from" : "Installing for"}: ${selected
      .map(({ label }) => label)
      .join(", ")}`,
  );

  if (options.uninstall || options.force) {
    runNpx(
      [
        "-y",
        skillsPackage,
        "remove",
        ...skillNames,
        "--global",
        ...agentArgs,
        "--yes",
      ],
      options.dryRun,
    );
    if (options.uninstall) return;
  }

  runNpx(
    [
      "-y",
      skillsPackage,
      "add",
      repoRoot,
      "--skill",
      "*",
      "--global",
      ...agentArgs,
      "--copy",
      "--yes",
      "--json",
    ],
    options.dryRun,
    selected,
  );

  if (options.dryRun) {
    console.log("Dry run complete; no files were changed.");
  } else {
    console.log("Installed evenhub-app-ui and evenhub-pixel-icons.");
    console.log("Global skill registrations:");
    runNpx(
      ["-y", skillsPackage, "list", "--global", ...agentArgs],
      false,
    );
    console.log("Restart each agent or begin a new session before testing.");
  }
}

try {
  main();
} catch (error) {
  console.error(`evenhub-app-ui: ${error.message}`);
  process.exit(1);
}

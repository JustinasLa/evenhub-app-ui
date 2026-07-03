#!/usr/bin/env node

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillNames = ["evenhub-app-ui", "evenhub-pixel-icons"];

const providers = [
  { id: "claude-code", label: "Claude Code", commands: ["claude"], paths: [".claude"] },
  { id: "codex", label: "Codex", commands: ["codex"], paths: [".codex"] },
  { id: "cursor", label: "Cursor", commands: ["cursor"], paths: [".cursor"] },
  { id: "windsurf", label: "Windsurf", commands: ["windsurf"], paths: [".windsurf"] },
  { id: "cline", label: "Cline", commands: [], paths: [".cline"] },
  { id: "gemini-cli", label: "Gemini CLI", commands: ["gemini"], paths: [".gemini"] },
  { id: "opencode", label: "OpenCode", commands: ["opencode"], paths: [".config/opencode"] },
  { id: "github-copilot", label: "GitHub Copilot", commands: ["github-copilot"], paths: [".copilot"] },
  { id: "continue", label: "Continue", commands: ["cn"], paths: [".continue"] },
  { id: "roo", label: "Roo Code", commands: [], paths: [".roo"] },
  { id: "kilo", label: "Kilo Code", commands: ["kilocode"], paths: [".kilocode"] },
  { id: "aider-desk", label: "AiderDesk", commands: ["aider-desk"], paths: [".aider-desk"] },
  { id: "amp", label: "Amp", commands: ["amp"], paths: [".config/amp"] },
  { id: "openclaw", label: "OpenClaw", commands: ["openclaw"], paths: [".openclaw"] },
  { id: "goose", label: "Goose", commands: ["goose"], paths: [".config/goose"] },
  { id: "crush", label: "Crush", commands: ["crush"], paths: [".config/crush"] },
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
    provider.paths.some((path) => existsSync(join(homedir(), path)))
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
  return /\s/.test(value) ? JSON.stringify(value) : value;
}

function runNpx(args, dryRun) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  console.log(`> ${executable} ${args.map(quote).join(" ")}`);
  if (dryRun) return;

  const result = spawnSync(executable, args, { stdio: "inherit" });
  if (result.error) throw result.error;
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
        "skills",
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
      "skills",
      "add",
      repoRoot,
      "--skill",
      "*",
      "--global",
      ...agentArgs,
      "--copy",
      "--yes",
    ],
    options.dryRun,
  );

  if (options.dryRun) {
    console.log("Dry run complete; no files were changed.");
  } else {
    console.log("Installed evenhub-app-ui and evenhub-pixel-icons.");
    console.log("Restart each agent or begin a new session before testing.");
  }
}

try {
  main();
} catch (error) {
  console.error(`evenhub-app-ui: ${error.message}`);
  process.exit(1);
}

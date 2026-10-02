// Only installer subprocesses load these mocks; they never run the real skills CLI.
const fs = require("node:fs");
const os = require("node:os");
const childProcess = require("node:child_process");
const { syncBuiltinESMExports } = require("node:module");
const { join } = require("node:path");
const url = require("node:url");
const config = JSON.parse(process.env.EVENHUB_INSTALL_TEST);

Object.defineProperty(process, "platform", { value: config.platform });
os.homedir = () => config.home;
if (config.appData) process.env.APPDATA = config.appData;
else delete process.env.APPDATA;
if (config.path !== undefined) process.env.PATH = config.path;
else delete process.env.PATH;
fs.existsSync = (path) => config.existingPaths.includes(path);
if (config.repoRoot) url.fileURLToPath = () => join(config.repoRoot, "bin", "install.js");

let invocation = 0;
childProcess.spawnSync = (executable, args, options) => {
  if (executable === "where.exe" || executable === "sh") {
    const command = executable === "where.exe" ? args[0] : /command -v "([^"]+)"/.exec(args[1])[1];
    fs.appendFileSync(config.probesFile, JSON.stringify({ executable, args, options, command }) + "\n");
    return { status: config.commands.includes(command) ? 0 : 1 };
  }
  fs.appendFileSync(config.callsFile, JSON.stringify({ executable, args, options }) + "\n");
  const response = config.responses[invocation++] ?? { status: 0 };
  return response.error ? { error: new Error(response.error), status: null } : response;
};

syncBuiltinESMExports();

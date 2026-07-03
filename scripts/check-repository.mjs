#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

const skillFiles = filesUnder(join(root, "skills")).filter(
  (file) => file.endsWith("SKILL.md"),
);

for (const file of skillFiles) {
  const content = readFileSync(file, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    fail(file, "missing YAML frontmatter");
    continue;
  }
  if (!/^name:\s*\S+/m.test(frontmatter[1])) {
    fail(file, "frontmatter is missing name");
  }
  if (!/^description:\s*(?:\S|>-)/m.test(frontmatter[1])) {
    fail(file, "frontmatter is missing description");
  }
}

const markdownFiles = [
  join(root, "README.md"),
  ...filesUnder(join(root, "skills")).filter((file) => file.endsWith(".md")),
];

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const links = content.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g);
  for (const [, rawTarget] of links) {
    const target = rawTarget.trim().replace(/^<|>$/g, "").split("#", 1)[0];
    if (
      !target ||
      /^(?:https?:|mailto:)/i.test(target) ||
      target.includes("://")
    ) {
      continue;
    }
    const decodedTarget = decodeURIComponent(target);
    if (!existsSync(resolve(file, "..", decodedTarget))) {
      fail(file, `broken local link: ${rawTarget}`);
    }
  }
}

const iconRoot = join(root, "skills", "evenhub-app-ui", "assets", "icons");
const icons = filesUnder(iconRoot).filter((file) => extname(file) === ".svg");

if (icons.length !== 191) {
  failures.push(`expected 191 bundled SVG icons, found ${icons.length}`);
}

for (const file of icons) {
  const svg = readFileSync(file, "utf8");
  if (!/<svg\b[^>]*\bviewBox=["']0 0 (?:32|33) 32["'][^>]*>/i.test(svg)) {
    fail(file, 'root SVG must use a supported 32x32 or 33x32 viewBox');
  }
  if (!/<\/svg>\s*$/i.test(svg)) {
    fail(file, "missing closing </svg> element");
  }
  if (/<script\b|on[a-z]+\s*=/i.test(svg)) {
    fail(file, "SVG contains executable content");
  }
}

if (!existsSync(join(root, "LICENSE"))) {
  failures.push("LICENSE: file is missing");
}

if (failures.length) {
  console.error(`Repository checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Repository checks passed: ${skillFiles.length} skills, ${markdownFiles.length} Markdown files, ${icons.length} SVG icons.`,
);

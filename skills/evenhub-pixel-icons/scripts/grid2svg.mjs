#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const SIZE = 16;
const UNIT = 2;
const FILL = "#232323";

function usage() {
  console.error(
    "usage: node grid2svg.mjs <input.grid> [--output <icon.svg>] [--allow-edge]",
  );
}

function exitWith(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

let input;
let output;
let allowEdge = false;

for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  if (argument === "--allow-edge") {
    allowEdge = true;
  } else if (argument === "--output" || argument === "-o") {
    output = args[++index];
    if (!output) exitWith(`${argument} requires a file path`);
  } else if (argument.startsWith("-")) {
    exitWith(`unknown option: ${argument}`);
  } else if (input) {
    exitWith(`unexpected argument: ${argument}`);
  } else {
    input = argument;
  }
}

if (!input) {
  usage();
  process.exit(1);
}

let source;
try {
  source = readFileSync(input, "utf8");
} catch (error) {
  exitWith(`cannot read ${input}: ${error.message}`);
}

// Remove terminal newlines only. Blank rows inside the grid remain invalid.
const lines = source.replace(/(?:\r?\n)+$/, "").split(/\r?\n/);

if (lines.length !== SIZE) {
  exitWith(`grid must have ${SIZE} rows; found ${lines.length}`);
}

for (const [index, line] of lines.entries()) {
  if (line.length !== SIZE) {
    exitWith(`row ${index + 1} must have ${SIZE} cells; found ${line.length}`);
  }
  if (/[^#.]/.test(line)) {
    exitWith(`row ${index + 1} contains characters other than "#" and "."`);
  }
}

if (!lines.some((line) => line.includes("#"))) {
  exitWith("grid is empty");
}

if (!allowEdge) {
  const touchesEdge =
    lines[0].includes("#") ||
    lines[SIZE - 1].includes("#") ||
    lines.some((line) => line[0] === "#" || line[SIZE - 1] === "#");
  if (touchesEdge) {
    exitWith("filled cells touch the outer edge; revise or pass --allow-edge");
  }
}

const rects = [];
for (let row = 0; row < SIZE; row++) {
  for (let column = 0; column < SIZE; ) {
    if (lines[row][column] !== "#") {
      column++;
      continue;
    }

    let width = 1;
    while (column + width < SIZE && lines[row][column + width] === "#") {
      width++;
    }

    rects.push(
      `  <rect x="${column * UNIT}" y="${row * UNIT}" width="${width * UNIT}" height="${UNIT}" fill="${FILL}"/>`,
    );
    column += width;
  }
}

const svg = [
  '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">',
  ...rects,
  "</svg>",
  "",
].join("\n");

if (output) {
  try {
    writeFileSync(output, svg, "utf8");
  } catch (error) {
    exitWith(`cannot write ${output}: ${error.message}`);
  }
  console.log(`wrote ${output} (${rects.length} rectangles)`);
} else {
  process.stdout.write(svg);
}

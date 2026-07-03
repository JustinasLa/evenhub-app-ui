#!/usr/bin/env node
// grid2svg — convert a 16x16 ASCII cell grid ('#' filled, '.' empty) into an
// Even Realities-style pixel icon SVG (32x32, 2x2px unit, #232323 fill).
//
// Usage: node grid2svg.mjs icon.grid > "Icon Name.svg"

import { readFileSync } from "node:fs";

const SIZE = 16; // cells per side
const UNIT = 2; // px per cell
const FILL = "#232323";

const file = process.argv[2];
if (!file) {
  console.error("usage: node grid2svg.mjs <gridfile>");
  process.exit(1);
}

const lines = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .filter((l) => l.length > 0);

if (lines.length !== SIZE) {
  console.error(`grid must have ${SIZE} non-empty lines, got ${lines.length}`);
  process.exit(1);
}
for (const [i, l] of lines.entries()) {
  if (l.length !== SIZE || /[^#.]/.test(l)) {
    console.error(`line ${i + 1} must be exactly ${SIZE} chars of '#' or '.': "${l}"`);
    process.exit(1);
  }
}

// Merge horizontal runs of filled cells into 2px-tall bars.
const rects = [];
for (let row = 0; row < SIZE; row++) {
  let col = 0;
  while (col < SIZE) {
    if (lines[row][col] === "#") {
      let run = 0;
      while (col + run < SIZE && lines[row][col + run] === "#") run++;
      rects.push(
        `<rect x="${col * UNIT}" y="${row * UNIT}" width="${run * UNIT}" height="${UNIT}" fill="${FILL}"/>`
      );
      col += run;
    } else {
      col++;
    }
  }
}

if (rects.length === 0) {
  console.error("grid is empty — nothing to draw");
  process.exit(1);
}

const svg = [
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">`,
  ...rects,
  `</svg>`,
].join("\n");

console.log(svg);

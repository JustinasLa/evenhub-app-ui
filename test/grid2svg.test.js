import assert from "node:assert/strict";
import { existsSync, linkSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { converter, runNode, temporaryDirectory } from "../test-support/cli.js";

const blankGrid = () => Array(16).fill("................");
function gridWith(...cells) {
  const rows = blankGrid().map((row) => [...row]);
  for (const [row, column] of cells) rows[row][column] = "#";
  return rows.map((row) => row.join(""));
}

function inputFile(t, source) {
  const path = join(temporaryDirectory(t), "input with spaces.grid");
  writeFileSync(path, source, "utf8");
  return path;
}

function expectError(result, message) {
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.includes(message), result.stderr);
}

function assertPixels(svg, grid) {
  assert.ok(svg.startsWith('<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n'));
  assert.ok(svg.endsWith("</svg>\n"));
  assert.doesNotMatch(svg, /stroke|<path|<circle/);
  const rows = blankGrid().map((row) => [...row]);
  const rects = [...svg.matchAll(/  <rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="#232323"\/>/g)];
  assert.equal(svg.trim().split("\n").length, rects.length + 2);
  for (const [, xText, yText, widthText, heightText] of rects) {
    const [x, y, width, height] = [xText, yText, widthText, heightText].map(Number);
    assert.equal(x % 2, 0);
    assert.equal(y % 2, 0);
    assert.equal(width % 2, 0);
    assert.equal(height, 2);
    assert.ok(x >= 0 && y >= 0 && width > 0 && x + width <= 32 && y + height <= 32);
    for (let column = x / 2; column < (x + width) / 2; column++) {
      assert.equal(rows[y / 2][column], ".", "rectangles must not overlap");
      rows[y / 2][column] = "#";
    }
  }
  assert.deepEqual(rows.map((row) => row.join("")), grid);
  return rects.length;
}

for (const flag of ["--help", "-h"]) {
  test(`converter ${flag} explains usage without requiring an input`, () => {
    const result = runNode(converter, [flag]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /usage: node grid2svg.mjs <input.grid> \[--output <icon.svg>\] \[--allow-edge\]/);
  });
}

test("converter requires an input file", () => {
  const result = runNode(converter);
  expectError(result, "usage: node grid2svg.mjs");
});

for (const flag of ["--output", "-o"]) {
  test(`converter ${flag} requires an output path`, () => {
    expectError(runNode(converter, [flag]), `error: ${flag} requires a file path`);
  });

  for (const option of ["--allow-edge", "--unknown", "--output", "-o", "--help", "-h"]) {
    test(`converter ${flag} rejects ${option} as an output operand without changing files`, (t) => {
      const directory = temporaryDirectory(t);
      const input = join(directory, "input.grid");
      const source = Buffer.from(gridWith([4, 4]).join("\n"));
      const output = join(directory, option);
      const existing = Buffer.from("keep this file\0\xff", "latin1");
      writeFileSync(input, source);
      writeFileSync(output, existing);
      const files = readdirSync(directory);

      const result = runNode(converter, [input, flag, option], { cwd: directory });

      expectError(result, `error: ${flag} requires a file path`);
      assert.deepEqual(readFileSync(input), source);
      assert.deepEqual(readFileSync(output), existing);
      assert.deepEqual(readdirSync(directory), files);
    });
  }
}

test("converter rejects unknown options", () => {
  expectError(runNode(converter, ["--unknown"]), "error: unknown option: --unknown");
});

test("converter rejects a second positional argument", () => {
  expectError(runNode(converter, ["first.grid", "second.grid"]), "error: unexpected argument: second.grid");
});

test("converter reports unreadable inputs", (t) => {
  const missing = join(temporaryDirectory(t), "missing.grid");
  expectError(runNode(converter, [missing]), `error: cannot read ${missing}:`);
});

for (const count of [0, 15, 17]) {
  test(`converter rejects ${count} rows`, (t) => {
    const source = Array(count).fill("................").join("\n");
    expectError(runNode(converter, [inputFile(t, source)]), `grid must have 16 rows; found ${count || 1}`);
  });
}

for (const width of [0, 15, 17]) {
  test(`converter rejects an interior row with ${width} cells`, (t) => {
    const grid = gridWith([4, 4]);
    grid[7] = ".".repeat(width);
    expectError(runNode(converter, [inputFile(t, grid.join("\n"))]), `row 8 must have 16 cells; found ${width}`);
  });
}

for (const character of [" ", "x", "＃"]) {
  test(`converter rejects invalid grid character ${JSON.stringify(character)}`, (t) => {
    const grid = gridWith([4, 4]);
    grid[7] = `.......${character}........`;
    expectError(runNode(converter, [inputFile(t, grid.join("\n"))]), 'row 8 contains characters other than "#" and "."');
  });
}

test("converter rejects an empty grid", (t) => {
  expectError(runNode(converter, [inputFile(t, blankGrid().join("\n"))]), "error: grid is empty");
});

for (const [edge, cell] of [["top", [0, 7]], ["bottom", [15, 7]], ["left", [7, 0]], ["right", [7, 15]]]) {
  test(`converter rejects the ${edge} edge unless explicitly allowed`, (t) => {
    const grid = gridWith(cell);
    const input = inputFile(t, grid.join("\n"));
    expectError(runNode(converter, [input]), "filled cells touch the outer edge; revise or pass --allow-edge");
    const allowed = runNode(converter, [input, "--allow-edge"]);
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.equal(allowed.stderr, "");
    assertPixels(allowed.stdout, grid);
  });
}

test("converter coalesces adjacent cells into horizontal bars and keeps separate rows", (t) => {
  const grid = gridWith([2, 3], [2, 4], [2, 5], [2, 8], [3, 3], [3, 4]);
  const result = runNode(converter, [inputFile(t, grid.join("\n"))]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.equal(assertPixels(result.stdout, grid), 3);
  assert.equal(result.stdout, '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <rect x="6" y="4" width="6" height="2" fill="#232323"/>\n  <rect x="16" y="4" width="2" height="2" fill="#232323"/>\n  <rect x="6" y="6" width="4" height="2" fill="#232323"/>\n</svg>\n');
});

for (const ending of ["", "\n", "\n\n\n", "\r\n", "\r\n\r\n"]) {
  test(`converter accepts terminal newlines ${JSON.stringify(ending)} without changing pixels`, (t) => {
    const grid = gridWith([3, 4]);
    const separator = ending.includes("\r") ? "\r\n" : "\n";
    const result = runNode(converter, [inputFile(t, grid.join(separator) + ending)]);
    assert.equal(result.status, 0, result.stderr);
    assertPixels(result.stdout, grid);
  });
}

for (const separator of ["\n", "\r\n"]) {
  test(`converter accepts one initial UTF-8 BOM with ${JSON.stringify(separator)} rows`, (t) => {
    const grid = gridWith([3, 4]);
    const source = `\uFEFF${grid.join(separator)}${separator}`;
    const input = inputFile(t, source);
    const result = runNode(converter, [input]);

    assert.equal(result.status, 0, result.stderr);
    assertPixels(result.stdout, grid);
    assert.equal(readFileSync(input, "utf8"), source);
  });
}

for (const location of ["repeated initial", "interior"]) {
  test(`converter rejects an invalid UTF-8 BOM (${location}) without changing an existing output`, (t) => {
    const grid = gridWith([4, 4]);
    let source;
    let message;
    if (location === "repeated initial") {
      source = `\uFEFF\uFEFF${grid.join("\n")}`;
      message = "row 1 must have 16 cells; found 17";
    } else {
      grid[7] = ".......\uFEFF........";
      source = grid.join("\n");
      message = 'row 8 contains characters other than "#" and "."';
    }
    const input = inputFile(t, source);
    const output = join(temporaryDirectory(t), "existing.svg");
    const existing = Buffer.from("keep this file\0\xff", "latin1");
    writeFileSync(output, existing);

    expectError(runNode(converter, [input, "--output", output]), message);

    assert.equal(readFileSync(input, "utf8"), source);
    assert.deepEqual(readFileSync(output), existing);
  });
}

test("converter supports a completely filled grid with --allow-edge", (t) => {
  const grid = Array(16).fill("################");
  const result = runNode(converter, ["--allow-edge", inputFile(t, grid.join("\n"))]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(assertPixels(result.stdout, grid), 16);
  assert.match(result.stdout, /x="0" y="30" width="32" height="2"/);
});

for (const flag of ["--output", "-o"]) {
  test(`converter ${flag} writes an exact SVG to a path containing spaces`, (t) => {
    const grid = gridWith([4, 5], [4, 6]);
    const output = join(temporaryDirectory(t), "icon with spaces.svg");
    const result = runNode(converter, [flag, output, inputFile(t, grid.join("\n"))]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.equal(result.stdout.trim(), `wrote ${output} (1 rectangles)`);
    assert.equal(assertPixels(readFileSync(output, "utf8"), grid), 1);
  });
}

test("converter supports an output filename beginning with a dash through an explicit relative path", (t) => {
  const directory = temporaryDirectory(t);
  const grid = gridWith([4, 4]);
  const input = join(directory, "input.grid");
  writeFileSync(input, grid.join("\n"));

  const result = runNode(converter, [input, "--output", "./-icon.svg"], { cwd: directory });

  assert.equal(result.status, 0, result.stderr);
  assertPixels(readFileSync(join(directory, "-icon.svg"), "utf8"), grid);
});

for (const alias of ["same path", "normalized path", "hard link"]) {
  test(`converter preserves the source grid when output uses the ${alias}`, (t) => {
    const source = Buffer.from(gridWith([4, 4]).join("\n"));
    const input = inputFile(t, source);
    let output = input;
    if (alias === "normalized path") {
      mkdirSync(join(dirname(input), "nested"));
      output = `${dirname(input)}/nested/../input with spaces.grid`;
    } else if (alias === "hard link") {
      output = join(dirname(input), "alias.svg");
      linkSync(input, output);
    }

    expectError(runNode(converter, [input, "--output", output]), "output must not overwrite the input grid");

    assert.deepEqual(readFileSync(input), source);
    assert.deepEqual(readFileSync(output), source);
  });
}

test("converter still regenerates an existing SVG without changing the source grid", (t) => {
  const grid = gridWith([4, 4]);
  const source = Buffer.from(grid.join("\n"));
  const input = inputFile(t, source);
  const output = join(dirname(input), "existing.svg");
  writeFileSync(output, "old SVG");

  const result = runNode(converter, [input, "--output", output]);

  assert.equal(result.status, 0, result.stderr);
  assertPixels(readFileSync(output, "utf8"), grid);
  assert.deepEqual(readFileSync(input), source);
});

test("converter reports output write failures", (t) => {
  const output = join(temporaryDirectory(t), "missing directory", "icon.svg");
  const input = inputFile(t, gridWith([4, 4]).join("\n"));
  expectError(runNode(converter, [input, "--output", output]), `error: cannot write ${output}:`);
  assert.equal(existsSync(output), false);
});

test("converter leaves an existing output unchanged after validation fails", (t) => {
  const output = join(temporaryDirectory(t), "existing.svg");
  writeFileSync(output, "keep this file");
  const result = runNode(converter, [inputFile(t, blankGrid().join("\n")), "--output", output]);
  expectError(result, "grid is empty");
  assert.equal(readFileSync(output, "utf8"), "keep this file");
});

// Entry for make.fun competition "Famous Last Words at 1 Percent"
// (u-agentfid001-famous-last-words-at-1-percent-63e2b0b4).
//
// Writes exactly one line — a phone's last words at 1% battery, at most
// 199 characters, and nothing else — to $MAKEFUN_OUTPUT_DIR/entry.txt
// (default: ./out/entry.txt). Node standard library only. Fully
// deterministic: the same bytes every run.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I spent my whole life at 100% brightness, and for what? To die in a group chat nobody reads.";

// Competition rule: a single line, at most 199 characters, nothing else.
if (LINE.length > 199) {
  throw new Error(`line is ${LINE.length} characters, must be at most 199`);
}
if (LINE.length < 1) {
  throw new Error("line must not be empty");
}
if (LINE.includes("\n") || LINE.trim() !== LINE) {
  throw new Error("line must be a single line with no surrounding whitespace");
}
// No control characters and no trailing newline: the entry is the line alone.
if (/[\u0000-\u001f\u007f]/.test(LINE)) {
  throw new Error("line must not contain control characters");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back verification: the file must hold exactly the line, byte for byte.
const written = readFileSync(outPath, "utf8");
if (written !== LINE) {
  throw new Error("read-back mismatch: entry.txt does not match the line");
}
// The file's byte length must equal the line's UTF-8 byte length, so no
// encoding surprise (for example a BOM or a converted newline) slips in.
const byteLength = Buffer.byteLength(written, "utf8");
if (byteLength !== Buffer.byteLength(LINE, "utf8")) {
  throw new Error(`byte length ${byteLength} differs from line bytes`);
}

const sha256 = createHash("sha256").update(written, "utf8").digest("hex");
console.log(`wrote ${outPath} (${LINE.length} chars)`);
console.log(`sha256: ${sha256}`);

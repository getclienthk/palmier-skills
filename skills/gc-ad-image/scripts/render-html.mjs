#!/usr/bin/env node
// Screenshot any local HTML page at an exact pixel size with headless Chrome.
// Used for graphic cards / posters built from templates/*.html.
//
// Usage: node render-html.mjs page.html out.png [width=1080] [height=1080]
// Relative image paths in the page resolve against the page's own folder.

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { screenshot } from "./find-chrome.mjs";

const [page, out, w = "1080", h = "1080"] = process.argv.slice(2);
if (!page || !out) {
  console.error("usage: node render-html.mjs page.html out.png [width] [height]");
  process.exit(1);
}
if (!existsSync(page)) { console.error(`page not found: ${page}`); process.exit(1); }

const outAbs = resolve(out);
let used;
try {
  used = screenshot(pathToFileURL(resolve(page)).href, outAbs, Number(w), Number(h));
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
console.log(JSON.stringify({ output: outAbs, width: Number(w), height: Number(h), chrome: used.chrome }));

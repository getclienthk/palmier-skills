#!/usr/bin/env node
// Screenshot any local HTML page at an exact pixel size with headless Chrome.
// Used for graphic cards / posters built from templates/*.html.
//
// Usage: node render-html.mjs page.html out.png [width=1080] [height=1080]
// Relative image paths in the page resolve against the page's own folder.

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [page, out, w = "1080", h = "1080"] = process.argv.slice(2);
if (!page || !out) {
  console.error("usage: node render-html.mjs page.html out.png [width] [height]");
  process.exit(1);
}
const chrome = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean).find((p) => existsSync(p));
if (!chrome) { console.error("Chrome not found; set CHROME_PATH"); process.exit(1); }
if (!existsSync(page)) { console.error(`page not found: ${page}`); process.exit(1); }

const outAbs = resolve(out);
execFileSync(chrome, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
  "--force-device-scale-factor=1", `--window-size=${w},${h}`, `--screenshot=${outAbs}`,
  "--virtual-time-budget=3000", pathToFileURL(resolve(page)).href,
], { stdio: ["ignore", "ignore", "pipe"] });
if (!existsSync(outAbs)) { console.error("Chrome did not write the screenshot"); process.exit(1); }
console.log(JSON.stringify({ output: outAbs, width: Number(w), height: Number(h) }));

#!/usr/bin/env node
// Composite real typography onto a generated (or real) photo, so the image
// model never has to draw text. Renders an HTML page in headless Chrome and
// screenshots it at the exact deliverable size.
//
// Usage:  node render-overlay.mjs spec.json
//
// spec.json:
// {
//   "background": "/abs/path/bg.png",      // required
//   "output":     "/abs/path/final.png",   // required
//   "preset":     "thumb" | "ad-4x5" | "ad-1x1" | "story",   // sets size + default layout
//   "width": 1280, "height": 720,          // optional, overrides preset size
//   "layout":     "left" | "bottom" | "top" | "none",         // optional, overrides preset layout
//   "focus":      "70% 30%",               // optional CSS object-position for the crop
//   "headline":   "3個月 [[收生翻倍]]",      // [[...]] = black text on brand-yellow block
//   "sub":        "導師親身拆解",            // optional
//   "badge":      "免費分享會",              // optional small pill above the headline
//   "logo":       "/abs/path/logo.png",    // optional, top-right corner
//   "scrim":      true                     // optional gradient behind text (default true)
// }

import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { screenshot } from "./find-chrome.mjs";

const PRESETS = {
  thumb: { width: 1280, height: 720, layout: "left" },
  "ad-4x5": { width: 1080, height: 1350, layout: "bottom" },
  "ad-1x1": { width: 1080, height: 1080, layout: "bottom" },
  story: { width: 1080, height: 1920, layout: "bottom" },
};

function die(msg) {
  console.error(`render-overlay: ${msg}`);
  process.exit(1);
}

const specPath = process.argv[2];
if (!specPath) die("usage: node render-overlay.mjs spec.json");
const spec = JSON.parse(readFileSync(specPath, "utf8"));

const preset = PRESETS[spec.preset || "thumb"];
if (!preset) die(`unknown preset "${spec.preset}" (use ${Object.keys(PRESETS).join(", ")})`);
const W = spec.width || preset.width;
const H = spec.height || preset.height;
const layout = spec.layout || preset.layout;
if (!spec.background || !existsSync(spec.background)) die(`background not found: ${spec.background}`);
if (!spec.output) die("spec.output is required");

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// [[word]] -> highlighted span; everything else escaped.
const rich = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>').replace(/\n/g, "<br>");
const fileUrl = (p) => pathToFileURL(resolve(p)).href;

const short = Math.min(W, H);
// Thumbnails must read at ~120px wide, so the headline is huge relative to frame.
const headSize = layout === "left" ? Math.round(H * 0.15) : Math.round(short * 0.095);
const subSize = Math.round(headSize * 0.42);
const pad = Math.round(short * 0.06);

const scrim = spec.scrim === false || layout === "none" ? "none" : {
  left: "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 45%, rgba(0,0,0,0) 70%)",
  bottom: "linear-gradient(0deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.5) 35%, rgba(0,0,0,0) 60%)",
  top: "linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.5) 35%, rgba(0,0,0,0) 60%)",
}[layout];

const boxPos = {
  left: `left:${pad}px; top:0; bottom:0; width:${Math.round(W * 0.52)}px; justify-content:center;`,
  bottom: `left:${pad}px; right:${pad}px; bottom:${pad}px; justify-content:flex-end;`,
  top: `left:${pad}px; right:${pad}px; top:${pad}px; justify-content:flex-start;`,
  none: "display:none;",
}[layout];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  :root { --yellow:#FEF102; --black:#0A0A0A; --white:#FFFFFF; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; overflow:hidden; background:var(--black); }
  .bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:${esc(spec.focus || "50% 50%")}; }
  .scrim { position:absolute; inset:0; background:${scrim}; }
  .box { position:absolute; display:flex; flex-direction:column; gap:${Math.round(pad * 0.35)}px; ${boxPos} }
  .text { font-family:"PingFang HK","PingFang TC","Hiragino Sans GB","Heiti TC","Noto Sans CJK TC","Noto Sans TC","Helvetica Neue","Noto Sans",sans-serif; color:var(--white); }
  .badge { align-self:flex-start; font-size:${Math.round(subSize * 0.9)}px; font-weight:700; padding:.25em .7em; border-radius:999px; background:var(--white); color:var(--black); }
  .head { word-break:keep-all; overflow-wrap:normal; font-size:${headSize}px; font-weight:900; line-height:1.12; letter-spacing:-.01em; text-shadow:0 4px 18px rgba(0,0,0,.45); }
  .hl { white-space:nowrap; background:var(--yellow); color:var(--black); padding:0 .12em; box-decoration-break:clone; -webkit-box-decoration-break:clone; text-shadow:none; }
  .sub { font-size:${subSize}px; font-weight:600; line-height:1.3; opacity:.95; text-shadow:0 2px 10px rgba(0,0,0,.5); }
  .logo { position:absolute; top:${Math.round(pad * 0.7)}px; right:${Math.round(pad * 0.7)}px; height:${Math.round(short * 0.07)}px; }
</style></head><body>
  <img class="bg" src="${fileUrl(spec.background)}">
  <div class="scrim"></div>
  <div class="box">
    ${spec.badge ? `<div class="text badge">${esc(spec.badge)}</div>` : ""}
    ${spec.headline ? `<div class="text head">${rich(spec.headline)}</div>` : ""}
    ${spec.sub ? `<div class="text sub">${rich(spec.sub)}</div>` : ""}
  </div>
  ${spec.logo && existsSync(spec.logo) ? `<img class="logo" src="${fileUrl(spec.logo)}">` : ""}
  <script>
    // Shrink the headline until it fits the text box (no clipped highlight, no overflow).
    const box = document.querySelector(".box"), head = document.querySelector(".head");
    if (head) {
      let size = parseFloat(getComputedStyle(head).fontSize);
      const fits = () => head.scrollWidth <= box.clientWidth + 1 && box.scrollHeight <= box.clientHeight + 1;
      while (!fits() && size > 24) { size -= 2; head.style.fontSize = size + "px"; }
    }
  </script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "gc-overlay-"));
const htmlPath = join(dir, "overlay.html");
writeFileSync(htmlPath, html);
const out = resolve(spec.output);
try {
  screenshot(pathToFileURL(htmlPath).href, out, W, H);
} catch (e) {
  die(String(e.message || e));
}
console.log(JSON.stringify({ output: out, width: W, height: H, layout, html: htmlPath }));

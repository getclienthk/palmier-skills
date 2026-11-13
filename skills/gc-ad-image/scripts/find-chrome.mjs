// Locate a working Chrome/Chromium on macOS (GC Mac) or Linux (Codex Cloud / CI) and take
// screenshots with it. Sandboxed cloud containers often have a read-only or odd $HOME, a snap
// "chromium" wrapper that can't start, or a crashpad that can't write — so every attempt gets its
// own writable profile/config/cache dirs, and we fall through candidates and flag sets until one
// actually writes the PNG.
import { existsSync, readdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { homedir, platform, tmpdir } from "node:os";
import { join } from "node:path";

function which(name) {
  try {
    return execFileSync("which", [name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}

// Playwright's browser cache: <root>/chromium-<rev>/chrome-linux*/chrome
function playwrightChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), ".cache", "ms-playwright"), "/ms-playwright"].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const revs = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const rev of revs) {
      for (const sub of ["chrome-linux64", "chrome-linux"]) {
        const p = join(root, rev, sub, "chrome");
        if (existsSync(p)) return p;
      }
    }
  }
  return null;
}

// Ordered, de-duplicated list of browsers to try. A pinned CHROME_PATH always goes first;
// Playwright's bundled build beats distro "chromium" (often a snap wrapper that can't run here).
export function chromeCandidates() {
  const list = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    playwrightChromium(),
    which("google-chrome-stable"),
    which("google-chrome"),
    which("chromium"),
    which("chromium-browser"),
  ].filter((p) => p && existsSync(p));
  return [...new Set(list)];
}

export function findChrome() {
  return chromeCandidates()[0] || null;
}

const FLAG_SETS = platform() === "linux"
  ? [
      ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
      ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--no-zygote", "--single-process"],
      ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--no-zygote", "--single-process"],
    ]
  : [["--headless=new"]];

// Screenshot `url` to `outPath` at width×height. Returns {chrome, flags}; throws with every
// attempt's stderr if nothing works, so the caller (or a cloud agent) sees the real reason.
export function screenshot(url, outPath, width, height) {
  const candidates = chromeCandidates();
  if (!candidates.length) throw new Error("No Chrome/Chromium found. Run cloud/setup.sh or set CHROME_PATH.");
  const failures = [];
  for (const chrome of candidates) {
    for (const flags of FLAG_SETS) {
      const scratch = mkdtempSync(join(tmpdir(), "gc-chrome-"));
      try { rmSync(outPath, { force: true }); } catch {}
      const args = [
        ...flags,
        `--user-data-dir=${join(scratch, "profile")}`,
        `--crash-dumps-dir=${join(scratch, "crash")}`,
        "--disable-gpu", "--disable-crash-reporter", "--disable-breakpad", "--no-first-run",
        "--no-default-browser-check", "--hide-scrollbars", "--allow-file-access-from-files",
        "--force-device-scale-factor=1", `--window-size=${width},${height}`, `--screenshot=${outPath}`,
        "--virtual-time-budget=3000", url,
      ];
      const env = {
        ...process.env,
        HOME: process.env.HOME && isWritable(process.env.HOME) ? process.env.HOME : scratch,
        XDG_CONFIG_HOME: join(scratch, "config"),
        XDG_CACHE_HOME: join(scratch, "cache"),
        XDG_RUNTIME_DIR: scratch,
      };
      const r = spawnSync(chrome, args, { env, encoding: "utf8", timeout: 90_000 });
      rmSync(scratch, { recursive: true, force: true });
      if (existsSync(outPath) && statSync(outPath).size > 0) return { chrome, flags };
      const why = (r.error ? String(r.error) : "") + (r.stderr || "").split("\n").filter(Boolean).slice(-6).join(" | ");
      failures.push(`${chrome} [${flags.join(" ")}] exit=${r.status}: ${why || "no screenshot written"}`);
    }
  }
  throw new Error("Chrome could not render a screenshot. Attempts:\n  " + failures.join("\n  "));
}

function isWritable(dir) {
  try {
    const probe = mkdtempSync(join(dir, ".gc-w-"));
    rmSync(probe, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

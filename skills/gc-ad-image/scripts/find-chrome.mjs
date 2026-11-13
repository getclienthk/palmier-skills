// Locate a Chrome/Chromium binary on macOS (GC Mac) or Linux (Codex Cloud / CI),
// and build the headless flags for it.
import { existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir, platform } from "node:os";
import { join } from "node:path";

function which(name) {
  try {
    return execFileSync("which", [name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}

// Playwright's browser cache: ~/.cache/ms-playwright/chromium-<rev>/chrome-linux*/chrome
function playwrightChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), ".cache", "ms-playwright")].filter(Boolean);
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

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    which("google-chrome-stable"),
    which("google-chrome"),
    which("chromium"),
    which("chromium-browser"),
    playwrightChromium(),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) || null;
}

export function headlessArgs(width, height, outPath, url) {
  const args = [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    "--force-device-scale-factor=1", `--window-size=${width},${height}`, `--screenshot=${outPath}`,
    "--virtual-time-budget=3000",
  ];
  // Containers usually run as root, where Chrome refuses to start with its sandbox on.
  if (platform() === "linux") args.push("--no-sandbox", "--disable-dev-shm-usage");
  args.push(url);
  return args;
}

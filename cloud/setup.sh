#!/usr/bin/env bash
# Codex Cloud environment setup for the gc-ad-image skill.
#
# Paste into: Codex → Settings → Environments → <environment> → Setup script
#   curl -fsSL https://raw.githubusercontent.com/getclienthk/palmier-skills/main/cloud/setup.sh | bash
#
# What it does (setup runs with internet access; the agent phase may not have it):
#   1. Chinese + Latin fonts (Noto CJK) so posters render with real type on Linux
#   2. A headless Chromium (via Playwright) for scripts/render-*.mjs
#   3. Clones this repo and links gc-ad-image into the Codex skills folders
#   4. Smoke-tests one render so a broken setup fails loudly here, not mid-task
#
# Env overrides: GC_SKILLS_REPO, GC_SKILLS_REF (branch, default main), GC_SKILLS_DIR, GC_SKILLS_SKIP_CLONE=1
set -euo pipefail

REPO_URL="${GC_SKILLS_REPO:-https://github.com/getclienthk/palmier-skills.git}"
REF="${GC_SKILLS_REF:-main}"
DEST="${GC_SKILLS_DIR:-$HOME/gc-skills}"
PLAYWRIGHT_VERSION="1.52.0"
log() { printf '[gc-ad-image setup] %s\n' "$*"; }

SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi

# 1. Fonts
if command -v apt-get >/dev/null 2>&1; then
  log "installing fonts (Noto CJK + Noto core)"
  $SUDO apt-get update -qq
  DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq --no-install-recommends \
    fonts-noto-cjk fonts-noto-core fontconfig >/dev/null
  fc-cache -f >/dev/null 2>&1 || true
else
  log "WARN: no apt-get; skipping font install"
fi

# 2. Repo (before the browser step, because the browser check uses find-chrome.mjs)
if [ "${GC_SKILLS_SKIP_CLONE:-0}" != "1" ]; then
  if [ -d "$DEST/.git" ]; then
    log "updating $DEST"
    git -C "$DEST" fetch -q --depth 1 origin "$REF" && git -C "$DEST" checkout -q FETCH_HEAD
  else
    log "cloning $REPO_URL ($REF) -> $DEST"
    git clone -q --depth 1 --branch "$REF" "$REPO_URL" "$DEST"
  fi
fi
SKILL="$DEST/skills/gc-ad-image"
[ -f "$SKILL/SKILL.md" ] || { log "ERROR: $SKILL/SKILL.md not found"; exit 1; }

# 3. Headless Chromium — judged by an actual screenshot, not by "a binary exists"
command -v node >/dev/null 2>&1 || { log "ERROR: node is required (Codex universal image ships it)"; exit 1; }
SMOKE_DIR="$(mktemp -d)"
cp "$SKILL/templates/event-poster.html" "$SMOKE_DIR/"
printf '%s' '<svg xmlns="http://www.w3.org/2000/svg" width="965" height="965"><rect width="100%" height="100%" fill="#51504E"/><circle cx="530" cy="330" r="150" fill="#9b8a7a"/></svg>' > "$SMOKE_DIR/photo.svg"
sed -i.bak 's|src="photo.jpg"|src="photo.svg"|' "$SMOKE_DIR/event-poster.html"
smoke() { node "$SKILL/scripts/render-html.mjs" "$SMOKE_DIR/event-poster.html" "$SMOKE_DIR/smoke.png" 1080 1080; }

if OUT="$(smoke 2>"$SMOKE_DIR/err.txt")"; then
  log "browser OK: $OUT"
else
  log "existing browser cannot render; installing Chromium via playwright@$PLAYWRIGHT_VERSION"
  sed 's/^/    /' "$SMOKE_DIR/err.txt" | head -20
  if npx -y "playwright@$PLAYWRIGHT_VERSION" install --with-deps chromium >/dev/null 2>"$SMOKE_DIR/pw.txt"; then
    if OUT="$(smoke 2>"$SMOKE_DIR/err.txt")"; then
      log "browser OK: $OUT"
    else
      log "ERROR: still cannot render after installing Playwright Chromium:"; cat "$SMOKE_DIR/err.txt"; exit 1
    fi
  else
    log "ERROR: Playwright download failed. Allow these domains in the environment's internet access:"
    log "  cdn.playwright.dev, playwright.download.prss.microsoft.com (and registry.npmjs.org for npx)"
    tail -5 "$SMOKE_DIR/pw.txt"; exit 1
  fi
fi

# 4. Link the skill where Codex looks for user skills
for dir in "${CODEX_HOME:-$HOME/.codex}/skills" "$HOME/.agents/skills"; do
  mkdir -p "$dir"
  ln -sfn "$SKILL" "$dir/gc-ad-image"
  log "linked $dir/gc-ad-image"
done

# 5. Fonts visible to Chrome?
fc-list :lang=zh family 2>/dev/null | grep -q -i 'noto' && log "CJK fonts OK" || log "WARN: no Noto CJK font visible to fontconfig"
log "done"

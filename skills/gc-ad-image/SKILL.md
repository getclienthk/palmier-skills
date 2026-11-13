---
name: gc-ad-image
description: Make Get Client ad images (Meta feed 4:5 / 1:1, Story 9:16) and thumbnails (YouTube 16:9, webinar/replay covers) that don't look AI-generated. Writes the photo prompt with a 9-slot realism formula, keeps real coaches' faces by editing their real photos instead of inventing them, renders the image through the local Codex $imagegen bridge, then sets all copy as real typography over the photo (never AI-drawn text) and QA-checks it, including a 120px thumbnail test. Use whenever the user asks for 廣告圖, ad image, ad creative, static ad, thumbnail, 封面, cover, YouTube 封面, webinar 封面, or says an image "looks too AI / 太 AI / 好假 / 塑膠感" — even if they never mention this skill.
---

# GC Ad Image & Thumbnail

Adapted from Palmier's `ugc-photo-prompts` skill (Apache-2.0, see "Credits" at the bottom).
The prompt method is theirs; the Palmier Pro tool calls were replaced with the local
Codex `$imagegen` bridge, and the coach-photo, text-overlay and thumbnail rules are new.

## Why GC ad images look "AI" — and the three fixes

1. **Invented faces.** A generated coach never quite looks like the coach, and generated skin is waxy.
   **Fix: a real coach is never generated from text.** Start from their real photo and use `edit` mode
   to change the scene around them (Step 3).
2. **AI-drawn text.** Chinese characters come out wrong or in a fake font.
   **Fix: the image model draws no text at all.** Every word is set afterwards by
   `scripts/render-overlay.mjs` in a real font (Step 5).
3. **Polish.** Symmetric faces, studio light, empty perfect rooms, golden bokeh.
   **Fix: the 9-slot formula** (Step 2) — realism comes from specific physical detail, never from the
   words "realistic", "8k" or "cinematic".

## Step 0 — Pin the deliverable

| Deliverable | Size | Overlay preset | Default text position |
|---|---|---|---|
| Meta feed ad (default) | 1080×1350 (4:5) | `ad-4x5` | bottom |
| Meta square | 1080×1080 | `ad-1x1` | bottom |
| Story / Reels ad | 1080×1920 | `story` | bottom (keep the top 250px and bottom 340px clear of key content: platform UI covers them) |
| YouTube / webinar thumbnail | 1280×720 | `thumb` | left half; subject on the right |

Also collect, asking once in a single message only for what's missing:
- **Which coach / project**, and a real photo of them (Drive, the user's upload, or the project's photo folder).
  If the client has a brand config (`brand-configs` skill), load it.
- **The one message**: the offer / hook / webinar topic, and any date, time or price that must appear.
- **Count**: default 3 variants for an ad, 2–3 A/B concepts for a thumbnail.

## Step 1 — Concept before prompt

**Ads.** Each variant = one real fact about the offer or one real customer situation, turned into one
moment the viewer gets at a glance (a coach mid-explanation at a whiteboard; a student's laptop showing the
Zoom class at the kitchen table at night). Vary the *idea* across variants, not just the colour.

**Thumbnails.** Write a brief per concept before generating:
- **One focal point** — the coach's face with a specific emotion, or the single result/object.
- **Overlay text: max ~8 Chinese characters (or 4 English words), and never the same words as the title.**
  The title and thumbnail split the job: the thumbnail carries the emotion/result, the title the details.
- **Contrast**: the subject must separate from the background (light vs dark, warm vs cool).
- **120px test**: what must still read when the thumbnail is the size of a fingernail (Step 6).
- Vary one big thing between concepts: face vs object, text vs no text, warm vs cool.

Show the concept list to the user and get a yes before spending generation time.

## Step 2 — The 9-slot photo prompt

Image models default to polish, and polish is the biggest AI tell. "Realistic" is not a style the model
can target — it is the *absence* of the polish defaults, so write that absence into every slot as a
specific physical detail. Fill every slot, in this order:

1. **Format** — camera + shot type + aspect, first. *"Candid iPhone photo, 4:5 vertical"* / *"Photo taken
   on a phone by a student in the second row, 16:9"*. This locks "photo", not "illustration".
2. **Framing & lens** — distance, angle, and the lens behaviour that comes with it (wide-angle warp,
   imperfect centring). ⚠️ Crop instructions are the least reliable slot (Palmier's tests: "one shoulder
   cropped at the frame edge" was ignored). Do the final crop with the overlay's `focus` instead.
3. **Subject — the imperfection stack.** Never "smiling confident businessman". Hair texture and disorder,
   skin (pores + one specific flaw: under-eye shadow, a little shine, redness), and a *momentary*
   expression (mid-sentence, looking at the screen, laughing at something off-frame).
4. **Wardrobe, named.** Fabric, fit, one small accessory (watch, lanyard, glasses, a pen in hand).
5. **Pose as interaction, not posture.** Pointing at the whiteboard, typing, handing over a notebook,
   mid-gesture while talking. Standing and looking at the camera is the second-biggest AI tell.
6. **Setting with texture and clutter.** Real materials (melamine table, carpet tiles, glass partition,
   HDB kitchen tiles) plus one incidental detail unrelated to the subject: a water bottle, a projector
   cable, a chair pushed out, the back of another person's head.
7. **Lighting, named and physical.** The actual source (overhead fluorescent, window on the left, laptop
   glow at night, phone flash) and what it does to skin and shadow.
8. **Vibe tag.** One phrase that holds the scene together: *"caught mid-class, not a photoshoot"*,
   *"late-night study at home"*.
9. **Negatives** — append the standing list below as plain language (the bridge has no negative field).

**Standing negative list** (always append):

> No studio lighting, no airbrushed or retouched skin, no perfect symmetry, no waxy or doll-like skin, no
> professional photoshoot polish, no cinematic colour grade, no CGI look, no fantasy lighting, no bokeh
> orbs, no text, no letters, no numbers, no watermark, no logo, no signage with writing.

("No text" matters doubly here: the copy goes on in Step 5, so any AI letters are garbage to remove.)

**If a result still looks too clean**, don't rewrite the prompt — append:

> Real phone photo, imperfect framing, visible pores, flyaway hairs, natural facial asymmetry, slight
> motion blur, phone HDR, mild compression, uneven lighting, no beauty retouching, no studio setup, no
> cinematic grading.

What reliably lands (Palmier's real tests): pores, a named small object (a charger cable), and a named
light/shadow contrast. What doesn't: crops. Check every slot against the actual output.

### GC scene templates (fill the brackets)

- **Coach teaching** — Format: phone photo from the third row of a seminar room, 4:5. Subject: [coach],
  mid-sentence, one hand pointing at [whiteboard with marker scribbles — no legible words]. Setting:
  rows of folding chairs, backs of 2–3 attendees' heads, a projector cable taped to the carpet.
  Lighting: overhead fluorescent plus projector spill on one side of the face. Vibe: "caught mid-class".
- **1-on-1 consult** — Format: candid photo across a café table, 4:5. Subject: [coach] leaning in, mid-
  explanation, pen in hand. Setting: two cups, an open notebook, a phone face-down, the other person's
  forearm in frame. Lighting: window light from the left. Vibe: "real conversation, not posed".
- **Student at home** — Format: phone photo over the shoulder, 4:5. Subject: a fictional student
  (see Guardrails) taking notes, laptop showing a video call [no legible UI text]. Setting: kitchen table
  at night, a mug, a charger cable, a child's drawing on the wall. Lighting: laptop glow + one warm pendant
  lamp. Vibe: "studying after the kids are asleep".
- **Live event** — Format: phone photo from the audience, 16:9 or 4:5. Subject: [coach] on a low stage,
  mid-gesture, slightly motion-blurred hand. Setting: stage lights, a lectern, phones raised in the
  foreground out of focus. Vibe: "I was there".
- **Thumbnail face** — Format: photo, 16:9, subject on the right third. Subject: [coach] with one clear,
  specific emotion (raised eyebrows mid-reaction, half-laugh, frowning at a laptop). Background: simple,
  slightly darker than the face, one prop that tells the topic. Leave the left half calm for the text.

## Step 3 — Real coach? Edit their photo, don't generate them

- **Real, named person (a coach, the user, a staff member) → `mode: "edit"` on their real photo.**
  The prompt must:
  1. open with `view_image ./<photo basename>` and `use $imagegen EDIT mode on it`;
  2. say what to KEEP: *"Keep this person's face, facial structure, skin tone, hairline, glasses and age
     exactly as in the photo. Do not beautify, slim, de-age or smooth the skin."*;
  3. say what to CHANGE, as slots 1–8 (new setting, light, pose if possible, wardrobe only if asked);
  4. end with the standing negative list.
  Edit mode keeps roughly the source photo's aspect; the overlay step crops to the deliverable with `focus`.
  The best source photo is evenly lit with no harsh shadows: baked-in shadows and colour casts carry over.
  Use one clean photo per job; don't redescribe the person's looks in the text (it fights the image).
- **No real person needed → `mode: "generate"`** with width/height set to the deliverable. Use
  `reference_images` only to match the *style* of an approved previous ad (it makes a variation, never an
  edit, and never preserves a face).
- **Product or course material** (book, workbook, app screen): pass it as the edit source or composite the
  real asset in the overlay step. Never let the model invent the product.

## Step 4 — Generate through the local bridge

The bridge is `~/Desktop/GetClient/ig-routines/imagegen-server.py` (an MCP server wrapping `codex exec`
`$imagegen`; config in `ig-routines/mcp-imagegen.json`).

- **If `mcp__imagegen__generate_image` is available**: call `imagegen_status` once, then
  `generate_image({prompt, output_path, mode, source_image | width+height})` →
  `imagegen_result({job_id, wait_s: 50})` until it is done. Paths are relative to
  `~/Desktop/GetClient/work/`; use `gc-ad-image/<yyyy-mm-dd>-<project>/<variant>.png`.
- **If it isn't loaded in this session**: run Codex directly. Write the prompt to a file in the work
  folder (copy the source photo next to it for edits) and run, in the foreground,
  `codex exec --cd <workdir> --skip-git-repo-check --sandbox workspace-write - < <workdir>/prompt.txt`
  (stdin `-`; don't use `$(cat …)`). The prompt must end with "Save the final image as out.png in the
  current working directory." Generate mode should also say "Render at exactly W×H pixels."
- ⚠️ **ONE job at a time. Never run two in parallel** — concurrent `$imagegen` jobs leak prompts and
  images into each other (proven twice on 2026-08-21). Slow and serial is the accepted cost.
- Each job takes ~1–10 minutes. Don't end the turn while a job is running.
- Codex image generation needs the VPN on (OpenAI blocks HK IPs). Two consecutive network errors → stop
  and tell the user; don't loop.
- A moderation refusal (HTTP 400) on a real person's photo is final for that image: tell the user, don't
  try to get around it.

## Step 5 — Set the copy as real type

Never ask the image model for words. Write a spec and run the renderer:

```json
{
  "background": "/Users/getclient/Desktop/GetClient/work/gc-ad-image/2026-11-13-xyz/v1.png",
  "output":     "/Users/getclient/Desktop/GetClient/work/gc-ad-image/2026-11-13-xyz/v1-final.png",
  "preset": "ad-4x5",
  "focus": "60% 35%",
  "badge": "免費分享會",
  "headline": "唔使識技術\n[[都做到]]",
  "sub": "星期六 晚上8點 · Zoom 直播",
  "logo": "/abs/path/to/client-logo.png"
}
```

`node <this skill>/scripts/render-overlay.mjs spec.json`

- `[[...]]` sets black text on a brand-yellow (#FEF102) block; `\n` forces a line break. The headline
  auto-shrinks until it fits. `focus` is the CSS `object-position` used for the crop.
- Brand rules (Get Client): black / white / yellow #FEF102. **Never yellow text on a white background.**
  For a client brand, swap the colours/font in the renderer's `:root` after loading their brand config.
- Keep copy short. Ad: headline ≤ ~12 characters per line, max 2 lines, plus one sub line.
  Thumbnail: ≤ ~8 characters total.
- Compliance (Meta): no income or result guarantees in the image ("月入十萬", "保證"), no before/after
  money screenshots, no fake UI or fake notifications. Use the `meta-ad-check` skill when in doubt.

## Step 6 — QA before showing anyone

Look at every final image yourself (Read the PNG), and check:

- **Slots**: did each of the 9 slots land? Name the ones that didn't.
- **AI tells**: hands and finger count, teeth, ears and earrings matching, glasses frames, waxy or
  over-smooth skin, perfectly symmetric face, garbage letters on signs, screens, whiteboards or clothes,
  objects merging into each other, a too-perfect empty background, the same face repeated on extras.
- **Identity** (edits): side by side with the source photo — same person? Not slimmer, younger or
  beautified? If it drifted, regenerate; never ship a coach who doesn't look like the coach.
- **Text**: correct characters, nothing clipped, readable over the image, no yellow-on-white.
- **120px thumbnail test**: `sips -Z 160 final.png --out small.png`, then look at `small.png`.
  The face/emotion and the overlay words must still read. If not: fewer words, bigger face, more contrast.
- **Story safe zones**: nothing important under the platform UI areas.

Reroll only the failing slot (append the realism add-on, change the light, swap the incidental detail);
don't start over. Then deliver: final PNGs + the prompt used for each + what was checked, and wait for the
user to pick before making size variants.

## Guardrails

- Real people only from real photos, and only people the user/GC has the right to use in ads.
  Never generate a named public figure or someone else's coach.
- Fictional people (students, customers) are fine as scene extras, but **never present a generated person
  as a real student, a testimonial or a result**. Real testimonials use real photos.
- Brand-safe, non-sexualised wardrobe and poses by default.

## Credits

The 9-slot formula, standing negative list, realism add-on and test notes come from
[`ugc-photo-prompts`](https://github.com/palmier-io/palmier-skills/tree/main/skills/ugc-photo-prompts)
by Palmier (Apache-2.0). Modified for Get Client in 2026-11: Palmier Pro tool calls removed and replaced
with the local Codex `$imagegen` bridge; coach-photo edit flow, typography overlay renderer, thumbnail
brief, GC scene templates, compliance and QA steps added. The thumbnail brief rules (one focal point,
short text that doesn't repeat the title, 120px test, A/B concepts) follow the ideas in
[`yt-thumbnail-brief`](https://github.com/sergebulaev/youtube-skills) (MIT).

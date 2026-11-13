# Stage A — Write the ad (copy first, picture second)

Read this when the job starts from a brief rather than finished copy. The output is a set of
**concept cards**: each one is the Meta copy fields + the words on the image + the hook type, which
decides the picture in Stage B. The copy always comes first; never generate a nice picture and fit
words to it afterwards.

If the user already has the copy (pasted primary text, a reference ad, a webinar blueprint), skip what
they've done: start at A3 with their words, still run A4–A6.

Related GC skills (Claude Code has them; use them if installed, otherwise apply the rules here):
`ad-modifier` (copy a proven reference ad's structure), `webinar-ads-generator-v2` (video scripts from a
webinar blueprint), `concrete-copy`, `hk-cantonese-voice-pass`, `meta-ad-check`, `brand-configs`.

## A1 — The brief (ask once, one message, only for what's missing)

| Field | What to pin | Example |
|---|---|---|
| Offer & destination | what the click gets and where it goes | 免費 Zoom 分享會報名頁 / WhatsApp Community / 課程頁 |
| Coach / brand | who fronts it; load their brand config if there is one | Frank Sir, ECF |
| Audience | one specific person in one specific situation | 做咗三年保險、轉介紹開始乾塘嘅 agent |
| Awareness | unaware / problem-aware / solution-aware / knows the coach | problem-aware |
| Funnel | cold, warm (engaged / video viewers) or retargeting (visited, didn't register) | cold |
| Proof you're allowed to use | real numbers, real student results, real dates — with where they came from | user's message, brand config, the webinar deck |
| Already run | angles or ads that have run, and which won / lost | "收生翻倍" ran Oct, won |
| Count | default 3 concepts, each on a different angle | |

**Grounding rule: every claim, number and result must trace to something the user gave you** (their
message, the brand config, the webinar content, a real student comment). Never invent a statistic, a
student, a testimonial, a price, a date or a programme subtitle. If the proof isn't there, write an angle
that doesn't need it, or ask.

## A2 — Angles (one reason to click per concept)

Pick 3–5 angles from different rows, so the concepts test different motivations, not different wording:

| Angle | The move | GC-flavoured example |
|---|---|---|
| Pain | name the exact frustrating moment | 約咗十個客，九個話「考慮下」 |
| Outcome | the specific result, with a real number if you have one | 三個月由 2 個學生做到 11 個 (only if real) |
| Identity | "this is for people like me" — call out the situation, not a personal attribute | 做咗五年銷售、開始覺得自己追唔上嘅人 |
| Contrarian | the common advice the coach disagrees with | 唔好再逼自己每日 post |
| Curiosity / mechanism | name the method without explaining it | 「影子交易法」係點運作 |
| Social proof | real students, real counts, real screenshots of comments (with permission) | 上次 300 人報名 (only if real) |
| Timing | why now: a date, a change, a season | 年尾最後一場 |

Don't regenerate an angle the user says already lost. Write one line per angle saying where it came
from (which sentence of the brief, which comment, which result).

## A3 — Copy per concept

Default language: Hong Kong Cantonese written in Traditional Chinese, the way the coach would say it
out loud, unless the brand config says otherwise. Fields:

| Field | Limit (Meta, mobile) | Job |
|---|---|---|
| **Primary text** | ~40 Chinese characters show before 「⋯更多」(≈125 English chars); the full text can be longer | The hook goes in the first line. Then 2–5 short lines: the situation, what the session gives, the practical details (date, time, Zoom, free), one CTA line. |
| **Headline** (under the image) | ~14 Chinese characters / 27 English characters before truncation | The offer in plain words: 「免費 Zoom 分享會｜11月23日」 |
| **Description** | ~15 Chinese characters; often hidden — never put essential info only here | |
| **On-image text** | headline ≤ ~12 characters per line, max 2 lines, + one sub line (thumbnail ≤ ~8 total) | The hook or the outcome, **not a repeat of the Meta headline**. Goes on via `render-overlay.mjs` in Stage C. |
| **CTA button** | Meta's fixed list | 立即報名 (Sign up) for webinars, 了解更多 (Learn more) for cold/curiosity |

Write the hook line three ways and keep the most specific one. Count characters and print the count
next to each field; trim anything over the limit and show the trimmed version.

## A4 — Remove the AI tells from the words

Generated copy reads as generated because of a handful of sentence shapes. Check the whole batch:

- **Contrast reveals** — 「唔係 X，而係 Y」「不是…而是…」「It's not X, it's Y」. Say Y directly, with its reason.
- **Negation lists** — 「唔使 X、唔使 Y、唔使 Z」「No X. No Y. No Z.」. Keep the one that matters; use the space
  for a fact. One plain absence (「免費」「唔使經驗」) is fine.
- **Self-answered questions and colon reveals** — 「結果？」「秘訣就係：」「The result? 3x.」.
- **Stock phrases** — 解鎖、賦能、全方位、一站式、輕鬆掌握、告別、開啟…之旅、重新定義、助你、終極、
  秘密武器、改變人生、「你準備好未？」、Unlock, Say goodbye to, Take it to the next level.
- **Punctuation tics** — em dashes (——) in ad copy, a row of emojis, 「！！！」, every line ending in an emoji.
- **Triplets** — three adjectives or three parallel clauses in a row.
- **Same shape across the batch** — three concepts that all open with a question read as generated even
  if each is fine alone. Vary the opening: a number, a quote, a scene, a direct instruction.
- **Hook slop** — 「停一停！」「你一定要知」「99% 人都唔知」 with nothing specific behind it.

**The picture test (from `concrete-copy`):** after each sentence, does the reader see a person, an action,
a place or a number? 「提升你嘅銷售能力」 shows nothing; 「客講完『我考慮下』，你下一句講咩？」 shows a
moment. Rewrite the abstract lines.

**The say-it-out-loud test (from `hk-cantonese-voice-pass`):** read the primary text as the coach would say
it on a call. Written-Chinese words (進行、透過、提升、之際) become spoken ones (做、靠、升、嗰陣). Keep
technical terms in English where people actually say them in English (Zoom, closing, leads).

## A5 — Meta compliance pass

Run `meta-ad-check` if it is installed; otherwise check at least:

- **Personal attributes** — don't assert or imply the reader has a financial, health, age, ethnic or other
  personal condition: 「你係咪欠緊卡數？」 fails; 「好多人欠卡數之後先發現…」 passes.
- **Income and result claims** — no guaranteed income, 「保證」, 「月入十萬」, 「一個月回本」, no unrealistic
  timelines. Real student results need to be real and typical-ish; frame them as one person's story.
- **Before/after** — no before/after money screenshots or bank balances, in the copy or on the image.
- **Fake UI** — no fake notifications, fake chat bubbles or fake play buttons on the image.

The image is part of the claim: a stack of cash, a luxury car or a bank app on screen can fail review on
its own, even with clean copy.

## A6 — Pick the picture pattern from the hook type

The hook type decides what the picture must do. Fill the 9-slot prompt (SKILL.md Step 2) with the matching
pattern; the GC scene templates there are starting points.

| Hook type | Picture pattern | GC scene to start from | Don't |
|---|---|---|---|
| Pain | the frustrating moment itself, before it's solved | agent at a café staring at a phone after a client left; laptop with an unanswered chat at night | show the solution or the coach smiling |
| Outcome | the moment after the result, felt rather than shown off | a full seminar room from the back row; a student mid-laugh on a Zoom call at home | cash, cars, bank screens |
| Identity | someone the target recognises as themselves, in their own setting | the "student at home" or a person in a specific workplace | a model-looking stranger on white |
| Contrarian | one person doing the unexpected, or a clear wrong-vs-right contrast | coach crossing out a whiteboard scribble (no legible words) | generic before/after panels |
| Curiosity / mechanism | something partly hidden: a notebook page turned away, a hand covering a chart | close-up over the shoulder, shallow focus | revealing the answer in the picture |
| Social proof | real people from real photos only, or a real crowd shot from a real event | the "live event" template using the user's photo | a generated person presented as a real student |
| Coach authority | the real coach mid-teaching, from their real photo (edit mode) | "coach teaching" / "1-on-1 consult" | stock poses, arms crossed at camera |

Leave room in the composition for the on-image text (state where: top third, left half) so Stage C
doesn't have to cover a face.

## A7 — Concept cards (show these, get a yes, then generate)

Save the cards as `concepts.md` in the job folder and show them to the user. One card per concept:

```markdown
## 01 · <concept name>
**Key:** <project>_<angle>_A1_<yyyymmdd>      (also the ad name in Ads Manager)
**Angle / hook type:** Pain · cold · problem-aware → <destination>
**Source:** <which line of the brief / which comment / which result this comes from>
**Primary text:** (n 字)
<text>
**Headline:** <text> (n 字)
**Description:** <text> (n 字)
**CTA button:** 立即報名
**On image:** <headline> / <sub line>
**Picture:** <one sentence: who, doing what, where, which light; where the text goes>
**Compliance:** <pass, or what was changed and why>
```

Wait for the user to pick or edit before Stage B. Generating pictures is the slow, serial step.

## A8 — Variations: lock one half, change the other

When the user wants more versions of a concept, change only one half so the test result means something:

| Mode | Keep | Change | When |
|---|---|---|---|
| New picture, same copy | copy (verbatim) | the picture: scene → subject → framing → light, one lever at a time | copy is winning, picture isn't stopping the scroll |
| New copy, same picture | the PNG | hook line / primary text only | picture is strong, conversions are weak |
| Full refresh | nothing | new angle, new copy, new picture | the concept is tired |

Name variations from the concept key: `…_A1`, `…_A2` (same copy, new picture), `…_B1` (new copy).

## Credits

Angle categories, the AI-tells list and the "copy drives the image" rule adapt
[`ad-creative`](https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative) by Corey
Haines (MIT). The hook-type → picture pattern pairing and the lock-one-half variation matrix adapt
[`static-ad`](https://github.com/robpalmer99/claude-code-copywriting-skills/tree/main/static-ad) by Rob
Palmer (CC BY 4.0). Rewritten for Get Client in 2026-11: Cantonese copy rules, Chinese character limits,
Meta personal-attribute checks and GC scene mapping added.

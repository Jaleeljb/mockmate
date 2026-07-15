# onemock — Mock Interview Practice

A responsive, resume-aware mock interview app that runs a **live, timed session
of at least 15 minutes**, entirely in the browser.

## Why no AI/API stack

Per the brief, this deliberately avoids calling an external AI API for question
generation or grading. Instead it leans on tech that's built into the browser
and free to run, so the app stays light, fast, and has zero per-session cost:

- **Resume parsing**: `pdfjs-dist` and `mammoth` run client-side to extract raw
  text from PDF/DOCX/TXT — nothing is uploaded to a server.
- **Question selection**: a hand-built question bank + keyword/regex matching
  against the resume text (skills, job titles, companies, years of experience,
  education) assembles a personalized question plan.
- **Voice**: the native **Web Speech API** — `SpeechSynthesis` reads each
  question aloud, `SpeechRecognition` transcribes the candidate's spoken
  answer live. Both run locally in supporting browsers (Chrome/Edge) with no
  network round trip. Browsers without support fall back to text questions
  and a typed-answer box automatically.
- **Feedback**: a rule-based scorer (answer length, pacing, filler-word rate,
  STAR-style structure heuristics) — transparent and free, not a model
  judging correctness.

## Guaranteeing the 15-minute floor

`lib/interviewEngine.ts` builds a question plan sized so the *estimated*
total already clears 15 minutes (opening + resume-specific + skill-based
technical + behavioral questions). The live session also tracks a running
clock independent of the plan: if a candidate answers faster than estimated
and reaches the end of the plan before 15:00 elapses, the app pulls an unused
behavioral/technical question from reserve and keeps going until the floor is
met.

## Getting started locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use Chrome or Edge for full voice support.

## Deploying to Vercel

This is a stock Next.js 14 App Router project — no server-side API routes,
no environment variables required.

1. Push this folder to a GitHub repo.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected). Build command / output are
   the defaults — no configuration needed.
4. Deploy.

Because parsing and speech all happen client-side, there's no backend to
provision and no API keys to configure.

## Project structure

```
app/                Next.js App Router entry (layout, page, global styles)
components/         UI: upload, briefing, live session stage, summary report
lib/
  resumeParser.ts    Client-side PDF/DOCX/TXT text extraction + keyword analysis
  questionBank.ts    Static question pools (opening/behavioral/technical/closing)
  interviewEngine.ts Builds the resume-aware plan, enforces the 15-minute floor
  speechUtils.ts     Web Speech API wrappers (TTS + STT)
  feedback.ts        Rule-based post-interview scoring
types/               Shared TypeScript types
```

## Browser support notes

- `SpeechRecognition` is currently Chrome/Edge (and Chromium-based browsers)
  only. Safari/Firefox users can still complete the full session by typing
  answers in the textarea, which is always available alongside the mic.
- Everything is responsive down to small mobile widths.

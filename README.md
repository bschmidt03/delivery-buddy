# Delivery Buddy 🚚🎧

A mobile-first PWA for Amazon DSP delivery drivers: a live stops-per-hour pace calculator, built for one-handed use in a moving vehicle, plus an AI companion for route tips and quick pep talks.

## Design

Dark charcoal + warm amber, always on (no light mode) — built to be glanceable in bright sunlight or at night, with huge tabular numbers, chip-based inputs to minimize typing, and large tap targets throughout. The chat companion ("Buddy") gets its own cyan accent and avatar so it reads as a distinct feature, not a settings menu.

## Features

**Pace calculator (core)**
- Start a shift: total stops assigned (quick-pick chips or exact entry), start time, optional target pace
- One-tap `+1 Stop`, plus `+5` / `−1` / exact-correct for catching up on logging
- Live pace, stops remaining, projected finish time, and ahead/behind-target status
- Pause/resume for breaks — paused time doesn't count against pace
- End-of-shift summary: total stops, active time, average pace, best/worst hour
- Last 20 shifts saved locally for a quick glance at trends

**Buddy (AI companion)**
- Slide-up chat drawer, doesn't compete with the calculator for screen space
- Knows your live shift context (pace, stops remaining, ahead/behind target) so advice is situational
- Streams replies from `claude-haiku-4-5-20251001` via a serverless proxy — your API key never reaches the browser
- Quick-start suggestions: route planning, general driving tips, motivation check-ins

**PWA**
- Installable to your phone's home screen (manifest + icons + minimal service worker)
- Works fully offline for the calculator (all shift data is local-first in `localStorage`)

## Tech stack

Next.js (App Router, TypeScript), Tailwind CSS 4, `@anthropic-ai/sdk` for the chat proxy. No database, no login — shift data lives in the browser; the only server code is a stateless `/api/chat` route.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — best experienced on an actual phone (open your machine's LAN IP shown in the terminal from your phone's browser).

### Enabling the chat companion

Buddy needs an Anthropic API key to actually reply (get one at [console.anthropic.com](https://console.anthropic.com)):

```bash
cp .env.example .env.local
# then edit .env.local and set ANTHROPIC_API_KEY
```

Without a key, the rest of the app works fully — the chat drawer just shows a friendly error when you try to send a message.

## Deploying

Deploys as-is on [Vercel](https://vercel.com): push to GitHub, import the repo, set `ANTHROPIC_API_KEY` as an environment variable, deploy. No database to provision.

## Suggested resume bullet

> Built Delivery Buddy, a mobile-first PWA for delivery drivers (Next.js, TypeScript, Tailwind) with a live pace/ETA calculator and a streaming AI companion (Claude API via a serverless proxy) that gives situational advice based on real-time shift data.

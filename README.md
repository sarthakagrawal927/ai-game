# AliveVille — AI World Simulator

Homepage: https://aliveville.com/

Play AliveVille: https://aliveville.com/game/

Live marketing site: `ai-game/astro-landing` (Astro + Three.js). Deploys to Cloudflare Pages.

AliveVille is a browser-playable AI world simulator deployed at **aliveville.com/game**. The active client is the 3D browser game (`web3d/`). The simulation server, world ingest, autonomous agent loop, quests, saves, and LLM routing live in `src/`.

## Agent-Readable Entrypoints

- [Concise product guide](https://aliveville.com/llms.txt)
- [Complete public product guide](https://aliveville.com/llms-full.txt)
- [Structured agent catalog](https://aliveville.com/api/ai)
- [Homepage as Markdown](https://aliveville.com/index.md)
- [Playable game as Markdown](https://aliveville.com/game/index.md)
- [Crawler rules](https://aliveville.com/robots.txt)
- [Sitemap index](https://aliveville.com/sitemap-index.xml)

## Current Shape

- `src/`: simulation, agent loop, director, ingest, story package, LLM routing.
- `web3d/`: active 3D browser client (walkable town, combat, cutscenes, minimap).
- `worker/`: Cloudflare Worker edge deploy (session-DO, SSE).
- `astro-landing/`: public marketing site (LIVE — do not touch).
- `src/probes/`: lifelikeness regression probe harness.

## Run The Dev Environment

```sh
pnpm install
pnpm dev:server   # sim server on http://localhost:5174
pnpm dev          # 3D Vite dev server on http://localhost:5175
```

Open `http://localhost:5175`.

Useful server endpoints:

- `GET /api/state`: raw simulation state.
- `POST /api/tick`: advance simulation with a player action.
- `POST /api/import-world-source`: reviewed world-source ingest.
- `GET /api/story-package`: packaged story + cutscenes manifest.

## Verification

```sh
pnpm verify:readiness
```

Runs typecheck, lint, unit tests, and the 3D build.

<!-- ACTIVE-AI-TASK-LOG:START -->
## Future Vision

Living north-star (deferred): `docs/archive/future-prd-deferred-north-star-2026-06-12.md`. Gated on `docs/current/core-gameplay-fix.md` playtest bar — not an active sprint.

### Asset references

- [kitbitz.art](https://kitbitz.art) — future asset reference (from issue #27)

## Active AI Task Log

This section is maintained by the SaaS Maker Active-AI product/design loop so future agents do not reopen duplicate UI tasks.

- Business lane: Core/status context
- Rule: do not create another broad "improve the UI" task unless the acceptance criteria differ materially from the tasks listed here.
- Current task authority: this repository’s GitHub Issues. The completed entry below is historical context.

| Task | Status | Priority | Last known note |
| --- | --- | --- | --- |
| `a31f2db5` [fleet-audit] ai-game CI failing on main | done | high | 2026-06-04 09:21:38 |
<!-- ACTIVE-AI-TASK-LOG:END -->

## Retained work and verified local scope

The 2026-09-07 repair holds the autonomous clock during world and character
selection, then starts it when play begins. Rival tutorial gating remains intact.
A local Lanternmere run rendered six NPCs, walked to Pip, completed a scripted
conversation, recorded NPC memory, saved to the browser, and restored that memory
after reload. [Receipts and limits](docs/current/setup-and-memory-qualification-2026-09-07.md).

**Task reconciliation: 0 open issues, 0 open PRs, 0 closures.** This remains an
inactive experiment. Local evidence does not reopen the deferred roadmap or
qualify the deployed game. Retain these gates:

- A human fun/not-fun verdict for the Rival loop and understandable pacing;
  setup protection does not establish that the game is compelling.
- An authorized deployment and a fresh live-session verification of this fix.
- Worker/local-server parity, including browser-save restoration via `/api/load`.
- Model-backed conversation, long-term recall, and real-device voice/GPU checks.
  The HUD now reports scripted dialogue from the server response, keeps unknown
  mode explicit, and labels server AI as configured rather than verified.
  Automatic model preloads and external font availability still need review
  before claiming a resilient guest experience.

The previously listed documentation consolidation is complete and validated;
future vendor/shop and interior ideas remain deferred behind the human verdict.

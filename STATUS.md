# Status

Last updated: 2026-09-07

> Short current view. For the deep timeline + feature log, see
> [`PROJECT_STATUS.md`](./PROJECT_STATUS.md). For the docs index, see
> [`docs/index.md`](./docs/index.md).

## Current objective

Aliveville is a browser-playable AI world simulator at aliveville.com/game.
The current portfolio state is **inactive / held experiment**. The
Rival-readiness milestone is closed for now under an explicit product-owner
deferment. No human fun/not-fun verdict was recorded; require one before
resuming feature expansion.

## Active work

- **Bounded setup repair** — local qualification complete (2026-09-07): the
  clock stays paused through setup; the scripted talk, memory, save and restore
  path passed. [Evidence](docs/current/setup-and-memory-qualification-2026-09-07.md).
- **Documentation consolidation** — complete; canonical structure and links
  validated. No open GitHub issues or PRs remain; no tasks were closed by this audit.
- **Rival guided onboarding** — shipped (capped 2026-07-13). The move →
  talk → fight → consequence guide is wired; the human playtest verdict is
  deferred.

## Blockers

- **Human Rival playtest verdict** — the product owner closed the capped
  Rival-readiness milestone without conducting the playtest. No fun/not-fun
  verdict is claimed. This is the first gate before any deferred north-star
  expansion. See
  [`docs/current/core-gameplay-fix.md`](./docs/current/core-gameplay-fix.md) §5.
- **Worker DO parity** — 5 local-server endpoints missing on the Worker DO
  (`story-package`, `import-story-package`, `load`, `restore-checkpoint`,
  `portrait`). Prod parity blocked until ported.
- **Game worker deploy is manual** — CI does not deploy the game Worker.
  See [`docs/operations/deploy.md`](./docs/operations/deploy.md).

## Unresolved questions

- Should the human Rival playtest be conducted before or after wiring the
  vendor/shop UI? (Economy actions exist; the UI does not.)
- When should the 5 missing local-only endpoints be ported to the Worker DO?
- Is a published docs domain (docs.aliveville.com) warranted, or are the
  committed Markdown files sufficient for now?

## Retained future ideas (deferred)

1. Conduct a fresh Rival session without developer help; record the
   fun/not-fun verdict plus any confusion, combat-feel, or consequence-
   legibility failures. See
   [`docs/current/core-gameplay-fix.md`](./docs/current/core-gameplay-fix.md) §5.
2. Wire the in-game buy/sell vendor/shop UI for the coin economy
   (`web3d/` HUD + `src/` economy actions).
3. Add interior depth: quest NPC inside an anchor building, interior
   interactables/clues (`web3d/src/interiors/`).
4. Qualify model-backed dialogue only under an explicitly configured and
   approved local/provider setup; the scripted run is not model proof.
5. Real-device verification of frontier GPU/AI/TTS features; deploy frontier
   build to prod when ready.

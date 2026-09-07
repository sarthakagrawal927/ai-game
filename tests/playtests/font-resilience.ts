/** Local scripted server only. External resources (including fonts/models/analytics) are blocked. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env['GAME_URL'] ?? 'http://localhost:5185/game/';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Local server required');
const out = process.env['GAME_SHOTS_DIR'] ?? 'tmp/playtest-artifacts/font-resilience';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--enable-webgl',
  ],
});
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const blocked = new Set<string>();
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (['localhost', '127.0.0.1'].includes(url.hostname)) await route.continue();
    else {
      blocked.add(url.hostname + url.pathname);
      await route.abort();
    }
  });
  await context.addInitScript(() => localStorage.setItem('aliveville_controls_seen', '1'));
  const page = await context.newPage();
  await page.goto(base);
  await page.locator('.start-card').first().click({ timeout: 30000 });
  await page.locator('.char-pick').first().click({ timeout: 30000 });
  await page.waitForFunction(
    () => {
      const game = (
        window as unknown as {
          __game?: { npcRegistry: Map<string, unknown>; playerPosition: { z: number } };
        }
      ).__game;
      return game && game.npcRegistry.size > 0 && Math.abs(game.playerPosition.z) > 1;
    },
    null,
    { timeout: 60000 }
  );
  await page.evaluate(async () => {
    const path = '/game/src/store/world.ts';
    const { useWorldStore } = await import(/* @vite-ignore */ path);
    const apiPath = '/game/src/api/client.ts';
    const { setAgentLoopRunning } = await import(/* @vite-ignore */ apiPath);
    await setAgentLoopRunning(false);
    await useWorldStore.getState().refreshAgentLoopStatus();
    const uiPath = '/game/src/store/ui.ts';
    const { useUiStore } = await import(/* @vite-ignore */ uiPath);
    useUiStore.getState().closeDialogue();
    const directorPath = '/game/src/director/store.ts';
    const { useDirectorStore } = await import(/* @vite-ignore */ directorPath);
    useDirectorStore.getState().reset();
  });
  const position = () =>
    page.evaluate(() => {
      const game = (
        window as unknown as {
          __game: {
            playerPosition: { x: number; y: number; z: number };
            npcRegistry: Map<string, unknown>;
          };
        }
      ).__game;
      return {
        x: game.playerPosition.x,
        y: game.playerPosition.y,
        z: game.playerPosition.z,
        npcs: game.npcRegistry.size,
      };
    });
  await page.waitForTimeout(2000);
  const before = await position();
  await page.screenshot({ path: `${out}/blocked-fonts-town.png` });
  await page.keyboard.down('a');
  await page.waitForTimeout(1100);
  await page.keyboard.up('a');
  const after = await position();
  const distance = Math.hypot(after.x - before.x, after.z - before.z);
  assert(distance > 0.5, `Player did not move: ${distance}`);
  assert(
    [...blocked].some((url) => /cdn\.jsdelivr\.net.*unicode-font-resolver/i.test(url)),
    'Font failure must actually occur'
  );
  await page.screenshot({ path: `${out}/blocked-fonts-walked.png` });
  await page.evaluate(async () => {
    const path = '/game/src/store/world.ts';
    const { useWorldStore, mergeWorldEvents } = await import(/* @vite-ignore */ path);
    const common = {
      actorId: 'bram',
      actionType: 'gossip',
      fromDirector: false,
      expiresAt: performance.now() + 60000,
    };
    const repeated = Array.from({ length: 3 }, (_, id) => ({
      ...common,
      id,
      text: 'Bram forgot to open the forge.',
    }));
    const unique = Array.from({ length: 7 }, (_, id) => ({
      ...common,
      id: id + 10,
      fromDirector: true,
      text: `Important unique event ${id + 1}`,
    }));
    useWorldStore.setState({ events: mergeWorldEvents([], [...repeated, ...unique]) });
  });
  assert.equal(
    await page.locator('.toast').filter({ hasText: 'Important unique event' }).count(),
    7
  );
  assert.equal(await page.locator('.toast').filter({ hasText: 'Bram forgot' }).count(), 1);
  const layout = await page.evaluate(() => {
    const objective = document.querySelector('.objective')!.getBoundingClientRect();
    const log = document.querySelector('.toasts')!;
    const bounds = log.getBoundingClientRect();
    return {
      objectiveBottom: objective.bottom,
      noticesTop: bounds.top,
      height: bounds.height,
      scrollHeight: log.scrollHeight,
      clientHeight: log.clientHeight,
    };
  });
  assert(layout.noticesTop > layout.objectiveBottom, 'Notices overlap the objective');
  assert(
    layout.height <= 160 && layout.scrollHeight > layout.clientHeight,
    'Notices must be bounded and scrollable'
  );
  await page.locator('.toasts').focus();
  await page.keyboard.press('End');
  await page.locator('.toast').last().scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    const path = '/game/src/director/store.ts';
    const { useDirectorStore } = await import(/* @vite-ignore */ path);
    useDirectorStore.getState().reset();
  });
  await page.screenshot({ path: `${out}/bounded-notices.png` });
  const receipt = {
    mode: 'local scripted; all external requests blocked; notice fixture injected',
    before,
    after,
    distance,
    blockedHosts: [...new Set([...blocked].map((url) => url.split('/')[0]))],
    blockedFontLookup: [...blocked].find((url) =>
      /cdn\.jsdelivr\.net.*unicode-font-resolver/i.test(url)
    ),
    layout,
    uniqueNotices: 8,
  };
  writeFileSync(`${out}/receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}

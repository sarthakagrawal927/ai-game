import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { World } from '../src/types.ts';

import { useUiStore } from '../web3d/src/store/ui.ts';
import { resetTransientWorldUiState, useWorldStore } from '../web3d/src/store/world.ts';

describe('web3d world store', () => {
  it('resets transient dialogue state with a world swap', () => {
    useWorldStore.setState({ lastNpcInitiationAt: 12345 });
    useUiStore.setState({
      gamePhase: 'playing',
      dialogueNpcId: 'mira',
      dialogueOpener: 'hello',
      dialogueLines: [{ speaker: 'npc', speakerName: 'Mira', text: 'hello' }],
      dialogueBusy: true,
      interactionTarget: { kind: 'npc', id: 'mira', label: 'Mira', verb: 'talk to' },
      interiorBuildingId: 'forge',
    });

    resetTransientWorldUiState();

    expect(useWorldStore.getState().lastNpcInitiationAt).toBe(Number.NEGATIVE_INFINITY);
    expect(useUiStore.getState().dialogueNpcId).toBeNull();
    expect(useUiStore.getState().dialogueOpener).toBeNull();
    expect(useUiStore.getState().dialogueLines).toEqual([]);
    expect(useUiStore.getState().dialogueBusy).toBe(false);
    expect(useUiStore.getState().interactionTarget).toBeNull();
    expect(useUiStore.getState().interiorBuildingId).toBeNull();
  });
});

describe('world clock follows entry into play', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useUiStore.setState(useUiStore.getInitialState(), true);
    useWorldStore.setState(useWorldStore.getInitialState(), true);
  });

  function setup(worldId: string, running: boolean) {
    const world = JSON.parse(
      readFileSync(new URL('../worlds/village.json', import.meta.url), 'utf8')
    ) as World;
    world.id = worldId;
    useWorldStore.setState({ world });
    const fetch = vi.fn(async (url: string) => {
      if (url.includes('/start')) running = true;
      if (url.includes('/stop')) running = false;
      return new Response(JSON.stringify({ state: running ? 'running' : 'stopped' }));
    });
    vi.stubGlobal('fetch', fetch);
    return fetch;
  }

  it.each([
    'title',
    'character',
  ] as const)('stops a running world during %s setup', async (phase) => {
    const fetch = setup('village', true);
    useUiStore.setState({ gamePhase: phase });
    await useWorldStore.getState().syncAgentLoopForPhase();
    expect(fetch.mock.calls.some(([url]) => url.includes('/stop'))).toBe(true);
    expect(fetch.mock.calls.some(([url]) => url.includes('/start'))).toBe(false);
    expect(useWorldStore.getState().agentLoopRunning).toBe(false);
  });

  it('starts on entering play and leaves a running clock alone', async () => {
    const fetch = setup('village', false);
    useUiStore.setState({ gamePhase: 'playing' });
    await useWorldStore.getState().syncAgentLoopForPhase();
    await useWorldStore.getState().syncAgentLoopForPhase();
    expect(fetch.mock.calls.filter(([url]) => url.includes('/start'))).toHaveLength(1);
    expect(useWorldStore.getState().agentLoopRunning).toBe(true);
  });

  it('preserves the Rival tutorial hold after entering play', async () => {
    const fetch = setup('rival_duel', false);
    useUiStore.setState({ gamePhase: 'playing' });
    await useWorldStore.getState().syncAgentLoopForPhase();
    expect(fetch.mock.calls.some(([url]) => url.includes('/start'))).toBe(false);
    expect(useWorldStore.getState().agentLoopRunning).toBe(false);
  });
});

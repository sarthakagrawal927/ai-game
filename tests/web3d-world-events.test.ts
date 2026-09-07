import { describe, expect, it } from 'vitest';
import { mergeWorldEvents, type WorldEvent } from '../web3d/src/store/world.ts';

const event = (id: number, text = 'Bram forgot to open the forge.'): WorldEvent => ({
  id,
  text,
  actorId: `npc-${id}`,
  actionType: 'gossip',
  fromDirector: false,
  expiresAt: 6000,
});

describe('recent world notices', () => {
  it('collapses repeated ambient text across NPCs without extending its expiry', () => {
    expect(
      mergeWorldEvents([event(1)], [event(2), { ...event(3), expiresAt: 7000 }], 1000)
    ).toEqual([event(1)]);
  });
  it('retains every unique notice, including director events beyond the old five-item limit', () => {
    const events = Array.from({ length: 8 }, (_, i) => event(i, `Unique event ${i}`));
    const important = { ...event(9, 'Unique event 0'), fromDirector: true };
    expect(mergeWorldEvents(events, [important], 1000)).toEqual([...events, important]);
  });
  it('expires old notices and allows a later occurrence', () => {
    const next = { ...event(2), expiresAt: 12000 };
    expect(mergeWorldEvents([event(1)], [next], 6001)).toEqual([next]);
  });
});

import { useEffect, useState } from 'react';

import { useLocalBrain } from '../ai/local-llm.ts';
import { fetchDialogueHistory } from '../api/client.ts';
import { useWorldStore } from '../store/world.ts';

/**
 * Frontier legibility HUD: NPC count + the active dialogue compute backend, with
 * server mode reported by the read-only dialogue endpoint. Configuration is
 * not proof that a model has produced a successful reply.
 * (FPS now lives in the dedicated corner <FpsCounter />.)
 */
export function FrontierHud(): React.ReactElement {
  const world = useWorldStore((state) => state.world);
  const npcCount = world?.npcs.length ?? 0;
  const worldId = world?.id;
  const npcId = world?.npcs.find((npc) => !npc.combat?.defeated)?.id;
  const brainStatus = useLocalBrain((state) => state.status);
  const [reported, setReported] = useState<{
    worldId: string | undefined;
    npcId: string;
    llm: boolean | null;
  } | null>(null);

  useEffect(() => {
    if (!npcId) return undefined;
    let cancelled = false;
    void fetchDialogueHistory(npcId)
      .then((response) => {
        if (!cancelled)
          setReported({
            worldId,
            npcId,
            llm: typeof response.llm === 'boolean' ? response.llm : null,
          });
      })
      .catch(() => {
        if (!cancelled) setReported({ worldId, npcId, llm: null });
      });
    return () => {
      cancelled = true;
    };
  }, [worldId, npcId]);

  const local = brainStatus === 'ready' || brainStatus === 'generating';
  const serverLlm =
    reported?.worldId === worldId && reported?.npcId === npcId ? reported?.llm : null;
  const backend = local
    ? 'WebGPU · local'
    : serverLlm === false
      ? 'Scripted dialogue'
      : serverLlm === true
        ? 'Server AI configured'
        : 'Dialogue mode unknown';

  return (
    <div className="frontier-hud" title="Frontier capability readout">
      <span className="fh-stat">{npcCount} NPCs</span>
      <span className="fh-sep">·</span>
      <span className={`fh-backend ${local ? 'local' : ''}`}>{backend}</span>
      {local ? <span className="fh-badge">on-device</span> : null}
    </div>
  );
}

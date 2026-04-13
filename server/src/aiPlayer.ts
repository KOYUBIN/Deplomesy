import type { GameState, Territory, UnitType, Faction } from './types';
import { UNIT_DEFS } from './mapData';
import { moveArmies, recruitUnits, setDiplomacy, endTurn, canMoveTo, totalAttack, totalDefense, totalCount, movableCount } from './gameLogic';

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

// ── Unit selection ───────────────────────────────────────────────────────────

function bestUnitToBuy(faction: Faction, minerals: number): UnitType | null {
  const prio: Record<Faction, UnitType[]> = {
    terran:      ['siege_tank', 'viking', 'marine', 'bunker', 'archer', 'infantry'],
    zerg:        ['hydralisk', 'mutalisk', 'zergling', 'spine_crawler', 'archer', 'infantry'],
    protoss:     ['dragoon', 'phoenix', 'zealot', 'photon_cannon', 'archer', 'infantry'],
    tal_darim:   ['void_ray', 'fanatical', 'tal_archon', 'xel_naga_tower', 'archer', 'infantry'],
    primal_zerg: ['leviathan', 'primal_raptor', 'primal_zergling', 'primal_pit', 'archer', 'infantry'],
    nerazim:     ['dark_templar', 'stalker', 'oracle', 'void_gate', 'archer', 'infantry'],
  };

  for (const type of prio[faction]) {
    const def = UNIT_DEFS[type];
    if (def.faction && def.faction !== faction) continue;
    if (def.cost <= minerals) return type;
  }
  return null;
}

// ── Move selection ───────────────────────────────────────────────────────────

function getBestAttack(state: GameState, pid: number): { fromId: number; toId: number } | null {
  const { territories, players } = state;
  let bestScore = -Infinity;
  let best: { fromId: number; toId: number } | null = null;

  for (const from of territories.filter((t) => t.ownerId === pid && movableCount(t.units) >= 2)) {
    for (const toId of from.adjacentIds) {
      if (!canMoveTo(territories, players, from.id, toId, pid)) continue;
      const to = territories[toId];
      if (to.ownerId === pid) continue;
      const score = to.minerals * 2 - totalDefense(to.units) + (to.ownerId === null ? 2 : 0);
      if (score > bestScore) { bestScore = score; best = { fromId: from.id, toId }; }
    }
  }
  return best;
}

function getBestReinforce(state: GameState, pid: number): { fromId: number; toId: number } | null {
  const { territories } = state;
  for (const from of territories.filter((t) => t.ownerId === pid && movableCount(t.units) >= 2)) {
    const allSafe = from.adjacentIds.every((adjId) => {
      const adj = territories[adjId];
      return adj.ownerId === null || adj.ownerId === pid ||
        state.players[pid].diplomacy[adj.ownerId] === 'ally';
    });
    if (!allSafe) continue;

    for (const toId of from.adjacentIds) {
      const to = territories[toId];
      if (to.ownerId !== pid) continue;
      const exposed = to.adjacentIds.some((adjId) => {
        const adj = territories[adjId];
        return adj.ownerId !== null && adj.ownerId !== pid &&
          state.players[pid].diplomacy[adj.ownerId] !== 'ally';
      });
      if (exposed) return { fromId: from.id, toId };
    }
  }
  return null;
}

function getDiplomacyAction(
  state: GameState,
  pid: number
): { targetId: number; status: import('./types').DiplomacyStatus } | null {
  const { players, territories } = state;
  const myCount = territories.filter((t) => t.ownerId === pid).length;
  const alive = players.filter((p) => p.isAlive && p.id !== pid);
  if (alive.length === 0) return null;

  const ranked = alive
    .map((p) => ({ p, count: territories.filter((t) => t.ownerId === p.id).length }))
    .sort((a, b) => b.count - a.count);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  if (strongest.count > myCount && players[pid].diplomacy[strongest.p.id] !== 'war' && Math.random() < 0.3)
    return { targetId: strongest.p.id, status: 'war' };

  if (weakest.p.id !== strongest.p.id && players[pid].diplomacy[weakest.p.id] === 'neutral' && Math.random() < 0.35)
    return { targetId: weakest.p.id, status: 'ally' };

  return null;
}

function getBestRecruitTerritory(state: GameState, pid: number): Territory | null {
  const myTerrs = state.territories.filter((t) => t.ownerId === pid);
  let best: Territory | null = null;
  let maxScore = -1;
  for (const t of myTerrs) {
    const enemyAdj = t.adjacentIds.filter((adjId) => {
      const adj = state.territories[adjId];
      return adj.ownerId !== null && adj.ownerId !== pid &&
        state.players[pid].diplomacy[adj.ownerId] !== 'ally';
    }).length;
    if (enemyAdj > maxScore) { maxScore = enemyAdj; best = t; }
  }
  return best ?? (myTerrs.length > 0 ? myTerrs[0] : null);
}

// ── Main AI loop ─────────────────────────────────────────────────────────────

export async function runAITurns(
  state: GameState,
  onUpdate: (s: GameState) => void
): Promise<GameState> {
  let s = state;

  while (s.phase === 'playing' && s.players[s.currentPlayerId].isAI) {
    await sleep(350);
    const pid = s.currentPlayerId;
    const faction = s.players[pid].faction;

    // 1. Diplomacy
    const dip = getDiplomacyAction(s, pid);
    if (dip) s = setDiplomacy(s, dip.targetId, dip.status);

    // 2. Recruit best available units
    const recruitTerritory = getBestRecruitTerritory(s, pid);
    if (recruitTerritory) {
      let minerals = s.players[pid].minerals;
      while (minerals >= 1) {
        const unitType = bestUnitToBuy(faction, minerals);
        if (!unitType) break;
        s = recruitUnits(s, recruitTerritory.id, unitType, 1);
        minerals = s.players[pid].minerals;
      }
    }

    await sleep(200);

    // 3. Attack or reinforce
    const attack = getBestAttack(s, pid);
    if (attack) {
      s = moveArmies(s, attack.fromId, attack.toId);
    } else {
      const reinforce = getBestReinforce(s, pid);
      if (reinforce) s = moveArmies(s, reinforce.fromId, reinforce.toId);
    }

    await sleep(300);
    s = endTurn(s);
    onUpdate({ ...s });
  }

  return s;
}

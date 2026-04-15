import type { GameState, Territory, UnitType, Faction } from './types';
import { UNIT_DEFS, TECH_DEFS } from './mapData';
import { moveArmies, recruitUnits, setDiplomacy, endTurn, canMoveTo, totalAttack, totalDefense, totalCount, movableCount, supplyCap, usedSupply, researchTech } from './gameLogic';

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

// ── Unit selection ───────────────────────────────────────────────────────────

function bestUnitToBuy(
  faction: Faction,
  minerals: number,
  gas: number,
  techs: string[]
): UnitType | null {
  const prio: Record<Faction, UnitType[]> = {
    terran:      ['siege_tank', 'viking', 'marine', 'bunker', 'archer', 'infantry'],
    zerg:        ['hydralisk', 'mutalisk', 'zergling', 'spine_crawler', 'archer', 'infantry'],
    protoss:     ['dragoon', 'phoenix', 'zealot', 'photon_cannon', 'archer', 'infantry'],
    tal_darim:   ['void_ray', 'tal_archon', 'fanatical', 'xel_naga_tower', 'archer', 'infantry'],
    primal_zerg: ['leviathan', 'primal_raptor', 'primal_zergling', 'primal_pit', 'archer', 'infantry'],
    nerazim:     ['stalker', 'oracle', 'dark_templar', 'void_gate', 'archer', 'infantry'],
    ued:         ['battlecruiser', 'science_vessel', 'ghost', 'missile_turret', 'archer', 'infantry'],
    raiders:     ['firebat', 'dropship', 'vulture', 'raiders_bunker', 'archer', 'infantry'],
    confederacy: ['wraith', 'confederate_ghost', 'goliath', 'nuke_silo', 'archer', 'infantry'],
  };

  for (const type of prio[faction]) {
    const def = UNIT_DEFS[type];
    if (def.faction && def.faction !== faction) continue;
    if (def.cost > minerals) continue;
    if ((def.gasCost ?? 0) > gas) continue;
    if (def.requiredTech && !techs.includes(def.requiredTech)) continue;
    return type;
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
      const score = to.minerals * 2 + to.gasYield * 3 - totalDefense(to.units) + (to.ownerId === null ? 2 : 0);
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

    // 2. Research next available tech (faction or upgrade, probabilistic)
    const nextTech = TECH_DEFS.find((t) => {
      if (t.faction && t.faction !== faction) return false;
      if (!t.faction && Math.random() > 0.4) return false; // upgrades less eagerly
      if (s.players[pid].techs.includes(t.id)) return false;
      if (t.requires && !s.players[pid].techs.includes(t.requires)) return false;
      return s.players[pid].minerals >= t.mineralCost && s.players[pid].gas >= t.gasCost;
    });
    if (nextTech) s = researchTech(s, nextTech.id);

    // 3. Recruit best available units (respecting supply + gas)
    const recruitTerritory = getBestRecruitTerritory(s, pid);
    if (recruitTerritory) {
      let minerals = s.players[pid].minerals;
      while (minerals >= 1) {
        const cap = supplyCap(s.territories, pid);
        const used = usedSupply(s.territories, pid);
        if (used >= cap) break;
        const unitType = bestUnitToBuy(faction, minerals, s.players[pid].gas, s.players[pid].techs);
        if (!unitType) break;
        s = recruitUnits(s, recruitTerritory.id, unitType, 1);
        minerals = s.players[pid].minerals;
      }
    }

    await sleep(200);

    // 4. Attack or reinforce
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

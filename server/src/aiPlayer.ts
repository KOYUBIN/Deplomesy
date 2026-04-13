import type { GameState, Territory } from './types';
import { moveArmies, recruitArmies, setDiplomacy, endTurn, canMoveTo } from './gameLogic';

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

function getBestAttack(state: GameState, pid: number): { fromId: number; toId: number } | null {
  const { territories, players } = state;
  let bestScore = -Infinity;
  let best: { fromId: number; toId: number } | null = null;

  for (const from of territories.filter((t) => t.ownerId === pid && t.armies >= 2)) {
    for (const toId of from.adjacentIds) {
      if (!canMoveTo(territories, players, from.id, toId, pid)) continue;
      const to = territories[toId];
      if (to.ownerId === pid) continue;
      const score = to.minerals * 2 - to.armies + (to.ownerId === null ? 1 : 0);
      if (score > bestScore) { bestScore = score; best = { fromId: from.id, toId }; }
    }
  }
  return best;
}

function getBestReinforce(state: GameState, pid: number): { fromId: number; toId: number } | null {
  const { territories } = state;
  for (const from of territories.filter((t) => t.ownerId === pid && t.armies >= 2)) {
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

  if (strongest.count > myCount && players[pid].diplomacy[strongest.p.id] !== 'war' && Math.random() < 0.3) {
    return { targetId: strongest.p.id, status: 'war' };
  }
  if (weakest.p.id !== strongest.p.id && players[pid].diplomacy[weakest.p.id] === 'neutral' && Math.random() < 0.4) {
    return { targetId: weakest.p.id, status: 'ally' };
  }
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
  return best;
}

export async function runAITurns(
  state: GameState,
  onUpdate: (s: GameState) => void
): Promise<GameState> {
  let s = state;

  while (s.phase === 'playing' && s.players[s.currentPlayerId].isAI) {
    await sleep(350);
    const pid = s.currentPlayerId;

    // Diplomacy
    const dip = getDiplomacyAction(s, pid);
    if (dip) s = setDiplomacy(s, dip.targetId, dip.status);

    // Recruit
    const canRecruit = Math.floor(s.players[pid].minerals / 2);
    if (canRecruit > 0) {
      const t = getBestRecruitTerritory(s, pid);
      if (t) s = recruitArmies(s, t.id, canRecruit);
    }

    await sleep(200);

    // Move/Attack
    const attack = getBestAttack(s, pid);
    if (attack) {
      s = moveArmies(s, attack.fromId, attack.toId);
    } else {
      const reinforce = getBestReinforce(s, pid);
      if (reinforce) s = moveArmies(s, reinforce.fromId, reinforce.toId);
    }

    await sleep(250);
    s = endTurn(s);
    onUpdate({ ...s });
  }

  return s;
}

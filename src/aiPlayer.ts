/**
 * Simple AI decision-making.
 * Each AI player:
 *  1. Tries to attack the weakest adjacent enemy territory
 *  2. Recruits armies when it can afford it
 *  3. Forms alliances with weaker players, declares war on strong players
 */

import type { GameState, Territory } from './types';
import { moveArmies, recruitArmies, setDiplomacy, endTurn, canMoveTo } from './gameLogic';

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

function getBestAttack(
  state: GameState,
  playerId: number
): { fromId: number; toId: number } | null {
  const { territories, players } = state;
  const myTerrs = territories.filter((t) => t.ownerId === playerId && t.armies >= 2);

  let bestScore = -Infinity;
  let best: { fromId: number; toId: number } | null = null;

  for (const from of myTerrs) {
    for (const toId of from.adjacentIds) {
      const to = territories[toId];
      if (!canMoveTo(territories, players, from.id, toId, playerId)) continue;
      if (to.ownerId === playerId) continue; // skip own territory for attack

      // Score: prefer weak enemies, prefer resource-rich territories
      const score = to.minerals * 2 - to.armies + (to.ownerId === null ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { fromId: from.id, toId };
      }
    }
  }
  return best;
}

function getBestReinforce(
  state: GameState,
  playerId: number
): { fromId: number; toId: number } | null {
  const { territories } = state;
  // Move armies from safe interior territories toward contested border
  const myTerrs = territories.filter((t) => t.ownerId === playerId && t.armies >= 2);

  for (const from of myTerrs) {
    // Is this territory in no danger? Check if all neighbors are mine or allies
    const allSafe = from.adjacentIds.every((adjId) => {
      const adj = territories[adjId];
      if (adj.ownerId === null) return false;
      if (adj.ownerId === playerId) return true;
      return state.players[playerId].diplomacy[adj.ownerId] === 'ally';
    });
    if (!allSafe) continue;

    // Find adjacent own territory that IS exposed
    for (const toId of from.adjacentIds) {
      const to = territories[toId];
      if (to.ownerId !== playerId) continue;
      const exposed = to.adjacentIds.some((adjId) => {
        const adj = territories[adjId];
        return adj.ownerId !== null && adj.ownerId !== playerId &&
          state.players[playerId].diplomacy[adj.ownerId] !== 'ally';
      });
      if (exposed) return { fromId: from.id, toId };
    }
  }
  return null;
}

function getDiplomacyAction(
  state: GameState,
  playerId: number
): { targetId: number; status: import('./types').DiplomacyStatus } | null {
  const { players, territories } = state;
  const myCount = territories.filter((t) => t.ownerId === playerId).length;
  const alive = players.filter((p) => p.isAlive && p.id !== playerId);
  if (alive.length === 0) return null;

  // Sort by power
  const ranked = alive
    .map((p) => ({ p, count: territories.filter((t) => t.ownerId === p.id).length }))
    .sort((a, b) => b.count - a.count);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  // Declare war on the strongest if we're also strong
  if (
    strongest.count > myCount &&
    players[playerId].diplomacy[strongest.p.id] !== 'war' &&
    Math.random() < 0.3
  ) {
    return { targetId: strongest.p.id, status: 'war' };
  }

  // Form alliance with the weakest
  if (
    weakest.p.id !== strongest.p.id &&
    players[playerId].diplomacy[weakest.p.id] === 'neutral' &&
    Math.random() < 0.4
  ) {
    return { targetId: weakest.p.id, status: 'ally' };
  }

  return null;
}

/**
 * Run AI turns until we reach the human player (id=0) or the game ends.
 * Returns the updated state.
 */
export async function runAITurns(
  state: GameState,
  onUpdate: (s: GameState) => void
): Promise<GameState> {
  let s = state;

  while (s.phase === 'playing' && s.players[s.currentPlayerId].isAI) {
    await sleep(400);

    const pid = s.currentPlayerId;

    // 1. Diplomacy
    const dipAction = getDiplomacyAction(s, pid);
    if (dipAction) {
      s = setDiplomacy(s, dipAction.targetId, dipAction.status);
    }

    // 2. Recruit if affordable
    const myTerrs = s.territories.filter((t) => t.ownerId === pid);
    if (s.players[pid].minerals >= 2 && myTerrs.length > 0) {
      const count = Math.floor(s.players[pid].minerals / 2);
      // Recruit in the territory with the most adjacent enemies
      let bestTerritory: Territory | null = null;
      let maxEnemyAdj = -1;
      for (const t of myTerrs) {
        const enemyAdj = t.adjacentIds.filter((adjId) => {
          const adj = s.territories[adjId];
          return adj.ownerId !== null && adj.ownerId !== pid &&
            s.players[pid].diplomacy[adj.ownerId] !== 'ally';
        }).length;
        if (enemyAdj > maxEnemyAdj) {
          maxEnemyAdj = enemyAdj;
          bestTerritory = t;
        }
      }
      if (bestTerritory) {
        s = recruitArmies(s, bestTerritory.id, count);
      }
    }

    await sleep(200);

    // 3. Attack or reinforce
    const attack = getBestAttack(s, pid);
    if (attack) {
      s = moveArmies(s, attack.fromId, attack.toId);
    } else {
      const reinforce = getBestReinforce(s, pid);
      if (reinforce) {
        s = moveArmies(s, reinforce.fromId, reinforce.toId);
      }
    }

    await sleep(300);

    // 4. End turn
    s = endTurn(s);
    onUpdate({ ...s });
  }

  return s;
}

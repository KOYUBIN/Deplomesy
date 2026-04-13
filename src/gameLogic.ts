import type { GameState, Player, Territory, Faction, SetupConfig } from './types';
import {
  INITIAL_TERRITORIES,
  PLAYER_STARTS,
  PLAYER_COLORS,
  AI_NAMES,
  WIN_THRESHOLD,
} from './mapData';

// ── helpers ────────────────────────────────────────────────────────────────

function pickAIName(faction: Faction, existingNames: string[]): string {
  const pool = AI_NAMES[faction];
  const available = pool.filter((n) => !existingNames.includes(n));
  return available.length > 0 ? available[0] : `AI-${faction}`;
}

const AI_FACTIONS: Faction[] = ['terran', 'zerg', 'protoss', 'zerg', 'terran', 'protoss'];

// ── initialise ─────────────────────────────────────────────────────────────

export function createInitialState(cfg: SetupConfig): GameState {
  const territories: Territory[] = INITIAL_TERRITORIES.map((t) => ({ ...t }));
  const players: Player[] = [];
  const takenNames: string[] = [cfg.playerName];

  for (let i = 0; i < cfg.playerCount; i++) {
    const isHuman = i === 0;
    const faction: Faction = isHuman ? cfg.playerFaction : AI_FACTIONS[i % AI_FACTIONS.length];
    const name = isHuman ? cfg.playerName : pickAIName(faction, takenNames);
    takenNames.push(name);

    const diplomacy: Record<number, import('./types').DiplomacyStatus> = {};
    for (let j = 0; j < cfg.playerCount; j++) {
      if (j !== i) diplomacy[j] = 'neutral';
    }

    players.push({
      id: i,
      name,
      faction,
      minerals: 5,
      isAI: !isHuman,
      isAlive: true,
      color: PLAYER_COLORS[i],
      diplomacy,
    });

    // Place starting armies
    const startTid = PLAYER_STARTS[i];
    territories[startTid].ownerId = i;
    territories[startTid].armies = 3;
  }

  return {
    phase: 'playing',
    turn: 1,
    currentPlayerId: 0,
    players,
    territories,
    log: ['게임 시작! 플레이어 1의 턴.'],
    winner: null,
    actionMode: 'none',
    selectedTerritoryId: null,
    moveFrom: null,
  };
}

// ── queries ────────────────────────────────────────────────────────────────

export function getPlayerTerritories(territories: Territory[], playerId: number): Territory[] {
  return territories.filter((t) => t.ownerId === playerId);
}

export function countTerritories(territories: Territory[], playerId: number): number {
  return territories.filter((t) => t.ownerId === playerId).length;
}

export function checkWinner(state: GameState): number | null {
  for (const p of state.players) {
    if (!p.isAlive) continue;
    if (countTerritories(state.territories, p.id) >= WIN_THRESHOLD) return p.id;
  }
  const alive = state.players.filter((p) => p.isAlive);
  if (alive.length === 1) return alive[0].id;
  return null;
}

export function canMoveTo(
  territories: Territory[],
  players: Player[],
  fromId: number,
  toId: number,
  currentPlayerId: number
): boolean {
  const from = territories[fromId];
  const to = territories[toId];
  if (!from.adjacentIds.includes(toId)) return false;
  if (from.ownerId !== currentPlayerId) return false;
  if (from.armies < 2) return false; // need to leave 1 behind

  const toOwner = to.ownerId;
  if (toOwner === null) return true; // neutral
  if (toOwner === currentPlayerId) return true; // reinforce

  const relation = players[currentPlayerId].diplomacy[toOwner];
  return relation !== 'ally'; // can't attack ally
}

// ── actions ────────────────────────────────────────────────────────────────

/** Move all movable armies from `from` to `to`. Returns new state. */
export function moveArmies(
  state: GameState,
  fromId: number,
  toId: number
): GameState {
  const territories = state.territories.map((t) => ({ ...t }));
  const players = state.players.map((p) => ({ ...p, diplomacy: { ...p.diplomacy } }));
  const log = [...state.log];

  const from = territories[fromId];
  const to = territories[toId];
  const moving = from.armies - 1; // always leave 1

  from.armies = 1;

  if (to.ownerId === null || to.ownerId === state.currentPlayerId) {
    // Move into neutral or own territory
    to.ownerId = state.currentPlayerId;
    to.armies += moving;
    log.push(
      `${players[state.currentPlayerId].name}: ${from.name} → ${to.name} (${moving}군)`
    );
  } else {
    // Attack!
    const defender = to.ownerId;
    const defBonus = players[defender].faction === 'terran' ? 1 : 0;
    const atkBonus = players[state.currentPlayerId].faction === 'protoss' ? 1 : 0;
    const atkStr = moving + atkBonus;
    const defStr = to.armies + defBonus;

    if (atkStr > defStr) {
      const remaining = atkStr - defStr - atkBonus; // subtract bonus (not real units)
      to.ownerId = state.currentPlayerId;
      to.armies = Math.max(1, remaining);
      log.push(
        `⚔ ${players[state.currentPlayerId].name}이(가) ${to.name}을(를) 점령! (${moving}vs${to.armies}, 잔여 ${to.armies})`
      );
      // Declare war automatically
      players[state.currentPlayerId].diplomacy[defender] = 'war';
      players[defender].diplomacy[state.currentPlayerId] = 'war';
    } else {
      const remaining = defStr - atkStr;
      to.armies = Math.max(1, remaining - defBonus);
      log.push(
        `🛡 ${to.name} 방어 성공! (${players[defender].name} 방어)`
      );
    }
  }

  // Zerg regeneration: +1 per owned territory (applied on end turn, see below)

  return {
    ...state,
    territories,
    players,
    log,
    actionMode: 'none',
    selectedTerritoryId: null,
    moveFrom: null,
  };
}

/** Recruit armies in a territory. Cost: 2 minerals per army. */
export function recruitArmies(
  state: GameState,
  territoryId: number,
  count: number
): GameState {
  const cost = count * 2;
  const player = state.players[state.currentPlayerId];
  if (player.minerals < cost) return state;
  if (state.territories[territoryId].ownerId !== state.currentPlayerId) return state;

  const territories = state.territories.map((t) => ({ ...t }));
  const players = state.players.map((p) => ({ ...p }));
  territories[territoryId].armies += count;
  players[state.currentPlayerId] = { ...player, minerals: player.minerals - cost };

  return {
    ...state,
    territories,
    players,
    log: [
      ...state.log,
      `${player.name}: ${territories[territoryId].name}에 ${count}군 징집 (-${cost}미네랄)`,
    ],
  };
}

/** Change diplomacy status toward another player. */
export function setDiplomacy(
  state: GameState,
  targetId: number,
  status: import('./types').DiplomacyStatus
): GameState {
  const players = state.players.map((p) => ({
    ...p,
    diplomacy: { ...p.diplomacy },
  }));
  const current = state.currentPlayerId;
  players[current].diplomacy[targetId] = status;

  // If forming ally, the other side accepts (simplified – mutual)
  if (status === 'ally') {
    players[targetId].diplomacy[current] = 'ally';
  }
  // If declaring war, mutual
  if (status === 'war') {
    players[targetId].diplomacy[current] = 'war';
  }

  const label =
    status === 'ally' ? '동맹' : status === 'neutral' ? '중립' : '전쟁 선포';
  return {
    ...state,
    players,
    log: [
      ...state.log,
      `${players[current].name} → ${players[targetId].name}: ${label}`,
    ],
  };
}

// ── end turn ───────────────────────────────────────────────────────────────

/** Collect resources and advance to next player. */
export function endTurn(state: GameState): GameState {
  const players = state.players.map((p) => ({ ...p }));
  const territories = state.territories.map((t) => ({ ...t }));
  const log = [...state.log];
  const current = state.currentPlayerId;

  // 1. Collect minerals for current player
  let income = 0;
  for (const t of territories) {
    if (t.ownerId === current) income += t.minerals;
  }
  players[current].minerals += income;

  // 2. Zerg regen: +1 army per owned territory (max 5 per territory)
  if (players[current].faction === 'zerg') {
    for (const t of territories) {
      if (t.ownerId === current && t.armies < 5) {
        t.armies += 1;
      }
    }
  }

  // 3. Check if current player is dead
  const myTerr = territories.filter((t) => t.ownerId === current);
  if (myTerr.length === 0) {
    players[current].isAlive = false;
    log.push(`☠ ${players[current].name} 탈락!`);
  }

  // 4. Find next alive player
  const total = players.length;
  let next = (current + 1) % total;
  let loops = 0;
  while (!players[next].isAlive && loops < total) {
    next = (next + 1) % total;
    loops++;
  }

  const newTurn = next <= current ? state.turn + 1 : state.turn;
  if (next === 0 || (next < current && state.turn > 1)) {
    log.push(`─── 턴 ${newTurn} ───`);
  }

  const newState: GameState = {
    ...state,
    players,
    territories,
    log,
    turn: newTurn,
    currentPlayerId: next,
    actionMode: 'none',
    selectedTerritoryId: null,
    moveFrom: null,
  };

  const winner = checkWinner(newState);
  if (winner !== null) {
    return { ...newState, phase: 'ended', winner };
  }

  return newState;
}

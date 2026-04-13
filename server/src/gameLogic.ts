import type { GameState, Player, Territory, DiplomacyStatus, PlayerSetup } from './types';
import { INITIAL_TERRITORIES, PLAYER_STARTS, PLAYER_COLORS, WIN_THRESHOLD } from './mapData';

// ── initialise ─────────────────────────────────────────────────────────────

export function createInitialState(playerSetups: PlayerSetup[]): GameState {
  const territories: Territory[] = INITIAL_TERRITORIES.map((t) => ({ ...t }));
  const players: Player[] = playerSetups.map((setup, i) => {
    const diplomacy: Record<number, DiplomacyStatus> = {};
    for (let j = 0; j < playerSetups.length; j++) {
      if (j !== i) diplomacy[j] = 'neutral';
    }
    return {
      id: i,
      name: setup.name,
      faction: setup.faction,
      minerals: 5,
      isAI: setup.isAI,
      isAlive: true,
      color: PLAYER_COLORS[i],
      diplomacy,
    };
  });

  for (let i = 0; i < playerSetups.length; i++) {
    const tid = PLAYER_STARTS[i];
    territories[tid].ownerId = i;
    territories[tid].armies = 3;
  }

  return {
    phase: 'playing',
    turn: 1,
    currentPlayerId: 0,
    players,
    territories,
    log: ['게임 시작! 1턴.'],
    winner: null,
  };
}

// ── queries ────────────────────────────────────────────────────────────────

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
  if (from.armies < 2) return false;
  const toOwner = to.ownerId;
  if (toOwner === null) return true;
  if (toOwner === currentPlayerId) return true;
  return players[currentPlayerId].diplomacy[toOwner] !== 'ally';
}

export function checkWinner(state: GameState): number | null {
  for (const p of state.players) {
    if (!p.isAlive) continue;
    if (state.territories.filter((t) => t.ownerId === p.id).length >= WIN_THRESHOLD) return p.id;
  }
  const alive = state.players.filter((p) => p.isAlive);
  if (alive.length === 1) return alive[0].id;
  return null;
}

// ── actions ────────────────────────────────────────────────────────────────

export function moveArmies(state: GameState, fromId: number, toId: number): GameState {
  const pid = state.currentPlayerId;
  if (!canMoveTo(state.territories, state.players, fromId, toId, pid)) return state;

  const territories = state.territories.map((t) => ({ ...t }));
  const players = state.players.map((p) => ({ ...p, diplomacy: { ...p.diplomacy } }));
  const log = [...state.log];

  const from = territories[fromId];
  const to = territories[toId];
  const moving = from.armies - 1;
  from.armies = 1;

  if (to.ownerId === null || to.ownerId === pid) {
    to.ownerId = pid;
    to.armies += moving;
    log.push(`${players[pid].name}: ${from.name} → ${to.name} (${moving}군)`);
  } else {
    const defender = to.ownerId;
    const defBonus = players[defender].faction === 'terran' ? 1 : 0;
    const atkBonus = players[pid].faction === 'protoss' ? 1 : 0;
    const atkStr = moving + atkBonus;
    const defStr = to.armies + defBonus;

    if (atkStr > defStr) {
      const remaining = Math.max(1, moving - defStr);
      to.ownerId = pid;
      to.armies = remaining;
      log.push(`⚔ ${players[pid].name}이(가) ${to.name} 점령! (${moving}vs${to.armies})`);
      players[pid].diplomacy[defender] = 'war';
      players[defender].diplomacy[pid] = 'war';
    } else {
      to.armies = Math.max(1, to.armies - moving);
      log.push(`🛡 ${to.name} 방어 성공! (${players[defender].name})`);
    }
  }

  return { ...state, territories, players, log };
}

export function recruitArmies(state: GameState, territoryId: number, count: number): GameState {
  const pid = state.currentPlayerId;
  const cost = count * 2;
  const player = state.players[pid];
  if (player.minerals < cost) return state;
  if (state.territories[territoryId].ownerId !== pid) return state;

  const territories = state.territories.map((t) => ({ ...t }));
  const players = state.players.map((p) => ({ ...p }));
  territories[territoryId].armies += count;
  players[pid] = { ...player, minerals: player.minerals - cost };

  return {
    ...state,
    territories,
    players,
    log: [...state.log, `${player.name}: ${territories[territoryId].name}에 ${count}군 징집 (-${cost}💎)`],
  };
}

export function setDiplomacy(
  state: GameState,
  targetId: number,
  status: DiplomacyStatus
): GameState {
  const pid = state.currentPlayerId;
  const players = state.players.map((p) => ({ ...p, diplomacy: { ...p.diplomacy } }));
  players[pid].diplomacy[targetId] = status;
  if (status === 'ally') players[targetId].diplomacy[pid] = 'ally';
  if (status === 'war')  players[targetId].diplomacy[pid] = 'war';

  const label = status === 'ally' ? '동맹' : status === 'neutral' ? '중립' : '전쟁 선포';
  return {
    ...state,
    players,
    log: [...state.log, `${players[pid].name} → ${players[targetId].name}: ${label}`],
  };
}

export function endTurn(state: GameState): GameState {
  const players = state.players.map((p) => ({ ...p }));
  const territories = state.territories.map((t) => ({ ...t }));
  const log = [...state.log];
  const current = state.currentPlayerId;

  // Collect income
  let income = 0;
  for (const t of territories) {
    if (t.ownerId === current) income += t.minerals;
  }
  players[current].minerals += income;

  // Zerg regen
  if (players[current].faction === 'zerg') {
    for (const t of territories) {
      if (t.ownerId === current && t.armies < 5) t.armies += 1;
    }
  }

  // Check if eliminated
  if (territories.filter((t) => t.ownerId === current).length === 0) {
    players[current].isAlive = false;
    log.push(`☠ ${players[current].name} 탈락!`);
  }

  // Advance to next alive player
  const total = players.length;
  let next = (current + 1) % total;
  let loops = 0;
  while (!players[next].isAlive && loops < total) {
    next = (next + 1) % total;
    loops++;
  }

  const newTurn = next <= current ? state.turn + 1 : state.turn;
  if (next <= current) log.push(`─── 턴 ${newTurn} ───`);

  const newState: GameState = {
    ...state,
    players,
    territories,
    log,
    turn: newTurn,
    currentPlayerId: next,
  };

  const winner = checkWinner(newState);
  if (winner !== null) return { ...newState, phase: 'ended', winner };
  return newState;
}

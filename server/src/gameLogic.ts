import type { GameState, Player, Territory, DiplomacyStatus, PlayerSetup, UnitType, UnitCount } from './types';
import { INITIAL_TERRITORIES, PLAYER_STARTS, PLAYER_COLORS, WIN_THRESHOLD, UNIT_DEFS } from './mapData';

// ── Unit helpers ────────────────────────────────────────────────────────────

export function totalAttack(units: UnitCount[]): number {
  return units.reduce((s, u) => s + UNIT_DEFS[u.type].attack * u.count, 0);
}

export function totalDefense(units: UnitCount[]): number {
  return units.reduce((s, u) => s + UNIT_DEFS[u.type].defense * u.count, 0);
}

export function totalCount(units: UnitCount[]): number {
  return units.reduce((s, u) => s + u.count, 0);
}

/** Count of non-structure units (units that can potentially move). */
export function movableCount(units: UnitCount[]): number {
  return units.reduce((s, u) => s + (UNIT_DEFS[u.type].isStructure ? 0 : u.count), 0);
}

function mergeUnits(target: UnitCount[], incoming: UnitCount[]): void {
  for (const inc of incoming) {
    const existing = target.find((u) => u.type === inc.type);
    if (existing) existing.count += inc.count;
    else target.push({ ...inc });
  }
}

function deepUnits(units: UnitCount[]): UnitCount[] {
  return units.map((u) => ({ ...u }));
}

/** Remove cheapest units until remaining ATK (or DEF) = targetStr. */
function trimToStrength(units: UnitCount[], targetStr: number, mode: 'attack' | 'defense'): UnitCount[] {
  const result = deepUnits(units);
  const val = (t: UnitType) => (mode === 'attack' ? UNIT_DEFS[t].attack : UNIT_DEFS[t].defense);
  let cur = result.reduce((s, u) => s + val(u.type) * u.count, 0);

  // Sort types by value ascending (kill cheapest/weakest first)
  const types = [...new Set(result.map((u) => u.type))].sort((a, b) => val(a) - val(b));

  for (const type of types) {
    if (cur <= targetStr) break;
    const entry = result.find((u) => u.type === type);
    if (!entry) continue;
    const v = val(type);
    const toKill = Math.min(entry.count, Math.floor((cur - targetStr) / v));
    entry.count -= toKill;
    cur -= toKill * v;
  }
  return result.filter((u) => u.count > 0);
}

/**
 * Units that move out — all non-structure units, minus 1 cheapest non-structure left behind.
 * Structures NEVER move.
 */
function movingUnits(units: UnitCount[]): UnitCount[] {
  const nonStructures = units.filter((u) => !UNIT_DEFS[u.type].isStructure);
  if (totalCount(nonStructures) <= 1) return [];
  const result = deepUnits(nonStructures);
  const cheapestType = [...result].sort((a, b) => UNIT_DEFS[a.type].cost - UNIT_DEFS[b.type].cost)[0].type;
  const entry = result.find((u) => u.type === cheapestType)!;
  entry.count -= 1;
  return result.filter((u) => u.count > 0);
}

/**
 * Units that always stay behind: all structures + 1 cheapest non-structure unit.
 */
function stayingUnit(units: UnitCount[]): UnitCount[] {
  const structures = deepUnits(units.filter((u) => UNIT_DEFS[u.type].isStructure));
  const nonStructures = units.filter((u) => !UNIT_DEFS[u.type].isStructure);
  if (nonStructures.length === 0) return structures;
  const cheapest = [...nonStructures].sort((a, b) => UNIT_DEFS[a.type].cost - UNIT_DEFS[b.type].cost)[0];
  return [...structures, { type: cheapest.type, count: 1 }];
}

// ── Init ────────────────────────────────────────────────────────────────────

const FACTION_START_UNITS: Record<string, UnitCount[]> = {
  terran:      [{ type: 'infantry', count: 2 }, { type: 'marine', count: 1 }],
  zerg:        [{ type: 'zergling', count: 4 }],
  protoss:     [{ type: 'infantry', count: 1 }, { type: 'zealot', count: 1 }],
  tal_darim:   [{ type: 'infantry', count: 1 }, { type: 'fanatical', count: 1 }],
  primal_zerg: [{ type: 'primal_zergling', count: 3 }],
  nerazim:     [{ type: 'infantry', count: 1 }, { type: 'dark_templar', count: 1 }],
};

export function createInitialState(playerSetups: PlayerSetup[]): GameState {
  const territories: Territory[] = INITIAL_TERRITORIES.map((t) => ({ ...t, units: [] }));
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
    territories[tid].units = deepUnits(
      FACTION_START_UNITS[playerSetups[i].faction] || [{ type: 'infantry', count: 3 }]
    );
  }

  return {
    phase: 'playing',
    turn: 1,
    currentPlayerId: 0,
    players,
    territories,
    log: ['게임 시작!'],
    winner: null,
  };
}

// ── Queries ─────────────────────────────────────────────────────────────────

export function canMoveTo(
  territories: Territory[],
  players: Player[],
  fromId: number,
  toId: number,
  pid: number
): boolean {
  const from = territories[fromId];
  const to = territories[toId];
  if (!from.adjacentIds.includes(toId)) return false;
  if (from.ownerId !== pid) return false;
  if (movableCount(from.units) < 2) return false;
  if (to.ownerId === null || to.ownerId === pid) return true;
  return players[pid].diplomacy[to.ownerId] !== 'ally';
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

// ── Actions ──────────────────────────────────────────────────────────────────

export function moveArmies(state: GameState, fromId: number, toId: number): GameState {
  const pid = state.currentPlayerId;
  if (!canMoveTo(state.territories, state.players, fromId, toId, pid)) return state;

  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const players = state.players.map((p) => ({ ...p, diplomacy: { ...p.diplomacy } }));
  const log = [...state.log];

  const from = territories[fromId];
  const to = territories[toId];

  const moving = movingUnits(from.units);
  from.units = stayingUnit(from.units);

  if (to.ownerId === null || to.ownerId === pid) {
    // Move/reinforce neutral or own territory
    to.ownerId = pid;
    mergeUnits(to.units, moving);
    log.push(`${players[pid].name}: ${from.name} → ${to.name} (⚔${totalAttack(moving)})`);
  } else {
    // ── Attack ───────────────────────────────────────────────────────────
    const defender = to.ownerId;
    const atkStr = totalAttack(moving);

    // Air defenders only count if attacker has anti-air or air-to-air capability.
    // Structures always defend. Ground always defends.
    const hasAntiAir = moving.some((u) => UNIT_DEFS[u.type].antiAir || UNIT_DEFS[u.type].isAir);

    const defStr = to.units.reduce((s, u) => {
      const def = UNIT_DEFS[u.type];
      if (def.isStructure) return s + def.defense;          // 건물: 항상 수비
      if (def.isAir)       return hasAntiAir ? s + def.defense : s; // 공중: 대공 없으면 무시
      return s + def.defense;                                // 지상: 항상 수비
    }, 0);

    if (atkStr > defStr) {
      // Attacker wins — survivors trimmed to (atkStr - defStr)
      const remaining = Math.max(0, atkStr - defStr);
      const survivors = remaining > 0 ? trimToStrength(moving, remaining, 'attack') : [];
      to.ownerId = pid;
      to.units = survivors.length > 0 ? survivors : [{ type: 'infantry', count: 1 }];
      log.push(`⚔ ${players[pid].name} → ${to.name} 점령! (ATK ${atkStr} vs DEF ${defStr})`);
      players[pid].diplomacy[defender] = 'war';
      players[defender].diplomacy[pid] = 'war';
    } else {
      // Defender wins — only "active" defenders take casualties; immune air units survive intact
      const remaining = Math.max(0, defStr - atkStr);

      const activeDefenders = to.units.filter((u) => {
        const def = UNIT_DEFS[u.type];
        if (def.isStructure) return true;
        if (def.isAir)       return hasAntiAir;
        return true;
      });
      const immuneAir = deepUnits(to.units.filter((u) => UNIT_DEFS[u.type].isAir && !hasAntiAir));

      const trimmed = remaining > 0
        ? trimToStrength(activeDefenders, remaining, 'defense')
        : [{ type: 'infantry' as UnitType, count: 1 }];
      to.units = [...trimmed, ...immuneAir];
      log.push(`🛡 ${to.name} 방어 성공! (DEF ${defStr} vs ATK ${atkStr})`);
    }
  }

  return { ...state, territories, players, log };
}

export function recruitUnits(
  state: GameState,
  territoryId: number,
  unitType: UnitType,
  count: number
): GameState {
  const pid = state.currentPlayerId;
  const def = UNIT_DEFS[unitType];

  // Faction restriction
  if (def.faction && def.faction !== state.players[pid].faction) return state;

  const cost = def.cost * count;
  if (state.players[pid].minerals < cost) return state;
  if (state.territories[territoryId].ownerId !== pid) return state;
  if (count < 1) return state;

  // Zerg gets 2× zerglings
  const actual = (state.players[pid].faction === 'zerg' && def.zergDouble) ? count * 2 : count;

  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const players = state.players.map((p) => ({ ...p }));

  mergeUnits(territories[territoryId].units, [{ type: unitType, count: actual }]);
  players[pid].minerals -= cost;

  const suffix = actual !== count ? ` (×2 저그 보너스 → ${actual}기)` : '';
  return {
    ...state,
    territories,
    players,
    log: [
      ...state.log,
      `${players[pid].name}: ${territories[territoryId].name}에 ${def.name} ${actual}기 징집 (-${cost}💎)${suffix}`,
    ],
  };
}

export function setDiplomacy(state: GameState, targetId: number, status: DiplomacyStatus): GameState {
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
  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const log = [...state.log];
  const cur = state.currentPlayerId;

  // Collect mineral income
  let income = 0;
  for (const t of territories) {
    if (t.ownerId === cur) income += t.minerals;
  }
  players[cur].minerals += income;

  // Zerg: spawn 1 zergling per owned territory (regen)
  if (players[cur].faction === 'zerg') {
    for (const t of territories) {
      if (t.ownerId === cur) mergeUnits(t.units, [{ type: 'zergling', count: 1 }]);
    }
  }
  // Primal Zerg: spawn 1 primal_zergling per owned territory (stronger regen)
  if (players[cur].faction === 'primal_zerg') {
    for (const t of territories) {
      if (t.ownerId === cur) mergeUnits(t.units, [{ type: 'primal_zergling', count: 1 }]);
    }
  }

  // Check elimination
  if (territories.filter((t) => t.ownerId === cur).length === 0) {
    players[cur].isAlive = false;
    log.push(`☠ ${players[cur].name} 탈락!`);
  }

  // Advance to next alive player
  const total = players.length;
  let next = (cur + 1) % total;
  let loops = 0;
  while (!players[next].isAlive && loops < total) {
    next = (next + 1) % total;
    loops++;
  }

  const newTurn = next <= cur ? state.turn + 1 : state.turn;
  if (next <= cur) log.push(`─── 턴 ${newTurn} ───`);

  const newState: GameState = { ...state, players, territories, log, turn: newTurn, currentPlayerId: next };
  const winner = checkWinner(newState);
  return winner !== null ? { ...newState, phase: 'ended', winner } : newState;
}

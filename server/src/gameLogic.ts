import type { GameState, Player, Territory, DiplomacyStatus, PlayerSetup, UnitType, UnitCount } from './types';
import { INITIAL_TERRITORIES, PLAYER_STARTS, PLAYER_COLORS, WIN_THRESHOLD, UNIT_DEFS, TECH_DEFS } from './mapData';

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

// ── Supply helpers ──────────────────────────────────────────────────────────

/** Supply cap: 10 base + 2 per owned territory. */
export function supplyCap(territories: Territory[], pid: number): number {
  return 10 + territories.filter((t) => t.ownerId === pid).length * 2;
}

/** Supply currently used by a player across all their territories. */
export function usedSupply(territories: Territory[], pid: number): number {
  return territories
    .filter((t) => t.ownerId === pid)
    .flatMap((t) => t.units)
    .reduce((s, u) => s + (UNIT_DEFS[u.type].supply ?? 0) * u.count, 0);
}

// ── Action helpers ──────────────────────────────────────────────────────────

/**
 * Max actions per turn for a player.
 * Base 3 + 1 per 2 strategic territories held (센터 장악 보너스).
 */
export function computeMaxActions(territories: Territory[], pid: number): number {
  const strategic = territories.filter((t) => t.ownerId === pid && t.isStrategic).length;
  return 3 + Math.floor(strategic / 2);
}

// ── Private helpers ─────────────────────────────────────────────────────────

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

function deepPlayer(p: Player): Player {
  return { ...p, diplomacy: { ...p.diplomacy }, techs: [...p.techs] };
}

/** Remove cheapest units until remaining ATK (or DEF) = targetStr. */
function trimToStrength(units: UnitCount[], targetStr: number, mode: 'attack' | 'defense'): UnitCount[] {
  const result = deepUnits(units);
  const val = (t: UnitType) => (mode === 'attack' ? UNIT_DEFS[t].attack : UNIT_DEFS[t].defense);
  let cur = result.reduce((s, u) => s + val(u.type) * u.count, 0);

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

function movingUnits(units: UnitCount[]): UnitCount[] {
  const nonStructures = units.filter((u) => !UNIT_DEFS[u.type].isStructure);
  if (totalCount(nonStructures) <= 1) return [];
  const result = deepUnits(nonStructures);
  const cheapestType = [...result].sort((a, b) => UNIT_DEFS[a.type].cost - UNIT_DEFS[b.type].cost)[0].type;
  const entry = result.find((u) => u.type === cheapestType)!;
  entry.count -= 1;
  return result.filter((u) => u.count > 0);
}

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
  ued:         [{ type: 'infantry', count: 2 }, { type: 'ghost', count: 1 }],
  raiders:     [{ type: 'vulture', count: 2 }, { type: 'firebat', count: 1 }],
  confederacy: [{ type: 'infantry', count: 2 }, { type: 'goliath', count: 1 }],
};

export function createInitialState(playerSetups: PlayerSetup[]): GameState {
  const territories: Territory[] = INITIAL_TERRITORIES.map((t) => ({ ...t, units: [] }));
  const players: Player[] = playerSetups.map((setup, i) => {
    const diplomacy: Record<number, DiplomacyStatus> = {};
    for (let j = 0; j < playerSetups.length; j++) {
      if (j !== i) diplomacy[j] = 'neutral';
    }
    const homeId = PLAYER_STARTS[i] ?? null;
    return {
      id: i,
      name: setup.name,
      faction: setup.faction,
      minerals: 5,
      gas: 2,
      isAI: setup.isAI,
      isAlive: true,
      color: PLAYER_COLORS[i],
      diplomacy,
      techs: [],
      weapons: 0,
      armor: 0,
      actionsLeft: 3,
      homeId,
      naturalId: null,
    };
  });

  // Raiders need raiders_garage to recruit their starting firebat
  const raidersIdx = players.findIndex((p) => p.faction === 'raiders');
  if (raidersIdx >= 0) players[raidersIdx].techs.push('raiders_garage');

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
    log: ['게임 시작! 본진을 지키고 앞마당을 확보하라.'],
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
  // Cost: 1 action
  if (state.players[pid].actionsLeft <= 0) return state;

  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const players = state.players.map(deepPlayer);
  const log = [...state.log];

  const from = territories[fromId];
  const to   = territories[toId];

  const moving = movingUnits(from.units);
  from.units = stayingUnit(from.units);

  // Deduct action
  players[pid].actionsLeft -= 1;

  if (to.ownerId === null || to.ownerId === pid) {
    // Move/reinforce — neutral or own territory
    to.ownerId = pid;
    mergeUnits(to.units, moving);

    // ── Auto-natural designation ──────────────────────────────────────────
    const me = players[pid];
    if (me.naturalId === null && me.homeId !== null) {
      const home = territories[me.homeId];
      if (home.adjacentIds.includes(to.id)) {
        me.naturalId = to.id;
        log.push(`🏗 ${me.name}: ${to.name} 앞마당 확보! (+1💎 +1⛽/턴)`);
      }
    }

    log.push(`${players[pid].name}: ${from.name} → ${to.name} (⚔${totalAttack(moving)})`);
  } else {
    // ── Attack ───────────────────────────────────────────────────────────
    const defender = to.ownerId;
    const rawAtk = totalAttack(moving);

    const hasAntiAir = moving.some((u) => UNIT_DEFS[u.type].antiAir || UNIT_DEFS[u.type].isAir);

    const rawDef = to.units.reduce((s, u) => {
      const def = UNIT_DEFS[u.type];
      if (def.isStructure) return s + def.defense;
      if (def.isAir) return hasAntiAir ? s + def.defense : s;
      return s + def.defense;
    }, 0);

    // Weapon/armor upgrades + strategic terrain bonus for defender
    const movingCount = moving.reduce((s, u) => s + u.count, 0);
    const atkStr = rawAtk + players[pid].weapons * movingCount;

    const activeDefCount = to.units.reduce((s, u) => {
      const def = UNIT_DEFS[u.type];
      if (def.isStructure) return s + u.count;
      if (def.isAir) return hasAntiAir ? s + u.count : s;
      return s + u.count;
    }, 0);
    // Strategic territory: +2 flat defense bonus (high ground / choke point)
    const strategicBonus = to.isStrategic ? 2 : 0;
    const defStr = rawDef + (players[defender]?.armor ?? 0) * activeDefCount + strategicBonus;

    if (atkStr > defStr) {
      const remaining = Math.max(0, atkStr - defStr);
      const survivors = remaining > 0 ? trimToStrength(moving, remaining, 'attack') : [];
      to.ownerId = pid;
      to.units = survivors.length > 0 ? survivors : [{ type: 'infantry', count: 1 }];

      const bonusStr = strategicBonus > 0 ? ` [전략거점+${strategicBonus}DEF]` : '';
      log.push(`⚔ ${players[pid].name} → ${to.name} 점령!${bonusStr} (ATK ${atkStr} vs DEF ${defStr})`);
      players[pid].diplomacy[defender] = 'war';
      players[defender].diplomacy[pid] = 'war';

      // Auto-natural for newly captured territory
      const me = players[pid];
      if (me.naturalId === null && me.homeId !== null) {
        const home = territories[me.homeId];
        if (home.adjacentIds.includes(to.id)) {
          me.naturalId = to.id;
          log.push(`🏗 ${me.name}: ${to.name} 앞마당 확보! (+1💎 +1⛽/턴)`);
        }
      }
    } else {
      const remaining = Math.max(0, defStr - atkStr);

      const activeDefenders = to.units.filter((u) => {
        const def = UNIT_DEFS[u.type];
        if (def.isStructure) return true;
        if (def.isAir) return hasAntiAir;
        return true;
      });
      const immuneAir = deepUnits(to.units.filter((u) => UNIT_DEFS[u.type].isAir && !hasAntiAir));

      const trimmed = remaining > 0
        ? trimToStrength(activeDefenders, remaining, 'defense')
        : [{ type: 'infantry' as UnitType, count: 1 }];
      to.units = [...trimmed, ...immuneAir];

      const bonusStr = strategicBonus > 0 ? ` [전략거점+${strategicBonus}DEF]` : '';
      log.push(`🛡 ${to.name} 방어 성공!${bonusStr} (DEF ${defStr} vs ATK ${atkStr})`);
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
  // Tech requirement
  if (def.requiredTech && !state.players[pid].techs.includes(def.requiredTech)) return state;
  // Action cost
  if (state.players[pid].actionsLeft <= 0) return state;

  const mineralCost = def.cost * count;
  const gasCost     = (def.gasCost ?? 0) * count;

  if (state.players[pid].minerals < mineralCost) return state;
  if (state.players[pid].gas < gasCost) return state;
  if (state.territories[territoryId].ownerId !== pid) return state;
  if (count < 1) return state;

  const actual = (state.players[pid].faction === 'zerg' && def.zergDouble) ? count * 2 : count;

  // Supply check
  const cap = supplyCap(state.territories, pid);
  const used = usedSupply(state.territories, pid);
  const addedSupply = (def.supply ?? 0) * actual;
  if (addedSupply > 0 && used + addedSupply > cap) return state;

  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const players = state.players.map(deepPlayer);

  mergeUnits(territories[territoryId].units, [{ type: unitType, count: actual }]);
  players[pid].minerals    -= mineralCost;
  players[pid].gas         -= gasCost;
  players[pid].actionsLeft -= 1;

  const gasSuffix  = gasCost > 0 ? ` -${gasCost}⛽` : '';
  const zergSuffix = actual !== count ? ` (×2 저그 보너스 → ${actual}기)` : '';
  return {
    ...state,
    territories,
    players,
    log: [
      ...state.log,
      `${players[pid].name}: ${territories[territoryId].name}에 ${def.name} ${actual}기 징집 (-${mineralCost}💎${gasSuffix})${zergSuffix}`,
    ],
  };
}

export function researchTech(state: GameState, techId: string): GameState {
  const pid = state.currentPlayerId;
  const tech = TECH_DEFS.find((t) => t.id === techId);
  if (!tech) return state;

  if (tech.faction && tech.faction !== state.players[pid].faction) return state;
  if (state.players[pid].techs.includes(techId)) return state;
  if (tech.requires && !state.players[pid].techs.includes(tech.requires)) return state;
  if (state.players[pid].minerals < tech.mineralCost) return state;
  if (state.players[pid].gas < tech.gasCost) return state;
  // Action cost
  if (state.players[pid].actionsLeft <= 0) return state;

  const players = state.players.map(deepPlayer);
  players[pid].minerals    -= tech.mineralCost;
  players[pid].gas         -= tech.gasCost;
  players[pid].techs.push(techId);
  players[pid].actionsLeft -= 1;

  if (tech.upgradeType === 'weapons') players[pid].weapons = Math.min(3, players[pid].weapons + 1);
  if (tech.upgradeType === 'armor')   players[pid].armor   = Math.min(3, players[pid].armor   + 1);

  const unlockStr  = tech.unlocksUnits?.length
    ? ` (${tech.unlocksUnits.map((u) => UNIT_DEFS[u].name).join(', ')} 해금)`
    : '';
  const upgradeStr = tech.upgradeType === 'weapons' ? ` (무기 Lv${players[pid].weapons})`
    : tech.upgradeType === 'armor' ? ` (방어 Lv${players[pid].armor})` : '';

  return {
    ...state,
    players,
    log: [
      ...state.log,
      `🔬 ${players[pid].name}: ${tech.name} 연구 완료 (-${tech.mineralCost}💎 -${tech.gasCost}⛽)${unlockStr}${upgradeStr}`,
    ],
  };
}

export function setDiplomacy(state: GameState, targetId: number, status: DiplomacyStatus): GameState {
  const pid = state.currentPlayerId;
  // Diplomacy is FREE (no action cost)
  const players = state.players.map(deepPlayer);
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
  const players    = state.players.map(deepPlayer);
  const territories = state.territories.map((t) => ({ ...t, units: deepUnits(t.units) }));
  const log        = [...state.log];
  const cur        = state.currentPlayerId;
  const me         = players[cur];

  // ── Collect mineral + gas income ─────────────────────────────────────────
  let income    = 0;
  let gasIncome = 0;
  for (const t of territories) {
    if (t.ownerId === cur) {
      income    += t.minerals;
      gasIncome += t.gasYield;
    }
  }
  me.minerals += income;
  me.gas      += gasIncome;

  // ── Base development bonuses ─────────────────────────────────────────────
  // 본진 (Main base): still owned → +2 minerals, +1 gas
  if (me.homeId !== null && territories[me.homeId].ownerId === cur) {
    me.minerals += 2;
    me.gas      += 1;
  }
  // 앞마당 (Natural expansion): still owned → +1 minerals, +1 gas
  if (me.naturalId !== null && territories[me.naturalId].ownerId === cur) {
    me.minerals += 1;
    me.gas      += 1;
  }

  // ── Faction unit spawning ─────────────────────────────────────────────────
  if (me.faction === 'zerg') {
    for (const t of territories) {
      if (t.ownerId === cur) mergeUnits(t.units, [{ type: 'zergling', count: 1 }]);
    }
  }
  if (me.faction === 'primal_zerg') {
    for (const t of territories) {
      if (t.ownerId === cur) mergeUnits(t.units, [{ type: 'primal_zergling', count: 1 }]);
    }
  }

  // ── Elimination check ────────────────────────────────────────────────────
  if (territories.filter((t) => t.ownerId === cur).length === 0) {
    me.isAlive = false;
    log.push(`☠ ${me.name} 탈락!`);
  }

  // ── Advance to next alive player ─────────────────────────────────────────
  const total = players.length;
  let next  = (cur + 1) % total;
  let loops = 0;
  while (!players[next].isAlive && loops < total) {
    next = (next + 1) % total;
    loops++;
  }

  const newTurn = next <= cur ? state.turn + 1 : state.turn;
  if (next <= cur) log.push(`─── 턴 ${newTurn} ───`);

  // ── Reset next player's action points ───────────────────────────────────
  players[next].actionsLeft = computeMaxActions(territories, next);
  const bonus = players[next].actionsLeft - 3;
  if (bonus > 0) {
    const strategic = territories.filter((t) => t.ownerId === next && t.isStrategic).length;
    log.push(`⚡ ${players[next].name}: 행동 포인트 ${players[next].actionsLeft} (전략 거점 ${strategic}개 보너스)`);
  }

  const newState: GameState = { ...state, players, territories, log, turn: newTurn, currentPlayerId: next };
  const winner = checkWinner(newState);
  return winner !== null ? { ...newState, phase: 'ended', winner } : newState;
}

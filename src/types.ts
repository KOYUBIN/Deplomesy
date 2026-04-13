export type Faction = 'terran' | 'zerg' | 'protoss' | 'tal_darim' | 'primal_zerg' | 'nerazim';
export type DiplomacyStatus = 'war' | 'neutral' | 'ally';
export type GamePhase = 'setup' | 'playing' | 'ended';

export type UnitType =
  | 'infantry'    | 'archer'
  | 'marine'      | 'siege_tank'   | 'viking'        | 'bunker'
  | 'zergling'    | 'hydralisk'    | 'mutalisk'       | 'spine_crawler'
  | 'zealot'      | 'dragoon'      | 'phoenix'        | 'photon_cannon'
  | 'fanatical'   | 'void_ray'     | 'tal_archon'     | 'xel_naga_tower'
  | 'primal_zergling' | 'primal_raptor' | 'leviathan' | 'primal_pit'
  | 'dark_templar' | 'stalker'     | 'oracle'         | 'void_gate';

export interface UnitDef {
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  faction?: Faction;
  isAir?: boolean;
  antiAir?: boolean;
  isStructure?: boolean;
  zergDouble?: boolean;
  special?: string;
}

export interface UnitCount {
  type: UnitType;
  count: number;
}

export interface Territory {
  id: number;
  name: string;
  x: number;
  y: number;
  adjacentIds: number[];
  minerals: number;
  ownerId: number | null;
  units: UnitCount[];
}

export interface Player {
  id: number;
  name: string;
  faction: Faction;
  minerals: number;
  isAI: boolean;
  isAlive: boolean;
  color: string;
  diplomacy: Record<number, DiplomacyStatus>;
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  currentPlayerId: number;
  players: Player[];
  territories: Territory[];
  log: string[];
  winner: number | null;
}

export interface ClientUIState {
  selectedTerritoryId: number | null;
  moveFrom: number | null;
}

export interface RoomInfo {
  code: string;
  players: Array<{ name: string; faction: Faction; playerIndex: number }>;
  started: boolean;
}

export type Screen = 'lobby' | 'waiting' | 'playing' | 'ended';

export type Faction = 'terran' | 'zerg' | 'protoss';
export type DiplomacyStatus = 'war' | 'neutral' | 'ally';
export type GamePhase = 'setup' | 'playing' | 'ended';

export type UnitType =
  | 'infantry' | 'archer'        // 공통
  | 'marine'   | 'siege_tank'    // 테란
  | 'zergling' | 'hydralisk'     // 저그
  | 'zealot'   | 'dragoon';      // 프로토스

export interface UnitDef {
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  faction?: Faction;       // undefined = 모든 종족 사용 가능
  zergDouble?: boolean;    // 저그는 2배 수량
  special?: string;        // 특수 능력 설명
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

export interface PlayerSetup {
  name: string;
  faction: Faction;
  isAI: boolean;
}

export interface RoomPlayer {
  socketId: string;
  name: string;
  faction: Faction;
  playerIndex: number;
}

export interface Room {
  code: string;
  hostSocketId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  aiRunning: boolean;
}

export interface RoomInfo {
  code: string;
  players: Array<{ name: string; faction: Faction; playerIndex: number }>;
  started: boolean;
}

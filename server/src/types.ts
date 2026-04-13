export type Faction = 'terran' | 'zerg' | 'protoss';
export type DiplomacyStatus = 'war' | 'neutral' | 'ally';
export type GamePhase = 'setup' | 'playing' | 'ended';

export interface Territory {
  id: number;
  name: string;
  x: number;
  y: number;
  adjacentIds: number[];
  minerals: number;
  ownerId: number | null;
  armies: number;
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

// Room types (server-only)
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

// Info sent to clients (no socketIds)
export interface RoomInfo {
  code: string;
  players: Array<{ name: string; faction: Faction; playerIndex: number }>;
  started: boolean;
}

export type Faction = 'terran' | 'zerg' | 'protoss';
export type DiplomacyStatus = 'war' | 'neutral' | 'ally';
export type GamePhase = 'setup' | 'playing' | 'ended';
export type ActionMode = 'none' | 'move';

export interface Territory {
  id: number;
  name: string;
  x: number;
  y: number;
  adjacentIds: number[];
  minerals: number; // production per turn (1 or 2)
  ownerId: number | null; // null = neutral
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
  diplomacy: Record<number, DiplomacyStatus>; // playerId -> status
}

export interface MoveOrder {
  fromId: number;
  toId: number;
  armies: number;
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  currentPlayerId: number;
  players: Player[];
  territories: Territory[];
  log: string[];
  winner: number | null;
  actionMode: ActionMode;
  selectedTerritoryId: number | null;
  moveFrom: number | null;
}

export interface SetupConfig {
  playerCount: number;
  playerFaction: Faction;
  playerName: string;
}

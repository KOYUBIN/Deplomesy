export type Faction =
  | 'terran'      // 테란 도미니온
  | 'zerg'        // 저그 군단
  | 'protoss'     // 황금함대 프로토스
  | 'tal_darim'   // 탈다림
  | 'primal_zerg' // 원시저그
  | 'nerazim'     // 네라짐
  | 'ued'         // UED 지구 연합
  | 'raiders'     // 레이너 반군
  | 'confederacy';// 테란 컨페더러시

export type DiplomacyStatus = 'war' | 'neutral' | 'ally';
export type GamePhase = 'setup' | 'playing' | 'ended';

export type UnitType =
  // 공통
  | 'infantry'   | 'archer'
  // 테란 도미니온
  | 'marine'     | 'siege_tank'       | 'viking'           | 'bunker'
  // 저그 군단
  | 'zergling'   | 'hydralisk'        | 'mutalisk'         | 'spine_crawler'
  // 황금함대 프로토스
  | 'zealot'     | 'dragoon'          | 'phoenix'          | 'photon_cannon'
  // 탈다림
  | 'fanatical'  | 'void_ray'         | 'tal_archon'       | 'xel_naga_tower'
  // 원시저그
  | 'primal_zergling' | 'primal_raptor' | 'leviathan'      | 'primal_pit'
  // 네라짐
  | 'dark_templar' | 'stalker'        | 'oracle'           | 'void_gate'
  // UED 지구 연합
  | 'ghost'      | 'battlecruiser'    | 'science_vessel'   | 'missile_turret'
  // 레이너 반군
  | 'vulture'    | 'firebat'          | 'dropship'         | 'raiders_bunker'
  // 테란 컨페더러시
  | 'goliath'    | 'wraith'           | 'confederate_ghost'| 'nuke_silo';

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
  gasCost?: number;
  supply?: number;
  requiredTech?: string;
  special?: string;
}

export interface TechDef {
  id: string;
  name: string;
  faction?: Faction;
  mineralCost: number;
  gasCost: number;
  requires?: string;
  unlocksUnits?: UnitType[];
  upgradeType?: 'weapons' | 'armor';
  description?: string;
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
  gasYield: number;
  isStrategic: boolean;
  ownerId: number | null;
  units: UnitCount[];
}

export interface Player {
  id: number;
  name: string;
  faction: Faction;
  minerals: number;
  gas: number;
  isAI: boolean;
  isAlive: boolean;
  color: string;
  diplomacy: Record<number, DiplomacyStatus>;
  techs: string[];
  weapons: number;
  armor: number;
  actionsLeft: number;
  homeId: number | null;
  naturalId: number | null;
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

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
  | 'infantry' | 'archer'
  // 테란 도미니온
  | 'marine' | 'siege_tank' | 'viking' | 'bunker'
  // 저그 군단
  | 'zergling' | 'hydralisk' | 'mutalisk' | 'spine_crawler'
  // 황금함대 프로토스
  | 'zealot' | 'dragoon' | 'phoenix' | 'photon_cannon'
  // 탈다림
  | 'fanatical' | 'void_ray' | 'tal_archon' | 'xel_naga_tower'
  // 원시저그
  | 'primal_zergling' | 'primal_raptor' | 'leviathan' | 'primal_pit'
  // 네라짐
  | 'dark_templar' | 'stalker' | 'oracle' | 'void_gate'
  // UED 지구 연합
  | 'ghost' | 'battlecruiser' | 'science_vessel' | 'missile_turret'
  // 레이너 반군
  | 'vulture' | 'firebat' | 'dropship' | 'raiders_bunker'
  // 테란 컨페더러시
  | 'goliath' | 'wraith' | 'confederate_ghost' | 'nuke_silo';

export interface UnitDef {
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  faction?: Faction;
  isAir?: boolean;        // 공중 유닛 — 대공 능력 없이는 방어 불가
  antiAir?: boolean;      // 공중 유닛 공격 가능
  isStructure?: boolean;  // 건물 — 이동 불가, 항상 수비에 참여
  zergDouble?: boolean;   // 저그: 1비용으로 2기 징집
  gasCost?: number;       // 가스 소모량
  supply?: number;        // 인구수 소모 (구조물 = 0)
  requiredTech?: string;  // 연구 필요 기술 ID
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
  gasYield: number;       // 턴당 가스 생산량 (0-2)
  isStrategic: boolean;   // 전략적 요충지 — 방어 보너스 + 행동력 보너스
  ownerId: number | null;
  units: UnitCount[];
}

export interface Player {
  id: number;
  name: string;
  faction: Faction;
  minerals: number;
  gas: number;            // 베스핀 가스
  isAI: boolean;
  isAlive: boolean;
  color: string;
  diplomacy: Record<number, DiplomacyStatus>;
  techs: string[];        // 연구한 기술 ID 목록
  weapons: number;        // 무기 업그레이드 레벨 (0-3)
  armor: number;          // 방어 업그레이드 레벨 (0-3)
  actionsLeft: number;    // 이번 턴 남은 행동 포인트
  homeId: number | null;  // 본진 행성 ID
  naturalId: number | null; // 앞마당 행성 ID (첫 번째 확장)
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

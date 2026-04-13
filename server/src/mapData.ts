import type { Territory, Faction, UnitType, UnitDef } from './types';

// ── Unit definitions ────────────────────────────────────────────────────────

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  // 공통 유닛
  infantry:   { type: 'infantry',   name: '보병',         attack: 1, defense: 1, cost: 1,
                special: '기본 보병. 저렴하고 수급이 빠름.' },
  archer:     { type: 'archer',     name: '궁병',         attack: 2, defense: 1, cost: 2,
                special: '원거리 공격. 공격력 우위.' },

  // 테란 전용
  marine:     { type: 'marine',     name: '해병',         attack: 2, defense: 2, cost: 3, faction: 'terran',
                special: '테란 기본 정예병. 공/수 균형.' },
  siege_tank: { type: 'siege_tank', name: '시즈 탱크',    attack: 2, defense: 5, cost: 5, faction: 'terran',
                special: '방어 시 최강. 수비에 특화.' },

  // 저그 전용
  zergling:   { type: 'zergling',   name: '저글링',       attack: 1, defense: 1, cost: 1, faction: 'zerg', zergDouble: true,
                special: '1미네랄에 2기 징집. 떼로 몰아붙여라.' },
  hydralisk:  { type: 'hydralisk',  name: '히드라리스크', attack: 3, defense: 2, cost: 4, faction: 'zerg',
                special: '고화력 원거리. 최고의 공격 유닛.' },

  // 프로토스 전용
  zealot:     { type: 'zealot',     name: '질럿',         attack: 3, defense: 2, cost: 3, faction: 'protoss',
                special: '돌격 전사. 근접 공격 최강.' },
  dragoon:    { type: 'dragoon',    name: '드라군',       attack: 2, defense: 4, cost: 4, faction: 'protoss',
                special: '보호막 장갑. 방어와 원거리 공격.' },
};

// ── Map ─────────────────────────────────────────────────────────────────────

export const INITIAL_TERRITORIES: Territory[] = [
  { id: 0,  name: '브락시스',      x: 200, y: 80,  adjacentIds: [1, 3, 4],               minerals: 1, ownerId: null, units: [] },
  { id: 1,  name: '안티가 프라임', x: 500, y: 80,  adjacentIds: [0, 2, 4, 5],            minerals: 2, ownerId: null, units: [] },
  { id: 2,  name: '타소니스',      x: 800, y: 80,  adjacentIds: [1, 5, 6],               minerals: 1, ownerId: null, units: [] },
  { id: 3,  name: '코랄',          x: 120, y: 210, adjacentIds: [0, 4, 7, 8],            minerals: 2, ownerId: null, units: [] },
  { id: 4,  name: '카스타나르',    x: 380, y: 210, adjacentIds: [0, 1, 3, 5, 8, 9],     minerals: 1, ownerId: null, units: [] },
  { id: 5,  name: '티라도르',      x: 620, y: 210, adjacentIds: [1, 2, 4, 6, 9, 10],    minerals: 1, ownerId: null, units: [] },
  { id: 6,  name: '모리아',        x: 880, y: 210, adjacentIds: [2, 5, 10, 11],          minerals: 2, ownerId: null, units: [] },
  { id: 7,  name: '마 사라',       x: 60,  y: 340, adjacentIds: [3, 8, 12, 13],          minerals: 1, ownerId: null, units: [] },
  { id: 8,  name: '마인호프',      x: 290, y: 340, adjacentIds: [3, 4, 7, 9, 12, 13],   minerals: 1, ownerId: null, units: [] },
  { id: 9,  name: '코어 월드',     x: 500, y: 340, adjacentIds: [4, 5, 8, 10, 13, 14],  minerals: 3, ownerId: null, units: [] },
  { id: 10, name: '프라이드워터',  x: 710, y: 340, adjacentIds: [5, 6, 9, 11, 14, 15],  minerals: 1, ownerId: null, units: [] },
  { id: 11, name: '도미니온',      x: 940, y: 340, adjacentIds: [6, 10, 15],             minerals: 2, ownerId: null, units: [] },
  { id: 12, name: '아이어',        x: 150, y: 470, adjacentIds: [7, 8, 13, 16],          minerals: 2, ownerId: null, units: [] },
  { id: 13, name: '솔라리스',      x: 380, y: 470, adjacentIds: [7, 8, 9, 12, 14, 16, 17], minerals: 1, ownerId: null, units: [] },
  { id: 14, name: '우모자',        x: 620, y: 470, adjacentIds: [9, 10, 13, 15, 17, 18], minerals: 1, ownerId: null, units: [] },
  { id: 15, name: '샤쿠라스',      x: 850, y: 470, adjacentIds: [10, 11, 14, 18],        minerals: 2, ownerId: null, units: [] },
  { id: 16, name: '칼디르',        x: 200, y: 600, adjacentIds: [12, 13, 17],            minerals: 1, ownerId: null, units: [] },
  { id: 17, name: '제루스',        x: 500, y: 600, adjacentIds: [13, 14, 16, 18],        minerals: 1, ownerId: null, units: [] },
  { id: 18, name: '차르',          x: 800, y: 600, adjacentIds: [14, 15, 17],            minerals: 2, ownerId: null, units: [] },
];

export const PLAYER_STARTS = [3, 18, 12, 2, 0, 15];
export const WIN_THRESHOLD = 11;

export const PLAYER_COLORS = [
  '#4da6ff', '#ff5f5f', '#4dff91', '#ffd84d', '#ff9f4d', '#c44dff',
];

export const AI_NAMES: Record<Faction, string[]> = {
  terran:  ['짐 레이너', '아르투로 발레리우스', '맷 호너'],
  zerg:    ['케리건', '이자샤', '아바투르'],
  protoss: ['제라툴', '아르타니스', '카락스'],
};

export const AI_FACTIONS: Faction[] = ['terran', 'zerg', 'protoss', 'zerg', 'terran', 'protoss'];

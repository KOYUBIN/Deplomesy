import type { Territory, Faction, UnitType, UnitDef } from './types';

// ── Unit definitions ────────────────────────────────────────────────────────

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  // 공통 유닛
  infantry: {
    type: 'infantry', name: '보병', attack: 1, defense: 1, cost: 1,
    special: '기본 보병. 저렴하고 수급이 빠름.',
  },
  archer: {
    type: 'archer', name: '궁병', attack: 2, defense: 1, cost: 2, antiAir: true,
    special: '원거리 공격. 공중 유닛 대응 가능.',
  },

  // 테란 도미니온
  marine: {
    type: 'marine', name: '해병', attack: 2, defense: 2, cost: 3, faction: 'terran', antiAir: true,
    special: '테란 기본 정예병. 공/수 균형. 공중 대응 가능.',
  },
  siege_tank: {
    type: 'siege_tank', name: '시즈 탱크', attack: 2, defense: 5, cost: 5, faction: 'terran',
    special: '방어 시 최강. 수비에 특화.',
  },
  viking: {
    type: 'viking', name: '바이킹', attack: 3, defense: 2, cost: 4, faction: 'terran',
    isAir: true, antiAir: true,
    special: '공중 전투기. 공중 유닛 격파에 특화.',
  },
  bunker: {
    type: 'bunker', name: '벙커', attack: 1, defense: 4, cost: 3, faction: 'terran',
    isStructure: true, antiAir: true,
    special: '방어 요새. 대공 방어 가능.',
  },

  // 저그 군단
  zergling: {
    type: 'zergling', name: '저글링', attack: 1, defense: 1, cost: 1, faction: 'zerg',
    zergDouble: true,
    special: '1미네랄에 2기 징집. 떼로 몰아붙여라.',
  },
  hydralisk: {
    type: 'hydralisk', name: '히드라리스크', attack: 3, defense: 2, cost: 4, faction: 'zerg',
    antiAir: true,
    special: '고화력 원거리. 공중 대응 가능.',
  },
  mutalisk: {
    type: 'mutalisk', name: '뮤탈리스크', attack: 2, defense: 2, cost: 3, faction: 'zerg',
    isAir: true, antiAir: true,
    special: '공중 습격 유닛. 공중 유닛 대응 가능.',
  },
  spine_crawler: {
    type: 'spine_crawler', name: '가시기어', attack: 2, defense: 3, cost: 3, faction: 'zerg',
    isStructure: true,
    special: '저그 방어 구조물. 진지를 지킨다.',
  },

  // 황금함대 프로토스
  zealot: {
    type: 'zealot', name: '질럿', attack: 3, defense: 2, cost: 3, faction: 'protoss',
    special: '돌격 전사. 근접 공격 최강.',
  },
  dragoon: {
    type: 'dragoon', name: '드라군', attack: 2, defense: 4, cost: 4, faction: 'protoss',
    antiAir: true,
    special: '보호막 장갑. 방어와 원거리 공격. 공중 대응 가능.',
  },
  phoenix: {
    type: 'phoenix', name: '불사조', attack: 2, defense: 2, cost: 3, faction: 'protoss',
    isAir: true, antiAir: true,
    special: '프로토스 전투기. 공중 유닛 격파에 탁월.',
  },
  photon_cannon: {
    type: 'photon_cannon', name: '광자포', attack: 2, defense: 3, cost: 4, faction: 'protoss',
    isStructure: true, antiAir: true,
    special: '프로토스 방어포. 대공 방어 가능.',
  },

  // 탈다림
  fanatical: {
    type: 'fanatical', name: '광신도', attack: 4, defense: 2, cost: 4, faction: 'tal_darim',
    special: '탈다림 광신도. 폭발적인 공격력.',
  },
  void_ray: {
    type: 'void_ray', name: '보이드레이', attack: 3, defense: 3, cost: 5, faction: 'tal_darim',
    isAir: true,
    special: '공허 광선 함선. 공중 제압 유닛.',
  },
  tal_archon: {
    type: 'tal_archon', name: '집정관', attack: 2, defense: 3, cost: 3, faction: 'tal_darim',
    special: '탈다림 집정관. 균형잡힌 전투원.',
  },
  xel_naga_tower: {
    type: 'xel_naga_tower', name: '신전탑', attack: 1, defense: 5, cost: 4, faction: 'tal_darim',
    isStructure: true, antiAir: true,
    special: '젤나가 신전탑. 강력한 방어와 대공 포격.',
  },

  // 원시저그
  primal_zergling: {
    type: 'primal_zergling', name: '원시저글링', attack: 2, defense: 1, cost: 2, faction: 'primal_zerg',
    special: '강화된 원시 저글링. 일반 저글링보다 공격력 우위.',
  },
  primal_raptor: {
    type: 'primal_raptor', name: '맹금', attack: 3, defense: 3, cost: 4, faction: 'primal_zerg',
    special: '원시저그 맹금. 균형잡힌 강력한 전투 유닛.',
  },
  leviathan: {
    type: 'leviathan', name: '리바이어던', attack: 2, defense: 4, cost: 5, faction: 'primal_zerg',
    isAir: true,
    special: '거대 공중 생체함선. 강력한 방어력.',
  },
  primal_pit: {
    type: 'primal_pit', name: '원시굴', attack: 1, defense: 4, cost: 3, faction: 'primal_zerg',
    isStructure: true,
    special: '원시저그 방어 거점. 진지를 사수한다.',
  },

  // 네라짐
  dark_templar: {
    type: 'dark_templar', name: '암흑기사', attack: 4, defense: 1, cost: 4, faction: 'nerazim',
    special: '그림자 기습. 최고의 공격력을 가진 암살자.',
  },
  stalker: {
    type: 'stalker', name: '추적자', attack: 2, defense: 3, cost: 3, faction: 'nerazim',
    antiAir: true,
    special: '네라짐 추적자. 공중 대응 가능.',
  },
  oracle: {
    type: 'oracle', name: '예언자', attack: 1, defense: 2, cost: 3, faction: 'nerazim',
    isAir: true,
    special: '네라짐 공중 정찰함. 교란 능력.',
  },
  void_gate: {
    type: 'void_gate', name: '공허신전', attack: 2, defense: 3, cost: 3, faction: 'nerazim',
    isStructure: true, antiAir: true,
    special: '네라짐 방어 신전. 대공 방어 가능.',
  },
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
  terran:      ['짐 레이너', '아르투로 발레리우스', '맷 호너'],
  zerg:        ['케리건', '이자샤', '아바투르'],
  protoss:     ['아르타니스', '카락스', '피닉스'],
  tal_darim:   ['알락', '마라', '케란'],
  primal_zerg: ['데하카', '크라이스', '드로그'],
  nerazim:     ['제라툴', '라작칼', '보라지'],
};

export const AI_FACTIONS: Faction[] = [
  'terran', 'zerg', 'protoss', 'tal_darim', 'primal_zerg', 'nerazim',
];

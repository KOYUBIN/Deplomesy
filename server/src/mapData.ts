import type { Territory, Faction, UnitType, UnitDef, TechDef } from './types';

// ── Unit definitions ────────────────────────────────────────────────────────

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  // 공통 유닛
  infantry: {
    type: 'infantry', name: '보병', attack: 1, defense: 1, cost: 1, supply: 1,
    special: '기본 보병. 저렴하고 수급이 빠름.',
  },
  archer: {
    type: 'archer', name: '궁병', attack: 2, defense: 1, cost: 2, antiAir: true, supply: 1,
    special: '원거리 공격. 공중 유닛 대응 가능.',
  },

  // 테란 도미니온
  marine: {
    type: 'marine', name: '해병', attack: 2, defense: 2, cost: 3, faction: 'terran',
    antiAir: true, supply: 1,
    special: '테란 기본 정예병. 공/수 균형. 공중 대응 가능.',
  },
  siege_tank: {
    type: 'siege_tank', name: '시즈 탱크', attack: 2, defense: 5, cost: 5, faction: 'terran',
    gasCost: 2, supply: 2, requiredTech: 'terran_factory',
    special: '방어 시 최강. 공장 필요.',
  },
  viking: {
    type: 'viking', name: '바이킹', attack: 3, defense: 2, cost: 4, faction: 'terran',
    isAir: true, antiAir: true, gasCost: 2, supply: 2, requiredTech: 'terran_starport',
    special: '공중 전투기. 우주공항 필요.',
  },
  bunker: {
    type: 'bunker', name: '벙커', attack: 1, defense: 4, cost: 3, faction: 'terran',
    isStructure: true, antiAir: true, supply: 0,
    special: '방어 요새. 대공 방어 가능.',
  },

  // 저그 군단
  zergling: {
    type: 'zergling', name: '저글링', attack: 1, defense: 1, cost: 1, faction: 'zerg',
    zergDouble: true, supply: 1,
    special: '1미네랄에 2기 징집. 떼로 몰아붙여라.',
  },
  hydralisk: {
    type: 'hydralisk', name: '히드라리스크', attack: 3, defense: 2, cost: 4, faction: 'zerg',
    antiAir: true, gasCost: 1, supply: 2, requiredTech: 'zerg_den',
    special: '고화력 원거리. 히드라 굴 필요.',
  },
  mutalisk: {
    type: 'mutalisk', name: '뮤탈리스크', attack: 2, defense: 2, cost: 3, faction: 'zerg',
    isAir: true, antiAir: true, gasCost: 1, supply: 2, requiredTech: 'zerg_spire',
    special: '공중 습격. 첨탑 필요.',
  },
  spine_crawler: {
    type: 'spine_crawler', name: '가시기어', attack: 2, defense: 3, cost: 3, faction: 'zerg',
    isStructure: true, supply: 0,
    special: '저그 방어 구조물. 진지를 지킨다.',
  },

  // 황금함대 프로토스
  zealot: {
    type: 'zealot', name: '질럿', attack: 3, defense: 2, cost: 3, faction: 'protoss', supply: 2,
    special: '돌격 전사. 근접 공격 최강.',
  },
  dragoon: {
    type: 'dragoon', name: '드라군', attack: 2, defense: 4, cost: 4, faction: 'protoss',
    antiAir: true, gasCost: 1, supply: 2, requiredTech: 'protoss_core',
    special: '보호막 장갑. 사이버네틱스 코어 필요.',
  },
  phoenix: {
    type: 'phoenix', name: '불사조', attack: 2, defense: 2, cost: 3, faction: 'protoss',
    isAir: true, antiAir: true, gasCost: 1, supply: 2, requiredTech: 'protoss_stargate',
    special: '프로토스 전투기. 우주관문 필요.',
  },
  photon_cannon: {
    type: 'photon_cannon', name: '광자포', attack: 2, defense: 3, cost: 4, faction: 'protoss',
    isStructure: true, antiAir: true, supply: 0,
    special: '프로토스 방어포. 대공 방어 가능.',
  },

  // 탈다림
  fanatical: {
    type: 'fanatical', name: '광신도', attack: 4, defense: 2, cost: 4, faction: 'tal_darim', supply: 2,
    special: '탈다림 광신도. 폭발적인 공격력.',
  },
  void_ray: {
    type: 'void_ray', name: '보이드레이', attack: 3, defense: 3, cost: 5, faction: 'tal_darim',
    isAir: true, gasCost: 2, supply: 3, requiredTech: 'tal_void',
    special: '공허 광선 함선. 공허 주조소 필요.',
  },
  tal_archon: {
    type: 'tal_archon', name: '집정관', attack: 2, defense: 3, cost: 3, faction: 'tal_darim',
    gasCost: 1, supply: 2, requiredTech: 'tal_altar',
    special: '탈다림 집정관. 빛의 제단 필요.',
  },
  xel_naga_tower: {
    type: 'xel_naga_tower', name: '신전탑', attack: 1, defense: 5, cost: 4, faction: 'tal_darim',
    isStructure: true, antiAir: true, supply: 0,
    special: '젤나가 신전탑. 강력한 방어와 대공 포격.',
  },

  // 원시저그
  primal_zergling: {
    type: 'primal_zergling', name: '원시저글링', attack: 2, defense: 1, cost: 2, faction: 'primal_zerg', supply: 1,
    special: '강화된 원시 저글링. 일반 저글링보다 공격력 우위.',
  },
  primal_raptor: {
    type: 'primal_raptor', name: '맹금', attack: 3, defense: 3, cost: 4, faction: 'primal_zerg',
    gasCost: 1, supply: 2, requiredTech: 'primal_evolution',
    special: '원시저그 맹금. 진화의 구덩이 필요.',
  },
  leviathan: {
    type: 'leviathan', name: '리바이어던', attack: 2, defense: 4, cost: 5, faction: 'primal_zerg',
    isAir: true, gasCost: 3, supply: 4, requiredTech: 'primal_hive',
    special: '거대 공중 생체함선. 원시 군락 필요.',
  },
  primal_pit: {
    type: 'primal_pit', name: '원시굴', attack: 1, defense: 4, cost: 3, faction: 'primal_zerg',
    isStructure: true, supply: 0,
    special: '원시저그 방어 거점. 진지를 사수한다.',
  },

  // 네라짐
  dark_templar: {
    type: 'dark_templar', name: '암흑기사', attack: 4, defense: 1, cost: 4, faction: 'nerazim', supply: 2,
    special: '그림자 기습. 최고의 공격력을 가진 암살자.',
  },
  stalker: {
    type: 'stalker', name: '추적자', attack: 2, defense: 3, cost: 3, faction: 'nerazim',
    antiAir: true, gasCost: 1, supply: 2, requiredTech: 'nera_shrine',
    special: '네라짐 추적자. 암흑 성소 필요.',
  },
  oracle: {
    type: 'oracle', name: '예언자', attack: 1, defense: 2, cost: 3, faction: 'nerazim',
    isAir: true, gasCost: 1, supply: 2, requiredTech: 'nera_oracle',
    special: '네라짐 공중 정찰함. 예언자 제단 필요.',
  },
  void_gate: {
    type: 'void_gate', name: '공허신전', attack: 2, defense: 3, cost: 3, faction: 'nerazim',
    isStructure: true, antiAir: true, supply: 0,
    special: '네라짐 방어 신전. 대공 방어 가능.',
  },

  // UED 지구 연합
  ghost: {
    type: 'ghost', name: '고스트', attack: 3, defense: 1, cost: 4, faction: 'ued',
    antiAir: true, supply: 1,
    special: '지구 최정예 저격수. 잠입·대공 요격 가능.',
  },
  battlecruiser: {
    type: 'battlecruiser', name: '전투순양함', attack: 5, defense: 3, cost: 6, faction: 'ued',
    isAir: true, gasCost: 4, supply: 4, requiredTech: 'ued_armory',
    special: '야마토 포 장착 초대형 전함. 조선소 필요.',
  },
  science_vessel: {
    type: 'science_vessel', name: '사이언스 베슬', attack: 1, defense: 3, cost: 4, faction: 'ued',
    isAir: true, antiAir: true, gasCost: 2, supply: 2, requiredTech: 'ued_lab',
    special: 'EMP 방출·방어 지원. 사이언스 팩 필요.',
  },
  missile_turret: {
    type: 'missile_turret', name: '미사일 포탑', attack: 1, defense: 4, cost: 3, faction: 'ued',
    isStructure: true, antiAir: true, supply: 0,
    special: '대공 방어 포탑. 공중 유닛 격파 특화.',
  },

  // 레이너 반군
  vulture: {
    type: 'vulture', name: '벌처', attack: 2, defense: 1, cost: 2, faction: 'raiders', supply: 1,
    special: '고속 호버바이크. 지뢰 부설, 빠르고 저렴.',
  },
  firebat: {
    type: 'firebat', name: '화염방사병', attack: 3, defense: 2, cost: 3, faction: 'raiders',
    gasCost: 1, supply: 1, requiredTech: 'raiders_garage',
    special: '근접 화염 전문가. 반군 차고 필요.',
  },
  dropship: {
    type: 'dropship', name: '수송선', attack: 1, defense: 3, cost: 3, faction: 'raiders',
    isAir: true, gasCost: 1, supply: 2, requiredTech: 'raiders_pad',
    special: '병력 수송 함선. 착륙장 필요.',
  },
  raiders_bunker: {
    type: 'raiders_bunker', name: '임시 벙커', attack: 1, defense: 3, cost: 2, faction: 'raiders',
    isStructure: true, antiAir: true, supply: 0,
    special: '반군 임시 방어 진지. 저렴하고 빠른 구축.',
  },

  // 테란 컨페더러시
  goliath: {
    type: 'goliath', name: '골리앗', attack: 2, defense: 3, cost: 4, faction: 'confederacy',
    antiAir: true, supply: 2,
    special: '중장갑 보행 병기. 대공·대지 양용 포격.',
  },
  wraith: {
    type: 'wraith', name: '레이스', attack: 3, defense: 1, cost: 3, faction: 'confederacy',
    isAir: true, antiAir: true, gasCost: 1, supply: 2, requiredTech: 'conf_port',
    special: '클로킹 전투기. 연방 항공기지 필요.',
  },
  confederate_ghost: {
    type: 'confederate_ghost', name: '연방 고스트', attack: 3, defense: 1, cost: 4, faction: 'confederacy',
    antiAir: true, gasCost: 2, supply: 1, requiredTech: 'conf_ops',
    special: '컨페더러시 핵 유도 요원. 연방 특수작전 필요.',
  },
  nuke_silo: {
    type: 'nuke_silo', name: '핵 사일로', attack: 1, defense: 5, cost: 5, faction: 'confederacy',
    isStructure: true, antiAir: true, supply: 0,
    special: '핵탄두 격납 요새. 압도적 방어와 대공 제압.',
  },
};

// ── Map ─────────────────────────────────────────────────────────────────────

export const INITIAL_TERRITORIES: Territory[] = [
  { id: 0,  name: '브락시스',      x: 200, y: 80,  adjacentIds: [1, 3, 4],               minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 1,  name: '안티가 프라임', x: 500, y: 80,  adjacentIds: [0, 2, 4, 5],            minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 2,  name: '타소니스',      x: 800, y: 80,  adjacentIds: [1, 5, 6],               minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 3,  name: '코랄',          x: 120, y: 210, adjacentIds: [0, 4, 7, 8],            minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 4,  name: '카스타나르',    x: 380, y: 210, adjacentIds: [0, 1, 3, 5, 8, 9],     minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 5,  name: '티라도르',      x: 620, y: 210, adjacentIds: [1, 2, 4, 6, 9, 10],    minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 6,  name: '모리아',        x: 880, y: 210, adjacentIds: [2, 5, 10, 11],          minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 7,  name: '마 사라',       x: 60,  y: 340, adjacentIds: [3, 8, 12, 13],          minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 8,  name: '마인호프',      x: 290, y: 340, adjacentIds: [3, 4, 7, 9, 12, 13],   minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 9,  name: '코어 월드',     x: 500, y: 340, adjacentIds: [4, 5, 8, 10, 13, 14],  minerals: 3, gasYield: 2, ownerId: null, units: [] },
  { id: 10, name: '프라이드워터',  x: 710, y: 340, adjacentIds: [5, 6, 9, 11, 14, 15],  minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 11, name: '도미니온',      x: 940, y: 340, adjacentIds: [6, 10, 15],             minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 12, name: '아이어',        x: 150, y: 470, adjacentIds: [7, 8, 13, 16],          minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 13, name: '솔라리스',      x: 380, y: 470, adjacentIds: [7, 8, 9, 12, 14, 16, 17], minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 14, name: '우모자',        x: 620, y: 470, adjacentIds: [9, 10, 13, 15, 17, 18], minerals: 1, gasYield: 1, ownerId: null, units: [] },
  { id: 15, name: '샤쿠라스',      x: 850, y: 470, adjacentIds: [10, 11, 14, 18],        minerals: 2, gasYield: 1, ownerId: null, units: [] },
  { id: 16, name: '칼디르',        x: 200, y: 600, adjacentIds: [12, 13, 17],            minerals: 1, gasYield: 0, ownerId: null, units: [] },
  { id: 17, name: '제루스',        x: 500, y: 600, adjacentIds: [13, 14, 16, 18],        minerals: 1, gasYield: 2, ownerId: null, units: [] },
  { id: 18, name: '차르',          x: 800, y: 600, adjacentIds: [14, 15, 17],            minerals: 2, gasYield: 1, ownerId: null, units: [] },
];

export const PLAYER_STARTS = [3, 18, 12, 2, 0, 15];
export const WIN_THRESHOLD = 11;

export const PLAYER_COLORS = [
  '#4da6ff', '#ff5f5f', '#4dff91', '#ffd84d', '#ff9f4d', '#c44dff',
];

export const AI_NAMES: Record<Faction, string[]> = {
  terran:      ['발레리안 맹스크', '맷 호너', '아르트홀루스'],
  zerg:        ['케리건', '이자샤', '아바투르'],
  protoss:     ['아르타니스', '카락스', '피닉스'],
  tal_darim:   ['알락', '마라', '케란'],
  primal_zerg: ['데하카', '크라이스', '드로그'],
  nerazim:     ['제라툴', '라작칼', '보라지'],
  ued:         ['듀갈 제독', '스투코프', '바렐라'],
  raiders:     ['짐 레이너', '타이커스 핀들레이', '노바 테라'],
  confederacy: ['에드먼드 듀크', '그린버그', '앤젤리나'],
};

export const AI_FACTIONS: Faction[] = [
  'terran', 'zerg', 'protoss', 'tal_darim', 'primal_zerg', 'nerazim',
  'ued', 'raiders', 'confederacy',
];

// ── Tech tree definitions ────────────────────────────────────────────────────

export const TECH_DEFS: TechDef[] = [
  // 테란 도미니온
  { id: 'terran_factory',   name: '공장 건설',        faction: 'terran',      mineralCost: 4, gasCost: 2, unlocksUnits: ['siege_tank'], description: '시즈 탱크 생산 가능' },
  { id: 'terran_starport',  name: '우주공항',          faction: 'terran',      mineralCost: 4, gasCost: 2, requires: 'terran_factory', unlocksUnits: ['viking'], description: '바이킹 전투기 생산 가능' },
  // 저그 군단
  { id: 'zerg_den',         name: '히드라리스크 굴',   faction: 'zerg',        mineralCost: 3, gasCost: 1, unlocksUnits: ['hydralisk'], description: '히드라리스크 생산 가능' },
  { id: 'zerg_spire',       name: '첨탑',              faction: 'zerg',        mineralCost: 4, gasCost: 2, requires: 'zerg_den', unlocksUnits: ['mutalisk'], description: '뮤탈리스크 생산 가능' },
  // 황금함대 프로토스
  { id: 'protoss_core',     name: '사이버네틱스 코어', faction: 'protoss',     mineralCost: 4, gasCost: 2, unlocksUnits: ['dragoon'], description: '드라군 생산 가능' },
  { id: 'protoss_stargate', name: '우주관문',          faction: 'protoss',     mineralCost: 4, gasCost: 2, requires: 'protoss_core', unlocksUnits: ['phoenix'], description: '불사조 생산 가능' },
  // 탈다림
  { id: 'tal_altar',        name: '빛의 제단',         faction: 'tal_darim',   mineralCost: 3, gasCost: 1, unlocksUnits: ['tal_archon'], description: '집정관 생산 가능' },
  { id: 'tal_void',         name: '공허 주조소',       faction: 'tal_darim',   mineralCost: 4, gasCost: 2, requires: 'tal_altar', unlocksUnits: ['void_ray'], description: '보이드레이 생산 가능' },
  // 원시저그
  { id: 'primal_evolution', name: '진화의 구덩이',     faction: 'primal_zerg', mineralCost: 3, gasCost: 1, unlocksUnits: ['primal_raptor'], description: '맹금 생산 가능' },
  { id: 'primal_hive',      name: '원시 군락',         faction: 'primal_zerg', mineralCost: 5, gasCost: 3, requires: 'primal_evolution', unlocksUnits: ['leviathan'], description: '리바이어던 생산 가능' },
  // 네라짐
  { id: 'nera_shrine',      name: '암흑 성소',         faction: 'nerazim',     mineralCost: 3, gasCost: 2, unlocksUnits: ['stalker'], description: '추적자 생산 가능' },
  { id: 'nera_oracle',      name: '예언자 제단',       faction: 'nerazim',     mineralCost: 4, gasCost: 2, requires: 'nera_shrine', unlocksUnits: ['oracle'], description: '예언자 생산 가능' },
  // UED 지구 연합
  { id: 'ued_armory',       name: 'UED 조선소',        faction: 'ued',         mineralCost: 5, gasCost: 3, unlocksUnits: ['battlecruiser'], description: '전투순양함 생산 가능' },
  { id: 'ued_lab',          name: '사이언스 팩',       faction: 'ued',         mineralCost: 4, gasCost: 2, requires: 'ued_armory', unlocksUnits: ['science_vessel'], description: '사이언스 베슬 생산 가능' },
  // 레이너 반군
  { id: 'raiders_garage',   name: '반군 차고',         faction: 'raiders',     mineralCost: 3, gasCost: 1, unlocksUnits: ['firebat'], description: '화염방사병 생산 가능' },
  { id: 'raiders_pad',      name: '반군 착륙장',       faction: 'raiders',     mineralCost: 4, gasCost: 2, requires: 'raiders_garage', unlocksUnits: ['dropship'], description: '수송선 생산 가능' },
  // 테란 컨페더러시
  { id: 'conf_port',        name: '연방 항공기지',     faction: 'confederacy', mineralCost: 4, gasCost: 2, unlocksUnits: ['wraith'], description: '레이스 생산 가능' },
  { id: 'conf_ops',         name: '연방 특수작전부',   faction: 'confederacy', mineralCost: 5, gasCost: 3, requires: 'conf_port', unlocksUnits: ['confederate_ghost'], description: '연방 고스트 생산 가능' },
  // 무기/방어 업그레이드 (공통)
  { id: 'upgrade_weapons_1', name: '무기 개량 I',      mineralCost: 3, gasCost: 1, upgradeType: 'weapons', description: '전 유닛 공격력 +1' },
  { id: 'upgrade_weapons_2', name: '무기 개량 II',     mineralCost: 5, gasCost: 2, requires: 'upgrade_weapons_1', upgradeType: 'weapons', description: '전 유닛 공격력 +1' },
  { id: 'upgrade_weapons_3', name: '무기 개량 III',    mineralCost: 7, gasCost: 3, requires: 'upgrade_weapons_2', upgradeType: 'weapons', description: '전 유닛 공격력 +1' },
  { id: 'upgrade_armor_1',   name: '장갑 강화 I',      mineralCost: 3, gasCost: 1, upgradeType: 'armor', description: '전 유닛 방어력 +1' },
  { id: 'upgrade_armor_2',   name: '장갑 강화 II',     mineralCost: 5, gasCost: 2, requires: 'upgrade_armor_1', upgradeType: 'armor', description: '전 유닛 방어력 +1' },
  { id: 'upgrade_armor_3',   name: '장갑 강화 III',    mineralCost: 7, gasCost: 3, requires: 'upgrade_armor_2', upgradeType: 'armor', description: '전 유닛 방어력 +1' },
];

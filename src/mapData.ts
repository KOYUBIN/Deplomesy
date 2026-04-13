// Client-side map constants (mirrors server/src/mapData.ts)
import type { UnitType, UnitDef } from './types';

export const WIN_THRESHOLD = 11;

export const FACTION_COLORS: Record<string, string> = {
  terran:      '#4da6ff',
  zerg:        '#b44fff',
  protoss:     '#ffd84d',
  tal_darim:   '#ff3333',
  primal_zerg: '#4dff91',
  nerazim:     '#9966cc',
};

export const PLAYER_COLORS = [
  '#4da6ff', '#ff5f5f', '#4dff91', '#ffd84d', '#ff9f4d', '#c44dff',
];

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  // --- Generic (no faction) ---
  infantry: {
    type: 'infantry', name: '보병', attack: 1, defense: 1, cost: 1,
    special: '기본 보병. 저렴하고 수급이 빠름.',
  },
  archer: {
    type: 'archer', name: '궁병', attack: 2, defense: 1, cost: 2, antiAir: true,
    special: '원거리 공격. 공중 유닛 대응 가능.',
  },

  // --- Terran ---
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

  // --- Zerg ---
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

  // --- Protoss ---
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

  // --- Tal\'darim ---
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

  // --- Primal Zerg ---
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

  // --- Nerazim ---
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

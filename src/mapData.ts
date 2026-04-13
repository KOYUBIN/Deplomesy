// Client-side map constants (mirrors server/src/mapData.ts)
import type { UnitType, UnitDef } from './types';

export const WIN_THRESHOLD = 11;

export const FACTION_COLORS: Record<string, string> = {
  terran:  '#4da6ff',
  zerg:    '#b44fff',
  protoss: '#ffd84d',
};

export const PLAYER_COLORS = [
  '#4da6ff', '#ff5f5f', '#4dff91', '#ffd84d', '#ff9f4d', '#c44dff',
];

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  infantry:   { type: 'infantry',   name: '보병',         attack: 1, defense: 1, cost: 1,
                special: '기본 보병. 저렴하고 수급이 빠름.' },
  archer:     { type: 'archer',     name: '궁병',         attack: 2, defense: 1, cost: 2,
                special: '원거리 공격. 공격력 우위.' },
  marine:     { type: 'marine',     name: '해병',         attack: 2, defense: 2, cost: 3, faction: 'terran',
                special: '테란 기본 정예병. 공/수 균형.' },
  siege_tank: { type: 'siege_tank', name: '시즈 탱크',    attack: 2, defense: 5, cost: 5, faction: 'terran',
                special: '방어 시 최강. 수비에 특화.' },
  zergling:   { type: 'zergling',   name: '저글링',       attack: 1, defense: 1, cost: 1, faction: 'zerg', zergDouble: true,
                special: '1미네랄에 2기 징집. 떼로 몰아붙여라.' },
  hydralisk:  { type: 'hydralisk',  name: '히드라리스크', attack: 3, defense: 2, cost: 4, faction: 'zerg',
                special: '고화력 원거리. 최고의 공격 유닛.' },
  zealot:     { type: 'zealot',     name: '질럿',         attack: 3, defense: 2, cost: 3, faction: 'protoss',
                special: '돌격 전사. 근접 공격 최강.' },
  dragoon:    { type: 'dragoon',    name: '드라군',       attack: 2, defense: 4, cost: 4, faction: 'protoss',
                special: '보호막 장갑. 방어와 원거리 공격.' },
};

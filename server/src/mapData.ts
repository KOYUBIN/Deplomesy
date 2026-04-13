import type { Territory, Faction } from './types';

export const INITIAL_TERRITORIES: Territory[] = [
  { id: 0,  name: '브락시스',      x: 200, y: 80,  adjacentIds: [1, 3, 4],              minerals: 1, ownerId: null, armies: 0 },
  { id: 1,  name: '안티가 프라임', x: 500, y: 80,  adjacentIds: [0, 2, 4, 5],           minerals: 2, ownerId: null, armies: 0 },
  { id: 2,  name: '타소니스',      x: 800, y: 80,  adjacentIds: [1, 5, 6],              minerals: 1, ownerId: null, armies: 0 },
  { id: 3,  name: '코랄',          x: 120, y: 210, adjacentIds: [0, 4, 7, 8],           minerals: 2, ownerId: null, armies: 0 },
  { id: 4,  name: '카스타나르',    x: 380, y: 210, adjacentIds: [0, 1, 3, 5, 8, 9],    minerals: 1, ownerId: null, armies: 0 },
  { id: 5,  name: '티라도르',      x: 620, y: 210, adjacentIds: [1, 2, 4, 6, 9, 10],   minerals: 1, ownerId: null, armies: 0 },
  { id: 6,  name: '모리아',        x: 880, y: 210, adjacentIds: [2, 5, 10, 11],         minerals: 2, ownerId: null, armies: 0 },
  { id: 7,  name: '마 사라',       x: 60,  y: 340, adjacentIds: [3, 8, 12, 13],         minerals: 1, ownerId: null, armies: 0 },
  { id: 8,  name: '마인호프',      x: 290, y: 340, adjacentIds: [3, 4, 7, 9, 12, 13],  minerals: 1, ownerId: null, armies: 0 },
  { id: 9,  name: '코어 월드',     x: 500, y: 340, adjacentIds: [4, 5, 8, 10, 13, 14], minerals: 3, ownerId: null, armies: 0 },
  { id: 10, name: '프라이드워터',  x: 710, y: 340, adjacentIds: [5, 6, 9, 11, 14, 15], minerals: 1, ownerId: null, armies: 0 },
  { id: 11, name: '도미니온',      x: 940, y: 340, adjacentIds: [6, 10, 15],            minerals: 2, ownerId: null, armies: 0 },
  { id: 12, name: '아이어',        x: 150, y: 470, adjacentIds: [7, 8, 13, 16],         minerals: 2, ownerId: null, armies: 0 },
  { id: 13, name: '솔라리스',      x: 380, y: 470, adjacentIds: [7, 8, 9, 12, 14, 16, 17], minerals: 1, ownerId: null, armies: 0 },
  { id: 14, name: '우모자',        x: 620, y: 470, adjacentIds: [9, 10, 13, 15, 17, 18],minerals: 1, ownerId: null, armies: 0 },
  { id: 15, name: '샤쿠라스',      x: 850, y: 470, adjacentIds: [10, 11, 14, 18],       minerals: 2, ownerId: null, armies: 0 },
  { id: 16, name: '칼디르',        x: 200, y: 600, adjacentIds: [12, 13, 17],           minerals: 1, ownerId: null, armies: 0 },
  { id: 17, name: '제루스',        x: 500, y: 600, adjacentIds: [13, 14, 16, 18],       minerals: 1, ownerId: null, armies: 0 },
  { id: 18, name: '차르',          x: 800, y: 600, adjacentIds: [14, 15, 17],           minerals: 2, ownerId: null, armies: 0 },
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

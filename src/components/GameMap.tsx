import React from 'react';
import type { GameState, Territory, ClientUIState } from '../types';

const TERRITORY_RADIUS = 36;
const NEUTRAL_COLOR = '#444';

interface Props {
  state: GameState;
  uiState: ClientUIState;
  myPlayerIndex: number;
  isMyTurn: boolean;
  onTerritoryClick: (id: number) => void;
}

function getTerritoryColor(territory: Territory, state: GameState): string {
  if (territory.ownerId === null) return NEUTRAL_COLOR;
  return state.players[territory.ownerId]?.color ?? NEUTRAL_COLOR;
}

function canMoveTo(
  territories: Territory[],
  players: GameState['players'],
  fromId: number,
  toId: number,
  pid: number
): boolean {
  const from = territories[fromId];
  const to = territories[toId];
  if (!from.adjacentIds.includes(toId)) return false;
  if (from.ownerId !== pid) return false;
  if (from.armies < 2) return false;
  if (to.ownerId === null || to.ownerId === pid) return true;
  return players[pid].diplomacy[to.ownerId] !== 'ally';
}

const STARS = [
  [50,30],[150,90],[300,20],[450,60],[600,15],[750,80],[900,40],
  [80,150],[250,180],[400,130],[550,160],[700,120],[920,170],
  [30,250],[170,300],[320,260],[480,290],[650,240],[850,280],
  [100,380],[280,420],[430,370],[580,410],[730,360],[950,400],
  [60,500],[200,540],[370,480],[520,530],[680,510],[820,490],
  [40,600],[190,630],[340,590],[490,650],[650,610],[800,640],[960,600],
];

export default function GameMap({ state, uiState, myPlayerIndex, isMyTurn, onTerritoryClick }: Props) {
  const { territories, players } = state;
  const { moveFrom, selectedTerritoryId } = uiState;

  // Build edges (deduped)
  const drawnEdges = new Set<string>();
  const edges: [Territory, Territory][] = [];
  for (const t of territories) {
    for (const adjId of t.adjacentIds) {
      const key = [Math.min(t.id, adjId), Math.max(t.id, adjId)].join('-');
      if (!drawnEdges.has(key)) {
        drawnEdges.add(key);
        edges.push([t, territories[adjId]]);
      }
    }
  }

  return (
    <svg
      viewBox="0 0 1000 680"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="스타크래프트 디플로메시 지도"
    >
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0d1033" />
          <stop offset="100%" stopColor="#050510" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="1000" height="680" fill="url(#bg-grad)" />

      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.5 : 1} fill="#ffffff33" />
      ))}

      {/* Connection lines */}
      {edges.map(([a, b]) => (
        <line key={`${a.id}-${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="#888" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.45}
        />
      ))}

      {/* Territories */}
      {territories.map((t) => {
        const isSelected = selectedTerritoryId === t.id || moveFrom === t.id;
        const isTarget = moveFrom !== null && canMoveTo(territories, players, moveFrom, t.id, myPlayerIndex);
        const isOwned = t.ownerId === myPlayerIndex;
        const color = getTerritoryColor(t, state);
        const clickable = isMyTurn && (isOwned || isTarget);

        return (
          <g
            key={t.id}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
            onClick={() => clickable && onTerritoryClick(t.id)}
            tabIndex={clickable ? 0 : -1}
            role={clickable ? 'button' : undefined}
            aria-label={`${t.name}: 군대 ${t.armies}${t.ownerId !== null ? `, 소유: ${players[t.ownerId]?.name}` : ' (중립)'}`}
            onKeyDown={(e) => e.key === 'Enter' && clickable && onTerritoryClick(t.id)}
          >
            {/* Selection ring */}
            {isSelected && (
              <circle cx={t.x} cy={t.y} r={TERRITORY_RADIUS + 6}
                fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.8} filter="url(#glow)"
              />
            )}
            {/* Attack target ring */}
            {isTarget && !isSelected && (
              <circle cx={t.x} cy={t.y} r={TERRITORY_RADIUS + 5}
                fill="none" stroke="#ff4444" strokeWidth={2.5} strokeDasharray="6 3" opacity={0.9}
              />
            )}

            {/* Main circle */}
            <circle cx={t.x} cy={t.y} r={TERRITORY_RADIUS}
              fill={color}
              fillOpacity={t.ownerId === null ? 0.3 : 0.72}
              stroke={isSelected ? '#fff' : isTarget ? '#ff4444' : '#ffffff33'}
              strokeWidth={isSelected || isTarget ? 2.5 : 1.5}
            />

            {/* Name */}
            <text x={t.x} y={t.y - 10} textAnchor="middle"
              fill="#fff" fontSize={9.5} fontWeight="bold" fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {t.name}
            </text>

            {/* Army count */}
            <text x={t.x} y={t.y + 7} textAnchor="middle"
              fill="#fff" fontSize={15} fontWeight="bold" fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {t.armies}
            </text>

            {/* Mineral dots */}
            <text
              x={t.x + TERRITORY_RADIUS - 5} y={t.y - TERRITORY_RADIUS + 10}
              textAnchor="middle" fill="#7df" fontSize={9} fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Array(t.minerals).fill('◆').join('')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

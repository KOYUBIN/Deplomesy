import React from 'react';
import type { GameState, Territory } from '../types';
import { canMoveTo } from '../gameLogic';

const TERRITORY_RADIUS = 36;
const NEUTRAL_COLOR = '#444';
const BORDER_COLOR = '#888';

interface Props {
  state: GameState;
  onTerritoryClick: (id: number) => void;
  isAITurn: boolean;
}

function getColor(territory: Territory, state: GameState): string {
  if (territory.ownerId === null) return NEUTRAL_COLOR;
  return state.players[territory.ownerId]?.color ?? NEUTRAL_COLOR;
}

function isReachable(state: GameState, id: number): boolean {
  if (state.moveFrom === null) return false;
  return canMoveTo(
    state.territories,
    state.players,
    state.moveFrom,
    id,
    state.currentPlayerId
  );
}

export default function GameMap({ state, onTerritoryClick, isAITurn }: Props) {
  const { territories, players, selectedTerritoryId, moveFrom } = state;
  const currentPlayer = players[state.currentPlayerId];

  // Build connection lines (avoid duplicates)
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
      {/* Starfield background */}
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0d1033" />
          <stop offset="100%" stopColor="#050510" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1000" height="680" fill="url(#bg-grad)" />

      {/* Static stars */}
      {[
        [50,30],[150,90],[300,20],[450,60],[600,15],[750,80],[900,40],
        [80,150],[250,180],[400,130],[550,160],[700,120],[920,170],
        [30,250],[170,300],[320,260],[480,290],[650,240],[850,280],
        [100,380],[280,420],[430,370],[580,410],[730,360],[950,400],
        [60,500],[200,540],[370,480],[520,530],[680,510],[820,490],
        [40,600],[190,630],[340,590],[490,650],[650,610],[800,640],[960,600],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={Math.random() < 0.3 ? 1.5 : 1} fill="#ffffff44" />
      ))}

      {/* Connection lines */}
      {edges.map(([a, b]) => (
        <line
          key={`${a.id}-${b.id}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke={BORDER_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      ))}

      {/* Territories */}
      {territories.map((t) => {
        const isSelected = selectedTerritoryId === t.id || moveFrom === t.id;
        const isTarget = isReachable(state, t.id);
        const isOwned = t.ownerId === state.currentPlayerId;
        const color = getColor(t, state);
        const canClick = !isAITurn && (isOwned || isTarget);
        const ownerName = t.ownerId !== null ? players[t.ownerId]?.name : null;

        return (
          <g
            key={t.id}
            style={{ cursor: canClick ? 'pointer' : 'default' }}
            onClick={() => !isAITurn && onTerritoryClick(t.id)}
            role="button"
            aria-label={`${t.name}${ownerName ? ` (${ownerName})` : ' (중립)'} 군대: ${t.armies}`}
            tabIndex={canClick ? 0 : -1}
            onKeyDown={(e) => e.key === 'Enter' && !isAITurn && onTerritoryClick(t.id)}
          >
            {/* Glow ring when selected or target */}
            {isSelected && (
              <circle
                cx={t.x} cy={t.y}
                r={TERRITORY_RADIUS + 6}
                fill="none"
                stroke="#ffffff"
                strokeWidth={3}
                opacity={0.8}
                filter="url(#glow)"
              />
            )}
            {isTarget && !isSelected && (
              <circle
                cx={t.x} cy={t.y}
                r={TERRITORY_RADIUS + 5}
                fill="none"
                stroke="#ff4444"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                opacity={0.9}
              />
            )}

            {/* Territory circle */}
            <circle
              cx={t.x} cy={t.y}
              r={TERRITORY_RADIUS}
              fill={color}
              fillOpacity={t.ownerId === null ? 0.35 : 0.75}
              stroke={isSelected ? '#fff' : isTarget ? '#ff4444' : '#ffffff44'}
              strokeWidth={isSelected || isTarget ? 2.5 : 1.5}
            />

            {/* Territory name */}
            <text
              x={t.x} y={t.y - 10}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={10}
              fontWeight="bold"
              fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {t.name}
            </text>

            {/* Army count */}
            <text
              x={t.x} y={t.y + 7}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={15}
              fontWeight="bold"
              fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {t.armies}
            </text>

            {/* Mineral indicator */}
            <text
              x={t.x + TERRITORY_RADIUS - 6}
              y={t.y - TERRITORY_RADIUS + 10}
              textAnchor="middle"
              fill="#7df"
              fontSize={9}
              fontFamily="monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Array(t.minerals).fill('◆').join('')}
            </text>
          </g>
        );
      })}

      {/* Turn indicator */}
      <rect x={10} y={10} width={240} height={36} rx={6} fill="#00000088" />
      <text x={20} y={33} fill={isAITurn ? '#aaa' : currentPlayer.color} fontSize={14} fontFamily="monospace" fontWeight="bold">
        {isAITurn
          ? `⏳ ${currentPlayer.name} 행동 중...`
          : `▶ ${currentPlayer.name}의 턴 (턴 ${state.turn})`}
      </text>
    </svg>
  );
}

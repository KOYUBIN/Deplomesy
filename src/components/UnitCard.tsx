import React from 'react';
import type { UnitType } from '../types';
import { UNIT_DEFS } from '../mapData';

interface Props {
  type: UnitType;
  selected: boolean;
  canAfford: boolean;
  isZergBonus?: boolean;
  onClick: () => void;
}

export default function UnitCard({ type, selected, canAfford, isZergBonus, onClick }: Props) {
  const def = UNIT_DEFS[type];

  const categoryIcon = def.isAir ? '✈' : def.isStructure ? '🏗' : '⚔';

  let bg = '#141824';
  if (selected)       bg = '#152c3a';
  else if (!canAfford) bg = '#0e101a';
  else if (def.isAir)  bg = '#0c1e33';
  else if (def.isStructure) bg = '#1e140a';

  const borderColor = selected
    ? '#5cf'
    : canAfford
    ? (def.isAir ? '#1e4a78' : def.isStructure ? '#5a3a1a' : '#253050')
    : '#1c1e2a';

  return (
    <button
      className="unit-card"
      onClick={canAfford ? onClick : undefined}
      style={{
        background: bg,
        borderColor,
        borderWidth: selected ? 2 : 1,
        opacity: canAfford ? 1 : 0.4,
        cursor: canAfford ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 10px ${borderColor}66` : 'none',
      }}
    >
      {/* Header */}
      <div className="unit-card-header">
        <span className="unit-card-icon">{categoryIcon}</span>
        <span className="unit-card-name">{def.name}</span>
        <span className="unit-card-cost" style={{ color: canAfford ? '#6cf' : '#336' }}>
          {def.cost}💎
          {isZergBonus && <span className="unit-card-x2">×2</span>}
        </span>
      </div>

      {/* Stats */}
      <div className="unit-card-stats">
        <span style={{ color: '#f87' }}>⚔{def.attack}</span>
        <span style={{ color: '#87f' }}>🛡{def.defense}</span>
        {def.antiAir && <span className="unit-card-tag" style={{ color: '#7cf', borderColor: '#1a4060' }}>대공</span>}
      </div>

      {/* Special text — only when selected */}
      {selected && def.special && (
        <div className="unit-card-special">{def.special}</div>
      )}
    </button>
  );
}

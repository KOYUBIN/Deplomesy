import React from 'react';
import type { UnitType } from '../types';
import { UNIT_DEFS } from '../mapData';

interface Props {
  type: UnitType;
  count: number;
}

export default function UnitToken({ type, count }: Props) {
  const def = UNIT_DEFS[type];

  const categoryIcon = def.isAir ? '✈' : def.isStructure ? '🏗' : '⚔';
  const bg      = def.isAir ? '#0c1e33' : def.isStructure ? '#1e140a' : '#111827';
  const border  = def.isAir ? '#1e4a78' : def.isStructure ? '#5a3a1a' : '#253050';
  const icoClr  = def.isAir ? '#4ac'   : def.isStructure ? '#b84'    : '#88a';

  return (
    <div className="unit-token" style={{ background: bg, borderColor: border }}>
      {/* Top row: icon · name · count badge */}
      <div className="unit-token-header">
        <span style={{ color: icoClr, fontSize: 9 }}>{categoryIcon}</span>
        <span className="unit-token-name">{def.name}</span>
        <span className="unit-token-count">{count}</span>
      </div>
      {/* Bottom row: ATK · DEF · AA tag */}
      <div className="unit-token-stats">
        <span style={{ color: '#f87' }}>⚔{def.attack}</span>
        <span style={{ color: '#87f' }}>🛡{def.defense}</span>
        {def.antiAir && <span className="unit-token-aa">AA</span>}
        {def.zergDouble && <span className="unit-token-x2">×2</span>}
      </div>
    </div>
  );
}

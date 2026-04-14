import React, { useState } from 'react';
import type { GameState, DiplomacyStatus, UnitType, UnitCount } from '../types';
import { WIN_THRESHOLD, UNIT_DEFS } from '../mapData';

interface Props {
  state: GameState;
  myPlayerIndex: number;
  isMyTurn: boolean;
  isAITurn: boolean;
  onDiplomacy: (targetId: number, status: DiplomacyStatus) => void;
  onRecruit: (territoryId: number, unitType: UnitType, count: number) => void;
  onEndTurn: () => void;
}

function totalCount(units: UnitCount[]): number {
  return units.reduce((s, u) => s + u.count, 0);
}

function totalAttack(units: UnitCount[]): number {
  return units.reduce((s, u) => s + UNIT_DEFS[u.type].attack * u.count, 0);
}

function totalDefense(units: UnitCount[]): number {
  return units.reduce((s, u) => s + UNIT_DEFS[u.type].defense * u.count, 0);
}

function availableUnits(faction: string): UnitType[] {
  const all: UnitType[] = [
    'infantry', 'archer',
    'marine', 'siege_tank', 'viking', 'bunker',
    'zergling', 'hydralisk', 'mutalisk', 'spine_crawler',
    'zealot', 'dragoon', 'phoenix', 'photon_cannon',
    'fanatical', 'void_ray', 'tal_archon', 'xel_naga_tower',
    'primal_zergling', 'primal_raptor', 'leviathan', 'primal_pit',
    'dark_templar', 'stalker', 'oracle', 'void_gate',
    'ghost', 'battlecruiser', 'science_vessel', 'missile_turret',
    'vulture', 'firebat', 'dropship', 'raiders_bunker',
    'goliath', 'wraith', 'confederate_ghost', 'nuke_silo',
  ];
  return all.filter((t) => {
    const def = UNIT_DEFS[t];
    return !def.faction || def.faction === faction;
  });
}

const FACTION_LABEL_MAP: Record<string, string> = {
  terran: '테란',
  zerg: '저그',
  protoss: '프로토스',
  tal_darim: '탈다림',
  primal_zerg: '원시저그',
  nerazim: '네라짐',
  ued: 'UED',
  raiders: '레이너 반군',
  confederacy: '컨페더러시',
};

export default function SidePanel({
  state,
  myPlayerIndex,
  isMyTurn,
  isAITurn,
  onDiplomacy,
  onRecruit,
  onEndTurn,
}: Props) {
  const [tab, setTab] = useState<'status' | 'diplomacy' | 'log'>('status');
  const [recruitId, setRecruitId] = useState<number | null>(null);
  const [recruitUnitType, setRecruitUnitType] = useState<UnitType>('infantry');
  const [recruitCount, setRecruitCount] = useState(1);

  const me = state.players[myPlayerIndex];
  const myTerritories = state.territories.filter((t) => t.ownerId === myPlayerIndex);
  const currentPlayer = state.players[state.currentPlayerId];

  const dipLabel: Record<DiplomacyStatus, string> = {
    ally: '🤝 동맹', neutral: '⚪ 중립', war: '⚔ 전쟁',
  };

  const factionLabel = (f: string) => FACTION_LABEL_MAP[f] ?? f;

  if (!me) return null;

  const myUnits = availableUnits(me.faction);
  const selectedDef = UNIT_DEFS[recruitUnitType];
  const actualCost = selectedDef.cost;
  const maxAffordable = Math.floor(me.minerals / actualCost);
  const safeCount = Math.min(recruitCount, maxAffordable);

  const actualRecruited = (me.faction === 'zerg' && selectedDef.zergDouble) ? safeCount * 2 : safeCount;

  function openRecruit(id: number) {
    const affordable = myUnits.find((u) => UNIT_DEFS[u].cost <= me.minerals) ?? myUnits[0];
    setRecruitUnitType(affordable);
    setRecruitCount(1);
    setRecruitId(id);
  }

  function handleUnitTypeChange(ut: UnitType) {
    setRecruitUnitType(ut);
    setRecruitCount(1);
  }

  const totalMyUnits = myTerritories.reduce((s, t) => s + totalCount(t.units), 0);
  const totalMyAtk   = myTerritories.reduce((s, t) => s + totalAttack(t.units), 0);

  // Categorize available units into ground / air / structure
  const groundUnits    = myUnits.filter((ut) => !UNIT_DEFS[ut].isAir && !UNIT_DEFS[ut].isStructure);
  const airUnits       = myUnits.filter((ut) => UNIT_DEFS[ut].isAir);
  const structureUnits = myUnits.filter((ut) => UNIT_DEFS[ut].isStructure);

  function renderUnitButton(ut: UnitType) {
    const d = UNIT_DEFS[ut];
    const isSelected = ut === recruitUnitType;
    const canAfford = d.cost <= me.minerals;
    return (
      <button
        key={ut}
        onClick={() => handleUnitTypeChange(ut)}
        style={{
          padding: '3px 7px',
          fontSize: 11,
          border: isSelected ? '2px solid #7df' : '1px solid #555',
          borderRadius: 4,
          background: isSelected ? '#1a3a4a' : '#1e1e2e',
          color: canAfford ? '#eee' : '#666',
          cursor: canAfford ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {d.isAir && <span style={{ fontSize: 10 }}>✈</span>}
        {d.isStructure && <span style={{ fontSize: 10 }}>🏗</span>}
        {d.name}
        <span style={{ color: '#7df', marginLeft: 4 }}>{d.cost}💎</span>
        {d.zergDouble && <span style={{ color: '#f7a', marginLeft: 2 }}>×2</span>}
      </button>
    );
  }

  return (
    <div className="side-panel">
      {/* My player bar */}
      <div className="player-bar" style={{ borderColor: me.color }}>
        <div className="player-bar-name" style={{ color: me.color }}>
          {me.name}
          <span className="faction-badge">{factionLabel(me.faction)}</span>
        </div>
        <div className="player-bar-stats">
          <span>💎 {me.minerals}</span>
          <span>🗺 {myTerritories.length}/{WIN_THRESHOLD}</span>
          <span>⚔ {totalMyAtk} ({totalMyUnits}기)</span>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="turn-indicator" style={{ borderColor: currentPlayer?.color }}>
        {isAITurn
          ? `⏳ ${currentPlayer?.name} (AI) 행동 중...`
          : isMyTurn
          ? '▶ 내 턴'
          : `⌛ ${currentPlayer?.name}의 턴`}
        <span className="turn-number">턴 {state.turn}</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['status', 'diplomacy', 'log'] as const).map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'status' ? '현황' : t === 'diplomacy' ? '외교' : '로그'}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* STATUS TAB */}
        {tab === 'status' && (
          <div>
            <h3 className="section-title">세력 현황</h3>
            {state.players.map((p) => {
              const count = state.territories.filter((t) => t.ownerId === p.id).length;
              return (
                <div key={p.id} className={`player-row ${!p.isAlive ? 'dead' : ''}`}>
                  <div className="player-row-header">
                    <span style={{ color: p.color }} className="player-row-name">
                      {!p.isAlive ? '☠ ' : p.id === state.currentPlayerId ? '▶ ' : ''}
                      {p.name}
                      {p.id === myPlayerIndex ? ' (나)' : p.isAI ? ' [AI]' : ''}
                    </span>
                    <span className="player-row-count">{count}행성</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(count / 19) * 100}%`, backgroundColor: p.color }} />
                    <div className="progress-target" style={{ left: `${(WIN_THRESHOLD / 19) * 100}%` }} />
                  </div>
                </div>
              );
            })}

            {isMyTurn && (
              <>
                <h3 className="section-title" style={{ marginTop: 16 }}>내 행성 (클릭해서 징집)</h3>
                <div className="territory-list">
                  {myTerritories.map((t) => {
                    const cnt = totalCount(t.units);
                    const atk = totalAttack(t.units);
                    const def = totalDefense(t.units);
                    return (
                      <div key={t.id} className="territory-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="territory-row-name">{t.name}</div>
                          {cnt > 0 && (
                            <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>
                              {t.units.map((u) => `${UNIT_DEFS[u.type].name}×${u.count}`).join(', ')}
                              {'  '}⚔{atk}/🛡{def}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 11, color: '#ccc', marginRight: 6 }}>
                          {cnt}기 💎{t.minerals}
                        </div>
                        <button
                          className="recruit-mini-btn"
                          onClick={() => openRecruit(t.id)}
                          disabled={me.minerals < 1}
                        >
                          +징집
                        </button>
                      </div>
                    );
                  })}
                </div>

                {recruitId !== null && (
                  <div className="recruit-panel">
                    <div className="recruit-title">
                      {state.territories[recruitId]?.name} 징집
                    </div>

                    {/* Unit type selector — grouped by category */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>유닛 선택:</div>

                      {groundUnits.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>🗡 지상</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {groundUnits.map(renderUnitButton)}
                          </div>
                        </div>
                      )}

                      {airUnits.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>✈ 공중</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {airUnits.map(renderUnitButton)}
                          </div>
                        </div>
                      )}

                      {structureUnits.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>🏗 건물</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {structureUnits.map(renderUnitButton)}
                          </div>
                        </div>
                      )}

                      {selectedDef.special && (
                        <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, fontStyle: 'italic' }}>
                          {selectedDef.special}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>
                        ⚔{selectedDef.attack} / 🛡{selectedDef.defense} &nbsp;|&nbsp; 비용 {selectedDef.cost}💎/기
                        {selectedDef.antiAir && <span style={{ color: '#adf', marginLeft: 6 }}>대공</span>}
                      </div>
                    </div>

                    {/* Count selector */}
                    <div className="recruit-row">
                      <button onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}>-</button>
                      <span>
                        {safeCount}기 징집
                        {actualRecruited !== safeCount ? ` → ${actualRecruited}기 (×2 보너스)` : ''}
                        {' '}(비용: {safeCount * actualCost}💎)
                      </span>
                      <button onClick={() => setRecruitCount(Math.min(Math.max(1, maxAffordable), recruitCount + 1))}>+</button>
                    </div>

                    <div className="recruit-actions">
                      <button
                        className="confirm-btn"
                        disabled={safeCount < 1 || safeCount * actualCost > me.minerals}
                        onClick={() => {
                          onRecruit(recruitId, recruitUnitType, safeCount);
                          setRecruitId(null);
                        }}
                      >
                        징집
                      </button>
                      <button className="cancel-btn" onClick={() => setRecruitId(null)}>취소</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DIPLOMACY TAB */}
        {tab === 'diplomacy' && (
          <div>
            <h3 className="section-title">외교 관계</h3>
            <p className="dip-hint">동맹은 상호 공격 불가. 전쟁은 즉시 교전 상태.</p>
            {state.players.filter((p) => p.id !== myPlayerIndex && p.isAlive).map((p) => {
              const rel = me.diplomacy[p.id] ?? 'neutral';
              return (
                <div key={p.id} className="dip-row">
                  <div className="dip-row-info">
                    <span style={{ color: p.color }}>
                      {p.name}{p.isAI ? ' [AI]' : ''}
                    </span>
                    <span className="dip-status">{dipLabel[rel]}</span>
                  </div>
                  {isMyTurn && (
                    <div className="dip-actions">
                      {rel !== 'ally'    && <button className="dip-btn ally"    onClick={() => onDiplomacy(p.id, 'ally')}>동맹</button>}
                      {rel !== 'neutral' && <button className="dip-btn neutral" onClick={() => onDiplomacy(p.id, 'neutral')}>중립</button>}
                      {rel !== 'war'     && <button className="dip-btn war"     onClick={() => onDiplomacy(p.id, 'war')}>선전포고</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LOG TAB */}
        {tab === 'log' && (
          <div className="log-panel">
            {[...state.log].reverse().map((entry, i) => (
              <div key={i} className="log-entry">{entry}</div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isMyTurn && !isAITurn && (
        <button className="end-turn-btn" onClick={onEndTurn}>턴 종료 →</button>
      )}
      {!isMyTurn && (
        <div className="ai-indicator">
          {isAITurn ? '⏳ AI 행동 중...' : `⌛ ${currentPlayer?.name}의 턴을 기다리는 중...`}
        </div>
      )}
    </div>
  );
}

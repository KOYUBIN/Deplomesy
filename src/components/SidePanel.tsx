import React, { useState } from 'react';
import type { GameState, DiplomacyStatus, UnitType, UnitCount, Territory } from '../types';
import { WIN_THRESHOLD, UNIT_DEFS } from '../mapData';
import UnitToken from './UnitToken';
import UnitCard from './UnitCard';

interface Props {
  state: GameState;
  myPlayerIndex: number;
  isMyTurn: boolean;
  isAITurn: boolean;
  onDiplomacy: (targetId: number, status: DiplomacyStatus) => void;
  onRecruit: (territoryId: number, unitType: UnitType, count: number) => void;
  onEndTurn: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

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
    const d = UNIT_DEFS[t];
    return !d.faction || d.faction === faction;
  });
}

const FACTION_LABEL: Record<string, string> = {
  terran: '테란', zerg: '저그', protoss: '프로토스',
  tal_darim: '탈다림', primal_zerg: '원시저그', nerazim: '네라짐',
  ued: 'UED', raiders: '레이너 반군', confederacy: '컨페더러시',
};

// ── Sub-components ─────────────────────────────────────────────────────────

/** Board-game style card for one territory. */
function TerritoryCard({
  territory,
  myColor,
  enemies,
  minerals,
  onRecruit,
  canRecruit,
}: {
  territory: Territory;
  myColor: string;
  enemies: boolean;    // any adjacent enemy?
  minerals: number;
  onRecruit: () => void;
  canRecruit: boolean;
}) {
  const atk = totalAttack(territory.units);
  const def = totalDefense(territory.units);
  const cnt = totalCount(territory.units);

  return (
    <div
      className="territory-card"
      style={{
        borderLeftColor: myColor,
        boxShadow: enemies ? '0 0 6px #f442' : undefined,
      }}
    >
      {/* Card header */}
      <div className="territory-card-header">
        <span className="territory-card-name">{territory.name}</span>
        <div className="territory-card-meta">
          {cnt > 0 && (
            <span className="territory-card-power">⚔{atk} 🛡{def}</span>
          )}
          <span className="territory-card-minerals">💎{minerals}</span>
          {enemies && <span className="territory-card-alert">!</span>}
          {canRecruit && (
            <button className="territory-card-recruit" onClick={onRecruit}>
              +
            </button>
          )}
        </div>
      </div>

      {/* Unit tokens grid */}
      {territory.units.length > 0 && (
        <div className="unit-token-grid">
          {territory.units.map((u) => (
            <UnitToken key={u.type} type={u.type} count={u.count} />
          ))}
        </div>
      )}

      {cnt === 0 && (
        <div className="territory-card-empty">유닛 없음</div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SidePanel({
  state, myPlayerIndex, isMyTurn, isAITurn,
  onDiplomacy, onRecruit, onEndTurn,
}: Props) {
  const [tab, setTab] = useState<'board' | 'map' | 'diplomacy' | 'log'>('board');
  const [recruitId, setRecruitId]   = useState<number | null>(null);
  const [recruitType, setRecruitType] = useState<UnitType>('infantry');
  const [recruitCount, setRecruitCount] = useState(1);

  const me = state.players[myPlayerIndex];
  const myTerritories = state.territories.filter((t) => t.ownerId === myPlayerIndex);
  const currentPlayer = state.players[state.currentPlayerId];

  if (!me) return null;

  const myUnits   = availableUnits(me.faction);
  const selDef    = UNIT_DEFS[recruitType];
  const maxBuy    = Math.floor(me.minerals / selDef.cost);
  const safeCnt   = Math.min(recruitCount, maxBuy);
  const actualQty = (me.faction === 'zerg' && selDef.zergDouble) ? safeCnt * 2 : safeCnt;

  const groundUnits    = myUnits.filter((u) => !UNIT_DEFS[u].isAir && !UNIT_DEFS[u].isStructure);
  const airUnits       = myUnits.filter((u) =>  UNIT_DEFS[u].isAir);
  const structureUnits = myUnits.filter((u) =>  UNIT_DEFS[u].isStructure);

  const totalMyAtk  = myTerritories.reduce((s, t) => s + totalAttack(t.units), 0);
  const totalMyDef  = myTerritories.reduce((s, t) => s + totalDefense(t.units), 0);
  const totalMyUnits = myTerritories.reduce((s, t) => s + totalCount(t.units), 0);

  const dipLabel: Record<DiplomacyStatus, string> = {
    ally: '🤝 동맹', neutral: '⚪ 중립', war: '⚔ 전쟁',
  };

  function openRecruit(id: number) {
    const affordable = myUnits.find((u) => UNIT_DEFS[u].cost <= me.minerals) ?? myUnits[0];
    setRecruitType(affordable);
    setRecruitCount(1);
    setRecruitId(id);
  }

  function confirmRecruit() {
    if (recruitId === null || safeCnt < 1) return;
    onRecruit(recruitId, recruitType, safeCnt);
    setRecruitId(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="side-panel">

      {/* ── Player board header ─────────────────────────────────────────── */}
      <div className="pb-header" style={{ borderBottomColor: me.color }}>
        <div className="pb-identity">
          <span className="pb-name" style={{ color: me.color }}>{me.name}</span>
          <span className="pb-faction-badge">{FACTION_LABEL[me.faction] ?? me.faction}</span>
        </div>
        <div className="pb-resources">
          <div className="pb-res-cell">
            <span className="pb-res-val">💎 {me.minerals}</span>
            <span className="pb-res-lbl">미네랄</span>
          </div>
          <div className="pb-res-sep" />
          <div className="pb-res-cell">
            <span className="pb-res-val">🗺 {myTerritories.length}<span style={{ color: '#556', fontSize: 11 }}>/{WIN_THRESHOLD}</span></span>
            <span className="pb-res-lbl">행성</span>
          </div>
          <div className="pb-res-sep" />
          <div className="pb-res-cell">
            <span className="pb-res-val">⚔{totalMyAtk} <span style={{ color: '#556', fontSize: 10 }}>🛡{totalMyDef}</span></span>
            <span className="pb-res-lbl">{totalMyUnits}기</span>
          </div>
        </div>
        {/* Win progress track */}
        <div className="pb-progress-track">
          <div
            className="pb-progress-fill"
            style={{ width: `${(myTerritories.length / WIN_THRESHOLD) * 100}%`, background: me.color }}
          />
          <span className="pb-progress-label">{myTerritories.length} / {WIN_THRESHOLD} 행성</span>
        </div>
      </div>

      {/* ── Turn banner ─────────────────────────────────────────────────── */}
      <div className="turn-banner" style={{ borderColor: currentPlayer?.color }}>
        <span className="turn-banner-text">
          {isAITurn
            ? `⏳ ${currentPlayer?.name} (AI) 행동 중...`
            : isMyTurn
            ? '▶ 내 턴'
            : `⌛ ${currentPlayer?.name}의 턴`}
        </span>
        <span className="turn-banner-num">턴 {state.turn}</span>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="pb-tabs">
        {([['board', '내 보드'], ['map', '세력도'], ['diplomacy', '외교'], ['log', '로그']] as const).map(
          ([key, label]) => (
            <button
              key={key}
              className={`pb-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <div className="pb-content">

        {/* ── MY BOARD TAB ──────────────────────────────────────────────── */}
        {tab === 'board' && (
          <div className="pb-board-tab">
            {myTerritories.length === 0 ? (
              <div className="pb-empty">보유 행성 없음</div>
            ) : (
              myTerritories.map((t) => {
                const hasEnemyAdj = t.adjacentIds.some((id) => {
                  const adj = state.territories[id];
                  return adj.ownerId !== null
                    && adj.ownerId !== myPlayerIndex
                    && me.diplomacy[adj.ownerId] !== 'ally';
                });
                return (
                  <TerritoryCard
                    key={t.id}
                    territory={t}
                    myColor={me.color}
                    enemies={hasEnemyAdj}
                    minerals={t.minerals}
                    onRecruit={() => openRecruit(t.id)}
                    canRecruit={isMyTurn && !isAITurn && me.minerals >= 1}
                  />
                );
              })
            )}

            {/* Recruit panel (slides in below territories) */}
            {recruitId !== null && (() => {
              const terrName = state.territories[recruitId]?.name ?? '';
              return (
                <div className="recruit-sheet">
                  <div className="recruit-sheet-title">
                    {terrName} 징집
                    <button className="recruit-sheet-close" onClick={() => setRecruitId(null)}>✕</button>
                  </div>

                  {/* Unit cards by category */}
                  {([
                    ['🗡 지상', groundUnits],
                    ['✈ 공중', airUnits],
                    ['🏗 건물', structureUnits],
                  ] as [string, UnitType[]][]).map(([label, units]) =>
                    units.length > 0 && (
                      <div key={label} className="recruit-category">
                        <div className="recruit-category-label">{label}</div>
                        <div className="recruit-unit-grid">
                          {units.map((ut) => (
                            <UnitCard
                              key={ut}
                              type={ut}
                              selected={ut === recruitType}
                              canAfford={UNIT_DEFS[ut].cost <= me.minerals}
                              isZergBonus={me.faction === 'zerg' && UNIT_DEFS[ut].zergDouble}
                              onClick={() => { setRecruitType(ut); setRecruitCount(1); }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {/* Count row */}
                  <div className="recruit-count-row">
                    <button className="count-adj" onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}>−</button>
                    <div className="recruit-count-info">
                      <span className="recruit-count-main">
                        {safeCnt}기{actualQty !== safeCnt ? ` → ${actualQty}기` : ''}
                      </span>
                      <span className="recruit-count-cost">비용 {safeCnt * selDef.cost}💎</span>
                    </div>
                    <button className="count-adj" onClick={() => setRecruitCount(Math.min(Math.max(1, maxBuy), recruitCount + 1))}>+</button>
                  </div>

                  <div className="recruit-actions">
                    <button
                      className="confirm-btn"
                      disabled={safeCnt < 1 || safeCnt * selDef.cost > me.minerals}
                      onClick={confirmRecruit}
                    >
                      징집
                    </button>
                    <button className="cancel-btn" onClick={() => setRecruitId(null)}>취소</button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── FACTION MAP TAB ───────────────────────────────────────────── */}
        {tab === 'map' && (
          <div>
            <h3 className="section-title">세력 현황</h3>
            {state.players.map((p) => {
              const cnt = state.territories.filter((t) => t.ownerId === p.id).length;
              return (
                <div key={p.id} className={`player-row ${!p.isAlive ? 'dead' : ''}`}>
                  <div className="player-row-header">
                    <span className="player-row-name" style={{ color: p.color }}>
                      {!p.isAlive ? '☠ ' : p.id === state.currentPlayerId ? '▶ ' : ''}
                      {p.name}
                      {p.id === myPlayerIndex ? ' (나)' : p.isAI ? ' [AI]' : ''}
                    </span>
                    <span className="player-row-count">{cnt}행성</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(cnt / 19) * 100}%`, backgroundColor: p.color }} />
                    <div className="progress-target" style={{ left: `${(WIN_THRESHOLD / 19) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DIPLOMACY TAB ─────────────────────────────────────────────── */}
        {tab === 'diplomacy' && (
          <div>
            <h3 className="section-title">외교 관계</h3>
            <p className="dip-hint">동맹은 상호 공격 불가. 전쟁은 즉시 교전 상태.</p>
            {state.players.filter((p) => p.id !== myPlayerIndex && p.isAlive).map((p) => {
              const rel = me.diplomacy[p.id] ?? 'neutral';
              return (
                <div key={p.id} className="dip-row">
                  <div className="dip-row-info">
                    <span style={{ color: p.color }}>{p.name}{p.isAI ? ' [AI]' : ''}</span>
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

        {/* ── LOG TAB ───────────────────────────────────────────────────── */}
        {tab === 'log' && (
          <div className="log-panel">
            {[...state.log].reverse().map((entry, i) => (
              <div key={i} className="log-entry">{entry}</div>
            ))}
          </div>
        )}
      </div>

      {/* ── Action footer ───────────────────────────────────────────────── */}
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

import React, { useState } from 'react';
import type { GameState, DiplomacyStatus } from '../types';
import { WIN_THRESHOLD } from '../mapData';

interface Props {
  state: GameState;
  myPlayerIndex: number;
  isMyTurn: boolean;
  isAITurn: boolean;
  onDiplomacy: (targetId: number, status: DiplomacyStatus) => void;
  onRecruit: (territoryId: number, count: number) => void;
  onEndTurn: () => void;
}

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
  const [recruitCount, setRecruitCount] = useState(1);

  const me = state.players[myPlayerIndex];
  const myTerritories = state.territories.filter((t) => t.ownerId === myPlayerIndex);
  const maxRecruit = me ? Math.floor(me.minerals / 2) : 0;

  const currentPlayer = state.players[state.currentPlayerId];

  const dipLabel: Record<DiplomacyStatus, string> = {
    ally: '🤝 동맹', neutral: '⚪ 중립', war: '⚔ 전쟁',
  };

  const factionLabel = (f: string) =>
    f === 'terran' ? '테란' : f === 'zerg' ? '저그' : '프로토스';

  if (!me) return null;

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
          <span>⚔ {myTerritories.reduce((s, t) => s + t.armies, 0)}</span>
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
                  {myTerritories.map((t) => (
                    <div key={t.id} className="territory-row">
                      <span className="territory-row-name">{t.name}</span>
                      <span className="territory-row-info">⚔{t.armies} 💎{t.minerals}</span>
                      <button
                        className="recruit-mini-btn"
                        onClick={() => { setRecruitId(t.id); setRecruitCount(1); }}
                        disabled={me.minerals < 2}
                      >
                        +징집
                      </button>
                    </div>
                  ))}
                </div>

                {recruitId !== null && (
                  <div className="recruit-panel">
                    <div className="recruit-title">
                      {state.territories[recruitId]?.name} 징집
                    </div>
                    <div className="recruit-row">
                      <button onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}>-</button>
                      <span>{recruitCount}군 (비용: {recruitCount * 2}💎)</span>
                      <button onClick={() => setRecruitCount(Math.min(maxRecruit, recruitCount + 1))}>+</button>
                    </div>
                    <div className="recruit-actions">
                      <button
                        className="confirm-btn"
                        disabled={recruitCount * 2 > me.minerals}
                        onClick={() => { onRecruit(recruitId, recruitCount); setRecruitId(null); }}
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

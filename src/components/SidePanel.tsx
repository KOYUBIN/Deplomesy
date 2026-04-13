import React, { useState } from 'react';
import type { GameState } from '../types';
import type { DiplomacyStatus } from '../types';
import { countTerritories } from '../gameLogic';
import { WIN_THRESHOLD } from '../mapData';

interface Props {
  state: GameState;
  isAITurn: boolean;
  onDiplomacy: (targetId: number, status: DiplomacyStatus) => void;
  onRecruit: (territoryId: number, count: number) => void;
  onEndTurn: () => void;
  onRecruitMode: (territoryId: number) => void;
}

export default function SidePanel({
  state,
  isAITurn,
  onDiplomacy,
  onRecruit,
  onEndTurn,
  onRecruitMode,
}: Props) {
  const [tab, setTab] = useState<'status' | 'diplomacy' | 'log'>('status');
  const [recruitId, setRecruitId] = useState<number | null>(null);
  const [recruitCount, setRecruitCount] = useState(1);

  const human = state.players[0];
  const current = state.players[state.currentPlayerId];
  const myTerritories = state.territories.filter((t) => t.ownerId === 0);
  const maxRecruit = Math.floor(human.minerals / 2);

  const dipLabel: Record<DiplomacyStatus, string> = {
    ally: '🤝 동맹',
    neutral: '⚪ 중립',
    war: '⚔ 전쟁',
  };

  return (
    <div className="side-panel">
      {/* Player stat bar */}
      <div className="player-bar" style={{ borderColor: human.color }}>
        <div className="player-bar-name" style={{ color: human.color }}>
          {human.name}
          <span className="faction-badge">{
            human.faction === 'terran' ? '테란' :
            human.faction === 'zerg' ? '저그' : '프로토스'
          }</span>
        </div>
        <div className="player-bar-stats">
          <span>💎 {human.minerals}</span>
          <span>🗺 {myTerritories.length}/{WIN_THRESHOLD}</span>
          <span>⚔ {myTerritories.reduce((s, t) => s + t.armies, 0)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['status', 'diplomacy', 'log'] as const).map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
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
              const count = countTerritories(state.territories, p.id);
              const width = `${Math.round((count / 19) * 100)}%`;
              return (
                <div key={p.id} className={`player-row ${!p.isAlive ? 'dead' : ''}`}>
                  <div className="player-row-header">
                    <span style={{ color: p.color }} className="player-row-name">
                      {p.isAlive ? '' : '☠ '}{p.name}
                    </span>
                    <span className="player-row-count">{count}행성</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width, backgroundColor: p.color }}
                    />
                    <div
                      className="progress-target"
                      style={{ left: `${Math.round((WIN_THRESHOLD / 19) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <h3 className="section-title" style={{ marginTop: 16 }}>내 행성</h3>
            <div className="territory-list">
              {myTerritories.map((t) => (
                <div key={t.id} className="territory-row">
                  <span className="territory-row-name">{t.name}</span>
                  <span className="territory-row-info">
                    ⚔{t.armies} 💎{t.minerals}
                  </span>
                  {!isAITurn && state.currentPlayerId === 0 && (
                    <button
                      className="recruit-mini-btn"
                      onClick={() => {
                        setRecruitId(t.id);
                        setRecruitCount(1);
                        onRecruitMode(t.id);
                      }}
                      disabled={human.minerals < 2}
                    >
                      +징집
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Recruit modal inline */}
            {recruitId !== null && state.currentPlayerId === 0 && (
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
                    disabled={recruitCount * 2 > human.minerals}
                    onClick={() => {
                      onRecruit(recruitId, recruitCount);
                      setRecruitId(null);
                    }}
                  >
                    징집
                  </button>
                  <button className="cancel-btn" onClick={() => setRecruitId(null)}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DIPLOMACY TAB */}
        {tab === 'diplomacy' && (
          <div>
            <h3 className="section-title">외교 관계</h3>
            <p className="dip-hint">동맹은 상호 공격 불가. 전쟁 선포 시 자동 교전.</p>
            {state.players
              .filter((p) => p.id !== 0 && p.isAlive)
              .map((p) => {
                const rel = human.diplomacy[p.id] ?? 'neutral';
                return (
                  <div key={p.id} className="dip-row">
                    <div className="dip-row-info">
                      <span style={{ color: p.color }}>{p.name}</span>
                      <span className="dip-status">{dipLabel[rel]}</span>
                    </div>
                    {!isAITurn && state.currentPlayerId === 0 && (
                      <div className="dip-actions">
                        {rel !== 'ally' && (
                          <button
                            className="dip-btn ally"
                            onClick={() => onDiplomacy(p.id, 'ally')}
                          >
                            동맹
                          </button>
                        )}
                        {rel !== 'neutral' && (
                          <button
                            className="dip-btn neutral"
                            onClick={() => onDiplomacy(p.id, 'neutral')}
                          >
                            중립
                          </button>
                        )}
                        {rel !== 'war' && (
                          <button
                            className="dip-btn war"
                            onClick={() => onDiplomacy(p.id, 'war')}
                          >
                            선전포고
                          </button>
                        )}
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

      {/* End turn button */}
      {state.currentPlayerId === 0 && !isAITurn && (
        <button className="end-turn-btn" onClick={onEndTurn}>
          턴 종료 →
        </button>
      )}
      {isAITurn && (
        <div className="ai-indicator">AI 턴 진행 중...</div>
      )}
    </div>
  );
}

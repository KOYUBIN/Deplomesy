import React from 'react';
import type { GameState } from '../types';

interface Props {
  state: GameState;
  onRestart: () => void;
}

export default function EndScreen({ state, onRestart }: Props) {
  const winner = state.winner !== null ? state.players[state.winner] : null;
  const isHumanWinner = state.winner === 0;

  return (
    <div className="end-screen">
      <div className="end-card">
        <div className="end-icon">{isHumanWinner ? '🏆' : '💀'}</div>
        <h2 className="end-title" style={{ color: winner?.color }}>
          {isHumanWinner ? '승리!' : '패배...'}
        </h2>
        <p className="end-winner">
          {winner ? `${winner.name}이(가) 은하를 지배했습니다.` : ''}
        </p>
        <div className="end-stats">
          <h3>최종 현황</h3>
          {state.players.map((p) => {
            const count = state.territories.filter((t) => t.ownerId === p.id).length;
            return (
              <div key={p.id} className="end-stat-row">
                <span style={{ color: p.color }}>{p.name}</span>
                <span>{count}행성</span>
              </div>
            );
          })}
        </div>
        <p className="end-turns">총 {state.turn}턴 소요</p>
        <button className="start-btn" onClick={onRestart}>
          다시 시작
        </button>
      </div>
    </div>
  );
}

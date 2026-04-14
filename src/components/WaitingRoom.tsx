import React, { useState } from 'react';
import type { RoomInfo } from '../types';
import { FACTION_COLORS } from '../mapData';

interface Props {
  roomInfo: RoomInfo;
  myPlayerIndex: number;
  isHost: boolean;
  onStartGame: (aiCount: number) => void;
}

const FACTION_LABELS: Record<string, string> = {
  terran: '테란', zerg: '저그', protoss: '프로토스',
  tal_darim: '탈다림', primal_zerg: '원시저그', nerazim: '네라짐',
  ued: 'UED', raiders: '레이너 반군', confederacy: '컨페더러시',
};

export default function WaitingRoom({ roomInfo, myPlayerIndex, isHost, onStartGame }: Props) {
  const [aiCount, setAiCount] = useState(2);
  const humanCount = roomInfo.players.length;
  const totalCount = humanCount + aiCount;

  return (
    <div className="start-screen">
      <div className="start-card">
        <h2 className="start-title" style={{ fontSize: 24 }}>대기방</h2>

        {/* Room code */}
        <div className="room-code-box">
          <div className="room-code-label">방 코드</div>
          <div className="room-code">{roomInfo.code}</div>
          <div className="room-code-hint">친구에게 이 코드를 공유하세요</div>
        </div>

        {/* Player list */}
        <div className="setup-section">
          <label className="setup-label">참가자 ({humanCount}명)</label>
          <div className="player-slot-list">
            {roomInfo.players.map((p) => (
              <div key={p.playerIndex} className="player-slot">
                <span
                  className="slot-dot"
                  style={{ backgroundColor: FACTION_COLORS[p.faction] }}
                />
                <span className="slot-name">
                  {p.name}
                  {p.playerIndex === myPlayerIndex && ' (나)'}
                </span>
                <span className="slot-faction" style={{ color: FACTION_COLORS[p.faction] }}>
                  {FACTION_LABELS[p.faction]}
                </span>
              </div>
            ))}
            {Array.from({ length: aiCount }).map((_, i) => (
              <div key={`ai-${i}`} className="player-slot ai-slot">
                <span className="slot-dot" style={{ backgroundColor: '#555' }} />
                <span className="slot-name" style={{ color: '#666' }}>AI 플레이어 {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI count (host only) */}
        {isHost && (
          <div className="setup-section">
            <label className="setup-label">AI 플레이어 수 (총 {totalCount}명)</label>
            <div className="count-grid">
              {Array.from({ length: Math.max(1, 7 - humanCount) }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  className={`count-btn ${aiCount === n ? 'selected' : ''}`}
                  disabled={humanCount + n < 2}
                  onClick={() => setAiCount(n)}
                >
                  {n}명
                </button>
              ))}
            </div>
          </div>
        )}

        {isHost ? (
          <button
            className="start-btn"
            disabled={totalCount < 2}
            onClick={() => onStartGame(aiCount)}
          >
            게임 시작 ({totalCount}명)
          </button>
        ) : (
          <div className="waiting-msg">
            호스트가 게임을 시작하길 기다리는 중...
          </div>
        )}
      </div>
    </div>
  );
}

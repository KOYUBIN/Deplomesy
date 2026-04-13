import React, { useState } from 'react';
import type { Faction } from '../types';
import { FACTION_COLORS } from '../mapData';

interface Props {
  onCreateRoom: (name: string, faction: Faction) => void;
  onJoinRoom: (code: string, name: string, faction: Faction) => void;
  error: string | null;
  isConnecting: boolean;
}

const FACTION_INFO: Record<Faction, { label: string; desc: string }> = {
  terran:  { label: '테란',     desc: '방어 +1. 인류의 생존자들.' },
  zerg:    { label: '저그',     desc: '턴마다 자동 재생. 군집의 의지.' },
  protoss: { label: '프로토스', desc: '공격 +1. 고대 문명의 수호자.' },
};

export default function LobbyScreen({ onCreateRoom, onJoinRoom, error, isConnecting }: Props) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [name, setName] = useState('사령관');
  const [faction, setFaction] = useState<Faction>('terran');
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1 className="start-title">스타크래프트<br />디플로메시</h1>
        <p className="start-subtitle">영토를 정복하고 우주를 지배하라</p>

        {mode === 'select' && (
          <div className="lobby-mode-select">
            <button className="lobby-big-btn" onClick={() => setMode('create')}>
              <span className="lobby-btn-icon">🏠</span>
              <span className="lobby-btn-label">방 만들기</span>
              <span className="lobby-btn-sub">친구를 초대하여 게임 시작</span>
            </button>
            <button className="lobby-big-btn" onClick={() => setMode('join')}>
              <span className="lobby-btn-icon">🚀</span>
              <span className="lobby-btn-label">방 참가하기</span>
              <span className="lobby-btn-sub">초대 코드로 참가</span>
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <>
            <div className="setup-section">
              <label className="setup-label">플레이어 이름</label>
              <input
                className="setup-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                placeholder="사령관"
              />
            </div>

            <div className="setup-section">
              <label className="setup-label">종족 선택</label>
              <div className="faction-grid">
                {(Object.keys(FACTION_INFO) as Faction[]).map((f) => (
                  <button
                    key={f}
                    className={`faction-btn ${faction === f ? 'selected' : ''}`}
                    style={{ '--faction-color': FACTION_COLORS[f] } as React.CSSProperties}
                    onClick={() => setFaction(f)}
                  >
                    <span className="faction-name">{FACTION_INFO[f].label}</span>
                    <span className="faction-desc">{FACTION_INFO[f].desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'join' && (
              <div className="setup-section">
                <label className="setup-label">방 코드 입력</label>
                <input
                  className="setup-input code-input"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="ABCD"
                />
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <div className="lobby-actions">
              <button className="cancel-btn lobby-back" onClick={() => setMode('select')}>
                ← 뒤로
              </button>
              <button
                className="start-btn lobby-confirm"
                disabled={isConnecting || (mode === 'join' && joinCode.length < 4)}
                onClick={() => {
                  const n = name.trim() || '사령관';
                  if (mode === 'create') onCreateRoom(n, faction);
                  else onJoinRoom(joinCode, n, faction);
                }}
              >
                {isConnecting ? '연결 중...' : mode === 'create' ? '방 만들기' : '참가하기'}
              </button>
            </div>
          </>
        )}

        <div className="setup-section rules" style={{ marginTop: 20 }}>
          <h3>게임 규칙</h3>
          <ul>
            <li>🗺 19개 행성 중 <strong>11개</strong> 이상 점령 시 승리</li>
            <li>⚔ 인접 행성 클릭으로 공격·이동</li>
            <li>💎 미네랄 수집 → 군대 징집 (2미네랄 = 1군)</li>
            <li>🤝 동맹 · ⚪ 중립 · 🔴 전쟁 선택 가능</li>
            <li>테란 방어+1 / 저그 재생 / 프로토스 공격+1</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import type { Faction } from '../types';
import { FACTION_COLORS } from '../mapData';

interface Props {
  onCreateRoom: (name: string, faction: Faction) => void;
  onJoinRoom: (code: string, name: string, faction: Faction) => void;
  error: string | null;
  isConnecting: boolean;
}

const FACTION_INFO: Record<Faction, { label: string; desc: string; units: string }> = {
  terran: {
    label: '테란 도미니온',
    desc: '방어 요새화. 벙커·탱크로 진지를 구축.',
    units: '해병·시즈탱크·바이킹·벙커',
  },
  zerg: {
    label: '저그 군단',
    desc: '무한 재생. 저글링 ×2 생산, 매 턴 자동 보충.',
    units: '저글링·히드라·뮤탈·가시기어',
  },
  protoss: {
    label: '황금함대',
    desc: '균형의 종족. 강력한 특수부대와 광자포.',
    units: '질럿·드라군·불사조·광자포',
  },
  tal_darim: {
    label: '탈다림',
    desc: '광신도 집단. 공허 광선과 광신도의 폭격.',
    units: '광신도·집정관·보이드레이·신전탑',
  },
  primal_zerg: {
    label: '원시저그',
    desc: '진화의 끝. 강화 유닛과 자동 보충.',
    units: '원시저글링·맹금·리바이어던·원시굴',
  },
  nerazim: {
    label: '네라짐',
    desc: '암흑의 날. 암흑 기사 기습과 공허 방어.',
    units: '암흑기사·추적자·예언자·공허신전',
  },
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
                    <span className="faction-units">{FACTION_INFO[f].units}</span>
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
            <li>💎 미네랄 수집 → 군대 징집</li>
            <li>🤝 동맹 · ⚪ 중립 · 🔴 전쟁 선택 가능</li>
            <li>6개 종족: 테란·저그·프로토스·탈다림·원시저그·네라짐 — 각 종족마다 고유 유닛과 특수 능력 보유</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

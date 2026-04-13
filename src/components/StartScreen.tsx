import React, { useState } from 'react';
import type { Faction, SetupConfig } from '../types';
import { FACTION_COLORS } from '../mapData';

interface Props {
  onStart: (cfg: SetupConfig) => void;
}

const FACTION_INFO: Record<Faction, { label: string; desc: string }> = {
  terran: { label: '테란', desc: '방어 +1 보너스. 인류의 생존자들.' },
  zerg:   { label: '저그', desc: '턴마다 군대 자동 재생. 군집의 의지.' },
  protoss:{ label: '프로토스', desc: '공격 +1 보너스. 고대 문명의 수호자.' },
};

export default function StartScreen({ onStart }: Props) {
  const [playerCount, setPlayerCount] = useState(4);
  const [faction, setFaction] = useState<Faction>('terran');
  const [name, setName] = useState('사령관');

  const handleStart = () => {
    const trimmed = name.trim() || '사령관';
    onStart({ playerCount, playerFaction: faction, playerName: trimmed });
  };

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1 className="start-title">스타크래프트<br />디플로메시</h1>
        <p className="start-subtitle">영토를 정복하고 우주를 지배하라</p>

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

        <div className="setup-section">
          <label className="setup-label">플레이어 수 (AI 포함)</label>
          <div className="count-grid">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={`count-btn ${playerCount === n ? 'selected' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section rules">
          <h3>게임 규칙</h3>
          <ul>
            <li>🗺 19개 행성 중 <strong>11개</strong> 이상 점령 시 승리</li>
            <li>⚔ 인접 행성으로 군대를 이동하여 공격</li>
            <li>💎 미네랄(◆) 수집 → 군대 징집 (2미네랄 = 1군)</li>
            <li>🤝 동맹: 공격 불가 / 🔴 전쟁: 자동 교전</li>
            <li>테란 방어+1 / 저그 재생 / 프로토스 공격+1</li>
          </ul>
        </div>

        <button className="start-btn" onClick={handleStart}>
          게임 시작
        </button>
      </div>
    </div>
  );
}

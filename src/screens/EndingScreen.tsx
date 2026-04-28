import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { getNode } from '../data/nodes';
import { showInterstitialAd } from '../ads/interstitial';

interface Props {
  onReturnToTitle: () => void;
}

const COLORS = {
  good: '#7dffaa',
  bad: '#ff6666',
  neutral: '#ffaa00',
};

const LABELS = {
  good: '생존 — 구조',
  bad: '게임 오버',
  neutral: '결말 — 다른 길',
};

export function EndingScreen({ onReturnToTitle }: Props) {
  const { state, resetToTitle } = useGame();
  const node = getNode(state.currentNodeId);
  const [loading, setLoading] = useState(false);

  const type = node?.endingType ?? 'neutral';
  const color = COLORS[type];
  const label = LABELS[type];
  const title = node?.endingTitle ?? '???';

  const handleReturn = async () => {
    if (loading) return;
    setLoading(true);
    // 게임 오버에서 첫 화면으로 돌아갈 때 전면 광고 노출
    await showInterstitialAd();
    resetToTitle();
    onReturnToTitle();
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0a0a0a',
        padding: '48px 24px 32px',
      }}
    >
      <div style={{ marginTop: '12vh', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#555', letterSpacing: 4 }}>
          { type === 'bad' ? 'GAME OVER' : 'ENDING' }
        </div>
        <h2
          style={{
            color,
            fontSize: 26,
            margin: '24px 0 8px',
            letterSpacing: 1,
          }}
        >
          {title}
        </h2>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 32 }}>{label}</div>

        <p
          style={{
            color: '#bbb',
            fontSize: 15,
            lineHeight: 1.9,
            maxWidth: 560,
            margin: '0 auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {node?.text}
        </p>

        <div style={{ marginTop: 36, fontSize: 12, color: '#555' }}>
          달성한 결말: {state.endingsCleared.length} / 25
        </div>
      </div>

      <button
        onClick={handleReturn}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: 'transparent',
          color: loading ? '#666' : color,
          border: `1px solid ${loading ? '#444' : color}`,
          borderRadius: 6,
          fontSize: 16,
          letterSpacing: 1,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {loading ? '...' : '처음으로'}
      </button>
    </div>
  );
}

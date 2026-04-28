import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { getEndingCount, getNode, getScenario } from '../data/scenarios';
import { showInterstitialAd } from '../ads/interstitial';

interface Props {
  onReturnToTitle: () => void;
  onRetryScenario: () => void;
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

export function EndingScreen({ onReturnToTitle, onRetryScenario }: Props) {
  const { save, current, resetCurrentScenario, exitToTitle } = useGame();
  const scenarioId = save.scenarioId;
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const node = scenarioId && current ? getNode(scenarioId, current.currentNodeId) : undefined;
  const [loading, setLoading] = useState(false);

  const type = node?.endingType ?? 'neutral';
  const color = COLORS[type];
  const label = LABELS[type];
  const title = node?.endingTitle ?? '???';
  const totalEndings = scenarioId ? getEndingCount(scenarioId) : 0;
  const clearedCount = current?.endingsCleared.length ?? 0;

  const handleReturn = async () => {
    if (loading) return;
    setLoading(true);
    // 게임 오버에서 첫 화면으로 돌아갈 때 전면 광고 노출
    await showInterstitialAd();
    resetCurrentScenario();
    exitToTitle();
    onReturnToTitle();
  };

  const handleRetry = async () => {
    if (loading) return;
    setLoading(true);
    await showInterstitialAd();
    resetCurrentScenario();
    onRetryScenario();
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        padding: '40px 24px 28px',
      }}
    >
      <div style={{ marginTop: '8vh', textAlign: 'center', flex: 1 }}>
        {scenario && (
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 12 }}>
            {scenario.icon} {scenario.title}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#555', letterSpacing: 4 }}>
          {type === 'bad' ? 'GAME OVER' : 'ENDING'}
        </div>
        <h2
          style={{
            color,
            fontSize: 26,
            margin: '20px 0 8px',
            letterSpacing: 1,
          }}
        >
          {title}
        </h2>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>{label}</div>

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

        <div style={{ marginTop: 32, fontSize: 12, color: '#555' }}>
          이 시나리오 결말: {clearedCount} / {totalEndings}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <button
          onClick={handleRetry}
          disabled={loading}
          style={endingButtonStyle(color, loading)}
        >
          {loading ? '...' : '같은 이야기 다시'}
        </button>
        <button
          onClick={handleReturn}
          disabled={loading}
          style={endingButtonStyle('#888', loading)}
        >
          {loading ? '...' : '다른 이야기 고르기'}
        </button>
      </div>
    </div>
  );
}

function endingButtonStyle(color: string, loading: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    color: loading ? '#555' : color,
    border: `1px solid ${loading ? '#444' : color}`,
    borderRadius: 6,
    fontSize: 15,
    letterSpacing: 1,
    cursor: loading ? 'wait' : 'pointer',
    fontFamily: 'inherit',
  };
}

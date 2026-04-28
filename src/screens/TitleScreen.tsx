import { useGame } from '../state/GameContext';

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  const { state, resetToTitle } = useGame();
  const hasProgress = state.currentNodeId !== 1 || state.visitedNodes.length > 1;

  const handleNewGame = () => {
    resetToTitle();
    onStart();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 24px 32px',
        background: '#0a0a0a',
      }}
    >
      <div style={{ marginTop: '15vh', textAlign: 'center' }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 8,
            color: '#666',
            marginBottom: 12,
          }}
        >
          F I N A L C H O I C E
        </div>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: '#ffaa00',
            margin: 0,
            letterSpacing: 2,
          }}
        >
          무인도 생존
        </h1>
        <p
          style={{
            color: '#888',
            fontSize: 14,
            marginTop: 16,
            lineHeight: 1.7,
          }}
        >
          당신의 선택이 운명을 결정한다.
          <br />
          100개의 분기, 25개의 결말.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hasProgress && (
          <button
            onClick={onStart}
            style={titleButtonStyle('#ffaa00')}
          >
            이어하기
          </button>
        )}
        <button
          onClick={handleNewGame}
          style={titleButtonStyle(hasProgress ? '#888' : '#ffaa00')}
        >
          {hasProgress ? '처음부터' : '시작하기'}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: '#555', textAlign: 'center' }}>
          달성한 결말: {state.endingsCleared.length} / 25
        </div>
      </div>
    </div>
  );
}

function titleButtonStyle(color: string): React.CSSProperties {
  return {
    width: '100%',
    padding: '16px',
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    borderRadius: 6,
    fontSize: 16,
    letterSpacing: 1,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

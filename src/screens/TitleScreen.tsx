import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount, getNodeCount } from '../data/scenarios';
import type { ScenarioMeta } from '../data/types';

interface Props {
  onSelectScenario: (scenarioId: string) => void;
  onBack: () => void;
}

export function TitleScreen({ onSelectScenario, onBack }: Props) {
  const { save } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#16171f',
        padding: '20px 20px 24px',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          maxWidth: 720,
          width: '100%',
          margin: '0 auto 20px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a8acc1',
            fontSize: 13,
            padding: '6px 8px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← 메인
        </button>
        <h2
          style={{
            margin: 0,
            color: '#e8e8e8',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          이야기 고르기
        </h2>
      </header>

      <main style={{ display: 'grid', gap: 12, maxWidth: 720, width: '100%', margin: '0 auto', flex: 1 }}>
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            state={save.byScenario[scenario.id]}
            onClick={() => onSelectScenario(scenario.id)}
          />
        ))}
      </main>

      <footer style={{ textAlign: 'center', color: '#5a5d70', fontSize: 11, marginTop: 24 }}>
        FinalChoice · 텍스트 기반 어드벤처
      </footer>
    </div>
  );
}

interface CardProps {
  scenario: ScenarioMeta;
  state: import('../state/GameContext').ScenarioState | undefined;
  onClick: () => void;
}

function ScenarioCard({ scenario, state, onClick }: CardProps) {
  const totalNodes = getNodeCount(scenario.id);
  const totalEndings = getEndingCount(scenario.id);
  const cleared = state?.endingsCleared.length ?? 0;
  const visited = state?.visitedNodes.length ?? 0;
  const inProgress = state && state.currentNodeId !== 1 && cleared < totalEndings;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '16px 18px',
        background: '#1f2030',
        color: '#e8e8e8',
        border: '1px solid #2a2c3a',
        borderLeft: `4px solid ${scenario.accent}`,
        borderRadius: 10,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 0.15s, transform 0.06s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#262739';
        e.currentTarget.style.borderColor = '#383b4d';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#1f2030';
        e.currentTarget.style.borderColor = '#2a2c3a';
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 30, lineHeight: 1 }}>{scenario.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: scenario.accent,
                letterSpacing: 0.5,
              }}
            >
              {scenario.title}
            </span>
            {inProgress && (
              <span style={{ fontSize: 10, color: '#ffaa00', letterSpacing: 1 }}>· 진행 중</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#a8acc1', marginTop: 2 }}>{scenario.subtitle}</div>
          <div style={{ fontSize: 11, color: '#7a7e92', marginTop: 8 }}>
            {totalNodes}개 노드 · {totalEndings}개 결말 · 달성 {cleared}/{totalEndings}
            {visited > 1 && ` · 방문 ${visited}`}
          </div>
        </div>
        <div style={{ color: '#5a5d70', fontSize: 18 }}>›</div>
      </div>
    </button>
  );
}

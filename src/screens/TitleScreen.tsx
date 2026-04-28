import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount, getNodeCount } from '../data/scenarios';
import type { ScenarioMeta } from '../data/types';

interface Props {
  onSelectScenario: (scenarioId: string) => void;
}

export function TitleScreen({ onSelectScenario }: Props) {
  const { save } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        padding: '40px 20px 24px',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: '#666', marginBottom: 10 }}>
          F I N A L C H O I C E
        </div>
        <h1
          style={{
            fontSize: 28,
            color: '#ffaa00',
            margin: 0,
            letterSpacing: 1.5,
          }}
        >
          어떤 이야기를 살아낼까
        </h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 12, lineHeight: 1.7 }}>
          10개의 시나리오. 당신의 선택이 결말을 만든다.
        </p>
      </header>

      <main style={{ display: 'grid', gap: 12, maxWidth: 720, width: '100%', margin: '0 auto' }}>
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            state={save.byScenario[scenario.id]}
            onClick={() => onSelectScenario(scenario.id)}
          />
        ))}
      </main>

      <footer style={{ textAlign: 'center', color: '#444', fontSize: 11, marginTop: 32 }}>
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
        background: '#111',
        color: '#e8e8e8',
        border: '1px solid #222',
        borderLeft: `4px solid ${scenario.accent}`,
        borderRadius: 8,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 0.15s, transform 0.06s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#161616')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 28, lineHeight: 1 }}>{scenario.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: scenario.accent, letterSpacing: 0.5 }}>
              {scenario.title}
            </span>
            {inProgress && (
              <span style={{ fontSize: 10, color: '#ffaa00', letterSpacing: 1 }}>· 진행 중</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{scenario.subtitle}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
            {totalNodes}개 노드 · {totalEndings}개 결말 · 달성 {cleared}/{totalEndings}
            {visited > 1 && ` · 방문 ${visited}`}
          </div>
        </div>
        <div style={{ color: '#444', fontSize: 18 }}>›</div>
      </div>
    </button>
  );
}

import { useMemo } from 'react';
import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount } from '../data/scenarios';
import { aggregateCounts } from '../data/archetypes';
import { PersonalityResult } from '../components/PersonalityResult';

interface Props {
  onStart: () => void;
}

export function MainPage({ onStart }: Props) {
  const { save } = useGame();

  // 통계
  const totalScenarios = SCENARIOS.length;
  const totalEndings = useMemo(
    () => SCENARIOS.reduce((sum, s) => sum + getEndingCount(s.id), 0),
    [],
  );
  const clearedScenarios = useMemo(
    () =>
      SCENARIOS.filter((s) => {
        const state = save.byScenario[s.id];
        return state && state.endingsCleared.length > 0;
      }).length,
    [save.byScenario],
  );
  const clearedEndings = useMemo(
    () =>
      SCENARIOS.reduce((sum, s) => {
        const state = save.byScenario[s.id];
        return sum + (state?.endingsCleared.length ?? 0);
      }, 0),
    [save.byScenario],
  );

  // 진행 중 시나리오 (있으면 강조)
  const inProgress = useMemo(
    () =>
      SCENARIOS.find((s) => {
        const state = save.byScenario[s.id];
        return state && state.currentNodeId !== 1;
      }),
    [save.byScenario],
  );

  // 누적 트레이트 (모든 시나리오 합산)
  const cumulativeTraits = useMemo(
    () => aggregateCounts(SCENARIOS.map((s) => save.byScenario[s.id]?.traitCounts)),
    [save.byScenario],
  );
  const totalChoicesMade = Object.values(cumulativeTraits).reduce((s, v) => s + (v ?? 0), 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(ellipse at top, #1f2030 0%, #16171f 55%, #0f1018 100%)',
        padding: '0 24px 32px',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 20,
          paddingTop: '12vh',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 8,
            color: '#7a7e92',
          }}
        >
          F I N A L C H O I C E
        </div>

        <h1
          style={{
            fontSize: 46,
            fontWeight: 800,
            color: '#ffaa00',
            margin: 0,
            letterSpacing: 1,
            lineHeight: 1.1,
            textShadow: '0 0 32px rgba(255, 170, 0, 0.18)',
          }}
        >
          최후의 선택
        </h1>

        <p
          style={{
            color: '#a8acc1',
            fontSize: 14,
            maxWidth: 360,
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          50개의 이야기, 끝없는 분기.
          <br />
          당신의 선택만이 결말을 만든다.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 12,
            color: '#6c6f82',
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 22, color: '#e8e8e8', fontWeight: 600 }}>
              {totalScenarios}
            </div>
            <div>이야기</div>
          </div>
          <div style={{ width: 1, background: '#2a2c3a' }} />
          <div>
            <div style={{ fontSize: 22, color: '#e8e8e8', fontWeight: 600 }}>
              {totalEndings}
            </div>
            <div>결말</div>
          </div>
          <div style={{ width: 1, background: '#2a2c3a' }} />
          <div>
            <div style={{ fontSize: 22, color: '#7dffaa', fontWeight: 600 }}>
              {clearedEndings}
            </div>
            <div>달성</div>
          </div>
        </div>

        {/* 누적 성격 (한 번이라도 선택했을 때만) */}
        {totalChoicesMade > 0 && (
          <div style={{ marginTop: 28, width: '100%', maxWidth: 420 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: '#7a7e92',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              지금까지 당신은
            </div>
            <PersonalityResult traitCounts={cumulativeTraits} variant="compact" />
          </div>
        )}
      </main>

      <footer
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 420,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {inProgress && (
          <div
            style={{
              fontSize: 12,
              color: '#a8acc1',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            진행 중: <span style={{ color: inProgress.accent }}>{inProgress.icon} {inProgress.title}</span>
          </div>
        )}

        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '18px',
            background: '#ffaa00',
            color: '#16171f',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 6px 24px rgba(255,170,0,0.18)',
            transition: 'transform 0.06s, box-shadow 0.15s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          이야기 고르기 ›
        </button>

        <div
          style={{
            textAlign: 'center',
            color: '#5a5d70',
            fontSize: 10,
            marginTop: 12,
            letterSpacing: 0.5,
          }}
        >
          {clearedScenarios} / {totalScenarios} 시나리오에서 결말 발견
        </div>
      </footer>
    </div>
  );
}

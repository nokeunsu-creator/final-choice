import { useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount } from '../data/scenariosMeta';
import { ARCHETYPE_CATEGORIES, aggregateCounts, scoreArchetypes } from '../data/archetypes';
import { ACHIEVEMENTS, evaluateAchievements, unlockedCount } from '../data/achievements';
import { PersonalityResult } from '../components/PersonalityResult';
import type { ScenarioMeta } from '../data/types';
import { isMuted, setMuted, playClick } from '../utils/sound';

interface Props {
  onStart: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onShowStats: () => void;
}

export function MainPage({ onStart, onSelectScenario, onShowStats }: Props) {
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

  // 진행 중 시나리오
  const inProgress = useMemo(
    () =>
      SCENARIOS.find((s) => {
        const state = save.byScenario[s.id];
        return state && state.currentNodeId !== 1;
      }),
    [save.byScenario],
  );

  // 누적 트레이트
  const cumulativeTraits = useMemo(
    () => aggregateCounts(SCENARIOS.map((s) => save.byScenario[s.id]?.traitCounts)),
    [save.byScenario],
  );
  const totalChoicesMade = Object.values(cumulativeTraits).reduce((s, v) => s + (v ?? 0), 0);

  // 추천 시나리오 (top 아키타입 기반, 5개 이상 선택했을 때)
  const recommendations = useMemo<ScenarioMeta[]>(() => {
    if (totalChoicesMade < 5) return [];
    const ranked = scoreArchetypes(cumulativeTraits);
    if (ranked.length === 0) return [];
    const topArchetype = ranked[0].archetype;
    const preferredCats = ARCHETYPE_CATEGORIES[topArchetype.id] ?? [];

    // 우선 추천: 미클리어 + 선호 카테고리
    const unplayed = SCENARIOS.filter((s) => {
      const state = save.byScenario[s.id];
      const cleared = state?.endingsCleared.length ?? 0;
      const totalE = getEndingCount(s.id);
      return cleared < totalE; // 모든 결말 못 본 시나리오
    });
    const inCat = unplayed.filter((s) => preferredCats.includes(s.category));
    const others = unplayed.filter((s) => !preferredCats.includes(s.category));

    // 카테고리 매칭 우선, 부족하면 다른 카테고리로 채움
    return [...inCat, ...others].slice(0, 3);
  }, [cumulativeTraits, totalChoicesMade, save.byScenario]);

  const topArchetypeName = useMemo(() => {
    if (totalChoicesMade < 5) return null;
    const ranked = scoreArchetypes(cumulativeTraits);
    return ranked[0]?.archetype ?? null;
  }, [cumulativeTraits, totalChoicesMade]);

  const achievements = useMemo(() => evaluateAchievements(save), [save]);
  const unlockedAchCount = useMemo(() => unlockedCount(save), [save]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [muted, setMutedState] = useState(() => isMuted());
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClick();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(ellipse at top, #1f2030 0%, #16171f 55%, #0f1018 100%)',
        padding: '0 clamp(14px, 5vw, 24px) 32px',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          gap: 20,
          paddingTop: '8vh',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(9px, 2.6vw, 11px)',
            letterSpacing: 'clamp(3px, 2vw, 8px)',
            color: '#7a7e92',
          }}
        >
          F I N A L C H O I C E
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 10vw, 42px)',
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

        <p style={{ color: '#a8acc1', fontSize: 13, maxWidth: 360, lineHeight: 1.7, margin: 0 }}>
          79개의 이야기, 끝없는 분기.
          <br />
          당신의 선택만이 결말을 만든다.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'clamp(14px, 5vw, 24px)',
            marginTop: 4,
            color: '#6c6f82',
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 22, color: '#e8e8e8', fontWeight: 600 }}>{totalScenarios}</div>
            <div>이야기</div>
          </div>
          <div style={{ width: 1, background: '#2a2c3a' }} />
          <div>
            <div style={{ fontSize: 22, color: '#e8e8e8', fontWeight: 600 }}>{totalEndings}</div>
            <div>결말</div>
          </div>
          <div style={{ width: 1, background: '#2a2c3a' }} />
          <div>
            <div style={{ fontSize: 22, color: '#7dffaa', fontWeight: 600 }}>{clearedEndings}</div>
            <div>달성</div>
          </div>
        </div>

        {/* 누적 성격 */}
        {totalChoicesMade > 0 && (
          <div style={{ marginTop: 16, width: '100%', maxWidth: 420 }}>
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

        {/* 업적 (한 번이라도 결말 도달했을 때) */}
        {clearedEndings > 0 && (
          <div style={{ marginTop: 16, width: '100%', maxWidth: 420 }}>
            <button
              onClick={() => setShowAchievements((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: '#1f2030',
                border: '1px solid #2a2c3a',
                borderRadius: 8,
                color: '#e8e8e8',
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                업적 <span style={{ color: '#7dffaa' }}>{unlockedAchCount}</span>
                <span style={{ color: '#5a5d70' }}> / {ACHIEVEMENTS.length}</span>
              </span>
              <span style={{ color: '#7a7e92', fontSize: 14 }}>
                {showAchievements ? '▾' : '▸'}
              </span>
            </button>
            {showAchievements && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                  gap: 6,
                  marginTop: 8,
                  padding: 10,
                  background: '#1a1b25',
                  borderRadius: 8,
                  border: '1px solid #2a2c3a',
                }}
              >
                {achievements.map(({ achievement: a, unlocked, progressText }) => (
                  <div
                    key={a.id}
                    title={`${a.title}\n${a.description}\n${progressText}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      padding: '6px 4px',
                      background: unlocked ? '#1f2030' : '#181923',
                      border: `1px solid ${unlocked ? '#3a3d50' : '#252631'}`,
                      borderRadius: 6,
                      opacity: unlocked ? 1 : 0.4,
                      filter: unlocked ? 'none' : 'grayscale(80%)',
                      cursor: 'help',
                    }}
                  >
                    <div style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</div>
                    <div
                      style={{
                        fontSize: 8,
                        color: unlocked ? '#a8acc1' : '#5a5d70',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {a.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 추천 시나리오 */}
        {recommendations.length > 0 && topArchetypeName && (
          <div style={{ marginTop: 16, width: '100%', maxWidth: 420 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: '#7a7e92',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {topArchetypeName.icon} {topArchetypeName.name}에게 어울리는 이야기
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recommendations.map((s) => (
                <RecommendCard
                  key={s.id}
                  scenario={s}
                  archetypeColor={topArchetypeName.color}
                  onClick={() => onSelectScenario(s.id)}
                />
              ))}
            </div>
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
          margin: '24px auto 0',
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
            진행 중:{' '}
            <span style={{ color: inProgress.accent }}>
              {inProgress.icon} {inProgress.title}
            </span>
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

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onShowStats}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: '#a8acc1',
              border: '1px solid #2a2c3a',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📊 상세 통계
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
            style={{
              padding: '12px 14px',
              background: 'transparent',
              color: muted ? '#5a5d70' : '#a8acc1',
              border: '1px solid #2a2c3a',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            title={muted ? '소리 켜기' : '소리 끄기'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            color: '#5a5d70',
            fontSize: 10,
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {clearedScenarios} / {totalScenarios} 시나리오에서 결말 발견
        </div>
      </footer>
    </div>
  );
}

function RecommendCard({
  scenario,
  archetypeColor,
  onClick,
}: {
  scenario: ScenarioMeta;
  archetypeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: '#1f2030',
        border: `1px solid ${archetypeColor}33`,
        borderLeft: `3px solid ${scenario.accent}`,
        borderRadius: 8,
        textAlign: 'left',
        color: '#e8e8e8',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s, transform 0.06s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#262739')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#1f2030')}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>{scenario.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: scenario.accent }}>
          {scenario.title}
        </div>
        <div style={{ fontSize: 11, color: '#a8acc1', marginTop: 1 }}>{scenario.subtitle}</div>
      </div>
      <span style={{ color: '#5a5d70', fontSize: 14 }}>›</span>
    </button>
  );
}

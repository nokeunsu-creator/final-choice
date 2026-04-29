import { useMemo } from 'react';
import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount } from '../data/scenariosMeta';
import { CATEGORY_META, CATEGORY_ORDER, type ScenarioCategory } from '../data/types';
import { aggregateCounts, axisBalances, scoreArchetypes } from '../data/archetypes';
import { ACHIEVEMENTS, unlockedCount } from '../data/achievements';

interface Props {
  onBack: () => void;
}

interface CategoryStat {
  category: ScenarioCategory;
  cleared: number;
  total: number;
  scenarios: number;
  startedScenarios: number;
}

export function StatsScreen({ onBack }: Props) {
  const { save } = useGame();

  const totalEndings = useMemo(
    () => SCENARIOS.reduce((s, sc) => s + getEndingCount(sc.id), 0),
    [],
  );

  const clearedEndings = useMemo(
    () =>
      SCENARIOS.reduce(
        (s, sc) => s + (save.byScenario[sc.id]?.endingsCleared.length ?? 0),
        0,
      ),
    [save.byScenario],
  );

  const startedScenarios = useMemo(
    () =>
      SCENARIOS.filter((sc) => {
        const st = save.byScenario[sc.id];
        return st && (st.visitedNodes.length > 1 || st.endingsCleared.length > 0);
      }).length,
    [save.byScenario],
  );

  const completedScenarios = useMemo(
    () =>
      SCENARIOS.filter((sc) => {
        const st = save.byScenario[sc.id];
        return st && st.endingsCleared.length >= getEndingCount(sc.id);
      }).length,
    [save.byScenario],
  );

  const cumulativeTraits = useMemo(
    () => aggregateCounts(SCENARIOS.map((s) => save.byScenario[s.id]?.traitCounts)),
    [save.byScenario],
  );
  const totalChoices = Object.values(cumulativeTraits).reduce((a, b) => a + (b ?? 0), 0);

  const categoryStats = useMemo<CategoryStat[]>(
    () =>
      CATEGORY_ORDER.map((cat) => {
        const scs = SCENARIOS.filter((s) => s.category === cat);
        let cleared = 0,
          total = 0,
          startedCount = 0;
        for (const sc of scs) {
          cleared += save.byScenario[sc.id]?.endingsCleared.length ?? 0;
          total += getEndingCount(sc.id);
          const st = save.byScenario[sc.id];
          if (st && (st.visitedNodes.length > 1 || st.endingsCleared.length > 0)) startedCount++;
        }
        return {
          category: cat,
          cleared,
          total,
          scenarios: scs.length,
          startedScenarios: startedCount,
        };
      }),
    [save.byScenario],
  );

  const archetypeRanking = useMemo(() => scoreArchetypes(cumulativeTraits), [cumulativeTraits]);
  const axes = useMemo(() => axisBalances(cumulativeTraits), [cumulativeTraits]);

  const topScenarios = useMemo(
    () =>
      [...SCENARIOS]
        .map((s) => ({
          scenario: s,
          cleared: save.byScenario[s.id]?.endingsCleared.length ?? 0,
          total: getEndingCount(s.id),
        }))
        .filter((x) => x.cleared > 0)
        .sort((a, b) => b.cleared / b.total - a.cleared / a.total)
        .slice(0, 5),
    [save.byScenario],
  );

  const completionPct = totalEndings > 0 ? (clearedEndings / totalEndings) * 100 : 0;
  const ach = unlockedCount(save);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, #1f2030 0%, #16171f 55%, #0f1018 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1c1c1c',
          background: '#0c0c0c',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a8acc1',
            fontSize: 13,
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← 메인
        </button>
        <span style={{ fontSize: 11, color: '#666', letterSpacing: 3 }}>📊 통계</span>
      </header>

      <main
        style={{
          flex: 1,
          padding: '20px clamp(14px, 4vw, 16px) 32px',
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <Section title="전체 진척률">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BigStat
              label="결말 수집"
              value={`${clearedEndings} / ${totalEndings}`}
              percent={completionPct}
              color="#7dffaa"
            />
            <Row>
              <Stat label="시작한 시나리오" value={`${startedScenarios} / ${SCENARIOS.length}`} />
              <Stat label="완전 클리어" value={`${completedScenarios} / ${SCENARIOS.length}`} />
            </Row>
            <Row>
              <Stat label="누적 선택" value={String(totalChoices)} />
              <Stat label="업적" value={`${ach} / ${ACHIEVEMENTS.length}`} />
            </Row>
          </div>
        </Section>

        <Section title="카테고리별 진척률">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categoryStats.map((c) => (
              <CategoryRow key={c.category} stat={c} />
            ))}
          </div>
        </Section>

        {totalChoices >= 5 && (
          <Section title="아키타입 분포">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archetypeRanking.slice(0, 5).map((r) => (
                <div key={r.archetype.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#e8e8e8' }}>
                      {r.archetype.icon} {r.archetype.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#7a7e92' }}>{r.percent}%</span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: '#1a1b25',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${r.percent}%`,
                        height: '100%',
                        background: r.archetype.color,
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {totalChoices >= 5 && (
          <Section title="6축 성격 균형">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {axes.map((axis) => (
                <AxisBar key={axis.axis} axis={axis} />
              ))}
            </div>
          </Section>
        )}

        {topScenarios.length > 0 && (
          <Section title="가장 많이 발견한 시나리오">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topScenarios.map((t) => (
                <div
                  key={t.scenario.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    background: '#1f2030',
                    borderLeft: `3px solid ${t.scenario.accent}`,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.scenario.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: t.scenario.accent,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.scenario.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#7a7e92' }}>
                      {t.cleared} / {t.total} 결말
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#a8acc1' }}>
                    {Math.round((t.cleared / t.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {totalChoices < 5 && (
          <div
            style={{
              padding: 16,
              background: '#1a1b25',
              border: '1px solid #2a2c3a',
              borderRadius: 8,
              fontSize: 12,
              color: '#a8acc1',
              textAlign: 'center',
              lineHeight: 1.7,
            }}
          >
            5번 이상 선택하면 성격 분석 통계가 활성화됩니다.
            <br />
            현재: <span style={{ color: '#ffaa00' }}>{totalChoices} / 5</span>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 3,
          color: '#7a7e92',
          marginBottom: 10,
          paddingLeft: 2,
        }}
      >
        {title.toUpperCase()}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 10 }}>{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '10px 12px',
        background: '#1a1b25',
        border: '1px solid #2a2c3a',
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 10, color: '#7a7e92', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, color: '#e8e8e8', fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function BigStat({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: '#1a1b25',
        border: '1px solid #2a2c3a',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 11, color: '#7a7e92' }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{percent.toFixed(1)}%</span>
      </div>
      <div style={{ fontSize: 22, color: '#e8e8e8', fontWeight: 700, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ height: 6, background: '#0f1018', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            transition: 'width 0.4s',
          }}
        />
      </div>
    </div>
  );
}

function CategoryRow({ stat }: { stat: CategoryStat }) {
  const meta = CATEGORY_META[stat.category];
  const pct = stat.total > 0 ? (stat.cleared / stat.total) * 100 : 0;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, color: '#e8e8e8' }}>
          {meta.icon} {stat.category}
          <span style={{ fontSize: 10, color: '#5a5d70', marginLeft: 8 }}>
            {stat.startedScenarios}/{stat.scenarios} 개시
          </span>
        </span>
        <span style={{ fontSize: 11, color: '#a8acc1' }}>
          {stat.cleared} / {stat.total}
        </span>
      </div>
      <div
        style={{ height: 4, background: '#1a1b25', borderRadius: 2, overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: meta.color,
            transition: 'width 0.4s',
          }}
        />
      </div>
    </div>
  );
}

function AxisBar({ axis }: { axis: ReturnType<typeof axisBalances>[number] }) {
  const total = axis.leftCount + axis.rightCount;
  // bias -1 ~ +1, transform to 0-100 percentage of right side
  const rightPct = total === 0 ? 50 : (axis.rightCount / total) * 100;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          fontSize: 11,
        }}
      >
        <span style={{ color: '#a8acc1' }}>
          {axis.left} <span style={{ color: '#5a5d70' }}>{axis.leftCount}</span>
        </span>
        <span style={{ color: '#a8acc1' }}>
          <span style={{ color: '#5a5d70' }}>{axis.rightCount}</span> {axis.right}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 4,
          background: '#1a1b25',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${100 - rightPct}%`,
            height: '100%',
            background: '#5a5d70',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: `${rightPct}%`,
            height: '100%',
            background: '#a8acc1',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -2,
            width: 1,
            height: 8,
            background: '#3a3d50',
          }}
        />
      </div>
    </div>
  );
}

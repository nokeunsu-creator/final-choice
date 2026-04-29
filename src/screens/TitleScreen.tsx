import { useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { SCENARIOS, getEndingCount, getNodeCount } from '../data/scenarios';
import { CATEGORY_META, CATEGORY_ORDER, type ScenarioCategory, type ScenarioMeta } from '../data/types';

interface Props {
  onSelectScenario: (scenarioId: string) => void;
  onBack: () => void;
}

export function TitleScreen({ onSelectScenario, onBack }: Props) {
  const { save } = useGame();
  const [filter, setFilter] = useState<ScenarioCategory | 'all'>('all');

  const grouped = useMemo(() => {
    const map = new Map<ScenarioCategory, ScenarioMeta[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const s of SCENARIOS) {
      const list = map.get(s.category);
      if (list) list.push(s);
    }
    return map;
  }, []);

  const visibleCats = filter === 'all' ? CATEGORY_ORDER : [filter];

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
          maxWidth: 720,
          width: '100%',
          margin: '0 auto 16px',
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
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#5a5d70' }}>
          {SCENARIOS.length}개
        </span>
      </header>

      {/* 카테고리 필터 칩 */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          maxWidth: 720,
          width: '100%',
          margin: '0 auto 16px',
        }}
      >
        <FilterChip label="전체" active={filter === 'all'} onClick={() => setFilter('all')} />
        {CATEGORY_ORDER.map((cat) => {
          const count = grouped.get(cat)?.length ?? 0;
          if (count === 0) return null;
          return (
            <FilterChip
              key={cat}
              label={`${CATEGORY_META[cat].icon} ${cat}`}
              count={count}
              color={CATEGORY_META[cat].color}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            />
          );
        })}
      </div>

      <main style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1 }}>
        {visibleCats.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={cat} style={{ marginBottom: 24 }}>
              <CategoryHeader category={cat} count={list.length} />
              <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                {list.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    state={save.byScenario[scenario.id]}
                    onClick={() => onSelectScenario(scenario.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer style={{ textAlign: 'center', color: '#5a5d70', fontSize: 11, marginTop: 24 }}>
        FinalChoice · 텍스트 기반 어드벤처
      </footer>
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: active ? (color ?? '#ffaa00') : '#1f2030',
        color: active ? '#16171f' : '#a8acc1',
        border: `1px solid ${active ? (color ?? '#ffaa00') : '#2a2c3a'}`,
        borderRadius: 999,
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{ marginLeft: 4, opacity: 0.7 }}>· {count}</span>
      )}
    </button>
  );
}

function CategoryHeader({ category, count }: { category: ScenarioCategory; count: number }) {
  const meta = CATEGORY_META[category];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 6,
        borderBottom: `1px solid ${meta.color}33`,
      }}
    >
      <span style={{ fontSize: 18 }}>{meta.icon}</span>
      <h3
        style={{
          margin: 0,
          color: meta.color,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        {category}
      </h3>
      <span style={{ fontSize: 11, color: '#5a5d70', marginLeft: 'auto' }}>
        {count}개
      </span>
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
        padding: '14px 16px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 26, lineHeight: 1 }}>{scenario.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: scenario.accent,
                letterSpacing: 0.3,
              }}
            >
              {scenario.title}
            </span>
            {inProgress && (
              <span style={{ fontSize: 10, color: '#ffaa00', letterSpacing: 1 }}>· 진행 중</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#a8acc1', marginTop: 2 }}>{scenario.subtitle}</div>
          <div style={{ fontSize: 10, color: '#7a7e92', marginTop: 6 }}>
            {totalNodes}n · {totalEndings} 결말 · 달성 {cleared}/{totalEndings}
            {visited > 1 && ` · 방문 ${visited}`}
          </div>
        </div>
        <div style={{ color: '#5a5d70', fontSize: 18 }}>›</div>
      </div>
    </button>
  );
}

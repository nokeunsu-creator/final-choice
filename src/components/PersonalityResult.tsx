import { axisBalances, scoreArchetypes } from '../data/archetypes';
import type { TraitCounts } from '../data/types';

interface Props {
  traitCounts: TraitCounts;
  /** 'compact' = 한 줄 요약, 'full' = 상세 */
  variant?: 'compact' | 'full';
  title?: string;
}

export function PersonalityResult({ traitCounts, variant = 'full', title }: Props) {
  const totalChoices = Object.values(traitCounts).reduce((s, v) => s + (v ?? 0), 0);

  if (totalChoices === 0) {
    return (
      <div
        style={{
          padding: 14,
          background: '#1f2030',
          border: '1px dashed #3a3d50',
          borderRadius: 8,
          textAlign: 'center',
          color: '#7a7e92',
          fontSize: 12,
        }}
      >
        선택을 쌓아가면 성격이 드러납니다
      </div>
    );
  }

  const ranked = scoreArchetypes(traitCounts);
  const top = ranked[0];
  const second = ranked[1];

  if (variant === 'compact') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          background: '#1f2030',
          border: `1px solid ${top.archetype.color}33`,
          borderLeft: `3px solid ${top.archetype.color}`,
          borderRadius: 8,
        }}
      >
        <span style={{ fontSize: 22 }}>{top.archetype.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: top.archetype.color, fontWeight: 600 }}>
            {top.archetype.name}
          </div>
          <div style={{ fontSize: 11, color: '#a8acc1', marginTop: 1 }}>
            {top.archetype.oneLiner}
          </div>
        </div>
        {second && (
          <div style={{ fontSize: 10, color: '#5a5d70', textAlign: 'right' }}>
            <div>다음 성향</div>
            <div style={{ color: '#a8acc1' }}>
              {second.archetype.icon} {second.archetype.name}
            </div>
          </div>
        )}
      </div>
    );
  }

  const balances = axisBalances(traitCounts);

  return (
    <div
      style={{
        padding: 18,
        background: '#1f2030',
        border: `1px solid ${top.archetype.color}33`,
        borderRadius: 10,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: '#7a7e92',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {title}
        </div>
      )}

      {/* 메인 아키타입 */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>{top.archetype.icon}</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: top.archetype.color,
            letterSpacing: 0.5,
          }}
        >
          {top.archetype.name}
        </div>
        <div style={{ fontSize: 13, color: '#a8acc1', marginTop: 4 }}>
          {top.archetype.oneLiner}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#7a7e92',
            marginTop: 12,
            lineHeight: 1.7,
            maxWidth: 360,
            margin: '12px auto 0',
          }}
        >
          {top.archetype.description}
        </div>
      </div>

      {/* 두 번째 성향 */}
      {second && (
        <div
          style={{
            fontSize: 12,
            color: '#7a7e92',
            textAlign: 'center',
            margin: '8px 0 16px',
            paddingTop: 12,
            borderTop: '1px solid #2a2c3a',
          }}
        >
          다음으로는 {second.archetype.icon}{' '}
          <span style={{ color: second.archetype.color }}>{second.archetype.name}</span>
        </div>
      )}

      {/* 6축 균형 시각화 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {balances
          .filter((b) => b.leftCount + b.rightCount > 0)
          .map((b) => (
            <AxisBar key={b.axis} balance={b} />
          ))}
      </div>

      <div style={{ fontSize: 10, color: '#5a5d70', textAlign: 'center', marginTop: 12 }}>
        지금까지 {totalChoices}번의 선택에서 분석
      </div>
    </div>
  );
}

interface BarProps {
  balance: import('../data/archetypes').AxisBalance;
}

function AxisBar({ balance }: BarProps) {
  const { left, right, leftCount, rightCount, bias } = balance;
  // bias: -1(왼쪽 우세) ~ +1(오른쪽 우세). 시각화는 0% ~ 100%
  const rightPct = Math.round(((bias + 1) / 2) * 100);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#7a7e92',
          marginBottom: 4,
        }}
      >
        <span style={{ color: bias < 0 ? '#e8e8e8' : '#7a7e92' }}>
          {left} ({leftCount})
        </span>
        <span style={{ color: bias > 0 ? '#e8e8e8' : '#7a7e92' }}>
          ({rightCount}) {right}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 6,
          background: '#2a2c3a',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            background: '#3a3d50',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: bias < 0 ? `${rightPct}%` : '50%',
            right: bias < 0 ? '50%' : `${100 - rightPct}%`,
            background: bias < 0 ? '#a78bfa' : '#fbbf24',
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}

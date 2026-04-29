import { useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getAllNodes, getNode } from '../data/scenarios';
import { getEndingCount, getScenario } from '../data/scenariosMeta';
import { scoreArchetypes } from '../data/archetypes';
import { showInterstitialAd } from '../ads/interstitial';
import { PersonalityResult } from '../components/PersonalityResult';
import { shareEnding } from '../utils/share';

interface Props {
  onReturnToTitle: () => void;
  onRetryScenario: () => void;
  onShowMap: () => void;
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

export function EndingScreen({ onReturnToTitle, onRetryScenario, onShowMap }: Props) {
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
  const remainingEndings = Math.max(0, totalEndings - clearedCount);

  // 분기 힌트: 이 엔딩의 부모 노드에서 안 가본 다른 선택지들
  const untakenSiblings = useMemo<string[]>(() => {
    if (!scenarioId || !node || !current) return [];
    const visited = current.visitedNodes;
    if (visited.length < 2) return [];
    const parentId = visited[visited.length - 2];
    const parent = getNode(scenarioId, parentId);
    if (!parent) return [];
    return parent.choices
      .filter((c) => c.nextNodeId !== node.nodeId)
      .map((c) => c.label);
  }, [scenarioId, node, current]);

  // 미발견 결말 제목 (스포일러 — 최대 2개만 살짝 노출)
  const unseenEndingTitles = useMemo<string[]>(() => {
    if (!scenarioId || !current) return [];
    const allNodes = getAllNodes(scenarioId);
    const cleared = new Set(current.endingsCleared);
    return allNodes
      .filter((n) => n.choices.length === 0 && n.endingTitle && !cleared.has(n.endingTitle))
      .map((n) => n.endingTitle!)
      .slice(0, 2);
  }, [scenarioId, current]);

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

  const [shareToast, setShareToast] = useState<string | null>(null);
  const handleShare = async () => {
    if (!scenario || !node?.endingTitle || !node.endingType) return;
    const traits = current?.traitCounts ?? {};
    const totalChoices = Object.values(traits).reduce((s, v) => s + (v ?? 0), 0);
    const top = totalChoices > 0 ? scoreArchetypes(traits)[0]?.archetype : undefined;
    const result = await shareEnding({
      scenarioTitle: scenario.title,
      scenarioIcon: scenario.icon,
      endingTitle: node.endingTitle,
      endingType: node.endingType,
      archetypeName: top?.name,
      archetypeIcon: top?.icon,
    });
    if (result === 'copied') setShareToast('클립보드에 복사됨');
    else if (result === 'shared') setShareToast('공유 완료');
    else if (result === 'unavailable') setShareToast('공유를 사용할 수 없는 환경입니다');
    if (result !== 'cancelled') {
      window.setTimeout(() => setShareToast(null), 2200);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#16171f',
        padding: '40px clamp(14px, 5vw, 24px) 28px',
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
            fontSize: 'clamp(22px, 6vw, 26px)',
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

        <div style={{ marginTop: 28, fontSize: 12, color: '#555' }}>
          이 시나리오 결말: {clearedCount} / {totalEndings}
          {node?.endingTitle && (current?.endingCounts?.[node.endingTitle] ?? 0) > 0 && (
            <span style={{ marginLeft: 10, color: '#a8acc1' }}>
              · 이 결말 <span style={{ color: '#ffaa00' }}>{current?.endingCounts?.[node.endingTitle]}</span>회 도달
            </span>
          )}
        </div>

        {/* 분기 힌트 */}
        {(untakenSiblings.length > 0 || remainingEndings > 0) && (
          <div
            style={{
              maxWidth: 560,
              margin: '24px auto 0',
              padding: '14px 16px',
              background: '#1a1b25',
              border: '1px solid #2a2c3a',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: '#7a7e92',
                marginBottom: 10,
              }}
            >
              💡 다음에 시도해볼 길
            </div>
            {untakenSiblings.length > 0 && (
              <div style={{ marginBottom: unseenEndingTitles.length > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, color: '#a8acc1', marginBottom: 6 }}>
                  마지막 갈림길에서 안 가본 선택:
                </div>
                {untakenSiblings.map((label, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13,
                      color: '#e8e8e8',
                      padding: '4px 0',
                      borderLeft: '2px solid #3a3d50',
                      paddingLeft: 10,
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
            {remainingEndings > 0 && (
              <div style={{ fontSize: 11, color: '#a8acc1' }}>
                아직 발견하지 않은 결말{' '}
                <span style={{ color: '#ffaa00', fontWeight: 600 }}>{remainingEndings}개</span>
                {unseenEndingTitles.length > 0 && (
                  <span style={{ color: '#5a5d70' }}>
                    {' '}
                    — 예: {unseenEndingTitles.map((t) => `"${t.charAt(0)}…"`).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 성격 결과 */}
        <div style={{ maxWidth: 560, margin: '32px auto 0', textAlign: 'left' }}>
          <PersonalityResult
            traitCounts={current?.traitCounts ?? {}}
            variant="full"
            title="이 이야기에서 당신은"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, position: 'relative' }}>
        <button
          onClick={handleShare}
          disabled={loading}
          style={endingButtonStyle('#a8acc1', loading)}
        >
          📤 공유하기
        </button>
        <button
          onClick={onShowMap}
          disabled={loading}
          style={endingButtonStyle('#a8acc1', loading)}
        >
          🗺️ 분기 지도 보기
        </button>
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

        {shareToast && (
          <div
            style={{
              position: 'fixed',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 100,
              padding: '10px 16px',
              background: '#1f2030',
              border: '1px solid #3a3d50',
              borderRadius: 8,
              color: '#e8e8e8',
              fontSize: 13,
              boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              zIndex: 100,
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {shareToast}
          </div>
        )}
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

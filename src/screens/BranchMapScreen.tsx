import { useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getAllNodes } from '../data/scenarios';
import { getScenario } from '../data/scenariosMeta';
import type { StoryNode } from '../data/types';

interface Props {
  onBack: () => void;
}

const ENDING_COLORS: Record<string, string> = {
  good: '#7dffaa',
  bad: '#ff6666',
  neutral: '#ffaa00',
};

interface Layer {
  depth: number;
  nodes: StoryNode[];
}

function buildLayers(nodes: StoryNode[]): Layer[] {
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const depth = new Map<number, number>();
  const queue: number[] = [1];
  depth.set(1, 0);
  while (queue.length) {
    const id = queue.shift()!;
    const d = depth.get(id) ?? 0;
    const node = byId.get(id);
    if (!node) continue;
    for (const c of node.choices) {
      if (!depth.has(c.nextNodeId)) {
        depth.set(c.nextNodeId, d + 1);
        queue.push(c.nextNodeId);
      }
    }
  }
  const grouped = new Map<number, StoryNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.nodeId) ?? 999;
    if (!grouped.has(d)) grouped.set(d, []);
    grouped.get(d)!.push(n);
  }
  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([d, ns]) => ({ depth: d, nodes: ns.sort((a, b) => a.nodeId - b.nodeId) }));
}

export function BranchMapScreen({ onBack }: Props) {
  const { save, current } = useGame();
  const scenarioId = save.scenarioId;
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const [showSpoilers, setShowSpoilers] = useState(false);

  const nodes = useMemo(() => (scenarioId ? getAllNodes(scenarioId) : []), [scenarioId]);
  const layers = useMemo(() => buildLayers(nodes), [nodes]);

  const visited = useMemo(
    () => new Set(current?.visitedNodes ?? []),
    [current?.visitedNodes],
  );
  const clearedTitles = useMemo(
    () => new Set(current?.endingsCleared ?? []),
    [current?.endingsCleared],
  );
  const totalEndings = nodes.filter((n) => n.choices.length === 0).length;
  const visitedCount = nodes.filter((n) => visited.has(n.nodeId)).length;
  const currentNodeId = current?.currentNodeId;

  if (!scenarioId || !scenario) {
    return (
      <div style={{ padding: 24, color: '#ff6666', background: '#16171f', minHeight: '100vh' }}>
        시나리오를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#16171f', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #1c1c1c',
          background: '#0c0c0c',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            ← 돌아가기
          </button>
          <span style={{ fontSize: 11, color: '#666', letterSpacing: 1 }}>
            {scenario.icon} {scenario.title}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, color: '#7a7e92', letterSpacing: 1 }}>
            방문 {visitedCount} / {nodes.length} · 결말 {clearedTitles.size} / {totalEndings}
          </span>
          <label
            style={{
              fontSize: 11,
              color: '#a8acc1',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showSpoilers}
              onChange={(e) => setShowSpoilers(e.target.checked)}
              style={{ accentColor: '#ffaa00' }}
            />
            스포일러 보기
          </label>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: '20px clamp(12px, 4vw, 16px) 32px',
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {layers.map((layer) => (
          <div key={layer.depth} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: '#5a5d70',
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              DEPTH {layer.depth}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {layer.nodes.map((n) => (
                <NodeCard
                  key={n.nodeId}
                  node={n}
                  visited={visited.has(n.nodeId)}
                  isCurrent={n.nodeId === currentNodeId}
                  showSpoilers={showSpoilers}
                  endingCleared={n.endingTitle ? clearedTitles.has(n.endingTitle) : false}
                />
              ))}
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 24,
            padding: 12,
            fontSize: 11,
            color: '#7a7e92',
            background: '#1a1b25',
            borderRadius: 8,
            border: '1px solid #2a2c3a',
            lineHeight: 1.7,
          }}
        >
          <div style={{ marginBottom: 4 }}>● 채워진 카드 = 방문</div>
          <div style={{ marginBottom: 4 }}>○ 점선 카드 = 미방문 (스포일러 보기 시 내용 노출)</div>
          <div>★ 노란 테두리 = 현재 위치 / 색깔 = 결말 종류</div>
        </div>
      </main>
    </div>
  );
}

function NodeCard({
  node,
  visited,
  isCurrent,
  showSpoilers,
  endingCleared,
}: {
  node: StoryNode;
  visited: boolean;
  isCurrent: boolean;
  showSpoilers: boolean;
  endingCleared: boolean;
}) {
  const isEnding = node.choices.length === 0;
  const endingColor = isEnding && node.endingType ? ENDING_COLORS[node.endingType] : null;
  const reveal = visited || showSpoilers;

  const borderColor = isCurrent
    ? '#ffaa00'
    : visited
      ? endingColor ?? '#3a3d50'
      : endingColor ?? '#2a2c3a';
  const borderStyle = visited || isCurrent ? 'solid' : 'dashed';
  const bg = visited ? '#1f2030' : '#16171f';
  const opacity = reveal ? 1 : 0.65;

  return (
    <div
      style={{
        padding: '10px 12px',
        background: bg,
        border: `1px ${borderStyle} ${borderColor}`,
        borderLeft: `3px ${borderStyle} ${borderColor}`,
        borderRadius: 6,
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 9, color: '#5a5d70', letterSpacing: 2 }}>
          NODE {String(node.nodeId).padStart(3, '0')}
        </span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isCurrent && (
            <span style={{ fontSize: 9, color: '#ffaa00', letterSpacing: 1 }}>★ 현재</span>
          )}
          {isEnding && endingColor && (
            <span
              style={{
                fontSize: 9,
                color: endingColor,
                letterSpacing: 1,
                padding: '2px 6px',
                background: `${endingColor}22`,
                borderRadius: 4,
              }}
            >
              {endingCleared ? '✓ ' : ''}
              {node.endingType?.toUpperCase()}
            </span>
          )}
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: reveal ? '#e8e8e8' : '#5a5d70',
          lineHeight: 1.5,
          marginBottom: node.choices.length > 0 ? 6 : 0,
        }}
      >
        {reveal ? truncate(node.text, 80) : '???'}
      </div>
      {isEnding && node.endingTitle && (
        <div
          style={{
            fontSize: 11,
            color: reveal ? endingColor ?? '#a8acc1' : '#5a5d70',
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          🏁 {reveal ? node.endingTitle : '???'}
        </div>
      )}
      {node.choices.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {node.choices.map((c, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                color: reveal ? '#a8acc1' : '#5a5d70',
                padding: '2px 8px',
                background: '#13141d',
                border: '1px solid #2a2c3a',
                borderRadius: 4,
              }}
            >
              {reveal ? `${c.label} → ${c.nextNodeId}` : `??? → ${c.nextNodeId}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

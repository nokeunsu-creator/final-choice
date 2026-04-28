import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getNode, isEnding } from '../data/nodes';
import { TypewriterText } from '../components/TypewriterText';
import { ChoiceButton } from '../components/ChoiceButton';
import { Inventory } from '../components/Inventory';

interface Props {
  onReachEnding: () => void;
}

export function GameScreen({ onReachEnding }: Props) {
  const { state, goTo, recordEnding } = useGame();
  const node = getNode(state.currentNodeId);
  const [textDone, setTextDone] = useState(false);

  useEffect(() => {
    setTextDone(false);
  }, [state.currentNodeId]);

  useEffect(() => {
    if (node && isEnding(node) && node.endingTitle) {
      recordEnding(node.endingTitle);
      // 텍스트 출력이 끝난 뒤 엔딩 화면으로 이동
      const t = window.setTimeout(() => onReachEnding(), 1500);
      return () => window.clearTimeout(t);
    }
    return;
  }, [node, recordEnding, onReachEnding]);

  if (!node) {
    return (
      <div style={{ padding: 24, color: '#ff6666' }}>
        잘못된 노드: {state.currentNodeId}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
      }}
    >
      {/* 상단 인벤토리 */}
      <header
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1c1c1c',
          background: '#0c0c0c',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, color: '#444', letterSpacing: 2 }}>
            NODE {String(node.nodeId).padStart(3, '0')}
          </span>
          <span style={{ fontSize: 11, color: '#444' }}>
            {state.visitedNodes.length} / 100
          </span>
        </div>
        <Inventory items={state.inventory} />
      </header>

      {/* 본문 */}
      <main
        className="fade-in"
        style={{
          padding: '24px 20px 12px',
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <TypewriterText
          text={node.text}
          resetKey={node.nodeId}
          onDone={() => setTextDone(true)}
        />
      </main>

      {/* 선택지 (본문과 한 줄 정도 간격) */}
      {!isEnding(node) && (
        <footer
          style={{
            padding: '16px 20px 28px',
            maxWidth: 720,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
            opacity: textDone ? 1 : 0.4,
            transition: 'opacity 0.4s',
            pointerEvents: textDone ? 'auto' : 'none',
          }}
        >
          {node.choices.map((choice, idx) => {
            const lacks =
              choice.requiredItem !== null &&
              !state.inventory.includes(choice.requiredItem);
            return (
              <ChoiceButton
                key={`${node.nodeId}-${idx}`}
                label={choice.label}
                disabled={lacks}
                hint={lacks ? `${choice.requiredItem} 필요` : null}
                onClick={() => goTo(choice.nextNodeId, choice.grantItem ?? null)}
              />
            );
          })}
        </footer>
      )}
    </div>
  );
}

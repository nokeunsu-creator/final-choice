import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getNode, isEnding } from '../data/scenarios';
import { getNodeCount, getScenario } from '../data/scenariosMeta';
import { TypewriterText } from '../components/TypewriterText';
import { ChoiceButton } from '../components/ChoiceButton';
import { Inventory } from '../components/Inventory';

interface Props {
  onExit: () => void;
}

export function GameScreen({ onExit }: Props) {
  const { save, current, goTo } = useGame();
  const scenarioId = save.scenarioId;
  const node = scenarioId && current ? getNode(scenarioId, current.currentNodeId) : undefined;
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const [textDone, setTextDone] = useState(false);

  useEffect(() => {
    setTextDone(false);
  }, [current?.currentNodeId, scenarioId]);

  if (!scenarioId || !current || !node || !scenario) {
    return (
      <div style={{ padding: 24, color: '#ff6666' }}>
        시나리오를 불러올 수 없습니다.
      </div>
    );
  }

  const totalNodes = getNodeCount(scenarioId);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#16171f',
      }}
    >
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <button
            onClick={onExit}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              fontSize: 13,
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← 시나리오 선택
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
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 10, color: '#555', letterSpacing: 2 }}>
            NODE {String(node.nodeId).padStart(3, '0')}
          </span>
          <span style={{ fontSize: 10, color: '#555' }}>
            {current.visitedNodes.length} / {totalNodes}
          </span>
        </div>
        <Inventory items={current.inventory} />
      </header>

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
          resetKey={`${scenarioId}-${node.nodeId}`}
          onDone={() => setTextDone(true)}
        />
      </main>

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
              !current.inventory.includes(choice.requiredItem);
            return (
              <ChoiceButton
                key={`${node.nodeId}-${idx}`}
                label={choice.label}
                disabled={lacks}
                hint={lacks ? `${choice.requiredItem} 필요` : null}
                onClick={() => goTo(choice.nextNodeId, choice.grantItem ?? null, choice.traits)}
              />
            );
          })}
        </footer>
      )}
    </div>
  );
}

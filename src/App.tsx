import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { getNode, isEnding } from './data/scenarios';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { EndingScreen } from './screens/EndingScreen';

type Screen = 'title' | 'play';

export function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

function Router() {
  const [screen, setScreen] = useState<Screen>('title');
  const { save, current, selectScenario, recordEnding } = useGame();
  const node =
    save.scenarioId && current ? getNode(save.scenarioId, current.currentNodeId) : undefined;
  const onEnding = !!node && isEnding(node);

  // 엔딩 노드 도달 즉시 결말 기록 (reducer가 중복 차단)
  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
    }
  }, [onEnding, node, recordEnding]);

  if (screen === 'title' || !save.scenarioId) {
    return (
      <TitleScreen
        onSelectScenario={(id) => {
          selectScenario(id);
          setScreen('play');
        }}
      />
    );
  }
  if (onEnding) {
    return (
      <EndingScreen
        onReturnToTitle={() => setScreen('title')}
        onRetryScenario={() => {
          /* stay on play screen, state already reset */
        }}
      />
    );
  }
  return <GameScreen onExit={() => setScreen('title')} />;
}

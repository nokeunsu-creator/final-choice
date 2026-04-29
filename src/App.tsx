import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { getNode, isEnding } from './data/scenarios';
import { MainPage } from './screens/MainPage';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { EndingScreen } from './screens/EndingScreen';

type Screen = 'main' | 'select' | 'play';

export function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

function Router() {
  const [screen, setScreen] = useState<Screen>('main');
  const { save, current, selectScenario, recordEnding } = useGame();
  const node =
    save.scenarioId && current ? getNode(save.scenarioId, current.currentNodeId) : undefined;
  const onEnding = !!node && isEnding(node);

  // 엔딩 노드 도달 즉시 결말 기록
  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
    }
  }, [onEnding, node, recordEnding]);

  if (screen === 'main') {
    return (
      <MainPage
        onStart={() => setScreen('select')}
        onSelectScenario={(id) => {
          selectScenario(id);
          setScreen('play');
        }}
      />
    );
  }
  if (screen === 'select' || !save.scenarioId) {
    return (
      <TitleScreen
        onSelectScenario={(id) => {
          selectScenario(id);
          setScreen('play');
        }}
        onBack={() => setScreen('main')}
      />
    );
  }
  if (onEnding) {
    return (
      <EndingScreen
        onReturnToTitle={() => setScreen('select')}
        onRetryScenario={() => {
          /* stay on play screen, state already reset */
        }}
      />
    );
  }
  return <GameScreen onExit={() => setScreen('select')} />;
}

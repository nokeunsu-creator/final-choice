import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { getNode, isEnding } from './data/nodes';
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
  const { state, recordEnding } = useGame();
  const node = getNode(state.currentNodeId);
  const onEnding = !!node && isEnding(node);

  // 엔딩 노드 진입 즉시 결말 기록 (중복 등록은 reducer가 차단)
  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
    }
  }, [onEnding, node, recordEnding]);

  if (screen === 'title') return <TitleScreen onStart={() => setScreen('play')} />;
  if (onEnding) return <EndingScreen onReturnToTitle={() => setScreen('title')} />;
  return <GameScreen />;
}

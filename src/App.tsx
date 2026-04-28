import { useState } from 'react';
import { GameProvider } from './state/GameContext';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { EndingScreen } from './screens/EndingScreen';

type Screen = 'title' | 'game' | 'ending';

export function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

function Router() {
  const [screen, setScreen] = useState<Screen>('title');

  if (screen === 'title') return <TitleScreen onStart={() => setScreen('game')} />;
  if (screen === 'game') return <GameScreen onReachEnding={() => setScreen('ending')} />;
  return <EndingScreen onReturnToTitle={() => setScreen('title')} />;
}

import { lazy, Suspense, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { MainPage } from './screens/MainPage';
import { TitleScreen } from './screens/TitleScreen';
import { StatsScreen } from './screens/StatsScreen';

// 시나리오 데이터(JSON 79개)를 PlayScreen 모듈에 묶어 별도 청크로 분리
const PlayScreen = lazy(() => import('./screens/PlayScreen'));

type Screen = 'main' | 'select' | 'play' | 'stats';

export function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

function Router() {
  const [screen, setScreen] = useState<Screen>('main');
  const { save, selectScenario } = useGame();

  if (screen === 'main') {
    return (
      <MainPage
        onStart={() => setScreen('select')}
        onSelectScenario={(id) => {
          selectScenario(id);
          setScreen('play');
        }}
        onShowStats={() => setScreen('stats')}
      />
    );
  }
  if (screen === 'stats') {
    return <StatsScreen onBack={() => setScreen('main')} />;
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
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlayScreen
        onExitToSelect={() => setScreen('select')}
        onRetryScenario={() => {
          /* stay on play */
        }}
      />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#16171f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ color: '#7a7e92', fontSize: 11, letterSpacing: 6 }}>L O A D I N G</div>
    </div>
  );
}

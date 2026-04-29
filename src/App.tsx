import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { MainPage } from './screens/MainPage';
import { TitleScreen } from './screens/TitleScreen';
import { StatsScreen } from './screens/StatsScreen';

// 시나리오 데이터(JSON 79개)를 PlayScreen 모듈에 묶어 별도 청크로 분리
const PlayScreen = lazy(() => import('./screens/PlayScreen'));

type Screen = 'main' | 'select' | 'play' | 'play-map' | 'stats';

export function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

interface HistoryState {
  fc?: Screen;
}

function Router() {
  const [screen, setScreen] = useState<Screen>('main');
  const { save, selectScenario } = useGame();

  // 첫 진입 시 history에 'main' 마커 심기 (안드로이드 시스템 뒤로가기를 위함)
  useEffect(() => {
    const cur = (history.state as HistoryState | null)?.fc;
    if (!cur) {
      history.replaceState({ fc: 'main' } satisfies HistoryState, '');
    } else if (cur !== screen) {
      setScreen(cur);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 안드로이드 시스템 뒤로가기 / 브라우저 뒤로가기 → 앱 화면 동기화
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const target = ((e.state as HistoryState | null)?.fc) ?? 'main';
      setScreen(target);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((next: Screen) => {
    history.pushState({ fc: next } satisfies HistoryState, '');
    setScreen(next);
  }, []);

  const replace = useCallback((next: Screen) => {
    history.replaceState({ fc: next } satisfies HistoryState, '');
    setScreen(next);
  }, []);

  const goBack = useCallback(() => {
    history.back();
  }, []);

  if (screen === 'main') {
    return (
      <MainPage
        onStart={() => navigate('select')}
        onSelectScenario={(id) => {
          selectScenario(id);
          navigate('play');
        }}
        onShowStats={() => navigate('stats')}
      />
    );
  }
  if (screen === 'stats') {
    return <StatsScreen onBack={goBack} />;
  }
  if (screen === 'select' || !save.scenarioId) {
    return (
      <TitleScreen
        onSelectScenario={(id) => {
          selectScenario(id);
          navigate('play');
        }}
        onBack={goBack}
      />
    );
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlayScreen
        showMap={screen === 'play-map'}
        onShowMap={() => navigate('play-map')}
        onMapBack={goBack}
        onExitToSelect={() => replace('select')}
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

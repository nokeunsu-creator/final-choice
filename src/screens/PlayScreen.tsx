import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getNode, isEnding } from '../data/scenarios';
import { GameScreen } from './GameScreen';
import { EndingScreen } from './EndingScreen';
import { BranchMapScreen } from './BranchMapScreen';

interface Props {
  onExitToSelect: () => void;
  onRetryScenario: () => void;
}

/**
 * 게임/엔딩/지도 모두 포함한 컴포지트. App.tsx에서 React.lazy로 동적 로드되므로
 * 이 모듈에 시나리오 데이터(getNode, GameScreen, EndingScreen, BranchMapScreen)가 묶여 별도 청크.
 */
export default function PlayScreen({ onExitToSelect, onRetryScenario }: Props) {
  const { save, current, recordEnding } = useGame();
  const node =
    save.scenarioId && current ? getNode(save.scenarioId, current.currentNodeId) : undefined;
  const onEnding = !!node && isEnding(node);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
    }
  }, [onEnding, node, recordEnding]);

  if (showMap) {
    return <BranchMapScreen onBack={() => setShowMap(false)} />;
  }
  if (onEnding) {
    return (
      <EndingScreen
        onReturnToTitle={onExitToSelect}
        onRetryScenario={onRetryScenario}
        onShowMap={() => setShowMap(true)}
      />
    );
  }
  return <GameScreen onExit={onExitToSelect} onShowMap={() => setShowMap(true)} />;
}

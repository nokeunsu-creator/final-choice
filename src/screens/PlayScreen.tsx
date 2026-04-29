import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { getNode, isEnding } from '../data/scenarios';
import { GameScreen } from './GameScreen';
import { EndingScreen } from './EndingScreen';
import { BranchMapScreen } from './BranchMapScreen';
import { playEnding } from '../utils/sound';

interface Props {
  showMap: boolean;
  onShowMap: () => void;
  onMapBack: () => void;
  onExitToSelect: () => void;
  onRetryScenario: () => void;
}

/**
 * 게임/엔딩/지도 모두 포함한 컴포지트. App.tsx에서 React.lazy로 동적 로드되므로
 * 이 모듈에 시나리오 데이터(getNode, GameScreen, EndingScreen, BranchMapScreen)가 묶여 별도 청크.
 *
 * showMap은 App-level navigation state ('play' vs 'play-map')에 묶여
 * 안드로이드 시스템 뒤로가기로 자연스럽게 빠져나올 수 있다.
 */
export default function PlayScreen({
  showMap,
  onShowMap,
  onMapBack,
  onExitToSelect,
  onRetryScenario,
}: Props) {
  const { save, current, recordEnding } = useGame();
  const node =
    save.scenarioId && current ? getNode(save.scenarioId, current.currentNodeId) : undefined;
  const onEnding = !!node && isEnding(node);

  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
      playEnding(node.endingType ?? 'neutral');
    }
  }, [onEnding, node, recordEnding]);

  if (showMap) {
    return <BranchMapScreen onBack={onMapBack} />;
  }
  if (onEnding) {
    return (
      <EndingScreen
        onReturnToTitle={onExitToSelect}
        onRetryScenario={onRetryScenario}
        onShowMap={onShowMap}
      />
    );
  }
  return <GameScreen onExit={onExitToSelect} onShowMap={onShowMap} />;
}

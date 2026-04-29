import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { getNode, isEnding } from '../data/scenarios';
import { GameScreen } from './GameScreen';
import { EndingScreen } from './EndingScreen';

interface Props {
  onExitToSelect: () => void;
  onRetryScenario: () => void;
}

/**
 * 게임/엔딩 화면 모두 포함한 컴포지트. App.tsx에서 React.lazy로 동적 로드되므로
 * 이 모듈에 시나리오 데이터(getNode, GameScreen, EndingScreen)가 묶여 별도 청크.
 */
export default function PlayScreen({ onExitToSelect, onRetryScenario }: Props) {
  const { save, current, recordEnding } = useGame();
  const node =
    save.scenarioId && current ? getNode(save.scenarioId, current.currentNodeId) : undefined;
  const onEnding = !!node && isEnding(node);

  useEffect(() => {
    if (onEnding && node?.endingTitle) {
      recordEnding(node.endingTitle);
    }
  }, [onEnding, node, recordEnding]);

  if (onEnding) {
    return (
      <EndingScreen onReturnToTitle={onExitToSelect} onRetryScenario={onRetryScenario} />
    );
  }
  return <GameScreen onExit={onExitToSelect} />;
}

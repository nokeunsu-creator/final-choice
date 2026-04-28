import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

const STORAGE_KEY = 'finalchoice:save:v1';
const START_NODE_ID = 1;

export interface GameState {
  currentNodeId: number;
  inventory: string[];
  visitedNodes: number[];
  endingsCleared: string[];
}

type Action =
  | { type: 'GO_TO'; nodeId: number; grantItem?: string | null }
  | { type: 'RESET_TO_TITLE' }
  | { type: 'RECORD_ENDING'; endingTitle: string }
  | { type: 'HYDRATE'; state: GameState };

const initialState: GameState = {
  currentNodeId: START_NODE_ID,
  inventory: [],
  visitedNodes: [START_NODE_ID],
  endingsCleared: [],
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_TO': {
      const inv =
        action.grantItem && !state.inventory.includes(action.grantItem)
          ? [...state.inventory, action.grantItem]
          : state.inventory;
      const visited = state.visitedNodes.includes(action.nodeId)
        ? state.visitedNodes
        : [...state.visitedNodes, action.nodeId];
      return { ...state, currentNodeId: action.nodeId, inventory: inv, visitedNodes: visited };
    }
    case 'RESET_TO_TITLE':
      return {
        currentNodeId: START_NODE_ID,
        inventory: [],
        visitedNodes: [START_NODE_ID],
        endingsCleared: state.endingsCleared,
      };
    case 'RECORD_ENDING': {
      if (state.endingsCleared.includes(action.endingTitle)) return state;
      return { ...state, endingsCleared: [...state.endingsCleared, action.endingTitle] };
    }
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  goTo: (nodeId: number, grantItem?: string | null) => void;
  resetToTitle: () => void;
  recordEnding: (endingTitle: string) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // localStorage 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && typeof parsed.currentNodeId === 'number') {
        dispatch({ type: 'HYDRATE', state: parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const value: GameContextValue = {
    state,
    goTo: (nodeId, grantItem) => dispatch({ type: 'GO_TO', nodeId, grantItem }),
    resetToTitle: () => dispatch({ type: 'RESET_TO_TITLE' }),
    recordEnding: (endingTitle) => dispatch({ type: 'RECORD_ENDING', endingTitle }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

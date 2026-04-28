import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

const STORAGE_KEY = 'finalchoice:save:v2';
const START_NODE_ID = 1;

export interface ScenarioState {
  currentNodeId: number;
  inventory: string[];
  visitedNodes: number[];
  endingsCleared: string[];
}

export interface SaveState {
  scenarioId: string | null;
  byScenario: Record<string, ScenarioState>;
}

type Action =
  | { type: 'SELECT_SCENARIO'; scenarioId: string }
  | { type: 'GO_TO'; nodeId: number; grantItem?: string | null }
  | { type: 'RESET_CURRENT_SCENARIO' }
  | { type: 'EXIT_TO_TITLE' }
  | { type: 'RECORD_ENDING'; endingTitle: string }
  | { type: 'HYDRATE'; state: SaveState };

const emptyScenarioState: ScenarioState = {
  currentNodeId: START_NODE_ID,
  inventory: [],
  visitedNodes: [START_NODE_ID],
  endingsCleared: [],
};

const initialState: SaveState = {
  scenarioId: null,
  byScenario: {},
};

function withScenario(
  state: SaveState,
  scenarioId: string,
  patch: (s: ScenarioState) => ScenarioState,
): SaveState {
  const current = state.byScenario[scenarioId] ?? emptyScenarioState;
  return {
    ...state,
    byScenario: { ...state.byScenario, [scenarioId]: patch(current) },
  };
}

function reducer(state: SaveState, action: Action): SaveState {
  switch (action.type) {
    case 'SELECT_SCENARIO': {
      // 기존 진행도 유지. 처음 선택이면 빈 상태로 초기화
      const existing = state.byScenario[action.scenarioId];
      const byScenario = existing
        ? state.byScenario
        : { ...state.byScenario, [action.scenarioId]: emptyScenarioState };
      return { ...state, scenarioId: action.scenarioId, byScenario };
    }
    case 'GO_TO': {
      if (!state.scenarioId) return state;
      return withScenario(state, state.scenarioId, (s) => {
        const inv =
          action.grantItem && !s.inventory.includes(action.grantItem)
            ? [...s.inventory, action.grantItem]
            : s.inventory;
        const visited = s.visitedNodes.includes(action.nodeId)
          ? s.visitedNodes
          : [...s.visitedNodes, action.nodeId];
        return { ...s, currentNodeId: action.nodeId, inventory: inv, visitedNodes: visited };
      });
    }
    case 'RESET_CURRENT_SCENARIO': {
      if (!state.scenarioId) return state;
      return withScenario(state, state.scenarioId, (s) => ({
        currentNodeId: START_NODE_ID,
        inventory: [],
        visitedNodes: [START_NODE_ID],
        endingsCleared: s.endingsCleared,
      }));
    }
    case 'EXIT_TO_TITLE':
      return { ...state, scenarioId: null };
    case 'RECORD_ENDING': {
      if (!state.scenarioId) return state;
      return withScenario(state, state.scenarioId, (s) => {
        if (s.endingsCleared.includes(action.endingTitle)) return s;
        return { ...s, endingsCleared: [...s.endingsCleared, action.endingTitle] };
      });
    }
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

interface GameContextValue {
  save: SaveState;
  current: ScenarioState | null;
  selectScenario: (scenarioId: string) => void;
  goTo: (nodeId: number, grantItem?: string | null) => void;
  resetCurrentScenario: () => void;
  exitToTitle: () => void;
  recordEnding: (endingTitle: string) => void;
  getScenarioState: (scenarioId: string) => ScenarioState | undefined;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, dispatch] = useReducer(reducer, initialState);

  // localStorage 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SaveState;
      if (parsed && typeof parsed === 'object' && 'byScenario' in parsed) {
        dispatch({ type: 'HYDRATE', state: parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      // quota errors ignored
    }
  }, [save]);

  const selectScenario = useCallback((scenarioId: string) => {
    dispatch({ type: 'SELECT_SCENARIO', scenarioId });
  }, []);
  const goTo = useCallback((nodeId: number, grantItem?: string | null) => {
    dispatch({ type: 'GO_TO', nodeId, grantItem });
  }, []);
  const resetCurrentScenario = useCallback(() => {
    dispatch({ type: 'RESET_CURRENT_SCENARIO' });
  }, []);
  const exitToTitle = useCallback(() => {
    dispatch({ type: 'EXIT_TO_TITLE' });
  }, []);
  const recordEnding = useCallback((endingTitle: string) => {
    dispatch({ type: 'RECORD_ENDING', endingTitle });
  }, []);
  const getScenarioState = useCallback(
    (scenarioId: string) => save.byScenario[scenarioId],
    [save.byScenario],
  );

  const current = save.scenarioId ? (save.byScenario[save.scenarioId] ?? null) : null;

  const value = useMemo<GameContextValue>(
    () => ({
      save,
      current,
      selectScenario,
      goTo,
      resetCurrentScenario,
      exitToTitle,
      recordEnding,
      getScenarioState,
    }),
    [save, current, selectScenario, goTo, resetCurrentScenario, exitToTitle, recordEnding, getScenarioState],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

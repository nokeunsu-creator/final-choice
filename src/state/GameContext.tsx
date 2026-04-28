import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Trait, TraitCounts } from '../data/types';

const STORAGE_KEY = 'finalchoice:save:v2';
const START_NODE_ID = 1;

export interface ScenarioState {
  currentNodeId: number;
  inventory: string[];
  visitedNodes: number[];
  endingsCleared: string[];
  /** 이 시나리오에서 누적된 성격 트레이트 점수 */
  traitCounts: TraitCounts;
}

export interface SaveState {
  scenarioId: string | null;
  byScenario: Record<string, ScenarioState>;
}

type Action =
  | { type: 'SELECT_SCENARIO'; scenarioId: string }
  | { type: 'GO_TO'; nodeId: number; grantItem?: string | null; traits?: Trait[] }
  | { type: 'RESET_CURRENT_SCENARIO' }
  | { type: 'EXIT_TO_TITLE' }
  | { type: 'RECORD_ENDING'; endingTitle: string }
  | { type: 'HYDRATE'; state: SaveState };

const emptyScenarioState: ScenarioState = {
  currentNodeId: START_NODE_ID,
  inventory: [],
  visitedNodes: [START_NODE_ID],
  endingsCleared: [],
  traitCounts: {},
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

function addTraits(prev: TraitCounts, traits: Trait[] | undefined): TraitCounts {
  if (!traits || traits.length === 0) return prev;
  const next = { ...prev };
  for (const t of traits) {
    next[t] = (next[t] ?? 0) + 1;
  }
  return next;
}

function reducer(state: SaveState, action: Action): SaveState {
  switch (action.type) {
    case 'SELECT_SCENARIO': {
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
        return {
          ...s,
          currentNodeId: action.nodeId,
          inventory: inv,
          visitedNodes: visited,
          traitCounts: addTraits(s.traitCounts ?? {}, action.traits),
        };
      });
    }
    case 'RESET_CURRENT_SCENARIO': {
      if (!state.scenarioId) return state;
      return withScenario(state, state.scenarioId, (s) => ({
        currentNodeId: START_NODE_ID,
        inventory: [],
        visitedNodes: [START_NODE_ID],
        endingsCleared: s.endingsCleared,
        traitCounts: {}, // 재시작 시 트레이트 초기화 (엔딩 누적은 보존)
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
      // v1 → v2 마이그레이션: traitCounts 누락 시 기본값
      return {
        ...action.state,
        byScenario: Object.fromEntries(
          Object.entries(action.state.byScenario ?? {}).map(([id, s]) => [
            id,
            { ...s, traitCounts: s.traitCounts ?? {} },
          ]),
        ),
      };
    default:
      return state;
  }
}

interface GameContextValue {
  save: SaveState;
  current: ScenarioState | null;
  selectScenario: (scenarioId: string) => void;
  goTo: (nodeId: number, grantItem?: string | null, traits?: Trait[]) => void;
  resetCurrentScenario: () => void;
  exitToTitle: () => void;
  recordEnding: (endingTitle: string) => void;
  getScenarioState: (scenarioId: string) => ScenarioState | undefined;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, dispatch] = useReducer(reducer, initialState);

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
  const goTo = useCallback((nodeId: number, grantItem?: string | null, traits?: Trait[]) => {
    dispatch({ type: 'GO_TO', nodeId, grantItem, traits });
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

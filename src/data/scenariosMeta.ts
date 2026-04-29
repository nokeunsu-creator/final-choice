/**
 * 가벼운 메타 모듈 — 시나리오 데이터(JSON) 없이 manifest 정보만 사용.
 * TitleScreen, MainPage, achievements 등 모든 비-게임 화면이 여기서 import.
 * GameScreen / EndingScreen만 `scenarios.ts` (실제 노드 데이터)를 동적으로 로드.
 */
import manifestRaw from '../../assets/scenarios/manifest.json';
import type { ScenarioMeta } from './types';

// JSON-inferred 타입이 ScenarioCategory union과 호환되지 않아 unknown 경유 캐스트
const manifest = manifestRaw as unknown as { scenarios: ScenarioMeta[] };

export const SCENARIOS: ScenarioMeta[] = manifest.scenarios;

export function getScenario(id: string): ScenarioMeta | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getNodeCount(scenarioId: string): number {
  return getScenario(scenarioId)?.nodeCount ?? 0;
}

export function getEndingCount(scenarioId: string): number {
  return getScenario(scenarioId)?.endingCount ?? 0;
}

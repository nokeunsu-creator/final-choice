import manifestRaw from '../../assets/scenarios/manifest.json';
import desertIslandRaw from '../../assets/scenarios/desert-island.json';
import hauntedHouseRaw from '../../assets/scenarios/haunted-house.json';
import zombieCityRaw from '../../assets/scenarios/zombie-city.json';
import spaceshipRaw from '../../assets/scenarios/spaceship.json';
import dungeonRaw from '../../assets/scenarios/dungeon.json';
import snowMountainRaw from '../../assets/scenarios/snow-mountain.json';
import cyberpunkRaw from '../../assets/scenarios/cyberpunk.json';
import hotelMysteryRaw from '../../assets/scenarios/hotel-mystery.json';
import deepSeaRaw from '../../assets/scenarios/deep-sea.json';
import timeTravelerRaw from '../../assets/scenarios/time-traveler.json';
import abandonedTrainRaw from '../../assets/scenarios/abandoned-train.json';
import zombieVillageRaw from '../../assets/scenarios/zombie-village.json';
import stormYachtRaw from '../../assets/scenarios/storm-yacht.json';
import lighthouseRaw from '../../assets/scenarios/lighthouse.json';
import asylumRaw from '../../assets/scenarios/asylum.json';
import spaceStationRaw from '../../assets/scenarios/space-station.json';
import casinoHeistRaw from '../../assets/scenarios/casino-heist.json';
import bankRobberyRaw from '../../assets/scenarios/bank-robbery.json';
import zombieAirplaneRaw from '../../assets/scenarios/zombie-airplane.json';
import abandonedSchoolRaw from '../../assets/scenarios/abandoned-school.json';
import oldTempleRaw from '../../assets/scenarios/old-temple.json';
import burningHotelRaw from '../../assets/scenarios/burning-hotel.json';
import type { ScenarioMeta, StoryNode } from './types';

const manifest = manifestRaw as { scenarios: ScenarioMeta[] };

const DATA: Record<string, StoryNode[]> = {
  'desert-island': desertIslandRaw as StoryNode[],
  'haunted-house': hauntedHouseRaw as StoryNode[],
  'zombie-city': zombieCityRaw as StoryNode[],
  spaceship: spaceshipRaw as StoryNode[],
  dungeon: dungeonRaw as StoryNode[],
  'snow-mountain': snowMountainRaw as StoryNode[],
  cyberpunk: cyberpunkRaw as StoryNode[],
  'hotel-mystery': hotelMysteryRaw as StoryNode[],
  'deep-sea': deepSeaRaw as StoryNode[],
  'time-traveler': timeTravelerRaw as StoryNode[],
  'abandoned-train': abandonedTrainRaw as StoryNode[],
  'zombie-village': zombieVillageRaw as StoryNode[],
  'storm-yacht': stormYachtRaw as StoryNode[],
  lighthouse: lighthouseRaw as StoryNode[],
  asylum: asylumRaw as StoryNode[],
  'space-station': spaceStationRaw as StoryNode[],
  'casino-heist': casinoHeistRaw as StoryNode[],
  'bank-robbery': bankRobberyRaw as StoryNode[],
  'zombie-airplane': zombieAirplaneRaw as StoryNode[],
  'abandoned-school': abandonedSchoolRaw as StoryNode[],
  'old-temple': oldTempleRaw as StoryNode[],
  'burning-hotel': burningHotelRaw as StoryNode[],
};

const NODE_INDEX: Record<string, Map<number, StoryNode>> = Object.fromEntries(
  Object.entries(DATA).map(([id, nodes]) => [id, new Map(nodes.map((n) => [n.nodeId, n]))]),
);

export const SCENARIOS: ScenarioMeta[] = manifest.scenarios;

export function getScenario(id: string): ScenarioMeta | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getNode(scenarioId: string, nodeId: number): StoryNode | undefined {
  return NODE_INDEX[scenarioId]?.get(nodeId);
}

export function isEnding(node: StoryNode | undefined): boolean {
  if (!node) return false;
  return node.choices.length === 0;
}

export function getNodeCount(scenarioId: string): number {
  return DATA[scenarioId]?.length ?? 0;
}

export function getEndingCount(scenarioId: string): number {
  return DATA[scenarioId]?.filter((n) => n.choices.length === 0).length ?? 0;
}

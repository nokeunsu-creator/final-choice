/**
 * 무거운 시나리오 데이터 모듈 — 모든 98개 JSON을 정적 import.
 * 이 모듈은 GameScreen / EndingScreen에서만 사용. App.tsx의 React.lazy로
 * 분리되어 메인 페이지/시나리오 선택 화면에서는 로드되지 않는다.
 *
 * 메타 정보(개수/제목/카테고리 등)만 필요하면 `scenariosMeta.ts` 사용.
 */
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
import oldMineRaw from '../../assets/scenarios/old-mine.json';
import jungleExpeditionRaw from '../../assets/scenarios/jungle-expedition.json';
import arcticBaseRaw from '../../assets/scenarios/arctic-base.json';
import volcanoRaw from '../../assets/scenarios/volcano.json';
import witchCastleRaw from '../../assets/scenarios/witch-castle.json';
import alienInvasionRaw from '../../assets/scenarios/alien-invasion.json';
import militaryLabRaw from '../../assets/scenarios/military-lab.json';
import cruiseShipRaw from '../../assets/scenarios/cruise-ship.json';
import virusLabRaw from '../../assets/scenarios/virus-lab.json';
import graveyardRaw from '../../assets/scenarios/graveyard.json';
import eclipseNightRaw from '../../assets/scenarios/eclipse-night.json';
import masqueradeRaw from '../../assets/scenarios/masquerade.json';
import batCaveRaw from '../../assets/scenarios/bat-cave.json';
import vanishedStationRaw from '../../assets/scenarios/vanished-station.json';
import foggyVillageRaw from '../../assets/scenarios/foggy-village.json';
import astrologerTowerRaw from '../../assets/scenarios/astrologer-tower.json';
import closedStadiumRaw from '../../assets/scenarios/closed-stadium.json';
import driftingBoatRaw from '../../assets/scenarios/drifting-boat.json';
import desertCaravanRaw from '../../assets/scenarios/desert-caravan.json';
import abandonedAmusementRaw from '../../assets/scenarios/abandoned-amusement.json';
import secretAgentRaw from '../../assets/scenarios/secret-agent.json';
import detectiveCaseRaw from '../../assets/scenarios/detective-case.json';
import tombRaiderRaw from '../../assets/scenarios/tomb-raider.json';
import bombDefusalRaw from '../../assets/scenarios/bomb-defusal.json';
import subwayTrappedRaw from '../../assets/scenarios/subway-trapped.json';
import warzoneRaw from '../../assets/scenarios/warzone.json';
import hostageNegotiationRaw from '../../assets/scenarios/hostage-negotiation.json';
import prisonEscapeRaw from '../../assets/scenarios/prison-escape.json';
import officePromotionRaw from '../../assets/scenarios/office-promotion.json';
import officeDinnerRaw from '../../assets/scenarios/office-dinner.json';
import officeNewbieRaw from '../../assets/scenarios/office-newbie.json';
import officeCardRaw from '../../assets/scenarios/office-card.json';
import officeOvernightRaw from '../../assets/scenarios/office-overnight.json';
import mudoChaseRaw from '../../assets/scenarios/mudo-chase.json';
import mudoIslandRaw from '../../assets/scenarios/mudo-island.json';
import mudoSongfestRaw from '../../assets/scenarios/mudo-songfest.json';
import mudoKaraokeRaw from '../../assets/scenarios/mudo-karaoke.json';
import mudoMarathonRaw from '../../assets/scenarios/mudo-marathon.json';
import mudoRelayRaw from '../../assets/scenarios/mudo-relay.json';
import mudoCookingRaw from '../../assets/scenarios/mudo-cooking.json';
import onepieceEastblueRaw from '../../assets/scenarios/onepiece-eastblue.json';
import onepieceGrandlineRaw from '../../assets/scenarios/onepiece-grandline.json';
import onepieceMarinefordRaw from '../../assets/scenarios/onepiece-marineford.json';
import onepieceSkypieaRaw from '../../assets/scenarios/onepiece-skypiea.json';
import onepieceImpeldownRaw from '../../assets/scenarios/onepiece-impeldown.json';
import onepieceFishmanRaw from '../../assets/scenarios/onepiece-fishman.json';
import onepieceWanoRaw from '../../assets/scenarios/onepiece-wano.json';
import onepieceLaftelRaw from '../../assets/scenarios/onepiece-laftel.json';
import suneungDayRaw from '../../assets/scenarios/suneung-day.json';
import armyDay1Raw from '../../assets/scenarios/army-day1.json';
import blindDateRaw from '../../assets/scenarios/blind-date.json';
import chuseokRaw from '../../assets/scenarios/chuseok.json';
import graduationRaw from '../../assets/scenarios/graduation.json';
import avengersRaw from '../../assets/scenarios/avengers.json';
import harryPotterRaw from '../../assets/scenarios/harry-potter.json';
import slamdunkRaw from '../../assets/scenarios/slamdunk.json';
import withGodRaw from '../../assets/scenarios/with-god.json';
import mudoWrestlingRaw from '../../assets/scenarios/mudo-wrestling.json';
import mudoBobsleighRaw from '../../assets/scenarios/mudo-bobsleigh.json';
import mudoJjeonRaw from '../../assets/scenarios/mudo-jjeon.json';
import mudoSixManRaw from '../../assets/scenarios/mudo-six-man.json';
import mudoFigureRaw from '../../assets/scenarios/mudo-figure.json';
import mudoCidaeinRaw from '../../assets/scenarios/mudo-cidaein.json';
import mudoZombieMudoRaw from '../../assets/scenarios/mudo-zombie-mudo.json';
import mudoNewYorkRaw from '../../assets/scenarios/mudo-newyork.json';
import mudoFashionRaw from '../../assets/scenarios/mudo-fashion.json';
import mudoAerobicRaw from '../../assets/scenarios/mudo-aerobic.json';
import mudoTunaRaw from '../../assets/scenarios/mudo-tuna.json';
import mudo300Raw from '../../assets/scenarios/mudo-300.json';
import mudoRowingRaw from '../../assets/scenarios/mudo-rowing.json';
import mudoCampingRaw from '../../assets/scenarios/mudo-camping.json';
import mudoQuizRaw from '../../assets/scenarios/mudo-quiz.json';
import mudoPhotoRaw from '../../assets/scenarios/mudo-photo.json';
import manitoClubRaw from '../../assets/scenarios/manito-club.json';
import onepieceWanoPrepRaw from '../../assets/scenarios/onepiece-wano-prep.json';
import jidaenubeoryeolbRaw from '../../assets/scenarios/jidaenubeoryeolb.json';
import type { StoryNode } from './types';

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
  'old-mine': oldMineRaw as StoryNode[],
  'jungle-expedition': jungleExpeditionRaw as StoryNode[],
  'arctic-base': arcticBaseRaw as StoryNode[],
  volcano: volcanoRaw as StoryNode[],
  'witch-castle': witchCastleRaw as StoryNode[],
  'alien-invasion': alienInvasionRaw as StoryNode[],
  'military-lab': militaryLabRaw as StoryNode[],
  'cruise-ship': cruiseShipRaw as StoryNode[],
  'virus-lab': virusLabRaw as StoryNode[],
  graveyard: graveyardRaw as StoryNode[],
  'eclipse-night': eclipseNightRaw as StoryNode[],
  masquerade: masqueradeRaw as StoryNode[],
  'bat-cave': batCaveRaw as StoryNode[],
  'vanished-station': vanishedStationRaw as StoryNode[],
  'foggy-village': foggyVillageRaw as StoryNode[],
  'astrologer-tower': astrologerTowerRaw as StoryNode[],
  'closed-stadium': closedStadiumRaw as StoryNode[],
  'drifting-boat': driftingBoatRaw as StoryNode[],
  'desert-caravan': desertCaravanRaw as StoryNode[],
  'abandoned-amusement': abandonedAmusementRaw as StoryNode[],
  'secret-agent': secretAgentRaw as StoryNode[],
  'detective-case': detectiveCaseRaw as StoryNode[],
  'tomb-raider': tombRaiderRaw as StoryNode[],
  'bomb-defusal': bombDefusalRaw as StoryNode[],
  'subway-trapped': subwayTrappedRaw as StoryNode[],
  warzone: warzoneRaw as StoryNode[],
  'hostage-negotiation': hostageNegotiationRaw as StoryNode[],
  'prison-escape': prisonEscapeRaw as StoryNode[],
  'office-promotion': officePromotionRaw as StoryNode[],
  'office-dinner': officeDinnerRaw as StoryNode[],
  'office-newbie': officeNewbieRaw as StoryNode[],
  'office-card': officeCardRaw as StoryNode[],
  'office-overnight': officeOvernightRaw as StoryNode[],
  'mudo-chase': mudoChaseRaw as StoryNode[],
  'mudo-island': mudoIslandRaw as StoryNode[],
  'mudo-songfest': mudoSongfestRaw as StoryNode[],
  'mudo-karaoke': mudoKaraokeRaw as StoryNode[],
  'mudo-marathon': mudoMarathonRaw as StoryNode[],
  'mudo-relay': mudoRelayRaw as StoryNode[],
  'mudo-cooking': mudoCookingRaw as StoryNode[],
  'onepiece-eastblue': onepieceEastblueRaw as StoryNode[],
  'onepiece-grandline': onepieceGrandlineRaw as StoryNode[],
  'onepiece-marineford': onepieceMarinefordRaw as StoryNode[],
  'onepiece-skypiea': onepieceSkypieaRaw as StoryNode[],
  'onepiece-impeldown': onepieceImpeldownRaw as StoryNode[],
  'onepiece-fishman': onepieceFishmanRaw as StoryNode[],
  'onepiece-wano': onepieceWanoRaw as StoryNode[],
  'onepiece-laftel': onepieceLaftelRaw as StoryNode[],
  'suneung-day': suneungDayRaw as StoryNode[],
  'army-day1': armyDay1Raw as StoryNode[],
  'blind-date': blindDateRaw as StoryNode[],
  chuseok: chuseokRaw as StoryNode[],
  graduation: graduationRaw as StoryNode[],
  avengers: avengersRaw as StoryNode[],
  'harry-potter': harryPotterRaw as StoryNode[],
  slamdunk: slamdunkRaw as StoryNode[],
  'with-god': withGodRaw as StoryNode[],
  'mudo-wrestling': mudoWrestlingRaw as StoryNode[],
  'mudo-bobsleigh': mudoBobsleighRaw as StoryNode[],
  'mudo-jjeon': mudoJjeonRaw as StoryNode[],
  'mudo-six-man': mudoSixManRaw as StoryNode[],
  'mudo-figure': mudoFigureRaw as StoryNode[],
  'mudo-cidaein': mudoCidaeinRaw as StoryNode[],
  'mudo-zombie-mudo': mudoZombieMudoRaw as StoryNode[],
  'mudo-newyork': mudoNewYorkRaw as StoryNode[],
  'mudo-fashion': mudoFashionRaw as StoryNode[],
  'mudo-aerobic': mudoAerobicRaw as StoryNode[],
  'mudo-tuna': mudoTunaRaw as StoryNode[],
  'mudo-300': mudo300Raw as StoryNode[],
  'mudo-rowing': mudoRowingRaw as StoryNode[],
  'mudo-camping': mudoCampingRaw as StoryNode[],
  'mudo-quiz': mudoQuizRaw as StoryNode[],
  'mudo-photo': mudoPhotoRaw as StoryNode[],
  'manito-club': manitoClubRaw as StoryNode[],
  'onepiece-wano-prep': onepieceWanoPrepRaw as StoryNode[],
  jidaenubeoryeolb: jidaenubeoryeolbRaw as StoryNode[],
};

const NODE_INDEX: Record<string, Map<number, StoryNode>> = Object.fromEntries(
  Object.entries(DATA).map(([id, nodes]) => [id, new Map(nodes.map((n) => [n.nodeId, n]))]),
);

export function getNode(scenarioId: string, nodeId: number): StoryNode | undefined {
  return NODE_INDEX[scenarioId]?.get(nodeId);
}

export function getAllNodes(scenarioId: string): StoryNode[] {
  return DATA[scenarioId] ?? [];
}

export function isEnding(node: StoryNode | undefined): boolean {
  if (!node) return false;
  return node.choices.length === 0;
}

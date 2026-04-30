import { CATEGORY_META, CATEGORY_ORDER, type ScenarioCategory } from './types';
import type { SaveState } from '../state/GameContext';
import { SCENARIOS, getEndingCount } from './scenariosMeta';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** 진행도 텍스트 (잠금 시 표시). undefined면 표시 안 함 */
  progress?: (save: SaveState) => string;
  /** 잠금 해제 여부 */
  isUnlocked: (save: SaveState) => boolean;
  /** 0 = 일반, 1 = 카테고리, 2 = 메타 */
  tier: 0 | 1 | 2;
}

function totalEndingsCleared(save: SaveState): number {
  return SCENARIOS.reduce((sum, s) => sum + (save.byScenario[s.id]?.endingsCleared.length ?? 0), 0);
}

function totalEndingsAvailable(): number {
  return SCENARIOS.reduce((sum, s) => sum + getEndingCount(s.id), 0);
}

function totalChoices(save: SaveState): number {
  return SCENARIOS.reduce((sum, s) => {
    const tc = save.byScenario[s.id]?.traitCounts ?? {};
    return sum + Object.values(tc).reduce((a, b) => a + (b ?? 0), 0);
  }, 0);
}

function categoryEndingsCleared(save: SaveState, cat: ScenarioCategory): { cleared: number; total: number } {
  const scs = SCENARIOS.filter((s) => s.category === cat);
  let cleared = 0, total = 0;
  for (const s of scs) {
    cleared += save.byScenario[s.id]?.endingsCleared.length ?? 0;
    total += getEndingCount(s.id);
  }
  return { cleared, total };
}

function categoryAtLeastOne(save: SaveState, cat: ScenarioCategory): boolean {
  return SCENARIOS.filter((s) => s.category === cat).some(
    (s) => (save.byScenario[s.id]?.endingsCleared.length ?? 0) > 0,
  );
}

const TIER_THRESHOLDS = [
  { id: 'first', icon: '🥉', title: '첫 결말', desc: '한 번이라도 결말에 도달', target: 1 },
  { id: 'challenger', icon: '🥈', title: '도전자', desc: '10개 결말 달성', target: 10 },
  { id: 'collector', icon: '🥇', title: '수집가', desc: '50개 결말 달성', target: 50 },
  { id: 'expert', icon: '💎', title: '전문가', desc: '150개 결말 달성', target: 150 },
  { id: 'completionist', icon: '👑', title: '완전체', desc: '모든 결말 달성', target: -1 }, // total
] as const;

const TIER_ACHIEVEMENTS: Achievement[] = TIER_THRESHOLDS.map((t) => ({
  id: `endings-${t.id}`,
  icon: t.icon,
  title: t.title,
  description: t.desc,
  tier: 0,
  isUnlocked: (save) => {
    const cleared = totalEndingsCleared(save);
    return t.target === -1 ? cleared >= totalEndingsAvailable() : cleared >= t.target;
  },
  progress: (save) => {
    const cleared = totalEndingsCleared(save);
    const target = t.target === -1 ? totalEndingsAvailable() : t.target;
    return `${cleared} / ${target}`;
  },
}));

const CATEGORY_TITLES: Record<ScenarioCategory, { icon: string; title: string }> = {
  '생존': { icon: '🏝️', title: '생존가의 길' },
  '호러': { icon: '🕯️', title: '영매' },
  '좀비': { icon: '🧟', title: '바이러스 헌터' },
  SF: { icon: '🛰️', title: '우주 항해사' },
  '판타지': { icon: '🗝️', title: '마법서 마스터' },
  '미스터리': { icon: '🔍', title: '명탐정' },
  '재난': { icon: '🚒', title: '1급 구조사' },
  '일상': { icon: '🍱', title: '하루의 달인' },
  '사업': { icon: '💰', title: '돈 버는 자' },
  '패러디': { icon: '🎬', title: '명장면 수집가' },
  '무한상사': { icon: '💼', title: '무한사원' },
  '무한도전': { icon: '🏃', title: '무한멤버' },
  '원피스': { icon: '🏴‍☠️', title: '해적왕' },
};

const CATEGORY_ACHIEVEMENTS: Achievement[] = CATEGORY_ORDER.map((cat) => ({
  id: `cat-master-${cat}`,
  icon: CATEGORY_TITLES[cat].icon,
  title: CATEGORY_TITLES[cat].title,
  description: `${cat} 카테고리 모든 결말 달성`,
  tier: 1,
  isUnlocked: (save) => {
    const { cleared, total } = categoryEndingsCleared(save, cat);
    return total > 0 && cleared >= total;
  },
  progress: (save) => {
    const { cleared, total } = categoryEndingsCleared(save, cat);
    return `${cleared} / ${total}`;
  },
}));

const META_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'all-categories',
    icon: '🌈',
    title: '다재다능',
    description: '모든 카테고리에서 1+ 결말 달성',
    tier: 2,
    isUnlocked: (save) => CATEGORY_ORDER.every((cat) => categoryAtLeastOne(save, cat)),
    progress: (save) => {
      const done = CATEGORY_ORDER.filter((cat) => categoryAtLeastOne(save, cat)).length;
      return `${done} / ${CATEGORY_ORDER.length}`;
    },
  },
  {
    id: 'choices-100',
    icon: '🎯',
    title: '결단가',
    description: '100번의 선택',
    tier: 2,
    isUnlocked: (save) => totalChoices(save) >= 100,
    progress: (save) => `${totalChoices(save)} / 100`,
  },
  {
    id: 'choices-500',
    icon: '⚡',
    title: '선택의 거장',
    description: '500번의 선택',
    tier: 2,
    isUnlocked: (save) => totalChoices(save) >= 500,
    progress: (save) => `${totalChoices(save)} / 500`,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  ...TIER_ACHIEVEMENTS,
  ...CATEGORY_ACHIEVEMENTS,
  ...META_ACHIEVEMENTS,
];

export function evaluateAchievements(save: SaveState) {
  return ACHIEVEMENTS.map((a) => ({
    achievement: a,
    unlocked: a.isUnlocked(save),
    progressText: a.progress?.(save) ?? '',
  }));
}

export function unlockedCount(save: SaveState): number {
  return ACHIEVEMENTS.filter((a) => a.isUnlocked(save)).length;
}

// Re-export to avoid circular issue with consumers importing categories from here
export { CATEGORY_META };

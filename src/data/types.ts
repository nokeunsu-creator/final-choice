export type EndingType = 'good' | 'bad' | 'neutral';

/**
 * 6 axes × 2 ends = 12 traits.
 * Each Choice can carry 1-3 trait codes that get added to the player's running tally.
 */
export type Trait =
  | '이타' | '자기'      // 이타심 vs 자기보호
  | '용기' | '신중'      // 위험 감수 vs 신중함
  | '분석' | '직관'      // 분석적 vs 직관적
  | '협력' | '독자'      // 협력 vs 독자행동
  | '원칙' | '실용'      // 원칙 vs 실용
  | '정면' | '회피';     // 정면 대응 vs 회피

export interface Choice {
  label: string;
  nextNodeId: number;
  requiredItem: string | null;
  grantItem?: string | null;
  traits?: Trait[];
}

export interface StoryNode {
  nodeId: number;
  text: string;
  choices: Choice[];
  endingType?: EndingType;
  endingTitle?: string;
}

export type ScenarioCategory =
  | '생존'
  | '호러'
  | '좀비'
  | 'SF'
  | '판타지'
  | '미스터리'
  | '재난'
  | '일상'
  | '사업'
  | '패러디'
  | '무한상사'
  | '무한도전'
  | '원피스';

export const CATEGORY_ORDER: ScenarioCategory[] = [
  '생존',
  '호러',
  '좀비',
  'SF',
  '판타지',
  '미스터리',
  '재난',
  '일상',
  '사업',
  '패러디',
  '무한상사',
  '무한도전',
  '원피스',
];

export const CATEGORY_META: Record<ScenarioCategory, { icon: string; color: string }> = {
  '생존': { icon: '🏝️', color: '#ffaa00' },
  '호러': { icon: '🕯️', color: '#a78bfa' },
  '좀비': { icon: '🧟', color: '#ef4444' },
  SF: { icon: '🛰️', color: '#22d3ee' },
  '판타지': { icon: '🗝️', color: '#d4a017' },
  '미스터리': { icon: '🔍', color: '#854d0e' },
  '재난': { icon: '🚒', color: '#f97316' },
  '일상': { icon: '🍱', color: '#10b981' },
  '사업': { icon: '💰', color: '#84cc16' },
  '패러디': { icon: '🎬', color: '#f472b6' },
  '무한상사': { icon: '💼', color: '#0ea5e9' },
  '무한도전': { icon: '🏃', color: '#fbbf24' },
  '원피스': { icon: '🏴‍☠️', color: '#dc2626' },
};

export interface ScenarioMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
  category: ScenarioCategory;
  /** 빌드 스크립트로 manifest에 주입 — TitleScreen에서 데이터 로드 없이 표시 */
  nodeCount: number;
  endingCount: number;
}

export type TraitCounts = Partial<Record<Trait, number>>;

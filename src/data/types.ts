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

export interface ScenarioMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
}

export type TraitCounts = Partial<Record<Trait, number>>;

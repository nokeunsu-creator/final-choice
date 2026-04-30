import type { ScenarioCategory, Trait, TraitCounts } from './types';

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** 양성 가중치: 이 트레이트가 많을수록 점수 ↑ */
  positive: Partial<Record<Trait, number>>;
  /** 음성 가중치: 이 트레이트가 많을수록 점수 ↓ */
  negative?: Partial<Record<Trait, number>>;
  oneLiner: string;
  description: string;
}

/**
 * 8개 아키타입. 각 아키타입은 트레이트 가중치 벡터.
 * 점수 = sum(traits[k] * positive[k]) - sum(traits[k] * negative[k])
 */
export const ARCHETYPES: Archetype[] = [
  {
    id: 'hero',
    name: '영웅',
    icon: '🛡️',
    color: '#fbbf24',
    positive: { 이타: 3, 용기: 3, 정면: 2, 원칙: 1 },
    negative: { 자기: 2, 회피: 2 },
    oneLiner: '남을 위해 자기를 던진다',
    description: '동료를 부축하고 인질을 풀어주는 사람. 손해를 알면서도 옳은 쪽을 택한다.',
  },
  {
    id: 'survivor',
    name: '생존가',
    icon: '🦊',
    color: '#84cc16',
    positive: { 자기: 3, 신중: 3, 실용: 2, 회피: 1 },
    negative: { 정면: 1, 이타: 1 },
    oneLiner: '살아남는 게 첫째다',
    description: '봉화보다 봉쇄. 모험보다 두 번 돌아본다. 이번 한 번을 버텨내는 사람.',
  },
  {
    id: 'scholar',
    name: '학자',
    icon: '📚',
    color: '#a78bfa',
    positive: { 분석: 3, 신중: 2, 원칙: 1, 회피: 1 },
    negative: { 직관: 2, 정면: 1 },
    oneLiner: '먼저 읽고 나서 움직인다',
    description: '일지·메모·벽화를 다 읽는다. 정보가 무기다.',
  },
  {
    id: 'warrior',
    name: '전사',
    icon: '⚔️',
    color: '#ef4444',
    positive: { 정면: 3, 용기: 3, 자기: 1, 직관: 1 },
    negative: { 회피: 3, 신중: 1 },
    oneLiner: '뒤로 물러나지 않는다',
    description: '칼·권총·맨주먹. 길이 막히면 부순다.',
  },
  {
    id: 'diplomat',
    name: '외교관',
    icon: '🤝',
    color: '#22d3ee',
    positive: { 이타: 2, 협력: 3, 분석: 2, 회피: 1 },
    negative: { 독자: 2, 정면: 2 },
    oneLiner: '말로 푼다',
    description: '협상·공감·거래. 폭력 없이 상황을 풀어내는 사람.',
  },
  {
    id: 'lone-wolf',
    name: '외톨이',
    icon: '🌑',
    color: '#737373',
    positive: { 독자: 3, 자기: 2, 회피: 2, 실용: 1 },
    negative: { 협력: 3, 이타: 2 },
    oneLiner: '혼자가 더 빠르다',
    description: '동료를 두고 먼저 빠져나간다. 평생 그 무게를 진다.',
  },
  {
    id: 'explorer',
    name: '모험가',
    icon: '🦋',
    color: '#f472b6',
    positive: { 용기: 2, 직관: 3, 협력: 1, 정면: 1 },
    negative: { 신중: 2, 회피: 2 },
    oneLiner: '일단 들어가본다',
    description: '낯선 동굴, 우물, 새 통로. 미지에 끌리는 사람.',
  },
  {
    id: 'idealist',
    name: '도덕가',
    icon: '🪞',
    color: '#7dffaa',
    positive: { 원칙: 3, 이타: 2, 정면: 1, 협력: 1 },
    negative: { 실용: 2, 자기: 1 },
    oneLiner: '편한 길보다 옳은 길',
    description: '자수·양보·봉인. 결과보다 원칙을 따른다.',
  },
];

const TRAIT_PAIRS: Array<[Trait, Trait]> = [
  ['이타', '자기'],
  ['용기', '신중'],
  ['분석', '직관'],
  ['협력', '독자'],
  ['원칙', '실용'],
  ['정면', '회피'],
];

export interface ArchetypeScore {
  archetype: Archetype;
  score: number;
  /** 0-100 정규화 점수 (가시화용) */
  percent: number;
}

/**
 * 트레이트 카운트로부터 아키타입 점수 계산.
 * 점수가 높은 순으로 정렬된 배열 반환.
 */
export function scoreArchetypes(counts: TraitCounts): ArchetypeScore[] {
  const total = Object.values(counts).reduce((sum, v) => sum + (v ?? 0), 0);
  if (total === 0) {
    return ARCHETYPES.map((a) => ({ archetype: a, score: 0, percent: 0 }));
  }

  const raw = ARCHETYPES.map((a) => {
    let s = 0;
    for (const [trait, weight] of Object.entries(a.positive) as Array<[Trait, number]>) {
      s += (counts[trait] ?? 0) * weight;
    }
    if (a.negative) {
      for (const [trait, weight] of Object.entries(a.negative) as Array<[Trait, number]>) {
        s -= (counts[trait] ?? 0) * weight;
      }
    }
    return { archetype: a, score: s };
  });

  // 정규화: 최댓값을 100으로
  const max = Math.max(1, ...raw.map((r) => r.score));
  const min = Math.min(0, ...raw.map((r) => r.score));
  const range = Math.max(1, max - min);

  return raw
    .map((r) => ({ ...r, percent: Math.round(((r.score - min) / range) * 100) }))
    .sort((a, b) => b.score - a.score);
}

/**
 * 트레이트 균형 (양극의 차이) 계산. 자기 분석 화면에 활용.
 */
export interface AxisBalance {
  axis: string;
  left: Trait;
  right: Trait;
  leftCount: number;
  rightCount: number;
  /** -1 ~ +1 (음수=왼쪽 우세, 양수=오른쪽 우세) */
  bias: number;
}

export function axisBalances(counts: TraitCounts): AxisBalance[] {
  return TRAIT_PAIRS.map(([left, right]) => {
    const l = counts[left] ?? 0;
    const r = counts[right] ?? 0;
    const total = l + r;
    return {
      axis: `${left} ↔ ${right}`,
      left,
      right,
      leftCount: l,
      rightCount: r,
      bias: total === 0 ? 0 : (r - l) / total,
    };
  });
}

/**
 * 아키타입별 추천 카테고리. 메인페이지의 시나리오 추천에 사용.
 */
export const ARCHETYPE_CATEGORIES: Record<string, ScenarioCategory[]> = {
  hero: ['재난', '좀비', '원피스', '패러디'],
  survivor: ['생존', '재난', '일상', '사업'],
  scholar: ['미스터리', '호러', '판타지', '패러디', '사업'],
  warrior: ['좀비', '원피스', '재난', '패러디'],
  diplomat: ['재난', '무한상사', '미스터리', '일상', '사업'],
  'lone-wolf': ['호러', '생존', '판타지', '일상', '사업'],
  explorer: ['생존', 'SF', '원피스', '무한도전', '패러디', '사업'],
  idealist: ['호러', '재난', '무한상사', '일상'],
};

/**
 * 누적 트레이트 카운트 합산 (시나리오들 가로지름)
 */
export function aggregateCounts(perScenario: Array<TraitCounts | undefined>): TraitCounts {
  const out: TraitCounts = {};
  for (const c of perScenario) {
    if (!c) continue;
    for (const [trait, val] of Object.entries(c) as Array<[Trait, number]>) {
      out[trait] = (out[trait] ?? 0) + val;
    }
  }
  return out;
}

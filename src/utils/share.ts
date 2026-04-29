import type { EndingType } from '../data/types';

const SITE_URL = 'https://final-choice.vercel.app';

export interface ShareData {
  scenarioTitle: string;
  scenarioIcon: string;
  endingTitle: string;
  endingType: EndingType;
  archetypeName?: string;
  archetypeIcon?: string;
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'unavailable';

const TYPE_LABEL: Record<EndingType, string> = {
  good: '🟢 생존',
  bad: '🔴 게임 오버',
  neutral: '🟡 다른 길',
};

function buildShareText(data: ShareData): string {
  const lines = [
    `${data.scenarioIcon} ${data.scenarioTitle}`,
    `${TYPE_LABEL[data.endingType]} — ${data.endingTitle}`,
  ];
  if (data.archetypeName && data.archetypeIcon) {
    lines.push(`\n오늘의 나는 ${data.archetypeIcon} ${data.archetypeName}.`);
  }
  lines.push(`\n— FinalChoice 텍스트 어드벤처\n${SITE_URL}`);
  return lines.join('\n');
}

export async function shareEnding(data: ShareData): Promise<ShareResult> {
  const text = buildShareText(data);

  // 1) Web Share API (mobile native sheet)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `FinalChoice — ${data.scenarioTitle}`,
        text,
        url: SITE_URL,
      });
      return 'shared';
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === 'AbortError') return 'cancelled';
      // fall through to clipboard
    }
  }

  // 2) Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      // fall through
    }
  }

  return 'unavailable';
}

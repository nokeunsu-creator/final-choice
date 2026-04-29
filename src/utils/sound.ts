/**
 * 가벼운 Web Audio API 래퍼.
 * 외부 mp3/wav 파일 없이 OscillatorNode로 합성된 SFX/엔딩 톤을 출력.
 * localStorage 음소거 토글 지원.
 */

const MUTE_KEY = 'finalchoice:muted';

let cachedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (cachedCtx) return cachedCtx;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    cachedCtx = new Ctx();
    return cachedCtx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    if (muted) localStorage.setItem(MUTE_KEY, '1');
    else localStorage.removeItem(MUTE_KEY);
  } catch {
    // ignore
  }
}

interface ToneSpec {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  /** 시작 시점 오프셋 (s) */
  delay?: number;
  /** 종료 시 frequency 변화 (sweep) */
  endFrequency?: number;
  gain?: number;
}

function playTone(spec: ToneSpec) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  // 일부 브라우저는 사용자 interaction 전엔 suspend — 첫 클릭으로 자동 resume
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      /* ignore */
    });
  }

  const t0 = ctx.currentTime + (spec.delay ?? 0);
  const t1 = t0 + spec.duration;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type ?? 'sine';
  osc.frequency.setValueAtTime(spec.frequency, t0);
  if (spec.endFrequency !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, spec.endFrequency), t1);
  }
  const peak = spec.gain ?? 0.08;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, spec.duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t1 + 0.05);
}

/** 선택지 클릭 — 짧은 톡 */
export function playClick(): void {
  playTone({ frequency: 440, endFrequency: 600, duration: 0.07, type: 'triangle', gain: 0.05 });
}

/** 잠긴 선택지 — 짧은 둔탁한 음 */
export function playLocked(): void {
  playTone({ frequency: 180, endFrequency: 120, duration: 0.13, type: 'square', gain: 0.04 });
}

/** 엔딩 도달 — 종류별 다른 톤 */
export function playEnding(type: 'good' | 'bad' | 'neutral'): void {
  if (type === 'good') {
    // C-E-G 메이저 코드 분산
    playTone({ frequency: 523.25, duration: 0.22, type: 'sine', gain: 0.07 });
    playTone({ frequency: 659.25, duration: 0.22, type: 'sine', delay: 0.18, gain: 0.07 });
    playTone({ frequency: 783.99, duration: 0.45, type: 'sine', delay: 0.36, gain: 0.08 });
  } else if (type === 'bad') {
    // 하강 톤
    playTone({ frequency: 220, endFrequency: 110, duration: 0.6, type: 'sawtooth', gain: 0.05 });
  } else {
    // neutral — 부드러운 두 음
    playTone({ frequency: 440, duration: 0.3, type: 'sine', gain: 0.06 });
    playTone({ frequency: 392, duration: 0.4, type: 'sine', delay: 0.25, gain: 0.06 });
  }
}

/** 아이템 획득 — 작은 띵 */
export function playItem(): void {
  playTone({ frequency: 880, endFrequency: 1320, duration: 0.12, type: 'triangle', gain: 0.06 });
}

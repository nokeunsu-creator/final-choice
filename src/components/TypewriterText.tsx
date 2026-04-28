import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  speed?: number; // ms per character
  onDone?: () => void;
  /** key changes → re-typewrite from start */
  resetKey?: string | number;
}

export function TypewriterText({ text, speed = 28, onDone, resetKey }: Props) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setShown('');
    setDone(false);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        onDone?.();
        return;
      }
      timerRef.current = window.setTimeout(tick, speed);
    };
    timerRef.current = window.setTimeout(tick, speed);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, resetKey]);

  // 탭하면 즉시 완료
  const handleSkip = () => {
    if (done) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setShown(text);
    setDone(true);
    onDone?.();
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'keep-all',
        lineHeight: 1.9,
        fontSize: 17,
        color: '#e8e8e8',
        cursor: done ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      <span className={done ? '' : 'cursor'}>{shown}</span>
    </div>
  );
}

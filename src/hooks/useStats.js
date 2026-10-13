import { useRef, useEffect, useState } from 'react';

/**
 * Хранит почасовую историю дохода за сессию.
 * Каждую секунду записывает дельту дохода.
 * Хранит последние 60 секунд.
 */
export function useStats(totalPoints) {
  const [history, setHistory] = useState([]); // [{ t: number, delta: number }]
  const lastRef = useRef({ time: Date.now(), points: totalPoints });

  useEffect(() => {
    const i = setInterval(() => {
      const now = Date.now();
      const delta = totalPoints - lastRef.current.points;
      lastRef.current = { time: now, points: totalPoints };
      setHistory((prev) => {
        const next = [...prev, { t: now, delta }];
        // Держим последние 60 точек (секунд)
        return next.slice(-60);
      });
    }, 1000);
    return () => clearInterval(i);
  }, [totalPoints]);

  const maxDelta = Math.max(1, ...history.map((h) => h.delta));
  const avgDelta =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.delta, 0) / history.length)
      : 0;
  const peakDelta = history.length > 0 ? Math.max(...history.map((h) => h.delta)) : 0;

  return { history, maxDelta, avgDelta, peakDelta };
}
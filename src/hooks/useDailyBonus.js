import { useState, useEffect } from 'react';

const KEY = 'mc_dailyBonus';

export function useDailyBonus() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { lastClaimed: 0, activeUntil: 0 };
    } catch {
      return { lastClaimed: 0, activeUntil: 0 };
    }
  });

  const [now, setNow] = useState(Date.now());

  // Тик раз в секунду — чтобы обновлять таймеры
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;

  const canClaim = now - state.lastClaimed >= DAY;
  const active = now < state.activeUntil;
  const timeUntilClaim = Math.max(0, DAY - (now - state.lastClaimed));
  const timeUntilActiveEnd = Math.max(0, state.activeUntil - now);

  const claim = () => {
    if (!canClaim) return;
    setState({
      lastClaimed: Date.now(),
      activeUntil: Date.now() + HOUR,
    });
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  return {
    canClaim,
    active,
    multiplier: active ? 10 : 1,
    timeUntilClaim: formatTime(timeUntilClaim),
    timeUntilActiveEnd: formatTime(timeUntilActiveEnd),
    claim,
  };
}
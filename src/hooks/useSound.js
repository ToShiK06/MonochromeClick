import { useRef, useCallback } from 'react';

export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  };

  const playTone = useCallback(({ freq = 440, duration = 0.08, type = 'square', vol = 0.05 }) => {
    const ctx = getCtx();
    if (!ctx) return;
    // Пробуждаем контекст при жесте
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  return {
    click: () => playTone({ freq: 400 + Math.random() * 100, duration: 0.05 }),
    crit: () => {
      playTone({ freq: 900, duration: 0.1, type: 'sawtooth' });
      setTimeout(() => playTone({ freq: 1400, duration: 0.15, type: 'sawtooth' }), 60);
    },
    upgrade: () => {
      playTone({ freq: 600, duration: 0.08 });
      setTimeout(() => playTone({ freq: 900, duration: 0.12 }), 70);
    },
    achievement: () => {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => playTone({ freq: f, duration: 0.12 }), i * 80);
      });
    },
    prestige: () => {
      [261, 329, 392, 523, 659, 784].forEach((f, i) => {
        setTimeout(() => playTone({ freq: f, duration: 0.2, type: 'triangle', vol: 0.08 }), i * 90);
      });
    },
  };
}
import { useEffect, useRef, useState } from 'react';

/**
 * Генеративный эмбиент в стиле "ночь в лесу":
 * - Случайные "чириканья" сверчков (короткие высокочастотные трели)
 * - Низкий гул (drone) на фоне
 * - Лёгкий шум "ветра"
 * Всё синтезируется через Web Audio API без файлов.
 */
export function useAmbient() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const cricketTimerRef = useRef(null);
  const droneRefs = useRef([]);

  const start = async () => {
    if (ctxRef.current) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    await ctx.resume();
    ctxRef.current = ctx;

    // ==== Мастер-громкость (тихо, чтобы не мешало) ====
    const master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);
    masterRef.current = master;

    // ==== Drone: глубокий гул (две расстроенные низкие волны) ====
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.08;
    droneGain.connect(master);

    const drone1 = ctx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 55; // A1
    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 55 * 1.005; // чуть расстроен
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;

    drone1.connect(droneFilter);
    drone2.connect(droneFilter);
    droneFilter.connect(droneGain);
    drone1.start();
    drone2.start();
    droneRefs.current.push(drone1, drone2);

    // ==== Шум "ветра" через белый шум ====
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 300;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    droneRefs.current.push(noise);

    // ==== Сверчки: случайные трели ====
    const playCricketChirp = () => {
      if (!ctxRef.current) return;
      const c = ctxRef.current;

      // Трель = 3-5 коротких импульсов на одной частоте
      const baseFreq = 3500 + Math.random() * 1500; // 3.5k–5k Гц
      const pulses = 3 + Math.floor(Math.random() * 3); // 3-5 импульсов
      const pulseGap = 0.04 + Math.random() * 0.02;     // 40-60 мс между импульсами

      const chirpGain = c.createGain();
      chirpGain.gain.value = 0.02 + Math.random() * 0.02;
      chirpGain.connect(masterRef.current);

      for (let i = 0; i < pulses; i++) {
        const t = c.currentTime + i * pulseGap;
        const osc = c.createOscillator();
        osc.type = 'square';
        osc.frequency.value = baseFreq;
        const env = c.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + 0.005);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(env);
        env.connect(chirpGain);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    };

    // Планируем чириканья в случайные моменты
    const scheduleCricket = () => {
      if (!ctxRef.current) return;
      const delay = 300 + Math.random() * 1500; // 0.3–1.8 сек
      cricketTimerRef.current = setTimeout(() => {
        // Иногда двойное чириканье (серия)
        if (Math.random() < 0.3) {
          playCricketChirp();
          setTimeout(playCricketChirp, 120);
        } else {
          playCricketChirp();
        }
        scheduleCricket();
      }, delay);
    };
    scheduleCricket();

    setEnabled(true);
  };

  const stop = () => {
    if (cricketTimerRef.current) clearTimeout(cricketTimerRef.current);
    cricketTimerRef.current = null;

    droneRefs.current.forEach((node) => {
      try { node.stop && node.stop(); } catch (e) {}
    });
    droneRefs.current = [];

    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    masterRef.current = null;
    setEnabled(false);
  };

  const toggle = () => (enabled ? stop() : start());

  useEffect(() => {
    return () => stop();
  }, []);

  return { enabled, start, stop, toggle };
}
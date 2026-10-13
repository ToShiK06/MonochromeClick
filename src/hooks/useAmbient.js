import { useEffect, useRef, useState } from 'react';

export function useAmbient() {
  const [enabled, setEnabled] = useState(true); // 🔊 по умолчанию ВКЛ
  const [volume, setVolumeState] = useState(0.45);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const cricketTimerRef = useRef(null);
  const accentTimerRef = useRef(null);
  const droneRefs = useRef([]);

  const start = async () => {
    if (ctxRef.current) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    await ctx.resume();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    masterRef.current = master;

    // ==== Drone ====
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.18;
    droneGain.connect(master);

    const drone1 = ctx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 47;
    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 47 * 1.007;
    const drone3 = ctx.createOscillator();
    drone3.type = 'triangle';
    drone3.frequency.value = 94;

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 180;

    drone1.connect(droneFilter);
    drone2.connect(droneFilter);
    drone3.connect(droneFilter);
    droneFilter.connect(droneGain);
    drone1.start();
    drone2.start();
    drone3.start();
    droneRefs.current.push(drone1, drone2, drone3);

    // ==== Ветер ====
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);
    lfo.start();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    droneRefs.current.push(noise, lfo);

    // ==== Сверчки ====
    const playCricketChirp = () => {
      if (!ctxRef.current) return;
      const c = ctxRef.current;
      const baseFreq = 3200 + Math.random() * 2200;
      const pulses = 4 + Math.floor(Math.random() * 4);
      const pulseGap = 0.035 + Math.random() * 0.03;

      const chirpGain = c.createGain();
      chirpGain.gain.value = 0.08 + Math.random() * 0.06;
      chirpGain.connect(masterRef.current);

      for (let i = 0; i < pulses; i++) {
        const t = c.currentTime + i * pulseGap;
        const osc = c.createOscillator();
        osc.type = 'square';
        osc.frequency.value = baseFreq;
        const env = c.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + 0.004);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
        osc.connect(env);
        env.connect(chirpGain);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    };

    const scheduleCricket = () => {
      if (!ctxRef.current) return;
      const delay = 150 + Math.random() * 900;
      cricketTimerRef.current = setTimeout(() => {
        if (Math.random() < 0.4) {
          playCricketChirp();
          setTimeout(playCricketChirp, 100);
        } else {
          playCricketChirp();
        }
        scheduleCricket();
      }, delay);
    };
    scheduleCricket();

    // ==== Криповые акценты ====
    const playCreak = () => {
      const c = ctxRef.current;
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, c.currentTime);
      osc.frequency.linearRampToValueAtTime(80, c.currentTime + 0.8);
      const env = c.createGain();
      env.gain.setValueAtTime(0, c.currentTime);
      env.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.1);
      env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 8;
      osc.connect(filter);
      filter.connect(env);
      env.connect(masterRef.current);
      osc.start();
      osc.stop(c.currentTime + 1.3);
    };

    const playWhisper = () => {
      const c = ctxRef.current;
      const bufSize = c.sampleRate * 1.5;
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 12;
      const env = c.createGain();
      env.gain.setValueAtTime(0, c.currentTime);
      env.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.3);
      env.gain.linearRampToValueAtTime(0.08, c.currentTime + 1.0);
      env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);
      src.connect(filter);
      filter.connect(env);
      env.connect(masterRef.current);
      src.start();
      src.stop(c.currentTime + 1.5);
    };

    const playHeartbeat = () => {
      const c = ctxRef.current;
      const beat = (t, vol) => {
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        const env = c.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(vol, t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(env);
        env.connect(masterRef.current);
        osc.start(t);
        osc.stop(t + 0.3);
      };
      beat(c.currentTime, 0.35);
      beat(c.currentTime + 0.22, 0.22);
    };

    const playHowl = () => {
      const c = ctxRef.current;
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, c.currentTime);
      osc.frequency.linearRampToValueAtTime(220, c.currentTime + 1.5);
      osc.frequency.linearRampToValueAtTime(160, c.currentTime + 3.0);
      const lfo = c.createOscillator();
      lfo.frequency.value = 5.5;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const env = c.createGain();
      env.gain.setValueAtTime(0, c.currentTime);
      env.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.5);
      env.gain.linearRampToValueAtTime(0.15, c.currentTime + 2.0);
      env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.2);
      osc.connect(filter);
      filter.connect(env);
      env.connect(masterRef.current);
      osc.start();
      osc.stop(c.currentTime + 3.3);
      lfo.stop(c.currentTime + 3.3);
    };

    const accentPool = [playCreak, playWhisper, playHeartbeat, playHowl, playCreak, playWhisper];

    const scheduleAccent = () => {
      if (!ctxRef.current) return;
      const delay = 4000 + Math.random() * 9000;
      accentTimerRef.current = setTimeout(() => {
        const fn = accentPool[Math.floor(Math.random() * accentPool.length)];
        fn();
        scheduleAccent();
      }, delay);
    };
    scheduleAccent();
  };

  const stop = () => {
    if (cricketTimerRef.current) clearTimeout(cricketTimerRef.current);
    if (accentTimerRef.current) clearTimeout(accentTimerRef.current);
    cricketTimerRef.current = null;
    accentTimerRef.current = null;

    droneRefs.current.forEach((node) => {
      try { node.stop && node.stop(); } catch (e) {}
    });
    droneRefs.current = [];

    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    masterRef.current = null;
  };

  // Публичное управление
  const toggle = () => {
    if (enabled) {
      stop();
      setEnabled(false);
    } else {
      start();
      setEnabled(true);
    }
  };

  const setVolume = (v) => {
    setVolumeState(v);
    if (masterRef.current) {
      masterRef.current.gain.value = v;
    }
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { enabled, start, stop, toggle, volume, setVolume };
}
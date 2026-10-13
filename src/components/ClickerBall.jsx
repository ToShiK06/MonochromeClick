import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ClickerBall.css';

const DREAM_ICONS = ['💭', '🌙', '⭐', '✨', '🦴', '🐟', '🌈'];
const Z_ICONS = ['💤', 'Z', 'z'];

function ClickerBall({ onClick, clickPower, onSleepChange, combo = 0, skin }) {
  const [pulses, setPulses] = useState([]);
  const [blinking, setBlinking] = useState(false);
  const [squinting, setSquinting] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [yawning, setYawning] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [dream, setDream] = useState(null);

  const ballRef = useRef(null);
  const irisRef = useRef(null);
  const pupilRef = useRef(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const trembleRef = useRef({ x: 0, y: 0 });
  const trembleTimeRef = useRef(0);
  const pulseTimeRef = useRef(0);
  const rafRef = useRef(null);

  const lastMouseMoveRef = useRef(Date.now());
  const lastClickRef = useRef(Date.now());
  const wanderTargetRef = useRef(null);
  const sleepingRef = useRef(false);
  const hoveringRef = useRef(false);
  const yawningRef = useRef(false);

  // ====== Синхронизация наружу ======
  useEffect(() => {
    sleepingRef.current = sleeping;
    onSleepChange && onSleepChange(sleeping);
  }, [sleeping, onSleepChange]);

  useEffect(() => {
    hoveringRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    yawningRef.current = yawning;
  }, [yawning]);

  // ============ ГЛАВНЫЙ ЦИКЛ ============
  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      // ---- Автономный взгляд ----
      const idle = now - lastMouseMoveRef.current;
      if (idle > 2000 && !sleepingRef.current && !yawningRef.current) {
        if (!wanderTargetRef.current) {
          const maxOffset = 38;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * maxOffset;
          wanderTargetRef.current = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          };
        }
        targetRef.current = wanderTargetRef.current;
      } else {
        wanderTargetRef.current = null;
      }

      // ---- Инерция ----
      let ease = 0.12;
      if (sleepingRef.current) ease = 0.05;
      if (hoveringRef.current) ease = 0.22; // живее при наведении
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

      if (wanderTargetRef.current) {
        const dx = wanderTargetRef.current.x - currentRef.current.x;
        const dy = wanderTargetRef.current.y - currentRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 1.5) wanderTargetRef.current = null;
      }

      // ---- Дрожание ----
      trembleTimeRef.current += 0.15;
      const t = trembleTimeRef.current;
      const trembleStrength = sleepingRef.current ? 0.3 : hoveringRef.current ? 0.6 : 1.2;
      trembleRef.current.x = Math.sin(t * 1.3) * trembleStrength + Math.sin(t * 2.7) * 0.6;
      trembleRef.current.y = Math.cos(t * 1.7) * trembleStrength + Math.cos(t * 3.1) * 0.6;

      // ---- Пульс зрачка ----
      pulseTimeRef.current += 1 / 60;
      const beatRate = sleepingRef.current ? 0.6 : hoveringRef.current ? 1.3 : 1.1;
      const beatT = (pulseTimeRef.current * beatRate) % 1;
      const beat1 = Math.exp(-Math.pow((beatT - 0.05) * 18, 2));
      const beat2 = Math.exp(-Math.pow((beatT - 0.2) * 18, 2)) * 0.6;
      const beat = beat1 + beat2;

      // ---- Размер зрачка от hover / комбо ----
      const hoverBoost = hoveringRef.current ? 1.15 : 1;
      const comboBoost = Math.min(1 + combo * 0.02, 1.4);
      const basePupilScale = hoverBoost * comboBoost;
      const pulseScale = 1 + beat * 0.12;
      const finalPupilScale = basePupilScale * pulseScale;

      if (irisRef.current) {
        const fx = currentRef.current.x + trembleRef.current.x;
        const fy = currentRef.current.y + trembleRef.current.y;
        irisRef.current.style.transform = `translate(${fx}px, ${fy}px)`;
      }
      if (pupilRef.current) {
        pupilRef.current.style.setProperty('--pulse', finalPupilScale);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [combo]);

  // ============ МЫШЬ ============
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ballRef.current) return;
      if (sleepingRef.current) setSleeping(false);
      lastMouseMoveRef.current = Date.now();

      const rect = ballRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxOffset = 38;
      const maxDistance = 300;
      const factor = Math.min(distance / maxDistance, 1);
      const angle = Math.atan2(dy, dx);

      targetRef.current = {
        x: Math.cos(angle) * maxOffset * factor,
        y: Math.sin(angle) * maxOffset * factor,
      };
      wanderTargetRef.current = null;
    };

    const handleMouseLeave = () => {
      targetRef.current = { x: 0, y: 0 };
      wanderTargetRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, []);

  // ============ МОРГАНИЕ ============
  useEffect(() => {
    let timeoutId;
    const scheduleBlink = () => {
      if (sleepingRef.current || yawningRef.current) {
        timeoutId = setTimeout(scheduleBlink, 1000);
        return;
      }
      const delay = 3000 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        setBlinking(true);
        const dur = 120 + Math.random() * 60;
        setTimeout(() => {
          setBlinking(false);
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlinking(true);
              setTimeout(() => setBlinking(false), 100);
            }, 120);
          }
          scheduleBlink();
        }, dur);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // ============ ЗЕВАНИЕ ============
  useEffect(() => {
    let timeoutId;
    const scheduleYawn = () => {
      const delay = 15000 + Math.random() * 20000; // 15-35 сек
      timeoutId = setTimeout(() => {
        if (sleepingRef.current) {
          scheduleYawn();
          return;
        }
        setYawning(true);
        // Длительность зевка ~1.5 сек
        setTimeout(() => setYawning(false), 1500);
        scheduleYawn();
      }, delay);
    };
    scheduleYawn();
    return () => clearTimeout(timeoutId);
  }, []);

  // ============ СОН ============
  useEffect(() => {
    const checkSleep = setInterval(() => {
      const idle = Date.now() - lastClickRef.current;
      if (idle > 30000 && !sleepingRef.current) setSleeping(true);
    }, 1000);
    return () => clearInterval(checkSleep);
  }, []);

  // ============ СНОВИДЕНИЯ ============
  useEffect(() => {
    if (!sleeping) {
      setDream(null);
      return;
    }
    const dreamInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        const icon = DREAM_ICONS[Math.floor(Math.random() * DREAM_ICONS.length)];
        setDream({ icon, id: Date.now() });
        setTimeout(() => setDream(null), 2500);
      }
    }, 3000);
    return () => clearInterval(dreamInterval);
  }, [sleeping]);

  // ============ КЛИК ============
  const handleClick = useCallback((e) => {
    lastClickRef.current = Date.now();
    if (sleepingRef.current) setSleeping(false);
    if (yawningRef.current) setYawning(false);

    onClick(e);

    setSquinting(true);
    setTimeout(() => setSquinting(false), 200);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setPulses((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, [onClick]);

  return (
    <div
      className={`ball-wrapper ${hovering ? 'hovering' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={`ball-aura ${sleeping ? 'sleepy' : ''}`}></div>

      <div className={`ball ${sleeping ? 'sleeping' : ''}`} ref={ballRef}>
        <div
          className={`eye-white ${blinking ? 'blinking' : ''} ${sleeping ? 'sleeping' : ''} ${yawning ? 'yawning' : ''}`}
        >
          <div
  className="eye-iris"
  ref={irisRef}
  style={{
    background: skin?.iris?.includes('gradient')
      ? skin.iris
      : `radial-gradient(circle at 35% 35%, ${skin?.iris || '#4a4a4a'}, ${skin?.irisDark || '#000'} 75%)`,
    boxShadow: skin
      ? `0 0 20px ${skin.glow}, inset 0 0 15px rgba(0,0,0,0.9)`
      : '0 0 20px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.9)',
  }}
>
  <div
    className={`eye-pupil ${squinting ? 'squinting' : ''}`}
    ref={pupilRef}
  >
    <div className="eye-glint"></div>
  </div>
</div>
          <div className={`eye-lid ${blinking ? 'closed' : ''} ${sleeping ? 'closed' : ''} ${yawning ? 'closed' : ''}`}></div>
        </div>
        <div className="ball-ring"></div>
      </div>

      {sleeping && (
        <div className="zzz">
          <span className="z z1">{Z_ICONS[0]}</span>
          <span className="z z2">{Z_ICONS[1]}</span>
          <span className="z z3">{Z_ICONS[2]}</span>
        </div>
      )}

      {dream && (
        <div key={dream.id} className="dream-bubble">
          <span className="dream-icon">{dream.icon}</span>
        </div>
      )}

      {pulses.map((p) => (
        <span key={p.id} className="click-pulse" style={{ left: p.x, top: p.y }}>
          +{clickPower}
        </span>
      ))}

      <p className="ball-hint">
        {sleeping ? '💤 НАЖМИ, ЧТОБЫ РАЗБУДИТЬ' : 'НАЖМИ НА ШАР'}
      </p>
    </div>
  );
}

export default ClickerBall;
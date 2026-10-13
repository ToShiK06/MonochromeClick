import React, { useState, useEffect } from 'react';
import './SoundGate.css';

function SoundGate({ onEnter, onEnterMuted }) {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);

  // Плавное появление при монтировании
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  const handleEnter = (muted) => {
    setFading(true);
    setTimeout(() => {
      if (muted) onEnterMuted();
      else onEnter();
    }, 800);
  };

  return (
    <div
      className={`sound-gate ${mounted ? 'mounted' : ''} ${fading ? 'fading' : ''}`}
    >
      {/* Мягкое свечение сзади */}
      <div className="sound-gate-bg-glow"></div>

      <div className="sound-gate-content">
        <h1 className="sound-gate-title">MONOCHROME CLICKER</h1>

        <div className="sound-gate-eye-wrap">
          <div className="sound-gate-eye">
            <div className="sound-gate-eye-inner">
              <div className="sound-gate-pupil"></div>
              <div className="sound-gate-glint"></div>
            </div>
          </div>
          <div className="sound-gate-eye-ring"></div>
        </div>

        <p className="sound-gate-text">
          Для полного погружения рекомендуем играть со звуком
        </p>

        <div className="sound-gate-buttons">
          <button
            className="sound-gate-btn sound-gate-btn-primary"
            onClick={() => handleEnter(false)}
          >
            🎧 НАЧАТЬ СО ЗВУКОМ
          </button>

          <button
            className="sound-gate-btn sound-gate-btn-secondary"
            onClick={() => handleEnter(true)}
          >
            🔇 БЕЗ ЗВУКА
          </button>
        </div>

        <p className="sound-gate-hint">
          Звук можно будет выключить в любой момент в ⚙️ НАСТРОЙКАХ
        </p>
      </div>
    </div>
  );
}

export default SoundGate;
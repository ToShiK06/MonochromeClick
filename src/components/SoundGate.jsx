import React, { useState } from 'react';
import './SoundGate.css';

function SoundGate({ onEnter, onEnterMuted }) {
  const [fading, setFading] = useState(false);

  const handleEnter = (muted) => {
    setFading(true);
    setTimeout(() => {
      if (muted) onEnterMuted();
      else onEnter();
    }, 600);
  };

  return (
    <div className={`sound-gate ${fading ? 'fading' : ''}`}>
      <div className="sound-gate-content">
        <h1 className="sound-gate-title">MONOCHROME CLICKER</h1>

        <div className="sound-gate-eye">
          <div className="sound-gate-eye-inner"></div>
        </div>

        <p className="sound-gate-text">
          Для полного погружения рекомендуем играть со звуком
        </p>

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

        <p className="sound-gate-hint">
          Звук можно будет выключить в любой момент в ⚙️ НАСТРОЙКАХ
        </p>
      </div>
    </div>
  );
}

export default SoundGate;
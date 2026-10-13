import React, { useState, useEffect, useRef } from 'react';
import './FishingGame.css';

const FISHES = [
  { emoji: '🐟', xp: 3, weight: 50 },
  { emoji: '🐠', xp: 5, weight: 25 },
  { emoji: '🦐', xp: 2, weight: 15 },
  { emoji: '🦑', xp: 8, weight: 7 },
  { emoji: '🐙', xp: 12, weight: 2 },
  { emoji: '🐉', xp: 50, weight: 1 }, // Легендарная рыба!
];

function pickFish() {
  const total = FISHES.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISHES) {
    if (r < f.weight) return f;
    r -= f.weight;
  }
  return FISHES[0];
}

function FishingGame({ onCatch, disabled }) {
  const [state, setState] = useState('idle'); // idle | casting | waiting | bite | caught | missed
  const [fish, setFish] = useState(null);
  const [message, setMessage] = useState('ЗАКИНЬ УДОЧКУ');
  const timerRef = useRef(null);
  const biteTimeoutRef = useRef(null);

  const reset = () => {
    setState('idle');
    setFish(null);
    setMessage('ЗАКИНЬ УДОЧКУ');
    clearTimeout(timerRef.current);
    clearTimeout(biteTimeoutRef.current);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(biteTimeoutRef.current);
    };
  }, []);

  const cast = () => {
    if (state !== 'idle') return;
    setState('waiting');
    setMessage('ЖДЁМ...');
    setFish(pickFish());

    // Случайная задержка 1.5–5 сек до поклёвки
    const delay = 1500 + Math.random() * 3500;
    biteTimeoutRef.current = setTimeout(() => {
      setState('bite');
      setMessage('КЛЮЁТ! ЖМИ!');
      // Если игрок не успел за 1.2 сек — сход
      timerRef.current = setTimeout(() => {
        setState('missed');
        setMessage('СОРВАЛАСЬ...');
        setTimeout(reset, 1500);
      }, 1200);
    }, delay);
  };

  const pull = () => {
    if (state !== 'bite') return;
    clearTimeout(timerRef.current);
    clearTimeout(biteTimeoutRef.current);
    setState('caught');
    setMessage(`ПОЙМАН ${fish.emoji} +${fish.xp} XP`);
    onCatch && onCatch(fish.xp);
    setTimeout(reset, 1800);
  };

  const handleClick = () => {
    if (disabled) return;
    if (state === 'idle') cast();
    else if (state === 'bite') pull();
  };

  return (
    <div className={`fishing-game state-${state}`}>
      <h2 className="panel-title">[ РЫБАЛКА ]</h2>
      <div className="fishing-scene">
        <div className="water-surface"></div>
        {state === 'bite' && <div className="ripple"></div>}
        <div className="bobber">
          {state === 'idle' && '🎣'}
          {state === 'waiting' && '•'}
          {state === 'bite' && '❗'}
          {state === 'caught' && fish?.emoji}
          {state === 'missed' && '💨'}
        </div>
      </div>
      <div className={`fishing-message msg-${state}`}>{message}</div>
      <button
        className={`fishing-btn ${state === 'bite' ? 'hot' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        disabled={disabled || state === 'caught' || state === 'missed'}
      >
        {state === 'idle' && '🎣 ЗАКИНУТЬ'}
        {state === 'waiting' && '⌛ ЖДЁМ...'}
        {state === 'bite' && '⚡ ПОДСЕЧЬ!'}
        {state === 'caught' && '✅ УЛОВ!'}
        {state === 'missed' && '💨 УПЛЫЛА'}
      </button>
    </div>
  );
}

export default FishingGame;
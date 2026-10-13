import React, { useMemo } from 'react';
import './Weather.css';

function Weather({ weather, timeOfDay }) {
  // Генерируем капли дождя для rain/storm
  const rainDrops = useMemo(() => {
    if (weather !== 'rain' && weather !== 'storm') return [];
    const count = weather === 'storm' ? 80 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.6 + Math.random() * 0.6,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [weather]);

  return (
    <>
      <div className={`time-overlay time-${timeOfDay}`}></div>
      <div className={`weather-overlay weather-${weather}`}></div>

      {/* Молния при грозе */}
      {weather === 'storm' && <div className="lightning"></div>}

      {/* Дождь */}
      {(weather === 'rain' || weather === 'storm') && (
        <div className="rain">
          {rainDrops.map((d) => (
            <span
              key={d.id}
              className="drop"
              style={{
                left: `${d.left}%`,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.duration}s`,
                opacity: d.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Туман */}
      {weather === 'fog' && (
        <div className="fog">
          <div className="fog-layer fog-1"></div>
          <div className="fog-layer fog-2"></div>
          <div className="fog-layer fog-3"></div>
        </div>
      )}

      {/* Индикатор */}
      <div className="weather-indicator">
        {timeOfDay === 'night' && '🌙'}
        {timeOfDay === 'day' && '☀️'}
        {timeOfDay === 'dusk' && '🌆'}
        {timeOfDay === 'dawn' && '🌅'}
        {' · '}
        {weather === 'clear' && 'ясно'}
        {weather === 'fog' && 'туман'}
        {weather === 'rain' && 'дождь'}
        {weather === 'storm' && 'гроза'}
      </div>
    </>
  );
}

export default Weather;
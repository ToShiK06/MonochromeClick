import React from 'react';
import './StatsPanel.css';

function StatsPanel({ history, maxDelta, avgDelta, peakDelta, totalPoints, totalClicks, playtime }) {
  const W = 240;
  const H = 80;
  const BAR_W = W / Math.max(history.length, 1);

  return (
    <div className="panel">
      <h2 className="panel-title">[ СТАТИСТИКА ]</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-box-label">ВСЕГО</span>
          <span className="stat-box-value">{totalPoints.toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">КЛИКОВ</span>
          <span className="stat-box-value">{totalClicks.toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">СРЕДН.</span>
          <span className="stat-box-value">{avgDelta}/сек</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">ПИК</span>
          <span className="stat-box-value">{peakDelta}/сек</span>
        </div>
      </div>

      <div className="chart-wrapper">
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {/* Сетка */}
          <line x1="0" y1={H * 0.25} x2={W} y2={H * 0.25} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="0" y1={H * 0.5}  x2={W} y2={H * 0.5}  stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

          {/* Столбики */}
          {history.map((h, i) => {
            const barH = (h.delta / maxDelta) * H * 0.9;
            return (
              <rect
                key={h.t}
                x={i * BAR_W + 1}
                y={H - barH}
                width={Math.max(BAR_W - 2, 1)}
                height={barH}
                fill="#fff"
                opacity={0.85}
              />
            );
          })}
        </svg>
        <div className="chart-label">последние 60 сек · пик {maxDelta}/сек</div>
      </div>

      <div className="playtime">
        ⏱ Сессия: {playtime}
      </div>
    </div>
  );
}

export default StatsPanel;
import React from 'react';
import './PrestigePanel.css';

function PrestigePanel({ totalPoints, prestige, onPrestige }) {
  const required = 50000 * Math.pow(3, prestige);
  const canPrestige = totalPoints >= required;

  return (
    <div className="prestige-panel">
      <h2 className="panel-title">[ ПРЕСТИЖ ]</h2>
      <div className="prestige-info">
        <div className="prestige-row">
          <span>УРОВЕНЬ:</span>
          <span className="prestige-value">{prestige}</span>
        </div>
        <div className="prestige-desc">
          Каждый престиж: <strong>+25%</strong> к доходу
        </div>
        <div className="prestige-bonus">
          Текущий бонус: <strong>+{prestige * 25}%</strong>
        </div>
        <div className="prestige-req">
          Нужно: {required.toLocaleString()} очков всего
        </div>
        <div className="prestige-bar-wrapper">
          <div
            className="prestige-bar"
            style={{ width: `${Math.min((totalPoints / required) * 100, 100)}%` }}
          ></div>
          <span className="prestige-bar-text">
            {Math.min((totalPoints / required) * 100, 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <button
        className={`upgrade-btn ${canPrestige ? '' : 'disabled'}`}
        onClick={onPrestige}
        disabled={!canPrestige}
      >
        <span>⟳ ПРЕСТИЖ</span>
        <span className="cost">+1</span>
      </button>
      <div className="next-info">
        Сбросит очки, клик и питомца
      </div>
    </div>
  );
}

export default PrestigePanel;
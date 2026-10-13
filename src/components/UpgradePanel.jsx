import React from 'react';
import './UpgradePanel.css';

function UpgradePanel({ clickLevel, clickPower, cost, points, onUpgrade }) {
  const canAfford = points >= cost;

  return (
    <div className="panel">
      <h2 className="panel-title">[ ПРОКАЧКА КЛИКА ]</h2>

      <div className="upgrade-card">
        <div className="upgrade-icon">⚡</div>
        <div className="upgrade-info">
          <div className="upgrade-name">МОЩЬ КЛИКА</div>
          <div className="upgrade-level">Уровень: {clickLevel}</div>
          <div className="upgrade-desc">+{clickPower} за клик</div>
        </div>
      </div>

      <button
        className={`upgrade-btn ${canAfford ? '' : 'disabled'}`}
        onClick={onUpgrade}
        disabled={!canAfford}
      >
        <span>УЛУЧШИТЬ</span>
        <span className="cost">{cost} ⬤</span>
      </button>

      <div className="next-info">
        Следующий уровень: <strong>+{clickPower + 1}</strong> за клик
      </div>
    </div>
  );
}

export default UpgradePanel;
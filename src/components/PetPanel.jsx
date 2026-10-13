import React from 'react';
import './PetPanel.css';

function PetPanel({ pet, cost, points, onFeed }) {
  const canAfford = points >= cost;
  const xpPercent = (pet.xp / pet.xpToNext) * 100;

  const stageNames = {
    baby: 'МЛАДЕНЕЦ',
    teen: 'ПОДРОСТОК',
    adult: 'ВЗРОСЛЫЙ',
  };

  return (
    <div className="panel">
      <h2 className="panel-title">[ ПИТОМЕЦ ]</h2>

      <div className="pet-card">
        <div className="pet-name">{pet.name}</div>
        <div className="pet-stage">{stageNames[pet.stage]}</div>

        <div className="pet-level-row">
          <span>УРОВЕНЬ</span>
          <span className="pet-level">{pet.level}</span>
        </div>

        <div className="xp-bar-wrapper">
          <div className="xp-bar" style={{ width: `${xpPercent}%` }}></div>
          <span className="xp-text">
            {pet.xp} / {pet.xpToNext} XP
          </span>
        </div>

        <div className="pet-bonus">
          Авто-клик: +{pet.level - 1}/сек
        </div>
      </div>

      <button
        className={`upgrade-btn ${canAfford ? '' : 'disabled'}`}
        onClick={onFeed}
        disabled={!canAfford}
      >
        <span>🍖 ПОКОРМИТЬ</span>
        <span className="cost">{cost} ⬤</span>
      </button>

      <div className="next-info">
        +5 XP за кормление
      </div>
    </div>
  );
}

export default PetPanel;
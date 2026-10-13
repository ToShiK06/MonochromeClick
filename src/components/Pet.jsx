import React from 'react';
import './Pet.css';

function Pet({ pet, sleeping = false }) {
  const petEmoji = {
    baby: '👻',
    teen: '🐺',
    adult: '🐉',
  }[pet.stage];

  return (
    <div className={`pet-display pet-${pet.stage} ${sleeping ? 'sleeping' : ''}`}>
      <div className="pet-sprite">{sleeping ? '😴' : petEmoji}</div>
      <div className="pet-shadow"></div>
      <div className="pet-label">
        {pet.name} · Lv.{pet.level}
      </div>
    </div>
  );
}

export default Pet;
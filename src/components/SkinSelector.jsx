import React from 'react';
import { SKINS } from '../data/skins';
import './SkinSelector.css';

function SkinSelector({ prestige, selected, onSelect }) {
  return (
    <div className="skin-selector">
      <h2 className="panel-title">[ СКИНЫ ГЛАЗА ]</h2>
      <div className="skin-grid">
        {SKINS.map((skin) => {
          const unlocked = prestige >= skin.requiredPrestige;
          const isSelected = selected === skin.id;
          return (
            <button
              key={skin.id}
              className={`skin-btn ${isSelected ? 'selected' : ''} ${unlocked ? '' : 'locked'}`}
              onClick={() => unlocked && onSelect(skin.id)}
              disabled={!unlocked}
              title={unlocked ? skin.name : `Нужен престиж ${skin.requiredPrestige}`}
            >
              <span
                className="skin-preview"
                style={{
                  background: skin.iris,
                  boxShadow: `0 0 15px ${skin.glow}`,
                }}
              />
              <span className="skin-name">{skin.name}</span>
              {!unlocked && <span className="skin-lock">🔒 {skin.requiredPrestige}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SkinSelector;
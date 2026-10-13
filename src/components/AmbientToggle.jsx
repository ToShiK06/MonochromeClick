import React from 'react';
import './AmbientToggle.css';

function AmbientToggle({ enabled, onToggle }) {
  return (
    <button
      className={`ambient-toggle ${enabled ? 'on' : 'off'}`}
      onClick={onToggle}
      title={enabled ? 'Выключить сверчков' : 'Включить сверчков'}
      aria-label={enabled ? 'Sound off' : 'Sound on'}
    />
  );
}

export default AmbientToggle;
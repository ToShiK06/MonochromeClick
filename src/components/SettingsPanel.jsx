import React from 'react';
import './SettingsPanel.css';

function SettingsPanel({ ambient, sound }) {
  return (
    <div className="panel">
      <h2 className="panel-title">[ НАСТРОЙКИ ]</h2>

      <div className="settings-section">
        <div className="settings-label">
          🦗 ФОНОВЫЙ ЗВУК
          <span className={`settings-status ${ambient.enabled ? 'on' : 'off'}`}>
            {ambient.enabled ? 'ВКЛ' : 'ВЫКЛ'}
          </span>
        </div>
        <button
          className={`settings-btn ${ambient.enabled ? 'active' : ''}`}
          onClick={ambient.toggle}
        >
          {ambient.enabled ? '🔊 ВЫКЛЮЧИТЬ ЗВУК' : '🔇 ВКЛЮЧИТЬ ЗВУК'}
        </button>

        {ambient.enabled && (
          <div className="volume-control">
            <label className="volume-label">
              ГРОМКОСТЬ: {Math.round(ambient.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambient.volume}
              onChange={(e) => ambient.setVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-label">
          💥 ЗВУКИ КЛИКОВ
        </div>
        <p className="settings-hint">
          Короткие сигналы при клике, крите и прокачке
        </p>
      </div>

      <div className="settings-section">
        <div className="settings-label">
          ℹ️ ОБ ИГРЕ
        </div>
        <p className="settings-hint">
          Monochrome Clicker<br />
          Не смотри в глаз слишком долго.
        </p>
      </div>
    </div>
  );
}

export default SettingsPanel;
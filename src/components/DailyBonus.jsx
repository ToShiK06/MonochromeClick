import React from 'react';
import './DailyBonus.css';

function DailyBonus({ daily, onClaim }) {
  return (
    <div className="daily-bonus">
      <div className="daily-title">🎁 ЕЖЕДНЕВНЫЙ БОНУС</div>
      {daily.active ? (
        <div className="daily-active">
          ✅ АКТИВЕН: <strong>×10 К КЛИКУ</strong>
          <div className="daily-timer">осталось {daily.timeUntilActiveEnd}</div>
        </div>
      ) : daily.canClaim ? (
        <button className="daily-claim-btn" onClick={onClaim}>
          ЗАБРАТЬ! ×10 на час
        </button>
      ) : (
        <div className="daily-wait">
          Доступен через <strong>{daily.timeUntilClaim}</strong>
        </div>
      )}
    </div>
  );
}

export default DailyBonus;
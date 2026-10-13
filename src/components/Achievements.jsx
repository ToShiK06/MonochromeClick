import React from 'react';
import './Achievements.css';

const ALL_ACHIEVEMENTS = [
  { id: 'first_click',  name: 'ПЕРВЫЙ КЛИК',      desc: 'Сделай 1 клик',           icon: '👆' },
  { id: 'click_100',    name: 'СТАРАТЕЛЬНЫЙ',      desc: '100 кликов',              icon: '💯' },
  { id: 'click_1000',   name: 'КЛИК-МАШИНА',       desc: '1000 кликов',             icon: '⚙️' },
  { id: 'points_1k',    name: 'ТЫСЯЧНИК',          desc: 'Накопи 1000 очков',       icon: '💰' },
  { id: 'points_10k',   name: 'БОГАЧ',             desc: 'Накопи 10 000 очков',     icon: '💎' },
  { id: 'pet_lv5',      name: 'ВЕРНЫЙ ДРУГ',       desc: 'Питомец Lv.5',            icon: '🐺' },
  { id: 'pet_lv10',     name: 'ЛЕГЕНДА',           desc: 'Питомец Lv.10',           icon: '🐉' },
  { id: 'upgrade_10',   name: 'ПРОКАЧКА',          desc: 'Клик Lv.10',              icon: '⚡' },
  { id: 'combo_50',     name: 'В УДАРЕ',           desc: 'Комбо x50',               icon: '🔥' },
  { id: 'crit_first',   name: 'КРИТ!',             desc: 'Первый крит',             icon: '✨' },
];

function Achievements({ unlocked = [] }) {
  return (
    <div className="ach-panel">
      <h2 className="panel-title">[ ДОСТИЖЕНИЯ ]</h2>
      <div className="ach-list">
        {ALL_ACHIEVEMENTS.map((a) => {
          const unlockedFlag = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={`ach-item ${unlockedFlag ? 'unlocked' : 'locked'}`}
              title={a.desc}
            >
              <span className="ach-icon">{unlockedFlag ? a.icon : '🔒'}</span>
              <span className="ach-name">{unlockedFlag ? a.name : '???'}</span>
            </div>
          );
        })}
      </div>
      <div className="ach-progress">
        {unlocked.length} / {ALL_ACHIEVEMENTS.length}
      </div>
    </div>
  );
}

export { ALL_ACHIEVEMENTS };
export default Achievements;
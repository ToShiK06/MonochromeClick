import React from 'react';
import { SHOP_ITEMS, getShopCost } from '../data/shopItems';
import './ShopPanel.css';

function ShopPanel({ shopLevels, points, onBuy }) {
  return (
    <div className="panel">
      <h2 className="panel-title">[ МАГАЗИН АПГРЕЙДОВ ]</h2>
      <div className="shop-list">
        {SHOP_ITEMS.map((item) => {
          const level = shopLevels[item.id] || 0;
          const maxed = level >= item.maxLevel;
          const cost = getShopCost(item, level);
          const canBuy = !maxed && points >= cost;

          return (
            <div key={item.id} className={`shop-item ${maxed ? 'maxed' : ''}`}>
              <div className="shop-item-icon">{item.icon}</div>
              <div className="shop-item-info">
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-desc">{item.desc}</div>
                <div className="shop-item-level">
                  Ур. {level} / {item.maxLevel}
                </div>
              </div>
              <button
                className={`shop-buy-btn ${canBuy ? '' : 'disabled'}`}
                onClick={() => onBuy(item.id)}
                disabled={!canBuy}
              >
                {maxed ? '✓' : `${cost}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShopPanel;
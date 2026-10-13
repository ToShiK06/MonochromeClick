import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ClickerBall from './components/ClickerBall';
import UpgradePanel from './components/UpgradePanel';
import PetPanel from './components/PetPanel';
import Pet from './components/Pet';
import PetBubble from './components/PetBubble';
import Toast from './components/Toast';
import Achievements, { ALL_ACHIEVEMENTS } from './components/Achievements';
import PrestigePanel from './components/PrestigePanel';
import ShopPanel from './components/ShopPanel';
import SkinSelector from './components/SkinSelector';
import FishingGame from './components/FishingGame';
import StatsPanel from './components/StatsPanel';
import DailyBonus from './components/DailyBonus';
import AmbientToggle from './components/AmbientToggle';
import Weather from './components/Weather';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useToasts } from './hooks/useToasts';
import { useSound } from './hooks/useSound';
import { useAmbient } from './hooks/useAmbient';
import { useDailyBonus } from './hooks/useDailyBonus';
import { useStats } from './hooks/useStats';
import { useWeather } from './hooks/useWeather';
import { checkAchievements } from './hooks/useGameLogic';

import { SHOP_ITEMS, getShopCost } from './data/shopItems';
import { SKINS } from './data/skins';
import { PET_PHRASES, pickRandom } from './data/petPhrases';

// Мета-данные табов — чтобы удобно рендерить и в drawer, и в bottom-панели
const TABS = [
  { id: 'upgrades', icon: '⚡', label: 'КЛИК' },
  { id: 'pet',      icon: '🐾', label: 'ПИТОМЕЦ' },
  { id: 'shop',     icon: '🛒', label: 'МАГАЗИН' },
  { id: 'skins',    icon: '🌈', label: 'СКИНЫ' },
  { id: 'fishing',  icon: '🎣', label: 'РЫБАЛКА' },
  { id: 'stats',    icon: '📊', label: 'СТАТИСТИКА' },
  { id: 'ach',      icon: '🏆', label: 'ДОСТИЖЕНИЯ' },
  { id: 'prestige', icon: '⟳',  label: 'ПРЕСТИЖ' },
];

function App() {
  // ==== Сохранения ====
  const [points, setPoints] = useLocalStorage('mc_points', 0);
  const [totalPoints, setTotalPoints] = useLocalStorage('mc_total', 0);
  const [clickPower, setClickPower] = useLocalStorage('mc_clickPower', 1);
  const [clickLevel, setClickLevel] = useLocalStorage('mc_clickLevel', 1);
  const [autoClickPerSec, setAutoClickPerSec] = useLocalStorage('mc_autoClick', 0);
  const [prestige, setPrestige] = useLocalStorage('mc_prestige', 0);
  const [achievements, setAchievements] = useLocalStorage('mc_achievements', []);
  const [totalClicks, setTotalClicks] = useLocalStorage('mc_totalClicks', 0);
  const [totalCrits, setTotalCrits] = useLocalStorage('mc_totalCrits', 0);
  const [maxCombo, setMaxCombo] = useLocalStorage('mc_maxCombo', 0);
  const [critChance] = useLocalStorage('mc_critChance', 0.05);
  const [shopLevels, setShopLevels] = useLocalStorage('mc_shopLevels', {});
  const [selectedSkin, setSelectedSkin] = useLocalStorage('mc_skin', 'default');
  const [pet, setPet] = useLocalStorage('mc_pet', {
    level: 1, xp: 0, xpToNext: 10, name: 'Призрак', stage: 'baby',
  });

  // ==== В памяти ====
  const [eyeSleeping, setEyeSleeping] = useState(false);
  const [combo, setCombo] = useState(0);
  const [activeTab, setActiveTab] = useState('upgrades');
  const [petSpeech, setPetSpeech] = useState(null);
  const [playtime, setPlaytime] = useState('00:00:00');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const comboTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const sessionStartRef = useRef(Date.now());

  // ==== Хуки ====
  const { toasts, pushToast, removeToast } = useToasts();
  const sound = useSound();
  const ambient = useAmbient();
  const daily = useDailyBonus();
  const stats = useStats(totalPoints);
  const { weather, timeOfDay } = useWeather();

  // ==== Стоимости ====
  const getClickUpgradeCost = () => Math.floor(10 * Math.pow(1.6, clickLevel - 1));
  const getPetFeedCost = () => Math.floor(5 * Math.pow(1.4, pet.level - 1));
  const prestigeMultiplier = 1 + prestige * 0.25;

  // ==== Бонусы магазина ====
  const shopBonuses = SHOP_ITEMS.reduce((acc, item) => {
    const level = shopLevels[item.id] || 0;
    if (level === 0) return acc;
    return { ...acc, ...item.effect(level) };
  }, {});

  const effectiveClickPower = clickPower * (shopBonuses.clickMultiplier || 1);
  const effectiveCritChance = critChance + (shopBonuses.critChanceFlat || 0);
  const effectiveAutoClick = autoClickPerSec + (shopBonuses.autoClickFlat || 0);
  const effectiveComboDuration = 2000 + (shopBonuses.comboDurationFlat || 0);
  const effectivePetXp = 5 + (shopBonuses.petXpFlat || 0);
  const effectiveAutoMultiplier = (shopBonuses.autoMultiplier || 1) * prestigeMultiplier * daily.multiplier;

  const currentSkin = SKINS.find((s) => s.id === selectedSkin) || SKINS[0];

  // ==== Автоклик ====
  useEffect(() => {
  if (effectiveAutoClick <= 0) return;
  const interval = setInterval(() => {
    const gain = Math.floor(effectiveAutoClick * effectiveAutoMultiplier);
    setPoints((p) => p + gain);
    setTotalPoints((t) => t + gain);
  }, 1000);
  return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [effectiveAutoClick, effectiveAutoMultiplier]);

  // ==== Playtime ====
  useEffect(() => {
    const i = setInterval(() => {
      const ms = Date.now() - sessionStartRef.current;
      const s = Math.floor(ms / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setPlaytime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(i);
  }, []);

  // ==== Речь питомца ====
  const speak = (list) => {
    const text = pickRandom(list);
    setPetSpeech(null);
    setTimeout(() => setPetSpeech(text), 10);
    clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setPetSpeech(null), 2500);
  };

  useEffect(() => {
    if (eyeSleeping) return;
    const i = setInterval(() => {
      if (Math.random() < 0.5) speak(PET_PHRASES.randomIdle);
    }, 30000);
    return () => clearInterval(i);
  }, [eyeSleeping]);

  // ==== Комбо ====
  const bumpCombo = () => {
    setCombo((c) => {
      const nc = c + 1;
      if (nc > maxCombo) setMaxCombo(nc);
      return nc;
    });
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), effectiveComboDuration);
  };

  // ==== Клик ====
  const handleBallClick = () => {
  bumpCombo();
  const comboMultiplier = Math.min(1 + combo * 0.01, 2);
  const isCrit = Math.random() < effectiveCritChance;
  const critMultiplier = isCrit ? 5 : 1;
  const gain = Math.floor(effectiveClickPower * comboMultiplier * critMultiplier * prestigeMultiplier * daily.multiplier);

  setPoints((p) => p + gain);
  setTotalPoints((t) => t + gain);
  setTotalClicks((c) => c + 1);

  if (isCrit) {
    // Увеличиваем счётчик критов
    const newCrits = totalCrits + 1;
    setTotalCrits(newCrits);

    // Показываем тост только на 1-м и каждом 10-м крите
    if (newCrits === 1) {
      sound.crit();
      speak(PET_PHRASES.onCrit);
      pushToast({
        icon: '✨',
        title: `ПЕРВЫЙ КРИТ!`,
        desc: `+${gain} · ×5 урона`,
        type: 'crit',
      });
    } else if (newCrits % 10 === 0) {
      sound.crit();
      speak(PET_PHRASES.onCrit);
      pushToast({
        icon: '💀',
        title: `${newCrits} КРИТОВ!`,
        desc: `+${gain} · ×5 урона`,
        type: 'crit',
      });
    } else {
      // Обычный крит — только звук, без тоста
      sound.crit();
    }
  } else {
    sound.click();
    if (Math.random() < 0.05) {
      speak(PET_PHRASES.onIdleClick);
    }
  }
};

  // ==== Прокачка клика ====
  const upgradeClick = () => {
    const cost = getClickUpgradeCost();
    if (points < cost) return;
    setPoints((p) => p - cost);
    setClickLevel((l) => l + 1);
    setClickPower((cp) => cp + 1);
    sound.upgrade();
    if (Math.random() < 0.3) speak(PET_PHRASES.onUpgradeClick);
  };

  // ==== Кормление ====
  const feedPet = () => {
    const cost = getPetFeedCost();
    if (points < cost) return;
    setPoints((p) => p - cost);
    sound.upgrade();
    speak(PET_PHRASES.onFeed);

    setPet((prev) => {
      const newXp = prev.xp + effectivePetXp;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      let newStage = prev.stage;
      let newName = prev.name;

      if (newXp >= prev.xpToNext) {
        newLevel += 1;
        newXpToNext = Math.floor(prev.xpToNext * 1.5);
        if (newLevel >= 10) newStage = 'adult';
        else if (newLevel >= 5) newStage = 'teen';
        if (newStage === 'teen' && prev.stage === 'baby') newName = 'Тень';
        if (newStage === 'adult' && prev.stage === 'teen') newName = 'Дракон';
        setAutoClickPerSec((a) => a + 1);
        return { ...prev, level: newLevel, xp: 0, xpToNext: newXpToNext, stage: newStage, name: newName };
      }
      return { ...prev, xp: newXp };
    });
  };

  // ==== Магазин ====
  const buyShopItem = (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    const level = shopLevels[itemId] || 0;
    if (level >= item.maxLevel) return;
    const cost = getShopCost(item, level);
    if (points < cost) return;
    setPoints((p) => p - cost);
    setShopLevels((prev) => ({ ...prev, [itemId]: level + 1 }));
    sound.upgrade();
    pushToast({ icon: item.icon, title: item.name, desc: `Уровень ${level + 1}`, type: 'achievement' });
  };

  // ==== Престиж ====
  const doPrestige = () => {
    const required = 50000 * Math.pow(3, prestige);
    if (totalPoints < required) return;
    if (!window.confirm('Престиж сбросит прогресс (кроме престижа, скинов и достижений). Продолжить?')) return;
    setPrestige((p) => p + 1);
    setPoints(0);
    setTotalPoints(0);
    setClickPower(1);
    setClickLevel(1);
    setAutoClickPerSec(0);
    setShopLevels({});
    setPet({ level: 1, xp: 0, xpToNext: 10, name: 'Призрак', stage: 'baby' });
    setCombo(0);
    sound.prestige();
    speak(PET_PHRASES.onPrestige);
    pushToast({ icon: '⟳', title: `ПРЕСТИЖ ${prestige + 1}`, desc: 'Доход +25%!', type: 'prestige' });
  };

  // ==== Рыбалка ====
  const handleFishCatch = (xp) => {
    setPet((prev) => {
      const newXp = prev.xp + xp;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      let newStage = prev.stage;
      let newName = prev.name;
      if (newXp >= prev.xpToNext) {
        newLevel += 1;
        newXpToNext = Math.floor(prev.xpToNext * 1.5);
        if (newLevel >= 10) newStage = 'adult';
        else if (newLevel >= 5) newStage = 'teen';
        if (newStage === 'teen' && prev.stage === 'baby') newName = 'Тень';
        if (newStage === 'adult' && prev.stage === 'teen') newName = 'Дракон';
        setAutoClickPerSec((a) => a + 1);
        return { ...prev, level: newLevel, xp: 0, xpToNext: newXpToNext, stage: newStage, name: newName };
      }
      return { ...prev, xp: newXp };
    });
    sound.achievement();
    pushToast({ icon: '🐟', title: `+${xp} XP`, desc: 'Питомец накормлен', type: 'info' });
  };

  // ==== Достижения ====
  useEffect(() => {
    checkAchievements({
      unlocked: achievements,
      stats: { totalClicks, totalPoints, petLevel: pet.level, clickLevel, maxCombo, totalCrits },
      onUnlock: (id) => {
        setAchievements((prev) => [...prev, id]);
        const a = ALL_ACHIEVEMENTS.find((x) => x.id === id);
        pushToast({ icon: a.icon, title: 'ДОСТИЖЕНИЕ!', desc: a.name, type: 'achievement' });
        sound.achievement();
        speak(PET_PHRASES.onAchievement);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalClicks, totalPoints, pet.level, clickLevel, maxCombo, totalCrits, achievements]);

  // ==== Рендер контента таба ====
  const renderTabContent = () => {
    switch (activeTab) {
      case 'upgrades':
        return <UpgradePanel clickLevel={clickLevel} clickPower={Math.floor(effectiveClickPower)} cost={getClickUpgradeCost()} points={points} onUpgrade={upgradeClick} />;
      case 'pet':
        return <PetPanel pet={pet} cost={getPetFeedCost()} points={points} onFeed={feedPet} />;
      case 'shop':
        return <ShopPanel shopLevels={shopLevels} points={points} onBuy={buyShopItem} />;
      case 'skins':
        return <SkinSelector prestige={prestige} selected={selectedSkin} onSelect={setSelectedSkin} />;
      case 'fishing':
        return <FishingGame onCatch={handleFishCatch} />;
      case 'stats':
        return <StatsPanel {...stats} totalPoints={totalPoints} totalClicks={totalClicks} playtime={playtime} />;
      case 'ach':
        return <Achievements unlocked={achievements} />;
      case 'prestige':
        return <PrestigePanel totalPoints={totalPoints} prestige={prestige} onPrestige={doPrestige} />;
      default:
        return null;
    }
  };

  // Обработчик выбора таба
  const handleTabSelect = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false); // авто-закрытие на мобилке
  };

  return (
    <div className={`app ${eyeSleeping ? 'sleeping' : ''} skin-${selectedSkin}`}>
      <div className="grid-bg"></div>
      <Weather weather={weather} timeOfDay={timeOfDay} />
      <div className="scanlines"></div>

      <Toast toasts={toasts} onRemove={removeToast} />
      <AmbientToggle enabled={ambient.enabled} onToggle={ambient.toggle} />

      <header className="header">
        {/* Бургер — только на мобилке */}
        <button
          className="burger-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Открыть меню"
        >
          ☰
        </button>

        <h1 className="title">MONOCHROME CLICKER</h1>

        <div className="stats">
          <div className="stat">
            <span className="stat-label">ОЧКИ</span>
            <span className="stat-value">{points.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">КЛИК</span>
            <span className="stat-value">+{Math.floor(effectiveClickPower)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">АВТО/СЕК</span>
            <span className="stat-value">+{Math.floor(effectiveAutoClick * effectiveAutoMultiplier)}</span>
          </div>
        </div>
      </header>

      <main className="game-area">
        {/* ЛЕВАЯ ПАНЕЛЬ — только десктоп */}
        <aside className="panel-left">
          <DailyBonus daily={daily} onClaim={() => {
            daily.claim();
            pushToast({ icon: '🎁', title: 'БОНУС АКТИВЕН!', desc: '×10 к клику на час', type: 'achievement' });
            sound.achievement();
          }} />
          <div className="tabs desktop-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>
          <div className="tab-content desktop-content">
            {renderTabContent()}
          </div>
        </aside>

        {/* ЦЕНТР: питомец + глаз */}
        <section className="center-stage">
          <div className="pet-wrap">
            <PetBubble text={petSpeech} />
            <Pet pet={pet} sleeping={eyeSleeping} />
          </div>
          <ClickerBall
            onClick={handleBallClick}
            clickPower={Math.floor(effectiveClickPower)}
            onSleepChange={setEyeSleeping}
            combo={combo}
            skin={currentSkin}
          />

          {/* МОБИЛЬНАЯ ПАНЕЛЬ КОНТЕНТА — внизу под глазом */}
          <div className="mobile-content">
            {renderTabContent()}
          </div>
        </section>
      </main>

      {/* МОБИЛЬНОЕ МЕНЮ — выезжающая панель */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">МЕНЮ</span>
          <button
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="mobile-drawer-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`mobile-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => handleTabSelect(t.id)}
            >
              <span className="mobile-tab-icon">{t.icon}</span>
              <span className="mobile-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        <DailyBonus daily={daily} onClaim={() => {
          daily.claim();
          pushToast({ icon: '🎁', title: 'БОНУС АКТИВЕН!', desc: '×10 к клику на час', type: 'achievement' });
          sound.achievement();
        }} />
      </aside>

      <footer className="footer">
        <span>ВСЕГО: {totalPoints.toLocaleString()}</span>
        <button
          className="reset-btn"
          onClick={() => {
            if (window.confirm('Сбросить ВЕСЬ прогресс?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          ⟳ СБРОС
        </button>
      </footer>
    </div>
  );
}

export default App;
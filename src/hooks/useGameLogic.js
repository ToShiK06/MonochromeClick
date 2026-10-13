

// Утилита: проверка достижений
export function checkAchievements({
  unlocked,
  stats,
  onUnlock,
}) {
  const rules = [
    { id: 'first_click',  cond: () => stats.totalClicks >= 1 },
    { id: 'click_100',    cond: () => stats.totalClicks >= 100 },
    { id: 'click_1000',   cond: () => stats.totalClicks >= 1000 },
    { id: 'points_1k',    cond: () => stats.totalPoints >= 1000 },
    { id: 'points_10k',   cond: () => stats.totalPoints >= 10000 },
    { id: 'pet_lv5',      cond: () => stats.petLevel >= 5 },
    { id: 'pet_lv10',     cond: () => stats.petLevel >= 10 },
    { id: 'upgrade_10',   cond: () => stats.clickLevel >= 10 },
    { id: 'combo_50',     cond: () => stats.maxCombo >= 50 },
    { id: 'crit_first',   cond: () => stats.totalCrits >= 1 },
  ];

  rules.forEach((r) => {
    if (!unlocked.includes(r.id) && r.cond()) {
      onUnlock(r.id);
    }
  });
}
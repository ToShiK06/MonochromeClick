import { useState, useEffect } from 'react';

const WEATHERS = ['clear', 'fog', 'rain', 'storm'];

export function useWeather() {
  const [weather, setWeather] = useState('clear');
  const [timeOfDay, setTimeOfDay] = useState('night');

  useEffect(() => {
    // Время суток — по реальному времени
    const updateTime = () => {
      const h = new Date().getHours();
      if (h >= 5 && h < 11) setTimeOfDay('dawn');
      else if (h >= 11 && h < 17) setTimeOfDay('day');
      else if (h >= 17 && h < 21) setTimeOfDay('dusk');
      else setTimeOfDay('night');
    };
    updateTime();
    const timeInt = setInterval(updateTime, 60000);

    // Погода — меняется раз в 2-4 минуты
    const scheduleWeather = () => {
      const delay = 120000 + Math.random() * 120000;
      return setTimeout(() => {
        const w = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
        setWeather(w);
        scheduleWeather();
      }, delay);
    };
    const weatherTimeout = scheduleWeather();

    return () => {
      clearInterval(timeInt);
      clearTimeout(weatherTimeout);
    };
  }, []);

  return { weather, timeOfDay };
}
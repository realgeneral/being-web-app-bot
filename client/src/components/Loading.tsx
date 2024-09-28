import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png'; // Убедитесь, что путь к логотипу верный

const Loading: React.FC = () => {
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  useEffect(() => {
    // Запускаем эффект плавного появления после монтирования компонента
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100); // Небольшая задержка для плавности анимации

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div
        className={`w-72 h-72 relative transition-opacity duration-[3000ms] ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Сияние */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-yellow-500 opacity-70 blur-[50px]"></div>
        </div>

        {/* Логотип */}
        <img
          src={logo}
          alt="Loading"
          className="w-full h-full relative rounded-full"
        />
      </div>
    </div>
  );
};

export default Loading;

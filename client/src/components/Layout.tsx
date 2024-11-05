import React, { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';

interface LayoutProps {
  children: ReactNode;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [points, setPoints] = useState(user.points);
  const location = useLocation();
  const ADMIN_IDS = [7154683616];
  const isAdmin = ADMIN_IDS.includes(user.telegram_id);

  // Функция для получения актуального количества поинтов пользователя
  const fetchUserPoints = async () => {
    try {
      const response = await axios.get(`/api/users/${user.id}`, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
      });
      setPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Обновление данных при каждом изменении маршрута
  useEffect(() => {
    fetchUserPoints();
  }, [location.pathname]);

  // Функция обновления поинтов для дочерних компонентов
  const updatePoints = async () => {
    await fetchUserPoints();
  };

  return (
    <div className="relative h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-4 bg-black z-10">
        <div className="text-2xl font-bold text-yellow-500">BEING BOT</div>
        <div className="flex items-center bg-gray-800 p-3 rounded-md shadow-md space-x-2">
          <span className="text-sm font-bold text-yellow-500">{points}</span>
          <span className="text-sm text-gray-300">Points</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="absolute top-16 bottom-14 left-0 right-0 overflow-y-auto">
        {/* Передаем updatePoints в дочерние компоненты через props */}
        {React.cloneElement(children as React.ReactElement, { updatePoints })}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 h-14 bg-black flex justify-around items-center px-4 z-10">
        <NavLink to="/" className="text-center flex flex-col items-center min-w-[60px] text-yellow-500">
          <div>🏠</div>
          <span>Home</span>
        </NavLink>
        <NavLink to="/earn" className="text-center flex flex-col items-center min-w-[60px] text-yellow-500">
          <div>💰</div>
          <span>Earn</span>
        </NavLink>
        <NavLink to="/mytask" className="text-center flex flex-col items-center min-w-[60px] text-yellow-500">
          <div>{isAdmin ? '📊' : '📋'}</div>
          <span>{isAdmin ? 'Stats' : 'MyTask'}</span>
        </NavLink>
        <NavLink to="/wallet" className="text-center flex flex-col items-center min-w-[60px] text-yellow-500">
          <div>💼</div>
          <span>Wallet</span>
        </NavLink>
      </footer>
    </div>
  );
};

export default Layout;

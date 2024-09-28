// src/pages/Earn.tsx
import React from 'react';

// Определяем интерфейс для пропсов, принимаемых компонентом Earn
interface EarnProps {
  user: any; // Измените `any` на конкретный тип, если известен, например: { name: string; points: number }
}

const Earn: React.FC<EarnProps> = ({ user }) => {
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-16 w-full flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">Earn</h1>
        <span className="text-sm">@{user.name}: {user.points} Points</span> {/* Используем данные из user */}
      </header>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <button
              key={item}
              className="border-2 border-white p-2 rounded text-center w-12 h-12 hover:bg-gray-700"
            >
              {item}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-lg">Earn rewards by completing tasks!</p>
      </div>
    </div>
  );
};

export default Earn;

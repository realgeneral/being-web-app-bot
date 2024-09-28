// src/pages/MyTask.tsx
import React from 'react';

// Определяем интерфейс для пропсов, принимаемых компонентом MyTask
interface MyTaskProps {
  user: {
    name: string;
    points: number;
  }; // Укажите точные типы полей пользователя, если они известны
}

const MyTask: React.FC<MyTaskProps> = ({ user }) => {
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-16 w-full flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">My Task</h1>
        <span className="text-sm">@{user.name}: {user.points} Points</span> {/* Используем данные из user */}
      </header>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex justify-center mt-4 gap-4 w-full">
          <button className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition">
            New Task
          </button>
          <button className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition">
            Archive
          </button>
        </div>
        <p className="mt-6 text-center text-lg">You don't have any active tasks</p>
      </div>
    </div>
  );
};

export default MyTask;

import React, { useState } from 'react';
import axios from 'axios';

interface MyTaskProps {
  user: {
    id: number;
    telegram_id: number;
    username: string;
    first_name: string;
    last_name: string;
    points: number;
  };
}

const MyTask: React.FC<MyTaskProps> = ({ user }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    task_type_id: 1,
    name: '',
    description: '',
    link: '',
    total_clicks: 1,
    reward_points: 1,
    is_premium_only: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const API_BASE_URL = 'https://0f24-89-248-191-104.ngrok-free.app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Отправляем данные на бэкенд
       const response = await axios.post(`${API_BASE_URL}/api/task/create`, formData, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(), // Добавляем заголовок с telegram_id
        },
      });
      console.log('Task created:', response.data);
      // Очистка формы и закрытие
      setFormData({
        task_type_id: 1,
        name: '',
        description: '',
        link: '',
        total_clicks: 1,
        reward_points: 1,
        is_premium_only: false,
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      // Обработка ошибки, например, отображение сообщения пользователю
      alert('Error creating task: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-16 w-full flex justify-between items-center px-4 bg-black text-white">
        <h1 className="text-2xl font-bold">My Task</h1>
        <span className="text-sm">@{user.username}: {user.points} Points</span>
      </header>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex justify-center mt-4 gap-4 w-full">
          <button
            className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition"
            onClick={() => setShowForm(true)}
          >
            New Task
          </button>
          <button className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition">
            Archive
          </button>
        </div>

        {/* Форма создания задания */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md">
            {/* Тип задания */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Task Type</label>
              <select
                name="task_type_id"
                value={formData.task_type_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
              >
                <option value={1}>Bot</option>
                <option value={2}>Subscribe to Channel</option>
                {/* Добавьте другие типы задач при необходимости */}
              </select>
            </div>
            {/* Название */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
                placeholder="Enter task name"
                required
              />
            </div>
            {/* Описание */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            {/* Ссылка */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
                placeholder="https://example.com"
                required
              />
            </div>
            {/* Количество кликов */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Total Clicks</label>
              <input
                type="number"
                name="total_clicks"
                value={formData.total_clicks}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
                min={1}
                required
              />
            </div>
            {/* Награда за клик */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Reward Points per Click</label>
              <input
                type="number"
                name="reward_points"
                value={formData.reward_points}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-black text-white"
                min={1}
                required
              />
            </div>
            {/* Только для премиум-пользователей */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="is_premium_only"
                checked={formData.is_premium_only}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm">Premium Users Only</label>
            </div>
            {/* Кнопки управления */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-800 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <p className="mt-6 text-center text-lg">You don't have any active tasks</p>
        )}
      </div>
    </div>
  );
};

export default MyTask;

// AdminStatistics.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AdminStatisticsProps {
  user: {
    telegram_id: number;
  };
}

interface StatisticsData {
  tasks_today: number;
  total_users: number;
}

const AdminStatistics: React.FC<AdminStatisticsProps> = ({ user }) => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  const API_BASE_URL = 'https://nollab.ru:8000'; // Замените на ваш API URL

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/statistics`, {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        });
        setStatistics(response.data);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      }
    };

    fetchStatistics();
  }, [user.telegram_id]);

  const exportUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/export-users`, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
        responseType: 'blob', // Важно для загрузки файла
      });

      // Создаем ссылку для загрузки файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при экспорте пользователей:', error);
    }
  };

  if (!statistics) {
    return <div className="p-4">Загрузка статистики...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Статистика администратора</h2>
      <div className="mb-4">
        <p>Задач размещено сегодня: <strong>{statistics.tasks_today}</strong></p>
        <p>Общее количество пользователей: <strong>{statistics.total_users}</strong></p>
      </div>
      <button
        onClick={exportUsers}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Экспорт пользователей в XLSX
      </button>
    </div>
  );
};

export default AdminStatistics;

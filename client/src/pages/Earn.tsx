// frontend/src/components/Earn.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTelegramPlane } from 'react-icons/fa'; // Иконка Телеграмма
import { Tab } from '@headlessui/react'; // Для вкладок
import classNames from 'classnames';

interface Task {
  id: number;
  task_type_id: number;
  name: string;
  description: string;
  link: string;
  total_clicks: number;
  completed_clicks: number;
  reward_points: number;
  is_premium_only: boolean; // Новое поле
}

interface EarnProps {
  user: {
    id: number;
    telegram_id: number;
    username: string;
    first_name: string;
    last_name: string;
    points: number;
  };
}

const API_BASE_URL = 'http://localhost:8000';

const sendLogToServer = (message: string) => {
  axios
    .post(`${API_BASE_URL}/api/logs`, { message })
    .then((response) => {
      console.log('Log sent successfully:', response.data);
    })
    .catch((error) => {
      console.error('Failed to send log:', error);
    });
};


const Earn: React.FC<EarnProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Для отображения ошибок

  useEffect(() => {
    const fetchTasks = async () => {
      sendLogToServer(`Fetching tasks for task_type_id=${activeTab}`); // Логирование
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Task[]>(`${API_BASE_URL}/api/task/get_tasks`, {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
          params: {
            task_type_id: activeTab,
          },
        });
        sendLogToServer('Received response:' + response.data); // Логирование
        setTasks(response.data);
      } catch (error: any) {
        console.error('Ошибка при получении задач:', error);
        setError('Не удалось загрузить задачи. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user.telegram_id, activeTab, refresh]);

  const handleLinkClick = async (task: Task) => {
    // Открываем ссылку в новой вкладке с безопасными параметрами
    window.open(task.link, '_blank', 'noopener,noreferrer');

    // Показать анимацию ожидания (можно реализовать дополнительным состоянием)
    // Здесь мы просто ждем 10 секунд
    await new Promise(resolve => setTimeout(resolve, 10000));

    // После ожидания обновляем список задач
    setRefresh(prev => !prev);
  };

  const tabs = [
    { id: 1, title: '1' },
    { id: 2, title: '2' },
    { id: 3, title: '3' },
    { id: 4, title: '4' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <div className="px-4">
            <h2 className="text-xl font-bold mb-2">Become a Friend</h2>
            <p className="text-sm text-gray-400 mb-4">
              Become your friend's referral. Click on the link and wait for the bot to fully load to complete the task.
            </p>
            {loading ? (
              <p className="text-center text-white">Loading tasks...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-white">No tasks available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="bg-gray-800 p-4 rounded flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaTelegramPlane className={`text-blue-500 text-2xl ${task.is_premium_only ? 'text-yellow-500' : ''}`} />
                      <div>
                        <h3 className="text-lg font-semibold">{task.name}</h3>
                        {task.is_premium_only && (
                          <span className="text-xs text-yellow-500">Premium</span> // Отображение премиум статуса
                        )}
                        <p className="text-gray-400">{task.description}</p>
                        <p className="text-yellow-500">Reward: +{task.reward_points} Points</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLinkClick(task)}
                      className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Click
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="px-4">
            <h2 className="text-xl font-bold mb-2">Subscribe to Channel</h2>
            <p className="text-sm text-gray-400">Feature coming in the next version.</p>
          </div>
        );
      case 3:
        return (
          <div className="px-4">
            <h2 className="text-xl font-bold mb-2">Vote for Channel Rating</h2>
            <p className="text-sm text-gray-400">Feature coming in the next version.</p>
          </div>
        );
      case 4:
        return (
          <div className="px-4">
            <h2 className="text-xl font-bold mb-2">Watch Videos</h2>
            <p className="text-sm text-gray-400">Feature coming in the next version.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-black text-white">
      {/* Заголовок с именем пользователя и балансом */}
      <header className="flex-none h-16 w-full flex justify-between items-center px-6 bg-black border-b border-gray-700">
        <h1 className="text-2xl font-bold">EARN</h1>
        <div className="text-sm">
          @{user.username}: {user.points} Points
        </div>
      </header>

      {/* Вкладки */}
      <Tab.Group
        selectedIndex={activeTab - 1}
        onChange={(index) => {
          console.log(`Switching to tab ${index + 1}`); // Логирование
          setActiveTab(index + 1);
        }}
      >
        <Tab.List className="flex justify-center mt-4 space-x-2">
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                classNames(
                  'w-10 h-10 flex items-center justify-center rounded-full border',
                  selected ? 'bg-yellow-500 border-yellow-600' : 'bg-gray-700 border-gray-600',
                  'cursor-pointer'
                )
              }
            >
              {tab.title}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6 flex-1 overflow-auto">
          {tabs.map(tab => (
            <Tab.Panel key={tab.id}>{renderTabContent()}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Earn;
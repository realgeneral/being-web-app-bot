import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTelegramPlane, FaCheckCircle } from 'react-icons/fa'; // Иконки
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
  reward_per_click: number;
  is_premium_only: boolean;
  is_completed?: boolean; // Новое поле для отметки выполнения
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

const API_BASE_URL = 'https://c915-89-248-191-104.ngrok-free.app';

const sendLogToServer = (message: string) => {
  axios
    .post(`${API_BASE_URL}/api/logs/`, { message })
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
  const [error, setError] = useState<string | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      if (!isMounted) return;

      sendLogToServer(`Fetching tasks for task_type_id=${activeTab}`);
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<Task[]>(`${API_BASE_URL}/api/task/get_tasks_with_type`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'X-Telegram-ID': user.telegram_id.toString(),
          },
          params: {
            task_type_id: activeTab,
          },
        });
        if (isMounted) {
          sendLogToServer('Received response: ' + JSON.stringify(response.data));
          setTasks(response.data);
        }
      } catch (error: any) {
        if (isMounted) {
          if (error.response) {
            sendLogToServer(`Error fetching tasks: ${error.response.status} ${error.response.statusText}`);
          } else if (error.request) {
            sendLogToServer('Error: No response received from server.');
          } else {
            sendLogToServer(`Error: ${error.message}`);
          }
          setError('Failed to load tasks. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [user.telegram_id, activeTab, refresh]);

  const handleLinkClick = async (task: Task) => {
    const newWindow = window.open(task.link, '_blank', 'noopener,noreferrer');
    setLoadingTaskId(task.id);
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const response = await axios.post(`${API_BASE_URL}/api/task/claim_task`, { task_id: task.id }, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
      });
      console.log('Task claimed successfully:', response.data);

      // Отмечаем задачу как завершенную
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? { ...t, is_completed: true } : t))
      );
    } catch (error) {
      console.error('Error claiming task:', error);
    } finally {
      setLoadingTaskId(null);
    }

  };

  const tabs = [
    { id: 1, title: 'Affiliate Links or Bots' },
    { id: 2, title: 'Subscribe to Channel' },
    { id: 3, title: 'Vote for Channel Rating' },
    { id: 4, title: 'Watch Videos' },
  ];

  const renderTabContent = () => {
    if (loading) {
      return <p className="text-center text-white">Loading tasks...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    if (tasks.length === 0) {
      return <p className="text-center text-white">No tasks available at the moment.</p>;
    }

    return (
      <div className="space-y-4 px-5 text-xs">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded flex items-center justify-between ${task.is_completed ? 'bg-gray-600' : 'bg-gray-800'}`}
          >
            <div className="flex items-center space-x-3">
              <FaTelegramPlane className={`text-blue-500 text-base ${task.is_premium_only ? 'text-yellow-500' : ''}`} />
              <div className=''>
                <h3 className={`text-base font-semibold ${task.is_completed ? 'text-gray-400' : ''}`}>{task.name}</h3>
                {task.is_premium_only && (
                  <span className="text-xs text-yellow-500">Premium</span>
                )}
                <p className="text-gray-400">{task.description}</p>
                <p className="text-yellow-500">Reward: +{task.reward_per_click} Points</p>
              </div>
            </div>
            {loadingTaskId === task.id ? (
              <div className="loader"></div> // Анимация загрузки
            ) : task.is_completed ? (
              <FaCheckCircle className="text-green-500 text-2xl" /> // Галочка после выполнения
            ) : (
              <button
                onClick={() => handleLinkClick(task)}
                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                Click
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-black text-white">
      {/* Заголовок с именем пользователя и балансом */}
      <header className="flex-none h-10 w-full flex justify-between items-center px-6 bg-black border-b border-gray-700">
        <h1 className="text-2xl font-bold">EARN</h1>

      </header>

      {/* Вкладки */}
      <Tab.Group
        selectedIndex={activeTab - 1}
        onChange={(index) => setActiveTab(index + 1)}
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
              {tab.id}
            </Tab>
          ))}
        </Tab.List>

        {/* Описание вкладок */}
        <div className="mt-2 text-center text-sm text-gray-400">
          {tabs[activeTab - 1].title}
        </div>

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

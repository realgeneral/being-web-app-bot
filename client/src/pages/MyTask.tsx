import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import { FaTelegramPlane } from 'react-icons/fa'; // Иконка Телеграмма

interface MyTaskProps {
  user: {
    id: number;
    telegram_id: number;
    username: string;
    first_name: string;
    last_name: string;
    points: number;
  };
  updatePoints: () => void; // Передаем функцию обновления

}

interface Task {
  id: number;
  name: string;
  link: string;
  total_clicks: number;
  completed_clicks: number;
  reward_per_click: number;
  status_id: number;
}

const MyTask: React.FC<MyTaskProps> = ({ user, updatePoints }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const location = useLocation(); // Хук для отслеживания текущего пути

  const [formData, setFormData] = useState({
    task_type_id: 1,
    name: '',
    link: '',
    total_clicks: 1,
    reward_per_click: 1,
    status_id: 1, // Добавил поле status_id
  });
  const [isArchivedView, setIsArchivedView] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для хранения текста ошибки
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false); // Состояние для видимости алерта

  const API_BASE_URL = 'https://nollab.ru:8000';

  // Вызов функции обновления баланса при переходе на эту страницу
  useEffect(() => {
    // Проверяем, что пользователь находится на этой странице
    if (location.pathname === '/mytask') {
      updatePoints(); // Выполняем проверку баланса при входе на страницу
    }
  }, [location.pathname, updatePoints]); // Перезапускаем эффект при изменении пути

    // Добавляем эффект для автоматического переключения темы
    useEffect(() => {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, []);

  // Функция для загрузки активных задач пользователя
  const fetchActiveTasks = async () => {
    try {
      const response = await axios.get<Task[]>(
        `${API_BASE_URL}/api/task/get_active_tasks`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        }
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка при получении активных задач:', error);
    }
  };

  // Функция для загрузки архивных задач пользователя
  const fetchArchivedTasks = async () => {
    try {
      const response = await axios.get<Task[]>(
        `${API_BASE_URL}/api/task/get_archived_tasks`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        }
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка при получении архивных задач:', error);
    }
  };

  // Функция для завершения задачи
  const handleFinishTask = async (taskId: number) => {
    const isConfirmed = window.confirm(
      'Вы уверены, что хотите завершить это задание?'
    );
    if (!isConfirmed) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/task/finish_task`,
        { task_id: taskId },
        {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        }
      );
      console.log('Задание успешно завершено:', response.data);
      updatePoints();
      fetchActiveTasks(); // Обновляем список задач
    } catch (error) {
      console.error('Ошибка при завершении задания:', error);
    }
  };

  // Загрузка активных или архивных задач при рендере компонента
  useEffect(() => {
    // Очищаем задачи при изменении вида
    setTasks([]);
    if (!isArchivedView) {
      fetchActiveTasks(); // Загрузить активные задачи при загрузке страницы
    } else {
      fetchArchivedTasks(); // Загрузить архивные задачи, если включен режим просмотра архива
    }
  }, [user.telegram_id, isArchivedView]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'task_type_id' ||
        name === 'total_clicks' ||
        name === 'reward_per_click' ||
        name === 'status_id'
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/task/create`,
        formData,
        {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        }
      );
      console.log('Задание создано:', response.data);
      setShowForm(false);
      setErrorMessage(null);
      fetchActiveTasks();
    } catch (error: any) {
      console.error('Ошибка при создании задания:', error);
      setErrorMessage(
        'ERROR: ' +
          (error.response?.data?.detail || ' ')
      );
      setIsAlertVisible(true); // Показать алерт при ошибке
      setTimeout(() => {
        setIsAlertVisible(false); // Скрыть алерт через 5 секунд
      }, 5000);
    }
  };

  const formatLink = (link: string) => {
    const formattedLink = link.replace('https://t.me/', '@');
    return formattedLink.slice(0, 5); // Обрезает строку до первых 5 символов
  };

  const getStatusLabel = (status_id: number) => {
    switch (status_id) {
      case 2:
        return { text: 'Completed', color: 'bg-green-500' };
      case 3:
        return { text: 'Finished', color: 'bg-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full relative">
      {/* Алерт-уведомление */}
      {isAlertVisible && errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-yellow-500 text-black font-semibold py-3 px-6 rounded shadow-lg border border-black">
          <p>{errorMessage}</p>
          <button
            className="mt-2 text-sm text-yellow-800 underline"
            onClick={() => setIsAlertVisible(false)}
          >
            Close
          </button>
        </div>
      )}
      {/* Заголовок страницы */}
      <header className="flex-none h-10 w-full flex justify-between items-center px-4 bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {isArchivedView ? 'MY ARCHIVE TASKS' : 'MY ACTIVE TASKS'}
        </h1>
      </header>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-center mt-4 gap-4 w-full">
          {!isArchivedView && (
            <button
              className="bg-gray-200 dark:bg-gray-800 border border-black dark:border-white px-4 py-2 rounded hover:bg-yellow-500 transition text-black dark:text-white"
              onClick={() => setShowForm(true)}
            >
              Create new task
            </button>
          )}
          <button
            className="bg-gray-200 dark:bg-gray-800 border border-black dark:border-white px-4 py-2 rounded hover:bg-yellow-500 transition text-black dark:text-white"
            onClick={() => setIsArchivedView(!isArchivedView)}
          >
            {isArchivedView ? 'My active tasks' : 'My archive tasks'}
          </button>
        </div>

        {/* Форма создания задания */}
        {showForm && !isArchivedView && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 w-full max-w-md bg-gray-100 dark:bg-gray-800 p-5 rounded"
          >
            <div className="mb-4">
              <label
                className="block text-black dark:text-white text-sm font-bold mb-2"
                htmlFor="task_type_id"
              >
                Type
              </label>
              <select
                name="task_type_id"
                id="task_type_id"
                value={formData.task_type_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-black text-black dark:text-white rounded"
                required
              >
                <option value={1}>BOT (Affiliate Link)</option>
                <option value={2}>CHANNEL (Subscribe and react)</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-black dark:text-white text-sm font-bold mb-2"
                htmlFor="name"
              >
                Task name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-black text-black dark:text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-black dark:text-white text-sm font-bold mb-2"
                htmlFor="link"
              >
                Link (starting with https://t.me/...)
              </label>
              <input
                type="text"
                name="link"
                id="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-black text-black dark:text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-black dark:text-white text-sm font-bold mb-2"
                htmlFor="total_clicks"
              >
                Total clicks
              </label>
              <input
                type="number"
                name="total_clicks"
                id="total_clicks"
                value={formData.total_clicks}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-black text-black dark:text-white rounded"
                min="10"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-black dark:text-white text-sm font-bold mb-2"
                htmlFor="reward_per_click"
              >
                Points per click
              </label>
              <input
                type="number"
                name="reward_per_click"
                id="reward_per_click"
                value={formData.reward_per_click}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-black text-black dark:text-white rounded"
                min="10"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
              >
                Create
              </button>
              <button
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Список задач */}
        <div className="w-full max-w-4xl mt-6">
          {tasks.length === 0 ? (
            <p className="text-center text-black dark:text-white">
              You don't have any {isArchivedView ? 'archive' : 'active'} tasks
            </p>
          ) : (
            <div className="space-y-4 px-5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-100 dark:bg-gray-800 p-5 rounded flex items-center justify-between h-20"
                >
                  <div className="flex items-center space-x-3">
                    <FaTelegramPlane className="text-blue-500 text-base" />
                    <div className="text-sm text-black dark:text-white">
                      <h3 className="font-semibold">{task.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {task.reward_per_click} Points per click
                      </p>
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        {formatLink(task.link)}
                      </a>
                    </div>

                    {/* Отображение статуса задания для архивных задач */}
                    {isArchivedView && (
                      <div
                        className={`ml-1 px-1 py-1 rounded text-white ${getStatusLabel(
                          task.status_id
                        ).color}`}
                      >
                        {getStatusLabel(task.status_id).text}
                      </div>
                    )}
                  </div>
                  <span className="text-xl font-bold text-yellow-500">
                    {task.completed_clicks} / {task.total_clicks}
                  </span>
                  {!isArchivedView && (
                    <div className="flex items-right">
                      <button
                        className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 transition"
                        onClick={() => handleFinishTask(task.id)}
                      >
                        Stop
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTask;
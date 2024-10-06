import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
}

interface Task {
  id: number;
  name: string;
  link: string;
  total_clicks: number;
  completed_clicks: number;
  reward_per_click: number;
  status_id: number; // Add this line
}

const MyTask: React.FC<MyTaskProps> = ({ user }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    task_type_id: 1,
    name: '',
    link: '',
    total_clicks: 1,
    reward_per_click: 1,
  });
  const [isArchivedView, setIsArchivedView] = useState<boolean>(false); // Добавляем состояние для переключения между активными и архивными задачами

  const API_BASE_URL = 'https://c915-89-248-191-104.ngrok-free.app';

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
      console.error('Error fetching active tasks:', error);
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
      console.error('Error fetching archived tasks:', error);
    }
  };

  // Функция для завершения задачи
  const handleFinishTask = async (taskId: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to complete this task?'
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
      console.log('Task finished successfully:', response.data);
      fetchActiveTasks(); // Обновляем список задач
    } catch (error) {
      console.error('Error finishing task:', error);
    }
  };

  // Загрузка активных задач при рендере компонента
  useEffect(() => {
    // Clear tasks when view changes
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
      [name]: value,
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
      console.log('Task created:', response.data);
      setShowForm(false);
      fetchActiveTasks(); // Обновляем список задач после создания новой
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert(
        'Error creating task: ' +
          (error.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const formatLink = (link: string) => {
    return link.replace('https://t.me/', '@');
  };

  const getStatusLabel = (status_id: number) => {
    switch (status_id) {
      case 2:
        return { text: 'Completed', color: 'bg-green-500' };
      case 3:
        return { text: 'Stopped', color: 'bg-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-10 w-full flex justify-between items-center px-4 bg-black border-b border-gray-700">
        <h1 className="text-2xl font-bold">
          {isArchivedView ? 'Archived Tasks' : 'My Active Tasks'}
        </h1>
      </header>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col ">
        <div className="flex justify-center mt-4 gap-4 w-full">
          {!isArchivedView && (
            <button
              className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition"
              onClick={() => setShowForm(true)}
            >
              Create New Task
            </button>
          )}
          <button
            className="bg-gray-800 border border-white px-4 py-2 rounded hover:bg-yellow-500 transition"
            onClick={() => setIsArchivedView(!isArchivedView)} // Переключаем вид между архивными и активными задачами
          >
            {isArchivedView ? 'View Active Tasks' : 'Archive Tasks'}
          </button>
        </div>

        {/* Форма создания задания */}
        {showForm && !isArchivedView && (
          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md">
            {/* Form Fields */}
            {/* ... (same as before) */}
          </form>
        )}

        {/* Список активных или архивных задач */}
        <div className="w-full max-w-4xl mt-6">
          {tasks.length === 0 ? (
            <p className="text-center text-white">
              You don't have any {isArchivedView ? 'archived' : 'active'} tasks
            </p>
          ) : (
            <div className="space-y-4 px-5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-800 p-5 rounded flex items-center justify-between h-20"
                >
                  <div className="flex items-center space-x-3">
                    <FaTelegramPlane className="text-blue-500 text-base" />
                    <div className="text-sm">
                      <h3 className="font-semibold">{task.name}</h3>
                      <p className="text-gray-400">
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

                    {/* Display status label for archived tasks */}
                    {isArchivedView && (
                      <div
                        className={`ml-4 px-2 py-1 rounded text-white ${getStatusLabel(
                          task.status_id
                        ).color}`}
                      >
                        {getStatusLabel(task.status_id).text}
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-yellow-500">
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

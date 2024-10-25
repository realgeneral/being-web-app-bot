import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png'; // Убедитесь, что логотип размещен корректно
import axios from 'axios';

// Интерфейс для свойств, принимаемых компонентом Home
interface HomeProps {
  user: {
    username: string;
    points: number;
    telegram_id: number;
  };
}

// Интерфейс для элемента новости
interface NewsItem {
  id: number;
  title: string;
  description?: string;
  content?: string;
  created_at: string;
}

// Интерфейс для события изменения высоты окна просмотра
interface ViewportChangedEvent {
  isStateStable: boolean;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const username = user.username;
  const balance = `${user.points} Points`;

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const API_BASE_URL = 'https://nollab.ru:8000';

  // Список ID администраторов
  const ADMIN_IDS = [7154683616, 1801021065]; // Замените на реальные ID администраторов
  const isAdmin = ADMIN_IDS.includes(user.telegram_id);

  // Функция для получения новостей с бэкенда
  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        const response = await axios.get<NewsItem[]>(`${API_BASE_URL}/api/news/get_all_news/`, {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        });
        setNewsItems(response.data);
      } catch (error) {
        console.error('Ошибка при получении новостей:', error);
      }
    };

    fetchNewsItems();
  }, [user.telegram_id]);

  // Функции для открытия и закрытия модального окна просмотра новости
  const openModal = async (newsItem: NewsItem) => {
    try {
      const response = await axios.get<NewsItem>(`${API_BASE_URL}/api/news/get_news/${newsItem.id}`, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
      });
      setSelectedNewsItem(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при получении деталей новости:', error);
    }
  };

  const closeModal = () => {
    setSelectedNewsItem(null);
    setIsModalOpen(false);
  };

  // Функция для удаления новости
  const deleteNewsItem = async (newsItem: NewsItem) => {
    if (!isAdmin) return;

    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/news/delete/${newsItem.id}`, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
      });
      // Удаляем новость из состояния
      setNewsItems((prevItems) => prevItems.filter((item) => item.id !== newsItem.id));
      alert('Новость успешно удалена.');
    } catch (error) {
      console.error('Ошибка при удалении новости:', error);
      alert('Не удалось удалить новость.');
    }
  };

  // Функции для открытия и закрытия модального окна создания новости
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Функция для обработки создания новой новости
  const handleCreateNews = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const newNewsItem = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
    };

    try {
      const response = await axios.post<NewsItem>(`${API_BASE_URL}/api/news/create/`, newNewsItem, {
        headers: {
          'X-Telegram-ID': user.telegram_id.toString(),
        },
      });

      // Добавляем новую новость в состояние
      setNewsItems((prevItems) => [response.data, ...prevItems]);
      closeCreateModal();
    } catch (error) {
      console.error('Ошибка при создании новости:', error);
      alert('Не удалось создать новость.');
    }
  };

  useEffect(() => {
    // Подключение к Telegram WebApp для получения высоты окна
    const tg = window.Telegram.WebApp;

    // Установка высоты контейнера в соответствии с высотой окна просмотра
    document.documentElement.style.setProperty('--app-height', `${tg.viewportHeight}px`);

    // Обработка события изменения высоты окна просмотра
    tg.onEvent('viewportChanged', (event: ViewportChangedEvent) => {
      if (event.isStateStable) {
        document.documentElement.style.setProperty('--app-height', `${tg.viewportStableHeight}px`);
      }
    });

    // Уведомляем, что мини-приложение готово
    tg.ready();

    return () => {
      tg.offEvent('viewportChanged');
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-[var(--app-height)]">
      {/* Логотип */}
      <div className="mt-6">
        <img src={logo} alt="Bot Logo" className="w-32 h-32" />
      </div>

      {/* Приветствие */}
      <div className="mt-4 text-center">
        <h1 className="text-4xl font-bold mt-0">Welcome, {username}!</h1>
      </div>

      {/* Основной контент */}
      <div className="flex-1 w-full px-4 py-6 overflow-auto">
        {/* Администраторские элементы управления */}
        {isAdmin && (
          <div className="mb-4">
            <button
              onClick={openCreateModal}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Создать новость
            </button>
          </div>
        )}

        {/* Блок новостей */}
        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">Latest news</h2>
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 p-4 rounded shadow hover:bg-gray-700 transition cursor-pointer relative"
                onClick={() => openModal(item)}
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-300 mt-2">{item.description}</p>
                {/* Кнопка удаления для администраторов */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNewsItem(item);
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Модальное окно для отображения деталей новости */}
      {isModalOpen && selectedNewsItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4">{selectedNewsItem.title}</h2>
            <p className="text-sm text-gray-300 mb-4">{selectedNewsItem.content}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно для создания новости */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Создать новость</h2>
            <form onSubmit={handleCreateNews}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Заголовок</label>
                <input
                  type="text"
                  name="title"
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Описание</label>
                <textarea
                  name="description"
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Содержание</label>
                <textarea
                  name="content"
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="mr-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

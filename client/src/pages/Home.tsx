import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png'; // Ensure the logo image is placed correctly
import axios from 'axios';

// Interface for props accepted by Home component
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

// Interface for viewport height change event
interface ViewportChangedEvent {
  isStateStable: boolean;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const username = user.username;
  const balance = `${user.points} Points`;

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = 'https://nollab.ru:8000';

  // Функция для получения новостей с бэкенда
  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        const response = await axios.get<NewsItem[]>(`${API_BASE_URL}/api/news/`, {
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

  // Функции для открытия и закрытия модального окна
  const openModal = async (newsItem: NewsItem) => {
    try {
      const response = await axios.get<NewsItem>(`${API_BASE_URL}/api/news/${newsItem.id}`, {
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

  useEffect(() => {
    // Connect to Telegram WebApp to get window height
    const tg = window.Telegram.WebApp;

    // Set container height according to viewport height
    document.documentElement.style.setProperty('--app-height', `${tg.viewportHeight}px`);

    // Handle viewport height change event
    tg.onEvent('viewportChanged', (event: ViewportChangedEvent) => {
      if (event.isStateStable) {
        document.documentElement.style.setProperty('--app-height', `${tg.viewportStableHeight}px`);
      }
    });

    // Notify that the mini-app is ready
    tg.ready();

    return () => {
      tg.offEvent('viewportChanged');
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-[var(--app-height)]">
      {/* Logo */}
      <div className="mt-6">
        <img src={logo} alt="Bot Logo" className="w-32 h-32" />
      </div>

      {/* Greeting */}
      <div className="mt-4 text-center">
        <h1 className="text-4xl font-bold mt-0">Welcome, {username}!</h1>
        <p className="text-sm text-gray-400">Balance: {balance}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full px-4 py-6 overflow-auto">
        {/* News block */}
        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">Latest News</h2>
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div
              key={item.id}
              className="bg-gray-800 p-4 rounded shadow hover:bg-gray-700 transition cursor-pointer"
              onClick={() => openModal(item)}
              >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-300 mt-2">{item.description}</p>
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
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

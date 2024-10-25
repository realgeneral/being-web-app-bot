import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Earn from './pages/Earn';
import MyTask from './pages/MyTask';
import Wallet from './pages/Wallet';
import AdminStatistics from './pages/AdminStatistics';
import Loading from './components/Loading'; // Импортируем компонент Loading
import { TonConnectUIProvider } from '@tonconnect/ui-react';


// Base URL for API requests
const API_BASE_URL = 'https://nollab.ru:8000';
const ADMIN_IDS = [7154683616, 1801021065]; // Замените на реальные ID администраторов
// Function to send logs to the server

const sendLogToServer = (message: string) => {
  axios
    .post(`${API_BASE_URL}/api/logs/`, { message }, {
      headers: {
        'ngrok-skip-browser-warning': 'true', // Добавляем заголовок
      },
    })
    .then((response) => {
      console.log('Log sent successfully:', response.data);
    })
    .catch((error) => {
      console.error('Failed to send log:', error);
    });
};

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Устанавливаем начальное состояние загрузки в true
  const isAdmin = ADMIN_IDS.includes(user.telegram_id);

  useEffect(() => {
    const sendLog = (msg: string) => sendLogToServer(msg); // Centralized log function

    let isMounted = true; // Флаг для проверки, что компонент все еще монтирован

    const authenticateUser = async () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();

          const initData = tg.initData || '';
          sendLog('Init data received: ' + initData); // Log once when received

          if (initData) {
            const urlParams = new URLSearchParams(initData);
            const startParam = urlParams.get('start_param');
            sendLog('Start param: ' + startParam);

            const response = await axios.post(`${API_BASE_URL}/api/auth/telegram`, { initData, startParam }, {
              headers: {
                'ngrok-skip-browser-warning': 'true', // Добавляем заголовок
              },
            });
            console.log('Authentication response:', response.data);
            if (isMounted) {
              setUser(response.data);
              sendLog('User authenticated successfully.');
            }
          } else {
            sendLog('No Telegram initData found');
          }
        } else {
          sendLog('Telegram WebApp is not available');
        }
      } catch (error: any) {
        sendLog('Telegram auth failed: ' + error.message);
      } finally {
        if (isMounted) {
          
          // Добавляем искусственную задержку перед снятием состояния загрузки
          setTimeout(() => {
            setLoading(false); // Снимаем состояние загрузки после задержки
          }, 3000); // Задержка в 3 секунды (соответствует длительности анимации)
        }
      }
    };

    authenticateUser();

    return () => {
      isMounted = false; // Обновляем флаг при размонтировании компонента
    };
  }, []);

  // Отображаем компонент Loading, пока состояние loading равно true
  if (loading) {
    return <Loading />;
  }

  // Если пользователь не аутентифицирован после загрузки
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Authentication failed. Please try again.</p>
      </div>
    );
  }

  // Render the main application layout with user data
  return (
    <TonConnectUIProvider manifestUrl="https://nollab.ru/static/tonconnect-manifest.json">
      <Router>
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/earn" element={<Earn user={user} />} />
            <Route
              path="/mytask"
              element={isAdmin ? <AdminStatistics user={user} /> : <MyTask user={user} />}
            />
            <Route path="/wallet" element={<Wallet user={user} />} />
          </Routes>
        </Layout>
      </Router>
    </TonConnectUIProvider>
  );
};

export default App;

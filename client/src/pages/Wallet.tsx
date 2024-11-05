import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';

// Замените на ваш базовый URL API
const API_BASE_URL = 'https://nollab.ru:8000';

interface Referral {
  username: string;
}

interface User {
  id: number;
  telegram_id: number; // Добавлено поле telegram_id
  username: string;
  points: number;
  wallet_address?: string;
  referral_code: string;
}

interface WalletProps {
  user: User;
}

const Wallet: React.FC<WalletProps> = ({ user }) => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = tonConnectUI.connected && tonConnectUI.account?.address;
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const referralCount = referrals.length;

  // Имя вашего Telegram-бота
  const botUsername = 'beinghouse_bot'; // Замените на имя вашего бота

  // Формируем реферальную ссылку с использованием referral_code
  const referralLink = `https://t.me/${botUsername}?start=${user.referral_code}`;

  useEffect(() => {
    if (walletAddress) {
      // Отправляем адрес кошелька на сервер
      axios
        .post(
          `${API_BASE_URL}/api/wallet/connect`,
          {
            wallet_address: walletAddress,
            user_id: user.id,
          },
          {
            headers: {
              'X-Telegram-ID': user.telegram_id.toString(),
            },
          }
        )
        .then((response) => {
          // Обработка успешного ответа
        })
        .catch((error) => {
          console.error('Ошибка при отправке адреса кошелька:', error);
        });
    }
  }, [walletAddress, user.id, user.telegram_id]);

  // Новый useEffect для загрузки рефералов
  useEffect(() => {
    // Функция для загрузки рефералов
    const fetchReferrals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/referrals`, {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        });
        setReferrals(response.data); // Предполагается, что API возвращает массив рефералов
      } catch (error) {
        console.error('Ошибка при загрузке рефералов:', error);
      }
    };

    fetchReferrals();
  }, [user.id, user.telegram_id]);

  // Функция для копирования реферальной ссылки
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        alert('Реферальная ссылка скопирована!');
      })
      .catch(err => {
        console.error('Ошибка при копировании ссылки:', err);
      });
  };

  // Функция для обработки пополнения баланса
  const handleAddFunds = (amountTON: number) => {
    if (!walletAddress) {
      alert('Пожалуйста, подключите кошелек перед пополнением.');
      return;
    }

    let transactionId: number | null = null;
    let transactionCreated: boolean = false;

    // Создаем запись транзакции на сервере
    axios
      .post(
        `${API_BASE_URL}/api/wallet/transactions/`,
        {
          user_id: user.id,
          wallet_address: walletAddress,
          amount: amountTON,
          transaction_type: 'deposit',
        },
        {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
          withCredentials: true, // Если ваш API использует аутентификационные куки
        }
      )
      .then((response) => {
        transactionCreated = true;
        transactionId = response.data.id;

        // Отправляем транзакцию через TonConnect
        return tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000, // Транзакция действительна 5 минут
          messages: [
            {
              address: 'UQCn7cWclf8OFtUaPXTTdactsVB5qCDgcbyfOUY6JMH1gvNK', // Замените на ваш адрес
              amount: (amountTON * 1e9).toString(), // Переводим TON в нанотоны
            },
          ],
        });
      })
      .then(() => {
        alert('Транзакция успешно отправлена!');

        // Отправляем на сервер информацию об успешной транзакции
        axios
          .put(
            `${API_BASE_URL}/api/wallet/transactions/${transactionId}/`,
            { status: 'completed' },
            {
              headers: {
                'X-Telegram-ID': user.telegram_id.toString(),
              },
              withCredentials: true,
            }
          )
          .then(() => {
            // Обновляем баланс пользователя или список транзакций
            // Например, вы можете вызвать функцию для обновления состояния
          })
          .catch((error) => {
            console.error('Ошибка при обновлении статуса транзакции на сервере:', error);
          });
      })
      .catch((error) => {
        if (!transactionCreated) {
          console.error('Ошибка при создании транзакции на сервере:', error);
          alert('Ошибка при создании транзакции. Попробуйте еще раз.');
        } else {
          console.error('Ошибка при отправке транзакции:', error);
          alert('Ошибка при отправке транзакции. Попробуйте еще раз.');

          // Отправляем на сервер информацию о неудачной транзакции
          axios
            .put(
              `${API_BASE_URL}/api/wallet/transactions/${transactionId}/`,
              { status: 'failed' },
              {
                headers: {
                  'X-Telegram-ID': user.telegram_id.toString(),
                },
                withCredentials: true,
              }
            )
            .then(() => {
              // Дополнительные действия после обновления статуса
            })
            .catch((error) => {
              console.error('Ошибка при обновлении статуса транзакции на сервере:', error);
            });
        }
      });
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-10 w-full flex justify-between items-center px-6 bg-black border-b border-gray-700">
        <h1 className="text-2xl font-bold">MY WALLET</h1>
        <span className="text-sm">@{user.username}</span>
      </header>
      <div className="flex justify-center my-8">
        <div className="flex flex-col items-center space-y-4">
          {walletAddress ? (
            <>
              <p className="text-sm text-green-400">
                Wallet connected: {`${walletAddress.slice(0, 4)}.....${walletAddress.slice(-4)}`}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddFunds(3)}
                  className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
                >
                  Add 300 points
                   (3 TON)
                </button>
                <button
                  onClick={() => handleAddFunds(10)}
                  className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
                >
                  Add 1000 points
                   (10 TON)
                </button>
                <button
                  onClick={() => handleAddFunds(50)}
                  className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
                >
                  Add 5000 points
                   (50 TON)
                </button>
              </div>
            </>
          ) : (
            <>
              <TonConnectButton />
              <p className="text-sm text-gray-400">Please connect your Telegram TON Wallet.</p>
            </>
          )}
        </div>
      </div>

      {/* Приглашение друзей */}
      <div className="mb-8 text-center bg-gray-800 p-2 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Пригласите друзей</h2>
        <p className="text-sm text-gray-400 mb-2">
          Поделитесь своей реферальной ссылкой, чтобы пригласить друзей и получить бонусы.
        </p>
        <p className="text-lg font-semibold mb-3 text-yellow-400">
          Пригласите друзей и получайте 7% от их дохода
        </p>
        {/* Кнопка копирования реферальной ссылки */}
        <button
          onClick={handleCopyReferralLink}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
        >
          Скопировать реферальную ссылку
        </button>
      </div>

      {/* Рефералы */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          Ваши рефералы ({referralCount}):
        </h2>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((referral, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded-md shadow"
              >
                <span className="text-sm font-medium">@{referral.username}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">У вас пока нет рефералов</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;

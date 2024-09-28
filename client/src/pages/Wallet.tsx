import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';

// Замените на ваш базовый URL API
const API_BASE_URL = 'https://your-api-base-url.com';

interface Referral {
  username: string;
  income: number;
}

interface User {
  id: number;
  username: string;
  points: number;
  wallet_address?: string;
  referrals?: Referral[];
}

interface WalletProps {
  user: User;
}

const Wallet: React.FC<WalletProps> = ({ user }) => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = tonConnectUI.connected && tonConnectUI.account?.address;
  const [referrals, setReferrals] = useState<Referral[]>(user.referrals || []);
  const referralCount = referrals.length;

  useEffect(() => {
    if (walletAddress) {
      // Отправляем адрес кошелька на сервер
      axios
        .post(`${API_BASE_URL}/api/wallet/connect`, {
          wallet_address: walletAddress,
          user_id: user.id,
        })
        .then((response) => {
          // Обработка успешного ответа
        })
        .catch((error) => {
          console.error('Ошибка при отправке адреса кошелька:', error);
        });
    }
  }, [walletAddress, user.id]);

  // Функция для обработки пополнения баланса
  const handleAddFunds = () => {
    // Реализуйте логику пополнения баланса
    // Например, откройте модальное окно или перенаправьте на страницу оплаты
  };

  return (
    <div className="flex flex-col w-full h-full px-4 py-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">@{user.username}</h1>
          <p className="mt-1 text-gray-600">Баланс: {user.points} points</p>
        </div>
        <div>
          {walletAddress ? (
            <p className="text-sm text-green-600">Кошелек подключен</p>
          ) : (
            <TonConnectButton />
          )}
        </div>
      </div>

      {/* Кнопка "Add Funds" */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleAddFunds}
          className="bg-yellow-500 text-black px-6 py-3 rounded-md hover:bg-yellow-600 transition"
        >
          Add Funds
        </button>
      </div>

      {/* Приглашение друзей */}
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">
          Invite your friends and get 7% of their income
        </p>
      </div>

      {/* Рефералы */}
      <div>
        <h2 className="text-lg font-bold mb-2">
          Your referrals ({referralCount}):
        </h2>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((referral, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md"
              >
                <span>@{referral.username}</span>
                <span className="text-green-600">+{referral.income} points</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">У вас пока нет рефералов.</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;

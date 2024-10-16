import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';

// Замените на ваш базовый URL API
const API_BASE_URL = 'https://nollab.ru:8000';

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

  const referralLink = `$/referral/${user.username}`;

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
  const handleAddFunds = () => {
    // Реализуйте логику пополнения баланса
    // Например, откройте модальное окно или перенаправьте на страницу оплаты
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Заголовок страницы */}
      <header className="flex-none h-10 w-full flex justify-between items-center px-6 bg-black border-b border-gray-700">
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <span className="text-sm">@{user.username}</span>
      </header>
  
      {/* Кнопка "Add Funds" и подключение кошелька в одном блоке */}
      <div className="flex justify-center my-8">
        <div className="flex flex-col items-center space-y-4">
          {walletAddress ? (
            <>
              <p className="text-sm text-green-400">Кошелек подключен</p>
              <button
                onClick={handleAddFunds}
                className="bg-yellow-500 text-black px-6 py-3 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
              >
                Add Funds
              </button>
            </>
          ) : (
            <TonConnectButton />
          )}
        </div>
      </div>
  
      {/* Приглашение друзей */}
      <div className="mb-8 text-center bg-gray-800 p-2 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Become a Friend</h2>
        <p className="text-sm text-gray-400 mb-2">
          Click on the link and wait for the bot to fully load to complete the task.
        </p>
        <p className="text-lg font-semibold mb-3 text-yellow-400">
          Invite your friends and get 7% of their income
        </p>
        {/* Кнопка копирования реферальной ссылки */}
        <button
          onClick={handleCopyReferralLink}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
        >
          Copy refferal link
        </button>
      </div>
  
      {/* Рефералы */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          Your referrals ({referralCount}):
        </h2>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((referral, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded-md shadow"
              >
                <span className="text-sm font-medium">@{referral.username}</span>
                <span className="text-green-400 font-bold">+{referral.income} points</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You dont have any refferal users</p>
        )}
      </div>
    </div>
  );
  
  
};

export default Wallet;

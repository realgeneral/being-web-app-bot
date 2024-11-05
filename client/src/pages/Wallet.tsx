import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';

// Replace with your API base URL
const API_BASE_URL = 'https://nollab.ru:8000';

interface Referral {
  username: string;
}

interface User {
  id: number;
  telegram_id: number;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false); // State for alert visibility
  const referralCount = referrals.length;

  const botUsername = 'beinghouse_bot';
  const referralLink = `https://t.me/${botUsername}?start=${user.referral_code}`;

  useEffect(() => {
    if (walletAddress) {
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
        .catch((error) => {
          setErrorMessage('Error sending wallet address.');
          setIsAlertVisible(true);
          setTimeout(() => setIsAlertVisible(false), 5000); // Hide alert after 5 seconds
          console.error('Error sending wallet address:', error);
        });
    }
  }, [walletAddress, user.id, user.telegram_id]);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/referrals`, {
          headers: {
            'X-Telegram-ID': user.telegram_id.toString(),
          },
        });
        setReferrals(response.data);
      } catch (error) {
        setErrorMessage('Error fetching referrals.');
        setIsAlertVisible(true);
        setTimeout(() => setIsAlertVisible(false), 5000); // Hide alert after 5 seconds
        console.error('Error fetching referrals:', error);
      }
    };

    fetchReferrals();
  }, [user.id, user.telegram_id]);

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setErrorMessage('Referral link copied!');
        setIsAlertVisible(true);
        setTimeout(() => setIsAlertVisible(false), 5000); // Hide alert after 5 seconds
      })
      .catch(err => {
        setErrorMessage('Error copying referral link.');
        setIsAlertVisible(true);
        setTimeout(() => setIsAlertVisible(false), 5000);
        console.error('Error copying link:', err);
      });
  };

  const handleAddFunds = (amountTON: number) => {
    if (!walletAddress) {
      setErrorMessage('Please connect your wallet before adding funds.');
      setIsAlertVisible(true);
      setTimeout(() => setIsAlertVisible(false), 5000);
      return;
    }

    let transactionId: number | null = null;
    let transactionCreated: boolean = false;

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
          withCredentials: true,
        }
      )
      .then((response) => {
        transactionCreated = true;
        transactionId = response.data.id;

        return tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: 'UQCn7cWclf8OFtUaPXTTdactsVB5qCDgcbyfOUY6JMH1gvNK', // Replace with your address
              amount: (amountTON * 1e9).toString(),
            },
          ],
        });
      })
      .then(() => {
        setErrorMessage('Transaction sent successfully!');
        setIsAlertVisible(true);
        setTimeout(() => setIsAlertVisible(false), 5000);

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
          .catch((error) => {
            console.error('Error updating transaction status on server:', error);
          });
      })
      .catch((error) => {
        if (!transactionCreated) {
          setErrorMessage('Error creating transaction. Please try again.');
          setIsAlertVisible(true);
          setTimeout(() => setIsAlertVisible(false), 5000);
          console.error('Error creating transaction on server:', error);
        } else {
          setErrorMessage('Error sending transaction. Please try again.');
          setIsAlertVisible(true);
          setTimeout(() => setIsAlertVisible(false), 5000);
          console.error('Error sending transaction:', error);

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
            .catch((error) => {
              console.error('Error updating transaction status on server:', error);
            });
        }
      });
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full relative">
      {/* Alert notification */}
      {isAlertVisible && errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-yellow-500 text-black font-semibold py-3 px-6 rounded shadow-lg border border-black">
          <p>{errorMessage}</p>
          <button
            className="mt-2 text-sm text-black-800 "
            onClick={() => setIsAlertVisible(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Page header */}
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
                  Add 1500 points (3 TON)
                </button>
                <button
                  onClick={() => handleAddFunds(10)}
                  className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
                >
                  Add 5000 points (10 TON)
                </button>
                <button
                  onClick={() => handleAddFunds(50)}
                  className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-md hover:bg-yellow-600 transition transform hover:scale-105 shadow-md"
                >
                  Add 25000 points (50 TON)
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

      {/* Invite friends */}
      <div className="mb-8 text-center bg-gray-800 p-2 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Invite Friends</h2>
        <p className="text-sm text-gray-400 mb-2">
          Share your referral link to invite friends and earn bonuses.
        </p>
        <p className="text-lg font-semibold mb-3 text-yellow-400">
          Invite friends and earn 7% from their income
        </p>
        {/* Copy referral link button */}
        <button
          onClick={handleCopyReferralLink}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
        >
          Copy Referral Link
        </button>
      </div>

      {/* Referrals */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          Your Referrals ({referralCount}):
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
          <p className="text-gray-500">You currently have no referrals</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;

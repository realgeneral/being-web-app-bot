import React, { useEffect } from 'react';
import logo from '../assets/logo.png'; // Ensure the logo image is placed correctly

// Interface for props accepted by Home component
interface HomeProps {
  user: {
    username: string;
    points: number;
  };
}

// Interface for viewport height change event
interface ViewportChangedEvent {
  isStateStable: boolean;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const username = user.username;
  const balance = `${user.points} Points`;

  // News to display
  const newsItems = [
    { title: 'Welcome to Our Service!', description: 'Stay tuned for updates!' },
    { title: 'Maintenance Scheduled', description: 'Service maintenance at 12:00 AM UTC.' },
    { title: 'New Features Released', description: 'Check out the latest features in the Earn section.' },
  ];

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
        <img src={logo} alt="Bot Logo" className="w-20 h-20" />
      </div>

      {/* Greeting */}
      <div className="mt-0 text-center">
        <h1 className="text-2xl font-bold mt-0">Welcome, {username}!</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full px-4 py-6 overflow-auto">
        {/* News block */}
        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">Latest News</h2>
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded shadow hover:bg-gray-700 transition"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-300 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

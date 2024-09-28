// Layout.tsx
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  return (
    <div className="relative h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-4 bg-black z-10">
        <div className="text-2xl font-bold text-yellow-500">BEING BOT</div>
      </header>

      {/* Main Content */}
      <main className="absolute top-16 bottom-14 left-0 right-0 overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 h-14 bg-black flex justify-around items-center px-4 z-10">
        <NavLink
          to="/"
          className="text-center flex flex-col items-center min-w-[60px] text-yellow-500"
        >
          <div>🏠</div>
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/earn"
          className="text-center flex flex-col items-center min-w-[60px] text-yellow-500"
        >
          <div>💰</div>
          <span>Earn</span>
        </NavLink>
        <NavLink
          to="/mytask"
          className="text-center flex flex-col items-center min-w-[60px] text-yellow-500"
        >
          <div>📋</div>
          <span>MyTask</span>
        </NavLink>
        <NavLink
          to="/wallet"
          className="text-center flex flex-col items-center min-w-[60px] text-yellow-500"
        >
          <div>💼</div>
          <span>Wallet</span>
        </NavLink>
      </footer>
    </div>
  );
};

export default Layout;

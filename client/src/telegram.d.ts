// src/telegram.d.ts
export {}; // This ensures this file is treated as a module

declare global {
  interface Window {
    Telegram: any;
  }
}

declare namespace Telegram {
  interface WebApp {

    requestWalletAccess: () => Promise<{
      wallet: {
        address: string;
        network: string;
        publicKey: string;
      };
    }>;
  }
}
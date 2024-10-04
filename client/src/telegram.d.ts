// src/telegram.d.ts
export {}; // This ensures this file is treated as a module

declare global {
  interface Window {
    Telegram: any;
  }
}

// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionDuration: {
        '3000': '3000ms',
        '5000': '5000ms',
        // Добавьте другие значения по мере необходимости
      },
    },
  },
  darkMode: 'class', // или 'media' для автоматического определения темы
  variants: {
    extend: {},
  },
  plugins: [],
}

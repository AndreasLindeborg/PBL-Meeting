/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#121212',        // Main dark background
        darkCard: '#1e1e1e',      // Panels/cards
        darkBorder: '#2a2a2a',    // Border lines
        darkText: '#e5e5e5',      // Light text on dark
      },
    },
  },
  plugins: [],
};

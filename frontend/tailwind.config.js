/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#121212',        
        darkCard: '#1e1e1e',      
        darkBorder: '#2a2a2a',   
        darkText: '#e5e5e5',      
      },
    },
  },
  plugins: [],
};

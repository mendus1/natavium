/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: {
      colors: {
        cosmic: {
          navy: '#0a1628',
          midnight: '#1a2b4a',
          deep: '#0d1b2e',
        },
        slate: {
          750: '#2d3748',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    } 
  },
  plugins: [],
};

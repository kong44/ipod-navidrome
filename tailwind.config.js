/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ipod: [
          'Chicago',
          'Geneva',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        ipodClassic: [
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ipod: {
          bg: '#e8edf3',
          screen: '#ffffff',
          headerGradTop: '#d7e2f1',
          headerGradBottom: '#a9bedb',
          blueHighlightTop: '#3b8bf6',
          blueHighlightBottom: '#1d5fc1',
          silverBody: '#e3e4e6',
          darkBody: '#1c1d1f',
          wheelBg: '#f2f2f2',
          wheelDarkBg: '#222224',
          wheelU2Bg: '#d91b1b',
        }
      },
      boxShadow: {
        'wheel': '0 4px 10px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2)',
        'wheel-btn': '0 2px 4px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.7)',
        'screen-bezel': 'inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.5)',
        'chassis-silver': '0 20px 50px rgba(0,0,0,0.35), 0 2px 5px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(0,0,0,0.25)',
        'chassis-black': '0 25px 60px rgba(0,0,0,0.6), 0 3px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}

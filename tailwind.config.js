/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        levelUpDisplay: "fadeInOut 1s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        fadeInOut: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 }
        }
      },

      boxShadow: {
        getWin: "inset 0 0 300px 100px rgba(40, 98, 44, 0.58)",
        getLose: "inset 0 0 300px 100px rgba(185, 42, 42, 0.5)"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: "#736CED", // main purple
        secondary: "#6DD3CE", // teal
        accent: "#C14953", // reddish
        muted: "#f5f5f7", // soft background
        info: "#54C6EB", // sky blue
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};

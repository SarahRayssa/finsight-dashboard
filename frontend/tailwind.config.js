/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F6FEB", // azul
        dark: "#0A0E17", // preto/azulado
      }
    },
  },
  plugins: [],
};
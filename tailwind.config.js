/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust the path based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#6b7280", // Light shade of primary
          DEFAULT: "#4f46e5", // Default primary color
          dark: "#4338ca", // Dark shade of primary
        },
        secondary: {
          light: "#fbbf24", // Light shade of secondary
          DEFAULT: "#f59e0b", // Default secondary color
          dark: "#d97706", // Dark shade of secondary
        },
        accent: "#ec4899", // Custom accent color
        neutral: {
          light: "#f3f4f6", // Light neutral color
          DEFAULT: "#d1d5db", // Default neutral color
          dark: "#9ca3af", // Dark neutral color
        },
      },
    },
  },
  plugins: [],
};

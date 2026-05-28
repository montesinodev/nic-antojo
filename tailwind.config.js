/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this path if your files are located somewhere else (e.g., if you don't use 'src')
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
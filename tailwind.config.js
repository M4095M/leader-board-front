/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",//si on a un autre html file contenant html , on doit le specifier hna
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {        
        'custom-dark-blue': '#0a192f', // Example dark blue
        'custom-light-blue': '#1e2a47', // Example slightly lighter blue for containers
        'custom-pink': '#ff79c6',      // Example pink
        'custom-light-gray': '#ccd6f6', // Light gray for text
        'custom-gray': '#8892b0',},
        backgroundImage: {
          'custom-gradient': `
            linear-gradient(to bottom, #000000, #3B0764, #6B21A8),
            radial-gradient(circle at top left, rgba(255, 105, 180, 0.3), transparent 30%),
            radial-gradient(circle at top right, rgba(255, 105, 180, 0.3), transparent 30%),
            radial-gradient(circle at bottom left, rgba(255, 105, 180, 0.3), transparent 30%),
            radial-gradient(circle at bottom right, rgba(255, 105, 180, 0.3), transparent 30%)
          `,
        },},},
  plugins: [],
 };
 
 
 //bg-gradient-to-b from-black via-purple-900 to-purple-700
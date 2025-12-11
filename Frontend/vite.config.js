import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // Correct import for v4 Vite plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),        // React plugin
    tailwindcss(),  // Tailwind v4 Vite plugin (order doesn't matter much)
  ],
  server: {
    port: 3000,
    open: true,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5163', // your backend dev URL
    //     changeOrigin: true,              // rewrite Host header to target
    //     secure: false,                   // use false for self-signed HTTPS dev certs
    //   },
    // }
  },
})

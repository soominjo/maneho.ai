import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Explicit server configuration to prevent undefined port issues in monorepo
  server: {
    // Use environment variable if available, fallback to 5173
    port: Number(process.env.VITE_DEV_PORT) || 5173,

    // Allow Vite to find next available port if 5173 is taken
    strictPort: false,

    // Enable network access (0.0.0.0 allows access from other devices)
    host: true,

    // Explicit HMR configuration to prevent WebSocket URL undefined errors
    hmr: {
      // Match the server port
      port: Number(process.env.VITE_DEV_PORT) || 5173,

      // Use localhost for local development
      host: 'localhost',

      // Use ws protocol (secure wss for production if needed)
      protocol: 'ws',
    },
  },

  // Explicit environment variable configuration
  envDir: './',
  envPrefix: 'VITE_',

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})

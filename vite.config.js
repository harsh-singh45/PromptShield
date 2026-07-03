import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // 1. The React Popup UI
        main: resolve(__dirname, 'index.html'),
        // 2. The Modular Content Script (Vite will bundle all imports into one file!)
        content: resolve(__dirname, 'src/content/index.js')
      },
      output: {
        // Ensure the built files have clean names without random hashes
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') {
            return 'content.js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    }
  }
});
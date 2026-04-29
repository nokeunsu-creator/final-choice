import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Vite 8 + rolldown: enable explicit code splitting so dynamic imports
    // (e.g. React.lazy(() => import(...))) emit separate chunks.
    rolldownOptions: {
      output: {
        codeSplitting: true,
      },
    },
  },
});

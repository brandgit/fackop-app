import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // Utiliser V8 pour générer le rapport de couverture
      reporter: ['text', 'lcov'], // Générer un rapport lisible et un fichier lcov
      reportsDirectory: './coverage', // Répertoire où les rapports seront générés
    },
  },
});

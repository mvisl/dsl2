import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
});

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        pomodoro: resolve(__dirname, 'src/pages/pomodoro/pomodoro.html'),
        settings: resolve(__dirname, 'src/pages/settings/settings.html')
      }
    }
  }
})

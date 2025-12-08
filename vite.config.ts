import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        pomodoro: resolve(__dirname, 'src/pages/pomodoro/pomodoro.html'),
        settings: resolve(__dirname, 'src/pages/settings/settings.html'),
        register: resolve(__dirname, 'src/pages/register/register.html'),
        login: resolve(__dirname, 'src/pages/login/login.html'),
        semana: resolve(__dirname, 'src/pages/stats/semana.html'),
        mes: resolve(__dirname, 'src/pages/stats/mes.html'),
        anio: resolve(__dirname, 'src/pages/stats/anio.html')
      }
    }
  }
})

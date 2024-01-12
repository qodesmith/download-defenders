import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {devMiddleware} from './websiteMiddlewares'
import stylexPlugin from '@stylexjs/rollup-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  root: './website',
  plugins: [
    react(),
    devMiddleware(),
    stylexPlugin({
      fileName: './website/styles.css',
      dev: true,
      classNamePrefix: 'x',
    }),
  ],
})

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {devMiddleware} from './websiteMiddlewares'

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  root: './website',
  plugins: [react(), devMiddleware()],
})

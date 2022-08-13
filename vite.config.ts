import type {Plugin} from 'vite'

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs-extra'

import {defendersData, defendersFileMap} from './websiteMiddlewares.js'

const data = JSON.stringify({data: defendersData})
const contentTypes = {
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
}

// https://vitejs.dev/guide/api-plugin.html#configureserver
function devMiddleware(): Plugin {
  return {
    name: 'dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()

        if (req.url === '/defenders/data') {
          return res.end(data)
        }

        for (const [fileName, filePath] of Object.entries(defendersFileMap)) {
          if (req.url === `/defenders/${fileName}`) {
            const {size} = fs.statSync(filePath)
            res.writeHead(200, {
              'Content-Type': contentTypes[filePath.slice(-3)],
              'Content-Length': size,
            })

            const readStream = fs.createReadStream(filePath)
            return readStream.pipe(res, {end: true})
          }
        }

        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  root: './website',
  plugins: [react(), devMiddleware()],
})
